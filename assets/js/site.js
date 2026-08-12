/* BEAUTY & WELLNESS addict NY — site behaviour
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

  /* ---------- scroll reveals ---------- */
  var revealables = document.querySelectorAll("[data-reveal]");
  if (reduced || !("IntersectionObserver" in window)) {
    Array.prototype.forEach.call(revealables, function (el) { el.classList.add("is-in"); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-in");
        io.unobserve(entry.target);
      });
    }, { rootMargin: "0px 0px -6% 0px", threshold: 0.1 });

    Array.prototype.forEach.call(revealables, function (el) {
      var d = el.getAttribute("data-delay");
      if (d) el.style.setProperty("--delay", d + "ms");
      io.observe(el);
    });
  }

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

  /* ---------- enquiry form ---------- */
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
            console.warn("Enquiry not delivered:", (data && data.message) || data);
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
