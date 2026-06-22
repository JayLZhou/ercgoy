/* GO-Y — interactive causal property graph hero
   Drag nodes, move the cursor to push the field around, hover to highlight
   incident (causal) edges, click empty space to send a ripple. */
(function () {
  "use strict";
  var canvas = document.getElementById("hero-canvas");
  if (!canvas) return;
  var ctx = canvas.getContext("2d");
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  var DPR = Math.min(window.devicePixelRatio || 1, 2);
  var W = 0, H = 0;
  var nodes = [], edges = [], ripples = [];
  var pointer = { x: -9999, y: -9999, active: false };
  var dragIndex = -1, grabDX = 0, grabDY = 0, hoverIndex = -1;

  var REPEL_R = 150, GRAB_R = 24, HOVER_R = 28, MAX_SPEED = 2.4;

  function palette() {
    var light = document.documentElement.getAttribute("data-theme") === "light";
    return light
      ? { node: "#2a55e6", nodeAlt: "#d99a1a", edge: "rgba(20,40,100,0.16)", flow: "#16b8a0",
          glow: "rgba(42,85,230,0.10)", glowHi: "rgba(22,184,160,0.22)", text: "rgba(20,40,100,0.55)" }
      : { node: "#7aa0ff", nodeAlt: "#f4c25a", edge: "rgba(150,180,255,0.14)", flow: "#2fe0c8",
          glow: "rgba(91,140,255,0.16)", glowHi: "rgba(47,224,200,0.30)", text: "rgba(180,200,255,0.5)" };
  }
  var COL = palette();
  window.addEventListener("goy:theme", function () { COL = palette(); });

  var LABELS = ["X", "Y", "Z", "do(X)", "U", "T", "W", "M"];

  function build() {
    nodes = []; edges = [];
    var count = Math.max(14, Math.min(34, Math.round((W * H) / 46000)));
    for (var i = 0; i < count; i++) {
      var causal = Math.random() < 0.22;
      nodes.push({
        x: Math.random() * W, y: Math.random() * H,
        vx: (Math.random() - 0.5) * 0.3, vy: (Math.random() - 0.5) * 0.3,
        r: causal ? 4.5 + Math.random() * 2.5 : 2.2 + Math.random() * 2.2,
        causal: causal,
        label: causal && Math.random() < 0.8 ? LABELS[(Math.random() * LABELS.length) | 0] : null,
        pulse: Math.random() * Math.PI * 2
      });
    }
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
    var dx = x2 - x1, dy = y2 - y1, len = Math.hypot(dx, dy) || 1;
    var ux = dx / len, uy = dy / len;
    var ex = x2 - ux * (r2 + 3), ey = y2 - uy * (r2 + 3);
    ctx.beginPath(); ctx.moveTo(x1 + ux * (r2 + 2), y1 + uy * (r2 + 2)); ctx.lineTo(ex, ey); ctx.stroke();
    var ah = 6;
    ctx.beginPath();
    ctx.moveTo(ex, ey);
    ctx.lineTo(ex - ux * ah - uy * ah * 0.55, ey - uy * ah + ux * ah * 0.55);
    ctx.lineTo(ex - ux * ah + uy * ah * 0.55, ey - uy * ah - ux * ah * 0.55);
    ctx.closePath(); ctx.fill();
  }

  function nearest(x, y, maxR) {
    var best = -1, bd = maxR * maxR;
    for (var i = 0; i < nodes.length; i++) {
      var dx = nodes[i].x - x, dy = nodes[i].y - y, d = dx * dx + dy * dy;
      if (d < bd) { bd = d; best = i; }
    }
    return best;
  }

  function frame() {
    ctx.clearRect(0, 0, W, H);

    hoverIndex = dragIndex >= 0 ? dragIndex
      : (pointer.active ? nearest(pointer.x, pointer.y, HOVER_R) : -1);

    // physics
    for (var i = 0; i < nodes.length; i++) {
      var n = nodes[i];
      if (i === dragIndex) { n.x = pointer.x - grabDX; n.y = pointer.y - grabDY; n.vx = 0; n.vy = 0; }
      else if (!reduce) {
        n.vx = n.vx * 0.985 + (Math.random() - 0.5) * 0.02;
        n.vy = n.vy * 0.985 + (Math.random() - 0.5) * 0.02;
        if (pointer.active) {
          var dx = n.x - pointer.x, dy = n.y - pointer.y, d = Math.hypot(dx, dy);
          if (d < REPEL_R && d > 0.01) { var f = (1 - d / REPEL_R) * 0.9; n.vx += dx / d * f; n.vy += dy / d * f; }
        }
        for (var rp = 0; rp < ripples.length; rp++) {
          var R = ripples[rp], rdx = n.x - R.x, rdy = n.y - R.y, rd = Math.hypot(rdx, rdy);
          if (rd < R.r && rd > 0.01) { var rf = (1 - rd / R.r) * R.power; n.vx += rdx / rd * rf; n.vy += rdy / rd * rf; }
        }
        var sp = Math.hypot(n.vx, n.vy);
        if (sp > MAX_SPEED) { n.vx = n.vx / sp * MAX_SPEED; n.vy = n.vy / sp * MAX_SPEED; }
        n.x += n.vx; n.y += n.vy;
        if (n.x < 0) { n.x = 0; n.vx *= -1; } if (n.x > W) { n.x = W; n.vx *= -1; }
        if (n.y < 0) { n.y = 0; n.vy *= -1; } if (n.y > H) { n.y = H; n.vy *= -1; }
        n.pulse += 0.03;
      }
    }
    for (var k = ripples.length - 1; k >= 0; k--) { ripples[k].r += 7; ripples[k].power *= 0.9; if (--ripples[k].life <= 0) ripples.splice(k, 1); }

    var hi = hoverIndex;

    // edges
    for (var e = 0; e < edges.length; e++) {
      var ed = edges[e], A = nodes[ed.from], B = nodes[ed.to];
      var inc = hi >= 0 && (ed.from === hi || ed.to === hi);
      ctx.strokeStyle = inc ? COL.flow : COL.edge; ctx.fillStyle = inc ? COL.flow : COL.edge;
      ctx.lineWidth = inc ? 1.8 : 1;
      arrow(A.x, A.y, B.x, B.y, B.r);
      if (ed.active || inc) {
        if (!reduce) { ed.flow += ed.speed; if (ed.flow > 1) ed.flow -= 1; }
        var t = ed.flow, fx = A.x + (B.x - A.x) * t, fy = A.y + (B.y - A.y) * t;
        var g = ctx.createRadialGradient(fx, fy, 0, fx, fy, 5);
        g.addColorStop(0, COL.flow); g.addColorStop(1, "transparent");
        ctx.fillStyle = g; ctx.beginPath(); ctx.arc(fx, fy, inc ? 6 : 5, 0, Math.PI * 2); ctx.fill();
      }
    }

    // nodes
    ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.font = "600 11px 'JetBrains Mono', monospace";
    for (var j = 0; j < nodes.length; j++) {
      var nd = nodes[j], isHi = j === hi;
      var rr = nd.r + (nd.causal ? Math.sin(nd.pulse) * 0.8 : 0) + (isHi ? 2.5 : 0);
      if (nd.causal || isHi) {
        var gg = ctx.createRadialGradient(nd.x, nd.y, 0, nd.x, nd.y, rr * 4);
        gg.addColorStop(0, isHi ? COL.glowHi : COL.glow); gg.addColorStop(1, "transparent");
        ctx.fillStyle = gg; ctx.beginPath(); ctx.arc(nd.x, nd.y, rr * 4, 0, Math.PI * 2); ctx.fill();
      }
      ctx.fillStyle = isHi ? COL.flow : (nd.causal ? COL.nodeAlt : COL.node);
      ctx.beginPath(); ctx.arc(nd.x, nd.y, rr, 0, Math.PI * 2); ctx.fill();
      if (nd.causal || isHi) {
        ctx.lineWidth = 1; ctx.strokeStyle = ctx.fillStyle; ctx.globalAlpha = 0.4;
        ctx.beginPath(); ctx.arc(nd.x, nd.y, rr + 3, 0, Math.PI * 2); ctx.stroke(); ctx.globalAlpha = 1;
      }
      if (nd.label) { ctx.fillStyle = COL.text; ctx.fillText(nd.label, nd.x, nd.y - rr - 9); }
    }

    if (!reduce) requestAnimationFrame(frame);
  }

  /* ---- interaction (mouse / pen; touch keeps page scroll) ---- */
  function rel(e) { var r = canvas.getBoundingClientRect(); pointer.x = e.clientX - r.left; pointer.y = e.clientY - r.top; }

  if (!reduce) {
    window.addEventListener("pointermove", function (e) {
      if (e.pointerType === "touch") return;
      rel(e); pointer.active = true;
      if (dragIndex >= 0) { e.preventDefault(); canvas.style.cursor = "grabbing"; return; }
      canvas.style.cursor = nearest(pointer.x, pointer.y, HOVER_R) >= 0 ? "grab" : "default";
    }, { passive: false });

    window.addEventListener("pointerdown", function (e) {
      if (e.pointerType === "touch") return;
      if (e.target.closest && e.target.closest("a,button,input,textarea,select,label")) return;
      rel(e); pointer.active = true;
      var idx = nearest(pointer.x, pointer.y, GRAB_R);
      if (idx >= 0) { dragIndex = idx; grabDX = pointer.x - nodes[idx].x; grabDY = pointer.y - nodes[idx].y; canvas.style.cursor = "grabbing"; }
      else if (pointer.x >= 0 && pointer.x <= W && pointer.y >= 0 && pointer.y <= H) {
        ripples.push({ x: pointer.x, y: pointer.y, r: 12, power: 2.4, life: 26 });
      }
    });

    window.addEventListener("pointerup", function () {
      if (dragIndex >= 0) { nodes[dragIndex].vx = 0; nodes[dragIndex].vy = 0; }
      dragIndex = -1; canvas.style.cursor = "default";
    });

    document.addEventListener("mouseleave", function () { pointer.active = false; });
    window.addEventListener("blur", function () { pointer.active = false; dragIndex = -1; });
  }

  window.addEventListener("resize", (function () { var t; return function () { clearTimeout(t); t = setTimeout(resize, 200); }; })());

  resize();
  if (reduce) frame(); else requestAnimationFrame(frame);
})();
