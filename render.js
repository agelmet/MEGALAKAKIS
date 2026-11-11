/* Μεγαλακάκης — shared renderers for the editable parts (news, lessons, performances).
   Used twice: by build.py (through node, to bake the first version into the HTML so Google and AI crawlers read it)
   and by the page itself (to show what was published from the panel). Every visible string carries data-en. */
(function (root) {
  var KIND = {
    seminar: ['Σεμινάριο', 'Seminar'], lessons: ['Μαθήματα', 'Classes'], show: ['Παράσταση', 'Performance'],
    online: ['Online', 'Online'], news: ['Νέα', 'News']
  };
  function esc(s) { return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }
  function nl(s) { return esc(s).replace(/\n{2,}/g, '</p><p>').replace(/\n/g, '<br>'); }
  function en(o, k) { var v = o[k + '_en']; return (v && String(v).trim()) ? v : o[k]; }
  function T(tag, o, k, cls, html) {
    var el = o[k]; if (!el || !String(el).trim()) return '';
    var e = en(o, k), f = html ? nl : esc;
    return '<' + tag + (cls ? ' class="' + cls + '"' : '') + ' data-en="' + esc(f(e)) + '">' + f(el) + '</' + tag + '>';
  }
  function tel(p) { return String(p || '').replace(/[^\d+]/g, ''); }
  function img(src, alt, altEn, cls, sizes) {
    if (!src) return '';
    return '<img src="' + esc(src) + '" alt="' + esc(alt) + '" data-en-alt="' + esc(altEn || alt) + '" loading="lazy" decoding="async"' +
      (cls ? ' class="' + cls + '"' : '') + ' data-lb>';
  }
  function news(c) {
    var L = (c.news || []).slice().sort(function (a, b) { return String(b.date || '').localeCompare(String(a.date || '')); });
    if (!L.length) return '<p class="empty" data-en="New announcements will appear here soon.">Σύντομα εδώ οι νέες μας ανακοινώσεις.</p>';
    var cards = L.map(function (n, i) {
      var k = KIND[n.kind] || KIND.news;
      var btn = '';
      if (n.phone) btn += '<a class="btn btn-gold" href="tel:' + tel(n.phone) + '"><span data-en="Call">Κλήση</span> ' + esc(n.phone) + '</a>';
      if (n.link) btn += '<a class="btn btn-line" href="' + esc(n.link) + '" target="_blank" rel="noopener">' +
        '<span data-en="' + esc(n.link_label_en || n.link_label || 'More') + '">' + esc(n.link_label || 'Περισσότερα') + '</span> ↗</a>';
      return '<article class="nw' + (i === 0 ? ' nw-first' : '') + '" data-id="' + esc(n.id) + '">' +
        '<figure class="nw-ph">' + img(n.img, n.title, en(n, 'title'), '', '') + '</figure>' +
        '<div class="nw-tx"><p class="nw-k"><span data-en="' + k[1] + '">' + k[0] + '</span></p>' +
        T('h3', n, 'title', 'nw-t') + T('p', n, 'when', 'nw-w') + T('p', n, 'place', 'nw-p') +
        T('p', n, 'text', 'nw-x', true) + (btn ? '<p class="nw-b">' + btn + '</p>' : '') + '</div></article>';
    });
    var out = cards[0];
    if (cards.length > 1) out += '<div class="rail-h"><p class="rail-t" data-en="Earlier announcements">Προηγούμενες ανακοινώσεις</p><p class="rail-nav"><button class="rail-b" type="button" data-d="p" aria-label="Προηγούμενα" data-en-aria="Previous">‹</button><button class="rail-b" type="button" data-d="n" aria-label="Επόμενα" data-en-aria="Next">›</button></p></div><div class="nw-rail">' + cards.slice(1).join('') + '</div>';
    return out;
  }
  function lessons(c) {
    var o = c.lessons || {}, L = o.items || [];
    var head = '<p class="ls-season"><span data-en="Teaching season">Διδακτική περίοδος</span> <b data-en="' + esc(en(o, 'season')) + '">' + esc(o.season || '') + '</b></p>';
    if (!L.length) return head + '<p class="empty" data-en="The new season’s classes will be announced soon.">Σύντομα το πρόγραμμα της νέας περιόδου.</p>';
    return head + '<div class="ls-g">' + L.map(function (l) {
      var map = 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent((l.address || '') + ' ' + (l.area || ''));
      return '<article class="ls"><div class="ls-top">' + T('h3', l, 'area', 'ls-a') +
        '<p class="ls-d"><span data-en="' + esc(en(l, 'day')) + '">' + esc(l.day || '') + '</span> · ' + esc(l.time || '') + '</p></div>' +
        (l.teacher ? '<p class="ls-t"><span data-en="Taught by">Διδάσκει ο</span> <b data-en="' + esc(en(l, 'teacher')) + '">' + esc(l.teacher) + '</b></p>' : '') +
        T('p', l, 'club', 'ls-c') +
        (l.address ? '<p class="ls-ad"><a href="' + esc(map) + '" target="_blank" rel="noopener" data-en="' + esc(en(l, 'address')) + ' ↗">' + esc(l.address) + ' ↗</a></p>' : '') +
        (l.phone ? '<p class="ls-ph"><span data-en="Information">Πληροφορίες</span> <a href="tel:' + tel(l.phone) + '">' + esc(l.phone) + '</a></p>' : '') +
        '</article>';
    }).join('') + '</div>';
  }
  function shows(c) {
    var L = c.shows || [], years = [], by = {};
    L.forEach(function (s) { var y = String(s.year || '—'); if (!by[y]) { by[y] = []; years.push(y); } by[y].push(s); });
    years.sort(function (a, b) { return b.localeCompare(a); });
    return years.map(function (y) {
      return '<section class="sy"><h3 class="sy-y"><span>' + esc(y) + '</span></h3><div class="sy-l">' + by[y].map(function (s) {
        return '<article class="sh' + (s.img ? ' sh-img' : '') + '">' + (s.img ? '<figure class="sh-ph">' + img(s.img, 'Αφίσα: ' + s.title, 'Poster: ' + en(s, 'title')) + '</figure>' : '') +
          '<div class="sh-tx"><h4 class="sh-t" data-en="' + esc('«' + en(s, 'title') + '»') + '">«' + esc(s.title) + '»</h4>' + T('p', s, 'text', 'sh-x', true) + '</div></article>';
      }).join('') + '</div></section>';
    }).join('');
  }

  var IC = {
    ph: '<svg viewBox="0 0 24 24"><path d="M6.6 3.5l2.6.4 1.2 4.2-1.9 1.6a13 13 0 0 0 5.8 5.8l1.6-1.9 4.2 1.2.4 2.6c.1 1-.7 2-1.8 2A17 17 0 0 1 4.6 5.3c0-1.1 1-1.9 2-1.8z"/></svg>',
    msg: '<svg viewBox="0 0 24 24"><path d="M4 5h16v11H9l-5 4z"/><path d="M8 9.5h8M8 12.5h5"/></svg>',
    mail: '<svg viewBox="0 0 24 24"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3.5 6l8.5 7 8.5-7"/></svg>',
    out: '<svg viewBox="0 0 24 24"><path d="M14 4h6v6M20 4l-9 9M18 14v5H5V6h5"/></svg>'
  };
  function contact(c) {
    var k = c.contact || {}, t = tel(k.phone), out = '';
    if (k.phone) out += '<a class="ct-c" href="tel:' + t + '"><span class="ct-i">' + IC.ph + '</span><span><small data-en="Phone' + (k.name ? ' · ' + esc(k.name_en || k.name) : '') + '">Τηλέφωνο' + (k.name ? ' · ' + esc(k.name) : '') + '</small><b>' + esc(k.phone) + '</b></span></a>';
    if (k.phone && k.viber) out += '<a class="ct-c" href="viber://chat?number=%2B30' + t.replace(/^\+?30/, '') + '"><span class="ct-i">' + IC.msg + '</span><span><small>Viber</small><b data-en="Send a message">Στείλτε μήνυμα</b></span></a>';
    if (k.phone && k.whatsapp) out += '<a class="ct-c" href="https://wa.me/30' + t.replace(/^\+?30/, '') + '" target="_blank" rel="noopener"><span class="ct-i">' + IC.msg + '</span><span><small>WhatsApp</small><b data-en="Send a message">Στείλτε μήνυμα</b></span></a>';
    if (k.email) out += '<a class="ct-c" href="mailto:' + esc(k.email) + '"><span class="ct-i">' + IC.mail + '</span><span><small>Email</small><b>' + esc(k.email) + '</b></span></a>';
    [['facebook', 'Facebook'], ['instagram', 'Instagram'], ['youtube', 'YouTube']].forEach(function (s) {
      if (k[s[0]]) out += '<a class="ct-c" href="' + esc(k[s[0]]) + '" target="_blank" rel="noopener"><span class="ct-i">' + IC.out + '</span><span><small>' + s[1] + '</small><b data-en="Follow us">Ακολουθήστε μας</b></span></a>';
    });
    return out;
  }
  function mbar(c) {
    var k = c.contact || {}, t = tel(k.phone), out = '';
    if (k.phone) out += '<a href="tel:' + t + '" data-en="Call">Κλήση</a>';
    if (k.phone && k.viber) out += '<a href="viber://chat?number=%2B30' + t.replace(/^\+?30/, '') + '">Viber</a>';
    out += '<a href="#nea" data-en="News">Νέα</a>';
    return out;
  }
  var api = { news: news, lessons: lessons, shows: shows, contact: contact, mbar: mbar, esc: esc, KIND: KIND };
  if (typeof module !== 'undefined' && module.exports) module.exports = api; else root.MEGR = api;
})(this);
