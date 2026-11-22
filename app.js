/* DirtyInit site — interactions */
(function () {
  "use strict";

  /* ---------- nav scrolled state ---------- */
  var nav = document.getElementById("nav");
  function onScroll() {
    if (!nav) return;
    nav.classList.toggle("scrolled", window.scrollY > 12);
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- mobile menu ---------- */
  var menuBtn = document.getElementById("menuBtn");
  var navLinks = document.getElementById("navLinks");
  if (menuBtn && navLinks) {
    menuBtn.addEventListener("click", function () {
      var open = navLinks.classList.toggle("open");
      menuBtn.setAttribute("aria-expanded", open ? "true" : "false");
    });
    navLinks.addEventListener("click", function (e) {
      if (e.target.tagName === "A") {
        navLinks.classList.remove("open");
        menuBtn.setAttribute("aria-expanded", "false");
      }
    });
  }

  /* ---------- scroll reveal ---------- */
  var reveals = Array.prototype.slice.call(document.querySelectorAll(".reveal"));
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            var el = entry.target;
            var delay = Number(el.dataset.delay || 0);
            setTimeout(function () {
              el.classList.add("in");
            }, delay);
            io.unobserve(el);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );
    reveals.forEach(function (el, i) {
      el.dataset.delay = String(Math.min(i % 6, 5) * 45);
      io.observe(el);
    });
  } else {
    reveals.forEach(function (el) { el.classList.add("in"); });
  }

  /* ---------- hero stat counters ---------- */
  var counters = Array.prototype.slice.call(document.querySelectorAll("[data-count]"));
  var reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  function animateCount(el) {
    var target = Number(el.dataset.count || 0);
    if (!target || reduceMotion) { el.textContent = String(target); return; }
    var start = performance.now();
    var dur = 1100;
    function tick(now) {
      var p = Math.min(1, (now - start) / dur);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = String(Math.round(target * eased));
      if (p < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }
  if (counters.length && "IntersectionObserver" in window) {
    var co = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { animateCount(e.target); co.unobserve(e.target); }
      });
    }, { threshold: 0.6 });
    counters.forEach(function (c) { co.observe(c); });
  }

  /* ---------- feature card pointer glow ---------- */
  Array.prototype.slice.call(document.querySelectorAll(".feat")).forEach(function (card) {
    card.addEventListener("pointermove", function (e) {
      var r = card.getBoundingClientRect();
      card.style.setProperty("--mx", ((e.clientX - r.left) / r.width) * 100 + "%");
      card.style.setProperty("--my", ((e.clientY - r.top) / r.height) * 100 + "%");
    });
  });

  /* ---------- copy buttons ---------- */
  function flash(btn, label) {
    var prev = btn.textContent;
    btn.textContent = "已复制";
    btn.classList.add("done");
    setTimeout(function () {
      btn.textContent = prev || label;
      btn.classList.remove("done");
    }, 1400);
  }
  Array.prototype.slice.call(document.querySelectorAll("[data-copy]")).forEach(function (btn) {
    btn.addEventListener("click", function () {
      var text = btn.getAttribute("data-copy") || "";
      var done = function () { flash(btn, "复制"); };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(done, function () { fallback(text, done); });
      } else {
        fallback(text, done);
      }
    });
  });
  function fallback(text, done) {
    var ta = document.createElement("textarea");
    ta.value = text;
    ta.setAttribute("readonly", "");
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.select();
    try { document.execCommand("copy"); } catch (e) { /* ignore */ }
    document.body.removeChild(ta);
    done();
  }

  /* ---------- footer year ---------- */
  var yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  /* ---------- hero terminal typing ---------- */
  var termBody = document.getElementById("termBody");
  if (termBody) {
    var lines = [
      { t: "cmd", s: "adb install -r dirtyinit_tools3.apk" },
      { t: "out", s: "Performing Streamed Install" },
      { t: "ok",  s: "Success" },
      { t: "cmd", s: "adb shell am start -n com.dirty.init/.DirtyInitActivity --ez autorun true" },
      { t: "out", s: "Starting: Intent { cmp=com.dirty.init/.DirtyInitActivity (has extras) }" },
      { t: "out", s: "[*] deploying payload  (stage 1/2)" },
      { t: "out", s: "[*] setprop service.adb.tcp.port 5555" },
      { t: "out", s: "[*] ctl.restart adbd" },
      { t: "out", s: "[*] deploying payload  (stage 2/2) relay" },
      { t: "ok",  s: "[+] listening on [::]:5555" },
      { t: "cmd", s: "adb connect 192.168.10.23:5555" },
      { t: "ok",  s: "connected to 192.168.10.23:5555" },
      { t: "cmd", s: "adb shell /data/local/tmp/dirtyinit id" },
      { t: "ok",  s: "uid=0(root) gid=0(root) context=u:r:init:s0" }
    ];
    var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    var plainText = lines.map(function (l) {
      return (l.t === "cmd" ? "$ " : "") + l.s;
    }).join("\n");

    function render(htmlLines, caret) {
      termBody.innerHTML = htmlLines.join("\n") + (caret ? '\n<span class="caret"></span>' : "");
    }

    if (reduce) {
      render(lines.map(function (l) {
        var cls = l.t === "cmd" ? "t-prompt" : l.t === "ok" ? "t-ok" : "t-out";
        return '<span class="' + cls + '">' + (l.t === "cmd" ? "$ " : "") + escapeHtml(l.s) + "</span>";
      }), false);
    } else {
      var done = [];
      var li = 0;
      var ci = 0;
      var first = true;

      function step() {
        if (li >= lines.length) {
          setTimeout(function () { render(done, false); }, 1200);
          setTimeout(function () {
            done = []; li = 0; ci = 0; first = true;
            termBody.innerHTML = "";
            step();
          }, 4200);
          return;
        }
        var line = lines[li];
        if (first) { done = []; first = false; }
        var prefix = line.t === "cmd" ? "$ " : "";
        var cls = line.t === "cmd" ? "t-prompt" : line.t === "ok" ? "t-ok" : "t-out";
        var typed = prefix + line.s.slice(0, ci);
        var rendered = done.slice();
        rendered.push('<span class="' + cls + '">' + escapeHtml(typed) + "</span>");
        render(rendered, true);
        var speed = line.t === "cmd" ? 22 : 7;
        if (ci < line.s.length) {
          ci += 1;
          setTimeout(step, speed);
        } else {
          done.push('<span class="' + cls + '">' + escapeHtml(prefix + line.s) + "</span>");
          li += 1;
          ci = 0;
          setTimeout(step, line.t === "cmd" ? 520 : 110);
        }
      }
      step();
    }
  }

  function escapeHtml(s) {
    return s.replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
})();
