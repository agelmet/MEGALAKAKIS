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
          '<div class="sh-tx"><h4 class="sh-t" data-en="' + esc('«' + en(s, 'title') + '»') + '">«' + esc(s.title) + '»</h4>' + T('p', s, 'text', 'sh-x', true) + (s.video ? '<div class="yt-w"><button class="yt" type="button" data-yt="' + esc(s.video) + '" aria-label="Βίντεο: ' + esc(s.title) + '" data-en-aria="Video: ' + esc(en(s, 'title')) + '"><img src="assets/img/video/megalakakis-video-' + esc(s.video) + '.webp" alt="" width="640" height="360" loading="lazy" decoding="async"><span class="yt-p" aria-hidden="true"></span><span class="yt-l" data-en="Watch the video">Δείτε το βίντεο</span></button></div>' : '') + '</div></article>';
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
  /* ===== v2 (28 Nov 2026): δράσεις με ημερομηνία, βιντεοθήκες, τραγούδια, βιβλιοθήκη, Τύπος ===== */
  var KIND2 = {
    seminar: 'Σεμινάριο', lessons: 'Μαθήματα', show: 'Παράσταση', online: 'Online', news: 'Νέα',
    experiential: 'Βιωματικό σεμινάριο', book: 'Παρουσίαση βιβλίου', documentary: 'Προβολή ντοκιμαντέρ',
    lecture: 'Διάλεξη', media: 'Στα ΜΜΕ', song: 'Νέο τραγούδι', exhibition: 'Έκθεση',
    music: 'Μουσική συνάντηση', glenti: 'Γλέντι', collab: 'Συνεργασία'
  };
  var MON = ['Ιανουαρίου', 'Φεβρουαρίου', 'Μαρτίου', 'Απριλίου', 'Μαΐου', 'Ιουνίου', 'Ιουλίου', 'Αυγούστου', 'Σεπτεμβρίου', 'Οκτωβρίου', 'Νοεμβρίου', 'Δεκεμβρίου'];
  var MONS = ['Ιαν', 'Φεβ', 'Μαρ', 'Απρ', 'Μάι', 'Ιουν', 'Ιουλ', 'Αυγ', 'Σεπ', 'Οκτ', 'Νοε', 'Δεκ'];
  function iso(d) { return d.getFullYear() + '-' + ('0' + (d.getMonth() + 1)).slice(-2) + '-' + ('0' + d.getDate()).slice(-2); }
  function today(o) { return (o && o.today) || iso(new Date()); }
  function evEnd(n) { return n.end || n.start || n.date || ''; }
  function upcoming(n, o) { return !!n.start && evEnd(n) >= today(o); }
  function dfmt(s) { if (!s) return ''; var p = s.split('-'); return +p[2] + ' ' + MON[+p[1] - 1] + ' ' + p[0]; }
  function evSort(L, o) {
    var t = today(o), up = [], past = [];
    L.forEach(function (n) { (upcoming(n, o) ? up : past).push(n); });
    up.sort(function (a, b) { return String(a.start).localeCompare(String(b.start)); });
    past.sort(function (a, b) { return String(b.start || b.date || '').localeCompare(String(a.start || a.date || '')); });
    return { up: up, past: past };
  }
  function evCard(n, o) {
    var up = upcoming(n, o), k = KIND2[n.kind] || KIND2.news, d = n.start || '';
    var btn = '';
    if (n.phone) btn += '<a class="btn btn-gold btn-s" href="tel:' + tel(n.phone) + '">Κλήση ' + esc(n.phone) + '</a>';
    if (n.link) btn += '<a class="btn btn-line btn-s" href="' + esc(n.link) + '" target="_blank" rel="noopener">' + esc(n.link_label || 'Περισσότερα') + ' ↗</a>';
    return '<article class="ev' + (up ? ' ev-up' : ' ev-past') + '" data-kind="' + esc(n.kind || 'news') + '" data-up="' + (up ? 1 : 0) + '" data-start="' + esc(d) + '" data-end="' + esc(evEnd(n)) + '">' +
      (d ? '<p class="ev-d" aria-hidden="true"><b>' + (+d.slice(8, 10)) + '</b><span>' + MONS[+d.slice(5, 7) - 1] + '</span><i>' + d.slice(0, 4) + '</i></p>' : '<p class="ev-d ev-d0" aria-hidden="true"><b>·</b></p>') +
      (n.img ? '<figure class="ev-ph">' + img(n.img, n.title, n.title, '', '') + '</figure>' : '') +
      '<div class="ev-tx"><p class="ev-k"><span class="ev-st">' + (up ? 'Προσεχώς' : 'Ολοκληρώθηκε') + '</span> · ' + esc(k) + '</p>' +
      '<h3 class="ev-t">' + esc(n.title) + '</h3>' +
      '<p class="ev-w">' + esc(n.when || dfmt(d)) + '</p>' + (n.place ? '<p class="ev-p">' + esc(n.place) + '</p>' : '') +
      (n.text ? '<p class="ev-x">' + nl(n.text) + '</p>' : '') + (up && btn ? '<p class="ev-b">' + btn + '</p>' : '') + '</div></article>';
  }
  /* arg: "all" | "home" | "kind:seminar,experiential" ; o.today για το build */
  function events(c, arg, o) {
    var L = (c.news || []).slice(), a = String(arg || 'all');
    if (a.indexOf('kind:') === 0) { var ks = a.slice(5).split(','); L = L.filter(function (n) { return ks.indexOf(n.kind) >= 0; }); }
    var S = evSort(L, o);
    if (a === 'home') {
      var pick = S.up.slice(0, 3); if (pick.length < 3) pick = pick.concat(S.past.slice(0, 3 - pick.length));
      if (!pick.length) return '<p class="empty">Σύντομα εδώ οι νέες μας δράσεις.</p>';
      return '<div class="ev-l ev-home">' + pick.map(function (n) { return evCard(n, o); }).join('') + '</div>';
    }
    if (a.indexOf('kind:') === 0) {
      if (!S.up.length) return '<p class="empty ev-none">Δεν υπάρχει ανακοινωμένη ημερομηνία αυτή τη στιγμή. Οι νέες ημερομηνίες ανακοινώνονται εδώ και στο <a href="nea.html">Ημερολόγιο δράσεων</a>.</p>';
      return '<div class="ev-l">' + S.up.map(function (n) { return evCard(n, o); }).join('') + '</div>';
    }
    return '<div class="ev-l ev-all">' + S.up.concat(S.past).map(function (n) { return evCard(n, o); }).join('') + '</div>' +
      '<p class="empty ev-none" hidden>Δεν υπάρχουν δράσεις σε αυτή την επιλογή αυτή τη στιγμή.</p>';
  }
  /* ημερολόγιο (μήνας): μόνο στον browser — η ίδια λίστα δίνει τις τελείες */
  function calendar(c, ym, o) {
    var L = c.news || [], y = +ym.slice(0, 4), m = +ym.slice(5, 7) - 1, first = new Date(y, m, 1), days = new Date(y, m + 1, 0).getDate();
    var off = (first.getDay() + 6) % 7, t = today(o), out = '';
    var head = ['Δε', 'Τρ', 'Τε', 'Πε', 'Πα', 'Σα', 'Κυ'].map(function (d) { return '<span class="cal-h">' + d + '</span>'; }).join('');
    for (var i = 0; i < off; i++) out += '<span class="cal-c cal-x"></span>';
    for (var dd = 1; dd <= days; dd++) {
      var ds = y + '-' + ('0' + (m + 1)).slice(-2) + '-' + ('0' + dd).slice(-2);
      var hits = L.filter(function (n) { return n.start && n.start <= ds && evEnd(n) >= ds; });
      out += '<span class="cal-c' + (ds === t ? ' cal-t' : '') + (hits.length ? ' cal-on' : '') + '">' + '<b>' + dd + '</b>' +
        hits.slice(0, 2).map(function (n) { return '<i class="cal-e' + (upcoming(n, o) ? ' up' : '') + '" title="' + esc(n.title) + '">' + esc(n.title) + '</i>'; }).join('') + '</span>';
    }
    return '<div class="cal-g">' + head + out + '</div>';
  }

  /* ---- βίντεο: μία καταχώριση, εμφανίζεται σε όσες βιντεοθήκες λέει το cats ---- */
  var THUMBS = ['2e0sYFYPjpg', 'BAQGSmQYjAY', 'C19N8ATs1yg', 'M0XdSZHXP8E', 'VSzDWDViESw', 'V_UOPM8qrEQ', 'Wzs5LTNdI_8', 'c0aT5obGBLA', 'vUrQhczH2Es', 'w9vjREs2fa4', 'wAnw_fWIbks'];
  function ytid(v) { v = String(v || '').trim(); var m = v.match(/(?:v=|youtu\.be\/|embed\/|shorts\/)([\w-]{11})/); return m ? m[1] : (/^[\w-]{11}$/.test(v) ? v : ''); }
  function vthumb(id, title) {
    if (THUMBS.indexOf(id) >= 0) return '<img src="assets/img/video/megalakakis-video-' + esc(id) + '.webp" alt="" width="640" height="360" loading="lazy" decoding="async">';
    return '<span class="vt-ph" aria-hidden="true"><svg viewBox="-4 -4 108 68"><use href="#spiral"/></svg><span>' + esc(title) + '</span></span>';
  }
  function meta(parts) { parts = parts.filter(function (x) { return x && String(x).trim(); }); return parts.length ? '<p class="vc-m">' + parts.map(esc).join(' · ') + '</p>' : ''; }
  function vcard(v) {
    var id = ytid(v.yt);
    return '<article class="vc" data-where="' + esc(v.where || '') + '" data-y="' + esc(v.year || '') + '">' +
      (id ? '<div class="yt-w"><button class="yt" type="button" data-yt="' + esc(id) + '" aria-label="Βίντεο: ' + esc(v.title) + '">' + vthumb(id, v.title) +
        '<span class="yt-p" aria-hidden="true"></span><span class="yt-l">Δείτε το βίντεο</span></button></div>' : '') +
      '<div class="vc-tx"><h3 class="vc-t">' + esc(v.title) + '</h3>' +
      meta([v.channel, v.show, v.host ? 'Παρουσίαση: ' + v.host : '', v.speaker ? 'Ομιλητής: ' + v.speaker : '', v.place, v.country, v.year, v.org ? 'Διοργάνωση: ' + v.org : '']) +
      (v.theme ? '<p class="vc-th">' + esc(v.theme) + '</p>' : '') + (v.desc ? '<p class="vc-x">' + nl(v.desc) + '</p>' : '') + '</div></article>';
  }
  function videos(c, cat) {
    var L = (c.videos || []).filter(function (v) { return !v.hidden && (cat === 'featured' ? v.featured : (v.cats || []).indexOf(cat) >= 0); });
    L.sort(function (a, b) { return String(b.year || '').localeCompare(String(a.year || '')); });
    if (!L.length) return '<p class="empty vl-none">Η βιντεοθήκη εμπλουτίζεται συνεχώς — τα πρώτα βίντεο προστίθενται σύντομα.</p>';
    return '<div class="vl">' + L.map(vcard).join('') + '</div><p class="empty vl-none" hidden>Δεν υπάρχουν ακόμη βίντεο σε αυτή την επιλογή.</p>';
  }

  /* ---- τραγούδια (στίχοι Γιάννη Μεγαλακάκη) ---- */
  function songs(c) {
    var L = (c.songs || []).filter(function (s) { return !s.hidden; });
    if (!L.length) return '<p class="empty">Η μουσική βιβλιοθήκη ανοίγει σύντομα.</p>';
    return '<div class="sl">' + L.map(function (s, i) {
      var id = ytid(s.yt), cr = [['Στίχοι', s.lyricist], ['Μουσική', s.composer], ['Ερμηνεία', s.singer], ['Συντελεστές', s.credits], ['Χρονολογία', s.year]]
        .filter(function (x) { return x[1]; }).map(function (x) { return '<div><dt>' + x[0] + '</dt><dd>' + esc(x[1]) + '</dd></div>'; }).join('');
      return '<article class="sg" data-genre="' + esc(s.genre || '') + '">' +
        '<p class="sg-n" aria-hidden="true">' + ('0' + (i + 1)).slice(-2) + '</p>' +
        '<div class="sg-tx"><h3 class="sg-t">«' + esc(s.title) + '»</h3>' + (s.genre ? '<p class="sg-g">' + esc(s.genre) + '</p>' : '') +
        (cr ? '<dl class="sg-cr">' + cr + '</dl>' : '') + (s.story ? '<div class="sg-st"><p class="sg-sl">Η ιστορία του τραγουδιού</p><p>' + nl(s.story) + '</p></div>' : '') + '</div>' +
        (id ? '<div class="yt-w sg-v"><button class="yt" type="button" data-yt="' + esc(id) + '" aria-label="Τραγούδι: ' + esc(s.title) + '">' + vthumb(id, s.title) + '<span class="yt-p" aria-hidden="true"></span><span class="yt-l">Ακούστε το</span></button></div>' : '') +
        '</article>';
    }).join('') + '</div>';
  }

  /* ---- Ψηφιακή Βιβλιοθήκη ---- */
  function fold(s) { return String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/ς/g, 'σ'); }
  function library(c) {
    var L = (c.library || []).filter(function (b) { return !b.hidden; });
    if (!L.length) return '<p class="empty">Τα πρώτα τεκμήρια της Βιβλιοθήκης προστίθενται σύντομα.</p>';
    return '<ul class="lib-l">' + L.map(function (b) {
      var hay = fold([b.title, b.author, b.theme, b.keywords, b.type, b.year, b.ref].join(' '));
      var link = b.url ? '<a class="lib-a" href="' + esc(b.url) + '"' + (/^https?:/.test(b.url) ? ' target="_blank" rel="noopener"' : '') + '>' + (b.full ? 'Διαβάστε το κείμενο' : 'Σύνδεσμος') + ' ' + (/^https?:/.test(b.url) ? '↗' : '→') + '</a>' : '';
      return '<li class="lib" data-theme="' + esc(b.theme || '') + '" data-hay="' + esc(hay) + '">' +
        '<p class="lib-k">' + esc(b.theme || '') + (b.type ? ' · ' + esc(b.type) : '') + '</p>' +
        '<h3 class="lib-t">' + esc(b.title) + '</h3>' + '<p class="lib-au">' + esc(b.author || '') + (b.year ? ', ' + esc(b.year) : '') + '</p>' +
        (b.ref ? '<p class="lib-r">' + esc(b.ref) + '</p>' : '') + (b.desc ? '<p class="lib-x">' + nl(b.desc) + '</p>' : '') + link + '</li>';
    }).join('') + '</ul><p class="empty lib-none" hidden>Δεν βρέθηκε τεκμήριο με αυτά τα κριτήρια.</p>';
  }

  /* ---- Τύπος / δημοσιεύματα ---- */
  function press(c, tag) {
    var L = (c.press || []).filter(function (p) { return !p.hidden && (!tag || tag === 'all' || (p.tags || []).indexOf(tag) >= 0); });
    L.sort(function (a, b) { return String(b.date || '').localeCompare(String(a.date || '')); });
    if (!L.length) return '';
    return '<ul class="pr-l">' + L.map(function (p) {
      return '<li class="pr"><a href="' + esc(p.url) + '" target="_blank" rel="noopener"><span class="pr-o">' + esc(p.outlet) + (p.date ? ' · ' + esc(p.date.slice(0, 4)) : '') + '</span>' +
        '<span class="pr-t">' + esc(p.title) + '</span>' + (p.about ? '<span class="pr-x">' + esc(p.about) + '</span>' : '') + '<span class="pr-go" aria-hidden="true">↗</span></a></li>';
    }).join('') + '</ul>';
  }

  /* ενιαίο σημείο: <div data-r="videos:seminaria"> */
  function block(c, spec, o) {
    var i = spec.indexOf(':'), name = i < 0 ? spec : spec.slice(0, i), arg = i < 0 ? '' : spec.slice(i + 1);
    switch (name) {
      case 'events': return events(c, arg, o);
      case 'calendar': return calendar(c, arg || today(o).slice(0, 7), o);
      case 'videos': return videos(c, arg);
      case 'songs': return songs(c);
      case 'library': return library(c);
      case 'press': return press(c, arg);
      case 'lessons': return lessons(c);
      case 'shows': return shows(c);
      case 'contact': return contact(c);
    }
    return '';
  }

  var api = { news: news, lessons: lessons, shows: shows, contact: contact, mbar: mbar, esc: esc, KIND: KIND,
    KIND2: KIND2, events: events, calendar: calendar, videos: videos, songs: songs, library: library, press: press, block: block, ytid: ytid, fold: fold };
  if (typeof module !== 'undefined' && module.exports) module.exports = api; else root.MEGR = api;
})(this);
