/* ส่วนเสริมประสบการณ์ใช้งาน (UX) ของฟอร์มเขียนบันทึกและหน้าอ่านความทรงจำ
 * ทำงานผ่าน DOM เท่านั้น ไม่แตะตรรกะหลักของแอป */
(() => {
  const $ = id => document.getElementById(id);
  const form = $('journalForm'),
    title = $('entryTitle'),
    text = $('entryText'),
    place = $('entryPlace'),
    saveBtn = $('saveBtn');
  if (!form || !title || !text) return;

  const DRAFT_KEY = 'road-of-days-draft';
  const isEditing = () => /แก้ไข/.test(saveBtn.textContent);
  const svgIc = name => '<svg class="ic-inline" aria-hidden="true"><use href="#i-' + name + '"/></svg>';
  const toastMsg = msg => {
    const t = $('toast');
    if (!t) return;
    t.innerHTML = msg;
    t.classList.add('show');
    clearTimeout(toastMsg._t);
    toastMsg._t = setTimeout(() => t.classList.remove('show'), 2600);
  };

  /* 1) ปุ่มช่วยเริ่มเขียน: แตะแล้วเติมประโยคตั้งต้นให้ ไม่ต้องคิดเองทั้งหมด */
  const prompts = [
    ['heart', 'วันนี้ขอบคุณ…', 'วันนี้ฉันขอบคุณ'],
    ['mountain', 'สิ่งที่ได้พบ', 'ระหว่างทางวันนี้ ฉันได้พบ'],
    ['chat', 'ความรู้สึก', 'ตอนนี้ฉันรู้สึก'],
    ['sprout', 'พรุ่งนี้อยากทำ', 'พรุ่งนี้ฉันอยาก']
  ];
  const chips = document.createElement('div');
  chips.className = 'prompt-chips';
  chips.setAttribute('role', 'group');
  chips.setAttribute('aria-label', 'ตัวช่วยเริ่มเขียน');
  prompts.forEach(([ic, label, starter]) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'chip';
    b.innerHTML = svgIc(ic) + '<span>' + label + '</span>';
    b.onclick = () => {
      const cur = text.value;
      text.value = cur + (cur && !/\s$/.test(cur) ? '\n' : '') + starter + ' ';
      text.focus();
      text.setSelectionRange(text.value.length, text.value.length);
      text.dispatchEvent(new Event('input', { bubbles: true }));
    };
    chips.append(b);
  });
  const textLabel = form.querySelector('label[for="entryText"]');
  if (textLabel) {
    textLabel.textContent = 'เล่าเรื่องของวันนี้ได้เลย';
    textLabel.after(chips);
  }
  text.placeholder = 'พิมพ์อะไรก็ได้ ไม่ต้องสวยหรือยาว… หรือแตะปุ่มด้านบนเพื่อเริ่มต้น';

  /* 2) ตั้งชื่ออัตโนมัติจากบรรทัดแรก (แก้ได้เสมอ) ผู้ใช้ไม่ต้องคิดชื่อก่อน */
  let lastAuto = '';
  const makeTitle = () => {
    const first = text.value.trim().split(/\n/)[0].trim();
    return first.length > 38 ? first.slice(0, 38).trim() + '…' : first;
  };
  title.placeholder = 'ตั้งชื่อให้วันนี้ (เว้นไว้ได้ ระบบตั้งให้)';
  const titleLabel = form.querySelector('label[for="entryTitle"]');
  if (titleLabel) titleLabel.innerHTML = 'ชื่อของวันนี้ <span class="tiny">(ตั้งให้อัตโนมัติ แก้ได้)</span>';
  text.addEventListener('input', () => {
    if (isEditing()) return;
    if (!title.value || title.value === lastAuto) {
      lastAuto = makeTitle();
      title.value = lastAuto;
    }
  });

  /* 3) ตัวนับตัวอักษรเปลี่ยนสีเมื่อใกล้เต็ม */
  const counter = $('charCount');
  text.addEventListener('input', () => counter && counter.classList.toggle('near', text.value.length > 2600));

  /* 4) บันทึกด้วย Ctrl/Cmd + Enter */
  text.addEventListener('keydown', e => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      form.requestSubmit();
    }
  });
  const hint = form.querySelector('.form-bottom span');
  if (hint) hint.textContent = 'เก็บในเครื่องและซิงก์คลาวด์เมื่อออนไลน์ · ใช้รหัสบัญชีเดียวกันทุกอุปกรณ์ · Ctrl+Enter เพื่อบันทึก';

  /* 5) ฉบับร่างอัตโนมัติ: พิมพ์ค้างไว้แล้วปิดหน้าก็ไม่หาย */
  let draftTimer = 0;
  const saveDraft = () => {
    if (isEditing()) return;
    clearTimeout(draftTimer);
    draftTimer = setTimeout(() => {
      try {
        if (text.value.trim() || place.value.trim())
          localStorage.setItem(DRAFT_KEY, JSON.stringify({ t: title.value, x: text.value, p: place.value }));
        else localStorage.removeItem(DRAFT_KEY);
      } catch (e) {}
    }, 400);
  };
  [title, text, place].forEach(el => el.addEventListener('input', saveDraft));
  form.addEventListener('submit', () => {
    setTimeout(() => {
      if (!text.value.trim()) {
        try {
          localStorage.removeItem(DRAFT_KEY);
        } catch (e) {}
        toastMsg(svgIc('leaf') + ' เก็บบันทึกเรียบร้อยแล้ว เปิดอ่านในปฏิทินความทรงจำได้เสมอ');
      }
    }, 80);
  });
  try {
    const d = JSON.parse(localStorage.getItem(DRAFT_KEY) || 'null');
    if (d && d.x && !text.value) {
      text.value = d.x;
      title.value = d.t || '';
      lastAuto = d.t === makeTitle() ? d.t : '';
      place.value = d.p || '';
      counter && (counter.textContent = text.value.length.toLocaleString() + ' / 3,000');
      setTimeout(() => toastMsg(svgIc('pen') + ' กู้ฉบับร่างที่ค้างไว้ให้แล้ว เขียนต่อได้เลย'), 1500);
    }
  } catch (e) {}

  /* 6) เปิดแผงเขียนบันทึกแล้วโฟกัสช่องเรื่องราวทันที */
  const side = document.querySelector('.side');
  if (side)
    new MutationObserver(() => {
      if (side.classList.contains('open') && !isEditing())
        setTimeout(() => text.focus({ preventScroll: true }), 350);
    }).observe(side, { attributes: true, attributeFilter: ['class'] });

  /* 7) หน้าสมุดบันทึก: แตะที่การ์ดตรงไหนก็ได้เพื่ออ่านเต็ม */
  const entries = $('entries');
  if (entries)
    entries.addEventListener('click', e => {
      if (e.target.closest('button')) return;
      const card = e.target.closest('.entry');
      card && card.querySelector('.entry-actions button')?.click();
    });
})();

