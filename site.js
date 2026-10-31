/* Shared behaviour for every page: header menu, pull-cord lamp theme,
   hero typing and letters, cursor spotlight, and text/links from content.json (CMS). */
(function () {
  'use strict';
  var RM = matchMedia('(prefers-reduced-motion:reduce)').matches;
  var root = document.documentElement;

  /* ----- phone menu ----- */
  var hdr = document.getElementById('hdr'), menu = document.getElementById('menu');
  if (menu && hdr) {
    menu.addEventListener('click', function () {
      var open = hdr.classList.toggle('open');
      menu.setAttribute('aria-expanded', open);
      menu.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    });
    document.querySelectorAll('nav a').forEach(function (a) {
      a.addEventListener('click', function () { hdr.classList.remove('open'); menu.setAttribute('aria-expanded', 'false'); });
    });
  }

  /* ----- lamp theme: the new theme spreads out from the bulb ----- */
  var lamp = document.getElementById('lamp');
  try { var saved = localStorage.getItem('theme'); if (saved) { root.setAttribute('data-theme', saved); } } catch (e) {}
  function current() {
    return root.getAttribute('data-theme') || (matchMedia('(prefers-color-scheme:light)').matches ? 'light' : 'dark');
  }
  if (lamp) {
    lamp.addEventListener('click', function () {
      lamp.classList.add('pull'); setTimeout(function () { lamp.classList.remove('pull'); }, 260);
      lamp.classList.remove('swing'); void lamp.offsetWidth; lamp.classList.add('swing');
      var next = current() === 'dark' ? 'light' : 'dark';
      var b = lamp.getBoundingClientRect(), x = b.left + b.width / 2, y = b.top + b.height / 2;
      var change = function () { root.setAttribute('data-theme', next); try { localStorage.setItem('theme', next); } catch (e) {} };
      if (!document.startViewTransition || RM) { change(); return; }
      var R = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));
      var t = document.startViewTransition(change);
      t.ready.then(function () {
        root.animate({ clipPath: ['circle(0px at ' + x + 'px ' + y + 'px)', 'circle(' + R + 'px at ' + x + 'px ' + y + 'px)'] },
          { duration: 750, easing: 'cubic-bezier(.4,0,.2,1)', pseudoElement: '::view-transition-new(root)' });
      }).catch(function () {});
    });
  }

  /* ----- text, images and links from content.json (edited in the CMS) ----- */
  function get(o, path) { return path.split('.').reduce(function (a, k) { return a && a[k]; }, o); }
  function apply(c) {
    document.querySelectorAll('[data-bind]').forEach(function (e) { var v = get(c, e.dataset.bind); if (v) { e.textContent = v; } });
    document.querySelectorAll('[data-src]').forEach(function (e) { var v = get(c, e.dataset.src); if (v) { e.src = v; } });
    document.querySelectorAll('[data-mail]').forEach(function (e) { var v = get(c, 'contact.email'); if (v) { e.href = 'mailto:' + v; } });
    document.querySelectorAll('[data-wa]').forEach(function (e) {
      var n = get(c, 'contact.whatsapp'), m = get(c, 'contact.whatsapp_message') || '';
      if (n) { e.href = 'https://wa.me/' + n + '?text=' + encodeURIComponent(m); }
    });
    document.querySelectorAll('[data-href]').forEach(function (e) { var v = get(c, e.dataset.href); if (v) { e.href = v; } });
    document.querySelectorAll('[data-resume]').forEach(function (e) { var v = get(c, 'contact.resume'); if (v) { e.href = v; } });
  }
  fetch('content.json', { cache: 'no-cache' })
    .then(function (r) { if (!r.ok) { throw new Error('content'); } return r.json(); })
    .then(apply)
    .catch(function () {})
    .then(startHeroText);
})();
