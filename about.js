/* About page: experience, education and internships from about.json (edited in the CMS).
   A date is shown only when one has been entered. */
(function () {
  'use strict';
  function el(t, c, x) { var e = document.createElement(t); if (c) { e.className = c; } if (x != null) { e.textContent = x; } return e; }
  function entry(item) {
    var art = el('article', 'ent');
    var head = el('div');
    head.appendChild(el('h3', null, item.title || ''));
    if (item.org) { head.appendChild(el('p', 'org', item.org)); }
    if (item.when) { head.appendChild(el('p', 'when', item.when)); }
    art.appendChild(head);
    var pts = (item.points || []).filter(function (p) { return p; });
    if (pts.length) {
      var ul = el('ul', 'ebul');
      pts.forEach(function (p) { ul.appendChild(el('li', null, p)); });
      art.appendChild(ul);
    } else {
      art.appendChild(el('div'));
    }
    return art;
  }
  function fill(id, items) {
    var box = document.getElementById(id);
    if (!box) { return; }
    box.textContent = '';
    (items || []).forEach(function (it) { box.appendChild(entry(it)); });
  }
  fetch('about.json', { cache: 'no-cache' })
    .then(function (r) { if (!r.ok) { throw new Error('about.json'); } return r.json(); })
    .then(function (d) {
      fill('experience-list', d.experience);
      fill('education-list', d.education);
      fill('internship-list', d.internships);
    })
    .catch(function () {});
})();