/* ===== ภาพวาดประกอบอัตโนมัติ (SVG) บนหัวหน้าอ่านความทรงจำ ===== */
(() => {
  const $ = id => document.getElementById(id);
  const box = $('readerNature');
  if (!box) return;

  const st = document.createElement('style');
  st.textContent =
    '#readerNature{position:relative;height:160px!important;overflow:hidden;box-shadow:inset 0 0 0 1px #ffffff55}' +
    '#readerNature svg{display:block;width:100%;height:100%}' +
    '#readerNature .rd-cap{position:absolute;left:10px;bottom:9px;background:#ffffffcc;color:#2f5443;font-size:11px;padding:4px 11px;border-radius:999px;backdrop-filter:blur(4px)}' +
    '@media(max-width:740px){#readerNature{height:140px!important}}';
  document.head.append(st);

  const rngOf = str => {
    let h = 2166136261;
    for (const c of str) h = Math.imul(h ^ c.charCodeAt(0), 16777619);
    let s = h >>> 0 || 1;
    return () => ((s = (Math.imul(s, 1664525) + 1013904223) >>> 0) / 4294967296);
  };
  const has = (t, re) => re.test(t);

  const SCENES = [
    ['river', /โขง|แม่น้ำ|ริมน้ำ|ท่าเรือ|เรือ|ลำน้ำ|สายน้ำ|เชียงแสน|เชียงของ/, 'ริมแม่น้ำโขง'],
    ['temple', /วัด|พระ|เจดีย์|ทำบุญ|สวดมนต์|ไหว้/, 'วัดริมทาง'],
    ['market', /ตลาด|ร้าน|กินข้าว|อาหาร|กาแฟ|คาเฟ่|ขนม|ข้าวโพดปิ้ง|ผลไม้/, 'ตลาดข้างทาง'],
    ['field', /นา|ข้าว|ทุ่ง|ไร่|สวน|เกษตร|ชาวบ้าน/, 'ทุ่งนาและชนบท'],
    ['mountain', /ดอย|ภูเขา|หลวง|เขา|ยอด|หมอก|ป่า/, 'ดอยหลวง']
  ];
  const PAL = {
    day: { sky: ['#8fcdee', '#e4f3ee'], far: '#9cc0bb', mid: '#78a98e', near: '#58906d', gnd: '#93bd7d', sun: ['#fff6bf', 470, 52], name: 'ยามสาย' },
    morning: { sky: ['#f6c9a0', '#d6ebe6'], far: '#b3c6c0', mid: '#8db59c', near: '#68a07e', gnd: '#a3c98c', sun: ['#ffe7ae', 130, 96], name: 'ยามเช้า' },
    sunset: { sky: ['#6f7fb0', '#f2a187', '#fbd59a'], far: '#9487a3', mid: '#7a8296', near: '#566f68', gnd: '#85a070', sun: ['#ffd27a', 490, 108], name: 'ยามเย็น' },
    night: { sky: ['#17264a', '#40608a'], far: '#38496f', mid: '#2e3e5e', near: '#243349', gnd: '#30493f', sun: ['#f6f2dd', 500, 48], name: 'ยามค่ำคืน' },
    rain: { sky: ['#a0adb4', '#d5dcd9'], far: '#9aaaa6', mid: '#7f9a8e', near: '#62806f', gnd: '#86a678', sun: null, name: 'วันฝนพรำ' }
  };

  function pickTime(t, mood) {
    if (has(t, /ฝน|พายุ|ชื้น/) || mood === 'เศร้า') return 'rain';
    if (has(t, /คืน|ดาว|ค่ำ|ดึก|จันทร์|ราตรี|โคม/)) return 'night';
    if (has(t, /เย็น|ตะวันตก|พระอาทิตย์ตก|อาทิตย์อัสดง|พลบค่ำ/) || mood === 'เหนื่อยล้า') return 'sunset';
    if (has(t, /เช้า|รุ่งอรุณ|หมอกบาง|ตื่น/) || mood === 'สงบ' || mood === 'มีหวัง') return 'morning';
    return 'day';
  }

  const ridge = (rand, base, amp, fill, n = 9) => {
    let d = 'M0 240 L0 ' + base;
    for (let i = 1; i <= n; i++) {
      const x = (640 / n) * i,
        y = base - rand() * amp - (i % 2 ? 0 : amp * 0.35);
      d += ' L' + x.toFixed(0) + ' ' + y.toFixed(0);
    }
    return '<path d="' + d + ' L640 240Z" fill="' + fill + '"/>';
  };
  const tree = (x, y, s, c) =>
    '<g transform="translate(' + x + ' ' + y + ') scale(' + s + ')">' +
    '<polygon points="-2,-12 2,-12 3,1 -3,1" fill="#6b4e37"/>' +
    '<polygon points="0,-52 -15,-27 15,-27" fill="' + c + '"/>' +
    '<polygon points="0,-40 -21,-13 21,-13" fill="' + c + '"/>' +
    '<polygon points="0,-52 -15,-27 -3,-30" fill="#fff" opacity=".2"/>' +
    '<polygon points="0,-52 -3,-30 15,-27" fill="#203d2c" opacity=".16"/>' +
    '<polygon points="0,-40 -21,-13 -4,-18" fill="#fff" opacity=".16"/>' +
    '<polygon points="0,-40 -4,-18 21,-13" fill="#203d2c" opacity=".14"/></g>';
  const palm = (x, y, s, c) =>
    '<g transform="translate(' + x + ' ' + y + ') scale(' + s + ')"><rect x="-2.5" y="-60" width="5" height="62" fill="#8a7352"/>' +
    '<ellipse cx="-14" cy="-60" rx="16" ry="5" fill="' + c + '" transform="rotate(-20 -14 -60)"/>' +
    '<ellipse cx="14" cy="-60" rx="16" ry="5" fill="' + c + '" transform="rotate(20 14 -60)"/>' +
    '<ellipse cx="0" cy="-66" rx="14" ry="5" fill="' + c + '"/></g>';
  const cloud = (x, y, s, o) =>
    '<g transform="translate(' + x + ' ' + y + ') scale(' + s + ')" fill="#fff" opacity="' + o + '"><ellipse cx="0" cy="0" rx="34" ry="11"/><ellipse cx="-18" cy="-8" rx="18" ry="11"/><ellipse cx="10" cy="-12" rx="20" ry="13"/></g>';

  function build(blob, mood) {
    const rand = rngOf(blob || 'road'),
      scene = (SCENES.find(s => has(blob, s[1])) || ['', null, ''])[0] ||
        ['mountain', 'field', 'river'][Math.floor(rand() * 3)],
      label = (SCENES.find(s => s[0] === scene) || [])[2],
      tkey = pickTime(blob, mood),
      p = PAL[tkey];
    let g = '<defs><linearGradient id="rdSky" x1="0" y1="0" x2="0" y2="1">';
    p.sky.forEach((c, i) => (g += '<stop offset="' + (i / (p.sky.length - 1)).toFixed(2) + '" stop-color="' + c + '"/>'));
    g += '</linearGradient></defs><rect width="640" height="240" fill="url(#rdSky)"/>';

    if (tkey === 'night') {
      for (let i = 0; i < 38; i++)
        g += '<circle cx="' + (rand() * 640).toFixed(0) + '" cy="' + (rand() * 110).toFixed(0) + '" r="' + (0.6 + rand() * 1.2).toFixed(1) + '" fill="#fff" opacity="' + (0.5 + rand() * 0.5).toFixed(2) + '"/>';
    }
    if (p.sun) {
      const [c, x, y] = p.sun;
      g += '<circle cx="' + x + '" cy="' + y + '" r="' + (tkey === 'night' ? 70 : 90) + '" fill="' + c + '" opacity=".16"/>' +
        '<circle cx="' + x + '" cy="' + y + '" r="' + (tkey === 'night' ? 26 : 32) + '" fill="' + c + '"/>';
      if (tkey === 'night') g += '<circle cx="' + (x + 9) + '" cy="' + (y - 5) + '" r="22" fill="' + p.sky[0] + '"/>';
    }
    g += cloud(120 + rand() * 60, 50, 1.1, tkey === 'night' ? 0.18 : tkey === 'rain' ? 0.9 : 0.8);
    g += cloud(330 + rand() * 80, 36, 0.8, tkey === 'night' ? 0.15 : 0.7);
    g += cloud(540, 70, 1, tkey === 'night' ? 0.15 : 0.75);
    if (tkey === 'rain') g += cloud(240, 28, 1.4, 0.9) + cloud(430, 22, 1.3, 0.85);

    // ภูเขาไกล-กลาง
    g += ridge(rand, 150, scene === 'mountain' ? 95 : 55, p.far);
    g += ridge(rand, 172, scene === 'mountain' ? 70 : 40, p.mid, 7);
    if (scene === 'mountain') {
      g += '<polygon points="190,185 290,70 390,185" fill="' + p.mid + '"/><polygon points="290,70 262,106 290,98 312,112" fill="#ffffff" opacity=".55"/>';
      if (tkey !== 'night') g += '<path d="M0 150 Q160 138 320 154 T640 146 L640 170 L0 170Z" fill="#fff" opacity=".28"/>';
    }

    // พื้นหลักและฉากเฉพาะ
    g += '<rect y="184" width="640" height="56" fill="' + p.gnd + '"/>';
    g += ridge(rand, 190, 18, p.near, 12);
    if (scene === 'river') {
      const w = tkey === 'night' ? '#2c5273' : tkey === 'sunset' ? '#e29f86' : '#6fb3c8';
      g += '<path d="M0 168 Q80 160 160 168 T320 168 T480 168 T640 168 L640 200 L0 200Z" fill="' + w + '"/>';
      for (let i = 0; i < 9; i++)
        g += '<path d="M' + (i * 75 + 10) + ' ' + (178 + (i % 3) * 7) + ' q14 -5 28 0" stroke="#fff" stroke-width="1.6" fill="none" opacity=".6"/>';
      g += '<g transform="translate(210 166)"><path d="M-34 0 L34 0 L26 12 L-26 12Z" fill="#8c5a3a"/><rect x="-10" y="-14" width="22" height="14" fill="#d6b27a"/><polygon points="-14,-14 16,-14 1,-24" fill="#b25a3c"/><line x1="34" y1="2" x2="64" y2="-6" stroke="#5b4636" stroke-width="2.5"/></g>';
      g += tree(540, 188, 1.3, p.near) + tree(580, 190, 1, p.near);
    } else if (scene === 'temple') {
      g += tree(80, 196, 1.5, p.near) + tree(560, 196, 1.7, p.near);
      g += '<g transform="translate(400 190)"><rect x="-58" y="-6" width="116" height="8" fill="#f1ece0"/><rect x="-44" y="-30" width="88" height="24" fill="#f7f2e7"/>' +
        '<polygon points="-56,-30 56,-30 30,-58 -30,-58" fill="#a3382a"/><polygon points="-30,-58 30,-58 0,-80" fill="#c24a36"/><rect x="-8" y="-24" width="16" height="18" fill="#6b3d22"/></g>';
      g += '<g transform="translate(230 190)"><rect x="-26" y="-12" width="52" height="12" fill="#f7f2e7"/><path d="M-18 -12 Q-18 -52 0 -52 Q18 -52 18 -12Z" fill="#e6bf4a"/><rect x="-3" y="-82" width="6" height="30" fill="#e6bf4a"/><polygon points="0,-98 -6,-82 6,-82" fill="#f2cf5c"/></g>';
    } else if (scene === 'market') {
      g += tree(70, 196, 1.4, p.near) + tree(590, 196, 1.2, p.near);
      let aw = '';
      for (let i = 0; i < 6; i++) aw += '<rect x="' + (-60 + i * 20) + '" y="-62" width="20" height="16" fill="' + (i % 2 ? '#fff6ea' : '#d9534a') + '"/>';
      g += '<g transform="translate(330 192)">' + aw +
        '<rect x="-58" y="-46" width="4" height="46" fill="#7a5636"/><rect x="54" y="-46" width="4" height="46" fill="#7a5636"/>' +
        '<rect x="-52" y="-18" width="104" height="18" fill="#c49558"/>' +
        [-36, -14, 8, 30].map((x, i) => '<circle cx="' + x + '" cy="-22" r="7" fill="' + ['#f28a2b', '#e04a4a', '#f2c94c', '#7fbf5a'][i] + '"/>').join('') +
        '<circle cx="0" cy="-40" r="5" fill="#ffd36a" opacity="' + (tkey === 'night' ? 1 : 0.5) + '"/></g>';
    } else if (scene === 'field') {
      const rice = tkey === 'sunset' || tkey === 'night' ? '#c9ba62' : '#a9cf62';
      for (let i = 0; i < 9; i++)
        g += '<path d="M' + (320 + (i - 4) * 18) + ' 192 Q' + (320 + (i - 4) * 70) + ' 214 ' + (320 + (i - 4) * 130) + ' 240" stroke="' + rice + '" stroke-width="9" fill="none" opacity=".75"/>';
      g += palm(90, 200, 1.4, p.near) + palm(560, 200, 1.6, p.near) + palm(520, 196, 1.1, p.near);
      g += '<g transform="translate(210 196)"><rect x="-22" y="-26" width="44" height="4" fill="#8c7148"/><rect x="-18" y="-22" width="3" height="22" fill="#8c7148"/><rect x="15" y="-22" width="3" height="22" fill="#8c7148"/><polygon points="-30,-26 30,-26 0,-46" fill="#d8bf6c"/></g>';
    } else {
      g += tree(60, 198, 1.7, p.near) + tree(110, 196, 1.2, p.near) + tree(520, 198, 1.8, p.near) + tree(575, 196, 1.3, p.near) + tree(470, 194, 1, p.near);
    }

    // ถนนและเส้นกลาง
    g += '<polygon points="302,190 338,190 560,240 80,240" fill="#6d6f6d"/><polygon points="318,192 322,192 332,240 308,240" fill="#e9e3c9" opacity=".8"/>';
    g += '<path d="M310 200 L330 200 M306 214 L334 214 M300 230 L340 230" stroke="#6d6f6d" stroke-width="3" opacity=".55"/>';

    if (tkey === 'day' || tkey === 'morning')
      g += '<path d="M150 70 q8 -7 16 0 q8 -7 16 0 M210 52 q6 -5 12 0 q6 -5 12 0" stroke="#3f4f58" stroke-width="1.5" fill="none" opacity=".6"/>';
    if (tkey === 'rain')
      for (let i = 0; i < 60; i++) {
        const x = rand() * 640,
          y = rand() * 230;
        g += '<line x1="' + x.toFixed(0) + '" y1="' + y.toFixed(0) + '" x2="' + (x - 5).toFixed(0) + '" y2="' + (y + 13).toFixed(0) + '" stroke="#fff" stroke-width="1.2" opacity=".55"/>';
      }
    if (tkey === 'night')
      for (let i = 0; i < 12; i++)
        g += '<circle cx="' + (60 + rand() * 520).toFixed(0) + '" cy="' + (190 + rand() * 40).toFixed(0) + '" r="1.8" fill="#ffe98a" opacity=".85"/>';

    return {
      svg: '<svg viewBox="0 0 640 240" preserveAspectRatio="xMidYMid slice" aria-hidden="true" xmlns="http://www.w3.org/2000/svg">' + g + '</svg>',
      cap: (label || '') + ' · ' + p.name
    };
  }

  let busy = false;
  const render = () => {
    if (busy) return;
    busy = true;
    queueMicrotask(() => {
      busy = false;
      const blob = [$('rdTitle').textContent, $('rdPlace').textContent, $('rdText').textContent].join(' ');
      const mood = ($('rdMeta').textContent || '').split(' · ')[0].trim();
      const r = build(blob, mood);
      box.innerHTML = r.svg + '<span class="rd-cap">' + r.cap + '</span>';
    });
  };
  ['rdTitle', 'rdText', 'rdPlace', 'rdMeta'].forEach(id =>
    new MutationObserver(render).observe($(id), { childList: true, characterData: true, subtree: true })
  );
})();

