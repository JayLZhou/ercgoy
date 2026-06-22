/* GO-Y — animated causal property graph hero
   Directed edges (causality) + drifting nodes (graph data), with flowing pulses. */
(function () {
  "use strict";
  var canvas = document.getElementById("hero-canvas");
  if (!canvas) return;
  var ctx = canvas.getContext("2d");
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  var DPR = Math.min(window.devicePixelRatio || 1, 2);
  var W = 0, H = 0;
  var nodes = [], edges = [];
  var mouse = { x: 0.5, y: 0.5, tx: 0.5, ty: 0.5 };

  function palette() {
    var light = document.documentElement.getAttribute("data-theme") === "light";
    return light
      ? { node: "#2a55e6", nodeAlt: "#d99a1a", edge: "rgba(20,40,100,0.16)", flow: "#16b8a0", glow: "rgba(42,85,230,0.10)", text: "rgba(20,40,100,0.55)" }
      : { node: "#7aa0ff", nodeAlt: "#f4c25a", edge: "rgba(150,180,255,0.14)", flow: "#2fe0c8", glow: "rgba(91,140,255,0.16)", text: "rgba(180,200,255,0.5)" };
  }
  var COL = palette();
  window.addEventListener("goy:theme", function () { COL = palette(); });

  // a few causal-variable style labels sprinkled on key nodes
  var LABELS = ["X", "Y", "Z", "do(X)", "U", "T", "W", "M"];

  function build() {
    nodes = [];
    edges = [];
    var area = W * H;
    var count = Math.max(14, Math.min(34, Math.round(area / 46000)));
    for (var i = 0; i < count; i++) {
      var causal = Math.random() < 0.22;
      nodes.push({
        x: Math.random() * W,
        y: Math.random() * H,
        vx: (Math.random() - 0.5) * 0.16,
        vy: (Math.random() - 0.5) * 0.16,
        r: causal ? 4.5 + Math.random() * 2.5 : 2.2 + Math.random() * 2.2,
        causal: causal,
        label: causal && Math.random() < 0.8 ? LABELS[(Math.random() * LABELS.length) | 0] : null,
        pulse: Math.random() * Math.PI * 2
      });
    }
    // build directed edges to nearest neighbours -> DAG-ish look
    for (var a = 0; a < nodes.length; a++) {
      var dists = [];
      for (var b = 0; b < nodes.length; b++) {
        if (a === b) continue;
        var dx = nodes[a].x - nodes[b].x, dy = nodes[a].y - nodes[b].y;
        dists.push({ b: b, d: dx * dx + dy * dy });
      }
      dists.sort(function (p, q) { return p.d - q.d; });
      var links = 1 + ((Math.random() * 2) | 0);
      for (var k = 0; k < links && k < dists.length; k++) {
        if (Math.sqrt(dists[k].d) > Math.min(W, H) * 0.42) continue;
        // direction from lower index to higher to mimic a DAG topological order
        var from = Math.min(a, dists[k].b), to = Math.max(a, dists[k].b);
        if (!edges.some(function (e) { return e.from === from && e.to === to; })) {
          edges.push({ from: from, to: to, flow: Math.random(), speed: 0.0016 + Math.random() * 0.0026, active: Math.random() < 0.5 });
        }
      }
    }
  }

  function resize() {
    var rect = canvas.getBoundingClientRect();
    W = rect.width; H = rect.height;
    canvas.width = W * DPR; canvas.height = H * DPR;
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    build();
  }

  function arrow(x1, y1, x2, y2, r2) {
    // shorten to node edge
    var dx = x2 - x1, dy = y2 - y1, len = Math.hypot(dx, dy) || 1;
    var ux = dx / len, uy = dy / len;
    var ex = x2 - ux * (r2 + 3), ey = y2 - uy * (r2 + 3);
    ctx.beginPath(); ctx.moveTo(x1 + ux * (r2 + 2), y1 + uy * (r2 + 2)); ctx.lineTo(ex, ey); ctx.stroke();
    // arrowhead
    var ah = 6;
    ctx.beginPath();
    ctx.moveTo(ex, ey);
    ctx.lineTo(ex - ux * ah - uy * ah * 0.55, ey - uy * ah + ux * ah * 0.55);
    ctx.lineTo(ex - ux * ah + uy * ah * 0.55, ey - uy * ah - ux * ah * 0.55);
    ctx.closePath();
    ctx.fill();
  }

  function frame() {
    ctx.clearRect(0, 0, W, H);
    mouse.x += (mouse.tx - mouse.x) * 0.05;
    mouse.y += (mouse.ty - mouse.y) * 0.05;
    var px = (mouse.x - 0.5) * 26, py = (mouse.y - 0.5) * 26;

    // update nodes
    for (var i = 0; i < nodes.length; i++) {
      var n = nodes[i];
      if (!reduce) { n.x += n.vx; n.y += n.vy; n.pulse += 0.03; }
      if (n.x < 0 || n.x > W) n.vx *= -1;
      if (n.y < 0 || n.y > H) n.vy *= -1;
      n.x = Math.max(0, Math.min(W, n.x));
      n.y = Math.max(0, Math.min(H, n.y));
    }

    // edges
    ctx.lineWidth = 1;
    for (var e = 0; e < edges.length; e++) {
      var ed = edges[e], A = nodes[ed.from], B = nodes[ed.to];
      var ax = A.x + px * 0.6, ay = A.y + py * 0.6, bx = B.x + px * 0.6, by = B.y + py * 0.6;
      ctx.strokeStyle = COL.edge; ctx.fillStyle = COL.edge;
      arrow(ax, ay, bx, by, B.r);
      // flowing causal pulse
      if (ed.active) {
        if (!reduce) { ed.flow += ed.speed; if (ed.flow > 1) ed.flow -= 1; }
        var t = ed.flow;
        var fx = ax + (bx - ax) * t, fy = ay + (by - ay) * t;
        var g = ctx.createRadialGradient(fx, fy, 0, fx, fy, 5);
        g.addColorStop(0, COL.flow); g.addColorStop(1, "transparent");
        ctx.fillStyle = g;
        ctx.beginPath(); ctx.arc(fx, fy, 5, 0, Math.PI * 2); ctx.fill();
      }
    }

    // nodes
    ctx.textAlign = "center"; ctx.textBaseline = "middle";
    ctx.font = "600 11px 'JetBrains Mono', monospace";
    for (var j = 0; j < nodes.length; j++) {
      var nd = nodes[j];
      var nx = nd.x + px * 0.6, ny = nd.y + py * 0.6;
      var rr = nd.r + (nd.causal ? Math.sin(nd.pulse) * 0.8 : 0);
      // glow for causal nodes
      if (nd.causal) {
        var gg = ctx.createRadialGradient(nx, ny, 0, nx, ny, rr * 4);
        gg.addColorStop(0, COL.glow); gg.addColorStop(1, "transparent");
        ctx.fillStyle = gg;
        ctx.beginPath(); ctx.arc(nx, ny, rr * 4, 0, Math.PI * 2); ctx.fill();
      }
      ctx.fillStyle = nd.causal ? COL.nodeAlt : COL.node;
      ctx.beginPath(); ctx.arc(nx, ny, rr, 0, Math.PI * 2); ctx.fill();
      if (nd.causal) {
        ctx.lineWidth = 1; ctx.strokeStyle = nd.causal ? COL.nodeAlt : COL.node;
        ctx.beginPath(); ctx.arc(nx, ny, rr + 3, 0, Math.PI * 2); ctx.globalAlpha = 0.4; ctx.stroke(); ctx.globalAlpha = 1;
      }
      if (nd.label) {
        ctx.fillStyle = COL.text;
        ctx.fillText(nd.label, nx, ny - rr - 9);
      }
    }

    if (!reduce) requestAnimationFrame(frame);
  }

  window.addEventListener("resize", debounce(resize, 200));
  window.addEventListener("mousemove", function (ev) {
    mouse.tx = ev.clientX / window.innerWidth;
    mouse.ty = ev.clientY / window.innerHeight;
  });

  function debounce(fn, ms) { var t; return function () { clearTimeout(t); t = setTimeout(fn, ms); }; }

  resize();
  if (reduce) {
    // Render a single static composition — no animation loop.
    frame();
  } else {
    requestAnimationFrame(frame);
  }
})();
