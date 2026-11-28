/* Μεγαλακάκης v2 — μενού, αναζήτηση, ημερολόγιο, φίλτρα, βιβλιοθήκη, φόρμες (28 Nov 2026) */
(function () {
  var D = document, W = window, H = D.documentElement;
  var RM = matchMedia('(prefers-reduced-motion:reduce)').matches;
  var DRAFT = /drafts\.advonmedia\.com|github\.io|localhost|127\.0\.0\.1/.test(location.host);
  var R = W.MEGR;
  function $(s, r) { return (r || D).querySelector(s); }
  function $$(s, r) { return Array.prototype.slice.call((r || D).querySelectorAll(s)); }
  function fold(s) { return String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/ς/g, 'σ'); }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }

  /* ---------- mobile submenus ---------- */
  $$('.mn-t').forEach(function (b) {
    b.addEventListener('click', function () {
      var open = b.getAttribute('aria-expanded') !== 'true', s = D.getElementById(b.getAttribute('aria-controls'));
      b.setAttribute('aria-expanded', open); if (s) s.hidden = !open;
    });
  });

  /* ---------- reveal ---------- */
  var IO = 'IntersectionObserver' in W ? new IntersectionObserver(function (es) {
    es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); IO.unobserve(e.target); } });
  }, { rootMargin: '0px 0px -8% 0px', threshold: .04 }) : null;
  function reveal() {
    $$('.s2h,.six-c,.call,.goal,.rv2').forEach(function (el, i) {
      if (el.classList.contains('in')) return;
      if (!IO || RM || D.hidden) { el.classList.add('in'); return; }
      if (el.matches('.six-c,.call')) el.style.transitionDelay = ((i % 3) * 70) + 'ms';
      IO.observe(el);
    });
  }
  reveal();

  /* ---------- search ---------- */
  var S = $('#srch'), Q = $('#srchQ'), RR = $('#srchR'), IDX = null;
  function openS() {
    if (!S) return; S.hidden = false; D.body.style.overflow = 'hidden'; setTimeout(function () { Q.focus(); }, 30);
    if (!IDX) fetch('assets/search.json').then(function (r) { return r.json(); }).then(function (j) {
      IDX = j.map(function (x) { x.f = fold(x.t + ' ' + x.p + ' ' + x.x); return x; }); run();
    }).catch(function () { RR.innerHTML = '<p class="srch-0">Η αναζήτηση δεν είναι διαθέσιμη αυτή τη στιγμή.</p>'; });
  }
  function closeS() { if (!S || S.hidden) return; S.hidden = true; D.body.style.overflow = ''; }
  function snip(x, words) {
    var f = fold(x), at = -1; words.forEach(function (w) { var i = f.indexOf(w); if (i >= 0 && (at < 0 || i < at)) at = i; });
    var st = Math.max(0, at - 60), s = (st ? '…' : '') + x.slice(st, st + 200) + '…';
    var out = esc(s);
    words.forEach(function (w) {
      if (w.length < 2) return;
      var fs = fold(s), i = fs.indexOf(w);
      if (i >= 0) { var orig = s.substr(i, w.length); out = out.replace(esc(orig), '<mark>' + esc(orig) + '</mark>'); }
    });
    return out;
  }
  function run() {
    if (!IDX) { RR.innerHTML = '<p class="srch-0">Φόρτωση…</p>'; return; }
    var q = fold(Q.value.trim());
    if (q.length < 2) { RR.innerHTML = '<p class="srch-0">Γράψτε τουλάχιστον δύο γράμματα — π.χ. «σεμινάρια», «Κόσκινο», «βιβλία», «Ανώγεια».</p>'; return; }
    var words = q.split(/\s+/).filter(Boolean);
    var hits = IDX.map(function (x) {
      var sc = 0; for (var i = 0; i < words.length; i++) { if (x.f.indexOf(words[i]) < 0) return null; sc += fold(x.t).indexOf(words[i]) >= 0 ? 5 : 1; }
      return { x: x, s: sc };
    }).filter(Boolean).sort(function (a, b) { return b.s - a.s; }).slice(0, 14);
    RR.innerHTML = hits.length ? hits.map(function (h) {
      return '<a href="' + esc(h.x.u) + '"><small>' + esc(h.x.p) + '</small><b>' + esc(h.x.t) + '</b><span>' + snip(h.x.x, words) + '</span></a>';
    }).join('') : '<p class="srch-0">Δεν βρέθηκε κάτι για «' + esc(Q.value) + '». Δοκιμάστε άλλη λέξη.</p>';
  }
  if (S) {
    $$('.srch-b').forEach(function (b) { b.addEventListener('click', openS); });
    $('.srch-x').addEventListener('click', closeS);
    S.addEventListener('click', function (e) { if (e.target === S) closeS(); if (e.target.closest('.srch-r a')) closeS(); });
    Q.addEventListener('input', run);
    D.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closeS();
      if ((e.key === '/' || (e.key === 'k' && (e.metaKey || e.ctrlKey))) && !/INPUT|TEXTAREA|SELECT/.test((e.target || {}).tagName || '')) { e.preventDefault(); openS(); }
    });
  }

  /* ---------- live content: ξαναζωγραφίζει τα [data-r] με το περιεχόμενο που δημοσιεύτηκε από το πάνελ ---------- */
  var C = null;
  function getContent() {
    var demo = null;
    try { demo = JSON.parse(localStorage.getItem('meg-demo') || 'null'); } catch (e) {}
    if (demo && DRAFT) return Promise.resolve(demo);
    var u = DRAFT ? 'content.json?v=' + Date.now() : '/api/content';
    return fetch(u, { cache: 'no-store' }).then(function (r) { if (!r.ok) throw r.status; return r.json(); })
      .catch(function () { return fetch('content.json', { cache: 'no-store' }).then(function (r) { return r.json(); }); });
  }
  function paint() {
    if (!R || !R.block || !C) return;
    $$('[data-r]').forEach(function (el) {
      var spec = el.getAttribute('data-r');
      if (/^calendar/.test(spec)) return;
      el.innerHTML = R.block(C, spec, {});
    });
    applyEv(); applyV(); applyLib(); cal(0); reveal();
  }
  if (R && R.block) getContent().then(function (c) { C = c; paint(); }).catch(function () {});

  /* ---------- events filters (Νέα) ---------- */
  var evT = 'all', evK = '';
  function applyEv() {
    var box = $('.ev-filter'); if (!box) return;
    var n = 0;
    $$('.ev', box).forEach(function (e) {
      var ok = (evT === 'all' || (evT === 'up' ? e.dataset.up === '1' : e.dataset.up === '0')) && (!evK || e.dataset.kind === evK);
      e.hidden = !ok; if (ok) n++;
    });
    var none = $('.ev-none', box); if (none) none.hidden = n > 0;
  }
  $$('#oles .seg button').forEach(function (b) {
    b.addEventListener('click', function () { $$('#oles .seg button').forEach(function (x) { x.setAttribute('aria-pressed', x === b); }); evT = b.dataset.t; applyEv(); });
  });
  $$('#oles .fchip').forEach(function (b) {
    b.addEventListener('click', function () { $$('#oles .fchip').forEach(function (x) { x.setAttribute('aria-pressed', x === b); }); evK = b.dataset.k; applyEv(); });
  });

  /* ---------- calendar ---------- */
  var calBox = $('[data-cal]'), calYM = null;
  var MON = ['Ιανουάριος', 'Φεβρουάριος', 'Μάρτιος', 'Απρίλιος', 'Μάιος', 'Ιούνιος', 'Ιούλιος', 'Αύγουστος', 'Σεπτέμβριος', 'Οκτώβριος', 'Νοέμβριος', 'Δεκέμβριος'];
  function cal(d) {
    if (!calBox) return;
    var now = new Date();
    if (!calYM) calYM = [now.getFullYear(), now.getMonth()];
    calYM[1] += d; if (calYM[1] < 0) { calYM[1] = 11; calYM[0]--; } if (calYM[1] > 11) { calYM[1] = 0; calYM[0]++; }
    var ym = calYM[0] + '-' + ('0' + (calYM[1] + 1)).slice(-2);
    $('.cal-m', calBox).textContent = MON[calYM[1]] + ' ' + calYM[0];
    var g = $('[data-r^="calendar"]', calBox);
    if (C && R) g.innerHTML = R.block(C, 'calendar:' + ym, {});
  }
  if (calBox) {
    $$('.cal-nv', calBox).forEach(function (b) { b.addEventListener('click', function () { cal(+b.dataset.d); }); });
    cal(0);
  }

  /* ---------- video libraries: Ελλάδα / Εξωτερικό ---------- */
  var vW = '';
  function applyV() {
    $$('[data-vfilter]').forEach(function (seg) {
      var box = seg.parentNode.querySelector('.vf'); if (!box) return;
      var n = 0; $$('.vc', box).forEach(function (v) { var ok = !vW || v.dataset.where === vW; v.hidden = !ok; if (ok) n++; });
      var none = $$('.vl-none', box).pop(); if (none && $('.vl', box)) none.hidden = n > 0;
    });
  }
  $$('[data-vfilter] button').forEach(function (b) {
    b.addEventListener('click', function () { $$('button', b.parentNode).forEach(function (x) { x.setAttribute('aria-pressed', x === b); }); vW = b.dataset.w; applyV(); });
  });

  /* ---------- Ψηφιακή Βιβλιοθήκη ---------- */
  var libQ = $('#libQ'), libTh = '';
  function applyLib() {
    var L = $$('.lib'); if (!L.length && !libQ) return;
    var words = fold(libQ ? libQ.value : '').split(/\s+/).filter(Boolean), n = 0;
    L.forEach(function (b) {
      var h = b.dataset.hay || '', ok = (!libTh || b.dataset.theme === libTh) && words.every(function (w) { return h.indexOf(w) >= 0; });
      b.hidden = !ok; if (ok) n++;
    });
    var none = $('.lib-none'); if (none) none.hidden = n > 0 || !L.length;
  }
  if (libQ) libQ.addEventListener('input', applyLib);
  $$('#vivliothiki .fchip').forEach(function (b) {
    b.addEventListener('click', function () {
      var on = b.getAttribute('aria-pressed') !== 'true';
      $$('#vivliothiki .fchip').forEach(function (x) { x.setAttribute('aria-pressed', 'false'); });
      b.setAttribute('aria-pressed', on); libTh = on ? b.dataset.th : ''; applyLib();
    });
  });

  /* ---------- photo archive ---------- */
  $$('[data-gt]').forEach(function (b) {
    b.addEventListener('click', function () {
      $$('[data-gt]').forEach(function (x) { x.setAttribute('aria-pressed', x === b); });
      $$('.ga').forEach(function (g) { g.hidden = !!b.dataset.gt && g.dataset.th !== b.dataset.gt; });
    });
  });

  /* ---------- forms → e-mail ---------- */
  function val(f, el) {
    if (el.type === 'checkbox' && el.name && f.querySelectorAll('[name="' + el.name + '"]').length > 1) return null;
    return el.value;
  }
  function compose(f) {
    var lines = [], seen = {};
    $$('.ff', f).forEach(function (ff) {
      if (ff.tagName === 'FIELDSET') {
        var v = $$('input:checked', ff).map(function (i) { return i.value; });
        if (v.length) lines.push(ff.dataset.l + ': ' + v.join(', '));
        return;
      }
      var el = $('input,select,textarea', ff); if (!el) return;
      if (el.type === 'checkbox') { if (el.checked) lines.push('✓ ' + ff.textContent.trim()); return; }
      if (el.value.trim()) lines.push(el.dataset.l + ': ' + el.value.trim());
    });
    return lines;
  }
  function check(f) {
    var ok = true;
    $$('.ff', f).forEach(function (ff) {
      var bad = false;
      if (ff.tagName === 'FIELDSET') {
        var req = ff.hasAttribute('data-req') || $('input[required]', ff);
        bad = req && !$('input:checked', ff);
      } else {
        var el = $('input,select,textarea', ff);
        if (el && el.required) bad = el.type === 'checkbox' ? !el.checked : !el.value.trim() || (el.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(el.value.trim()));
      }
      ff.classList.toggle('bad', !!bad); if (bad) ok = false;
    });
    return ok;
  }
  $$('form.fm').forEach(function (f) {
    f.addEventListener('submit', function (e) {
      e.preventDefault();
      var err = $('.fm-err', f);
      if (!check(f)) { err.hidden = false; var b = $('.bad input,.bad select,.bad textarea', f); if (b) b.focus(); return; }
      err.hidden = true;
      var nm = ($('[name=name]', f) || $('[name=resp]', f) || $('[name=org]', f) || {}).value || '';
      var subj = f.dataset.subject + (nm ? ' — ' + nm.trim() : '');
      var body = compose(f).join('\n') + '\n\n— Από την ιστοσελίδα megalakakis.gr';
      location.href = 'mailto:' + f.dataset.to + '?subject=' + encodeURIComponent(subj) + '&body=' + encodeURIComponent(body);
      f.classList.add('sent'); var ok = $('.fm-ok', f); ok.hidden = false;
    });
    f.addEventListener('input', function (e) { var ff = e.target.closest('.ff'); if (ff && ff.classList.contains('bad')) check(f); });
    var again = $('.fm-again', f);
    if (again) again.addEventListener('click', function () { f.reset(); f.classList.remove('sent'); $('.fm-ok', f).hidden = true; });
  });

  /* ---------- Επικοινωνία: λόγος → φόρμα ---------- */
  var RC = $$('.rchip');
  function pick(k, scroll) {
    if (!$('.rform[data-for="' + k + '"]')) return;
    RC.forEach(function (x) { x.setAttribute('aria-pressed', x.dataset.reason === k); });
    $$('.rform').forEach(function (r) { r.hidden = r.dataset.for !== k; });
    if (scroll && innerWidth < 981) { var t = $('.rform[data-for="' + k + '"]'); t.scrollIntoView({ behavior: RM ? 'auto' : 'smooth', block: 'start' }); }
  }
  RC.forEach(function (b) { b.addEventListener('click', function () { pick(b.dataset.reason, true); }); });
  if (RC.length) {
    var qs = new URLSearchParams(location.search), lg = qs.get('logos');
    if (lg) pick(lg, false);
    var bk = qs.get('ekdosi');
    if (bk) { var sel = $('.rform[data-for="ekdoseis"] select[name=book]'); if (sel) $$('option', sel).forEach(function (o) { if (fold(o.textContent) === fold(bk)) sel.value = o.textContent; }); }
  }

  /* ---------- newsletter ---------- */
  $$('form[data-nl]').forEach(function (f) {
    f.addEventListener('submit', function (e) {
      e.preventDefault(); var i = $('input', f), v = i.value.trim();
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) { i.focus(); i.setAttribute('aria-invalid', 'true'); return; }
      var to = (W.MEG_MAIL || 'gmegal@hotmail.com');
      location.href = 'mailto:' + to + '?subject=' + encodeURIComponent('Εγγραφή στο newsletter') + '&body=' + encodeURIComponent('Θα ήθελα να λαμβάνω τα νέα σας στο: ' + v);
      $('.nl-ok', f).hidden = false;
    });
  });
})();
