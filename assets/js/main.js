/* GO-Y — site interactions */
(function () {
  "use strict";

  /* ---- Nav shadow once the page scrolls ---- */
  var nav = document.querySelector(".nav");
  function onScroll() {
    if (nav) nav.classList.toggle("scrolled", window.scrollY > 8);
  }
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  /* ---- Mobile menu ---- */
  var burger = document.querySelector(".nav-burger");
  var menu = document.querySelector(".mobile-menu");
  if (burger && menu) {
    burger.addEventListener("click", function () {
      var open = menu.classList.toggle("open");
      burger.setAttribute("aria-expanded", open ? "true" : "false");
    });
    menu.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", function () {
        menu.classList.remove("open");
        burger.setAttribute("aria-expanded", "false");
      });
    });
  }

  /* ---- Highlight the current section in the nav (home page) ---- */
  var sections = document.querySelectorAll("section[id]");
  var navLinks = document.querySelectorAll(".nav-links a[href^='#']");
  if (sections.length && navLinks.length && "IntersectionObserver" in window) {
    var sio = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        var id = en.target.getAttribute("id");
        navLinks.forEach(function (l) {
          l.classList.toggle("active", l.getAttribute("href") === "#" + id);
        });
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    sections.forEach(function (s) { sio.observe(s); });
  }

  /* ---- Publication filters ---- */
  var filterBtns = document.querySelectorAll(".filter-btn");
  var pubs = document.querySelectorAll(".pub");
  if (filterBtns.length && pubs.length) {
    filterBtns.forEach(function (btn) {
      btn.addEventListener("click", function () {
        filterBtns.forEach(function (b) { b.classList.remove("active"); });
        btn.classList.add("active");
        var f = btn.getAttribute("data-filter");
        pubs.forEach(function (p) {
          var topics = (p.getAttribute("data-topics") || "").toLowerCase();
          p.hidden = !(f === "all" || topics.indexOf(f.toLowerCase()) !== -1);
        });
      });
    });
  }

  /* ---- Year stamp ---- */
  var y = document.querySelector("[data-year]");
  if (y) y.textContent = new Date().getFullYear();
})();