/* ============================================================================
 * ระบบแจ้งเตือนบนแถบแจ้งเตือนมือถือ/ระบบ (System Notification Bar: APK & PWA)
 * รองรับทั้ง Capacitor LocalNotifications (.apk) และ Service Worker / Web Notification API
 * ========================================================================== */
(() => {
  const $ = id => document.getElementById(id);
  const NOTIF_KEY = 'road-of-days-notif-cfg';
  const svgIc = name => '<svg class="ic-inline" aria-hidden="true"><use href="#i-' + name + '"/></svg>';

  let cfg = { enabled: false, time: '20:00', lastFiredDate: '' };
  try {
    const raw = JSON.parse(localStorage.getItem(NOTIF_KEY) || 'null');
    if (raw && typeof raw === 'object') {
      cfg.enabled = !!raw.enabled;
      if (/^\d{2}:\d{2}$/.test(raw.time)) cfg.time = raw.time;
      if (typeof raw.lastFiredDate === 'string') cfg.lastFiredDate = raw.lastFiredDate;
    }
  } catch (e) {}

  const saveCfg = () => {
    try {
      localStorage.setItem(NOTIF_KEY, JSON.stringify(cfg));
    } catch (e) {}
  };

  const getCapLocalNotif = () =>
    window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.LocalNotifications
      ? window.Capacitor.Plugins.LocalNotifications
      : null;

  async function requestNotifPermission() {
    const capLN = getCapLocalNotif();
    if (capLN) {
      try {
        const res = await capLN.requestPermissions();
        return res && res.display === 'granted';
      } catch (e) {}
    }
    if (!('Notification' in window)) return false;
    if (Notification.permission === 'granted') return true;
    try {
      const p = await Notification.requestPermission();
      return p === 'granted';
    } catch (e) {
      return false;
    }
  }

  async function sendAppNotification(title, body, tag = 'road-of-days-notify', action = 'write') {
    const capLN = getCapLocalNotif();
    if (capLN) {
      try {
        await capLN.schedule({
          notifications: [
            {
              id: Math.floor(Date.now() % 2147483000),
              title,
              body,
              schedule: { at: new Date(Date.now() + 300) },
              extra: { action }
            }
          ]
        });
        return true;
      } catch (e) {}
    }

    if (!('Notification' in window) || Notification.permission !== 'granted') return false;

    try {
      if ('serviceWorker' in navigator) {
        const reg = await navigator.serviceWorker.getRegistration();
        if (reg && typeof reg.showNotification === 'function') {
          await reg.showNotification(title, {
            body,
            icon: './icon-192.png',
            badge: './icon-192.png',
            tag,
            vibrate: [180, 80, 180],
            data: { action }
          });
          return true;
        }
      }
      const n = new Notification(title, { body, icon: './icon-192.png', tag });
      n.onclick = () => {
        window.focus();
        if (action === 'write') $('writeOpen')?.click();
        n.close();
      };
      return true;
    } catch (e) {
      return false;
    }
  }
  window.sendAppNotification = sendAppNotification;

  // ตั้งเวลาปลุกแจ้งเตือนรายวันในระดับ OS สำหรับแอป .apk (ทำงานได้แม้ปัดปิดแอปไปแล้ว)
  async function syncNativeDailySchedule() {
    const capLN = getCapLocalNotif();
    if (!capLN) return;
    try {
      await capLN.cancel({ notifications: [{ id: 88001 }] });
      if (!cfg.enabled) return;
      const [hh, mm] = cfg.time.split(':').map(Number);
      await capLN.schedule({
        notifications: [
          {
            id: 88001,
            title: 'Road of Days · เส้นทางความทรงจำ',
            body: 'วันนี้เป็นอย่างไรบ้าง? แวะพักบันทึกเรื่องราวระหว่างทางกันนะครับ',
            schedule: { on: { hour: hh, minute: mm }, repeats: true, allowWhileIdle: true },
            extra: { action: 'write' }
          }
        ]
      });
    } catch (e) {}
  }

  // รับคำสั่งเมื่อผู้ใช้แตะที่แถบแจ้งเตือนแล้วเปิดแอปกลับมา
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.addEventListener('message', e => {
      if (e.data && e.data.type === 'NOTIFICATION_CLICKED' && e.data.action === 'write') {
        $('writeOpen')?.click();
      }
    });
  }

  // เช็คเวลาแจ้งเตือนรายวันเมื่อเปิดแอปทิ้งไว้
  setInterval(() => {
    if (!cfg.enabled) return;
    const now = new Date();
    const hm = String(now.getHours()).padStart(2, '0') + ':' + String(now.getMinutes()).padStart(2, '0');
    const todayStr =
      now.getFullYear() + '-' + String(now.getMonth() + 1).padStart(2, '0') + '-' + String(now.getDate()).padStart(2, '0');
    if (hm === cfg.time && cfg.lastFiredDate !== todayStr) {
      cfg.lastFiredDate = todayStr;
      saveCfg();
      sendAppNotification(
        'Road of Days · ถึงเวลาพักใจประจำวัน',
        'วันนี้เป็นอย่างไรบ้าง? แวะเขียนบันทึกเก็บไว้ในปฏิทินความทรงจำกันนะครับ',
        'road-daily-reminder',
        'write'
      );
    }
  }, 20000);

  // แทรกหมวด "การแจ้งเตือนระบบ" ลงในหน้าตั้งค่า (#settingsModal)
  const setModal = $('settingsModal')?.querySelector('.modal');
  const setDanger = setModal?.querySelector('.set-danger');
  if (setModal && setDanger && !$('notifEnableToggle')) {
    const sec = document.createElement('section');
    sec.className = 'set-sec';
    sec.innerHTML = `
      <h3 class="set-h">การแจ้งเตือน (แถบแจ้งเตือนระบบ)</h3>
      <div class="set-box">
        <div class="settings-row">
          <div>แจ้งเตือนเขียนบันทึกประจำวัน<div class="tiny">เด้งแจ้งเตือนบนแถบแจ้งเตือนของมือถือ/คอมพิวเตอร์</div></div>
          <input type="checkbox" class="switch" id="notifEnableToggle" aria-label="เปิดการแจ้งเตือนประจำวัน">
        </div>
        <div class="settings-row">
          <div>เวลาแจ้งเตือนประจำวัน<div class="tiny">ตั้งเวลาให้ระบบเตือนเขียนบันทึกในแต่ละวัน</div></div>
          <input type="time" class="field" id="notifTimeInput" style="width:auto;padding:7px 12px;font-weight:600" aria-label="เวลาแจ้งเตือน">
        </div>
        <div class="settings-row">
          <div>ทดสอบแถบแจ้งเตือน<div class="tiny">กดเพื่อทดสอบยิงแจ้งเตือนขึ้นแถบด้านบนของเครื่องทันที</div></div>
          <button type="button" class="secondary" id="notifTestBtn">ทดสอบแจ้งเตือน</button>
        </div>
      </div>
    `;
    setModal.insertBefore(sec, setDanger);

    const toggleEl = $('notifEnableToggle');
    const timeEl = $('notifTimeInput');
    const testBtn = $('notifTestBtn');

    toggleEl.checked = cfg.enabled;
    timeEl.value = cfg.time;

    const showToast = msg => {
      const t = $('toast');
      if (!t) return;
      t.innerHTML = msg;
      t.classList.add('show');
      clearTimeout(showToast._t);
      showToast._t = setTimeout(() => t.classList.remove('show'), 2800);
    };

    toggleEl.onchange = async () => {
      if (toggleEl.checked) {
        const granted = await requestNotifPermission();
        if (!granted) {
          toggleEl.checked = false;
          cfg.enabled = false;
          saveCfg();
          showToast(svgIc('alert') + ' กรุณาอนุญาตสิทธิ์การแจ้งเตือนในตั้งค่าเบราว์เซอร์/มือถือ');
          return;
        }
        cfg.enabled = true;
        saveCfg();
        await syncNativeDailySchedule();
        showToast(svgIc('check') + ' เปิดแจ้งเตือนประจำวันเวลา ' + cfg.time + ' น. เรียบร้อย');
      } else {
        cfg.enabled = false;
        saveCfg();
        await syncNativeDailySchedule();
        showToast('ปิดการแจ้งเตือนประจำวันแล้ว');
      }
    };

    timeEl.onchange = async () => {
      if (timeEl.value) {
        cfg.time = timeEl.value;
        saveCfg();
        if (cfg.enabled) {
          await syncNativeDailySchedule();
          showToast(svgIc('clock') + ' ตั้งเวลาแจ้งเตือนเป็น ' + cfg.time + ' น.');
        }
      }
    };

    testBtn.onclick = async () => {
      const granted = await requestNotifPermission();
      if (!granted) {
        showToast(svgIc('alert') + ' ไม่ได้รับสิทธิ์แจ้งเตือน กรุณากดอนุญาตการแจ้งเตือนก่อนครับ');
        return;
      }
      const ok = await sendAppNotification(
        'Road of Days · ทดสอบการแจ้งเตือน',
        'การแจ้งเตือนบนแถบแจ้งเตือนทำงานสมบูรณ์! แตะเพื่อกลับมาที่เส้นทางความทรงจำ',
        'road-test-' + Date.now(),
        'write'
      );
      if (ok) {
        showToast(svgIc('check') + ' ส่งการแจ้งเตือนขึ้นแถบแจ้งเตือนของเครื่องแล้ว!');
      } else {
        showToast(svgIc('alert') + ' อุปกรณ์นี้ต้องเปิดผ่าน HTTPS หรือติดตั้งเป็นแอปเพื่อแสดงแถบแจ้งเตือน');
      }
    };
  }
})();
