/* Сынақ — боссы арены. Нарисованы вручную в SVG, анимируются через css/boss.css (классы b-*). */
(function (root) {
  'use strict';
  const ART = {};

  // Математика: Тригонометр — летающий кристалл с одним глазом и знаками вокруг
  ART.math = `
<svg viewBox="0 0 240 240" class="boss-svg">
  <defs>
    <linearGradient id="mt1" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ede9fe"/><stop offset="1" stop-color="#a78bfa"/></linearGradient>
    <linearGradient id="mt2" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#a78bfa"/><stop offset="1" stop-color="#6d28d9"/></linearGradient>
    <linearGradient id="mt3" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#6d28d9"/><stop offset="1" stop-color="#2e1065"/></linearGradient>
    <radialGradient id="mtE"><stop offset="0" stop-color="#fff7c2"/><stop offset=".45" stop-color="#facc15"/><stop offset="1" stop-color="#ea580c"/></radialGradient>
    <radialGradient id="mtG"><stop offset="0" stop-color="#c4b5fd" stop-opacity=".7"/><stop offset="1" stop-color="#7c3aed" stop-opacity="0"/></radialGradient>
  </defs>
  <circle cx="120" cy="120" r="112" fill="url(#mtG)" class="b-aura"/>
  <g class="b-orbit" font-family="Georgia, serif" font-weight="700" fill="#e9d5ff">
    <text x="18" y="70" font-size="30">π</text><text x="200" y="64" font-size="28">√</text>
    <text x="206" y="196" font-size="28">∑</text><text x="12" y="200" font-size="30">∞</text>
  </g>
  <g class="b-limb l"><polygon points="20,118 38,96 50,124 34,146" fill="url(#mt2)" stroke="#ddd6fe" stroke-width="1.5"/></g>
  <g class="b-limb r"><polygon points="220,118 202,96 190,124 206,146" fill="url(#mt3)" stroke="#ddd6fe" stroke-width="1.5"/></g>
  <g class="b-body" stroke="#f5f3ff" stroke-opacity=".55" stroke-width="1.6" stroke-linejoin="round">
    <polygon points="120,30 42,75 120,70" fill="url(#mt1)"/>
    <polygon points="120,30 198,75 120,70" fill="url(#mt2)"/>
    <polygon points="42,75 77,145 120,70" fill="url(#mt2)"/>
    <polygon points="198,75 163,145 120,70" fill="url(#mt3)"/>
    <polygon points="42,75 42,165 77,145" fill="url(#mt3)"/>
    <polygon points="198,75 198,165 163,145" fill="#2e1065"/>
    <polygon points="42,165 120,210 77,145" fill="url(#mt3)"/>
    <polygon points="198,165 120,210 163,145" fill="#1e0a46"/>
    <polygon points="77,145 163,145 120,210" fill="url(#mt2)"/>
    <polygon points="120,70 163,145 77,145" fill="url(#mt1)"/>
    <g class="b-eye">
      <ellipse cx="120" cy="120" rx="27" ry="20" fill="#fff" stroke="#4c1d95" stroke-width="3"/>
      <circle cx="120" cy="120" r="14" fill="url(#mtE)" stroke="none"/>
      <ellipse cx="120" cy="120" rx="3.5" ry="11" fill="#1c1917" stroke="none"/>
      <circle cx="114" cy="114" r="3" fill="#fff" stroke="none"/>
      <rect class="b-lid" x="92" y="99" width="56" height="42" rx="20" fill="#7c3aed" stroke="none"/>
    </g>
    <path class="b-brow" d="M94 98 L120 108 L146 98" fill="none" stroke="#1e0a46" stroke-width="5" stroke-linecap="round"/>
  </g>
</svg>`;

  // Физика: Тесла-Колосс — робот с катушками Теслы на плечах
  ART.physics = `
<svg viewBox="0 0 240 240" class="boss-svg">
  <defs>
    <linearGradient id="phS" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#e2e8f0"/><stop offset=".5" stop-color="#64748b"/><stop offset="1" stop-color="#1e293b"/></linearGradient>
    <linearGradient id="phD" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#475569"/><stop offset="1" stop-color="#0f172a"/></linearGradient>
    <radialGradient id="phC"><stop offset="0" stop-color="#fff"/><stop offset=".4" stop-color="#67e8f9"/><stop offset="1" stop-color="#0891b2"/></radialGradient>
    <linearGradient id="phCu" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#9a3412"/><stop offset=".5" stop-color="#fb923c"/><stop offset="1" stop-color="#7c2d12"/></linearGradient>
    <radialGradient id="phG"><stop offset="0" stop-color="#22d3ee" stop-opacity=".55"/><stop offset="1" stop-color="#22d3ee" stop-opacity="0"/></radialGradient>
  </defs>
  <circle cx="120" cy="125" r="112" fill="url(#phG)" class="b-aura"/>
  <polyline class="b-zap" points="44,34 62,22 76,38 96,16 112,34 128,12 146,32 162,18 178,36 196,24" fill="none" stroke="#a5f3fc" stroke-width="3.5" stroke-linejoin="round"/>
  <polyline class="b-zap z2" points="44,34 58,40 80,26 100,42 118,24 138,40 156,24 176,42 196,24" fill="none" stroke="#fff" stroke-width="2" stroke-linejoin="round"/>
  <g class="b-body">
    <g class="b-limb l">
      <rect x="22" y="104" width="30" height="66" rx="14" fill="url(#phD)" stroke="#94a3b8" stroke-width="2"/>
      <rect x="16" y="166" width="42" height="34" rx="12" fill="url(#phS)" stroke="#0f172a" stroke-width="2"/>
    </g>
    <g class="b-limb r">
      <rect x="188" y="104" width="30" height="66" rx="14" fill="url(#phD)" stroke="#94a3b8" stroke-width="2"/>
      <rect x="182" y="166" width="42" height="34" rx="12" fill="url(#phS)" stroke="#0f172a" stroke-width="2"/>
    </g>
    <path d="M58 92 L182 92 L170 196 Q120 214 70 196 Z" fill="url(#phS)" stroke="#0f172a" stroke-width="3"/>
    <path d="M78 110 L162 110 L156 180 Q120 192 84 180 Z" fill="url(#phD)" opacity=".8"/>
    <circle cx="120" cy="146" r="22" fill="url(#phC)" class="b-core"/>
    <circle cx="120" cy="146" r="30" fill="none" stroke="#67e8f9" stroke-width="2" stroke-dasharray="6 5" class="b-spin"/>
    <g>
      <rect x="40" y="48" width="22" height="50" rx="4" fill="url(#phCu)"/>
      <g stroke="#451a03" stroke-width="1.4" opacity=".7"><line x1="40" y1="56" x2="62" y2="56"/><line x1="40" y1="64" x2="62" y2="64"/><line x1="40" y1="72" x2="62" y2="72"/><line x1="40" y1="80" x2="62" y2="80"/><line x1="40" y1="88" x2="62" y2="88"/></g>
      <circle cx="51" cy="40" r="11" fill="url(#phC)"/>
      <rect x="178" y="48" width="22" height="50" rx="4" fill="url(#phCu)"/>
      <g stroke="#451a03" stroke-width="1.4" opacity=".7"><line x1="178" y1="56" x2="200" y2="56"/><line x1="178" y1="64" x2="200" y2="64"/><line x1="178" y1="72" x2="200" y2="72"/><line x1="178" y1="80" x2="200" y2="80"/><line x1="178" y1="88" x2="200" y2="88"/></g>
      <circle cx="189" cy="40" r="11" fill="url(#phC)"/>
    </g>
    <rect x="86" y="44" width="68" height="54" rx="16" fill="url(#phS)" stroke="#0f172a" stroke-width="3"/>
    <rect x="92" y="62" width="56" height="16" rx="8" fill="#0f172a"/>
    <g class="b-eye"><rect x="96" y="65" width="48" height="10" rx="5" fill="url(#phC)"/><rect class="b-lid" x="94" y="63" width="52" height="14" rx="7" fill="#334155"/></g>
    <rect x="108" y="86" width="24" height="5" rx="2" fill="#0f172a"/>
    <path class="b-brow" d="M92 58 L120 64 L148 58" fill="none" stroke="#0f172a" stroke-width="4" stroke-linecap="round"/>
  </g>
</svg>`;

  // Информатика: Глюк-Паук — паук с головой-монитором
  ART.informatics = `
<svg viewBox="0 0 240 240" class="boss-svg">
  <defs>
    <linearGradient id="inB" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#1f2937"/><stop offset="1" stop-color="#030712"/></linearGradient>
    <linearGradient id="inS" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#052e16"/><stop offset="1" stop-color="#14532d"/></linearGradient>
    <radialGradient id="inG"><stop offset="0" stop-color="#22c55e" stop-opacity=".5"/><stop offset="1" stop-color="#22c55e" stop-opacity="0"/></radialGradient>
  </defs>
  <circle cx="120" cy="120" r="112" fill="url(#inG)" class="b-aura"/>
  <g class="b-rain" font-family="ui-monospace, Menlo, monospace" font-size="11" fill="#4ade80" opacity=".55">
    <text x="14" y="30">10110</text><text x="190" y="44">0x1F</text><text x="8" y="226">null</text><text x="186" y="222">if(!)</text><text x="196" y="130">;;</text>
  </g>
  <g class="b-legs" stroke="#111827" stroke-width="7" stroke-linecap="round" stroke-linejoin="round" fill="none">
    <polyline class="leg l1" points="96,128 52,92 22,120"/><polyline class="leg l2" points="94,140 44,132 14,168"/>
    <polyline class="leg l3" points="96,152 50,170 30,212"/><polyline class="leg l4" points="102,160 72,196 66,230"/>
    <polyline class="leg r1" points="144,128 188,92 218,120"/><polyline class="leg r2" points="146,140 196,132 226,168"/>
    <polyline class="leg r3" points="144,152 190,170 210,212"/><polyline class="leg r4" points="138,160 168,196 174,230"/>
  </g>
  <g stroke="#22c55e" stroke-width="2" stroke-linecap="round" fill="none" opacity=".75">
    <polyline points="52,92 22,120"/><polyline points="44,132 14,168"/><polyline points="188,92 218,120"/><polyline points="196,132 226,168"/>
  </g>
  <g class="b-body">
    <ellipse cx="120" cy="164" rx="44" ry="34" fill="url(#inB)" stroke="#22c55e" stroke-width="2"/>
    <path d="M92 158 H108 V172 H132 V158 H148 M120 172 V194" stroke="#22c55e" stroke-width="2" fill="none" opacity=".8"/>
    <circle cx="120" cy="194" r="3" fill="#4ade80"/><circle cx="92" cy="158" r="3" fill="#4ade80"/><circle cx="148" cy="158" r="3" fill="#4ade80"/>
    <rect x="70" y="52" width="100" height="84" rx="12" fill="#d1d5db" stroke="#111827" stroke-width="3"/>
    <rect x="80" y="60" width="80" height="62" rx="8" fill="url(#inS)" stroke="#111827" stroke-width="2"/>
    <rect x="108" y="136" width="24" height="10" fill="#9ca3af" stroke="#111827" stroke-width="2"/>
    <circle cx="158" cy="129" r="3" fill="#ef4444" class="b-core"/>
    <g class="b-eye">
      <g fill="#4ade80"><rect x="92" y="72" width="16" height="16"/><rect x="132" y="72" width="16" height="16"/></g>
      <g fill="#052e16"><rect x="100" y="76" width="6" height="8"/><rect x="140" y="76" width="6" height="8"/></g>
      <rect class="b-lid" x="88" y="68" width="64" height="24" fill="#052e16"/>
    </g>
    <path class="b-mouth" d="M96 104 l6 -6 l6 6 l6 -6 l6 6 l6 -6 l6 6 l6 -6 l6 6" fill="none" stroke="#4ade80" stroke-width="3" stroke-linejoin="round"/>
    <path class="b-brow" d="M90 66 L110 72 M150 66 L130 72" stroke="#4ade80" stroke-width="3" stroke-linecap="round"/>
    <rect x="80" y="60" width="80" height="62" rx="8" fill="#fff" opacity=".06" class="b-scan"/>
  </g>
</svg>`;

  // Химия: Кислотный Слизень — живая слизь в колбе
  ART.chemistry = `
<svg viewBox="0 0 240 240" class="boss-svg">
  <defs>
    <linearGradient id="chL" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#d9f99d"/><stop offset=".45" stop-color="#84cc16"/><stop offset="1" stop-color="#365314"/></linearGradient>
    <linearGradient id="chGl" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#fff" stop-opacity=".5"/><stop offset=".3" stop-color="#fff" stop-opacity=".08"/><stop offset="1" stop-color="#fff" stop-opacity=".25"/></linearGradient>
    <radialGradient id="chG"><stop offset="0" stop-color="#bef264" stop-opacity=".55"/><stop offset="1" stop-color="#84cc16" stop-opacity="0"/></radialGradient>
  </defs>
  <circle cx="120" cy="130" r="110" fill="url(#chG)" class="b-aura"/>
  <g class="b-limb l"><path d="M58 150 Q24 140 18 108 Q30 112 34 100 Q46 130 70 132 Z" fill="url(#chL)" stroke="#1a2e05" stroke-width="2.5"/></g>
  <g class="b-limb r"><path d="M182 150 Q216 140 222 108 Q210 112 206 100 Q194 130 170 132 Z" fill="url(#chL)" stroke="#1a2e05" stroke-width="2.5"/></g>
  <g class="b-body">
    <path d="M98 22 H142 V30 H136 V76 L196 186 Q204 212 176 214 H64 Q36 212 44 186 L104 76 V30 H98 Z" fill="#ecfccb" fill-opacity=".18" stroke="#e2e8f0" stroke-width="3.5"/>
    <path d="M104 70 Q112 60 120 70 Q128 80 136 70 L194 182 Q202 208 176 210 H64 Q38 208 46 182 Z" fill="url(#chL)"/>
    <path d="M136 76 L120 40 Q118 30 126 26 Q134 30 130 44 Z" fill="url(#chL)" stroke="#1a2e05" stroke-width="2"/>
    <g class="b-bub" fill="#ecfccb" opacity=".8"><circle cx="86" cy="190" r="5"/><circle cx="160" cy="176" r="4"/><circle cx="112" cy="200" r="3"/><circle cx="146" cy="198" r="6"/></g>
    <g class="b-eye">
      <ellipse cx="98" cy="134" rx="15" ry="18" fill="#fff" stroke="#1a2e05" stroke-width="2.5"/><circle cx="101" cy="138" r="7" fill="#1a2e05"/><circle cx="98" cy="134" r="2.5" fill="#fff"/>
      <ellipse cx="144" cy="130" rx="18" ry="21" fill="#fff" stroke="#1a2e05" stroke-width="2.5"/><circle cx="141" cy="135" r="8" fill="#1a2e05"/><circle cx="138" cy="130" r="3" fill="#fff"/>
      <rect class="b-lid" x="78" y="108" width="88" height="46" rx="20" fill="#65a30d"/>
    </g>
    <path class="b-brow" d="M82 112 L110 122 M162 108 L132 120" stroke="#1a2e05" stroke-width="5" stroke-linecap="round"/>
    <path class="b-mouth" d="M84 166 Q120 196 160 162 Q150 182 120 184 Q96 182 84 166 Z" fill="#1a2e05"/>
    <path d="M100 176 l5 8 l5 -7 M128 179 l5 7 l5 -9" fill="#ecfccb" stroke="none"/>
    <path d="M70 206 q4 12 0 18 q-6 -4 0 -18 M168 206 q5 10 1 16 q-6 -4 -1 -16" fill="#84cc16" class="b-drip"/>
    <path d="M58 184 L104 82" stroke="url(#chGl)" stroke-width="8" stroke-linecap="round"/>
    <g stroke="#e2e8f0" stroke-width="2" opacity=".6"><line x1="150" y1="120" x2="164" y2="120"/><line x1="160" y1="142" x2="176" y2="142"/><line x1="170" y1="164" x2="188" y2="164"/></g>
  </g>
</svg>`;

  // Биология: Росянка-Мутант — хищное растение с ДНК-лозой
  ART.biology = `
<svg viewBox="0 0 240 240" class="boss-svg">
  <defs>
    <linearGradient id="biS" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#14532d"/><stop offset=".5" stop-color="#22c55e"/><stop offset="1" stop-color="#14532d"/></linearGradient>
    <linearGradient id="biJ" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#4ade80"/><stop offset="1" stop-color="#166534"/></linearGradient>
    <radialGradient id="biM"><stop offset="0" stop-color="#4c0519"/><stop offset=".6" stop-color="#be123c"/><stop offset="1" stop-color="#fb7185"/></radialGradient>
    <radialGradient id="biG"><stop offset="0" stop-color="#fb7185" stop-opacity=".45"/><stop offset="1" stop-color="#f43f5e" stop-opacity="0"/></radialGradient>
  </defs>
  <circle cx="120" cy="110" r="110" fill="url(#biG)" class="b-aura"/>
  <g class="b-limb l"><path d="M110 200 Q60 196 30 160 Q66 160 104 186 Z" fill="url(#biJ)" stroke="#052e16" stroke-width="2"/><path d="M106 192 Q70 180 42 164" stroke="#052e16" stroke-width="1.5" fill="none"/></g>
  <g class="b-limb r"><path d="M130 196 Q182 198 212 150 Q176 154 136 182 Z" fill="url(#biJ)" stroke="#052e16" stroke-width="2"/><path d="M134 188 Q172 176 200 156" stroke="#052e16" stroke-width="1.5" fill="none"/></g>
  <path d="M112 236 Q100 196 118 168 Q132 146 120 120" stroke="url(#biS)" stroke-width="18" fill="none" stroke-linecap="round"/>
  <g class="b-dna" fill="none" stroke-width="3" stroke-linecap="round">
    <path d="M100 232 Q128 220 104 206 Q84 194 112 182 Q134 172 116 158" stroke="#f9a8d4"/>
    <path d="M128 232 Q96 220 120 206 Q142 194 108 182 Q90 172 124 158" stroke="#fde047"/>
  </g>
  <g class="b-body">
    <g class="b-limb jaw-top">
      <path d="M52 104 Q60 30 120 26 Q180 30 188 104 Q120 86 52 104 Z" fill="url(#biJ)" stroke="#052e16" stroke-width="3"/>
      <path d="M62 100 Q120 82 178 100 Q172 58 120 46 Q68 58 62 100 Z" fill="url(#biM)"/>
      <g fill="#fff7ed" stroke="#7c2d12" stroke-width="1"><path d="M70 98 l7 16 l6 -18 Z"/><path d="M90 92 l7 18 l7 -20 Z"/><path d="M112 89 l8 19 l8 -19 Z"/><path d="M136 90 l7 20 l7 -18 Z"/><path d="M158 94 l6 18 l7 -16 Z"/></g>
      <g stroke="#15803d" stroke-width="3" stroke-linecap="round"><line x1="62" y1="60" x2="44" y2="40"/><line x1="90" y1="38" x2="82" y2="14"/><line x1="150" y1="38" x2="158" y2="14"/><line x1="178" y1="60" x2="196" y2="40"/></g>
      <g fill="#fda4af" class="b-dew"><circle cx="43" cy="38" r="5"/><circle cx="81" cy="12" r="5"/><circle cx="159" cy="12" r="5"/><circle cx="197" cy="38" r="5"/></g>
    </g>
    <g class="b-limb jaw-bot">
      <path d="M56 116 Q120 100 184 116 Q176 168 120 170 Q64 168 56 116 Z" fill="url(#biJ)" stroke="#052e16" stroke-width="3"/>
      <path d="M66 118 Q120 104 174 118 Q166 150 120 154 Q74 150 66 118 Z" fill="url(#biM)"/>
      <g fill="#fff7ed" stroke="#7c2d12" stroke-width="1"><path d="M78 118 l7 -15 l6 16 Z"/><path d="M100 112 l7 -17 l7 17 Z"/><path d="M124 112 l7 -17 l7 17 Z"/><path d="M148 116 l6 -15 l7 16 Z"/></g>
    </g>
    <g class="b-eye">
      <circle cx="120" cy="58" r="15" fill="#fef9c3" stroke="#052e16" stroke-width="3"/>
      <ellipse cx="120" cy="58" rx="4" ry="11" fill="#9f1239"/>
      <rect class="b-lid" x="104" y="42" width="32" height="32" rx="16" fill="#22c55e"/>
    </g>
    <path class="b-brow" d="M100 40 L120 48 L140 40" fill="none" stroke="#052e16" stroke-width="4" stroke-linecap="round"/>
  </g>
</svg>`;

  // География: Вулкан-Титан — каменный великан с кратером
  ART.geography = `
<svg viewBox="0 0 240 240" class="boss-svg">
  <defs>
    <linearGradient id="geR" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#78716c"/><stop offset=".55" stop-color="#44403c"/><stop offset="1" stop-color="#1c1917"/></linearGradient>
    <radialGradient id="geL"><stop offset="0" stop-color="#fef08a"/><stop offset=".45" stop-color="#f97316"/><stop offset="1" stop-color="#b91c1c"/></radialGradient>
    <radialGradient id="geG"><stop offset="0" stop-color="#fb923c" stop-opacity=".55"/><stop offset="1" stop-color="#f97316" stop-opacity="0"/></radialGradient>
  </defs>
  <circle cx="120" cy="130" r="110" fill="url(#geG)" class="b-aura"/>
  <g class="b-smoke" fill="#57534e" opacity=".75"><circle cx="110" cy="26" r="12"/><circle cx="126" cy="16" r="10"/><circle cx="138" cy="30" r="9"/></g>
  <g class="b-limb l">
    <path d="M40 112 L14 132 L10 168 L30 196 L58 186 L62 150 Z" fill="url(#geR)" stroke="#0c0a09" stroke-width="3" stroke-linejoin="round"/>
    <polyline points="20,140 34,156 26,176" fill="none" stroke="url(#geL)" stroke-width="3"/>
  </g>
  <g class="b-limb r">
    <path d="M200 112 L226 132 L230 168 L210 196 L182 186 L178 150 Z" fill="url(#geR)" stroke="#0c0a09" stroke-width="3" stroke-linejoin="round"/>
    <polyline points="220,140 206,156 214,176" fill="none" stroke="url(#geL)" stroke-width="3"/>
  </g>
  <g class="b-body">
    <path d="M92 46 L148 46 L176 92 L196 120 L190 206 L50 206 L44 120 L64 92 Z" fill="url(#geR)" stroke="#0c0a09" stroke-width="3.5" stroke-linejoin="round"/>
    <ellipse cx="120" cy="48" rx="30" ry="9" fill="url(#geL)" class="b-core"/>
    <path d="M96 50 Q104 74 98 92 M144 50 Q136 70 146 86" stroke="#f97316" stroke-width="5" fill="none" stroke-linecap="round" class="b-lava"/>
    <g fill="none" stroke="url(#geL)" stroke-width="3.5" stroke-linejoin="round" class="b-crack">
      <polyline points="66,124 80,144 72,166 86,190"/><polyline points="176,122 162,150 172,170 158,196"/><polyline points="110,176 120,196 132,180"/>
    </g>
    <g class="b-eye">
      <path d="M78 112 L110 120 L106 134 L82 128 Z" fill="url(#geL)"/>
      <path d="M162 112 L130 120 L134 134 L158 128 Z" fill="url(#geL)"/>
      <rect class="b-lid" x="74" y="104" width="92" height="34" fill="#44403c"/>
    </g>
    <path class="b-brow" d="M72 104 L112 116 M168 104 L128 116" stroke="#0c0a09" stroke-width="7" stroke-linecap="round"/>
    <path class="b-mouth" d="M92 152 L104 146 L118 154 L134 146 L148 152 L140 164 L100 164 Z" fill="#1c1917" stroke="url(#geL)" stroke-width="2.5"/>
  </g>
</svg>`;

  // Финал: Хронос ЕНТ — страж экзамена с лицом-часами
  ART.final = `
<svg viewBox="0 0 240 240" class="boss-svg">
  <defs>
    <linearGradient id="fnC" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#312e81"/><stop offset="1" stop-color="#0b0a26"/></linearGradient>
    <linearGradient id="fnGo" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fef3c7"/><stop offset=".5" stop-color="#f59e0b"/><stop offset="1" stop-color="#92400e"/></linearGradient>
    <radialGradient id="fnF"><stop offset="0" stop-color="#fffbeb"/><stop offset="1" stop-color="#fcd34d"/></radialGradient>
    <radialGradient id="fnG"><stop offset="0" stop-color="#f59e0b" stop-opacity=".5"/><stop offset="1" stop-color="#ef4444" stop-opacity="0"/></radialGradient>
  </defs>
  <circle cx="120" cy="118" r="112" fill="url(#fnG)" class="b-aura"/>
  <g class="b-orbit" font-family="Georgia, serif" font-weight="800" fill="#fcd34d" opacity=".85">
    <text x="10" y="60" font-size="18">x²</text><text x="200" y="58" font-size="18">F=ma</text><text x="4" y="196" font-size="16">H₂O</text><text x="196" y="200" font-size="16">ДНК</text>
  </g>
  <g class="b-limb l">
    <path d="M58 120 Q30 140 34 178" stroke="url(#fnC)" stroke-width="20" fill="none" stroke-linecap="round"/>
    <g transform="translate(18 166)"><path d="M0 0 H32 L20 18 L32 36 H0 L12 18 Z" fill="#fef3c7" fill-opacity=".35" stroke="url(#fnGo)" stroke-width="3"/><path d="M6 32 H26 L16 22 Z" fill="#f59e0b"/><circle cx="16" cy="12" r="2" fill="#f59e0b" class="b-sand"/></g>
  </g>
  <g class="b-limb r">
    <path d="M182 120 Q210 140 206 178" stroke="url(#fnC)" stroke-width="20" fill="none" stroke-linecap="round"/>
    <path d="M206 222 L222 96" stroke="url(#fnGo)" stroke-width="7" stroke-linecap="round"/><path d="M218 96 L226 76 L230 98 Z" fill="#fde68a"/>
  </g>
  <g class="b-body">
    <path d="M120 14 Q176 22 186 92 L204 214 Q120 232 36 214 L54 92 Q64 22 120 14 Z" fill="url(#fnC)" stroke="#f59e0b" stroke-width="2.5"/>
    <path d="M120 30 Q160 36 166 90 Q120 104 74 90 Q80 36 120 30 Z" fill="#05040f"/>
    <circle cx="120" cy="72" r="34" fill="url(#fnF)" stroke="url(#fnGo)" stroke-width="5"/>
    <g stroke="#92400e" stroke-width="2.5" stroke-linecap="round">
      <line x1="120" y1="42" x2="120" y2="48"/><line x1="120" y1="96" x2="120" y2="102"/><line x1="90" y1="72" x2="96" y2="72"/><line x1="144" y1="72" x2="150" y2="72"/>
    </g>
    <g class="b-eye">
      <circle cx="106" cy="66" r="6" fill="#dc2626"/><circle cx="134" cy="66" r="6" fill="#dc2626"/>
      <circle cx="106" cy="66" r="2.2" fill="#fff"/><circle cx="134" cy="66" r="2.2" fill="#fff"/>
      <rect class="b-lid" x="96" y="56" width="48" height="20" rx="9" fill="#fcd34d"/>
    </g>
    <g class="b-hand"><line x1="120" y1="72" x2="120" y2="50" stroke="#1c1917" stroke-width="3" stroke-linecap="round"/></g>
    <g class="b-hand2"><line x1="120" y1="72" x2="136" y2="84" stroke="#1c1917" stroke-width="3.5" stroke-linecap="round"/></g>
    <circle cx="120" cy="72" r="3.5" fill="#1c1917"/>
    <path class="b-brow" d="M98 56 L114 62 M142 56 L126 62" stroke="#1c1917" stroke-width="3.5" stroke-linecap="round"/>
    <path d="M120 112 L148 124 L142 160 L120 176 L98 160 L92 124 Z" fill="#0b0a26" stroke="url(#fnGo)" stroke-width="3"/>
    <text x="120" y="152" text-anchor="middle" font-family="system-ui, sans-serif" font-weight="900" font-size="20" fill="#fcd34d" class="b-core">140</text>
    <path d="M70 120 Q120 132 170 120" stroke="#f59e0b" stroke-width="2" fill="none" opacity=".6"/>
  </g>
</svg>`;


  // Герой игрока: Батыр-бот, вид сбоку, упирается щитом вправо. Цвета — CSS-переменные (уровни силы)
  ART.hero = `
<svg viewBox="0 0 180 200" class="hero-svg">
  <defs>
    <linearGradient id="hrA" x1="0" y1="0" x2="1" y2="1"><stop offset="0" style="stop-color:var(--h0,#bfdbfe)"/><stop offset=".5" style="stop-color:var(--h1,#3b82f6)"/><stop offset="1" style="stop-color:var(--h2,#1e3a8a)"/></linearGradient>
    <linearGradient id="hrD" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#334155"/><stop offset="1" stop-color="#0f172a"/></linearGradient>
    <radialGradient id="hrS" cx=".35" cy=".35"><stop offset="0" style="stop-color:var(--h0,#bfdbfe)"/><stop offset=".6" style="stop-color:var(--h1,#3b82f6)"/><stop offset="1" style="stop-color:var(--h2,#1e3a8a)"/></radialGradient>
    <radialGradient id="hrG"><stop offset="0" style="stop-color:var(--hg,#60a5fa)" stop-opacity=".8"/><stop offset="1" style="stop-color:var(--hg,#60a5fa)" stop-opacity="0"/></radialGradient>
  </defs>
  <ellipse cx="82" cy="192" rx="62" ry="7" fill="#000" opacity=".35"/>
  <ellipse class="h-aura" cx="92" cy="110" rx="86" ry="96" fill="url(#hrG)"/>
  <path class="h-scarf" d="M74 72 Q50 66 34 76 Q20 84 6 74 Q18 92 38 88 Q56 86 72 82 Z" fill="#facc15" stroke="#a16207" stroke-width="2"/>
  <g class="h-legs" stroke-linecap="round" stroke-linejoin="round" fill="none">
    <polyline points="66,128 46,156 26,182" stroke="url(#hrD)" stroke-width="17"/>
    <polyline points="84,130 108,152 104,182" stroke="url(#hrD)" stroke-width="17"/>
    <path d="M10 178 h30 q6 0 6 8 v4 h-38 q-4 -12 2 -12 z" fill="url(#hrA)" stroke="#0f172a" stroke-width="2.5"/>
    <path d="M94 178 h26 q8 0 8 8 v4 h-36 z" fill="url(#hrA)" stroke="#0f172a" stroke-width="2.5"/>
    <circle cx="46" cy="156" r="7" fill="url(#hrA)" stroke="#0f172a" stroke-width="2"/>
    <circle cx="108" cy="152" r="7" fill="url(#hrA)" stroke="#0f172a" stroke-width="2"/>
  </g>
  <g class="h-body">
    <path d="M70 84 L74 120 L86 140 L68 140 L54 120" fill="url(#hrD)"/>
    <path d="M52 92 Q58 72 84 74 Q110 78 108 104 L102 132 Q80 142 60 132 Z" fill="url(#hrA)" stroke="#0f172a" stroke-width="3"/>
    <path d="M66 98 Q84 92 98 102 L94 118 Q80 124 66 116 Z" fill="#0f172a" opacity=".55"/>
    <circle cx="82" cy="108" r="7" class="h-core" style="fill:var(--hg,#60a5fa)"/>
    <rect x="58" y="126" width="46" height="8" rx="4" fill="#facc15" stroke="#a16207" stroke-width="1.5" transform="rotate(-6 80 130)"/>
    <path d="M60 92 L44 112 L60 118" fill="none" stroke="url(#hrD)" stroke-width="13" stroke-linecap="round" stroke-linejoin="round"/>
    <g class="h-head">
      <circle cx="94" cy="52" r="27" fill="url(#hrA)" stroke="#0f172a" stroke-width="3"/>
      <path d="M100 40 Q122 42 122 56 Q120 66 104 64 Z" fill="#0f172a"/>
      <path class="h-eye" d="M106 48 L118 50 L117 56 L105 55 Z" style="fill:var(--hg,#60a5fa)"/>
      <path d="M80 26 Q86 8 100 12 Q92 18 94 26 Z" fill="#facc15" stroke="#a16207" stroke-width="1.5" class="h-plume"/>
      <path d="M70 52 Q72 40 82 34" fill="none" stroke="#fff" stroke-width="3" opacity=".35" stroke-linecap="round"/>
    </g>
    <path d="M94 88 L122 98" stroke="url(#hrD)" stroke-width="14" stroke-linecap="round"/>
    <g class="h-shield">
      <ellipse class="h-sglow" cx="142" cy="104" rx="30" ry="62" style="fill:var(--hg,#60a5fa)" opacity="0"/>
      <ellipse cx="138" cy="104" rx="20" ry="54" fill="url(#hrS)" stroke="#0f172a" stroke-width="3.5"/>
      <ellipse cx="141" cy="104" rx="11" ry="40" fill="none" stroke="#facc15" stroke-width="3"/>
      <path d="M135 104 l5 8 l8 -16" fill="none" stroke="#fff" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
    </g>
    <path d="M90 96 L128 110" stroke="url(#hrA)" stroke-width="13" stroke-linecap="round"/>
    <circle cx="128" cy="110" r="8" fill="url(#hrA)" stroke="#0f172a" stroke-width="2"/>
  </g>
</svg>`;
  root.SynaqBossArt = ART;
})(typeof window !== 'undefined' ? window : globalThis);
