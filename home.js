/* Home page: up to three featured projects from works.json, with the first photo when there is one. */
(function () {
  'use strict';
  var grid = document.getElementById('home-projects');
  if (!grid) { return; }
  function el(t, c, x) { var e = document.createElement(t); if (c) { e.className = c; } if (x != null) { e.textContent = x; } return e; }
  function render(list) {
    var picks = list.filter(function (w) { return w.featured; });
    picks = (picks.length ? picks : list).slice(0, 3);
    grid.textContent = '';
    picks.forEach(function (w) {
      var a = el('a', 'pcard');
      a.href = 'works.html';
      var first = (w.images || []).filter(function (i) { return i && i.src; })[0];
      if (first) {
        var im = document.createElement('img');
        im.src = first.src; im.alt = first.caption || w.title || ''; im.loading = 'lazy';
        im.style.cssText = 'width:100%;aspect-ratio:16/10;object-fit:cover;border-radius:12px;margin:0';
        a.appendChild(im);
      }
      a.appendChild(el('span', 'pcat', w.category || w.label || ''));
      a.appendChild(el('h3', null, w.title || ''));
      a.appendChild(el('p', null, w.summary || ''));
      a.appendChild(el('span', 'open', 'Open project'));
      grid.appendChild(a);
    });
  }
  fetch('works.json', { cache: 'no-cache' })
    .then(function (r) { if (!r.ok) { throw new Error('works.json'); } return r.json(); })
    .then(function (d) { var list = Array.isArray(d) ? d : (d.works || []); if (list.length) { render(list); } })
    .catch(function () {});
})();
