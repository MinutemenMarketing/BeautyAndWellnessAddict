/* BEAUTY & WELLNESS addict NY — site behavior
   No dependencies. Everything works without JS except the disclosure panels,
   which start open when JS is absent. */
(function () {
  "use strict";

  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- header ---------- */
  var header = document.querySelector(".header");
  if (header) {
    var setStuck = function () { header.classList.toggle("is-stuck", window.scrollY > 24); };
    setStuck();
    window.addEventListener("scroll", setStuck, { passive: true });
  }

  /* ---------- mobile menu ---------- */
  var burger = document.querySelector("[data-menu-toggle]");
  var menu = document.getElementById("site-menu");
  if (burger && menu) {
    var lastFocus = null;
    var focusables = function () { return menu.querySelectorAll("a[href], button:not([disabled])"); };

    var openMenu = function () {
      lastFocus = document.activeElement;
      menu.classList.add("is-open");
      menu.removeAttribute("aria-hidden");
      burger.setAttribute("aria-expanded", "true");
      burger.setAttribute("aria-label", "Close menu");
      document.body.style.overflow = "hidden";
      var f = focusables();
      if (f.length) setTimeout(function () { f[0].focus(); }, 100);
    };

    var closeMenu = function () {
      menu.classList.remove("is-open");
      menu.setAttribute("aria-hidden", "true");
      burger.setAttribute("aria-expanded", "false");
      burger.setAttribute("aria-label", "Open menu");
      document.body.style.overflow = "";
      if (lastFocus) lastFocus.focus();
    };

    burger.addEventListener("click", function () {
      burger.getAttribute("aria-expanded") === "true" ? closeMenu() : openMenu();
    });

    document.addEventListener("keydown", function (e) {
      if (burger.getAttribute("aria-expanded") !== "true") return;
      if (e.key === "Escape") { closeMenu(); return; }
      if (e.key !== "Tab") return;
      var f = focusables();
      if (!f.length) return;
      var first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    });

    menu.addEventListener("click", function (e) { if (e.target.closest("a")) closeMenu(); });
    window.addEventListener("resize", function () {
      if (window.innerWidth >= 1000 && burger.getAttribute("aria-expanded") === "true") closeMenu();
    });
  }

  /* ---------- scroll reveals ----------------------------------------
     Rules, in priority order:
       1. content is visible
       2. content is visible
       3. the entrance animation is nice to have

     `html.reveal-on` is what allows CSS to hide anything. The inline head
     script sets it and arms a failsafe timer; we only disarm that timer
     once an observer is actually running. Every path below ends with
     everything visible. */
  var revealables = document.querySelectorAll("[data-reveal]");

  var showAll = function () {
    Array.prototype.forEach.call(revealables, function (el) { el.classList.add("is-in"); });
  };
  var standDown = function () {
    /* Drop the gate entirely: nothing can be hidden by CSS after this. */
    document.documentElement.classList.remove("reveal-on");
    if (window.__revealFailsafe) { clearTimeout(window.__revealFailsafe); window.__revealFailsafe = null; }
  };

  try {
    if (!revealables.length) {
      standDown();
    } else if (reduced || !("IntersectionObserver" in window)) {
      /* Reduced motion, or a browser without the observer: show immediately. */
      showAll();
      standDown();
    } else {
      Array.prototype.forEach.call(revealables, function (el) {
        var d = el.getAttribute("data-delay");
        if (d) el.style.setProperty("--delay", d + "ms");
      });

      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-in");
          io.unobserve(entry.target);
        });
      }, {
        /* threshold 0 and a generous top margin: anything that touches the
           viewport at all reveals, including elements taller than the
           screen and elements already on screen at load. */
        rootMargin: "240px 0px 240px 0px",
        threshold: 0
      });

      Array.prototype.forEach.call(revealables, function (el) { io.observe(el); });

      /* The observer is live, so the inline failsafe can stand down. */
      if (window.__revealFailsafe) { clearTimeout(window.__revealFailsafe); window.__revealFailsafe = null; }

      /* Sweep anything at or above the current scroll position. Covers a
         reload partway down the page, a deep link to an anchor, and
         back/forward restores. */
      var sweep = function () {
        var h = window.innerHeight || document.documentElement.clientHeight;
        Array.prototype.forEach.call(revealables, function (el) {
          if (el.classList.contains("is-in")) return;
          var r = el.getBoundingClientRect();
          if (r.top < h + 240 && r.bottom > -240) el.classList.add("is-in");
        });
      };
      sweep();
      window.addEventListener("load", sweep);
      window.addEventListener("pageshow", sweep);

      /* Last resort: if anything above the fold is somehow still hidden a
         few seconds in, the observer is not doing its job. Give up on the
         animation for those and show them. */
      setTimeout(function () {
        var h = window.innerHeight || document.documentElement.clientHeight;
        var stuck = false;
        Array.prototype.forEach.call(revealables, function (el) {
          if (!el.classList.contains("is-in") && el.getBoundingClientRect().top < h) stuck = true;
        });
        if (stuck) { showAll(); standDown(); }
      }, 2500);
    }
  } catch (err) {
    /* Any failure at all: drop the gate and show everything. */
    showAll();
    standDown();
  }

  /* A broken image must not leave a clipped, empty frame behind. */
  Array.prototype.forEach.call(document.images, function (img) {
    var reveal = img.closest ? img.closest("[data-reveal]") : null;
    if (!reveal) return;
    img.addEventListener("error", function () { reveal.classList.add("is-in"); });
  });

  /* ---------- disclosure panels ---------- */
  Array.prototype.forEach.call(document.querySelectorAll(".acc__head"), function (btn) {
    var item = btn.closest(".acc");
    item.classList.remove("is-open");
    btn.setAttribute("aria-expanded", "false");
    btn.addEventListener("click", function () {
      var open = btn.getAttribute("aria-expanded") === "true";
      btn.setAttribute("aria-expanded", String(!open));
      item.classList.toggle("is-open", !open);
    });
  });

  /* ---------- section scrollspy ---------- */
  var spyLinks = document.querySelectorAll("[data-spy] a");
  if (spyLinks.length && "IntersectionObserver" in window) {
    var targets = [];
    Array.prototype.forEach.call(spyLinks, function (link) {
      var id = link.getAttribute("href");
      if (id && id.charAt(0) === "#") {
        var t = document.querySelector(id);
        if (t) targets.push({ el: t, link: link });
      }
    });
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        targets.forEach(function (t) { t.link.classList.toggle("is-active", t.el === entry.target); });
      });
    }, { rootMargin: "-18% 0px -70% 0px" });
    targets.forEach(function (t) { spy.observe(t.el); });
  }

  /* ---------- inquiry form ---------- */
  var form = document.querySelector("[data-form]");
  if (form) {
    var status = form.querySelector(".form__status");
    var submitBtn = form.querySelector('button[type="submit"]');
    var submitLabel = submitBtn ? submitBtn.textContent : "";

    var showError = function (field, message) {
      var input = field.querySelector("input, select, textarea");
      var slot = field.querySelector(".field-error");
      if (!input || !slot) return;
      input.setAttribute("aria-invalid", "true");
      slot.textContent = message;
    };
    var clearError = function (field) {
      var input = field.querySelector("input, select, textarea");
      var slot = field.querySelector(".field-error");
      if (!input || !slot) return;
      input.removeAttribute("aria-invalid");
      slot.textContent = "";
    };

    Array.prototype.forEach.call(form.querySelectorAll(".field input, .field select, .field textarea"), function (input) {
      input.addEventListener("blur", function () {
        var field = input.closest(".field");
        if (input.checkValidity()) clearError(field);
        else showError(field, input.validationMessage);
      });
    });

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var firstInvalid = null;
      Array.prototype.forEach.call(form.querySelectorAll(".field"), function (field) {
        var input = field.querySelector("input, select, textarea");
        if (!input) return;
        if (input.checkValidity()) clearError(field);
        else {
          showError(field, input.validationMessage);
          if (!firstInvalid) firstInvalid = input;
        }
      });

      if (firstInvalid) {
        status.textContent = "Please complete the highlighted fields.";
        firstInvalid.focus();
        return;
      }

      status.textContent = "Sending…";
      if (submitBtn) { submitBtn.disabled = true; submitBtn.textContent = "Sending"; }

      fetch(form.action, {
        method: "POST",
        body: new FormData(form),
        headers: { Accept: "application/json" }
      })
        .then(function (r) { return r.json().catch(function () { return {}; }); })
        .then(function (data) {
          // FormSubmit answers 200 with success:false while a new domain is still
          // awaiting its one-time activation click, so the status code alone is
          // not proof of delivery.
          var sent = data && (data.success === "true" || data.success === true);
          if (!sent) {
            console.warn("Inquiry not delivered:", (data && data.message) || data);
            throw new Error("not delivered");
          }
          form.reset();
          status.textContent = "Thank you. We will be in touch shortly.";
        })
        .catch(function () {
          status.textContent = "That did not send. Please call or text 917-753-3570 and we will pick it up from there.";
        })
        .then(function () {
          if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = submitLabel; }
        });
    });
  }

  /* ---------- current year ---------- */
  Array.prototype.forEach.call(document.querySelectorAll("[data-year]"), function (el) {
    el.textContent = new Date().getFullYear();
  });
})();
