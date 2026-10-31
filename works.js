/* Projects page: filters, expandable projects, and a photo gallery for each project.
   Data comes from works.json, which the CMS edits. Any number of projects and photos works. */
(function () {
  'use strict';
  var list = document.getElementById('list');
  if (!list) { return; }
  var chips = document.getElementById('chips'), count = document.getElementById('count'), more = document.getElementById('more');
  var PAGE = 6, shown = PAGE, cat = 'All', DATA = [];

  function el(t, c, x) { var e = document.createElement(t); if (c) { e.className = c; } if (x != null) { e.textContent = x; } return e; }

  function gallery(w) {
    var imgs = (w.images || []).filter(function (i) { return i && i.src; });
    var g = el('div', 'gallery');
    if (!imgs.length) {
      var empty = el('div', 'g-stage');
      empty.appendChild(el('span', 'g-empty', 'Photos coming soon'));
      g.appendChild(empty);
      return g;
    }
    var idx = 0;
    var stage = el('div', 'g-stage');
    stage.tabIndex = 0;
    stage.setAttribute('aria-label', 'Project photos. Use the arrow keys to move between them.');
    var img = document.createElement('img');
    img.loading = 'lazy';
    stage.appendChild(img);
    var cap = el('p', 'g-cap');
    var thumbs = el('div', 'g-thumbs');
    function show(i) {
      idx = (i + imgs.length) % imgs.length;
      img.src = imgs[idx].src;
      img.alt = imgs[idx].caption || w.title || '';
      cap.textContent = imgs[idx].caption || '';
      thumbs.querySelectorAll('button').forEach(function (b, j) { b.setAttribute('aria-current', j === idx ? 'true' : 'false'); });
    }
    if (imgs.length > 1) {
      var pv = el('button', 'g-nav prev', '‹'); pv.type = 'button'; pv.setAttribute('aria-label', 'Previous photo');
      pv.addEventListener('click', function () { show(idx - 1); });
      var nx = el('button', 'g-nav next', '›'); nx.type = 'button'; nx.setAttribute('aria-label', 'Next photo');
      nx.addEventListener('click', function () { show(idx + 1); });
      stage.appendChild(pv); stage.appendChild(nx);
      stage.addEventListener('keydown', function (e) {
        if (e.key === 'ArrowLeft') { show(idx - 1); }
        if (e.key === 'ArrowRight') { show(idx + 1); }
      });
    }
    imgs.forEach(function (it, j) {
      var b = el('button'); b.type = 'button'; b.setAttribute('aria-label', 'Photo ' + (j + 1));
      var t = document.createElement('img'); t.src = it.src; t.alt = ''; t.loading = 'lazy';
      b.appendChild(t);
      b.addEventListener('click', function () { show(j); });
      thumbs.appendChild(b);
    });
    g.appendChild(stage); g.appendChild(cap);
    if (imgs.length > 1) { g.appendChild(thumbs); }
    show(0);
    return g;
  }

  function row(w, n) {
    var d = el('details', 'prow');
    var s = el('summary');
    s.appendChild(el('span', 'pg', String(n).length < 2 ? '0' + n : String(n)));
    var tx = el('span');
    tx.appendChild(el('span', 'pt', w.title || ''));
    tx.appendChild(el('span', 'pl', w.label || ''));
    s.appendChild(tx);
    s.appendChild(el('span', 'pm', '+'));
    d.appendChild(s);

    var body = el('div', 'pbody');
    var grid = el('div', 'pdetail-grid');
    grid.appendChild(gallery(w));
    var info = el('div', 'pinfo');
    info.appendChild(el('p', null, w.summary || ''));
    if (w.stats && w.stats.length) {
      var st = el('div', 'stats');
      w.stats.forEach(function (k) { var dd = el('div'); dd.appendChild(el('b', null, k.v)); dd.appendChild(el('span', null, k.l)); st.appendChild(dd); });
      info.appendChild(st);
    }
    var pb = [['Problem', w.problem], ['Build', w.build], ['Result', w.result]].filter(function (r) { return r[1]; });
    if (pb.length) {
      var p = el('div', 'pbr');
      pb.forEach(function (r) { var dd = el('div'); dd.appendChild(el('strong', null, r[0])); dd.appendChild(document.createTextNode(r[1])); p.appendChild(dd); });
      info.appendChild(p);
    }
    if (w.tags && w.tags.length) {
      var ul = el('ul', 'tags');
      w.tags.forEach(function (t) { ul.appendChild(el('li', null, t)); });
      info.appendChild(ul);
    }
    if (w.link) {
      var a = el('a', 'lnk', 'View project'); a.href = w.link; a.target = '_blank'; a.rel = 'noopener';
      info.appendChild(a);
    }
    grid.appendChild(info);
    body.appendChild(grid);
    d.appendChild(body);
    return d;
  }

  function cats() {
    var c = ['All'];
    DATA.forEach(function (w) { var k = w.category || 'Other'; if (c.indexOf(k) < 0) { c.push(k); } });
    return c;
  }
  function drawChips() {
    chips.textContent = '';
    cats().forEach(function (c) {
      var b = el('button', 'chip', c); b.type = 'button'; b.setAttribute('aria-pressed', String(c === cat));
      b.addEventListener('click', function () { cat = c; shown = PAGE; draw(); });
      chips.appendChild(b);
    });
  }
  function draw() {
    drawChips();
    var items = DATA.filter(function (w) { return cat === 'All' || (w.category || 'Other') === cat; });
    list.textContent = '';
    items.slice(0, shown).forEach(function (w, i) { list.appendChild(row(w, i + 1)); });
    more.hidden = items.length <= shown;
    if (!items.length) {
      count.textContent = 'No projects in this group yet.';
    } else {
      count.textContent = 'Showing ' + Math.min(shown, items.length) + ' of ' + items.length +
        (cat === 'All' ? ' projects' : ' ' + cat.toLowerCase() + ' projects');
    }
  }
  more.addEventListener('click', function () { shown += PAGE; draw(); });

  fetch('works.json', { cache: 'no-cache' })
    .then(function (r) { if (!r.ok) { throw new Error('works.json'); } return r.json(); })
    .then(function (d) { DATA = Array.isArray(d) ? d : (d.works || []); draw(); })
    .catch(function () { count.textContent = 'Projects could not be loaded. Please try again later.'; });
})();
