// EXEMPELDATA — MOCK. Ingen riktig patientdata. Inga skarpa värden.
(function () {
if (window.SMEDJAN) return;
const PROCESS = [
  { nummer: 0, namn: 'Intag', fas: 'A · Forma', agenter: ['A0'], status: 'klar' },
  { nummer: 1, namn: 'Specgranskning', fas: 'A · Forma', agenter: ['A1'], status: 'klar' },
  { nummer: 2, namn: 'Nedbrytning', fas: 'A · Forma', agenter: ['A2', 'A3'], status: 'klar' },
  { nummer: 3, namn: 'Kodning', fas: 'B · Bygga', agenter: ['A4', 'A5'], status: 'vantar' },
  { nummer: 4, namn: 'Enhetstester', fas: 'B · Bygga', agenter: ['A6'], status: 'vantar' },
  { nummer: 5, namn: 'Integrationstester', fas: 'B · Bygga', agenter: ['A7'], status: 'vantar' },
  { nummer: 6, namn: 'Testdeploy', fas: 'B · Bygga', agenter: ['A8'], status: 'vantar' },
  { nummer: 7, namn: 'Test av testdeploy', fas: 'B · Bygga', agenter: ['A9'], status: 'vantar' },
  { nummer: 8, namn: 'Utfall & triage', fas: 'C · Leverera', agenter: ['A10'], status: 'vantar' },
  { nummer: 9, namn: 'QA & integration', fas: 'C · Leverera', agenter: ['A8', 'A7', 'A9'], status: 'vantar' },
  { nummer: 10, namn: 'Produktionsdeploy', fas: 'D · Driva', agenter: ['A8'], status: 'vantar' },
  { nummer: 11, namn: 'Övervakning & förbättring', fas: 'D · Driva', agenter: ['A11', 'A12', 'A13'], status: 'vantar' },
  { nummer: 12, namn: 'Återföring — förslag blir nytt intag', fas: 'D · Driva', agenter: ['A12'], status: 'vantar', ur_processdefinition: true }
];

const GRINDAR_DEF = [
  { id: 'G1', namn: 'Specgodkännande', fraga: 'Är specen tillräckligt bra att bryta ner?', efter_steg: 1, quorum: 'arkitekt + produktledning (+ kliniker vid klinisk funktion)', quorumrader: ['arkitekt', 'produktledning', 'kliniker (vid klinisk funktion)'] },
  { id: 'G2', namn: 'Backloggodkännande', fraga: 'Är nedbrytningen komplett, prioriterad och byggbar?', efter_steg: 2, quorum: 'projektledning + utvecklare + verksamhetsrepresentant', quorumrader: ['projektledning', 'utvecklare', 'verksamhetsrepresentant'] },
  { id: 'G3', namn: 'QA-godkännande', fraga: 'Fungerar modulen isolerat så väl att den får möta grannarna?', efter_steg: 8, quorum: 'produktledning + arkitekt + processledare', quorumrader: ['produktledning', 'arkitekt', 'processledare'] },
  { id: 'G4', namn: 'Produktionsgodkännande', fraga: 'Fungerar modulen med grannarna, och är driften redo?', efter_steg: 9, quorum: 'produktledning + informationssäkerhet + förvaltning (+ kliniker)', quorumrader: ['produktledning', 'informationssäkerhet', 'förvaltning', 'kliniker'] }
];

const AGENTER = [
  { id: 'A0', namn: 'Intagsagent', steg: '0', pool: 'A', familj: 'Anthropic', producerar: 'Förslagsspec', far_inte: 'Gissa; skriva kod', korning: 'kört (mock)', prompt: 'A0/v1', konfig: 'claude-opus' },
  { id: 'A1', namn: 'Specgranskare', steg: '1', pool: 'B', familj: 'OpenAI/Google', producerar: 'Granskningsrapport', far_inte: 'Ändra specen', korning: 'kört (mock)', prompt: 'A1/v1', konfig: 'gpt-5.6' },
  { id: 'A2', namn: 'Nedbrytare', steg: '2', pool: 'C', familj: 'öppna vikter', producerar: 'Stories, epics', far_inte: 'Granska egna stories', korning: 'kört (mock)', prompt: 'A2/v1', konfig: 'deepseek-v4' },
  { id: 'A3', namn: 'Storygranskare', steg: '2', pool: 'B', familj: 'OpenAI/Google', producerar: 'Täckningsmatris, INVEST-rapport', far_inte: 'Skriva stories', korning: 'kört (mock)', prompt: 'A3/v1', konfig: 'gemini-3.7' },
  { id: 'A4', namn: 'Kodare', steg: '3', pool: 'A', familj: 'Anthropic', producerar: 'Kod, PR, dokumentation', far_inte: 'Skriva acceptanstester; merga', korning: 'ej kört', prompt: 'A4/v1', konfig: 'claude-sonnet' },
  { id: 'A5', namn: 'Kodgranskare', steg: '3', pool: 'B', familj: 'OpenAI/Google', producerar: 'PR-granskning', far_inte: 'Ändra kod; merga', korning: 'ej kört', prompt: 'A5/v1', konfig: 'gpt-5.6' },
  { id: 'A6', namn: 'Testförfattare', steg: '4', pool: 'C', familj: 'öppna vikter', producerar: 'Enhetstester', far_inte: 'Ändra produktionskod', korning: 'ej kört', prompt: 'A6/v1', konfig: 'glm-5.3' },
  { id: 'A7', namn: 'Integrationstestare', steg: '5, 9', pool: 'C', familj: 'öppna vikter', producerar: 'Kontrakts- och integrationstester', far_inte: 'Ändra kod eller kontrakt', korning: 'ej kört', prompt: 'A7/v1', konfig: 'qwen' },
  { id: 'A8', namn: 'Deployagent', steg: '6, 9, 10', pool: 'C', familj: 'öppna vikter', producerar: 'Images, miljöer, deployrapport', far_inte: 'Deploya ogodkänd digest', korning: 'ej kört', prompt: 'A8/v1', konfig: 'deepseek-v4' },
  { id: 'A9', namn: 'Systemtestare', steg: '7, 9', pool: 'B', familj: 'OpenAI/Google', producerar: 'Systemtestrapport, E2E', far_inte: 'Klassa avvikelser', korning: 'ej kört', prompt: 'A9/v1', konfig: 'gemini-3.7' },
  { id: 'A10', namn: 'Utfallsanalytiker', steg: '8', pool: 'C', familj: 'öppna vikter', producerar: 'Klassning, åtgärdsförslag', far_inte: 'Åtgärda; besluta', korning: 'ej kört', prompt: 'A10/v1', konfig: 'glm-5.3' },
  { id: 'A11', namn: 'Driftvakt', steg: '11', pool: 'D', familj: 'intern', producerar: 'Incidenthypoteser, felhanteringsförslag', far_inte: 'Utföra åtgärder i etapp 1', korning: 'ej kört', prompt: 'A11/v1', konfig: 'gemma4', hanglas: true },
  { id: 'A12', namn: 'Förbättringsagent', steg: '11', pool: 'C', familj: 'öppna vikter', producerar: 'Förbättringsförslag', far_inte: 'Skapa stories direkt', korning: 'ej kört', prompt: 'A12/v1', konfig: 'qwen' },
  { id: 'A13', namn: 'Dokumentatör', steg: 'alla', pool: 'C', familj: 'öppna vikter', producerar: 'Dokumentation, runbooks', far_inte: 'Ändra spec, kod, tester', korning: 'ej kört', prompt: 'A13/v1', konfig: 'glm-5.3' }
];

const POOLER = [
  { id: 'A', familj: 'Anthropic', anvands: 'omdöme: intag och kodning', agenter: ['A0', 'A4'], klasser: '0–1', konfig: 'claude-opus, claude-sonnet' },
  { id: 'B', familj: 'OpenAI/Google', anvands: 'granskning och systemtest', agenter: ['A1', 'A3', 'A5', 'A9'], klasser: '0–1', konfig: 'gpt-5.6, gemini-3.7' },
  { id: 'C', familj: 'öppna vikter', anvands: 'volym: nedbrytning, tester, deploy, triage, dokumentation', agenter: ['A2', 'A6', 'A7', 'A8', 'A10', 'A12', 'A13'], klasser: '0–1', konfig: 'deepseek-v4, glm-5.3, qwen' },
  { id: 'D', familj: 'intern, on-prem', anvands: 'dataklass 2 och Driftvakt mot produktionstelemetri', agenter: ['A11'], klasser: '0–2', konfig: 'gemma4', hanglas: true }
];

const SEPARATIONSREGLER = [
  { regel: 'S1', namn: 'Modellseparation', innebord: 'Producent och granskare i samma steg kommer ur olika pooler. Orkestreringen startar inte steget annars.' },
  { regel: 'S2', namn: 'Kontextseparation', innebord: 'Granskaren får artefakten och de dokument den refererar till — aldrig producentens sessionslogg, resonemang eller mellanversioner.' },
  { regel: 'S3', namn: 'Skrivseparation', innebord: 'Varje agent får bara skapa eller ändra sina tillåtna artefakttyper. Senare upprätthållet med separata Git-identiteter.' },
  { regel: 'S4', namn: 'Proveniens', innebord: 'Varje artefakt bär agent, modell, prompt-version, input, tid, kostnad.' },
  { regel: 'S5', namn: 'Mänsklig eskalering', innebord: 'Max 3 varv per agentloop, därefter stannar steget och en människa kopplas in.' },
  { regel: 'S6', namn: 'Ingen tyst degradering', innebord: 'Otillgänglig modell ger stopp och rapport, inte tyst byte till en modell som kan bryta S1.' }
];

const BINDNINGAR = [
  'A10 ur annan pool än både A4 och A9 — den dömer mellan dem',
  'A11 och A12 ur olika pooler — samma telemetri, olika uppdrag',
  'A6 ur annan pool än A4 — skriver inte kodarens tester',
  'A9 ur annan pool än A4, helst också än A6'
];

const DATAKLASSER = [
  { klass: 0, namn: 'Öppen', innebord: 'Ingen koppling till person eller intern konfiguration.', exempel: 'Kod, kontrakt, syntetisk testdata, arketyper.', pooler: 'A, B, C, D' },
  { klass: 1, namn: 'Intern', innebord: 'Intern information utan personuppgifter.', exempel: 'Mötesanteckningar, nätverksdesign, icke-publika kontrakt.', pooler: 'A–C med biträdesavtal och no-retention, annars D' },
  { klass: 2, namn: 'Patientdata', innebord: 'Personuppgifter om patient eller personal.', exempel: 'Journaldata, telemetri med patient-id, verkliga HL7-meddelanden.', pooler: 'Endast D — eller ingen LLM alls' }
];

const PROJEKT = [
  { id: 'ews', titel: 'EWS: Philips vitals → NEWS2 → Datahubb', dataklass: 0, senaste: '2026-09-03 14:12:08 UTC', steg_klara: '3 av 13', grindar: '1 av 4', grindstatus: ['godkand_med_villkor', 'vantar', 'ej_nadd', 'ej_nadd'], status: 'klar', kostnad: '0,00 USD', korning_id: 'ews-2026-09-03T14-12-08Z' },
  { id: 'patientoversikt', titel: 'Patientöversikt (openEHR, Melior först)', dataklass: 0, senaste: '2026-09-03 15:02:00 UTC', steg_klara: '1 av 13', grindar: '0 av 4', grindstatus: ['ej_nadd', 'ej_nadd', 'ej_nadd', 'ej_nadd'], status: 'kor', kostnad: '0,00 USD', korning_id: 'patientoversikt-2026-09-03T15-02-00Z' },
  { id: 'axel-sjalvincheckning', titel: 'Axel självincheckning (FHIR)', dataklass: 0, senaste: '—', steg_klara: '—', grindar: '—', grindstatus: null, status: 'ingen_korning', kostnad: '—', korning_id: null }
];

const STEG_EWS = [
  {
    id: 'steg0', nummer: 0, namn: 'Intag', status: 'klar',
    startad: '2026-09-03T14:12:08Z', varaktighet_ms: 12,
    agent: { id: 'A0', namn: 'Intagsagent', pool: 'A', familj: 'Anthropic', modell: 'claude-opus', ar_stub: true },
    in: [{ roll: 'forslagsspec', path: 'korningar/ews/steg0/input.md' }],
    ut: [{ typ: 'spec', rubrik: 'EWS-001', path: 'korningar/ews/steg0/spec-v1.md', meta_path: 'korningar/ews/steg0/spec-v1.meta.json' }],
    kostnad: { tokens_in: 0, tokens_ut: 0, usd: 0.0 }, varv: 1, max_varv: 3
  },
  {
    id: 'steg1', nummer: 1, namn: 'Specgranskning', status: 'klar',
    startad: '2026-09-03T14:12:08Z', varaktighet_ms: 9,
    agent: { id: 'A1', namn: 'Specgranskare', pool: 'B', familj: 'OpenAI/Google', modell: 'gpt-5.6', ar_stub: true },
    in: [{ roll: 'spec', path: 'korningar/ews/steg0/spec-v1.md' }],
    ut: [{ typ: 'granskningsrapport', rubrik: 'EWS-001 · spec-v1', path: 'korningar/ews/steg1/review-v1.md', meta_path: 'korningar/ews/steg1/review-v1.meta.json' }],
    kostnad: { tokens_in: 0, tokens_ut: 0, usd: 0.0 }, varv: 1, max_varv: 3
  },
  {
    id: 'steg2', nummer: 2, namn: 'Nedbrytning', status: 'klar',
    startad: '2026-09-03T14:12:09Z', varaktighet_ms: 21,
    agent: { id: 'A2', namn: 'Nedbrytare', pool: 'C', familj: 'öppna vikter', modell: 'deepseek-v4', ar_stub: true },
    granskare: { id: 'A3', namn: 'Storygranskare', pool: 'B', familj: 'OpenAI/Google', modell: 'gemini-3.7', ar_stub: true, varaktighet_ms: 14, ut: { typ: 'tackningsmatris', path: 'korningar/ews/steg2/tackning.md' } },
    in: [{ roll: 'spec', path: 'korningar/ews/steg0/spec-v1.md' }],
    ut: [{ typ: 'stories', rubrik: 'EWS-001', path: 'korningar/ews/steg2/stories-v1.yaml', meta_path: 'korningar/ews/steg2/stories-v1.meta.json' }],
    kostnad: { tokens_in: 0, tokens_ut: 0, usd: 0.0 }, varv: 1, max_varv: 3
  }
];

const SEPARATION_EWS = [
  { regel: 'S1', text: 'Ingen granskar sig själv', galler: ['A0', 'A1'], pooler: 'pool A → pool B', familjer: 'Anthropic → OpenAI/Google', uppfylld: true, motivering: 'olika pooler' },
  { regel: 'S1', text: 'Ingen granskar sig själv', galler: ['A2', 'A3'], pooler: 'pool C → pool B', familjer: 'öppna vikter → OpenAI/Google', uppfylld: true, motivering: 'olika pooler' },
  { regel: 'S2', text: 'Kontextseparation', galler: ['steg 1'], pooler: '—', familjer: '—', uppfylld: true, motivering: 'granskaren fick spec-v1.md och dess referenser, ingen sessionslogg' },
  { regel: 'S3', text: 'Skrivseparation', galler: ['A0', 'A1', 'A2', 'A3'], pooler: '—', familjer: '—', uppfylld: true, motivering: 'endast tillåtna artefakttyper skrivna' },
  { regel: 'S4', text: 'Proveniens', galler: ['alla artefakter'], pooler: '—', familjer: '—', uppfylld: true, motivering: 'proveniens finns i .meta.json för alla fyra artefakter' },
  { regel: 'S5', text: 'Mänsklig eskalering', galler: ['steg 0–2'], pooler: '—', familjer: '—', uppfylld: true, motivering: '1 varv av max 3 i varje steg' },
  { regel: 'S6', text: 'Ingen tyst degradering', galler: ['alla steg'], pooler: '—', familjer: '—', uppfylld: null, motivering: 'mockad motor, ingen modell begärdes' }
];

const STORIES = [
  { id: 'EWS-001.1', titel: 'Hämta vitals från Philips-system', uppskattning: 'M', beroenden: [], spec_krav: 'K1', dataklass: 0, status: 'todo', path: 'korningar/ews/steg2/story-EWS-001.1.md' },
  { id: 'EWS-001.2', titel: 'Normalisera MDC-koder till openEHR-arketyper', uppskattning: 'M', beroenden: ['EWS-001.1'], spec_krav: 'K2', dataklass: 0, status: 'todo', path: 'korningar/ews/steg2/story-EWS-001.2.md' },
  { id: 'EWS-001.3', titel: 'Beräkna NEWS2 per mätpunkt', uppskattning: 'L', beroenden: ['EWS-001.2'], spec_krav: 'K3', dataklass: 0, status: 'todo', path: 'korningar/ews/steg2/story-EWS-001.3.md' },
  { id: 'EWS-001.4', titel: 'Publicera vitals.aggregated med versionerat schema', uppskattning: 'M', beroenden: ['EWS-001.3'], spec_krav: 'K4', dataklass: 0, status: 'todo', path: 'korningar/ews/steg2/story-EWS-001.4.md' },
  { id: 'EWS-001.5', titel: 'Lagra råsignal i tidsserie', uppskattning: 'S', beroenden: ['EWS-001.1'], spec_krav: 'K5', dataklass: 0, status: 'todo', path: 'korningar/ews/steg2/story-EWS-001.5.md' },
  { id: 'EWS-001.6', titel: 'Felhantering för okända MDC-koder', uppskattning: 'S', beroenden: ['EWS-001.2'], spec_krav: 'K1, K2 (G1-villkor)', dataklass: 0, status: 'todo', path: 'korningar/ews/steg2/story-EWS-001.6.md' }
];

const TACKNING = [
  { krav: 'K1', text: 'Ta emot ORU^R01 från Philips-gränssnittet', tackt_av: 'EWS-001.1, EWS-001.6', saknas: false },
  { krav: 'K2', text: 'Normalisera MDC-koder till openEHR-arketyper', tackt_av: 'EWS-001.2, EWS-001.6', saknas: false },
  { krav: 'K3', text: 'Beräkna NEWS2 per mätpunkt', tackt_av: 'EWS-001.3', saknas: false },
  { krav: 'K4', text: 'Publicera vitals.aggregated med versionerat schema', tackt_av: 'EWS-001.4', saknas: false },
  { krav: 'K5', text: 'Lagra råsignal i tidsserie', tackt_av: 'EWS-001.5', saknas: false },
  { krav: 'K6', text: 'Temperatur ska ingå i beräkningen', tackt_av: 'Ingen story täcker K6 (temperatur). Nedbrytningsfel — inte kodfel.', saknas: true }
];

// C3 — Given/When/Then för alla sex stories. Syntetisk klass-0-copy, EXEMPEL — MOCK.
const AKCEPTANSKRITERIER = {
  'EWS-001.1': [
    { ord: 'Given', text: 'ett syntetiskt ORU^R01-meddelande med giltig MDC-kod på inkommande kö' },
    { ord: 'When', text: 'mottagaren behandlar meddelandet' },
    { ord: 'Then', text: 'lagras mätvärdet med tidsstämpel, enhet och källsystem, och meddelandet kvitteras' },
    { ord: 'And', text: 'ett meddelande som inte kan tolkas hamnar i felkö med orsak i loggen' }
  ],
  'EWS-001.2': [
    { ord: 'Given', text: 'ett syntetiskt ORU^R01 med känd MDC-kod' },
    { ord: 'When', text: 'normaliseringen körs' },
    { ord: 'Then', text: 'mappas koden till den openEHR-arketyp specifikationen anger, utan att värdet ändras' },
    { ord: 'And', text: 'en okänd kod går till felhantering enligt EWS-001.6 — ingen arketyp gissas' }
  ],
  'EWS-001.3': [
    { ord: 'Given', text: 'normaliserade mätpunkter för de parametrar specifikationen räknar upp' },
    { ord: 'When', text: 'NEWS2 beräknas per mätpunkt' },
    { ord: 'Then', text: 'poängen följer den tabell specifikationen refererar; tabellversion gissas inte (Ö1)' },
    { ord: 'And', text: 'K6 (temperatur) saknar story — täckningsluckan visas i tackning.md, den här storyn påstår inte att den täcker K6' }
  ],
  'EWS-001.4': [
    { ord: 'Given', text: 'ett färdigt aggregat från beräkningen' },
    { ord: 'When', text: 'publiceringen körs' },
    { ord: 'Then', text: 'skrivs vitals.aggregated med versionerat schema' },
    { ord: 'And', text: 'konsumenter läser aldrig EWS-databasen direkt' }
  ],
  'EWS-001.5': [
    { ord: 'Given', text: 'ett kvitterat syntetiskt ORU^R01' },
    { ord: 'When', text: 'råsignalen lagras' },
    { ord: 'Then', text: 'tidsstämpel, enhet och källsystem finns i tidsserien' },
    { ord: 'And', text: 'aggregatet hamnar i CDR, inte i tidsserien' }
  ],
  'EWS-001.6': [
    { ord: 'Given', text: 'ett syntetiskt meddelande med okänd MDC-kod' },
    { ord: 'When', text: 'mottagaren behandlar meddelandet' },
    { ord: 'Then', text: 'meddelandet hamnar i felkö med orsak i loggen' },
    { ord: 'And', text: 'ingen arketyp och inget NEWS2-värde hittas på' }
  ]
};

const MOCK_KORNINGAR = [
  {
    schema_version: '1.0',
    korning_id: 'ews-2026-09-03T14-12-08Z',
    projekt: 'ews',
    titel: 'EWS: Philips vitals → NEWS2 → Datahubb',
    dataklass: 0,
    backend: 'mock',
    ar_mock: true,
    startad: '2026-09-03T14:12:08Z',
    avslutad: '2026-09-03T14:12:09Z',
    varaktighet: '1,1 s',
    status: 'klar',
    kostnad: { tokens_in: 0, tokens_ut: 0, usd: 0.0 },
    commit: '659afb6',
    steg_klara: '0–2',
    steg: STEG_EWS,
    grindar: [
      {
        id: 'G1', namn: 'Specgodkännande', efter_steg: 1, status: 'godkand_med_villkor', ar_mock: true,
        beslutsfattare: 'Mock Demo (etapp 0)', tidpunkt: '2026-09-03T14:12:08Z', path: 'korningar/ews/G1/beslut.md',
        rekommendation: {
          fran_agent: 'A1', beslut: 'godkann_med_villkor',
          citat: 'Godkänn med villkor: F1 och F2 åtgärdas före nedbrytning.',
          villkor: ['Lägg till felhantering-sektion i specen', 'Verifiera och referera Philips API-dokumentation']
        },
        underlag: [
          { path: 'korningar/ews/steg0/spec-v1.md', version: '1.0', commit: '659afb6' },
          { path: 'korningar/ews/steg1/review-v1.md', version: '1.0', commit: '659afb6' }
        ],
        historik: [
          '14:12:08 Underlag sammanställt (A1 klar)',
          '14:12:08 Rekommendation: godkänn med villkor',
          '14:12:08 Beslut registrerat i Git (förifyllt för demo)'
        ]
      },
      {
        id: 'G2', namn: 'Backloggodkännande', efter_steg: 2, status: 'vantar', ar_mock: true,
        beslutsfattare: null, tidpunkt: null, path: null,
        rekommendation: {
          fran_agent: 'A3', beslut: 'godkann_med_villkor',
          citat: 'Godkänn med villkor: K6 (temperatur) saknar story.',
          villkor: ['Skapa story för K6 (temperatur i beräkningen)']
        },
        underlag: [
          { path: 'korningar/ews/steg2/stories-v1.yaml', version: '1.0', commit: '659afb6' },
          { path: 'korningar/ews/steg2/tackning.md', version: '1.0', commit: '659afb6' }
        ],
        historik: ['14:12:09 Underlag sammanställt (A3 klar)', '14:12:09 Rekommendation: godkänn med villkor']
      },
      { id: 'G3', namn: 'QA-godkännande', efter_steg: 8, status: 'ej_nadd', ar_mock: true, rekommendation: null, underlag: [], historik: [] },
      { id: 'G4', namn: 'Produktionsgodkännande', efter_steg: 9, status: 'ej_nadd', ar_mock: true, rekommendation: null, underlag: [], historik: [] }
    ],
    separation: SEPARATION_EWS,
    stories: STORIES,
    framtida_steg: [
      { nummer: 3, namn: 'Kodning', status: 'vantar' }, { nummer: 4, namn: 'Enhetstester', status: 'vantar' },
      { nummer: 5, namn: 'Integrationstester', status: 'vantar' }, { nummer: 6, namn: 'Testdeploy', status: 'vantar' },
      { nummer: 7, namn: 'Test av testdeploy', status: 'vantar' }, { nummer: 8, namn: 'Utfall & triage', status: 'vantar' },
      { nummer: 9, namn: 'QA & integration', status: 'vantar' }, { nummer: 10, namn: 'Produktionsdeploy', status: 'vantar' },
      { nummer: 11, namn: 'Övervakning & förbättring', status: 'vantar' }
    ]
  },
  {
    schema_version: '1.0', korning_id: 'ews-2026-09-03T11-04-52Z', projekt: 'ews',
    titel: 'EWS: Philips vitals → NEWS2 → Datahubb', dataklass: 0, backend: 'mock', ar_mock: true,
    startad: '2026-09-03T11:04:52Z', avslutad: '2026-09-03T11:04:56Z', varaktighet: '4,3 s',
    status: 'blockerad', kostnad: { tokens_in: 0, tokens_ut: 0, usd: 0.0 }, commit: '41d0e7c', steg_klara: '0–1',
    blockering: {
      rubrik: 'Steg 2 stannade — S5 utlöst',
      text: 'Tre varv av tre. A2 och A3 nådde inte samstämmighet. En människa kopplas in. Agenter får inte lösa oenighet genom att en ger upp.',
      varvhistorik: [
        { varv: 1, tid: '11:04:53 UTC', motivering: 'A2 levererade sex stories. A3: K6 saknar story.' },
        { varv: 2, tid: '11:04:54 UTC', motivering: 'A2 lade till story utan spec-referens. A3: INVEST ej uppfyllt.' },
        { varv: 3, tid: '11:04:56 UTC', motivering: 'A2 höll fast vid nedbrytningen. A3 vidhöll avslag. Ingen samstämmighet.' }
      ]
    },
    steg: [
      STEG_EWS[0], STEG_EWS[1],
      {
        id: 'steg2', nummer: 2, namn: 'Nedbrytning', status: 'blockerad', startad: '2026-09-03T11:04:53Z', varaktighet_ms: 3100,
        agent: { id: 'A2', namn: 'Nedbrytare', pool: 'C', familj: 'öppna vikter', modell: 'deepseek-v4', ar_stub: true },
        granskare: { id: 'A3', namn: 'Storygranskare', pool: 'B', familj: 'OpenAI/Google', modell: 'gemini-3.7', ar_stub: true },
        in: [{ roll: 'spec', path: 'korningar/ews/steg0/spec-v1.md' }],
        ut: [{ typ: 'stories', rubrik: 'EWS-001', path: 'korningar/ews/steg2/stories-v1.yaml', meta_path: 'korningar/ews/steg2/stories-v1.meta.json' }],
        kostnad: { tokens_in: 0, tokens_ut: 0, usd: 0.0 }, varv: 3, max_varv: 3
      }
    ],
    grindar: [
      { id: 'G1', namn: 'Specgodkännande', efter_steg: 1, status: 'godkand_med_villkor', ar_mock: true, beslutsfattare: 'Mock Demo (etapp 0)', tidpunkt: '2026-09-03T11:04:53Z', path: 'korningar/ews/G1/beslut.md', rekommendation: { fran_agent: 'A1', beslut: 'godkann_med_villkor', citat: 'Godkänn med villkor: F1 och F2 åtgärdas före nedbrytning.', villkor: ['Lägg till felhantering-sektion i specen', 'Verifiera och referera Philips API-dokumentation'] }, underlag: [], historik: [] },
      { id: 'G2', namn: 'Backloggodkännande', efter_steg: 2, status: 'ej_nadd', ar_mock: true, rekommendation: null, underlag: [], historik: [] },
      { id: 'G3', namn: 'QA-godkännande', efter_steg: 8, status: 'ej_nadd', ar_mock: true, rekommendation: null, underlag: [], historik: [] },
      { id: 'G4', namn: 'Produktionsgodkännande', efter_steg: 9, status: 'ej_nadd', ar_mock: true, rekommendation: null, underlag: [], historik: [] }
    ],
    separation: SEPARATION_EWS.slice(0, 1).concat([{ regel: 'S5', text: 'Mänsklig eskalering', galler: ['steg 2'], pooler: '—', familjer: '—', uppfylld: true, motivering: '3 varv av 3 — steget stannade, människa kopplas in' }]),
    stories: [], framtida_steg: []
  },
  {
    schema_version: '1.0', korning_id: 'ews-2026-09-02T16-38-11Z', projekt: 'ews', titel: 'EWS: Philips vitals → NEWS2 → Datahubb',
    dataklass: 0, backend: 'mock', ar_mock: true, startad: '2026-09-02T16:38:11Z', varaktighet: '0,4 s', status: 'fel',
    kostnad: { tokens_in: 0, tokens_ut: 0, usd: 0.0 }, commit: '41d0e7c', steg_klara: '0',
    felorsak: 'mock-fixtur saknas för A1 i denna commit',
    steg: [STEG_EWS[0]], grindar: [], separation: [], stories: [], framtida_steg: []
  },
  {
    schema_version: '1.0', korning_id: 'ews-2026-09-02T09-41-03Z', projekt: 'ews', titel: 'EWS: Philips vitals → NEWS2 → Datahubb',
    dataklass: 0, backend: 'mock', ar_mock: true, startad: '2026-09-02T09:41:03Z', varaktighet: '0,9 s', status: 'klar',
    kostnad: { tokens_in: 0, tokens_ut: 0, usd: 0.0 }, commit: 'c72b1ad', steg_klara: '0–1, steg 2 överhoppad',
    steg: [STEG_EWS[0], STEG_EWS[1]], grindar: [], separation: [], stories: [], framtida_steg: []
  },
  {
    schema_version: '1.0', korning_id: 'patientoversikt-2026-09-03T15-02-00Z', projekt: 'patientoversikt', titel: 'Patientöversikt (openEHR, Melior först)',
    dataklass: 0, backend: 'mock', ar_mock: true, startad: '2026-09-03T15:02:00Z', varaktighet: '—', status: 'kor',
    kostnad: { tokens_in: 0, tokens_ut: 0, usd: 0.0 }, commit: '659afb6', steg_klara: 'steg 0 pågår',
    steg: [], grindar: [], separation: [], stories: [], framtida_steg: []
  }
];

const KORNINGSLISTA = [
  { id: 'ews-2026-09-03T14-12-08Z', projekt: 'ews', startad: '2026-09-03 14:12:08', varaktighet: '1,1 s', steg: '0–2', grindar: 'G1 godkänd med villkor', grindantal: '1 av 4', grindstatus: ['godkand_med_villkor', 'vantar', 'ej_nadd', 'ej_nadd'], status: 'klar', commit: '659afb6', backend: 'mock' },
  { id: 'ews-2026-09-03T11-04-52Z', projekt: 'ews', startad: '2026-09-03 11:04:52', varaktighet: '4,3 s', steg: '0–1', grindar: 'G1 godkänd med villkor', grindantal: '1 av 4', grindstatus: ['godkand_med_villkor', 'ej_nadd', 'ej_nadd', 'ej_nadd'], status: 'blockerad', commit: '41d0e7c', backend: 'mock' },
  { id: 'ews-2026-09-02T16-38-11Z', projekt: 'ews', startad: '2026-09-02 16:38:11', varaktighet: '0,4 s', steg: '0', grindar: '—', grindantal: '0 av 4', grindstatus: ['ej_nadd', 'ej_nadd', 'ej_nadd', 'ej_nadd'], status: 'fel', commit: '41d0e7c', backend: 'mock' },
  { id: 'ews-2026-09-02T09-41-03Z', projekt: 'ews', startad: '2026-09-02 09:41:03', varaktighet: '0,9 s', steg: '0–1, steg 2 överhoppad', grindar: 'G1 godkänd', grindantal: '1 av 4', grindstatus: ['godkand', 'ej_nadd', 'ej_nadd', 'ej_nadd'], status: 'klar', commit: 'c72b1ad', backend: 'mock' },
  { id: 'patientoversikt-2026-09-03T15-02-00Z', projekt: 'patientoversikt', startad: '2026-09-03 15:02:00', varaktighet: '—', steg: 'steg 0 pågår', grindar: '—', grindantal: '0 av 4', grindstatus: ['ej_nadd', 'ej_nadd', 'ej_nadd', 'ej_nadd'], status: 'kor', commit: '659afb6', backend: 'mock' }
];

const ARTEFAKTER = {
  'korningar/ews/steg0/spec-v1.md': {
    path: 'korningar/ews/steg0/spec-v1.md',
    filnamn: 'spec-v1.md',
    rubrik: 'EWS-001 · Early Warning Score från Philips vitals',
    typ: 'spec', version: '1.0', dataklass: 0, producent: 'A0', steg: 0,
    frontmatter: ['typ: spec', 'version: 1.0', 'rubrik: EWS-001', 'dataklass: 0', 'producent: A0'],
    meta_path: 'korningar/ews/steg0/spec-v1.meta.json', storlek: '2,1 kB',
    skapad: '2026-09-03 14:12:08 UTC', varaktighet: '12 ms', commit: '659afb6',
    block: [
      { t: 'h1', text: 'EWS-001 · Early Warning Score från Philips vitals' },
      { t: 'p', text: 'Version 1.0 · Dataklass 0 · Källa: HL7-till-openEHR-rapporten i repot' },
      { t: 'h2', text: 'Syfte' },
      { t: 'p', text: 'Beräkna NEWS2 på vitalparametrar från Philips patientövervakning och publicera aggregatet till Datahubben, så att patientöversikten kan visa det.' },
      { t: 'h2', text: 'Funktionell beskrivning' },
      { t: 'li', text: 'K1. Ta emot ORU^R01 från Philips-gränssnittet.' },
      { t: 'li', text: 'K2. Normalisera MDC-koder till openEHR-arketyper.' },
      { t: 'li', text: 'K3. Beräkna NEWS2 per mätpunkt enligt gällande tabell.' },
      { t: 'li', text: 'K4. Publicera vitals.aggregated med versionerat schema.' },
      { t: 'li', text: 'K5. Lagra råsignal i tidsserie, aggregat i CDR.' },
      { t: 'li', text: 'K6. Temperatur ska ingå i beräkningen.' },
      { t: 'h2', text: 'Arkitekturkrav' },
      { t: 'p', text: 'Aggregat i CDR, råsignal i tidsserie. Konsumenter läser aldrig EWS-databasen direkt.' },
      { t: 'h2', text: 'Öppna frågor' },
      { t: 'li', text: 'Ö1. Vilken NEWS2-version gäller? A0 gissar inte.' },
      { t: 'li', text: 'Ö2. Vad ska hända med okända MDC-koder?' },
      { t: 'h2', text: 'Dataklass' },
      { t: 'p', text: '0 genom hela utvecklingskedjan. Syntetiska ORU^R01-meddelanden genererade ur specifikationen. Verklig telemetri är klass 2 och når aldrig en extern modell.' }
    ]
  },
  'korningar/ews/steg1/review-v1.md': {
    path: 'korningar/ews/steg1/review-v1.md',
    filnamn: 'review-v1.md',
    rubrik: 'Granskningsrapport · EWS-001 · spec-v1',
    typ: 'granskningsrapport', version: '1.0', dataklass: 0, producent: 'A1', steg: 1,
    frontmatter: ['typ: granskningsrapport', 'granskare: A1', 'pool: B', 'avser: spec-v1.md'],
    meta_path: 'korningar/ews/steg1/review-v1.meta.json', storlek: '1,4 kB',
    skapad: '2026-09-03 14:12:08 UTC', varaktighet: '9 ms', commit: '659afb6',
    block: [
      { t: 'h1', text: 'Granskningsrapport · EWS-001 · spec-v1' },
      { t: 'h2', text: 'Fullständighet' },
      { t: 'li', text: 'F1 (allvarlig) Ingen felhanteringssektion. Okända MDC-koder saknar definierat utfall.' },
      { t: 'li', text: 'F2 (mindre) Referens till Philips API-dokumentation saknas — K1 går inte att verifiera.' },
      { t: 'h2', text: 'Konsistens' },
      { t: 'li', text: 'F3 (mindre) K4 och K5 beskriver samma data i två lager utan att ange vilket som är källa vid avvikelse.' },
      { t: 'h2', text: 'Risk' },
      { t: 'li', text: 'F4 (info) Klass 0 motiveras, men motiveringen saknar hänvisning till den syntetiska datakällan.' },
      { t: 'h2', text: 'Beroenden' },
      { t: 'li', text: 'F5 (info) K3 beror på gällande NEWS2-tabell. Versionsstyrning av tabellen saknas.' },
      { t: 'h2', text: 'Rekommendation' },
      { t: 'p', text: 'Godkänn med villkor: F1 och F2 åtgärdas före nedbrytning.' }
    ]
  },
  'korningar/ews/steg2/stories-v1.yaml': {
    path: 'korningar/ews/steg2/stories-v1.yaml',
    filnamn: 'stories-v1.yaml',
    rubrik: 'Stories · EWS-001',
    typ: 'stories', version: '1.0', dataklass: 0, producent: 'A2', steg: 2,
    frontmatter: ['typ: stories', 'version: 1.0', 'spec_ref: EWS-001', 'dataklass: 0', 'producent: A2'],
    meta_path: 'korningar/ews/steg2/stories-v1.meta.json', storlek: '3,4 kB',
    skapad: '2026-09-03 14:12:09 UTC', varaktighet: '21 ms', commit: '659afb6',
    block: [
      { t: 'h1', text: 'Stories · EWS-001' },
      { t: 'p', text: 'Sex stories med spec_ref, dataklass 0, beroenden och acceptanskriterier. Öppna Stories-vyn för listan i tabellform.' },
      { t: 'kod', text: 'stories:\n  - id: EWS-001.1\n    titel: Hämta vitals från Philips-system\n    spec_ref: K1\n    uppskattning: M\n    dataklass: 0\n    beroenden: []' }
    ]
  },
  'korningar/ews/steg2/tackning.md': {
    path: 'korningar/ews/steg2/tackning.md',
    filnamn: 'tackning.md',
    rubrik: 'Täckningsmatris · EWS-001',
    typ: 'tackningsmatris', version: '1.0', dataklass: 0, producent: 'A3', steg: 2,
    frontmatter: ['typ: tackningsmatris', 'granskare: A3', 'pool: B', 'avser: stories-v1.yaml'],
    meta_path: 'korningar/ews/steg2/tackning.meta.json', storlek: '0,9 kB',
    skapad: '2026-09-03 14:12:09 UTC', varaktighet: '14 ms', commit: '659afb6',
    block: [
      { t: 'h1', text: 'Täckningsmatris · EWS-001' },
      { t: 'p', text: 'Krav K1–K5 täckta av stories. K6 (temperatur i beräkningen) saknar story. Nedbrytningsfel — inte kodfel. G2 väntar.' }
    ]
  },
  'korningar/ews/G1/beslut.md': {
    path: 'korningar/ews/G1/beslut.md',
    filnamn: 'beslut.md',
    rubrik: 'Grindbeslut · G1 · EWS',
    typ: 'grindbeslut', version: '1.0', dataklass: 0, producent: '—', steg: 1,
    frontmatter: ['typ: grindbeslut', 'grind: G1', 'modul: EWS', 'utfall: godkänt med villkor'],
    meta_path: 'korningar/ews/G1/beslut.meta.json', storlek: '1,1 kB',
    skapad: '2026-09-03 14:12:08 UTC', varaktighet: '—', commit: '659afb6',
    block: [
      { t: 'h1', text: 'Grindbeslut · G1 · Specgodkännande' },
      { t: 'p', text: 'Modul EWS. Underlag: steg0/spec-v1.md och steg1/review-v1.md vid commit 659afb6.' },
      { t: 'h2', text: 'Utfall' },
      { t: 'p', text: 'Godkänt med villkor. Beslutsfattare: Mock Demo (etapp 0).' },
      { t: 'li', text: 'Lägg till felhantering-sektion i specen.' },
      { t: 'li', text: 'Verifiera och referera Philips API-dokumentation.' }
    ]
  }
};

const RELATIONER = {
  'korningar/ews/steg0/spec-v1.md': {
    in: [{ path: 'korningar/ews/steg0/input.md', roll: 'forslagsspec' }],
    ut: [
      { path: 'korningar/ews/steg1/review-v1.md', roll: 'granskning av denna artefakt' },
      { path: 'korningar/ews/steg2/stories-v1.yaml', roll: 'nedbrytning av denna spec' },
      { path: 'korningar/ews/G1/beslut.md', roll: 'grindbeslut på denna version' },
      { path: 'korningar/ews/steg2/story-EWS-001.1.md', roll: 'story ur nedbrytningen' },
      { path: 'korningar/ews/steg2/story-EWS-001.2.md', roll: 'story ur nedbrytningen' },
      { path: 'korningar/ews/steg2/story-EWS-001.3.md', roll: 'story ur nedbrytningen' },
      { path: 'korningar/ews/steg2/story-EWS-001.4.md', roll: 'story ur nedbrytningen' },
      { path: 'korningar/ews/steg2/story-EWS-001.5.md', roll: 'story ur nedbrytningen' },
      { path: 'korningar/ews/steg2/story-EWS-001.6.md', roll: 'story ur nedbrytningen' }
    ],
    versioner: [
      { path: 'spec-v1.md', not: 'aktuell · 2026-09-03 14:12:08 UTC · commit 659afb6', ej_skapad: false },
      { path: 'forslag-v0.md', not: 'intagsutkast · samma commit', ej_skapad: false },
      { path: 'spec-v2.md', not: 'kommer vid specfel — L3: ny specversion, A1 granskar diffen, G1 tas om', ej_skapad: true }
    ]
  }
};

const DATAKALLOR = [
  { kalla: 'korningar/ews/korning.json', typ: 'index', dataklass: '0', status: 'läst', lank: null },
  { kalla: 'korningar/ews/**/*.md', typ: 'råtext', dataklass: '0', status: 'läst vid behov', lank: 'korningar/ews/steg0/spec-v1.md' },
  { kalla: 'korningar/ews/**/*.meta.json', typ: 'proveniens', dataklass: '0', status: 'läst', lank: null },
  { kalla: '.smedjan/agents.yaml', typ: 'konfiguration', dataklass: '0', status: 'läst', lank: null },
  { kalla: '.smedjan/dataklass.yaml', typ: 'konfiguration', dataklass: '0', status: 'läst', lank: null },
  { kalla: 'Philips ORU^R01 (verklig telemetri)', typ: 'systemintegration', dataklass: '2', status: 'ej ansluten — spärrad i demot', lank: null, sparrad: true },
  { kalla: 'Portal-API', typ: 'tjänst', dataklass: '—', status: 'finns inte i demot', lank: null }
];

const DEMOGUIDE = [
  { minut: '0–2', visar: 'Översikt: projekt, senaste körningar, väntar på människa', vy: 'Översikt', rutt: '#/oversikt', sager: 'Det här är hur Datahubben byggs, inte en ny produkt.' },
  { minut: '2–5', visar: 'Körningsdetalj: tidslinjen 0–12 med grindarna inflätade', vy: 'Körningsdetalj', rutt: '#/korning/ews-2026-09-03T14-12-08Z?steg=0', sager: 'Tolv steg och fyra grindar syns från dag ett — steg 0–2 är körda, resten är nedtonat.' },
  { minut: '5–8', visar: 'Artefakt: spec-v1.md och provenienslådan', vy: 'Artefakt', rutt: '#/artefakt/korningar/ews/steg0/spec-v1.md', sager: 'Varje artefakt bär vem som producerade den, ur vilken pool, till vilken kostnad.' },
  { minut: '8–10', visar: 'Grindbeslut G1: rekommendation, villkor, inaktiva knappar', vy: 'Grindbeslut', rutt: '#/grind/G1', sager: 'Agenten rekommenderar. Människan beslutar. Beslutet ligger i Git.' },
  { minut: '10–12', visar: 'Separation och dataklass: S1–S6, klass 0–2, pool D-spärr', vy: 'Separation', rutt: '#/separation', sager: 'Producent och granskare kommer ur olika pooler, och klass 2 lämnar aldrig huset.' },
  { minut: '12–14', visar: 'Stories och täckning: K6 saknar story', vy: 'Stories', rutt: '#/stories', sager: 'A3 hittar att temperatur inte täcks — ett nedbrytningsfel, inte ett kodfel.' },
  { minut: '14–15', visar: 'Kostnad: 0 USD i mock', vy: 'Kostnad', rutt: '#/kostnad', sager: 'Demot kostar noll. Nyckeln är en adapter, inte arkitekturen.' }
];

const ARTBOARDS = [
  { nr: '01', namn: 'Översikt — normalläge', bredd: '1440', rutt: '#/oversikt', familj: '1' },
  { nr: '02', namn: 'Översikt — inga projekt eller körningar', bredd: '1440', rutt: '#/oversikt?tomt=1', familj: '1 + 12' },
  { nr: '03', namn: 'Körningsdetalj — steg 0 valt (spec-v1.md)', bredd: '1440', rutt: '#/korning/ews-2026-09-03T14-12-08Z?steg=0', familj: '2' },
  { nr: '04', namn: 'Körningsdetalj — steg 1 valt (review-v1.md)', bredd: '1440', rutt: '#/korning/ews-2026-09-03T14-12-08Z?steg=1', familj: '2' },
  { nr: '05', namn: 'Körningsdetalj — grind G1 vald, inline grindpanel', bredd: '1440', rutt: '#/korning/ews-2026-09-03T14-12-08Z?grind=G1', familj: '2 + 4' },
  { nr: '06', namn: 'Körningsdetalj — framtida steg 7 valt, ej kört', bredd: '1440', rutt: '#/korning/ews-2026-09-03T14-12-08Z?steg=7', familj: '2 + 12' },
  { nr: '07', namn: 'Körningsdetalj — blockerad körning, S5 tre varv', bredd: '1440', rutt: '#/korning/ews-2026-09-03T11-04-52Z?steg=2', familj: '2 + 12' },
  { nr: '08', namn: 'Artefakt helsida — spec-v1.md', bredd: '1440', rutt: '#/artefakt/korningar/ews/steg0/spec-v1.md', familj: '3' },
  { nr: '09', namn: 'Artefakt helsida — relationer och versioner utfällda', bredd: '1440', rutt: '#/artefakt/korningar/ews/steg0/spec-v1.md?relationer=1', familj: '3' },
  { nr: '10', namn: 'Grindbeslut helsida — G1 godkänd med villkor (mock)', bredd: '1440', rutt: '#/grind/G1', familj: '4' },
  { nr: '11', namn: 'Grindbeslut som modal över körningsdetalj', bredd: '1440', rutt: '#/korning/ews-2026-09-03T14-12-08Z?grind=G1&modal=1', familj: '4' },
  { nr: '12', namn: 'Grindbeslut helsida — G2 väntar på beslut', bredd: '1440', rutt: '#/grind/G2', familj: '4 + 12' },
  { nr: '13', namn: 'Stories — listvy med filter', bredd: '1440', rutt: '#/stories', familj: '5' },
  { nr: '14', namn: 'Stories — kortvy', bredd: '1440', rutt: '#/stories?vy=kort', familj: '5' },
  { nr: '15', namn: 'Stories — detaljdrawer öppen, EWS-001.1', bredd: '1440', rutt: '#/stories?story=EWS-001.1', familj: '5' },
  { nr: '16', namn: 'Agenter & modellpooler — A0–A13', bredd: '1440', rutt: '#/agenter', familj: '6' },
  { nr: '17', namn: 'Agenter — agentdetalj drawer, A1', bredd: '1440', rutt: '#/agenter?agent=A1', familj: '6' },
  { nr: '18', namn: 'Separation & dataklass', bredd: '1440', rutt: '#/separation', familj: '7' },
  { nr: '19', namn: 'Separation — klass 2 blockerad, pool D-spärr', bredd: '1440', rutt: '#/separation?klass2=blockerad', familj: '7 + 12' },
  { nr: '20', namn: 'Kostnad & användning — mock 0 USD', bredd: '1440', rutt: '#/kostnad', familj: '8' },
  { nr: '21', namn: 'Kostnad — budget och tak, ej konfigurerat', bredd: '1440', rutt: '#/kostnad?budget=1', familj: '8 + 12' },
  { nr: '22', namn: 'Körningar/historik — filter och status', bredd: '1440', rutt: '#/korningar', familj: '9' },
  { nr: '23', namn: 'Körningar/historik — inga träffar', bredd: '1440', rutt: '#/korningar?backend=live', familj: '9 + 12' },
  { nr: '24', namn: 'Projektinställningar & datakällor, läsläge', bredd: '1440', rutt: '#/installningar', familj: '10' },
  { nr: '25', namn: 'Hjälp & demo-guide — femton minuter EWS', bredd: '1440', rutt: '#/hjalp', familj: '11' },
  { nr: '26', namn: 'Systemtillstånd A — laddar, tomt, fel, blockerad', bredd: '1440', rutt: '#/systemtillstand', familj: '12' },
  { nr: '27', namn: 'Systemtillstånd B — inget index, inga artefakter, klass 2, gammal data', bredd: '1440', rutt: '#/systemtillstand?del=b', familj: '12' },
  { nr: '28', namn: 'Översikt', bredd: '1280', rutt: '#/oversikt', familj: '1' },
  { nr: '29', namn: 'Körningsdetalj', bredd: '1280', rutt: '#/korning/ews-2026-09-03T14-12-08Z?steg=0', familj: '2' },
  { nr: '30', namn: 'Artefakt helsida', bredd: '1280', rutt: '#/artefakt/korningar/ews/steg0/spec-v1.md', familj: '3' },
  { nr: '31', namn: 'Grindbeslut helsida', bredd: '1280', rutt: '#/grind/G1', familj: '4' },
  { nr: '32', namn: 'Stories — listvy', bredd: '1280', rutt: '#/stories', familj: '5' },
  { nr: '33', namn: 'Översikt', bredd: '768', rutt: '#/oversikt', familj: '1' },
  { nr: '34', namn: 'Körningsdetalj', bredd: '768', rutt: '#/korning/ews-2026-09-03T14-12-08Z?steg=0', familj: '2' },
  { nr: '35', namn: 'Artefakt helsida', bredd: '768', rutt: '#/artefakt/korningar/ews/steg0/spec-v1.md', familj: '3' },
  { nr: '36', namn: 'Grindbeslut helsida', bredd: '768', rutt: '#/grind/G1', familj: '4' },
  { nr: '37', namn: 'Stories — listvy med detalj som helsidesark', bredd: '768', rutt: '#/stories?story=EWS-001.1', familj: '5' },
  { nr: '38', namn: 'Ark: design tokens', bredd: '1440', rutt: '#/tokens', familj: '—' },
  { nr: '39', namn: 'Ark: komponentbibliotek', bredd: '1440', rutt: '#/komponenter', familj: '—' },
  { nr: '40', namn: 'Ark: tillgänglighet', bredd: '1440', rutt: '#/tillganglighet', familj: '—' },
  { nr: '41', namn: 'Designindex', bredd: '1440', rutt: '#/design', familj: '—' }
];

const KOMPONENTER = [
  { k: 'K1', namn: 'Toppfalt', ansvar: 'ordmärke, projektväljare, badge-rad', tillstand: 'mock (alltid i demot), klass 0/1/2' },
  { k: 'K2', namn: 'MockRemsa', ansvar: 'permanent mock-deklaration under toppfältet', tillstand: 'mock, dold' },
  { k: 'K3', namn: 'SidNav', ansvar: 'grupperad navigation, aktiv rad', tillstand: 'normal, aktiv, fokus' },
  { k: 'K4', namn: 'Sidhuvud', ansvar: 'H1, dek, chiprad, avdelare', tillstand: 'med/utan chiprad' },
  { k: 'K5', namn: 'StegRad', ansvar: 'nummer, namn, statusprick, agent-chip, varv', tillstand: 'kört, ej kört, valt, blockerad, fel, överhoppad, kör, fokus' },
  { k: 'K6', namn: 'GrindRad', ansvar: 'romb, grind-id och namn, beslut, mock-märke', tillstand: 'godkänd, godkänd med villkor, väntar, återremiss, ej nådd, valt' },
  { k: 'K7', namn: 'StatusPrick', ansvar: 'sex tillstånd, form plus färg plus ord', tillstand: 'alla sex' },
  { k: 'K8', namn: 'AgentChip', ansvar: 'A0 · Intag med agent-id i monospace', tillstand: 'normal, länkad, ej kört' },
  { k: 'K9', namn: 'PoolChip', ansvar: 'pool A · Anthropic', tillstand: 'pool A, B, C, D (D med hänglås)' },
  { k: 'K10', namn: 'DataklassBadge', ansvar: 'klass 0, 1, 2', tillstand: '0, 1, 2' },
  { k: 'K11', namn: 'MockBadge', ansvar: 'alltid i toppfältet när ar_mock', tillstand: 'normal' },
  { k: 'K12', namn: 'ArtefaktLasare', ansvar: 'filnamn, frontmatter-chips, renderad markdown', tillstand: 'laddar, klar, tom, fel' },
  { k: 'K13', namn: 'ProveniensLada', ansvar: 'agent, pool, familj, modellkonfig, tokens, USD, tid, stub, in/ut', tillstand: 'mock/stub, ej kört, saknas' },
  { k: 'K14', namn: 'GrindKort', ansvar: 'rekommendation, villkor, quorum, historik, beslutsknappar', tillstand: 'godkänd med villkor, väntar, inline och modal' },
  { k: 'K15', namn: 'StoryKort', ansvar: 'id, titel, uppskattning, beroendechips, acceptanskriterier', tillstand: 'todo, pågår, klar, blockerad' },
  { k: 'K16', namn: 'StoryRad', ansvar: 'tabellrad för listvyn', tillstand: 'normal, hover, vald, utan beroenden' },
  { k: 'K17', namn: 'KostnadsRad', ansvar: 'tokens in/ut och USD per steg och totalt', tillstand: 'mock 0, ej kört, ej konfigurerad' },
  { k: 'K18', namn: 'SeparationsRad', ansvar: 'regel, gäller, pooler, familjer, status, motivering', tillstand: 'uppfylld, ej tillämplig, bruten' },
  { k: 'K19', namn: 'FilterRad', ansvar: 'filtergrupper, aktiva filter-chips, Rensa', tillstand: 'inget filter, aktivt filter, inga träffar' },
  { k: 'K20', namn: 'Datatabell', ansvar: 'standardtabellen', tillstand: 'med data, tomt, laddar, fel' },
  { k: 'K21', namn: 'NotRad', ansvar: 'sandfärgad notrad för regler och förtydliganden', tillstand: 'normal' },
  { k: 'K22', namn: 'VarningsRad', ansvar: 'rödbrun vänsterkant för blockerad, fel, spärr', tillstand: 'blockerad, fel, spärrad' },
  { k: 'K23', namn: 'TomtLage', ansvar: 'rubrik, förklaring, kommandoruta, navigeringsåtgärd', tillstand: 'ingen körning, inga artefakter, inga träffar' },
  { k: 'K24', namn: 'LaddarLage', ansvar: 'text i role=status plus statiska platshållarlinjer', tillstand: 'laddar tabell, laddar artefakt' },
  { k: 'K25', namn: 'KommandoRuta', ansvar: 'monospace-kommando med 1 px kant', tillstand: 'normal' },
  { k: 'K26', namn: 'Drawer', ansvar: 'högerpanel för story och agent', tillstand: 'öppen, stängd, laddar' },
  { k: 'K27', namn: 'Modal', ansvar: 'endast grindbeslut', tillstand: 'öppen' },
  { k: 'K28', namn: 'Brodsmula', ansvar: 'Körningar / ews / körning-id / steg / fil', tillstand: 'full, kort' },
  { k: 'K29', namn: 'MetadataTabell', ansvar: 'tvåkolumnstabell för metadata', tillstand: 'full, med saknade fält' },
  { k: 'K30', namn: 'TidslinjeMini', ansvar: 'fas- och stegöversikt för Översikt', tillstand: 'normal' },
  { k: 'K31', namn: 'SidFot', ansvar: 'demo- och läsläges-deklaration', tillstand: 'normal' },
  { k: 'K32', namn: 'InaktivKnappGrupp', ansvar: 'knappar plus obligatorisk anledningstext', tillstand: 'grindbeslut, export, starta körning' }
];

const KONTRAST = [
  { komb: '#1A2422 på vitt', varde: '15.9:1', anv: 'allt' },
  { komb: '#4A5754 på vitt', varde: '7.6:1', anv: 'all brödtext och alla etiketter' },
  { komb: '#0E6B6B på vitt', varde: '6.3:1', anv: 'text, länkar, former' },
  { komb: 'vitt på #0E6B6B', varde: '6.3:1', anv: 'primärknappens text' },
  { komb: '#8C3B2E på vitt', varde: '7.6:1', anv: 'text, kanter, prickar' },
  { komb: '#1A2422 på #F4E6CF', varde: '12.9:1', anv: 'text på sandyta' },
  { komb: '#B0731A på vitt', varde: '4.0:1', anv: 'endast icke-text och text ≥ 24 px' },
  { komb: '#7A8785 på vitt', varde: '3.7:1', anv: 'endast icke-text; aldrig brödtext' },
  { komb: '#B8B2A8 på vitt', varde: '2.1:1', anv: 'endast dekorativ yta, med 1 px #7A8785-kant' }
];

const TOKENS = [
  { token: '--blick', roll: 'Bläck: rubriker, viktig text', varde: '#1A2422' },
  { token: '--brod', roll: 'Brödtext, etiketter', varde: '#4A5754' },
  { token: '--dampad', roll: 'Dämpad — endast icke-text eller text ≥ 24 px', varde: '#7A8785' },
  { token: '--teal', roll: 'Primär: klar, valt, primärknapp, länk', varde: '#0E6B6B' },
  { token: '--sand-ljus', roll: 'Mock-remsa, notrader, tabellhuvud', varde: '#F4E6CF' },
  { token: '--sand-mork', roll: 'Status kör, mock-kant, klass 1', varde: '#B0731A' },
  { token: '--rodbrun', roll: 'Blockerad, fel, klass 2, pool D-spärr', varde: '#8C3B2E' },
  { token: '--vantar', roll: 'Status väntar, ogjorda tidslinjerader', varde: '#B8B2A8' },
  { token: '--linje', roll: '1 px linjer, avdelare, kanter', varde: '#E6E2DA' },
  { token: '--botten', roll: 'Sidbotten', varde: '#FFFFFF' },
  { token: '--yta-2', roll: 'Tabellhuvud, radhover, panelhuvud', varde: '#FAF9F6' }
];

window.SMEDJAN = { PROCESS, GRINDAR_DEF, AGENTER, POOLER, SEPARATIONSREGLER, BINDNINGAR, DATAKLASSER, PROJEKT, STORIES, TACKNING, AKCEPTANSKRITERIER, MOCK_KORNINGAR, KORNINGSLISTA, ARTEFAKTER, RELATIONER, DATAKALLOR, DEMOGUIDE, ARTBOARDS, KOMPONENTER, KONTRAST, TOKENS };
})();
