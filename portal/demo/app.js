(function () {
'use strict';
var M = window.SMEDJAN;

var NAV = [
  { etikett: 'PROCESS', rader: [{ namn: 'Översikt', rutt: '#/oversikt', vy: 'oversikt' }, { namn: 'Körningar', rutt: '#/korningar', vy: 'korningar' }] },
  { etikett: 'KÖRNING', rader: [{ namn: 'Körningsdetalj', rutt: '#/korning/ews-2026-09-03T14-12-08Z?steg=0', vy: 'korning' }, { namn: 'Artefakter', rutt: '#/artefakt/korningar/ews/steg0/spec-v1.md', vy: 'artefakt' }, { namn: 'Stories', rutt: '#/stories', vy: 'stories' }, { namn: 'Intag (Word)', rutt: '#/intag', vy: 'intag' }] },
  { etikett: 'REGLER', rader: [{ namn: 'Agenter & pooler', rutt: '#/agenter', vy: 'agenter' }, { namn: 'Separation & dataklass', rutt: '#/separation', vy: 'separation' }] },
  { etikett: 'PROJEKT', rader: [{ namn: 'Kostnad & användning', rutt: '#/kostnad', vy: 'kostnad' }, { namn: 'Inställningar & datakällor', rutt: '#/installningar', vy: 'installningar' }, { namn: 'Hjälp & demo-guide', rutt: '#/hjalp', vy: 'hjalp' }] }
];
var GRINDORD = { godkand: 'godkänd', godkand_med_villkor: 'godkänd med villkor', vantar: 'väntar', ej_nadd: 'ej nådd', aterremiss: 'återremiss' };
var BESLUT_TEXT = { godkand: 'godkänt', godkand_med_villkor: 'godkänt med villkor', aterremiss: 'återremiss' };
var STATUS_ORD = { klar: 'klar', kor: 'kör', vantar: 'väntar', blockerad: 'blockerad', fel: 'fel', overhoppad: 'överhoppad', ingen_korning: 'ingen körning', uppfylld: 'uppfylld', ej_tillamplig: 'ej tillämplig', bruten: 'bruten', ej_nadd: 'ej nådd', godkand: 'godkänd', godkand_med_villkor: 'godkänd med villkor', todo: 'todo' };
var HUVUDKORNING = 'ews-2026-09-03T14-12-08Z';
var DEMO_NU = Date.parse('2026-09-03T16:00:00Z');

/* ---------- hjälpfunktioner ---------- */

function esc(s) {
  return String(s === null || s === undefined ? '' : s).replace(/[&<>"']/g, function (c) {
    return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
  });
}

function parseHash(hash) {
  var h = hash || '#/oversikt';
  var bit = h.replace(/^#/, '').split('?');
  var delar = bit[0].split('/').filter(Boolean);
  var query = {};
  (bit[1] || '').split('&').filter(Boolean).forEach(function (kv) {
    var d = kv.split('=');
    query[decodeURIComponent(d[0])] = decodeURIComponent(d[1] || '');
  });
  return { vy: delar[0] || 'oversikt', rest: delar.slice(1).join('/'), query: query };
}

function buildHash(vy, rest, query) {
  var h = '#/' + vy + (rest ? '/' + rest : '');
  var qs = Object.keys(query || {}).filter(function (k) { return query[k] !== undefined && query[k] !== null && query[k] !== ''; })
    .map(function (k) { return k + '=' + encodeURIComponent(query[k]); }).join('&');
  return qs ? h + '?' + qs : h;
}

function tid(iso) { return iso ? iso.replace('T', ' ').replace('Z', '') + ' UTC' : '—'; }

function findKorning(id) {
  if (!id) id = HUVUDKORNING;
  return M.MOCK_KORNINGAR.find(function (k) { return k.korning_id === id; }) || null;
}
function findArtefakt(path) {
  if (!path) return null;
  return M.ARTEFAKTER[path] || null;
}
function resolveGrind(gid, korning) {
  if (!gid || !korning) return null;
  return (korning.grindar || []).find(function (g) { return g.id === gid; }) || null;
}

/* ---------- ikoner och statusglyfer ---------- */

function lockSvg(size) {
  size = size || 12;
  return '<svg class="hanglas" width="' + size + '" height="' + size + '" viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1" aria-hidden="true">' +
    '<rect x="2.5" y="6.5" width="9" height="6" rx="1"></rect><path d="M4.5 6.5V4.5a2.5 2.5 0 0 1 5 0v2"></path></svg>';
}
function klass2Badge() {
  return '<span class="chip chip-klass2">' + lockSvg(12) + '<span>klass 2 — endast intern</span></span>';
}

function statusPrick(status, ordOverride) {
  var s = status || 'vantar';
  var klar = s === 'klar' || s === 'uppfylld' || s === 'godkand' || s === 'godkand_med_villkor';
  var kor = s === 'kor';
  var vantar = s === 'vantar' || s === 'todo';
  var blockerad = s === 'blockerad' || s === 'bruten';
  var fel = s === 'fel';
  var overhoppad = s === 'overhoppad' || s === 'ej_tillamplig';
  var ingen = s === 'ingen_korning' || s === 'ej_nadd';
  var ord = ordOverride || STATUS_ORD[s] || s;
  var glyph = '';
  if (klar) glyph = '<span aria-hidden="true" class="prick prick-klar">✓</span>';
  else if (kor) glyph = '<span aria-hidden="true" class="prick prick-kor"></span>';
  else if (vantar) glyph = '<span aria-hidden="true" class="prick prick-vantar"></span>';
  else if (blockerad) glyph = '<span aria-hidden="true" class="prick prick-blockerad"><span class="prick-streck"></span></span>';
  else if (fel) glyph = '<span aria-hidden="true" class="prick prick-fel"></span>';
  else if (overhoppad) glyph = '<span aria-hidden="true" class="prick prick-overhoppad"><span class="prick-diag"></span></span>';
  else if (ingen) glyph = '<span aria-hidden="true" class="prick prick-ingen"></span>';
  return '<span class="statusprick">' + glyph + '<span class="statusprick-ord">' + esc(ord) + '</span></span>';
}

function romb(status) {
  var s = status || 'ej_nadd';
  var godkand = s === 'godkand' || s === 'godkand_med_villkor';
  var vantar = s === 'vantar';
  var retur = s === 'aterremiss';
  var kant = retur ? 'var(--rodbrun)' : godkand ? 'var(--teal)' : vantar ? 'var(--sand-mork)' : 'var(--dampad)';
  var fyll = godkand ? 'var(--teal)' : '#fff';
  var tecken = godkand ? '✓' : '';
  return '<span class="romb-wrap" aria-hidden="true"><span class="romb" style="border-color:' + kant + ';background:' + fyll + '">' + tecken + '</span></span>';
}

function chip(text, cls) { return '<span class="chip ' + (cls || '') + '">' + text + '</span>'; }
function mockChip() { return chip('MOCK', 'chip-mock'); }
function exempelMockChip() { return chip('EXEMPEL — MOCK', 'chip-mock'); }
function knappInaktiv(text) { return '<button type="button" aria-disabled="true" class="knapp knapp-inaktiv">' + esc(text) + '</button>'; }

function blockHtml(lista) {
  return (lista || []).map(function (b) {
    if (b.t === 'h1') return '<h2 class="panelrubrik" style="font-size:22px;line-height:30px;margin:0 0 16px">' + esc(b.text) + '</h2>';
    if (b.t === 'h2') return '<h3 class="panelrubrik">' + esc(b.text) + '</h3>';
    if (b.t === 'li') return '<p style="margin:0 0 8px 16px;font-size:15px;line-height:24px;color:var(--brod);max-width:680px;border-left:1px solid var(--linje);padding-left:12px">' + esc(b.text) + '</p>';
    if (b.t === 'kod') return '<pre style="margin:0 0 12px;padding:12px 16px;border:1px solid var(--linje);border-radius:6px;background:var(--yta-2);font-family:var(--mono);font-size:14px;line-height:20px;color:var(--blick);overflow:auto">' + esc(b.text) + '</pre>';
    return '<p style="margin:0 0 12px;font-size:15px;line-height:24px;color:var(--brod);max-width:680px">' + esc(b.text) + '</p>';
  }).join('');
}

function tabellHuvud(kolumner) {
  return '<thead><tr>' + kolumner.map(function (k) {
    var attr = k.kol ? ' data-kol="' + k.kol + '"' : '';
    var align = k.hoger ? ' style="text-align:right"' : '';
    return '<th scope="col"' + attr + align + '>' + esc(k.namn) + '</th>';
  }).join('') + '</tr></thead>';
}

function tomtLage(rubrik, forklaring, kommando, atgardHtml) {
  return '<div class="tomtlage"><h2 class="panelrubrik" style="font-size:22px;line-height:30px;margin:0 0 8px">' + esc(rubrik) + '</h2>' +
    (forklaring ? '<p style="margin:0 0 16px;font-size:15px;line-height:24px;color:var(--brod)">' + forklaring + '</p>' : '') +
    (kommando ? '<div class="kommandoruta">' + esc(kommando) + '</div>' : '') +
    (atgardHtml ? '<p style="margin:16px 0 0">' + atgardHtml + '</p>' : '') + '</div>';
}

/* ---------- tillstånd ---------- */

var state = {
  filter: { status: 'alla', uppskattning: 'alla', beroenden: 'alla' },
  korfilter: { projekt: 'alla', status: 'alla', dataklass: 'alla', period: 'alla' },
  lastFocus: null,
  drawerOrModalOpen: false,
  focusTrapCleanup: null
};

document.addEventListener('focusin', function (e) {
  if (e.target.closest('[data-drawer]') || e.target.closest('[role="dialog"]')) return;
  state.lastFocus = e.target;
});

function satFilter(grupp, nyckel, varde) {
  state[grupp][nyckel] = varde;
  render();
}

/* ---------- tidslinje ---------- */

function tidslinjeRader(k, valdSteg, valdGrind) {
  var korda = {}; (k.steg || []).forEach(function (s) { korda[s.nummer] = s; });
  var grindar = {}; (k.grindar || []).forEach(function (g) { grindar[g.id] = g; });
  var efter = { 1: 'G1', 2: 'G2', 8: 'G3', 9: 'G4' };
  var rader = [];
  M.PROCESS.forEach(function (p) {
    var s = korda[p.nummer];
    var agenter = s
      ? [s.agent].concat(s.granskare ? [Object.assign({}, s.granskare, { roll: 'granskning' })] : [])
      : p.agenter.map(function (id) { var a = M.AGENTER.find(function (x) { return x.id === id; }) || {}; return { id: id, namn: a.namn, pool: a.pool, familj: a.familj }; });
    var vald = !valdGrind && String(valdSteg) === String(p.nummer);
    rader.push({
      typ: 'steg', nummer: p.nummer, namn: p.namn, status: s ? s.status : 'vantar', vald: vald,
      agenter: agenter, varv: s ? ('varv ' + s.varv + ' av ' + s.max_varv) : '',
      fot: p.ur_processdefinition ? 'ur processdefinitionen' : '',
      rutt: '#/korning/' + k.korning_id + '?steg=' + p.nummer
    });
    var gid = efter[p.nummer];
    if (gid) {
      var gd = M.GRINDAR_DEF.find(function (x) { return x.id === gid; });
      var g = grindar[gid] || { id: gid, status: 'ej_nadd', ar_mock: true };
      var vg = valdGrind === gid;
      rader.push({
        typ: 'grind', id: gid, namn: gd.namn, status: g.status, beslut: GRINDORD[g.status] || g.status,
        mock: g.status !== 'ej_nadd', vald: vg, rutt: '#/korning/' + k.korning_id + '?grind=' + gid
      });
      if (gid === 'G2') rader.push({ typ: 'avdelare' });
    }
  });
  if (!rader.some(function (r) { return r.vald; })) {
    var f = rader.find(function (r) { return r.typ !== 'avdelare'; });
    if (f) f.vald = true;
  }
  return rader;
}

function renderTidslinjeRad(rad, i) {
  if (rad.typ === 'avdelare') {
    return '<li><div class="tidslinje-avdelare">Ej kört i demot — körs i en senare etapp</div></li>';
  }
  if (rad.typ === 'steg') {
    var agentHtml = rad.agenter.map(function (a) {
      return '<span style="display:flex;flex-wrap:wrap;gap:8px;margin-top:4px;align-items:center">' +
        '<a href="#/agenter?agent=' + esc(a.id) + '" class="chip chip-mono">' + esc(a.id) + ' · ' + esc(a.namn || '') + '</a>' +
        '<span style="font-size:13px;line-height:16px;color:var(--brod)">pool ' + esc(a.pool || '—') + ' · ' + esc(a.familj || '—') + '</span>' +
        (a.roll ? '<span style="font-size:13px;line-height:16px;color:var(--brod)">' + esc(a.roll) + '</span>' : '') +
        '</span>';
    }).join('');
    return '<li><a class="tidslinje-rad" data-tlrad href="' + esc(rad.rutt) + '" tabindex="' + (rad.vald ? 0 : -1) + '"' +
      (rad.vald ? ' aria-current="true"' : '') + ' style="--navkant:' + (rad.vald ? 'var(--teal)' : 'transparent') + '">' +
      '<span style="flex:none;width:28px;text-align:center;font-family:var(--mono);font-size:14px;line-height:22px;color:var(--brod)">' + rad.nummer + '</span>' +
      '<span style="flex:1;min-width:0">' +
      '<span style="display:flex;align-items:center;justify-content:space-between;gap:8px">' +
      '<span style="font-size:16px;line-height:22px;font-weight:600;color:var(--blick)">' + esc(rad.namn) + '</span>' +
      statusPrick(rad.status) + '</span>' + agentHtml +
      '<span style="display:block;font-size:13px;line-height:16px;color:var(--brod);margin-top:4px">' + esc(rad.varv) + (rad.fot ? ' · ' + esc(rad.fot) : '') + '</span>' +
      '</span></a></li>';
  }
  // grind
  return '<li><a class="tidslinje-rad tidslinje-rad-grind" data-tlrad href="' + esc(rad.rutt) + '" tabindex="' + (rad.vald ? 0 : -1) + '"' +
    (rad.vald ? ' aria-current="true"' : '') + ' style="--navkant:' + (rad.vald ? 'var(--teal)' : 'transparent') + '">' +
    '<span style="flex:none;width:28px;display:flex;justify-content:center">' + romb(rad.status) + '</span>' +
    '<span style="flex:1;min-width:0">' +
    '<span style="display:block;font-size:15px;line-height:22px;font-weight:600;color:var(--blick)">' + esc(rad.id) + ' · ' + esc(rad.namn) + '</span>' +
    '<span style="display:flex;gap:8px;align-items:center;margin-top:2px">' +
    '<span style="font-size:13px;line-height:16px;color:var(--brod)">' + esc(rad.beslut) + '</span>' +
    (rad.mock ? '<span class="chip chip-mock chip-sm">MOCK</span>' : '') +
    '</span></span></a></li>';
}

function tangenthantering(e) {
  var lista = e.currentTarget;
  var rader = Array.prototype.slice.call(lista.querySelectorAll('[data-tlrad]'));
  var i = rader.indexOf(document.activeElement);
  var n = -1;
  if (e.key === 'ArrowDown') n = Math.min(rader.length - 1, i + 1);
  else if (e.key === 'ArrowUp') n = Math.max(0, i - 1);
  else if (e.key === 'Home') n = 0;
  else if (e.key === 'End') n = rader.length - 1;
  if (n >= 0) {
    e.preventDefault();
    rader[n].focus({ preventScroll: true });
    rader[n].scrollIntoView({ block: 'nearest' });
  }
}

/* ---------- fokushantering: drawer/modal (C5) ---------- */

function installFocusTrap(container) {
  function onKeydown(e) {
    if (e.key !== 'Tab') return;
    var focusables = Array.prototype.slice.call(container.querySelectorAll('button, a[href], input, [tabindex]:not([tabindex="-1"])'))
      .filter(function (el) { return el.offsetParent !== null; });
    if (!focusables.length) return;
    var first = focusables[0], last = focusables[focusables.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  }
  container.addEventListener('keydown', onKeydown);
  return function () { container.removeEventListener('keydown', onKeydown); };
}

function closeHashFor(route) {
  var q = Object.assign({}, route.query);
  delete q.modal; delete q.story; delete q.agent;
  return buildHash(route.vy, route.rest, q);
}

document.addEventListener('keydown', function (e) {
  if (e.key !== 'Escape') return;
  var route = parseHash(location.hash);
  if (route.query.modal === '1' || route.query.story || route.query.agent) {
    location.hash = closeHashFor(route);
  }
});

/* ---------- körningar-filter (C4a) ---------- */

function korningDataklass(id) {
  var mk = M.MOCK_KORNINGAR.find(function (m) { return m.korning_id === id; });
  return mk ? mk.dataklass : null;
}
function withinPeriod(startadStr, dagar) {
  if (!startadStr || dagar === 'alla') return true;
  var t = Date.parse(startadStr.replace(' ', 'T') + 'Z');
  if (isNaN(t)) return true;
  var ms = (dagar === '7' ? 7 : 30) * 24 * 3600 * 1000;
  return (DEMO_NU - t) <= ms && t <= DEMO_NU;
}

/* ---------- vy-byggare ---------- */


function beraknaFlodeLage(korning, tomt) {
  var stegStatus = {};
  var grindStatus = { G1: 'ej_nadd', G2: 'ej_nadd', G3: 'ej_nadd', G4: 'ej_nadd' };
  var i;
  for (i = 0; i <= 12; i++) stegStatus[i] = tomt ? 'ej' : 'ej';
  if (!tomt && korning) {
    (korning.steg || []).forEach(function (s) {
      if (s.status === 'klar') stegStatus[s.nummer] = 'klar';
      else if (s.status === 'kor') stegStatus[s.nummer] = 'kor';
      else if (s.status === 'overhoppad') stegStatus[s.nummer] = 'ej';
      else if (s.status === 'blockerad' || s.status === 'fel') stegStatus[s.nummer] = s.status === 'fel' ? 'fel' : 'blockerad';
      else stegStatus[s.nummer] = 'vantar';
    });
    (korning.grindar || []).forEach(function (g) {
      grindStatus[g.id] = g.status || 'ej_nadd';
    });
    // Framtida steg som saknas i indexet förblir ej
    for (i = 0; i <= 12; i++) {
      if (stegStatus[i] === 'ej') {
        var finns = (korning.steg || []).some(function (s) { return s.nummer === i; });
        if (!finns) stegStatus[i] = 'ej';
      }
    }
  }
  // "Du är här": första väntande grind, annars körande steg, annars första ej-klara steg efter klara
  var har = null;
  var grindOrdning = ['G1', 'G2', 'G3', 'G4'];
  for (i = 0; i < grindOrdning.length; i++) {
    var gid = grindOrdning[i];
    if (grindStatus[gid] === 'vantar') { har = { typ: 'grind', id: gid }; break; }
  }
  if (!har) {
    for (i = 0; i <= 12; i++) {
      if (stegStatus[i] === 'kor' || stegStatus[i] === 'blockerad' || stegStatus[i] === 'fel') {
        har = { typ: 'steg', id: i }; break;
      }
    }
  }
  if (!har && !tomt) {
    for (i = 0; i <= 12; i++) {
      if (stegStatus[i] !== 'klar') { har = { typ: 'steg', id: i }; break; }
    }
  }
  return { stegStatus: stegStatus, grindStatus: grindStatus, har: har };
}

function flodesNodSteg(nr, namn, klass, harHar, korningId) {
  var href = korningId ? '#/korning/' + korningId + '?steg=' + nr : '#/oversikt';
  var etikett = harHar ? '<span class="flode-har-etikett">Du är här</span>' : '';
  var cls = 'flode-nod ' + klass + (harHar ? ' har' : '');
  return '<a class="' + cls + '" href="' + href + '" aria-current="' + (harHar ? 'true' : 'false') + '">' +
    etikett +
    '<span class="flode-nod-ruta"><strong>' + nr + '</strong>' + esc(namn) + '</span></a>';
}

function flodesNodGrind(gid, klass, harHar, korningId) {
  var href = '#/grind/' + gid;
  var etikett = harHar ? '<span class="flode-har-etikett">Du är här</span>' : '';
  var cls = 'flode-nod grind ' + klass + (harHar ? ' har' : '');
  var aria = harHar ? 'true' : 'false';
  return '<a class="' + cls + '" href="' + href + '" aria-current="' + aria + '" title="' + gid + '">' +
    etikett +
    '<span class="flode-nod-ruta"><strong>' + gid + '</strong></span></a>';
}

function flodesKlassSteg(status) {
  if (status === 'klar') return 'klar';
  if (status === 'kor') return 'kor';
  if (status === 'vantar') return 'vantar';
  if (status === 'blockerad' || status === 'fel') return 'vantar';
  return 'ej';
}
function flodesKlassGrind(status) {
  if (status === 'godkand' || status === 'godkand_med_villkor') return 'klar';
  if (status === 'vantar' || status === 'aterremiss') return 'vantar';
  return 'ej';
}

function flodesKarta(korning, tomt) {
  var lage = beraknaFlodeLage(korning, tomt);
  var kid = (!tomt && korning) ? korning.korning_id : HUVUDKORNING;
  var har = lage.har;
  function arHarSteg(n) { return har && har.typ === 'steg' && har.id === n; }
  function arHarGrind(g) { return har && har.typ === 'grind' && har.id === g; }

  var kort = {
    0: 'Intag', 1: 'Specgranskning', 2: 'Nedbrytning', 3: 'Kodning', 4: 'Enhetstester',
    5: 'Integrationstest', 6: 'Testdeploy', 7: 'Test av deploy', 8: 'Utfall & triage',
    9: 'QA & integration', 10: 'Prod-deploy', 11: 'Övervakning', 12: 'Återföring'
  };
  var grindNamn = { G1: 'Specgodkännande', G2: 'Backloggodkännande', G3: 'QA-godkännande', G4: 'Produktionsgodkännande' };

  function stegHref(n) { return '#/korning/' + kid + '?steg=' + n; }
  function grindHref(g) { return '#/grind/' + g; }

  var statusText = 'Ingen körning — processen visas tom.';
  if (!tomt && har) {
    if (har.typ === 'grind') {
      var gdef = (M.GRINDAR_DEF || []).find(function (x) { return x.id === har.id; });
      statusText = 'Du är vid ' + har.id + (gdef ? ' · ' + gdef.namn : '') + ' — väntar på mänskligt beslut.';
    } else {
      statusText = 'Du är vid steg ' + har.id + ' · ' + (kort[har.id] || '') + '.';
    }
  } else if (!tomt && korning && korning.status === 'klar') {
    statusText = 'Senaste körning: steg 0–2 klara. Nästa mänskliga punkt är G2.';
  }

  // Pixelzoner i originalbilden 1532×768 (nr/id, x1,y1,x2,y2)
  var stegZoner = [
    [0, 193, 230, 336, 294],
    [1, 349, 230, 512, 294],
    [2, 666, 230, 828, 293],
    [3, 981, 230, 1125, 295],
    [4, 1139, 230, 1283, 295],
    [5, 1296, 230, 1411, 294],
    [6, 1268, 485, 1411, 550],
    [7, 1110, 486, 1255, 550],
    [8, 932, 481, 1097, 551],
    [9, 617, 486, 782, 550],
    [10, 322, 486, 500, 550],
    [11, 193, 486, 320, 550]
  ];
  var grindZoner = [
    ['G1', 531, 229, 600, 294],
    ['G2', 846, 229, 916, 294],
    ['G3', 845, 485, 916, 551],
    ['G4', 531, 485, 600, 551]
  ];

  function svgLank(href, aria, x1, y1, x2, y2, markHar) {
    return '<a href="' + href + '"' + (markHar ? ' class="flode-zon-har"' : '') +
      ' aria-label="' + esc(aria) + '" title="' + esc(aria) + '">' +
      '<rect x="' + x1 + '" y="' + y1 + '" width="' + (x2 - x1) + '" height="' + (y2 - y1) + '"></rect></a>';
  }

  var out = '';
  out += '<section class="flode" aria-label="Processflöde med aktuell position">';
  out += '<div class="flode-huvud"><h2 class="sekrubrik" style="margin:0">Flödet · tolv steg, fyra grindar</h2>';
  out += '<div class="flode-legend" aria-hidden="true">' +
    '<span><span style="width:12px;height:12px;border:1px solid var(--teal);background:var(--teal);border-radius:2px;display:inline-block"></span> klart</span>' +
    '<span><span style="width:12px;height:12px;border:1px solid var(--sand-mork);background:var(--sand-ljus);border-radius:2px;display:inline-block"></span> här / väntar</span>' +
    '<span><span style="width:12px;height:12px;border:1px dashed var(--dampad);border-radius:2px;display:inline-block"></span> ej nått</span>' +
    '<span><span style="width:10px;height:10px;border:1px solid var(--teal);transform:rotate(45deg);display:inline-block"></span> grind</span>' +
    '</div></div>';
  out += '<p class="flode-statusrad" role="status">' + esc(statusText) + '</p>';

  out += '<div class="flode-bild-wrap">';
  out += '<img class="flode-bild" src="assets/flode-process.png" width="1532" height="768" alt="Processflöde: tolv steg, fyra grindar, tre loopar, en sluten cirkel">';
  out += '<svg class="flode-bild-svg" viewBox="0 0 1532 768" role="group" aria-label="Klickbara steg och grindar">';
  stegZoner.forEach(function (z) {
    var n = z[0];
    out += svgLank(stegHref(n), 'Steg ' + n + ' ' + (kort[n] || ''), z[1], z[2], z[3], z[4], arHarSteg(n));
  });
  grindZoner.forEach(function (z) {
    var g = z[0];
    out += svgLank(grindHref(g), 'Grind ' + g + ' ' + (grindNamn[g] || ''), z[1], z[2], z[3], z[4], arHarGrind(g));
  });
  out += '</svg>';

  if (!tomt && har) {
    var bx1, by1, bx2, by2;
    if (har.typ === 'grind') {
      var gz = null;
      for (var gi = 0; gi < grindZoner.length; gi++) {
        if (grindZoner[gi][0] === har.id) { gz = grindZoner[gi]; break; }
      }
      if (gz) { bx1 = gz[1]; by1 = gz[2]; bx2 = gz[3]; by2 = gz[4]; }
    } else {
      var sz = null;
      for (var si = 0; si < stegZoner.length; si++) {
        if (stegZoner[si][0] === har.id) { sz = stegZoner[si]; break; }
      }
      if (sz) { bx1 = sz[1]; by1 = sz[2]; bx2 = sz[3]; by2 = sz[4]; }
    }
    if (bx1 !== undefined) {
      var cx = ((bx1 + bx2) / 2 / 1532) * 100;
      var cy = (by1 / 768) * 100;
      out += '<span class="flode-bild-har" style="left:' + cx.toFixed(2) + '%;top:' + cy.toFixed(2) + '%">Du är här</span>';
    }
  }
  out += '</div>';

  out += '<p class="flode-bild-caption">Klicka ett steg eller en grind i bilden. ';
  if (har && har.typ === 'grind' && har.id === 'G2') {
    out += 'Aktuell position: <strong>G2 Backloggodkännande</strong> — väntar på beslut.';
  } else {
    out += 'Statusraden ovan speglar senaste EWS-körningen.';
  }
  out += '</p>';

  out += '<div class="flode-loopar flode-loop-chips" aria-label="Loopar">' +
    '<a class="flode-chip" href="' + stegHref(3) + '" title="L1 kodfel → kodning"><strong>L1</strong> kodfel · 8 → 3</a>' +
    '<a class="flode-chip" href="' + stegHref(4) + '" title="L2 testfel → enhetstester"><strong>L2</strong> testfel · 8 → 4</a>' +
    '<a class="flode-chip" href="' + stegHref(1) + '" title="L3 specfel → specgranskning"><strong>L3</strong> specfel · 8 → 1</a>' +
    '<a class="flode-chip" href="' + stegHref(0) + '" title="förbättringsförslag → intag"><strong>Sluten cirkel</strong> 11 → 0</a>' +
    '</div>';

  out += '<div class="flode-koer" aria-label="Köer och tasks">';
  out += '<h3 class="flode-koer-rubrik">Köer / tasks</h3>';
  out += '<div class="flode-fas-chips" aria-label="Faser">' +
    '<a class="flode-chip" href="' + stegHref(0) + '">Forma (0–2)</a>' +
    '<a class="flode-chip" href="' + stegHref(3) + '">Bygga (3–5)</a>' +
    '<a class="flode-chip" href="' + stegHref(6) + '">Leverera (6–9)</a>' +
    '<a class="flode-chip" href="' + stegHref(10) + '">Driva (10–12)</a>' +
    '</div>';

  out += '<h3 class="flode-koer-rubrik">Konkreta tasks i steg 2 (nedbrytning)</h3>';
  var stories = M.STORIES || [];
  var visaKo = !tomt && har && har.typ === 'grind' && har.id === 'G2';
  if (!tomt) {
    out += '<p class="flode-koer-intro">' +
      (visaKo
        ? 'G2 väntar — sex stories i kön att ta efter godkännande:'
        : 'Stories från steg 2 (nedbrytning):') +
      '</p>';
    out += '<ul class="flode-tasklista">';
    stories.forEach(function (s) {
      out += '<li><a href="#/stories?story=' + esc(s.id) + '" class="chip-mono">' + esc(s.id) + '</a> ' +
        '<a href="#/stories?story=' + esc(s.id) + '">' + esc(s.titel) + '</a>' +
        (s.uppskattning ? ' <span class="flode-task-meta">' + esc(s.uppskattning) + '</span>' : '') +
        '</li>';
    });
    out += '</ul>';
  } else {
    out += '<p class="flode-koer-intro">Ingen körning — ingen task-kö att visa.</p>';
  }
  out += '</div>';

  out += '<p class="flode-fot">Samma flöde som i processbilden. Den teala återföringen är poängen: driften producerar nästa intag.</p>';
  out += '</section>';
  return out;
}

function vyOversikt(route) {
  var tomt = route.query.tomt === '1';
  var out = '';
  out += '<h1 class="sidtitel">Översikt</h1>';
  out += '<p class="dek">Projekt och senaste körningar i repot <span style="font-family:var(--mono);font-size:14px">anderscarlius/smedjan-med-agenter</span>. Portalen läser Git och skriver ingenting.</p>';
  out += '<div style="display:flex;flex-wrap:wrap;gap:8px;margin-top:16px">' + chip('klass 0', 'chip-teal') + mockChip() + chip('commit 659afb6', 'chip-mono') + '</div>';
  out += '<hr class="avdelare">';

  var huvud = tomt ? null : findKorning(HUVUDKORNING);
  out += '<div style="margin-bottom:48px">' + flodesKarta(huvud, tomt) + '</div>';

  out += '<section style="margin-bottom:48px"><h2 class="sekrubrik">Projekt</h2><table data-def="1"><caption>Projekt i repot med senaste körning, steg, grindar, status och kostnad</caption>' +
    tabellHuvud([{ namn: 'PROJEKT' }, { namn: 'TITEL' }, { namn: 'DATAKLASS', kol: 'dataklass' }, { namn: 'SENASTE KÖRNING' }, { namn: 'STEG KLARA' }, { namn: 'GRINDAR' }, { namn: 'STATUS' }, { namn: 'KOSTNAD', hoger: true }]) +
    '<tbody>' + M.PROJEKT.map(function (p) {
      var grindstatus = tomt ? ['ej_nadd', 'ej_nadd', 'ej_nadd', 'ej_nadd'] : (p.grindstatus || ['ej_nadd', 'ej_nadd', 'ej_nadd', 'ej_nadd']);
      var rutt = p.korning_id ? '#/korning/' + p.korning_id + '?steg=0' : '#/oversikt';
      var harGrindar = !tomt && !!p.grindstatus;
      return '<tr data-rad><td style="height:48px"><a href="' + rutt + '" class="chip-mono" style="font-size:14px">' + esc(p.id) + '</a></td>' +
        '<td>' + esc(p.titel) + '</td>' +
        '<td data-kol="dataklass">' + chip('klass ' + p.dataklass, 'chip-teal') + '</td>' +
        '<td style="font-family:var(--mono);font-size:14px">' + esc(tomt ? '—' : p.senaste) + '</td>' +
        '<td>' + esc(tomt ? '—' : p.steg_klara) + '</td>' +
        '<td><span style="display:inline-flex;align-items:center;gap:4px">' + (harGrindar ? grindstatus.map(function (s) { return romb(s); }).join('') : '') + '<span style="font-size:14px">' + esc(tomt ? '—' : p.grindar) + '</span></span></td>' +
        '<td data-status="1">' + statusPrick(tomt ? 'ingen_korning' : p.status) + '</td>' +
        '<td style="text-align:right;font-family:var(--mono);font-size:14px">' + esc(tomt ? '—' : p.kostnad) + '</td></tr>';
    }).join('') + '</tbody></table></section>';

  if (tomt) {
    out += tomtLage('Ingen körning hittad', 'Portalen läser <span style="font-family:var(--mono);font-size:14px">korningar/&lt;projekt&gt;/korning.json</span>. Ingen sådan fil finns i repot ännu.', 'python -m orkestrering demo ews', '<a href="#/installningar">Läs om datakällor →</a>');
  } else {
    out += '<section style="margin-bottom:48px"><h2 class="sekrubrik">Senaste körningar</h2><table data-def="1" data-kompakt="1"><caption>De fem senaste körningarna i repot, senaste först</caption>' +
      tabellHuvud([{ namn: 'KÖRNING' }, { namn: 'PROJEKT' }, { namn: 'STARTAD' }, { namn: 'VARAKTIGHET', kol: 'varaktighet' }, { namn: 'STEG' }, { namn: 'STATUS' }, { namn: 'BACKEND' }, { namn: 'COMMIT', kol: 'commit' }]) +
      '<tbody>' + M.KORNINGSLISTA.map(function (k) {
        return '<tr data-rad><td style="height:48px"><a href="#/korning/' + k.id + '?steg=0" class="chip-mono" style="font-size:14px">' + esc(k.id) + '</a></td>' +
          '<td style="font-family:var(--mono);font-size:14px">' + esc(k.projekt) + '</td>' +
          '<td style="font-family:var(--mono);font-size:14px">' + esc(k.startad) + '</td>' +
          '<td data-kol="varaktighet" style="font-family:var(--mono);font-size:14px">' + esc(k.varaktighet) + '</td>' +
          '<td>' + esc(k.steg) + '</td>' +
          '<td data-status="1">' + statusPrick(k.status) + '</td>' +
          '<td>' + chip('mock', 'chip-mock') + '</td>' +
          '<td data-kol="commit" style="font-family:var(--mono);font-size:14px">' + esc(k.commit) + '</td></tr>';
      }).join('') + '</tbody></table><p style="margin:16px 0 0"><a href="#/korningar">Alla körningar och filter →</a></p></section>';

    out += '<section style="margin-bottom:48px"><h2 class="sekrubrik">Väntar på människa</h2><ul style="list-style:none;margin:0;padding:0;border-top:1px solid var(--linje)">' +
      '<li style="border-bottom:1px solid var(--linje);padding:16px 12px;display:flex;gap:12px;align-items:flex-start">' + romb('vantar') +
      '<div style="flex:1;min-width:0"><div style="font-size:15px;font-weight:600;color:var(--blick)">G2 · Backloggodkännande — väntar på beslut</div>' +
      '<p style="margin:4px 0 0;font-size:14px;line-height:20px;color:var(--brod);max-width:680px">Quorum: projektledning + utvecklare + verksamhetsrepresentant. Underlag: <span style="font-family:var(--mono)">steg2/stories-v1.yaml</span>, <span style="font-family:var(--mono)">steg2/tackning.md</span>.</p>' +
      '<p style="margin:8px 0 0"><a href="#/grind/G2">Öppna grind →</a></p></div></li>' +
      '<li style="border-bottom:1px solid var(--linje);border-left:3px solid var(--rodbrun);padding:16px 12px">' +
      '<div style="font-size:15px;font-weight:600;color:var(--blick)">S5 · steg 2 stannade efter 3 varv i <span style="font-family:var(--mono);font-size:14px">ews-2026-09-03T11-04-52Z</span></div>' +
      '<p style="margin:4px 0 0;font-size:14px;line-height:20px;color:var(--brod);max-width:680px">Max tre varv per agentloop. En människa kopplas in.</p>' +
      '<p style="margin:8px 0 0"><a href="#/korning/ews-2026-09-03T11-04-52Z?steg=2">Öppna körning →</a></p></li></ul></section>';
  }

  out += '<div class="notrad">Demot kör steg 0–2 på mockad motor. Steg 3–12 finns i processen och visas nedtonade — de körs i en senare etapp.</div>';
  return out;
}

function vyKorningsdetalj(route) {
  var k = findKorning(route.rest);
  if (!k) {
    return tomtLage('Ingen körning hittad', 'Portalen läser <span style="font-family:var(--mono);font-size:14px">korningar/&lt;projekt&gt;/korning.json</span>.', 'python -m orkestrering demo ews', '<a href="#/oversikt">Till översikten →</a>');
  }
  var valdGrind = route.query.grind || '';
  var modalOpen = route.query.modal === '1';
  var valdSteg = valdGrind ? null : (route.query.steg !== undefined ? route.query.steg : '0');
  var rader = tidslinjeRader(k, valdSteg, valdGrind);
  var stegObj = (k.steg || []).find(function (s) { return String(s.nummer) === String(valdSteg); });

  var out = '<div class="detalj">';
  out += '<div class="tidslinje">';
  out += '<div class="tidslinje-huvud"><div style="font-family:var(--mono);font-size:14px;color:var(--blick)">' + esc(k.korning_id) + '</div>' +
    '<h1 style="font-family:var(--serif);font-size:20px;line-height:28px;color:var(--blick);margin:8px 0 12px">' + esc(k.titel) + '</h1>' +
    '<div style="display:flex;flex-wrap:wrap;gap:8px;margin-bottom:12px">' + chip('klass ' + k.dataklass, 'chip-teal') + mockChip() + chip('0 USD', 'chip-mono') + '</div>' +
    '<div style="font-family:var(--mono);font-size:14px;color:var(--blick)">startad ' + esc(tid(k.startad)) + '</div>' +
    '<div style="font-family:var(--mono);font-size:14px;color:var(--blick);margin-bottom:8px">avslutad ' + esc(tid(k.avslutad)) + '</div>' +
    statusPrick(k.status) + '</div>';
  out += '<ul role="list" class="tidslinje-lista" aria-label="Tidslinje steg 0–12 med grindar" data-tidslinje-lista>' +
    rader.map(renderTidslinjeRad).join('') + '</ul></div>';

  out += '<div class="detalj-hoger">';
  if (k.blockering) {
    out += '<div role="alert" class="varningsrad" style="margin-bottom:24px"><h2 class="panelrubrik" style="font-size:17px;margin:0 0 4px">' + esc(k.blockering.rubrik) + '</h2>' +
      '<p style="margin:0;font-size:15px;color:var(--blick);max-width:680px">' + esc(k.blockering.text) + '</p></div>';
    out += '<section style="margin-bottom:24px"><h3 class="panelrubrik" style="margin:0 0 8px">Varvhistorik (MOCK)</h3><ul style="list-style:none;margin:0;padding:0;border-top:1px solid var(--linje)">' +
      (k.blockering.varvhistorik || []).map(function (vh) {
        return '<li style="border-bottom:1px solid var(--linje);padding:12px 0;display:flex;gap:16px"><span style="font-family:var(--mono);font-size:14px;color:var(--blick);flex:none">varv ' + vh.varv + '</span><span style="font-family:var(--mono);font-size:14px;color:var(--blick);flex:none">' + esc(vh.tid) + '</span><span style="font-size:15px;color:var(--brod)">' + esc(vh.motivering) + '</span></li>';
      }).join('') + '</ul></section>';
  }

  if (valdGrind) {
    var g = resolveGrind(valdGrind, k);
    if (!g) {
      out += '<div class="tomtlage"><h2 class="panelrubrik" style="font-size:22px;margin:0 0 8px">Ingen grind hittad</h2></div>';
    } else {
      out += grindInnehallInline(g, k, route);
    }
  } else if (stegObj) {
    var ut = stegObj.ut && stegObj.ut[0];
    var art = ut ? M.ARTEFAKTER[ut.path] : null;
    var prov = artefaktProveniens(stegObj, stegObj.agent);
    out += '<div style="flex:1;min-width:0">' +
      '<div style="font-size:13px;color:var(--brod);font-family:var(--mono)">Körningar / ews / ' + esc(k.korning_id) + ' / steg ' + stegObj.nummer + ' / ' + esc(art ? art.filnamn : '—') + '</div>' +
      '<div style="display:flex;align-items:baseline;gap:16px;flex-wrap:wrap;margin-top:8px"><span style="font-family:var(--mono);font-size:15px;color:var(--blick)">' + esc(art ? art.filnamn : '—') + '</span>' +
      (art ? '<a href="#/artefakt/' + esc(art.path) + '">Öppna helsida →</a>' : '') + '</div>' +
      '<div style="display:flex;flex-wrap:wrap;gap:8px;margin-top:12px">' + (art ? art.frontmatter.map(function (fm) { return chip(esc(fm), 'chip-mono'); }).join('') : '') + '</div>' +
      '<hr class="avdelare" style="margin:16px 0 24px">' +
      '<div style="max-width:760px">' + blockHtml(art ? art.block : []) + '</div></div>';
    out += '<div style="position:sticky;bottom:0;background:#fff;border:1px solid var(--linje);border-radius:6px;padding:16px;margin-top:24px"><h3 class="panelrubrik" style="margin:0 0 8px">Proveniens</h3>';
    if (prov) {
      out += '<p style="margin:0 0 4px;font-size:14px;color:var(--blick)">' + esc(prov.rad1) + '</p>' +
        '<p style="margin:0 0 4px;font-family:var(--mono);font-size:14px;color:var(--blick)">' + esc(prov.konfig) + '</p>' +
        '<p style="margin:0 0 8px;font-family:var(--mono);font-size:14px;color:var(--blick)">in: ' + esc(prov.in) + ' → ut: ' + esc(prov.ut) + '</p>' +
        '<div style="display:flex;gap:8px;flex-wrap:wrap">' + chip(esc(prov.stub), 'chip-mock') + chip(esc(prov.varv), 'chip-mono') + '<a href="' + prov.agentrutt + '" style="font-size:14px">Öppna agenten →</a></div>';
    } else {
      out += '<p style="margin:0;font-size:15px;color:var(--brod)">Ingen proveniens — steget är inte kört.</p>';
    }
    out += '</div>';
  } else {
    var p = M.PROCESS.find(function (x) { return String(x.nummer) === String(valdSteg); });
    if (!p) {
      out += '<div class="tomtlage"><h2 class="panelrubrik" style="font-size:22px;margin:0 0 8px">Steget finns inte i processen</h2><p style="margin:0;font-size:15px;color:var(--brod)">Ingen data visas — hellre tomt än gissat.</p></div>';
    } else {
      var a0 = M.AGENTER.find(function (a) { return a.id === p.agenter[0]; }) || {};
      out += '<div style="flex:1;min-width:0;max-width:760px"><h2 class="sekrubrik" style="margin:0 0 8px">Steg ' + p.nummer + ' · ' + esc(p.namn) + '</h2>' + statusPrick('vantar') +
        '<h3 class="panelrubrik">Vad steget kommer producera</h3><table data-def="1"><caption>Artefakter steget producerar enligt processdefinitionen</caption>' +
        tabellHuvud([{ namn: 'UR PROCESSDEFINITIONEN' }]) + '<tbody><tr><td>' + esc(a0.producerar || '—') + '</td></tr></tbody></table>' +
        '<p style="margin:16px 0 0;font-size:15px;color:var(--blick)">Agent: <a href="#/agenter?agent=' + esc(a0.id || '') + '">' + esc((a0.id || '—') + ' ' + (a0.namn || '')) + '</a> · pool ' + esc(a0.pool || '—') + '</p>' +
        '<div class="notrad" style="margin-top:24px">Steget har inte körts. Ingen artefakt finns. Körs i en senare etapp.</div></div>' +
        '<div style="position:sticky;bottom:0;background:#fff;border:1px solid var(--linje);border-radius:6px;padding:16px;margin-top:24px"><h3 class="panelrubrik" style="margin:0 0 4px">Proveniens</h3><p style="margin:0;font-size:15px;color:var(--brod)">Ingen proveniens — steget är inte kört.</p></div>';
    }
  }
  out += '</div></div>';

  if (modalOpen) {
    var gm = resolveGrind(valdGrind, k);
    out += renderGrindModal(gm, k, route);
  }
  return out;
}

function artefaktProveniens(steg, agent) {
  if (!steg || !agent) return null;
  var ut = (steg.ut && steg.ut[0]) || null;
  return {
    rad1: 'Producerad av ' + agent.id + ' ' + agent.namn + ' · pool ' + agent.pool + ' · familj ' + agent.familj + ' · mock · ' + steg.kostnad.tokens_in + ' tokens in / ' + steg.kostnad.tokens_ut + ' ut · 0,00 USD · ' + tid(steg.startad),
    konfig: 'konfig: ' + agent.modell + ' · ur .smedjan/agents.yaml @659afb6 · ögonblicksbild, byts utan omdesign',
    in: (steg.in && steg.in[0] && steg.in[0].path) || '—',
    ut: (ut && ut.path) || '—',
    stub: agent.ar_stub ? 'stub: ja' : 'stub: nej',
    varv: 'varv ' + steg.varv + ' av ' + steg.max_varv,
    agentrutt: '#/agenter?agent=' + agent.id
  };
}

function forifylltBanner(g) {
  var visaForifyllt = (g.status === 'godkand' || g.status === 'godkand_med_villkor') && g.ar_mock;
  var text = visaForifyllt ? 'Detta beslut är förifyllt för demo. Ingen agent passerar en grind.' : 'Ingen agent passerar en grind.';
  return '<div class="notrad">' + esc(text) + '</div>';
}

function grindVillkorHtml(gVillkor) {
  return gVillkor.map(function (vk) {
    return '<label style="display:flex;gap:12px;align-items:flex-start;padding:8px 0;font-size:15px;color:var(--blick);max-width:680px"><input type="checkbox"><span>' + esc(vk) + '</span></label>';
  }).join('');
}

function grindQuorumTabell(g, gd) {
  var gHarBeslut = g.status !== 'vantar' && g.status !== 'ej_nadd';
  var gQuorum = gd.quorumrader.map(function (roll) { return { roll: roll, namn: '—', beslut: '—', tid: '—' }; });
  var rows = gQuorum.map(function (q) {
    return '<tr><td>' + esc(q.roll) + '</td><td style="font-family:var(--mono);font-size:14px">' + esc(q.namn) + '</td><td style="font-family:var(--mono);font-size:14px">' + esc(q.beslut) + '</td><td style="font-family:var(--mono);font-size:14px">' + esc(q.tid) + '</td></tr>';
  }).join('');
  if (gHarBeslut) {
    rows += '<tr><td style="border-left:3px solid var(--sand-mork)">demo</td><td>' + esc(g.beslutsfattare || '—') + ' ' + chip('MOCK', 'chip-mock chip-sm') + '</td>' +
      '<td>' + esc(BESLUT_TEXT[g.status] || (GRINDORD[g.status] || g.status)) + '</td><td style="font-family:var(--mono);font-size:14px">' + esc(g.tidpunkt ? tid(g.tidpunkt) : '—') + '</td></tr>';
  }
  return '<table data-def="1"><caption>Quorum och registrerade beslut för grinden</caption>' +
    tabellHuvud([{ namn: 'ROLL' }, { namn: 'NAMN' }, { namn: 'BESLUT' }, { namn: 'TID' }]) + '<tbody>' + rows + '</tbody></table>';
}

function grindInnehallInline(g, k, route) {
  var gd = M.GRINDAR_DEF.find(function (x) { return x.id === g.id; });
  var gVillkor = (g.rekommendation && g.rekommendation.villkor) || [];
  var gCitat = (g.rekommendation && g.rekommendation.citat) || '—';
  var gAgentId = (g.rekommendation && g.rekommendation.fran_agent) || '—';
  var gAg = M.AGENTER.find(function (a) { return a.id === gAgentId; }) || {};
  var gAgentRad = gAgentId + ' · pool ' + (gAg.pool || '—') + ' · familj ' + (gAg.familj || '—') + ' · mock';
  var modalRutt = '#/korning/' + k.korning_id + '?grind=' + g.id + '&modal=1';
  var out = '<div style="flex:1;min-width:0;max-width:760px">';
  out += '<h2 class="sekrubrik" style="margin:0 0 8px">' + esc(g.id) + ' · ' + esc(gd.namn) + '</h2>';
  out += '<p style="margin:0 0 12px;font-size:15px;color:var(--brod);max-width:680px">' + esc(gd.fraga) + '</p>';
  out += forifylltBanner(g);
  out += '<h3 class="panelrubrik">Rekommendation från ' + esc(gAgentId) + ' ' + esc(gAg.namn || '') + '</h3>';
  out += '<blockquote style="margin:0;border-left:3px solid var(--teal);padding:8px 16px;font-family:var(--serif);font-size:17px;line-height:26px;font-style:italic;color:var(--blick)">' + esc(gCitat) + '</blockquote>';
  out += '<p style="margin:8px 0 0;font-family:var(--mono);font-size:14px;color:var(--blick)">' + esc(gAgentRad) + '</p>';
  out += '<p style="margin:8px 0 0;font-size:14px;color:var(--brod)">Rekommendationen är ett underlag. Beslutet är människans.</p>';
  out += '<h3 class="panelrubrik">Villkor</h3>' + grindVillkorHtml(gVillkor);
  out += '<p style="margin:8px 0 0;font-size:14px;color:var(--brod)">Avbockning sparas inte i demot.</p>';
  out += '<h3 class="panelrubrik">Beslut och quorum</h3>' + grindQuorumTabell(g, gd);
  out += '<div style="border-top:1px solid var(--linje);margin-top:24px;padding-top:16px"><div style="display:flex;gap:8px;flex-wrap:wrap">' +
    knappInaktiv('Godkänn') + knappInaktiv('Godkänn med villkor') + knappInaktiv('Retur till steg 0') + knappInaktiv('Avslå') + '</div>' +
    '<p style="margin:12px 0 0;font-size:14px;color:var(--blick)">Beslut fattas i Git i etapp 0. Portalen skriver beslutet när grindarna flyttar in i portalen i en senare etapp.</p>' +
    '<p style="margin:8px 0 0"><a href="#/grind/' + esc(g.id) + '">Öppna grindbeslutet som helsida →</a> · <a href="' + modalRutt + '">Öppna som modal →</a></p></div>';
  out += '</div>';
  out += '<div style="position:sticky;bottom:0;background:#fff;border:1px solid var(--linje);border-radius:6px;padding:16px;margin-top:24px"><h3 class="panelrubrik" style="margin:0 0 4px">Rekommendation</h3>' +
    '<p style="margin:0;font-size:14px;color:var(--blick)">' + esc(gAgentRad) + ' — ' + esc(gCitat) + '</p></div>';
  return out;
}

function renderGrindModal(g, k, route) {
  var gInlineRutt = '#/korning/' + k.korning_id + '?grind=' + (route.query.grind || '') ;
  if (!g) {
    return '<div class="modal-bakgrund"><div role="dialog" aria-modal="true" aria-label="Grind" class="modal"><div class="modal-huvud"><span style="font-family:var(--serif);font-size:22px;color:var(--blick)">Ingen grind hittad</span><a href="' + gInlineRutt + '">Stäng</a></div><div style="padding:24px"><p>Okänt grind-id.</p><p><a href="' + gInlineRutt + '">Stäng</a></p></div></div></div>';
  }
  var gd = M.GRINDAR_DEF.find(function (x) { return x.id === g.id; });
  var gVillkor = (g.rekommendation && g.rekommendation.villkor) || [];
  var gCitat = (g.rekommendation && g.rekommendation.citat) || '—';
  var gAgentId = (g.rekommendation && g.rekommendation.fran_agent) || '—';
  gInlineRutt = '#/korning/' + k.korning_id + '?grind=' + g.id;
  var out = '<div class="modal-bakgrund"><div role="dialog" aria-modal="true" aria-label="' + esc(g.id + ' · ' + gd.namn) + '" class="modal">';
  out += '<div class="modal-huvud"><span style="font-family:var(--serif);font-size:22px;color:var(--blick)">' + esc(g.id) + ' · ' + esc(gd.namn) + '</span><a href="' + gInlineRutt + '">Stäng</a></div>';
  out += '<div style="padding:24px">';
  out += forifylltBanner(g);
  out += '<blockquote style="margin:24px 0 0;border-left:3px solid var(--teal);padding:8px 16px;font-family:var(--serif);font-size:17px;line-height:26px;font-style:italic;color:var(--blick)">' + esc(gCitat) + '</blockquote>';
  out += '<p style="margin:8px 0 16px;font-family:var(--mono);font-size:14px;color:var(--blick)">' + esc(gAgentId) + '</p>';
  out += grindVillkorHtml(gVillkor);
  out += '<p style="margin:8px 0 16px;font-size:14px;color:var(--brod)">Avbockning sparas inte i demot.</p>';
  out += '<div style="display:flex;gap:8px;flex-wrap:wrap;border-top:1px solid var(--linje);padding-top:16px">' +
    knappInaktiv('Godkänn') + knappInaktiv('Godkänn med villkor') + knappInaktiv('Retur till steg 0') + knappInaktiv('Avslå') + '</div>';
  out += '<p style="margin:12px 0 0;font-size:14px;color:var(--blick)">Beslut fattas i Git i etapp 0. Portalen skriver beslutet när grindarna flyttar in i portalen i en senare etapp.</p>';
  out += '<p style="margin:16px 0 0"><a href="' + gInlineRutt + '">Stäng</a></p></div></div></div>';
  return out;
}

function vyArtefakt(route) {
  var art = findArtefakt(route.rest);
  if (!art) {
    return tomtLage('Filen finns inte i den här commiten.', '', '', '<a href="#/korningar">Till körningar →</a>');
  }
  var utfallt = route.query.relationer === '1';
  var rel = M.RELATIONER[art.path] || { in: [], ut: [], versioner: [] };
  var aIn = rel.in.map(function (x) { return Object.assign({}, x, { rutt: '#/artefakt/' + x.path, filnamn: x.path.split('/').pop() }); });
  var aUt = (utfallt ? rel.ut : rel.ut.slice(0, 4)).map(function (x) {
    return Object.assign({}, x, { rutt: x.path.indexOf('G1/beslut.md') > -1 ? '#/grind/G1' : '#/artefakt/' + x.path, filnamn: x.path.split('/').pop() });
  });
  var aVersioner = rel.versioner.filter(function (x) { return utfallt || !x.ej_skapad; });
  var aAgent = M.AGENTER.find(function (x) { return x.id === art.producent; });
  var aProducent = aAgent ? aAgent.id + ' ' + aAgent.namn : '—';
  var aPool = aAgent ? 'pool ' + aAgent.pool + ' · ' + aAgent.familj : '—';
  var aKonfig = aAgent ? 'konfig: ' + aAgent.konfig + ' · ur .smedjan/agents.yaml @659afb6 · ögonblicksbild, byts utan omdesign' : '—';
  var aAgentRutt = '#/agenter?agent=' + (aAgent ? aAgent.id : 'A0');
  var aMeta = [
    { etikett: 'Typ', varde: art.typ }, { etikett: 'Rubrik', varde: art.rubrik },
    { etikett: 'Version', varde: art.version }, { etikett: 'Dataklass', varde: String(art.dataklass) },
    { etikett: 'Producerad av', varde: aProducent }, { etikett: 'Pool och familj', varde: aPool },
    { etikett: 'Modellkonfig', varde: aAgent ? aAgent.konfig : '—' }, { etikett: 'Commit', varde: art.commit },
    { etikett: 'Skapad', varde: art.skapad }, { etikett: 'Varaktighet', varde: art.varaktighet },
    { etikett: 'Storlek', varde: art.storlek }, { etikett: 'meta_path', varde: art.meta_path }
  ];

  var out = '<nav aria-label="Brödsmula" style="font-family:var(--mono);font-size:13px;color:var(--brod);margin-bottom:12px"><a href="#/korningar">Körningar</a> / ews / <a href="#/korning/' + HUVUDKORNING + '?steg=0">' + HUVUDKORNING + '</a> / steg ' + art.steg + ' / ' + esc(art.filnamn) + '</nav>';
  out += '<div style="display:flex;gap:32px;align-items:flex-start;justify-content:space-between;flex-wrap:wrap">' +
    '<div style="min-width:0"><h1 class="sidtitel" style="max-width:680px">' + esc(art.rubrik) + '</h1>' +
    '<div style="font-family:var(--mono);font-size:14px;color:var(--blick);margin-top:8px">' + esc(art.path) + '</div>' +
    '<div style="display:flex;flex-wrap:wrap;gap:8px;margin-top:16px">' + art.frontmatter.map(function (fm) { return chip(esc(fm), 'chip-mono'); }).join('') + mockChip() + '</div></div>' +
    '<div style="flex:none"><div style="display:flex;gap:8px">' + knappInaktiv('Exportera docx') + knappInaktiv('Exportera pdf') + '</div>' +
    '<p style="margin:8px 0 0;font-size:14px;color:var(--blick);max-width:320px">Export byggs i en senare etapp. Underlaget finns i Git.</p></div></div>';
  out += '<hr class="avdelare">';
  out += '<div class="tva">';
  out += '<div style="min-width:0"><h2 class="sekrubrik">Metadata</h2><table data-def="1"><caption>Metadata för artefakten</caption><tbody>' +
    aMeta.map(function (m) { return '<tr><th scope="row" style="width:200px;font-size:13px;font-weight:600;letter-spacing:0.06em;color:var(--brod);vertical-align:top">' + esc(m.etikett) + '</th><td>' + esc(m.varde) + '</td></tr>'; }).join('') +
    '</tbody></table><hr class="avdelare" style="margin:32px 0">' + blockHtml(art.block) + '</div>';
  out += '<aside aria-label="Relationer, versioner och proveniens" style="display:flex;flex-direction:column;gap:24px;min-width:0">';
  out += '<section style="border:1px solid var(--linje);border-radius:6px;padding:16px"><h2 class="panelrubrik" style="margin:0 0 12px">Relationer</h2>' +
    '<div style="font-size:13px;font-weight:600;letter-spacing:0.06em;color:var(--brod);margin-bottom:8px">IN</div><ul style="list-style:none;margin:0 0 16px;padding:0">' +
    aIn.map(function (x) { return '<li data-rad style="padding:8px 0;border-bottom:1px solid var(--linje)"><a href="' + x.rutt + '" class="chip-mono" style="font-size:14px">' + esc(x.filnamn) + '</a><span style="display:block;font-size:13px;color:var(--brod)">' + esc(x.roll) + '</span></li>'; }).join('') +
    '</ul><div style="font-size:13px;font-weight:600;letter-spacing:0.06em;color:var(--brod);margin-bottom:8px">UT OCH HÄRLETT</div><ul style="list-style:none;margin:0;padding:0">' +
    aUt.map(function (x) { return '<li data-rad style="padding:8px 0;border-bottom:1px solid var(--linje)"><a href="' + x.rutt + '" class="chip-mono" style="font-size:14px">' + esc(x.filnamn) + '</a><span style="display:block;font-size:13px;color:var(--brod)">' + esc(x.roll) + '</span></li>'; }).join('') +
    '</ul><p style="margin:12px 0 0"><a href="' + (utfallt ? '#/artefakt/' + art.path : '#/artefakt/' + art.path + '?relationer=1') + '">' + (utfallt ? 'Fäll ihop relationer och versioner' : 'Fäll ut alla relationer och versioner →') + '</a></p></section>';
  out += '<section style="border:1px solid var(--linje);border-radius:6px;padding:16px"><h2 class="panelrubrik" style="margin:0 0 12px">Versioner</h2><ul style="list-style:none;margin:0;padding:0">' +
    aVersioner.map(function (ver) {
      return '<li style="padding:8px 0;border-bottom:1px solid var(--linje)"><span style="font-family:var(--mono);font-size:14px;color:' + (ver.ej_skapad ? 'var(--brod)' : 'var(--blick)') + '">' + esc(ver.path) + '</span><span style="display:block;font-size:13px;color:var(--brod)">' + esc(ver.not) + '</span><span style="display:block;font-size:13px;color:var(--brod)">' + (ver.ej_skapad ? 'ej skapad' : '') + '</span></li>';
    }).join('') + '</ul><p style="margin:12px 0 0;font-size:14px;color:var(--brod)">Diff mellan versioner ingår inte i demot.</p></section>';
  out += '<section style="border:1px solid var(--linje);border-radius:6px;padding:16px"><h2 class="panelrubrik" style="margin:0 0 12px">Proveniens</h2>' +
    '<p style="margin:0 0 4px;font-size:14px;color:var(--blick)">Producerad av <a href="' + aAgentRutt + '">' + esc(aProducent) + '</a> · ' + esc(aPool) + ' · mock · 0 tokens in / 0 ut · 0,00 USD</p>' +
    '<p style="margin:0 0 4px;font-family:var(--mono);font-size:14px;color:var(--blick)">' + esc(aKonfig) + '</p>' +
    '<p style="margin:0;font-family:var(--mono);font-size:14px;color:var(--blick)">Prompt-version: ' + esc(aAgent ? aAgent.prompt : '—') + ' (S4)</p></section>';
  out += '</aside></div>';
  return out;
}

function vyGrind(route) {
  var gid = route.rest;
  var huvud = findKorning(HUVUDKORNING);
  var g = resolveGrind(gid, huvud);
  if (!g) {
    return tomtLage('Ingen grind hittad', '', '', '<a href="#/oversikt">Till översikten →</a>');
  }
  var gd = M.GRINDAR_DEF.find(function (x) { return x.id === g.id; });
  var gVillkor = (g.rekommendation && g.rekommendation.villkor) || [];
  var gCitat = (g.rekommendation && g.rekommendation.citat) || '—';
  var gAgentId = (g.rekommendation && g.rekommendation.fran_agent) || '—';
  var gAg = M.AGENTER.find(function (a) { return a.id === gAgentId; }) || {};
  var gAgentRad = gAgentId + ' · pool ' + (gAg.pool || '—') + ' · familj ' + (gAg.familj || '—') + ' · mock';
  var gUnderlag = (g.underlag || []).map(function (u) { return Object.assign({}, u, { rutt: '#/artefakt/' + u.path }); });
  var gHarBeslut = g.status !== 'vantar' && g.status !== 'ej_nadd';
  var gQuorumNot = gHarBeslut ? ('Quorum för ' + g.id + ': ' + gd.quorum + '.') : ('Ingen har ännu registrerat beslut. Quorum: ' + gd.quorum + '.');
  var gInlineRutt = '#/korning/' + huvud.korning_id + '?grind=' + g.id;
  var modalRutt = '#/korning/' + huvud.korning_id + '?grind=' + g.id + '&modal=1';

  var out = '<h1 class="sidtitel">' + esc(g.id) + ' · ' + esc(gd.namn) + '</h1>';
  out += '<p class="dek">' + esc(gd.fraga) + '</p>';
  out += '<div style="display:flex;flex-wrap:wrap;gap:8px;margin-top:16px;align-items:center">' + statusPrick(g.status, GRINDORD[g.status] || g.status) + mockChip() + chip(g.tidpunkt ? esc(tid(g.tidpunkt)) : '—', 'chip-mono') + chip('commit 659afb6', 'chip-mono') + '</div>';
  out += forifylltBanner(g);
  out += '<hr class="avdelare">';
  out += '<div class="tva"><div style="min-width:0">';

  out += '<section style="padding-bottom:32px;border-bottom:1px solid var(--linje)"><h2 class="sekrubrik">Underlag</h2>';
  if (gUnderlag.length) {
    out += '<table data-def="1"><caption>Underlag som grindbeslutet vilar på</caption>' +
      tabellHuvud([{ namn: 'FIL' }, { namn: 'VERSION' }, { namn: 'COMMIT', kol: 'commit' }, { namn: '' }]) +
      '<tbody>' + gUnderlag.map(function (u) {
        return '<tr data-rad><td style="height:48px"><a href="' + u.rutt + '" class="chip-mono" style="font-size:14px">' + esc(u.path) + '</a></td><td style="font-family:var(--mono);font-size:14px">' + esc(u.version) + '</td><td data-kol="commit" style="font-family:var(--mono);font-size:14px">' + esc(u.commit) + '</td><td><a href="' + u.rutt + '">Öppna →</a></td></tr>';
      }).join('') + '</tbody></table>';
  }
  out += '</section>';

  out += '<section style="padding:32px 0;border-bottom:1px solid var(--linje)"><h2 class="sekrubrik">Rekommendation från ' + esc(gAgentId) + ' ' + esc(gAg.namn || '') + '</h2>' +
    '<blockquote style="margin:0;border-left:3px solid var(--teal);padding:8px 16px;font-family:var(--serif);font-size:17px;line-height:26px;font-style:italic;color:var(--blick);max-width:680px">' + esc(gCitat) + '</blockquote>' +
    '<p style="margin:8px 0 0;font-family:var(--mono);font-size:14px;color:var(--blick)">' + esc(gAgentRad) + '</p>' +
    '<p style="margin:8px 0 0;font-size:14px;color:var(--brod)">Rekommendationen är ett underlag. Beslutet är människans.</p></section>';

  out += '<section style="padding:32px 0;border-bottom:1px solid var(--linje)"><h2 class="sekrubrik">Villkor</h2>' + grindVillkorHtml(gVillkor) +
    '<p style="margin:12px 0 0;font-size:14px;color:var(--brod)">Avbockning sparas inte i demot.</p>' +
    '<p style="margin:8px 0 0;font-size:15px;color:var(--blick)">Villkor som inte åtgärdas blir automatiskt stories eller nytt intag.</p></section>';

  out += '<section style="padding:32px 0;border-bottom:1px solid var(--linje)"><h2 class="sekrubrik">Beslut och quorum</h2>' + grindQuorumTabell(g, gd) +
    '<p style="margin:12px 0 0;font-size:14px;color:var(--brod)">' + esc(gQuorumNot) + '</p></section>';

  out += '<section style="padding:32px 0"><h2 class="sekrubrik">Historik</h2><ul style="list-style:none;margin:0;padding:0 0 0 16px;border-left:1px solid var(--linje)">' +
    (g.historik || []).map(function (hx) {
      return '<li style="padding:8px 0;display:flex;gap:12px;align-items:baseline"><span aria-hidden="true" style="width:8px;height:8px;border-radius:50%;background:var(--teal);flex:none;margin-left:-21px"></span><span style="font-size:15px;color:var(--blick)">' + esc(hx) + '</span></li>';
    }).join('') + '</ul></section>';
  out += '</div>';

  out += '<aside aria-label="Regler och återremiss" style="display:flex;flex-direction:column;gap:24px;min-width:0">' +
    '<section style="border:1px solid var(--linje);border-radius:6px;padding:16px"><h2 class="panelrubrik" style="margin:0 0 8px">Vad grinden svarar på</h2>' +
    '<p style="margin:0 0 8px;font-size:15px;color:var(--brod)">' + esc(gd.fraga) + '</p><p style="margin:0;font-size:15px;font-weight:600;color:var(--blick)">Ingen agent passerar en grind.</p></section>' +
    '<section style="border:1px solid var(--linje);border-radius:6px;padding:16px"><h2 class="panelrubrik" style="margin:0 0 8px">Regler som gäller här</h2>' +
    '<p style="margin:0 0 8px;font-size:14px;color:var(--brod)"><span style="font-family:var(--mono);color:var(--blick)">S4</span> Proveniens — varje artefakt bär agent, modell, prompt-version, input, tid, kostnad.</p>' +
    '<p style="margin:0 0 8px;font-size:14px;color:var(--brod)"><span style="font-family:var(--mono);color:var(--blick)">S5</span> Mänsklig eskalering — max 3 varv per agentloop.</p>' +
    '<p style="margin:0"><a href="#/separation">Separation och dataklass →</a></p></section>' +
    '<section style="border:1px solid var(--linje);border-radius:6px;padding:16px"><h2 class="panelrubrik" style="margin:0 0 8px">Vid återremiss</h2>' +
    '<p style="margin:0;font-size:14px;color:var(--brod)">Återremiss till steg 0 eller 1. Vid specfel: ny specversion, A1 granskar diffen, G1 tas om för diffen — L3.</p></section>' +
    '<section style="border:1px solid var(--linje);border-radius:6px;padding:16px"><h2 class="panelrubrik" style="margin:0 0 8px">Samma grind i körningen</h2>' +
    '<p style="margin:0"><a href="' + gInlineRutt + '">Öppna inline i körningsdetalj →</a></p><p style="margin:8px 0 0"><a href="' + modalRutt + '">Öppna som modal →</a></p></section></aside></div>';

  out += '<div style="position:sticky;bottom:0;background:#fff;border-top:1px solid var(--linje);padding:16px 0;margin-top:32px"><div style="display:flex;gap:8px;flex-wrap:wrap">' +
    knappInaktiv('Godkänn') + knappInaktiv('Godkänn med villkor') + knappInaktiv('Retur till steg 0') + knappInaktiv('Avslå') + '</div>' +
    '<p style="margin:12px 0 0;font-size:14px;color:var(--blick)">Beslut fattas i Git i etapp 0. Portalen skriver beslutet när grindarna flyttar in i portalen i en senare etapp.</p></div>';
  return out;
}

function vyStories(route) {
  var f = state.filter;
  var alla = M.STORIES;
  var traffar = alla.filter(function (s) {
    return (f.status === 'alla' || s.status === f.status) &&
      (f.uppskattning === 'alla' || s.uppskattning === f.uppskattning) &&
      (f.beroenden === 'alla' || (f.beroenden === 'har beroenden' ? s.beroenden.length > 0 : s.beroenden.length === 0));
  });
  var vyKort = route.query.vy === 'kort';
  var sid = route.query.story;
  var sObj = alla.find(function (s) { return s.id === sid; });

  function filterKnappar(grupp, valda, aktuell) {
    return valda.map(function (o) {
      return '<button type="button" class="filterknapp" aria-pressed="' + (aktuell === o ? 'true' : 'false') + '" data-filtergrupp="' + grupp + '" data-filterval="' + esc(o) + '">' + esc(o) + '</button>';
    }).join('');
  }

  var out = '<div style="display:flex;gap:32px;align-items:flex-start"><div style="flex:1;min-width:0">';
  out += '<h1 class="sidtitel">Stories</h1><p class="dek">Nedbrytning från steg 2. Sex stories ur <span style="font-family:var(--mono);font-size:14px">steg2/stories-v1.yaml</span>. Täckningen granskad av A3.</p>';
  out += '<div style="display:flex;flex-wrap:wrap;gap:8px;margin-top:16px">' + exempelMockChip() + chip('steg 2', 'chip-mono') + chip('G2 väntar') + '</div>';
  out += '<hr class="avdelare">';
  out += '<div style="border:1px solid var(--linje);border-radius:6px;padding:12px;display:flex;gap:24px;flex-wrap:wrap;align-items:flex-start">' +
    '<fieldset style="border:0;margin:0;padding:0"><legend style="font-size:13px;font-weight:600;letter-spacing:0.06em;color:var(--brod);padding:0 0 4px">STATUS</legend><div style="display:flex;gap:8px;flex-wrap:wrap">' + filterKnappar('status', ['alla', 'todo', 'pågår', 'klar', 'blockerad'], f.status) + '</div></fieldset>' +
    '<fieldset style="border:0;margin:0;padding:0"><legend style="font-size:13px;font-weight:600;letter-spacing:0.06em;color:var(--brod);padding:0 0 4px">UPPSKATTNING</legend><div style="display:flex;gap:8px;flex-wrap:wrap">' + filterKnappar('uppskattning', ['alla', 'S', 'M', 'L'], f.uppskattning) + '</div></fieldset>' +
    '<fieldset style="border:0;margin:0;padding:0"><legend style="font-size:13px;font-weight:600;letter-spacing:0.06em;color:var(--brod);padding:0 0 4px">BEROENDEN</legend><div style="display:flex;gap:8px;flex-wrap:wrap">' + filterKnappar('beroenden', ['alla', 'har beroenden', 'fristående'], f.beroenden) + '</div></fieldset>' +
    '<div style="margin-left:auto;display:flex;gap:16px;align-items:center"><span style="display:inline-flex;border:1px solid var(--linje);border-radius:6px;overflow:hidden">' +
    '<a href="#/stories" style="padding:0 12px;height:36px;display:inline-flex;align-items:center;font-size:14px;color:var(--blick);border-right:1px solid var(--linje);font-weight:' + (vyKort ? 400 : 600) + '">Lista</a>' +
    '<a href="#/stories?vy=kort" style="padding:0 12px;height:36px;display:inline-flex;align-items:center;font-size:14px;color:var(--blick);font-weight:' + (vyKort ? 600 : 400) + '">Kort</a></span>' +
    '<button type="button" data-rensa-storyfilter="1" style="height:36px;padding:0 12px;background:#fff;border:1px solid var(--brod);border-radius:6px;font-size:14px;color:var(--blick);cursor:pointer">Rensa filter</button></div></div>';
  out += '<p role="status" aria-live="polite" style="margin:12px 0 24px;font-size:14px;color:var(--brod)">' + traffar.length + ' av ' + alla.length + ' stories</p>';

  if (!vyKort) {
    if (traffar.length) {
      out += '<table data-def="1"><caption>Stories ur nedbrytningen i steg 2</caption>' +
        tabellHuvud([{ namn: 'ID' }, { namn: 'TITEL' }, { namn: 'UPPSK.' }, { namn: 'BEROENDEN' }, { namn: 'SPEC-KRAV' }, { namn: 'DATAKLASS', kol: 'dataklass' }, { namn: 'STATUS' }, { namn: 'FIL' }]) +
        '<tbody>' + traffar.map(function (s) {
          return '<tr data-rad><td style="height:48px"><a href="#/stories?story=' + s.id + '" class="chip-mono" style="font-size:14px">' + esc(s.id) + '</a></td>' +
            '<td>' + esc(s.titel) + '</td><td>' + esc(s.uppskattning) + '</td>' +
            '<td><span style="display:inline-flex;gap:4px;flex-wrap:wrap">' + (s.beroenden.length ? s.beroenden.map(function (b) { return chip(esc(b), 'chip-mono'); }).join('') : '<span class="chip-mono" style="font-size:14px">—</span>') + '</span></td>' +
            '<td style="font-family:var(--mono);font-size:14px">' + esc(s.spec_krav) + '</td>' +
            '<td data-kol="dataklass" style="font-family:var(--mono);font-size:14px">' + esc(s.dataklass) + '</td>' +
            '<td data-status="1">' + statusPrick(s.status) + '</td>' +
            '<td style="font-family:var(--mono);font-size:14px">' + esc(s.path.split('/').pop()) + '</td></tr>';
        }).join('') + '</tbody></table>';
    } else {
      out += '<div class="tomtlage" style="margin-top:24px"><h2 class="panelrubrik" style="font-size:22px;margin:0 0 8px">Inga stories matchar filtret</h2><p style="margin:0;font-size:15px;color:var(--brod)">Sex stories finns i indexet. Rensa filtret för att se dem.</p></div>';
    }
  } else {
    out += '<div class="kort2">' + traffar.map(function (s) {
      return '<article style="border:1px solid var(--linje);border-radius:6px;padding:20px"><div style="font-family:var(--mono);font-size:14px;color:var(--blick)">' + esc(s.id) + '</div>' +
        '<h2 style="font-family:var(--serif);font-size:17px;margin:4px 0 12px"><a href="#/stories?story=' + s.id + '" style="color:var(--blick)">' + esc(s.titel) + '</a></h2>' +
        '<div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:12px">' + chip(esc(s.uppskattning)) + chip('klass ' + s.dataklass, 'chip-teal') + statusPrick(s.status) + '</div>' +
        '<div style="display:flex;gap:4px;flex-wrap:wrap;margin-bottom:12px">' + s.beroenden.map(function (b) { return chip(esc(b), 'chip-mono'); }).join('') + '</div>' +
        '<details><summary style="cursor:pointer;font-size:14px;color:var(--teal)">Visa acceptanskriterier</summary><p style="margin:8px 0 0;font-size:14px;color:var(--brod)">Öppna storyn för Given/When/Then ur indexet.</p></details></article>';
    }).join('') + '</div>';
  }

  out += '<section style="margin-top:48px"><h2 class="sekrubrik">Täckning (A3)</h2><ul style="list-style:none;margin:0;padding:0;border-top:1px solid var(--linje)">' +
    M.TACKNING.map(function (t) {
      return '<li style="border-bottom:1px solid var(--linje);border-left:' + (t.saknas ? '3px' : '0px') + ' solid ' + (t.saknas ? 'var(--rodbrun)' : 'transparent') + ';padding:12px;display:flex;gap:16px;align-items:baseline">' +
        '<span style="font-family:var(--mono);font-size:14px;color:var(--blick);flex:none;width:40px">' + esc(t.krav) + '</span>' +
        '<span style="flex:1;min-width:0;font-size:15px;color:var(--blick)">' + esc(t.text) + '</span>' +
        '<span style="flex:1;min-width:0;font-size:15px;color:var(--brod)">' + esc(t.tackt_av) + '</span>' +
        (t.saknas ? '<a href="#/grind/G2" style="flex:none;font-size:14px">Öppna G2 →</a>' : '<span style="flex:none"></span>') + '</li>';
    }).join('') + '</ul><p style="margin:16px 0 0"><a href="#/artefakt/korningar/ews/steg2/tackning.md">Öppna tackning.md →</a></p></section>';
  out += '</div>';

  if (sObj) {
    var storyMeta = [
      { etikett: 'Uppskattning', varde: sObj.uppskattning }, { etikett: 'Dataklass', varde: String(sObj.dataklass) },
      { etikett: 'Spec-krav', varde: sObj.spec_krav }, { etikett: 'Status', varde: sObj.status },
      { etikett: 'Beroenden', varde: sObj.beroenden.length ? sObj.beroenden.join(', ') : 'inga' }, { etikett: 'Fil', varde: sObj.path }
    ];
    var storyAK = M.AKCEPTANSKRITERIER[sObj.id] || [];
    out += '<aside data-drawer aria-label="Storydetalj"><div style="display:flex;justify-content:flex-end"><a href="#/stories">Stäng</a></div>' +
      '<h2 tabindex="-1" style="font-family:var(--serif);font-size:22px;margin:8px 0 12px">' + esc(sObj.id) + ' · ' + esc(sObj.titel) + '</h2>' +
      '<div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:16px">' + exempelMockChip() + statusPrick(sObj.status) + '</div>' +
      '<table data-def="1"><caption>Metadata för storyn</caption><tbody>' + storyMeta.map(function (m) { return '<tr><th scope="row" style="width:140px;font-size:13px;font-weight:600;letter-spacing:0.06em;color:var(--brod);vertical-align:top">' + esc(m.etikett) + '</th><td style="font-size:14px;word-break:break-all">' + esc(m.varde) + '</td></tr>'; }).join('') + '</tbody></table>' +
      '<h3 class="panelrubrik">Acceptanskriterier</h3>' + storyAK.map(function (ak) { return '<p style="margin:0 0 8px;font-size:15px;color:var(--blick)"><span style="font-weight:600">' + esc(ak.ord) + '</span> ' + esc(ak.text) + '</p>'; }).join('') +
      '<h3 class="panelrubrik">Tester</h3><p style="margin:0;font-size:15px;color:var(--brod)">Inga tester finns — steg 4 är inte kört.</p>' +
      '<h3 class="panelrubrik">Proveniens</h3><p style="margin:0;font-size:14px;color:var(--blick)">Skriven av <a href="#/agenter?agent=A2">A2 Nedbrytare</a> · pool C · öppna vikter · mock · 0 tokens · granskad av <a href="#/agenter?agent=A3">A3 Storygranskare</a> · pool B.</p>' +
      '<div style="border-top:1px solid var(--linje);margin-top:24px;padding-top:16px">' + knappInaktiv('Skapa GitHub-issue') +
      '<p style="margin:8px 0 0;font-size:14px;color:var(--blick)">Portalen skriver inte till Git i demot.</p><p style="margin:16px 0 0"><a href="#/stories">Stäng</a></p></div></aside>';
  }
  out += '</div>';
  return out;
}

function vyAgenter(route) {
  var aid = route.query.agent;
  var aObj = M.AGENTER.find(function (a) { return a.id === aid; });
  var out = '<div style="display:flex;gap:32px;align-items:flex-start"><div style="flex:1;min-width:0">';
  out += '<h1 class="sidtitel">Agenter och modellpooler</h1><p class="dek">Fjorton agenter, en roll var. En agent tilldelas en pool, inte en modell — modellversion byts i konfiguration, separationen består.</p><hr class="avdelare">';
  out += '<section style="margin-bottom:48px"><h2 class="sekrubrik">Agenter A0–A13</h2><table data-def="1"><caption>Alla agenter med steg, pool, familj, vad de producerar och vad de inte får göra</caption>' +
    tabellHuvud([{ namn: 'ID' }, { namn: 'AGENT' }, { namn: 'STEG' }, { namn: 'POOL' }, { namn: 'FAMILJ' }, { namn: 'PRODUCERAR' }, { namn: 'FÅR INTE' }, { namn: 'I DENNA KÖRNING' }]) +
    '<tbody>' + M.AGENTER.map(function (ag) {
      var kant = ag.korning === 'kört (mock)' ? 'var(--teal)' : 'transparent';
      var poolvisning = 'pool ' + ag.pool + (ag.hanglas ? ' ' + lockSvg(14) + ' endast intern' : '');
      return '<tr data-rad><td style="height:48px;border-left:3px solid ' + kant + '"><a href="#/agenter?agent=' + ag.id + '" class="chip-mono" style="font-size:14px">' + esc(ag.id) + '</a></td>' +
        '<td>' + esc(ag.namn) + '</td><td style="font-family:var(--mono);font-size:14px">' + esc(ag.steg) + '</td>' +
        '<td style="font-family:var(--mono);font-size:14px;display:flex;align-items:center;gap:4px">' + poolvisning + '</td>' +
        '<td>' + esc(ag.familj) + '</td><td style="color:var(--brod)">' + esc(ag.producerar) + '</td><td style="color:var(--brod)">' + esc(ag.far_inte) + '</td><td>' + esc(ag.korning) + '</td></tr>';
    }).join('') + '</tbody></table></section>';

  out += '<section style="margin-bottom:48px"><h2 class="sekrubrik">Modellpooler</h2><div class="pooler">' +
    M.POOLER.map(function (po) {
      var kant = po.hanglas ? 'var(--rodbrun)' : 'var(--linje)';
      var vansterkant = po.hanglas ? '3px' : '1px';
      return '<section style="border:1px solid var(--linje);border-left:' + vansterkant + ' solid ' + kant + ';border-radius:6px;padding:16px">' +
        '<div style="font-family:var(--serif);font-size:22px;color:var(--blick)">Pool ' + po.id + '</div>' +
        '<div style="font-size:15px;font-weight:600;color:var(--blick);margin-bottom:8px">' + esc(po.familj) + (po.hanglas ? ' ' + lockSvg(14) + ' <span style="font-size:13px;font-weight:400;color:var(--rodbrun)">endast intern</span>' : '') + '</div>' +
        '<div style="font-size:13px;font-weight:600;letter-spacing:0.06em;color:var(--brod);margin-bottom:4px">ANVÄNDS TILL</div><p style="margin:0 0 12px;font-size:14px;color:var(--brod)">' + esc(po.anvands) + '</p>' +
        '<div style="font-size:13px;font-weight:600;letter-spacing:0.06em;color:var(--brod);margin-bottom:4px">AGENTER</div><div style="display:flex;gap:4px;flex-wrap:wrap;margin-bottom:12px">' +
        po.agenter.map(function (ai) { return '<a href="#/agenter?agent=' + ai + '" class="chip chip-mono">' + esc(ai) + '</a>'; }).join('') + '</div>' +
        '<div style="font-size:13px;font-weight:600;letter-spacing:0.06em;color:var(--brod);margin-bottom:4px">DATAKLASSER</div><p style="margin:0 0 12px;font-size:14px;color:var(--blick)">klass ' + esc(po.klasser) + '</p>' +
        '<p style="margin:0;font-family:var(--mono);font-size:13px;color:var(--blick);word-break:break-word">konfig: ' + esc(po.konfig) + ' · ögonblicksbild ur .smedjan/agents.yaml @659afb6</p>' +
        '<p style="margin:12px 0 0"><a href="#/separation" style="font-size:14px">Separation och dataklass →</a></p></section>';
    }).join('') + '</div></section>';

  out += '<section style="margin-bottom:32px"><h2 class="sekrubrik">Bindningar som S1 kräver</h2><ul style="list-style:none;margin:0;padding:0;border:1px solid var(--linje);border-radius:6px">' +
    M.BINDNINGAR.map(function (bn) { return '<li style="padding:12px 16px;border-bottom:1px solid var(--linje);font-size:15px;color:var(--blick)">' + esc(bn) + '</li>'; }).join('') + '</ul></section>';
  out += '<div class="notrad">Modellnamn är konfigurationsvärden ur Git och ögonblicksbilder. Poolen är den stabila identiteten. Modellbyte är konfig, inte omdesign.</div>';
  out += '</div>';

  if (aObj) {
    var agentMeta = [
      { etikett: 'Producerar', varde: aObj.producerar }, { etikett: 'Får inte', varde: aObj.far_inte },
      { etikett: 'Prompt-version', varde: aObj.prompt }, { etikett: 'Max varv', varde: '3' }, { etikett: 'Steg', varde: aObj.steg }
    ];
    var artLista = Object.keys(M.ARTEFAKTER).filter(function (p) { return M.ARTEFAKTER[p].producent === aObj.id; });
    out += '<aside data-drawer aria-label="Agentdetalj"><div style="display:flex;justify-content:flex-end"><a href="#/agenter">Stäng</a></div>' +
      '<h2 tabindex="-1" style="font-family:var(--serif);font-size:22px;margin:8px 0 12px">' + esc(aObj.id) + ' · ' + esc(aObj.namn) + '</h2>' +
      '<div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:16px">' + chip('pool ' + aObj.pool, 'chip-mono') + chip('familj ' + esc(aObj.familj)) + chip('steg ' + esc(aObj.steg)) + mockChip() + '</div>' +
      '<table data-def="1"><caption>Agentens uppdrag och gränser</caption><tbody>' + agentMeta.map(function (m) { return '<tr><th scope="row" style="width:140px;font-size:13px;font-weight:600;letter-spacing:0.06em;color:var(--brod);vertical-align:top">' + esc(m.etikett) + '</th><td style="font-size:14px">' + esc(m.varde) + '</td></tr>'; }).join('') + '</tbody></table>' +
      '<h3 class="panelrubrik">Artefakter i denna körning</h3><ul style="list-style:none;margin:0;padding:0">' +
      artLista.map(function (p) { return '<li style="padding:8px 0;border-bottom:1px solid var(--linje)"><a href="#/artefakt/' + p + '" class="chip-mono" style="font-size:14px">' + esc(p) + '</a></li>'; }).join('') + '</ul>' +
      (artLista.length === 0 ? '<p style="margin:0;font-size:15px;color:var(--brod)">Steget har inte körts. Ingen artefakt finns. Körs i en senare etapp.</p>' : '') +
      '<h3 class="panelrubrik">Regler som gäller</h3>' + M.SEPARATIONSREGLER.map(function (sr) { return '<p style="margin:0 0 8px;font-size:14px;color:var(--brod)"><span style="font-family:var(--mono);color:var(--blick)">' + sr.regel + '</span> ' + esc(sr.namn) + ' — ' + esc(sr.innebord) + '</p>'; }).join('') +
      '<h3 class="panelrubrik">Kostnad i denna körning</h3><p style="margin:0;font-family:var(--mono);font-size:14px;color:var(--blick)">0 tokens in · 0 tokens ut · 0,00 USD</p><p style="margin:4px 0 0;font-size:14px;color:var(--brod)">mock — inga anrop</p>' +
      '<h3 class="panelrubrik">Konfiguration</h3><p style="margin:0;font-family:var(--mono);font-size:14px;color:var(--blick);word-break:break-word">konfig: ' + esc(aObj.konfig) + ' · ur .smedjan/agents.yaml @659afb6 · ögonblicksbild</p>' +
      '<p style="margin:24px 0 0"><a href="#/agenter">Stäng</a></p></aside>';
  }
  out += '</div>';
  return out;
}

function vySeparation(route) {
  var huvud = findKorning(HUVUDKORNING);
  var klass2Blockerad = route.query.klass2 === 'blockerad';
  var separationsrader = huvud.separation.map(function (s) {
    var def = M.SEPARATIONSREGLER.find(function (x) { return x.regel === s.regel; }) || {};
    return { regel: s.regel, namn: def.namn, innebord: def.innebord, galler: s.galler.join(' → '), status: s.uppfylld === null ? 'ej_tillamplig' : (s.uppfylld ? 'uppfylld' : 'bruten'), motivering: s.motivering };
  });
  var parvis = huvud.separation.filter(function (s) { return s.regel === 'S1'; }).map(function (s) { return { regel: s.regel, galler: s.galler.join(' → '), pooler: s.pooler, familjer: s.familjer, status: 'olika ✓' }; });

  var out = '<h1 class="sidtitel">Separation och dataklass</h1>';
  out += '<p class="dek">Mönstret i varje steg: producent och granskare ur olika pooler, kontextvägg mellan dem, människa beslutar. Läst ur <span style="font-family:var(--mono);font-size:14px">separation</span> i indexet — inget är hårdkodat i portalen.</p><hr class="avdelare">';

  if (klass2Blockerad) {
    out += '<div role="alert" class="varningsrad" style="margin-bottom:32px"><h2 class="panelrubrik" style="font-size:17px;margin:0 0 4px">Blockerad: dataklass 2 begärde extern pool</h2>' +
      '<p style="margin:0 0 12px;font-size:15px;color:var(--blick);max-width:680px">Steg 11 · A11 Driftvakt · dataklass 2. Begärd pool: C (extern) — avvisad. Tillåten pool: D (intern, on-prem). Orkestreringen startar inte steget. Ingen tyst degradering (S6).</p>' +
      '<table data-def="1" style="max-width:680px"><caption>Begäran och utfall för den spärrade routningen</caption>' + tabellHuvud([{ namn: 'BEGÄRAN' }, { namn: 'UTFALL' }]) +
      '<tbody><tr><td style="font-family:var(--mono);font-size:14px">A11 · klass 2 · pool C</td><td>avvisad — steget startade inte ' + chip('EXEMPEL — MOCK', 'chip-mock chip-sm') + '</td></tr></tbody></table></div>';
  }

  out += '<section style="margin-bottom:48px"><h2 class="sekrubrik">Reglerna S1–S6</h2><table data-def="1"><caption>Separationsreglerna och deras status i denna körning</caption>' +
    tabellHuvud([{ namn: 'REGEL' }, { namn: 'NAMN' }, { namn: 'INNEBÖRD' }, { namn: 'GÄLLER I DENNA KÖRNING' }, { namn: 'STATUS' }, { namn: 'MOTIVERING' }]) +
    '<tbody>' + separationsrader.map(function (sr) {
      return '<tr><td style="font-family:var(--mono);font-size:14px">' + sr.regel + '</td><td>' + esc(sr.namn) + '</td><td style="color:var(--brod);max-width:320px">' + esc(sr.innebord) + '</td><td style="font-family:var(--mono);font-size:14px">' + esc(sr.galler) + '</td><td data-status="1">' + statusPrick(sr.status) + '</td><td style="color:var(--brod)">' + esc(sr.motivering) + '</td></tr>';
    }).join('') + '</tbody></table></section>';

  out += '<section style="margin-bottom:48px"><h2 class="sekrubrik">Parvis kontroll i denna körning</h2><table data-def="1" style="max-width:760px"><caption>Parvis poolkontroll mellan producent och granskare</caption>' +
    tabellHuvud([{ namn: 'REGEL' }, { namn: 'GÄLLER' }, { namn: 'POOLER' }, { namn: 'FAMILJER' }, { namn: 'STATUS' }]) +
    '<tbody>' + parvis.map(function (pv) { return '<tr><td style="font-family:var(--mono);font-size:14px">' + pv.regel + '</td><td style="font-family:var(--mono);font-size:14px">' + esc(pv.galler) + '</td><td style="font-family:var(--mono);font-size:14px">' + esc(pv.pooler) + '</td><td>' + esc(pv.familjer) + '</td><td>' + esc(pv.status) + '</td></tr>'; }).join('') + '</tbody></table></section>';

  out += '<section style="margin-bottom:48px"><h2 class="sekrubrik">Dataklass</h2><ul style="list-style:none;margin:0;padding:0;border:1px solid var(--linje);border-radius:6px">' +
    M.DATAKLASSER.map(function (d) {
      var kant = d.klass === 2 ? 'var(--rodbrun)' : (d.klass === 1 ? 'var(--sand-mork)' : 'var(--teal)');
      var bredd = d.klass === 2 ? '3px' : '1px';
      var badge = d.klass === 2 ? klass2Badge() : (d.klass === 1 ? chip('klass 1', 'chip-mock') : chip('klass 0', 'chip-teal'));
      var extra = d.klass === 2 && klass2Blockerad ? 'Aldrig extern routing' : '';
      return '<li style="min-height:96px;padding:16px;border-bottom:1px solid var(--linje);border-left:' + bredd + ' solid ' + kant + ';display:flex;gap:24px;align-items:flex-start;flex-wrap:wrap">' +
        '<span style="flex:none">' + badge + '</span>' +
        '<span style="flex:1;min-width:200px"><span style="display:block;font-size:15px;font-weight:600;color:var(--blick)">' + esc(d.namn) + '</span>' +
        '<span style="display:block;font-size:15px;color:var(--brod)">' + esc(d.innebord) + '</span>' +
        '<span style="display:block;font-size:14px;color:var(--brod)">' + esc(d.exempel) + '</span>' +
        (extra ? '<span style="display:block;font-size:14px;color:var(--rodbrun)">' + esc(extra) + '</span>' : '') + '</span>' +
        '<span style="flex:none;max-width:280px"><span style="display:block;font-size:13px;font-weight:600;letter-spacing:0.06em;color:var(--brod)">TILLÅTNA POOLER</span><span style="display:block;font-size:14px;color:var(--blick)">' + esc(d.pooler) + '</span></span></li>';
    }).join('') + '</ul><p style="margin:12px 0 0"><a href="#/separation?klass2=blockerad">Visa klass 2 blockerad →</a></p></section>';

  out += '<section style="margin-bottom:32px"><div class="varningsrad" style="max-width:760px"><h2 class="panelrubrik" style="font-size:17px;margin:0 0 8px">Pool D är hårt spärrad</h2>' +
    '<p style="margin:0 0 8px;font-size:15px;color:var(--blick)">Klass 2 kan aldrig routas externt. Klass 2 — endast intern modell. Aldrig extern routing.</p>' +
    '<p style="margin:0;font-size:15px;color:var(--blick)">' + esc(klass2Blockerad ? 'Spärren utlöst i detta EXEMPEL' : 'Denna körning: dataklass 0. Spärren är inte aktiverad.') + '</p></div></section>';

  out += '<div class="notrad">Hela kedjan steg 0–9 körs på klass 0–1 med syntetisk testdata. Klass 2 uppstår först i steg 11 — därför kör Driftvakten internt och Förbättringsagenten på avidentifierad statistik.</div>';
  return out;
}

function vyKostnad(route) {
  var huvud = findKorning(HUVUDKORNING);
  var budget = route.query.budget === '1';
  var kostnadsrader = [];
  (huvud.steg || []).forEach(function (s) {
    kostnadsrader.push({ steg: String(s.nummer), agent: s.agent.id, pool: 'pool ' + s.agent.pool, tid: s.varaktighet_ms + ' ms' });
    if (s.granskare) kostnadsrader.push({ steg: String(s.nummer), agent: s.granskare.id, pool: 'pool ' + s.granskare.pool, tid: s.granskare.varaktighet_ms + ' ms' });
  });
  M.PROCESS.filter(function (p) { return p.nummer >= 3; }).forEach(function (p) {
    kostnadsrader.push({ steg: String(p.nummer), agent: 'ej kört', pool: '—', tid: '—' });
  });
  var budgetrader = [
    { namn: 'Dagsgräns' }, { namn: 'Månadstak' }, { namn: 'Spärr mot dyr modell som standardval' }, { namn: 'Konto och betalningsansvar' }
  ];
  var planerat = [{ namn: 'Agentkostnad per story' }, { namn: 'Kostnad per steg' }, { namn: 'Kostnad per körning' }, { namn: 'Andel av kostnaden per pool' }];

  var out = '<h1 class="sidtitel">Kostnad och användning</h1><p class="dek">Demot körs på mockad motor: inga anrop, ingen nyckel, 0 USD. Portalen visar bara det som finns i indexet.</p>';
  out += '<div style="display:flex;flex-wrap:wrap;gap:8px;margin-top:16px">' + mockChip() + chip('backend: mock', 'chip-mono') + chip('0 USD', 'chip-mono') + '</div><hr class="avdelare">';

  out += '<section style="margin-bottom:48px"><h2 class="sekrubrik">Denna körning</h2>';
  if (budget) {
    out += '<table data-def="1" style="max-width:760px"><caption>Totalsumma för körningen</caption><tbody><tr><td style="border-top:3px double var(--linje);font-weight:600">Totalt</td><td style="border-top:3px double var(--linje);text-align:right;font-family:var(--mono);font-size:14px">0 tokens in · 0 tokens ut · 0,00 USD · 56 ms</td></tr></tbody></table>';
  } else {
    out += '<table data-def="1"><caption>Tokens och kostnad per steg i denna körning</caption>' +
      tabellHuvud([{ namn: 'STEG' }, { namn: 'AGENT' }, { namn: 'POOL' }, { namn: 'TOKENS IN', hoger: true }, { namn: 'TOKENS UT', hoger: true }, { namn: 'USD', hoger: true }, { namn: 'VARAKTIGHET', hoger: true, kol: 'varaktighet' }]) +
      '<tbody>' + kostnadsrader.map(function (kr) {
        return '<tr><td style="font-family:var(--mono);font-size:14px">' + esc(kr.steg) + '</td><td style="font-family:var(--mono);font-size:14px">' + esc(kr.agent) + '</td><td style="font-family:var(--mono);font-size:14px">' + esc(kr.pool) + '</td>' +
          '<td style="text-align:right;font-family:var(--mono);font-size:14px">' + (kr.agent === 'ej kört' ? '—' : '0') + '</td><td style="text-align:right;font-family:var(--mono);font-size:14px">' + (kr.agent === 'ej kört' ? '—' : '0') + '</td>' +
          '<td style="text-align:right;font-family:var(--mono);font-size:14px">' + (kr.agent === 'ej kört' ? '—' : '0,00 USD') + '</td><td data-kol="varaktighet" style="text-align:right;font-family:var(--mono);font-size:14px">' + esc(kr.tid) + '</td></tr>';
      }).join('') + '<tr><td colspan="3" style="border-top:3px double var(--linje);font-weight:600">Totalt</td><td style="border-top:3px double var(--linje);text-align:right;font-family:var(--mono);font-size:14px">0</td><td style="border-top:3px double var(--linje);text-align:right;font-family:var(--mono);font-size:14px">0</td><td style="border-top:3px double var(--linje);text-align:right;font-family:var(--mono);font-size:14px">0,00 USD</td><td style="border-top:3px double var(--linje);text-align:right;font-family:var(--mono);font-size:14px">56 ms</td></tr></tbody></table>';
  }
  out += '</section>';

  out += '<section style="margin-bottom:48px;max-width:760px"><h2 class="sekrubrik">Varför noll</h2><div style="border:1px solid var(--linje);border-radius:6px;padding:16px;font-size:15px;color:var(--blick)">Backend är mock. Ingen nyckel är konfigurerad, inga modellanrop görs, och därför finns ingen kostnad att visa. Kostnad blir verklig först när en nyckel kopplas in i en senare etapp.</div></section>';

  out += '<section style="margin-bottom:48px"><h2 class="sekrubrik">Budget och tak</h2>';
  if (budget) {
    out += '<div class="kort2">' + budgetrader.map(function (b) {
      return '<section style="border:1px solid var(--linje);border-radius:6px;padding:20px"><h3 class="panelrubrik" style="margin:0 0 12px">' + esc(b.namn) + '</h3>' +
        '<p style="margin:0;font-size:15px;color:var(--blick)">Värde: <span style="font-family:var(--mono)">—</span></p><p style="margin:0;font-size:15px;color:var(--brod)">Sätts i: konfiguration i Git</p>' +
        '<p style="margin:0;font-size:15px;color:var(--brod)">Gäller pool: <span style="font-family:var(--mono)">—</span></p><p style="margin:0 0 12px;font-size:15px;color:var(--brod)">Status: ej konfigurerad</p>' +
        knappInaktiv('Sätt gräns') + '<p style="margin:8px 0 0;font-size:14px;color:var(--blick)">Konfiguration ändras i Git, inte i portalen.</p></section>';
    }).join('') + '</div>';
  } else {
    out += '<table data-def="1" style="max-width:760px"><caption>Budget och tak, ej konfigurerade</caption>' + tabellHuvud([{ namn: 'POST' }, { namn: 'VÄRDE' }, { namn: 'STATUS' }]) +
      '<tbody>' + budgetrader.map(function (b) { return '<tr><td>' + esc(b.namn) + '</td><td style="font-family:var(--mono);font-size:14px">—</td><td>' + chip('ej konfigurerad') + '</td></tr>'; }).join('') + '</tbody></table>' +
      '<p style="margin:12px 0 0;font-size:14px;color:var(--blick);max-width:680px">Inga belopp visas här förrän de står i konfigurationen. Portalen hittar aldrig på siffror.</p>' +
      '<p style="margin:8px 0 0"><a href="#/kostnad?budget=1">Öppna budget och tak →</a></p>';
  }
  out += '</section>';

  out += '<section style="margin-bottom:32px"><h2 class="sekrubrik">Vad som kommer mätas</h2><ul style="list-style:none;margin:0;padding:0;border:1px solid var(--linje);border-radius:6px;max-width:760px">' +
    planerat.map(function (pl) { return '<li style="padding:12px 16px;border-bottom:1px solid var(--linje);display:flex;justify-content:space-between;gap:16px;font-size:15px;color:var(--blick)"><span>' + esc(pl.namn) + '</span><span style="font-size:13px;color:var(--brod)">planerat, inte mätt</span></li>'; }).join('') + '</ul></section>';
  return out;
}

function vyKorningar(route) {
  var kf = state.korfilter;
  var live = route.query.backend === 'live';
  var kTraffar = live ? [] : M.KORNINGSLISTA.filter(function (x) {
    return (kf.projekt === 'alla' || x.projekt === kf.projekt) &&
      (kf.status === 'alla' || x.status === kf.status) &&
      (kf.dataklass === 'alla' || korningDataklass(x.id) === Number(kf.dataklass)) &&
      withinPeriod(x.startad, kf.period);
  });
  var aktivaChips = [];
  if (kf.projekt !== 'alla') aktivaChips.push({ etikett: 'Projekt: ' + kf.projekt, grupp: 'projekt' });
  if (kf.status !== 'alla') aktivaChips.push({ etikett: 'Status: ' + kf.status, grupp: 'status' });
  if (kf.dataklass !== 'alla') aktivaChips.push({ etikett: 'Dataklass: ' + kf.dataklass, grupp: 'dataklass' });
  if (kf.period !== 'alla') aktivaChips.push({ etikett: 'Period: ' + kf.period + ' dagar', grupp: 'period' });

  function knapp(grupp, varde, namn) {
    var vald = kf[grupp] === varde;
    return '<button type="button" class="filterknapp" aria-pressed="' + (vald ? 'true' : 'false') + '" data-korfiltergrupp="' + grupp + '" data-korfilterval="' + esc(varde) + '">' + esc(namn) + '</button>';
  }

  var out = '<h1 class="sidtitel">Körningar</h1><p class="dek">Alla körningar som finns som index i repot. Senaste först.</p>';
  out += '<div style="display:flex;flex-wrap:wrap;gap:8px;margin-top:16px">' + chip('5 körningar') + mockChip() + '</div><hr class="avdelare">';

  out += '<div style="border:1px solid var(--linje);border-radius:6px;padding:12px;display:flex;gap:24px;flex-wrap:wrap">' +
    '<fieldset style="border:0;margin:0;padding:0"><legend style="font-size:13px;font-weight:600;letter-spacing:0.06em;color:var(--brod);padding:0 0 4px">PROJEKT</legend><div style="display:flex;gap:8px;flex-wrap:wrap">' +
    ['alla', 'ews', 'patientoversikt', 'axel-sjalvincheckning'].map(function (o) { return knapp('projekt', o, o); }).join('') + '</div></fieldset>' +
    '<fieldset style="border:0;margin:0;padding:0"><legend style="font-size:13px;font-weight:600;letter-spacing:0.06em;color:var(--brod);padding:0 0 4px">STATUS</legend><div style="display:flex;gap:8px;flex-wrap:wrap">' +
    ['alla', 'vantar', 'kor', 'klar', 'blockerad', 'fel', 'overhoppad'].map(function (o) { return knapp('status', o, o === 'kor' ? 'kör' : (o === 'vantar' ? 'väntar' : (o === 'overhoppad' ? 'överhoppad' : o))); }).join('') + '</div></fieldset>' +
    '<fieldset style="border:0;margin:0;padding:0"><legend style="font-size:13px;font-weight:600;letter-spacing:0.06em;color:var(--brod);padding:0 0 4px">DATAKLASS</legend><div style="display:flex;gap:8px;flex-wrap:wrap">' +
    ['alla', '0', '1', '2'].map(function (o) { return knapp('dataklass', o, o === 'alla' ? 'alla' : 'klass ' + o); }).join('') + '</div></fieldset>' +
    '<fieldset style="border:0;margin:0;padding:0"><legend style="font-size:13px;font-weight:600;letter-spacing:0.06em;color:var(--brod);padding:0 0 4px">PERIOD</legend><div style="display:flex;gap:8px;flex-wrap:wrap">' +
    knapp('period', 'alla', 'alla') + knapp('period', '7', '7 dagar') + knapp('period', '30', '30 dagar') + '</div></fieldset>' +
    '<fieldset style="border:0;margin:0;padding:0"><legend style="font-size:13px;font-weight:600;letter-spacing:0.06em;color:var(--brod);padding:0 0 4px">BACKEND</legend><div style="display:flex;gap:8px;flex-wrap:wrap">' +
    '<a href="#/korningar" class="filterknapp" style="text-decoration:none;display:inline-flex;align-items:center;' + (live ? '' : 'border-color:var(--teal);font-weight:600') + '">alla</a>' +
    '<a href="#/korningar" class="filterknapp" style="text-decoration:none;display:inline-flex;align-items:center">mock</a>' +
    '<a href="#/korningar?backend=live" class="filterknapp" style="text-decoration:none;display:inline-flex;align-items:center;' + (live ? 'border-color:var(--teal);font-weight:600' : '') + '">live</a></div></fieldset>' +
    '<div style="margin-left:auto;display:flex;align-items:flex-end"><a href="#/korningar" data-rensa-korfilter="1" style="font-size:14px">Rensa filter</a></div></div>';

  if (aktivaChips.length) {
    out += '<div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:12px">' + aktivaChips.map(function (c) {
      return '<span class="chip chip-teal" style="gap:6px">' + esc(c.etikett) + ' <button type="button" data-korfiltergrupp="' + c.grupp + '" data-korfilterval="alla" style="border:0;background:none;color:inherit;cursor:pointer;font-weight:700;padding:0">×</button></span>';
    }).join('') + '</div>';
  }
  out += '<p role="status" aria-live="polite" style="margin:12px 0 24px;font-size:14px;color:var(--brod)">' + kTraffar.length + ' av ' + M.KORNINGSLISTA.length + ' körningar</p>';

  if (live) {
    out += '<div style="display:flex;gap:8px;margin-bottom:24px">' + chip('Backend: live ×', 'chip-teal') + '</div>';
  }

  if (kTraffar.length) {
    out += '<table data-def="1" data-kompakt="1"><caption>Alla körningar i repot, senaste först</caption>' +
      tabellHuvud([{ namn: 'KÖRNING' }, { namn: 'PROJEKT' }, { namn: 'STARTAD' }, { namn: 'VARAKTIGHET', kol: 'varaktighet' }, { namn: 'STEG' }, { namn: 'GRINDAR' }, { namn: 'STATUS' }, { namn: 'COMMIT', kol: 'commit' }]) +
      '<tbody>' + kTraffar.map(function (kr) {
        return '<tr data-rad><td style="height:48px"><a href="#/korning/' + kr.id + '?steg=0" class="chip-mono" style="font-size:14px">' + esc(kr.id) + '</a></td>' +
          '<td style="font-family:var(--mono);font-size:14px">' + esc(kr.projekt) + '</td><td style="font-family:var(--mono);font-size:14px">' + esc(kr.startad) + '</td>' +
          '<td data-kol="varaktighet" style="font-family:var(--mono);font-size:14px">' + esc(kr.varaktighet) + '</td><td>' + esc(kr.steg) + '</td>' +
          '<td><span style="display:inline-flex;align-items:center;gap:4px">' + kr.grindstatus.map(function (s) { return romb(s); }).join('') + '<span style="font-size:14px">' + esc(kr.grindantal) + '</span></span></td>' +
          '<td data-status="1"><span style="display:flex;align-items:center;gap:8px;flex-wrap:wrap">' + statusPrick(kr.status) + chip('mock', 'chip-mock') + '</span></td>' +
          '<td data-kol="commit" style="font-family:var(--mono);font-size:14px">' + esc(kr.commit) + '</td></tr>';
      }).join('') + '</tbody></table>' +
      '<div class="notrad" style="margin-top:24px">Sortering: senaste först. <span style="font-family:var(--mono);font-size:14px">live</span>-filtret ger inga träffar i demot — ingen skarp körning finns.</div>';
  } else {
    out += tomtLage('Inga körningar matchar filtret', 'Demot innehåller bara mockade körningar.', 'python -m orkestrering demo ews', '<a href="#/korningar" data-rensa-korfilter="1">Rensa filter</a>');
  }
  return out;
}

function vyInstallningar() {
  var gitKontrakt = [
    { etikett: 'Repo', varde: 'anderscarlius/smedjan-med-agenter' }, { etikett: 'Gren', varde: 'main' },
    { etikett: 'Commit', varde: '659afb6' }, { etikett: 'Artefaktrot', varde: 'korningar/<projekt>/' },
    { etikett: 'Index', varde: 'korningar/ews/korning.json' }, { etikett: 'Schemaversion', varde: '1.0' },
    { etikett: 'Sökvägar', varde: 'repo-relativa, aldrig absoluta' }, { etikett: 'Skrivningar från portalen', varde: 'inga' }
  ];
  var faltlista = [
    { falt: 'schema_version', not: '', sand: false }, { falt: 'korning_id', not: '', sand: false },
    { falt: 'steg', not: '3 av 13 körda', sand: false }, { falt: 'grindar', not: '1 av 4 beslutade', sand: false },
    { falt: 'separation', not: '6 regler', sand: false }, { falt: 'stories', not: '6', sand: false },
    { falt: 'kostnad', not: '', sand: false }, { falt: 'ar_mock', not: 'sant', sand: false },
    { falt: 'framtida_steg', not: '3–11', sand: false },
    { falt: 'steg 12', not: 'ur processdefinitionen, saknas i indexet', sand: true }
  ];
  var lasatgarder = [
    { atgard: 'Fatta grindbeslut', anledning: 'Beslut fattas i Git i etapp 0.' },
    { atgard: 'Redigera artefakt', anledning: 'Artefakter ändras av agenter via PR, inte i portalen.' },
    { atgard: 'Starta körning', anledning: 'Körning startas från CLI.' },
    { atgard: 'Exportera docx/pdf', anledning: 'Export byggs i en senare etapp. Underlaget finns i Git.' },
    { atgard: 'Ändra konfiguration', anledning: 'Konfiguration bor i Git.' }
  ];

  var out = '<h1 class="sidtitel">Inställningar och datakällor</h1><p class="dek">Läsläge. Portalen läser Git och skriver ingenting. All konfiguration ändras i repot.</p>';
  out += '<div style="display:flex;flex-wrap:wrap;gap:8px;margin-top:16px">' + chip('läsläge') + mockChip() + chip('commit 659afb6', 'chip-mono') + '</div><hr class="avdelare">';

  out += '<section style="margin-bottom:48px;max-width:760px"><h2 class="sekrubrik">Git-kontrakt</h2><table data-def="1"><caption>Repo, gren, commit och sökvägar</caption><tbody>' +
    gitKontrakt.map(function (m) { return '<tr><th scope="row" style="width:220px;font-size:13px;font-weight:600;letter-spacing:0.06em;color:var(--brod);vertical-align:top">' + esc(m.etikett) + '</th><td style="font-family:var(--mono);font-size:14px">' + esc(m.varde) + '</td></tr>'; }).join('') + '</tbody></table></section>';

  out += '<section style="margin-bottom:48px;max-width:760px"><h2 class="sekrubrik">korning.json-status</h2><div style="border:1px solid var(--linje);border-left:3px solid var(--teal);border-radius:6px;padding:16px">' +
    '<p style="margin:0 0 12px;font-size:15px;color:var(--blick)">Hittad · schemaversion 1.0 · validerad mot kontraktet · läst <span style="font-family:var(--mono);font-size:14px">2026-09-03 14:12:09 UTC</span></p><ul style="list-style:none;margin:0;padding:0">' +
    faltlista.map(function (f) {
      return '<li style="padding:8px 0;border-bottom:1px solid var(--linje);border-left:' + (f.sand ? '3px' : '0px') + ' solid ' + (f.sand ? 'var(--sand-mork)' : 'transparent') + ';padding-left:' + (f.sand ? '12px' : '0px') + ';display:flex;gap:12px;align-items:baseline">' +
        '<span aria-hidden="true" style="color:var(--teal);font-size:14px">' + (f.sand ? '–' : '✓') + '</span><span style="font-family:var(--mono);font-size:14px;color:var(--blick);min-width:140px">' + esc(f.falt) + '</span><span style="font-size:14px;color:var(--brod)">' + esc(f.not) + '</span></li>';
    }).join('') + '</ul><p style="margin:12px 0 0;font-size:14px;color:var(--brod)"><span style="font-family:var(--mono)">ar_stub</span> finns på alla agenter i körningen.</p></div></section>';

  out += '<section style="margin-bottom:48px"><h2 class="sekrubrik">Datakällor</h2><table data-def="1"><caption>Datakällor portalen läser</caption>' +
    tabellHuvud([{ namn: 'KÄLLA' }, { namn: 'TYP' }, { namn: 'DATAKLASS', kol: 'dataklass' }, { namn: 'STATUS' }]) +
    '<tbody>' + M.DATAKALLOR.map(function (d) {
      var kant = d.sparrad ? 'var(--rodbrun)' : 'transparent';
      var bredd = d.sparrad ? '3px' : '0px';
      var klassfarg = d.dataklass === '2' ? 'var(--rodbrun)' : 'var(--blick)';
      var rutt = d.lank ? '#/artefakt/' + d.lank : '#/installningar';
      return '<tr><td style="border-left:' + bredd + ' solid ' + kant + ';font-family:var(--mono);font-size:14px;display:flex;align-items:center;gap:6px">' + (d.sparrad ? lockSvg(14) : '') + esc(d.kalla) + (d.sparrad ? ' <span style="font-size:13px;color:var(--rodbrun)">(endast intern)</span>' : '') + '</td>' +
        '<td>' + esc(d.typ) + '</td><td data-kol="dataklass" style="font-family:var(--mono);font-size:14px;color:' + klassfarg + '">' + esc(d.dataklass) + '</td>' +
        '<td>' + esc(d.status) + (d.lank ? ' <a href="' + rutt + '">Öppna →</a>' : '') + '</td></tr>';
    }).join('') + '</tbody></table></section>';

  out += '<section style="margin-bottom:48px;max-width:760px"><h2 class="sekrubrik">Läsläge</h2><div style="border:1px solid var(--linje);border-radius:6px;padding:16px">' +
    '<p style="margin:0 0 16px;font-size:15px;font-weight:600;color:var(--blick)">Portalen skriver aldrig till repot i demot.</p><ul style="list-style:none;margin:0;padding:0">' +
    lasatgarder.map(function (l) { return '<li style="padding:12px 0;border-top:1px solid var(--linje);display:flex;gap:16px;flex-wrap:wrap;align-items:center">' + knappInaktiv(l.atgard) + '<span style="font-size:14px;color:var(--blick)">' + esc(l.anledning) + '</span></li>'; }).join('') + '</ul></div></section>';

  out += '<section style="margin-bottom:32px;max-width:760px"><h2 class="sekrubrik">Kör lokalt</h2>' +
    '<div class="kommandoruta" style="margin-bottom:8px">python -m orkestrering demo ews --json</div><div class="kommandoruta">python -m http.server</div>' +
    '<p style="margin:8px 0 16px;font-size:14px;color:var(--brod)">i repo-roten</p><div class="notrad">Hela demot går att köra offline, utan nyckel.</div></section>';
  return out;
}

function vyHjalp() {
  var foreDemot = ['Kör demokommandot så indexet finns', 'Kontrollera att commit i toppfältet matchar repot', 'Projektor: läs sidan på tre meters avstånd', 'Ingen patientdata på skärmen — allt är syntetiskt'];
  var sagInte = ['AI genererade', 'automatiskt godkänt', 'produktion', 'modellen bestämde', 'inga modellnamn med versionssiffror — säg pool och familj'];
  var omNagonFragar = [
    { fraga: 'Var ligger beslutet?', svar: '— I Git, som fil, med underlag och SHA.' },
    { fraga: 'Vad kostar det?', svar: '— Noll i demot. Kostnad syns per steg när en nyckel finns.' },
    { fraga: 'Klass 2?', svar: '— Aldrig extern routing. Pool D är hårt spärrad.' }
  ];
  var out = '<h1 class="sidtitel">Demo-guide — femton minuter, EWS</h1><p class="dek">Vad du visar, i vilken ordning, och vad du säger. Klicka på en rad för att gå till vyn.</p><hr class="avdelare">';
  out += '<div class="tva"><div style="min-width:0"><table data-def="1"><caption>Demoagenda minut för minut</caption>' +
    tabellHuvud([{ namn: 'MINUT' }, { namn: 'VAD DU VISAR' }, { namn: 'VY' }, { namn: 'VAD DU SÄGER' }]) +
    '<tbody>' + M.DEMOGUIDE.map(function (d) {
      return '<tr data-rad><td style="font-family:var(--mono);font-size:14px"><a href="' + d.rutt + '">' + esc(d.minut) + '</a></td><td>' + esc(d.visar) + '</td><td><a href="' + d.rutt + '">' + esc(d.vy) + '</a></td><td style="color:var(--brod)">' + esc(d.sager) + '</td></tr>';
    }).join('') + '</tbody></table></div>';
  out += '<aside aria-label="Checklistor inför demot" style="display:flex;flex-direction:column;gap:24px;min-width:0">' +
    '<section style="border:1px solid var(--linje);border-radius:6px;padding:16px"><h2 class="panelrubrik" style="margin:0 0 12px">Före demot</h2>' +
    foreDemot.map(function (c) { return '<label style="display:flex;gap:12px;align-items:flex-start;padding:6px 0;font-size:14px;color:var(--blick)"><input type="checkbox"><span>' + esc(c) + '</span></label>'; }).join('') + '</section>' +
    '<section style="border:1px solid var(--linje);border-radius:6px;padding:16px"><h2 class="panelrubrik" style="margin:0 0 12px">Säg inte</h2><ul style="list-style:none;margin:0;padding:0">' +
    sagInte.map(function (s) { return '<li style="padding:6px 0;border-bottom:1px solid var(--linje);font-size:14px;color:var(--blick)">' + esc(s) + '</li>'; }).join('') + '</ul></section>' +
    '<section style="border:1px solid var(--linje);border-radius:6px;padding:16px"><h2 class="panelrubrik" style="margin:0 0 12px">Om någon frågar</h2>' +
    omNagonFragar.map(function (q) { return '<p style="margin:0 0 8px;font-size:14px;color:var(--brod)"><span style="font-weight:600;color:var(--blick)">' + esc(q.fraga) + '</span> ' + esc(q.svar) + '</p>'; }).join('') + '</section></aside></div>';
  out += '<div style="display:flex;gap:24px;flex-wrap:wrap;border-top:1px solid var(--linje);margin-top:32px;padding-top:16px">' +
    '<a href="#/systemtillstand">Systemtillstånd (designreferens) →</a><a href="#/tokens">Designtokens →</a><a href="#/komponenter">Komponentbibliotek →</a><a href="#/design">Designindex →</a></div>';
  return out;
}

function vySystemtillstand(route) {
  var del = route.query.del === 'b';
  var out = '<h1 class="sidtitel">Systemtillstånd</h1><p class="dek">Designreferens. Varje tillstånd som portalens vyer måste klara, med exakt mikrocopy.</p>';
  out += '<p style="margin:16px 0 0"><a href="' + (del ? '#/systemtillstand' : '#/systemtillstand?del=b') + '">' + (del ? '← Systemtillstånd A' : 'Systemtillstånd B →') + '</a></p><hr class="avdelare">';

  if (!del) {
    out += '<div class="kort2" style="grid-template-columns:repeat(2,minmax(0,520px))">';
    out += '<section style="border:1px solid var(--linje);border-radius:6px;padding:24px"><div style="font-size:13px;font-weight:600;letter-spacing:0.06em;color:var(--brod)">GÄLLER: DATATABELL, KÖRNINGSDETALJ · K24</div>' +
      '<h2 class="panelrubrik" style="margin:8px 0 16px">Laddar</h2><p role="status" style="margin:0 0 12px;font-size:15px;color:var(--blick)">Läser <span style="font-family:var(--mono);font-size:14px">korningar/ews/korning.json</span> …</p>' +
      '<div style="display:flex;flex-direction:column;gap:8px"><span class="laddar-linje"></span><span class="laddar-linje"></span><span class="laddar-linje" style="width:70%"></span><span class="laddar-linje" style="width:40%"></span></div>' +
      '<p style="margin:16px 0 0;font-size:14px;color:var(--brod)">Ingen spinner. Ingen skelettpuls.</p></section>';
    out += '<section style="border:1px solid var(--linje);border-radius:6px;padding:24px"><div style="font-size:13px;font-weight:600;letter-spacing:0.06em;color:var(--brod)">GÄLLER: ÖVERSIKT, KÖRNINGAR · K23</div>' +
      '<h2 class="panelrubrik" style="margin:8px 0 16px">Tomt</h2><p style="margin:0 0 12px;font-size:15px;color:var(--blick)">Ingen körning hittad</p><p style="margin:0 0 12px;font-size:15px;color:var(--brod)">Portalen läser <span style="font-family:var(--mono);font-size:14px">korningar/&lt;projekt&gt;/korning.json</span>.</p>' +
      '<div class="kommandoruta">python -m orkestrering demo ews</div><p style="margin:16px 0 0;font-size:14px;color:var(--brod)">Åtgärd: <a href="#/oversikt?tomt=1">Öppna tomt läge</a></p></section>';
    out += '<section class="varningsrad" style="padding:24px"><div style="font-size:13px;font-weight:600;letter-spacing:0.06em;color:var(--brod)">GÄLLER: ALLA VYER · K22</div>' +
      '<h2 class="panelrubrik" style="margin:8px 0 16px">Fel</h2><p role="alert" style="margin:0;font-size:15px;color:var(--blick)">Indexet kunde inte tolkas</p>' +
      '<p style="margin:8px 0 0;font-size:15px;color:var(--brod)"><span style="font-family:var(--mono);font-size:14px">korning.json</span> har schemaversion <span style="font-family:var(--mono);font-size:14px">2.0</span>. Portalen kan läsa <span style="font-family:var(--mono);font-size:14px">1.0</span>. Ingen data visas — hellre tomt än gissat.</p>' +
      '<p style="margin:16px 0 0;font-size:14px;color:var(--brod)">Åtgärd: uppdatera portalen eller skriv om indexet.</p></section>';
    out += '<section class="varningsrad" style="padding:24px"><div style="font-size:13px;font-weight:600;letter-spacing:0.06em;color:var(--brod)">GÄLLER: KÖRNINGSDETALJ · K22, K5</div>' +
      '<h2 class="panelrubrik" style="margin:8px 0 16px">Blockerad</h2><p style="margin:0 0 8px;font-size:15px;color:var(--blick)">Steg 2 stannade — S5 utlöst</p><p style="margin:0 0 12px;font-size:15px;color:var(--brod)">Tre varv av tre. En människa kopplas in.</p>' +
      '<div style="display:flex;gap:16px;align-items:center;flex-wrap:wrap">' + statusPrick('blockerad') + '<span style="font-size:15px;color:var(--blick)">G2: ej nådd</span></div>' +
      '<p style="margin:16px 0 0;font-size:14px;color:var(--brod)">Åtgärd: <a href="#/korning/ews-2026-09-03T11-04-52Z?steg=2">Öppna blockerad körning</a></p></section>';
    out += '</div>';
  } else {
    out += '<div class="kort2" style="grid-template-columns:repeat(2,minmax(0,520px))">';
    out += '<section style="border:1px solid var(--linje);border-radius:6px;padding:24px"><div style="font-size:13px;font-weight:600;letter-spacing:0.06em;color:var(--brod)">GÄLLER: ÖVERSIKT · K23</div>' +
      '<h2 class="panelrubrik" style="margin:8px 0 16px">Ingen korning.json</h2><p style="margin:0 0 8px;font-size:15px;color:var(--blick)">Inget index i repot</p>' +
      '<p style="margin:0 0 12px;font-size:15px;color:var(--brod)">Filen <span style="font-family:var(--mono);font-size:14px">korningar/ews/korning.json</span> finns inte i commit <span style="font-family:var(--mono);font-size:14px">659afb6</span>. Markdown-filerna kan finnas — portalen läser dem inte utan index.</p>' +
      '<div class="kommandoruta">python -m orkestrering demo ews</div></section>';
    out += '<section style="border:1px solid var(--linje);border-radius:6px;padding:24px"><div style="font-size:13px;font-weight:600;letter-spacing:0.06em;color:var(--brod)">GÄLLER: KÖRNINGSDETALJ, ARTEFAKT · K12, K23</div>' +
      '<h2 class="panelrubrik" style="margin:8px 0 16px">Inga artefakter</h2><p style="margin:0 0 8px;font-size:15px;color:var(--blick)">Steget producerade ingen artefakt</p><p style="margin:0 0 12px;font-size:15px;color:var(--brod)">Steg 2 är markerat som <span style="font-family:var(--mono);font-size:14px">overhoppad</span> i indexet. Ingen fil att visa.</p>' +
      '<p style="margin:0 0 4px;font-size:15px;color:var(--blick)">Steget är inte kört</p><p style="margin:0;font-size:15px;color:var(--brod)">Körs i en senare etapp.</p>' +
      '<p style="margin:16px 0 0;font-size:14px;color:var(--brod)">Åtgärd: <a href="#/korning/ews-2026-09-03T14-12-08Z?steg=7">Öppna framtida steg</a></p></section>';
    out += '<section class="varningsrad" style="padding:24px"><div style="font-size:13px;font-weight:600;letter-spacing:0.06em;color:var(--brod)">GÄLLER: SEPARATION, INSTÄLLNINGAR · K10, K22</div>' +
      '<h2 class="panelrubrik" style="margin:8px 0 16px">Klass 2 blockerad</h2><div style="display:flex;gap:8px;align-items:center;margin-bottom:12px">' + klass2Badge() + '</div>' +
      '<p style="margin:0 0 8px;font-size:15px;color:var(--blick)">Klass 2 — endast intern modell</p><p style="margin:0;font-size:15px;color:var(--brod)">Aldrig extern routing. Pool D är hårt spärrad. Begärd pool C avvisades, steget startade inte (S6: ingen tyst degradering).</p>' +
      '<p style="margin:16px 0 0;font-size:14px;color:var(--brod)">Åtgärd: <a href="#/separation?klass2=blockerad">Öppna spärren</a></p></section>';
    out += '<section style="border:1px solid var(--linje);border-left:3px solid var(--sand-mork);border-radius:6px;padding:24px"><div style="font-size:13px;font-weight:600;letter-spacing:0.06em;color:var(--brod)">GÄLLER: ALLA VYER · K1, K21</div>' +
      '<h2 class="panelrubrik" style="margin:8px 0 16px">Gammal data</h2><p style="margin:0 0 8px;font-size:15px;color:var(--blick)">Vyn kan vara gammal</p>' +
      '<p style="margin:0 0 12px;font-size:15px;color:var(--brod)">Indexet är skrivet vid commit <span style="font-family:var(--mono);font-size:14px">659afb6</span>. Repots HEAD är <span style="font-family:var(--mono);font-size:14px">a1c9d34</span>. Kör om demokommandot för att skriva ett nytt index.</p>' +
      '<div class="kommandoruta">python -m orkestrering demo ews</div><p style="margin:16px 0 0;font-size:14px;color:var(--brod)">Portalen jämför bara commit-strängar — den gissar aldrig vad som ändrats.</p></section>';
    out += '</div>';
  }
  return out;
}

function vyTokens() {
  var allaStatus = ['klar', 'kor', 'vantar', 'blockerad', 'fel', 'overhoppad'];
  var raster = [4, 8, 16, 24, 32, 40, 48, 64];
  var out = '<h1 class="sidtitel">Ark: designtokens</h1><p class="dek">Färg, typografi, raster, radie och status. Identiskt med tokensystemet i koden.</p><hr class="avdelare">';
  out += '<section style="margin-bottom:48px"><h2 class="sekrubrik">Färg</h2><table data-def="1"><caption>Färgtokens med hex, roll och tillåten användning</caption>' +
    tabellHuvud([{ namn: 'PROV' }, { namn: 'TOKEN' }, { namn: 'HEX' }, { namn: 'ROLL OCH TILLÅTEN ANVÄNDNING' }]) +
    '<tbody>' + M.TOKENS.map(function (t) { return '<tr><td><span style="display:block;width:48px;height:24px;border:1px solid var(--linje);border-radius:3px;background:' + t.varde + '"></span></td><td style="font-family:var(--mono);font-size:14px">' + t.token + '</td><td style="font-family:var(--mono);font-size:14px">' + t.varde + '</td><td style="color:var(--brod)">' + esc(t.roll) + '</td></tr>'; }).join('') + '</tbody></table></section>';
  out += '<section style="margin-bottom:48px"><h2 class="sekrubrik">Typografi</h2><div style="display:flex;flex-direction:column;gap:16px;border:1px solid var(--linje);border-radius:6px;padding:24px;max-width:760px">' +
    '<div style="font-family:var(--serif);font-size:28px;color:var(--blick)">Sidtitel H1 — serif 28/36</div>' +
    '<div style="font-family:var(--serif);font-size:22px;color:var(--blick)">Sektionsrubrik H2 — serif 22/30</div>' +
    '<div style="font-family:var(--serif);font-size:17px;color:var(--blick)">Panelrubrik H3 — serif 17/24</div>' +
    '<div style="font-size:15px;color:var(--brod)">Brödtext — systemsans 15/24</div>' +
    '<div style="font-size:15px;font-weight:600;color:var(--blick)">Brödtext betonad — systemsans 600 15/24</div>' +
    '<div style="font-size:14px;color:var(--brod)">Liten text — systemsans 14/20</div>' +
    '<div style="font-size:13px;font-weight:600;letter-spacing:0.06em;color:var(--brod)">ETIKETT OCH TABELLHUVUD — 13/16</div>' +
    '<div style="font-family:var(--mono);font-size:14px;color:var(--blick)">Identifierare, sökvägar, belopp — mono 14/20</div>' +
    '<div style="font-size:16px;font-weight:600;color:var(--blick)">Tidslinje stegnamn — 16/22</div></div></section>';
  out += '<section style="margin-bottom:48px"><h2 class="sekrubrik">Raster och radie</h2><div style="display:flex;flex-direction:column;gap:8px;max-width:760px">' +
    raster.map(function (n) { return '<div style="display:flex;align-items:center;gap:16px"><span style="font-family:var(--mono);font-size:14px;color:var(--blick);width:40px">' + n + '</span><span style="display:block;height:1px;background:var(--teal);width:' + n + 'px"></span></div>'; }).join('') +
    '<div style="display:flex;gap:24px;margin-top:16px"><span style="display:inline-flex;align-items:center;justify-content:center;width:96px;height:48px;border:1px solid var(--linje);border-radius:6px;font-size:14px;color:var(--blick)">radie 6</span><span style="display:inline-flex;align-items:center;justify-content:center;width:96px;height:48px;border:1px solid var(--linje);border-radius:3px;font-size:14px;color:var(--blick)">radie 3</span></div></div></section>';
  out += '<section style="margin-bottom:32px"><h2 class="sekrubrik">Status, badge och chip</h2><div style="display:flex;gap:24px;flex-wrap:wrap;border:1px solid var(--linje);border-radius:6px;padding:24px">' +
    allaStatus.map(function (st) { return statusPrick(st); }).join('') + '</div>' +
    '<div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:16px">' + mockChip() + chip('klass 0', 'chip-teal') + chip('klass 1', 'chip-mock') + klass2Badge() + chip('A0 · Intag', 'chip-mono') + chip('pool A · Anthropic', 'chip-mono') + '</div></section>';
  return out;
}

function vyKomponenter() {
  var allaStatus = ['klar', 'kor', 'vantar', 'blockerad', 'fel', 'overhoppad'];
  var allaGrindstatus = [{ status: 'godkand', ord: 'godkänd' }, { status: 'vantar', ord: 'väntar' }, { status: 'ej_nadd', ord: 'ej nådd' }, { status: 'aterremiss', ord: 'återremiss' }];
  var out = '<h1 class="sidtitel">Ark: komponentbibliotek</h1><p class="dek">K1–K32 med ansvar och de tillstånd varje komponent måste klara.</p><hr class="avdelare">';
  out += '<section style="margin-bottom:48px"><h2 class="sekrubrik">Levande tillstånd</h2><div style="border:1px solid var(--linje);border-radius:6px;padding:24px;display:flex;flex-direction:column;gap:24px">';
  out += '<div><div style="font-size:13px;font-weight:600;letter-spacing:0.06em;color:var(--brod);margin-bottom:8px">K7 STATUSPRICK — ALLA SEX</div><div style="display:flex;gap:24px;flex-wrap:wrap">' + allaStatus.map(function (st) { return statusPrick(st); }).join('') + '</div></div>';
  out += '<div><div style="font-size:13px;font-weight:600;letter-spacing:0.06em;color:var(--brod);margin-bottom:8px">K6 GRINDROMB — GODKÄND, VÄNTAR, EJ NÅDD, ÅTERREMISS</div><div style="display:flex;gap:24px;flex-wrap:wrap;align-items:center">' +
    allaGrindstatus.map(function (gs) { return '<span style="display:inline-flex;align-items:center;gap:8px">' + romb(gs.status) + '<span style="font-size:14px;color:var(--blick)">' + gs.ord + '</span></span>'; }).join('') + '</div></div>';
  out += '<div><div style="font-size:13px;font-weight:600;letter-spacing:0.06em;color:var(--brod);margin-bottom:8px">K32 INAKTIV KNAPPGRUPP — MED OBLIGATORISK ANLEDNING</div><div style="display:flex;gap:8px;flex-wrap:wrap">' +
    knappInaktiv('Godkänn') + '<button type="button" class="knapp knapp-primar">Primärknapp</button><button type="button" class="knapp knapp-sekundar">Sekundärknapp</button></div><p style="margin:8px 0 0;font-size:14px;color:var(--blick)">Beslut fattas i Git i etapp 0.</p></div>';
  out += '<div><div style="font-size:13px;font-weight:600;letter-spacing:0.06em;color:var(--brod);margin-bottom:8px">K21 NOTRAD · K22 VARNINGSRAD · K25 KOMMANDORUTA · K24 LADDAR</div>' +
    '<div class="notrad" style="margin-bottom:16px">Notrad — regler och förtydliganden.</div>' +
    '<div class="varningsrad" style="margin-bottom:16px"><span style="font-family:var(--serif);font-size:17px;color:var(--blick)">Varningsrad</span><p style="margin:4px 0 0;font-size:15px;color:var(--blick)">Blockerad, fel eller spärr.</p></div>' +
    '<div class="kommandoruta" style="margin-bottom:16px">python -m orkestrering demo ews</div>' +
    '<p role="status" style="margin:0 0 8px;font-size:15px;color:var(--blick)">Läser korning.json …</p><div style="display:flex;flex-direction:column;gap:8px;max-width:400px"><span class="laddar-linje"></span><span class="laddar-linje" style="width:60%"></span></div></div>';
  out += '</div></section>';
  out += '<section style="margin-bottom:32px"><h2 class="sekrubrik">Inventarium K1–K32</h2><table data-def="1"><caption>Komponentinventarium med ansvar och tillstånd</caption>' +
    tabellHuvud([{ namn: 'K' }, { namn: 'KOMPONENT' }, { namn: 'ANSVAR' }, { namn: 'TILLSTÅND' }]) +
    '<tbody>' + M.KOMPONENTER.map(function (kp) { return '<tr><td style="font-family:var(--mono);font-size:14px">' + kp.k + '</td><td style="font-family:var(--mono);font-size:14px">' + esc(kp.namn) + '</td><td>' + esc(kp.ansvar) + '</td><td style="color:var(--brod)">' + esc(kp.tillstand) + '</td></tr>'; }).join('') + '</tbody></table></section>';
  return out;
}

function vyTillganglighet() {
  var out = '<h1 class="sidtitel">Ark: tillgänglighet</h1><p class="dek">Fokus, tab-ordning, kontrast, gråskala och glyfer. WCAG 2.2 AA.</p><hr class="avdelare">';
  out += '<section style="margin-bottom:48px;max-width:760px"><h2 class="sekrubrik">Fokus</h2><p style="margin:0 0 16px;font-size:15px;color:var(--brod)">Fokusring: 2 px <span style="font-family:var(--mono);font-size:14px">--teal</span> med 2 px offset. På tealfylld yta: 2 px <span style="font-family:var(--mono);font-size:14px">--blick</span>. Aldrig <span style="font-family:var(--mono);font-size:14px">outline: none</span>. Tabba genom raden nedan för att se den.</p>' +
    '<div style="display:flex;gap:16px;flex-wrap:wrap;align-items:center"><a href="#/tillganglighet">Textlänk</a><button type="button" class="knapp knapp-primar">Primärknapp</button><button type="button" class="knapp knapp-sekundar">Sekundärknapp</button>' + knappInaktiv('Inaktiv men fokuserbar') + '<input type="checkbox" aria-label="Exempelkryssruta"></div></section>';
  out += '<section style="margin-bottom:48px;max-width:760px"><h2 class="sekrubrik">Tab-ordning</h2><ol style="margin:0;padding-left:24px;font-size:15px;color:var(--blick)"><li>Skip-länk «Hoppa till innehåll»</li><li>Toppfält</li><li>Sidnav</li><li>Innehåll</li><li>Sidopanel</li><li>Sidfot</li></ol>' +
    '<h3 class="panelrubrik">Tangentbordsmönster</h3><p style="margin:0 0 4px;font-size:15px;color:var(--brod)">Tidslinje: roving tabindex, <span style="font-family:var(--mono);font-size:14px">ArrowUp</span> / <span style="font-family:var(--mono);font-size:14px">ArrowDown</span> mellan rader, <span style="font-family:var(--mono);font-size:14px">Home</span> / <span style="font-family:var(--mono);font-size:14px">End</span>, <span style="font-family:var(--mono);font-size:14px">Enter</span> väljer.</p>' +
    '<p style="margin:0 0 4px;font-size:15px;color:var(--brod)">Drawer: fokus till rubriken, <span style="font-family:var(--mono);font-size:14px">Esc</span> stänger.</p>' +
    '<p style="margin:0;font-size:15px;color:var(--brod)">Modal: <span style="font-family:var(--mono);font-size:14px">role="dialog"</span>, <span style="font-family:var(--mono);font-size:14px">aria-modal</span>, «Stäng» först och sist, <span style="font-family:var(--mono);font-size:14px">Esc</span> stänger.</p></section>';
  out += '<section style="margin-bottom:48px"><h2 class="sekrubrik">Kontrast</h2><table data-def="1" style="max-width:760px"><caption>Uppmätt kontrast för palettens kombinationer</caption>' +
    tabellHuvud([{ namn: 'KOMBINATION' }, { namn: 'KONTRAST' }, { namn: 'FÅR ANVÄNDAS TILL' }]) +
    '<tbody>' + M.KONTRAST.map(function (kt) { return '<tr><td style="font-family:var(--mono);font-size:14px">' + esc(kt.komb) + '</td><td style="font-family:var(--mono);font-size:14px">' + esc(kt.varde) + '</td><td style="color:var(--brod)">' + esc(kt.anv) + '</td></tr>'; }).join('') + '</tbody></table></section>';
  out += '<section style="margin-bottom:32px"><h2 class="sekrubrik">Gråskala och glyfer</h2><div style="border:1px solid var(--linje);border-radius:6px;padding:24px;filter:grayscale(1);display:flex;gap:24px;flex-wrap:wrap;margin-bottom:16px">' +
    ['klar', 'kor', 'vantar', 'blockerad', 'fel', 'overhoppad'].map(function (st) { return statusPrick(st); }).join('') + '</div>' +
    '<div style="display:flex;gap:32px;align-items:center;border:1px solid var(--linje);border-radius:6px;padding:24px;flex-wrap:wrap">' +
    '<span style="font-size:15px;color:var(--blick)">✓ bock</span>' +
    '<span style="display:inline-flex;align-items:center;gap:8px;font-size:15px;color:var(--blick)">' + romb('godkand') + 'romb</span>' +
    '<span style="display:inline-flex;align-items:center;gap:8px;font-size:15px;color:var(--blick)"><span style="width:12px;height:12px;border-radius:50%;background:var(--teal);display:inline-block"></span>prick fylld</span>' +
    '<span style="display:inline-flex;align-items:center;gap:8px;font-size:15px;color:var(--blick)"><span style="width:12px;height:12px;border-radius:50%;border:1px solid var(--dampad);display:inline-block"></span>prick ofylld</span>' +
    '<span style="display:inline-flex;align-items:center;gap:8px;font-size:15px;color:var(--rodbrun)">' + lockSvg(12) + 'hänglås</span>' +
    '<span style="display:inline-flex;align-items:center;gap:8px;font-size:15px;color:var(--blick)"><span style="width:24px;height:1px;background:var(--linje);display:inline-block"></span>1 px linje</span></div></section>';
  return out;
}

function vyDesign() {
  var out = '<h1 class="sidtitel">Designindex</h1><p class="dek">Alla 41 artboards med bredd, rutt och sidfamilj. Varje rad är en länk. 1280- och 768-artboards visas genom att smalna av fönstret till angiven bredd — samma rutt, annan layout.</p><hr class="avdelare">';
  out += '<table data-def="1"><caption>Alla artboards med rutt och sidfamilj</caption>' + tabellHuvud([{ namn: '#' }, { namn: 'ARTBOARD' }, { namn: 'BREDD' }, { namn: 'RUTT' }, { namn: 'SIDFAMILJ' }]) +
    '<tbody>' + M.ARTBOARDS.map(function (ab) {
      return '<tr data-rad><td style="font-family:var(--mono);font-size:14px"><a href="' + ab.rutt + '">' + ab.nr + '</a></td><td>' + esc(ab.namn) + '</td><td style="font-family:var(--mono);font-size:14px">' + ab.bredd + '</td><td style="font-family:var(--mono);font-size:14px"><a href="' + ab.rutt + '">' + esc(ab.rutt) + '</a></td><td style="font-family:var(--mono);font-size:14px">' + ab.familj + '</td></tr>';
    }).join('') + '</tbody></table>';
  return out;
}

/* ---------- routing / render ---------- */

function navHtml(vy) {
  return NAV.map(function (g) {
    return '<div class="navgrupp"><div class="navetikett">' + esc(g.etikett) + '</div><ul class="navlista">' +
      g.rader.map(function (r) {
        var aktiv = r.vy === vy;
        return '<li><a class="navrad" href="' + r.rutt + '"' + (aktiv ? ' aria-current="page"' : '') + ' style="--navkant:' + (aktiv ? 'var(--teal)' : 'transparent') + ';--navfarg:' + (aktiv ? 'var(--blick)' : 'var(--brod)') + '">' + esc(r.namn) + '</a></li>';
      }).join('') + '</ul></div>';
  }).join('');
}

function etiketter() {
  document.querySelectorAll('table[data-def]').forEach(function (t) {
    var rubriker = Array.prototype.slice.call(t.querySelectorAll('thead th')).map(function (h) { return h.textContent.trim(); });
    if (!rubriker.length) return;
    t.querySelectorAll('tbody tr').forEach(function (tr) {
      Array.prototype.slice.call(tr.children).forEach(function (cell, i) { if (rubriker[i]) cell.setAttribute('data-etikett', rubriker[i]); });
    });
  });
}

/* ---------- intag-vy (Word-uppladdning) ---------- */

function vyIntag(route) {
  var mall = route.query.mall || 'forslagsspec';
  
  var out = '<h1 class="sidtitel">Intag (Word)</h1>';
  out += '<p class="dek">Ladda upp en ifylld förslagsspec (.docx), se vad som är ifyllt och vad som saknas, och exportera tillbaka till Word.</p>';
  
  out += '<div style="border:1px solid var(--sand-mork);border-radius:6px;background:var(--sand-ljus);padding:16px;margin:16px 0">';
  out += '<p style="margin:0;font-size:14px;line-height:20px;color:var(--blick)">Filen stannar i din webbläsare — laddas inte upp till server i demot.</p>';
  out += '</div>';
  
  out += '<hr class="avdelare">';
  
  // Uppladdningsområde
  out += '<section id="intag-uppladdning" style="margin-bottom:32px">';
  out += '<h2 class="sekrubrik">1. Ladda upp förslagsspec (.docx)</h2>';
  out += '<div id="intag-drop-zone" style="border:2px dashed var(--linje);border-radius:6px;padding:40px;text-align:center;cursor:pointer;background:var(--yta-2)" tabindex="0" role="button" aria-label="Ladda upp Word-fil">';
  out += '<p style="margin:0 0 12px;font-size:15px;color:var(--brod)">Dra och släpp en .docx-fil här eller klicka för att välja fil</p>';
  out += '<input type="file" id="intag-file-input" accept=".docx" style="display:none">';
  out += '<button class="knapp knapp-sekundar" onclick="document.getElementById(\'intag-file-input\').click()">Välj fil</button>';
  out += '</div>';
  out += '<div id="intag-fil-info" style="margin-top:16px;display:none">';
  out += '<p style="margin:0;font-size:14px;color:var(--blick)"><strong>Fil:</strong> <span id="intag-fil-namn"></span> (<span id="intag-fil-storlek"></span>)</p>';
  out += '</div>';
  out += '</section>';
  
  // Valideringsresultat (visas efter uppladdning)
  out += '<section id="intag-resultat" style="display:none">';
  out += '<h2 class="sekrubrik">2. Validering mot mall</h2>';
  out += '<div id="intag-sammanfattning" style="border:1px solid var(--linje);border-radius:6px;padding:16px;margin-bottom:24px"></div>';
  out += '<div id="intag-sektioner"></div>';
  out += '</section>';
  
  // Export (visas när uppladdning gjorts)
  out += '<section id="intag-export" style="display:none;margin-top:32px">';
  out += '<hr class="avdelare">';
  out += '<h2 class="sekrubrik">3. Exportera till Word</h2>';
  out += '<button class="knapp knapp-primar" id="intag-export-btn">Ladda ner .docx</button>';
  out += '</section>';
  
  return out;
}

var lastVy = null, lastKorningRest = null;

function render() {
  var route = parseHash(location.hash);
  document.getElementById('sidnav').innerHTML = navHtml(route.vy);

  var main = document.getElementById('innehall');
  var html;
  switch (route.vy) {
    case 'oversikt': html = vyOversikt(route); break;
    case 'korning': html = vyKorningsdetalj(route); break;
    case 'artefakt': html = vyArtefakt(route); break;
    case 'grind': html = vyGrind(route); break;
    case 'stories': html = vyStories(route); break;
    case 'intag': html = vyIntag(route); break;
    case 'agenter': html = vyAgenter(route); break;
    case 'separation': html = vySeparation(route); break;
    case 'kostnad': html = vyKostnad(route); break;
    case 'korningar': html = vyKorningar(route); break;
    case 'installningar': html = vyInstallningar(); break;
    case 'hjalp': html = vyHjalp(); break;
    case 'systemtillstand': html = vySystemtillstand(route); break;
    case 'tokens': html = vyTokens(); break;
    case 'komponenter': html = vyKomponenter(); break;
    case 'tillganglighet': html = vyTillganglighet(); break;
    case 'design': html = vyDesign(); break;
    default: html = vyOversikt(route);
  }
  main.innerHTML = html;
  etiketter();
  wireEvents(route);
  handleFocusAfterRender(route);
}

function wireEvents(route) {
  var tl = document.querySelector('[data-tidslinje-lista]');
  if (tl) tl.addEventListener('keydown', tangenthantering);

  document.querySelectorAll('[data-filtergrupp]').forEach(function (btn) {
    btn.addEventListener('click', function () { satFilter('filter', btn.getAttribute('data-filtergrupp'), btn.getAttribute('data-filterval')); });
  });
  var rensaStory = document.querySelector('[data-rensa-storyfilter]');
  if (rensaStory) rensaStory.addEventListener('click', function () { state.filter = { status: 'alla', uppskattning: 'alla', beroenden: 'alla' }; render(); });

  document.querySelectorAll('[data-korfiltergrupp]').forEach(function (btn) {
    btn.addEventListener('click', function (e) {
      e.preventDefault();
      state.korfilter[btn.getAttribute('data-korfiltergrupp')] = btn.getAttribute('data-korfilterval');
      render();
    });
  });
  var rensaKor = document.querySelector('[data-rensa-korfilter]');
  if (rensaKor) rensaKor.addEventListener('click', function (e) { e.preventDefault(); state.korfilter = { projekt: 'alla', status: 'alla', dataklass: 'alla', period: 'alla' }; render(); });

  if (route.vy === 'korning' && route.query.modal === '1') {
    var modalEl = document.querySelector('.modal-bakgrund .modal');
    if (modalEl && state.focusTrapCleanup) { state.focusTrapCleanup(); state.focusTrapCleanup = null; }
    if (modalEl) state.focusTrapCleanup = installFocusTrap(modalEl);
  } else if (state.focusTrapCleanup) {
    state.focusTrapCleanup(); state.focusTrapCleanup = null;
  }
  var drawerEl = document.querySelector('aside[data-drawer]');
  if (drawerEl && !(route.vy === 'korning' && route.query.modal === '1')) {
    installFocusTrap(drawerEl);
  }
  
  // Intag-vy event handlers
  if (route.vy === 'intag') {
    wireIntagEvents();
  }
}

// Hjälpfunktioner för intag
var intagState = { parsedSections: {}, formData: {} };

function wireIntagEvents() {
  var fileInput = document.getElementById('intag-file-input');
  var dropZone = document.getElementById('intag-drop-zone');
  var exportBtn = document.getElementById('intag-export-btn');
  
  if (!fileInput || !dropZone) return;
  
  // File input change
  fileInput.addEventListener('change', function(e) {
    if (e.target.files.length > 0) {
      handleIntagFile(e.target.files[0]);
    }
  });
  
  // Drop zone click
  dropZone.addEventListener('click', function() {
    fileInput.click();
  });
  
  // Drag and drop
  dropZone.addEventListener('dragover', function(e) {
    e.preventDefault();
    e.stopPropagation();
    dropZone.style.borderColor = 'var(--teal)';
    dropZone.style.background = 'var(--yta-2)';
  });
  
  dropZone.addEventListener('dragleave', function(e) {
    e.preventDefault();
    e.stopPropagation();
    dropZone.style.borderColor = 'var(--linje)';
    dropZone.style.background = 'var(--yta-2)';
  });
  
  dropZone.addEventListener('drop', function(e) {
    e.preventDefault();
    e.stopPropagation();
    dropZone.style.borderColor = 'var(--linje)';
    dropZone.style.background = 'var(--yta-2)';
    
    if (e.dataTransfer.files.length > 0) {
      var file = e.dataTransfer.files[0];
      if (file.name.endsWith('.docx')) {
        handleIntagFile(file);
      } else {
        alert('Välj en .docx-fil');
      }
    }
  });
  
  // Keyboard support for drop zone
  dropZone.addEventListener('keydown', function(e) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      fileInput.click();
    }
  });
  
  // Export button
  if (exportBtn) {
    exportBtn.addEventListener('click', function() {
      exportIntagDocx();
    });
  }
}

function handleIntagFile(file) {
  var filInfo = document.getElementById('intag-fil-info');
  var filNamn = document.getElementById('intag-fil-namn');
  var filStorlek = document.getElementById('intag-fil-storlek');
  
  filNamn.textContent = file.name;
  filStorlek.textContent = formatBytes(file.size);
  filInfo.style.display = 'block';
  
  // Läs och parsa filen
  var reader = new FileReader();
  reader.onload = function(e) {
    parseIntagDocx(e.target.result);
  };
  reader.readAsArrayBuffer(file);
}

function formatBytes(bytes) {
  if (bytes === 0) return '0 B';
  var k = 1024;
  var sizes = ['B', 'KB', 'MB'];
  var i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

function parseIntagDocx(arrayBuffer) {
  if (typeof mammoth === 'undefined') {
    alert('Mammoth-biblioteket är inte laddat. Kontrollera att vendor-filerna är inkluderade.');
    return;
  }
  
  mammoth.convertToHtml({ arrayBuffer: arrayBuffer })
    .then(function(result) {
      var html = result.value;
      extractSections(html);
    })
    .catch(function(err) {
      console.error('Fel vid parsing av docx:', err);
      alert('Kunde inte läsa Word-filen. Kontrollera att filen är en giltig .docx-fil.');
    });
}

function extractSections(html) {
  var obligatoriska = ['Titel', 'Beskrivning', 'Användarnytta', 'Funktionella krav', 'Dataklass', 'Sekretessbedömning'];
  var valfria = ['Tekniska begränsningar', 'Öppna frågor'];
  var allaSektioner = obligatoriska.concat(valfria);
  
  // Parsa HTML och extrahera sektioner baserat på Heading 1 eller starka rubriker
  var parser = new DOMParser();
  var doc = parser.parseFromString(html, 'text/html');
  
  var sections = {};
  var currentSection = null;
  var currentContent = [];
  
  // Gå igenom alla element
  var elements = doc.body.querySelectorAll('*');
  elements.forEach(function(el) {
    var tagName = el.tagName.toLowerCase();
    var text = el.textContent.trim();
    
    // Kolla om det är en rubrik
    if ((tagName === 'h1' || tagName === 'h2' || (tagName === 'p' && el.querySelector('strong'))) && text) {
      // Spara föregående sektion
      if (currentSection) {
        sections[currentSection] = currentContent.join('\n').trim();
      }
      
      // Hitta matchande sektion
      var matched = null;
      for (var i = 0; i < allaSektioner.length; i++) {
        if (text.toLowerCase().indexOf(allaSektioner[i].toLowerCase()) !== -1) {
          matched = allaSektioner[i];
          break;
        }
      }
      
      if (matched) {
        currentSection = matched;
        currentContent = [];
      } else {
        currentSection = null;
      }
    } else if (currentSection && text && tagName !== 'h1' && tagName !== 'h2') {
      // Lägg till innehåll till nuvarande sektion
      currentContent.push(text);
    }
  });
  
  // Spara sista sektionen
  if (currentSection) {
    sections[currentSection] = currentContent.join('\n').trim();
  }
  
  intagState.parsedSections = sections;
  intagState.formData = Object.assign({}, sections);
  
  // Visa resultat
  displayIntagResults(sections, obligatoriska, valfria);
}

function displayIntagResults(sections, obligatoriska, valfria) {
  var resultat = document.getElementById('intag-resultat');
  var sammanfattning = document.getElementById('intag-sammanfattning');
  var sektionerDiv = document.getElementById('intag-sektioner');
  var exportSection = document.getElementById('intag-export');
  
  resultat.style.display = 'block';
  exportSection.style.display = 'block';
  
  // Räkna ifyllda obligatoriska
  var ifyllda = 0;
  obligatoriska.forEach(function(sek) {
    if (sections[sek] && isSectionFilled(sections[sek])) {
      ifyllda++;
    }
  });
  
  var sammantag = '<p style="margin:0;font-size:17px;font-weight:600;color:var(--blick)"><strong>' + ifyllda + '</strong> av <strong>' + obligatoriska.length + '</strong> obligatoriska sektioner ifyllda</p>';
  if (ifyllda < obligatoriska.length) {
    sammantag += '<p style="margin:8px 0 0;font-size:14px;color:var(--rodbrun)">Saknas innan intag kan gå till A0:</p>';
    sammantag += '<ul style="margin:4px 0 0;padding-left:24px;font-size:14px;color:var(--rodbrun)">';
    obligatoriska.forEach(function(sek) {
      if (!sections[sek] || !isSectionFilled(sections[sek])) {
        sammantag += '<li>' + esc(sek) + '</li>';
      }
    });
    sammantag += '</ul>';
  } else {
    sammantag += '<p style="margin:8px 0 0;font-size:14px;color:var(--teal)">✓ Alla obligatoriska sektioner ifyllda</p>';
  }
  sammanfattning.innerHTML = sammantag;
  
  // Lista sektioner
  var sektionHtml = '';
  var allaSektioner = obligatoriska.concat(valfria);
  allaSektioner.forEach(function(sek) {
    var content = sections[sek] || '';
    var status = getStatus(content, obligatoriska.indexOf(sek) !== -1);
    var statusText = status === 'ifylld' ? 'Ifylld' : status === 'tunn' ? 'Tunn' : 'Saknas';
    var statusFarg = status === 'ifylld' ? 'var(--teal)' : status === 'tunn' ? 'var(--sand-mork)' : 'var(--rodbrun)';
    
    sektionHtml += '<div style="border:1px solid var(--linje);border-left:3px solid ' + statusFarg + ';border-radius:6px;padding:16px;margin-bottom:16px">';
    sektionHtml += '<div style="display:flex;justify-content:space-between;align-items:start;margin-bottom:8px">';
    sektionHtml += '<h3 style="margin:0;font-family:var(--serif);font-size:17px;color:var(--blick)">' + esc(sek) + '</h3>';
    sektionHtml += '<span style="font-size:13px;font-weight:600;color:' + statusFarg + '">' + statusText + '</span>';
    sektionHtml += '</div>';
    
    if (status === 'ifylld') {
      sektionHtml += '<p style="margin:0;font-size:14px;color:var(--brod);white-space:pre-wrap">' + esc(content.substring(0, 200)) + (content.length > 200 ? '...' : '') + '</p>';
    }
    
    // Redigeringsfält
    sektionHtml += '<div style="margin-top:12px">';
    sektionHtml += '<label for="intag-field-' + sek + '" style="display:block;font-size:13px;font-weight:600;color:var(--brod);margin-bottom:4px">Redigera innehåll:</label>';
    sektionHtml += '<textarea id="intag-field-' + sek + '" data-section="' + esc(sek) + '" style="width:100%;min-height:80px;padding:8px;border:1px solid var(--linje);border-radius:3px;font-family:var(--sans);font-size:14px;color:var(--blick)" placeholder="Fyll i ' + esc(sek.toLowerCase()) + '...">' + esc(content) + '</textarea>';
    sektionHtml += '</div>';
    sektionHtml += '</div>';
  });
  
  sektionerDiv.innerHTML = sektionHtml;
  
  // Lägg till event listeners för textareas
  document.querySelectorAll('textarea[data-section]').forEach(function(textarea) {
    textarea.addEventListener('input', function() {
      var section = textarea.getAttribute('data-section');
      intagState.formData[section] = textarea.value;
      
      // Uppdatera sammanfattning
      setTimeout(function() {
        updateSummary(obligatoriska);
      }, 300);
    });
  });
}

function updateSummary(obligatoriska) {
  var ifyllda = 0;
  obligatoriska.forEach(function(sek) {
    if (intagState.formData[sek] && isSectionFilled(intagState.formData[sek])) {
      ifyllda++;
    }
  });
  
  var sammanfattning = document.getElementById('intag-sammanfattning');
  var sammantag = '<p style="margin:0;font-size:17px;font-weight:600;color:var(--blick)"><strong>' + ifyllda + '</strong> av <strong>' + obligatoriska.length + '</strong> obligatoriska sektioner ifyllda</p>';
  if (ifyllda < obligatoriska.length) {
    sammantag += '<p style="margin:8px 0 0;font-size:14px;color:var(--rodbrun)">Saknas innan intag kan gå till A0:</p>';
    sammantag += '<ul style="margin:4px 0 0;padding-left:24px;font-size:14px;color:var(--rodbrun)">';
    obligatoriska.forEach(function(sek) {
      if (!intagState.formData[sek] || !isSectionFilled(intagState.formData[sek])) {
        sammantag += '<li>' + esc(sek) + '</li>';
      }
    });
    sammantag += '</ul>';
  } else {
    sammantag += '<p style="margin:8px 0 0;font-size:14px;color:var(--teal)">✓ Alla obligatoriska sektioner ifyllda</p>';
  }
  sammanfattning.innerHTML = sammantag;
}

function isSectionFilled(text) {
  if (!text || text.trim().length < 10) return false;
  var lower = text.toLowerCase();
  if (lower.indexOf('[') !== -1 || lower.indexOf('<') !== -1 && lower.indexOf('>') !== -1) return false;
  return true;
}

function getStatus(content, isObligatorisk) {
  if (!content || content.trim().length === 0) return 'saknas';
  if (!isSectionFilled(content)) return 'tunn';
  return 'ifylld';
}

function exportIntagDocx() {
  if (typeof PizZip === 'undefined' || typeof DocxBuilder === 'undefined') {
    alert('Docx-export-biblioteken är inte laddade.');
    return;
  }
  
  var obligatoriska = ['Titel', 'Beskrivning', 'Användarnytta', 'Funktionelle krav', 'Dataklass', 'Sekretessbedömning'];
  var valfria = ['Tekniska begränsningar', 'Öppna frågor'];
  var allaSektioner = obligatoriska.concat(valfria);
  
  var sections = allaSektioner.map(function(sek) {
    return {
      title: sek,
      content: intagState.formData[sek] || ''
    };
  });
  
  var blob = DocxBuilder.build(sections);
  
  // Ladda ner
  var modulNamn = (intagState.formData['Titel'] || 'forslagsspec').replace(/[^a-zA-Z0-9åäöÅÄÖ]/g, '-').toLowerCase();
  var filename = 'forslagsspec-' + modulNamn + '-ifylld.docx';
  
  var link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
}

function handleFocusAfterRender(route) {
  var isOpenNow = !!(document.querySelector('[role="dialog"]') || document.querySelector('aside[data-drawer]'));
  if (isOpenNow && !state.drawerOrModalOpen) {
    var modalEl = document.querySelector('[role="dialog"] .modal-huvud a, [role="dialog"] a');
    var drawerHeading = document.querySelector('aside[data-drawer] h2');
    var target = document.querySelector('[role="dialog"]') ? modalEl : drawerHeading;
    if (target) target.focus({ preventScroll: true });
  } else if (!isOpenNow && state.drawerOrModalOpen) {
    var restore = state.lastFocus;
    if (restore && document.body.contains(restore)) {
      restore.focus({ preventScroll: true });
    } else {
      var navCurrent = document.querySelector('.navrad[aria-current="page"]');
      if (navCurrent) navCurrent.focus({ preventScroll: true });
    }
  }
  state.drawerOrModalOpen = isOpenNow;
}

window.addEventListener('hashchange', function (e) {
  var prevRoute = parseHash(new URL(e.oldURL).hash);
  var newRoute = parseHash(new URL(e.newURL).hash);
  var sameKorningContext = prevRoute.vy === 'korning' && newRoute.vy === 'korning' && prevRoute.rest === newRoute.rest;
  var savedScrollTop = null, savedWinY = window.scrollY;
  if (sameKorningContext) {
    var list = document.querySelector('[data-tidslinje-lista]');
    if (list) savedScrollTop = list.scrollTop;
  }
  render();
  if (sameKorningContext) {
    var list2 = document.querySelector('[data-tidslinje-lista]');
    if (list2 && savedScrollTop !== null) list2.scrollTop = savedScrollTop;
    window.scrollTo(0, savedWinY);
  }
});

render();
})();
