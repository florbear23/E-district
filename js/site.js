/* E-District — interaction layer. Vanilla, no dependencies. */
(function () {
  "use strict";
  var RM = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---- year ---- */
  document.querySelectorAll("[data-year]").forEach(function (e) {
    e.textContent = new Date().getFullYear();
  });

  /* ---- nav: solid after scroll ---- */
  var nav = document.querySelector(".nav");
  if (nav && !document.body.classList.contains("nav-static")) {
    var onScroll = function () {
      nav.classList.toggle("solid", window.scrollY > 40);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  /* ---- mobile drawer ---- */
  var burger = document.querySelector(".burger");
  var drawer = document.querySelector(".drawer");
  if (burger && drawer) {
    var setMenu = function (open) {
      document.body.classList.toggle("menu-open", open);
      burger.setAttribute("aria-expanded", open ? "true" : "false");
      drawer.setAttribute("aria-hidden", open ? "false" : "true");
    };
    burger.addEventListener("click", function () {
      setMenu(!document.body.classList.contains("menu-open"));
    });
    drawer.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", function () { setMenu(false); });
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && document.body.classList.contains("menu-open")) setMenu(false);
    });
  }

  /* ---- scroll reveal ---- */
  var reveals = document.querySelectorAll(".reveal");
  if (reveals.length) {
    if (RM || !("IntersectionObserver" in window)) {
      reveals.forEach(function (el) { el.classList.add("in"); });
    } else {
      var ro = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          if (en.isIntersecting) { en.target.classList.add("in"); ro.unobserve(en.target); }
        });
      }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });
      reveals.forEach(function (el) { ro.observe(el); });
    }
  }

  /* ---- animated counters ---- */
  var nums = document.querySelectorAll("[data-count]");
  if (nums.length) {
    var run = function (el) {
      var target = parseFloat(el.getAttribute("data-count"));
      var dec = parseInt(el.getAttribute("data-dec") || "0", 10);
      if (RM) { el.textContent = target.toFixed(dec); return; }
      var t0 = null, dur = 1400;
      var tick = function (ts) {
        if (!t0) t0 = ts;
        var p = Math.min((ts - t0) / dur, 1);
        var e = 1 - Math.pow(1 - p, 3);
        el.textContent = (target * e).toFixed(dec);
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    };
    if ("IntersectionObserver" in window) {
      var co = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          if (en.isIntersecting) { run(en.target); co.unobserve(en.target); }
        });
      }, { threshold: 0.5 });
      nums.forEach(function (el) { co.observe(el); });
    } else { nums.forEach(run); }
  }

  /* ---- lightbox gallery ---- */
  var tiles = Array.prototype.slice.call(document.querySelectorAll(".tile[data-full]"));
  var lb = document.querySelector(".lb");
  if (tiles.length && lb) {
    var lbImg = lb.querySelector("img");
    var lbCap = lb.querySelector(".lb-cap");
    var idx = 0, lastFocus = null;

    var show = function (i) {
      idx = (i + tiles.length) % tiles.length;
      var t = tiles[idx];
      lbImg.src = t.getAttribute("data-full");
      lbImg.alt = t.getAttribute("data-alt") || "";
      lbCap.textContent = t.getAttribute("data-alt") || "";
    };
    var open = function (i) {
      lastFocus = document.activeElement;
      show(i);
      lb.classList.add("open");
      document.body.style.overflow = "hidden";
      lb.querySelector(".lb-x").focus();
    };
    var close = function () {
      lb.classList.remove("open");
      document.body.style.overflow = "";
      if (lastFocus) lastFocus.focus();
    };

    tiles.forEach(function (t, i) {
      t.addEventListener("click", function () { open(i); });
    });
    lb.querySelector(".lb-x").addEventListener("click", close);
    lb.querySelector(".lb-prev").addEventListener("click", function () { show(idx - 1); });
    lb.querySelector(".lb-next").addEventListener("click", function () { show(idx + 1); });
    lb.addEventListener("click", function (e) { if (e.target === lb) close(); });
    document.addEventListener("keydown", function (e) {
      if (!lb.classList.contains("open")) return;
      if (e.key === "Escape") close();
      if (e.key === "ArrowLeft") show(idx - 1);
      if (e.key === "ArrowRight") show(idx + 1);
    });
  }

  /* ---- testimonial carousel ---- */
  var slides = Array.prototype.slice.call(document.querySelectorAll(".tslide"));
  var dots = Array.prototype.slice.call(document.querySelectorAll(".tdot"));
  if (slides.length && dots.length) {
    var cur = 0, timer = null;
    var go = function (i) {
      cur = (i + slides.length) % slides.length;
      slides.forEach(function (s, n) { s.classList.toggle("on", n === cur); });
      dots.forEach(function (d, n) { d.setAttribute("aria-selected", n === cur ? "true" : "false"); });
    };
    var startAuto = function () {
      if (RM) return;
      stopAuto();
      timer = setInterval(function () { go(cur + 1); }, 7000);
    };
    var stopAuto = function () { if (timer) clearInterval(timer); };
    dots.forEach(function (d, n) {
      d.addEventListener("click", function () { go(n); startAuto(); });
    });
    var stage = document.querySelector(".tstage");
    if (stage) {
      stage.addEventListener("mouseenter", stopAuto);
      stage.addEventListener("mouseleave", startAuto);
      stage.addEventListener("focusin", stopAuto);
    }
    go(0); startAuto();
  }

  /* ---- floor plan tabs ---- */
  var ftabs = Array.prototype.slice.call(document.querySelectorAll(".ftab"));
  if (ftabs.length) {
    ftabs.forEach(function (tab) {
      tab.addEventListener("click", function () {
        ftabs.forEach(function (t) { t.setAttribute("aria-selected", "false"); });
        tab.setAttribute("aria-selected", "true");
        var f = tab.getAttribute("data-floor");
        document.querySelectorAll(".fplan img").forEach(function (im) {
          im.classList.toggle("on", im.getAttribute("data-floor") === f);
        });
      });
    });
  }

  /* ---- blog filter ---- */
  var chips = Array.prototype.slice.call(document.querySelectorAll(".chip[data-filter]"));
  if (chips.length) {
    chips.forEach(function (c) {
      c.addEventListener("click", function () {
        chips.forEach(function (x) { x.setAttribute("aria-pressed", "false"); });
        c.setAttribute("aria-pressed", "true");
        var f = c.getAttribute("data-filter");
        document.querySelectorAll(".post").forEach(function (p) {
          p.style.display = (f === "all" || p.getAttribute("data-cat") === f) ? "" : "none";
        });
      });
    });
  }

  /* ---- forms: client validation + Netlify native submit ----
     Netlify parses data-netlify forms at deploy time; no backend code needed.
     Anywhere else there is no receiver, so we report that honestly instead of
     faking a success state. */
  function wire(form) {
    if (!form) return;
    var status = form.querySelector(".fstatus");
    function say(kind, msg) {
      if (!status) return;
      status.textContent = msg;
      status.className = "fstatus show " + kind;
    }
    function check() {
      var ok = true;
      form.querySelectorAll("[required]").forEach(function (f) {
        var wrap = f.closest(".field") || f.parentElement;
        var good = f.value.trim().length > 0;
        if (good && f.type === "email") good = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(f.value.trim());
        if (wrap) wrap.classList.toggle("bad", !good);
        if (!good) ok = false;
      });
      return ok;
    }
    form.querySelectorAll("input,textarea").forEach(function (f) {
      f.addEventListener("blur", check);
      f.addEventListener("input", function () {
        var w = f.closest(".field");
        if (w && w.classList.contains("bad")) check();
      });
    });
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!check()) { say("no", "Please complete the highlighted fields."); return; }
      var btn = form.querySelector("[type=submit]");
      if (btn) btn.disabled = true;
      say("ok", "Sending\u2026");
      fetch("/", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams(new FormData(form)).toString()
      }).then(function (r) {
        if (!r.ok) throw new Error("no receiver");
        say("ok", "Thanks \u2014 your message is on its way. The E-District team will be in touch shortly.");
        form.reset();
      }).catch(function () {
        say("no", "This form posts to Netlify's built-in form handler and will deliver once the site is live on Netlify. There's no receiver in this preview \u2014 please call (801) 682-9032 or email info@edistrict.com in the meantime.");
      }).finally(function () {
        if (btn) btn.disabled = false;
      });
    });
  }
  wire(document.getElementById("contact-form"));
  wire(document.getElementById("nl-form"));
})();
