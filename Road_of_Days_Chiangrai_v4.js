/* Road of Days - application logic */
(() => {
  'use strict';

  /* ============================================================================
   * src/app/01-constants-moods.js
   * ค่าคงที่พื้นฐาน: ตัวช่วย $ (getElementById), KEY ของ localStorage และรายการอารมณ์ (moods) พร้อมสี/ข้อความ/ธีมฉาก
   * (ไฟล์นี้ถูกต่อรวมเป็น closure เดียวกับไฟล์อื่น — ไม่ต้อง import/export · ลำดับไฟล์ดู build.config.mjs)
   * ========================================================================== */

  const $ = id => document.getElementById(id),
    KEY = 'road-of-days-3d-v4';
  const CLOUD_PENDING_KEY = 'road-of-days-cloud-pending:';
  const moods = [
    {
      id: 'happy',
      label: 'สดใส',
      text: 'วันนี้รู้สึกสดใส',
      color: '#f3b95c',
      icon: 'sun',
      title: 'ให้รอยยิ้ม… นำทางวันนี้',
      desc: 'เก็บแสงแดดอุ่น ๆ ไว้ในกระเป๋าหัวใจ',
      sky: 0xb9deea,
      ground: 0xaac88c,
      tree: 0x6b9863
    },
    {
      id: 'calm',
      label: 'สงบ',
      text: 'วันนี้รู้สึกสงบ',
      color: '#7bbf9b',
      icon: 'leaf',
      title: 'ระหว่างทาง… มีเรื่องดี ๆ เสมอ',
      desc: 'พกหัวใจดวงเดิม ไปพบวันใหม่ด้วยกัน',
      sky: 0xc3dbd5,
      ground: 0xb1c49b,
      tree: 0x78966d
    },
    {
      id: 'tired',
      label: 'เหนื่อยล้า',
      text: 'วันนี้รู้สึกเหนื่อยล้า',
      color: '#9a8fc0',
      icon: 'moon',
      title: 'พักบ้างก็ได้… ไม่เป็นไรเลย',
      desc: 'วันนี้เดินทางมาไกลแล้ว คุณทำได้ดีมาก',
      sky: 0xd5cbdc,
      ground: 0xb8b5bb,
      tree: 0x9692ac
    },
    {
      id: 'sad',
      label: 'เศร้า',
      text: 'วันนี้รู้สึกเศร้า',
      color: '#7a9cc0',
      icon: 'river',
      title: 'ฟ้าหม่น… ก็ยังมีทางไปต่อ',
      desc: 'ทุกความรู้สึกมีที่อยู่ แม้ในวันที่ฝนพรำ',
      sky: 0xa7bacb,
      ground: 0x91aca7,
      tree: 0x65888c
    },
    {
      id: 'hope',
      label: 'มีหวัง',
      text: 'วันนี้รู้สึกมีหวัง',
      color: '#e98f7d',
      icon: 'sun',
      title: 'พรุ่งนี้… ยังมีแสงใหม่รออยู่',
      desc: 'ความหวังเล็ก ๆ พาเราไปได้อีกไกล',
      sky: 0xecc8b6,
      ground: 0xc8bd93,
      tree: 0x929e75
    }
  ];

  /* ============================================================================
   * src/app/02-constants-route.js
   * ค่าคงที่เส้นทาง: ระยะทาง/ความเร็ว (KM_TOTAL, KMH), จุดแวะ (ROUTE)
   * (ไฟล์นี้ถูกต่อรวมเป็น closure เดียวกับไฟล์อื่น — ไม่ต้อง import/export · ลำดับไฟล์ดู build.config.mjs)
   * ========================================================================== */

  const KM_WIANG_KAEN = 135,
    KM_DOI_PHA_TANG = 170,
    KM_TOTAL = 200,
    T0 = 0.0112,
    T1 = 0.5488,
    T_SCHOOL_FIELD = 0.64,
    T_ROUTE_EXT_START = 0.92,
    T2 = 0.945,
    T3 = 0.97,
    T_ROUTE_RETURN_END = 0.995,
    T_ROUTE_RETURN_JOIN = 0.8,
    KMH = 60,
    kmAt = t => {
      if (t <= T1) return Math.max(0, ((t - T0) / (T1 - T0)) * KM_WIANG_KAEN);
      if (t <= T2) return KM_WIANG_KAEN + ((t - T1) / (T2 - T1)) * (KM_DOI_PHA_TANG - KM_WIANG_KAEN);
      if (t <= T3) return KM_DOI_PHA_TANG + ((t - T2) / (T3 - T2)) * (KM_TOTAL - KM_DOI_PHA_TANG);
      return KM_TOTAL;
    },
    tAt = km => {
      if (km <= KM_WIANG_KAEN) return T0 + (km / KM_WIANG_KAEN) * (T1 - T0);
      if (km <= KM_DOI_PHA_TANG) return T1 + ((km - KM_WIANG_KAEN) / (KM_DOI_PHA_TANG - KM_WIANG_KAEN)) * (T2 - T1);
      return T2 + ((km - KM_DOI_PHA_TANG) / (KM_TOTAL - KM_DOI_PHA_TANG)) * (T3 - T2);
    };
  let lastKmTxt = '';
  const ROUTE = [
    { id: 'janjawa', name: 'จันจว้า', sub: 'จุดเริ่มต้น', km: 0, icon: 'home', color: '#2d6b4f' },
    { id: 'chiangsaen', name: 'เชียงแสน', sub: 'เมืองริมโขง', km: 30, icon: 'pin', color: '#5b9a6d' },
    { id: 'chiangkhong', name: 'เชียงของ', sub: 'ริมแม่น้ำโขง', km: 90, icon: 'river', color: '#4f8bb0' },
    { id: 'wiangkaen', name: 'เวียงแก่น', sub: 'ปลายทางเดิม', km: KM_WIANG_KAEN, icon: 'flag', color: '#e98f7d' },
    { id: 'doiphatang', name: 'ดอยผาตั้ง', sub: 'ชมวิวภูเขาและทะเลหมอก', km: KM_DOI_PHA_TANG, icon: 'mountain', color: '#8b7b62' },
    { id: 'phuchifa', name: 'ภูชี้ฟ้า', sub: 'ปลายทางใหม่', km: KM_TOTAL, icon: 'flag', color: '#567e74' }
  ].map(s => ({ ...s, t: tAt(s.km) }));

  /* ============================================================================
   * src/app/03-state-storage.js
   * สถานะแอป (state), โหลดและบันทึกข้อมูลแบบออนไลน์ด้วย Supabase
   * ========================================================================== */

  const SUPABASE_URL = 'https://jhxorzmxlebohhwkqppu.supabase.co';
  const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpoeG9yem14bGVib2hod2txcHB1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE0NjIwNjksImV4cCI6MjA5NzAzODA2OX0.JrpTbmNXjVjgIVQ9GRKYWGusbDgb1YVkgFzQJLqyi3o';

  // ตัวแปรล็อกป้องกันไม่ให้เครื่องใหม่ส่งข้อมูลว่างไปทับ Cloud ก่อนดึงข้อมูลเสร็จ
  let isCloudSynced = false;
  let isReloading = false;
  let syncStatusState = { mode: 'syncing', text: 'กำลังซิงก์…', time: '' };

  function nowHM() {
    const d = new Date();
    return String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0');
  }

  function renderSyncStatus() {
    const el = document.getElementById('syncStatusBadge');
    if (!el) return;
    const { mode, text, time } = syncStatusState;
    el.dataset.state = mode;
    const ic = mode === 'error' ? 'alert' : mode === 'syncing' ? 'clock' : 'cloud';
    const label = time && mode === 'synced' ? `${text} · ${time}` : text;
    const acc = (myId || '').replace(/^user-/, '');
    el.innerHTML = `<i class="sync-dot"></i>${svgIcon(ic)}<span>${label}</span>`;
    el.title = `บัญชีคลาวด์: ${acc} · สถานะ: ${label} (แตะเพื่อซิงก์ข้อมูลทันที)`;
    el.setAttribute('aria-label', `สถานะซิงก์ข้อมูล: ${label} แตะเพื่อซิงก์ทันที`);
  }
  window.renderSyncStatus = renderSyncStatus;

  function setSyncStatus(mode, customText) {
    if (mode === 'synced') {
      syncStatusState = { mode: 'synced', text: customText || 'ซิงก์แล้ว', time: nowHM() };
    } else if (mode === 'syncing') {
      syncStatusState = { mode: 'syncing', text: customText || 'กำลังซิงก์…', time: syncStatusState.time };
    } else {
      syncStatusState = { mode: 'error', text: customText || 'เก็บในเครื่อง', time: syncStatusState.time };
    }
    renderSyncStatus();
  }
  window.triggerManualSync = async () => {
    if (syncStatusState.mode === 'syncing') return;
    await loadOnline();
  };

  // 1. ตรวจสอบรหัสบัญชี (ไม่ใช้ prompt เพื่อให้รองรับมือถือ 100%)
  let myId = localStorage.getItem('road_uuid');
  if (!myId) {
    myId = 'user-' + Date.now().toString(36).slice(-6);
    localStorage.setItem('road_uuid', myId);
    localStorage.removeItem('road_nick_set'); // ยังไม่เคยตั้งชื่อเล่นเอง
  }

  // สลับไปใช้ชื่อเล่นที่ระบุ แล้วดึงข้อมูลจากคลาวด์ (ใช้ร่วมกันทั้งหน้าต้อนรับและหน้าตั้งค่า)
  async function applyNickname(name) {
    name = String(name || '').trim();
    if (!name) return false;
    isReloading = true; // บล็อกไม่ให้ pagehide แอบเซฟข้อมูลว่างทับคลาวด์
    isCloudSynced = false;
    myId = 'user-' + name;
    localStorage.setItem('road_uuid', myId);
    localStorage.setItem('road_nick_set', '1');
    localStorage.removeItem(KEY); // ล้างแคชเก่าในเครื่องเพื่อรับข้อมูลจากคลาวด์
    const badge = document.getElementById('currentNickBadge');
    if (badge) badge.textContent = name;
    const input = document.getElementById('nickInput');
    if (input) input.value = name;
    renderSyncStatus();
    isReloading = false;
    return loadOnline();
  }

  // หน้าต้อนรับ: ถามชื่อเล่นตอนเปิดแอปครั้งแรก (แทน prompt() ที่มือถือไม่แสดง)
  setTimeout(() => {
    if (localStorage.getItem('road_nick_set') === '1' || document.getElementById('welcomeNickOverlay')) return;
    const ov = document.createElement('div');
    ov.id = 'welcomeNickOverlay';
    ov.style.cssText = 'position:fixed;inset:0;z-index:99999;background:rgba(20,40,32,.62);display:flex;align-items:center;justify-content:center;padding:20px;';
    ov.innerHTML = `
      <div role="dialog" aria-modal="true" style="background:#fffdf7;border-radius:20px;padding:24px;max-width:380px;width:100%;box-shadow:0 20px 50px rgba(0,0,0,.3);">
        <h2 style="margin:0 0 8px;color:#2d6b4f;font-size:19px;">ยินดีต้อนรับสู่เส้นทางความทรงจำ!</h2>
        <p style="margin:0 0 14px;font-size:14px;line-height:1.7;color:#444;">กรุณาตั้ง "ชื่อเล่น" หรือ "รหัสส่วนตัว" เพื่อใช้เซฟและดึงข้อมูล<br>หากย้ายเครื่อง ให้พิมพ์ชื่อเดิม ข้อมูลจะกลับมาครับ</p>
        <input id="welcomeNickInput" class="field" type="text" placeholder="พิมพ์ชื่อเล่นของคุณ" maxlength="40" autocomplete="off" style="width:100%;padding:10px 12px;font-size:16px;box-sizing:border-box;">
        <div id="welcomeNickMsg" class="tiny" style="margin:8px 0 12px;min-height:18px;color:#2d6b4f;"></div>
        <button type="button" class="primary" id="welcomeNickOk" style="width:100%;padding:12px;">ตกลง</button>
      </div>`;
    document.body.appendChild(ov);
    const inp = document.getElementById('welcomeNickInput');
    const msg = document.getElementById('welcomeNickMsg');
    const btn = document.getElementById('welcomeNickOk');
    const submit = async () => {
      const v = inp.value.trim();
      if (!v) { msg.textContent = 'กรุณาพิมพ์ชื่อเล่นก่อนครับ'; return; }
      btn.disabled = true;
      msg.textContent = '⏳ กำลังดึงข้อมูลของ "' + v.replace(/[<>&]/g, '') + '" จากคลาวด์...';
      const synced = await applyNickname(v);
      ov.remove();
      if (typeof toast === 'function') {
        toast(synced
          ? '✔️ เชื่อมต่อบัญชี "' + v.replace(/[<>&]/g, '') + '" เรียบร้อย'
          : 'ตั้งบัญชีแล้ว แต่ซิงก์คลาวด์ไม่สำเร็จ ข้อมูลยังอยู่ในเครื่องนี้');
      }
    };
    btn.onclick = submit;
    inp.onkeydown = e => { if (e.key === 'Enter') submit(); };
    setTimeout(() => inp.focus(), 100);
  }, 600);

  // 2. แทรกกล่องตั้งชื่อและซิงก์ข้อมูล เข้าไปในหน้าตั้งค่า (Settings UI)
  setTimeout(() => {
    const exportRow = document.getElementById('exportBtn')?.closest('.settings-row');
    if (exportRow && !document.getElementById('cloudAccountBox')) {
      const box = document.createElement('div');
      box.id = 'cloudAccountBox';
      box.className = 'settings-row';
      box.style.cssText = 'flex-direction:column; align-items:stretch; gap:10px; background:rgba(45,107,79,0.08); padding:14px; border-radius:12px; border:1px solid rgba(45,107,79,0.25); margin-bottom:12px;';
      
      const currentName = (myId || '').replace(/^user-/, '');
      box.innerHTML = `
        <div style="display:flex; justify-content:space-between; align-items:center;">
          <div>
            <strong style="color:#2d6b4f; font-size:15px;">☁️ บัญชีซิงก์ข้อมูล (คลาวด์)</strong>
            <div class="tiny">ใช้รหัสบัญชีเดียวกันทุกเครื่อง (ตัวพิมพ์เล็ก/ใหญ่ต้องตรงกัน)</div>
          </div>
          <span style="font-size:12px; font-weight:600; background:#2d6b4f; color:#fff; padding:3px 10px; border-radius:10px;" id="currentNickBadge">${currentName}</span>
        </div>
        <div style="display:flex; gap:8px;">
          <input type="text" id="nickInput" class="field" value="${currentName}" placeholder="พิมพ์ชื่อเล่นของคุณ (เช่น beer)" style="flex:1; padding:8px 12px; font-size:14px;">
          <button type="button" class="primary" id="applySyncBtn" style="white-space:nowrap; padding:8px 16px;">ซิงก์ข้อมูล</button>
        </div>
        <div class="tiny" id="syncNotice" style="color:#666;">ซิงก์แล้วจะเห็นบันทึกและตำแหน่งรถจากอุปกรณ์อื่นที่ใช้รหัสเดียวกัน</div>
      `;
      exportRow.parentNode.insertBefore(box, exportRow);

      document.getElementById('applySyncBtn').onclick = async () => {
        const inputVal = document.getElementById('nickInput').value.trim();
        const notice = document.getElementById('syncNotice');
        if (!inputVal) {
          if (typeof toast === 'function') toast('กรุณาพิมพ์ชื่อเล่นของคุณ');
          return;
        }
        notice.textContent = '⏳ กำลังเชื่อมต่อบัญชี "' + inputVal.replace(/[<>&]/g, '') + '"...';
        notice.style.color = '#2d6b4f';
        
        const synced = await applyNickname(inputVal);
        notice.textContent = synced
          ? '✔️ เชื่อมต่อและซิงก์ข้อมูลสำเร็จแล้ว'
          : 'ซิงก์ไม่สำเร็จ ข้อมูลยังอยู่ในเครื่องนี้ ตรวจอินเทอร์เน็ตหรือรหัสบัญชีแล้วลองใหม่';
        notice.style.color = synced ? '#2d6b4f' : '#9a542d';
        if (typeof toast === 'function') {
          toast(synced
            ? '✔️ เชื่อมต่อบัญชี "' + inputVal.replace(/[<>&]/g, '') + '" เรียบร้อย'
            : 'เชื่อมต่อคลาวด์ไม่สำเร็จ ข้อมูลยังไม่ซิงก์');
        }
      };
    }
  }, 1000);

  // 3. แจ้งเตือนบันทึกกิจกรรมทุกวัน 06:00 และ 18:00 (ทำงานเฉพาะในแอป APK / Capacitor)
  (function setupDailyReminders() {
    const LN = window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.LocalNotifications;
    const isNative = !!(window.Capacitor && window.Capacitor.isNativePlatform && window.Capacitor.isNativePlatform());
    const PREF = 'road_reminder_on';
    const REMINDERS = [
      { id: 6001, hour: 6, title: '🌅 อรุณสวัสดิ์ยามเช้า · Road of Days', body: 'เริ่มต้นวันใหม่อย่างอ่อนโยน แวะมาบันทึกความรู้สึกยามเช้ากันเถอะ' },
      { id: 18001, hour: 18, title: '🌇 พักใจยามเย็น · Road of Days', body: 'พระอาทิตย์เริ่มลับขอบฟ้าแล้ว แวะมาบันทึกเรื่องราวดี ๆ ของวันนี้กันนะ' }
    ];

    async function enable() {
      const perm = await LN.requestPermissions();
      if (perm.display !== 'granted') return false;
      await LN.cancel({ notifications: REMINDERS.map(r => ({ id: r.id })) });
      await LN.schedule({
        notifications: REMINDERS.map(r => ({
          id: r.id,
          title: r.title,
          body: r.body,
          schedule: { on: { hour: r.hour, minute: 0 }, repeats: true, allowWhileIdle: true }
        }))
      });
      return true;
    }
    async function disable() {
      await LN.cancel({ notifications: REMINDERS.map(r => ({ id: r.id })) });
    }

    if (isNative && LN) {
      // แตะการแจ้งเตือน → เปิดหน้าเขียนบันทึก
      LN.addListener('localNotificationActionPerformed', () => {
        setTimeout(() => document.getElementById('writeOpen')?.click(), 600);
      });
      // ตั้งเวลาใหม่ทุกครั้งที่เปิดแอป (ถ้าผู้ใช้ไม่ได้ปิดไว้)
      if (localStorage.getItem(PREF) !== '0') enable().catch(() => {});
    }

    setTimeout(() => {
      const anchor = document.getElementById('cloudAccountBox') || document.getElementById('exportBtn')?.closest('.settings-row');
      if (!anchor || document.getElementById('reminderRow')) return;
      const row = document.createElement('div');
      row.className = 'settings-row';
      row.id = 'reminderRow';
      row.innerHTML = `
        <div>แจ้งเตือนบันทึกประจำวัน<div class="tiny" id="reminderInfo">ทุกวันเวลา 06:00 และ 18:00 น.</div></div>
        <input type="checkbox" class="switch" id="reminderSwitch" aria-label="แจ้งเตือนบันทึกประจำวัน">
      `;
      anchor.parentNode.insertBefore(row, anchor.nextSibling);
      const sw = document.getElementById('reminderSwitch');
      const info = document.getElementById('reminderInfo');
      if (!(isNative && LN)) {
        sw.disabled = true;
        info.textContent = 'ใช้ได้เฉพาะในแอป APK บนมือถือ (ต้องติดตั้ง APK เวอร์ชันล่าสุด)';
        return;
      }
      sw.checked = localStorage.getItem(PREF) !== '0';
      sw.onchange = async () => {
        try {
          if (sw.checked) {
            const ok = await enable();
            if (!ok) { sw.checked = false; localStorage.setItem(PREF, '0'); info.textContent = 'ยังไม่ได้รับอนุญาตแจ้งเตือน (เปิดได้ที่ ตั้งค่ามือถือ > แอป)'; return; }
            localStorage.setItem(PREF, '1');
            info.textContent = 'ทุกวันเวลา 06:00 และ 18:00 น.';
          } else {
            await disable();
            localStorage.setItem(PREF, '0');
          }
        } catch (e) { info.textContent = 'ตั้งค่าแจ้งเตือนไม่สำเร็จ'; }
      };
    }, 1300);
  })();

  let state = {
      entries: [],
      lanterns: 0,
      mood: 'calm',
      night: false,
      routeT: 0.0112,
      reduced: matchMedia('(prefers-reduced-motion: reduce)').matches,
      qualityMode: 'auto',
      visualMode: 'natural',
      gpuPreference: 'auto'
    },
    editing = null,
    currentView = 'home',
    sceneAPI = null,
    storageOK = true;

  function validData(s) {
    if (typeof s === 'string') s = JSON.parse(s);
    if (!s || !Array.isArray(s.entries) || s.entries.length > 10000) throw Error('format');
    const ids = new Set();
    s.entries.forEach(e => {
      if (!e || typeof e.id !== 'string' || ids.has(e.id) || !/^\d{4}-\d{2}-\d{2}$/.test(e.date) || !Number.isFinite(new Date(e.date + 'T12:00:00').getTime()) || typeof e.title !== 'string' || !e.title.trim() || e.title.length > 90 || typeof e.text !== 'string' || !e.text.trim() || e.text.length > 3000 || typeof e.place !== 'string' || e.place.length > 100 || !moods.some(m => m.id === e.mood) || typeof e.routeT !== 'number' || e.routeT < 0 || e.routeT > 1) throw Error('entry');
      ids.add(e.id);
    });
    return {
      entries: s.entries.map(e => ({ id: e.id, date: e.date, title: e.title, text: e.text, place: e.place, mood: e.mood, routeT: e.routeT, fav: !!e.fav })),
      lanterns: Number.isSafeInteger(s.lanterns) && s.lanterns >= 0 ? s.lanterns : 0,
      mood: moods.some(m => m.id === s.mood) ? s.mood : 'calm',
      night: !!s.night,
      routeT: Math.min(0.98, Math.max(0.01, +s.routeT || 0.0112)),
      reduced: !!s.reduced,
      qualityMode: ['auto','0','1','2','3','4'].includes(s.qualityMode) ? s.qualityMode : (s.lowQuality ? '0' : 'auto'),
      visualMode: ['natural', 'vivid', 'game'].includes(s.visualMode) ? s.visualMode : 'natural',
      gpuPreference: ['auto', 'high-performance', 'low-power'].includes(s.gpuPreference) ? s.gpuPreference : 'auto'
    };
  }

  // 1. โหลดข้อมูล Local สำรองไว้ก่อน
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) state = validData(JSON.parse(raw));
  } catch (e) { storageOK = false; }
  let localStateAccountId = myId;

  // 2. ฟังก์ชันดึงข้อมูลจาก Cloud
  async function loadOnline() {
    const accountId = myId;
    setSyncStatus('syncing', 'กำลังดึงข้อมูล…');
    try {
      const encodedId = encodeURIComponent(accountId);
      const res = await fetch(`${SUPABASE_URL}/rest/v1/road_of_days?id=eq.${encodedId}&select=data`, {
        method: 'GET',
        cache: 'no-store',
        headers: {
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`
        }
      });
      
      if (!res.ok) throw new Error('Supabase Fetch Error: ' + res.status);
      
      const rows = await res.json();
      if (accountId !== myId) return false;
      isCloudSynced = true; // ปลดล็อกอนุญาตให้เซฟขึ้นคลาวด์ได้หลังจากเช็คข้อมูลเสร็จแล้ว
      
      // ถ้าระบบเจอข้อมูลบนคลาวด์ ให้เอามาทับในเครื่องแล้วรีเฟรชทุกส่วนของหน้าจอ
      if (rows && rows.length > 0 && rows[0].data) {
        const cloudState = validData(rows[0].data);
        const cloudEntryIds = new Set(cloudState.entries.map(entry => entry.id));
        const hasPendingChanges = localStateAccountId === accountId &&
          (localStorage.getItem(CLOUD_PENDING_KEY + accountId) === '1' ||
            state.entries.some(entry => !cloudEntryIds.has(entry.id)));
        if (hasPendingChanges) {
          const entriesById = new Map(cloudState.entries.map(entry => [entry.id, entry]));
          state.entries.forEach(entry => {
            if (!entriesById.has(entry.id)) entriesById.set(entry.id, entry);
          });
          cloudState.entries = [...entriesById.values()];
        }
        state = cloudState;
        localStateAccountId = accountId;
        localStorage.setItem(KEY, JSON.stringify(state));
        if (hasPendingChanges && !(await saveOnline())) return false;
        
        if (typeof renderEntries === 'function') renderEntries();
        if (typeof stats === 'function') stats();
        if (currentView === 'memory' && typeof renderMemory === 'function') renderMemory();
        if (typeof sceneAPI !== 'undefined' && sceneAPI) {
          sceneAPI.refresh();
          sceneAPI.setQuality();
        }
        if (typeof chooseMood === 'function') chooseMood(state.mood, false);
        if (typeof peekRender === 'function') peekRender();
        if (typeof bubRender === 'function') bubRender();
        if (typeof updateRouteUI === 'function') updateRouteUI();
        
        setSyncStatus('synced');
        toast(svgInline('cloud') + ' ซิงก์ข้อมูลจากคลาวด์สำเร็จ! (' + state.entries.length + ' บันทึก)');
        return true;
      } else {
        // กรณีเป็นชื่อใหม่ที่ยังไม่มีข้อมูลบนคลาวด์ ให้สร้างข้อมูลตั้งต้นขึ้นคลาวด์ทันที
        localStateAccountId = accountId;
        const saved = await saveOnline();
        if (saved) toast(svgInline('cloud') + ' สร้างบัญชีใหม่บนคลาวด์เรียบร้อย');
        return saved;
      }
    } catch (e) {
      if (accountId !== myId) return false;
      console.error(e);
      isCloudSynced = false;
      setSyncStatus('error', 'ออฟไลน์ · เก็บในเครื่อง');
      toast(svgInline('alert') + ' ดึงข้อมูลจาก Supabase ไม่สำเร็จ (ตรวจสอบอินเทอร์เน็ตหรือ RLS Policy)');
      return false;
    }
  }

  setTimeout(loadOnline, 600);

  // 3. ฟังก์ชันยิงข้อมูลขึ้น Supabase (Upsert)
  async function saveOnline(manual = false) {
    if (isReloading) return false;
    const accountId = myId;
    const payload = JSON.stringify({ id: accountId, data: state });
    if (accountId === myId) setSyncStatus('syncing', 'กำลังซิงก์…');
    try {
      const res = await fetch(`${SUPABASE_URL}/rest/v1/road_of_days?on_conflict=id`, {
        method: 'POST',
        keepalive: true,
        headers: {
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`,
          'Content-Type': 'application/json',
          'Prefer': 'resolution=merge-duplicates,return=minimal'
        },
        body: payload
      });
      
      if (!res.ok) {
        const errText = await res.text();
        console.error('Supabase Save Error:', errText);
        localStorage.setItem(CLOUD_PENDING_KEY + accountId, '1');
        if (accountId === myId) setSyncStatus('error', 'ซิงก์ไม่สำเร็จ');
        toast(svgInline('alert') + ' เซฟขึ้นคลาวด์ไม่สำเร็จ (' + res.status + ')');
        return false;
      } else {
        localStateAccountId = accountId;
        if (accountId === myId) localStateAccountId = accountId;
        localStorage.removeItem(CLOUD_PENDING_KEY + accountId);
        if (accountId === myId) setSyncStatus('synced');
        if (manual) toast(svgInline('check') + ' ซิงก์ข้อมูลขึ้นคลาวด์เรียบร้อยแล้ว');
        return true;
      }
    } catch (e) {
      console.error('Supabase Sync Error:', e);
      localStorage.setItem(CLOUD_PENDING_KEY + accountId, '1');
      if (accountId === myId) setSyncStatus('error', 'ออฟไลน์ · เก็บในเครื่อง');
      toast(svgInline('alert') + ' ไม่สามารถเชื่อมต่อคลาวด์ได้');
      return false;
    }
  }

  // 4. ฟังก์ชันบันทึกข้อมูล (จะส่งขึ้นคลาวด์ก็ต่อเมื่อซิงก์ครั้งแรกเสร็จแล้วเท่านั้น)
  function persist(syncOnline = true, forceCloud = false) {
    try {
      localStorage.setItem(KEY, JSON.stringify(state));
      storageOK = true;
      if (syncOnline && !isReloading && (isCloudSynced || forceCloud)) {
        saveOnline();
      } else if (syncOnline && !isReloading) {
        localStorage.setItem(CLOUD_PENDING_KEY + myId, '1');
      }
      return true;
    } catch (e) {
      storageOK = false;
      return false;
    }
  }

  // เก็บสำเนาในเครื่องเมื่อออกจากหน้า และดึงข้อมูลใหม่เมื่อกลับมา
  document.addEventListener('visibilitychange', () => {
    if (document.hidden && !isReloading) {
      persist(false);
    } else if (syncStatusState.mode !== 'syncing') {
      loadOnline();
    }
  });
  
  // ไม่ส่งสำเนาเก่าทับข้อมูลที่อุปกรณ์อื่นอาจเพิ่งบันทึก
  window.addEventListener('pagehide', () => {
    if (!isReloading) persist(false);
  });

  setInterval(() => {
    if (!document.hidden && syncStatusState.mode !== 'syncing') loadOnline();
  }, 30000);

  /* ============================================================================
   * src/app/04-utils.js
   * ฟังก์ชันช่วยเล็ก ๆ: toast, วันที่ (localDate / prettyDate), moodOf, svgIcon
   * (ไฟล์นี้ถูกต่อรวมเป็น closure เดียวกับไฟล์อื่น — ไม่ต้อง import/export · ลำดับไฟล์ดู build.config.mjs)
   * ========================================================================== */

  let toastTimer;
  function svgIcon(name) {
    return '<svg aria-hidden="true"><use href="#i-' + name + '"/></svg>';
  }
  function svgInline(name) {
    return '<svg class="ic-inline" aria-hidden="true"><use href="#i-' + name + '"/></svg>';
  }
  function setSpeedBtnLabel(mul) {
    const btn = $('speedBtn');
    if (btn) btn.innerHTML = svgInline('ff') + '<span>×' + mul + '</span>';
  }
  function toast(t) {
    const el = $('toast');
    if (!el) return;
    if (typeof t === 'string' && t.includes('<svg')) el.innerHTML = t;
    else el.textContent = t;
    el.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove('show'), 4200);
  }
  function localDate() {
    const d = new Date();
    return (
      d.getFullYear() +
      '-' +
      String(d.getMonth() + 1).padStart(2, '0') +
      '-' +
      String(d.getDate()).padStart(2, '0')
    );
  }
  function prettyDate(d) {
    return new Date(d + 'T12:00:00').toLocaleDateString('th-TH', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  }
  function moodOf(id) {
    return moods.find(m => m.id === id) || moods[1];
  }

  /* ============================================================================
   * src/app/05-mood-selector.js
   * วันที่หน้าแรก, เลือกอารมณ์ (chooseMood) และสร้างปุ่มอารมณ์
   * (ไฟล์นี้ถูกต่อรวมเป็น closure เดียวกับไฟล์อื่น — ไม่ต้อง import/export · ลำดับไฟล์ดู build.config.mjs)
   * ========================================================================== */

  $('entryDate').value = localDate();
  $('entryDate').max = localDate();
  $('todayLabel').textContent = new Date().toLocaleDateString('th-TH', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
  $('yearLabel').textContent = new Date().getFullYear();
  function chooseMood(id, save = true) {
    state.mood = id;
    const m = moodOf(id);
    document.querySelectorAll('[data-mood]').forEach(b => {
      const active = b.dataset.mood === id;
      b.classList.toggle('active', active);
      b.setAttribute('aria-pressed', active);
    });
    
    // เช็คก่อนว่ามี Element อยู่บนหน้าจอไหม เพื่อป้องกัน Error
    if ($('formMood')) $('formMood').textContent = 'อารมณ์ที่จะบันทึก: ' + m.label;
    if ($('sceneTitle')) $('sceneTitle').textContent = m.title;
    if ($('sceneDesc')) $('sceneDesc').textContent = m.desc;
    
    sceneAPI?.theme();
    if (save) persist();
  }
  moods.forEach(m => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'mood';
    b.dataset.mood = m.id;
    b.setAttribute('aria-pressed', 'false');
    b.innerHTML =
      '<span class="mi" style="background:' +
      m.color +
      '">' +
      svgIcon(m.icon) +
      '</span><span>' +
      m.label +
      '</span>';
    b.onclick = () => chooseMood(m.id);
    $('moodOptions').append(b);
    const o = document.createElement('option');
    o.value = m.id;
    o.textContent = m.label;
    $('filterMood').append(o);
  });

  /* ============================================================================
   * src/app/06-navigation.js
   * สลับหน้า (setView: home / journal / rest / memory), hash routing และปุ่มนำทาง
   * (ไฟล์นี้ถูกต่อรวมเป็น closure เดียวกับไฟล์อื่น — ไม่ต้อง import/export · ลำดับไฟล์ดู build.config.mjs)
   * ========================================================================== */

  function setView(v) {
    if (!['home', 'journal', 'rest', 'memory'].includes(v)) v = 'home';
    if (currentView === 'rest' && v !== 'rest') stopBreath();
    currentView = v;
    $('homeView').hidden = false;
    ['journal', 'rest', 'memory'].forEach(x => ($(x + 'View').hidden = x !== v));
    document.querySelectorAll('[data-view]').forEach(b => {
      b.classList.toggle('active', b.dataset.view === v);
      b.setAttribute('aria-current', b.dataset.view === v ? 'page' : 'false');
    });
    if (v === 'journal') renderEntries();
    if (v === 'memory') renderMemory();
    requestAnimationFrame(() => sceneAPI?.resize());
  }
  document.querySelectorAll('[data-view]').forEach(
    b =>
      (b.onclick = () => {
        location.hash = b.dataset.view;
      })
  );
  window.addEventListener('hashchange', () => setView(location.hash.slice(1)));
  document.querySelector('.brand').onclick = () => setView('home');

  /* ============================================================================
   * src/app/07-journal-form.js
   * ฟอร์มเขียนบันทึก: นับตัวอักษร, ล้างฟอร์ม, บันทึก/แก้ไข (submit) และ stats
   * (ไฟล์นี้ถูกต่อรวมเป็น closure เดียวกับไฟล์อื่น — ไม่ต้อง import/export · ลำดับไฟล์ดู build.config.mjs)
   * ========================================================================== */

  $('entryText').oninput = () =>
    ($('charCount').textContent = $('entryText').value.length.toLocaleString() + ' / 3,000');
  function clearForm() {
    editing = null;
    $('entryTitle').value = '';
    $('entryText').value = '';
    $('entryPlace').value = '';
    $('entryDate').value = localDate();
    $('entryDate').max = localDate();
    $('charCount').textContent = '0 / 3,000';
    $('saveBtn').querySelector('span').textContent = 'เก็บบันทึกความทรงจำ';
    $('cancelEdit').style.display = 'none';
  }
  $('cancelEdit').onclick = clearForm;
  $('journalForm').onsubmit = e => {
    e.preventDefault();
    if (!$('entryTitle').value.trim() || !$('entryText').value.trim())
      return toast('เติมชื่อและเรื่องราวสักนิดก่อนวางกล่อง');
    if ($('entryDate').value > localDate()) return toast('เลือกวันที่ไม่เกินวันนี้นะ');
    if (!isCloudSynced && syncStatusState.mode === 'syncing')
      return toast('กำลังตรวจสอบข้อมูลคลาวด์ กรุณารอสักครู่แล้วบันทึกอีกครั้ง');
    const entry = {
      id:
        editing ||
        globalThis.crypto?.randomUUID?.() ||
        Date.now().toString(36) + Math.random().toString(36).slice(2),
      date: $('entryDate').value,
      title: $('entryTitle').value.trim(),
      place: $('entryPlace').value.trim(),
      text: $('entryText').value.trim(),
      mood: state.mood,
      routeT: state.routeT,
      fav: (state.entries.find(x => x.id === editing) || {}).fav || false
    };
    const i = state.entries.findIndex(x => x.id === editing);
    if (i >= 0) state.entries[i] = entry;
    else state.entries.push(entry);
    const ok = persist();
    stats();
    renderEntries();
    sceneAPI?.refresh();
    if (currentView === 'memory') renderMemory();
    clearForm();
    document.querySelector('.side').classList.remove('open');
    if (typeof peekRender === 'function') peekRender();
    if (typeof bubRender === 'function') bubRender();
    if (ok) {
      toast(isCloudSynced
        ? svgInline('leaf') + ' บันทึกแล้ว · กำลังซิงก์ขึ้นคลาวด์'
        : svgInline('alert') + ' บันทึกไว้ในเครื่องนี้แล้ว · ยังไม่ได้ซิงก์คลาวด์');
    }
  };
  function stats() {
    $('memoryCount').textContent = state.entries.length;
  }

  /* ============================================================================
   * src/app/08-journal-list.js
   * รายการบันทึก: ค้นหา/กรอง/แสดงผล (renderEntries), แก้ไข (editEntry), ปุ่มเขียนใหม่, ถูกใจ (toggleFav)
   * (ไฟล์นี้ถูกต่อรวมเป็น closure เดียวกับไฟล์อื่น — ไม่ต้อง import/export · ลำดับไฟล์ดู build.config.mjs)
   * ========================================================================== */

  function renderEntries() {
    const list = $('entries');
    list.replaceChildren();
    const q = $('searchEntries').value.trim().toLocaleLowerCase(),
      filter = $('filterMood').value;
    const arr = [...state.entries]
      .sort((a, b) => b.date.localeCompare(a.date))
      .filter(
        e =>
          (filter === 'all' || (filter === 'fav' ? e.fav : e.mood === filter)) &&
          [e.title, e.text, e.place].join(' ').toLocaleLowerCase().includes(q)
      );
    if (!arr.length) {
      const n = document.createElement('div');
      n.className = 'empty';
      n.innerHTML =
        '<h3>' +
        (state.entries.length ? 'ยังไม่พบเรื่องราวที่ค้นหา' : 'หน้ากระดาษแรก… กำลังรอคุณ') +
        '</h3><p>' +
        (state.entries.length
          ? 'ลองเปลี่ยนคำค้นหรืออารมณ์ที่เลือก'
          : 'เริ่มเก็บเรื่องเล็ก ๆ ของวันนี้ไว้เป็นความทรงจำ') +
        '</p>';
      if (!state.entries.length) {
        const cta = document.createElement('button');
        cta.type = 'button';
        cta.className = 'primary empty-cta';
        cta.innerHTML = svgInline('pen') + '<span>เขียนบันทึกแรกของฉัน</span>';
        cta.onclick = () => $('newEntry').click();
        n.append(cta);
      }
      list.append(n);
      return;
    }
    arr.forEach(e => {
      const m = moodOf(e.mood),
        card = document.createElement('article');
      card.className = 'card entry';
      card.style.setProperty('--entry-color', m.color);
      card.innerHTML =
        '<time>' +
        m.label +
        ' · ' +
        prettyDate(e.date) +
        (e.fav ? ' · ที่ชอบ' : '') +
        '</time><h3></h3><p></p><div class="entry-meta">' +
        (e.place || 'บนเส้นทางเชียงราย') +
        '</div><div class="entry-actions"></div>';
      card.querySelector('h3').textContent = e.title;
      card.querySelector('p').textContent = e.text;
      const actions = card.querySelector('.entry-actions');
      const rd = document.createElement('button');
      rd.textContent = 'อ่านเต็ม';
      rd.onclick = () => openReader(e.id);
      const fv = document.createElement('button');
      fv.textContent = e.fav ? 'ที่ชอบ' : 'ชอบ';
      fv.onclick = () => toggleFav(e.id);
      const ed = document.createElement('button');
      ed.textContent = 'แก้ไข';
      ed.onclick = () => editEntry(e);
      const del = document.createElement('button');
      del.className = 'danger';
      del.textContent = 'ลบ';
      del.onclick = () =>
        ask('ลบบันทึก “' + e.title + '” หรือไม่? การลบนี้เรียกคืนไม่ได้', () => {
          state.entries = state.entries.filter(x => x.id !== e.id);
          if (editing === e.id) clearForm();
          const ok = persist(true, true);
          renderEntries();
          stats();
          sceneAPI?.refresh();
          if (typeof peekRender === 'function') peekRender();
          if (typeof bubRender === 'function') bubRender();
          if (ok) toast('ลบบันทึกแล้ว');
        });
      actions.append(rd, fv, ed, del);
      list.append(card);
    });
  }
  function editEntry(e) {
    editing = e.id;
    location.hash = 'home';
    setView('home');
    
    // ⚠️ เพิ่มคำสั่งบังคับให้แผงเขียนบันทึกเด้งขึ้นมา ⚠️
    document.querySelector('.side').classList.add('open');
    
    $('entryTitle').value = e.title;
    $('entryText').value = e.text;
    $('entryPlace').value = e.place;
    $('entryDate').value = e.date;
    chooseMood(e.mood, false);
    state.routeT = e.routeT;
    $('charCount').textContent = e.text.length.toLocaleString() + ' / 3,000';
    $('saveBtn').querySelector('span').textContent = 'บันทึกการแก้ไข';
    $('cancelEdit').style.display = 'block';
    
    // ลบ scrollIntoView ออกเพราะในหน้าจอ 3D เราใช้วิธีสไลด์แผงขึ้นมาแทน
    setTimeout(() => $('entryTitle').focus({ preventScroll: true }), 300);
  }
  $('searchEntries').oninput = renderEntries;
  $('filterMood').onchange = renderEntries;
  $('newEntry').onclick = () => {
    clearForm();
    location.hash = 'home';
    setView('home');
    $('journalForm').scrollIntoView({ behavior: 'smooth' });
    $('entryTitle').focus({ preventScroll: true });
  };
  function toggleFav(id) {
    const e = state.entries.find(x => x.id === id);
    if (!e) return;
    e.fav = !e.fav;
    persist();
    renderEntries();
    if (readerId === id && !$('readerModal').hidden) openReader(id);
  }

  /* ============================================================================
   * src/app/09-entry-reader.js
   * หน้าต่างอ่านบันทึก (openReader) และปุ่มถูกใจ/แก้ไข/ลบ
   * (ไฟล์นี้ถูกต่อรวมเป็น closure เดียวกับไฟล์อื่น — ไม่ต้อง import/export · ลำดับไฟล์ดู build.config.mjs)
   * ========================================================================== */

  let readerId = null;
  function openReader(id) {
    const list = [...state.entries].sort((a, b) => a.routeT - b.routeT),
      idx = list.findIndex(e => e.id === id);
    if (idx < 0) return;
    readerId = id;
    const e = list[idx],
      m = moodOf(e.mood);
    $('rdMeta').textContent =
      m.label +
      ' · ' +
      new Date(e.date + 'T12:00:00').toLocaleDateString('th-TH', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });
    $('rdTitle').textContent = e.title;
    $('rdPlace').textContent =
      (e.place ? e.place + ' · ' : '') + 'บนเส้นทาง ณ ' + Math.round(e.routeT * 100) + '%';
    $('rdText').textContent = e.text;
    $('rdFav').textContent = e.fav ? 'ที่ชอบแล้ว' : 'ชอบ';
    $('rdFav').setAttribute('aria-pressed', !!e.fav);
    $('rdBar').style.background = m.color;
    $('readerNature').style.background = 'linear-gradient(160deg,' + m.color + ',#d4e3cb 55%,#609274)';
    if ($('readerModal').hidden) openModal('readerModal');
  }
  $('rdFav').onclick = () => toggleFav(readerId);
  $('rdEdit').onclick = () => {
    const e = state.entries.find(x => x.id === readerId);
    if (!e) return;
    closeModal('readerModal');
    editEntry(e);
  };
  $('rdDel').onclick = () => {
    const e = state.entries.find(x => x.id === readerId);
    if (!e) return;
    ask('ลบบันทึก “' + e.title + '” หรือไม่? การลบนี้เรียกคืนไม่ได้', () => {
      state.entries = state.entries.filter(x => x.id !== e.id);
      if (editing === e.id) clearForm();
      const ok = persist(true, true);
      closeModal('readerModal');
      renderEntries();
      stats();
      sceneAPI?.refresh();
      if (typeof peekRender === 'function') peekRender();
      if (typeof bubRender === 'function') bubRender();
      if (ok) toast('ลบบันทึกแล้ว');
    });
  };

  /* ============================================================================
   * src/app/10-modal-system.js
   * ระบบหน้าต่างป๊อปอัป: openModal / closeModal, ปิดด้วย overlay หรือ Esc และกล่องยืนยัน (ask)
   * (ไฟล์นี้ถูกต่อรวมเป็น closure เดียวกับไฟล์อื่น — ไม่ต้อง import/export · ลำดับไฟล์ดู build.config.mjs)
   * ========================================================================== */

  const focusReturns = new Map();
  function openModal(id) {
    focusReturns.set(id, document.activeElement);
    $(id).hidden = false;
    document.body.style.overflow = 'hidden';
    setTimeout(() => $(id).querySelector('textarea,input,button,select')?.focus(), 60);
  }
  function closeModal(id) {
    $(id).hidden = true;
    document.body.style.overflow = document.querySelector('.overlay:not([hidden])') ? 'hidden' : '';
    focusReturns.get(id)?.focus();
  }
  document.querySelectorAll('[data-close]').forEach(b => (b.onclick = () => closeModal(b.dataset.close)));
  document.querySelectorAll('.overlay').forEach(
    el =>
      (el.onclick = e => {
        if (e.target === el) closeModal(el.id);
      })
  );
  document.addEventListener('keydown', e => {
    const all = [...document.querySelectorAll('.overlay:not([hidden])')],
      modal = all.at(-1);
    if (e.key === 'Escape') {
      if (modal) closeModal(modal.id);
      else document.querySelector('.side').classList.remove('open');
    }
    if (e.key === 'Tab' && modal) {
      const f = [...modal.querySelectorAll('button,input,textarea,select')].filter(x => !x.disabled),
        first = f[0],
        last = f.at(-1);
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  });
  let confirmFn = null;
  function ask(text, fn) {
    $('confirmText').textContent = text;
    confirmFn = fn;
    openModal('confirmModal');
  }
  $('confirmYes').onclick = () => {
    closeModal('confirmModal');
    const f = confirmFn;
    confirmFn = null;
    f?.();
  };

  /* ============================================================================
   * src/app/11-settings-data.js
   * การตั้งค่า (ลดการเคลื่อนไหว / ประหยัดภาพ) และส่งออก/นำเข้า/ลบข้อมูล JSON
   * (ไฟล์นี้ถูกต่อรวมเป็น closure เดียวกับไฟล์อื่น — ไม่ต้อง import/export · ลำดับไฟล์ดู build.config.mjs)
   * ========================================================================== */

  function settings() {
    $('reduceMotion').checked = state.reduced;
    
    // เปลี่ยน HTML แถบตั้งค่ากราฟิกเป็นแบบ Dropdown อัตโนมัติ (ไม่ต้องไปแก้ในไฟล์ index.html)
    const oldToggle = $('lowQuality');
    if (oldToggle) {
      const row = oldToggle.closest('.settings-row');
      row.innerHTML = `
        <div style="flex:1; padding-right:10px;">ระดับกราฟิก<div class="tiny">โหมดอัตโนมัติจะปรับความละเอียดและเงาตาม FPS</div><div class="tiny" id="qualityInfo" style="color:#376951; margin-top:3px;">กำลังประเมิน...</div></div>
        <select class="field" style="width:110px; padding:8px;" id="qualityMode">
          <option value="auto">อัตโนมัติ</option>
          <option value="0">ต่ำมาก</option>
          <option value="1">ต่ำ</option>
          <option value="2">ปานกลาง</option>
          <option value="3">สูง</option>
          <option value="4">สูงมาก</option>
        </select>
      `;
      $('qualityMode').onchange = e => {
        state.qualityMode = e.target.value;
        persist(true, true); // เซฟและยิงขึ้นคลาวด์
        sceneAPI?.setQuality();
      };
    }
    if ($('qualityMode')) $('qualityMode').value = state.qualityMode || 'auto';

    let gpuRow = document.getElementById('gpuPreferenceRow');
    if (!gpuRow) {
      gpuRow = document.createElement('div');
      gpuRow.className = 'settings-row';
      gpuRow.id = 'gpuPreferenceRow';
      gpuRow.innerHTML = `
        <div style="flex:1; padding-right:10px;">โหมดการ์ดจอ<div class="tiny">เป็นคำขอถึงเบราว์เซอร์ ไม่สามารถบังคับเลือก GPU โดยตรง</div><div class="tiny" id="gpuRendererInfo" style="color:#376951; margin-top:3px;">กำลังตรวจสอบ renderer...</div></div>
        <div style="display:flex; flex-direction:column; gap:6px; align-items:flex-end;">
          <select class="field" style="width:150px; padding:8px;" id="gpuPreference">
            <option value="auto">ให้เบราว์เซอร์เลือก</option>
            <option value="high-performance">ประสิทธิภาพสูง</option>
            <option value="low-power">ประหยัดพลังงาน</option>
          </select>
          <button type="button" class="secondary" id="applyGpuPreference" hidden>โหลดใหม่เพื่อใช้ค่า</button>
        </div>
      `;
      const qualitySelectRow = document.getElementById('qualityMode')?.closest('.settings-row');
      if (qualitySelectRow) qualitySelectRow.parentNode.insertBefore(gpuRow, qualitySelectRow.nextSibling);
    }
    $('gpuPreference').value = state.gpuPreference || 'auto';
    const gpuInfo = $('gpuRendererInfo');
    if (gpuInfo) gpuInfo.textContent = sceneAPI?.gpuInfo() || 'ยังไม่พบข้อมูล renderer';
    $('gpuPreference').onchange = e => {
      const previousPreference = state.gpuPreference;
      state.gpuPreference = e.target.value;
      if (!persist(true, true)) {
        gpuInfo.textContent = 'บันทึกการตั้งค่าไม่สำเร็จ';
        state.gpuPreference = previousPreference;
        e.target.value = previousPreference;
        return;
      }
      $('applyGpuPreference').hidden = false;
      gpuInfo.textContent = (sceneAPI?.gpuInfo() || 'ตรวจพบ renderer แล้ว') + ' · โหลดหน้าใหม่เพื่อใช้ค่า';
    };
    $('applyGpuPreference').onclick = () => {
      if (!persist(true, true)) {
        gpuInfo.textContent = 'บันทึกการตั้งค่าไม่สำเร็จ จึงยังไม่โหลดหน้าใหม่';
        return;
      }
      location.reload();
    };

    let visualRow = document.getElementById('visualMode')?.closest('.settings-row');
    if (!visualRow) {
      visualRow = document.createElement('div');
      visualRow.className = 'settings-row';
      visualRow.innerHTML = `
        <label for="visualMode">โทนภาพ<div class="tiny">เพิ่มสีสันแบบเกม แทบไม่เพิ่มภาระการ์ดจอ</div></label>
        <select class="field" style="width:120px; padding:8px;" id="visualMode">
          <option value="natural">ธรรมชาติ</option>
          <option value="vivid">สดใส</option>
          <option value="game">สีจัดแบบเกม</option>
        </select>
      `;
      const gpuSelectRow = document.getElementById('gpuPreferenceRow')?.closest('.settings-row');
      const qualitySelectRow = document.getElementById('qualityMode')?.closest('.settings-row');
      (gpuSelectRow || qualitySelectRow)?.parentNode.insertBefore(visualRow, (gpuSelectRow || qualitySelectRow).nextSibling);
    }
    $('visualMode').value = state.visualMode || 'natural';
    $('visualMode').onchange = e => {
      state.visualMode = e.target.value;
      persist(true, true);
      sceneAPI?.setVisualMode();
    };

    // --- ส่วนเพิ่มใหม่: สร้างแถบแสดงการใช้ RAM ---
    let ramRow = document.getElementById('ramUsageRow');
    if (!ramRow) {
      ramRow = document.createElement('div');
      ramRow.className = 'settings-row';
      ramRow.id = 'ramUsageRow';
      ramRow.innerHTML = `
        <div>การใช้หน่วยความจำ (RAM)<div class="tiny">ตรวจสอบการกินทรัพยากรของฉาก 3D</div></div>
        <div id="ramValue" style="font-weight:600; color:#376951; font-size:16px;">กำลังคำนวณ...</div>
      `;
      // แทรกลงไปใต้แถบตั้งค่าระดับกราฟิก
      const visualSelectRow = document.getElementById('visualMode')?.closest('.settings-row');
      const gpuSelectRow = document.getElementById('gpuPreferenceRow')?.closest('.settings-row');
      const qualitySelectRow = document.getElementById('qualityMode')?.closest('.settings-row');
      const lastGraphicsRow = visualSelectRow || gpuSelectRow || qualitySelectRow;
      if (lastGraphicsRow) lastGraphicsRow.parentNode.insertBefore(ramRow, lastGraphicsRow.nextSibling);
    }

    // ฟังก์ชันอัปเดต RAM แบบเรียลไทม์
    if (window.ramInterval) clearInterval(window.ramInterval);
    const updateRam = () => {
      const ramVal = document.getElementById('ramValue');
      
      // ถ้าหน้าต่างตั้งค่าถูกปิดไปแล้ว ให้หยุดคำนวณเพื่อประหยัด CPU
      if ($('settingsModal').hidden) {
         clearInterval(window.ramInterval);
         return;
      }
      
      // ดึงข้อมูลการกิน RAM (ทำงานเฉพาะ Chrome/Edge)
      if (performance && performance.memory) {
        const usedMB = Math.round(performance.memory.usedJSHeapSize / (1024 * 1024));
        ramVal.textContent = usedMB + ' MB';
        
        // แจ้งเตือนด้วยสีหากกิน RAM เยอะเกินไป (เช่น โมเดลเยอะหรือมี Memory Leak)
        if (usedMB > 600) ramVal.style.color = '#ac7064'; // สีแดง (หนักเครื่อง)
        else if (usedMB > 400) ramVal.style.color = '#d8a270'; // สีส้ม (เริ่มกินสเปค)
        else ramVal.style.color = '#376951'; // สีเขียว (ปกติ ลื่นๆ)
      } else {
        ramVal.textContent = 'เบราว์เซอร์ไม่รองรับ';
        ramVal.style.fontSize = '12px';
        ramVal.style.color = '#7b887e';
        clearInterval(window.ramInterval);
      }
    };
    
    updateRam(); // เรียกทำงานทันที 1 ครั้ง
    window.ramInterval = setInterval(updateRam, 1000); // อัปเดตซ้ำทุก 1 วินาที
    // ------------------------------------------

    sceneAPI?.qualityInfo();
    openModal('settingsModal');
  }
  $('settingsBtn').onclick = settings;
  $('mobileSettings').onclick = settings;
  $('reduceMotion').onchange = e => {
    state.reduced = e.target.checked;
    persist();
  };
  $('exportBtn').onclick = () => {
    const blob = new Blob([JSON.stringify({ schema: 'road-of-days-3d-v4', ...state }, null, 2)], {
      type: 'application/json'
    });
    const u = URL.createObjectURL(blob),
      a = document.createElement('a');
    a.href = u;
    a.download = 'road-of-days-' + localDate() + '.json';
    a.click();
    setTimeout(() => URL.revokeObjectURL(u), 2000);
    toast('ส่งออกไฟล์สำรองแล้ว');
  };
  $('importBtn').onclick = () => $('importFile').click();
  $('importFile').onchange = async e => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      if (file.size > 15 * 1024 * 1024) throw Error('large');
      const imported = validData(JSON.parse(await file.text()));
      ask('แทนที่ข้อมูลในเครื่องนี้ด้วย ' + imported.entries.length + ' บันทึกจากไฟล์สำรองหรือไม่?', () => {
        state = imported;
        const ok = persist();
        clearForm();
        chooseMood(state.mood, false);
        stats();
        renderEntries();
        sceneAPI?.refresh();
        sceneAPI?.setQuality();
        if (currentView === 'memory') renderMemory();
        if (ok) toast('กู้คืนข้อมูลสำเร็จ');
      });
    } catch (e) {
      toast('ไฟล์ไม่ถูกต้อง โปรดเลือกไฟล์สำรอง Road of Days');
    } finally {
      $('importFile').value = '';
    }
  };
  $('clearBtn').onclick = () =>
    ask('ลบบันทึกและจำนวนโคมทั้งหมดในเครื่องนี้อย่างถาวรหรือไม่?', () => {
      state.entries = [];
      state.lanterns = 0;
      clearForm();
      const ok = persist();
      stats();
      renderEntries();
      sceneAPI?.refresh();
      if (currentView === 'memory') renderMemory();
      if (ok) toast('ล้างข้อมูลแล้ว พร้อมเริ่มหน้าใหม่');
    });

  /* ============================================================================
   * src/app/12-lantern-night.js
   * โคมลอย (วางความรู้สึก) และปุ่มกลางวัน/กลางคืน
   * (ไฟล์นี้ถูกต่อรวมเป็น closure เดียวกับไฟล์อื่น — ไม่ต้อง import/export · ลำดับไฟล์ดู build.config.mjs)
   * ========================================================================== */

  function lanternDialog() {
    openModal('lanternModal');
    setTimeout(() => $('lanternMessage').focus(), 100);
  }
  $('openLantern').onclick = lanternDialog;
  $('restLantern').onclick = lanternDialog;
  $('releaseLantern').onclick = async () => {
    if (!$('lanternMessage').value.trim()) return toast('เขียนสักเรื่องที่อยากวางลงก่อนนะ');
    state.lanterns++;
    state.night = true;
    const ok = persist();
    stats();
    $('lanternMessage').value = '';
    closeModal('lanternModal');
    location.hash = 'home';
    setView('home');
    chooseMood(state.mood, false);
    sceneAPI?.release();
    if (ok) toast('ค่อย ๆ วางลงนะ… คืนนี้ขอให้ใจเบากว่าเดิม');
  };
  // --- เพิ่มปุ่มเปลี่ยนฤดูกาลเข้าไปในแผง UI (ข้างปุ่มกลางวัน/กลางคืน) ---
  window.manualSeasonIndex = 0; 
  const seasonIcons = ['cal', 'sun', 'rain', 'blossom'];
  const seasonNames = ['ฤดูกาล: อัตโนมัติ (ตามเดือน)', 'ฤดูกาล: ฤดูร้อน', 'ฤดูกาล: ฤดูฝน', 'ฤดูกาล: ฤดูหนาว'];
  const festivalOptions = [
    { id: 'auto', icon: 'cal', label: 'เทศกาล: อัตโนมัติ (เม.ย. สงกรานต์ · พ.ย. ลอยกระทง)' },
    { id: 'none', icon: 'chime', label: 'เทศกาล: ปิด' },
    { id: 'songkran', icon: 'droplet', label: 'เทศกาล: สงกรานต์' },
    { id: 'loykrathong', icon: 'lotus', label: 'เทศกาล: ลอยกระทง' },
    { id: 'temple', icon: 'lantern', label: 'เทศกาล: งานวัดและเจดีย์ทราย' }
  ];
  try {
    const savedFestival = localStorage.getItem('road-of-days-festival');
    window.currentFestival = festivalOptions.some(f => f.id === savedFestival) ? savedFestival : 'auto';
  } catch (e) {
    window.currentFestival = 'auto';
  }
  const festivalBtn = document.createElement('button');
  festivalBtn.type = 'button';
  festivalBtn.id = 'festivalBtn';
  festivalBtn.className = 'iconbtn';
  const updateFestivalButton = () => {
    const selected = festivalOptions.find(f => f.id === window.currentFestival) || festivalOptions[0];
    festivalBtn.innerHTML = svgIcon(selected.icon);
    festivalBtn.title = selected.label + ' · แตะเพื่อเปลี่ยน';
    festivalBtn.setAttribute('aria-label', selected.label + ' · แตะเพื่อเปลี่ยน');
  };
  updateFestivalButton();

  // ใช้ปุ่ม #seasonBtn ที่มีอยู่แล้วใน index.html (ไม่สร้างซ้ำให้ขึ้น 2 อัน)
  const seasonBtn = $('seasonBtn') || document.createElement('button');
  seasonBtn.id = 'seasonBtn';
  seasonBtn.type = 'button';
  seasonBtn.className = 'iconbtn';
  seasonBtn.innerHTML = svgIcon(seasonIcons[0]);

  // รักษาลำดับปุ่มฤดูกาลและเทศกาลไว้ข้างปุ่มกลางวัน/กลางคืน
  const keepSceneButtonsTogether = () => {
    const nightBtn = $('nightBtn');
    if (nightBtn && nightBtn.parentNode) {
      const parent = nightBtn.parentNode;
      if (seasonBtn.parentNode !== parent || seasonBtn.nextElementSibling !== festivalBtn) parent.insertBefore(seasonBtn, nightBtn);
      if (festivalBtn.parentNode !== parent || festivalBtn.nextElementSibling !== nightBtn) parent.insertBefore(festivalBtn, nightBtn);
    }
  };
  keepSceneButtonsTogether();

  // ดักจับเมื่อโค้ดส่วนท้ายไฟล์จัดกลุ่ม .scene-top-right ใหม่ ให้ดึงปุ่มปฏิทินตามไปด้วยทันที
  const sceneTopEl = document.querySelector('.scene-top');
  if (sceneTopEl) {
    new MutationObserver(keepSceneButtonsTogether).observe(sceneTopEl, { childList: true, subtree: true });
  }

  seasonBtn.onclick = () => {
    window.manualSeasonIndex = (window.manualSeasonIndex + 1) % 4;
    seasonBtn.innerHTML = svgIcon(seasonIcons[window.manualSeasonIndex]);
    toast(svgInline(seasonIcons[window.manualSeasonIndex]) + ' ' + seasonNames[window.manualSeasonIndex]);
    if (typeof sceneAPI !== 'undefined' && sceneAPI?.theme) sceneAPI.theme();
  };
  festivalBtn.onclick = () => {
    const currentIndex = festivalOptions.findIndex(f => f.id === window.currentFestival);
    const next = festivalOptions[(currentIndex + 1 + festivalOptions.length) % festivalOptions.length];
    window.currentFestival = next.id;
    try {
      localStorage.setItem('road-of-days-festival', next.id);
    } catch (e) {
      toast('บันทึกโหมดเทศกาลไม่ได้ แต่ยังใช้โหมดนี้ได้ในครั้งนี้');
    }
    updateFestivalButton();
    toast(next.label);
  };

  /* ============================================================================
   * src/app/13-nature-sound.js
   * เสียงธรรมชาติบำบัด (ลม สายน้ำ นก/เรไร ฝน) ด้วย Web Audio
   * (ไฟล์นี้ถูกต่อรวมเป็น closure เดียวกับไฟล์อื่น — ไม่ต้อง import/export · ลำดับไฟล์ดู build.config.mjs)
   * ========================================================================== */

  /* ===== 1. ระบบเสียงธรรมชาติบำบัด (Nature Sounds: ลมภูเขา · สายน้ำ · นก/เรไร · เสียงฝนตามฉาก) ===== */
  let audioCtx = null,
    soundOn = false,
    birdTimer = null,
    natureMaster = null,
    rainGainNode = null,
    birdBus = null,
    windGainN = null,
    streamGainN = null;
  const MIXV = Object.assign({ wind: 1, water: 1, birds: 1, rain: 1, music: 1 }, (() => { try { return JSON.parse(localStorage.getItem('road-of-days-mix')) || {}; } catch (e) { return {}; } })());
  function startNatureLoop() {
    clearInterval(birdTimer);
    birdTimer = setInterval(
      () => {
        if (!soundOn || document.hidden || !audioCtx) return;
        const now = audioCtx.currentTime;
        // ปรับระดับเสียงฝนตามสภาพอากาศในฉาก 3D อัตโนมัติแบบนุ่มนวล
        const rainAmt = window.RODENV ? window.RODENV.rain() : 0;
        if (rainGainNode) rainGainNode.gain.setTargetAtTime(rainAmt * 0.14 * MIXV.rain, now, 1.2);

        // กลางคืนและฝนไม่ตกหนัก: เสียงจิ้งหรีดเรไรทุ้มนุ่มผ่อนคลาย ไม่แหลมบาดหู
        if (state.night && rainAmt < 0.5) {
          const chirpCount = 2 + Math.floor(Math.random() * 2);
          const panNode = audioCtx.createStereoPanner ? audioCtx.createStereoPanner() : null;
          if (panNode) panNode.pan.value = Math.random() * 1.2 - 0.6;
          const baseCricketFreq = 2650 + Math.random() * 180;
          for (let c = 0; c < chirpCount; c++) {
            const o = audioCtx.createOscillator(),
              flt = audioCtx.createBiquadFilter(),
              og = audioCtx.createGain(),
              st = now + c * 0.11;
            o.type = 'sine';
            o.frequency.setValueAtTime(baseCricketFreq, st);
            o.frequency.exponentialRampToValueAtTime(baseCricketFreq * 0.96, st + 0.065);
            flt.type = 'lowpass';
            flt.frequency.value = 2900;
            og.gain.setValueAtTime(0.0001, st);
            og.gain.linearRampToValueAtTime(0.009, st + 0.022);
            og.gain.exponentialRampToValueAtTime(0.0001, st + 0.075);
            if (panNode) {
              o.connect(flt).connect(og).connect(panNode);
              panNode.connect(birdBus);
            } else o.connect(flt).connect(og).connect(birdBus);
            o.start(st);
            o.stop(st + 0.085);
          }
          return;
        }

        // กลางวัน: เสียงนกเขา/นกป่าขับขานโทนอุ่นนุ่มนวล และเสียงกระดิ่งลมไม้ไผ่/วัดริมทาง
        if (rainAmt < 0.65) {
          const pan = audioCtx.createStereoPanner ? audioCtx.createStereoPanner() : null;
          if (pan) pan.pan.value = Math.random() * 1.4 - 0.7;
          const callStyle = Math.random();
          if (callStyle < 0.45) {
            // เสียงนกเขาขันทุ้มนุ่มริมทุ่งนา (Coo-coo โทนต่ำผ่อนคลาย)
            const cooNotes = [
              [520, 560, 0.28],
              [620, 580, 0.22],
              [490, 460, 0.42]
            ];
            let offset = 0;
            cooNotes.forEach(([fStart, fEnd, dur]) => {
              const st = now + offset;
              const o = audioCtx.createOscillator(),
                flt = audioCtx.createBiquadFilter(),
                og = audioCtx.createGain();
              o.type = 'sine';
              flt.type = 'lowpass';
              flt.frequency.value = 1100;
              o.frequency.setValueAtTime(fStart, st);
              o.frequency.exponentialRampToValueAtTime(fEnd, st + dur);
              og.gain.setValueAtTime(0.0001, st);
              og.gain.linearRampToValueAtTime(0.018, st + 0.045);
              og.gain.exponentialRampToValueAtTime(0.0001, st + dur);
              if (pan) {
                o.connect(flt).connect(og).connect(pan);
                pan.connect(birdBus);
              } else o.connect(flt).connect(og).connect(birdBus);
              o.start(st);
              o.stop(st + dur + 0.03);
              offset += dur + 0.08;
            });
          } else {
            // เสียงนกป่าร้องเพลงโทนขลุ่ยอุ่น ๆ (Pentatonic Bird Song)
            const birdScale = [1046.5, 1174.66, 1318.5, 1567.98, 1760.0];
            const notes = 2 + Math.floor(Math.random() * 2);
            const baseIdx = Math.floor(Math.random() * (birdScale.length - 1));
            for (let n = 0; n < notes; n++) {
              const st = now + n * (0.19 + Math.random() * 0.07);
              const o = audioCtx.createOscillator(),
                og = audioCtx.createGain(),
                flt = audioCtx.createBiquadFilter();
              o.type = 'sine';
              flt.type = 'lowpass';
              flt.frequency.value = 2100;
              const f1 = birdScale[(baseIdx + n) % birdScale.length];
              o.frequency.setValueAtTime(f1 * 0.96, st);
              o.frequency.exponentialRampToValueAtTime(f1 * 1.08, st + 0.07);
              o.frequency.exponentialRampToValueAtTime(f1, st + 0.2);
              og.gain.setValueAtTime(0.0001, st);
              og.gain.linearRampToValueAtTime(0.022, st + 0.035);
              og.gain.exponentialRampToValueAtTime(0.0001, st + 0.24);
              if (pan) {
                o.connect(flt).connect(og).connect(pan);
                pan.connect(birdBus);
              } else o.connect(flt).connect(og).connect(birdBus);
              o.start(st);
              o.stop(st + 0.26);
            }
          }
          // สุ่มเสียงกระดิ่งลมวัดริมทางแบบกังวานนุ่มลึก
          if (Math.random() < 0.3) {
            const chimeFreq = [523.25, 587.33, 659.25, 783.99, 880.0][Math.floor(Math.random() * 5)];
            const co = audioCtx.createOscillator(),
              co2 = audioCtx.createOscillator(),
              cg = audioCtx.createGain(),
              st = now + 0.5;
            co.type = 'sine';
            co2.type = 'triangle';
            co.frequency.setValueAtTime(chimeFreq, st);
            co2.frequency.setValueAtTime(chimeFreq * 2, st);
            const g2 = audioCtx.createGain();
            g2.gain.value = 0.12;
            cg.gain.setValueAtTime(0.0001, st);
            cg.gain.linearRampToValueAtTime(0.014, st + 0.03);
            cg.gain.exponentialRampToValueAtTime(0.0001, st + 2.4);
            co.connect(cg);
            co2.connect(g2).connect(cg);
            cg.connect(birdBus);
            co.start(st);
            co2.start(st);
            co.stop(st + 2.45);
            co2.stop(st + 2.45);
          }
        }
      },
      3400 + Math.random() * 2200
    );
  }
  function stopSound() {
    clearInterval(birdTimer);
    if (audioCtx && audioCtx.state === 'running') {
      if (natureMaster) natureMaster.gain.setTargetAtTime(0.0001, audioCtx.currentTime, 0.25);
      setTimeout(() => {
        if (!soundOn && audioCtx) audioCtx.suspend();
      }, 300);
    }
  }
  function resumeSound() {
    if (soundOn && !document.hidden && audioCtx) {
      audioCtx.resume();
      if (natureMaster) natureMaster.gain.setTargetAtTime(0.9, audioCtx.currentTime, 0.6);
      startNatureLoop();
    }
  }
  $('soundBtn').onclick = async () => {
    try {
      if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        natureMaster = audioCtx.createGain();
        natureMaster.gain.value = 0.0001;
        natureMaster.connect(audioCtx.destination);
        birdBus = audioCtx.createGain();
        birdBus.gain.value = MIXV.birds;
        birdBus.connect(natureMaster);

        // สร้าง Buffer เสียงลมภูเขาและสายน้ำ (Stereo Brown/Pink Noise 6 วินาที)
        const len = audioCtx.sampleRate * 6,
          b = audioCtx.createBuffer(2, len, audioCtx.sampleRate);
        for (let ch = 0; ch < 2; ch++) {
          const d = b.getChannelData(ch);
          let p = 0;
          for (let i = 0; i < len; i++) {
            p = (p + (Math.random() * 2 - 1) * 0.025) / 1.02;
            d[i] = p * 2.6;
          }
        }
        // ชั้นที่ 1: เสียงลมพัดผ่านยอดไม้ (มี LFO ค่อย ๆ กวาดความถี่นุ่มลึกเหมือนลมหายใจ)
        const windSrc = audioCtx.createBufferSource();
        windSrc.buffer = b;
        windSrc.loop = true;
        const windFlt = audioCtx.createBiquadFilter();
        windFlt.type = 'lowpass';
        windFlt.frequency.value = 280;
        const lfo = audioCtx.createOscillator(),
          lfoGain = audioCtx.createGain();
        lfo.type = 'sine';
        lfo.frequency.value = 0.11;
        lfoGain.gain.value = 110;
        lfo.connect(lfoGain).connect(windFlt.frequency);
        lfo.start();
        const windGain = audioCtx.createGain();
        windGain.gain.value = 0.14 * MIXV.wind;
        windGainN = windGain;
        windSrc.connect(windFlt).connect(windGain).connect(natureMaster);
        windSrc.start();

        // ชั้นที่ 2: เสียงสายน้ำโขง/ลำธารไหลเอื่อย ๆ โทนอุ่นไม่ซ่าบาดหู
        const streamSrc = audioCtx.createBufferSource();
        streamSrc.buffer = b;
        streamSrc.loop = true;
        streamSrc.playbackRate.value = 1.15;
        const streamFlt = audioCtx.createBiquadFilter();
        streamFlt.type = 'bandpass';
        streamFlt.frequency.value = 540;
        streamFlt.Q.value = 0.85;
        const streamWarm = audioCtx.createBiquadFilter();
        streamWarm.type = 'lowpass';
        streamWarm.frequency.value = 950;
        const streamGain = audioCtx.createGain();
        streamGain.gain.value = 0.042 * MIXV.water;
        streamGainN = streamGain;
        streamSrc.connect(streamFlt).connect(streamWarm).connect(streamGain).connect(natureMaster);
        streamSrc.start();

        // ชั้นที่ 3: เสียงสายฝนตกกระทบใบไม้แบบนุ่มนวล (กรองความถี่แหลมออกให้ฟังสบาย)
        const rainSrc = audioCtx.createBufferSource();
        rainSrc.buffer = b;
        rainSrc.loop = true;
        rainSrc.playbackRate.value = 1.65;
        const rainFlt = audioCtx.createBiquadFilter();
        rainFlt.type = 'bandpass';
        rainFlt.frequency.value = 880;
        rainFlt.Q.value = 0.6;
        const rainWarm = audioCtx.createBiquadFilter();
        rainWarm.type = 'lowpass';
        rainWarm.frequency.value = 1450;
        rainGainNode = audioCtx.createGain();
        rainGainNode.gain.value = 0.0001;
        rainSrc.connect(rainFlt).connect(rainWarm).connect(rainGainNode).connect(natureMaster);
        rainSrc.start();
      }
      soundOn = !soundOn;
      if (soundOn) {
        await audioCtx.resume();
        natureMaster.gain.setTargetAtTime(0.9, audioCtx.currentTime, 0.8);
        startNatureLoop();
      } else {
        stopSound();
      }
      $('soundBtn').classList.toggle('active', soundOn);
      $('soundBtn').setAttribute('aria-pressed', soundOn);
      toast(soundOn ? 'เปิดเสียงธรรมชาติบำบัด (ลม · สายน้ำ · นก/เรไร)' : 'ปิดเสียงธรรมชาติแล้ว');
    } catch (e) {
      toast('เบราว์เซอร์นี้ยังเปิดเสียงไม่ได้');
    }
  };
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      stopSound();
      if (breathTimer) stopBreath();
    } else resumeSound();
  });

  /* ============================================================================
   * src/app/14-ambient-music.js
   * เพลงบรรเลงผ่อนคลาย (เปียโนนุ่ม ๆ + Warm Pad) ปรับตามอารมณ์ ด้วย Web Audio
   * (ไฟล์นี้ถูกต่อรวมเป็น closure เดียวกับไฟล์อื่น — ไม่ต้อง import/export · ลำดับไฟล์ดู build.config.mjs)
   * ========================================================================== */

  /* ===== 2. ระบบเพลงบรรเลงผ่อนคลาย (Ambient Music: เปียโนผ้านุ่ม ๆ · Warm Pad · ปรับตามอารมณ์) ===== */
  let mCtx = null,
    mOn = false,
    mTimer = null,
    mStep = 0,
    mBus = null;
  const MCH_MOOD = {
    calm: [
      [48, 55, 59, 64],
      [45, 52, 59, 64],
      [41, 48, 57, 60],
      [43, 50, 55, 62]
    ],
    happy: [
      [48, 55, 60, 64],
      [53, 57, 60, 67],
      [45, 52, 57, 64],
      [43, 50, 55, 62]
    ],
    tired: [
      [45, 52, 57, 60],
      [41, 48, 53, 57],
      [48, 55, 59, 62],
      [43, 50, 55, 59]
    ],
    sad: [
      [45, 52, 57, 60],
      [41, 48, 52, 57],
      [43, 50, 55, 59],
      [40, 47, 52, 55]
    ],
    hope: [
      [48, 55, 59, 64],
      [43, 50, 59, 62],
      [45, 52, 60, 64],
      [41, 48, 57, 60]
    ]
  };
  const MSC = [60, 62, 64, 67, 69, 71, 72, 74, 76, 79],
    mf = m => 440 * 2 ** ((m - 69) / 12);

  function mNote(m, t, d, v, pad) {
    if (!mCtx) return;
    const o = mCtx.createOscillator(),
      o2 = mCtx.createOscillator(),
      flt = mCtx.createBiquadFilter(),
      g = mCtx.createGain();
    const pan = mCtx.createStereoPanner ? mCtx.createStereoPanner() : null;
    const freq = mf(m);
    if (pad) {
      // เสียง Warm Ambient Pad โอบล้อม
      o.type = 'sine';
      o2.type = 'triangle';
      o.frequency.value = freq;
      o2.frequency.value = freq * 1.003;
      flt.type = 'lowpass';
      flt.frequency.setValueAtTime(520, t);
      flt.frequency.linearRampToValueAtTime(950, t + d * 0.45);
      flt.frequency.linearRampToValueAtTime(420, t + d);
      g.gain.setValueAtTime(0.0001, t);
      g.gain.linearRampToValueAtTime(v, t + 2.6);
      g.gain.exponentialRampToValueAtTime(0.0001, t + d);
    } else {
      // เสียง Felt Piano นุ่มนวล ไม่บาดหู
      o.type = 'triangle';
      o2.type = 'sine';
      o.frequency.value = freq;
      o2.frequency.value = freq * 2;
      const o2g = mCtx.createGain();
      o2g.gain.value = 0.18;
      flt.type = 'lowpass';
      flt.frequency.setValueAtTime(Math.min(2200, freq * 3.2), t);
      flt.frequency.exponentialRampToValueAtTime(Math.max(380, freq * 1.1), t + d * 0.85);
      g.gain.setValueAtTime(0.0001, t);
      g.gain.linearRampToValueAtTime(v, t + 0.035);
      g.gain.exponentialRampToValueAtTime(v * 0.35, t + 0.45);
      g.gain.exponentialRampToValueAtTime(0.0001, t + d);
      o.connect(flt);
      o2.connect(o2g).connect(flt);
      if (pan) {
        pan.pan.value = Math.random() * 0.9 - 0.45;
        flt.connect(g).connect(pan).connect(mBus);
      } else flt.connect(g).connect(mBus);
      o.start(t);
      o2.start(t);
      o.stop(t + d + 0.1);
      o2.stop(t + d + 0.1);
      return;
    }
    o.connect(flt);
    o2.connect(flt);
    if (pan) {
      pan.pan.value = Math.random() * 0.6 - 0.3;
      flt.connect(g).connect(pan).connect(mBus);
    } else flt.connect(g).connect(mBus);
    o.start(t);
    o2.start(t);
    o.stop(t + d + 0.15);
    o2.stop(t + d + 0.15);
  }

  function mTick() {
    if (!mCtx || document.hidden || !mOn) return;
    const t = mCtx.currentTime + 0.06,
      n = state.night ? 7 : 0;
    const chords = MCH_MOOD[state.mood] || MCH_MOOD.calm;
    const chord = chords[Math.floor(mStep / 4) % chords.length];

    const ch = window.radioChannel || 0;

    if (ch === 0) {
      // 📻 คลื่น 0: Ambient นุ่มลึก (ออริจินัล)
      if (mStep % 4 === 0) {
        mNote(chord[0] - 12, t, 8.5, 0.045, true);
        chord.forEach((m, i) => mNote(m - n, t + i * 0.32, 8.2, 0.038, true));
      }
      if (Math.random() < 0.78) {
        const pick = Math.random() < 0.45 ? chord[Math.floor(Math.random() * chord.length)] + 12 : MSC[Math.floor(Math.random() * MSC.length)];
        mNote(pick - n, t + Math.random() * 0.35, 3.8, 0.075, false);
      }
      if (Math.random() < 0.38) {
        const pick2 = MSC[Math.floor(Math.random() * 6)];
        mNote(pick2 - n, t + 0.85 + Math.random() * 0.25, 3.4, 0.048, false);
      }
    } 
    else if (ch === 1) {
      // 📻 คลื่น 1: ดนตรีล้านนาประยุกต์ (Pentatonic กลิ่นอายสะล้อซอซึง)
      const lannaScale = [60, 62, 64, 67, 69, 72, 74, 76, 79, 81];
      if (mStep % 4 === 0) mNote(chord[0] - 12, t, 4.0, 0.03, true); // รองพื้น Pad บางๆ
      // ดีดลูกล้อแบบซึงล้านนา (จังหวะกระชั้นและเร็ว)
      for (let i = 0; i < 2; i++) {
        if (Math.random() < 0.85) {
          const pick = lannaScale[Math.floor(Math.random() * lannaScale.length)];
          mNote(pick - n, t + i * 0.35, 1.2, 0.08, false); 
        }
      }
    } 
    else if (ch === 2) {
      // 📻 คลื่น 2: กล่องดนตรีกล่อมนอน (Music Box Arpeggio)
      if (mStep % 4 === 0) mNote(chord[0] - 12, t, 5.0, 0.02, true);
      // ไล่โน้ตแบบกล่องดนตรีใสๆ
      chord.forEach((note, i) => {
        mNote(note - n + 12, t + i * 0.28, 1.5, 0.05, false);
      });
      if (Math.random() < 0.5) mNote(chord[Math.floor(Math.random() * chord.length)] - n + 24, t + 1.2, 2.0, 0.04, false);
    } 
    else if (ch === 3) {
      // 📻 คลื่น 3: เทปคาสเซ็ทเสียงฝน (มีแค่เสียงฮัมเบาๆ ปล่อยให้เสียงฝนและธรรมชาติรอบรถทำงานแทน)
      if (mStep % 4 === 0) mNote(40, t, 8.5, 0.012, true); 
    }

    mStep++;
  }

  function mInit() {
    mCtx = new (window.AudioContext || window.webkitAudioContext)();
    const sr = mCtx.sampleRate,
      len = sr * 3.8,
      b = mCtx.createBuffer(2, len, sr);
    for (let c = 0; c < 2; c++) {
      const d = b.getChannelData(c);
      let lp = 0;
      for (let i = 0; i < len; i++) {
        const w = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 2.8);
        lp = lp * 0.75 + w * 0.25;
        d[i] = lp;
      }
    }
    const cv = mCtx.createConvolver();
    cv.buffer = b;
    const wet = mCtx.createGain();
    wet.gain.value = 0.62;
    const dl = mCtx.createDelay(2),
      fb = mCtx.createGain(),
      dlFlt = mCtx.createBiquadFilter();
    dl.delayTime.value = 0.52;
    fb.gain.value = 0.32;
    dlFlt.type = 'lowpass';
    dlFlt.frequency.value = 1100;
    mBus = mCtx.createGain();
    mBus.gain.value = 0.0001;
    mBus.connect(mCtx.destination);
    mBus.connect(dl);
    dl.connect(dlFlt).connect(fb).connect(dl);
    dl.connect(cv);
    mBus.connect(cv);
    cv.connect(wet).connect(mCtx.destination);
  }

  function mStop() {
    clearInterval(mTimer);
    if (mCtx && mCtx.state === 'running') {
      if (mBus) mBus.gain.setTargetAtTime(0.0001, mCtx.currentTime, 0.35);
      setTimeout(() => {
        if (!mOn && mCtx) mCtx.suspend();
      }, 400);
    }
  }

  $('musicBtn').onclick = async () => {
    try {
      if (!mCtx) mInit();
      mOn = !mOn;
      if (mOn) {
        await mCtx.resume();
        mBus.gain.setTargetAtTime(0.88 * MIXV.music, mCtx.currentTime, 0.8);
        mStep = 0;
        mTick();
        clearInterval(mTimer);
        mTimer = setInterval(mTick, 1850);
      } else {
        mStop();
      }
      $('musicBtn').classList.toggle('active', mOn);
      $('musicBtn').setAttribute('aria-pressed', mOn);
      toast(mOn ? 'เปิดเพลงบรรเลงผ่อนคลาย (ปรับตามอารมณ์และเวลา)' : 'ปิดเพลงบรรเลง');
    } catch (e) {
      mOn = false;
      toast('เปิดเสียงเพลงไม่ได้ในอุปกรณ์นี้');
    }
  };
  document.addEventListener('visibilitychange', () => {
    if (!mOn || !mCtx) return;
    if (document.hidden) mStop();
    else {
      mCtx.resume();
      if (mBus) mBus.gain.setTargetAtTime(0.88 * MIXV.music, mCtx.currentTime, 0.6);
      clearInterval(mTimer);
      mTimer = setInterval(mTick, 1850);
    }
  });

  /* ============================================================================
   * src/app/15-breath.js
   * มุมพักใจ: แบบฝึกหายใจ
   * (ไฟล์นี้ถูกต่อรวมเป็น closure เดียวกับไฟล์อื่น — ไม่ต้อง import/export · ลำดับไฟล์ดู build.config.mjs)
   * ========================================================================== */

  let breathTimer = null,
    breathStart = 0;
  function stopBreath() {
    clearInterval(breathTimer);
    breathTimer = null;
    $('breathOrb').classList.remove('expand');
    $('breathText').textContent = 'อยู่ตรงนี้';
    $('breathBtn').textContent = 'เริ่มพักใจ 1 นาที';
    $('breathStatus').textContent = 'ให้เวลาตัวเองสักหนึ่งนาที';
  }
  $('breathBtn').onclick = () => {
    if (breathTimer) {
      stopBreath();
      return;
    }
    breathStart = Date.now();
    $('breathBtn').textContent = 'หยุดพักได้ทุกเมื่อ';
    let last = -1;
    function tick() {
      const elapsed = (Date.now() - breathStart) / 1000;
      if (elapsed >= 60) {
        stopBreath();
        $('breathStatus').textContent = 'ขอบคุณที่ให้เวลาตัวเองหนึ่งนาที';
        return;
      }
      const phase = Math.floor(elapsed / 4) % 2;
      if (phase !== last) {
        $('breathOrb').classList.toggle('expand', phase === 0 && !state.reduced);
        $('breathText').textContent = phase === 0 ? 'หายใจเข้าเบา ๆ' : 'หายใจออกช้า ๆ';
        last = phase;
      }
      $('breathStatus').textContent = 'พักใจอีก ' + Math.ceil(60 - elapsed) + ' วินาที · หายใจตามที่สบาย';
    }
    tick();
    breathTimer = setInterval(tick, 200);
  };

  /* ============================================================================
   * src/app/16-route-ui.js
   * ป้ายชื่อสถานที่ตามตำแหน่งบนเส้นทาง (updateRouteUI)
   * (ไฟล์นี้ถูกต่อรวมเป็น closure เดียวกับไฟล์อื่น — ไม่ต้อง import/export · ลำดับไฟล์ดู build.config.mjs)
   * ========================================================================== */

  function updateRouteUI() {
    const near = [...ROUTE].sort((a, b) => Math.abs(a.t - state.routeT) - Math.abs(b.t - state.routeT))[0],
      isNearStop = Math.abs(near.t - state.routeT) < 0.025;
    $('placeLabel').textContent =
      state.routeT > T3 + 0.012
        ? 'ขับวนกลับ · เส้นทางชนบท'
        : state.routeT > T1 + 0.012 && !isNearStop
          ? 'ขับต่อไปเรื่อย ๆ · วัด ทุ่งนา หนองน้ำ'
          : near.name + ' · ' + near.sub;
    
    // ดัก Error: เช็คว่าฟังก์ชัน drawMini โหลดเข้าหน่วยความจำหรือยังก่อนเรียกใช้
    if (typeof drawMini === 'function') {
      drawMini();
    }
  }

  /* ============================================================================
   * src/app/17-memory-calendar.js
   * หน้าความทรงจำ: ปฏิทิน รายการตามวัน และแผนที่เส้นทางความทรงจำ
   * (ไฟล์นี้ถูกต่อรวมเป็น closure เดียวกับไฟล์อื่น — ไม่ต้อง import/export · ลำดับไฟล์ดู build.config.mjs)
   * ========================================================================== */

  let viewYear = new Date().getFullYear(),
    viewMonth = new Date().getMonth(),
    selectedStop = null,
    selectedDay = null;
  const routeStops = ROUTE.map(s => ({ name: s.name, t: s.t }));
  function dayKey(y, m, d) {
    return y + '-' + String(m + 1).padStart(2, '0') + '-' + String(d).padStart(2, '0');
  }
  function listMemory(target, entries) {
    target.replaceChildren();
    if (!entries.length) {
      target.innerHTML = '<div style="color:#7b887e; text-align:center; padding: 40px 10px;">ยังไม่มีความทรงจำในวันนี้<br><small style="margin-top:6px;display:block;">ปล่อยให้เป็นวันว่าง ๆ ที่ใจได้พักผ่อน</small></div>';
      return;
    }
    entries.forEach(e => {
      const box = document.createElement('div');
      box.className = 'mem-entry';
      const title = document.createElement('strong');
      title.textContent = e.title;
      const detail = document.createElement('p');
      detail.className = 'tiny';
      detail.textContent =
        prettyDate(e.date) + ' · ' + moodOf(e.mood).label + (e.place ? ' · ' + e.place : '');
      const read = document.createElement('button');
      read.textContent = 'อ่านเรื่องราว';
      read.onclick = () => openReader(e.id);
      box.append(title, detail, read);
      target.append(box);
    });
  }
  function renderDay() {
    if (!selectedDay) return;
    const target = $('dayEntries'),
      entries = state.entries.filter(e => e.date === selectedDay).reverse();
    target.replaceChildren();
    $('dayCount').textContent = entries.length ? entries.length + (entries.length === 1 ? ' เรื่อง' : ' เรื่องราว') : 'วันพักใจ';
    const dateLine = document.createElement('div');
    dateLine.className = 'day-date-line';
    dateLine.innerHTML = '<span class="day-date-icon">' + svgIcon('cal') + '</span>';
    const dateText = document.createElement('div'),
      date = new Date(selectedDay + 'T12:00:00');
    dateText.className = 'day-date-text';
    dateText.innerHTML = '<strong>' + date.toLocaleDateString('th-TH', { day: 'numeric', month: 'long' }) + '</strong><span>' +
      date.toLocaleDateString('th-TH', { weekday: 'long', year: 'numeric' }) + '</span>';
    dateLine.append(dateText);
    target.append(dateLine);

    if (!entries.length) {
      const empty = document.createElement('div');
      empty.className = 'day-empty';
      empty.innerHTML = '<span class="day-empty-icon">' + svgIcon('leaf') + '</span><strong>วันนี้ยังว่างอยู่</strong><p>บางวันก็เป็นเพียงช่วงพักระหว่างทาง<br>ถ้าอยากเก็บวันนี้ไว้ เริ่มเขียนได้เลย</p>';
      if (selectedDay <= localDate()) {
        const write = document.createElement('button');
        write.type = 'button';
        write.className = 'day-write';
        write.textContent = '＋ บันทึกเรื่องราววันนี้';
        write.onclick = () => startMemoryEntry(selectedDay);
        empty.append(write);
      }
      target.append(empty);
      return;
    }

    entries.forEach(e => {
      const mood = moodOf(e.mood),
        card = document.createElement('article');
      card.className = 'day-story';
      card.style.setProperty('--story-color', mood.color);
      const top = document.createElement('div');
      top.className = 'day-story-top';
      const moodTag = document.createElement('span');
      moodTag.className = 'day-mood';
      moodTag.style.setProperty('--mood-color', mood.color);
      moodTag.innerHTML = svgIcon(mood.icon);
      moodTag.append(document.createTextNode(mood.label));
      top.append(moodTag);
      if (e.place) {
        const place = document.createElement('span');
        place.className = 'day-place';
        place.textContent = e.place;
        top.append(place);
      }
      const title = document.createElement('h3');
      title.textContent = e.title;
      const excerpt = document.createElement('p');
      excerpt.className = 'day-story-excerpt';
      excerpt.textContent = e.text.length > 190 ? e.text.slice(0, 187).trimEnd() + '…' : e.text;
      const read = document.createElement('button');
      read.type = 'button';
      read.className = 'day-read';
      read.textContent = 'อ่านเรื่องราวเต็ม ๆ  →';
      read.onclick = () => openReader(e.id);
      card.append(top, title, excerpt, read);
      target.append(card);
    });
  }
  function updateMemoryStats() {
    const stats = $('memoryStats');
    if (!stats) return;
    const entries = state.entries,
      dates = new Set(entries.map(e => e.date)),
      monthPrefix = viewYear + '-' + String(viewMonth + 1).padStart(2, '0'),
      thisMonth = entries.filter(e => e.date.startsWith(monthPrefix)).length,
      moodCounts = moods.map(m => ({ mood: m, count: entries.filter(e => e.mood === m.id).length })),
      topMood = moodCounts.sort((a, b) => b.count - a.count)[0];
    stats.replaceChildren();
    [
      { icon: 'book', value: entries.length, label: 'เรื่องราวที่เก็บไว้', note: 'ทุกบันทึกมีความหมาย' },
      { icon: 'cal', value: dates.size, label: 'วันที่ถูกจดจำ', note: 'วันเล็ก ๆ ที่กลายเป็นเรื่องราว' },
      { icon: 'heart', value: topMood && topMood.count ? topMood.mood.label : '—', label: 'อารมณ์ที่พบบ่อย', note: thisMonth + ' บันทึกในเดือนนี้' }
    ].forEach((item, index) => {
      const card = document.createElement('div'),
        icon = document.createElement('span'),
        text = document.createElement('div');
      card.className = 'memory-stat';
      icon.className = 'memory-stat-icon';
      icon.innerHTML = svgIcon(item.icon);
      text.className = 'memory-stat-text';
      text.innerHTML = '<strong>' + item.value + '</strong><span>' + item.label + '</span><small>' + item.note + '</small>';
      card.append(icon, text);
      stats.append(card);
    });
  }
  function renderCalendar() {
    const now = localDate(),
      grid = $('calendarGrid');
    grid.replaceChildren();
    $('monthHeading').textContent = new Date(viewYear, viewMonth, 1).toLocaleDateString('th-TH', {
      month: 'long',
      year: 'numeric'
    });
    const prefix = viewYear + '-' + String(viewMonth + 1).padStart(2, '0'),
      monthEntries = state.entries.filter(e => e.date.startsWith(prefix)),
      entriesByDay = new Map();
    monthEntries.forEach(e => {
      if (!entriesByDay.has(e.date)) entriesByDay.set(e.date, []);
      entriesByDay.get(e.date).push(e);
    });
    $('monthMeta').textContent = monthEntries.length + ' บันทึกในเดือนนี้';
    const todayDate = new Date(now + 'T12:00:00'),
      isCurrentMonth = todayDate.getFullYear() === viewYear && todayDate.getMonth() === viewMonth;
    $('monthNext').disabled = viewYear > todayDate.getFullYear() || isCurrentMonth;
    if (!selectedDay || !selectedDay.startsWith(prefix)) {
      const latest = [...entriesByDay.keys()].sort().pop();
      const dayInMonth = isCurrentMonth ? todayDate.getDate() : Math.min(new Date(viewYear, viewMonth + 1, 0).getDate(), 28);
      selectedDay = latest || (viewYear < todayDate.getFullYear() || (viewYear === todayDate.getFullYear() && viewMonth < todayDate.getMonth())
        ? dayKey(viewYear, viewMonth, new Date(viewYear, viewMonth + 1, 0).getDate())
        : dayKey(viewYear, viewMonth, dayInMonth));
    }
    ['อา', 'จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส'].forEach(x => {
      const el = document.createElement('div');
      el.className = 'mem-weekday';
      el.textContent = x;
      grid.append(el);
    });
    for (let i = 0; i < new Date(viewYear, viewMonth, 1).getDay(); i++)
      grid.append(document.createElement('div'));
    for (let d = 1; d <= new Date(viewYear, viewMonth + 1, 0).getDate(); d++) {
      const key = dayKey(viewYear, viewMonth, d),
        items = entriesByDay.get(key) || [],
        btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'mem-day' + (items.length ? ' has' : '') + (key === now ? ' today' : '') + (key === selectedDay ? ' selected' : '');
      btn.disabled = key > now;
      const n = document.createElement('span');
      n.className = 'mem-day-number';
      n.textContent = d;
      btn.append(n);
      if (items.length) {
        btn.style.setProperty('--day-color', moodOf(items[items.length - 1].mood).color);
        const dots = document.createElement('span');
        dots.className = 'mem-day-dots';
        items.slice(0, 3).forEach(item => {
          const dot = document.createElement('i');
          dot.style.setProperty('--mood-color', moodOf(item.mood).color);
          dots.append(dot);
        });
        btn.append(dots);
        if (items.length > 1) {
          const count = document.createElement('small');
          count.textContent = items.length + ' เรื่อง';
          btn.append(count);
        }
      }
      btn.setAttribute('aria-label', prettyDate(key) + (items.length ? ' มี ' + items.length + ' ความทรงจำ' : ' ไม่มีบันทึก'));
      if (key === now) btn.setAttribute('aria-current', 'date');
      btn.onclick = () => {
        selectedDay = key;
        grid.querySelectorAll('.mem-day.selected').forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
        renderDay();
        if (window.innerWidth <= 900) {
          $('dayEntries').parentElement.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
        }
      };
      grid.append(btn);
    }
    updateMemoryStats();
    renderDay();
  }
  function startMemoryEntry(date) {
    clearForm();
    $('entryDate').value = date;
    location.hash = 'home';
    setView('home');
    document.querySelector('.side').classList.add('open');
    setTimeout(() => $('entryTitle').focus({ preventScroll: true }), 300);
  }
  function drawRouteMemory() {
    const cv = $('memoryRoute'),
      ctx = cv.getContext('2d'),
      w = cv.width,
      h = cv.height;
    ctx.clearRect(0, 0, w, h);
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(40, 240);
    ctx.bezierCurveTo(180, 60, 300, 280, 460, 150);
    ctx.bezierCurveTo(580, 60, 680, 230, 860, 60);
    ctx.bezierCurveTo(820, 160, 740, 250, 640, 235);
    ctx.bezierCurveTo(550, 220, 550, 80, 470, 90);
    ctx.lineWidth = 22;
    ctx.strokeStyle = '#fef8e8';
    ctx.stroke();
    ctx.lineWidth = 10;
    ctx.strokeStyle = '#75a47d';
    ctx.stroke();
    const point = t => {
      if (t <= T1) {
        const u = Math.max(0, Math.min(1, (t - T0) / (T1 - T0))),
          a = u < 0.5 ? u * 2 : (u - 0.5) * 2;
        return u < 0.5
          ? [
              (1 - a) ** 3 * 40 + 3 * (1 - a) ** 2 * a * 180 + 3 * (1 - a) * a * a * 300 + a ** 3 * 460,
              (1 - a) ** 3 * 240 + 3 * (1 - a) ** 2 * a * 60 + 3 * (1 - a) * a * a * 280 + a ** 3 * 150
            ]
          : [
              (1 - a) ** 3 * 460 + 3 * (1 - a) ** 2 * a * 580 + 3 * (1 - a) * a * a * 680 + a ** 3 * 860,
              (1 - a) ** 3 * 150 + 3 * (1 - a) ** 2 * a * 60 + 3 * (1 - a) * a * a * 230 + a ** 3 * 60
            ];
      }
      const u = Math.max(0, Math.min(1, (t - (t <= T2 ? T1 : T2)) / (t <= T2 ? T2 - T1 : T3 - T2))),
        start = t <= T2 ? [860, 60] : [640, 235],
        c1 = t <= T2 ? [820, 160] : [550, 220],
        c2 = t <= T2 ? [740, 250] : [550, 80],
        end = t <= T2 ? [640, 235] : [470, 90],
        inv = 1 - u;
      return [
        inv ** 3 * start[0] + 3 * inv ** 2 * u * c1[0] + 3 * inv * u ** 2 * c2[0] + u ** 3 * end[0],
        inv ** 3 * start[1] + 3 * inv ** 2 * u * c1[1] + 3 * inv * u ** 2 * c2[1] + u ** 3 * end[1]
      ];
    };
    routeStops.forEach(s => {
      const [x, y] = point(s.t);
      ctx.beginPath();
      ctx.arc(x, y, 14, 0, Math.PI * 2);
      ctx.fillStyle = '#fff';
      ctx.fill();
      ctx.lineWidth = 4;
      ctx.strokeStyle = '#376951';
      ctx.stroke();
      ctx.fillStyle = '#315c45';
      ctx.font = 'bold 13px Noto Sans Thai,sans-serif';
      ctx.fillText(s.name, x + 16, y + 5);
    });
    state.entries.forEach(e => {
      const [x, y] = point(e.routeT);
      ctx.fillStyle = moodOf(e.mood).color;
      ctx.fillRect(x - 8, y - 8, 16, 16);
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 2;
      ctx.strokeRect(x - 8, y - 8, 16, 16);
    });
    return point;
  }
  function renderRouteMemory() {
    const point = drawRouteMemory(),
      bar = $('stopButtons');
    bar.replaceChildren();
    const all = document.createElement('button');
    all.textContent = 'ทุกจุดแวะ';
    all.classList.toggle('active', !selectedStop);
    all.onclick = () => {
      selectedStop = null;
      renderRouteMemory();
    };
    bar.append(all);
    routeStops.forEach(s => {
      const b = document.createElement('button');
      b.textContent = s.name;
      b.classList.toggle('active', selectedStop === s.name);
      b.onclick = () => {
        selectedStop = s.name;
        renderRouteMemory();
      };
      bar.append(b);
    });
    const entries = selectedStop
      ? state.entries.filter(e => {
          const s = routeStops.reduce((a, b) =>
            Math.abs(a.t - e.routeT) < Math.abs(b.t - e.routeT) ? a : b
          );
          return s.name === selectedStop;
        })
      : state.entries;
    listMemory($('stopEntries'), entries);
    $('memoryRoute').onclick = ev => {
      const r = ev.currentTarget.getBoundingClientRect(),
        x = ((ev.clientX - r.left) * 900) / r.width,
        y = ((ev.clientY - r.top) * 300) / r.height;
      const match = state.entries
        .map(e => {
          const p = point(e.routeT);
          return { e, d: Math.hypot(p[0] - x, p[1] - y) };
        })
        .sort((a, b) => a.d - b.d)[0];
      if (match && match.d < 28) openReader(match.e.id);
    };
  }
  function renderMemory() {
    renderCalendar();
    //renderRouteMemory();
  }
  $('memoryOpen').onclick = () => {
    location.hash = 'memory';
    setView('memory');
  };
  $('memClose').onclick = () => {
    location.hash = 'home';
    setView('home');
  };
  $('memoryWrite').onclick = () => startMemoryEntry(localDate());
  $('monthPrev').onclick = () => {
    viewMonth--;
    if (viewMonth < 0) {
      viewMonth = 11;
      viewYear--;
    }
    selectedDay = null;
    renderCalendar();
  };
  $('monthNext').onclick = () => {
    if ($('monthNext').disabled) return;
    viewMonth++;
    if (viewMonth > 11) {
      viewMonth = 0;
      viewYear++;
    }
    selectedDay = null;
    renderCalendar();
  };

  /* ============================================================================
   * src/app/18-scene-buttons.js
   * ปุ่มควบคุมฉาก: ซูม ความเร็วรถ และทางลัดเปิดหน้าต่าง ๆ
   * (ไฟล์นี้ถูกต่อรวมเป็น closure เดียวกับไฟล์อื่น — ไม่ต้อง import/export · ลำดับไฟล์ดู build.config.mjs)
   * ========================================================================== */

  document.querySelectorAll('[data-go-home]').forEach(
    b =>
      (b.onclick = () => {
        location.hash = 'home';
        setView('home');
      })
  );
  $('journalOpen').onclick = () => {
    location.hash = 'journal';
    setView('journal');
  };
  $('restOpen').onclick = () => {
    location.hash = 'rest';
    setView('rest');
  };
  $('settingsOpen').onclick = () => $('settingsBtn').click();
  $('writeOpen').onclick = () => {
    location.hash = 'home';
    setView('home');
    document.querySelector('.side').classList.toggle('open');
  };
  $('zoomPlus').onclick = () => sceneAPI?.zoom(0.8);
  $('zoomMinus').onclick = () => sceneAPI?.zoom(1.25);
  let speedMul = 10;
  const SPEEDS = [1, 10, 30, 100];
  $('speedBtn').onclick = () => {
    speedMul = SPEEDS[(SPEEDS.indexOf(speedMul) + 1) % SPEEDS.length];
    setSpeedBtnLabel(speedMul);
    $('speedBtn').setAttribute('aria-label', 'ความเร็วรถ ×' + speedMul + ' แตะเพื่อเปลี่ยน');
    if ($('speedLines')) $('speedLines').classList.toggle('active', speedMul >= 30);
  };

  /* ============================================================================
   * src/app/19-stories.js
   * เรื่องเล่าระหว่างทาง (STORIES), ป๊อปอัป และปุ่มเปิด/ปิด
   * (ไฟล์นี้ถูกต่อรวมเป็น closure เดียวกับไฟล์อื่น — ไม่ต้อง import/export · ลำดับไฟล์ดู build.config.mjs)
   * ========================================================================== */

  let storiesOn = true;
  try {
    storiesOn = localStorage.getItem('road-of-days-stories') !== 'off';
  } catch (e) {}
  function storyLabel() {
  $('storyToggle').innerHTML = '<svg><use href="#i-mountain"/></svg><span>เรื่องเล่าระหว่างทาง: ' + (storiesOn ? 'เปิด' : 'ปิด') + '</span>';
  }
  storyLabel();
  const STORIES = [
    {
      t: 0.08,
      v: [
        ['ออกเดินทางแล้ว', 'เปิดกระจกสักนิด ให้ลมเช้าพัดความเร่งรีบออกไปทีละน้อย'],
        ['เพลงในรถ', 'วันนี้ลองเลือกเพลงที่ทำให้คิดถึงใครสักคนอย่างอบอุ่น']
      ]
    },
    {
      t: 0.23,
      v: [
        [
          'เชียงแสน · เมืองริมโขง',
          'เมืองเก่าริมแม่น้ำโขงที่มีวัดโบราณมากมาย ลองนึกถึงสถานที่เก่า ๆ ที่ทำให้ใจเย็นลง'
        ],
        ['เชียงแสน · ถึงริมน้ำ', 'จากนี้ถนนจะเคียงข้างแม่น้ำโขงไปอีกไกล ปล่อยให้สายน้ำช่วยกำหนดจังหวะวันนี้']
      ]
    },
    {
      t: 0.36,
      v: [
        ['ทุ่งข้างทาง', 'ถ้าเห็นทุ่งโล่ง ลองหายใจลึก ๆ สามครั้ง แล้วปล่อยเรื่องที่แบกไว้ให้ลอยไปกับลม'],
        ['จุดแวะเล็ก ๆ', 'บางวันเราไม่ต้องไปถึงไหน แค่แวะดูท้องฟ้าก็พอ']
      ]
    },
    {
      t: 0.45,
      v: [
        ['ริมโขง · ภูเขาซ้อนชั้น', 'ภูเขาซ้อนกันเป็นชั้น เหมือนวันเก่า ๆ ที่ยังอยู่ตรงนั้นเสมอ'],
        ['ริมโขง · หมอกบาง', 'ลองนึกถึงวันที่ใจเบาที่สุด แล้วเก็บความรู้สึกนั้นไว้ในกล่องความทรงจำ']
      ]
    },
    {
      t: 0.5,
      v: [
        ['ครึ่งทางแล้ว', 'คุณขับมาแล้วราว 68 กม. ดื่มน้ำสักอึก แล้วไปต่อแบบไม่ต้องรีบ'],
        ['ครึ่งทางแล้ว', 'อีกราว 68 กม. จะถึงเวียงแก่น เรื่องที่ยังไม่มีคำตอบ ปล่อยให้เป็นของวันพรุ่งนี้ได้']
      ]
    },
    {
      t: 0.66,
      v: [
        ['เชียงของ · ริมโขง', 'สายน้ำไหลช้าบอกให้รู้ว่า ไม่ต้องรีบก็ถึงได้'],
        ['เชียงของ · แสงเย็น', 'แสงริมน้ำช่วงเย็นทำให้ทุกอย่างอ่อนลง ลองถ่ายภาพด้วยใจไว้สักภาพ']
      ]
    },
    {
      t: 0.78,
      v: [
        [
          'ห้วยเอียน · จุดชมวิว',
          'ช่วงเชียงของไปเวียงแก่นมีจุดชมวิวริมโขง มองเห็นแนวเขาฝั่งลาวขนานไปกับถนน ลองแวะมองไกล ๆ สักครู่'
        ],
        [
          'เกาะแก่งในแม่น้ำโขง',
          'ก้อนหินกลางน้ำยืนนิ่งให้สายน้ำไหลผ่านมาหลายปี เราเองก็ปล่อยให้บางเรื่องผ่านไปได้'
        ]
      ]
    },
    {
      t: 0.86,
      v: [
        ['ใกล้ถึงแล้ว', 'ถนนช่วงนี้เงียบลง เหมาะกับการขอบคุณตัวเองที่เดินทางมาถึงตรงนี้'],
        ['ลมเย็นขึ้น', 'ลองเขียนบันทึกสั้น ๆ สักบรรทัดถึงตัวเองของวันนี้']
      ]
    },
    {
      t: 0.97,
      v: [
        ['เวียงแก่น · ปลายทาง', 'ถึงแล้ว ไม่ต้องรีบไปไหนอีก ให้ใจได้พักตามจังหวะของมันเอง'],
        ['เวียงแก่น · พักใจ', 'เก็บวันนี้ไว้ในกล่องความทรงจำ แล้วค่อยเริ่มต้นใหม่เมื่อพร้อม']
      ]
    },
    {
      t: 1.06,
      v: [
        ['เลยเวียงแก่นมาแล้ว', 'ถนนยังทอดต่อไปเรื่อย ๆ ไม่มีเส้นชัยให้ต้องรีบ ขับไปตามจังหวะที่สบายใจ'],
        ['ทางต่อไป', 'วันนี้ไม่มีปลายทาง มีแค่ถนน ลม และเวลาของเรา']
      ]
    },
    {
      t: 1.15,
      v: [
        ['ทุ่งนาเขียวขจี', 'ข้าวไหวเป็นคลื่นตามลม ลองปล่อยสายตาให้พักไปตามขอบฟ้า'],
        ['กลิ่นดินกลิ่นข้าว', 'หายใจลึก ๆ ให้กลิ่นทุ่งนาช่วยเก็บความเหนื่อยออกไป']
      ]
    },
    {
      t: 1.27,
      v: [
        ['วัดริมทาง', 'ยอดเจดีย์สีทองรับแสงอยู่ไกล ๆ ลองขอบคุณวันนี้เงียบ ๆ ในใจ'],
        ['ร่มไม้หน้าวัด', 'บางที่ไม่ต้องแวะ แค่ผ่านไปช้า ๆ ใจก็สงบลงได้']
      ]
    },
    {
      t: 1.43,
      v: [
        ['หนองน้ำนิ่ง ๆ', 'ผิวน้ำเรียบ มีบัวลอยเบา ๆ เหมือนใจที่ค่อย ๆ นิ่งลง'],
        ['ริมหนองน้ำ', 'ถ้าวันนี้ใจขุ่น ลองปล่อยให้ตกตะกอนเหมือนน้ำนิ่ง ๆ ตรงนี้']
      ]
    },
    {
      t: 1.55,
      v: [
        ['ชาวบ้านริมทาง', 'ใครสักคนยกมือทักทายจากข้างทาง ลองยิ้มตอบให้โลกใบนี้บ้าง'],
        ['ตลาดข้างทาง', 'กลิ่นผลไม้สดลอยมาตามลม วันธรรมดาก็อร่อยได้']
      ]
    },
    {
      t: 1.62,
      v: [
        ['วัดอีกแห่ง', 'เสียงลมพัดกระดิ่งเบา ๆ ทำให้ใจช้าลงตามไปด้วย'],
        ['เจดีย์ทอง', 'แสงเย็นบนยอดเจดีย์ ทำให้ทุกอย่างอ่อนโยนลง']
      ]
    },
    {
      t: 1.72,
      v: [
        ['หนองบัว', 'บัวชมพูบานอยู่เงียบ ๆ โดยไม่ต้องให้ใครมอง ลองเป็นแบบนั้นบ้าง'],
        ['น้ำนิ่งอีกครั้ง', 'ที่ไหนก็มีมุมสงบ ถ้าเราขับช้าพอ']
      ]
    },
    {
      t: 1.85,
      v: [
        ['วนกลับมาอีกรอบ', 'ถนนวนกลับมาเริ่มใหม่ได้เสมอ ไม่ต้องรีบจบวัน'],
        ['ต้นทางอีกครั้ง', 'ขับต่อได้อีกนานเท่าที่ใจอยากไป']
      ]
    }
  ];
  $('sceneCard').appendChild($('storyPop'));
  let storyTimer;
  function hideStory() {
    $('storyPop').classList.remove('show');
    clearTimeout(storyTimer);
  }
  function showStory(title, text, entryId) {
    $('storyTitle').textContent = title;
    $('storyText').textContent = text;
    const rd = $('storyRead');
    rd.hidden = !entryId;
    rd.onclick = entryId
      ? () => {
          hideStory();
          openReader(entryId);
        }
      : null;
    $('storyPop').classList.add('show');
    clearTimeout(storyTimer);
    storyTimer = setTimeout(hideStory, 4500);
  }
  const st = u => T0 + ((u - 0.02) / 0.96) * (T1 - T0);
  function storyCheck(a, b) {
    if (!storiesOn) return;
    const day = Math.floor((Date.now() - new Date().getTimezoneOffset() * 60000) / 864e5);
    let hit = null;
    for (const s of STORIES)
      if (st(s.t) > a && st(s.t) <= b) {
        const v = s.v[day % s.v.length];
        hit = [v[0], v[1], null];
      }
    for (const e of state.entries)
      if (typeof e.routeT === 'number' && e.routeT > a && e.routeT <= b)
        hit = [
          'ความทรงจำของคุณ · ' + e.title,
          'ผ่านจุดที่คุณวางกล่องความทรงจำไว้ (' + prettyDate(e.date) + ')',
          e.id
        ];
    if (hit) showStory(hit[0], hit[1], hit[2]);
  }
  $('storyX').onclick = hideStory;
  $('storyToggle').onclick = () => {
    storiesOn = !storiesOn;
    try {
      localStorage.setItem('road-of-days-stories', storiesOn ? 'on' : 'off');
    } catch (e) {}
    storyLabel();
    if (!storiesOn) hideStory();
  };

  /* ============================================================================
   * src/app/20-memory-peek-bubble.js
   * การ์ดทบทวนความทรงจำสุ่ม (peek), แผงด้านข้างบนมือถือ และฟองอารมณ์ลอย
   * (ไฟล์นี้ถูกต่อรวมเป็น closure เดียวกับไฟล์อื่น — ไม่ต้อง import/export · ลำดับไฟล์ดู build.config.mjs)
   * ========================================================================== */

  let peekId = null,
    peekTimer;
  function peekRender() {
    const list = state.entries || [],
      t = $('memPeekTitle'),
      x = $('memPeekText'),
      l = $('memPeekLabel'),
      m = $('memPeekMain'),
      sh = $('memPeekShuffle');
    if (!list.length) {
      peekId = null;
      l.textContent = 'ยินดีต้อนรับกลับมา';
      t.textContent = 'ไม่ต้องรีบ ค่อย ๆ ขับไปด้วยกัน';
      x.textContent = 'เมื่อพร้อม ลองวางกล่องความทรงจำใบแรกไว้ริมทาง';
      m.disabled = true;
      sh.hidden = true;
      return;
    }
    m.disabled = false;
    sh.hidden = list.length < 2;
    const pool = list.length > 1 ? list.filter(e => e.id !== peekId) : list,
      e = pool[Math.floor(Math.random() * pool.length)];
    peekId = e.id;
    l.textContent = 'ความทรงจำที่สุ่มมาให้ · ' + prettyDate(e.date);
    t.textContent = e.title || 'ความทรงจำไม่มีชื่อ';
    const body = String(e.text || '')
      .replace(/\s+/g, ' ')
      .trim();
    x.textContent = body.length > 70 ? body.slice(0, 70) + '…' : body;
  }
  function peekSwap() {
    const box = $('memPeek');
    box.classList.add('fade');
    setTimeout(() => {
      peekRender();
      box.classList.remove('fade');
    }, 350);
  }
  function peekRestart() {
    clearInterval(peekTimer);
    peekTimer = setInterval(() => {
      if (!document.hidden) peekSwap();
    }, 15000);
  }
  $('memPeekMain').onclick = () => {
    if (peekId) openReader(peekId);
  };
  $('memPeekShuffle').onclick = () => {
    peekSwap();
    peekRestart();
  };
  peekRender();
  peekRestart();
  $('sheetClose').onclick = () => document.querySelector('.side').classList.remove('open');
  document.addEventListener('pointerdown', e => {
    const side = document.querySelector('.side');
    if (side.classList.contains('open') && !side.contains(e.target) && !$('fab').contains(e.target))
      side.classList.remove('open');
  });
  let bubId = null,
    bubTimer,
    bubHideTimer; // เพิ่มตัวแปรสำหรับตั้งเวลาเฟดออก

  function bubRender() {
    const b = $('moodBubble'),
      list = state.entries || [];
    let e = null;
    if (list.length) {
      const pool = list.length > 1 ? list.filter(x => x.id !== bubId) : list;
      e = pool[Math.floor(Math.random() * pool.length)];
    }
    bubId = e ? e.id : null;
    const m = e ? moodOf(e.mood) : moods[0];
    b.style.setProperty('--mc', m.color);
    $('bubUse').setAttribute('href', '#i-' + m.icon);
    $('bubLabel').textContent = e ? m.label : 'วันนี้เป็นยังไงบ้าง';
    $('bubDate').textContent = e ? prettyDate(e.date) : 'แตะเพื่อเขียนบันทึก';
    
    // 1. แสดงฟองขึ้นมา
    b.hidden = false;
    requestAnimationFrame(() => b.classList.remove('fade'));

    // 2. ตั้งเวลาซ่อนตัวเองใน 7 วินาที เพื่อไม่ให้บังวิว
    clearTimeout(bubHideTimer);
    bubHideTimer = setTimeout(() => {
      b.classList.add('fade');
      // เมื่อเฟดออกเสร็จ (ประมาณ 400ms) ให้ซ่อน element ไปเลยเพื่อไม่ให้ขวางการคลิก
      setTimeout(() => { 
        if (b.classList.contains('fade')) b.hidden = true; 
      }, 500);
    }, 7000);
  }

  $('moodBubble').onclick = () => {
    if (bubId) openReader(bubId);
    else $('writeOpen').click();
    
    // ซ่อนทันทีเมื่อผู้ใช้แตะอ่าน
    $('moodBubble').classList.add('fade');
    setTimeout(() => { $('moodBubble').hidden = true; }, 400);
  };

  // เริ่มต้นมาให้ซ่อนไว้ก่อน ปล่อยให้รถขับไปโล่งๆ
  $('moodBubble').classList.add('fade');
  $('moodBubble').hidden = true;

  // หน่วงเวลาให้ปรากฏครั้งแรกหลังจากเริ่มขับรถไปแล้ว 5 วินาที
  setTimeout(() => {
    if (!document.hidden) bubRender();
  }, 5000);

  // วนลูปให้ปรากฏขึ้นมาใหม่เบาๆ ทุกๆ 28 วินาที
  clearInterval(bubTimer);
  bubTimer = setInterval(() => {
    if (!document.hidden) bubRender();
  }, 28000);

  /* ============================================================================
   * src/app/21-dock-fab.js
   * ตำแหน่ง dock ด้านล่างฉาก และปุ่มลัดลอย (FAB)
   * (ไฟล์นี้ถูกต่อรวมเป็น closure เดียวกับไฟล์อื่น — ไม่ต้อง import/export · ลำดับไฟล์ดู build.config.mjs)
   * ========================================================================== */

  {
    const dockEl = document.querySelector('.scene-bottom'),
      setDock = () => {
        const r = dockEl.getBoundingClientRect();
        if (r.height > 0)
          document.documentElement.style.setProperty('--dock', Math.round(innerHeight - r.top) + 'px');
      };
    setDock();
    addEventListener('resize', setDock);
    if (window.ResizeObserver) new ResizeObserver(setDock).observe(dockEl);
  }
  const fab = $('fab'),
    fabPanel = $('fabPanel'),
    fabBtn = $('fabBtn');
  function fabSet(o) {
    fabPanel.hidden = !o;
    fab.classList.toggle('open', o);
    fabBtn.setAttribute('aria-expanded', String(o));
  }
  fabBtn.onclick = e => {
    e.stopPropagation();
    fabSet(fabPanel.hidden);
  };
  fabPanel.addEventListener('click', e => {
    if (e.target.closest('[data-keep]')) return;
    if (e.target.closest('button')) fabSet(false);
  });
  document.addEventListener('click', e => {
    if (!fab.contains(e.target)) fabSet(false);
  });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') fabSet(false);
  });



  // --- ลูกเล่นพิเศษ: กลีบดอกไม้/ใบไม้ร่วงปลิวตามลม (เปลี่ยนสีตามปุ่ม UI แบบเรียลไทม์) ---
  function initPetals() {
    const container = document.getElementById('petals');
    if (!container) return;

    let gustTimer = null;
    function createPetalGust(isManualTrigger = false) {
      clearTimeout(gustTimer);
      if (document.hidden && !isManualTrigger) {
        gustTimer = setTimeout(() => createPetalGust(false), 10000);
        return;
      }

      // ถ้านิ้วกดเปลี่ยนฤดู ให้ล้างกลีบสีเก่าออกก่อน แล้วโปรยสีใหม่ทันที
      if (isManualTrigger) container.replaceChildren();
      
      let curMonth = new Date().getMonth();
      if (window.manualSeasonIndex === 1) curMonth = 3;       // ฤดูร้อน
      else if (window.manualSeasonIndex === 2) curMonth = 7;  // ฤดูฝน
      else if (window.manualSeasonIndex === 3) curMonth = 11; // ฤดูหนาว

      let petalColors = ['#ffb3c6', '#ff8da1']; // หนาว: ชมพูพญาเสือโคร่ง
      if (curMonth >= 5 && curMonth <= 9) {
        petalColors = ['#ff7043', '#ff5722'];   // ฝน: ส้มแดงหางนกยูง
      } else if (curMonth >= 2 && curMonth <= 4) {
        petalColors = ['#ffee58', '#fdd835'];   // ร้อน: เหลืองทองราชพฤกษ์
      }

      const petalCount = 10 + Math.floor(Math.random() * 8);
      for (let i = 0; i < petalCount; i++) {
        const petal = document.createElement('div');
        petal.className = 'petal';
        petal.style.background = `linear-gradient(135deg, ${petalColors[0]}, ${petalColors[1]})`;
        
        const size = 6 + Math.random() * 6;
        petal.style.width = size + 'px';
        petal.style.height = (size * 1.2) + 'px';
        petal.style.left = (Math.random() * 100) + 'vw';
        
        const duration = 4 + Math.random() * 4;
        petal.style.animationDuration = duration + 's';
        petal.style.animationDelay = (isManualTrigger ? Math.random() * 0.8 : Math.random() * 2.5) + 's';
        petal.style.setProperty('--dx', (Math.random() * 500 - 250) + 'px');
        petal.style.setProperty('--rot', (Math.random() * 720) + 'deg');
        
        container.appendChild(petal);
        setTimeout(() => {
          if (petal.parentNode) petal.remove();
        }, (duration + 3) * 1000);
      }
      gustTimer = setTimeout(() => createPetalGust(false), 30000 + Math.random() * 45000);
    }

    // เปิดให้ปุ่มกดเปลี่ยนฤดูกาลเรียกโปรยกลีบดอกไม้ได้ทันที
    window.triggerSeasonPetals = () => createPetalGust(true);
    gustTimer = setTimeout(() => createPetalGust(false), 5000);
  }
 

  async function init3D() {
    /* ============================================================================
     * src/scene/01-renderer-setup.js
     * โหลด three.js จาก CDN, ตั้งระดับคุณภาพกราฟิก และสร้าง WebGLRenderer
     * (ไฟล์นี้ถูกต่อรวมเป็น closure เดียวกับไฟล์อื่น — ไม่ต้อง import/export · ลำดับไฟล์ดู build.config.mjs)
     * ========================================================================== */

    let THREE;
    try {
      THREE = await import('https://cdn.jsdelivr.net/npm/three@0.170.0/build/three.module.js');
    } catch (e) {
      $('loading').innerHTML =
        '<p>ยังโหลดฉาก 3D ไม่สำเร็จ</p><p style="font-size:11px">เชื่อมต่ออินเทอร์เน็ตแล้วโหลดหน้าใหม่<br>คุณยังเขียนบันทึกและใช้มุมพักใจได้ตามปกติ</p>';
      return;
    }
    // ป้องกันและซ่อมแซม Geometry ที่อาจมีพิกัด NaN หรือไม่มี vertex (count === 0) ไม่ให้ computeBoundingSphere พัง
    const _origComputeBS = THREE.BufferGeometry.prototype.computeBoundingSphere;
    THREE.BufferGeometry.prototype.computeBoundingSphere = function () {
      const pos = this.attributes && this.attributes.position;
      if (!pos || !pos.count) {
        if (!this.boundingSphere) this.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 0);
        else { this.boundingSphere.center.set(0, 0, 0); this.boundingSphere.radius = 0; }
        return;
      }
      if (pos.array) {
        const arr = pos.array;
        let hasNan = false;
        for (let i = 0; i < arr.length; i++) {
          if (isNaN(arr[i]) || !isFinite(arr[i])) { arr[i] = 0; hasNan = true; }
        }
        if (hasNan) pos.needsUpdate = true;
      }
      try {
        _origComputeBS.call(this);
      } catch (_) {}
      if (!this.boundingSphere) {
        this.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 1);
      } else if (isNaN(this.boundingSphere.radius) || !isFinite(this.boundingSphere.radius)) {
        this.boundingSphere.center.set(0, 0, 0);
        this.boundingSphere.radius = 1;
      }
    };
    if (THREE.InstancedMesh) {
      const _origInstCBS = THREE.InstancedMesh.prototype.computeBoundingSphere;
      THREE.InstancedMesh.prototype.computeBoundingSphere = function () {
        try {
          _origInstCBS.call(this);
        } catch (_) {}
        if (!this.boundingSphere) this.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 1);
        else if (isNaN(this.boundingSphere.radius) || !isFinite(this.boundingSphere.radius)) {
          this.boundingSphere.center.set(0, 0, 0);
          this.boundingSphere.radius = 1;
        }
      };
    }
    const host = $('sceneCard'),
      coarsePointer = matchMedia('(pointer:coarse)').matches,
      cores = navigator.hardwareConcurrency || 4,
      memory = navigator.deviceMemory || 4,
      initialQuality =
        cores <= 2 || memory <= 2
          ? 0 // 0: ต่ำมาก
          : cores <= 4 || memory <= 4
            ? 1 // 1: ต่ำ
            : 2; // เริ่มปานกลาง เพราะจำนวนคอร์และ RAM ไม่ได้บอกกำลัง GPU โดยตรง
    let qualityLevel = initialQuality,
      activeQuality = -1,
      qualitySampleMs = 0,
      qualityFrameMs = 0,
      qualityFrames = 0,
      qualitySlowMs = 0,
      qualityStableMs = 0,
      nearPerformanceHotspot = false,
      performanceHotspotLabel = '',
      renderer;
    try {
      const powerPreference =
        state.gpuPreference === 'low-power' ? 'low-power' : state.gpuPreference === 'high-performance' ? 'high-performance' : 'default';
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference });
    } catch (e) {
      $('loading').innerHTML =
        '<p>อุปกรณ์นี้ยังแสดง WebGL 3D ไม่ได้<br>ส่วนสมุดบันทึกและมุมพักใจยังใช้งานได้</p>';
      return;
    }
    renderer.setClearColor(0xc3dbd5);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.shadowMap.type = THREE.PCFShadowMap; // เปลี่ยนเป็นเงาแบบปกติ เบาเครื่องกว่ามาก
    renderer.domElement.setAttribute(
      'aria-label',
      'ฉากรถ EV สีครีมวิ่งบนถนนโค้งท่ามกลางต้นไม้ ภูเขา นก และสัตว์เล็กตามเส้นทางเชียงราย'
    );
    renderer.domElement.setAttribute('role', 'img');
    host.prepend(renderer.domElement);

    /* ============================================================================
     * src/scene/02-scene-lights-ground.js
     * สร้าง scene / camera / แสง, วัสดุหลัก (mat) และพื้นดินพร้อมลายหญ้า
     * (ไฟล์นี้ถูกต่อรวมเป็น closure เดียวกับไฟล์อื่น — ไม่ต้อง import/export · ลำดับไฟล์ดู build.config.mjs)
     * ========================================================================== */

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xc3dbd5);
    scene.fog = new THREE.Fog(0xc3dbd5, 37, 110);
    const camera = new THREE.PerspectiveCamera(40, 1, 0.3, 560);
    const ambient = new THREE.HemisphereLight(0xfffae7, 0x7d9265, 2.6);
    scene.add(ambient);
    const sunLight = new THREE.DirectionalLight(0xffefd5, 3.2);
    sunLight.position.set(-15, 30, 20);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.set(coarsePointer ? 512 : 1024, coarsePointer ? 512 : 1024);
    Object.assign(sunLight.shadow.camera, { left: -22, right: 22, top: 22, bottom: -22, near: 2, far: 80 });
    sunLight.shadow.bias = -0.0006;
    sunLight.shadow.normalBias = 0.035;
    scene.add(sunLight);
    // ปิดการวาดแผ่นเงาใบไม้จำลอง 80x80m ทับซ้อนกับเงาต้นไม้จริง เพื่อลดภาระ Alpha-Test Shadow Pass ทุกเฟรม
    const canopyTex = { offset: { x: 0, y: 0 } };
    const canopyMesh = new THREE.Object3D();
    canopyMesh.visible = false;
    const mat = (c, more = {}) =>
  new THREE.MeshLambertMaterial({ color: c, flatShading: true, ...more }); // ลบ roughness ออกเพราะ Lambert ไม่ใช้
    /* ===== หญ้า/กกพลิ้วไหว: นาฬิกาลมกลาง + วัสดุโยกตามลม + กอหญ้าใบโค้งเรียว (ไม่มีทรงกรวย/กระบอก) ===== */
    const SWAY_T = { value: 0 };
    function swayMat(amp) {
      const m = new THREE.MeshLambertMaterial({ vertexColors: true, side: THREE.DoubleSide });
      m.onBeforeCompile = sh => {
        sh.uniforms.uSwayT = SWAY_T;
        sh.uniforms.uSwayA = { value: amp };
        sh.vertexShader = sh.vertexShader
          .replace('#include <common>', '#include <common>\nuniform float uSwayT;\nuniform float uSwayA;')
          .replace(
            '#include <begin_vertex>',
            'vec3 transformed = vec3(position);\n' +
              '#ifdef USE_INSTANCING\nvec4 swIp = instanceMatrix * vec4(0.,0.,0.,1.);\n#else\nvec4 swIp = vec4(0.);\n#endif\n' +
              'float swPh = swIp.x * .37 + swIp.z * .53;\n' +
              'float swB = max(position.y, 0.) * max(position.y, 0.) * uSwayA;\n' +
              'transformed.x += (sin(uSwayT * 1.9 + swPh) + .4 * sin(uSwayT * 3.7 + swPh * 1.7)) * swB;\n' +
              'transformed.z += cos(uSwayT * 1.5 + swPh * 1.3) * swB * .7;'
          );
        sh.fragmentShader = sh.fragmentShader.replace(
          '#include <normal_fragment_begin>',
          THREE.ShaderChunk.normal_fragment_begin.replace('gl_FrontFacing ? 1.0 : - 1.0', '1.0')
        );
      };
      return m;
    }
    function buildReedClusterGeo(cattail) {
      const pos = [], col = [], nor = [], idx = [];
      let vo = 0, sd = cattail ? 4242 : 9157;
      const rnd = () => ((sd = (sd * 16807) % 2147483647) - 1) / 2147483646;
      const ribbon = (S, fn) => {
        for (let s = 0; s <= S; s++) {
          const p = fn(s / S, s === S);
          pos.push(p.x - p.wx, p.y, p.z - p.wz, p.x + p.wx, p.y, p.z + p.wz);
          for (let k = 0; k < 2; k++) {
            col.push(p.c[0], p.c[1], p.c[2]);
            nor.push(p.nx, 0.8, p.nz);
          }
        }
        for (let s = 0; s < S; s++) {
          const a = vo + s * 2;
          idx.push(a, a + 1, a + 2, a + 1, a + 3, a + 2);
        }
        vo += (S + 1) * 2;
      };
      const nb = cattail ? 9 : 12;
      for (let b = 0; b < nb; b++) {
        const ang = (b / nb) * Math.PI * 2 + (rnd() - 0.5) * 0.7,
          h = 0.75 + rnd() * 0.8,
          bow = 0.22 + rnd() * 0.4,
          w = 0.035 + rnd() * 0.03,
          tw = ang + (rnd() - 0.5) * 1.3,
          ca = Math.cos(ang),
          sa = Math.sin(ang),
          wxs = -Math.sin(tw) * w,
          wzs = Math.cos(tw) * w,
          dark = 0.85 + rnd() * 0.3;
        ribbon(7, (u, tip) => {
          const r = bow * h * u * u + 0.015 * u,
            k = tip ? 0 : 1 - Math.pow(u, 1.5) * 0.9;
          return {
            x: ca * r, y: h * (u - 0.2 * u * u * u), z: sa * r,
            wx: wxs * k, wz: wzs * k,
            nx: ca * 0.35, nz: sa * 0.35,
            c: [(0.2 + 0.36 * u) * dark, (0.38 + 0.34 * u) * dark, (0.14 + 0.14 * u) * dark]
          };
        });
      }
      if (cattail) {
        // ก้านดอกกก + ช่อดอกกำมะหยี่ (ใบโป่งกลางเรียวหัวท้าย ไม่ใช่ทรงกระบอก)
        ribbon(4, (u, tip) => ({
          x: 0, y: 1.38 * u, z: 0.1 * u * u, wx: 0.014, wz: 0, nx: 0, nz: 0.3,
          c: [0.3 + 0.12 * u, 0.44 + 0.1 * u, 0.2]
        }));
        for (let p = 0; p < 2; p++) {
          const wx = p ? 0 : 1, wz = p ? 1 : 0;
          ribbon(6, (u, tip) => {
            const bulge = Math.sin(Math.PI * Math.min(1, u * 0.95 + 0.02)) * 0.042;
            return {
              x: 0, y: 1.0 + 0.36 * u, z: 0.1 * Math.pow((1.0 + 0.36 * u) / 1.38, 2),
              wx: wx * bulge, wz: wz * bulge, nx: 0, nz: 0.2,
              c: [0.36 - 0.1 * u, 0.22 - 0.05 * u, 0.12]
            };
          });
        }
      }
      const g = new THREE.BufferGeometry();
      g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
      g.setAttribute('color', new THREE.Float32BufferAttribute(col, 3));
      g.setAttribute('normal', new THREE.Float32BufferAttribute(nor, 3));
      g.setIndex(idx);
      g.computeBoundingSphere();
      return g;
    }

    const groundMat = mat(0xb1c49b),
      roadMat = mat(0x899587),
      edgeMat = mat(0xe1ddc7),
      treeMat = mat(0x78966d),
      treeMat2 = mat(0x90a07b),
      trunkMat = mat(0x9b8260),
      hillMat = mat(0x9cb592, { vertexColors: true }),
      hillFar = mat(0xb1c6ae, { vertexColors: true }),
      white = mat(0xfff4da),
      cream = mat(0xf5e9bd),
      glass = mat(0x638779),
      rubber = mat(0x3d4944),
      hub = mat(0xc8d3bd),
      orange = mat(0xd9ad70);
    {
      const gc = document.createElement('canvas');
      gc.width = gc.height = 256;
      const gx = gc.getContext('2d');
      gx.fillStyle = '#a6b58d';
      gx.fillRect(0, 0, 256, 256);
      let _s = 7;
      const _r = () => {
        _s = (_s * 16807) % 2147483647;
        return (_s - 1) / 2147483646;
      };
      for (let i = 0; i < 150; i++) {
        const px = _r() * 256,
          py = _r() * 256,
          rr = 14 + _r() * 30,
          lt = _r() < 0.5,
          a = 0.05 + _r() * 0.06;
        for (const ox of [-256, 0, 256])
          for (const oy of [-256, 0, 256]) {
            const g = gx.createRadialGradient(px + ox, py + oy, 0, px + ox, py + oy, rr);
            g.addColorStop(0, lt ? 'rgba(255,255,244,' + a * 1.6 + ')' : 'rgba(60,90,45,' + a + ')');
            g.addColorStop(1, 'rgba(255,255,255,0)');
            gx.fillStyle = g;
            gx.beginPath();
            gx.arc(px + ox, py + oy, rr, 0, 7);
            gx.fill();
          }
      }
      for (let i = 0; i < 2600; i++) {
        const px = _r() * 256,
          py = _r() * 256,
          an = -1.57 + (_r() - 0.5) * 1.4,
          l = 2 + _r() * 5;
        gx.strokeStyle = _r() < 0.55 ? 'rgba(55,95,40,.16)' : 'rgba(255,255,225,.2)';
        gx.lineWidth = 0.9;
        gx.beginPath();
        gx.moveTo(px, py);
        gx.lineTo(px + Math.cos(an) * l, py + Math.sin(an) * l);
        gx.stroke();
      }
      const gt = new THREE.CanvasTexture(gc);
      gt.wrapS = gt.wrapT = THREE.RepeatWrapping;
      gt.repeat.set(408, 408); // ขยายพื้นเป็น 2400 ม. ต้องเพิ่ม repeat ให้ลายหญ้าคงขนาดเดิม (170 ต่อ 1000 ม.)
      gt.colorSpace = THREE.SRGBColorSpace;
      gt.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());
      groundMat.map = gt;
    }
    const ground = new THREE.Mesh(new THREE.PlaneGeometry(2400, 2400), groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -0.12;
    ground.receiveShadow = true;
    scene.add(ground);

    /* ============================================================================
     * src/scene/03-route-road.js
     * เส้นทางถนนหลัก (CatmullRom + RouteX) และผิวถนน/ขอบถนน (strip)
     * (ไฟล์นี้ถูกต่อรวมเป็น closure เดียวกับไฟล์อื่น — ไม่ต้อง import/export · ลำดับไฟล์ดู build.config.mjs)
     * ========================================================================== */

    const route0 = new THREE.CatmullRomCurve3(
      [
        new THREE.Vector3(-52, 0, 52),
        new THREE.Vector3(-42, 0, 44),
        new THREE.Vector3(-30, 0, 38),
        new THREE.Vector3(-20, 0, 28),
        new THREE.Vector3(-8, 0, 20),
        new THREE.Vector3(4, 0, 12),
        new THREE.Vector3(16, 0, 4),
        new THREE.Vector3(26, 0, -6),
        new THREE.Vector3(20, 0, -18),
        new THREE.Vector3(6, 0, -23),
        new THREE.Vector3(0, 0, -30),
        new THREE.Vector3(2, 0, -41),
        new THREE.Vector3(22, 0, -48),
        new THREE.Vector3(38, 0, -54),
        new THREE.Vector3(54, 0, -58),
        new THREE.Vector3(66, 0, -52),
        new THREE.Vector3(78, 0, -38),
        new THREE.Vector3(82, 0, -14),
        new THREE.Vector3(76, 0, 12),
        new THREE.Vector3(62, 0, 34),
        new THREE.Vector3(42, 0, 50),
        new THREE.Vector3(16, 0, 62),
        new THREE.Vector3(-12, 0, 68),
        new THREE.Vector3(-43, 0, 71),
        new THREE.Vector3(-54, 0, 61)
      ],
      true
    );
    const EXTP = [
        [38, -54],
        [54, -58],
        [86, -46],
        
        [200, -20],    // เข้าสู่โซน 1: ทุ่งนา
        [350, 50],     
        [450, 200],    // เข้าสู่โซน 2: ข้าวโพด
        [400, 350],    
        [250, 400],    // เข้าสู่โซน 3: สวนผลไม้
        [100, 350],    
        [30, 300],     // จุดต่อกับถนนขึ้นดอย (t = T_ROUTE_EXT_START) — ทิศทางต่อเนื่องกับ routeF
        [-10, 250]     // จุดควบคุมปลายโค้ง (ไม่ใช่จุดที่รถวิ่งผ่าน) ล็อกทิศทางให้ราบเรียบ
    ].map(q => new THREE.Vector3(q[0], 0, q[1])),
      routeE = new THREE.CatmullRomCurve3(EXTP, false),
      nE = EXTP.length - 1;
    /* ถนนขึ้นดอยผาตั้ง (routeF) + ถนนไปภูชี้ฟ้าและวนกลับ (routeG)
     * ออกแบบเป็นเส้นโค้งเดียวต่อเนื่อง: ไม่หักศอก ไม่ตัดกับถนนสายอื่น ไม่ซ้อนทับถนนเดิม
     * และไปบรรจบถนนหลักด้วยมุมแคบ ๆ ที่ (42, 50) ให้รถเลี้ยวเข้าถนนหลักได้อย่างเป็นธรรมชาติ */
    const routeF = new THREE.CatmullRomCurve3([
      new THREE.Vector3(30, 0, 300),
      new THREE.Vector3(-10, 0, 250),
      new THREE.Vector3(-30, 0, 190),
      new THREE.Vector3(-15, 0, 135),
      new THREE.Vector3(35, 0, 108),
      new THREE.Vector3(110, 0, 102),
      new THREE.Vector3(190, 0, 102)
    ], false);
    const routeG = new THREE.CatmullRomCurve3([
      new THREE.Vector3(190, 0, 102),
      new THREE.Vector3(245, 0, 104),
      new THREE.Vector3(280, 0, 84),
      new THREE.Vector3(262, 0, 58),
      new THREE.Vector3(210, 0, 52),
      new THREE.Vector3(160, 0, 52),
      new THREE.Vector3(115, 0, 52),
      new THREE.Vector3(78, 0, 48),
      new THREE.Vector3(42, 0, 50)
    ], false);
    class RouteX extends THREE.Curve {
      getPoint(t, o = new THREE.Vector3()) {
        t = ((t % 1) + 1) % 1;
        if (t <= 0.56) return route0.getPoint(t, o);
        if (t <= T_ROUTE_EXT_START)
          return routeE.getPoint((1 + ((t - 0.56) / 0.36) * (nE - 2)) / nE, o);
        if (t <= T3) return routeF.getPoint((t - T_ROUTE_EXT_START) / (T3 - T_ROUTE_EXT_START), o);
        if (t <= T_ROUTE_RETURN_END) return routeG.getPoint((t - T3) / (T_ROUTE_RETURN_END - T3), o);
        return route0.getPoint(
          T_ROUTE_RETURN_JOIN + ((t - T_ROUTE_RETURN_END) / (1 - T_ROUTE_RETURN_END)) * (1 - T_ROUTE_RETURN_JOIN),
          o
        );
      }
    }
    const route = new RouteX();
    // ให้แผนที่ (ที่วาดนอกฉาก 3D) ดึงเส้นทางจริงไปวาด จะได้ตรงกับถนนในฉากทุกช่วง
    window.__ROD_ROUTE_XZ = t => {
      const p = route.getPoint(t);
      return [p.x, p.z];
    };
    function strip(width, y, material) {
      const verts = [],
        indices = [],
        N = coarsePointer ? 1800 : 4200; // ถนนยาวขึ้นหลังต่อเส้นทางขึ้นดอย: เพิ่มท่อนถนนให้ขอบโค้งเนียน ไม่เป็นเหลี่ยม
      for (let i = 0; i <= N; i++) {
        const p = route.getPoint(i / N),
          t = route.getTangent(i / N),
          n = new THREE.Vector3(-t.z, 0, t.x);
        for (let sign of [-1, 1]) {
          const v = p.clone().addScaledVector(n, (width / 2) * sign);
          verts.push(v.x, p.y + y, v.z);
        }
        if (i < N) {
          let a = 2 * i;
          indices.push(a, a + 1, a + 2, a + 1, a + 3, a + 2);
        }
      }
      let g = new THREE.BufferGeometry();
      g.setAttribute('position', new THREE.Float32BufferAttribute(verts, 3));
      g.setIndex(indices);
      g.computeVertexNormals();
      const mesh = new THREE.Mesh(g, material);
      mesh.material.side = THREE.DoubleSide;
      mesh.receiveShadow = true;
      scene.add(mesh);
      return mesh;
    }
    strip(6.8, -0.06, edgeMat);
    strip(6.2, -0.03, roadMat);

    /* ===== ถนนเปียกฝน: สีถนนเข้มขึ้น + น้ำขังบางจุดแบบห่างกันเป็นธรรมชาติ ค่อยๆ เฟดเข้า-ออกตามปริมาณฝน ===== */
    const wetRoad = { level: 0, last: -1, col: new THREE.Color(), puddles: null, info: [], dm: new THREE.Object3D() };
    {
      // ลายแอ่งน้ำ: ซ้อนวงไล่ขอบหลายก้อนให้รูปร่างไม่เป็นวงรีเป๊ะ แล้วคลุมขอบด้วยมาสก์วงกลมให้เนียนหาย
      const cv = document.createElement('canvas');
      cv.width = cv.height = 256;
      const x = cv.getContext('2d');
      let sd = 77;
      const pr = () => ((sd = (sd * 16807) % 2147483647) - 1) / 2147483646;
      for (let b = 0; b < 7; b++) {
        const bx = 128 + (pr() - 0.5) * 80,
          by = 128 + (pr() - 0.5) * 44,
          r = 38 + pr() * 32;
        const g = x.createRadialGradient(bx, by, r * 0.12, bx, by, r);
        g.addColorStop(0, 'rgba(86,108,126,0.92)');
        g.addColorStop(0.55, 'rgba(94,116,134,0.68)');
        g.addColorStop(1, 'rgba(100,122,140,0)');
        x.fillStyle = g;
        x.fillRect(0, 0, 256, 256);
      }
      x.globalCompositeOperation = 'source-atop';
      const hl = x.createLinearGradient(0, 70, 0, 150);
      hl.addColorStop(0, 'rgba(210,228,240,0.35)');
      hl.addColorStop(1, 'rgba(210,228,240,0)');
      x.fillStyle = hl;
      x.fillRect(0, 0, 256, 256); // แสงสะท้อนฟ้าด้านบนแอ่ง
      x.globalCompositeOperation = 'destination-in';
      const mk = x.createRadialGradient(128, 128, 20, 128, 128, 126);
      mk.addColorStop(0, 'rgba(0,0,0,1)');
      mk.addColorStop(0.7, 'rgba(0,0,0,0.9)');
      mk.addColorStop(1, 'rgba(0,0,0,0)');
      x.fillStyle = mk;
      x.fillRect(0, 0, 256, 256);
      const tex = new THREE.CanvasTexture(cv);
      tex.anisotropy = 4;
      const maxPuddles = coarsePointer ? 14 : 24,
        pg = new THREE.PlaneGeometry(1, 1).rotateX(-Math.PI / 2),
        pm = new THREE.MeshBasicMaterial({
          map: tex,
          transparent: true,
          opacity: 0,
          depthWrite: false,
          polygonOffset: true,
          polygonOffsetFactor: -2,
          polygonOffsetUnits: -2
        });
      // สุ่มตำแหน่งแอ่งน้ำตามสัดส่วนความยาวถนนจริง และบังคับระยะห่างขั้นต่ำ 46 เมตร ไม่ให้กระจุกตัวช่วงจันจว้า-เวียงแก่น
      for (let attempt = 0; attempt < 240 && wetRoad.info.length < maxPuddles; attempt++) {
        const u = pr(),
          // ช่วง t 0.02..0.55 ยาว ~380m (22% ของถนนรวม) ช่วง 0.55..0.95 ยาว ~1,450m (78% ของถนนรวม)
          t = u < 0.22 ? 0.025 + (u / 0.22) * 0.525 : 0.55 + ((u - 0.22) / 0.78) * 0.41,
          p = route.getPoint(t),
          tg = route.getTangent(t),
          off = (pr() - 0.5) * 4.0,
          wx = p.x - tg.z * off,
          wz = p.z + tg.x * off;
        if (wetRoad.info.some(q => (q.x - wx) * (q.x - wx) + (q.z - wz) * (q.z - wz) < 46 * 46)) continue;
        const len = 1.6 + pr() * 2.8,
          wid = Math.max(0.65, Math.min(0.85 + pr() * 1.15, (2.9 - Math.abs(off)) * 2));
        wetRoad.info.push({
          x: wx,
          y: p.y + 0.0,
          z: wz,
          yaw: Math.atan2(-tg.z, tg.x) + (pr() - 0.5) * 0.25,
          len,
          wid,
          th: pr() * 0.72 // ระดับฝนที่แอ่งนี้เริ่มปรากฏ (บางแอ่งมาก่อน บางแอ่งมาทีหลัง)
        });
      }
      const NP = wetRoad.info.length;
      const inst = new THREE.InstancedMesh(pg, pm, NP);
      for (let k = 0; k < NP; k++) {
        wetRoad.dm.position.set(0, -10, 0);
        wetRoad.dm.scale.setScalar(0.001);
        wetRoad.dm.updateMatrix();
        inst.setMatrixAt(k, wetRoad.dm.matrix);
      }
      inst.frustumCulled = false;
      inst.visible = false;
      inst.renderOrder = 2;
      scene.add(inst);
      wetRoad.puddles = inst;
      wetRoad.puddleMat = pm;
    }
    function updateWetRoad(dt) {
      const rainNow = window.RODENV ? window.RODENV.rain() : 0,
        target = rainNow > 0.04 ? Math.min(1, 0.3 + rainNow * 0.9) : 0,
        k = target > wetRoad.level ? 0.35 : 0.07; // เปียกเร็ว แห้งช้า
      wetRoad.level += (target - wetRoad.level) * Math.min(1, dt * k);
      if (wetRoad.level < 0.002) wetRoad.level = 0;
      const w = wetRoad.level,
        night = state.night;
      // สีถนนเข้มขึ้นเมื่อเปียก (ให้ lerp ต่อใน animate จึงเฟดนุ่ม)
      wetRoad.col.copy(night ? _cRoadNight : _cRoadDay).multiplyScalar(1 - 0.32 * w);
      const pi = wetRoad.puddles;
      pi.visible = w > 0.01;
      wetRoad.puddleMat.opacity = Math.min(1, w * 1.45) * 0.85;
      wetRoad.puddleMat.color.setScalar(night ? 0.35 : 1);
      if (Math.abs(w - wetRoad.last) > 0.003) {
        wetRoad.last = w;
        const dm = wetRoad.dm;
        for (let i = 0; i < wetRoad.info.length; i++) {
          const q = wetRoad.info[i],
            u = Math.max(0, Math.min(1, (w - q.th) / 0.3)),
            sm = u * u * (3 - 2 * u); // smoothstep: แอ่งค่อยๆ ขยายขึ้นมา
          dm.position.set(q.x, q.y + 0.004, q.z);
          dm.rotation.set(0, q.yaw, 0);
          dm.scale.set(Math.max(0.001, q.len * sm), 1, Math.max(0.001, q.wid * sm));
          dm.updateMatrix();
          pi.setMatrixAt(i, dm.matrix);
        }
        pi.instanceMatrix.needsUpdate = true;
      }
    }

    /* ============================================================================
     * src/scene/05-basic-shapes.js
     * ตัวสร้างรูปทรงพื้นฐาน box / sphere
     * (ไฟล์นี้ถูกต่อรวมเป็น closure เดียวกับไฟล์อื่น — ไม่ต้อง import/export · ลำดับไฟล์ดู build.config.mjs)
     * ========================================================================== */

    // สร้างแม่แบบแค่ชิ้นเดียว ประหยัด RAM และ CPU มหาศาล
    const _baseBox = new THREE.BoxGeometry(1, 1, 1);
    const _baseSphere10 = new THREE.SphereGeometry(1, 10, 7);
    const _baseSphere24 = new THREE.SphereGeometry(1, 24, 14);
    
    function box(w, h, d, material, x = 0, y = 0, z = 0, parent = scene) {
      let m = new THREE.Mesh(_baseBox, material);
      m.position.set(x, y, z);
      m.scale.set(w, h, d); // ใช้วิธียืดหดแทนการสร้าง Geometry ใหม่
      
      // ทริคสำคัญ: ของชิ้นเล็กหรือแผ่นพื้นแบนๆ ไม่ต้องสร้างเงาตกกระทบ
      m.castShadow = h > 0.22 && (w > 0.45 || h > 0.5 || d > 0.45);
      m.receiveShadow = true;
      
      parent.add(m);
      return m;
    }
    function sphere(r, material, x, y, z, parent = scene, segments = 10) {
      let m = new THREE.Mesh(segments > 14 ? _baseSphere24 : _baseSphere10, material);
      m.position.set(x, y, z);
      m.scale.setScalar(r);
      parent.add(m);
      return m;
    }

    // รวมเส้นประกลางถนนเป็น InstancedMesh ชิ้นเดียว (ลด Draw Calls) — วางตามระยะทางจริง (arc-length) ทุก 0.76 ม.
    // เดิมวางตามค่า t เท่ากันทุกช่วง ทำให้ถนนช่วงใหม่ที่ยาวกว่ามีเส้นขาดห่างเป็นช่วง ๆ ไม่ต่อเนื่องกับถนนเดิม
    {
      const SAMP = 9000,
        arcT = new Float32Array(SAMP + 1),
        arcL = new Float32Array(SAMP + 1);
      let prev = route.getPoint(0),
        acc = 0;
      for (let i = 0; i <= SAMP; i++) {
        const q = route.getPoint(i / SAMP);
        if (i) acc += Math.hypot(q.x - prev.x, q.z - prev.z);
        arcT[i] = i / SAMP;
        arcL[i] = acc;
        prev = q;
      }
      const SPACING = 0.76,
        dashCount = Math.max(1, Math.floor(acc / SPACING) - 1),
        dashInst = new THREE.InstancedMesh(_baseBox, white, dashCount),
        dmDash = new THREE.Object3D();
      let si = 0;
      for (let i = 1; i <= dashCount; i++) {
        const target = i * SPACING;
        while (si < SAMP - 1 && arcL[si + 1] < target) si++;
        const span = arcL[si + 1] - arcL[si] || 1,
          t = arcT[si] + ((target - arcL[si]) / span) * (arcT[si + 1] - arcT[si]),
          p = route.getPoint(t),
          tangent = route.getTangent(t);
        dmDash.position.set(p.x, p.y + 0.006, p.z);
        dmDash.rotation.set(0, Math.atan2(tangent.x, tangent.z), 0);
        dmDash.scale.set(0.12, 0.015, 0.67);
        dmDash.updateMatrix();
        dashInst.setMatrixAt(i - 1, dmDash.matrix);
      }
      dashInst.instanceMatrix.needsUpdate = true;
      dashInst.castShadow = false;
      dashInst.receiveShadow = true;
      dashInst.frustumCulled = false;
      scene.add(dashInst);
    }

    /* ============================================================================
     * src/scene/08-placement-utils.js
     * ตัวสุ่มแบบกำหนดค่า (rand), โซนห้ามวางของ (spotOK) และ offRoad สำหรับวางของริมถนน
     * (ไฟล์นี้ถูกต่อรวมเป็น closure เดียวกับไฟล์อื่น — ไม่ต้อง import/export · ลำดับไฟล์ดู build.config.mjs)
     * ========================================================================== */

    let seed = 27;
    function rand() {
      seed = (seed * 16807) % 2147483647;
      return (seed - 1) / 2147483646;
    }
    const LANE = 1.55,
      ROAD_HALF = 3.4,
      n0 = new THREE.Vector3(),
      routePts = [];
    for (let i = 0; i <= 3000; i++) {
      const q = route.getPoint(i / 3000);
      routePts.push(q.x, q.z);
    }
    const taken = [];
    function spotOK(x, z, r) {
      const lim = (ROAD_HALF + r) ** 2;
      for (let i = 0; i < routePts.length; i += 2) {
        const dx = routePts[i] - x,
          dz = routePts[i + 1] - z;
        if (dx * dx + dz * dz < lim) return false;
      }
      for (const o of taken) {
        const dx = o[0] - x,
          dz = o[1] - z,
          rr = o[2] + r;
        if (dx * dx + dz * dz < rr * rr) return false;
      }
      return true;
    }
    function offRoad(t, off) {
      const p = route.getPoint(t),
        tn = route.getTangent(t);
      return { p, tn, x: p.x - tn.z * off, z: p.z + tn.x * off };
    }

    /* แม่น้ำสายกว้างไหลเลียบหลังสวนผลไม้ (ฝั่งนอกโค้งถนน t ≈ 0.712–0.802)
     * จองพื้นที่ไว้ตั้งแต่ต้น เพื่อให้ภูเขา ต้นไม้ แปลงเกษตร และเสาสัญญาณไม่ถูกวางทับลงในแม่น้ำ */
    const RIVER_T0 = 0.710,
      RIVER_T1 = 0.806,
      RIVER_PTS = [];
    {
      const coreA = 0.732,
        coreB = 0.785;
      const prof = t => {
        let s = 0;
        if (t < coreA) s = (coreA - t) / (coreA - RIVER_T0);
        else if (t > coreB) s = (t - coreB) / (RIVER_T1 - coreB);
        s = Math.min(1, s);
        return -(22.5 + 45 * s * s); // ขยับเข้าใกล้ถนนเหลือ ~22.5 ม. (ริมตลิ่งห่างไหล่ทางเพียง ~7–10 ม.) ให้ชมวิวแม่น้ำและเรือแล่นข้างทางได้ชัดเจนจากในรถ
      };
      for (let t = RIVER_T0; t <= RIVER_T1 + 1e-9; t += 0.0008) {
        const o = offRoad(t, prof(t)),
          w = 11.8 + Math.sin(t * 410) * 1.2 + Math.sin(t * 157 + 1.3) * 0.6; // ครึ่งความกว้าง ~10.5–13.6 ม. (กว้างรวม ~21–27 ม.)
        RIVER_PTS.push({ x: o.x, z: o.z, w, px: o.p.x, pz: o.p.z });
      }
      for (let i = 0; i < RIVER_PTS.length; i += 2) {
        const q = RIVER_PTS[i];
        taken.push([q.x, q.z, q.w + 3]);
      }
    }

    /* หนองน้ำใหญ่โซนสวนมะพร้าว (ฝั่งในโค้งถนน t ≈ 0.860–0.910)
     * จองพื้นที่ไว้ตั้งแต่ต้น เว้นระยะห่างจากขอบถนนอย่างปลอดภัย (ขอบตลิ่งห่างกึ่งกลางถนน ~5.4 ม., ขอบน้ำ ~7.6 ม.) ไม่ทับถนน 100% */
    const WETLAND_T0 = 0.860,
      WETLAND_T1 = 0.910,
      WETLAND_PTS = [];
    {
      const N_W = 44;
      for (let i = 0; i <= N_W; i++) {
        const theta = (i / N_W) * Math.PI,
          u = (1 - Math.cos(theta)) * 0.5,
          sinT = Math.sin(theta),
          t = WETLAND_T0 + u * (WETLAND_T1 - WETLAND_T0),
          off = 19.6 + (1 - sinT) * 1.8, // ห่างกึ่งกลางถนน 19.6–21.4 ม. ให้หนองน้ำอยู่ชิดริมทางสวยงามแต่ไม่ทับถนน
          o = offRoad(t, off),
          w = Math.max(0.85, sinT * (11.6 + Math.sin(theta * 3) * 0.9 + Math.cos(theta * 5 + 0.7) * 0.45));
        WETLAND_PTS.push({ x: o.x, z: o.z, w, px: o.p.x, pz: o.p.z, u, t, theta });
      }
      for (let i = 0; i < WETLAND_PTS.length; i++) {
        const q = WETLAND_PTS[i];
        taken.push([q.x, q.z, q.w + 2.8]);
      }
    }

    /* ============================================================================
     * src/scene/09-shape-helpers.js
     * ตัวช่วยสร้างรูปทรง ball / cyl และวัสดุ sm2
     * (ไฟล์นี้ถูกต่อรวมเป็น closure เดียวกับไฟล์อื่น — ไม่ต้อง import/export · ลำดับไฟล์ดู build.config.mjs)
     * ========================================================================== */

    const SPH = new THREE.SphereGeometry(1, 8, 6),
      _cylCache = {},
      sm2 = c => new THREE.MeshLambertMaterial({ color: c });
    function ball(r, m, x, y, z, p, sx = 1, sy = 1, sz = 1) {
      const s = new THREE.Mesh(SPH, m);
      s.position.set(x, y, z);
      s.scale.set(r * sx, r * sy, r * sz);
      s.castShadow = r > 0.22; // ปิดเงาของลูกผลไม้/ชิ้นส่วนเล็กๆ ลดภาระการ์ดจอได้มหาศาล
      s.receiveShadow = r > 0.12;
      p.add(s);
      return s;
    }
    function cyl(r1, r2, h, m, x, y, z, p, rx = 0, rz = 0) {
      // แคช CylinderGeometry เพื่อไม่ต้องสร้าง BufferGeometry ซ้ำหลายพันชิ้น
      const key = r1.toFixed(3) + '_' + r2.toFixed(3) + '_' + h.toFixed(3);
      const geo = _cylCache[key] || (_cylCache[key] = new THREE.CylinderGeometry(r1, r2, h, 6));
      const s = new THREE.Mesh(geo, m);
      s.position.set(x, y, z);
      s.rotation.set(rx, 0, rz);
      
      // เปิดเงาเฉพาะเสา/ลำต้นขนาดใหญ่ ปิดเงากิ่งไม้เล็กๆ ต้นข้าวโพด แขนคน ฯลฯ
      s.castShadow = (r1 > 0.13 && h > 0.5);
      
      p.add(s);
      return s;
    }

    /* ============================================================================
     * src/scene/10-road-signs.js
     * ป้ายริมทาง: ป้ายบอกทาง ป้ายเตือน ป้ายจำกัดความเร็ว หลักกิโลเมตร
     * (ไฟล์นี้ถูกต่อรวมเป็น closure เดียวกับไฟล์อื่น — ไม่ต้อง import/export · ลำดับไฟล์ดู build.config.mjs)
     * ========================================================================== */

    /* roadside signs */
    const FONT = '"Noto Sans Thai","Sarabun",sans-serif',
      EN = {
        janjawa: 'Chan Chawa',
        chiangsaen: 'Chiang Saen',
        chiangkhong: 'Chiang Khong',
        wiangkaen: 'Wiang Kaen'
      };
    function signTex(w, h, draw) {
      const cv = document.createElement('canvas');
      cv.width = w;
      cv.height = h;
      const c = cv.getContext('2d'),
        tex = new THREE.CanvasTexture(cv);
      tex.colorSpace = THREE.SRGBColorSpace;
      tex.anisotropy = 4;
      const go = () => {
        c.setTransform(1, 0, 0, 1, 0, 0);
        c.clearRect(0, 0, w, h);
        draw(c, w, h);
        tex.needsUpdate = true;
      };
      go();
      if (document.fonts) document.fonts.ready.then(go);
      return tex;
    }
    const rr = (c, x, y, w, h, r) => {
      c.beginPath();
      if (c.roundRect) c.roundRect(x, y, w, h, r);
      else c.rect(x, y, w, h);
    };
    function destTex(th, en, l3) {
      return signTex(512, 256, (c, w, h) => {
        c.fillStyle = '#fff';
        rr(c, 4, 4, w - 8, h - 8, 22);
        c.fill();
        c.fillStyle = '#1f7a4d';
        rr(c, 14, 14, w - 28, h - 28, 16);
        c.fill();
        c.fillStyle = '#fff';
        c.textAlign = 'center';
        c.font = '700 70px ' + FONT;
        c.fillText(th, w / 2, 110);
        c.font = '500 36px ' + FONT;
        c.fillText(en, w / 2, 160);
        c.font = '700 48px ' + FONT;
        c.fillText(l3, w / 2, 222);
      });
    }
    function warnTex(kind, s) {
      return signTex(256, 256, (c, w, h) => {
        c.translate(w / 2, h / 2);
        c.rotate(Math.PI / 4);
        c.fillStyle = '#fff';
        rr(c, -86, -86, 172, 172, 14);
        c.fill();
        c.fillStyle = '#f5c518';
        rr(c, -78, -78, 156, 156, 10);
        c.fill();
        c.strokeStyle = '#222';
        c.lineWidth = 7;
        rr(c, -78, -78, 156, 156, 10);
        c.stroke();
        c.rotate(-Math.PI / 4);
        if (kind === 'curve') {
          c.scale(s, 1);
          c.strokeStyle = '#222';
          c.fillStyle = '#222';
          c.lineWidth = 16;
          c.lineCap = 'round';
          c.beginPath();
          c.moveTo(-22, 62);
          c.quadraticCurveTo(-22, -12, 30, -30);
          c.stroke();
          c.beginPath();
          c.moveTo(22, -66);
          c.lineTo(66, -32);
          c.lineTo(20, -6);
          c.closePath();
          c.fill();
        } else if (kind === 'buffalo') {
          c.fillStyle = '#222';
          c.strokeStyle = '#222';
          c.lineCap = 'round';
          // ลำตัวและหัวควายชนบท
          c.beginPath();
          c.ellipse(6, 4, 34, 21, 0, 0, Math.PI * 2);
          c.fill();
          c.beginPath();
          c.ellipse(-28, -6, 15, 13, -0.2, 0, Math.PI * 2);
          c.fill();
          // เขาควายโค้งกว้าง
          c.lineWidth = 7;
          c.beginPath();
          c.moveTo(-26, -15);
          c.quadraticCurveTo(-48, -36, -14, -40);
          c.stroke();
          // ขา 4 ข้าง
          c.lineWidth = 8;
          for (const lx of [-18, -6, 16, 28]) {
            c.beginPath();
            c.moveTo(lx, 18);
            c.lineTo(lx, 44);
            c.stroke();
          }
        } else if (kind === 'deer') {
          c.fillStyle = '#222';
          c.strokeStyle = '#222';
          c.lineCap = 'round';
          // ลำตัวกวางกระโดดและคอระหง
          c.beginPath();
          c.ellipse(4, 6, 28, 15, -0.15, 0, Math.PI * 2);
          c.fill();
          c.lineWidth = 10;
          c.beginPath();
          c.moveTo(-16, 0);
          c.lineTo(-26, -22);
          c.stroke();
          c.beginPath();
          c.ellipse(-30, -24, 11, 8, -0.2, 0, Math.PI * 2);
          c.fill();
          // เขากวาง
          c.lineWidth = 4.5;
          c.beginPath();
          c.moveTo(-26, -28);
          c.lineTo(-20, -46);
          c.moveTo(-23, -38);
          c.lineTo(-12, -40);
          c.stroke();
          // ขาเพรียว
          c.lineWidth = 6;
          for (const [x0, y0, x1, y1] of [[-14, 14, -28, 42], [-4, 16, -8, 44], [16, 12, 26, 42], [24, 10, 38, 36]]) {
            c.beginPath();
            c.moveTo(x0, y0);
            c.lineTo(x1, y1);
            c.stroke();
          }
        } else {
          c.textAlign = 'center';
          c.font = '92px sans-serif';
          c.fillText(kind, 0, 32);
        }
      });
    }
    function speedTex(v) {
      return signTex(256, 256, (c, w, h) => {
        c.fillStyle = '#fff';
        c.beginPath();
        c.arc(128, 128, 120, 0, 7);
        c.fill();
        c.strokeStyle = '#d33';
        c.lineWidth = 22;
        c.beginPath();
        c.arc(128, 128, 106, 0, 7);
        c.stroke();
        c.fillStyle = '#222';
        c.textAlign = 'center';
        c.font = '800 100px ' + FONT;
        c.fillText(v, 128, 162);
      });
    }
    function kmTex(k) {
      return signTex(128, 192, (c, w, h) => {
        c.fillStyle = '#fff';
        rr(c, 2, 2, w - 4, h - 4, 14);
        c.fill();
        c.fillStyle = '#1f7a4d';
        rr(c, 8, 8, w - 16, 64, 10);
        c.fill();
        c.fillStyle = '#fff';
        c.textAlign = 'center';
        c.font = '700 36px ' + FONT;
        c.fillText('กม.', w / 2, 56);
        c.fillStyle = '#1f3b2d';
        c.font = '800 70px ' + FONT;
        c.fillText(k, w / 2, 144);
      });
    }
    function plate(tex, w, h, x, z, yaw, ph, one) {
      const g = new THREE.Group();
      g.position.set(x, 0, z);
      g.rotation.y = yaw;
      const pm = mat(0x8c9690);
      for (const s of one ? [0] : [-1, 1]) {
        const m = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.05, ph, 8), pm);
        m.position.set(s * w * 0.33, ph / 2, -0.04);
        m.castShadow = true;
        g.add(m);
      }
      const b = new THREE.Mesh(
        new THREE.PlaneGeometry(w, h),
        new THREE.MeshBasicMaterial({ map: tex, transparent: true, alphaTest: 0.05, side: THREE.DoubleSide })
      );
      b.position.y = ph - h / 2 + 0.05;
      g.add(b);
      scene.add(g);
      taken.push([x, z, 0.9]);
    }
    function put(t, off, tex, w, h, ph, one) {
      const o = offRoad(t, off);
      if (!spotOK(o.x, o.z, Math.abs(off) - ROAD_HALF - 0.25)) return;
      plate(tex, w, h, o.x, o.z, Math.atan2(-o.tn.x, -o.tn.z), ph, one);
    }
    ROUTE.forEach((s, i) => {
      put(
        i ? s.t - 0.008 : 0.045,
        i % 2 ? 5 : -4.9,
        destTex(s.name, EN[s.id], s.km ? 'กม. ' + s.km : 'ยินดีต้อนรับ'),
        2.5,
        1.25,
        2.5
      );
    });
    let lastCurve = -1;
    for (let t = 0.05; t < 0.995; t += 0.01) {
      const f1 = route.getTangent(t),
        f2 = route.getTangent(t + 0.03),
        dir = f1.x * f2.z - f1.z * f2.x;
      if (Math.abs(dir) > 0.3 && t - lastCurve > 0.28) {
        lastCurve = t;
        put(t - 0.025, -4.8, warnTex('curve', dir > 0 ? 1 : -1), 1.1, 1.1, 2.1, 1);
      }
    }
    [
      [0.38, 'buffalo', 4.9],
      [0.86, 'deer', 4.9]
    ].forEach(a => put(a[0], a[2], warnTex(a[1]), 1.1, 1.1, 2.1, 1));
    [
      [0.1, '60'],
      [0.62, '80']
    ].forEach(a => put(a[0], -4.8, speedTex(a[1]), 0.9, 0.9, 2.0, 1));
    for (let k = 0; k < 4; k++) {
      const t = 0.03 + k * 0.12;
      put(t, -3.95, kmTex(Math.round(kmAt(t))), 0.5, 0.75, 0.85, 1);
    }

    // --- ระบบเส้นนำสายตา: เสาไฟฟ้าและสายไฟ (Hypnotic Trailing Lines) ---
    const poleGeo = new THREE.CylinderGeometry(0.05, 0.08, 4.5, 6);
    poleGeo.translate(0, 2.25, 0);
    const poleMat = new THREE.MeshLambertMaterial({ color: 0x4a4a4a }); // ใช้ Lambert ลดหน่วง
    const polesInst = new THREE.InstancedMesh(poleGeo, poleMat, 260);
    const wireMat = new THREE.LineBasicMaterial({ color: 0x222222, transparent: true, opacity: 0.6 });
    
    // สร้าง Array สำหรับเก็บจุดสายไฟ 2 เส้น และข้อมูลช่วงสายไฟสำหรับให้นกเกาะ
    const wirePts1 = [];
    const wirePts2 = [];
    const wireSpans = [];
    const dmPole = new THREE.Object3D();
    
    let poleIdx = 0;
    let prevTop1 = null;
    let prevTop2 = null;
    for (let t = 0.05; t < 0.995; t += (t >= 0.92 ? 0.004 : 0.015)) { // วางเสาทุกๆ ระยะห่างที่สม่ำเสมอ (ถนนขึ้นดอยยาวกว่าต่อ t จึงถี่ขึ้น)
      if (poleIdx >= 260) break;
      const off = -6.2; // วางด้านซ้ายของถนน
      const o = offRoad(t, off);
      if (!spotOK(o.x, o.z, 0.3)) continue;
      
      dmPole.position.set(o.x, 0, o.z);
      dmPole.updateMatrix();
      polesInst.setMatrixAt(poleIdx++, dmPole.matrix);
      
      // กำหนดความสูงสายไฟ เส้นที่ 1 (บน) และ เส้นที่ 2 (ล่าง)
      const top1 = new THREE.Vector3(o.x, 4.3, o.z);
      const top2 = new THREE.Vector3(o.x, 3.9, o.z); // ต่ำลงมา 0.4 หน่วย
      
      if (prevTop1 && prevTop2) {
        // วาดส่วนโค้งสายไฟเส้นที่ 1
        const mid1 = new THREE.Vector3().addVectors(prevTop1, top1).multiplyScalar(0.5);
        mid1.y -= 0.7; 
        const curve1 = new THREE.QuadraticBezierCurve3(prevTop1, mid1, top1);
        const pts1 = curve1.getPoints(8);
        wirePts1.push(...pts1);

        // วาดส่วนโค้งสายไฟเส้นที่ 2
        const mid2 = new THREE.Vector3().addVectors(prevTop2, top2).multiplyScalar(0.5);
        mid2.y -= 0.7; 
        const curve2 = new THREE.QuadraticBezierCurve3(prevTop2, mid2, top2);
        const pts2 = curve2.getPoints(8);
        wirePts2.push(...pts2);

        if (prevTop1.distanceToSquared(top1) < 2200) {
          wireSpans.push({
            pts1,
            pts2,
            cx: mid1.x,
            cz: mid1.z,
            yaw: Math.atan2(top1.x - prevTop1.x, top1.z - prevTop1.z)
          });
        }
      }
      prevTop1 = top1;
      prevTop2 = top2;
    }
    polesInst.count = poleIdx;
    scene.add(polesInst);
    
    // นำสายไฟทั้ง 2 เส้นใส่เข้าไปในฉาก
    const wires1 = new THREE.Line(new THREE.BufferGeometry().setFromPoints(wirePts1), wireMat);
    const wires2 = new THREE.Line(new THREE.BufferGeometry().setFromPoints(wirePts2), wireMat);
    scene.add(wires1);
    scene.add(wires2);

    /* ============================================================================
     * src/scene/11-trees.js
     * ต้นไม้ริมทาง (tree, blob) และการสุ่มวางต้นไม้
     * (ไฟล์นี้ถูกต่อรวมเป็น closure เดียวกับไฟล์อื่น — ไม่ต้อง import/export · ลำดับไฟล์ดู build.config.mjs)
     * ========================================================================== */


    // =========================================================
    // 🎯 วางโมเดลพิเศษ (7-11 และ โรงเรียน)
    // =========================================================
    window.customModels = []; // เปลี่ยนชื่อตัวแปรให้ครอบคลุมโมเดลทั้งหมด
    if (window.ROD_Models) {
      
      // --- วาง 7-11 ตามจุดที่ต้องการ (เฉพาะช่วงต้นทาง — เอาสาขาแถวหนองน้ำออกตามคำขอ) ---
      const sevenSpots = [0.016];
      sevenSpots.forEach(t => {
        const sd = -1; // สร้างฝั่งซ้ายของถนน
        const o = offRoad(t, sd * 9.5); 
        taken.push([o.x, o.z, 8.5]); // จองพื้นที่
        const faceRoadRot = Math.atan2(sd * o.tn.z, -sd * o.tn.x);
        const sev = window.ROD_Models.createSevenEleven(THREE, scene, o.x, o.z, faceRoadRot);
        window.customModels.push(sev);
      });

      // --- วางโรงเรียน 2 แห่ง (ทุ่งนา และ สวนผลไม้) ---
      const schoolSpots = [
        T_SCHOOL_FIELD, // ขยับพ้นแนวถนนวนกลับ
        0.81  // โซนสวนผลไม้
      ]; 
      schoolSpots.forEach(t => {
        const sd = 1; // ให้โรงเรียนอยู่ฝั่งขวาของถนน (เพื่อไม่ให้บัง 7-11)
        // ถนนครึ่งเลนกว้าง 3.4 + ความลึกโรงเรียนถึงหน้าประตู 13.3 + เว้นไหล่ทาง 1.3 = 18.0 พอดีขอบถนน
        const o = offRoad(t, sd * 18.0);
        // จองพื้นที่รัศมี 21.0 (ครอบคลุมขนาดโรงเรียน 34x26 ไม่ให้ต้นไม้หรือแปลงผักสุ่มมาเกิดทับ)
        taken.push([o.x, o.z, 21.0]);
        // จองพื้นที่ฝั่งตรงข้ามถนนหน้าโรงเรียนสำหรับวางร้านค้าและรถเร่ขายของ
        const opp = offRoad(t, -6.5);
        taken.push([opp.x, opp.z, 9.5]);
        
        // ให้หน้าโรงเรียนหันเข้าหาถนน
        const faceRoadRot = Math.atan2(sd * o.tn.z, -sd * o.tn.x);
        const school = window.ROD_Models.createSchool(THREE, scene, o.x, o.z, faceRoadRot);
        window.customModels.push(school);
      });

    }


    /* trees: kept clear of the road */
    treeMat.flatShading = false;
    treeMat2.flatShading = false;
    const rt = (() => {
        let s = 555;
        return () => {
          s = (s * 16807) % 2147483647;
          return (s - 1) / 2147483646;
        };
      })(),
      bark = sm2(0x7d6648),
      barkD = sm2(0x5f4b36);

    // --- เปลี่ยนสีดอกไม้บานตามฤดูกาล ---
    const sysMonth = new Date().getMonth();
    let bloomColors = [0xf2b8c6, 0xf2d45c, 0xf7f0e4]; 
    if (sysMonth >= 5 && sysMonth <= 9) {
        bloomColors = [0xff5722, 0xe64a19, 0xff9800]; // ฤดูฝน: หางนกยูงฝรั่ง (แดง/ส้ม)
    } else if (sysMonth === 10 || sysMonth === 11 || sysMonth <= 1) {
        bloomColors = [0xf48fb1, 0xf8bbd0, 0xffcdd2]; // ฤดูหนาว: พญาเสือโคร่ง (ชมพู)
    } else {
        bloomColors = [0xffeb3b, 0xfdd835, 0xffb300]; // ฤดูร้อน: ราชพฤกษ์/ดอกคูน (เหลืองทอง)
    }
    const bloomM = bloomColors.map(c => sm2(c));

    // ประกาศตัวแปรใบไม้และฐานต้นไม้กลับมาให้ครบ (แก้อาการ leafGeo is not defined)
    const leafGeo = new THREE.IcosahedronGeometry(1, 0),
      discM = new THREE.MeshBasicMaterial({
        color: 0x2d4a36,
        transparent: true,
        opacity: 0.2,
        depthWrite: false
      }),
      discGeo = new THREE.CircleGeometry(1, 20),
      _pineConeGeo = new THREE.ConeGeometry(1, 1.05, 8),
      _pineTipGeo = new THREE.ConeGeometry(0.16, 0.5, 7);
    const TREE_BATCH_SIZE = 36,
      treeBatches = new Map();

    function blob(r, m, x, y, z, p, sy = 0.85, cast = false) {
      const s = new THREE.Mesh(leafGeo, m);
      s.position.set(x, y, z);
      s.scale.set(r * (0.88 + rt() * 0.24), r * sy, r * (0.88 + rt() * 0.24));
      s.rotation.set(rt() * 3, rt() * 3, rt() * 3);
      s.castShadow = cast;
      p.add(s);
      return s;
    }
    function tree(x, z, scale = 1) {
      const g = new THREE.Group();
      g.position.set(x, 0, z);
      g.scale.set(scale, scale * (0.9 + rt() * 0.35), scale);
      g.rotation.y = rand() * 6;
      const broad = rand() > 0.52,
        d = new THREE.Mesh(discGeo, discM);
      d.rotation.x = -Math.PI / 2;
      d.position.y = 0.02;
      d.scale.setScalar(broad ? 1.7 : 1.3);
      g.add(d);
      cyl(0.17, 0.27, 0.3, barkD, 0, 0.12, 0, g);
      cyl(0.1, 0.17, 1.5, trunkMat, 0, 0.75, 0, g);
      if (broad) {
        for (const a of [0, 2.1, 4.2])
          cyl(
            0.03,
            0.065,
            0.9,
            bark,
            Math.cos(a) * 0.3,
            1.75,
            Math.sin(a) * 0.3,
            g,
            Math.sin(a) * 0.7,
            -Math.cos(a) * 0.7
          );
        const f = rt() < 0.25 ? bloomM[Math.floor(rt() * 3)] : null,
          wd = 1 + rt() * 0.35;
        for (const q of [
          [1.05, 0, 2.0, 0, treeMat, true],
          [0.82, 0.6 * wd, 1.8, 0.18, treeMat, false],
          [0.8, -0.56 * wd, 1.75, -0.22, treeMat, false],
          [0.76, 0.08, 1.72, -0.6 * wd, treeMat, false],
          [0.74, -0.05, 1.68, 0.58, treeMat, false],
          [0.72, 0.24, 2.52, 0.1, treeMat2, false],
          [0.64, -0.26, 2.45, -0.1, treeMat2, false]
        ])
          blob(q[0], q[4], q[1], q[2], q[3], g, 0.85, q[5]);
        if (f)
          for (let i = 0; i < 4; i++) {
            const a = rt() * 6.28,
              h = 1.9 + rt() * 1.1,
              r = 0.8 + rt() * 0.3;
            ball(0.09, f, Math.cos(a) * r, h, Math.sin(a) * r, g);
          }
      } else {
        const tiers = 4 + Math.floor(rt() * 2),
          topY = 1.4 + tiers * 0.5;
        // หดความสูงของแกนลำต้นลง เพื่อไม่ให้แทงทะลุยอดใบสนออกมา
        cyl(0.045, 0.14, topY - 0.2, trunkMat, 0, (topY - 0.2) / 2, 0, g);
        cyl(0.14, 0.2, 0.5, barkD, 0, 0.25, 0, g);
        for (let j = 0; j < tiers; j++) {
          const r = 1.2 - j * (0.98 / tiers),
            c = new THREE.Mesh(_pineConeGeo, j % 2 ? treeMat2 : treeMat);
          c.position.set((rt() - 0.5) * 0.06, 1.45 + j * 0.5, (rt() - 0.5) * 0.06);
          c.scale.set(r, 1, r);
          c.rotation.y = rt() * 3;
          c.rotation.z = (rt() - 0.5) * 0.08;
          c.castShadow = j === 0;
          g.add(c);
        }
        const tip = new THREE.Mesh(_pineTipGeo, treeMat2);
        tip.position.y = 1.45 + tiers * 0.5 + 0.1;
        g.add(tip);
      }

      const tileX = Math.floor(x / TREE_BATCH_SIZE) * TREE_BATCH_SIZE + TREE_BATCH_SIZE / 2;
      const tileZ = Math.floor(z / TREE_BATCH_SIZE) * TREE_BATCH_SIZE + TREE_BATCH_SIZE / 2;
      g.updateMatrixWorld(true);
      g.traverse(mesh => {
        if (!mesh.isMesh) return;
        const key = [
          tileX,
          tileZ,
          mesh.geometry.uuid,
          mesh.material.uuid,
          mesh.castShadow ? 1 : 0,
          mesh.receiveShadow ? 1 : 0
        ].join(':');
        let batch = treeBatches.get(key);
        if (!batch) {
          batch = {
            geometry: mesh.geometry,
            material: mesh.material,
            tileX,
            tileZ,
            castShadow: mesh.castShadow,
            receiveShadow: mesh.receiveShadow,
            matrices: []
          };
          treeBatches.set(key, batch);
        }
        const matrix = mesh.matrixWorld.clone();
        matrix.elements[12] -= tileX;
        matrix.elements[14] -= tileZ;
        batch.matrices.push(matrix);
      });
    }

    // 0.3 ร้านกาแฟ Slow Bar ริมทาง (Drip Coffee Hut)
    if (window.ROD_Models && window.ROD_Models.createCoffeeHut) {
      const cofT = 0.36;
      const cofO = offRoad(cofT, -8.5);
      taken.push([cofO.x, cofO.z, 6]);
      window.ROD_Models.createCoffeeHut(THREE, scene, cofO.x, cofO.z, Math.atan2(cofO.tn.z, -cofO.tn.x));
    }

    // 0.4 สะพานชนบทคอนกรีตพร้อมคานข้าง ราวกันตก และหมุดสะท้อนแสง
    const bridgeT = 0.735;
    {
      const bridgeP = route.getPoint(bridgeT);
      const bridgeTn = route.getTangent(bridgeT);
      const bridge = new THREE.Group();
      bridge.position.set(bridgeP.x, 0, bridgeP.z);
      bridge.rotation.y = Math.atan2(bridgeTn.x, bridgeTn.z);

      const deckM = sm2(0x777d78);
      const concreteM = sm2(0xb9b8aa);
      const edgeM = sm2(0x8e958d);
      const railM = sm2(0x435b4c);
      const reflectorM = new THREE.MeshBasicMaterial({ color: 0xf3bd55 });

      // ยกคานและขอบพื้นไว้ต่ำกว่าผิวถนนเพื่อคงเส้นถนนและเครื่องหมายเดิมให้เห็น
      box(8.3, 0.28, 20, deckM, 0, -0.13, 0, bridge);
      for (const side of [-1, 1]) {
        box(0.42, 0.58, 19.2, concreteM, side * 3.82, 0.25, 0, bridge);
        box(0.28, 0.42, 18.8, edgeM, side * 4.18, -0.27, 0, bridge);
        box(0.18, 0.18, 19, railM, side * 4.05, 0.92, 0, bridge);
        box(0.12, 0.12, 19, railM, side * 4.05, 0.61, 0, bridge);

        for (let z = -8.4; z <= 8.41; z += 2.1) {
          box(0.16, 0.88, 0.18, railM, side * 4.05, 0.56, z, bridge);
          box(0.07, 0.14, 0.035, reflectorM, side * 3.61, 0.34, z, bridge);
        }
      }

      // แผ่นต่อพื้นและคิ้วหัวสะพานทั้งสองด้าน
      for (const z of [-9.7, 9.7]) {
        box(8.7, 0.1, 0.42, concreteM, 0, -0.01, z, bridge);
        box(8.7, 0.035, 0.08, sm2(0xd8d4c3), 0, 0.055, z, bridge);
      }
      scene.add(bridge);
    }

    // 0.5 อุโมงค์ต้นไม้: แนวต้นไม้สมมาตรและพุ่มไม้เชื่อมเป็นหลังคาเหนือถนน
    for (let tt = 0.30; tt <= 0.34; tt += 0.005) {
      const oL = offRoad(tt, -5.8);
      const oR = offRoad(tt, 5.8);
      tree(oL.x, oL.z, 1.22);
      tree(oR.x, oR.z, 1.22);
      taken.push([oL.x, oL.z, 1.8], [oR.x, oR.z, 1.8]);

      const p = route.getPoint(tt);
      const tn = route.getTangent(tt);
      const arch = new THREE.Group();
      arch.position.set(p.x, 0, p.z);
      arch.rotation.y = Math.atan2(tn.x, tn.z);

      const archCurve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(-5.4, 3.15, 0),
        new THREE.Vector3(-4.9, 4.35, 0),
        new THREE.Vector3(-3.8, 5.15, 0),
        new THREE.Vector3(-2.2, 5.65, 0),
        new THREE.Vector3(0, 5.85, 0),
        new THREE.Vector3(2.2, 5.65, 0),
        new THREE.Vector3(3.8, 5.15, 0),
        new THREE.Vector3(4.9, 4.35, 0),
        new THREE.Vector3(5.4, 3.15, 0)
      ]);
      arch.add(new THREE.Mesh(new THREE.TubeGeometry(archCurve, 20, 0.13, 5, false), barkD));

      for (let i = -4; i <= 4; i++) {
        const x = i * 1.12;
        const canopy = new THREE.Mesh(leafGeo, Math.abs(i) % 2 ? treeMat2 : treeMat);
        canopy.position.set(x, 5.25 - Math.abs(i) * 0.11, (i % 2) * 0.18);
        canopy.scale.set(0.92, 0.48, 0.68);
        canopy.rotation.y = i * 0.31 + tt * 17;
        canopy.castShadow = Math.abs(i) % 2 === 0;
        arch.add(canopy);
      }
      scene.add(arch);
    }

    for (let i = 0, n = 0; n < 240 && i < 3000; i++) {
      const t = 0.03 + rand() * 0.94;
      if (t > 0.55 && t < 0.96) continue; // ซ่อนต้นไม้ป่าในโซนที่ 1-4
      if (t >= 0.295 && t <= 0.345) {
        rand();
        rand();
        rand();
        continue; // เว้นพื้นที่ให้อุโมงค์ต้นไม้ที่จัดแนวไว้โดยคงลำดับการสุ่มเดิม
      }
      const sc = 0.65 + rand() * 0.9,
        o = offRoad(t, (rand() < 0.5 ? -1 : 1) * (4.6 + rand() * 15));
      if (!spotOK(o.x, o.z, 1.15 * sc + 0.5)) continue;
      // ลดความหนาแน่นต้นไม้ในช่วงจันจว้า-เวียงแก่นลง ~40% โดยคงลำดับ rand() เดิมไว้ 100%
      if (n % 5 === 1 || n % 5 === 3) {
        rand();
        rand();
        n++;
        continue;
      }
      taken.push([o.x, o.z, 0.85 * sc]);
      tree(o.x, o.z, sc);
      n++;
    }
    /* ทิวทัศน์ริมถนนขึ้นดอย/ภูชี้ฟ้า (t 0.92–0.995): ต้นไม้หนาแน่นขึ้น + หินก้อนใหญ่ + เสาหลักนำทางสะท้อนแสง
     * เดิมช่วงนี้ถูกข้ามไม่มีสิ่งใดตกแต่งเลย ทำให้ถนนใหม่โล่งและดูไม่สมจริง
     * ใช้ตัวสุ่มแยกต่างหาก จึงไม่กระทบตำแหน่งของที่วางไว้ก่อนหน้า */
    {
      let hs = 9173;
      const hr = () => ((hs = (hs * 16807) % 2147483647) - 1) / 2147483646;
      let hn = 0;
      for (let i = 0; i < 1800 && hn < 190; i++) {
        const t = 0.925 + hr() * 0.07,
          sc = 0.85 + hr() * 1.15,
          side = hr() < 0.5 ? -1 : 1,
          o = offRoad(t, side * (5.4 + hr() * hr() * 36));
        if (!spotOK(o.x, o.z, 1.15 * sc + 0.5)) continue;
        taken.push([o.x, o.z, 0.85 * sc]);
        tree(o.x, o.z, sc);
        hn++;
      }
      // หินก้อนใหญ่ริมไหล่ทางและตามเชิงเขา
      const rockGeo = new THREE.IcosahedronGeometry(1, 0),
        rockMat = new THREE.MeshLambertMaterial({ color: 0x8c8a82, flatShading: true }),
        rockList = [];
      for (let i = 0; i < 500 && rockList.length < 70; i++) {
        const t = 0.922 + hr() * 0.073,
          side = hr() < 0.5 ? -1 : 1,
          rs = 0.35 + hr() * hr() * 1.5,
          o = offRoad(t, side * (4.6 + hr() * 9));
        if (!spotOK(o.x, o.z, rs + 0.3)) continue;
        taken.push([o.x, o.z, rs]);
        rockList.push({ x: o.x, z: o.z, s: rs, ry: hr() * 6.28, sy: 0.55 + hr() * 0.4 });
      }
      if (rockList.length) {
        const rocks = new THREE.InstancedMesh(rockGeo, rockMat, rockList.length),
          dm = new THREE.Object3D();
        rockList.forEach((r, k) => {
          dm.position.set(r.x, r.s * r.sy * 0.55 - 0.1, r.z);
          dm.rotation.set(0, r.ry, 0);
          dm.scale.set(r.s * 1.2, r.s * r.sy, r.s);
          dm.updateMatrix();
          rocks.setMatrixAt(k, dm.matrix);
        });
        rocks.instanceMatrix.needsUpdate = true;
        rocks.castShadow = true;
        rocks.receiveShadow = true;
        rocks.computeBoundingSphere();
        scene.add(rocks);
      }
      // เสาหลักนำทางสีขาวพร้อมแถบสะท้อนแสงส้ม ปักขอบไหล่ทางทั้งสองข้าง
      const postList = [];
      for (let t = 0.921; t < 0.995; t += 0.0011) {
        for (const side of [-1, 1]) {
          const o = offRoad(t, side * 3.75);
          if (!spotOK(o.x, o.z, 0.1)) continue;
          postList.push({ x: o.x, z: o.z });
        }
      }
      if (postList.length) {
        const postGeo = new THREE.BoxGeometry(0.1, 0.95, 0.1).translate(0, 0.475, 0),
          bandGeo = new THREE.BoxGeometry(0.115, 0.14, 0.115).translate(0, 0.72, 0),
          posts = new THREE.InstancedMesh(postGeo, new THREE.MeshLambertMaterial({ color: 0xf2f2ec }), postList.length),
          bands = new THREE.InstancedMesh(
            bandGeo,
            new THREE.MeshLambertMaterial({ color: 0xff9a1f, emissive: 0x6b3500, emissiveIntensity: 0.6 }),
            postList.length
          ),
          dp = new THREE.Object3D();
        postList.forEach((p, k) => {
          dp.position.set(p.x, -0.06, p.z);
          dp.updateMatrix();
          posts.setMatrixAt(k, dp.matrix);
          bands.setMatrixAt(k, dp.matrix);
        });
        posts.instanceMatrix.needsUpdate = bands.instanceMatrix.needsUpdate = true;
        posts.computeBoundingSphere();
        bands.computeBoundingSphere();
        scene.add(posts);
        scene.add(bands);
      }
    }
    for (const batch of treeBatches.values()) {
      const instanced = new THREE.InstancedMesh(batch.geometry, batch.material, batch.matrices.length);
      instanced.position.set(batch.tileX, 0, batch.tileZ);
      instanced.castShadow = batch.castShadow;
      instanced.receiveShadow = batch.receiveShadow;
      for (let i = 0; i < batch.matrices.length; i++) {
        instanced.setMatrixAt(i, batch.matrices[i]);
      }
      instanced.instanceMatrix.needsUpdate = true;
      instanced.computeBoundingSphere();
      scene.add(instanced);
    }

    /* ============================================================================
     * src/scene/12-hills-fields.js
     * เนินเขา (HILLS) และการสุ่มตำแหน่งแปลงนา/ดอกไม้ (FLSP, FIELDS, PADS)
     * (ไฟล์นี้ถูกต่อรวมเป็น closure เดียวกับไฟล์อื่น — ไม่ต้อง import/export · ลำดับไฟล์ดู build.config.mjs)
     * ========================================================================== */

    const HILLS = [],
      hCen = [90, 40],
      HR = (() => {
        let q = 99;
        return () => {
          q = (q * 16807) % 2147483647;
          return (q - 1) / 2147483646;
        };
      })();
    const hClear = (x, z, r) => {
      const lim = (r + ROAD_HALF + 6) ** 2;
      for (let i = 0; i < routePts.length; i += 2) {
        const dx = routePts[i] - x,
          dz = routePts[i + 1] - z;
        if (dx * dx + dz * dz < lim) return false;
      }
      // ไม่วางภูเขาทับแม่น้ำและหนองน้ำใหญ่สวนมะพร้าว
      for (const q of RIVER_PTS) {
        const dx = q.x - x,
          dz = q.z - z,
          rr = r + q.w + 8;
        if (dx * dx + dz * dz < rr * rr) return false;
      }
      for (const q of WETLAND_PTS) {
        const dx = q.x - x,
          dz = q.z - z,
          rr = r + q.w + 8;
        if (dx * dx + dz * dz < rr * rr) return false;
      }
      return true;
    };

    // สร้างแม่แบบภูเขาโพลีกอน (Low-Poly Mountain Archetypes) เพียง 4 ชิ้นแชร์ร่วมกันทั้งฉาก (ใช้หน่วยความจำและ GPU น้อยกว่าทรงกลมเดิม 4 เท่า)
    const MTN_GEOS = (() => {
      let ms = 13579;
      const mr = () => {
        ms = (ms * 16807) % 2147483647;
        return (ms - 1) / 2147483646;
      };
      const geos = [];
      for (let k = 0; k < 4; k++) {
        const rings = 4,
          segs = 11,
          nRidges = 3 + (k % 3),
          phase = k * 1.57,
          subAng = k * 2.1 + 0.5,
          subX = Math.cos(subAng) * 0.36,
          subZ = Math.sin(subAng) * 0.36,
          grid = [[{ x: (mr() - 0.5) * 0.08, y: 1.0, z: (mr() - 0.5) * 0.08, hn: 1.0 }]];

        for (let ri = 1; ri <= rings; ri++) {
          const u = ri / rings,
            row = [];
          for (let si = 0; si < segs; si++) {
            const a = (si / segs) * Math.PI * 2 + (ri < rings ? (mr() - 0.5) * 0.24 : 0),
              lobe = 1 + 0.14 * Math.cos(a * nRidges + phase),
              rad = (ri < rings ? u * (0.92 + mr() * 0.14) : 1.0) * lobe,
              nx = Math.cos(a) * rad,
              nz = Math.sin(a) * rad;
            let yVal = 0,
              hn = 0;
            if (ri < rings) {
              const dMain = Math.hypot(nx, nz),
                dSub = Math.hypot(nx - subX, nz - subZ),
                h1 = Math.pow(Math.max(0, 1 - dMain * 0.88), 1.45),
                h2 = 0.65 * Math.pow(Math.max(0, 1 - dSub * 1.15), 1.7),
                ridge = 1 + 0.22 * Math.pow(0.5 + 0.5 * Math.cos(a * nRidges + phase), 1.4) * (1 - u * 0.5);
              hn = Math.min(1.0, Math.max(h1, h2 + h1 * 0.2) * ridge + (mr() - 0.5) * 0.06);
              yVal = hn;
            }
            row.push({ x: nx, y: yVal, z: nz, hn });
          }
          grid.push(row);
        }

        const pos = [],
          cols = [];
        const pushTri = (p1, p2, p3) => {
          pos.push(p1.x, p1.y, p1.z, p2.x, p2.y, p2.z, p3.x, p3.y, p3.z);
          const hAvg = (p1.hn + p2.hn + p3.hn) / 3,
            jit = (mr() - 0.5) * 0.07;
          let cr, cg, cb;
          if (hAvg < 0.28) {
            cr = 0.76 + hAvg * 0.35 + jit;
            cg = 0.86 + hAvg * 0.32 + jit;
            cb = 0.72 + hAvg * 0.28 + jit;
          } else if (hAvg < 0.7) {
            cr = 0.86 + (hAvg - 0.28) * 0.28 + jit;
            cg = 0.95 + (hAvg - 0.28) * 0.22 + jit;
            cb = 0.80 + (hAvg - 0.28) * 0.20 + jit;
          } else {
            cr = 0.98 + (hAvg - 0.7) * 0.25 + jit * 0.6;
            cg = 1.04 + (hAvg - 0.7) * 0.20 + jit * 0.6;
            cb = 0.88 + (hAvg - 0.7) * 0.18 + jit * 0.6;
          }
          for (let v = 0; v < 3; v++) cols.push(cr, cg, cb);
        };

        const topPt = grid[0][0],
          r1 = grid[1];
        for (let si = 0; si < segs; si++) pushTri(topPt, r1[si], r1[(si + 1) % segs]);
        for (let ri = 1; ri < rings; ri++) {
          const rA = grid[ri],
            rB = grid[ri + 1];
          for (let si = 0; si < segs; si++) {
            const sn = (si + 1) % segs;
            if ((ri + si) % 2 === 0) {
              pushTri(rA[si], rB[si], rA[sn]);
              pushTri(rA[sn], rB[si], rB[sn]);
            } else {
              pushTri(rA[si], rB[si], rB[sn]);
              pushTri(rA[si], rB[sn], rA[sn]);
            }
          }
        }
        const g = new THREE.BufferGeometry();
        g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
        g.setAttribute('color', new THREE.Float32BufferAttribute(cols, 3));
        g.computeVertexNormals();
        g.computeBoundingSphere();
        geos.push(g);
      }
      return geos;
    })();

    function addHill(x, z, r, sy, m) {
      const h = new THREE.Mesh(MTN_GEOS[HILLS.length & 3], m);
      h.position.set(x, -2, z);
      h.scale.set(r, r * sy * 1.15, r * 0.75);
      h.rotation.y = (HILLS.length * 1.7) % 6.283;
      scene.add(h);
      HILLS.push({ x, z, r, sy });
    }
    for (let i = 0, n = 0; n < 34 && i < 900; i++) {
      const an = HR() * 6.283,
        R = 100 + HR() * 130,
        r = 10 + HR() * 12,
        x = hCen[0] + Math.cos(an) * R,
        z = hCen[1] + Math.sin(an) * R;
      if (!hClear(x, z, r)) continue;
      addHill(x, z, r, 0.5 + HR() * 0.55, n % 2 ? hillMat : hillFar);
      n++;
    }
    for (let i = 0; i < 30; i++) {
      const an = (i / 30) * 6.283 + HR() * 0.2,
        R = 290 + HR() * 70,
        r = 34 + HR() * 34,
        x = hCen[0] + Math.cos(an) * R,
        z = hCen[1] + Math.sin(an) * R * 0.9;
      if (!hClear(x, z, r)) continue;
      addHill(x, z, r, 0.6 + HR() * 0.7, i % 2 ? hillMat : hillFar);
    }
    // ภูเขาขนาบสองข้างถนนขึ้นดอยผาตั้ง–ภูชี้ฟ้า (ถนนช่วงนี้เดิมวิ่งผ่านที่ราบโล่ง ไม่มีเทือกเขาให้รู้สึกว่าขึ้นดอย)
    for (let i = 0, n = 0; n < 18 && i < 700; i++) {
      const t = 0.922 + HR() * 0.073,
        side = HR() < 0.5 ? -1 : 1,
        o = offRoad(t, side * (42 + HR() * 62)),
        r = 13 + HR() * 15;
      if (!hClear(o.x, o.z, r)) continue;
      if (HILLS.some(h => Math.hypot(h.x - o.x, h.z - o.z) < (h.r + r) * 0.6)) continue;
      addHill(o.x, o.z, r, 0.75 + HR() * 0.6, n % 2 ? hillMat : hillFar);
      n++;
    }
    const FLSP = [],
      FIELDS = [],
      PADS = [];
    for (let i = 0; i < 110; i++) {
      let t = rand(),
        p = route.getPoint(t),
        tan = route.getTangent(t),
        n = new THREE.Vector3(-tan.z, 0, tan.x);
      p.addScaledVector(n, (i % 2 ? 1 : -1) * (4 + rand() * 2.5));
      if (!spotOK(p.x, p.z, 0.2)) continue;
      FLSP.push([p.x, p.z, i]);
    }

    /* ============================================================================
     * src/scene/13-sky-clouds-sun-stars.js
     * เมฆ ดวงอาทิตย์ และดาวพื้นฐาน
     * (ไฟล์นี้ถูกต่อรวมเป็น closure เดียวกับไฟล์อื่น — ไม่ต้อง import/export · ลำดับไฟล์ดู build.config.mjs)
     * ========================================================================== */

    const clouds = [];
    const cloudMat = new THREE.MeshStandardMaterial({ color: 0xfff9ec, roughness: 1 });
    for (let i = 0; i < 8; i++) {
      let g = new THREE.Group();
      g.position.set(-34 + rand() * 70, 12 + rand() * 7, -22 - rand() * 36);
      for (let j = 0; j < 4; j++) {
        let c = sphere(1.8 + rand(), cloudMat, j * 2, rand() * 0.5, 0, g);
        c.scale.set(1, 0.62, 0.8);
      }
      scene.add(g);
      clouds.push(g);
    }
    // ===== ปรับปรุงดวงอาทิตย์และพระจันทร์ให้สวยงามสมจริง =====
    const celCv = document.createElement('canvas');
    celCv.width = 512; celCv.height = 512;
    const cCtx = celCv.getContext('2d');
    
    // 1. วาดดวงอาทิตย์ (แสงจ้า ออร่าแผ่กว้าง)
    let sGrad = cCtx.createRadialGradient(256, 256, 40, 256, 256, 256);
    sGrad.addColorStop(0, 'rgba(255, 255, 255, 1)');
    sGrad.addColorStop(0.2, 'rgba(255, 245, 200, 0.9)');
    sGrad.addColorStop(0.5, 'rgba(255, 210, 120, 0.2)');
    sGrad.addColorStop(1, 'rgba(255, 180, 80, 0)');
    cCtx.fillStyle = sGrad;
    cCtx.fillRect(0, 0, 512, 512);
    const sunTex = new THREE.CanvasTexture(celCv);
    sunTex.colorSpace = THREE.SRGBColorSpace;

    // 2. วาดดวงจันทร์ (มีหลุมอุกกาบาตและแสงเรืองนวลๆ ขอบฟุ้ง)
    cCtx.clearRect(0, 0, 512, 512);
    // ออร่าเรืองแสงชั้นนอกของดวงจันทร์
    let mGrad = cCtx.createRadialGradient(256, 256, 90, 256, 256, 220);
    mGrad.addColorStop(0, 'rgba(255, 250, 235, 1)');
    mGrad.addColorStop(0.2, 'rgba(255, 250, 235, 0.3)');
    mGrad.addColorStop(1, 'rgba(255, 250, 235, 0)');
    cCtx.fillStyle = mGrad;
    cCtx.fillRect(0, 0, 512, 512);
    
    // วาดพื้นผิวดวงจันทร์ดวงกลม
    cCtx.beginPath();
    cCtx.arc(256, 256, 90, 0, Math.PI * 2);
    cCtx.fillStyle = '#fffae6';
    cCtx.fill();
    
    // ลายหลุมอุกกาบาต (Craters) สีน้ำจางๆ
    cCtx.globalCompositeOperation = 'source-atop';
    cCtx.fillStyle = 'rgba(160, 150, 135, 0.35)'; // สีหลุมเทาอมน้ำตาลอ่อน
    cCtx.beginPath(); cCtx.arc(200, 190, 24, 0, 7); cCtx.fill();
    cCtx.beginPath(); cCtx.arc(290, 280, 36, 0, 7); cCtx.fill();
    cCtx.beginPath(); cCtx.arc(230, 300, 18, 0, 7); cCtx.fill();
    cCtx.beginPath(); cCtx.arc(310, 190, 15, 0, 7); cCtx.fill();
    cCtx.beginPath(); cCtx.arc(260, 230, 48, 0, 7); cCtx.fill(); // รอยด่างใหญ่
    
    // เงาขอบเพื่อให้ดูเป็นทรงกลมมีมิติ (Sphere Shading)
    let shadowGrad = cCtx.createRadialGradient(210, 210, 20, 256, 256, 90);
    shadowGrad.addColorStop(0, 'rgba(255,255,255,0)');
    shadowGrad.addColorStop(1, 'rgba(100,90,70,0.65)');
    cCtx.fillStyle = shadowGrad;
    cCtx.fillRect(0, 0, 512, 512);
    cCtx.globalCompositeOperation = 'source-over';
    
    const moonTex = new THREE.CanvasTexture(celCv);
    moonTex.colorSpace = THREE.SRGBColorSpace;

    // นำไปใส่ใน Sprite แทน Sphere ตัวเก่า
    const celestialMat = new THREE.SpriteMaterial({
        map: sunTex,
        transparent: true,
        depthWrite: false,
        fog: false // ปิดหมอกเพื่อไม่ให้ดวงจันทร์ดูมัวหมองเวลาฝนตก
    });
    const sunMesh = new THREE.Sprite(celestialMat);
    sunMesh.isCelestialSprite = true;
    sunMesh.sunTex = sunTex;
    sunMesh.moonTex = moonTex;
    sunMesh.position.set(-22, 17, -44);
    scene.add(sunMesh);
    // ======================================================
    const starsGeo = new THREE.BufferGeometry(),
      starPositions = [];
    for (let i = 0; i < 180; i++)
      starPositions.push((rand() - 0.5) * 140, 15 + rand() * 55, -15 - rand() * 90);
    starsGeo.setAttribute('position', new THREE.Float32BufferAttribute(starPositions, 3));
    const stars = new THREE.Points(
      starsGeo,
      new THREE.PointsMaterial({ color: 0xfff4ce, size: 0.19, transparent: true, opacity: 0.85 })
    );
    scene.add(stars);


    // ===== ฟังก์ชันเสริมที่ 3: ดาวตกขอพรยามค่ำคืน =====
    const ssMat = new THREE.MeshBasicMaterial({ color: 0xfffae6, transparent: true, opacity: 0, blending: THREE.AdditiveBlending });
    const ssGeo = new THREE.ConeGeometry(0.12, 18, 5); 
    ssGeo.translate(0, -9, 0); // ขยับจุดศูนย์กลางมาที่หัวดาวตก
    ssGeo.rotateX(-Math.PI / 2); 
    const shootingStar = new THREE.Mesh(ssGeo, ssMat);
    scene.add(shootingStar);
    
    const ssData = { active: false, t: 0, sx: 0, sy: 0, sz: 0, ex: 0, ey: 0, ez: 0 };
    function triggerShootingStar() {
        if (ssData.active) return; // ถ้ากำลังตกอยู่ ห้ามกดซ้ำ
        ssData.active = true;
        ssData.t = 0;
        
        // สุ่มตำแหน่งเกิดบนฟ้า (อิงจากตำแหน่งรถปัจจุบัน)
        ssData.sx = car.position.x + (Math.random() - 0.5) * 80;
        ssData.sy = 45 + Math.random() * 20;
        ssData.sz = car.position.z - 40 - Math.random() * 40;
        
        // สุ่มทิศทางพุ่งเฉียงลง
        ssData.ex = ssData.sx + (Math.random() > 0.5 ? 45 : -45);
        ssData.ey = ssData.sy - 25 - Math.random() * 15;
        ssData.ez = ssData.sz - 30;
        
        shootingStar.position.set(ssData.sx, ssData.sy, ssData.sz);
        shootingStar.lookAt(ssData.ex, ssData.ey, ssData.ez);
        
        // เสียงวิ้งขอพร (Magical Chime - ใช้คู่ประสาน D#6, G6, A#6)
        if (typeof tone === 'function') {
            tone(1244.5, 0.2, 0.03, 'sine'); 
            tone(1567.9, 0.3, 0.02, 'sine', 0.1); 
            tone(1864.6, 0.6, 0.015, 'sine', 0.25); 
        }
        toast(svgInline('star') + ' หลับตาอธิษฐานขอพรสิครับ...');
    }
    window.triggerShootingStar = triggerShootingStar;
    // ================================================


    /* ============================================================================
     * src/scene/14-car.js
     * รถ EV สีครีมของผู้เล่น (ตัวถัง ไฟ ล้อ ราวหลังคาและสัมภาระ)
     * (ไฟล์นี้ถูกต่อรวมเป็น closure เดียวกับไฟล์อื่น — ไม่ต้อง import/export · ลำดับไฟล์ดู build.config.mjs)
     * ========================================================================== */

    const car = new THREE.Group();
    scene.add(car);
    car.scale.setScalar(1.17);
    box(1.85, 0.57, 3.1, cream, 0, 0.72, 0, car);
    box(1.73, 0.18, 2.85, cream, 0, 1.05, 0, car);
    box(1.47, 0.81, 1.72, cream, 0, 1.43, -0.13, car);
    box(1.35, 0.55, 0.04, glass, 0, 1.47, 0.755, car);
    box(1.35, 0.49, 0.04, glass, 0, 1.47, -1.005, car);
    for (let side of [-1, 1]) {
      box(0.035, 0.49, 0.68, glass, side * 0.75, 1.47, 0.3, car);
      box(0.035, 0.49, 0.6, glass, side * 0.75, 1.47, -0.48, car);
      box(0.13, 0.21, 0.28, cream, side * 0.99, 1.13, 0.55, car);
      box(0.035, 0.06, 0.22, orange, side * 0.925, 1.03, -0.2, car);
    }
    box(1.05, 0.13, 0.04, rubber, 0, 0.62, 1.57, car);
    box(1.75, 0.08, 0.08, hub, 0, 0.52, 1.58, car);
    const lightMat = mat(0xfff7d0, { emissive: 0xffdd88, emissiveIntensity: 0.4 });
    for (let side of [-1, 1]) {
      box(0.37, 0.2, 0.06, lightMat, side * 0.59, 0.86, 1.57, car);
      box(0.27, 0.13, 0.06, mat(0xc2816f), side * 0.62, 0.81, -1.57, car);
    }
    box(0.36, 0.13, 0.04, white, 0, 0.63, 1.62, car);
    const wheels = [];
    const wheelGeo = new THREE.CylinderGeometry(0.38, 0.38, 0.21, 16),
      hubGeo = new THREE.CylinderGeometry(0.22, 0.22, 0.223, 12);
    for (let side of [-1, 1])
      for (let z of [-0.93, 1]) {
        let g = new THREE.Group();
        g.position.set(side * 0.94, 0.4, z);
        let wheel = new THREE.Mesh(wheelGeo, rubber);
        wheel.rotation.z = Math.PI / 2;
        wheel.castShadow = true;
        g.add(wheel);
        let cap = new THREE.Mesh(hubGeo, hub);
        cap.rotation.z = Math.PI / 2;
        g.add(cap);
        car.add(g);
        wheels.push(g);
      }
    {
      const sage = mat(0x6f9c84),
        dark = mat(0x2f3d38),
        bag = mat(0xd9a05b),
        bag2 = mat(0x6e9fb0);
      box(1.6, 0.07, 1.95, white, 0, 1.87, -0.13, car);
      for (const s of [-1, 1]) {
        box(0.03, 0.11, 3.02, sage, s * 0.935, 0.86, 0, car);
        box(0.03, 0.42, 0.03, dark, s * 0.945, 0.78, 0.2, car);
        box(0.03, 0.42, 0.03, dark, s * 0.945, 0.78, -0.8, car);
        box(0.04, 0.04, 0.16, hub, s * 0.955, 0.98, 0.02, car);
        box(0.04, 0.04, 0.16, hub, s * 0.955, 0.98, -0.62, car);
        box(0.04, 0.04, 1.7, dark, s * 0.6, 1.925, -0.13, car);
        box(0.44, 0.27, 0.05, hub, s * 0.59, 0.86, 1.545, car);
      }
      for (const z of [-0.7, 0.4]) box(1.3, 0.04, 0.05, dark, 0, 1.965, z, car);
      box(0.95, 0.3, 0.6, bag, 0, 2.14, -0.1, car);
      box(0.98, 0.32, 0.04, dark, 0, 2.14, -0.28, car);
      box(0.98, 0.32, 0.04, dark, 0, 2.14, 0.08, car);
      cyl(0.11, 0.11, 0.9, bag2, 0, 2.4, -0.1, car, 0, Math.PI / 2);
      box(1.75, 0.08, 0.08, hub, 0, 0.52, -1.58, car);
      box(0.4, 0.14, 0.03, white, 0, 0.62, -1.585, car);
      cyl(0.34, 0.34, 0.12, rubber, 0, 1.02, -1.63, car, Math.PI / 2, 0);
      cyl(0.17, 0.17, 0.13, hub, 0, 1.02, -1.63, car, Math.PI / 2, 0);
      box(0.5, 0.05, 0.04, white, 0, 0.9, 1.585, car);
      ball(0.09, sage, 0, 0.9, 1.6, car, 1, 1, 0.4);
      for (const g of wheels) {
        const sd = Math.sign(g.position.x),
          ring = new THREE.Mesh(new THREE.TorusGeometry(0.29, 0.028, 6, 20), white);
        ring.rotation.y = Math.PI / 2;
        ring.position.x = sd * 0.113;
        g.add(ring);
        for (let k = 0; k < 4; k++) {
          const a = (k * Math.PI) / 2 + 0.4;
          ball(0.035, dark, sd * 0.12, Math.cos(a) * 0.13, Math.sin(a) * 0.13, g);
        }
      }
    }

    /* ============================================================================
     * src/scene/15-village-houses.js
     * บ้านและกระท่อมริมทาง กอหญ้า และหิ่งห้อย (fireflies)
     * (ไฟล์นี้ถูกต่อรวมเป็น closure เดียวกับไฟล์อื่น — ไม่ต้อง import/export · ลำดับไฟล์ดู build.config.mjs)
     * ========================================================================== */

    /* roadside details: grass tufts + village houses (own PRNG keeps the existing layout unchanged) */
    const winM = mat(0x4a3b2a, { emissive: 0xffc46b, emissiveIntensity: 0 });
    const FF = (() => {
      const N = 90,
        pos = new Float32Array(N * 3),
        base = [],
        clusterT = [0.12, 0.28, 0.43, 0.58, 0.74, 0.9],
        r = (() => {
          let q = 777;
          return () => {
            q = (q * 16807) % 2147483647;
            return (q - 1) / 2147483646;
          };
        })();
      for (let i = 0; i < N; i++) {
        const o = offRoad(clusterT[Math.floor(i / (N / clusterT.length))], (r() < 0.5 ? -1 : 1) * (5 + r() * 9));
        base.push([o.x + (r() - 0.5) * 3.2, 0.6 + r() * 1.8, o.z + (r() - 0.5) * 3.2, r() * 6]);
      }
      const geo = new THREE.BufferGeometry();
      geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
      const m = new THREE.PointsMaterial({
          color: 0xfff2a0,
          size: 0.22,
          transparent: true,
          opacity: 0,
          depthWrite: false,
          blending: THREE.AdditiveBlending
        }),
        p = new THREE.Points(geo, m);
      const bodyGeo = new THREE.IcosahedronGeometry(0.055, 0),
        abdomenGeo = new THREE.OctahedronGeometry(0.045, 0),
        wingShape = new THREE.Shape(),
        bodyMat = new THREE.MeshLambertMaterial({ color: 0x40392d }),
        abdomenMat = new THREE.MeshBasicMaterial({ color: 0xffdc64, transparent: true, opacity: 0.95 }),
        wingMat = new THREE.MeshBasicMaterial({ color: 0xc9c5a0, transparent: true, opacity: 0.58, side: THREE.DoubleSide, depthWrite: false }),
        body = new THREE.InstancedMesh(bodyGeo, bodyMat, N),
        abdomen = new THREE.InstancedMesh(abdomenGeo, abdomenMat, N),
        wings = new THREE.InstancedMesh(
          (() => {
            wingShape.moveTo(0, 0);
            wingShape.lineTo(0.12, 0.025);
            wingShape.lineTo(0.17, 0.08);
            wingShape.lineTo(0.1, 0.105);
            wingShape.lineTo(0.025, 0.07);
            wingShape.closePath();
            return new THREE.ShapeGeometry(wingShape);
          })(),
          wingMat,
          N * 2
        ),
        dummy = new THREE.Object3D();
      body.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
      abdomen.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
      wings.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
      body.frustumCulled = abdomen.frustumCulled = wings.frustumCulled = false;
      body.visible = abdomen.visible = wings.visible = false;
      p.frustumCulled = false;
      p.visible = false;
      scene.add(p, body, abdomen, wings);
      return { p, m, base, pos, geo, N, body, abdomen, wings, dummy };
    })();
    function fireflies() {
      FF.m.opacity = nl * 0.9;
      const active = nl > 0.03;
      FF.p.visible = FF.body.visible = FF.abdomen.visible = FF.wings.visible = active;
      if (!active) return;
      const t = state.reduced ? 0 : totalTime;
      for (let i = 0; i < FF.N; i++) {
        const b = FF.base[i],
          x = b[0] + Math.sin(t * 0.5 + b[3]) * 0.7,
          y = b[1] + Math.sin(t * 0.8 + b[3] * 2) * 0.35,
          z = b[2] + Math.cos(t * 0.4 + b[3]) * 0.7,
          blink = 0.3 + Math.max(0, Math.sin(t * 3.2 + b[3] * 2.4)) * 0.7;
        FF.pos[i * 3] = x;
        FF.pos[i * 3 + 1] = y;
        FF.pos[i * 3 + 2] = z;
        FF.dummy.position.set(x, y, z);
        FF.dummy.rotation.set(0, b[3], 0);
        FF.dummy.scale.set(1, 0.75, 1.15);
        FF.dummy.updateMatrix();
        FF.body.setMatrixAt(i, FF.dummy.matrix);
        FF.dummy.position.set(x, y - 0.018, z + Math.cos(b[3]) * 0.055);
        FF.dummy.scale.setScalar(blink);
        FF.dummy.updateMatrix();
        FF.abdomen.setMatrixAt(i, FF.dummy.matrix);
        const flap = Math.sin(t * 18 + b[3]) * 0.12;
        FF.dummy.position.set(x - 0.025, y + 0.015, z);
        FF.dummy.rotation.set(0, b[3], flap);
        FF.dummy.scale.set(-1, 1, 1);
        FF.dummy.updateMatrix();
        FF.wings.setMatrixAt(i * 2, FF.dummy.matrix);
        FF.dummy.position.x = x + 0.025;
        FF.dummy.rotation.z = -flap;
        FF.dummy.scale.x = 1;
        FF.dummy.updateMatrix();
        FF.wings.setMatrixAt(i * 2 + 1, FF.dummy.matrix);
      }
      FF.geo.attributes.position.needsUpdate = true;
      FF.body.instanceMatrix.needsUpdate = FF.abdomen.instanceMatrix.needsUpdate = FF.wings.instanceMatrix.needsUpdate = true;
    }

    // ระบบละอองเกสร/ดอกหญ้าปลิวลมยามกลางวัน (Dandelions)
    const DD = (() => {
      const N = 120, pos = new Float32Array(N * 3), base = [];
      for (let i = 0; i < N; i++) {
        // กระจายกว้างๆ รอบตัวถนน
        base.push([(Math.random() - 0.5) * 80, 0.5 + Math.random() * 4, (Math.random() - 0.5) * 80, Math.random() * 6]);
      }
      const geo = new THREE.BufferGeometry();
      geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
      const m = new THREE.PointsMaterial({
          color: 0xffffff, size: 0.12, transparent: true, opacity: 0, depthWrite: false
      });
      const p = new THREE.Points(geo, m);
      p.frustumCulled = false;
      scene.add(p);
      return { p, m, base, pos, geo, N };
    })();
    
    function dandelions(dt) {
      const isDayRain = window.RODENV && window.RODENV.rain() > 0.1;
      // โผล่เฉพาะตอนกลางวัน และฝนไม่ตก
      const targetOp = (!state.night && !isDayRain) ? 0.6 : 0;
      DD.m.opacity += (targetOp - DD.m.opacity) * Math.min(1, dt);
      
      if (DD.m.opacity < 0.05) { DD.p.visible = false; return; }
      DD.p.visible = true;
      
      const t = totalTime * 0.4;
      for (let i = 0; i < DD.N; i++) {
        const b = DD.base[i];
        // ปลิวล่องลอยเอื่อยๆ ตามทิศทางลมหลัก (แกน X และขึ้นบน)
        let cx = b[0] + (totalTime * 1.5 + b[3] * 10) % 80; 
        if(cx > 40) cx -= 80; // วนกลับมา
        
        DD.pos[i * 3] = car.position.x + cx; // เกาะกลุ่มไปกับรถ
        DD.pos[i * 3 + 1] = b[1] + Math.sin(t * 0.8 + b[3] * 2) * 1.5;
        DD.pos[i * 3 + 2] = car.position.z + b[2] + Math.cos(t * 0.4 + b[3]) * 2.0;
      }
      DD.geo.attributes.position.needsUpdate = true;
    }

    // จุดแมลงและกบใช้ InstancedMesh ชุดเล็ก และซ่อน instance ที่อยู่ไกลจากรถ
    const roadsideWildlife = (() => {
      const spots = [
        { t: 0.16, side: -1 }, { t: 0.36, side: 1 },
        { t: 0.57, side: -1 }, { t: 0.75, side: 1 }, { t: 0.9, side: -1 }
      ];
      let seed = 19871;
      const rand = () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;
      const scatter = (count, heightMin, heightRange, colors) => {
        const out = [];
        for (let i = 0; i < count; i++) {
          const spot = spots[i % spots.length],
            p = offRoad(spot.t + (rand() - 0.5) * 0.006, spot.side * (5.5 + rand() * 4.5));
          out.push({
            x: p.x + (rand() - 0.5) * 2.4,
            y: heightMin + rand() * heightRange,
            z: p.z + (rand() - 0.5) * 2.4,
            yaw: rand() * Math.PI * 2,
            phase: rand() * Math.PI * 2,
            color: colors[i % colors.length]
          });
        }
        return out;
      };
      const makeBatch = (geometry, material, count) => {
        const mesh = new THREE.InstancedMesh(geometry, material, count);
        mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
        mesh.frustumCulled = false;
        scene.add(mesh);
        return mesh;
      };
      const makeWing = (points) => {
        const shape = new THREE.Shape();
        shape.moveTo(points[0][0], points[0][1]);
        for (let i = 1; i < points.length; i++) shape.lineTo(points[i][0], points[i][1]);
        shape.closePath();
        const geometry = new THREE.ShapeGeometry(shape);
        geometry.computeVertexNormals();
        return geometry;
      };
      const butterflyWingGeo = makeWing([[0, -0.08], [0.48, -0.02], [0.88, 0.2], [0.92, 0.46], [0.68, 0.58], [0.34, 0.38], [0.1, 0.18]]),
        dragonflyWingGeo = makeWing([[0, -0.04], [0.45, -0.025], [0.96, 0], [1, 0.055], [0.52, 0.075], [0.08, 0.04]]);
      const dummy = new THREE.Object3D(),
        color = new THREE.Color(),
        butterflyData = scatter(20, 0.65, 1.3, [0xffc857, 0xff83a8, 0x8ee3a1, 0xb9a0ff]),
        dragonflyData = scatter(15, 0.35, 0.8, [0x73d9c2, 0x6bb8ed, 0xa2d77a]),
        frogData = scatter(6, 0, 0, [0x62944c, 0x789d45, 0x4f8050]),
        butterflyBody = makeBatch(new THREE.IcosahedronGeometry(1, 0), new THREE.MeshLambertMaterial({ color: 0xffffff, flatShading: true }), butterflyData.length),
        butterflyHead = makeBatch(new THREE.IcosahedronGeometry(1, 0), new THREE.MeshLambertMaterial({ color: 0x32271f, flatShading: true }), butterflyData.length),
        butterflyWings = makeBatch(butterflyWingGeo, new THREE.MeshLambertMaterial({ color: 0xffffff, side: THREE.DoubleSide, flatShading: true }), butterflyData.length * 2),
        butterflySpots = makeBatch(new THREE.IcosahedronGeometry(1, 0), new THREE.MeshLambertMaterial({ color: 0x49344b, flatShading: true }), butterflyData.length * 4),
        dragonflyBody = makeBatch(new THREE.CylinderGeometry(0.55, 0.18, 1, 6).rotateX(Math.PI / 2), new THREE.MeshLambertMaterial({ color: 0xffffff, flatShading: true }), dragonflyData.length),
        dragonflyHead = makeBatch(new THREE.IcosahedronGeometry(1, 0), new THREE.MeshLambertMaterial({ color: 0x263e39, flatShading: true }), dragonflyData.length),
        dragonflyEyes = makeBatch(new THREE.IcosahedronGeometry(1, 0), new THREE.MeshLambertMaterial({ color: 0xc8444c, flatShading: true }), dragonflyData.length * 2),
        dragonflyWings = makeBatch(dragonflyWingGeo, new THREE.MeshLambertMaterial({ color: 0xb8eee9, transparent: true, opacity: 0.84, side: THREE.DoubleSide, flatShading: true }), dragonflyData.length * 4),
        frogBody = makeBatch(new THREE.IcosahedronGeometry(1, 1), new THREE.MeshLambertMaterial({ color: 0xffffff, flatShading: true }), frogData.length),
        frogHead = makeBatch(new THREE.IcosahedronGeometry(1, 0), new THREE.MeshLambertMaterial({ color: 0xffffff, flatShading: true }), frogData.length),
        frogEyes = makeBatch(new THREE.IcosahedronGeometry(1, 0), new THREE.MeshLambertMaterial({ color: 0xd7d77a, flatShading: true }), frogData.length * 2),
        frogPupils = makeBatch(new THREE.IcosahedronGeometry(1, 0), new THREE.MeshLambertMaterial({ color: 0x202820, flatShading: true }), frogData.length * 2),
        frogLegs = makeBatch(new THREE.IcosahedronGeometry(1, 0), new THREE.MeshLambertMaterial({ color: 0x527f43, flatShading: true }), frogData.length * 4),
        frogFeet = makeBatch(new THREE.IcosahedronGeometry(1, 0), new THREE.MeshLambertMaterial({ color: 0x527f43, flatShading: true }), frogData.length * 2),
        frogToes = makeBatch(new THREE.IcosahedronGeometry(1, 0), new THREE.MeshLambertMaterial({ color: 0x6c9e50, flatShading: true }), frogData.length * 6);

      const tintInstances = (mesh, entries) => entries.forEach((entry, i) => {
        color.setHex(entry.color);
        mesh.setColorAt(i, color);
      });
      tintInstances(butterflyBody, butterflyData);
      tintInstances(butterflyWings, butterflyData.flatMap(entry => [entry, entry]));
      tintInstances(butterflySpots, butterflyData.flatMap(entry => [entry, entry, entry, entry]));
      tintInstances(dragonflyBody, dragonflyData);
      tintInstances(dragonflyHead, dragonflyData);
      tintInstances(frogBody, frogData);
      tintInstances(frogHead, frogData);
      tintInstances(frogLegs, frogData.flatMap(entry => [entry, entry, entry, entry]));
      tintInstances(frogFeet, frogData.flatMap(entry => [entry, entry]));
      tintInstances(frogToes, frogData.flatMap(entry => [entry, entry, entry, entry, entry, entry]));
      for (let i = 0; i < frogData.length * 2; i++) {
        color.setHex(0xf0d76e);
        frogEyes.setColorAt(i, color);
      }
      for (const mesh of [butterflyBody, butterflyHead, butterflyWings, butterflySpots, dragonflyBody, dragonflyHead, dragonflyEyes, frogBody, frogHead, frogEyes, frogLegs, frogFeet, frogToes]) {
        if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
      }

      const transform = (mesh, index, x, y, z, yaw, rz, sx, sy, sz, rx = 0) => {
        dummy.position.set(x, y, z);
        dummy.rotation.set(rx, yaw, rz);
        dummy.scale.set(sx, sy, sz);
        dummy.updateMatrix();
        mesh.setMatrixAt(index, dummy.matrix);
      };
      const localPoint = (entry, yaw, lx, lz) => [
        entry.x + lx * Math.cos(yaw) + lz * Math.sin(yaw),
        entry.z - lx * Math.sin(yaw) + lz * Math.cos(yaw)
      ];
      const hideInstance = (mesh, index) => transform(mesh, index, 0, -1000, 0, 0, 0, 0, 0, 0);
      const wildlifeMeshes = [
        butterflyBody, butterflyHead, butterflyWings, butterflySpots,
        dragonflyBody, dragonflyHead, dragonflyEyes, dragonflyWings,
        frogBody, frogHead, frogEyes, frogPupils, frogLegs, frogFeet, frogToes
      ];
      const update = () => {
        const range = state.reduced ? 42 : 72,
          rangeSq = range * range,
          time = state.reduced ? Math.floor(totalTime * 4) / 4 : totalTime,
          rain = window.RODENV ? window.RODENV.rain() : 0,
          butterfliesActive = !state.night && rain < 0.25,
          dragonfliesActive = rain < 0.45;
        let visibleButterflies = false, visibleDragonflies = false, visibleFrogs = false;

        butterflyData.forEach((b, i) => {
          const dx = b.x - car.position.x, dz = b.z - car.position.z,
            near = dx * dx + dz * dz < rangeSq && butterfliesActive;
          if (!near) {
            hideInstance(butterflyBody, i);
            hideInstance(butterflyHead, i);
            hideInstance(butterflyWings, i * 2);
            hideInstance(butterflyWings, i * 2 + 1);
            for (let spot = 0; spot < 4; spot++) hideInstance(butterflySpots, i * 4 + spot);
            return;
          }
          visibleButterflies = true;
          const x = b.x + Math.sin(time * 1.6 + b.phase) * 0.4,
            y = b.y + Math.sin(time * 2.6 + b.phase) * 0.2,
            z = b.z + Math.cos(time * 1.3 + b.phase) * 0.35,
            flap = Math.sin(time * 12 + b.phase) * 0.58,
            wingRoot = localPoint({ x, z }, b.yaw, 0, 0),
            spotL = localPoint({ x, z }, b.yaw, -0.15, 0.015),
            spotR = localPoint({ x, z }, b.yaw, 0.15, 0.015);
          transform(butterflyBody, i, x, y, z, b.yaw, 0, 0.032, 0.04, 0.11);
          transform(butterflyHead, i, x, y + 0.012, z + 0.105, b.yaw, 0, 0.026, 0.026, 0.026);
          transform(butterflyWings, i * 2, wingRoot[0], y + 0.015, wingRoot[1], b.yaw, flap, -0.27, 0.25, 0.012);
          transform(butterflyWings, i * 2 + 1, wingRoot[0], y + 0.015, wingRoot[1], b.yaw, -flap, 0.27, 0.25, 0.012);
          transform(butterflySpots, i * 4, spotL[0], y + 0.105, spotL[1], b.yaw, flap, 0.022, 0.028, 0.01);
          transform(butterflySpots, i * 4 + 1, spotL[0], y + 0.19, spotL[1] + 0.012, b.yaw, flap, 0.014, 0.018, 0.01);
          transform(butterflySpots, i * 4 + 2, spotR[0], y + 0.105, spotR[1], b.yaw, -flap, 0.022, 0.028, 0.01);
          transform(butterflySpots, i * 4 + 3, spotR[0], y + 0.19, spotR[1] + 0.012, b.yaw, -flap, 0.014, 0.018, 0.01);
        });

        dragonflyData.forEach((b, i) => {
          const dx = b.x - car.position.x, dz = b.z - car.position.z,
            near = dx * dx + dz * dz < rangeSq && dragonfliesActive;
          if (!near) {
            hideInstance(dragonflyBody, i);
            hideInstance(dragonflyHead, i);
            hideInstance(dragonflyEyes, i * 2);
            hideInstance(dragonflyEyes, i * 2 + 1);
            for (let wing = 0; wing < 4; wing++) hideInstance(dragonflyWings, i * 4 + wing);
            return;
          }
          visibleDragonflies = true;
          const x = b.x + Math.sin(time * 2.2 + b.phase) * 0.28,
            y = b.y + Math.sin(time * 3.4 + b.phase) * 0.12,
            z = b.z + Math.cos(time * 1.7 + b.phase) * 0.3,
            flap = Math.sin(time * 20 + b.phase) * 0.11,
            wingRootL = localPoint({ x, z }, b.yaw, -0.015, 0.025),
            wingRootR = localPoint({ x, z }, b.yaw, 0.015, 0.025),
            rearRootL = localPoint({ x, z }, b.yaw, -0.015, -0.035),
            rearRootR = localPoint({ x, z }, b.yaw, 0.015, -0.035),
            eyeL = localPoint({ x, z }, b.yaw, -0.026, 0.205),
            eyeR = localPoint({ x, z }, b.yaw, 0.026, 0.205);
          transform(dragonflyBody, i, x, y, z, b.yaw, 0, 0.022, 0.022, 0.2);
          transform(dragonflyHead, i, x, y + 0.006, z + 0.19, b.yaw, 0, 0.034, 0.034, 0.034);
          transform(dragonflyEyes, i * 2, eyeL[0], y + 0.025, eyeL[1], b.yaw, 0, 0.018, 0.018, 0.018);
          transform(dragonflyEyes, i * 2 + 1, eyeR[0], y + 0.025, eyeR[1], b.yaw, 0, 0.018, 0.018, 0.018);
          transform(dragonflyWings, i * 4, wingRootL[0], y + 0.022, wingRootL[1], b.yaw, flap, -0.22, 0.018, 0.012, 0);
          transform(dragonflyWings, i * 4 + 1, wingRootR[0], y + 0.022, wingRootR[1], b.yaw, -flap, 0.22, 0.018, 0.012, 0);
          transform(dragonflyWings, i * 4 + 2, rearRootL[0], y + 0.022, rearRootL[1], b.yaw, flap * 0.8, -0.19, 0.015, 0.01, 0);
          transform(dragonflyWings, i * 4 + 3, rearRootR[0], y + 0.022, rearRootR[1], b.yaw, -flap * 0.8, 0.19, 0.015, 0.01, 0);
        });

        frogData.forEach((f, i) => {
          const dx = f.x - car.position.x, dz = f.z - car.position.z,
            near = dx * dx + dz * dz < rangeSq;
          if (!near) {
            hideInstance(frogBody, i);
            hideInstance(frogHead, i);
            hideInstance(frogEyes, i * 2);
            hideInstance(frogEyes, i * 2 + 1);
            hideInstance(frogPupils, i * 2);
            hideInstance(frogPupils, i * 2 + 1);
            for (let leg = 0; leg < 4; leg++) hideInstance(frogLegs, i * 4 + leg);
            hideInstance(frogFeet, i * 2);
            hideInstance(frogFeet, i * 2 + 1);
            for (let toe = 0; toe < 6; toe++) hideInstance(frogToes, i * 6 + toe);
            return;
          }
          visibleFrogs = true;
          const cycle = (time + f.phase) % 3.8,
            jumpU = cycle < 0.72 ? cycle / 0.72 : 0,
            jump = cycle < 0.72 ? Math.sin(jumpU * Math.PI) * 0.38 : 0,
            yaw = f.yaw,
            x = f.x + Math.sin(yaw) * jumpU * 0.4,
            z = f.z + Math.cos(yaw) * jumpU * 0.4,
            bodyY = 0.13 + jump,
            head = localPoint({ x, z }, yaw, 0, 0.17),
            eyeL = localPoint({ x, z }, yaw, -0.075, 0.2),
            eyeR = localPoint({ x, z }, yaw, 0.075, 0.2),
            hindL = localPoint({ x, z }, yaw, -0.13, -0.08),
            hindR = localPoint({ x, z }, yaw, 0.13, -0.08),
            foreL = localPoint({ x, z }, yaw, -0.09, 0.06),
            foreR = localPoint({ x, z }, yaw, 0.09, 0.06),
            footL = localPoint({ x, z }, yaw, -0.14, 0.18),
            footR = localPoint({ x, z }, yaw, 0.14, 0.18);
          transform(frogBody, i, x, bodyY, z, yaw, 0, 0.17, 0.12, 0.21);
          transform(frogHead, i, head[0], bodyY + 0.06, head[1], yaw, 0, 0.13, 0.11, 0.13);
          transform(frogEyes, i * 2, eyeL[0], bodyY + 0.14, eyeL[1], yaw, 0, 0.045, 0.055, 0.045);
          transform(frogEyes, i * 2 + 1, eyeR[0], bodyY + 0.14, eyeR[1], yaw, 0, 0.045, 0.055, 0.045);
          transform(frogPupils, i * 2, eyeL[0], bodyY + 0.18, eyeL[1] + 0.025, yaw, 0, 0.018, 0.023, 0.018);
          transform(frogPupils, i * 2 + 1, eyeR[0], bodyY + 0.18, eyeR[1] + 0.025, yaw, 0, 0.018, 0.023, 0.018);
          transform(frogLegs, i * 4, hindL[0], bodyY - 0.055, hindL[1], yaw, -0.48, 0.1, 0.07, 0.15);
          transform(frogLegs, i * 4 + 1, hindR[0], bodyY - 0.055, hindR[1], yaw, 0.48, 0.1, 0.07, 0.15);
          transform(frogLegs, i * 4 + 2, foreL[0], bodyY - 0.06, foreL[1], yaw, -0.2, 0.055, 0.055, 0.12);
          transform(frogLegs, i * 4 + 3, foreR[0], bodyY - 0.06, foreR[1], yaw, 0.2, 0.055, 0.055, 0.12);
          transform(frogFeet, i * 2, footL[0], bodyY - 0.08, footL[1], yaw, 0, 0.075, 0.035, 0.095);
          transform(frogFeet, i * 2 + 1, footR[0], bodyY - 0.08, footR[1], yaw, 0, 0.075, 0.035, 0.095);
          for (let toe = 0; toe < 3; toe++) {
            const spread = (toe - 1) * 0.045,
              toeL = localPoint({ x: footL[0], z: footL[1] }, yaw, spread, 0.07),
              toeR = localPoint({ x: footR[0], z: footR[1] }, yaw, spread, 0.07);
            transform(frogToes, i * 6 + toe, toeL[0], bodyY - 0.085, toeL[1], yaw, spread * 3, 0.025, 0.022, 0.06);
            transform(frogToes, i * 6 + 3 + toe, toeR[0], bodyY - 0.085, toeR[1], yaw, spread * 3, 0.025, 0.022, 0.06);
          }
        });

        butterflyBody.visible = butterflyHead.visible = butterflyWings.visible = butterflySpots.visible = visibleButterflies;
        dragonflyBody.visible = dragonflyHead.visible = dragonflyEyes.visible = dragonflyWings.visible = visibleDragonflies;
        frogBody.visible = frogHead.visible = frogEyes.visible = frogPupils.visible =
          frogLegs.visible = frogFeet.visible = frogToes.visible = visibleFrogs;
        for (const mesh of wildlifeMeshes) {
          if (mesh.visible) mesh.instanceMatrix.needsUpdate = true;
        }
      };
      return update;
    })();
    
    // แผ่นพื้นดินผสมหญ้าขอบฟุ้งเนียน (Shared Ground Dirt-Grass Blend Patch) สำหรับวางใต้สิ่งปลูกสร้างและร้านค้า
    const _groundPatchGeo = new THREE.PlaneGeometry(1, 1);
    _groundPatchGeo.rotateX(-Math.PI / 2);
    const _groundPatchMat = (() => {
      const c = document.createElement('canvas');
      c.width = 128;
      c.height = 128;
      const ctx = c.getContext('2d');
      const g = ctx.createRadialGradient(64, 64, 8, 64, 64, 62);
      g.addColorStop(0.0, 'rgba(122, 98, 68, 0.88)');
      g.addColorStop(0.45, 'rgba(134, 110, 76, 0.68)');
      g.addColorStop(0.76, 'rgba(118, 124, 78, 0.34)');
      g.addColorStop(1.0, 'rgba(110, 128, 82, 0.0)');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, 128, 128);
      // สุ่มเม็ดดิน/กรวดเล็กๆ และกอหญ้าขอบลานให้ดูกลืนกับพื้นธรรมชาติ
      for (let i = 0; i < 90; i++) {
        const a = (i * 2.39996) % (Math.PI * 2);
        const r = 8 + ((i * 17) % 44);
        const px = 64 + Math.cos(a) * r;
        const py = 64 + Math.sin(a) * r;
        ctx.fillStyle = i % 3 === 0 ? 'rgba(92, 74, 50, 0.25)' : 'rgba(154, 132, 94, 0.22)';
        ctx.beginPath();
        ctx.arc(px, py, 1.5 + (i % 3), 0, Math.PI * 2);
        ctx.fill();
      }
      const tex = new THREE.CanvasTexture(c);
      return new THREE.MeshLambertMaterial({
        map: tex,
        transparent: true,
        depthWrite: false,
        polygonOffset: true,
        polygonOffsetFactor: -1,
        polygonOffsetUnits: -2
      });
    })();
    const addGroundPatch = (parent, w, d, x = 0, z = 0, y = 0.012) => {
      const m = new THREE.Mesh(_groundPatchGeo, _groundPatchMat);
      m.position.set(x, y, z);
      m.scale.set(w, 1, d);
      m.receiveShadow = true;
      parent.add(m);
      return m;
    };
    window.__addGroundPatch = addGroundPatch;

    {
      const rn = (() => {
          let s = 4242;
          return () => {
            s = (s * 16807) % 2147483647;
            return (s - 1) / 2147483646;
          };
        })(),
        teak = mat(0xa57a4c),
        dark = mat(0x6e4d33),
        plank = mat(0xc9ab7a),
        tile = mat(0x9a5640),
        tile2 = mat(0xc27b5a),
        thatch = mat(0xcdb872),
        door = mat(0x5d4a3a),
        clay = mat(0xb86f4a),
        stone = mat(0xa8a69a),
        stack = mat(0x8a6a44);
      const gableGeo = (w, h, d) => {
        const sh = new THREE.Shape();
        sh.moveTo(-w / 2, 0);
        sh.lineTo(w / 2, 0);
        sh.lineTo(0, h);
        sh.closePath();
        const q = new THREE.ExtrudeGeometry(sh, { depth: d, bevelEnabled: false });
        q.translate(0, 0, -d / 2);
        return q;
      };
      const gable = (w, h, d, m, x, y, z, p, infillM = null) => {
        const r = new THREE.Mesh(gableGeo(w, h, d), m);
        r.position.set(x, y, z);
        r.castShadow = true;
        p.add(r);
        // หน้าจั่วไม้ปิดทึบใต้หลังคา + ปั้นลมขอบจั่วหน้า-หลัง ให้หลังคาบ้านสมบูรณ์ไม่กลวง
        if (infillM) {
          const gw = w * 0.82,
            gh = h * 0.82,
            gd = Math.max(0.2, d - 0.55);
          const inMesh = new THREE.Mesh(gableGeo(gw, gh, gd), infillM);
          inMesh.position.set(x, y - 0.02, z);
          p.add(inMesh);
        }
        const slopeLen = Math.hypot(w * 0.5, h) + 0.12,
          slopeAng = Math.atan2(h, w * 0.5);
        for (const fz of [-d * 0.5 + 0.04, d * 0.5 - 0.04]) {
          for (const s of [-1, 1]) {
            const b = box(slopeLen, 0.09, 0.07, dark, x + s * (w * 0.25), y + h * 0.5, z + fz, p);
            b.rotation.z = -s * slopeAng;
          }
        }
        return r;
      };
      const stairs = (n, x, z0, y0, rise, run, w, p) => {
        for (let i = 0; i < n; i++) {
          const sy = y0 + i * rise,
            sz = z0 + (n - 1 - i) * run;
          box(w, 0.07, 0.28, plank, x, sy, sz, p);
          box(w - 0.04, rise * 0.65, 0.04, dark, x, sy - rise * 0.35, sz + 0.11, p);
        }
        // แม่บันไดและราวบันไดซ้าย-ขวา (แก้ไข rotation.x = +ang ให้ลาดลงไปด้านหน้าตามขั้นบันไดอย่างถูกต้อง)
        const spanZ = Math.max(0.2, (n - 1) * run),
          spanY = Math.max(0.2, (n - 1) * rise),
          len = Math.hypot(spanY, spanZ) + 0.28,
          ang = Math.atan2(spanY, spanZ),
          midY = y0 + spanY * 0.5,
          midZ = z0 + spanZ * 0.5;
        for (const s of [-1, 1]) {
          box(0.07, 0.14, len, dark, x + s * (w * 0.5 + 0.035), midY - 0.04, midZ, p).rotation.x = ang;
          box(0.055, 0.055, len, dark, x + s * (w * 0.5 + 0.035), midY + 0.52, midZ, p).rotation.x = ang;
          cyl(0.038, 0.042, 0.58, dark, x + s * (w * 0.5 + 0.035), y0 + 0.26, z0 + spanZ, p);
          cyl(0.038, 0.042, 0.58, dark, x + s * (w * 0.5 + 0.035), y0 + spanY + 0.26, z0, p);
        }
        // แท่นหินรับเชิงบันไดด้านล่าง
        box(w + 0.28, 0.08, 0.42, stone, x, 0.04, z0 + spanZ + 0.22, p);
      };
      const win = (x, y, z, w, h, p) => {
        box(w, h, 0.05, winM, x, y, z, p);
        // กรอบหน้าต่าง 4 ด้าน + ซี่ลูกกรงไม้ + บานเกล็ดเปิดแง้มซ้ายขวา (สำหรับผนังด้านหน้า/หลัง ±Z)
        box(w + 0.12, 0.06, 0.08, dark, x, y + h / 2 + 0.03, z, p);
        box(w + 0.12, 0.06, 0.08, dark, x, y - h / 2 - 0.03, z, p);
        box(0.05, h + 0.06, 0.08, dark, x - w / 2 - 0.025, y, z, p);
        box(0.05, h + 0.06, 0.08, dark, x + w / 2 + 0.025, y, z, p);
        box(0.03, h, 0.07, dark, x, y, z, p);
        box(w, 0.03, 0.07, dark, x, y, z, p);
        if (w > 0.2) {
          const shL = box(w * 0.45, h, 0.03, door, x - w * 0.68, y, z + 0.04, p);
          shL.rotation.y = -0.35;
          const shR = box(w * 0.45, h, 0.03, door, x + w * 0.68, y, z + 0.04, p);
          shR.rotation.y = 0.35;
        }
      };
      const winSide = (x, y, z, d, h, p) => {
        const s = x < 0 ? -1 : 1;
        box(0.05, h, d, winM, x, y, z, p);
        // กรอบหน้าต่างและบานเปิดสำหรับผนังด้านข้าง (±X) ไม่ให้กรอบยื่นทะลุผนังผิดทิศ
        box(0.08, 0.06, d + 0.12, dark, x, y + h / 2 + 0.03, z, p);
        box(0.08, 0.06, d + 0.12, dark, x, y - h / 2 - 0.03, z, p);
        box(0.08, h + 0.06, 0.05, dark, x, y, z - d / 2 - 0.025, p);
        box(0.08, h + 0.06, 0.05, dark, x, y, z + d / 2 + 0.025, p);
        box(0.07, h, 0.03, dark, x, y, z, p);
        box(0.07, 0.03, d, dark, x, y, z, p);
        const shF = box(0.03, h, d * 0.45, door, x + s * 0.04, y, z - d * 0.68, p);
        shF.rotation.y = s * 0.35;
        const shB = box(0.03, h, d * 0.45, door, x + s * 0.04, y, z + d * 0.68, p);
        shB.rotation.y = -s * 0.35;
      };
      const jar = (x, z, r, p) => {
        ball(r, clay, x, r * 1.05, z, p, 1, 1.15, 1);
        cyl(r * 0.72, r * 0.72, 0.04, plank, x, r * 2.15, z, p); // ฝาไม้ปิดโอ่งน้ำ
      };
      const rail = (x0, x1, y, z, p) => {
        box(x1 - x0, 0.06, 0.06, dark, (x0 + x1) / 2, y, z, p);
        box(x1 - x0, 0.04, 0.05, dark, (x0 + x1) / 2, y - 0.42, z, p);
        for (let x = x0; x <= x1 + 0.01; x += (x1 - x0) / 8) box(0.045, 0.46, 0.045, dark, x, y - 0.23, z, p);
      };
      const railSide = (z0, z1, y, x, p) => {
        box(0.06, 0.06, z1 - z0, dark, x, y, (z0 + z1) / 2, p);
        box(0.05, 0.04, z1 - z0, dark, x, y - 0.42, (z0 + z1) / 2, p);
        for (let z = z0; z <= z1 + 0.01; z += (z1 - z0) / 4) box(0.045, 0.46, 0.045, dark, x, y - 0.23, z, p);
      };
      const bambooBench = (x, z, p) => {
        // แคร่ไม้ไผ่นั่งเล่นใต้ถุนบ้าน
        box(1.35, 0.06, 0.85, thatch, x, 0.38, z, p);
        for (const lx of [-0.58, 0.58])
          for (const lz of [-0.35, 0.35]) cyl(0.04, 0.04, 0.38, dark, x + lx, 0.19, z + lz, p);
      };
      /* 1) บ้านไม้สักทรงล้านนา 2 ชั้นยกใต้ถุนสูง พร้อมกาแลและชานเรือน */
      const big = g => {
        addGroundPatch(g, 7.6, 8.2, 0, 0.9);
        for (const x of [-1.9, 0, 1.9])
          for (const z of [-1.1, 1.1, 2.45]) {
            cyl(0.11, 0.13, 1.35, dark, x, 0.67, z, g);
            box(0.32, 0.08, 0.32, stone, x, 0.04, z, g); // ฐานตอม่อปูนรองเสาไม้ทุกต้นรวมถึงชานหน้าบ้าน
          }
        box(4.7, 0.16, 3.1, dark, 0, 1.34, 0, g);
        box(4.7, 0.12, 1.35, plank, 0, 1.35, 2.0, g);
        box(3.8, 1.65, 2.3, teak, 0, 2.2, -0.1, g);
        for (let i = 0; i < 8; i++) box(0.03, 1.62, 2.34, dark, -1.75 + i * 0.5, 2.2, -0.1, g);
        // ประตูไม้บานคู่พร้อมวงกบและโคมไฟหน้าห้องโถง
        box(0.96, 1.28, 0.08, dark, 0, 2.02, 1.05, g);
        box(0.84, 1.2, 0.09, door, 0, 2.0, 1.06, g);
        win(-1.25, 2.25, 1.06, 0.62, 0.62, g);
        win(1.25, 2.25, 1.06, 0.62, 0.62, g);
        winSide(-1.91, 2.25, -0.1, 0.68, 0.62, g);
        winSide(1.91, 2.25, -0.1, 0.68, 0.62, g);
        gable(5.6, 1.65, 4.1, tile, 0, 2.98, 0.1, g, teak);
        box(0.16, 0.14, 4.2, dark, 0, 4.62, 0.1, g);
        gable(3.2, 1.02, 0.12, teak, 0, 2.98, 2.12, g);
        // กาแลไม้แกะสลักไขว้ยอดจั่ว
        for (const z of [-1.95, 2.15])
          for (const s of [-1, 1]) box(0.08, 0.85, 0.07, dark, s * 0.17, 4.78, z, g).rotation.z = -s * 0.55;
        for (const x of [-2.2, 0, 2.2]) cyl(0.075, 0.085, 1.55, dark, x, 2.1, 2.55, g);
        box(5.1, 0.09, 1.25, tile2, 0, 2.84, 2.35, g).rotation.x = 0.22;
        rail(-2.2, -0.62, 1.82, 2.58, g);
        rail(0.62, 2.2, 1.82, 2.58, g);
        railSide(1.35, 2.58, 1.82, -2.2, g);
        railSide(1.35, 2.58, 1.82, 2.2, g);
        stairs(6, 0, 2.62, 0.24, 0.21, 0.22, 1.15, g);
        bambooBench(0.2, 0.1, g);
        jar(-1.55, 0.1, 0.3, g);
        jar(-1.05, 0.75, 0.22, g);
        box(1.1, 0.52, 0.55, stack, 1.45, 0.28, -0.2, g);
      };
      /* 2) บ้านไม้ชนบทยกพื้นมีระเบียงหน้าบ้าน */
      const mid = g => {
        addGroundPatch(g, 5.4, 6.2, 0, 0.7);
        for (const a of [-1, 1])
          for (const b of [-1, 1]) {
            cyl(0.085, 0.1, 1.1, dark, a * 1.1, 0.55, b * 0.8, g);
            box(0.26, 0.07, 0.26, stone, a * 1.1, 0.035, b * 0.8, g);
          }
        for (const x of [-0.72, 0.72]) {
          cyl(0.07, 0.08, 1.1, dark, x, 0.55, 1.72, g);
          box(0.22, 0.06, 0.22, stone, x, 0.03, 1.72, g);
        }
        box(2.7, 0.12, 2.1, dark, 0, 1.1, 0, g);
        box(2.3, 1.35, 1.65, plank, 0, 1.82, -0.08, g);
        for (let i = -2; i <= 2; i++) box(0.025, 1.35, 1.68, dark, i * 0.55, 1.82, -0.08, g);
        box(0.62, 1.0, 0.07, dark, 0, 1.65, 0.76, g);
        box(0.54, 0.94, 0.08, door, 0, 1.64, 0.77, g);
        win(0.74, 1.9, 0.76, 0.46, 0.44, g);
        win(-0.74, 1.9, 0.76, 0.46, 0.44, g);
        winSide(-1.16, 1.9, -0.08, 0.48, 0.44, g);
        winSide(1.16, 1.9, -0.08, 0.48, 0.44, g);
        gable(3.3, 1.1, 2.65, tile2, 0, 2.48, 0, g, plank);
        box(0.12, 0.1, 2.7, dark, 0, 3.58, 0, g);
        // ระเบียงไม้และหลังคากันสาดหน้าบ้าน
        box(1.6, 0.09, 0.85, plank, 0, 1.11, 1.35, g);
        for (const x of [-0.72, 0.72]) cyl(0.055, 0.06, 1.25, dark, x, 1.72, 1.72, g);
        box(1.85, 0.07, 1.05, tile, 0, 2.32, 1.35, g).rotation.x = 0.22;
        rail(-0.72, -0.32, 1.52, 1.74, g);
        rail(0.32, 0.72, 1.52, 1.74, g);
        railSide(0.95, 1.74, 1.52, -0.72, g);
        railSide(0.95, 1.74, 1.52, 0.72, g);
        stairs(5, 0, 1.76, 0.2, 0.21, 0.2, 0.65, g);
        bambooBench(-0.2, 0.0, g);
        jar(-0.85, 1.05, 0.24, g);
        box(0.8, 0.42, 0.45, stack, 0.85, 0.22, 0.2, g);
      };
      /* 3) กระท่อมไม้ไผ่หลังคามุงจากพร้อมชานพักหน้าบ้าน */
      const hut = g => {
        addGroundPatch(g, 4.2, 4.6, 0, 0.45);
        for (const a of [-1, 1])
          for (const b of [-1, 1]) cyl(0.065, 0.075, 0.55, dark, a * 0.82, 0.27, b * 0.68, g);
        for (const x of [-0.62, 0.62]) cyl(0.055, 0.06, 0.5, dark, x, 0.25, 1.18, g);
        box(2.0, 0.1, 1.65, dark, 0, 0.54, 0, g);
        box(1.75, 1.15, 1.4, plank, 0, 1.15, -0.05, g);
        box(0.52, 0.86, 0.06, door, 0, 1.0, 0.66, g);
        win(0.56, 1.22, 0.66, 0.36, 0.34, g);
        win(-0.56, 1.22, 0.66, 0.36, 0.34, g);
        const rf = new THREE.Mesh(new THREE.ConeGeometry(1.78, 1.18, 4), thatch);
        rf.position.y = 2.26;
        rf.rotation.y = Math.PI / 4;
        rf.scale.set(1.08, 1, 0.96);
        rf.castShadow = true;
        g.add(rf);
        box(1.4, 0.08, 0.58, thatch, 0, 0.52, 0.98, g);
        stairs(3, 0, 1.26, 0.16, 0.17, 0.19, 0.55, g);
        box(0.65, 0.36, 0.38, stack, -1.1, 0.2, 0.35, g);
        jar(1.05, 0.85, 0.19, g);
      };
      /* 4) ยุ้งฉางเก็บข้าวล้านนา (หลองข้าว) ยกเสาสูงพร้อมแผ่นกันหนู */
      const barn = g => {
        addGroundPatch(g, 3.8, 4.2, 0, 0.35);
        for (const a of [-1, 1])
          for (const b of [-1, 1]) {
            cyl(0.07, 0.085, 1.0, dark, a * 0.68, 0.5, b * 0.56, g);
            cyl(0.22, 0.22, 0.04, stone, a * 0.68, 0.82, b * 0.56, g);
          }
        box(1.75, 0.1, 1.45, dark, 0, 1.02, 0, g);
        box(1.55, 1.05, 1.25, teak, 0, 1.58, 0, g);
        box(0.45, 0.65, 0.06, door, 0, 1.52, 0.64, g);
        gable(2.15, 0.92, 1.75, thatch, 0, 2.1, 0, g, teak);
        box(0.1, 0.08, 1.8, dark, 0, 3.02, 0, g);
        stairs(4, 0, 0.82, 0.2, 0.24, 0.19, 0.48, g);
        jar(-0.65, 0.75, 0.18, g);
      };
      /* 5) บ้านสวนชั้นเดียวก่อฐานอิฐปูนเปลือยพร้อมเฉลียงไม้หน้าบ้าน */
      const farm = g => {
        addGroundPatch(g, 6.2, 6.0, 0, 0.55);
        box(3.5, 0.24, 2.3, stone, 0, 0.12, -0.1, g);
        box(3.35, 1.55, 2.15, teak, 0, 1.0, -0.1, g);
        box(0.82, 1.2, 0.07, dark, 0, 0.84, 0.99, g);
        box(0.72, 1.14, 0.08, door, 0, 0.83, 1.0, g);
        win(-1.12, 1.1, 0.99, 0.62, 0.56, g);
        win(1.12, 1.1, 0.99, 0.62, 0.56, g);
        winSide(-1.68, 1.1, -0.1, 0.56, 0.52, g);
        winSide(1.68, 1.1, -0.1, 0.56, 0.52, g);
        gable(4.1, 1.3, 3.0, tile, 0, 1.76, 0, g, teak);
        box(0.16, 0.12, 3.05, dark, 0, 3.06, 0, g);
        for (const x of [-1.5, 0, 1.5]) cyl(0.065, 0.075, 1.45, dark, x, 0.82, 1.62, g);
        box(3.6, 0.08, 1.15, tile2, 0, 1.62, 1.42, g).rotation.x = 0.2;
        box(3.5, 0.14, 1.1, stone, 0, 0.07, 1.52, g);
        box(1.1, 0.08, 0.42, stone, 0, 0.04, 2.22, g);
        rail(-1.5, -0.45, 0.62, 1.64, g);
        rail(0.45, 1.5, 0.62, 1.64, g);
        box(0.42, 0.6, 0.42, stone, 1.25, 2.35, -0.65, g);
        jar(-1.45, 1.85, 0.22, g);
      };
      const spec = [
        [big, 4.4],
        [big, 4.4],
        [farm, 3.4],
        [mid, 3.0],
        [mid, 3.0],
        [farm, 3.4],
        [hut, 2.2],
        [hut, 2.2],
        [barn, 1.8],
        [mid, 3.0],
        [hut, 2.2],
        [barn, 1.8],
        [hut, 2.2],
        [farm, 3.4],
        [big, 4.4],
        [hut, 2.2]
      ];
      let placedN = 0;
      spec.forEach(([fn, rad], index) => {
        // ขยายสเกลบ้านให้มีขนาดสมจริงเมื่อเทียบกับตัวรถและคน (1.42x - 1.82x)
        const sc = 1.42 + rn() * 0.4;
        for (let k = 0; k < 300; k++) {
          const sd = rn() < 0.5 ? -1 : 1,
            t =
              index >= spec.length / 2
                ? tAt(136) + rn() * (tAt(169) - tAt(136))
                : 0.05 + rn() * 0.9,
            o = offRoad(t, sd * (10.5 + rn() * 9));
          if (!spotOK(o.x, o.z, rad * sc * 0.72 + 0.4)) continue;
          taken.push([o.x, o.z, rad * sc * 0.72]);
          const g = new THREE.Group();
          g.position.set(o.x, 0, o.z);
          g.rotation.y = Math.atan2(sd * o.tn.z, -sd * o.tn.x) + (rn() - 0.5) * 0.25;
          g.scale.setScalar(sc);
          scene.add(g);
          fn(g);
          placedN++;
          break;
        }
      });
      const tuftGeo = buildReedClusterGeo(false);
      const tufts = new THREE.InstancedMesh(tuftGeo, swayMat(0.5), 260),
        dm = new THREE.Object3D();
      let tc = 0;
      for (let i = 0; i < 900 && tc < 260; i++) {
        const t = 0.01 + rn() * 0.98,
          o = offRoad(t, (rn() < 0.5 ? -1 : 1) * (3.9 + rn() * 2.6));
        if (!spotOK(o.x, o.z, 0.15)) continue;
        dm.position.set(o.x, 0.14, o.z);
        dm.rotation.set((rn() - 0.5) * 0.4, rn() * 6, (rn() - 0.5) * 0.4);
        dm.scale.setScalar(0.2 + rn() * 0.22);
        dm.updateMatrix();
        tufts.setMatrixAt(tc++, dm.matrix);
      }
      tufts.count = tc;
      tufts.instanceMatrix.needsUpdate = true;
      tufts.receiveShadow = true;
      scene.add(tufts);
    }

    /* ============================================================================
     * src/scene/16-mood-bubble.js
     * ฟองข้อความอารมณ์ลอยเหนือรถ (placeBubble)
     * (ไฟล์นี้ถูกต่อรวมเป็น closure เดียวกับไฟล์อื่น — ไม่ต้อง import/export · ลำดับไฟล์ดู build.config.mjs)
     * ========================================================================== */

    /* floating mood bubble above the car */
    const bubV = new THREE.Vector3(),
      bubEl = $('moodBubble');
    function placeBubble() {
      if (bubEl.hidden) return;
      bubV.set(car.position.x, car.position.y + 3.4, car.position.z);
      bubV.project(camera);
      const w = renderer.domElement.clientWidth,
        h = renderer.domElement.clientHeight;
      if (!(bubV.z < 1) || !w) {
        bubEl.style.visibility = 'hidden';
        return;
      }
      bubEl.style.visibility = 'visible';
      const x = Math.max(80, Math.min(w - 80, (bubV.x * 0.5 + 0.5) * w)),
        y = Math.max(120 + (window.__hudH || 0), (-bubV.y * 0.5 + 0.5) * h);
      bubEl.style.transform = 'translate(' + x.toFixed(1) + 'px,' + y.toFixed(1) + 'px)';
    }

    /* ============================================================================
     * src/scene/17-sky-birds.js
     * นกที่บินอยู่ในฉาก
     * (ไฟล์นี้ถูกต่อรวมเป็น closure เดียวกับไฟล์อื่น — ไม่ต้อง import/export · ลำดับไฟล์ดู build.config.mjs)
     * ========================================================================== */

    const birds = [];
    {
      const birdMats = [mat(0x4a6b7c), mat(0xf4f1e8), mat(0x5c4a3e), mat(0x2f3e46)];
      const bodyGeo = new THREE.ConeGeometry(0.11, 0.52, 6);
      bodyGeo.rotateX(Math.PI / 2);
      const tailGeo = new THREE.ConeGeometry(0.14, 0.22, 4);
      tailGeo.rotateX(-Math.PI / 2);
      const wingInGeo = new THREE.BoxGeometry(0.26, 0.028, 0.19);
      const wingOutGeo = new THREE.BoxGeometry(0.24, 0.02, 0.14);
      // คงจำนวนการเรียก rand() เดิมไว้ 18 ครั้งเพื่อไม่ให้ลำดับสุ่มของสัตว์และรถเปลี่ยน
      for (let k = 0; k < 6; k++) {
        rand();
        rand();
        rand();
      }
      const bRn = (() => {
        let s = 24681357;
        return () => {
          s = (s * 16807) % 2147483647;
          return (s - 1) / 2147483646;
        };
      })();
      const modes = ['soar', 'fig8', 'swoop', 'flock'];
      for (let i = 0; i < 16; i++) {
        const g = new THREE.Group();
        const bm = birdMats[i % birdMats.length];
        const body = new THREE.Mesh(bodyGeo, bm);
        const tail = new THREE.Mesh(tailGeo, bm);
        tail.position.z = -0.28;
        g.add(body, tail);

        const wl = new THREE.Group(),
          wr = new THREE.Group();
        wl.position.x = -0.06;
        wr.position.x = 0.06;
        const wlIn = new THREE.Mesh(wingInGeo, bm);
        wlIn.position.x = -0.13;
        const wlOut = new THREE.Mesh(wingOutGeo, bm);
        wlOut.position.set(-0.34, -0.01, -0.02);
        wlOut.rotation.y = 0.18;
        wl.add(wlIn, wlOut);

        const wrIn = new THREE.Mesh(wingInGeo, bm);
        wrIn.position.x = 0.13;
        const wrOut = new THREE.Mesh(wingOutGeo, bm);
        wrOut.position.set(0.34, -0.01, -0.02);
        wrOut.rotation.y = -0.18;
        wr.add(wrIn, wrOut);
        g.add(wl, wr);

        const mode = modes[i % 4];
        const sc = 0.85 + bRn() * 0.45;
        g.scale.setScalar(sc);
        g.userData = {
          wl,
          wr,
          mode,
          r: 12 + bRn() * 18,
          sp: (0.28 + bRn() * 0.32) * (bRn() < 0.5 ? 1 : -1),
          ph: bRn() * 6.28,
          alt: 7.5 + bRn() * 9.5,
          ox: (bRn() - 0.5) * 28,
          oz: (bRn() - 0.5) * 28,
          flapSp: 6.5 + bRn() * 4.5,
          glidePh: bRn() * 6.28,
          flockIdx: i >> 2
        };
        g.position.set(0, 9, -10);
        scene.add(g);
        birds.push(g);
      }
    }

    // --- นกเกาะสายไฟและบินโฉบสลับที่เกาะบนสายไฟ (Wire-Perching & Swooping Birds) ---
    const wireBirds = [];
    {
      let wbSeed = 97531246;
      const wbRn = () => ((wbSeed = (wbSeed * 16807) % 2147483647) - 1) / 2147483646;
      const sampleWire = (pts, u) => {
        const n = pts.length - 1,
          f = Math.max(0, Math.min(n - 1e-4, u * n)),
          idx = Math.floor(f),
          t = f - idx,
          a = pts[idx],
          b = pts[idx + 1];
        return new THREE.Vector3(
          a.x + (b.x - a.x) * t,
          a.y + (b.y - a.y) * t,
          a.z + (b.z - a.z) * t
        );
      };

      // สีสันนกท้องถิ่นริมสายไฟ: นกนางแอ่นหลังน้ำเงินเข้ม, นกจาบคาฟ้าคราม, นกกระจอกน้ำตาลอบอุ่น, นกเอี้ยงเทาเข้ม
      const wbPalettes = [
        { back: mat(0x2d425a), belly: mat(0xf2ece1), throat: mat(0xc85a38), beak: mat(0x222222) },
        { back: mat(0x367588), belly: mat(0xe8eff2), throat: mat(0xd99b38), beak: mat(0x2a2a2a) },
        { back: mat(0x6e523d), belly: mat(0xdcd2c2), throat: mat(0x523b2b), beak: mat(0x3a3028) },
        { back: mat(0x3a3634), belly: mat(0x4d4845), throat: mat(0x3a3634), beak: mat(0xe8b028) }
      ];
      const legMat = mat(0x2b2420),
        eyeMat = mat(0x141210),
        wbBodyGeo = new THREE.SphereGeometry(0.058, 8, 7),
        wbBellyGeo = new THREE.SphereGeometry(0.052, 8, 6),
        wbHeadGeo = new THREE.SphereGeometry(0.042, 8, 7),
        wbEyeGeo = new THREE.SphereGeometry(0.008, 5, 5),
        wbBeakGeo = new THREE.ConeGeometry(0.012, 0.048, 5),
        wbTailGeo = new THREE.BoxGeometry(0.032, 0.008, 0.14),
        wbLegGeo = new THREE.CylinderGeometry(0.005, 0.004, 0.055, 4),
        wbWingInGeo = new THREE.BoxGeometry(0.18, 0.012, 0.095),
        wbWingOutGeo = new THREE.BoxGeometry(0.16, 0.009, 0.072);
      wbBodyGeo.scale(0.88, 0.85, 1.45);
      wbBellyGeo.scale(0.82, 0.76, 1.32);
      wbBeakGeo.rotateX(Math.PI / 2);

      const makeWireBird = pal => {
        const root = new THREE.Group(),
          bodyPivot = new THREE.Group();
        bodyPivot.position.y = 0.052;
        root.add(bodyPivot);

        // ขานกจับสายไฟ
        for (const sx of [-0.018, 0.018]) {
          const leg = new THREE.Mesh(wbLegGeo, legMat);
          leg.position.set(sx, 0.026, 0.005);
          leg.rotation.x = 0.15;
          root.add(leg);
        }

        // ลำตัวและอกนก
        const torso = new THREE.Mesh(wbBodyGeo, pal.back);
        torso.rotation.x = -0.32;
        const belly = new THREE.Mesh(wbBellyGeo, pal.belly);
        belly.position.set(0, -0.012, 0.008);
        belly.rotation.x = -0.32;
        bodyPivot.add(torso, belly);

        // หัวนก + ตา + จะงอยปาก
        const hd = new THREE.Group();
        hd.position.set(0, 0.048, 0.062);
        const headMesh = new THREE.Mesh(wbHeadGeo, pal.back);
        const throatMesh = new THREE.Mesh(wbHeadGeo, pal.throat);
        throatMesh.scale.set(0.85, 0.72, 0.88);
        throatMesh.position.set(0, -0.014, 0.012);
        const beak = new THREE.Mesh(wbBeakGeo, pal.beak);
        beak.position.set(0, -0.002, 0.056);
        hd.add(headMesh, throatMesh, beak);
        for (const sx of [-0.032, 0.032]) {
          const eye = new THREE.Mesh(wbEyeGeo, eyeMat);
          eye.position.set(sx, 0.008, 0.024);
          hd.add(eye);
        }
        bodyPivot.add(hd);

        // หางแฉกแบบนกนางแอ่นกระดกทรงตัว
        const tail = new THREE.Group();
        tail.position.set(0, -0.018, -0.068);
        for (const sx of [-1, 1]) {
          const tf = new THREE.Mesh(wbTailGeo, pal.back);
          tf.position.set(sx * 0.014, 0, -0.055);
          tf.rotation.y = sx * -0.16;
          tail.add(tf);
        }
        tail.rotation.x = -0.22;
        bodyPivot.add(tail);

        // ปีกซ้าย-ขวา (พับแนบลำตัวตอนเกาะ และกางกระพือตอนบิน)
        const wl = new THREE.Group(),
          wr = new THREE.Group();
        wl.position.set(-0.042, 0.012, 0.01);
        wr.position.set(0.042, 0.012, 0.01);
        const wlIn = new THREE.Mesh(wbWingInGeo, pal.back),
          wlOut = new THREE.Mesh(wbWingOutGeo, pal.back);
        wlIn.position.x = -0.085;
        wlOut.position.set(-0.22, -0.004, -0.012);
        wlOut.rotation.y = 0.22;
        wl.add(wlIn, wlOut);

        const wrIn = new THREE.Mesh(wbWingInGeo, pal.back),
          wrOut = new THREE.Mesh(wbWingOutGeo, pal.back);
        wrIn.position.x = 0.085;
        wrOut.position.set(0.22, -0.004, -0.012);
        wrOut.rotation.y = -0.22;
        wr.add(wrIn, wrOut);
        bodyPivot.add(wl, wr);
        root.userData.selfCulled = true;

        return { root, bodyPivot, hd, tail, wl, wr };
      };

      // วางกลุ่มนกเกาะสายไฟกระจายตามช่วงเสาไฟ โดยเว้นระยะห่างขั้นต่ำ 42m ไม่ให้กระจุกตัวช่วงจันจว้า-เวียงแก่น
      const placedBirdSpans = [];
      for (let si = 0; si < wireSpans.length; si++) {
        if (wbRn() < 0.38) continue;
        const sp = wireSpans[si];
        if (placedBirdSpans.some(q => (q.cx - sp.cx) * (q.cx - sp.cx) + (q.cz - sp.cz) * (q.cz - sp.cz) < 42 * 42)) continue;
        placedBirdSpans.push(sp);
        const cnt = 1 + Math.floor(wbRn() * 3), // ช่วงละ 1 - 3 ตัว พอดีตา ไม่รก
          baseU = 0.2 + wbRn() * 0.35;
        for (let k = 0; k < cnt; k++) {
          const onUpper = wbRn() < 0.58,
            ptsA = onUpper ? sp.pts1 : sp.pts2,
            ptsB = onUpper ? sp.pts2 : sp.pts1,
            uA = Math.min(0.86, Math.max(0.14, baseU + k * (0.08 + wbRn() * 0.08))),
            uB = Math.min(0.86, Math.max(0.14, 0.16 + wbRn() * 0.68)),
            pA = sampleWire(ptsA, uA),
            pB = sampleWire(ptsB, uB),
            pal = wbPalettes[(si + k) % wbPalettes.length],
            bObj = makeWireBird(pal),
            sc = 1.22 + wbRn() * 0.28,
            faceSide = wbRn() < 0.75 ? 1 : -1,
            perchYaw = sp.yaw + (Math.PI / 2) * faceSide + (wbRn() - 0.5) * 0.28;

          bObj.root.scale.setScalar(sc);
          bObj.root.position.copy(pA);
          bObj.root.rotation.y = perchYaw;
          scene.add(bObj.root);

          const perchDur = 5.0 + wbRn() * 9.5,
            flyDur = 2.6 + wbRn() * 1.6;
          wireBirds.push({
            ...bObj,
            span: sp,
            pA,
            pB,
            atB: false,
            perchYaw,
            sc,
            timer: wbRn() * (perchDur + flyDur), // เหลื่อมจังหวะให้มีทั้งตัวที่กำลังเกาะและตัวที่กำลังบินโฉบ
            perchDur,
            flyDur,
            arcH: 1.4 + wbRn() * 2.4,
            loopSide: (wbRn() < 0.5 ? -1 : 1) * (1.6 + wbRn() * 2.6),
            loopAlong: (wbRn() - 0.5) * 3.2,
            ph: wbRn() * 6.28,
            flapSp: 14 + wbRn() * 5,
            spookCool: 0
          });
        }
      }
    }

    function updateWireBirds(dt, time, cx, cz) {
      const isNight = state.night;
      for (let i = 0; i < wireBirds.length; i++) {
        const wb = wireBirds[i];
        if (isNight) {
          wb.root.visible = false;
          continue;
        }
        const dx = wb.span.cx - cx,
          dz = wb.span.cz - cz,
          d2 = dx * dx + dz * dz;
        if (d2 > 58 * 58) {
          wb.root.visible = false;
          continue;
        }
        wb.root.visible = true;

        const cycle = wb.perchDur + wb.flyDur;
        wb.timer += dt;
        // เมื่อรถขับเข้าใกล้ในระยะ 25 เมตร มีโอกาสที่นกบางตัวจะบินโฉบเปลี่ยนที่เกาะบนสายไฟ
        if (d2 < 25 * 25 && wb.timer < wb.perchDur - 0.6 && time > wb.spookCool && (i % 3 === 0)) {
          wb.timer = wb.perchDur - 0.15;
          wb.spookCool = time + 12;
        }
        if (wb.timer >= cycle) {
          wb.timer -= cycle;
          wb.atB = !wb.atB; // สลับจุดเกาะระหว่าง pA กับ pB
        }

        const pStart = wb.atB ? wb.pB : wb.pA,
          pEnd = wb.atB ? wb.pA : wb.pB;

        if (wb.timer < wb.perchDur) {
          // --- โหมดเกาะสายไฟ: หันมองซ้ายขวา กระดกหางทรงตัว และขยับปีกเบาๆ ---
          wb.root.position.copy(pStart);
          wb.root.rotation.set(0, wb.perchYaw, 0);

          const idleWave = Math.sin(time * 2.4 + wb.ph),
            lookStep = Math.sin(time * 1.1 + wb.ph * 1.7) + 0.5 * Math.sin(time * 3.1 + wb.ph);
          wb.bodyPivot.position.y = 0.052 + Math.abs(idleWave) * 0.004;
          wb.bodyPivot.rotation.x = Math.sin(time * 1.8 + wb.ph) * 0.05;
          wb.hd.rotation.y = Math.max(-0.65, Math.min(0.65, lookStep * 0.38));
          wb.hd.rotation.z = Math.sin(time * 1.5 + wb.ph * 2.1) * 0.14;
          wb.hd.rotation.x = Math.sin(time * 2.7 + wb.ph) * 0.08;
          wb.tail.rotation.x = -0.22 + Math.sin(time * 3.2 + wb.ph) * 0.12;

          // พับปีกแนบลำตัว (มีขยับกระตุกปีกเล็กน้อยเป็นบางจังหวะ)
          const flutter = Math.max(0, Math.sin(time * 1.9 + wb.ph * 3) - 0.92) * 5.0;
          wb.wl.scale.x = 0.28 + flutter * 0.35;
          wb.wr.scale.x = 0.28 + flutter * 0.35;
          wb.wl.rotation.set(0.22, 0.42, -0.18 + flutter * 0.4);
          wb.wr.rotation.set(0.22, -0.42, 0.18 - flutter * 0.4);
        } else {
          // --- โหมดบินโฉบขึ้นจากสายไฟ วนโค้ง แล้วร่อนลงจับสายไฟอย่างนุ่มนวล ---
          const f = Math.min(1, (wb.timer - wb.perchDur) / wb.flyDur),
            sm = f * f * (3 - 2 * f),
            arc = Math.sin(f * Math.PI),
            subWave = Math.sin(f * Math.PI * 2),
            sY = Math.sin(wb.span.yaw),
            cY = Math.cos(wb.span.yaw),
            nx = cY,
            nz = -sY;

          const curX = pStart.x + (pEnd.x - pStart.x) * sm + nx * arc * wb.loopSide + sY * subWave * wb.loopAlong,
            curZ = pStart.z + (pEnd.z - pStart.z) * sm + nz * arc * wb.loopSide + cY * subWave * wb.loopAlong,
            curY = pStart.y + (pEnd.y - pStart.y) * sm + arc * wb.arcH + Math.sin(f * Math.PI * 3) * 0.22;

          // คำนวณทิศทางความเร็วเพื่อหันหัวและเอียงตัวตามวิถีโค้ง
          const df = 0.02,
            f2 = Math.min(1, f + df),
            sm2v = f2 * f2 * (3 - 2 * f2),
            arc2 = Math.sin(f2 * Math.PI),
            sub2 = Math.sin(f2 * Math.PI * 2),
            nxX = pStart.x + (pEnd.x - pStart.x) * sm2v + nx * arc2 * wb.loopSide + sY * sub2 * wb.loopAlong,
            nxZ = pStart.z + (pEnd.z - pStart.z) * sm2v + nz * arc2 * wb.loopSide + cY * sub2 * wb.loopAlong,
            nxY = pStart.y + (pEnd.y - pStart.y) * sm2v + arc2 * wb.arcH + Math.sin(f2 * Math.PI * 3) * 0.22;

          const vx = nxX - curX,
            vy = nxY - curY,
            vz = nxZ - curZ,
            flyYaw = Math.atan2(vx, vz);

          wb.root.position.set(curX, curY, curZ);

          // ช่วงกำลังจะแตะสายไฟ (f > 0.78) ค่อยๆ หมุนตัวเข้าหามุมเกาะและเชิดอกชะลอความเร็ว (Landing Flare)
          const landBlend = f > 0.78 ? (f - 0.78) / 0.22 : 0;
          let dYaw = wb.perchYaw - flyYaw;
          dYaw = Math.atan2(Math.sin(dYaw), Math.cos(dYaw));
          wb.root.rotation.y = flyYaw + dYaw * (landBlend * landBlend);
          wb.root.rotation.x = (1 - landBlend) * Math.max(-0.45, Math.min(0.45, -vy * 3.5)) - landBlend * 0.25;
          wb.root.rotation.z = (1 - landBlend) * Math.sin(f * Math.PI * 2) * -0.28;

          wb.bodyPivot.position.y = 0.052;
          wb.bodyPivot.rotation.x = 0.22 * (1 - landBlend);
          wb.hd.rotation.set(0, 0, 0);
          wb.tail.rotation.x = -0.1 + landBlend * 0.35; // กางกดหางช่วยเบรกตอนลงเกาะ

          // กางปีกเต็มความกว้างและกระพือปีก (กระพือถี่ขึ้นตอนเทคออฟและตอนเบรกลงเกาะ)
          const wingOpen = f < 0.08 ? f / 0.08 : f > 0.92 ? (1 - f) / 0.08 : 1,
            flapBoost = f < 0.25 || f > 0.75 ? 1.35 : 0.9,
            flap = Math.sin(time * wb.flapSp * flapBoost + wb.ph) * 0.68;
          wb.wl.scale.x = 0.28 + 0.72 * wingOpen;
          wb.wr.scale.x = 0.28 + 0.72 * wingOpen;
          wb.wl.rotation.set(0, 0, flap * wingOpen);
          wb.wr.rotation.set(0, 0, -flap * wingOpen);
        }
      }
    }

    /* ============================================================================
     * src/scene/18-animals.js
     * สัตว์ริมทาง (กวาง ควาย วัว สุนัข กระต่าย ไก่) และแอนิเมชัน
     * (ไฟล์นี้ถูกต่อรวมเป็น closure เดียวกับไฟล์อื่น — ไม่ต้อง import/export · ลำดับไฟล์ดู build.config.mjs)
     * ========================================================================== */

    const EYE = sm2(0x1b1512),
      NOSE = sm2(0x2a1f1a),
      HORN = sm2(0xe7dfc8),
      HOOF = sm2(0x3a3028),
      SPOT = sm2(0x4a3526);
    function quad(o) {
      const g = new THREE.Group(),
        m = sm2(o.c),
        dk = sm2(o.d || o.c),
        L = o.leg,
        by = L + o.bh * 0.85;
      ball(1, m, 0, by, 0, g, o.bw, o.bh, o.bl);
      ball(1, m, 0, by + o.bh * 0.05, o.bl * 0.5, g, o.bw * 0.96, o.bh * 0.97, o.bl * 0.5);
      ball(1, m, 0, by, -o.bl * 0.5, g, o.bw * 0.92, o.bh * 0.93, o.bl * 0.45);
      if (o.spots)
        for (const q of [
          [0.7, 0.55, 0.1, 1.3],
          [-0.6, 0.6, -0.4, 1.1],
          [0.55, 0.5, -0.6, 0.9]
        ])
          ball(0.12, SPOT, q[0] * o.bw, by + o.bh * q[1], q[2] * o.bl, g, 1, 0.7, q[3]);
      const a = o.na,
        nl = o.neck,
        nz = Math.sin(a) * nl,
        ny = Math.cos(a) * nl,
        nk = new THREE.Group();
      nk.position.set(0, by + o.bh * 0.45, o.bl * 0.8);
      g.add(nk);
      cyl(o.nr * 0.85, o.nr * 1.25, nl, m, 0, ny / 2, nz / 2, nk, a, 0);
      const hd = new THREE.Group();
      hd.position.set(0, ny, nz);
      hd.rotation.x = a * 0.3;
      nk.add(hd);
      ball(1, m, 0, 0, o.hl * 0.3, hd, o.hw, o.hw * 1.05, o.hl);
      ball(1, dk, 0, -o.hw * 0.2, o.hl * 0.9, hd, o.hw * 0.65, o.hw * 0.6, o.hl * 0.45);
      ball(o.hw * 0.2, NOSE, 0, -o.hw * 0.15, o.hl * 1.32, hd);
      for (const s of [-1, 1]) {
        ball(o.hw * 0.2, EYE, s * o.hw * 0.85, o.hw * 0.35, o.hl * 0.5, hd);
        const e = ball(o.ew, dk, s * (o.hw + o.ew * 0.3), o.hw * 0.7, -o.hl * 0.1, hd, 0.4, 1.1, 0.45);
        e.rotation.z = -s * 0.75;
        if (o.horn)
          cyl(
            o.hw * 0.28,
            o.hw * 0.06,
            o.hl * 1.3 * o.horn,
            HORN,
            s * (o.hw + 0.03),
            o.hw * 0.9,
            -o.hl * 0.2,
            hd,
            -0.35,
            -s * 1.15
          );
        if (o.antler) {
          cyl(0.012, 0.008, 0.4, HORN, s * 0.06, o.hw + 0.17, -0.04, hd, -0.25, -s * 0.3);
          cyl(0.01, 0.005, 0.2, HORN, s * 0.1, o.hw + 0.2, 0.02, hd, 0.4, -s * 0.7);
        }
      }
      for (const s of [-1, 1])
        for (const zz of [o.bl * 0.55, -o.bl * 0.55]) {
          ball(o.lt * 0.075, m, s * o.bw * 0.62, L, zz, g, 1, 1.8, 1.2);
          cyl(0.04 * o.lt, 0.028 * o.lt, L, m, s * o.bw * 0.62, L / 2, zz, g);
          cyl(0.034 * o.lt, 0.04 * o.lt, 0.06, HOOF, s * o.bw * 0.62, 0.03, zz, g);
        }
      cyl(0.02, 0.035, o.bl * 0.5, dk, 0, by + o.bh * 0.3, -o.bl * 0.98, g, -0.6, 0);
      g.userData.head = nk;
      return g;
    }
    function rabbit() {
      const g = new THREE.Group(),
        m = sm2(0xb9a58b),
        w = sm2(0xf4eee2);
      ball(0.13, m, 0, 0.16, 0, g, 0.85, 0.85, 1.3);
      ball(0.1, m, 0, 0.17, -0.14, g);
      const h = new THREE.Group();
      h.position.set(0, 0.22, 0.19);
      g.add(h);
      ball(0.08, m, 0, 0.05, 0.03, h, 0.9, 0.9, 1.1);
      for (const s of [-1, 1]) {
        const e = ball(0.03, m, s * 0.035, 0.19, -0.01, h, 0.5, 2.8, 0.35);
        e.rotation.z = -s * 0.2;
        ball(0.012, EYE, s * 0.055, 0.09, 0.07, h);
        ball(0.045, m, s * 0.07, 0.07, -0.09, g, 0.8, 1.2, 1.5);
        ball(0.025, m, s * 0.05, 0.05, 0.1, g, 0.8, 1.5, 0.8);
      }
      ball(0.018, NOSE, 0, 0.04, 0.11, h);
      ball(0.05, w, 0, 0.2, -0.25, g);
      g.scale.setScalar(1.8);
      g.userData.head = h;
      return g;
    }
    function chicken() {
      const g = new THREE.Group(),
        m = sm2(0xefe6d3),
        r = sm2(0xc83d2f),
        y = sm2(0xe9a93a),
        d = sm2(0x7a4a2a);
      ball(0.13, m, 0, 0.28, 0, g, 0.85, 0.95, 1.25).rotation.x = -0.25;
      ball(0.1, d, 0, 0.3, -0.18, g, 0.5, 0.9, 1);
      cyl(0.01, 0.07, 0.3, d, 0, 0.42, -0.25, g, -0.8, 0);
      cyl(0.04, 0.06, 0.2, m, 0, 0.4, 0.1, g, 0.4, 0);
      const h = new THREE.Group();
      h.position.set(0, 0.5, 0.15);
      g.add(h);
      ball(0.06, m, 0, 0, 0, h);
      ball(0.03, r, 0, 0.06, 0, h, 0.5, 1.4, 1.8);
      cyl(0.001, 0.025, 0.05, y, 0, -0.005, 0.07, h, Math.PI / 2);
      ball(0.02, r, 0, -0.06, 0.03, h);
      for (const s of [-1, 1]) {
        ball(0.012, EYE, s * 0.04, 0.015, 0.03, h);
        cyl(0.012, 0.012, 0.2, y, s * 0.05, 0.1, 0, g);
      }
      g.scale.setScalar(1.8);
      g.userData.head = h;
      return g;
    }
    function critter(type) {
      let g;
      switch (type) {
        case 'deer':
          g = quad({
            c: 0xa9774a,
            d: 0xd9c4a3,
            bl: 0.55,
            bh: 0.24,
            bw: 0.2,
            leg: 0.6,
            lt: 0.75,
            neck: 0.5,
            na: 0.5,
            nr: 0.06,
            hl: 0.16,
            hw: 0.07,
            ew: 0.07,
            antler: 1
          });
          g.scale.setScalar(1.3);
          break;
        case 'buffalo':
          g = quad({
            c: 0x59544f,
            d: 0x413d39,
            bl: 0.7,
            bh: 0.36,
            bw: 0.33,
            leg: 0.36,
            lt: 1.5,
            neck: 0.3,
            na: 1.1,
            nr: 0.13,
            hl: 0.26,
            hw: 0.13,
            ew: 0.1,
            horn: 1
          });
          g.scale.setScalar(1.45);
          break;
        case 'cow':
          g = quad({
            c: 0xe8dfcf,
            d: 0xe3b3a6,
            bl: 0.62,
            bh: 0.32,
            bw: 0.28,
            leg: 0.42,
            lt: 1.3,
            neck: 0.3,
            na: 0.95,
            nr: 0.1,
            hl: 0.22,
            hw: 0.1,
            ew: 0.09,
            horn: 0.35,
            spots: 1
          });
          g.scale.setScalar(1.35);
          break;
        case 'dog':
          g = quad({
            c: 0xc99c5c,
            d: 0xf1e2c6,
            bl: 0.28,
            bh: 0.12,
            bw: 0.1,
            leg: 0.2,
            lt: 0.55,
            neck: 0.14,
            na: 0.6,
            nr: 0.05,
            hl: 0.1,
            hw: 0.055,
            ew: 0.045
          });
          g.scale.setScalar(1.35);
          break;
        case 'rabbit':
          g = rabbit();
          break;
        default:
          g = chicken();
      }
      g.userData.type = type;
      return g;
    }
    const animals = [],
      ATYPES = [
        'deer',
        'buffalo',
        'cow',
        'dog',
        'rabbit',
        'chicken',
        'buffalo',
        'deer',
        'cow',
        'rabbit',
        'chicken',
        'dog',
        'buffalo',
        'cow',
        'cow',
        'dog',
        'chicken',
        'rabbit',
        'buffalo',
        'deer'
      ];
    for (let i = 0, n = 0; n < ATYPES.length && i < 500; i++) {
      const t = 0.06 + rand() * 0.9,
        o = offRoad(t, (rand() < 0.5 ? -1 : 1) * (6.5 + rand() * 6));
      if (!spotOK(o.x, o.z, 1.3)) continue;
      const a = critter(ATYPES[n]);
      a.position.set(o.x, 0, o.z);
      a.userData.base = rand() * 6.28;
      taken.push([o.x, o.z, 1.2]);
      scene.add(a);
      animals.push(a);
      n++;
    }
    function animAnimal(a, i) {
      const u = a.userData;
      a.rotation.y = u.base + Math.sin(totalTime * 0.25 + i) * 0.12;
      if (u.head) {
        const k = Math.max(0, Math.sin(totalTime * (u.type === 'chicken' ? 2.2 : 0.35) + i * 1.9));
        u.head.rotation.x = (u.type === 'chicken' ? 0.8 : u.type === 'rabbit' ? 0.5 : 0.55) * k;
      }
    }

    /* ============================================================================
     * src/scene/19-vehicles.js
     * ยานพาหนะบนถนนทุกชนิด (รถเก๋ง กระบะ รถบัส ตุ๊กตุ๊ก จักรยาน ฯลฯ) และ mkVeh
     * (ไฟล์นี้ถูกต่อรวมเป็น closure เดียวกับไฟล์อื่น — ไม่ต้อง import/export · ลำดับไฟล์ดู build.config.mjs)
     * ========================================================================== */

    /* ============================================================================
     * ระบบ Event พิเศษแบบจัดเต็มตามสภาพอากาศและเวลา (Dynamic Events System)
     * ========================================================================== */
    window.dynamicEvents = [];
    
    // Helper สร้างคนแบบ Low-Poly ง่ายๆ สำหรับประกอบฉาก
    const createSimplePerson = (color, parent, px, py, pz) => {
        const pGrp = new THREE.Group();
        pGrp.position.set(px, py, pz);
        const body = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.15, 0.4, 6), sm2(color));
        body.position.y = 0.2; body.castShadow = true;
        const head = new THREE.Mesh(new THREE.SphereGeometry(0.12, 6, 6), sm2(0xffccaa));
        head.position.y = 0.5; head.castShadow = true;
        pGrp.add(body, head);
        parent.add(pGrp);
        return pGrp;
    };

    // =========================================================================
    // 0.1 พระบิณฑบาตยามเช้า & 0.2 ครูพานักเรียนข้ามทางม้าลาย (Detailed & Animated)
    // =========================================================================
    {
      const skinM = sm2(0xe6b896),
        darkSkinM = sm2(0xd4a17e),
        hairM = sm2(0x221b17),
        eyeM = sm2(0x14100e),
        robeM = sm2(0xe07b1a),       // จีวรสีกรักส้มทอง
        innerRobeM = sm2(0xc46210),  // สบงและสังฆาฏิสีเข้ม
        bowlM = new THREE.MeshStandardMaterial({ color: 0x222629, roughness: 0.28, metalness: 0.75 }), // บาตรเหล็กรมดำเงา
        lidM = sm2(0x8c6239),        // ฝาบาตรไม้
        khakiM = sm2(0xc8ad7f),      // ชุดกากีคุณครู
        khakiSkirtM = sm2(0xa68b5b),
        whiteShirtM = sm2(0xfaf8f2), // เสื้อนักเรียนสีขาว
        navyM = sm2(0x1d2d4e),       // กางเกง/กระโปรงนักเรียนกรมท่า
        shoeM = sm2(0x24201e),
        flagRedM = sm2(0xe62e25),
        flagPoleM = sm2(0xd8dfe6),
        matReedM = sm2(0xc2a878),    // เสื่อกกปูพื้น
        silverM = new THREE.MeshStandardMaterial({ color: 0xdce2e8, roughness: 0.3, metalness: 0.7 }),
        goldTrayM = sm2(0xe8b93a),
        lotusPinkM = sm2(0xf28db2),
        lotusGreenM = sm2(0x528c4e),
        bagCols = [sm2(0x3a6ea5), sm2(0xc84b4b), sm2(0x4b8b5b)];

      // --- ฟังก์ชันสร้างพระสงฆ์และสามเณรอุ้มบาตร (เดินก้าวขาสมจริง) ---
      const makeDetailedMonk = (sc = 1.0, isNovice = false) => {
        const root = new THREE.Group();
        root.scale.setScalar(sc);

        // ขาซ้าย-ขวา (ก้าวเดินใต้สบง) + เท้าเปล่า (พระบิณฑบาตถอดรองเท้า)
        const legL = new THREE.Group(), legR = new THREE.Group();
        legL.position.set(-0.08, 0.72, 0);
        legR.position.set(0.08, 0.72, 0);
        for (const [lg, side] of [[legL, -1], [legR, 1]]) {
          cyl(0.068, 0.058, 0.56, innerRobeM, 0, -0.28, 0, lg);
          cyl(0.045, 0.04, 0.16, darkSkinM, 0, -0.60, 0, lg);
          ball(0.052, darkSkinM, 0, -0.69, 0.035, lg, 0.9, 0.55, 1.55);
          root.add(lg);
        }

        // สบงและจีวรห่มคลุมลำตัว
        cyl(0.16, 0.23, 0.72, innerRobeM, 0, 0.52, 0, root);
        const torso = new THREE.Mesh(new THREE.CapsuleGeometry(0.175, 0.28, 5, 12), robeM);
        torso.position.set(0, 1.05, 0);
        torso.scale.set(1.08, 1, 0.88);
        torso.castShadow = true;
        root.add(torso);

        // ผ้าสังฆาฏิพาดบ่าซ้าย
        const sanghati = box(0.09, 0.52, 0.22, innerRobeM, -0.10, 1.08, 0.02, root);
        sanghati.rotation.z = 0.06;

        // ย่ามพระสะพายข้างขวา
        cyl(0.015, 0.015, 0.58, innerRobeM, 0.14, 1.08, -0.02, root, 0.15, -0.35);
        box(0.08, 0.24, 0.22, innerRobeM, 0.23, 0.78, -0.04, root);

        // คอและศีรษะปลงผม + คิ้วขาวจางๆ + ใบหน้าสงบสำรวม (ก้มมองต่ำเล็กน้อย)
        cyl(0.048, 0.055, 0.10, skinM, 0, 1.36, 0, root);
        const headG = new THREE.Group();
        headG.position.set(0, 1.50, 0.01);
        headG.rotation.x = 0.12; // สำรวมสายตาลงต่ำตามพระธรรมวินัย
        root.add(headG);
        ball(0.132, skinM, 0, 0, 0, headG, 0.95, 1.06, 0.98);
        for (const s of [-1, 1]) {
          ball(0.028, skinM, s * 0.125, -0.005, 0, headG, 0.5, 1.05, 0.7);
          ball(0.014, eyeM, s * 0.044, 0.005, 0.118, headG);
        }

        // สองแขนประคองอุ้มบาตรด้านหน้าพร้อมสายถลกบาตรคล้องไหล่
        for (const s of [-1, 1]) {
          cyl(0.052, 0.044, 0.30, isNovice && s === 1 ? skinM : robeM, s * 0.19, 1.12, 0.06, root, -0.55, -s * 0.28);
          cyl(0.042, 0.036, 0.24, skinM, s * 0.13, 0.96, 0.20, root, -1.15, s * 0.42);
          ball(0.04, skinM, s * 0.08, 0.92, 0.30, root);
        }

        // บาตรพระทรงกลมแป้นพร้อมฝาบาตรไม้และสายถลกบาตร
        const bowlG = new THREE.Group();
        bowlG.position.set(0, 0.98, 0.26);
        root.add(bowlG);
        const almsBowl = new THREE.Mesh(new THREE.SphereGeometry(0.155, 14, 10), bowlM);
        almsBowl.scale.set(1.06, 0.85, 1.06);
        almsBowl.castShadow = true;
        bowlG.add(almsBowl);
        cyl(0.125, 0.135, 0.025, lidM, 0, 0.115, 0, bowlG);
        ball(0.025, lidM, 0, 0.135, 0, bowlG);

        return { root, legL, legR, headG, bowlG };
      };

      // --- ฟังก์ชันสร้างชาวบ้านนั่งพับเพียบพนมมือใส่บาตรบนเสื่อกก ---
      const makeDevotee = (shirtCol, skirtCol, isMale = false) => {
        const g = new THREE.Group();
        const shM = sm2(shirtCol), skM = sm2(skirtCol);

        // ท่อนขาพับเพียบราบกับเสื่อ
        box(0.28, 0.12, 0.34, skM, 0, 0.07, -0.04, g);
        cyl(0.055, 0.048, 0.28, skM, -0.14, 0.06, -0.14, g, Math.PI / 2, 0.45);
        ball(0.045, skinM, -0.24, 0.04, -0.22, g, 0.9, 0.6, 1.4);

        // ลำตัวนั่งหลังตรงโน้มไปข้างหน้าเล็กน้อยด้วยความเคารพ
        const body = new THREE.Mesh(new THREE.CapsuleGeometry(0.145, 0.24, 5, 12), shM);
        body.position.set(0, 0.34, 0.02);
        body.rotation.x = 0.14;
        body.castShadow = true;
        g.add(body);

        // ผ้าสไบ/ผ้าขาวม้าพาดเฉียงบ่าซ้าย
        const sash = box(0.08, 0.38, 0.18, whiteShirtM, -0.07, 0.36, 0.04, g);
        sash.rotation.z = -0.32;
        sash.rotation.x = 0.14;

        // ศีรษะและทรงผม
        cyl(0.04, 0.045, 0.08, skinM, 0, 0.56, 0.05, g);
        const headG = new THREE.Group();
        headG.position.set(0, 0.68, 0.06);
        g.add(headG);
        ball(0.118, skinM, 0, 0, 0, headG, 0.95, 1.05, 0.98);
        ball(0.125, hairM, 0, 0.025, -0.018, headG, 0.98, 0.88, 1.04);
        if (!isMale) ball(0.065, hairM, 0, 0.05, -0.13, headG); // มวยผมผู้หญิงล้านนา
        for (const s of [-1, 1]) ball(0.013, eyeM, s * 0.038, 0.008, 0.106, headG);

        // แขนทั้งสองข้างยกพนมมือไหว้ (Wai Gesture) / ยกขันข้าวใส่บาตร
        const waiG = new THREE.Group();
        waiG.position.set(0, 0.44, 0.10);
        g.add(waiG);
        for (const s of [-1, 1]) {
          cyl(0.042, 0.036, 0.22, shM, s * 0.14, -0.04, 0.06, waiG, -0.75, -s * 0.35);
          cyl(0.035, 0.03, 0.20, skinM, s * 0.07, -0.01, 0.18, waiG, -1.25, s * 0.48);
        }
        // มือพนมประกบกันพร้อมดอกบัวสีชมพู
        ball(0.038, skinM, 0, 0.04, 0.25, waiG, 0.65, 1.35, 1.15);
        cyl(0.01, 0.01, 0.14, lotusGreenM, 0, 0.02, 0.28, waiG, 0.3, 0);
        ball(0.032, lotusPinkM, 0, 0.10, 0.30, waiG, 0.85, 1.35, 0.85);

        return { g, waiG, headG };
      };

      // วางฉากพระบิณฑบาตยามเช้า 2 จุดริมทาง (ย้ายออกจากโซนหนองน้ำ 0.88 มาอยู่ที่ 0.512 โซนชุมชนใกล้ซุ้มวัด และเว้นระยะห่างไม่ให้กระจุกตัว)
      [0.12, 0.512].forEach((t, spotIdx) => {
        const o = offRoad(t, -7.2);
        taken.push([o.x, o.z, 7.5]); // จองพื้นที่ไม่ให้ต้นไม้ เสาไฟ หรือคนเดินสุ่มเกิดทับซ้อน
        const monkGrp = new THREE.Group();
        monkGrp.position.set(o.x, 0, o.z);
        monkGrp.rotation.y = Math.atan2(-o.tn.x, -o.tn.z);

        // พื้นดินข้างทางใต้เสื่อ
        if (typeof window.__addGroundPatch === 'function') {
          window.__addGroundPatch(monkGrp, 4.4, 8.8, -0.6, 1.4);
        }

        // เสื่อกกปูพื้นยาวโปร่งสบาย (z = -0.95 ถึง z = 2.65) + ขันเงินตักบาตร + ถาดของไทยธรรมแยกหน้าญาติโยมแต่ละคนอย่างเป็นระเบียบ
        box(1.42, 0.02, 3.6, matReedM, -1.28, 0.01, 0.85, monkGrp);
        // ชุดตักบาตรหน้าคุณยาย (z = -0.15)
        cyl(0.18, 0.12, 0.08, goldTrayM, -0.82, 0.05, -0.15, monkGrp); // พานรองขันข้าว
        ball(0.15, silverM, -0.82, 0.16, -0.15, monkGrp, 1.1, 0.85, 1.1); // ขันเงินตักบาตร
        ball(0.12, whiteShirtM, -0.82, 0.23, -0.15, monkGrp, 1, 0.5, 1); // ข้าวสวยพูนขัน
        cyl(0.11, 0.11, 0.18, lidM, -0.84, 0.10, 0.32, monkGrp); // กระติบข้าวเหนียวสาน
        // ชุดตักบาตรหน้าหลานชาย (z = 1.65)
        box(0.32, 0.05, 0.42, goldTrayM, -0.82, 0.035, 1.65, monkGrp); // ถาดกับข้าวและดอกไม้ธูปเทียน
        ball(0.08, lotusPinkM, -0.82, 0.09, 1.55, monkGrp, 1.2, 0.6, 1.2);

        // ชาวบ้าน 2 คน (คุณยายเสื้อผ้าฝ้ายสีม่วงพาสเทล กับ หลานชายเสื้อหม้อห้อม) นั่งพับเพียบพนมมือเว้นระยะห่าง 1.80 ม. ไม่เบียดกัน
        const dev1 = makeDevotee(0xc7a4d0, 0x5c3d5e, false);
        dev1.g.position.set(-1.34, 0.02, -0.15);
        dev1.g.rotation.y = Math.PI / 2;
        monkGrp.add(dev1.g);

        const dev2 = makeDevotee(0x2f4a6b, 0x26364f, true);
        dev2.g.position.set(-1.36, 0.02, 1.65);
        dev2.g.scale.setScalar(0.86);
        dev2.g.rotation.y = Math.PI / 2;
        monkGrp.add(dev2.g);

        // พระสงฆ์ 2 รูป และสามเณร 1 รูป ยืนเรียงแถวรับบิณฑบาตอย่างสงบ (เว้นระยะห่างรูปละ 2.0 ม. ไม่กระจุกตัว)
        const monks = [
          { ...makeDetailedMonk(1.0, false), baseZ: -0.35, ph: 0 },
          { ...makeDetailedMonk(0.96, false), baseZ: 1.65, ph: 2.1 },
          { ...makeDetailedMonk(0.82, true), baseZ: 3.65, ph: 4.2 }
        ];
        monks.forEach(m => {
          m.root.position.set(0, 0, m.baseZ);
          monkGrp.add(m.root);
        });

        scene.add(monkGrp);
        window.dynamicEvents.push({
          group: monkGrp,
          condition: s => s.night === false && s.mood !== 'sad',
          update: (dt, time) => {
            // พระสงฆ์ก้าวช้าๆ สำรวมและหยุดรับบิณฑบาต/ให้พรอย่างนุ่มนวล (ใช้คลื่นต่อเนื่อง ไม่ให้กระตุกวาร์ปกลับ)
            const sway = Math.sin(time * 0.55 + spotIdx * 1.7),
              stepAmp = Math.max(0, Math.cos(time * 0.55 + spotIdx * 1.7)) * 0.22;
            monks.forEach(m => {
              const s = Math.sin(time * 2.6 + m.ph) * stepAmp;
              m.legL.rotation.x = s;
              m.legR.rotation.x = -s;
              m.root.position.z = m.baseZ + sway * 0.42;
              m.root.position.y = Math.abs(s) * 0.03;
              m.bowlG.position.y = 0.98 + Math.sin(time * 2.2 + m.ph) * 0.008;
            });
            const bow = Math.sin(time * 1.8) * 0.08;
            dev1.waiG.rotation.x = bow;
            dev1.headG.rotation.x = 0.12 + bow * 0.8;
            dev2.waiG.rotation.x = Math.sin(time * 1.8 + 1.2) * 0.08;
            dev2.headG.rotation.x = 0.10 + Math.sin(time * 1.8 + 1.2) * 0.06;
          }
        });
      });

      // =========================================================================
      // 0.2 ทางม้าลาย คุณครูถือธงแดง/นกหวีด และเด็กนักเรียนเดินข้ามถนนหน้าโรงเรียน
      // =========================================================================
      const crosswalkGrp = new THREE.Group();
      const cwT = T_SCHOOL_FIELD;
      const cwP = route.getPoint(cwT);
      const cwTn = route.getTangent(cwT);
      let stopT = cwT;
      let previousPoint = cwP;
      let stopDistance = 0;
      while (stopDistance < 8 && stopT > cwT - 0.04) {
        stopT = Math.max(cwT - 0.04, stopT - 0.0001);
        const point = route.getPoint(stopT);
        stopDistance += point.distanceTo(previousPoint);
        previousPoint = point;
      }
      window._schoolCrossingT = cwT;
      window._schoolCrossingStopT = stopT;
      window._schoolCrossingActive = false;
      crosswalkGrp.position.set(cwP.x, 0, cwP.z);
      crosswalkGrp.rotation.y = Math.atan2(cwTn.x, cwTn.z);

      // 1. แถบทางม้าลายขาว-แดงสะท้อนแสงมาตรฐานหน้าโรงเรียน + เส้นหยุดรถ (Stop Line)
      const zebraBackdrop = new THREE.Mesh(
        new THREE.BoxGeometry(6.1, 0.014, 3.2),
        new THREE.MeshLambertMaterial({ color: 0xb53832, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2 })
      );
      zebraBackdrop.position.set(0, 0.01, 0);
      crosswalkGrp.add(zebraBackdrop);

      const stripeWhiteM = new THREE.MeshBasicMaterial({
        color: 0xfcfcfc,
        polygonOffset: true,
        polygonOffsetFactor: -4,
        polygonOffsetUnits: -4
      });
      for (let i = -3; i <= 3; i++) {
        const stripe = new THREE.Mesh(new THREE.BoxGeometry(0.46, 0.018, 2.75), stripeWhiteM);
        stripe.position.set(i * 0.82, 0.014, 0);
        crosswalkGrp.add(stripe);
      }
      // เส้นทึบหยุดรถก่อนถึงทางม้าลายทั้ง 2 ฝั่งเลน
      for (const sz of [-2.35, 2.35]) {
        const stopLine = new THREE.Mesh(new THREE.BoxGeometry(2.8, 0.018, 0.22), stripeWhiteM);
        stopLine.position.set(sz < 0 ? -1.45 : 1.45, 0.014, sz);
        crosswalkGrp.add(stopLine);
      }

      // 2. เสาไฟกะพริบโซลาร์เซลล์เตือนทางม้าลาย (Solar Flashing School Crossing Beacon) สองฝั่งถนน
      const beaconBulbs = [];
      for (const sx of [-3.95, 3.95]) {
        const sz = sx < 0 ? -2.2 : 2.2;
        cyl(0.045, 0.055, 2.75, flagPoleM, sx, 1.38, sz, crosswalkGrp);
        // ป้ายเหลืองรูปคนข้ามทางม้าลาย
        const signDiamond = box(0.52, 0.52, 0.04, goldTrayM, sx, 2.15, sz, crosswalkGrp);
        signDiamond.rotation.z = Math.PI / 4;
        // โคมไฟกะพริบสีเหลืองอำพัน + แผงโซลาร์เซลล์ด้านบน
        box(0.22, 0.24, 0.14, shoeM, sx, 2.68, sz, crosswalkGrp);
        const bulbMat = new THREE.MeshBasicMaterial({ color: 0xffaa00 });
        const bulb = ball(0.075, bulbMat, sx, 2.68, sz + (sx < 0 ? 0.08 : -0.08), crosswalkGrp);
        beaconBulbs.push(bulbMat);
        const solar = box(0.38, 0.03, 0.32, sm2(0x1e3552), sx, 2.86, sz, crosswalkGrp);
        solar.rotation.x = 0.25;
      }

      // 3. โมเดลคุณครูเวรจราจรชุดกากี (สวมหมวกแก๊ป สายสะพายจราจร เป่านกหวีด มือขวาชูธงแดง มือซ้ายยกห้ามรถ)
      const teacherG = new THREE.Group();
      teacherG.position.set(-3.45, 0, -1.05);
      teacherG.rotation.y = Math.PI / 2; // หันหน้าเข้าหาถนนดูแลเด็กๆ
      crosswalkGrp.add(teacherG);

      // ขาและรองเท้าคัทชูคุณครู
      for (const s of [-1, 1]) {
        cyl(0.052, 0.044, 0.42, skinM, s * 0.085, 0.26, 0, teacherG);
        box(0.095, 0.06, 0.20, shoeM, s * 0.085, 0.035, 0.03, teacherG);
      }
      // กระโปรงทรงสอบสีกากีและเสื้อเครื่องแบบข้าราชการครูพร้อมอินธนูบนบ่า
      cyl(0.145, 0.185, 0.44, khakiSkirtM, 0, 0.66, 0, teacherG);
      const tTorso = new THREE.Mesh(new THREE.CapsuleGeometry(0.16, 0.26, 5, 12), khakiM);
      tTorso.position.set(0, 1.06, 0);
      tTorso.scale.set(1.06, 1, 0.84);
      tTorso.castShadow = true;
      teacherG.add(tTorso);
      for (const s of [-1, 1]) box(0.09, 0.025, 0.06, shoeM, s * 0.14, 1.29, 0, teacherG); // อินธนูข้าราชการครู
      // สายสะพายจราจรสีแดงคาดไหล่และเข็มขัด
      box(0.35, 0.045, 0.28, shoeM, 0, 0.87, 0, teacherG);
      const trafficSash = box(0.05, 0.46, 0.26, flagRedM, 0, 1.07, 0.01, teacherG);
      trafficSash.rotation.z = 0.52;

      // ศีรษะคุณครู + มวยผม + หมวกแก๊ปลูกเสือ/จราจร + นกหวีดสีเงิน
      cyl(0.042, 0.048, 0.09, skinM, 0, 1.35, 0, teacherG);
      const tHead = new THREE.Group();
      tHead.position.set(0, 1.48, 0);
      teacherG.add(tHead);
      ball(0.125, skinM, 0, 0, 0, tHead, 0.95, 1.05, 0.98);
      ball(0.132, hairM, 0, 0.02, -0.018, tHead, 0.98, 0.9, 1.02);
      ball(0.065, hairM, 0, -0.01, -0.135, tHead);
      for (const s of [-1, 1]) ball(0.014, eyeM, s * 0.042, 0.01, 0.112, tHead);
      // หมวกแก๊ปสีกากีพร้อมกระบังหน้า
      cyl(0.128, 0.128, 0.06, khakiSkirtM, 0, 0.095, 0, tHead);
      box(0.18, 0.016, 0.11, shoeM, 0, 0.07, 0.11, tHead).rotation.x = 0.18;
      // นกหวีดสีเงินที่ปาก
      cyl(0.014, 0.014, 0.045, silverM, 0, -0.045, 0.13, tHead, Math.PI / 2, 0);

      // แขนซ้ายคุณครูยกตั้งฉากส่งสัญญาณให้รถชะลอหยุด
      const tArmL = new THREE.Group();
      tArmL.position.set(-0.20, 1.24, 0);
      teacherG.add(tArmL);
      cyl(0.048, 0.042, 0.24, khakiM, 0, -0.08, 0.08, tArmL, -0.85, 0.2);
      cyl(0.038, 0.034, 0.22, skinM, 0, -0.04, 0.24, tArmL, -1.45, 0);
      ball(0.042, skinM, 0, 0.02, 0.36, tArmL, 0.9, 1.25, 0.6);

      // แขนขวาคุณครูถือธงแดงโบกนำทางให้นักเรียนข้ามถนน
      const tArmR = new THREE.Group();
      tArmR.position.set(0.20, 1.24, 0);
      teacherG.add(tArmR);
      cyl(0.048, 0.042, 0.26, khakiM, 0.06, -0.04, 0.06, tArmR, -0.65, -0.45);
      cyl(0.038, 0.034, 0.24, skinM, 0.16, 0.06, 0.18, tArmR, -1.1, -0.3);
      ball(0.04, skinM, 0.22, 0.14, 0.28, tArmR);
      // ด้ามธงและผืนธงแดงมีขอบสะท้อนแสง
      const flagHolder = new THREE.Group();
      flagHolder.position.set(0.22, 0.14, 0.28);
      tArmR.add(flagHolder);
      cyl(0.014, 0.016, 1.15, flagPoleM, 0, 0.42, 0, flagHolder);
      const flagCloth = box(0.02, 0.38, 0.54, flagRedM, 0, 0.78, 0.28, flagHolder);
      box(0.024, 0.06, 0.54, stripeWhiteM, 0, 0.78, 0.28, flagHolder); // แถบขาวสะท้อนแสงกลางธงแดง

      // 4. โมเดลเด็กนักเรียนชาย-หญิง สะพายกระเป๋าเป้เดินข้ามทางม้าลายเป็นแถว
      const makeCrossingKid = (isGirl, idx) => {
        const kid = new THREE.Group();
        const sc = 0.74 + (idx % 2) * 0.05;
        kid.scale.setScalar(sc);

        const legL = new THREE.Group(), legR = new THREE.Group();
        legL.position.set(-0.075, 0.70, 0);
        legR.position.set(0.075, 0.70, 0);
        for (const lg of [legL, legR]) {
          cyl(0.05, 0.042, 0.32, skinM, 0, -0.18, 0, lg);
          cyl(0.044, 0.04, 0.20, whiteShirtM, 0, -0.44, 0, lg); // ถุงเท้านักเรียนยาวสีขาว
          box(0.095, 0.055, 0.19, shoeM, 0, -0.56, 0.025, lg);   // รองเท้านักเรียนสีดำ
          kid.add(lg);
        }

        // กางเกงขาสั้นหรือกระโปรงจีบสีกรมท่า + เสื้อนักเรียนสีขาวปกกะลาสี/คอปก
        if (isGirl) {
          cyl(0.12, 0.185, 0.30, navyM, 0, 0.76, 0, kid);
        } else {
          cyl(0.14, 0.15, 0.24, navyM, 0, 0.76, 0, kid);
        }
        const kTorso = new THREE.Mesh(new THREE.CapsuleGeometry(0.145, 0.22, 5, 12), whiteShirtM);
        kTorso.position.set(0, 1.02, 0);
        kTorso.scale.set(1.05, 1, 0.84);
        kTorso.castShadow = true;
        kid.add(kTorso);
        cyl(0.12, 0.14, 0.05, navyM, 0, 1.20, 0.01, kid); // ปกเสื้อนักเรียน

        // กระเป๋าเป้นักเรียนสีสดใสสะพายหลัง
        box(0.24, 0.28, 0.13, bagCols[idx % bagCols.length], 0, 1.04, -0.14, kid);

        // ศีรษะและทรงผม (เด็กหญิงถักเปียผูกโบว์ขาว / เด็กชายผมรองทรง)
        cyl(0.04, 0.045, 0.08, skinM, 0, 1.28, 0, kid);
        const kHead = new THREE.Group();
        kHead.position.set(0, 1.40, 0);
        kid.add(kHead);
        ball(0.125, skinM, 0, 0, 0, kHead, 0.95, 1.04, 0.98);
        ball(0.132, hairM, 0, 0.022, -0.015, kHead, 0.98, 0.9, 1.02);
        for (const s of [-1, 1]) {
          ball(0.014, eyeM, s * 0.042, 0.008, 0.112, kHead);
          if (isGirl) {
            cyl(0.022, 0.015, 0.18, hairM, s * 0.115, -0.06, -0.04, kHead, 0.2, s * 0.25);
            box(0.045, 0.025, 0.025, whiteShirtM, s * 0.115, 0.01, -0.04, kHead); // โบว์ผูกผมสีขาว
          }
        }

        // แขนซ้าย-ขวา (มือขวาสามารถยกไหว้ขอบคุณรถ/คุณครู หรือยกมือข้ามทางม้าลาย)
        const armL = new THREE.Group(), armR = new THREE.Group();
        armL.position.set(-0.18, 1.18, 0);
        armR.position.set(0.18, 1.18, 0);
        for (const [ar, side] of [[armL, -1], [armR, 1]]) {
          cyl(0.044, 0.038, 0.14, whiteShirtM, 0, -0.06, 0, ar);
          cyl(0.035, 0.03, 0.20, skinM, 0, -0.20, 0, ar);
          ball(0.035, skinM, 0, -0.32, 0, ar);
          kid.add(ar);
        }

        return { kid, legL, legR, armL, armR, kHead, idx };
      };

      const crossingKids = [
        makeCrossingKid(true, 0),
        makeCrossingKid(false, 1),
        makeCrossingKid(true, 2)
      ];
      crossingKids.forEach(k => crosswalkGrp.add(k.kid));

      scene.add(crosswalkGrp);
      window.dynamicEvents.push({
        group: crosswalkGrp,
        condition: s => {
          if (s.night) window._schoolCrossingActive = false;
          return s.night === false;
        },
        update: (dt, time) => {
          // ไฟกะพริบโซลาร์เซลล์เตือนทางม้าลายสลับจังหวะ
          const blink = Math.sin(time * 7) > 0;
          if (beaconBulbs[0]) beaconBulbs[0].color.setHex(blink ? 0xffcc00 : 0x553b00);
          if (beaconBulbs[1]) beaconBulbs[1].color.setHex(!blink ? 0xffcc00 : 0x553b00);

          // วัฏจักร 14 วินาที: ช่วง 0..8 วินาที เด็กๆ เดินข้ามทางม้าลายพร้อมคุณครูโบกธง / ช่วง 8..14 วินาที ยืนรอริมทางอย่างปลอดภัย
          const cyc = time % 14;
          const isCrossing = cyc < 9.0;

          // แอนิเมชันคุณครูโบกธงแดงและหันมองซ้าย-ขวาดูรถให้เด็กๆ
          if (isCrossing) {
            tArmR.rotation.x = -0.35 + Math.sin(time * 5.5) * 0.28;
            tArmL.rotation.x = -0.45;
            flagCloth.rotation.y = Math.sin(time * 9) * 0.22;
            tHead.rotation.y = Math.sin(time * 2.4) * 0.35;
          } else {
            tArmR.rotation.x = 0.25;
            tArmL.rotation.x = 0.35;
            tHead.rotation.y = Math.sin(time * 1.2) * 0.15;
          }

          // แอนิเมชันเด็กนักเรียน 3 คนเดินเรียงแถวข้ามทางม้าลายไป-กลับเข้าประตูโรงเรียน
          crossingKids.forEach((k, i) => {
            const delay = i * 0.85;
            const localT = Math.max(0, Math.min(1, (cyc - delay) / 6.8));
            // สลับฝั่งเดินข้ามทุกๆ รอบวัฏจักร
            const dir = Math.floor(time / 14) % 2 === 0 ? 1 : -1;
            const startX = dir > 0 ? -3.6 - i * 0.65 : 3.6 + i * 0.65;
            const endX = dir > 0 ? 3.6 + i * 0.55 : -3.6 - i * 0.55;
            const curX = startX + (endX - startX) * localT;
            const curZ = (i - 1) * 0.52;

            k.kid.position.set(curX, 0, curZ);
            k.kid.rotation.y = dir > 0 ? Math.PI / 2 : -Math.PI / 2;

            const walkingNow = localT > 0.01 && localT < 0.99;
            if (walkingNow) {
              const ph = time * 8.5 + i * 1.7;
              const sw = Math.sin(ph) * 0.52;
              k.legL.rotation.x = sw;
              k.legR.rotation.x = -sw;
              k.armL.rotation.x = -sw * 0.7;
              // เด็กคนแรกชูมือขวาขึ้นเหนือหัวทำสัญลักษณ์ขอทางข้ามถนนอย่างน่ารัก
              k.armR.rotation.x = i === 0 ? -2.45 + Math.sin(time * 4) * 0.08 : sw * 0.7;
              k.kid.position.y = Math.abs(Math.sin(ph)) * 0.025;
              k.kHead.rotation.y = Math.sin(time * 3 + i) * 0.18;
            } else {
              k.legL.rotation.x = 0;
              k.legR.rotation.x = 0;
              k.armL.rotation.x = 0;
              k.armR.rotation.x = 0;
              k.kid.position.y = 0;
              k.kHead.rotation.y = Math.sin(time * 1.8 + i) * 0.12;
            }
          });
          window._schoolCrossingActive = crossingKids.some(
            k => k.kid.visible && Math.abs(k.kid.position.x) < 4.2
          );
        }
      });
    }

    // 1. งานเทศกาลกลางคืน (ไฟประดับริมทาง) [ออกเฉพาะกลางคืน]
    const festMat = new THREE.MeshBasicMaterial({ color: 0xffdd55 });
    const festGlowMat = new THREE.SpriteMaterial({ 
        map: (typeof sunMesh !== 'undefined' ? sunMesh.sunTex : null), 
        color: 0xffaa00, transparent: true, blending: THREE.AdditiveBlending 
    });
    [0.28, 0.72].forEach((centerT, eventIndex) => {
        const center = route.getPoint(centerT);
        const festGrp = new THREE.Group();
        festGrp.position.set(center.x, 0, center.z);
        const firstT = eventIndex === 0 ? 0.252 : 0.70;
        for (let i = 0; i < 6; i++) {
            const t = firstT + i * 0.008,
                side = i % 2 === 0 ? -1 : 1,
                o = offRoad(t, side * 6.5),
                tn = route.getTangent(t),
                pole = new THREE.Group();
            pole.position.set(o.x - center.x, 0, o.z - center.z);
            pole.rotation.y = Math.atan2(tn.x, tn.z);
            cyl(0.045, 0.065, 4.1, trunkMat, 0, 2.05, 0, pole);
            box(0.72, 0.075, 0.075, trunkMat, side * 0.35, 3.98, 0, pole);
            const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.17, 8, 8), festMat);
            bulb.position.set(side * 0.72, 3.92, 0);
            pole.add(bulb);
            const glow = new THREE.Sprite(festGlowMat);
            glow.scale.set(2.6, 2.6, 1);
            glow.position.set(side * 0.72, 3.92, 0);
            pole.add(glow);
            festGrp.add(pole);
        }
        scene.add(festGrp);
        window.dynamicEvents.push({
            group: festGrp,
            condition: (s) => s.night === true
        });
    });

    // 2. สัตว์ป่าหลบฝน (ฝูงกวาง) [ออกเฉพาะตอนฝนตก]
    [0.42, 0.85].forEach(t => {
        const o = offRoad(t, 8);
        const animalGrp = new THREE.Group();
        animalGrp.position.set(o.x, 0, o.z);
        animalGrp.rotation.y = Math.random() * Math.PI;
        if (typeof critter === 'function') {
            const deer1 = critter('deer'); deer1.position.set(0, 0, 0);
            const deer2 = critter('deer'); deer2.position.set(1.5, 0, 1.5); deer2.rotation.y = 0.5;
            animalGrp.add(deer1, deer2);
        }
        scene.add(animalGrp);
        window.dynamicEvents.push({
            group: animalGrp,
            condition: (s, rain) => rain > 0.2
        });
    });

    // 3. แคมป์ริมแม่น้ำและกองไฟ [ออกเฉพาะกลางคืนที่ฝนไม่ตก]
    [0.55, 0.78].forEach(t => {
        const o = offRoad(t, -9);
        const campGrp = new THREE.Group();
        campGrp.position.set(o.x, 0, o.z);
        campGrp.rotation.y = Math.atan2(o.tn.x, o.tn.z);

        const groundMat = sm2(0x554331),
          tentMat = sm2(0x56704c),
          tentInnerMat = sm2(0x252a24),
          skinMat = sm2(0xc58b68),
          trouserMat = sm2(0x343b3c),
          logMat = sm2(0x463222),
          stoneMat = sm2(0x67665f),
          emberMat = new THREE.MeshBasicMaterial({ color: 0xff581b }),
          flameOuterMat = new THREE.MeshBasicMaterial({ color: 0xff6a1a, transparent: true, opacity: 0.88 }),
          flameInnerMat = new THREE.MeshBasicMaterial({ color: 0xffd05a, transparent: true, opacity: 0.96 });

        const campsitePad = ball(1, groundMat, 0, 0.018, 0.2, campGrp, 2.45, 0.035, 2.2);
        campsitePad.receiveShadow = true;

        // เต็นท์ผ้าใบทรง A-frame พร้อมช่องประตูเปิด
        const tentGrp = new THREE.Group();
        tentGrp.position.set(0, 0, -2.35);
        campGrp.add(tentGrp);
        box(1.9, 0.035, 2.05, sm2(0x625746), 0, 0.025, 0, tentGrp);
        for (const side of [-1, 1]) {
          const panel = box(1.48, 0.055, 2.05, tentMat, side * 0.39, 0.54, 0, tentGrp);
          panel.rotation.z = -side * 0.86;
          panel.castShadow = true;
        }
        const tentEndShape = new THREE.Shape();
        tentEndShape.moveTo(-0.74, 0);
        tentEndShape.lineTo(0.74, 0);
        tentEndShape.lineTo(0, 1.1);
        tentEndShape.closePath();
        const tentEndGeo = new THREE.ShapeGeometry(tentEndShape);
        const tentEndMat = new THREE.MeshStandardMaterial({ color: 0x4b6242, roughness: 0.94, side: THREE.DoubleSide });
        for (const z of [-1.02, 1.02]) {
          const end = new THREE.Mesh(tentEndGeo, tentEndMat);
          end.position.set(0, 0.04, z);
          tentGrp.add(end);
        }
        const tentDoorShape = new THREE.Shape();
        tentDoorShape.moveTo(-0.29, 0.05);
        tentDoorShape.lineTo(0.29, 0.05);
        tentDoorShape.lineTo(0, 0.78);
        tentDoorShape.closePath();
        const tentDoor = new THREE.Mesh(new THREE.ShapeGeometry(tentDoorShape), new THREE.MeshBasicMaterial({ color: 0x252a24, side: THREE.DoubleSide }));
        tentDoor.position.set(0, 0.04, 1.03);
        tentGrp.add(tentDoor);
        cyl(0.025, 0.025, 1.2, sm2(0x6a5132), 0, 0.6, -2.35, campGrp);

        // ดินเถ้ารอบกองไฟ หินวางแบบไม่เป็นวงกลมสมบูรณ์ และฟืนวางซ้อนกัน
        const fireGrp = new THREE.Group();
        fireGrp.position.set(0, 0, 0.2);
        campGrp.add(fireGrp);
        ball(0.55, sm2(0x30271f), 0, 0.035, 0, fireGrp, 1.3, 0.08, 0.9);
        for (let i = 0; i < 9; i++) {
          const a = (i / 9) * Math.PI * 2 + 0.12;
          const stone = ball(
            0.13,
            stoneMat,
            Math.cos(a) * (0.48 + (i % 3) * 0.025),
            0.075,
            Math.sin(a) * (0.38 + (i % 2) * 0.035),
            fireGrp,
            1.3 + (i % 3) * 0.2,
            0.7 + (i % 2) * 0.18,
            0.9
          );
          stone.rotation.y = a;
        }
        for (let i = 0; i < 3; i++) {
          const log = cyl(0.055, 0.07, 0.78, logMat, 0, 0.11 + i * 0.035, 0, fireGrp);
          log.rotation.set(Math.PI / 2, i * Math.PI / 3, 0);
        }
        ball(0.18, emberMat, 0, 0.1, 0, fireGrp, 1.2, 0.35, 1.05);

        const flame = new THREE.Group();
        flame.position.y = 0.1;
        fireGrp.add(flame);
        const outerFlames = [];
        for (let i = 0; i < 3; i++) {
          const tongue = new THREE.Mesh(new THREE.ConeGeometry(0.17, 0.62, 6), flameOuterMat);
          tongue.position.set((i - 1) * 0.13, 0.3 + (i === 1 ? 0.07 : 0), (i % 2) * 0.12 - 0.06);
          tongue.rotation.z = (i - 1) * 0.18;
          flame.add(tongue);
          outerFlames.push(tongue);
        }
        const flameCore = new THREE.Mesh(new THREE.ConeGeometry(0.11, 0.38, 6), flameInnerMat);
        flameCore.position.set(0, 0.23, 0);
        flame.add(flameCore);
        const fireLight = new THREE.PointLight(0xff762e, 2.1, 9);
        fireLight.position.set(0, 0.55, 0);
        campGrp.add(fireLight);

        const limb = (parent, material, from, to, radius) => {
          const start = new THREE.Vector3(...from);
          const end = new THREE.Vector3(...to);
          const direction = end.clone().sub(start);
          const mesh = new THREE.Mesh(new THREE.CylinderGeometry(radius * 0.82, radius, direction.length(), 7), material);
          mesh.position.copy(start.add(end).multiplyScalar(0.5));
          mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction.normalize());
          mesh.castShadow = true;
          parent.add(mesh);
          return mesh;
        };
        const makeCamper = (color, x, z, yaw, seated) => {
          const person = new THREE.Group();
          person.position.set(x, 0, z);
          person.rotation.y = yaw;
          campGrp.add(person);
          const shirt = sm2(color);
          if (seated) {
            const seat = cyl(0.17, 0.18, 1.05, logMat, 0, 0.2, -0.06, person, Math.PI / 2);
            seat.castShadow = true;
            ball(0.18, trouserMat, 0, 0.37, -0.08, person, 1.2, 0.65, 1.25);
            limb(person, trouserMat, [-0.1, 0.38, 0], [-0.11, 0.12, 0.28], 0.085);
            limb(person, trouserMat, [0.1, 0.38, 0], [0.11, 0.12, 0.28], 0.085);
            limb(person, trouserMat, [-0.11, 0.12, 0.28], [-0.11, 0.08, 0.48], 0.065);
            limb(person, trouserMat, [0.11, 0.12, 0.28], [0.11, 0.08, 0.48], 0.065);
            box(0.13, 0.07, 0.22, sm2(0x292a28), -0.11, 0.055, 0.52, person);
            box(0.13, 0.07, 0.22, sm2(0x292a28), 0.11, 0.055, 0.52, person);
            limb(person, shirt, [-0.15, 0.64, -0.02], [0, 0.48, 0.08], 0.1);
            limb(person, shirt, [0.15, 0.64, -0.02], [0, 0.48, 0.08], 0.1);
          } else {
            ball(0.19, trouserMat, 0, 0.31, -0.06, person, 1.1, 0.7, 1.2);
            for (const side of [-1, 1]) {
              limb(person, trouserMat, [side * 0.1, 0.32, -0.04], [side * 0.13, 0.1, 0.19], 0.085);
              limb(person, trouserMat, [side * 0.13, 0.1, 0.19], [side * 0.13, 0.08, -0.12], 0.065);
              box(0.13, 0.07, 0.2, sm2(0x292a28), side * 0.13, 0.055, -0.2, person);
            }
            limb(person, shirt, [-0.16, 0.66, 0], [-0.2, 0.5, 0.2], 0.085);
            limb(person, shirt, [0.16, 0.66, 0], [0.19, 0.5, 0.2], 0.085);
            limb(person, skinMat, [-0.2, 0.5, 0.2], [-0.15, 0.4, 0.44], 0.045);
            limb(person, skinMat, [0.19, 0.5, 0.2], [0.15, 0.4, 0.44], 0.045);
            ball(0.045, skinMat, 0, 0.4, 0.45, person);
          }
          limb(person, shirt, [0, 0.38, 0], [0, 0.69, -0.04], 0.16);
          ball(0.125, skinMat, 0, 0.83, -0.035, person, 0.9, 1.05, 0.9);
          ball(0.13, sm2(0x29231f), 0, 0.9, -0.055, person, 1.05, 0.38, 1.0);
          return person;
        };

        // คนนั่งดูแลกองไฟ และอีกคนคุกเข่าคอยจัดฟืน
        makeCamper(0x40566a, 1.25, 0.65, -Math.PI / 2, true);
        const fireTender = makeCamper(0x76513c, -0.9, 0.28, Math.PI / 2, false);
        const firePoker = cyl(0.018, 0.018, 0.92, sm2(0x4c4335), -0.15, 0.42, 0.55, fireTender);
        firePoker.rotation.x = Math.PI / 2;
        firePoker.rotation.z = 0.16;

        // ฟืนสำรองและตะกร้าเก็บของข้างเต็นท์
        for (let i = 0; i < 4; i++) {
          const wood = cyl(0.055, 0.06, 0.68, logMat, 0.94 + (i % 2) * 0.08, 0.08 + Math.floor(i / 2) * 0.1, -1.55 + (i % 2) * 0.12, campGrp, Math.PI / 2);
          wood.rotation.z = i * 0.12;
        }
        box(0.48, 0.33, 0.34, sm2(0x8c704a), -1.25, 0.17, -1.2, campGrp);

        scene.add(campGrp);
        window.dynamicEvents.push({
            group: campGrp,
            condition: (s, rain) => s.night === true && rain < 0.1,
            update: (dt, time) => { // แอนิเมชันกองไฟพริ้วไหว
                flame.scale.set(1 + Math.sin(time * 10) * 0.08, 0.9 + Math.sin(time * 13) * 0.12, 1 + Math.cos(time * 12) * 0.08);
                outerFlames.forEach((tongue, index) => {
                  tongue.rotation.z = (index - 1) * 0.18 + Math.sin(time * 8 + index) * 0.12;
                });
                fireLight.intensity = 1.8 + Math.sin(time * 7) * 0.35 + Math.cos(time * 11) * 0.18;
            }
        });
    });

    // 4. บอลลูนลมร้อน (Hot Air Balloon) [ออกเฉพาะกลางวันที่ฝนไม่ตก]
    const balloonColors = [0xe63946, 0xf4a261, 0x4895ef];
    [0.15, 0.45, 0.85].forEach((t, i) => {
        const o = offRoad(t, 25); // ลอยอยู่ไกลๆ ริมถนน
        const balGrp = new THREE.Group();
        balGrp.position.set(o.x, 15 + Math.random() * 10, o.z);
        
        const bMesh = new THREE.Mesh(new THREE.SphereGeometry(3, 12, 10), sm2(balloonColors[i]));
        bMesh.scale.set(1, 1.2, 1);
        const basket = new THREE.Mesh(new THREE.BoxGeometry(1.2, 1, 1.2), sm2(0x8a6a44));
        basket.position.y = -4.5;
        // เชือกผูกกระเช้า
        for(const px of [-0.5, 0.5]) {
            for(const pz of [-0.5, 0.5]) { cyl(0.02, 0.02, 2, sm2(0x000000), px, -3.5, pz, balGrp); }
        }
        balGrp.add(bMesh, basket);
        scene.add(balGrp);
        
        window.dynamicEvents.push({
            group: balGrp,
            condition: (s, rain) => s.night === false && rain < 0.1,
            update: (dt, time) => { // แอนิเมชันลอยขึ้นลงและหมุนช้าๆ
                balGrp.position.y += Math.sin(time * 0.5 + i) * dt * 0.5;
                balGrp.rotation.y += dt * 0.1;
            }
        });
    });

    // 5. ปรากฏการณ์แสงปริศนา (UFO ลอยเหนือทุ่งนา!) [แรร์อีเวนต์ ออกเฉพาะกลางคืน]
    const ufoGrp = new THREE.Group();
    const ufoO = offRoad(0.95, -30);
    ufoGrp.position.set(ufoO.x, 25, ufoO.z);
    
    const ufoDisc = new THREE.Mesh(new THREE.CylinderGeometry(4, 4, 0.5, 16), new THREE.MeshStandardMaterial({color: 0x8899aa, metalness: 0.8}));
    const ufoDome = new THREE.Mesh(new THREE.SphereGeometry(2, 12, 8, 0, Math.PI*2, 0, Math.PI/2), new THREE.MeshStandardMaterial({color: 0x55ffaa, transparent: true, opacity: 0.8}));
    ufoDome.position.y = 0.25;
    ufoGrp.add(ufoDisc, ufoDome);
    
    // ลำแสง UFO ดึงวัว/ควาย (สมมติ)
    const ufoBeam = new THREE.Mesh(new THREE.CylinderGeometry(1.5, 6, 25, 16), new THREE.MeshBasicMaterial({color: 0x55ffaa, transparent: true, opacity: 0.3, blending: THREE.AdditiveBlending, side: THREE.DoubleSide}));
    ufoBeam.position.y = -12.5;
    ufoGrp.add(ufoBeam);
    
    scene.add(ufoGrp);
    window.dynamicEvents.push({
        group: ufoGrp,
        condition: (s, rain) => s.night === true, 
        update: (dt, time) => { // แอนิเมชันจานบินหมุนและลำแสงกระพริบ
            ufoGrp.rotation.y += dt * 2;
            ufoBeam.material.opacity = 0.15 + Math.sin(time * 5) * 0.15;
            ufoGrp.position.y = 25 + Math.sin(time) * 2;
        }
    });

    // เทศกาลตามฤดูกาลและการเลือกของผู้เล่น
    const festivalIsActive = id => {
      if (window.currentFestival !== 'auto') return window.currentFestival === id;
      const month = new Date().getMonth();
      return (id === 'songkran' && month === 3) || (id === 'loykrathong' && month === 10);
    };
    const festivalBox = (parent, w, h, d, material, x, y, z) => {
      const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), material);
      mesh.position.set(x, y, z);
      mesh.castShadow = true;
      parent.add(mesh);
      return mesh;
    };

    const krathongGroup = new THREE.Group(),
      krathongFloats = [],
      krathongBaseMat = new THREE.MeshLambertMaterial({ color: 0x8c633c }),
      krathongLeafMat = new THREE.MeshLambertMaterial({ color: 0x4c8b4e }),
      candleMat = new THREE.MeshStandardMaterial({ color: 0xffc857, emissive: 0xff8a26, emissiveIntensity: 1.4 });
    [0.2, 0.5, 0.8].forEach((ratio, i) => {
      const riverPoint = RIVER_PTS[Math.floor((RIVER_PTS.length - 1) * ratio)];
      if (!riverPoint) return;
      const float = new THREE.Group();
      float.position.set(riverPoint.x, -0.04, riverPoint.z);
      const base = new THREE.Mesh(new THREE.CylinderGeometry(0.62, 0.42, 0.12, 8), krathongBaseMat);
      base.position.y = 0.08;
      float.add(base);
      for (let petal = 0; petal < 8; petal++) {
        const leaf = new THREE.Mesh(new THREE.ConeGeometry(0.16, 0.46, 4), krathongLeafMat);
        const angle = (petal / 8) * Math.PI * 2;
        leaf.position.set(Math.cos(angle) * 0.48, 0.28, Math.sin(angle) * 0.48);
        leaf.rotation.z = -0.5;
        leaf.rotation.y = -angle;
        float.add(leaf);
      }
      const candle = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.09, 0.28, 6), candleMat);
      candle.position.y = 0.27;
      float.add(candle);
      krathongGroup.add(float);
      krathongFloats.push({ group: float, phase: i * 1.7 });
    });
    scene.add(krathongGroup);
    krathongGroup.visible = false;
    window.dynamicEvents.push({
      group: krathongGroup,
      condition: s => festivalIsActive('loykrathong') && s.night,
      update: (dt, time) => krathongFloats.forEach(f => {
        f.group.position.y = -0.04 + Math.sin(time * 0.7 + f.phase) * 0.04;
        f.group.rotation.y += dt * 0.12;
      })
    });

    const songkranGroup = new THREE.Group(),
      songkranPoint = offRoad(0.42, 12),
      songkranWater = new THREE.MeshBasicMaterial({ color: 0x8eddf3, transparent: true, opacity: 0.78 }),
      songkranDrops = [];
    songkranGroup.position.set(songkranPoint.x, 0, songkranPoint.z);
    songkranGroup.rotation.y = Math.atan2(songkranPoint.tn.x, songkranPoint.tn.z);
    const truckBodyMat = new THREE.MeshLambertMaterial({ color: 0x3f8d72 }),
      truckCabMat = new THREE.MeshLambertMaterial({ color: 0xe9efe2 }),
      truckWheelMat = new THREE.MeshLambertMaterial({ color: 0x292d2b });
    festivalBox(songkranGroup, 2.4, 0.72, 4.1, truckBodyMat, 0, 0.8, 0);
    festivalBox(songkranGroup, 2.1, 0.85, 1.55, truckCabMat, 0, 1.42, -1.05);
    festivalBox(songkranGroup, 1.45, 0.55, 1.2, songkranWater, 0, 1.45, 0.7);
    for (const x of [-1.25, 1.25]) for (const z of [-1.35, 1.35]) {
      const wheel = new THREE.Mesh(new THREE.CylinderGeometry(0.38, 0.38, 0.22, 8), truckWheelMat);
      wheel.rotation.z = Math.PI / 2;
      wheel.position.set(x, 0.4, z);
      songkranGroup.add(wheel);
    }
    createSimplePerson(0xf0ad53, songkranGroup, -2.05, 0, 1.5);
    createSimplePerson(0xe887a1, songkranGroup, 2.05, 0, 1.4);
    for (let i = 0; i < 12; i++) {
      const drop = new THREE.Mesh(new THREE.SphereGeometry(0.09, 6, 5), songkranWater);
      drop.position.set((i % 4 - 1.5) * 0.42, 1.2 + (i % 3) * 0.32, 1.6 + Math.floor(i / 4) * 0.34);
      songkranGroup.add(drop);
      songkranDrops.push(drop);
    }
    scene.add(songkranGroup);
    songkranGroup.visible = false;
    window.dynamicEvents.push({
      group: songkranGroup,
      condition: s => festivalIsActive('songkran') && !s.night,
      update: (dt, time) => songkranDrops.forEach((drop, i) => {
        drop.position.y = 1.05 + Math.abs(Math.sin(time * 2.3 + i * 0.8)) * 0.85;
        drop.position.x = Math.sin(time * 1.2 + i) * 0.8;
      })
    });

    const templeFairGroup = new THREE.Group(),
      fairPoint = offRoad(0.52, 15),
      sandMat = new THREE.MeshLambertMaterial({ color: 0xcaa776 }),
      redFlagMat = new THREE.MeshBasicMaterial({ color: 0xc94b3c, side: THREE.DoubleSide }),
      goldGlowMat = new THREE.MeshStandardMaterial({ color: 0xffd36b, emissive: 0xb86a19, emissiveIntensity: 0.8 });
    templeFairGroup.position.set(fairPoint.x, 0, fairPoint.z);
    templeFairGroup.rotation.y = Math.atan2(fairPoint.tn.x, fairPoint.tn.z);
    const sandBase = new THREE.Mesh(new THREE.CylinderGeometry(1.05, 1.2, 0.28, 8), sandMat);
    sandBase.position.y = 0.14;
    templeFairGroup.add(sandBase);
    for (let level = 0; level < 3; level++) {
      const mound = new THREE.Mesh(new THREE.ConeGeometry(0.85 - level * 0.2, 0.72, 7), sandMat);
      mound.position.y = 0.58 + level * 0.53;
      templeFairGroup.add(mound);
    }
    for (let i = 0; i < 5; i++) {
      const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 1.25, 5), krathongBaseMat);
      pole.position.set(-2 + i, 0.62, -1.35);
      templeFairGroup.add(pole);
      const flag = new THREE.Mesh(new THREE.PlaneGeometry(0.48, 0.3), redFlagMat);
      flag.position.set(-1.78 + i, 1.08, -1.35);
      templeFairGroup.add(flag);
    }
    for (let i = 0; i < 4; i++) {
      const lantern = new THREE.Mesh(new THREE.SphereGeometry(0.16, 6, 5), goldGlowMat);
      lantern.position.set((i - 1.5) * 1.1, 1.5 + (i % 2) * 0.25, 1.1);
      templeFairGroup.add(lantern);
    }
    scene.add(templeFairGroup);
    templeFairGroup.visible = false;
    window.dynamicEvents.push({
      group: templeFairGroup,
      condition: () => festivalIsActive('temple'),
      update: (dt, time) => {
        templeFairGroup.rotation.y += Math.sin(time * 0.2) * dt * 0.025;
      }
    });

    // ปิดการซ่อนอัตโนมัติ (Frustum Culling) สำหรับกลุ่ม Event พิเศษทั้งหมด
    // แก้ปัญหาวัตถุชิ้นใหญ่หายวับไปกลางอากาศเมื่อรถขับเข้าใกล้
    window.dynamicEvents.forEach(ev => {
        ev.group.traverse(child => {
            if (child.isMesh) {
                child.frustumCulled = false;
            }
        });
    });

    /* oncoming traffic (cars drive on the left) */
    const glassM = new THREE.MeshStandardMaterial({
        color: 0x7fa8b8,
        roughness: 0.08,
        metalness: 0.2,
        transparent: true,
        opacity: 0.48,
        side: THREE.DoubleSide
      }),
      lampM = mat(0xfff3c0, { emissive: 0xffdd88, emissiveIntensity: 0.6 }),
      tailM = mat(0xd04a3c, { emissive: 0x771111, emissiveIntensity: 0.4 }),
      pm2 = c => new THREE.MeshLambertMaterial({ color: c }),
      skT = pm2(0xd9a681),
      stT = pm2(0xe6d5a8),
      shT = [0x6e9fb0, 0xe98f7d, 0x9aae7b, 0xd9b56b].map(c => pm2(c)),
      jnT = pm2(0x3d4a5c),
      woodT = pm2(0xb98a55);

    function addCarDriver(g, x, yBelt, zSeat, ch, kind, s = 0) {
      const sc = Math.min(1.05, Math.max(0.72, ch / 0.58));
      const isLow = ch < 0.48;
      const ySeat = yBelt - (isLow ? 0.05 : 0.02);
      const sh = kind === 'police' ? pm2(0x1a2e4a)
        : kind === 'ambulance' ? pm2(0x2d7568)
        : kind === 'delivery' ? pm2(0xc45228)
        : kind === 'tow' ? pm2(0x354b60)
        : kind === 'schoolbus' ? pm2(0x2f5233)
        : shT[Math.abs(s) % 4],
        hr = pm2(0x231c17),
        ey = pm2(0x110f0e),
        intDark = pm2(0x1c211f),
        skin = skT;

      // Seat cushion, backrest & headrest
      box(0.34 * sc, 0.08 * sc, 0.36 * sc, intDark, x, ySeat + 0.04 * sc, zSeat, g);
      box(0.32 * sc, ch * 0.55, 0.08 * sc, intDark, x, ySeat + ch * 0.30, zSeat - 0.15 * sc, g);
      box(0.18 * sc, 0.11 * sc, 0.07 * sc, intDark, x, ySeat + ch * 0.62, zSeat - 0.15 * sc, g);

      // Seated torso
      const torsoH = 0.20 * sc;
      const torsoR = 0.11 * sc;
      const torso = new THREE.Mesh(new THREE.CapsuleGeometry(torsoR, torsoH, 4, 12), sh);
      const torsoY = ySeat + 0.08 * sc + torsoH * 0.65;
      torso.position.set(x, torsoY, zSeat - 0.02 * sc);
      torso.rotation.x = isLow ? 0.22 : 0.10;
      torso.scale.set(1.05, 1, 0.82);
      torso.castShadow = true;
      g.add(torso);

      // Neck and Head
      const headY = torsoY + torsoH * 0.5 + 0.11 * sc;
      const headZ = zSeat + (isLow ? -0.04 * sc : -0.01 * sc);
      cyl(0.038 * sc, 0.042 * sc, 0.07 * sc, skin, x, headY - 0.08 * sc, headZ, g);
      ball(0.098 * sc, skin, x, headY, headZ, g, 0.94, 1.05, 0.98);
      ball(0.102 * sc, hr, x, headY + 0.022 * sc, headZ - 0.015 * sc, g, 0.98, 0.86, 1.02);

      // Eyes or Cool Sunglasses
      if (kind === 'sportscar' || kind === 'classic') {
        box(0.12 * sc, 0.03 * sc, 0.02 * sc, pm2(0x0e1111), x, headY + 0.01 * sc, headZ + 0.092 * sc, g);
        cyl(0.005 * sc, 0.005 * sc, 0.025 * sc, pm2(0xd4af37), x, headY + 0.016 * sc, headZ + 0.094 * sc, g, 0, Math.PI / 2);
      } else {
        for (const q of [-1, 1]) {
          ball(0.012 * sc, ey, x + q * 0.035 * sc, headY + 0.008 * sc, headZ + 0.092 * sc, g);
        }
      }

      // Police peaked cap
      if (kind === 'police') {
        const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.118 * sc, 0.098 * sc, 0.055 * sc, 14), pm2(0x1a2e4a));
        cap.position.set(x, headY + 0.082 * sc, headZ);
        cap.rotation.x = -0.05;
        g.add(cap);
        box(0.03 * sc, 0.03 * sc, 0.01 * sc, pm2(0xd4af37), x, headY + 0.082 * sc, headZ + 0.104 * sc, g);
        const visor = new THREE.Mesh(new THREE.BoxGeometry(0.13 * sc, 0.012 * sc, 0.055 * sc), pm2(0x111111));
        visor.position.set(x, headY + 0.065 * sc, headZ + 0.102 * sc);
        visor.rotation.x = 0.22;
        g.add(visor);
      } else if (kind === 'delivery') {
        const cap = new THREE.Mesh(new THREE.SphereGeometry(0.105 * sc, 12, 8, 0, Math.PI * 2, 0, Math.PI * 0.55), pm2(0xc45228));
        cap.position.set(x, headY + 0.035 * sc, headZ);
        g.add(cap);
        const brim = new THREE.Mesh(new THREE.BoxGeometry(0.11 * sc, 0.01 * sc, 0.065 * sc), pm2(0xc45228));
        brim.position.set(x, headY + 0.045 * sc, headZ + 0.10 * sc);
        brim.rotation.x = 0.15;
        g.add(brim);
      }

      // Arms gripping steering wheel
      const wheelZ = zSeat + 0.24 * sc;
      const wheelY = ySeat + 0.20 * sc + ch * 0.10;
      for (const q of [-1, 1]) {
        const shX = x + q * 0.13 * sc;
        const handX = x + q * 0.075 * sc;
        cyl(0.032 * sc, 0.030 * sc, 0.16 * sc, sh, (shX + handX) * 0.5, ySeat + 0.21 * sc, zSeat + 0.07 * sc, g, -0.65, q * 0.22);
        cyl(0.027 * sc, 0.025 * sc, 0.15 * sc, skin, handX, wheelY - 0.02 * sc, wheelZ - 0.06 * sc, g, -0.72, 0);
        ball(0.028 * sc, skin, handX, wheelY, wheelZ - 0.01 * sc, g);
      }
    }
    function wheelG(r, w, x, y, z, p, list) {
      const g = new THREE.Group();
      g.position.set(x, y, z);
      const t = new THREE.Mesh(new THREE.CylinderGeometry(r, r, w, 28), rubber);
      t.rotation.z = Math.PI / 2;
      t.castShadow = true;
      g.add(t);
      const h = new THREE.Mesh(new THREE.CylinderGeometry(r * 0.55, r * 0.55, w + 0.02, 20), hub);
      h.rotation.z = Math.PI / 2;
      g.add(h);
      p.add(g);
      list.push(g);
    }
    function vehicle(kind, color) {
      const g = new THREE.Group(),
        W = [],
        b = pm2(color);
      let o = null;
      if (kind === 'bike') {
        const metal = pm2(0x4a5568),
          darkMetal = pm2(0x2a323d),
          chrome = pm2(0xd8e0e8),
          seat = pm2(0x252d2a);
        // ล้อหน้า-หลัง
        wheelG(0.31, 0.11, 0, 0.31, 0.64, g, W);
        wheelG(0.31, 0.12, 0, 0.31, -0.64, g, W);
        // โครงรถและบล็อกเครื่องยนต์
        ball(0.15, darkMetal, 0, 0.52, 0.02, g, 0.95, 0.9, 1.45);
        box(0.22, 0.24, 0.36, metal, 0, 0.48, 0.06, g);
        // ท่อไอเสียและพักเท้าซ้าย-ขวา
        cyl(0.038, 0.052, 0.68, chrome, -0.15, 0.38, -0.36, g, 1.38, 0);
        cyl(0.02, 0.02, 0.38, darkMetal, 0, 0.36, -0.05, g, 0, Math.PI / 2);
        // ถังน้ำมันและเบาะนั่งแบบมีระดับ
        ball(0.19, b, 0, 0.80, 0.14, g, 0.92, 0.72, 1.35);
        ball(0.15, seat, 0, 0.75, -0.26, g, 1.05, 0.48, 1.85);
        ball(0.13, b, 0, 0.79, -0.58, g, 0.9, 0.42, 1.1);
        // โช้คหน้าคู่และสวิงอาร์มหลัง
        for (const s of [-1, 1]) {
          cyl(0.024, 0.02, 0.68, chrome, s * 0.085, 0.62, 0.50, g, -0.38, 0);
          cyl(0.022, 0.022, 0.48, darkMetal, s * 0.09, 0.42, -0.36, g, 1.35, 0);
        }
        // บังโคลนหน้า-หลัง และไฟหน้า-ไฟท้าย
        ball(0.12, b, 0, 0.58, 0.62, g, 0.85, 0.35, 1.4);
        ball(0.11, lampM, 0, 0.90, 0.52, g, 0.95, 0.95, 0.7);
        ball(0.08, darkMetal, 0, 0.90, 0.47, g, 1.05, 1.05, 0.7);
        ball(0.08, tailM, 0, 0.77, -0.72, g, 1, 0.65, 0.55);
        // แฮนด์บาร์กางตามแกน X (ซ้าย-ขวา) + ปลอกแฮนด์ + กระจกมองข้าง
        cyl(0.02, 0.02, 0.52, chrome, 0, 1.03, 0.36, g, 0, Math.PI / 2);
        for (const s of [-1, 1]) {
          cyl(0.026, 0.026, 0.13, rubber, s * 0.24, 1.03, 0.36, g, 0, Math.PI / 2);
          cyl(0.01, 0.01, 0.16, chrome, s * 0.21, 1.11, 0.37, g, 0, -s * 0.35);
          ball(0.042, darkMetal, s * 0.25, 1.18, 0.37, g, 1.2, 0.75, 0.35);
        }
        rider(g, 0, 0.76, -0.22, 1, true, true, true);
        g.userData.w = W;
      } else {
        o = {
          sedan: { l: 3.0, w: 1.6, h: 0.55, cl: 1.55, ch: 0.55, cz: -0.15 },
          pickup: { l: 3.4, w: 1.75, h: 0.7, cl: 1.2, ch: 0.62, cz: 0.6 },
          van: { l: 3.3, w: 1.7, h: 0.9, cl: 2.6, ch: 0.75, cz: -0.1 },
          sportscar: { l: 3.1, w: 1.7, h: 0.4, cl: 1.4, ch: 0.4, cz: -0.2 },
          suv: { l: 3.5, w: 1.8, h: 0.75, cl: 2.0, ch: 0.65, cz: -0.1 },
          camper: { l: 4.5, w: 1.8, h: 1.0, cl: 3.5, ch: 1.2, cz: 0.2 },
          hatchback: { l: 2.8, w: 1.55, h: 0.55, cl: 1.4, ch: 0.55, cz: 0 },
          delivery: { l: 4.2, w: 1.8, h: 0.8, cl: 2.8, ch: 1.4, cz: 0.5 },
          classic: { l: 3.3, w: 1.6, h: 0.5, cl: 1.3, ch: 0.5, cz: -0.4 },
          ev_commuter: { l: 2.9, w: 1.65, h: 0.6, cl: 1.5, ch: 0.6, cz: -0.05 },
          police: { l: 3.0, w: 1.6, h: 0.55, cl: 1.55, ch: 0.55, cz: -0.15 },
          ambulance: { l: 3.8, w: 1.75, h: 0.9, cl: 3.0, ch: 0.9, cz: -0.1 },
          minitruck: { l: 2.8, w: 1.4, h: 0.65, cl: 1.2, ch: 0.7, cz: 0.5 }
        }[kind];
        const topH = 0.35 + o.h;
        box(o.w, o.h, o.l, b, 0, 0.35 + o.h / 2, 0, g);

        // โครงสร้างห้องโดยสารโปร่ง (Hollow Cabin) มองเห็นภายในและคนขับชัดเจน
        const zFront = o.cz + o.cl / 2,
          zBack = o.cz - o.cl / 2,
          isBoxy = kind === 'van' || kind === 'delivery' || kind === 'camper' || kind === 'ambulance' || kind === 'minitruck',
          slope = isBoxy ? 0.20 : (kind === 'sportscar' ? 0.44 : 0.34),
          zRoofFront = zFront - o.ch * slope,
          zRoofBack = zBack + (isBoxy ? 0.06 : o.ch * 0.26),
          wsDeltaZ = zFront - zRoofFront,
          wsDeltaY = o.ch - 0.02,
          wsLen = Math.hypot(wsDeltaY, wsDeltaZ),
          wsTilt = Math.atan2(wsDeltaZ, wsDeltaY),
          wsMidY = topH + 0.01 + wsDeltaY * 0.5,
          wsMidZ = (zFront + zRoofFront) * 0.5,
          cDark = pm2(0x222a27);

        // พื้นห้องโดยสารและคอนโซลหน้า
        box(o.w * 0.86, 0.04, o.cl * 0.92, cDark, 0, topH + 0.02, o.cz, g);
        box(o.w * 0.80, 0.14, 0.24, cDark, 0, topH + 0.08, zFront - 0.12, g);

        // คนขับนั่งฝั่งขวา (จราจรขับชิดซ้ายของไทย: แกน -X) พร้อมพวงมาลัย
        const drvX = -o.w * 0.24,
          drvZ = zFront - Math.min(o.cl * 0.36, 0.48),
          colorSeed = typeof color === 'number' ? color : 1;
        addCarDriver(g, drvX, topH, drvZ, o.ch, kind, colorSeed);

        // แกนและวงพวงมาลัยเอียงจับมือคนขับพอดี
        const stCol = new THREE.Mesh(new THREE.CylinderGeometry(0.014, 0.017, 0.20, 10), cDark);
        stCol.position.set(drvX, topH + 0.12, drvZ + 0.24);
        stCol.rotation.x = -0.65;
        g.add(stCol);
        const stWheel = new THREE.Mesh(new THREE.TorusGeometry(0.088, 0.014, 6, 16), pm2(0x161a18));
        stWheel.position.set(drvX, topH + 0.19, drvZ + 0.19);
        stWheel.rotation.x = 0.65;
        g.add(stWheel);
        ball(0.024, pm2(0x252a28), drvX, topH + 0.19, drvZ + 0.19, g);

        // เบาะข้างคนขับ (Passenger Seat)
        box(0.34, 0.08, 0.36, cDark, -drvX, topH + 0.04, drvZ, g);
        box(0.32, o.ch * 0.55, 0.08, cDark, -drvX, topH + o.ch * 0.30, drvZ - 0.15, g);
        box(0.18, 0.11, 0.07, cDark, -drvX, topH + o.ch * 0.62, drvZ - 0.15, g);

        // กระจกหน้าลาดเอียงใส (Transparent Windshield)
        const ws = box(o.w * 0.82, wsLen, 0.02, glassM, 0, wsMidY, wsMidZ, g);
        ws.rotation.x = -wsTilt;

        // เสา A-Pillars ซ้าย-ขวา สีเดียวกับตัวถัง
        for (const s of [-1, 1]) {
          const ap = box(0.035, wsLen, 0.045, b, s * (o.w * 0.42), wsMidY, wsMidZ, g);
          ap.rotation.x = -wsTilt;
        }

        // กระจกมองหลังตรงกลางด้านบนกระจกหน้า
        box(0.12, 0.036, 0.018, cDark, 0, topH + o.ch * 0.86, zRoofFront + 0.05, g);
        box(0.10, 0.026, 0.008, glassM, 0, topH + o.ch * 0.86, zRoofFront + 0.04, g);

        // หลังคารถ
        const roofL = Math.max(0.2, zRoofFront - zRoofBack),
          roofMidZ = (zRoofFront + zRoofBack) * 0.5;
        box(o.w * 0.84, 0.035, roofL, b, 0, topH + o.ch, roofMidZ, g);

        // กระจกหลังและเสา C-Pillars
        const rwDeltaZ = zRoofBack - zBack,
          rwDeltaY = o.ch * 0.88,
          rwLen = Math.hypot(rwDeltaY, rwDeltaZ),
          rwTilt = Math.atan2(rwDeltaZ, rwDeltaY),
          rwMidY = topH + 0.04 + rwDeltaY * 0.5,
          rwMidZ = (zBack + zRoofBack) * 0.5;
        const rw = box(o.w * 0.80, rwLen, 0.02, glassM, 0, rwMidY, rwMidZ, g);
        rw.rotation.x = rwTilt;
        for (const s of [-1, 1]) {
          const cp = box(0.04, rwLen, 0.045, b, s * (o.w * 0.42), rwMidY, rwMidZ, g);
          cp.rotation.x = rwTilt;
        }

        // กระจกข้างใสและเสากลาง B-Pillars
        for (const s of [-1, 1]) {
          box(0.015, o.ch * 0.70, o.cl * 0.82, glassM, s * (o.w * 0.425), topH + o.ch * 0.46, o.cz, g);
          box(0.035, o.ch * 0.88, 0.055, b, s * (o.w * 0.43), topH + o.ch * 0.48, o.cz, g);
        }

        // ไฟไซเรนหลังคารถตำรวจ และไฟฉุกเฉินรถพยาบาล
        if (kind === 'police') {
          box(0.44, 0.05, 0.12, cDark, 0, topH + o.ch + 0.035, o.cz, g);
          box(0.18, 0.065, 0.10, mat(0xe63946, { emissive: 0xff1122, emissiveIntensity: 0.85 }), -0.11, topH + o.ch + 0.065, o.cz, g);
          box(0.18, 0.065, 0.10, mat(0x1d3557, { emissive: 0x2266ff, emissiveIntensity: 0.85 }), 0.11, topH + o.ch + 0.065, o.cz, g);
        } else if (kind === 'ambulance') {
          box(0.36, 0.07, 0.13, mat(0xff2222, { emissive: 0xff1111, emissiveIntensity: 0.85 }), 0, topH + o.ch + 0.045, o.cz + 0.45, g);
          box(0.20, 0.07, 0.13, mat(0xff9900, { emissive: 0xff7700, emissiveIntensity: 0.8 }), 0, topH + o.ch + 0.045, o.cz - 0.65, g);
        }

        if (kind === 'pickup') box(o.w * 0.96, 0.3, 1.5, pm2(0x6e7a72), 0, 0.35 + o.h + 0.15, -0.95, g);
        for (const s of [-1, 1]) {
          wheelG(0.36, 0.22, s * (o.w / 2 - 0.04), 0.36, o.l * 0.33, g, W);
          wheelG(0.36, 0.22, s * (o.w / 2 - 0.04), 0.36, -o.l * 0.33, g, W);
          box(0.3, 0.15, 0.05, lampM, s * o.w * 0.32, 0.35 + o.h * 0.6, o.l / 2 + 0.01, g);
          box(0.24, 0.12, 0.05, tailM, s * o.w * 0.34, 0.35 + o.h * 0.6, -o.l / 2 - 0.01, g);
        }
      }
      if (o) {
        const dk = pm2(0x2f3d38),
          ch = pm2(0xc8d3bd),
          pl = pm2(0xfff4da),
          stp = kind === 'van' ? pm2(0x6e9fb0) : pl,
          y0 = 0.35,
          top = y0 + o.h,
          zFront = o.cz + o.cl / 2,
          L2 = o.l / 2,
          W2 = o.w / 2;
        box(o.w * 0.98, 0.12, 0.1, dk, 0, y0 + 0.1, L2 + 0.04, g);
        box(o.w * 0.98, 0.12, 0.1, dk, 0, y0 + 0.1, -L2 - 0.04, g);
        box(o.w * 0.4, 0.12, 0.03, ch, 0, y0 + o.h * 0.55, L2 + 0.03, g);
        box(0.34, 0.1, 0.02, pl, 0, y0 + 0.1, L2 + 0.1, g);
        box(0.34, 0.1, 0.02, pl, 0, y0 + 0.1, -L2 - 0.1, g);
        for (const s of [-1, 1]) {
          box(0.025, o.h * 0.8, 0.03, dk, s * (W2 + 0.006), y0 + o.h * 0.5, o.cz, g);
          box(0.03, 0.04, 0.14, ch, s * (W2 + 0.012), y0 + o.h * 0.78, o.cz + 0.12, g);
          box(0.12, 0.1, 0.08, b, s * (W2 + 0.06), top + 0.12, o.cz + o.cl * 0.5 - 0.1, g);
          box(0.02, 0.07, o.l * 0.96, stp, s * (W2 + 0.008), y0 + o.h * 0.38, 0, g);
          const mirrorArm = cyl(0.018, 0.018, 0.2, dk, s * (W2 + 0.09), top + o.ch * 0.67, zFront - 0.04, g, 0, s * 0.8);
          mirrorArm.rotation.z = s * -0.18;
          box(0.13, 0.09, 0.045, dk, s * (W2 + 0.16), top + o.ch * 0.69, zFront + 0.01, g);
          box(0.08, 0.055, 0.012, glassM, s * (W2 + 0.16), top + o.ch * 0.69, zFront + 0.036, g);
          box(0.16, 0.035, 0.025, dk, s * (W2 + 0.018), top + o.ch * 0.27, o.cz + 0.05, g);
        }
        // ป้ายทะเบียนและกันชนแบบแยกชิ้นช่วยให้เห็นสัดส่วนด้านหน้า/ท้ายชัดขึ้น
        box(o.w * 0.72, 0.12, 0.08, dk, 0, y0 + 0.1, L2 + 0.045, g);
        box(0.34, 0.09, 0.018, pm2(0xf5f2e8), 0, y0 + 0.13, L2 + 0.09, g);
        box(0.34, 0.09, 0.018, pm2(0xf5f2e8), 0, y0 + 0.13, -L2 - 0.09, g);
        W.forEach(w => {
          const sd = Math.sign(w.position.x),
            r = new THREE.Mesh(new THREE.TorusGeometry(0.27, 0.025, 6, 16), ch);
          r.rotation.y = Math.PI / 2;
          r.position.x = sd * 0.125;
          w.add(r);
        });
        if (kind === 'sedan') {
          box(o.w * 0.5, 0.02, o.cl * 0.35, glassM, 0, top + o.ch + 0.01, o.cz, g);
          cyl(0.012, 0.012, 0.4, dk, -0.5, top + o.ch + 0.2, o.cz - 0.5, g);
        } else if (kind === 'pickup') {
          const sack = pm2(0xe6d5a8);
          for (const s of [-1, 1]) box(0.05, 0.1, 1.5, dk, s * o.w * 0.5, top + 0.33, -0.95, g);
          box(o.w * 0.96, 0.3, 0.05, dk, 0, top + 0.15, -1.72, g);
          ball(0.28, sack, 0.3, top + 0.45, -0.55, g, 1, 0.6, 1.1);
          ball(0.28, sack, -0.3, top + 0.45, -0.95, g, 1, 0.6, 1.1);
          ball(0.28, sack, 0.28, top + 0.45, -1.3, g, 1, 0.6, 1.1);
          box(0.45, 0.28, 0.4, pm2(0xb98a55), -0.3, top + 0.44, -1.45, g);
        } else {
          for (const s of [-1, 1]) box(0.04, 0.04, o.cl * 0.8, dk, s * o.w * 0.3, top + o.ch + 0.08, o.cz, g);
          for (const z of [-0.6, 0.5]) box(o.w * 0.7, 0.04, 0.04, dk, 0, top + o.ch + 0.1, o.cz + z, g);
          box(0.4, 0.08, 0.3, ch, 0, top + o.ch + 0.05, o.cz - 0.9, g);
        }
      }
      g.userData.w = W;
      return g;
    }
    const LEN = {
        sedan: 3, pickup: 3.4, van: 3.3, bike: 1.9, bicycle: 1.8,
        tractor: 6.2, pickuptrailer: 6.6, tow: 5.4, schoolbus: 5.5, bus: 7.5, tuktuk: 2.2,
        sportscar: 3.1, suv: 3.5, camper: 4.5, hatchback: 2.8, delivery: 4.2,
        classic: 3.3, ev_commuter: 2.9, police: 3.0, ambulance: 3.8, minitruck: 2.8,
        phumphuang: 4.6, etaen: 4.1
      },
      CK = {
        bicycle: ['กริ๊ง กริ๊ง ' + svgInline('car'), 'ปั่นเล่นสบาย ๆ จ้า'],
        tractor: ['ตึ๊ก ตึ๊ก ตึ๊ก ' + svgInline('car'), 'ไปรดน้ำไร่จ้า'],
        tow: ['ลากรถไปซ่อมจ้า', 'ขับดี ๆ นะน้อง'],
        pickuptrailer: ['ขนผลผลิตไปตลาดครับ', 'ปี๊น ปี๊น ' + svgInline('wave')],
        bike: ['บรื้นนน ' + svgInline('car'), 'สวัสดีครับ!'],
        schoolbus: ['สวัสดีจ้าเด็กๆ ' + svgInline('school'), 'ไปโรงเรียนกัน!'],
        bus: ['ตั๋วไหมพี่ ' + svgInline('car'), 'ชิดในเลยพี่!'],
        tuktuk: ['ไปไหนครับพี่! ' + svgInline('car'), 'เหมาไหมครับพี่!'],
        sportscar: ['บรื้นนนน! ' + svgInline('bolt'), 'รถสวยไหมครับ'],
        camper: ['ไปแคมป์ปิ้งกัน ' + svgInline('tent'), 'ขับรถเที่ยวชิลล์ ๆ'],
        delivery: ['มีพัสดุมาส่งครับ ' + svgInline('box'), 'ทางนี้รถติดไหม'],
        ev_commuter: ['เงียบสบาย ไร้ควัน ' + svgInline('leaf'), 'ชาร์จเต็มร้อย พร้อมลุย'],
        police: ['ขับรถตามกฎหมายนะครับ ' + svgInline('car'), 'ระวังข้างหน้ามีด่าน'],
        ambulance: ['ขอทางหน่อยครับ! ' + svgInline('bolt'), 'ฉุกเฉินครับ!'],
        phumphuang: ['หมู ไก่ ผักสดจ้า!', 'แวะซื้อกับข้าวก่อนจ้า ' + svgInline('leaf')],
        etaen: ['ต๊อก ต๊อก ต๊อก ' + svgInline('grain'), 'ได้ข้าวเต็มคันเลย!']
      };
    function rider(g, x, y, z, s, hat, seated = false, isBike = false) {
      const sh = shT[s % 4],
        hr = pm2(0x2b221d),
        ey = pm2(0x1b1512),
        helmM = pm2(s % 2 ? 0x2f5d7c : 0xd9534a);
      if (seated) {
        const link = (a, b, r1, r2, m) => {
          const d = new THREE.Vector3().subVectors(b, a),
            mesh = new THREE.Mesh(new THREE.CylinderGeometry(r1, r2, d.length(), 14), m);
          mesh.position.copy(a).add(b).multiplyScalar(0.5);
          mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.normalize());
          mesh.castShadow = true;
          g.add(mesh);
        };
        const leanZ = isBike ? 0.11 : 0.03;
        const baseY = isBike ? y : y + 0.24;
        // สะโพกและลำตัวทรงแคปซูลสมส่วน (ไม่บี้แบน)
        ball(0.135, jnT, x, baseY + 0.05, z, g, 1.08, 0.72, 0.95);
        const torso = new THREE.Mesh(new THREE.CapsuleGeometry(0.132, 0.26, 5, 16), sh);
        torso.position.set(x, baseY + 0.26, z + leanZ * 0.5);
        torso.rotation.x = isBike ? 0.24 : 0.06;
        torso.scale.set(1.06, 1, 0.84);
        torso.castShadow = true;
        g.add(torso);
        // คอและศีรษะในตำแหน่งที่สมดุลกับไหล่
        const headY = baseY + 0.59,
          headZ = z + leanZ + 0.02;
        cyl(0.044, 0.05, 0.1, skT, x, baseY + 0.47, headZ - 0.01, g);
        ball(0.112, skT, x, headY, headZ, g, 0.95, 1.04, 1);
        ball(0.118, hr, x, headY + 0.025, headZ - 0.018, g, 0.98, 0.86, 1.02);
        for (const q of [-1, 1]) {
          ball(0.024, skT, x + q * 0.108, headY, headZ, g, 0.55, 1, 0.75);
          ball(0.014, ey, x + q * 0.04, headY + 0.01, headZ + 0.102, g);
          // แขน: ไหล่ -> ข้อศอก -> มือจับแฮนด์พอดี
          const shoulder = new THREE.Vector3(x + q * 0.155, baseY + 0.41, z + leanZ * 0.8),
            elbow = isBike
              ? new THREE.Vector3(x + q * 0.21, baseY + 0.28, z + 0.34)
              : new THREE.Vector3(x + q * 0.17, baseY + 0.22, z + 0.18),
            hand = isBike
              ? new THREE.Vector3(x + q * 0.23, baseY + 0.27, z + 0.58)
              : new THREE.Vector3(x + q * 0.14, baseY + 0.22, z + 0.38);
          link(shoulder, elbow, 0.044, 0.048, sh);
          ball(0.04, skT, elbow.x, elbow.y, elbow.z, g);
          link(elbow, hand, 0.034, 0.038, skT);
          ball(0.036, skT, hand.x, hand.y, hand.z, g);
          // ขา: สะโพก -> เข่ากางพ้นถังน้ำมัน -> เท้าวางบนพักเท้า
          const hip = new THREE.Vector3(x + q * 0.10, baseY + 0.04, z),
            knee = isBike
              ? new THREE.Vector3(x + q * 0.175, baseY - 0.08, z + 0.30)
              : new THREE.Vector3(x + q * 0.115, baseY - 0.12, z + 0.20),
            foot = isBike
              ? new THREE.Vector3(x + q * 0.15, baseY - 0.38, z + 0.17)
              : new THREE.Vector3(x + q * 0.11, baseY - 0.36, z + 0.30);
          link(hip, knee, 0.056, 0.068, jnT);
          ball(0.056, jnT, knee.x, knee.y, knee.z, g);
          link(knee, foot, 0.046, 0.054, jnT);
          ball(0.05, rubber, foot.x, foot.y, foot.z + 0.03, g, 0.95, 0.65, 1.45);
        }
        if (hat) {
          if (isBike) {
            // หมวกกันน็อกครึ่งใบพร้อมชิลด์บังลม
            const hm = new THREE.Mesh(
              new THREE.SphereGeometry(0.128, 18, 12, 0, Math.PI * 2, 0, Math.PI * 0.65),
              helmM
            );
            hm.position.set(x, headY + 0.015, headZ - 0.005);
            g.add(hm);
            box(0.18, 0.045, 0.05, glassM, x, headY + 0.03, headZ + 0.10, g);
          } else {
            const h = new THREE.Mesh(new THREE.ConeGeometry(0.28, 0.13, 14), stT);
            h.position.set(x, headY + 0.13, headZ);
            g.add(h);
          }
        }
        return;
      }
      const riderTorso = new THREE.Mesh(new THREE.CapsuleGeometry(0.145, 0.24, 5, 24), sh);
      riderTorso.position.set(x, y + 0.39, z);
      riderTorso.scale.set(1.08, 0.9, 0.86);
      riderTorso.castShadow = true;
      g.add(riderTorso);
      cyl(0.045, 0.05, 0.1, skT, x, y + 0.6, z, g);
      ball(0.12, skT, x, y + 0.73, z, g, 0.94, 1.06, 1);
      ball(0.126, hr, x, y + 0.77, z - 0.02, g, 0.98, 0.82, 1.04);
      for (const q of [-1, 1]) {
        ball(0.024, skT, x + q * 0.12, y + 0.73, z, g, 0.5, 1, 0.7);
        ball(0.015, ey, x + q * 0.042, y + 0.75, z + 0.112, g);
        ball(0.052, sh, x + q * 0.19, y + 0.54, z + 0.02, g);
        cyl(0.048, 0.04, 0.38, sh, x + q * 0.19, y + 0.42, z + 0.14, g, -0.75, 0);
        ball(0.042, skT, x + q * 0.19, y + 0.28, z + 0.28, g);
        cyl(0.065, 0.055, 0.46, jnT, x + q * 0.1, y - 0.02, z + 0.08, g, -0.2, 0);
        ball(0.058, rubber, x + q * 0.1, y - 0.25, z + 0.16, g, 0.95, 0.65, 1.65);
      }
      if (hat) {
        const h = new THREE.Mesh(new THREE.ConeGeometry(0.32, 0.15, 14), stT);
        h.position.set(x, y + 0.89, z);
        g.add(h);
      }
    }

    function trail(g, zc, len, W) {
      box(1.5, 0.12, len, pm2(0x8a6f4a), 0, 0.78, zc, g);
      for (const s of [-1, 1]) {
        box(0.06, 0.35, len, woodT, s * 0.72, 1, zc, g);
        wheelG(0.36, 0.2, s * 0.78, 0.36, zc - len * 0.2, g, W);
      }
      box(1.5, 0.35, 0.06, woodT, 0, 1, zc - len / 2, g);
      cyl(0.03, 0.03, 0.9, rubber, 0, 0.6, zc + len / 2 + 0.45, g, Math.PI / 2, 0);
      for (let i = 0; i < 4; i++)
        ball(
          0.3,
          pm2(i % 2 ? 0xe6d5a8 : 0xd9c27a),
          i % 2 ? 0.25 : -0.25,
          1.15,
          zc + len * (0.3 - i * 0.2),
          g,
          1,
          0.7,
          1.1
        );
    }
    const NEWV = {
      // รถพุ่มพวง (ดัดแปลงจากกระบะ เพิ่มถุงแขวนและโทรโข่ง)
      phumphuang: c => {
        const g = vehicle('pickup', c); // ใช้ฐานกระบะเดิม
        const bagColors = [0xff5555, 0x55ff55, 0x5555ff, 0xffff55, 0xffaa00];
        // ราวแขวนด้านหลัง
        box(1.6, 1.2, 0.05, pm2(0x888888), 0, 1.5, -1.6, g);
        box(1.6, 0.05, 1.4, pm2(0x888888), 0, 2.1, -0.9, g);
        // สุ่มถุงกับข้าวห้อยรอบคัน
        for(let i = 0; i < 15; i++) {
          const px = (Math.random() - 0.5) * 1.6;
          const pz = -0.5 - Math.random() * 1.0;
          const py = 1.3 + Math.random() * 0.5;
          ball(0.12, pm2(bagColors[i % 5]), px, py, pz, g, 1, 1.5, 1);
        }
        // ลำโพงโทรโข่งบนหลังคา
        const speaker = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.05, 0.3, 8), pm2(0xdddddd));
        speaker.rotation.x = Math.PI / 2;
        speaker.position.set(0, 1.6, 0.2);
        g.add(speaker);
        return g;
      },
      
      // รถอีแต๋น (โครงเปลือย ไม้กระดาน บรรทุกฟาง)
      etaen: c => {
        const g = new THREE.Group();
        const W = [];
        const wood = pm2(0x8b5a2b), metal = pm2(0x4a5568), engineM = pm2(0x882222);
        // คัสซีและล้อ
        box(1.0, 0.1, 3.2, metal, 0, 0.4, 0, g);
        for (const s of [-1, 1]) {
          wheelG(0.3, 0.15, s * 0.6, 0.3, 1.2, g, W); // ล้อหน้าเล็ก
          wheelG(0.4, 0.2, s * 0.7, 0.4, -1.2, g, W); // ล้อหลังใหญ่
        }
        // กระบะไม้ตีซี่ มีคานรองและแผงกั้นท้าย
        const strawBase = pm2(0x9b713b),
          strawMats = [0xc2a15b, 0xd2b66f, 0xb38a45, 0xd8c17a].map(pm2),
          twineM = pm2(0x78603a),
          chrome = pm2(0xb7b9ad),
          dark = pm2(0x303638);
        box(1.55, 0.12, 1.82, wood, 0, 0.53, -1.08, g);
        for (const s of [-1, 1]) {
          box(0.08, 0.42, 1.86, wood, s * 0.77, 0.78, -1.08, g);
          box(0.08, 0.42, 0.08, strawBase, s * 0.77, 0.78, -0.18, g);
          for (let i = 0; i < 4; i++) {
            box(0.06, 0.025, 1.65, strawBase, s * (0.25 + i * 0.17), 0.61, -1.08, g);
          }
        }
        box(1.55, 0.42, 0.08, wood, 0, 0.78, -2.0, g);
        for (let i = 0; i < 4; i++) box(1.48, 0.035, 0.045, strawBase, 0, 0.63 + i * 0.1, -2.05, g);

        // มัดฟางหยาบทรงไม่สมบูรณ์ วางสลับชั้นและรัดเชือกแทนก้อนเหลี่ยมเดียว
        const bales = [
          [-0.36, 0.92, -0.62, 0.38, 0.27, 0.46],
          [0.36, 0.92, -0.62, 0.38, 0.27, 0.46],
          [-0.36, 0.92, -1.48, 0.38, 0.27, 0.42],
          [0.36, 0.92, -1.48, 0.38, 0.27, 0.42],
          [-0.24, 1.47, -1.02, 0.34, 0.25, 0.48],
          [0.24, 1.47, -1.02, 0.34, 0.25, 0.48]
        ];
        for (const [bx, by, bz, sx, sy, sz] of bales) {
          const bale = new THREE.Mesh(new THREE.DodecahedronGeometry(0.58, 0), strawMats[Math.floor(Math.random() * strawMats.length)]);
          bale.position.set(bx, by, bz);
          bale.scale.set(sx / 0.58, sy / 0.58, sz / 0.58);
          bale.rotation.y = (Math.random() - 0.5) * 0.16;
          bale.castShadow = true;
          bale.receiveShadow = true;
          g.add(bale);
          for (const tx of [-0.18, 0.18]) {
            box(0.025, sy * 1.82, 0.035, twineM, bx + tx, by, bz, g);
            box(sx * 1.72, 0.025, 0.035, twineM, bx, by + sy * 0.88, bz, g);
          }
        }

        // เครื่องยนต์สูบเดียวพร้อมถังน้ำมัน อุปกรณ์บังคับ และท่อไอเสีย
        box(0.54, 0.42, 0.72, engineM, 0, 0.69, 1.08, g);
        cyl(0.19, 0.22, 0.12, metal, 0.32, 0.69, 1.1, g, 0, Math.PI / 2);
        cyl(0.025, 0.025, 0.42, chrome, 0.32, 0.69, 1.1, g, 0, Math.PI / 2);
        cyl(0.055, 0.07, 0.34, metal, 0.3, 0.95, 1.08, g, 0.35, 0);
        cyl(0.045, 0.035, 0.72, chrome, 0.48, 0.58, 0.82, g, Math.PI / 2, 0.15);
        // เบาะคนขับและพวงมาลัยแบบรถไถเดินตาม
        box(0.48, 0.08, 0.42, dark, 0, 0.91, 0.08, g);
        cyl(0.025, 0.028, 0.72, metal, 0, 1.02, 0.47, g, -0.38, 0);
        cyl(0.025, 0.025, 0.5, chrome, 0, 1.35, 0.61, g, 0, Math.PI / 2);
        rider(g, 0, 0.7, 0, 1, true, true);

        // บังโคลน ล้อหลัง และไฟ/ป้ายสะท้อนแสง
        for (const s of [-1, 1]) {
          const mudguard = box(0.12, 0.08, 0.9, wood, s * 0.72, 0.74, -1.2, g);
          mudguard.rotation.x = -0.08;
          box(0.16, 0.09, 0.05, lampM, s * 0.42, 0.72, 1.55, g);
          box(0.12, 0.11, 0.05, tailM, s * 0.55, 0.55, -1.94, g);
          box(0.16, 0.08, 0.025, pm2(0xf1df9b), s * 0.55, 0.42, -1.99, g);
        }
        box(0.32, 0.18, 0.06, pm2(0xf4eee0), 0, 0.44, -2.01, g);
        ball(0.1, lampM, 0, 0.93, 1.49, g); // ไฟหน้ารถ
        g.userData.w = W;
        return g;
      },
      
      bicycle: c => {
        const g = new THREE.Group(),
          W = [],
          b = pm2(c),
          chr = pm2(0xd8e0e8);
        for (const z of [-0.55, 0.55]) wheelG(0.3, 0.05, 0, 0.3, z, g, W);
        // โครงจักรยานแบบท่อกลมสมจริง (ไม่มีกล่องสี่เหลี่ยม)
        cyl(0.018, 0.018, 0.68, b, 0, 0.62, 0.12, g, Math.PI / 2 - 0.12, 0); // ท่อบน
        cyl(0.02, 0.02, 0.72, b, 0, 0.48, 0.14, g, Math.PI / 2 + 0.38, 0); // ท่อล่าง
        cyl(0.02, 0.02, 0.52, b, 0, 0.56, -0.18, g, -0.18, 0); // ท่อนั่ง
        cyl(0.015, 0.015, 0.46, b, 0, 0.46, -0.35, g, Math.PI / 2 - 0.55, 0); // ตะเกียบหลังบน
        cyl(0.015, 0.015, 0.42, b, 0, 0.32, -0.34, g, Math.PI / 2, 0); // ตะเกียบหลังล่าง
        cyl(0.02, 0.018, 0.64, chr, 0, 0.62, 0.46, g, -0.22, 0); // ตะเกียบหน้าและคอแฮนด์
        // แฮนด์กลมและปลอกมือจับตรงตำแหน่งมือคนปั่นพอดี
        cyl(0.016, 0.016, 0.38, chr, 0, 0.96, 0.34, g, 0, Math.PI / 2);
        for (const s of [-1, 1]) cyl(0.022, 0.022, 0.09, rubber, s * 0.16, 0.96, 0.34, g, 0, Math.PI / 2);
        // เบาะนั่งทรงมนและไฟหน้ากลม
        ball(0.09, rubber, 0, 0.84, -0.22, g, 0.75, 0.38, 1.35);
        ball(0.045, lampM, 0, 0.88, 0.48, g, 0.9, 0.9, 0.7);
        rider(g, 0, 0.52, -0.22, 1, true, true);
        g.userData.w = W;
        return g;
      },
      tractor: c => {
        const g = new THREE.Group(),
          W = [],
          b = pm2(c),
          dk = pm2(0x2f3d38);
        box(0.95, 0.55, 1.5, b, 0, 0.95, 0.1, g);
        box(0.8, 0.5, 0.9, b, 0, 0.9, 1, g);
        box(0.5, 0.14, 0.05, hub, 0, 0.95, 1.47, g);
        cyl(0.05, 0.05, 0.5, dk, 0.25, 1.4, 1.1, g);
        for (const s of [-1, 1]) {
          wheelG(0.62, 0.3, s * 0.78, 0.62, -0.45, g, W);
          wheelG(0.36, 0.18, s * 0.55, 0.36, 1, g, W);
          box(0.04, 0.8, 0.04, dk, s * 0.5, 1.6, -0.3, g);
          box(0.2, 0.14, 0.05, lampM, s * 0.28, 1, 1.47, g);
        }
        box(1.2, 0.05, 1, pm2(0xd9b56b), 0, 2, -0.3, g);
        rider(g, 0, 1, -0.3, 3, true);
        trail(g, -3.2, 2.6, W);
        g.userData.w = W;
        return g;
      },
      pickuptrailer: c => {
        const g = vehicle('pickup', c);
        trail(g, -3.6, 2.2, g.userData.w);
        return g;
      },
      tow: c => {
        const g = new THREE.Group(),
          W = [],
          b = pm2(c),
          dk = pm2(0x2f3d38);
        box(1.9, 0.2, 4.4, dk, 0, 0.55, -0.2, g);
        // ห้องโดยสารโปร่ง พร้อมกระจกใสและคนขับรถลาก
        box(1.8, 0.35, 1.2, b, 0, 0.82, 1.35, g);
        box(1.8, 0.08, 1.1, b, 0, 1.62, 1.35, g);
        box(1.8, 0.75, 0.08, b, 0, 1.22, 0.78, g);
        box(1.64, 0.46, 0.04, glassM, 0, 1.40, 1.95, g);
        for (const s of [-1, 1]) {
          box(0.08, 0.46, 0.08, b, s * 0.85, 1.40, 1.95, g);
          box(0.04, 0.46, 0.9, glassM, s * 0.88, 1.40, 1.35, g);
        }
        addCarDriver(g, -0.42, 0.72, 1.32, 0.85, 'tow', 0);
        const stCol = new THREE.Mesh(new THREE.CylinderGeometry(0.016, 0.018, 0.22, 10), dk);
        stCol.position.set(-0.42, 1.12, 1.65);
        stCol.rotation.x = -0.65;
        g.add(stCol);
        const stWheel = new THREE.Mesh(new THREE.TorusGeometry(0.095, 0.015, 6, 16), pm2(0x181c1a));
        stWheel.position.set(-0.42, 1.20, 1.58);
        stWheel.rotation.x = 0.65;
        g.add(stWheel);
        box(1.9, 0.08, 2.7, pm2(0xd8d4cc), 0, 0.74, -0.9, g).rotation.x = 0.05;
        ball(0.1, lampM, 0, 1.68, 1.3, g);
        for (const s of [-1, 1]) {
          box(0.3, 0.15, 0.05, lampM, s * 0.5, 0.8, 1.97, g);
          for (const z of [1.3, -1, -1.7]) wheelG(0.42, 0.26, s * 0.9, 0.42, z, g, W);
        }
        const cg = vehicle('sedan', 0xc8553d);
        cg.scale.setScalar(0.9);
        cg.position.set(0, 0.8, -0.9);
        g.add(cg);
        g.userData.w = W;
        return g;
      }
    };

    NEWV.tuktuk = c => {
      const g = new THREE.Group(),
        W = [],
        b = pm2(c),
        dk = pm2(0x2f3d38),
        roof = pm2(0xf0c95a),
        seat = pm2(0x8c2e2e),
        trim = pm2(0xd1d1d1),
        wht = pm2(0xf2f2f2);
      box(1.2, 0.1, 2.2, dk, 0, 0.3, 0, g);
      box(1.2, 0.05, 1.2, b, 0, 0.35, -0.5, g);
      box(0.6, 0.4, 0.6, b, 0, 0.5, 0.8, g);
      cyl(0.04, 0.04, 0.8, trim, 0, 0.6, 1.05, g, 0.3, 0);
      box(0.7, 0.04, 0.04, trim, 0, 0.8, 0.85, g);
      box(0.2, 0.15, 0.1, dk, 0, 0.7, 0.9, g);
      box(1.1, 0.6, 0.05, glassM, 0, 1.05, 0.7, g).rotation.x = -0.3;
      box(1.2, 0.05, 2.2, roof, 0, 1.45, -0.1, g);
      box(1.1, 0.03, 2.1, wht, 0, 1.42, -0.1, g);
      for (const s of [-1, 1]) {
        cyl(0.025, 0.025, 1.1, trim, s * 0.55, 0.9, -1.1, g);
        cyl(0.025, 0.025, 1.1, trim, s * 0.55, 0.9, 0.55, g);
        box(0.04, 0.04, 1.6, trim, s * 0.55, 0.8, -0.25, g);
        box(0.04, 0.04, 1.6, trim, s * 0.55, 0.6, -0.25, g);
      }
      box(1.1, 0.2, 0.5, seat, 0, 0.45, -0.65, g);
      box(1.1, 0.5, 0.1, seat, 0, 0.7, -0.85, g);
      box(0.5, 0.1, 0.4, seat, 0, 0.45, 0.3, g);
      wheelG(0.22, 0.08, 0, 0.22, 1.15, g, W);
      wheelG(0.24, 0.12, 0.5, 0.24, -0.85, g, W);
      wheelG(0.24, 0.12, -0.5, 0.24, -0.85, g, W);
      ball(0.08, lampM, 0, 0.55, 1.12, g);
      box(0.3, 0.1, 0.05, tailM, 0, 0.4, -1.12, g);
      rider(g, 0, 0.4, 0.3, 2, true, true);
      rider(g, 0.3, 0.45, -0.65, 1, false, true);
      if (Math.random() > 0.5) rider(g, -0.3, 0.45, -0.65, 4, false, true);
      g.userData.w = W;
      return g;
    };
    NEWV.schoolbus = c => {
      const g = new THREE.Group(),
        W = [],
        b = pm2(0xf5d142),
        dk = pm2(0x2f3d38),
        trim = pm2(0x222222),
        wht = pm2(0xdddddd),
        seat = pm2(0x333333);
      // โครงตัวถังรถโรงเรียนแบบโปร่ง (Hollow Bus Body) มองเห็นภายในและคนขับ
      box(1.8, 0.72, 5.5, b, 0, 0.71, 0, g);
      box(1.8, 0.32, 5.5, b, 0, 2.0, 0, g);
      box(1.8, 1.0, 0.1, b, 0, 1.5, -2.75, g);
      box(1.7, 0.82, 0.04, glassM, 0, 1.48, 2.76, g);
      for (const s of [-1, 1]) box(0.06, 0.82, 0.06, b, s * 0.87, 1.48, 2.76, g);
      box(1.6, 0.16, 0.38, dk, 0, 1.08, 2.55, g);
      addCarDriver(g, -0.48, 0.72, 2.18, 1.05, 'schoolbus', 1);
      const stCol = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.02, 0.26, 10), dk);
      stCol.position.set(-0.48, 1.18, 2.48);
      stCol.rotation.x = -0.65;
      g.add(stCol);
      const stWheel = new THREE.Mesh(new THREE.TorusGeometry(0.11, 0.016, 6, 16), pm2(0x181c1a));
      stWheel.position.set(-0.48, 1.28, 2.40);
      stWheel.rotation.x = 0.65;
      g.add(stWheel);
      box(1.7, 0.7, 1.0, b, 0, 0.7, 3.25, g);
      box(1.8, 0.15, 0.1, trim, 0, 0.4, 3.8, g);
      box(1.8, 0.15, 0.1, trim, 0, 0.4, -2.8, g);
      box(1.2, 0.5, 0.05, trim, 0, 0.8, 3.75, g);
      for (let i = 0; i < 5; i++) box(0.04, 0.45, 0.06, wht, -0.4 + i * 0.2, 0.8, 3.76, g);
      for (const s of [-1, 1]) {
        box(0.03, 0.05, 5.5, trim, s * 0.91, 1.0, 0, g);
        box(0.03, 0.05, 5.5, trim, s * 0.91, 1.25, 0, g);
        box(0.03, 0.05, 5.5, trim, s * 0.91, 0.7, 0, g);
      }
      box(1.7, 0.6, 0.05, glassM, 0, 1.5, -2.76, g);
      box(0.6, 0.6, 0.02, trim, 0, 1.2, -2.77, g);
      box(0.4, 0.4, 0.04, glassM, 0, 1.3, -2.78, g);
      for (let i = 0; i < 6; i++) {
        const wz = 2.2 - i * 0.9;
        for (const s of [-1, 1]) {
          box(0.05, 0.55, 0.7, glassM, s * 0.9, 1.5, wz, g);
          box(0.6, 0.4, 0.3, seat, s * 0.5, 1.1, wz + 0.1, g);
        }
      }
      box(0.7, 0.05, 0.7, wht, 0, 2.16, 1.5, g);
      box(0.7, 0.05, 0.7, wht, 0, 2.16, -1.5, g);
      for (const s of [-1, 1]) {
        cyl(0.02, 0.02, 0.4, trim, s * 0.9, 1.5, 3.5, g, 0, s * 0.5);
        ball(0.1, trim, s * 1.05, 1.6, 3.65, g);
      }
      for (const s of [-1, 1]) {
        wheelG(0.4, 0.25, s * 0.9, 0.4, 2.0, g, W);
        wheelG(0.4, 0.25, s * 0.8, 0.4, -1.8, g, W);
        wheelG(0.4, 0.25, s * 1.0, 0.4, -1.8, g, W);
      }
      for (const s of [-1, 1]) {
        ball(0.12, lampM, s * 0.6, 0.8, 3.76, g);
        box(0.12, 0.12, 0.05, lampM, s * 0.75, 2.05, 2.76, g);
        box(0.12, 0.12, 0.05, tailM, s * 0.75, 2.05, -2.76, g);
        box(0.18, 0.18, 0.05, tailM, s * 0.7, 0.7, -2.76, g);
      }
      const stopSign = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 0.04, 8), pm2(0xc23a3a));
      stopSign.rotation.z = Math.PI / 2;
      stopSign.position.set(0.92, 1.2, 1.0);
      g.add(stopSign);
      box(0.04, 0.04, 0.15, trim, 0.9, 1.2, 1.0, g);
      g.userData.w = W;
      return g;
    };
    NEWV.bus = c => {
      const g = new THREE.Group(),
        W = [],
        b = pm2(c),
        wht = pm2(0xf2f2f2),
        dk = pm2(0x222222),
        seat = pm2(0x526b8c),
        trim = pm2(0xb3b3b3);
      // โครงสร้างตัวถังรถบัสแบบโปร่ง (Hollow Bus) มองทะลุกระจกหน้าและข้างเห็นคนขับและผู้โดยสาร
      box(1.9, 0.68, 7.5, wht, 0, 0.74, 0, g);
      box(1.9, 0.35, 7.5, wht, 0, 2.33, 0, g);
      box(1.9, 1.25, 0.1, wht, 0, 1.53, -3.75, g);
      for (const s of [-1, 1]) box(0.08, 1.25, 0.08, wht, s * 0.91, 1.53, 3.75, g);
      box(1.7, 0.16, 0.5, dk, 0, 1.12, 3.5, g);
      box(1.92, 0.6, 7.52, b, 0, 0.7, 0, g);
      for (let i = 0; i < 3; i++) {
        box(1.94, 0.4, 1.2, b, 0, 0.7, 0.8 - i * 1.3, g);
        box(1.96, 0.02, 1.2, dk, 0, 0.7, 0.8 - i * 1.3, g);
      }
      box(1.85, 1.1, 0.05, glassM, 0, 1.7, 3.76, g);
      box(1.85, 0.8, 0.05, glassM, 0, 1.8, -3.76, g);
      box(1.4, 0.2, 0.06, dk, 0, 2.35, 3.75, g);
      box(1.2, 0.1, 0.07, pm2(0xf5a442), 0, 2.35, 3.76, g);
      for (const s of [-1, 1]) box(0.4, 0.02, 0.06, dk, s * 0.4, 1.3, 3.78, g).rotation.z = 0.2;
      for (const s of [-1, 1]) {
        box(0.06, 0.9, 7.0, glassM, s * 0.94, 1.75, 0, g);
        for (let i = 0; i < 7; i++) {
          const wz = 3.0 - i * 0.95;
          box(0.08, 0.9, 0.04, dk, s * 0.94, 1.75, wz, g);
          box(0.6, 0.4, 0.4, seat, s * 0.5, 1.3, wz, g);
        }
        if (s === 1) {
          box(0.08, 1.9, 0.8, glassM, 0.95, 1.35, 2.8, g);
          box(0.08, 1.9, 0.8, glassM, 0.95, 1.35, -0.5, g);
        }
      }
      box(1.2, 0.25, 2.5, wht, 0, 2.6, -1.0, g);
      box(1.0, 0.26, 2.0, trim, 0, 2.6, -1.0, g);
      for (const s of [-1, 1]) {
        wheelG(0.42, 0.25, s * 0.9, 0.42, 2.4, g, W);
        wheelG(0.42, 0.25, s * 0.8, 0.42, -1.8, g, W);
        wheelG(0.42, 0.25, s * 1.0, 0.42, -1.8, g, W);
        wheelG(0.42, 0.25, s * 0.9, 0.42, -2.7, g, W);
      }
      for (const s of [-1, 1]) {
        box(0.25, 0.15, 0.05, lampM, s * 0.7, 0.6, 3.77, g);
        box(0.2, 0.1, 0.05, lampM, s * 0.7, 0.4, 3.77, g);
        box(0.15, 0.4, 0.05, tailM, s * 0.8, 1.0, -3.77, g);
      }
      for (const s of [-1, 1]) {
        cyl(0.03, 0.03, 0.6, dk, s * 1.0, 2.1, 3.8, g, 0, s * 0.3);
        box(0.15, 0.5, 0.15, b, s * 1.15, 1.7, 3.8, g);
        box(0.1, 0.45, 0.16, glassM, s * 1.15, 1.7, 3.8, g);
      }
      // พวงมาลัยและคนขับรถบัส
      const stCol = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.022, 0.30, 10), dk);
      stCol.position.set(-0.4, 1.35, 3.42);
      stCol.rotation.x = -0.65;
      g.add(stCol);
      const stWheel = new THREE.Mesh(new THREE.TorusGeometry(0.12, 0.018, 6, 16), pm2(0x181c1a));
      stWheel.position.set(-0.4, 1.46, 3.32);
      stWheel.rotation.x = 0.65;
      g.add(stWheel);
      rider(g, -0.4, 1.1, 3.0, 2, false, true);
      g.userData.w = W;
      return g;
    };

    function mkVeh(k, c) {
      return NEWV[k] ? NEWV[k](c) : vehicle(k, c);
    }

    /* ============================================================================
     * src/scene/20-vehicle-sfx-tap.js
     * เสียงเอฟเฟกต์ (กริ่ง แตร ลมผ่าน) และการแตะทักทายรถ (tapVeh)
     * (ไฟล์นี้ถูกต่อรวมเป็น closure เดียวกับไฟล์อื่น — ไม่ต้อง import/export · ลำดับไฟล์ดู build.config.mjs)
     * ========================================================================== */

    let pCtx = null,
      nbuf = null,
      thunderBuf = null;
    function sfx() {
      if (!pCtx) {
        try {
          pCtx = new (window.AudioContext || window.webkitAudioContext)();
        } catch (e) {
          return null;
        }
      }
      if (pCtx.state === 'suspended') pCtx.resume().catch(() => {});
      return pCtx.state === 'running' ? pCtx : null;
    }
    function whoosh(pan, vol, speed) {
      if (!(soundOn || mOn || cockpit)) return;
      const x = sfx();
      if (!x) return;
      try {
        if (!nbuf) {
          // ใช้ Pink-filtered Noise ที่นุ่มนวลแทน White Noise ดิบ เพื่อให้เสียงลมรถสวนฟังดูนุ่มสบายหู
          nbuf = x.createBuffer(1, x.sampleRate * 1.5, x.sampleRate);
          const d = nbuf.getChannelData(0);
          let b0 = 0, b1 = 0, b2 = 0;
          for (let i = 0; i < d.length; i++) {
            const w = Math.random() * 2 - 1;
            b0 = 0.997 * b0 + w * 0.029;
            b1 = 0.985 * b1 + w * 0.032;
            b2 = 0.950 * b2 + w * 0.048;
            d[i] = (b0 + b1 + b2 + w * 0.018) * 0.35;
          }
        }
        const s = x.createBufferSource(),
          f = x.createBiquadFilter(),
          lp = x.createBiquadFilter(),
          g = x.createGain(),
          p = x.createStereoPanner ? x.createStereoPanner() : null,
          t = x.currentTime;

        s.buffer = nbuf;
        s.playbackRate.setValueAtTime(1.05 + speed * 0.14, t);
        s.playbackRate.exponentialRampToValueAtTime(0.58, t + 1.05);

        f.type = 'bandpass';
        f.Q.value = 0.75;
        f.frequency.setValueAtTime(420 + speed * 220, t);
        f.frequency.exponentialRampToValueAtTime(140, t + 1.15);

        lp.type = 'lowpass';
        lp.frequency.value = 900;

        const peakVol = Math.min(0.08, vol * 0.55) * (cockpit ? 0.35 : 1);
        g.gain.setValueAtTime(0.0001, t);
        g.gain.linearRampToValueAtTime(peakVol, t + 0.28);
        g.gain.exponentialRampToValueAtTime(0.0001, t + 1.15);

        s.connect(f);
        f.connect(lp);
        lp.connect(g);
        if (p) {
          p.pan.setValueAtTime(pan * 0.2, t);
          p.pan.linearRampToValueAtTime(pan > 0 ? 0.85 : -0.85, t + 0.85);
          g.connect(p);
          p.connect(x.destination);
        } else g.connect(x.destination);

        s.start(t);
        s.stop(t + 1.25);
      } catch (e) {}
    }
    function tone(fr, dur, vol, type, delay, force) {
      if (!force && !(soundOn || mOn || cockpit)) return;
      const x = sfx();
      if (!x) return;
      try {
        const o = x.createOscillator(),
          flt = x.createBiquadFilter(),
          g = x.createGain(),
          t = x.currentTime + (delay || 0);
        o.type = type || 'sine';
        o.frequency.setValueAtTime(fr, t);
        // กรองความถี่แหลมออกเพื่อให้ทุกเสียงโทนฟังดูอบอุ่นและนุ่มนวล
        flt.type = 'lowpass';
        flt.frequency.setValueAtTime(Math.min(1800, fr * 2.6), t);
        g.gain.setValueAtTime(0.0001, t);
        g.gain.linearRampToValueAtTime(vol, t + 0.025);
        g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
        o.connect(flt);
        flt.connect(g);
        g.connect(x.destination);
        o.start(t);
        o.stop(t + dur + 0.05);
      } catch (e) {}
    }
    // เสียงกริ่งจักรยานแบบกระดิ่งทองเหลืองกังวานใส "กริ๊ง-กริ๊ง" สมจริงและนุ่มหู
    const bell = f => {
      if (!f && !(soundOn || mOn || cockpit)) return;
      const x = sfx();
      if (!x) return;
      try {
        [0, 0.11].forEach((dly, idx) => {
          const t = x.currentTime + dly;
          const base = idx === 0 ? 1568 : 1760; // G6 -> A6 กังวานใสแต่ไม่แหลมจัด
          [1, 2.02].forEach((harm, hIdx) => {
            const o = x.createOscillator(),
              g = x.createGain();
            o.type = 'sine';
            o.frequency.setValueAtTime(base * harm, t);
            const v = (hIdx === 0 ? 0.032 : 0.012) * (idx === 0 ? 0.9 : 1);
            g.gain.setValueAtTime(0.0001, t);
            g.gain.linearRampToValueAtTime(v, t + 0.008);
            g.gain.exponentialRampToValueAtTime(0.0001, t + (hIdx === 0 ? 0.65 : 0.28));
            o.connect(g).connect(x.destination);
            o.start(t);
            o.stop(t + 0.7);
          });
        });
      } catch (e) {}
    };
    // เสียงแตรรถยนต์แบบ Dual-Tone คอร์ดคู่ 3 (F4 + A4) ผ่าน Lowpass Filter นุ่มนวลเป็นมิตร "ปิ๊น-ปิ๊น"
    const honk = (f, force) => {
      if (!force && !(soundOn || mOn || cockpit)) return;
      const x = sfx();
      if (!x) return;
      try {
        const pitch = f || 1;
        // เคาะแตรสั้นๆ 2 จังหวะแบบทักทายอย่างสุภาพ
        [
          [0, 0.13, 0.9],
          [0.17, 0.22, 1.0]
        ].forEach(([dly, dur, envScale]) => {
          const t = x.currentTime + dly;
          const flt = x.createBiquadFilter(),
            g = x.createGain();
          flt.type = 'lowpass';
          flt.frequency.setValueAtTime(880 * pitch, t);
          flt.Q.value = 1.2;

          // ผสมความถี่คู่ประสานแตรรถจริง (349.2Hz F4 และ 440Hz A4)
          [349.23 * pitch, 440.0 * pitch].forEach((freq, i) => {
            const o = x.createOscillator();
            o.type = i === 0 ? 'triangle' : 'sine';
            o.frequency.setValueAtTime(freq * 0.985, t);
            o.frequency.linearRampToValueAtTime(freq, t + 0.02);
            o.connect(flt);
            o.start(t);
            o.stop(t + dur + 0.04);
          });

          const maxV = 0.038 * envScale;
          g.gain.setValueAtTime(0.0001, t);
          g.gain.linearRampToValueAtTime(maxV, t + 0.018);
          g.gain.setValueAtTime(maxV * 0.88, t + dur - 0.04);
          g.gain.exponentialRampToValueAtTime(0.0001, t + dur + 0.03);
          flt.connect(g).connect(x.destination);
        });
      } catch (e) {}
    };
    // เสียงฟ้าร้องระยะไกลแบบธรรมชาติ (Rolling Distant Thunder จาก Brown Noise + Lowpass Sweep ไม่ใช้คลื่นฟันเลื่อย)
    function thunderSound(dist) {
      if (!(soundOn || mOn || cockpit)) return;
      const x = sfx();
      if (!x) return;
      try {
        if (!thunderBuf) {
          const len = Math.floor(x.sampleRate * 4.5);
          thunderBuf = x.createBuffer(2, len, x.sampleRate);
          for (let ch = 0; ch < 2; ch++) {
            const d = thunderBuf.getChannelData(ch);
            let last = 0;
            for (let i = 0; i < len; i++) {
              const w = Math.random() * 2 - 1;
              last = (last + 0.035 * w) / 1.035;
              // สร้างคลื่นลูกคลื่นฟ้าร้องสะท้อนหุบเขา 3 จังหวะ
              const u = i / len;
              const swell =
                Math.exp(-u * 2.4) *
                (0.65 + 0.35 * Math.sin(u * 19 + ch * 0.8) * Math.sin(u * 7.5));
              d[i] = last * 4.2 * swell;
            }
          }
        }
        const t = x.currentTime;
        const src = x.createBufferSource(),
          lp = x.createBiquadFilter(),
          hp = x.createBiquadFilter(),
          g = x.createGain();
        src.buffer = thunderBuf;
        src.playbackRate.value = 0.78 + Math.random() * 0.22;

        hp.type = 'highpass';
        hp.frequency.value = 32;

        lp.type = 'lowpass';
        const distFactor = Math.max(0.35, Math.min(1, 150 / (dist || 160)));
        lp.frequency.setValueAtTime(210 * distFactor, t);
        lp.frequency.exponentialRampToValueAtTime(115 * distFactor, t + 1.1);
        lp.frequency.exponentialRampToValueAtTime(52, t + 3.8);

        const vol = 0.16 * distFactor * (cockpit ? 0.55 : 1);
        g.gain.setValueAtTime(0.0001, t);
        g.gain.linearRampToValueAtTime(vol, t + 0.18);
        g.gain.exponentialRampToValueAtTime(vol * 0.65, t + 1.15);
        g.gain.exponentialRampToValueAtTime(0.0001, t + 3.9);

        src.connect(hp).connect(lp).connect(g).connect(x.destination);
        src.start(t);
        src.stop(t + 4.1);
      } catch (e) {}
    }
    const REPLY = {
      bicycle: 'กริ๊งงง! สวัสดีจ้า ' + svgInline('wave'),
      tractor: 'ตึ๊ก ตึ๊ก! สวัสดีครับ ' + svgInline('wave'),
      tow: 'ปี๊น ปี๊น! ขับดี ๆ นะ',
      bike: 'บรื้นน! สวัสดีครับ ' + svgInline('wave'),
      pickuptrailer: 'ปี๊น ปี๊น! ผลไม้สด ๆ นะ',
      schoolbus: 'ไปโรงเรียนกัน! ' + svgInline('school'),
      bus: 'ชิดในเลยพี่! ' + svgInline('car'),
      tuktuk: 'ไปไหนครับพี่! ' + svgInline('car')
    };
    function tapVeh(ray) {
      const vis = traffic.filter(c => c.g.visible),
        h = ray.intersectObjects(
          vis.map(c => c.g),
          true
        )[0];
      if (!h) return;
      const c = vis.find(v => {
        let q = h.object;
        while (q) {
          if (q === v.g) return true;
          q = q.parent;
        }
        return false;
      });
      if (!c) return;
      honk(1, true);
      c.wv = totalTime + 1.3;
      setTimeout(() => {
        if (c.kind === 'bicycle') bell(true);
        else honk(1.25, true);
        say(
          c,
          REPLY[c.kind] || 'ปี๊น ปี๊น! สวัสดีครับ ' + svgInline('wave'),
          c.kind === 'tractor' || c.kind === 'tow' ? 3 : 2.2,
          3.2
        );
      }, 380);
    }

    /* ============================================================================
     * src/scene/21-traffic.js
     * รถสวนทางและการเคลื่อนที่ของการจราจร (updateTraffic)
     * (ไฟล์นี้ถูกต่อรวมเป็น closure เดียวกับไฟล์อื่น — ไม่ต้อง import/export · ลำดับไฟล์ดู build.config.mjs)
     * ========================================================================== */

    const TRAFFIC_SPEED = {
      bicycle: 0.9, bike: 1.65, tractor: 1.0, pickuptrailer: 1.15, tow: 1.25,
      sedan: 1.45, pickup: 1.38, van: 1.35, schoolbus: 1.22, bus: 1.28, tuktuk: 1.15,
      sportscar: 1.85, suv: 1.42, camper: 1.2, hatchback: 1.4, delivery: 1.3,
      classic: 1.25, ev_commuter: 1.5, police: 1.6, ambulance: 1.65, minitruck: 1.2,
      phumphuang: 1.1, etaen: 0.95 // <-- เพิ่มตรงนี้
    };

    const TR = [
      ['pickuptrailer', 0xd9b56b],
      ['phumphuang', 0xffffff],
      ['etaen', 0x555555],
      ['pickup', 0x6d8fa8],
      ['sedan', 0xe9e3d3],
      ['van', 0xf2efe6],
      ['bike', 0xc8553d],
      ['schoolbus', 0xf5d142],
      ['tractor', 0x2f7d4f],
      ['bicycle', 0x3d6a8a],
      ['suv', 0x2b2b2b],
      ['delivery', 0xffa500],
      ['classic', 0x5b3a29],
      ['ev_commuter', 0xa8d8ea],
      ['minitruck', 0x477050],
      ['tuktuk', 0x3b6e8c],
      ['hatchback', 0xd96c7a]
    ].sort(() => rand() - 0.5);

    // สร้างตาราง Arc-Length LUT เพื่อแปลงระยะทางจริง (World Units) <-> พารามิเตอร์ t โดยไม่เพี้ยนตามความชันเส้นโค้ง
    const LUT_N = 2000,
      cumS = new Float32Array(LUT_N + 1);
    {
      let prevP = route.getPoint(0);
      for (let i = 1; i <= LUT_N; i++) {
        const curP = route.getPoint(i / LUT_N);
        cumS[i] = cumS[i - 1] + prevP.distanceTo(curP);
        prevP = curP;
      }
    }
    const TOTAL_ROUTE_LEN = cumS[LUT_N];
    function sFromT(t) {
      const u = (((t % 1) + 1) % 1) * LUT_N,
        i = Math.min(LUT_N - 1, Math.floor(u)),
        f = u - i;
      return cumS[i] + (cumS[i + 1] - cumS[i]) * f;
    }
    function tFromS(s) {
      const target = ((s % TOTAL_ROUTE_LEN) + TOTAL_ROUTE_LEN) % TOTAL_ROUTE_LEN;
      let lo = 0,
        hi = LUT_N;
      while (lo < hi - 1) {
        const mid = (lo + hi) >> 1;
        if (cumS[mid] <= target) lo = mid;
        else hi = mid;
      }
      const span = cumS[hi] - cumS[lo] || 1;
      return (lo + (target - cumS[lo]) / span) / LUT_N;
    }

    // สร้าง Texture แสงไฟสาดพื้นถนน
    const hlCanvas = document.createElement('canvas');
    hlCanvas.width = 256;
    hlCanvas.height = 512;
    const hlCtx = hlCanvas.getContext('2d');
    hlCtx.clearRect(0, 0, 256, 512);
    hlCtx.save();
    hlCtx.scale(1, 4);
    const hlGrd = hlCtx.createRadialGradient(128, 0, 0, 128, 0, 127);
    hlGrd.addColorStop(0, 'rgba(255, 240, 200, 0.4)');
    hlGrd.addColorStop(0.35, 'rgba(255, 240, 200, 0.1)');
    hlGrd.addColorStop(1, 'rgba(255, 240, 200, 0)');
    hlCtx.fillStyle = hlGrd;
    hlCtx.fillRect(0, 0, 256, 128);
    hlCtx.restore();

    const hlTex = new THREE.CanvasTexture(hlCanvas);
    const hlGeo = new THREE.PlaneGeometry(12, 32);
    hlGeo.rotateX(-Math.PI / 2);
    hlGeo.translate(0, 0.08, 16);

    const traffic = TR.map(s => {
      const L = LEN[s[0]];
      const g = mkVeh(s[0], s[1]);
      g.visible = false;

      const beamMat = new THREE.MeshBasicMaterial({
        map: hlTex,
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        fog: false
      });
      const beam = new THREE.Mesh(hlGeo, beamMat);
      beam.position.set(0, 0, L / 2);
      g.add(beam);

      scene.add(g);
      return {
        g,
        beamMat,
        kind: s[0],
        len: L,
        cool: 0,
        worldSp: 0,
        speedFactor: TRAFFIC_SPEED[s[0]],
        distM: 999,
        sameLane: false,
        active: false,
        fa: 0,
        bl: 0,
        pd: undefined
      };
    });

    // วางรถเริ่มต้นแค่คันเดียวให้ห่างจากผู้เล่นในระยะที่พอดี
    traffic[0].active = true;
    traffic[0].sameLane = false;
    traffic[0].distM = 82;
    traffic[0].speedFactor = TRAFFIC_SPEED[traffic[0].kind];

    traffic[1].active = true;
    traffic[1].sameLane = false;
    traffic[1].distM = 84;
    traffic[1].speedFactor = TRAFFIC_SPEED[traffic[1].kind];

    

    const RLEN = route.getLength(),
      ARCJ = 196.8;
    let DS = 353,
      oncomingCooldown = 12.0, // เวลาถนนโล่งรอบแรกหลังจากคันแรกวิ่งผ่านไป
      sameLaneCooldown = 25.0,
      lastWasShort = false;    // ตัวจำสถานะเพื่อบังคับให้สลับกลับไปถนนโล่ง

    function pickInactiveCars(count) {
      const pool = traffic.filter(c => !c.active);
      for (let i = pool.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [pool[i], pool[j]] = [pool[j], pool[i]];
      }
      return pool.slice(0, count);
    }

    function updateTraffic(dt) {
      const mv = state.reduced ? 0 : dt;
      window._ovt = window._ovt || 0;
      window._playerBrake = window._playerBrake || 1;
      window._playerBoost = window._playerBoost || 1; // 🚀 ตัวแปรใหม่เก็บความเร็วตอนเร่งแซง

      const currentBrake = window._playerBrake;
      const currentBoost = window._playerBoost;
      const sg = turn > 0.5 ? -1 : 1;
      const sPlayer = sFromT(state.routeT);

      // ความเร็วจริงของผู้เล่นในหน่วย World Units ต่อวินาที
      const rawPlayerWorldSp = (((speedMul * KMH) / 3600) * ARCJ) / KM_TOTAL;
      // 🚀 นำ currentBoost มาคูณเพื่อให้รถคันอื่นถูกแซงและถอยหลังไวขึ้น
      const actualPlayerWorldSp = rawPlayerWorldSp * currentBrake * currentBoost; 
      const baseTrafficWorldSp = Math.max(rawPlayerWorldSp * 1.15, 1.35 + Math.sqrt(speedMul) * 0.28);
      const schoolCrossingActive = !state.night && !!window._schoolCrossingActive,
        schoolCrossingS = sFromT(window._schoolCrossingT || T_SCHOOL_FIELD);
      // --- 1. ตัวควบคุมจังหวะรถ (นับเวลาเฉพาะตอนถนนโล่ง ไม่มีรถสวนอยู่ข้างหน้า) ---
      if (mv > 0) {
        const activeOncoming = traffic.filter(c => c.active && !c.sameLane);
        const hasOncomingAhead = activeOncoming.some(c => c.distM > -5);

        // นับถอยหลังความเงียบสงบ เฉพาะเมื่อรถชุดเก่าวิ่งผ่านหน้าเราไปหมดแล้วเท่านั้น
        if (!hasOncomingAhead) {
          oncomingCooldown -= dt;
        }

        if (oncomingCooldown <= 0 && activeOncoming.length === 0) {
          // โอกาส 70% มาคันเดียวเดี่ยวๆ, โอกาส 30% มา 2 คันเว้นระยะห่างกันแบบธรรมชาติ
          const wantPair = Math.random() < 0.30;
          const picked = pickInactiveCars(wantPair ? 2 : 1);
          if (picked.length > 0) {
            const first = picked[0];
            const baseDist = 90 + Math.random() * 10;
            const waveSpeed = TRAFFIC_SPEED[first.kind] * (0.9 + Math.random() * 0.2);

            first.active = true;
            first.sameLane = false;
            first.distM = baseDist;
            first.speedFactor = waveSpeed;
            first.fa = 0;
            first.bl = 0;
            first.pd = undefined;

            if (picked.length > 1) {
              const second = picked[1];
              // เว้นระยะห่างระหว่างคันที่ 1 กับคันที่ 2 ประมาณ 28 - 50 หน่วย (ไม่ให้จี้ท้ายกันเกินไป)
              const gapM = (first.len + second.len) * 0.5 + 28 + Math.random() * 22;
              second.active = true;
              second.sameLane = false;
              second.distM = baseDist + gapM;
              second.speedFactor = waveSpeed * (0.95 + Math.random() * 0.08);
              second.fa = 0;
              second.bl = 0;
              second.pd = undefined;
            }

            // สุ่มจังหวะความโล่งสำหรับรอบถัดไป (เริ่มนับหลังจากรถชุดนี้ผ่านหน้าเราไปแล้ว)
            const r = Math.random();
            if (lastWasShort || r < 0.40) {
              // จังหวะถนนโล่งยาว: ว่างเปล่า 18 - 32 วินาที
              oncomingCooldown = 18 + Math.random() * 14;
              lastWasShort = false;
            } else if (r < 0.82) {
              // จังหวะปกติ: ว่าง 9 - 16 วินาที
              oncomingCooldown = 9 + Math.random() * 7;
              lastWasShort = false;
            } else {
              // จังหวะสวนมาติดๆ กันนิดหน่อย: ว่าง 3 - 6 วินาที (แล้วรอบหน้าจะบังคับโล่งยาวทันที)
              oncomingCooldown = 3 + Math.random() * 3;
              lastWasShort = true;
            }
          }
        }

        // รถเลนเดียวกับเรา (นานๆ โผล่มาให้แซงสัก 1 คัน และไม่โผล่ตอนมีรถสวนมาเยอะ)
        const activeSame = traffic.filter(c => c.active && c.sameLane);
        if (activeSame.length === 0) {
          sameLaneCooldown -= dt;
        }
        if (sameLaneCooldown <= 0 && activeSame.length === 0 && activeOncoming.length <= 1) {
          const picked = pickInactiveCars(1);
          if (picked.length > 0) {
            const c = picked[0];
            c.active = true;
            c.sameLane = true;
            c.distM = 62 + Math.random() * 12;
            c.speedFactor = 0.55 + Math.random() * 0.22;
            c.fa = 0;
            c.bl = 0;
            c.pd = undefined;
            // เว้นช่วงรถเลนเดียวกันยาวๆ 30 - 55 วินาที
            sameLaneCooldown = 30 + Math.random() * 25;
          }
        }
      }

      // --- 2. อัปเดตตำแหน่งและรักษาระยะห่าง ---
      const activeList = traffic.filter(c => c.active).sort((a, b) => a.distM - b.distM);
      let needToOvertake = false;
      let isOppositeLaneClear = true;
      let frontCarSpeed = 1;
      let isAlongside = false;

      activeList.forEach((c, i) => {
        let ld = null;
        if (c.sameLane) {
          for (let j = i + 1; j < activeList.length; j++) {
            if (activeList[j].sameLane) { ld = activeList[j]; break; }
          }
        } else {
          for (let j = i - 1; j >= 0; j--) {
            if (!activeList[j].sameLane) { ld = activeList[j]; break; }
          }
        }

        let carWorldSp = c.sameLane
          ? rawPlayerWorldSp * c.speedFactor
          : baseTrafficWorldSp * c.speedFactor;

        if (ld) {
          const minGap = (c.len + ld.len) * 0.5 + 18;
          const gap = Math.abs(c.distM - ld.distM);
          if (gap < minGap) {
            carWorldSp = Math.min(carWorldSp, ld.worldSp * Math.max(0.4, gap / minGap));
          }
        }

        c.schoolStopped = false;
        if (schoolCrossingActive) {
          const carS = ((sPlayer + sg * c.distM) % TOTAL_ROUTE_LEN + TOTAL_ROUTE_LEN) % TOTAL_ROUTE_LEN,
            travelSign = c.sameLane ? sg : -sg,
            distToCrossing = ((schoolCrossingS - carS) * travelSign % TOTAL_ROUTE_LEN + TOTAL_ROUTE_LEN) % TOTAL_ROUTE_LEN,
            stopBuffer = 8 + c.len * 0.5;
          if (distToCrossing > 0 && distToCrossing < stopBuffer + 36) {
            const remaining = Math.max(0, distToCrossing - stopBuffer);
            carWorldSp = Math.min(carWorldSp, Math.sqrt(2 * 2.8 * remaining));
            c.schoolStopped = remaining < 0.12;
          }
        }

        c.worldSp = carWorldSp;
        const deltaM = c.sameLane
          ? (carWorldSp - actualPlayerWorldSp)
          : -(carWorldSp + actualPlayerWorldSp);
        c.distM += deltaM * mv;

        // ขยายเพดานด้านหน้าเป็น 190 เพื่อรองรับคันที่ 2 ที่รอตามมาห่างๆ ไม่ให้ถูกตัดจบก่อนเข้าฉาก
        if (c.distM < -38 || c.distM > 190) {
          c.active = false;
          c.fa = 0;
          c.g.visible = false;
        }
      });

      // --- 3. แปลงระยะทางจริงเป็นพิกัด 3D บนถนนและแสดงผล ---
      for (const c of traffic) {
        if (!c.active) {
          c.g.visible = false;
          continue;
        }

        const ok = c.distM < 86 && c.distM > -32 && Math.abs(turn - (dirT < 0 ? 1 : 0)) < 0.03;
        c.fa = Math.max(0, Math.min(1, (c.fa || 0) + dt * (ok ? 1.2 : -1.2)));
        c.g.visible = c.fa > 0.01;
        if (!c.g.visible) continue;

        if (c.beamMat) c.beamMat.opacity = (typeof nl !== 'undefined' ? nl : 0) * c.fa * (c.sameLane ? 0.1 : 1);
        if (c.pd > 0 && c.distM <= 0 && c.fa > 0.5 && !c.sameLane)
          whoosh(turn > 0.5 ? -0.6 : 0.6, Math.min(0.18, 0.05 + c.speedFactor * 0.06), c.speedFactor);
        c.pd = c.distM;

        if (c.kind === 'bicycle' && c.distM > 0 && c.distM < 22 && !c.bl && c.fa > 0.5) {
          c.bl = 1;
          if (!c.sameLane) bell();
        }

        c.g.scale.setScalar(c.fa * c.fa * (3 - 2 * c.fa));
        const t = tFromS(sPlayer + sg * c.distM),
          p = route.getPoint(t),
          tn = route.getTangent(t);

        n0.set(-tn.z, 0, tn.x);
        const laneOffset = c.sameLane ? -1 : 1;
        c.g.position.copy(p).addScaledVector(n0, sg * (LANE * laneOffset + 0.15));
        c.g.position.y = Math.sin(totalTime * 9 + c.distM * 0.2) * 0.01;

        const faceTurn = c.sameLane ? (sg < 0 ? Math.PI : 0) : (sg > 0 ? Math.PI : 0);
        c.g.rotation.y = Math.atan2(tn.x, tn.z) + faceTurn;
        c.g.rotation.z = totalTime < c.wv ? Math.sin((c.wv - totalTime) * 16) * 0.06 : 0;

        c.g.userData.w.forEach(w => {
          w.rotation.x += (mv * c.worldSp) / 0.34;
        });

        // ระบบพูดคุยเมื่อรถแล่นผ่าน
        if (totalTime > c.cool && !c.sameLane) {
          const dx = c.g.position.x - car.position.x,
            dz = c.g.position.z - car.position.z;
          if (
            dx * dx + dz * dz < 30 &&
            say(
              c,
              Math.random() < 0.75
                ? nextEncouragement()
                : (CK[c.kind] || CT)[Math.floor(Math.random() * (CK[c.kind] || CT).length)],
              c.kind === 'tractor' || c.kind === 'tow' ? 3 : c.kind === 'bike' || c.kind === 'bicycle' ? 2.2 : 1.9,
              3.2
            )
          ) {
            c.cool = totalTime + 18;
          }
        }
      }

      // --- 4. ระบบแซงและรักษาระยะห่างอัจฉริยะ (Smart Overtake & Safe Following) ---
      // ค้นหารถคันหน้าในเลนเดียวกัน
      let frontSame = null;
      let minAheadDist = 999;
      for (const c of traffic) {
        if (!c.active || !c.sameLane || c.fa < 0.2) continue;
        if (c.distM > -12 && c.distM < minAheadDist) {
          minAheadDist = c.distM;
          frontSame = c;
        }
      }

      // ตรวจสอบว่าเลนสวนทางว่างและปลอดภัยพอที่จะแซงหรือไม่ (-12 ถึง 85 เมตร)
      let oppositeClear = true;
      for (const c of traffic) {
        if (!c.active || c.sameLane || c.fa < 0.2) continue;
        if (c.distM > -12 && c.distM < 85) {
          oppositeClear = false;
          break;
        }
      }

      if (!window._ovtState) window._ovtState = 'idle'; // 'idle' | 'following' | 'passing' | 'returning'

      if (frontSame) {
        const d = frontSame.distM;
        if (window._ovtState === 'passing') {
          // กำลังแซงอยู่ในเลนสวน: แซงต่อไปจนกว่าจะพ้นหน้ารถคันนั้นไปอย่างสมบูรณ์ (> 7.5 เมตรหลังเรา)
          if (d < -7.5) {
            window._ovtState = 'returning';
          }
        } else if (window._ovtState === 'returning') {
          // รอให้รถกลับเข้ากึ่งกลางเลนก่อน ไม่เริ่มแซงคันถัดไปซ้อนกลางจังหวะเปลี่ยนเลน
          if (Math.abs(window._ovt || 0) < 0.12) window._ovtState = 'idle';
        } else {
          // ยังไม่ได้เริ่มแซง
          if (d > 0 && d < 34) {
            if (oppositeClear) {
              // ถนนสวนโล่ง -> เบี่ยงเลนแซงทันที
              window._ovtState = 'passing';
            } else {
              // มีรถสวน -> ชะลอตามท้ายโดยรักษาระยะห่างปลอดภัย ไม่จี้ตูด ไม่ทับหน้ารถ
              window._ovtState = 'following';
            }
          } else if (d <= 0 && d >= -10) {
            // รถอยู่ข้างตัวพอดีแต่ไม่ได้อยู่ในสถานะ passing -> บังคับให้แซงต่อไปจนพ้น
            window._ovtState = 'passing';
          } else {
            window._ovtState = 'idle';
          }
        }
      } else {
        if (window._ovtState === 'passing') {
          window._ovtState = 'returning';
        }
      }

      let targetBrake = 1.0;
      let targetBoost = 1.0;
      let targetOvt = 0.0;

      if (window._ovtState === 'passing') {
        // เบี่ยงออกเลนสวนเต็มตัว (2.15 เท่าของ LANE)
        targetOvt = LANE * 2.15;
        // เพิ่มกำลังแซงอย่างชัดเจน แต่ไม่กระชากความเร็วและกล้อง
        targetBoost = 1.48;
        targetBrake = 1.0;
      } else if (window._ovtState === 'following' && frontSame) {
        // อยู่ในเลนเดิม รอจังหวะแซง
        targetOvt = 0.0;
        targetBoost = 1.0;
        // รักษาระยะห่างปลอดภัย 12.5 เมตร (หน้ากระโปรงรถจะไม่แตะหรือทับคันหน้าเด็ดขาด)
        const safeDist = 12.5;
        if (frontSame.distM < safeDist) {
          // ยิ่งใกล้ ยิ่งชะลอตาม
          const factor = Math.max(0.12, (frontSame.distM - 3.5) / (safeDist - 3.5));
          targetBrake = Math.min(frontSame.speedFactor, frontSame.speedFactor * factor);
          if (frontSame.distM < 8.0) {
            targetBrake *= 0.45; // เบรกฉุกเฉินดึงระยะปลอดภัยกลับ
          }
        } else {
          targetBrake = frontSame.speedFactor + 0.03;
        }
      } else if (window._ovtState === 'returning') {
        // แซงพ้นแล้ว เบี่ยงรถกลับเข้าเลนเดิมอย่างนุ่มนวล
        targetOvt = 0.0;
        targetBoost = 1.08; // คงแรงส่งเล็กน้อยระหว่างกลับเข้าเลน
        targetBrake = 1.0;
        if (window._ovt < 0.12) {
          window._ovtState = 'idle';
        }
      } else {
        // ปกติ
        targetOvt = 0.0;
        targetBoost = 1.0;
        targetBrake = 1.0;
      }

      window._playerBrake += (targetBrake - window._playerBrake) * Math.min(1, dt * 3.2);
      window._playerBoost += (targetBoost - window._playerBoost) * Math.min(1, dt * 2.6);

      const prevOvt = window._ovt || 0,
        prevOvtVelocity = window._ovtVelocity || 0,
        ovtError = targetOvt - prevOvt,
        desiredOvtVelocity = Math.max(-3.2, Math.min(3.2, ovtError * 2.2));
      let nextOvtVelocity = prevOvtVelocity + (desiredOvtVelocity - prevOvtVelocity) * Math.min(1, dt * 4.5),
        nextOvt = prevOvt + nextOvtVelocity * dt;
      if (ovtError === 0 || (targetOvt - nextOvt) * ovtError <= 0) {
        nextOvt = targetOvt;
        nextOvtVelocity = 0;
      }
      window._ovt = nextOvt;
      window._ovtVelocity = nextOvtVelocity;
      window._ovtTilt = nextOvtVelocity;
    }

    /* ============================================================================
     * src/scene/22-walkers.js
     * คนเดินริมทาง (walkers)
     * (ไฟล์นี้ถูกต่อรวมเป็น closure เดียวกับไฟล์อื่น — ไม่ต้อง import/export · ลำดับไฟล์ดู build.config.mjs)
     * ========================================================================== */

    /* people walking along the shoulder */
    const walkers = [];
    {
      const rw = (() => {
          let s = 777;
          return () => {
            s = (s * 16807) % 2147483647;
            return (s - 1) / 2147483646;
          };
        })(),
        skins = [0xe8bd9c, 0xd9a681, 0xc08a63].map(c => pm2(c)),
        shirts = [0xe98f7d, 0x6e9fb0, 0xd9b56b, 0x8fb177, 0xc7a4d0, 0xf2efe6].map(c => pm2(c)),
        pants = [0x3d4a5c, 0x6b5b4a, 0x2f3d38].map(c => pm2(c)),
        hairM = pm2(0x2b221d),
        strawM = pm2(0xd8bd7a),
        brolly = [0xe98f7d, 0x6e9fb0, 0xc7a4d0].map(c => pm2(c)),
        poleM = pm2(0x5a4b3f),
        packM = pm2(0x6e9fb0);
      const rv = (() => {
          let s = 9191;
          return () => {
            s = (s * 16807) % 2147483647;
            return (s - 1) / 2147483646;
          };
        })(),
        pick = a => a[Math.floor(rv() * a.length)],
        robeM = pm2(0xe08a2e),
        uniW = pm2(0xf6f3ea),
        uniB = pm2(0x26364f),
        shoeM = pm2(0x2a2420),
        eyeM = pm2(0x1b1512),
        indigo = pm2(0x2f4a6b),
        yelM = pm2(0xf0c95a),
        capM = pm2(0xd9534a),
        basketM = pm2(0xc89b5a),
        hairs = [0x2b221d, 0x3a2a20, 0x1c1715, 0x6b6a68].map(c => pm2(c)),
        clothP = [0xc7a4d0, 0xe98f7d, 0x8fb177, 0xd9b56b, 0x6e9fb0, 0xd96c7a].map(c => pm2(c)),
        bagM = [0xd96c7a, 0x6e9fb0, 0x8fb177].map(c => pm2(c));
      function PSH(k, c) {
        return k === 3 ? robeM : k === 2 ? uniW : k === 1 ? indigo : k === 5 ? yelM : c;
      }
      function PPN(k, c) {
        return k === 3 ? robeM : k === 2 ? uniB : c;
      }
      function person(k, sc) {
        const g = new THREE.Group(),
          sk = skins[Math.floor(rw() * 3)],
          sh = PSH(k, shirts[Math.floor(rw() * 6)]),
          pn = PPN(k, pants[Math.floor(rw() * 3)]),
          legL = new THREE.Group(),
          legR = new THREE.Group(),
          armL = new THREE.Group(),
          armR = new THREE.Group(),
          limb = (r, h, m, p, y) => {
            const o = new THREE.Mesh(new THREE.CapsuleGeometry(r, h, 4, 20), m);
            o.position.y = y;
            o.castShadow = true;
            p.add(o);
            return o;
          };
        legL.position.set(-0.09, 0.78, 0);
        legR.position.set(0.09, 0.78, 0);
        armL.position.set(-0.23, 1.3, 0);
        armR.position.set(0.23, 1.3, 0);
        limb(0.075, 0.54, pn, legL, -0.37);
        limb(0.075, 0.54, pn, legR, -0.37);
        limb(0.052, 0.34, sh, armL, -0.21);
        limb(0.052, 0.34, sh, armR, -0.21);
        ball(0.05, sk, 0, -0.48, 0, armL);
        ball(0.05, sk, 0, -0.48, 0, armR);
        g.add(legL, legR, armL, armR);
        const body = new THREE.Mesh(new THREE.CapsuleGeometry(0.18, 0.22, 5, 24), sh);
        body.position.set(0, 1.06, 0);
        body.castShadow = true;
        g.add(body);
        ball(0.14, sk, 0, 1.5, 0, g);
        ball(0.15, hairM, 0, 1.55, -0.025, g, 1, 0.8, 1.05);
        for (const s of [-1, 1]) ball(0.016, eyeM, s * 0.05, 1.52, 0.125, g);
        box(0.14, 0.07, 0.22, shoeM, 0, -0.76, 0.04, legL);
        box(0.14, 0.07, 0.22, shoeM, 0, -0.76, 0.04, legR);
        const hr = pick(hairs);
        if (k === 0) {
          cyl(0.012, 0.012, 0.8, poleM, 0.28, 1.75, 0, g);
          const cp = new THREE.Mesh(new THREE.ConeGeometry(0.55, 0.2, 14), brolly[Math.floor(rw() * 3)]);
          cp.position.set(0.28, 2.18, 0);
          cp.castShadow = true;
          g.add(cp);
          cyl(0.17, 0.28, 0.5, pick(clothP), 0, 0.82, 0, g);
          ball(0.13, hr, 0, 1.38, -0.09, g, 1, 1.5, 0.8);
        } else if (k === 1) {
          const hat = new THREE.Mesh(new THREE.ConeGeometry(0.5, 0.2, 14), strawM);
          hat.position.set(0, 1.69, 0);
          hat.castShadow = true;
          g.add(hat);
          cyl(0.014, 0.014, 1.2, poleM, 0, 1.36, 0, g, 0, Math.PI / 2);
          for (const s of [-1, 1]) {
            cyl(0.004, 0.004, 0.45, poleM, s * 0.55, 1.12, 0, g);
            ball(0.17, basketM, s * 0.55, 0.88, 0, g, 1, 0.6, 1);
          }
        } else if (k === 2) {
          box(0.3, 0.4, 0.15, packM, 0, 1.1, -0.19, g);
          cyl(0.16, 0.24, 0.3, uniB, 0, 0.86, 0, g);
          ball(0.05, hr, -0.14, 1.52, -0.05, g);
          ball(0.05, hr, 0.14, 1.52, -0.05, g);
        } else if (k === 3) {
          cyl(0.2, 0.31, 1.05, robeM, 0, 0.82, 0, g);
          box(0.44, 0.1, 0.26, robeM, 0, 1.3, 0, g);
          ball(0.153, sk, 0, 1.55, -0.025, g, 1, 0.8, 1.05);
          cyl(0.012, 0.012, 0.8, poleM, -0.28, 1.75, 0, g);
          const cp = new THREE.Mesh(new THREE.ConeGeometry(0.55, 0.2, 14), brolly[0]);
          cp.position.set(-0.28, 2.18, 0);
          g.add(cp);
        } else if (k === 4) {
          ball(0.153, pm2(0xd8d4cc), 0, 1.55, -0.025, g, 1, 0.8, 1.05);
          cyl(0.012, 0.012, 0.85, poleM, 0.27, 0.43, 0.1, g);
        } else if (k === 5) {
          const cap = new THREE.Mesh(new THREE.SphereGeometry(0.16, 10, 6, 0, 6.3, 0, 1.2), capM);
          cap.position.set(0, 1.56, 0);
          g.add(cap);
          box(0.26, 0.3, 0.12, bagM[0], 0, 1.05, -0.17, g);
        } else {
          ball(0.13, hr, 0, 1.38, -0.09, g, 1, 1.5, 0.8);
          cyl(0.02, 0.03, 0.3, hr, 0, 1.6, -0.2, g, 0.6, 0);
          cyl(0.15, 0.26, 0.42, pick(clothP), 0, 0.84, 0, g);
          box(0.16, 0.22, 0.1, pick(bagM), 0.3, 0.78, 0.05, g);
        }
        // สร้างร่มกันฝนสำรองให้คนเดินเท้าทุกคน (กางอัตโนมัติเมื่อฝนตก)
        let rainUmb = null;
        if (k !== 0 && k !== 3) { // k=0 และ k=3 มีร่มติดตัวอยู่แล้ว
          rainUmb = new THREE.Group();
          cyl(0.012, 0.012, 0.8, poleM, 0.24, 1.75, 0.08, rainUmb);
          const uTop = new THREE.Mesh(new THREE.ConeGeometry(0.55, 0.22, 12), brolly[Math.floor(rw() * 3)]);
          uTop.position.set(0.24, 2.18, 0.08);
          rainUmb.add(uTop);
          rainUmb.visible = false;
          g.add(rainUmb);
        }

        if (k === 5) sc *= 0.72;
        g.scale.setScalar(sc);
        scene.add(g);
        return { g, legL, legR, armL, armR, ph: rw() * 6, sc, k, rainUmb };
      }
    }

    /* ============================================================================
     * src/scene/23-vendors.js
     * ร้านค้า/แม่ค้าริมทาง (vendors)
     * (ไฟล์นี้ถูกต่อรวมเป็น closure เดียวกับไฟล์อื่น — ไม่ต้อง import/export · ลำดับไฟล์ดู build.config.mjs)
     * ========================================================================== */

    const vendors = [];
    {
      const rx = (() => {
          let s = 31337;
          return () => {
            s = (s * 16807) % 2147483647;
            return (s - 1) / 2147483646;
          };
        })(),
        stem = sm2(0x9bb26f),
        culm = sm2(0x9cae59),
        bk = sm2(0x7d6648),
        nut = sm2(0x5a4630),
        ban = sm2(0xe8c84a);
      const yawG = (p, a, pit, len, w, m) => {
        const o = new THREE.Group();
        o.rotation.y = a;
        const i = new THREE.Group();
        i.rotation.x = pit;
        o.add(i);
        ball(1, m, 0, 0, len / 2, i, w, 0.025, len / 2);
        p.add(o);
        return o;
      };
      const mk = (x, z) => {
        const g = new THREE.Group();
        g.position.set(x, 0, z);
        g.rotation.y = rx() * 6;
        scene.add(g);
        return g;
      };
      const kinds = [
        (x, z) => {
          const g = mk(x, z);
          g.scale.setScalar(0.9 + rx() * 0.5);
          for (let j = 0; j < 6; j++)
            cyl(0.085 - j * 0.008, 0.1 - j * 0.008, 0.6, bk, j * 0.05, 0.3 + j * 0.58, 0, g, 0, -0.08);
          const cy = 3.55;
          for (let a = 0; a < 8; a++)
            yawG(g, a * 0.785, 0.45 + rx() * 0.3, 1.5, 0.22, treeMat2).position.set(0.3, cy, 0);
          for (let a = 0; a < 3; a++)
            ball(0.1, nut, Math.cos(a * 2.1) * 0.15 + 0.3, cy - 0.15, Math.sin(a * 2.1) * 0.15, g);
        },
        (x, z) => {
          const g = mk(x, z);
          g.scale.setScalar(0.9 + rx() * 0.4);
          cyl(0.1, 0.14, 1.3, stem, 0, 0.65, 0, g);
          for (let a = 0; a < 6; a++)
            yawG(g, a * 1.05 + rx() * 0.3, 0.55, 1.3, 0.4, a % 2 ? treeMat : treeMat2).position.y = 1.3;
          ball(0.07, ban, 0.15, 1.1, 0, g, 1, 2, 1);
          ball(0.07, ban, 0.16, 1.02, 0.05, g, 1, 2, 1);
        },
        (x, z) => {
          const g = mk(x, z);
          for (let j = 0; j < 9; j++) {
            const h = 2.4 + rx() * 1.6,
              dx = (rx() - 0.5) * 0.9,
              dz = (rx() - 0.5) * 0.9;
            cyl(0.03, 0.04, h, culm, dx, h / 2, dz, g, (rx() - 0.5) * 0.12, (rx() - 0.5) * 0.12);
            ball(0.28, treeMat, dx, h, dz, g, 1, 0.55, 1);
          }
        }
      ];
      const FR = [
        [0xd94a3a, 0.075, 16, 1],
        [0xf08a24, 0.085, 14, 1],
        [0xdede6e, 0.17, 7, 1.1],
        [0xe8a73a, 0.08, 9, 1.15],
        [0xc8a36a, 0.05, 26, 1],
        [0xc2453a, 0.06, 22, 1]
      ].map(f => ({ m: sm2(f[0]), r: f[1], n: f[2], s: f[3] }));
      const CR = [
        [0.9, 0, 1.45, 0],
        [0.7, 0.55, 1.35, 0.2],
        [0.7, -0.5, 1.3, -0.25],
        [0.65, 0, 1.35, -0.55],
        [0.6, 0.1, 1.95, 0.1],
        [0.5, -0.2, 2.2, 0]
      ];
      FR.forEach(f =>
        kinds.push((x, z) => {
          const g = mk(x, z);
          g.scale.setScalar(f.s * (0.85 + rx() * 0.3));
          cyl(0.1, 0.17, 1, bk, 0, 0.5, 0, g);
          cyl(0.17, 0.24, 0.2, bk, 0, 0.1, 0, g);
          CR.forEach((q, j) => {
            const m = new THREE.Mesh(leafGeo, j < 4 ? treeMat : treeMat2);
            m.position.set(q[1], q[2], q[3]);
            m.scale.set(q[0], q[0] * 0.85, q[0]);
            m.castShadow = true;
            g.add(m);
          });
          for (let i = 0; i < f.n; i++) {
            const q = CR[Math.floor(rx() * CR.length)],
              a = rx() * 6.28,
              el = rx() * 1.2 - 0.1,
              ce = Math.cos(el);
            ball(
              f.r,
              f.m,
              q[1] + Math.cos(a) * ce * q[0] * 0.95,
              q[2] + Math.sin(el) * q[0] * 0.85 * 0.95,
              q[3] + Math.sin(a) * ce * q[0] * 0.95,
              g
            );
          }
        })
      );
      kinds.push(
        (x, z) => {
          const g = mk(x, z);
          g.scale.setScalar(0.9 + rx() * 0.3);
          cyl(0.06, 0.09, 2.2, stem, 0, 1.1, 0, g);
          for (let a = 0; a < 7; a++) yawG(g, a * 0.9, 0.7, 1.1, 0.3, treeMat2).position.y = 2.2;
          for (let a = 0; a < 4; a++)
            ball(0.1, ban, Math.cos(a * 1.6) * 0.12, 2.05, Math.sin(a * 1.6) * 0.12, g, 1, 1.5, 1);
        },
        kinds[1],
        kinds[1]
      );
      const skinV = pm2(0xd9a681),
        aprM = new THREE.MeshStandardMaterial({
          color: 0xf6f3ea,
          roughness: 0.75,
          polygonOffset: true,
          polygonOffsetFactor: -2,
          polygonOffsetUnits: -2
        }),
        shV = pm2(0x6e9fb0),
        pnV = pm2(0x3d4a5c),
        hrV = pm2(0x2b221d),
        whV = pm2(0xffffff);
      function VEND(g) {
        const p = new THREE.Group();
        p.position.set(0, 0, -0.18);
        g.add(p);
        for (const q of [-1, 1]) {
          cyl(0.068, 0.055, 0.72, pnV, q * 0.095, 0.38, 0, p);
          ball(0.06, hrV, q * 0.095, 0.035, 0.04, p, 0.95, 0.65, 1.7);
        }
        ball(0.165, pnV, 0, 0.82, 0, p, 1.05, 0.72, 0.88);
        const vendTorso = new THREE.Mesh(new THREE.CapsuleGeometry(0.17, 0.28, 5, 16), shV);
        vendTorso.position.set(0, 1.13, 0);
        vendTorso.scale.set(1.1, 1, 0.86);
        vendTorso.castShadow = true;
        p.add(vendTorso);
        ball(0.17, aprM, 0, 1.03, 0.16, p, 1.15, 1.35, 0.13);
        cyl(0.045, 0.05, 0.12, skinV, 0, 1.42, 0, p);
        ball(0.12, skinV, 0, 1.56, 0, p, 0.93, 1.08, 1);
        ball(0.128, hrV, 0, 1.6, -0.025, p, 0.98, 0.84, 1.05);
        ball(0.065, hrV, 0, 1.66, -0.13, p);
        const hat = new THREE.Mesh(new THREE.ConeGeometry(0.34, 0.14, 16), stT);
        hat.position.set(0, 1.73, 0);
        p.add(hat);
        for (const q of [-1, 1]) {
          ball(0.025, skinV, q * 0.118, 1.56, 0, p, 0.5, 1, 0.7);
          ball(0.02, whV, q * 0.044, 1.58, 0.108, p, 1, 0.85, 0.5);
          ball(0.011, hrV, q * 0.044, 1.58, 0.118, p);
          box(0.034, 0.008, 0.008, hrV, q * 0.044, 1.62, 0.112, p);
        }
        ball(0.018, skinV, 0, 1.55, 0.122, p);
        ball(0.016, pm2(0xc25953), 0, 1.5, 0.115, p, 1.1, 0.35, 0.4);
        const armL = new THREE.Group(),
          armR = new THREE.Group();
        armL.position.set(-0.22, 1.3, 0);
        armR.position.set(0.22, 1.3, 0);
        p.add(armL, armR);
        ball(0.056, shV, 0, 0, 0, armL);
        cyl(0.05, 0.042, 0.42, shV, 0, -0.2, 0.04, armL, -0.3, 0);
        ball(0.044, skinV, 0, -0.4, 0.1, armL);
        ball(0.056, shV, 0, 0, 0, armR);
        cyl(0.05, 0.042, 0.42, shV, 0, -0.2, 0.06, armR, -0.55, 0);
        ball(0.044, skinV, 0, -0.4, 0.16, armR);
        vendors.push({ g, armR, p, at: 0, cool: 0, dly: 0, k: 7, sc: 1 });
      }
      function patch(tts, minOff, r, fn) {
        for (const tt of tts)
          for (let a = 0; a < 12; a++) {
            const sd = a % 2 ? 1 : -1,
              o = offRoad(tt, sd * (minOff + (a >> 1) * 0.9));
            if (!spotOK(o.x, o.z, r)) continue;
            taken.push([o.x, o.z, r]);
            fn(o, sd);
            return true;
          }
        return false;
      }
      const paddyM = sm2(0x9cc7a0),
        riceM = sm2(0x9fc45a),
        riceG = sm2(0xd6c35a),
        stemG = sm2(0x5f8a45),
        sunY = sm2(0xf2b81f),
        sunB = sm2(0x5a3a1e),
        dm3 = new THREE.Object3D(),
        wdS = sm2(0xc89b5a),
        rfS = sm2(0xc27b5a);
      for (const tts of [
        [0.22, 0.36],
        [0.64, 0.9]
      ])
        patch(tts, 8.5, 5.6, o => {
          const g = mk(o.x, o.z);
          g.rotation.y = Math.atan2(o.tn.x, o.tn.z);
          box(6.4, 0.05, 9, paddyM, 0, 0.02, 0, g);
          const riceGeo = new THREE.BufferGeometry();
          riceGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array([-0.1,0,0, 0.1,0,0, 0,0.55,0, 0,0,-0.1, 0,0,0.1, 0,0.55,0]), 3));
          riceGeo.computeVertexNormals();
          const im = new THREE.InstancedMesh(
            riceGeo,
            rx() < 0.4 ? riceG : riceM,
            80
          );
          let c = 0;
          for (let r = 0; r < 8; r++)
            for (let q = 0; q < 10; q++) {
              dm3.position.set((r - 3.5) * 0.75, 0.3, (q - 4.5) * 0.9);
              dm3.rotation.set(0, rx() * 3, 0);
              dm3.scale.set(1, 0.8 + rx() * 0.4, 1);
              dm3.updateMatrix();
              im.setMatrixAt(c++, dm3.matrix);
            }
          im.frustumCulled = false;
          im.visible = true; // เปิดให้มองเห็นแปลงนา
          g.add(im);
          PADS.push([g, im.material === riceG]);
        });
      const hdG = new THREE.CylinderGeometry(0.2, 0.2, 0.05, 12).rotateZ(Math.PI / 2),
        ctG = new THREE.CylinderGeometry(0.1, 0.1, 0.06, 10).rotateZ(Math.PI / 2),
        stG = new THREE.CylinderGeometry(0.02, 0.03, 1.3, 5);
      patch([0.12, 0.5, 0.78], 7.5, 3.8, (o, sd) => {
        const g = mk(o.x, o.z);
        g.rotation.y = Math.atan2(o.tn.x, o.tn.z);
        const A = new THREE.InstancedMesh(stG, stemG, 48),
          B = new THREE.InstancedMesh(hdG, sunY, 48),
          C = new THREE.InstancedMesh(ctG, sunB, 48);
        let c = 0;
        for (let r = 0; r < 6; r++)
          for (let q = 0; q < 8; q++) {
            const x = (r - 2.5) * 0.7 + (rx() - 0.5) * 0.2,
              z = (q - 3.5) * 0.7 + (rx() - 0.5) * 0.2,
              h = 0.8 + rx() * 0.5;
            dm3.rotation.set(0, 0, 0);
            dm3.scale.set(1, h, 1);
            dm3.position.set(x, 0.65 * h, z);
            dm3.updateMatrix();
            A.setMatrixAt(c, dm3.matrix);
            dm3.scale.set(1, 1, 1);
            dm3.position.set(x, 1.3 * h, z);
            dm3.updateMatrix();
            B.setMatrixAt(c, dm3.matrix);
            dm3.position.set(x + sd * 0.035, 1.3 * h, z);
            dm3.updateMatrix();
            C.setMatrixAt(c++, dm3.matrix);
          }
        for (const m of [A, B, C]) {
          m.frustumCulled = false;
          g.add(m);
        }
      });
      // วางวัด 5 แห่งตลอดเส้นทาง (ขยายให้ใหญ่ขึ้น ขยับร่นออกจากถนนเล็กน้อย พร้อมต้นโพธิ์/ต้นไทรใหญ่แนวโพลีกอน 3 ต้นรอบวัด)
      window.__TEMPLES = [];
      const _sacredFoliageGeo = new THREE.IcosahedronGeometry(1, 0),
        _sacredLeafDark = new THREE.MeshLambertMaterial({ color: 0x2f5946, flatShading: true }),
        _sacredLeafMid = new THREE.MeshLambertMaterial({ color: 0x3e7058, flatShading: true }),
        _sacredLeafLight = new THREE.MeshLambertMaterial({ color: 0x568b6c, flatShading: true }),
        _sacredBarkM = new THREE.MeshLambertMaterial({ color: 0x4b3522, flatShading: true }),
        _sacredRootM = new THREE.MeshLambertMaterial({ color: 0x5e442c, flatShading: true }),
        _clothColors = [0xe63946, 0xf4a261, 0xf2c14e, 0x52b788, 0x4895ef, 0x9b5de5, 0xf77f00].map(c => sm2(c));

      // ฟังก์ชันสร้างต้นโพธิ์/ต้นไทรใหญ่แนวโพลีกอน (Sacred Low-Poly Bodhi/Banyan Tree) เพื่อความขลังรอบวัด
      const makeSacredPolygonTree = (parent, tx, tz, sc = 1.0, hasShrine = false) => {
        const tg = new THREE.Group();
        tg.position.set(tx, 0, tz);
        tg.scale.setScalar(sc);
        parent.add(tg);

        // 1. รากพูพอนแผ่ฐาน 6 ทิศ + ลำต้นใหญ่ทรงโพลีกอนเหลี่ยมขลัง
        for (let r = 0; r < 6; r++) {
          const ra = (r / 6) * Math.PI * 2;
          const buttress = new THREE.Mesh(new THREE.ConeGeometry(0.32, 1.35, 5), _sacredBarkM);
          buttress.position.set(Math.cos(ra) * 0.45, 0.55, Math.sin(ra) * 0.45);
          buttress.rotation.z = Math.cos(ra) * 0.38;
          buttress.rotation.x = -Math.sin(ra) * 0.38;
          tg.add(buttress);
        }
        const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.65, 3.1, 6), _sacredBarkM);
        trunk.position.y = 1.55;
        trunk.castShadow = true;
        tg.add(trunk);

        // 2. ผ้าแพรเจ็ดสีพันรอบต้นโพธิ์ใหญ่ + มาลัยคล้อง
        for (let c = 0; c < 5; c++) {
          const band = new THREE.Mesh(
            new THREE.CylinderGeometry(0.54 - c * 0.015, 0.56 - c * 0.015, 0.11, 7),
            _clothColors[c % _clothColors.length]
          );
          band.position.y = 1.05 + c * 0.12;
          tg.add(band);
        }

        // 3. กิ่งก้านใหญ่แผ่กว้าง + รากอากาศห้อยระย้าลงมาจากกิ่งไทร
        const branches = [
          [-1.15, 3.2, 0.4, 0.48, -0.25],
          [1.2, 3.1, -0.35, -0.45, 0.22],
          [0.25, 3.35, 1.15, 0.15, 0.48],
          [-0.35, 3.25, -1.1, -0.18, -0.46]
        ];
        for (const [bx, by, bz, rz, rxRot] of branches) {
          const br = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.26, 2.1, 5), _sacredBarkM);
          br.position.set(bx * 0.55, by - 0.35, bz * 0.55);
          br.rotation.set(rxRot, 0, rz);
          tg.add(br);
          // รากอากาศห้อยลงมาจากกิ่งใหญ่
          const aerial = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.015, 1.65, 4), _sacredRootM);
          aerial.position.set(bx * 0.85, by - 0.85, bz * 0.85);
          tg.add(aerial);
        }

        // 4. พุ่มใบโพลีกอนขนาดใหญ่ซ้อนหลายชั้น (Low-Poly Faceted Canopy)
        const crowns = [
          [0, 4.35, 0, 2.35, 1.45, 2.35, _sacredLeafDark],
          [-1.55, 3.75, 0.65, 1.65, 1.15, 1.65, _sacredLeafMid],
          [1.6, 3.68, -0.55, 1.6, 1.12, 1.6, _sacredLeafMid],
          [0.45, 3.85, 1.55, 1.5, 1.08, 1.5, _sacredLeafLight],
          [-0.55, 3.8, -1.5, 1.55, 1.1, 1.55, _sacredLeafMid],
          [0, 5.35, 0, 1.55, 1.15, 1.55, _sacredLeafLight]
        ];
        crowns.forEach(([cx, cy, cz, sx, sy, sz, cm], idx) => {
          const m = new THREE.Mesh(_sacredFoliageGeo, cm);
          m.position.set(cx, cy, cz);
          m.scale.set(sx, sy, sz);
          m.rotation.set(idx * 0.7, idx * 1.1, idx * 0.4);
          m.castShadow = idx < 2;
          tg.add(m);
        });

        // 5. ศาลเพียงตา/แท่นวางเครื่องสักการะและไม้ค้ำโพธิ์มงคลใต้ต้นไม้ใหญ่
        if (hasShrine) {
          cyl(0.05, 0.06, 1.05, _sacredBarkM, 0.85, 0.52, 0.85, tg);
          box(0.55, 0.08, 0.45, _clothColors[2], 0.85, 1.06, 0.85, tg);
          const shRoof = new THREE.Mesh(new THREE.ConeGeometry(0.42, 0.42, 4), _clothColors[0]);
          shRoof.position.set(0.85, 1.38, 0.85);
          shRoof.rotation.y = Math.PI / 4;
          tg.add(shRoof);
          // ไม้ค้ำโพธิ์ค้ำกิ่งหน้าวัดตามประเพณีล้านนา
          for (const s of [-1, 1]) {
            const crutch = cyl(0.035, 0.045, 2.85, _clothColors[1], s * 1.15, 1.38, 0.55, tg, -0.12, s * 0.16);
            crutch.castShadow = false;
          }
        }
      };

      /* ===== งานวัด / เทศกาลทำบุญหน้าวัด =====
       * กลางวัน: มีพระสงฆ์ ชาวบ้านร่วมทำบุญ พ่อค้าแม่ค้า และผู้คนเดินเที่ยวงาน (สร้างด้วยโมเดลคน human(o) สมจริง)
       * กลางคืน: คนหายไปทั้งหมด เหลือร้านค้า ชิงช้าสวรรค์ และแสงไฟประดับงานวัด
       * พื้นที่รอบวัดและหน้าวัดถูกจองไว้ ไม่ให้มีสวน/แปลงเกษตรมาวางทับ */
      const _fairRoofGeo = new THREE.ConeGeometry(1.45, 0.7, 4),
        _fairBulbM = new THREE.MeshBasicMaterial({ color: 0xffe08a }),
        _fairLampM = new THREE.MeshBasicMaterial({ color: 0xff5a3c }),
        _fairWoodM = sm2(0x8a5a2e),
        _fairPoleM = sm2(0xc8a35c),
        _fairGoldM = sm2(0xe6b92e),
        _fairWhiteM = sm2(0xf7f1e3),
        _fairFlagMs = [0xe63946, 0xf4a261, 0xf2c14e, 0x52b788, 0x4895ef, 0x9b5de5].map(
          c => new THREE.MeshLambertMaterial({ color: c, side: THREE.DoubleSide })
        ),
        _fairFlagGeo = (() => {
          const s = new THREE.Shape();
          s.moveTo(-0.14, 0); s.lineTo(0.14, 0); s.lineTo(0, -0.36); s.closePath();
          return new THREE.ShapeGeometry(s);
        })();

      const buildTempleFair = (ox, oz, rot) => {
        const f = new THREE.Group();
        f.position.set(ox, 0, oz);
        f.rotation.y = rot; // +z (ในกรอบของ f) ชี้ไปทางถนน เหมือนซุ้มประตูวัด
        scene.add(f);
        const st = new THREE.Group(),
          nightG = new THREE.Group();
        f.add(st, nightG);
        const ZC = 21.3; // กึ่งกลางลานงานตามแนวถนน

        // พื้นลานงานและทางเดินสู่ประตูวัด
        box(26, 0.04, 8.4, sm2(0xc9b383), 0, 0.02, ZC, st);
        box(3.6, 0.06, 8.4, sm2(0xa65e44), 0, 0.04, ZC, st);

        // ---------- ร้านค้า 4 ร้านขนาบทางเดิน (เรียงตรงเท่ากัน) ----------
        const roofMs = [0xd9453a, 0xf4f0e6, 0xf2b33a, 0x3f8d72].map(c => new THREE.MeshLambertMaterial({ color: c, flatShading: true }));
        const stalls = [];
        const addStall = (x, z, ci) => {
          const dir = x < 0 ? 1 : -1; // ทิศที่หน้าร้านหันเข้าหาทางเดิน
          const s = new THREE.Group();
          s.position.set(x, 0, z);
          s.rotation.y = dir > 0 ? Math.PI / 2 : -Math.PI / 2;
          st.add(s);
          for (const px of [-0.9, 0.9]) for (const pz of [-0.7, 0.7]) cyl(0.05, 0.055, 2.2, _fairPoleM, px, 1.1, pz, s);
          const roof = new THREE.Mesh(_fairRoofGeo, roofMs[ci % 4]);
          roof.position.y = 2.5;
          roof.rotation.y = Math.PI / 4;
          roof.scale.set(1, 1, 0.86);
          roof.castShadow = true;
          s.add(roof);
          box(1.9, 0.2, 0.05, roofMs[(ci + 1) % 4], 0, 2.12, 0.74, s);
          box(1.7, 0.85, 0.55, _fairWoodM, 0, 0.43, 0.45, s);
          box(1.8, 0.05, 0.62, sm2(0xfff3d6), 0, 0.88, 0.45, s);
          box(1.7, 0.08, 0.3, _fairWoodM, 0, 1.15, -0.55, s);
          for (let k = 0; k < 5; k++) ball(0.11, _fairFlagMs[(k + ci) % 6], -0.7 + k * 0.35, 1.02, 0.45, s);
          for (let k = 0; k < 4; k++) ball(0.09, _fairFlagMs[(k + ci + 2) % 6], -0.5 + k * 0.33, 1.28, -0.55, s);
          stalls.push({ x, z, dir });
        };
        [20.2, 23.0].forEach((z, i) => {
          addStall(-4.4, z, i);
          addStall(4.4, z, i + 2);
        });

        // ---------- ธงราวข้ามทางเดิน + หลอดไฟ ----------
        const strings = [20.2, 23.0];
        const flagInst = _fairFlagMs.map(m => new THREE.InstancedMesh(_fairFlagGeo, m, strings.length * 5));
        const flagCount = [0, 0, 0, 0, 0, 0],
          dmy = new THREE.Object3D(),
          bulbPts = [];
        strings.forEach(z => {
          const pts = [];
          for (let i = 0; i <= 16; i++) {
            const t = i / 16;
            pts.push(new THREE.Vector3(-4.4 + 8.8 * t, 2.85 - 2.0 * t * (1 - t), z));
            bulbPts.push([-4.4 + 8.8 * t, 2.85 - 2.0 * t * (1 - t) - 0.03, z]);
          }
          st.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), new THREE.LineBasicMaterial({ color: 0x6b4a2a })));
          for (let i = 0; i < 15; i++) {
            const t = 0.04 + (i / 14) * 0.92,
              ci = i % 6;
            dmy.position.set(-4.4 + 8.8 * t, 2.85 - 2.0 * t * (1 - t), z);
            dmy.rotation.set(0, 0, 0);
            dmy.updateMatrix();
            if (flagCount[ci] < strings.length * 5) flagInst[ci].setMatrixAt(flagCount[ci]++, dmy.matrix);
          }
        });
        flagInst.forEach((m, i) => {
          m.count = flagCount[i];
          m.instanceMatrix.needsUpdate = true;
          m.frustumCulled = false;
          st.add(m);
        });
        // หลอดไฟหน้าร้านค้า (ติดชายคา)
        stalls.forEach(s => {
          for (const lx of [-0.8, -0.4, 0, 0.4, 0.8]) bulbPts.push([s.x + s.dir * 0.76, 2.0, s.z + lx]);
        });
        const bulbs = new THREE.InstancedMesh(new THREE.SphereGeometry(0.07, 5, 4), _fairBulbM, bulbPts.length);
        bulbPts.forEach((p, i) => {
          dmy.position.set(p[0], p[1], p[2]);
          dmy.updateMatrix();
          bulbs.setMatrixAt(i, dmy.matrix);
        });
        bulbs.instanceMatrix.needsUpdate = true;
        bulbs.frustumCulled = false;
        nightG.add(bulbs);

        // ---------- ตุงล้านนาสองข้างทางเดิน ----------
        [19.4, 21.6, 23.8].forEach((z, i) => {
          for (const sx of [-2.1, 2.1]) {
            cyl(0.035, 0.04, 3.6, _fairPoleM, sx, 1.8, z, st);
            box(0.34, 1.5, 0.03, _fairFlagMs[(i * 2 + (sx > 0 ? 1 : 0)) % 6], sx + (sx > 0 ? -0.2 : 0.2), 2.75, z, st);
          }
        });

        // ---------- ปะรำพิธีทำบุญ (ถวายสังฆทาน / แท่นพระพุทธรูป / อาสนะสงฆ์) ----------
        const PVX = -12.2,
          PVZ = ZC + 0.2;
        const pv = new THREE.Group();
        pv.position.set(PVX, 0, PVZ);
        st.add(pv);
        for (const px of [-2.2, 2.2]) for (const pz of [-3, 3]) cyl(0.08, 0.09, 2.9, _fairPoleM, px, 1.45, pz, pv);
        box(5.0, 0.12, 6.8, _fairWhiteM, 0, 2.95, 0, pv);
        const pvRoof = new THREE.Mesh(new THREE.ConeGeometry(4.2, 1.0, 4), _fairWhiteM);
        pvRoof.position.y = 3.5;
        pvRoof.rotation.y = Math.PI / 4;
        pvRoof.scale.set(0.78, 1, 1.1);
        pvRoof.castShadow = true;
        pv.add(pvRoof);
        ball(0.14, _fairGoldM, 0, 4.05, 0, pv);
        const valM = sm2(0xe8802a);
        box(0.06, 0.35, 6.8, valM, 2.5, 2.75, 0, pv);
        box(0.06, 0.35, 6.8, valM, -2.5, 2.75, 0, pv);
        box(5.0, 0.35, 0.06, valM, 0, 2.75, 3.4, pv);
        box(5.0, 0.35, 0.06, valM, 0, 2.75, -3.4, pv);
        box(4.6, 0.16, 6.4, sm2(0xb08a55), 0, 0.08, 0, pv); // แท่นพื้นไม้
        box(4.2, 0.02, 5.8, sm2(0xb53a2a), 0, 0.17, 0, pv); // พรมแดง
        // โต๊ะหมู่บูชาพร้อมพระพุทธรูปปางสมาธิสีทองและแจกันดอกบัว
        box(0.85, 0.48, 2.2, sm2(0xf0e6d0), -1.85, 0.41, 0, pv);
        box(0.92, 0.06, 2.28, _fairGoldM, -1.85, 0.66, 0, pv);
        cyl(0.32, 0.38, 0.14, _fairGoldM, -1.85, 0.76, 0, pv); // ฐานบัว
        ball(0.28, _fairGoldM, -1.85, 0.88, 0, pv, 0.9, 0.45, 1.35); // หน้าตักขัดสมาธิ
        cyl(0.16, 0.22, 0.42, _fairGoldM, -1.85, 1.12, 0, pv); // พระวรกาย
        ball(0.2, _fairGoldM, -1.85, 1.28, 0, pv, 0.85, 0.55, 1.28); // พระอังสา
        ball(0.14, _fairGoldM, -1.85, 1.48, 0, pv, 0.95, 1.08, 0.95); // พระเศียร
        ball(0.065, _fairGoldM, -1.85, 1.63, 0, pv); // พระเมาลี
        cyl(0.01, 0.038, 0.14, _fairGoldM, -1.85, 1.73, 0, pv); // พระเกตุมาลา
        for (const vz of [-0.85, 0.85]) {
          cyl(0.06, 0.045, 0.22, _fairGoldM, -1.85, 0.79, vz, pv);
          ball(0.09, _fairFlagMs[0], -1.85, 0.95, vz, pv, 0.85, 1.2, 0.85);
        }
        // อาสนะสงฆ์ 5 ที่นั่ง + ชุดสังฆทานหน้าพระสงฆ์
        [-2.2, -1.1, 0, 1.1, 2.2].forEach(mz => {
          box(0.68, 0.04, 0.72, _fairGoldM, -0.9, 0.2, mz, pv);
          box(0.62, 0.02, 0.66, sm2(0x9b221a), -0.9, 0.23, mz, pv);
          cyl(0.17, 0.21, 0.36, _fairFlagMs[1], -0.22, 0.36, mz + 0.25, pv);
          ball(0.11, _fairGoldM, -0.22, 0.6, mz + 0.25, pv);
        });
        // ต้นผ้าป่า / ต้นเงินทำบุญ
        {
          const tx = -7.4,
            tz = ZC + 2.1,
            tm = new THREE.Group();
          tm.position.set(tx, 0, tz);
          st.add(tm);
          box(0.5, 0.2, 0.5, _fairWoodM, 0, 0.1, 0, tm);
          cyl(0.06, 0.08, 2.6, _fairWoodM, 0, 1.4, 0, tm);
          cyl(0.03, 0.03, 1.8, _fairWoodM, 0, 2.3, 0, tm, 0, Math.PI / 2);
          cyl(0.03, 0.03, 1.8, _fairWoodM, 0, 1.9, 0, tm, Math.PI / 2, 0);
          ball(0.14, _fairGoldM, 0, 2.78, 0, tm);
          [-0.75, -0.25, 0.25, 0.75].forEach((bx, i) => {
            box(0.14, 0.22, 0.02, _fairFlagMs[i % 6], bx, 2.12, 0, tm);
            box(0.02, 0.22, 0.14, _fairFlagMs[(i + 3) % 6], 0, 1.72, bx, tm);
          });
        }

        // ---------- ชิงช้าสวรรค์ ----------
        const WX = 13.2,
          WY = 4.4,
          WR = 3.1,
          wgray = sm2(0xb8bcc0);
        const wf = new THREE.Group();
        wf.position.set(WX, 0, ZC + 0.2);
        st.add(wf);
        for (const lz of [-0.7, 0.7]) {
          cyl(0.09, 0.12, 5.01, wgray, -1.2, 2.2, lz, wf, 0, -0.5);
          cyl(0.09, 0.12, 5.01, wgray, 1.2, 2.2, lz, wf, 0, 0.5);
        }
        const wheel = new THREE.Group();
        wheel.position.set(0, WY, 0);
        wf.add(wheel);
        cyl(0.25, 0.25, 1.8, wgray, 0, 0, 0, wheel, Math.PI / 2, 0);
        for (const lz of [-0.7, 0.7]) {
          const rim = new THREE.Mesh(new THREE.TorusGeometry(WR, 0.06, 5, 28), wgray);
          rim.position.z = lz;
          wheel.add(rim);
          for (let k = 0; k < 4; k++) {
            const sp = new THREE.Mesh(new THREE.BoxGeometry(0.06, WR * 2, 0.06), wgray);
            sp.position.z = lz;
            sp.rotation.z = (k * Math.PI) / 4;
            wheel.add(sp);
          }
        }
        const gondolas = [];
        for (let k = 0; k < 8; k++) {
          const ang = (k / 8) * Math.PI * 2,
            gp = new THREE.Group();
          gp.position.set(Math.cos(ang) * WR, Math.sin(ang) * WR, 0);
          const hang = new THREE.Group();
          gp.add(hang);
          cyl(0.02, 0.02, 0.35, wgray, 0, -0.18, 0, hang);
          box(0.95, 0.6, 1.1, _fairFlagMs[k % 6], 0, -0.62, 0, hang);
          box(1.05, 0.08, 1.25, _fairWhiteM, 0, -0.28, 0, hang);
          wheel.add(gp);
          gondolas.push(hang);
        }
        const wheelBulbs = new THREE.InstancedMesh(new THREE.SphereGeometry(0.08, 5, 4), _fairBulbM, 48);
        let wbi = 0;
        for (const lz of [-0.7, 0.7])
          for (let k = 0; k < 24; k++) {
            const a = (k / 24) * Math.PI * 2;
            dmy.position.set(Math.cos(a) * WR, Math.sin(a) * WR, lz);
            dmy.updateMatrix();
            wheelBulbs.setMatrixAt(wbi++, dmy.matrix);
          }
        wheelBulbs.instanceMatrix.needsUpdate = true;
        wheelBulbs.frustumCulled = false;
        wheelBulbs.visible = false;
        wheel.add(wheelBulbs);

        // ---------- โคมแดงที่ปะรำ (เปิดตอนกลางคืน) ----------
        for (const lz of [-3.0, -1.5, 0, 1.5, 3.0]) ball(0.14, _fairLampM, PVX + 2.5, 2.5, PVZ + lz, nightG);
        for (const lz of [-3.0, 3.0]) ball(0.14, _fairLampM, PVX - 2.5, 2.5, PVZ + lz, nightG);

        window.dynamicEvents.push({
          group: st,
          condition: () => true,
          update: dt => {
            wheel.rotation.z -= dt * 0.2;
            for (const gd of gondolas) gd.rotation.z = -wheel.rotation.z;
            wheelBulbs.visible = !!state.night;
          }
        });
        window.dynamicEvents.push({ group: nightG, condition: s => !!s.night });
      };

      const templeTs = [0.14, 0.33, 0.52, 0.7, 0.842];
      for (const tVal of templeTs)
        patch([tVal], 30, 15, (o, sd) => {
        const g = mk(o.x, o.z);
        g.rotation.y = Math.atan2(sd * o.tn.z, -sd * o.tn.x);
        g.scale.setScalar(1.82); // ขยายสเกลวัดให้ใหญ่สง่างามและร่นออกจากถนนกำลังดี
        window.__TEMPLES.push({ t: tVal, sd, x: o.x, z: o.z, tn: o.tn, rot: g.rotation.y, group: g });

        const gold = sm2(0xefc637),
          wh = sm2(0xfaf8f5),
          red = sm2(0x9b2a1c), 
          wood = sm2(0x3a2311), 
          stone = sm2(0xc2c2c2),
          laterite = sm2(0xa65e44);

        // พื้นดินผสมหญ้าใต้ลานวัดและทางเชื่อมเข้าซุ้มประตูวัด
        addGroundPatch(g, 17.5, 19, 0, 0.5);
        box(3.0, 0.07, 2.4, stone, 0, 0.035, 9.2, g);
        box(3.4, 0.05, 2.6, laterite, 0, 0.02, 9.2, g);
        g.userData.bigRange = true;

        // เครื่องมือสร้าง "หลังคาทรงจั่ว" แบบเป๊ะๆ สำหรับวัด
        const rSh = new THREE.Shape();
        rSh.moveTo(-0.5, 0); rSh.lineTo(0.5, 0); rSh.lineTo(0, 1); rSh.closePath();
        const rGeo = new THREE.ExtrudeGeometry(rSh, { depth: 1, bevelEnabled: false });
        rGeo.translate(0, 0, -0.5);

        const makeRoof = (w, h, d, x, y, z) => {
          const m = new THREE.Mesh(rGeo, red);
          m.position.set(x, y, z);
          m.scale.set(w, h, d);
          m.castShadow = true;
          g.add(m);
          // หน้าจั่วสีทองประดับลายใต้หลังคาวิหาร
          const gIn = new THREE.Mesh(rGeo, gold);
          gIn.position.set(x, y - 0.02, z);
          gIn.scale.set(w * 0.78, h * 0.78, Math.max(0.2, d - 0.16));
          g.add(gIn);
          // ประดับช่อฟ้าหัวท้าย
          for(const fz of [d/2 - 0.1, -d/2 + 0.1]) {
             const cf = new THREE.Mesh(new THREE.ConeGeometry(0.06, 0.8, 4), gold);
             cf.position.set(x, y + h + 0.1, z + fz);
             cf.rotation.x = fz > 0 ? 0.3 : -0.3;
             g.add(cf);
          }
          return m;
        };

        // 1. พื้นลานวัดและกำแพงแก้วพร้อมเสาหัวเม็ดทรงมณฑป
        box(12.2, 0.1, 15.8, stone, 0, 0.05, 0, g); 
        const wY = 0.48;
        box(12.2, 0.85, 0.24, wh, 0, wY, -7.7, g); // กำแพงหลัง
        box(0.24, 0.85, 15.8, wh, -5.95, wY, 0, g); // กำแพงซ้าย
        box(0.24, 0.85, 15.8, wh, 5.95, wY, 0, g); // กำแพงขวา
        box(4.0, 0.85, 0.24, wh, -3.95, wY, 7.7, g); // กำแพงหน้าซ้าย
        box(4.0, 0.85, 0.24, wh, 3.95, wY, 7.7, g); // กำแพงหน้าขวา

        // ซุ้มประตูโขงหน้าวัด + ตุงล้านนาสีทองสองฝั่งประตู
        box(0.48, 2.0, 0.48, wh, -1.9, 1.0, 7.7, g);
        box(0.48, 2.0, 0.48, wh, 1.9, 1.0, 7.7, g);
        makeRoof(4.5, 1.25, 1.3, 0, 1.95, 7.7);
        for (const tx of [-2.65, 2.65]) {
          cyl(0.04, 0.05, 3.4, gold, tx, 1.7, 8.2, g);
          box(0.32, 1.95, 0.03, gold, tx + (tx < 0 ? 0.2 : -0.2), 2.1, 8.2, g);
        }

        // 2. พระวิหาร (สไตล์ล้านนา หลังคาลดหลั่นซ้อนชั้น)
        box(5.8, 0.52, 7.8, wh, 0, 0.3, 2.0, g); // ฐาน
        box(4.2, 2.25, 5.7, wh, 0, 1.62, 2.0, g); // ผนัง
        box(1.25, 1.65, 0.12, wood, 0, 1.32, 4.86, g); // ประตูวิหาร
        // บันไดนาคหน้าพระวิหาร
        box(1.8, 0.26, 0.9, stone, 0, 0.14, 6.2, g);
        for (const nx of [-0.85, 0.85]) {
          box(0.16, 0.45, 1.15, gold, nx, 0.36, 6.2, g).rotation.x = 0.28;
          ball(0.18, gold, nx, 0.52, 6.75, g, 0.9, 1.25, 1.1);
        }
        for (const z of [0.5, 2.0, 3.5]) { // หน้าต่าง
          box(0.12, 0.82, 0.62, wood, 2.1, 1.42, z, g);
          box(0.12, 0.82, 0.62, wood, -2.1, 1.42, z, g);
        }
        for (const x of [-1.55, 1.55]) cyl(0.16, 0.16, 1.85, wh, x, 1.42, 5.4, g); // เสาระเบียงหน้า
        
        // หลังคาซ้อน 3 ชั้น
        makeRoof(5.4, 2.65, 6.2, 0, 2.75, 2.0); // หลังคาหลัก (กลาง)
        makeRoof(5.4, 1.85, 3.1, 0, 2.12, 4.7); // หลังคายื่นหน้า
        makeRoof(5.4, 1.85, 3.1, 0, 2.12, -0.7); // หลังคายื่นหลัง

        // 3. พระธาตุเจดีย์ทองคำล้านนา (ฐานซ้อน 3 ชั้น องค์ระฆัง และปล้องไฉน)
        const cZ = -4.2;
        box(4.6, 0.6, 4.6, wh, 0, 0.3, cZ, g); // ฐาน 1
        box(3.6, 0.42, 3.6, wh, 0, 0.8, cZ, g); // ฐาน 2
        box(2.7, 0.42, 2.7, gold, 0, 1.22, cZ, g); // ฐาน 3
        ball(1.3, gold, 0, 2.15, cZ, g, 1, 1.12, 1); // องค์ระฆัง
        box(0.75, 0.32, 0.75, gold, 0, 3.55, cZ, g); // บัลลังก์
        const spire = new THREE.Mesh(new THREE.ConeGeometry(0.38, 2.95, 8), gold); // ยอดฉัตรเจดีย์
        spire.position.set(0, 5.1, cZ);
        spire.castShadow = true;
        g.add(spire);

        // 4. ต้นไม้ใหญ่แนวโพลีกอน (ต้นโพธิ์-ต้นไทรโบราณพันผ้าแพรเจ็ดสี) 3 ต้นรอบวัด เสริมความร่มรื่นและขลัง
        makeSacredPolygonTree(g, -4.3, 5.1, 0.96, true);   // ต้นโพธิ์เอกมุมหน้าซ้ายในลานวัด (พร้อมศาลและไม้ค้ำโพธิ์)
        makeSacredPolygonTree(g, 7.1, 4.2, 1.08, false);   // ต้นไทรใหญ่นอกกำแพงวัดฝั่งขวา
        makeSacredPolygonTree(g, -7.2, -3.6, 1.14, false); // ต้นโพธิ์ใหญ่นอกกำแพงวัดด้านหลังซ้าย

        // 5. งานวัด/งานทำบุญหน้าวัด + จองพื้นที่รอบวัดและลานงานตลอดแนวกว้าง ไม่ให้สวน/แปลงเกษตรมาวางทับ
        buildTempleFair(o.x, o.z, g.rotation.y);
        taken.push([o.x, o.z, 28]);
        const cosT = Math.cos(g.rotation.y),
          sinT = Math.sin(g.rotation.y);
        for (const lx of [-14, -7, 0, 7, 14]) {
          taken.push([o.x + lx * cosT + 21.3 * sinT, o.z - lx * sinT + 21.3 * cosT, 12]);
        }
      });
      patch([0.15, 0.45, 0.76], 6.4, 2.4, (o, sd) => {
        const g = mk(o.x, o.z);
        g.rotation.y = Math.atan2(sd * o.tn.z, -sd * o.tn.x);
        addGroundPatch(g, 4.4, 3.6, 0, 0.2);
        for (const x of [-1, 1]) for (const z of [-0.7, 0.7]) cyl(0.07, 0.08, 1.8, bk, x, 0.9, z, g);
        box(2.4, 0.14, 1.7, wdS, 0, 0.22, 0, g);
        const rf = new THREE.Mesh(new THREE.ConeGeometry(1.9, 0.9, 4), rfS);
        rf.rotation.y = Math.PI / 4;
        rf.position.y = 2.25;
        rf.scale.set(1, 1, 0.75);
        rf.castShadow = true;
        g.add(rf);
        box(1.7, 0.08, 0.4, wdS, 0, 0.62, -0.6, g);
        box(0.45, 0.3, 0.04, pm2(0x1f7a4d), 0, 1.5, 0.76, g);
      });
      for (const tt of [0.27, 0.58, 0.83]) {
        for (let a = 0; a < 12; a++) {
          const sd = a % 2 ? 1 : -1,
            o = offRoad(tt + (a >> 1) * 0.006, sd * (5.3 + (a >> 2) * 0.4));
          if (!spotOK(o.x, o.z, 2.2)) continue;
          taken.push([o.x, o.z, 2.2]);
          const g = mk(o.x, o.z),
            sR = sm2(0xd9534a),
            sY = sm2(0xf2c14e),
            sG = sm2(0x4d8b55),
            wd = sm2(0xc89b5a),
            dkW = sm2(0x6e4d33),
            leafB = sm2(0x5a9e4b),
            melonG = sm2(0x2e6f40),
            melonR = sm2(0xe63946),
            scaleM = sm2(0xd8e0e6);
          g.rotation.y = Math.atan2(sd * o.tn.z, -sd * o.tn.x);
          addGroundPatch(g, 5.2, 4.2, 0, 0.35);

          // 1. พื้นแคร่ไม้และเสาโครงสร้างไม้ไผ่/ไม้เนื้อแข็ง 4 มุม พร้อมค้ำยัน
          box(2.6, 0.1, 1.75, dkW, 0, 0.05, 0.1, g);
          for (const px of [-1.15, 1.15]) {
            for (const pz of [-0.55, 0.72]) {
              cyl(0.05, 0.055, 1.95, bk, px, 0.98, pz, g);
            }
          }
          // คานไม้ด้านบนสำหรับแขวนเครือกล้วยและส้มโอ
          cyl(0.035, 0.035, 2.4, bk, 0, 1.68, 0.68, g, 0, Math.PI / 2);

          // 2. หลังคาผ้าใบสลับสีลาดเอียง + ชายผ้าใบหยัก + ป้ายร้านผลไม้สด
          for (let s = -2; s <= 2; s++) {
            const stripeM = s % 2 === 0 ? sR : white;
            box(0.52, 0.08, 1.75, stripeM, s * 0.5, 1.98, 0.1, g).rotation.x = 0.14;
            box(0.5, 0.16, 0.05, stripeM, s * 0.5, 1.82, 0.96, g);
          }
          box(1.75, 0.3, 0.06, dkW, 0, 2.18, 0.82, g);
          box(1.65, 0.22, 0.08, sY, 0, 2.18, 0.83, g);

          // 3. แผงวางผลไม้ 2 ชั้น (ชั้นล่างกว้าง + ชั้นบนยกสโลป) ปูรองด้วยใบตองสีเขียวสด
          box(2.25, 0.68, 0.78, wd, 0, 0.42, 0.45, g);
          box(2.32, 0.06, 0.84, dkW, 0, 0.78, 0.45, g);
          box(2.18, 0.025, 0.72, leafB, 0, 0.82, 0.45, g); // ใบตองปูพื้นแผง

          // ชั้นวางยกระดับด้านใน
          box(2.15, 0.22, 0.36, wd, 0, 0.92, 0.24, g);
          box(2.08, 0.02, 0.32, leafB, 0, 1.04, 0.24, g);

          // 4. ถาดไม้และกระจาดสานใส่ผลไม้เรียงทรงพีระมิดแน่นเต็มแผง
          for (let i = 0; i < 4; i++) {
            const tx = -0.75 + i * 0.5;
            const f1 = FR[(i + a) % 6];
            const f2 = FR[(i + a + 2) % 6];

            // ถาดแถวหน้า (วางผลไม้ซ้อน 2 ชั้นเป็นกองสวยๆ)
            box(0.44, 0.09, 0.34, bk, tx, 0.86, 0.62, g);
            for (let r = -1; r <= 1; r++) {
              for (let c = -1; c <= 1; c++) {
                ball(0.065, f1.m, tx + r * 0.11, 0.94, 0.62 + c * 0.09, g);
              }
            }
            for (let r = -0.5; r <= 0.5; r += 1) {
              ball(0.065, f1.m, tx + r * 0.1, 1.03, 0.62, g);
            }

            // กระจาดสานแถวบน (ใส่ส้ม/มะม่วง/สับปะรด/แตงโม)
            cyl(0.19, 0.15, 0.08, wd, tx, 1.08, 0.24, g);
            if (i === 0) {
              // กองแตงโมลูกโต + แตงโมผ่าซีกเห็นเนื้อสีแดงฉ่ำ
              ball(0.13, melonG, tx - 0.07, 1.18, 0.24, g, 1.15, 0.95, 1);
              ball(0.12, melonG, tx + 0.08, 1.17, 0.2, g, 1.1, 0.95, 1);
              cyl(0.11, 0.11, 0.05, melonR, tx + 0.02, 1.16, 0.34, g, 0.4, 0);
            } else if (i === 3) {
              // สับปะรดภูแลพร้อมจุกใบสีเขียว
              for (const px of [-0.08, 0.08]) {
                ball(0.09, sY, tx + px, 1.17, 0.24, g, 0.85, 1.25, 0.85);
                const crown = new THREE.Mesh(new THREE.ConeGeometry(0.06, 0.12, 6), sG);
                crown.position.set(tx + px, 1.3, 0.24);
                g.add(crown);
              }
            } else {
              for (let j = 0; j < 6; j++) {
                ball(
                  0.07,
                  f2.m,
                  tx + ((j % 3) - 1) * 0.09,
                  1.15 + (j > 2 ? 0.06 : 0),
                  0.24 + (j % 2) * 0.07 - 0.035,
                  g
                );
              }
            }
          }

          // 5. เครือกล้วยหอมและส้มโอผูกเชือกแขวนบนราวไม้ด้านหน้า
          for (let b = 0; b < 3; b++) {
            const bx = -0.65 + b * 0.55;
            cyl(0.006, 0.006, 0.24, bk, bx, 1.56, 0.68, g);
            if (b < 2) {
              // เครือกล้วยหอมสีเหลืองทอง
              for (let k = 0; k < 4; k++) {
                const ang = (k / 4) * 6.28;
                ball(0.055, ban, bx + Math.cos(ang) * 0.05, 1.42, 0.68 + Math.sin(ang) * 0.05, g, 0.7, 1.65, 0.7);
              }
            } else {
              // พวงส้มโอเวียงแก่นลูกใหญ่
              ball(0.11, sG, bx - 0.05, 1.4, 0.68, g, 1, 1.08, 1);
              ball(0.105, sG, bx + 0.06, 1.36, 0.68, g, 1, 1.08, 1);
            }
          }

          // 6. ตาชั่งกิโลเข็มหน้าปัดกลมพร้อมจานสแตนเลสวางมุมแผง
          box(0.18, 0.16, 0.16, sG, 0.94, 0.89, 0.56, g);
          cyl(0.07, 0.07, 0.03, white, 0.94, 0.9, 0.64, g, Math.PI / 2, 0); // หน้าปัดตาชั่ง
          cyl(0.13, 0.1, 0.03, scaleM, 0.94, 1.0, 0.56, g); // จานชั่งผลไม้

          // 7. ลังไม้และเข่งผลไม้สำรองวางข้างร้าน + ร่มแม่ค้าสีสดใส
          box(0.52, 0.32, 0.62, wd, -1.45, 0.16, 0.35, g);
          for (let m = 0; m < 4; m++) {
            ball(0.11, melonG, -1.45 + ((m % 2) - 0.5) * 0.2, 0.36, 0.35 + ((m >> 1) - 0.5) * 0.22, g, 1.1, 0.95, 1);
          }
          cyl(0.24, 0.18, 0.36, bk, 1.45, 0.18, 0.4, g);
          for (let m = 0; m < 5; m++) {
            ball(0.075, FR[1].m, 1.45 + Math.cos(m * 1.25) * 0.1, 0.38, 0.4 + Math.sin(m * 1.25) * 0.1, g);
          }
          // ร่มสนามกางบังแดดข้างแผงผลไม้
          cyl(0.025, 0.028, 2.15, scaleM, -1.35, 1.08, -0.1, g);
          const umbCone = new THREE.Mesh(new THREE.ConeGeometry(1.15, 0.42, 10), a % 2 === 0 ? sR : sG);
          umbCone.position.set(-1.35, 2.18, -0.1);
          umbCone.castShadow = true;
          g.add(umbCone);

          VEND(g);
          break;
        }
      }
      for (const tt of [0.18, 0.72]) {
        for (let a = 0; a < 10; a++) {
          const sd = a % 2 ? 1 : -1,
            o = offRoad(tt, sd * (11 + a * 0.6));
          if (!spotOK(o.x, o.z, 5)) continue;
          taken.push([o.x, o.z, 5]);
          const im = new THREE.InstancedMesh(new THREE.IcosahedronGeometry(0.34, 0), treeMat, 48),
            dm2 = new THREE.Object3D(),
            tn = o.tn;
          let c = 0;
          for (let r = 0; r < 4; r++)
            for (let q = 0; q < 12; q++) {
              dm2.position.set(
                o.x + tn.x * (q - 6) * 0.8 - tn.z * (r - 1.5) * 1.4,
                0.2,
                o.z + tn.z * (q - 6) * 0.8 + tn.x * (r - 1.5) * 1.4
              );
              dm2.scale.set(1, 0.7, 1);
              dm2.updateMatrix();
              im.setMatrixAt(c++, dm2.matrix);
            }
          im.frustumCulled = false;
          scene.add(im);
          break;
        }
      }
      const pondM = new THREE.MeshBasicMaterial({
          color: 0x4e849e, // ฟ้าหม่นพาสเทล
          side: THREE.DoubleSide,
          fog: true
        }),
        pondShallowM = new THREE.MeshBasicMaterial({
          color: 0x7daec4, // ฟ้าอ่อนริมขอบสระ
          side: THREE.DoubleSide,
          fog: true
        }),
        pondMudBankM = sm2(0x6d583e),
        pondGrassBankM = sm2(0x7c8452),
        pondRockM = sm2(0x7a7770),
        padM = sm2(0x5f9a58),
        lotM = sm2(0xf0a6bd);
      window.__ROADSIDE_PONDS = [];
      for (const tt of [0.58, 0.66, 0.8, 0.95]) {
        for (let a = 0; a < 8; a++) {
          const sd = a % 2 ? 1 : -1,
            o = offRoad(tt, sd * (10 + a * 0.7));
          if (!spotOK(o.x, o.z, 5.5)) continue;
          taken.push([o.x, o.z, 5.5]);
          const g = mk(o.x, o.z),
            r = 3.8 + rx() * 1.8,
            rz = r * (0.65 + rx() * 0.25),
            bankOuter = new THREE.Mesh(new THREE.CircleGeometry(1, 32), pondGrassBankM),
            bankMud = new THREE.Mesh(new THREE.CircleGeometry(1, 32), pondMudBankM),
            wShallow = new THREE.Mesh(new THREE.CircleGeometry(1, 28), pondShallowM),
            w = new THREE.Mesh(new THREE.CircleGeometry(1, 28), pondM);
          addGroundPatch(g, r * 2.6, rz * 2.6, 0, 0);
          // คันดินปนหญ้าลาดเอียงรอบขอบบ่อชั้นนอก
          bankOuter.rotation.x = -Math.PI / 2;
          bankOuter.position.y = 0.018;
          bankOuter.scale.set(r * 1.24, rz * 1.24, 1);
          g.add(bankOuter);
          // ขอบดินชื้น/ดินเหนียวริมตลิ่งชั้นใน
          bankMud.rotation.x = -Math.PI / 2;
          bankMud.position.y = 0.028;
          bankMud.scale.set(r * 1.09, rz * 1.09, 1);
          g.add(bankMud);
          // โซนน้ำตื้นไล่เฉดขอบสระ
          wShallow.rotation.x = -Math.PI / 2;
          wShallow.position.y = 0.038;
          wShallow.scale.set(r * 1.01, rz * 1.01, 1);
          g.add(wShallow);
          // ผิวน้ำชั้นใน
          w.rotation.x = -Math.PI / 2;
          w.position.y = 0.046;
          w.scale.set(r * 0.92, rz * 0.92, 1);
          g.add(w);
          // โขดหินและก้อนกรวดธรรมชาติเรียงตัวเป็นจังหวะตามขอบสระ
          for (let rk = 0; rk < 14; rk++) {
            const rAng = (rk / 14) * Math.PI * 2 + (rx() - 0.5) * 0.28,
              rDist = 0.96 + rx() * 0.16,
              rxPos = Math.cos(rAng) * r * rDist,
              rzPos = Math.sin(rAng) * rz * rDist,
              rSz = 0.11 + rx() * 0.16;
            ball(rSz, pondRockM, rxPos, 0.04, rzPos, g, 1.25 + rx() * 0.5, 0.52 + rx() * 0.25, 1.0 + rx() * 0.45);
          }
          window.__ROADSIDE_PONDS.push({ x: o.x, z: o.z, rx: r, rz, sd, tn: o.tn });
          for (let k = 0; k < 7; k++) {
            const q = new THREE.Mesh(new THREE.CircleGeometry(0.28 + rx() * 0.2, 8), padM),
              an = rx() * 6.28,
              rr = rx() * r * 0.7;
            q.rotation.x = -Math.PI / 2;
            q.position.set(Math.cos(an) * rr, 0.06, Math.sin(an) * rr * 0.7);
            g.add(q);
            if (k % 3 === 0) ball(0.1, lotM, q.position.x, 0.12, q.position.z, g, 1, 0.6, 1);
          }
          break;
        }
      }
      for (let i = 0, n = 0; n < 54 && i < 900; i++) {
        const t = 0.04 + rx() * 0.92,
          o = offRoad(t, (rx() < 0.5 ? -1 : 1) * (5.4 + rx() * 11));
        if (!spotOK(o.x, o.z, 1.2)) continue;
        taken.push([o.x, o.z, 1.2]);
        kinds[n % kinds.length](o.x, o.z);
        n++;
      }

      // วางเสาส่งสัญญาณโทรศัพท์มือถือ (ขาว-แดง) 3 ต้น ห่างกันคนละโซนและถอยร่นออกไปไกลจากถนนอย่างสมดุล พร้อมไฟเตือนการบินสีแดงกระพริบตอนกลางคืน
      window.towerBeacons = [];
      {
        const twRedM = sm2(0xd63228),
          twWhiteM = sm2(0xf4f4ee),
          twSteelM = sm2(0x9aa4ad),
          twDarkM = sm2(0x424a52),
          twShelterM = sm2(0xe6e8eb),
          beaconBulbOffM = new THREE.MeshBasicMaterial({ color: 0x551111 }),
          beaconGlowTex = (() => {
            const c = document.createElement('canvas');
            c.width = c.height = 64;
            const ctx = c.getContext('2d');
            const g = ctx.createRadialGradient(32, 32, 1, 32, 32, 30);
            g.addColorStop(0.0, 'rgba(255, 235, 230, 1.0)');
            g.addColorStop(0.22, 'rgba(255, 45, 35, 0.95)');
            g.addColorStop(0.55, 'rgba(235, 15, 15, 0.42)');
            g.addColorStop(1.0, 'rgba(200, 0, 0, 0.0)');
            ctx.fillStyle = g;
            ctx.fillRect(0, 0, 64, 64);
            return new THREE.CanvasTexture(c);
          })();

        const towerSpots = [0.19, 0.50, 0.76];
        towerSpots.forEach((tt, idx) => {
          for (let a = 0; a < 10; a++) {
            const sd = (idx + a) % 2 === 0 ? 1 : -1,
              o = offRoad(tt + (a >> 1) * 0.004, sd * (29 + (a >> 1) * 2.5));
            if (!spotOK(o.x, o.z, 5.5)) continue;
            taken.push([o.x, o.z, 5.5]);

            const g = mk(o.x, o.z);
            g.rotation.y = Math.atan2(sd * o.tn.z, -sd * o.tn.x);
            g.userData.bigRange = true; // มองเห็นได้ไกลทั้งกลางวันและไฟกระพริบตอนกลางคืน
            addGroundPatch(g, 8.2, 8.2, 0, 0);

            // 1. ฐานคอนกรีต รั้วตาข่ายรอบสถานี และตู้คอนเทนเนอร์ควบคุมสัญญาณ (Shelter)
            box(4.2, 0.2, 4.2, twSteelM, 0, 0.1, 0, g);
            box(1.9, 1.85, 1.45, twShelterM, -0.95, 1.12, -0.95, g);
            box(2.02, 0.1, 1.56, twDarkM, -0.95, 2.08, -0.95, g);
            box(0.45, 0.38, 0.28, twSteelM, -0.95, 1.55, -0.12, g); // คอมเพรสเซอร์แอร์ตู้สัญญาณ
            for (const fx of [-1.95, 1.95]) {
              for (const fz of [-1.95, 1.95]) {
                cyl(0.035, 0.035, 1.35, twDarkM, fx, 0.85, fz, g);
              }
            }

            // 2. โครงเสาเหล็กถัก 4 มุม สลับสีขาว-แดง 7 ชั้น (ความสูงรวม ~22.5 เมตร)
            const tiers = 7,
              tierH = 2.9,
              baseW = 1.15,
              topW = 0.34;
            for (let t = 0; t < tiers; t++) {
              const mCol = t % 2 === 0 ? twRedM : twWhiteM,
                y0 = 0.2 + t * tierH,
                y1 = y0 + tierH,
                ym = (y0 + y1) * 0.5,
                w0 = baseW + (topW - baseW) * (t / tiers),
                w1 = baseW + (topW - baseW) * ((t + 1) / tiers),
                wm = (w0 + w1) * 0.5,
                legTilt = Math.atan2(w0 - w1, tierH);

              // เสาหลัก 4 มุมเอียงสอบขึ้นด้านบน
              for (const sx of [-1, 1]) {
                for (const sz of [-1, 1]) {
                  const leg = cyl(0.055, 0.068, tierH + 0.08, mCol, sx * wm, ym, sz * wm, g);
                  leg.rotation.z = sx * legTilt;
                  leg.rotation.x = -sz * legTilt;
                }
              }
              // คานขวางและเหล็กถักทแยง (X-Bracing) ทั้ง 4 ด้าน
              const braceLen = Math.hypot(w0 + w1, tierH),
                braceAng = Math.atan2(w0 + w1, tierH);
              for (const side of [-1, 1]) {
                // ด้านหน้า-หลัง
                box(w1 * 2, 0.05, 0.05, mCol, 0, y1, side * w1, g);
                const bFB = box(0.038, braceLen, 0.038, mCol, 0, ym, side * wm, g);
                bFB.rotation.z = side * braceAng;
                // ด้านซ้าย-ขวา
                box(0.05, 0.05, w1 * 2, mCol, side * w1, y1, 0, g);
                const bLR = box(0.038, braceLen, 0.038, mCol, side * wm, ym, 0, g);
                bLR.rotation.x = side * braceAng;
              }
            }

            // 3. แท่นซ่อมบำรุงยอดเสา แผงส่งสัญญาณ 4G/5G รอบทิศ จานไมโครเวฟกลม และเสาล่อฟ้า
            const topY = 0.2 + tiers * tierH; // ~20.5m
            cyl(0.85, 0.85, 0.08, twDarkM, 0, topY, 0, g); // แท่นยืนยอดเสา
            cyl(0.92, 0.92, 0.04, twRedM, 0, topY + 0.55, 0, g); // ราวกันตกยอดเสา
            // แผงส่งสัญญาณมือถือ (Sector Panel Antennas) 6 แผง รอบทิศทาง
            for (let k = 0; k < 6; k++) {
              const ang = (k / 6) * Math.PI * 2;
              const panel = box(0.22, 1.35, 0.09, twWhiteM, Math.cos(ang) * 0.92, topY + 0.45, Math.sin(ang) * 0.92, g);
              panel.rotation.y = -ang + Math.PI / 2;
            }
            // จานส่งสัญญาณไมโครเวฟทรงกลม (Microwave Dishes) 2 จานที่ระดับความสูง 16.5m
            for (const dir of [-1, 1]) {
              const dish = cyl(0.48, 0.42, 0.18, twWhiteM, dir * 0.72, topY - 3.6, 0.25, g, Math.PI / 2, 0);
              dish.rotation.z = dir * 0.35;
              cyl(0.18, 0.18, 0.05, twRedM, dir * 0.72, topY - 3.6, 0.35, g, Math.PI / 2, 0);
            }
            // เสาล่อฟ้าชี้ขึ้นสู่ยอดสูงสุด (y = 23.4m)
            cyl(0.025, 0.045, 2.8, twSteelM, 0, topY + 1.4, 0, g);

            // 4. ไฟเตือนการบินสีแดงกระพริบ (ยอดเสา 1 ดวง + กลางเสา 2 ดวง)
            const bulbMat = new THREE.MeshBasicMaterial({ color: 0xff2218, fog: false });
            const spriteMat = new THREE.SpriteMaterial({
              map: beaconGlowTex,
              color: 0xff2a1f,
              transparent: true,
              opacity: 0,
              blending: THREE.AdditiveBlending,
              fog: false,
              depthWrite: false
            });

            // โคมไฟยอดเสา
            const topBulb = new THREE.Mesh(new THREE.SphereGeometry(0.14, 10, 8), bulbMat);
            topBulb.position.set(0, topY + 2.85, 0);
            g.add(topBulb);

            const topGlow = new THREE.Sprite(spriteMat);
            topGlow.position.set(0, topY + 2.85, 0);
            topGlow.scale.set(3.8, 3.8, 1);
            g.add(topGlow);

            // โคมไฟระดับกลางเสา 2 ดวง (y ~ 12.0m)
            const midY = 0.2 + 4 * tierH;
            const midW = baseW + (topW - baseW) * (4 / tiers) + 0.12;
            const midGlows = [];
            for (const sx of [-1, 1]) {
              const mb = new THREE.Mesh(new THREE.SphereGeometry(0.09, 8, 6), bulbMat);
              mb.position.set(sx * midW, midY, sx * midW);
              g.add(mb);
              const mg = new THREE.Sprite(spriteMat);
              mg.position.set(sx * midW, midY, sx * midW);
              mg.scale.set(2.2, 2.2, 1);
              g.add(mg);
              midGlows.push(mg);
            }

            window.towerBeacons.push({
              group: g,
              bulbMat,
              spriteMat,
              topGlow,
              midGlows,
              phase: idx * 0.95
            });
            break;
          }
        });
      }
    }


    

    
    /* ============================================================================
     * src/scene/24-talk-bubbles.js
     * ฟองคำพูดของคนริมทาง (say, updateTalk, chat) และ updateWalkers
     * (ไฟล์นี้ถูกต่อรวมเป็น closure เดียวกับไฟล์อื่น — ไม่ต้อง import/export · ลำดับไฟล์ดู build.config.mjs)
     * ========================================================================== */

    /* talk bubbles */
    const talkPool = [],
      talkV = new THREE.Vector3(),
      TALK = [
        ['สวัสดีค่ะ', 'อากาศดีจังเลยนะคะ', 'ขับรถดี ๆ นะคะ'],
        ['สวัสดีครับ ไปไหนมา', 'ข้าวปีนี้งามดีเลย', 'รีบกลับก่อนฝนมานะ'],
        ['สวัสดีครับคุณครู', 'เดี๋ยวเข้าแถวไม่ทัน!', 'หนูหิวข้าวแล้ว'],
        ['เจริญพร', 'ขอให้เดินทางปลอดภัย', 'โชคดีนะโยม'],
        ['ไปไหนมาลูก', 'ขับช้า ๆ นะหลาน', 'สมัยก่อนถนนไม่ดีขนาดนี้'],
        ['รถสวยจัง!', 'หวัดดีค่ะ!', 'ถึงบ้านหรือยังคะ'],
        ['ซื้อของสดมาเต็มเลย', 'วันนี้ร้อนจังนะ', 'สวัสดีค่ะ']
      ],
      TALK_V = TALK.push(
        ['ผลไม้สด ๆ ค่ะ แวะชิมก่อน!', 'ส้มโอหวานฉ่ำเลยนะคะ', 'ซื้อกลับบ้านนะคะ'],
        ['ลูกชิ้นปิ้งร้อน ๆ จ้าเด็ก ๆ!', 'ไอติมเย็นชื่นใจ แวะก่อนจ้า!', 'น้ำปั่นหวานเย็นหน้าโรงเรียนจ้า']
      ),
      encouragementQuotes = [
        'ค่อย ๆ ไปก็ถึงได้เหมือนกันนะ',
        'วันนี้ทำได้เท่านี้ ก็ถือว่าเก่งแล้ว',
        'พักหายใจสักนิด แล้วค่อยไปต่อ',
        'ทางไกลเริ่มจากก้าวเล็ก ๆ เสมอ',
        'ไม่ต้องรีบ แค่ไม่ทิ้งตัวเองก็พอ',
        'เมฆครึ้มไม่ได้อยู่กับเราตลอดไป',
        'วันที่เหนื่อย ไม่ได้แปลว่าเราอ่อนแอ',
        'ขอให้ใจดีกับตัวเองเหมือนที่ใจดีกับคนอื่น',
        'ช้าได้ แต่อย่าลืมว่าเรากำลังเดินหน้า',
        'ทุกเช้ามีโอกาสให้เริ่มต้นใหม่',
        'เรื่องยากวันนี้ อาจเบาลงเมื่อเราได้พัก',
        'แค่ยังพยายามอยู่ ก็มีความหมายมากแล้ว',
        'ไม่เป็นไรถ้าวันนี้ยังไปไม่ถึงปลายทาง',
        'มองทางข้างหน้า แล้วค่อย ๆ ขับไปนะ',
        'ความพยายามเงียบ ๆ ก็พาเราไปได้ไกล',
        'ให้เวลากับตัวเอง เติบโตในจังหวะของเรา',
        'วันที่ธรรมดาก็มีเรื่องดีซ่อนอยู่',
        'เหนื่อยก็พัก ไม่จำเป็นต้องยอมแพ้',
        'ขอให้ระหว่างทางมีเรื่องเล็ก ๆ ให้ยิ้มได้',
        'เราไม่จำเป็นต้องเก่งทุกวัน',
        'ผ่านมาถึงตรงนี้ได้ ก็เก่งมากแล้ว',
        'จุดหมายสำคัญ แต่ความปลอดภัยสำคัญกว่า',
        'วันนี้อาจไม่ง่าย แต่คุณไม่จำเป็นต้องสู้ลำพัง',
        'ทุกโค้งมีทางออก ค่อย ๆ มองไปนะ',
        'ความหวังเล็ก ๆ ก็เป็นแสงนำทางได้',
        'อย่าเปรียบเทียบเส้นทางของเรากับใคร',
        'บางครั้งการหยุดพัก ก็คือการดูแลตัวเอง',
        'ทำทีละอย่าง ใจก็เบาลงได้',
        'พรุ่งนี้ยังมีโอกาสให้ลองใหม่เสมอ',
        'ขอให้วันนี้ใจเบากว่าเมื่อวานสักนิด',
        'เราเติบโตได้ แม้ในวันที่ไม่สมบูรณ์แบบ',
        'สิ่งดี ๆ บางอย่างต้องใช้เวลาเดินทาง',
        'อย่าลืมชื่นชมตัวเองที่ยังพยายาม',
        'ถนนยังทอดยาว และเรื่องดี ๆ ยังรออยู่',
        'ยิ้มให้ตัวเองสักครั้ง คุณสมควรได้รับมัน',
        'ไม่ต้องมีคำตอบทุกอย่างในวันนี้ก็ได้',
        'ก้าวเล็ก ๆ ที่ทำต่อเนื่อง พาไปได้ไกล',
        'หัวใจที่เหนื่อย ต้องการความอ่อนโยน',
        'ขอให้เจอผู้คนที่ทำให้วันนี้อบอุ่นขึ้น',
        'พลาดได้ เรียนรู้ได้ แล้วเริ่มใหม่ได้',
        'อย่าลืมว่าคุณมีคุณค่า แม้วันที่รู้สึกไม่ไหว',
        'ถึงช้ากว่าแผน ก็ยังถึงได้อย่างปลอดภัย',
        'เก็บแรงไว้ให้สิ่งที่สำคัญกับใจนะ',
        'ทุกวันไม่ต้องสดใส แค่ผ่านไปอย่างอ่อนโยนก็พอ',
        'ขอให้ปลายทางของวันนี้มีความสบายใจรออยู่',
        'คุณทำดีที่สุดแล้วในแบบของวันนี้'
      ],
      encouragementDeck = [],
      CT = ['ปี๊น ปี๊น ' + svgInline('wave'), 'สวัสดีครับ!', 'ขับปลอดภัยนะ', 'ทางนี้ชิลล์มาก ๆ'];
    let lastEncouragement = '';
    function nextEncouragement() {
      if (!encouragementDeck.length) {
        encouragementDeck.push(...encouragementQuotes);
        for (let i = encouragementDeck.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [encouragementDeck[i], encouragementDeck[j]] = [encouragementDeck[j], encouragementDeck[i]];
        }
        if (encouragementDeck.length > 1 && encouragementDeck[encouragementDeck.length - 1] === lastEncouragement) {
          const swapIndex = encouragementDeck.findIndex((quote, i) => i < encouragementDeck.length - 1 && quote !== lastEncouragement);
          [encouragementDeck[swapIndex], encouragementDeck[encouragementDeck.length - 1]] =
            [encouragementDeck[encouragementDeck.length - 1], encouragementDeck[swapIndex]];
        }
      }
      lastEncouragement = encouragementDeck.pop();
      return lastEncouragement;
    }
    for (let i = 0; i < 5; i++) {
      const e = document.createElement('div');
      e.className = 'talk';
      e.setAttribute('aria-hidden', 'true');
      host.appendChild(e);
      talkPool.push({ e, a: null, until: 0, hy: 2 });
    }
    function say(a, txt, hy, dur) {
      const s = talkPool.find(x => !x.a);
      if (!s) return false;
      s.a = a;
      s.hy = hy;
      s.until = totalTime + dur;
      if (typeof txt === 'string' && txt.includes('<svg')) s.e.innerHTML = txt;
      else s.e.textContent = txt;
      s.e.classList.add('show');
      return true;
    }
    function updateTalk() {
      const w = renderer.domElement.clientWidth,
        h = renderer.domElement.clientHeight;
      for (const s of talkPool) {
        if (!s.a) continue;
        const gp = s.a.g.position;
        talkV.set(gp.x, gp.y + s.hy, gp.z).project(camera);
        if (
          totalTime > s.until ||
          talkV.z > 1 ||
          Math.abs(talkV.x) > 1.05 ||
          talkV.y < -1.05 ||
          !s.a.g.visible
        ) {
          s.a = null;
          s.e.classList.remove('show');
          continue;
        }
        s.e.style.transform =
          'translate(' +
          ((talkV.x + 1) / 2) * w +
          'px,' +
          ((1 - talkV.y) / 2) * h +
          'px) translate(-50%,-100%)';
      }
    }
    function chat() {
      for (const w of walkers.concat(vendors)) {
        const dx = w.g.position.x - car.position.x,
          dz = w.g.position.z - car.position.z;
        if (!w.at && totalTime > w.cool && dx * dx + dz * dz < 70) {
          w.cool = totalTime + 28;
          w.at = totalTime + w.dly;
        }
        if (
          w.at &&
          totalTime >= w.at &&
          say(w, TALK[w.k][Math.floor(Math.random() * 3)], 1.85 * w.sc + 0.35, 3.6)
        )
          w.at = 0;
      }
    }
    function updateWalkers(dt) {
      const isNight = state.night;
      const isRaining = window.RODENV ? window.RODENV.rain() > 0.15 : false;

      // 1. ซ่อนร้านค้า แผงลอย และรถขายของริมทางในเวลากลางคืน หรือตอนฝนตกหนัก
      for (const v of vendors) {
        if (v.g) v.g.visible = !isNight && !isRaining;
      }

      if (!isNight) chat();

      const mv = state.reduced ? 0 : dt;
      for (const w of walkers) {
        // 2. ตอนกลางคืน: คนเดินริมทางเข้าบ้านพักผ่อนทั้งหมด
        // ตอนฝนตก: คนหาบของ (k=1) จะหลบฝนเข้าที่ร่ม ส่วนคนอื่นๆ จะกางร่มเดินต่อ
        if (isNight || (isRaining && w.k === 1)) {
          w.g.visible = false;
          continue;
        }
        w.g.visible = true;

        // 3. กางร่มอัตโนมัติเมื่อฝนตก และยกแขนขวาขึ้นจับด้ามร่ม
        if (w.rainUmb) {
          w.rainUmb.visible = isRaining;
        }

        // เร่งฝีเท้าเดินเร็วขึ้นเล็กน้อยตอนฝนตก
        const rainSpeedBoost = isRaining ? 1.35 : 1.0;
        w.u += (mv * w.sp * rainSpeedBoost) / w.len;
        const k = ((w.u % 2) + 2) % 2,
          f = k < 1 ? k : 2 - k;
        w.g.position.set(w.ax + (w.bx - w.ax) * f, 0, w.az + (w.bz - w.az) * f);
        w.g.rotation.y = w.yaw + (k < 1 ? 0 : Math.PI);
        const s = Math.sin(totalTime * 6 * rainSpeedBoost + w.ph) * 0.55;
        w.legL.rotation.x = s;
        w.legR.rotation.x = -s;
        w.armL.rotation.x = -s * 0.7;
        // ถ้ากางร่มอยู่ ให้ยกแขนขวาค้างไว้เพื่อถือร่ม
        w.armR.rotation.x = (isRaining && w.rainUmb) ? -0.65 : s * 0.7;
      }
    }

    /* ============================================================================
     * src/scene/25-memory-boxes-lanterns.js
     * กล่องความทรงจำริมทางและโคมลอย (refreshBoxes, release)
     * (ไฟล์นี้ถูกต่อรวมเป็น closure เดียวกับไฟล์อื่น — ไม่ต้อง import/export · ลำดับไฟล์ดู build.config.mjs)
     * ========================================================================== */

    const memoryBoxes = [];
    const _memWoodM = mat(0x7a5230),
      _memPlankM = mat(0xb88652),
      _memStoneM = mat(0x9a988e),
      _memClothM = mat(0xf6efe0),
      _memBrassM = new THREE.MeshStandardMaterial({ color: 0xe6b84d, roughness: 0.35, metalness: 0.65 }),
      _memGlowM = new THREE.MeshBasicMaterial({ color: 0xffe49e }),
      _memLeafM = mat(0x568f4e);
    function refreshBoxes() {
      memoryBoxes.forEach(b => scene.remove(b.group));
      memoryBoxes.length = 0;
      // ปิดการสร้างกล่อง 3D ข้างทางทั้งหมด เพื่อประหยัด CPU/GPU
      // ข้อมูลความทรงจำทั้งหมดจะถูกแสดงผลผ่าน UI ปฏิทินแบบ 2D แทน
    }
    const lanterns = [],
      lanternMat = new THREE.MeshStandardMaterial({
        color: 0xffb66a,
        emissive: 0xff992e,
        emissiveIntensity: 0.85,
        roughness: 0.7,
        transparent: true,
        opacity: 0.94,
        side: THREE.DoubleSide
      }),
      rimMat = mat(0xb57749);
    function release() {
      if (lanterns.length >= 12) {
        const old = lanterns.shift();
        scene.remove(old.group);
        old.owned.forEach(x => x.dispose());
      }
      const g = new THREE.Group();
      const paperGeo = new THREE.CylinderGeometry(0.4, 0.3, 0.85, 8, 1, true),
        paperMaterial = lanternMat.clone(),
        paper = new THREE.Mesh(paperGeo, paperMaterial);
      g.add(paper);
      const rimGeo = new THREE.TorusGeometry(0.31, 0.025, 4, 12),
        rim = new THREE.Mesh(rimGeo, rimMat);
      rim.rotation.x = Math.PI / 2;
      rim.position.y = -0.425;
      g.add(rim);
      const flameGeo = new THREE.SphereGeometry(0.09, 6, 6),
        flameMaterial = new THREE.MeshBasicMaterial({ color: 0xffedb5 }),
        flame = new THREE.Mesh(flameGeo, flameMaterial);
      flame.position.y = -0.27;
      g.add(flame);
      let p = car.position;
      g.position.set(p.x - 2, 1.7, p.z - 2);
      scene.add(g);
      lanterns.push({
        group: g,
        age: 0,
        phase: rand() * 6,
        origin: g.position.clone(),
        owned: [paperGeo, paperMaterial, rimGeo, flameGeo, flameMaterial]
      });
    }

    /* ============================================================================
     * src/scene/26-theme-quality.js
     * ธีมสีตามอารมณ์/กลางคืน (theme), resize และระบบปรับคุณภาพอัตโนมัติ
     * (ไฟล์นี้ถูกต่อรวมเป็น closure เดียวกับไฟล์อื่น — ไม่ต้อง import/export · ลำดับไฟล์ดู build.config.mjs)
     * ========================================================================== */

    let angle = 0,
      targetAngle = 0,
      drag = false,
      lastX = 0,
      totalTime = 0,
      lastTime = 0;
    const desiredSky = new THREE.Color(),
      desiredGround = new THREE.Color(),
      desiredTree = new THREE.Color(),
      desiredFar = new THREE.Color(),
      targetPoint = new THREE.Vector3(),
      desiredCamera = new THREE.Vector3();

    function theme() {
      window.__isNight = state.night; // ส่งสถานะกลางคืนให้โมเดลภายนอก (เช่น โรงเรียน)
      const m = moodOf(state.mood);
      desiredSky.set(state.night ? 0x233d4d : m.sky);
      
      let gndColor = new THREE.Color(state.night ? 0x506d62 : m.ground);
      let treeColor = new THREE.Color(state.night ? 0x3d6257 : m.tree);
      let tree2Color = new THREE.Color(state.night ? 0x466b5e : 0x90a07b);

      // --- ระบบฤดูกาล (Seasons) แบบกดเปลี่ยนเองได้ ---
      let curMonth = new Date().getMonth();
      if (window.manualSeasonIndex === 1) curMonth = 3;       // ฤดูร้อน
      else if (window.manualSeasonIndex === 2) curMonth = 7;  // ฤดูฝน
      else if (window.manualSeasonIndex === 3) curMonth = 11; // ฤดูหนาว

      if (!state.night) { 
        if (curMonth >= 5 && curMonth <= 9) {
          // ฤดูฝน: หญ้าและใบไม้เขียวสดชุ่มฉ่ำ
          gndColor.lerp(new THREE.Color(0x4caf50), 0.42);
          treeColor.lerp(new THREE.Color(0x2e7d32), 0.45);
          tree2Color.lerp(new THREE.Color(0x43a047), 0.45);
        } else if (curMonth === 10 || curMonth === 11 || curMonth <= 1) {
          // ฤดูหนาว: โทนเขียวอมฟ้าหม่นหมอกเมืองเหนือ + ดอกพญาเสือโคร่งชมพู
          gndColor.lerp(new THREE.Color(0x90a4ae), 0.32);
          treeColor.lerp(new THREE.Color(0x546e7a), 0.35);
          tree2Color.lerp(new THREE.Color(0xd896ac), 0.38);
        } else {
          // ฤดูร้อน: โทนเหลืองทองอบอุ่นแล้งนิดๆ
          gndColor.lerp(new THREE.Color(0xd4e157), 0.45);
          treeColor.lerp(new THREE.Color(0x9e9d24), 0.45);
          tree2Color.lerp(new THREE.Color(0xc0ca33), 0.45);
        }
      }

      // เปลี่ยนสีดอกไม้บนต้นแบบ Real-time
      if (typeof bloomM !== 'undefined') {
        let bloomColors = [0xf2b8c6, 0xf2d45c, 0xf7f0e4]; 
        if (curMonth >= 5 && curMonth <= 9) {
          bloomColors = [0xff5722, 0xe64a19, 0xff9800]; 
        } else if (curMonth === 10 || curMonth === 11 || curMonth <= 1) {
          bloomColors = [0xf48fb1, 0xf8bbd0, 0xffcdd2]; 
        } else {
          bloomColors = [0xffeb3b, 0xfdd835, 0xffb300]; 
        }
        bloomM.forEach((mat, i) => mat.color.setHex(bloomColors[i]));
      }

      desiredGround.copy(gndColor);
      desiredTree.copy(treeColor);
      desiredFar.copy(desiredGround).lerp(desiredSky, 0.35);

      // บังคับอัปเดตสีลงวัสดุพื้นดินและต้นไม้ทันทีเพื่อให้เห็นความต่างชัดเจนตอนกดปุ่ม
      groundMat.color.copy(desiredGround);
      treeMat.color.copy(desiredTree);
      treeMat2.color.copy(tree2Color);
      hillMat.color.copy(desiredGround).lerp(desiredSky, 0.18);
      hillFar.color.copy(desiredFar);

      // สั่งโปรยกลีบดอกไม้สีประจำฤดูทันทีเมื่อเปลี่ยนฤดู
      if (typeof window.triggerSeasonPetals === 'function') {
        window.triggerSeasonPetals();
      }

      ambient.intensity = state.night ? 1.4 : 2.6;
      sunLight.intensity = state.night ? 0.65 : 3.2;
      
      if (sunMesh.isCelestialSprite) {
        sunMesh.material.map = state.night ? sunMesh.moonTex : sunMesh.sunTex;
        sunMesh.material.blending = state.night ? THREE.NormalBlending : THREE.AdditiveBlending;
        sunMesh.scale.setScalar(state.night ? 18 : 36); 
      }
      stars.visible = state.night;
      clouds.forEach(c => (c.visible = !state.night));
      const nBtn = $('nightBtn');
      if (nBtn) nBtn.querySelector('use').setAttribute('href', state.night ? '#i-sun' : '#i-moon');
    }

    function resize() {
      const w = host.clientWidth,
        h = host.clientHeight;
      if (!w || !h) return;
      const level = state.qualityMode === 'auto' ? qualityLevel : parseInt(state.qualityMode),
        ratio = devicePixelRatio || 1;
      
      // จำกัด PixelRatio สูงสุดเพื่อไม่ให้จอ HiDPI เพิ่มภาระ GPU โดยไม่จำเป็น
      const rMuls = coarsePointer ? [0.4, 0.6, 0.75, 0.9, 1.0] : [0.5, 0.75, 0.9, 1.0, 1.0];
      const rCaps = coarsePointer ? [0.6, 0.8, 0.95, 1.0, 1.0] : [0.75, 0.95, 1.05, 1.1, 1.1];
      renderer.setPixelRatio(Math.min(ratio * rMuls[level], rCaps[level]));
      
      renderer.setSize(w, h);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    }
    function qualityInfo() {
      const names = ['ต่ำมาก', 'ต่ำ', 'ปานกลาง', 'สูง', 'สูงมาก'];
      const requestedLevel = state.qualityMode === 'auto' ? qualityLevel : parseInt(state.qualityMode);
      const hotspotCap = performanceHotspotLabel === 'งานวัด' ? 0 : 1;
      const level = nearPerformanceHotspot ? Math.min(requestedLevel, hotspotCap) : requestedLevel;
      if ($('qualityInfo')) {
        const mode = state.qualityMode === 'auto' ? 'อัตโนมัติ' : 'กำหนดเอง';
        $('qualityInfo').textContent = nearPerformanceHotspot
          ? `(${mode}: ลดชั่วคราวใกล้${performanceHotspotLabel} · ${names[level]} · เงาปิด)`
          : `(${mode}: ${names[level]} · เงา${level >= 3 ? 'เปิด' : 'ปิด'})`;
      }
    }
    function applyQuality() {
      const requestedLevel = state.qualityMode === 'auto' ? qualityLevel : parseInt(state.qualityMode);
      const hotspotCap = performanceHotspotLabel === 'งานวัด' ? 0 : 1;
      const level = nearPerformanceHotspot ? Math.min(requestedLevel, hotspotCap) : requestedLevel;
      if (level !== activeQuality) {
        const shadows = level >= 3;
        const shadowSizes = coarsePointer ? [512, 512, 512, 512, 512] : [512, 512, 512, 1024, 1024];
        const size = shadowSizes[level];
        if (sunLight.shadow.map) {
          sunLight.shadow.map.dispose();
          sunLight.shadow.map = null;
        }
        renderer.shadowMap.enabled = shadows;
        sunLight.castShadow = shadows;
        sunLight.shadow.mapSize.set(size, size);
        sunLight.shadow.needsUpdate = shadows;
        activeQuality = level;
        resize();
      }
      qualityInfo();
    }
    function applyVisualMode() {
      const filters = {
        natural: 'none',
        vivid: 'saturate(1.28) contrast(1.06) brightness(1.03)',
        game: 'saturate(1.48) contrast(1.1) brightness(1.04)'
      };
      renderer.domElement.style.filter = filters[state.visualMode] || filters.natural;
    }
    function samplePerformance(frameMs) {
      if (state.qualityMode !== 'auto') return;
      qualitySampleMs += frameMs;
      qualityFrameMs += frameMs;
      qualityFrames++;
      if (qualitySampleMs < 2500) return;
      
      const avg = qualityFrameMs / Math.max(1, qualityFrames);
      // ลดเมื่อช้ากว่า ~30 FPS และเพิ่มเมื่อเร็วกว่า ~42 FPS เพื่อกันการสลับระดับไปมา
      if (avg > 33) {
        qualitySlowMs += qualitySampleMs;
        qualityStableMs = 0;
      } else if (avg < 24) {
        qualityStableMs += qualitySampleMs;
        qualitySlowMs = 0;
      } else {
        qualitySlowMs = Math.max(0, qualitySlowMs - qualitySampleMs);
        qualityStableMs = 0;
      }
      qualitySampleMs = qualityFrameMs = qualityFrames = 0;
      
      // ดันระดับ 0 ไป 4 ได้
      if (qualitySlowMs >= 4000 && qualityLevel > 0) {
        qualityLevel--;
        qualitySlowMs = qualityStableMs = 0;
        applyQuality();
      } else if (qualityStableMs >= 10000 && qualityLevel < 4) {
        qualityLevel++;
        qualitySlowMs = qualityStableMs = 0;
        applyQuality();
      }
    }

    /* ============================================================================
     * src/scene/27-input-controls.js
     * การควบคุมด้วยเมาส์/ทัช: หมุนฉาก, pinch, ล้อเมาส์, แตะ
     * (ไฟล์นี้ถูกต่อรวมเป็น closure เดียวกับไฟล์อื่น — ไม่ต้อง import/export · ลำดับไฟล์ดู build.config.mjs)
     * ========================================================================== */

    const touches = new Map();
    let prevPinch = 0,
      lastCockDragTime = 0;
    renderer.domElement.addEventListener('pointerdown', e => {
      drag = true;
      lastX = e.clientX;
      renderer.domElement.setPointerCapture(e.pointerId);
    });
    renderer.domElement.addEventListener('pointermove', e => {
      if (drag && touches.size < 2) {
        if (cockpit) {
          targetAngle = Math.max(-1.62, Math.min(1.62, targetAngle + (e.clientX - lastX) * 0.006));
          lastCockDragTime = performance.now();
        } else {
          targetAngle = targetAngle + (e.clientX - lastX) * 0.006;
        }
        lastX = e.clientX;
      }
    });
    renderer.domElement.addEventListener('dblclick', () => {
      targetAngle = 0;
      pitch = -0.012;
    });
    renderer.domElement.addEventListener('pointerup', () => (drag = false));
    renderer.domElement.addEventListener('pointercancel', () => (drag = false));
    renderer.domElement.style.touchAction = 'none';
    renderer.domElement.addEventListener(
      'wheel',
      e => {
        e.preventDefault();
        sceneAPI?.zoom(e.deltaY < 0 ? 0.9 : 1.1);
      },
      { passive: false }
    );
    renderer.domElement.addEventListener('pointerdown', e => {
      touches.set(e.pointerId, { x: e.clientX, y: e.clientY });
      if (touches.size > 1) {
        drag = false;
        prevPinch = 0;
      }
    });
    renderer.domElement.addEventListener('pointermove', e => {
      if (touches.has(e.pointerId)) touches.set(e.pointerId, { x: e.clientX, y: e.clientY });
      if (touches.size === 2) {
        drag = false;
        const [a, b] = [...touches.values()],
          dist = Math.hypot(a.x - b.x, a.y - b.y);
        if (prevPinch) sceneAPI?.zoom(prevPinch / dist);
        prevPinch = dist;
      }
    });
    ['pointerup', 'pointercancel'].forEach(type =>
      renderer.domElement.addEventListener(type, e => {
        touches.delete(e.pointerId);
        prevPinch = 0;
      })
    );
    let downXY = null;
    renderer.domElement.addEventListener('pointerdown', e => (downXY = { x: e.clientX, y: e.clientY }));
    // ===== โค้ดสร้าง UI สำหรับกล้องโพลารอยด์ =====
    const flashEl = document.createElement('div');
    flashEl.id = 'flashFX';
    document.body.appendChild(flashEl);
    
    const polEl = document.createElement('div');
    polEl.id = 'polaroidUI';
    polEl.innerHTML = `
      <img id="polaroidImg" src="" alt="Snapshot" />
      <div class="caption" id="polCaption">ความทรงจำบนเส้นทาง</div>
      <div class="p-btn-row">
        <button class="secondary" id="polClose" style="flex:1">เก็บรูปลงกล่อง</button>
        <button class="primary" id="polSave" style="flex:1"><svg style="width:14px;height:14px;margin-right:6px"><use href="#i-save"/></svg> เซฟรูปลงเครื่อง</button>
      </div>
    `;
    document.body.appendChild(polEl);
    document.getElementById('polClose').onclick = () => polEl.classList.remove('show');
    document.getElementById('polSave').onclick = () => {
      const a = document.createElement('a');
      a.href = document.getElementById('polaroidImg').src;
      a.download = 'ChiangRai_Memory_' + Date.now() + '.png';
      a.click();
    };

    function takePolaroidPhoto() {
      flashEl.classList.add('flash');
      if (typeof tone === 'function') tone(1200, 0.1, 0.05, 'square'); // เสียงชัตเตอร์
      setTimeout(() => {
        flashEl.classList.remove('flash');
        renderer.render(scene, camera); // แชะภาพ 1 เฟรม
        document.getElementById('polaroidImg').src = renderer.domElement.toDataURL('image/png');
        const pl = document.getElementById('placeLabel').textContent;
        document.getElementById('polCaption').textContent = pl.includes('จุดเริ่มต้น') ? 'ความทรงจำบนเส้นทาง' : pl;
        polEl.classList.add('show');
      }, 50);
    }
    // ===== ฟังก์ชันเสริมที่ 2: วิทยุคลาสสิกเปลี่ยนคลื่นได้ =====
    window.radioChannel = 0;
    const radioStations = [
       { name: "FM 88.5: Ambient ออริจินัล", color: 0xffdf9e, em: 0xffaa44 },
       { name: "FM 94.0: ดนตรีล้านนาประยุกต์", color: 0xc8ffc8, em: 0x44ff88 },
       { name: "FM 102.5: กล่องดนตรี", color: 0xc8e0ff, em: 0x44aaff },
       { name: "TAPE: เทปเสียงฝน", color: 0xffc8c8, em: 0xff4444 }
    ];
    function changeRadioChannel() {
        window.radioChannel = (window.radioChannel + 1) % 4;
        const st = radioStations[window.radioChannel];
        
        // เสียงแครก/หมุนคลื่นวิทยุ (Static noise)
        if (typeof tone === 'function') {
            tone(400, 0.06, 0.02, 'square');
            setTimeout(() => tone(200, 0.06, 0.03, 'sawtooth'), 60);
        }
        
        toast(svgInline('radio') + ' ' + st.name);
        
        // เปลี่ยนสีไฟหน้าปัดวิทยุ
        if (window.radioGlow) {
            window.radioGlow.color.setHex(st.color);
            window.radioGlow.emissive.setHex(st.em);
        }
        
        // หากเพลงถูกปิดอยู่ ให้กดเปิดให้อัตโนมัติเพื่อให้ได้ยินเพลง
        if (typeof mOn !== 'undefined' && !mOn) {
            document.getElementById('musicBtn').click();
        }
    }
    // ====================================================

    renderer.domElement.addEventListener('pointerup', e => {
      if (!downXY || Math.hypot(e.clientX - downXY.x, e.clientY - downXY.y) > 8) return;
      const rect = renderer.domElement.getBoundingClientRect(),
        mouse = new THREE.Vector2(
          ((e.clientX - rect.left) / rect.width) * 2 - 1,
          (-(e.clientY - rect.top) / rect.height) * 2 + 1
        ),
        ray = new THREE.Raycaster();
      ray.setFromCamera(mouse, camera);

      // 1. เช็คว่าคลิกโดนของในห้องโดยสารหรือไม่
      if (cockpit) {
        const cockHits = ray.intersectObjects(cock.children, true);
        const hasTag = tag =>
          cockHits.find(h => {
            let o = h.object;
            while (o) {
              if (o.userData && o.userData[tag]) return true;
              o = o.parent;
            }
            return false;
          });

        // 1.1 เช็คกล้องถ่ายรูปโพลารอยด์
        if (hasTag('isCamera')) {
          takePolaroidPhoto();
          return;
        }
        // 1.2 เช็ควิทยุคลาสสิก
        if (hasTag('isRadio')) {
          changeRadioChannel();
          return;
        }
        // 1.3 เช็คแมวนอนหลับ
        if (hasTag('isCat')) {
          if (typeof window.playCatPurr === 'function') window.playCatPurr();
          return;
        }
        // 1.4 เช็คแก้วกาแฟดริปเชียงราย
        if (hasTag('isCoffee')) {
          if (typeof window.sipCoffee === 'function') window.sipCoffee();
          return;
        }
        // 1.5 เช็คแป้นแตรพวงมาลัยคลาสสิก
        if (hasTag('isHorn')) {
          if (typeof window.honkCockpitHorn === 'function') window.honkCockpitHorn();
          return;
        }
        // 1.6 เช็คที่บังแดดหน้ารถ
        if (hasTag('isVisor')) {
          if (typeof window.toggleSunVisor === 'function') window.toggleSunVisor();
          return;
        }
      }

      // 2. เช็คว่าคลิกโดนกล่องความทรงจำ (โค้ดดั้งเดิม)
      const hits = ray.intersectObjects(
        memoryBoxes.map(b => b.group),
        true
      );
      if (hits.length) {
        const hit = memoryBoxes.find(b => {
          let o = hits[0].object;
          while (o) {
            if (o === b.group) return true;
            o = o.parent;
          }
          return false;
        });
        if (hit) openReader(hit.entry.id);
      } else {
        // 3. ถ้าไม่โดนกล่อง ให้เช็คว่าจิ้มฟ้าตอนกลางคืนหรือไม่ (ลดระยะ Y ลงเพื่อให้แตะบนมือถือง่ายขึ้น)
        if (state.night && mouse.y > -0.1) {
            if (typeof window.triggerShootingStar === 'function') window.triggerShootingStar();
        } else {
            tapVeh(ray);
        }
      }
    });

    /* ============================================================================
     * src/scene/28-scene-api.js
     * sceneAPI ที่ส่วน UI เรียกใช้ + ขั้นตอนเริ่มต้นหลังสร้างฉาก + จัดการ WebGL context หาย
     * (ไฟล์นี้ถูกต่อรวมเป็น closure เดียวกับไฟล์อื่น — ไม่ต้อง import/export · ลำดับไฟล์ดู build.config.mjs)
     * ========================================================================== */

    sceneAPI = {
      theme,
      resize,
      release,
      refresh: refreshBoxes,
      zoom: f => {
        if (cockpit) {
          fovC = Math.min(92, Math.max(48, fovC * f));
          return;
        }
        camDist = Math.min(17, Math.max(3, camDist * f));
      },
      setQuality: () => {
        qualitySampleMs = qualityFrameMs = qualityFrames = qualitySlowMs = qualityStableMs = 0;
        applyQuality();
      },
      setVisualMode: applyVisualMode,
      gpuInfo: () => {
        const gl = renderer.getContext(),
          debugInfo = gl.getExtension('WEBGL_debug_renderer_info'),
          name = debugInfo ? gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) : '';
        return name ? `Renderer ที่เบราว์เซอร์รายงาน: ${name}` : 'เบราว์เซอร์ไม่เปิดเผยชื่อ GPU';
      },
      qualityInfo
    };
    new ResizeObserver(resize).observe(host);
    applyQuality();
    applyVisualMode();
    resize();
    theme();
    refreshBoxes();
    initPetals();
    $('loading').classList.add('hidden');
    renderer.domElement.addEventListener('webglcontextlost', e => {
      e.preventDefault();
      $('loading').classList.remove('hidden');
      $('loading').innerHTML =
        '<p>ฉาก 3D หยุดชั่วคราว<br>กรุณาโหลดหน้าใหม่เพื่อแสดงฉากอีกครั้ง<br>ข้อมูลที่บันทึกไว้ยังอยู่</p>';
    });

    /* ============================================================================
     * src/scene/29-cockpit-model.js
     * โมเดลห้องโดยสารมุมมองคนขับ (พวงมาลัย เบาะ ปัดน้ำฝน มาตรวัด) และไฟหน้า
     * (ไฟล์นี้ถูกต่อรวมเป็น closure เดียวกับไฟล์อื่น — ไม่ต้อง import/export · ลำดับไฟล์ดู build.config.mjs)
     * ========================================================================== */

    let camDist = window.innerWidth <= 768 ? 12.0 : 9.5;
    const cock = new THREE.Group(),
      dkM = pm2(0x283530),
      cM = pm2(0x41524a),
      creamTrimM = pm2(0xf3e7c4),
      woodTrimM = pm2(0x8b5732),
      dkWoodM = pm2(0x5a361c),
      chromeTrimM = new THREE.MeshStandardMaterial({ color: 0xdce2dd, roughness: 0.25, metalness: 0.65 }),
      leatherTanM = pm2(0xd6c7aa),
      leatherBolsterM = pm2(0xb5a282),
      glassMirM = new THREE.MeshStandardMaterial({ color: 0x263c42, roughness: 0.15, metalness: 0.4 });
    cock.visible = false;
    scene.add(cock);

    // --- 1. ฝากระโปรงหน้ารถสไตล์คลาสสิก (ลาดต่ำลงเพื่อให้เห็นวิวถนนและธรรมชาติกว้างขึ้น) ---
    box(1.58, 0.08, 1.32, pm2(0xf5e9bd), 0, 0.90, 1.66, cock).rotation.x = 0.04;
    // สันนูนกลางฝากระโปรง + คิ้วโครเมียม + โลโก้หน้ารถวินเทจ
    box(0.28, 0.03, 1.24, creamTrimM, 0, 0.93, 1.64, cock).rotation.x = 0.04;
    box(0.025, 0.018, 1.22, chromeTrimM, 0, 0.95, 1.65, cock).rotation.x = 0.04;
    cyl(0.03, 0.04, 0.02, chromeTrimM, 0, 0.94, 2.22, cock);
    box(0.015, 0.045, 0.07, chromeTrimM, 0, 0.965, 2.21, cock).rotation.x = -0.35;

    // --- 2. คอนโซลหน้ารถทูโทนคาดไม้สักอบอุ่น (ระดับต่ำ ไม่บังทัศนียภาพ) ---
    // ฐานคอนโซลหลัก
    box(1.72, 0.16, 0.46, dkM, 0, 0.90, 0.73, cock);
    // นวมคอนโซลด้านบนโค้งมนลาดลงด้านหน้า
    box(1.72, 0.055, 0.44, cM, 0, 0.99, 0.74, cock).rotation.x = 0.06;
    // แผงหน้าปัดคาดลายไม้สัก (Teak Wood Fascia) + คิ้วโครเมียมบน-ล่าง
    box(1.66, 0.13, 0.04, woodTrimM, 0, 0.91, 0.51, cock);
    box(1.67, 0.012, 0.045, chromeTrimM, 0, 0.978, 0.51, cock);
    box(1.67, 0.012, 0.045, chromeTrimM, 0, 0.842, 0.51, cock);
    // ขอบกันชนล่างกระดูกงูและช่องเก็บของฝั่งผู้โดยสาร (Glovebox)
    box(0.54, 0.095, 0.015, dkWoodM, 0.46, 0.905, 0.492, cock);
    box(0.07, 0.018, 0.02, chromeTrimM, 0.46, 0.91, 0.485, cock);
    // ถาดวางของบุสักหลาดบนคอนโซลฝั่งซ้าย-ขวา
    box(0.56, 0.012, 0.24, dkWoodM, 0.45, 1.01, 0.72, cock);
    box(0.54, 0.008, 0.22, pm2(0x35443d), 0.45, 1.016, 0.72, cock);

    // --- 3. เรือนไมล์อนาล็อกทรงกลมวินเทจพร้อมหน้าปัดละเอียด (CanvasTexture) + แสงไฟเรืองแสงนุ่มนวลสบายตา ---
    const wipM = pm2(0x1d2622),
      makeGaugeFaceTex = (kind = 'speed') => {
        const cv = document.createElement('canvas');
        cv.width = cv.height = 256;
        const ctx = cv.getContext('2d');
        const cx = 128, cy = 128, r = 116;
        // พื้นหน้าปัดครีมวินเทจไล่เฉดขอบทองเหลืองอ่อน
        const g = ctx.createRadialGradient(cx, cy, 12, cx, cy, r);
        g.addColorStop(0, '#fffcf2');
        g.addColorStop(0.82, '#f5ebd1');
        g.addColorStop(1, '#d8c59e');
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.fill();
        // วงแหวนทองเหลืองด้านใน
        ctx.strokeStyle = 'rgba(139, 87, 50, 0.35)';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.arc(cx, cy, r * 0.78, 0, Math.PI * 2);
        ctx.stroke();

        const ticks = kind === 'speed' ? 24 : 8;
        const aStart = Math.PI * 0.75,
          aEnd = Math.PI * 2.25;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        for (let i = 0; i <= ticks; i++) {
          const u = i / ticks,
            ang = aStart + u * (aEnd - aStart),
            isMajor = kind === 'speed' ? i % 4 === 0 : i % 2 === 0,
            rOut = r * 0.9,
            rIn = r * (isMajor ? 0.73 : 0.81);
          ctx.strokeStyle = isMajor ? '#24362f' : '#65756c';
          ctx.lineWidth = isMajor ? 3.5 : 1.8;
          ctx.beginPath();
          ctx.moveTo(cx + Math.cos(ang) * rIn, cy + Math.sin(ang) * rIn);
          ctx.lineTo(cx + Math.cos(ang) * rOut, cy + Math.sin(ang) * rOut);
          ctx.stroke();
          if (kind === 'speed' && isMajor) {
            const val = i * 5;
            ctx.fillStyle = '#24362f';
            ctx.font = '700 18px "Outfit", sans-serif';
            ctx.fillText(String(val), cx + Math.cos(ang) * (r * 0.56), cy + Math.sin(ang) * (r * 0.56));
          }
        }
        ctx.fillStyle = '#4a5d54';
        if (kind === 'speed') {
          ctx.font = '600 13px "Outfit", sans-serif';
          ctx.fillText('KM / H', cx, cy - 28);
          ctx.font = '500 10px "Outfit", sans-serif';
          ctx.fillStyle = '#8b5732';
          ctx.fillText('CHIANG RAI', cx, cy + 54);
          // กรอบเลขไมล์สะสมวินเทจ (Odometer)
          ctx.fillStyle = '#26332e';
          ctx.fillRect(cx - 32, cy + 22, 64, 18);
          ctx.strokeStyle = '#b89f72';
          ctx.lineWidth = 1.5;
          ctx.strokeRect(cx - 32, cy + 22, 64, 18);
          ctx.fillStyle = '#f8f2dc';
          ctx.font = '700 12px monospace';
          ctx.fillText('02008', cx, cy + 31);
        } else {
          ctx.font = '700 17px "Outfit", sans-serif';
          ctx.fillText(kind === 'temp' ? 'TEMP' : 'FUEL', cx, cy + 36);
          ctx.font = '700 16px "Outfit", sans-serif';
          ctx.fillText(kind === 'temp' ? 'C' : 'E', cx - 44, cy + 16);
          ctx.fillStyle = '#c84b31';
          ctx.fillText(kind === 'temp' ? 'H' : 'F', cx + 44, cy + 16);
        }
        const tex = new THREE.CanvasTexture(cv);
        tex.colorSpace = THREE.SRGBColorSpace;
        return tex;
      },
      speedGaugeTex = makeGaugeFaceTex('speed'),
      tempGaugeTex = makeGaugeFaceTex('temp'),
      fuelGaugeTex = makeGaugeFaceTex('fuel'),
      gaugeM = new THREE.MeshStandardMaterial({
        map: speedGaugeTex,
        color: 0xffffff,
        emissive: 0xffe4b5,
        emissiveMap: speedGaugeTex,
        emissiveIntensity: 0.12,
        roughness: 0.38
      }),
      tempGaugeM = new THREE.MeshStandardMaterial({
        map: tempGaugeTex,
        color: 0xffffff,
        emissive: 0xffe4b5,
        emissiveMap: tempGaugeTex,
        emissiveIntensity: 0.12,
        roughness: 0.38
      }),
      fuelGaugeM = new THREE.MeshStandardMaterial({
        map: fuelGaugeTex,
        color: 0xffffff,
        emissive: 0xffe4b5,
        emissiveMap: fuelGaugeTex,
        emissiveIntensity: 0.12,
        roughness: 0.38
      }),
      amberGlowM = new THREE.MeshStandardMaterial({
        color: 0xffdf9e,
        emissive: 0xffaa44,
        emissiveIntensity: 0.22,
        roughness: 0.35
      }),
      needleM = new THREE.MeshBasicMaterial({ color: 0xe85d44 });

    // หมวกครอบเรือนไมล์ทรงโค้งไม่บังสายตา
    box(0.44, 0.09, 0.18, cM, -0.35, 1.02, 0.59, cock);
    box(0.42, 0.075, 0.03, dkWoodM, -0.35, 0.995, 0.50, cock);
    // หน้าปัดกลม 3 ช่อง (ซ้าย: อุณหภูมิ, กลาง: ความเร็ว, ขวา: น้ำมัน) พร้อมกระจกครอบหน้าปัดใสสะท้อนแสงอ่อนๆ
    for (const [gx, gr, gMat] of [
      [-0.47, 0.042, tempGaugeM],
      [-0.35, 0.056, gaugeM],
      [-0.23, 0.042, fuelGaugeM]
    ]) {
      const bz = new THREE.Mesh(new THREE.CylinderGeometry(gr + 0.007, gr + 0.007, 0.018, 24), chromeTrimM);
      bz.position.set(gx, 0.995, 0.49);
      bz.rotation.x = Math.PI / 2;
      cock.add(bz);
      const fc = new THREE.Mesh(new THREE.CircleGeometry(gr, 48), gMat);
      fc.position.set(gx, 0.995, 0.479);
      fc.rotation.y = Math.PI;
      cock.add(fc);
      const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.006, 0.006, 0.025, 14), chromeTrimM);
      cap.position.set(gx, 0.995, 0.485);
      cap.rotation.x = Math.PI / 2;
      cock.add(cap);
    }
    // เข็มไมล์วัดความเร็ว (หมุนตามความเร็วจริงอย่างนุ่มนวล)
    const speedNeedleG = new THREE.Group();
    speedNeedleG.position.set(-0.35, 0.995, 0.476);
    speedNeedleG.rotation.z = 2.1; // เริ่มต้นที่ 0 km/h (ซ้ายล่าง)
    cock.add(speedNeedleG);
    window.speedNeedleG = speedNeedleG;
    box(0.0045, 0.044, 0.004, needleM, 0, 0.017, 0, speedNeedleG);
    // เข็มหน้าปัดย่อยซ้าย-ขวา (อุณหภูมิเครื่องยนต์ปกติ & น้ำมันเต็มถัง)
    const subN1 = box(0.0038, 0.028, 0.004, needleM, -0.47, 0.995, 0.476, cock);
    subN1.rotation.z = 0.15;
    const subN2 = box(0.0038, 0.028, 0.004, needleM, -0.23, 0.995, 0.476, cock);
    subN2.rotation.z = -0.62;

    // --- 4. พวงมาลัยไม้สักคลาสสิก 3 ก้าน + วงแตรโครเมียม + มือคนขับจับพวงมาลัยพร้อมนาฬิกาข้อมือวินเทจ ---
    const swG = new THREE.Group();
    swG.position.set(-0.35, 0.99, 0.37);
    swG.rotation.x = 0.38;
    cock.add(swG);
    // วงพวงมาลัยไม้สัก + วงแตรโครเมียมด้านใน
    swG.add(new THREE.Mesh(new THREE.TorusGeometry(0.16, 0.019, 14, 40), woodTrimM));
    swG.add(new THREE.Mesh(new THREE.TorusGeometry(0.105, 0.005, 8, 28), chromeTrimM));
    // ก้านพวงมาลัยโครเมียม 3 ก้านเจาะรูสไตล์สปอร์ตคลาสสิก
    box(0.145, 0.02, 0.012, chromeTrimM, -0.08, -0.01, 0, swG).rotation.z = 0.12;
    box(0.145, 0.02, 0.012, chromeTrimM, 0.08, -0.01, 0, swG).rotation.z = -0.12;
    box(0.022, 0.135, 0.012, chromeTrimM, 0, -0.08, 0, swG);
    // แป้นแตรกลางพวงมาลัยทูโทน (แตะเพื่อบีบแตรทักทายได้!)
    const hornPadG = new THREE.Group();
    hornPadG.userData.isHorn = true;
    swG.add(hornPadG);
    const hornHit = new THREE.Mesh(new THREE.CylinderGeometry(0.085, 0.085, 0.06, 12), new THREE.MeshBasicMaterial({ visible: false }));
    hornHit.rotation.x = Math.PI / 2;
    hornPadG.add(hornHit);
    cyl(0.044, 0.048, 0.028, creamTrimM, 0, 0, 0.005, hornPadG, Math.PI / 2, 0);
    cyl(0.026, 0.026, 0.018, chromeTrimM, 0, 0, 0.016, hornPadG, Math.PI / 2, 0);

    window.honkCockpitHorn = function () {
      if (typeof tone === 'function') {
        tone(392, 0.14, 0.045, 'triangle');
        setTimeout(() => tone(493.88, 0.22, 0.05, 'triangle'), 120);
      }
      toast(svgInline('horn') + ' ปู๊น-ปู๊น! ทักทายผู้คนระหว่างทาง ' + svgInline('wave'));
    };

    // คอพวงมาลัยและก้านไฟเลี้ยว/ปัดน้ำฝน + พวงกุญแจลูกปัดไม้ล้านนาห้อยแกว่งที่สวิตช์กุญแจ
    cyl(0.034, 0.04, 0.22, dkM, -0.35, 0.94, 0.47, cock, -1.18, 0);
    cyl(0.006, 0.006, 0.12, chromeTrimM, -0.42, 0.96, 0.44, cock, 0, 0.35);
    ball(0.011, creamTrimM, -0.47, 0.98, 0.44, cock);
    cyl(0.006, 0.006, 0.12, chromeTrimM, -0.28, 0.96, 0.44, cock, 0, -0.35);
    ball(0.011, dkM, -0.23, 0.98, 0.44, cock);
    const keyTagG = new THREE.Group();
    keyTagG.position.set(-0.27, 0.91, 0.46);
    cock.add(keyTagG);
    cyl(0.008, 0.008, 0.018, chromeTrimM, 0, 0, 0, keyTagG, Math.PI / 2, 0);
    box(0.014, 0.038, 0.004, woodTrimM, 0, -0.024, -0.006, keyTagG);
    ball(0.007, pm2(0xd9534f), 0, -0.048, -0.006, keyTagG);

    // --- 5. คอนโซลกลาง: ช่องแอร์ วิทยุเทปวินเทจเรืองแสงอบอุ่นพร้อมเข็มคลื่น & โน้ตดนตรีลอย เกียร์ และที่วางแก้ว ---
    // ช่องแอร์คู่กลางพร้อมขอบโครเมียมและครีบปรับทิศทางลม
    box(0.28, 0.055, 0.02, dkM, 0.02, 0.95, 0.49, cock);
    box(0.11, 0.038, 0.024, chromeTrimM, -0.045, 0.95, 0.488, cock);
    box(0.11, 0.038, 0.024, chromeTrimM, 0.085, 0.95, 0.488, cock);
    // วิทยุคลาสสิกพร้อมหน้าปัดคลื่นวิทยุสีเหลืองอำพัน (Warm Amber Dial) + เข็มแดงเลื่อนตามสถานี
    const radioPropG = new THREE.Group();
    radioPropG.position.set(0.02, 0.875, 0.49);
    cock.add(radioPropG);
    radioPropG.userData.isRadio = true;

    const radioHitBox = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.25, 0.25), new THREE.MeshBasicMaterial({ visible: false }));
    radioPropG.add(radioHitBox);
    window.radioGlow = amberGlowM;

    box(0.26, 0.075, 0.03, dkM, 0, 0, 0, radioPropG);
    box(0.15, 0.026, 0.034, amberGlowM, 0, 0.013, -0.002, radioPropG);
    // ขีดสเกลคลื่นวิทยุ + เข็มชี้คลื่นสีแดงที่ขยับตามสถานี
    for (let rk = -3; rk <= 3; rk++) {
      box(0.002, 0.012, 0.036, dkM, rk * 0.019, 0.013, -0.003, radioPropG);
    }
    const radioTuningNeedle = box(0.004, 0.024, 0.037, needleM, -0.045, 0.013, -0.004, radioPropG);
    window.radioTuningNeedle = radioTuningNeedle;
    box(0.11, 0.014, 0.034, chromeTrimM, 0, -0.019, -0.002, radioPropG);
    cyl(0.014, 0.014, 0.02, chromeTrimM, -0.1, 0, -0.01, radioPropG, Math.PI / 2, 0);
    cyl(0.014, 0.014, 0.02, chromeTrimM, 0.1, 0, -0.01, radioPropG, Math.PI / 2, 0);
    // โน้ตดนตรีเรืองแสงลอยพลิ้วออกจากลำโพงวิทยุเมื่อเปิดเพลง
    const radioNoteM = new THREE.MeshBasicMaterial({ color: 0xffe49e, transparent: true, opacity: 0.75 });
    const radioNotes = [];
    for (let ni = 0; ni < 3; ni++) {
      const ng = new THREE.Group();
      ball(0.007, radioNoteM, 0, 0, 0, ng, 1.2, 0.9, 0.8);
      box(0.0025, 0.022, 0.002, radioNoteM, 0.006, 0.011, 0, ng);
      box(0.009, 0.005, 0.002, radioNoteM, 0.01, 0.02, 0, ng).rotation.z = -0.35;
      ng.position.set(0.02, 0.90, 0.46);
      ng.visible = false;
      cock.add(ng);
      radioNotes.push({ g: ng, ph: ni * 2.1 });
    }
    // ปุ่มไฟฉุกเฉินสีแดง
    box(0.022, 0.022, 0.02, pm2(0xd94b38), 0.18, 0.95, 0.49, cock);

    // คอนโซลเกียร์ด้านล่าง + ถุงเกียร์หนัง + หัวเกียร์ไม้สัก
    box(0.26, 0.24, 0.68, dkM, 0.02, 0.42, 0.22, cock);
    box(0.22, 0.02, 0.62, woodTrimM, 0.02, 0.545, 0.22, cock);
    cyl(0.045, 0.068, 0.08, cM, 0.0, 0.59, 0.34, cock);
    cyl(0.008, 0.008, 0.18, chromeTrimM, 0.0, 0.68, 0.32, cock, -0.22, 0);
    ball(0.028, woodTrimM, 0.0, 0.77, 0.30, cock);
    // ด้ามเบรกมือ
    cyl(0.012, 0.014, 0.20, dkM, 0.08, 0.59, 0.08, cock, 1.15, 0);

    // --- 6. พร็อพตกแต่งสร้างบรรยากาศผ่อนคลาย (Cozy Chiang Rai Road-Trip) ---
    // (6.1) แก้วกาแฟดริป/มัทฉะเชียงรายบนคอนโซล + ไอความร้อนลอยกรุ่น + แตะเพื่อยกจิบได้!
    const cupG = new THREE.Group();
    cupG.position.set(0.18, 0.99, 0.63);
    cupG.userData.isCoffee = true;
    cock.add(cupG);
    const cupHit = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.22, 0.16), new THREE.MeshBasicMaterial({ visible: false }));
    cupHit.position.y = 0.08;
    cupG.add(cupHit);
    cyl(0.036, 0.032, 0.025, dkM, 0, 0.01, 0, cupG); // ฐานรองแก้ว
    const cupLiftG = new THREE.Group();
    cupG.add(cupLiftG);
    cyl(0.033, 0.025, 0.095, creamTrimM, 0, 0.055, 0, cupLiftG); // ตัวแก้วคราฟต์
    cyl(0.034, 0.029, 0.038, woodTrimM, 0, 0.058, 0, cupLiftG); // ปลอกสวมแก้วไม้สัก
    ball(0.032, pm2(0xdff2ec), 0, 0.102, 0, cupLiftG, 1, 0.65, 1); // ฝาโดม
    cyl(0.004, 0.004, 0.075, pm2(0x4ea874), 0.006, 0.128, -0.004, cupLiftG, 0.18, -0.15); // หลอดสีเขียว
    let coffeeSipTimer = 0,
      coffeeSipIdx = 0;
    const coffeeMsgs = [
      svgInline('coffee') + ' จิบกาแฟดริปดอยช้างหอมกรุ่น… สดชื่นตาสว่างเลย',
      svgInline('leaf') + ' จิบมัทฉะไร่ชาเชียงรายหอมละมุน… ขับรถเพลินสุดๆ',
      svgInline('coffee') + ' จิบชาพีชน้ำผึ้งป่าเดือนห้า… หอมหวานชื่นใจ'
    ];
    window.sipCoffee = function () {
      coffeeSipTimer = 1.2;
      if (typeof tone === 'function') {
        tone(587.33, 0.07, 0.025, 'sine');
        setTimeout(() => tone(783.99, 0.09, 0.03, 'sine'), 80);
      }
      toast(coffeeMsgs[coffeeSipIdx % coffeeMsgs.length]);
      coffeeSipIdx++;
    };

    // (6.2) กระถางต้นไม้มงคลจิ๋วหน้ารถ (ขยับใบดุ๊กดิ๊กเบาๆ ตามจังหวะรถ)
    const dashPlantG = new THREE.Group();
    dashPlantG.position.set(0.03, 1.015, 0.71);
    cock.add(dashPlantG);
    cyl(0.036, 0.036, 0.006, woodTrimM, 0, 0.003, 0, dashPlantG); // แผ่นไม้รองกระถาง
    cyl(0.028, 0.021, 0.042, pm2(0xd98a6c), 0, 0.024, 0, dashPlantG); // กระถางดินเผาพาสเทล
    cyl(0.026, 0.026, 0.008, dkWoodM, 0, 0.043, 0, dashPlantG); // ดิน
    const plantLeavesG = new THREE.Group();
    plantLeavesG.position.set(0, 0.046, 0);
    dashPlantG.add(plantLeavesG);
    ball(0.022, pm2(0x5da66b), 0, 0.012, 0, plantLeavesG, 1.1, 0.7, 1.1);
    ball(0.015, pm2(0x78c285), -0.016, 0.024, 0.006, plantLeavesG, 1.2, 0.6, 0.9);
    ball(0.015, pm2(0x78c285), 0.016, 0.024, -0.005, plantLeavesG, 1.2, 0.6, 0.9);
    ball(0.012, pm2(0x96db9b), 0, 0.032, 0, plantLeavesG);

    // (6.3) สมุดบันทึกเดินทาง & กล้องฟิล์มวินเทจ (วางบนคอนโซลให้เห็นชัดเจน กดถ่ายรูปได้ง่าย)
    const bookG = new THREE.Group();
    bookG.position.set(0.38, 1.022, 0.71);
    bookG.rotation.y = 0.28;
    cock.add(bookG);
    box(0.15, 0.022, 0.20, pm2(0x8c4a32), 0, 0.011, 0, bookG);
    box(0.142, 0.018, 0.192, creamTrimM, 0.003, 0.011, 0, bookG);
    box(0.018, 0.024, 0.202, pm2(0xd9534f), -0.03, 0.011, 0, bookG);

    const camPropG = new THREE.Group();
    camPropG.position.set(-0.35, 1.07, 0.60);
    camPropG.rotation.y = -0.35;
    cock.add(camPropG);
    camPropG.userData.isCamera = true;

    const camHitBox = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.22, 0.24), new THREE.MeshBasicMaterial({ visible: false }));
    camHitBox.position.y = 0.045;
    camPropG.add(camHitBox);

    box(0.095, 0.052, 0.042, dkM, 0, 0.026, 0, camPropG);
    box(0.096, 0.016, 0.043, chromeTrimM, 0, 0.046, 0, camPropG);
    cyl(0.009, 0.009, 0.012, pm2(0xd94b38), -0.032, 0.056, 0.005, camPropG); // ปุ่มชัตเตอร์สีแดงวินเทจ
    cyl(0.022, 0.022, 0.028, chromeTrimM, 0, 0.025, -0.028, camPropG, Math.PI / 2, 0);
    cyl(0.017, 0.017, 0.03, glassMirM, 0, 0.025, -0.029, camPropG, Math.PI / 2, 0);

    // --- 7. โครงหลังคา ที่บังแดดพับได้ กระจกมองหลังสะท้อนท้องฟ้าจริง + พวงมาลัยดอกมะลิ & ตุงใยแมงมุมล้านนา ---
    const roofM = pm2(0xe9e1c8),
      rubberSealM = pm2(0x1e2623);
    // ขอบหลังคาด้านหน้าและขอบยางซีลกระจกหน้าช่วยให้รู้สึกเหมือนอยู่ในห้องโดยสารที่มีกระจกหน้าใสกริ๊บ
    box(1.82, 0.08, 0.20, roofM, 0, 1.70, 0.60, cock);
    box(1.74, 0.016, 0.022, rubberSealM, 0, 1.655, 0.69, cock);
    box(1.72, 0.014, 0.022, rubberSealM, 0, 1.015, 0.94, cock);
    box(1.82, 0.04, 1.55, roofM, 0, 1.74, -0.18, cock);

    // แผงบังแดดพับขึ้น-ลงได้เมื่อแตะ (Interactive Sun Visors)
    const visorPivots = [];
    let visorDown = false;
    for (const s of [-1, 1]) {
      const vp = new THREE.Group();
      vp.position.set(s * 0.42, 1.655, 0.58);
      vp.rotation.x = 0.12;
      vp.userData.isVisor = true;
      cock.add(vp);
      const vHit = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.14, 0.24), new THREE.MeshBasicMaterial({ visible: false }));
      vHit.position.set(0, -0.02, -0.06);
      vp.add(vHit);
      box(0.38, 0.02, 0.16, pm2(0xd8ceb4), 0, 0, -0.07, vp);
      if (s === 1) box(0.14, 0.004, 0.08, glassMirM, 0, -0.011, -0.07, vp); // กระจกแต่งหน้าฝั่งคนนั่ง
      visorPivots.push(vp);

      // เสา A-Pillar ขยับถ่างออกด้านข้าง (x = ±0.86) พร้อมขอบยางกระจกและหูช้างระบายลมคลาสสิก
      const ap = box(0.052, 0.82, 0.058, creamTrimM, s * 0.86, 1.32, 0.68, cock);
      ap.rotation.x = -0.36;
      ap.rotation.z = s * 0.08;
      const apSeal = box(0.018, 0.82, 0.062, rubberSealM, s * 0.835, 1.32, 0.68, cock);
      apSeal.rotation.x = -0.36;
      apSeal.rotation.z = s * 0.08;

      // กระจกมองข้างซ้าย-ขวาสไตล์วินเทจโครเมียม
      const wmG = new THREE.Group();
      wmG.position.set(s * 0.92, 1.06, 0.72);
      cock.add(wmG);
      cyl(0.008, 0.008, 0.09, chromeTrimM, -s * 0.03, -0.02, 0, wmG, 0, s * 0.7);
      cyl(0.055, 0.05, 0.022, chromeTrimM, 0, 0.01, 0, wmG, Math.PI / 2, s * -0.25);
      cyl(0.048, 0.048, 0.024, glassMirM, -s * 0.002, 0.01, -0.003, wmG, Math.PI / 2, s * -0.25);
    }
    window.toggleSunVisor = function () {
      visorDown = !visorDown;
      if (typeof tone === 'function') tone(visorDown ? 320 : 420, 0.05, 0.02, 'sine');
      toast(visorDown ? svgInline('visor') + ' พับที่บังแดดลง · กรองแสงแดดอ่อนๆ สบายตา' : svgInline('sun') + ' พับที่บังแดดเก็บขึ้น · เปิดมุมมองท้องฟ้ากว้างเต็มตา');
    };

    // กระจกมองหลังกลางรถสะท้อนสีท้องฟ้า/ทิวเขาด้านหลังแบบไดนามิก + พวงมาลัยดอกมะลิ & ตุงใยแมงมุมล้านนา
    const rearMirCv = document.createElement('canvas');
    rearMirCv.width = 128;
    rearMirCv.height = 36;
    const rearMirCtx = rearMirCv.getContext('2d');
    const rearMirTex = new THREE.CanvasTexture(rearMirCv);
    rearMirTex.colorSpace = THREE.SRGBColorSpace;
    const rearMirLiveM = new THREE.MeshBasicMaterial({ map: rearMirTex });
    let lastMirUpdate = -1;
    const updateRearMirrorTex = () => {
      const g = rearMirCtx.createLinearGradient(0, 0, 0, 36);
      const skyHex = '#' + scene.background.getHexString();
      const gndHex = '#' + groundMat.color.getHexString();
      g.addColorStop(0, skyHex);
      g.addColorStop(0.58, '#' + desiredFar.getHexString());
      g.addColorStop(0.62, gndHex);
      g.addColorStop(1, state.night ? '#1c2623' : '#586259');
      rearMirCtx.fillStyle = g;
      rearMirCtx.fillRect(0, 0, 128, 36);
      // เส้นถนนทอดยาวด้านหลังในกระจกมองหลัง
      rearMirCtx.fillStyle = state.night ? '#3a4642' : '#7c8578';
      rearMirCtx.beginPath();
      rearMirCtx.moveTo(58, 22);
      rearMirCtx.lineTo(70, 22);
      rearMirCtx.lineTo(94, 36);
      rearMirCtx.lineTo(34, 36);
      rearMirCtx.closePath();
      rearMirCtx.fill();
      rearMirTex.needsUpdate = true;
    };

    cyl(0.008, 0.008, 0.09, chromeTrimM, 0, 1.63, 0.56, cock);
    box(0.24, 0.062, 0.018, dkM, 0, 1.58, 0.54, cock);
    const mirFace = new THREE.Mesh(new THREE.PlaneGeometry(0.222, 0.048), rearMirLiveM);
    mirFace.position.set(0, 1.58, 0.529);
    mirFace.rotation.y = Math.PI;
    cock.add(mirFace);

    const garlandG = new THREE.Group();
    garlandG.position.set(0, 1.57, 0.545);
    cock.add(garlandG);
    cyl(0.002, 0.002, 0.06, creamTrimM, 0, -0.03, 0, garlandG);
    const jasmineM = pm2(0xfcfaf2),
      roseM = pm2(0xe86f5c),
      calyxM = pm2(0x5ca668),
      tungGoldM = pm2(0xf2c14e),
      tungTealM = pm2(0x4ea898);
    const gRing = new THREE.Mesh(new THREE.TorusGeometry(0.036, 0.009, 8, 20), jasmineM);
    gRing.position.set(0, -0.085, 0);
    garlandG.add(gRing);
    for (const dx of [-0.016, 0, 0.016]) {
      const dy = dx === 0 ? -0.145 : -0.135;
      cyl(0.0015, 0.0015, 0.025, creamTrimM, dx, dy + 0.012, 0, garlandG);
      ball(0.006, calyxM, dx, dy + 0.005, 0, garlandG);
      ball(0.009, roseM, dx, dy - 0.004, 0, garlandG, 0.9, 1.2, 0.9);
    }
    // ตุงใยแมงมุมล้านนาจิ๋วมงคลห้อยคู่พวงมาลัยดอกมะลิ
    const tungG = new THREE.Group();
    tungG.position.set(0.052, -0.075, 0);
    garlandG.add(tungG);
    cyl(0.0012, 0.0012, 0.07, creamTrimM, 0, 0.035, 0, tungG);
    box(0.028, 0.028, 0.003, tungGoldM, 0, 0, 0, tungG).rotation.z = Math.PI / 4;
    box(0.018, 0.018, 0.004, tungTealM, 0, 0, 0, tungG).rotation.z = Math.PI / 4;
    box(0.008, 0.008, 0.005, roseM, 0, 0, 0, tungG).rotation.z = Math.PI / 4;
    ball(0.005, roseM, 0, -0.026, 0, tungG, 0.8, 1.5, 0.8);

    // --- 8. พื้นห้องโดยสาร แผงประตูไม้สัก และเบาะหนังทูโทนพร้อมพนักพิงศีรษะ ---
    const floorM = pm2(0x3a4842);
    box(1.72, 0.05, 1.75, floorM, 0, 0.3, 0.1, cock);
    box(0.58, 0.012, 0.55, dkWoodM, -0.35, 0.33, 0.42, cock);
    box(0.58, 0.012, 0.55, dkWoodM, 0.42, 0.33, 0.42, cock);
    for (const s of [-1, 1]) {
      box(0.06, 0.58, 1.65, dkM, s * 0.87, 0.6, 0.1, cock);
      box(0.068, 0.07, 1.45, woodTrimM, s * 0.86, 0.82, 0.12, cock);
      box(0.09, 0.045, 0.38, leatherTanM, s * 0.83, 0.68, 0.12, cock);
      cyl(0.008, 0.008, 0.04, chromeTrimM, s * 0.83, 0.74, 0.42, cock, 0, Math.PI / 2);
    }
    for (const sx of [-0.36, 0.40]) {
      box(0.52, 0.14, 0.52, leatherTanM, sx, 0.48, -0.32, cock);
      box(0.54, 0.16, 0.10, leatherBolsterM, sx, 0.50, -0.10, cock);
      box(0.52, 0.72, 0.12, leatherTanM, sx, 0.90, -0.60, cock).rotation.x = -0.12;
      box(0.28, 0.18, 0.09, leatherBolsterM, sx, 1.34, -0.66, cock);
    }
    for (const x of [-0.28, -0.42]) box(0.075, 0.18, 0.025, dkM, x, 0.4, 0.76, cock).rotation.x = 0.5;

    // ===== ฟังก์ชันเสริมที่ 4: แมวน้อยนอนหลับบนเบาะผ้าทอล้านนาข้างคนขับ + หัวใจลอยเมื่อลูบหัว =====
    const catGrp = new THREE.Group();
    catGrp.position.set(0.12, 0.68, -0.15);
    catGrp.rotation.y = -0.2;
    cock.add(catGrp);
    catGrp.userData.isCat = true;

    const catHitBox = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.32, 0.32), new THREE.MeshBasicMaterial({ visible: false }));
    catHitBox.position.y = 0.08;
    catGrp.add(catHitBox);

    // เบาะผ้าทอล้านนาสีคราม-แดงรองรับน้องแมว
    box(0.28, 0.024, 0.28, pm2(0x36526d), 0, -0.015, 0.01, catGrp);
    box(0.26, 0.026, 0.04, pm2(0xc8553d), 0, -0.014, 0.11, catGrp);
    box(0.26, 0.026, 0.04, pm2(0xe6b84d), 0, -0.014, -0.09, catGrp);

    const catM = pm2(0xcc7733),
      catStripeM = pm2(0x9e521b),
      catWhiteM = pm2(0xffffff),
      catNoseM = pm2(0xff99aa);

    const catBody = new THREE.Mesh(new THREE.SphereGeometry(0.12, 14, 12), catM);
    catBody.scale.set(1.2, 0.75, 1);
    catBody.position.set(0, 0.05, 0);
    catGrp.add(catBody);
    // ลายสลิดบนหลังแมว + อุ้งเท้าขาวคู่หน้า
    ball(0.04, catStripeM, 0.02, 0.105, -0.02, catGrp, 0.4, 0.2, 1.8);
    ball(0.04, catStripeM, 0.05, 0.10, 0.02, catGrp, 0.4, 0.2, 1.6);
    ball(0.024, catWhiteM, -0.12, 0.015, 0.09, catGrp, 1.1, 0.6, 1.3);
    ball(0.024, catWhiteM, -0.06, 0.015, 0.12, catGrp, 1.1, 0.6, 1.3);

    const catHeadGrp = new THREE.Group();
    catHeadGrp.position.set(-0.09, 0.08, 0.08);
    catHeadGrp.rotation.z = 0.2;
    catHeadGrp.rotation.x = 0.2;
    catGrp.add(catHeadGrp);

    ball(0.075, catM, 0, 0, 0, catHeadGrp);
    ball(0.045, catWhiteM, 0, -0.02, 0.05, catHeadGrp, 1, 0.8, 1);
    ball(0.01, catNoseM, 0, 0.01, 0.08, catHeadGrp);
    // ตาหลับพริ้มสองข้าง
    for (const sx of [-0.026, 0.026]) {
      box(0.018, 0.004, 0.004, dkWoodM, sx, 0.018, 0.072, catHeadGrp).rotation.z = sx > 0 ? -0.15 : 0.15;
    }

    const earGeo = new THREE.ConeGeometry(0.025, 0.045, 4);
    const earL = new THREE.Mesh(earGeo, catM);
    earL.position.set(-0.04, 0.06, 0);
    earL.rotation.z = 0.4;
    const earR = new THREE.Mesh(earGeo, catM);
    earR.position.set(0.04, 0.06, 0);
    earR.rotation.z = -0.4;
    catHeadGrp.add(earL, earR);

    const tailGeo = new THREE.CylinderGeometry(0.015, 0.025, 0.18, 8);
    const tail = new THREE.Mesh(tailGeo, catM);
    tail.position.set(0.11, 0.03, 0.08);
    tail.rotation.x = Math.PI / 2;
    tail.rotation.z = -0.6;
    catGrp.add(tail);

    // หัวใจสีชมพูลอยขึ้นเหนือหัวน้องแมวเวลาลูบหัว
    const catHeartG = new THREE.Group();
    catHeartG.position.set(-0.05, 0.18, 0.05);
    catHeartG.visible = false;
    catGrp.add(catHeartG);
    ball(0.016, catNoseM, -0.01, 0.01, 0, catHeartG);
    ball(0.016, catNoseM, 0.01, 0.01, 0, catHeartG);
    const heartBot = new THREE.Mesh(new THREE.ConeGeometry(0.022, 0.028, 8), catNoseM);
    heartBot.position.set(0, -0.006, 0);
    heartBot.rotation.x = Math.PI;
    catHeartG.add(heartBot);
    let catHeartTimer = 0;

    window.sleepingCat = { body: catBody, head: catHeadGrp, tail, earR, heart: catHeartG };

    function playCatPurr() {
      catHeartTimer = 1.6;
      if (typeof tone === 'function') {
        for (let i = 0; i < 14; i++) {
          tone(65 + Math.random() * 15, 0.05, 0.025, 'sawtooth', i * 0.08, true);
        }
      }
      toast(svgInline('cat') + ' งื้มมม… น้องแมวครางในลำคออย่างมีความสุข ' + svgInline('heart'));
      if (window.sleepingCat) window.sleepingCat.tail.rotation.x = Math.PI / 2 + 0.65;
    }
    window.playCatPurr = playCatPurr;
    // ====================================================

    // --- 9. ใบปัดน้ำฝนคู่หน้า & ระบบไฟอบอุ่นในห้องโดยสาร (Cabin & Footwell Warm Glow) ---
    const wips = [];
    for (const x of [-0.58, -0.06]) {
      const wg = new THREE.Group();
      wg.position.set(x, 0.98, 0.93);
      wg.rotation.x = -0.72;
      cock.add(wg);
      const pv = new THREE.Group();
      wg.add(pv);
      box(0.018, 0.48, 0.012, wipM, 0, 0.24, 0, pv);
      pv.rotation.z = -1.35;
      wips.push(pv);
    }
    scene.add(sunLight.target);
    // ไฟส่องสว่างโทนอุ่นนุ่มนวลในห้องโดยสารและไฟส่องเท้า (Footwell Warm Glow) ยามเย็นและค่ำคืน
    const dashL = new THREE.PointLight(0xffcf96, 0, 2.4, 1.5);
    dashL.position.set(-0.08, 1.38, 0.32);
    cock.add(dashL);
    const footL = new THREE.PointLight(0xffb870, 0, 1.4, 1.8);
    footL.position.set(-0.15, 0.52, 0.48);
    cock.add(footL);
    const headL = new THREE.SpotLight(0xfff0c8, 0, 34, 0.5, 0.7, 1);
    scene.add(headL, headL.target);

    /* ============================================================================
     * src/scene/30-windshield-fx.js
     * เอฟเฟกต์กลางวัน/กลางคืน ไฟ ปัดน้ำฝน และหยดน้ำฝนบนกระจก (fx)
     * (ไฟล์นี้ถูกต่อรวมเป็น closure เดียวกับไฟล์อื่น — ไม่ต้อง import/export · ลำดับไฟล์ดู build.config.mjs)
     * ========================================================================== */

    const dc = document.createElement('canvas');
    dc.className = 'drops';
    host.appendChild(dc);
    const dctx = dc.getContext('2d'),
      drops = [];
    let nl = 0,
      dacc = 0,
      lastPh = 0;
    function fx(dt) {
      nl += ((state.night ? 1 : 0) - nl) * Math.min(1, dt * 2);
      winM.emissiveIntensity = nl * 1.4;
      lampM.emissiveIntensity = 0.6 + nl * 2.5; // เพิ่มความสว่างดวงไฟหน้ารถสวน
      tailM.emissiveIntensity = 0.4 + nl * 1.8; // เพิ่มความสว่างดวงไฟท้ายรถสวน
      fireflies();
      roadsideWildlife();
      dandelions(dt);
      headL.intensity = 18 * nl;
      // แอนิเมชันดาวตก
      if (ssData && ssData.active) {
          ssData.t += dt;
          const prog = ssData.t / 1.1; // ความเร็วดาวตก (1.1 วินาที)
          if (prog >= 1) {
              ssData.active = false;
              shootingStar.material.opacity = 0;
          } else {
              shootingStar.position.x = ssData.sx + (ssData.ex - ssData.sx) * prog;
              shootingStar.position.y = ssData.sy + (ssData.ey - ssData.sy) * prog;
              shootingStar.position.z = ssData.sz + (ssData.ez - ssData.sz) * prog;
              // ค่อยๆ สว่างขึ้นตรงกลางแล้วจางหายไปตอนปลาย
              shootingStar.material.opacity = Math.sin(prog * Math.PI) * 0.95;
          }
      }
      const duskGlow = (!state.night && (state.tod === 'evening' || state.tod === 'morning')) ? 0.35 : 0;
      dashL.intensity = cockpit ? (nl * 0.55 + duskGlow * 0.28) : 0;
      footL.intensity = cockpit ? (nl * 0.35 + duskGlow * 0.18) : 0;
      gaugeM.emissiveIntensity = 0.22 + nl * 0.85 + duskGlow * 0.35;
      if (typeof tempGaugeM !== 'undefined') tempGaugeM.emissiveIntensity = 0.22 + nl * 0.85 + duskGlow * 0.35;
      if (typeof fuelGaugeM !== 'undefined') fuelGaugeM.emissiveIntensity = 0.22 + nl * 0.85 + duskGlow * 0.35;
      amberGlowM.emissiveIntensity = 0.22 + nl * 1.15 + duskGlow * 0.45;
      if (nl > 0.01) {
        const th = car.rotation.y,
          sn = Math.sin(th),
          cs = Math.cos(th);
        headL.position.set(car.position.x + sn * 1.7, 0.85, car.position.z + cs * 1.7);
        headL.target.position.set(car.position.x + sn * 16, 0, car.position.z + cs * 16);
      }
      const rain = cockpit && wRain > 0.08,
        ph = (totalTime % 2.4) / 2.4,
        e = u => u * u * (3 - 2 * u),
        ang = rain ? (ph < 0.5 ? -1.35 + 1.2 * e(ph * 2) : -0.15 - 1.2 * e((ph - 0.5) * 2)) : -1.35;
      wips.forEach(p => (p.rotation.z += (ang - p.rotation.z) * Math.min(1, dt * 10)));
      dc.style.display = cockpit ? 'block' : 'none';

      // อัปเดตกระจกมองหลังแบบไดนามิกตามเวลาและสภาพแวดล้อม
      if (cockpit && typeof updateRearMirrorTex === 'function') {
        window._rearMirAcc = (window._rearMirAcc || 0) + dt;
        if (window._rearMirAcc > 0.35) {
          window._rearMirAcc = 0;
          updateRearMirrorTex();
        }
      }

      // แอนิเมชันที่บังแดด (Sun Visors) พับขึ้น-ลงสมูท
      if (cockpit && typeof visorPivots !== 'undefined') {
        const targetVisorRot = visorDown ? -1.18 : 0.12;
        for (let i = 0; i < visorPivots.length; i++) {
          visorPivots[i].rotation.x += (targetVisorRot - visorPivots[i].rotation.x) * Math.min(1, dt * 8);
        }
      }

      // แอนิเมชันจิบกาแฟ/มัทฉะ
      if (cockpit && typeof cupLiftG !== 'undefined') {
        if (coffeeSipTimer > 0) {
          coffeeSipTimer = Math.max(0, coffeeSipTimer - dt);
          const sProg = Math.sin((1 - coffeeSipTimer / 1.2) * Math.PI);
          cupLiftG.position.y = sProg * 0.11;
          cupLiftG.position.z = -sProg * 0.09;
          cupLiftG.rotation.x = -sProg * 0.42;
        } else {
          cupLiftG.position.y *= 0.85;
          cupLiftG.position.z *= 0.85;
          cupLiftG.rotation.x *= 0.85;
        }
      }

      // แอนิเมชันวิทยุวินเทจ: เข็มคลื่นวิทยุและตัวโน้ตลอยเมื่อเปิดเพลง
      if (cockpit && window.radioTuningNeedle) {
        const musicActive = typeof mOn !== 'undefined' && mOn;
        const targetX = musicActive ? -0.02 + Math.sin(totalTime * 0.45) * 0.045 : -0.045;
        window.radioTuningNeedle.position.x += (targetX - window.radioTuningNeedle.position.x) * Math.min(1, dt * 3);
        if (typeof radioNotes !== 'undefined') {
          for (let i = 0; i < radioNotes.length; i++) {
            const rn = radioNotes[i];
            if (!rn || !rn.g) continue;
            if (musicActive) {
              rn.g.visible = true;
              const nt = (totalTime * 0.55 + rn.ph * 0.33) % 1;
              rn.g.position.y = 0.90 + nt * 0.11;
              rn.g.position.x = 0.02 + (i - 1) * 0.035 + Math.sin(totalTime * 3 + i * 1.7) * 0.014;
              rn.g.rotation.z = Math.sin(totalTime * 4 + i) * 0.25;
              rn.g.scale.setScalar(Math.sin(nt * Math.PI));
            } else {
              rn.g.visible = false;
            }
          }
        }
      }

      // แอนิเมชันน้องแมวหายใจยุบพอง + หัวใจสีชมพูลอยเมื่อลูบหัว
      if (cockpit && window.sleepingCat) {
        const breath = Math.sin(totalTime * 2.5);
        window.sleepingCat.body.scale.set(1.2 + breath * 0.015, 0.75 + breath * 0.035, 1.0 + breath * 0.015);
        window.sleepingCat.head.rotation.z = 0.2 + breath * 0.01;
        window.sleepingCat.tail.rotation.x += (Math.PI / 2 - window.sleepingCat.tail.rotation.x) * (dt * 4);
        if (window.sleepingCat.heart) {
          if (catHeartTimer > 0) {
            catHeartTimer = Math.max(0, catHeartTimer - dt);
            window.sleepingCat.heart.visible = true;
            const hProg = 1 - catHeartTimer / 1.6;
            window.sleepingCat.heart.position.y = 0.16 + hProg * 0.12;
            window.sleepingCat.heart.rotation.y = Math.sin(totalTime * 6) * 0.35;
            const sc = Math.sin(Math.min(1, hProg * 2.5) * Math.PI * 0.5) * (1 - Math.max(0, (hProg - 0.65) / 0.35));
            window.sleepingCat.heart.scale.setScalar(Math.max(0.01, sc));
          } else {
            window.sleepingCat.heart.visible = false;
          }
        }
      }

      // แอนิเมชันเข็มไมล์ความเร็ว (สอดคล้องกับหน้าปัด 0-120 KM/H)
      if (cockpit && window.speedNeedleG) {
        const actualSpeed = typeof speedMul !== 'undefined'
          ? (window._schoolCrossingStopped ? 0 : speedMul * (window._playerBrake !== undefined ? window._playerBrake : 1) * (window._playerBoost !== undefined ? window._playerBoost : 1))
          : 0;
        const targetNeedleAngle = -2.15 + Math.min(actualSpeed / 28, 1) * 3.8 + Math.sin(totalTime * 5.2) * 0.012;
        window.speedNeedleG.rotation.z += (targetNeedleAngle - window.speedNeedleG.rotation.z) * Math.min(1, dt * 4.5);
      }

      if (!cockpit) {
        drops.length = 0;
        return;
      }
      const w = Math.round(host.clientWidth / 2),
        h = Math.round(host.clientHeight / 2);
      if (dc.width !== w || dc.height !== h) {
        dc.width = w;
        dc.height = h;
      }
      if (rain && !state.reduced) {
        dacc += dt * wRain * 28;
        while (dacc > 1 && drops.length < 110) {
          dacc--;
          drops.push({
            x: Math.random() * w,
            y: Math.random() * h * 0.6,
            r: 1 + Math.random() * 2.4,
            v: Math.random() < 0.3 ? 4 + Math.random() * 10 : 0
          });
        }
      }
      if (rain && ((lastPh < 0.25 && ph >= 0.25) || (lastPh < 0.75 && ph >= 0.75))) drops.length = 0;
      lastPh = ph;
      dctx.clearRect(0, 0, w, h);
      for (const d of drops) {
        d.y += d.v * dt;
        dctx.beginPath();
        dctx.fillStyle = 'rgba(235,245,250,.35)';
        dctx.arc(d.x, d.y, d.r, 0, 6.3);
        dctx.fill();
        dctx.strokeStyle = 'rgba(90,120,130,.45)';
        dctx.lineWidth = 0.8;
        dctx.stroke();
        if (d.v) {
          dctx.beginPath();
          dctx.moveTo(d.x, d.y - d.r);
          dctx.lineTo(d.x, d.y - d.r - d.v * 0.5);
          dctx.stroke();
        }
      }
      if (!rain && drops.length) drops.splice(0, 2);
    }

    /* ============================================================================
     * src/scene/31-cockpit-engine-sound.js
     * ตัวแปรมุมมองคนขับ และเสียงเครื่องยนต์ (engineOn)
     * (ไฟล์นี้ถูกต่อรวมเป็น closure เดียวกับไฟล์อื่น — ไม่ต้อง import/export · ลำดับไฟล์ดู build.config.mjs)
     * ========================================================================== */

    let cockpit = false,
      fovC = 72,
      pitch = 0,
      ly = 0,
      dirT = 1,
      turn = 0;
    let eCtx = null,
      eOsc = null,
      eG = null,
      tireNoise = null,
      tireFlt = null,
      tireGain = null;

    // ยกเลิกฟังก์ชันสร้างเสียงขับรถทั้งหมด
    function engineOn(on) {
      return; 
    }

    /* ============================================================================
     * src/scene/32-rain-weather.js
     * อนุภาคฝนและการเปลี่ยนอากาศ (updateWeather)
     * (ไฟล์นี้ถูกต่อรวมเป็น closure เดียวกับไฟล์อื่น — ไม่ต้อง import/export · ลำดับไฟล์ดู build.config.mjs)
     * ========================================================================== */

    const RN = 420,
      rainGeo = new THREE.BufferGeometry(),
      rp = new Float32Array(RN * 6);
    for (let i = 0; i < RN; i++) {
      const x = (Math.random() - 0.5) * 36,
        y = Math.random() * 16,
        z = (Math.random() - 0.5) * 36;
      rp.set([x, y, z, x, y - 0.7, z], i * 6);
    }
    rainGeo.setAttribute('position', new THREE.BufferAttribute(rp, 3));
    const rainMat = new THREE.LineBasicMaterial({ color: 0xcfe3ee, transparent: true, opacity: 0 }),
      rain = new THREE.LineSegments(rainGeo, rainMat);
    rain.frustumCulled = false;
    rain.visible = false;
    scene.add(rain);
    // --- ระบบอนุภาคละอองลอยและใบไม้ (Drifting Particles) ---
    const PN = 40;
    const pGeo = new THREE.BufferGeometry();
    const pPos = new Float32Array(PN * 3);
    const pVel = [];
    for (let i = 0; i < PN; i++) {
      pPos[i*3] = (Math.random() - 0.5) * 40;
      pPos[i*3+1] = Math.random() * 8;
      pPos[i*3+2] = (Math.random() - 0.5) * 40;
      pVel.push({ x: (Math.random()-0.5)*0.5, y: -0.1 - Math.random()*0.2, z: (Math.random()-0.5)*0.5 });
    }
    pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
    const driftMat = new THREE.PointsMaterial({
      color: 0xddccaa, size: 0.12, transparent: true, opacity: 0.4, depthWrite: false
    });
    const driftPts = new THREE.Points(pGeo, driftMat);
    driftPts.frustumCulled = false;
    scene.add(driftPts);
    let wRain = 0,
      wFog = 0;
    const WX = { happy: [0, 0], calm: [0, 0], tired: [0, 0.8], sad: [1, 0.4], hope: [0, 0.25] };
    function updateWeather(dt) {
      const w = [WXR.rain, WXR.fog];
      wRain += (w[0] - wRain) * Math.min(1, dt * 0.8);
      wFog += (w[1] - wFog) * Math.min(1, dt * 0.8);
      rain.visible = wRain > 0.02;
      rainMat.opacity = 0.55 * wRain;
      scene.fog.near = 32 - wFog * 24;
      scene.fog.far = 92 - wFog * 52;
      if (rain.visible) {
        rain.position.set(car.position.x, 0, car.position.z);
        for (let i = 0; i < RN; i++) {
          let y = rp[i * 6 + 1] - dt * 18;
          if (y < 0) y += 16;
          rp[i * 6 + 1] = y;
          rp[i * 6 + 4] = y - 0.7;
        }
        rainGeo.attributes.position.needsUpdate = true;
      }
      // อัปเดตละอองลอย (แหวกหลบรถ)
      // ข้ามการคำนวณและปิดแสดงผลทันที หากเปิดโหมด "ลดการเคลื่อนไหว" หรือ "ฝนตก"
      if (state.reduced || WXR.rain > 0.1) {
        driftPts.visible = false;
      } else {
        driftPts.visible = true;
        const pArr = pGeo.attributes.position.array;
        for(let i = 0; i < PN; i++) {
          let px = pArr[i*3], py = pArr[i*3+1], pz = pArr[i*3+2];
          let pv = pVel[i];
          px += pv.x * dt; py += pv.y * dt; pz += pv.z * dt;
          
          // เกิดใหม่เมื่อร่วงพื้นหรือไกลเกินไป
          if(py < 0 || Math.hypot(px - car.position.x, pz - car.position.z) > 25) {
            px = car.position.x + (Math.random() - 0.5) * 40;
            py = 5 + Math.random() * 4;
            pz = car.position.z + (Math.random() - 0.5) * 40;
            pv.x = (Math.random()-0.5)*0.5; pv.z = (Math.random()-0.5)*0.5;
          }
          
          // Wake Effect: แรงผลักจากหน้ารถ และกันไม่ให้ละอองลอยเข้ามาในห้องโดยสาร
          const dx = px - car.position.x;
          const dz = pz - car.position.z;
          const distSq = dx*dx + dz*dz;
          if (distSq < 7.5 && py < 2.4) {
             py = 3.2 + Math.random() * 2;
          } else if (distSq < 18 && py < 3.5) {
             const force = (18 - distSq) / 18;
             pv.x += dx * force * dt * 3;
             pv.z += dz * force * dt * 3;
             pv.y += force * dt * 1.5; // พัดฟุ้งขึ้น
          }
          pv.x *= 0.96; pv.z *= 0.96; // แรงต้านอากาศ
          pArr[i*3] = px; pArr[i*3+1] = py; pArr[i*3+2] = pz;
        }
        pGeo.attributes.position.needsUpdate = true;
        driftMat.opacity = (1 - WXR.rain) * 0.45;
      }
      pGeo.attributes.position.needsUpdate = true;
      driftMat.opacity = (1 - WXR.rain) * 0.45; // ซ่อนเมื่อฝนตก

      // --- อัปเดต Event สภาพอากาศและเวลาแบบจัดเต็ม ---
      if (window.dynamicEvents) {
          window.dynamicEvents.forEach(ev => {
              // เช็คเงื่อนไขการปรากฏ (กลางวัน/กลางคืน, ฝนตก/ไม่ตก)
              const isVisible = ev.condition(state, wRain, wFog);
              ev.group.visible = isVisible;
              
              // ถ้ามองเห็นได้และมีแอนิเมชันเฉพาะตัว ให้เล่นแอนิเมชันทันที
              if (isVisible && ev.update) {
                  ev.update(dt, totalTime);
              }
          });
      }
    }

    /* ============================================================================
     * src/scene/33-minimap.js
     * แผนที่เต็มจอแบบ Interactive (แสดงทุกจุด + จิ้มบนถนนเพื่อวาร์ปรถ)
     * ========================================================================== */

    const rmap = document.createElement('div');
    rmap.className = 'rmap off';
    rmap.innerHTML = `
      <div class="rmap-box" role="dialog" aria-modal="true" aria-label="แผนที่เส้นทางและการวาร์ป">
        <div class="rmap-head">
          <div>
            <h3>${svgIcon('map')} แผนที่การเดินทาง</h3>
            <p class="rmap-current" id="rmapCurrent">ตำแหน่งรถ · กำลังเตรียมแผนที่</p>
          </div>
          <div class="rmap-actions">
            <button type="button" class="rmap-view-btn" id="rmapLocateBtn">${svgIcon('pin')} ตำแหน่งรถ</button>
            <div class="rmap-zoom" role="group" aria-label="ควบคุมการซูมแผนที่">
              <button type="button" class="rmap-zoom-btn" data-map-zoom="out" aria-label="ซูมออก">−</button>
              <span class="rmap-zoom-level" aria-live="polite">100%</span>
              <button type="button" class="rmap-zoom-btn" data-map-zoom="in" aria-label="ซูมเข้า">+</button>
              <button type="button" class="rmap-zoom-reset">ทั้งเส้นทาง</button>
            </div>
            <button type="button" class="rmap-close" id="rmapCloseBtn">ปิดแผนที่ ✕</button>
          </div>
        </div>
        <canvas width="1000" height="750"></canvas>
        <p class="rmap-hint">${svgIcon('pin')} แตะถนนเพื่อย้ายรถ · ลากเพื่อเลื่อน · ใช้ล้อเมาส์หรือปุ่มเพื่อซูม</p>
        <div class="rmap-legend">
          <span><i class="lg-line" style="--map-color:#376951"></i>เส้นทางหลัก · 0–135 กม.</span>
          <span><i class="lg-line" style="--map-color:#b27b4f"></i>เส้นทางขึ้นดอย · 135–200 กม.</span>
          <span><i class="lg-line lg-village"></i>ชุมชนชนบท · 136–169 กม.</span>
          <span>${svgIcon('boat')}แม่น้ำ</span>
          <span>${svgIcon('school')}โรงเรียน</span>
          <span>${svgIcon('temple')}วัด</span>
          <span>${svgIcon('tent')}จุดแวะ</span>
        </div>
      </div>
    `;
    host.appendChild(rmap);

    const mapCanvas = rmap.querySelector('canvas');
    const mctx = mapCanvas.getContext('2d');
    const MW = 1000,
      MH = 750;
    const mapView = { scale: 1, x: 0, y: 0 };
    const mapZoomLevel = rmap.querySelector('.rmap-zoom-level');
    const mapCurrent = rmap.querySelector('#rmapCurrent');

    function clampMapView() {
      mapView.x = Math.min(0, Math.max(MW * (1 - mapView.scale), mapView.x));
      mapView.y = Math.min(0, Math.max(MH * (1 - mapView.scale), mapView.y));
    }

    function setMapZoom(scale, clientX, clientY) {
      const rect = mapCanvas.getBoundingClientRect();
      const anchorX = clientX === undefined ? MW / 2 : ((clientX - rect.left) / rect.width) * MW;
      const anchorY = clientY === undefined ? MH / 2 : ((clientY - rect.top) / rect.height) * MH;
      const worldX = (anchorX - mapView.x) / mapView.scale;
      const worldY = (anchorY - mapView.y) / mapView.scale;
      mapView.scale = Math.min(3.5, Math.max(1, scale));
      mapView.x = anchorX - worldX * mapView.scale;
      mapView.y = anchorY - worldY * mapView.scale;
      clampMapView();
      mapZoomLevel.textContent = `${Math.round(mapView.scale * 100)}%`;
      drawMini(true);
    }

    function focusMapAt(x, z, scale = 1.8) {
      if (!mapBox) buildMapBase();
      const [px, py] = mproj(x, z);
      mapView.scale = Math.min(3.5, Math.max(1, scale));
      mapView.x = MW / 2 - px * mapView.scale;
      mapView.y = MH / 2 - py * mapView.scale;
      clampMapView();
      mapZoomLevel.textContent = `${Math.round(mapView.scale * 100)}%`;
      drawMini(true);
    }

    rmap.querySelector('[data-map-zoom="in"]').addEventListener('click', () => setMapZoom(mapView.scale * 1.25));
    rmap.querySelector('[data-map-zoom="out"]').addEventListener('click', () => setMapZoom(mapView.scale / 1.25));
    rmap.querySelector('.rmap-zoom-reset').addEventListener('click', () => setMapZoom(1));
    rmap.querySelector('#rmapLocateBtn').addEventListener('click', () => focusMapAt(car.position.x, car.position.z));
    mapCanvas.addEventListener('wheel', e => {
      e.preventDefault();
      setMapZoom(mapView.scale * (e.deltaY < 0 ? 1.15 : 1 / 1.15), e.clientX, e.clientY);
    }, { passive: false });

    function toggleFullMap(show) {
      const isOff = show !== undefined ? !show : !rmap.classList.contains('off');
      rmap.classList.toggle('off', isOff);
      $('mapBtn').classList.toggle('active', !isOff);
      $('mapBtn').setAttribute('aria-pressed', String(!isOff));
      if (!isOff) {
        fabSet(false);
        drawMini(true);
      }
    }

    $('mapBtn').onclick = () => toggleFullMap();
    rmap.querySelector('#rmapCloseBtn').onclick = () => toggleFullMap(false);
    rmap.addEventListener('pointerdown', e => {
      if (e.target === rmap) toggleFullMap(false);
    });

    let mapBase = null,
      mapBox = null,
      mapLast = 0,
      hoverT = null;

    // เก็บพิกัดละเอียดของถนน 1,000 จุดไว้คำนวณการจิ้มวาร์ปที่แม่นยำ
    const MAP_SAMPLES = 1000;
    const mapRouteSamples = [];
    for (let i = 0; i < MAP_SAMPLES; i++) {
      const t = i / MAP_SAMPLES;
      const p = route.getPoint(t);
      mapRouteSamples.push({ t, x: p.x, z: p.z });
    }

    const mproj = (x, z) => [
      mapBox.ox + (x - mapBox.x0) * mapBox.k,
      mapBox.oy + (z - mapBox.z0) * mapBox.k
    ];

    // ตำแหน่งสถานที่พิเศษทั้งหมดในฉาก
    const SPECIAL_PLACES = [
      // โซนเกษตรกรรมและธรรมชาติ
      { t: 0.61, label: 'ทุ่งนา', color: '#6b9863', type: 'zone' },
      { t: 0.705, label: 'ไร่ข้าวโพด', color: '#d9a05b', type: 'zone' },
      { t: 0.755, label: 'แม่น้ำ', color: '#2b7ea6', type: 'zone' },
      { t: 0.805, label: 'สวนผลไม้', color: '#e98f7d', type: 'zone' },
      { t: 0.90, label: 'สวนมะพร้าว', color: '#4f8bb0', type: 'zone' },
      // ท่าเรือริมแม่น้ำ
      { t: 0.755, label: 'ท่าเรือ', color: '#2b7ea6', type: 'poi' },
      // หนองน้ำสวนมะพร้าว & ยอยักษ์
      { t: 0.885, label: 'หนองน้ำ & ยอยักษ์', color: '#0284c7', type: 'poi' },
      // 7-Eleven (เหลือเฉพาะสาขาต้นทาง — เอาสาขาแถวหนองน้ำออก)
      { t: 0.016, label: '7-11', color: '#1f7a4d', type: 'poi' },
      // โรงเรียน
      { t: T_SCHOOL_FIELD, label: 'โรงเรียนชนบท 1', color: '#6e56af', type: 'poi' },
      { t: 0.815, label: 'โรงเรียนชนบท 2', color: '#6e56af', type: 'poi' },
      // วัด 5 แห่ง
      { t: 0.14, label: 'วัด', color: '#d49b27', type: 'poi' },
      { t: 0.33, label: 'วัด', color: '#d49b27', type: 'poi' },
      { t: 0.52, label: 'วัด', color: '#d49b27', type: 'poi' },
      { t: 0.70, label: 'วัด', color: '#d49b27', type: 'poi' },
      { t: 0.842, label: 'วัด', color: '#d49b27', type: 'poi' },
      // ตลาดผลไม้ริมทาง
      { t: 0.27, label: 'ร้านผลไม้', color: '#c8553d', type: 'poi' },
      { t: 0.58, label: 'ร้านผลไม้', color: '#c8553d', type: 'poi' },
      { t: 0.83, label: 'ร้านผลไม้', color: '#c8553d', type: 'poi' }
    ];

    function buildMapBase() {
      let x0 = 1e9, x1 = -1e9, z0 = 1e9, z1 = -1e9;
      mapRouteSamples.forEach(p => {
        x0 = Math.min(x0, p.x); x1 = Math.max(x1, p.x);
        z0 = Math.min(z0, p.z); z1 = Math.max(z1, p.z);
      });
      const pad = 75,
        k = Math.min((MW - pad * 2) / (x1 - x0 || 1), (MH - pad * 2 - 24) / (z1 - z0 || 1));
      mapBox = {
        x0,
        z0,
        k,
        ox: (MW - (x1 - x0) * k) / 2,
        oy: (MH - 24 - (z1 - z0) * k) / 2
      };

      const cv = document.createElement('canvas');
      cv.width = MW;
      cv.height = MH;
      const c = cv.getContext('2d');

      // พื้นแผนที่โทน atlas พร้อมแสงเฉียงและขอบมืดอ่อนๆ
      const terrain = c.createRadialGradient(MW * 0.42, MH * 0.35, 40, MW * 0.5, MH * 0.5, MW * 0.76);
      terrain.addColorStop(0, '#f4f4df');
      terrain.addColorStop(0.58, '#e5edcf');
      terrain.addColorStop(1, '#c6d9c3');
      c.fillStyle = terrain;
      c.fillRect(0, 0, MW, MH);
      for (let i = 0; i < 13; i++) {
        c.beginPath();
        c.ellipse(
          500 + Math.sin(i * 1.7) * 210,
          365 + Math.cos(i * 1.2) * 165,
          105 + i * 29,
          56 + i * 16,
          -0.28,
          0,
          Math.PI * 2
        );
        c.strokeStyle = `rgba(103, 133, 79, ${0.035 + (i % 3) * 0.012})`;
        c.lineWidth = i % 4 === 0 ? 2 : 1;
        c.stroke();
      }

      // วาดเนินเขาเป็นชั้นภูมิประเทศนูน พร้อมเงาและแนวสันเขา
      HILLS.forEach((h, index) => {
        const [hx, hy] = mproj(h.x, h.z);
        const hr = h.r * mapBox.k * 0.88;
        if (hx < -50 || hx > MW + 50 || hy < -50 || hy > MH + 50) return;
        const mountain = index >= HILLS.length - 18,
          rx = hr * (0.82 + (index % 4) * 0.07),
          ry = hr * (0.42 + h.sy * 0.22),
          phase = index * 1.73;
        c.save();
        c.translate(hx, hy);
        c.rotate((index % 5 - 2) * 0.12);
        c.fillStyle = 'rgba(47, 69, 48, 0.2)';
        c.beginPath();
        c.ellipse(4, ry * 0.36 + 5, rx * 1.12, ry * 0.78, 0, 0, Math.PI * 2);
        c.fill();
        const ridgePath = (scale, offsetY = 0) => {
          c.beginPath();
          for (let j = 0; j < 12; j++) {
            const a = (j / 12) * Math.PI * 2,
              wobble = 0.86 + 0.1 * Math.sin(j * 2.4 + phase) + 0.045 * Math.cos(j * 4.1 + phase),
              x = Math.cos(a) * rx * scale * wobble,
              y = Math.sin(a) * ry * scale * wobble + offsetY;
            j === 0 ? c.moveTo(x, y) : c.lineTo(x, y);
          }
          c.closePath();
        };
        ridgePath(1);
        const hill = c.createLinearGradient(-rx * 0.8, -ry, rx * 0.7, ry);
        hill.addColorStop(0, mountain ? '#b5c8a8' : '#c4d6aa');
        hill.addColorStop(0.42, mountain ? '#8eaa86' : '#9dbb8b');
        hill.addColorStop(1, mountain ? '#557a68' : '#6d936e');
        c.fillStyle = hill;
        c.fill();
        c.strokeStyle = 'rgba(255,255,255,0.58)';
        c.lineWidth = 1.4;
        c.stroke();

        ridgePath(0.72, ry * 0.06);
        c.fillStyle = mountain ? 'rgba(185, 202, 158, 0.46)' : 'rgba(207, 223, 164, 0.52)';
        c.fill();
        c.strokeStyle = 'rgba(235, 243, 211, 0.58)';
        c.lineWidth = 1;
        c.stroke();

        ridgePath(0.43, -ry * 0.02);
        c.fillStyle = mountain ? 'rgba(222, 226, 183, 0.32)' : 'rgba(230, 235, 188, 0.42)';
        c.fill();
        c.strokeStyle = 'rgba(255,255,255,0.48)';
        c.lineWidth = 0.9;
        c.stroke();
        c.restore();
      });

      const drawLandPatch = (t, side, color, pattern) => {
        const p = route.getPoint(t);
        const tangent = route.getTangent(t);
        const [px, py] = mproj(p.x + tangent.z * side, p.z - tangent.x * side);
        c.save();
        c.translate(px, py);
        c.rotate(Math.atan2(tangent.x, tangent.z));
        c.fillStyle = 'rgba(47, 67, 43, 0.16)';
        c.beginPath();
        c.ellipse(2, 5, 50, 28, 0, 0, Math.PI * 2);
        c.fill();
        c.fillStyle = color;
        c.beginPath();
        c.ellipse(0, 0, 47, 26, 0, 0, Math.PI * 2);
        c.fill();
        c.strokeStyle = 'rgba(87, 130, 76, 0.34)';
        c.lineWidth = 1.5;
        c.stroke();
        const fieldLight = c.createLinearGradient(-38, -25, 35, 25);
        fieldLight.addColorStop(0, 'rgba(255,255,255,0.32)');
        fieldLight.addColorStop(1, 'rgba(49,83,47,0.08)');
        c.fillStyle = fieldLight;
        c.beginPath();
        c.ellipse(-1, -2, 43, 22, 0, 0, Math.PI * 2);
        c.fill();
        c.save();
        c.beginPath();
        c.ellipse(0, 0, 45, 24, 0, 0, Math.PI * 2);
        c.clip();
        if (pattern === 'field') {
          c.strokeStyle = 'rgba(91, 143, 69, 0.32)';
          c.lineWidth = 2;
          for (let x = -44; x <= 44; x += 10) {
            c.beginPath(); c.moveTo(x, -25); c.lineTo(x, 25); c.stroke();
          }
          for (let y = -24; y <= 24; y += 9) {
            c.beginPath(); c.moveTo(-48, y); c.lineTo(48, y); c.stroke();
          }
        } else {
          c.fillStyle = pattern === 'orchard' ? '#4f8d50' : '#c39a45';
          for (let x = -36; x <= 36; x += 13) {
            for (let y = -15; y <= 15; y += 12) {
              c.beginPath(); c.arc(x, y, 3.5, 0, Math.PI * 2); c.fill();
            }
          }
        }
        c.restore();
        c.restore();
      };

      drawLandPatch(0.61, 43, '#d3e6ae', 'field');
      drawLandPatch(0.70, -48, '#efe0a1', 'corn');
      drawLandPatch(0.81, 42, '#c5dfad', 'orchard');
      drawLandPatch(0.89, -43, '#b9d8a7', 'orchard');

      c.lineCap = c.lineJoin = 'round';
      const drawRoadSegment = (a, b, w, col, dash = []) => {
        c.beginPath();
        c.setLineDash(dash);
        for (let i = a; i <= b; i++) {
          const pt = mapRouteSamples[i % MAP_SAMPLES];
          const q = mproj(pt.x, pt.z);
          i === a ? c.moveTo(q[0], q[1]) : c.lineTo(q[0], q[1]);
        }
        c.lineCap = c.lineJoin = 'round';
        c.lineWidth = w + 7;
        c.strokeStyle = 'rgba(49, 64, 48, 0.2)';
        c.stroke();
        c.lineWidth = w + 3;
        c.strokeStyle = '#fffdf2';
        c.stroke();
        c.lineWidth = w;
        c.strokeStyle = col;
        c.stroke();
        if (w >= 8 && dash.length === 0) {
          c.setLineDash([2.5, 7]);
          c.lineWidth = 1.2;
          c.strokeStyle = 'rgba(255, 246, 213, 0.34)';
          c.stroke();
        }
        c.setLineDash([]);
      };

      // วาดแม่น้ำสายกว้างและเรือหางยาวลงบนแผนที่
      if (typeof RIVER_PTS !== 'undefined' && RIVER_PTS.length > 1) {
        c.beginPath();
        for (let i = 0; i < RIVER_PTS.length; i++) {
          const pt = RIVER_PTS[i];
          const q = mproj(pt.x, pt.z);
          i === 0 ? c.moveTo(q[0], q[1]) : c.lineTo(q[0], q[1]);
        }
        c.lineWidth = 25;
        c.strokeStyle = 'rgba(48, 86, 93, 0.18)';
        c.stroke();
        c.lineWidth = 19;
        c.strokeStyle = '#d7c39a';
        c.stroke();
        c.lineWidth = 13;
        const riverFill = c.createLinearGradient(0, 0, MW, MH);
        riverFill.addColorStop(0, '#78bfd1');
        riverFill.addColorStop(0.5, '#438fb0');
        riverFill.addColorStop(1, '#347b9e');
        c.strokeStyle = riverFill;
        c.stroke();
        c.lineWidth = 2;
        c.strokeStyle = 'rgba(222, 248, 247, 0.8)';
        c.setLineDash([2, 10]);
        c.stroke();
        c.setLineDash([]);

        // ไอคอนเรือหางยาวบนสายน้ำในแผนที่ (วาดเวกเตอร์)
        const midPt = RIVER_PTS[Math.floor(RIVER_PTS.length * 0.48)];
        if (midPt) {
          const [bx, by] = mproj(midPt.x, midPt.z);
          c.save();
          c.translate(bx, by);
          c.fillStyle = '#6e4726';
          c.beginPath();
          c.moveTo(-9, 0);
          c.lineTo(-4, -3.5);
          c.lineTo(5, -3.5);
          c.lineTo(10, 0);
          c.lineTo(5, 3.5);
          c.lineTo(-4, 3.5);
          c.closePath();
          c.fill();
          c.fillStyle = '#e76f51';
          c.fillRect(-3, -2, 5, 4);
          c.restore();
        }
      }

      // วาดหนองน้ำใหญ่โซนสวนมะพร้าวลงบนแผนที่ความทรงจำ
      if (typeof WETLAND_PTS !== 'undefined' && WETLAND_PTS.length > 2) {
        c.beginPath();
        for (let i = 1; i < WETLAND_PTS.length - 1; i++) {
          const pt = WETLAND_PTS[i];
          const q = mproj(pt.x, pt.z);
          i === 1 ? c.moveTo(q[0], q[1]) : c.lineTo(q[0], q[1]);
        }
        c.lineCap = 'round';
        c.lineJoin = 'round';
        c.lineWidth = 21;
        c.strokeStyle = 'rgba(48, 86, 93, 0.16)';
        c.stroke();
        c.lineWidth = 16;
        c.strokeStyle = '#cbb288';
        c.stroke();
        c.lineWidth = 12;
        const wetlandFill = c.createLinearGradient(0, 0, MW, MH);
        wetlandFill.addColorStop(0, '#72b7c8');
        wetlandFill.addColorStop(1, '#3984a4');
        c.strokeStyle = wetlandFill;
        c.stroke();
        c.lineWidth = 3;
        c.strokeStyle = 'rgba(214, 242, 240, 0.78)';
        c.setLineDash([3, 8]);
        c.stroke();
        c.setLineDash([]);
      }

      // ขอบถนนสีขาวและถนนรอบวง
      drawRoadSegment(0, MAP_SAMPLES, 18, '#ffffff');
      drawRoadSegment(0, MAP_SAMPLES, 11, '#b6c4ae');
      drawRoadSegment(Math.round(T3 * MAP_SAMPLES), MAP_SAMPLES, 5, '#ffffff', [8, 8]);

      // เส้นทางจันจว้า -> เวียงแก่น และเส้นทางต่อไปดอยผาตั้ง-ภูชี้ฟ้า
      drawRoadSegment(Math.round(T0 * MAP_SAMPLES), Math.round(T1 * MAP_SAMPLES), 11, '#376951');
      drawRoadSegment(Math.round(T1 * MAP_SAMPLES), Math.round(T3 * MAP_SAMPLES), 9, '#b27b4f');

      // เน้นช่วงที่มีบ้านชนบท และปักหมุดบ้านให้เห็นได้ชัดบนแผนที่
      {
        const villageStart = tAt(136),
          villageEnd = tAt(169);
        c.save();
        c.beginPath();
        for (let i = 0; i <= 100; i++) {
          const pt = route.getPoint(villageStart + ((villageEnd - villageStart) * i) / 100),
            q = mproj(pt.x, pt.z);
          i === 0 ? c.moveTo(q[0], q[1]) : c.lineTo(q[0], q[1]);
        }
        c.lineCap = c.lineJoin = 'round';
        c.lineWidth = 19;
        c.strokeStyle = 'rgba(120, 150, 93, 0.28)';
        c.stroke();
        c.setLineDash([5, 8]);
        c.lineWidth = 3;
        c.strokeStyle = '#587746';
        c.stroke();
        c.setLineDash([]);

        const drawVillageHouse = (t, side) => {
          const p = route.getPoint(t),
            tangent = route.getTangent(t),
            [x, y] = mproj(p.x + tangent.z * side * 19, p.z - tangent.x * side * 19);
          c.fillStyle = 'rgba(35, 57, 39, 0.18)';
          c.fillRect(x - 7, y + 5, 16, 3);
          c.fillStyle = '#f3e7c9';
          c.fillRect(x - 6, y - 2, 13, 8);
          c.fillStyle = '#8b5940';
          c.beginPath();
          c.moveTo(x - 8, y - 2);
          c.lineTo(x, y - 9);
          c.lineTo(x + 9, y - 2);
          c.closePath();
          c.fill();
          c.fillStyle = '#6f8f62';
          c.fillRect(x - 2, y + 1, 4, 5);
        };
        [139, 147, 155, 163, 168].forEach((km, i) => drawVillageHouse(tAt(km), i % 2 ? -1 : 1));

        c.restore();
      }

      const mapLabelBounds = [],
        stopLabelOffsets = [
          [0, -34], [0, 34], [48, -22], [-48, -22], [48, 22], [-48, 22],
          [0, -60], [0, 60], [88, 0], [-88, 0], [112, -46], [-112, -46],
          [112, 46], [-112, 46], [150, 0], [-150, 0]
        ],
        poiLabelOffsets = [
          [0, -22], [0, 22], [32, -18], [-32, -18], [32, 18], [-32, 18],
          [0, -40], [0, 40], [58, 0], [-58, 0]
        ];
      const drawMapLabel = (text, x, y, color, isStop = false) => {
        c.font = `${isStop ? '700 13px' : '600 12px'} "Noto Sans Thai",sans-serif`;
        c.textBaseline = 'middle';
        const padX = isStop ? 8 : 7,
          boxH = isStop ? 23 : 21,
          boxW = Math.ceil(c.measureText(text).width) + padX * 2,
          offsets = isStop ? stopLabelOffsets : poiLabelOffsets;
        let best = null,
          bestOverlap = Infinity;
        for (const [dx, dy] of offsets) {
          const left = Math.max(6, Math.min(MW - boxW - 6, x + dx - boxW / 2)),
            top = Math.max(6, Math.min(MH - boxH - 30, y + dy - boxH / 2)),
            rect = { left, top, right: left + boxW, bottom: top + boxH },
            overlap = mapLabelBounds.reduce((sum, other) => {
              const w = Math.max(0, Math.min(rect.right, other.right) - Math.max(rect.left, other.left)),
                h = Math.max(0, Math.min(rect.bottom, other.bottom) - Math.max(rect.top, other.top));
              return sum + w * h;
            }, 0);
          if (overlap < bestOverlap) {
            best = rect;
            bestOverlap = overlap;
          }
          if (overlap === 0) break;
        }
        if (!best || bestOverlap > 0) return;
        mapLabelBounds.push(best);

        const edgeX = Math.max(best.left + 5, Math.min(best.right - 5, x)),
          edgeY = Math.max(best.top + 4, Math.min(best.bottom - 4, y));
        if (Math.hypot(edgeX - x, edgeY - y) > 10) {
          c.beginPath();
          c.moveTo(x, y);
          c.lineTo(edgeX, edgeY);
          c.strokeStyle = 'rgba(57, 78, 60, 0.48)';
          c.lineWidth = 1.2;
          c.stroke();
        }
        c.save();
        c.shadowColor = 'rgba(35, 54, 40, 0.2)';
        c.shadowBlur = 7;
        c.shadowOffsetY = 2;
        c.fillStyle = 'rgba(255,255,255,0.96)';
        c.strokeStyle = color;
        c.lineWidth = isStop ? 1.4 : 1;
        c.beginPath();
        if (c.roundRect) c.roundRect(best.left, best.top, boxW, boxH, boxH / 2);
        else c.rect(best.left, best.top, boxW, boxH);
        c.fill();
        c.stroke();
        c.shadowColor = 'transparent';
        c.fillStyle = '#294634';
        c.textAlign = 'center';
        c.fillText(text, (best.left + best.right) / 2, (best.top + best.bottom) / 2);
        c.restore();
      };

      ROUTE.forEach(s => {
        const p = route.getPoint(s.t),
          [x, y] = mproj(p.x, p.z);
        c.beginPath();
        c.arc(x + 1, y + 2, 12, 0, Math.PI * 2);
        c.fillStyle = 'rgba(34, 57, 43, 0.18)';
        c.fill();
        c.beginPath();
        c.arc(x, y, 9, 0, Math.PI * 2);
        c.fillStyle = s.color || '#376951';
        c.fill();
        c.lineWidth = 3;
        c.strokeStyle = '#fff';
        c.stroke();
        drawMapLabel(`${s.name} · ${s.km} กม.`, x, y, s.color || '#376951', true);
      });

      // วาดจุดกางเต็นท์ (ถ้ามี)
      if (window.campLights) {
        window.campLights.forEach(camp => {
          const [cx, cy] = mproj(camp.group.position.x, camp.group.position.z);
          c.save();
          c.translate(cx, cy);
          c.fillStyle = '#e07a5f';
          c.strokeStyle = '#ffffff';
          c.lineWidth = 1.5;
          c.beginPath();
          c.moveTo(0, -6);
          c.lineTo(7, 5);
          c.lineTo(-7, 5);
          c.closePath();
          c.fill();
          c.stroke();
          c.restore();
        });
      }

      // วาดสถานที่พิเศษ (7-11, โรงเรียน, วัด, โซนเกษตร)
      SPECIAL_PLACES.forEach(sp => {
        const p = route.getPoint(sp.t);
        const [qx, qy] = mproj(p.x, p.z);
        if (sp.type === 'zone') {
          drawMapLabel(sp.label, qx, qy, sp.color);
        } else {
          c.beginPath();
          c.arc(qx, qy, 5, 0, Math.PI * 2);
          c.fillStyle = sp.color;
          c.fill();
          c.lineWidth = 2;
          c.strokeStyle = '#fff';
          c.stroke();
          if (['7-11', 'ท่าเรือ', 'หนองน้ำ & ยอยักษ์', 'โรงเรียนชนบท 1', 'โรงเรียนชนบท 2'].includes(sp.label))
            drawMapLabel(sp.label, qx, qy, sp.color);
        }
      });

      const drawBuilding = (t, side, kind, color) => {
        const p = route.getPoint(t);
        const tangent = route.getTangent(t);
        const [x, y] = mproj(p.x + tangent.z * side, p.z - tangent.x * side);
        const w = kind === 'school' ? 23 : kind === 'temple' ? 19 : 21;
        const h = kind === 'school' ? 13 : 11;
        c.fillStyle = 'rgba(28, 48, 34, 0.2)';
        c.beginPath();
        c.ellipse(x + 4, y + 8, w * 0.76, 7, 0, 0, Math.PI * 2);
        c.fill();
        c.fillStyle = kind === 'market' ? '#b8844c' : '#f5f0df';
        c.fillRect(x - w / 2, y - h / 2, w, h);
        c.fillStyle = kind === 'temple' ? '#b83c2e' : color;
        c.beginPath();
        c.moveTo(x - w / 2 - 3, y - h / 2);
        c.lineTo(x, y - h / 2 - 9);
        c.lineTo(x + w / 2 + 3, y - h / 2);
        c.closePath();
        c.fill();
        c.fillStyle = 'rgba(255,255,255,0.4)';
        c.beginPath();
        c.moveTo(x, y - h / 2 - 9);
        c.lineTo(x + w / 2 + 3, y - h / 2);
        c.lineTo(x + w / 2 + 3, y + h / 2);
        c.lineTo(x, y + h / 2);
        c.closePath();
        c.fill();
        if (kind === 'school' || kind === 'store') {
          c.fillStyle = '#6facc2';
          c.fillRect(x - 4, y, 4, 5);
          c.fillRect(x + 3, y, 4, 5);
        } else if (kind === 'temple') {
          c.fillStyle = '#f2c12e';
          c.beginPath(); c.arc(x + 11, y - 10, 3, 0, Math.PI * 2); c.fill();
        } else {
          c.fillStyle = '#e99a42';
          c.beginPath(); c.arc(x - 4, y, 3, 0, Math.PI * 2); c.arc(x + 3, y, 3, 0, Math.PI * 2); c.fill();
        }
      };
      [[0.14, 24, 'temple', '#d2a43c'], [0.33, -24, 'temple', '#d2a43c'],
        [0.52, 26, 'temple', '#d2a43c'], [0.70, -24, 'temple', '#d2a43c'],
        [0.842, 24, 'temple', '#d2a43c']].forEach(([t, side, kind, color]) => drawBuilding(t, side, kind, color));
      [[T_SCHOOL_FIELD, 30, 'school', '#b84b3b'], [0.81, 30, 'school', '#b84b3b']].forEach(([t, side, kind, color]) => drawBuilding(t, side, kind, color));
      [0.016].forEach(t => drawBuilding(t, -25, 'store', '#e87c36'));
      [0.27, 0.58, 0.83].forEach(t => drawBuilding(t, -23, 'market', '#d77b47'));

      mapBase = cv;
    }

    function drawMini(force) {
      if (rmap.classList.contains('off')) return;
      const now = performance.now();
      if (!force && now - mapLast < 70) return;
      mapLast = now;
      if (!mapBase) buildMapBase();
      const c = mctx;
      c.setTransform(1, 0, 0, 1, 0, 0);
      c.clearRect(0, 0, MW, MH);
      c.save();
      c.translate(mapView.x, mapView.y);
      c.scale(mapView.scale, mapView.scale);
      c.drawImage(mapBase, 0, 0);

      // แสดงระยะทางที่เดินทางแล้วเป็นเส้นสีทองบนเส้นทางขาไป
      if (state.routeT >= T0 && state.routeT <= T3) {
        const start = Math.ceil(T0 * MAP_SAMPLES),
          end = Math.min(MAP_SAMPLES - 1, Math.floor(state.routeT * MAP_SAMPLES));
        if (end > start) {
          c.beginPath();
          for (let i = start; i <= end; i++) {
            const pt = mapRouteSamples[i],
              [px, py] = mproj(pt.x, pt.z);
            i === start ? c.moveTo(px, py) : c.lineTo(px, py);
          }
          c.lineCap = c.lineJoin = 'round';
          c.strokeStyle = 'rgba(255,255,255,0.9)';
          c.lineWidth = 9;
          c.stroke();
          c.strokeStyle = '#e5a83b';
          c.lineWidth = 4;
          c.stroke();
        }
      }

      // วาดจุด Preview เวลาเอาเมาส์ชี้บนถนน
      if (hoverT !== null) {
        const hp = route.getPoint(hoverT);
        const [hx, hy] = mproj(hp.x, hp.z);
        c.beginPath();
        c.arc(hx, hy, 14, 0, Math.PI * 2);
        c.fillStyle = 'rgba(55, 105, 81, 0.28)';
        c.fill();
        c.beginPath();
        c.arc(hx, hy, 6, 0, Math.PI * 2);
        c.fillStyle = '#376951';
        c.fill();
        c.lineWidth = 2;
        c.strokeStyle = '#fff';
        c.stroke();
      }

      // วาดตำแหน่งรถปัจจุบัน
      const q = mproj(car.position.x, car.position.z),
        th = car.rotation.y;
      c.beginPath();
      c.arc(q[0], q[1], 22, 0, Math.PI * 2);
      c.fillStyle = 'rgba(233, 143, 125, 0.32)';
      c.fill();
      c.save();
      c.translate(q[0], q[1]);
      c.rotate(Math.atan2(Math.cos(th), Math.sin(th)));
      c.beginPath();
      c.moveTo(15, 0);
      c.lineTo(-10, -10);
      c.lineTo(-5, 0);
      c.lineTo(-10, 10);
      c.closePath();
      c.fillStyle = '#e9593d';
      c.fill();
      c.lineWidth = 3;
      c.strokeStyle = '#fff';
      c.stroke();
      c.restore();

      const km = kmAt(state.routeT),
        inTrip = state.routeT >= T0 && state.routeT <= T3,
        nearestStop = ROUTE.reduce((nearest, stop) =>
          Math.abs(stop.km - km) < Math.abs(nearest.km - km) ? stop : nearest
        );
      mapCurrent.textContent = inTrip
        ? `ตำแหน่งรถ · กม. ${Math.round(km)} / ${KM_TOTAL}${Math.abs(nearestStop.km - km) < 8 ? ` · ใกล้${nearestStop.name}` : ''}`
        : 'ตำแหน่งรถ · เส้นทางวนกลับในชนบท';

      // แถบสถานะด้านล่างแผนที่
      c.font = '700 17px "Noto Sans Thai",sans-serif';
      c.textBaseline = 'alphabetic';
      c.textAlign = 'left';
      c.fillStyle = '#304a3e';
      c.fillText(
        inTrip
          ? `ตำแหน่งปัจจุบัน: กม. ${Math.round(km)} / ${KM_TOTAL}`
          : 'ตำแหน่งปัจจุบัน: เส้นทางวนกลับในชนบท',
        18,
        MH - 14
      );
      c.textAlign = 'right';
      c.fillText('แตะจุดใดก็ได้บนเส้นทางเพื่อวาร์ป', MW - 18, MH - 14);
      c.restore();
    }

    // ฟังก์ชันค้นหาจุดบนถนนที่ใกล้ตำแหน่งเมาส์/นิ้วที่แตะมากที่สุด
    function findNearestRouteT(clientX, clientY) {
      if (!mapBox) buildMapBase();
      const rect = mapCanvas.getBoundingClientRect();
      const cx = (((clientX - rect.left) / rect.width) * MW - mapView.x) / mapView.scale;
      const cy = (((clientY - rect.top) / rect.height) * MH - mapView.y) / mapView.scale;

      let bestT = null;
      let minDist = Infinity;
      for (let i = 0; i < mapRouteSamples.length; i++) {
        const pt = mapRouteSamples[i];
        const [px, py] = mproj(pt.x, pt.z);
        const d = Math.hypot(px - cx, py - cy);
        if (d < minDist) {
          minDist = d;
          bestT = pt.t;
        }
      }
      // อนุญาตให้จิ้มห่างจากเส้นถนนได้ในรัศมี 48px บนแคนวาส
      return minDist <= 48 / mapView.scale ? bestT : null;
    }

    let mapPointer = null;

    mapCanvas.addEventListener('pointermove', e => {
      if (mapPointer && mapPointer.id === e.pointerId) {
        const rect = mapCanvas.getBoundingClientRect();
        const dx = (e.clientX - mapPointer.lastX) / rect.width * MW;
        const dy = (e.clientY - mapPointer.lastY) / rect.height * MH;
        if (!mapPointer.dragged && Math.hypot(e.clientX - mapPointer.startX, e.clientY - mapPointer.startY) > 5) {
          mapPointer.dragged = true;
        }
        if (mapPointer.dragged) {
          mapView.x += dx;
          mapView.y += dy;
          clampMapView();
          mapCanvas.style.cursor = 'grabbing';
          drawMini(true);
        }
        mapPointer.lastX = e.clientX;
        mapPointer.lastY = e.clientY;
        if (mapPointer.dragged) return;
      }
      const nearT = findNearestRouteT(e.clientX, e.clientY);
      if (hoverT !== nearT) {
        hoverT = nearT;
        mapCanvas.style.cursor = 'grab';
        drawMini(true);
      }
    });

    mapCanvas.addEventListener('pointerdown', e => {
      mapPointer = {
        id: e.pointerId,
        startX: e.clientX,
        startY: e.clientY,
        lastX: e.clientX,
        lastY: e.clientY,
        dragged: false
      };
      mapCanvas.setPointerCapture(e.pointerId);
      mapCanvas.style.cursor = 'grabbing';
    });

    mapCanvas.addEventListener('pointerup', e => {
      if (!mapPointer || mapPointer.id !== e.pointerId) return;
      const wasDragged = mapPointer.dragged;
      mapPointer = null;
      mapCanvas.style.cursor = 'grab';
      if (wasDragged) return;

      const targetT = findNearestRouteT(e.clientX, e.clientY);
      if (targetT === null) {
        toast('แตะให้ตรงแนวเส้นถนนเพื่อวาร์ปนะครับ');
        return;
      }

      // 1. อัปเดตค่าตำแหน่งเส้นทางและรีเซ็ตความเร็วแซง/เบรก
      state.routeT = targetT;
      window._ovt = 0;
      window._ovtVelocity = 0;
      window._ovtTilt = 0;
      window._ovtState = 'idle';
      window._playerBrake = 1;
      window._playerBoost = 1;

      // 2. ย้ายตัวรถและกล้องไปยังจุดวาร์ปทันทีโดยไม่ต้องรอ Lerp
      const p = route.getPoint(targetT);
      const tan = route.getTangent(targetT);
      n0.set(-tan.z, 0, tan.x);
      car.position.copy(p).addScaledVector(n0, -LANE * (1 - 2 * turn));
      car.rotation.y = Math.atan2(tan.x, tan.z) + Math.PI * turn;

      const camA = Math.atan2(tan.x, tan.z) + angle + Math.PI * turn;
      camera.position.set(
        car.position.x - Math.sin(camA) * camDist,
        p.y + 2.4 + camDist * 0.12,
        car.position.z - Math.cos(camA) * camDist
      );
      targetPoint.set(car.position.x, p.y + 1.2, car.position.z);
      camera.lookAt(targetPoint);

      // 3. เคลียร์รถที่วิ่งสวนมาไม่ให้ชนกันจังหวะวาร์ปลงถนน
      traffic.forEach(c => {
        if (c.active && Math.abs(c.distM) < 40) {
          c.active = false;
          c.g.visible = false;
        }
      });

      // 4. อัปเดตชื่อสถานที่ เซฟข้อมูล และปิดแผนที่
      updateRouteUI();
      persist(true);
      drawMini(true);

      const km = Math.round(kmAt(targetT));
      const inMain = targetT >= T0 && targetT <= T3;
      const nearStop = [...ROUTE].sort((a, b) => Math.abs(a.t - targetT) - Math.abs(b.t - targetT))[0];

      setTimeout(() => toggleFullMap(false), 180);
      toast(
        inMain
          ? `${svgInline('bolt')} วาร์ปมาที่ กม. ${km} (ใกล้${nearStop.name}) เรียบร้อย!`
          : `${svgInline('bolt')} วาร์ปมายังเส้นทางชนบทเรียบร้อย!`
      );
    });
    mapCanvas.addEventListener('pointercancel', () => {
      mapPointer = null;
      mapCanvas.style.cursor = 'grab';
    });

    /* ============================================================================
     * src/scene/34-camera-switch.js
     * สลับกล้องมุมมองคนขับ/มุมสูง (setCam, ปุ่ม V)
     * (ไฟล์นี้ถูกต่อรวมเป็น closure เดียวกับไฟล์อื่น — ไม่ต้อง import/export · ลำดับไฟล์ดู build.config.mjs)
     * ========================================================================== */

    function setCam(on) {
      cockpit = on;
      cock.visible = on;
      car.visible = !on;
      if (on) {
        pitch = -0.025;
        targetAngle = 0;
        fovC = window.innerWidth <= 768 ? 74 : 68;
        if (typeof updateRearMirrorTex === 'function') updateRearMirrorTex();
      } else {
        camera.up.set(0, 1, 0);
      }
      engineOn(on);
      
      // ระบบเก็บเสียง: ลดความถี่เสียงธรรมชาตินอกรถเมื่อเข้าห้องโดยสาร
      if (typeof natureMaster !== 'undefined' && natureMaster && audioCtx) {
         if (!window.cabinFlt) {
           window.cabinFlt = audioCtx.createBiquadFilter();
           window.cabinFlt.type = 'lowpass';
           natureMaster.disconnect();
           natureMaster.connect(window.cabinFlt);
           window.cabinFlt.connect(audioCtx.destination);
         }
         window.cabinFlt.frequency.setTargetAtTime(on ? 600 : 20000, audioCtx.currentTime, 0.4);
      }

      bubEl.style.visibility = on ? 'hidden' : '';
      const b = $('camBtn');
      b.classList.toggle('active', on);
      b.setAttribute('aria-pressed', on);
      camera.near = on ? 0.1 : 0.3;
      if (!on) {
        camera.fov = 40;
      }
      camera.updateProjectionMatrix();
      toast(
        on
          ? `${svgInline('car')} มุมมองในรถ: ลากมองรอบๆ · คลิก ${svgInline('radio')}วิทยุ ${svgInline('coffee')}กาแฟ ${svgInline('cat')}แมว ${svgInline('camera')}กล้อง ${svgInline('horn')}แตร ${svgInline('visor')}ที่บังแดด`
          : 'มุมมองนอกรถ'
      );
    }

    $('camBtn').onclick = () => setCam(!cockpit);
    addEventListener('keydown', e => {
      if (currentView !== 'home' || /INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName)) return;
      if (e.key === 'v' || e.key === 'V') {
        setCam(!cockpit);
      } else if ((e.key === 'b' || e.key === 'B') && cockpit && typeof window.honkCockpitHorn === 'function') {
        window.honkCockpitHorn();
      }
    });
    renderer.domElement.addEventListener('pointerdown', e => {
      ly = e.clientY;
    });
    renderer.domElement.addEventListener('pointermove', e => {
      if (drag && cockpit && touches.size < 2)
        pitch = Math.max(-0.55, Math.min(0.48, pitch - (e.clientY - ly) * 0.004));
      ly = e.clientY;
    });

    /* ============================================================================
     * src/scene/35-main-loop.js
     * ลูปหลักของฉาก frame(): ขับรถ กล้อง แสง และอัปเดตทุกระบบ
     * (ไฟล์นี้ถูกต่อรวมเป็น closure เดียวกับไฟล์อื่น — ไม่ต้อง import/export · ลำดับไฟล์ดู build.config.mjs)
     * ========================================================================== */

    /* ============================================================================
     * แม่น้ำสายกว้างหลังสวนผลไม้ + เรือหางยาวแล่นไปมา
     * ผิวน้ำไล่สีตื้น→ลึก, ระลอกคลื่นไหลตามกระแส, ตลิ่งทราย, กอกก, หิน, ต้นไม้ฝั่งไกล,
     * ท่าน้ำพร้อมศาลา และเรือหางยาว 4 ลำที่วิ่งสวนกันพร้อมคลื่นท้ายเรือ
     * ========================================================================== */
    
    const RIVER = (() => {
      const root = new THREE.Group();
      root.name = 'riverRoot';
      scene.add(root);
      const P = RIVER_PTS,
        N = P.length,
        WY = 0.02; // <-- [จุดสำคัญที่ 1] ยกผิวน้ำจาก -0.08 ขึ้นมาที่ 0.02 ให้พ้นพื้นหญ้า (-0.12) เด็ดขาด!
      if (N < 4) return { root, update() {}, nearBoat: () => 1e9 };

      // แกนตัดขวาง a = ทิศจากกลางแม่น้ำ → ถนน (บวก = ฝั่งใกล้ถนน), ทิศตามลำน้ำ d และระยะสะสม
      const AX = [],
        AZ = [],
        DX = [],
        DZ = [],
        LEN = [0];
      for (let i = 0; i < N; i++) {
        const q = P[i];
        let ax = q.px - q.x,
          az = q.pz - q.z;
        const al = Math.hypot(ax, az) || 1;
        AX.push(ax / al);
        AZ.push(az / al);
        const a = P[Math.max(0, i - 1)],
          b = P[Math.min(N - 1, i + 1)];
        let dx = b.x - a.x,
          dz = b.z - a.z;
        const dl = Math.hypot(dx, dz) || 1;
        DX.push(dx / dl);
        DZ.push(dz / dl);
        if (i > 0) LEN.push(LEN[i - 1] + Math.hypot(q.x - P[i - 1].x, q.z - P[i - 1].z));
      }
      const TOTAL = LEN[N - 1];

      // ---------- 1) ผิวน้ำไล่โทนฟ้าพาสเทลละมุน (ไม่จ้าแสบตา เข้ากับบรรยากาศฉาก) ----------
      const ACROSS = [-1, -0.82, -0.5, -0.18, 0.18, 0.5, 0.82, 1],
        cShallow = new THREE.Color(0x8ab8cc), // ฟ้าอมเทาอ่อนนวลริมตลิ่ง (ปรับลดความจ้าลง)
        cMid = new THREE.Color(0x5b92ad),     // ฟ้าหม่นละมุนกลางลำน้ำ
        cDeep = new THREE.Color(0x417591),    // น้ำเงินอมเทาลึกร่องน้ำกลาง
        tmpC = new THREE.Color();
      {
        const pos = [],
          col = [],
          uv = [],
          idx = [],
          K = ACROSS.length;
        for (let i = 0; i < N; i++) {
          const q = P[i];
          for (let k = 0; k < K; k++) {
            const s = ACROSS[k] * q.w;
            pos.push(q.x + AX[i] * s, WY, q.z + AZ[i] * s);
            const e = Math.abs(ACROSS[k]);
            if (e > 0.6) tmpC.copy(cMid).lerp(cShallow, (e - 0.6) / 0.4);
            else tmpC.copy(cDeep).lerp(cMid, e / 0.6);
            col.push(tmpC.r, tmpC.g, tmpC.b);
            uv.push((ACROSS[k] + 1) * 0.5, LEN[i] / 14);
          }
          if (i < N - 1)
            for (let k = 0; k < K - 1; k++) {
              const a = i * K + k,
                b = a + K;
              idx.push(a, b, a + 1, a + 1, b, b + 1);
            }
        }
        const g = new THREE.BufferGeometry();
        g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
        g.setAttribute('color', new THREE.Float32BufferAttribute(col, 3));
        g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
        g.setIndex(idx);
        g.computeVertexNormals();
        g.computeBoundingSphere();

        const waterMat = new THREE.MeshBasicMaterial({
          vertexColors: true,
          side: THREE.DoubleSide,
          fog: true,          // <-- เปิดรับหมอกระยะไกลให้น้ำค่อยๆ จางกลืนไปกับขอบฟ้า ไม่ลอยโดด
          transparent: true,
          opacity: 0.88,      // <-- ให้ผิวน้ำมีความโปร่งแสงนิดๆ ดูนุ่มตาขึ้น
          depthWrite: true,
          polygonOffset: true,
          polygonOffsetFactor: -4,
          polygonOffsetUnits: -4
        });

        const water = new THREE.Mesh(g, waterMat);
        water.position.y = 0.06;
        water.frustumCulled = false;
        water.renderOrder = 2;

        Object.defineProperty(water, 'visible', { value: true, writable: false });
        Object.defineProperty(root, 'visible', { value: true, writable: false });

        root.add(water);

        // ระลอกคลื่นประกายแดดไหลตามกระแสน้ำ (texture เลื่อนทุกเฟรม)
        const rc = document.createElement('canvas');
        rc.width = 128;
        rc.height = 256;
        const rx = rc.getContext('2d');
        rx.clearRect(0, 0, 128, 256);
        let rs = 4242;
        const rr = () => ((rs = (rs * 16807) % 2147483647) - 1) / 2147483646;
        for (let i = 0; i < 170; i++) {
          const x = rr() * 128,
            y = rr() * 256,
            l = 6 + rr() * 22,
            a = 0.12 + rr() * 0.32;
          rx.strokeStyle = 'rgba(255,255,255,' + a + ')';
          rx.lineWidth = 0.8 + rr() * 1.4;
          rx.beginPath();
          for (const oy of [-256, 0, 256]) {
            rx.moveTo(x - l * 0.5, y + oy);
            rx.quadraticCurveTo(x, y + oy - 2.5, x + l * 0.5, y + oy);
          }
          rx.stroke();
        }
        const rippleTex = new THREE.CanvasTexture(rc);
        rippleTex.wrapS = rippleTex.wrapT = THREE.RepeatWrapping;
        rippleTex.repeat.set(3, 1);
        const rippleMat = new THREE.MeshBasicMaterial({
          map: rippleTex,
          transparent: true,
          opacity: 0.42,
          depthWrite: false,
          polygonOffset: true,
          polygonOffsetFactor: -3,
          polygonOffsetUnits: -3
        });
        const ripple = new THREE.Mesh(g, rippleMat);
        ripple.position.y = 0.012;
        root.add(ripple);
        root.userData.rippleTex = rippleTex;
        root.userData.rippleMat = rippleMat;
        root.userData.waterMat = waterMat;
      }

      // ---------- 2) ตลิ่งทรายและขอบหญ้าทั้งสองฝั่ง ----------
      {
        // [ระยะจากขอบน้ำ, ความสูง, สี]
        const prof = [
          [-0.8, -0.115, 0xd4cbb4],
          [0.4, -0.04, 0xcbb688],
          [1.8, 0.03, 0xd8c79b],
          [3.2, 0.07, 0x9aa66e],
          [5.6, -0.115, 0x738b56]
        ];
        const pos = [],
          col = [],
          idx = [],
          K = prof.length;
        let base = 0;
        for (const side of [1, -1]) {
          for (let i = 0; i < N; i++) {
            const q = P[i],
              wob = Math.sin(i * 0.9 + side) * 0.35;
            for (let k = 0; k < K; k++) {
              const s = side * (q.w + prof[k][0] + (k > 0 ? wob : 0));
              pos.push(q.x + AX[i] * s, prof[k][1], q.z + AZ[i] * s);
              tmpC.set(prof[k][2]).multiplyScalar(0.94 + Math.sin(i * 1.7 + k) * 0.05);
              col.push(tmpC.r, tmpC.g, tmpC.b);
            }
            if (i < N - 1)
              for (let k = 0; k < K - 1; k++) {
                const a = base + i * K + k,
                  b = a + K;
                if (side > 0) idx.push(a, a + 1, b, a + 1, b + 1, b);
                else idx.push(a, b, a + 1, a + 1, b, b + 1);
              }
          }
          base += N * K;
        }
        const g = new THREE.BufferGeometry();
        g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
        g.setAttribute('color', new THREE.Float32BufferAttribute(col, 3));
        g.setIndex(idx);
        g.computeVertexNormals();
        g.computeBoundingSphere();
        const bank = new THREE.Mesh(
          g,
          new THREE.MeshLambertMaterial({ vertexColors: true, side: THREE.DoubleSide, polygonOffset: true, polygonOffsetFactor: -1, polygonOffsetUnits: -1 })
        );
        bank.receiveShadow = true;
        root.add(bank);
      }

      // ตัวช่วยหาตำแหน่งบนแม่น้ำ: i = ดัชนีจุด, s = ระยะตัดขวาง (บวก = ฝั่งถนน)
      const at = (i, s) => {
        const q = P[i];
        return [q.x + AX[i] * s, q.z + AZ[i] * s];
      };
      let rs2 = 777;
      const RR = () => ((rs2 = (rs2 * 16807) % 2147483647) - 1) / 2147483646;
      const D3 = new THREE.Object3D();

      // ---------- 3) กอกกริมน้ำพริ้วไหว + หินกรวด (InstancedMesh ประหยัด draw call) ----------
      {
        // สร้างกอกกทรงโค้งพริ้วไหวตามธรรมชาติ (Curved Multi-Blade Reed Cluster with Cattail Plume)
        const reedGeo = buildReedClusterGeo(true);
        const reedMat = swayMat(0.14),
          COUNT = 520,
          reeds = new THREE.InstancedMesh(reedGeo, reedMat, COUNT);
        let n = 0;
        for (let i = 1; i < N - 1 && n < COUNT; i++) {
          for (const side of [1, -1]) {
            if (RR() < 0.35) continue;
            const clump = 2 + Math.floor(RR() * 4);
            const cs = side * (P[i].w + 0.2 + RR() * 2.2);
            for (let k = 0; k < clump && n < COUNT; k++) {
              const [x, z] = at(i, cs + (RR() - 0.5) * 0.9);
              D3.position.set(x + (RR() - 0.5) * 1.2, -0.1, z + (RR() - 0.5) * 1.2);
              D3.rotation.set((RR() - 0.5) * 0.25, RR() * 6.28, (RR() - 0.5) * 0.25);
              const h = 0.65 + RR() * 0.85;
              const wS = 0.8 + RR() * 0.45;
              D3.scale.set(wS, h, wS);
              D3.updateMatrix();
              reeds.setMatrixAt(n, D3.matrix);
              n++;
            }
          }
        }
        reeds.count = n;
        reeds.instanceMatrix.needsUpdate = true;
        reeds.frustumCulled = false;
        root.add(reeds);

        const rockGeo = new THREE.IcosahedronGeometry(1, 0),
          rocks = new THREE.InstancedMesh(rockGeo, new THREE.MeshLambertMaterial({ color: 0x9a968a, flatShading: true }), 90);
        let m = 0;
        for (let i = 2; i < N - 2 && m < 90; i += 2) {
          if (RR() < 0.45) continue;
          const side = RR() < 0.5 ? 1 : -1,
            [x, z] = at(i, side * (P[i].w - 0.4 + RR() * 1.4)),
            s = 0.18 + RR() * 0.45;
          D3.position.set(x, -0.1, z);
          D3.rotation.set(RR(), RR() * 6, RR());
          D3.scale.set(s * 1.3, s * 0.6, s);
          D3.updateMatrix();
          rocks.setMatrixAt(m++, D3.matrix);
        }
        rocks.count = m;
        rocks.instanceMatrix.needsUpdate = true;
        rocks.frustumCulled = false;
        root.add(rocks);

        // แนวต้นไม้และกอไผ่ฝั่งตรงข้าม (ฉากหลังให้แม่น้ำดูร่มรื่น)
        const trunkG = new THREE.CylinderGeometry(0.16, 0.26, 2.6, 5).translate(0, 1.3, 0),
          crownG = new THREE.IcosahedronGeometry(1, 1).scale(1.35, 1.15, 1.3).translate(0, 3.65, 0),
          TC = 110,
          trunks = new THREE.InstancedMesh(trunkG, new THREE.MeshLambertMaterial({ color: 0x7d6648 }), TC),
          crowns = new THREE.InstancedMesh(crownG, new THREE.MeshLambertMaterial({ color: 0xffffff, flatShading: true }), TC * 6),
          c = new THREE.Color();
        const canopyBlobs = [
          [0, 0, 0, 1.08, 1.04, 1.08],
          [1.05, 0.16, 0.12, 0.78, 0.76, 0.8],
          [-1.0, 0.2, -0.08, 0.82, 0.82, 0.78],
          [0.18, 0.22, 1.02, 0.8, 0.78, 0.82],
          [-0.12, 0.12, -0.98, 0.76, 0.82, 0.78],
          [0.08, 0.92, 0.02, 0.72, 0.68, 0.74]
        ];
        let tcount = 0, crownCount = 0;
        for (let i = 1; i < N - 1 && tcount < TC; i++) {
          if (RR() < 0.42) continue;
          const [x, z] = at(i, -(P[i].w + 7 + RR() * 12)),
            s = 0.8 + RR() * 0.75,
            yaw = RR() * 6.28;
          D3.position.set(x, -0.1, z);
          D3.rotation.set(0, yaw, 0);
          D3.scale.set(s, s * (0.85 + RR() * 0.4), s);
          D3.updateMatrix();
          trunks.setMatrixAt(tcount, D3.matrix);
          const sy = D3.scale.y;
          for (let bi = 0; bi < canopyBlobs.length; bi++) {
            const blob = canopyBlobs[bi],
              angle = yaw + (RR() - 0.5) * 0.24,
              ox = (blob[0] * Math.cos(yaw) + blob[2] * Math.sin(yaw)) * s,
              oz = (-blob[0] * Math.sin(yaw) + blob[2] * Math.cos(yaw)) * s;
            D3.position.set(x + ox, -0.1 + blob[1] * sy, z + oz);
            D3.rotation.set(0, angle, 0);
            D3.scale.set(s * blob[3], sy * blob[4], s * blob[5]);
            D3.updateMatrix();
            crowns.setMatrixAt(crownCount, D3.matrix);
            c.setHSL(0.24 + RR() * 0.1, 0.34 + RR() * 0.18, (bi === 0 ? 0.26 : 0.23) + RR() * 0.1);
            crowns.setColorAt(crownCount, c);
            crownCount++;
          }
          tcount++;
        }
        trunks.count = tcount;
        crowns.count = crownCount;
        trunks.instanceMatrix.needsUpdate = crowns.instanceMatrix.needsUpdate = true;
        if (crowns.instanceColor) crowns.instanceColor.needsUpdate = true;
        trunks.frustumCulled = crowns.frustumCulled = false;
        root.add(trunks, crowns);
      }

      // ---------- 4) เรือหางยาว ----------
      const hullGeo = (() => {
        const sh = new THREE.Shape();
        sh.moveTo(-3.1, 0.62);
        sh.lineTo(-3.25, 0.12);
        sh.quadraticCurveTo(-2.6, -0.06, 0, -0.06);
        sh.quadraticCurveTo(2.5, -0.06, 3.7, 1.15);
        sh.lineTo(3.45, 1.2);
        sh.quadraticCurveTo(2.3, 0.66, 0, 0.6);
        sh.lineTo(-3.1, 0.62);
        const g = new THREE.ExtrudeGeometry(sh, { depth: 1.15, bevelEnabled: false, curveSegments: 10 });
        g.translate(0, 0, -0.575);
        const pa = g.attributes.position;
        for (let i = 0; i < pa.count; i++) {
          const x = pa.getX(i);
          let f = 1;
          if (x > 1.2) f = Math.max(0.08, 1 - Math.pow((x - 1.2) / 2.5, 1.4)); // หัวเรือเรียวแหลม
          else if (x < -2.4) f = 0.82 + ((x + 3.25) / 0.85) * 0.18; // ท้ายเรือสอบเล็กน้อย
          pa.setZ(i, pa.getZ(i) * f);
        }
        g.rotateY(-Math.PI / 2); // ให้หัวเรือชี้ไปทาง +Z
        g.computeVertexNormals();
        return g;
      })();
      const wakeTex = (() => {
        const c = document.createElement('canvas');
        c.width = 128;
        c.height = 256;
        const x = c.getContext('2d');
        x.clearRect(0, 0, 128, 256);
        const cx = 64;
        for (let y = 0; y < 256; y++) {
          // ในระนาบ PlaneGeometry: y = 255 คือจุดท้ายเรือชิดใบพัด (z = -3.2), y = 0 คือปลายหางคลื่นด้านหลังสุด (z = -19.2)
          // d = 0 คือชิดใบพัดท้ายเรือ, d = 1 คือปลายหางคลื่นที่ขยายกว้างออกไปข้างหลัง
          const d = (255 - y) / 255;
          const hw = 3.0 + 54.0 * Math.pow(d, 0.82); // คลื่นรูปตัว V จากจุดแคบชิดใบพัด (3px) แผ่กว้างออกไปด้านหลัง (57px)
          const f = Math.pow(1 - d, 0.88); // ฟองน้ำหนาแน่นและสว่างสุดตรงใบพัดท้ายเรือ แล้วค่อย ๆ เจือจางหายไปที่ปลายหางคลื่น
          
          // สันคลื่นตัว V ด้านซ้ายและขวา
          const waveAlpha = (0.82 * f).toFixed(3);
          x.fillStyle = 'rgba(255,255,255,' + waveAlpha + ')';
          x.fillRect(cx - hw - 3, y, 6, 1);
          x.fillRect(cx + hw - 3, y, 6, 1);
          
          // ละอองฟองน้ำนุ่มฟุ้งรอบสันคลื่น
          const glowAlpha = (0.32 * f * f).toFixed(3);
          x.fillStyle = 'rgba(230,246,255,' + glowAlpha + ')';
          x.fillRect(cx - hw - 6, y, 12, 1);
          x.fillRect(cx + hw - 6, y, 12, 1);

          // ฟองน้ำปั่นพุ่งเป็นลำตรงจากใบพัดท้ายเรือ (Propeller churn stream)
          if (d < 0.52) {
            const jetFade = Math.pow(1 - d / 0.52, 1.3);
            const jw = 2.4 + d * 16;
            x.fillStyle = 'rgba(255,255,255,' + (0.9 * jetFade).toFixed(3) + ')';
            x.fillRect(cx - jw * 0.5, y, jw, 1);
            x.fillStyle = 'rgba(215,240,255,' + (0.35 * jetFade).toFixed(3) + ')';
            x.fillRect(cx - jw, y, jw * 2, 1);
          }
        }
        return new THREE.CanvasTexture(c);
      })();
      const wakeGeo = new THREE.PlaneGeometry(9, 16).rotateX(-Math.PI / 2).translate(0, 0, -11.2);
      const woodM = sm2(0x7a5232),
        woodDkM = sm2(0x4e3420),
        engineM = sm2(0x4a5258),
        steelM = sm2(0xb8c0c4),
        skinM = sm2(0xc89470),
        sprayMat = sm2(0xffffff),
        lampM = new THREE.MeshBasicMaterial({ color: 0xffd98a });
      const PAINT = [0x2f7f9e, 0xc9473f, 0x3f8f5a, 0xe0a33a],
        ROOF = [0xd9534a, 0x3d6a8a, 0xf0c95a, 0x6e9fb0];
      // คนนั่งหันหน้า +Z: ขา ต้นขา ลำตัว ไหล่ คอ หัว หน้า (ตา จมูก หู) ผม หมวก แขนสองท่อน ฝ่ามือ
      function seatedPerson(parent, x, y, z, o) {
        const g = new THREE.Group();
        g.position.set(x, y, z);
        parent.add(g);
        const shirt = sm2(o.shirt),
          pants = sm2(o.pants || 0x3a3f4a),
          hair = sm2(o.hair || 0x1d1a18),
          eyeM = sm2(0x1a1614),
          shoeLM = sm2(0x4a3a2c);
        // ขา: ต้นขาพาดไปข้างหน้า น่องห้อยลง เท้าในรองเท้าแตะ
        for (const sx of [-1, 1]) {
          cyl(0.066, 0.07, 0.4, pants, sx * 0.095, 0.07, 0.22, g, Math.PI / 2, 0);
          ball(0.07, pants, sx * 0.095, 0.07, 0.42, g);
          cyl(0.054, 0.046, 0.38, pants, sx * 0.095, -0.12, 0.44, g);
          box(0.085, 0.045, 0.17, shoeLM, sx * 0.095, -0.33, 0.5, g);
        }
        box(0.3, 0.1, 0.3, pants, 0, 0.04, 0.02, g); // สะโพก
        // ลำตัว + ไหล่ + คอเสื้อ
        cyl(0.145, 0.17, 0.46, shirt, 0, 0.32, -0.01, g);
        ball(0.17, shirt, 0, 0.53, -0.01, g, 1.2, 0.55, 0.85);
        if (o.scarf) cyl(0.12, 0.13, 0.05, sm2(o.scarf), 0, 0.59, 0, g); // ผ้าขาวม้าพาดคอ
        cyl(0.044, 0.05, 0.09, skinM, 0, 0.63, 0, g); // คอ
        // หัว + ใบหน้า + หู
        ball(0.115, skinM, 0, 0.76, 0.01, g, 0.95, 1.08, 1.0);
        for (const sx of [-1, 1]) {
          ball(0.014, eyeM, sx * 0.042, 0.775, 0.108, g);
          ball(0.03, skinM, sx * 0.114, 0.755, 0, g, 0.5, 1, 0.8);
          box(0.05, 0.008, 0.01, hair, sx * 0.042, 0.8, 0.108, g); // คิ้ว
        }
        ball(0.022, skinM, 0, 0.745, 0.118, g, 0.8, 1, 1.1); // จมูก
        box(0.05, 0.01, 0.01, sm2(0x9a5a4a), 0, 0.71, 0.105, g); // ปาก
        // ผม
        ball(0.121, hair, 0, 0.79, -0.03, g, 1.0, 0.82, 1.02);
        if (o.long) ball(0.11, hair, 0, 0.68, -0.085, g, 1.05, 1.5, 0.75);
        // หมวก
        if (o.hat === 'ngop') {
          const hm = sm2(0xd8c08a);
          const cone = new THREE.Mesh(new THREE.ConeGeometry(0.31, 0.15, 14), hm);
          cone.position.set(0, 0.9, 0);
          g.add(cone);
          cyl(0.12, 0.125, 0.04, sm2(0x8a6a44), 0, 0.84, 0, g); // สายรัดหมวก
          ball(0.02, hm, 0, 0.99, 0, g);
        } else if (o.hat === 'cap') {
          const cm = sm2(o.hatc || 0xd9534a);
          ball(0.125, cm, 0, 0.82, 0.0, g, 1.0, 0.68, 1.05);
          box(0.14, 0.012, 0.1, cm, 0, 0.8, 0.14, g); // บังแดดหมวกแก๊ป
        }
        // แขนสองท่อน: แขนเสื้อ + ท่อนล่างผิว + ฝ่ามือ
        const arm = (sx, a1, a2) => {
          const sh = new THREE.Group();
          sh.position.set(sx * 0.2, 0.52, -0.01);
          sh.rotation.x = a1;
          sh.rotation.z = sx * 0.06;
          g.add(sh);
          ball(0.052, shirt, 0, 0, 0, sh);
          cyl(0.05, 0.043, 0.26, shirt, 0, -0.13, 0, sh);
          const el = new THREE.Group();
          el.position.set(0, -0.26, 0);
          el.rotation.x = a2;
          sh.add(el);
          cyl(0.04, 0.033, 0.24, skinM, 0, -0.12, 0, el);
          ball(0.043, skinM, 0, -0.255, 0.005, el, 0.9, 1.1, 0.8);
        };
        if (o.pose === 'steer') {
          arm(1, -0.5, -1.3); // มือที่จับคันบังคับ
          arm(-1, -0.45, -0.95); // อีกมือวางบนเข่า
        } else {
          arm(1, -0.4, -0.9);
          arm(-1, -0.4, -0.9);
        }
        return g;
      }
      function makeBoat(k, roof) {
        const g = new THREE.Group(),
          body = new THREE.Group();
        g.add(body);
        const hull = new THREE.Mesh(hullGeo, woodM);
        hull.castShadow = true;
        body.add(hull);
        // แถบสีทาขอบเรือ + กราบเรือไม้
        const paint = sm2(PAINT[k % PAINT.length]);
        box(1.02, 0.12, 4.6, paint, 0, 0.5, -0.3, body);
        for (const sx of [-0.56, 0.56]) box(0.06, 0.08, 5.6, woodDkM, sx, 0.63, -0.1, body);
        for (const z of [-1.6, -0.2, 1.2]) box(1.12, 0.05, 0.28, woodDkM, 0, 0.7, z, body); // ไม้กระดานนั่งพาดกราบเรือ
        box(0.42, 0.06, 0.3, woodDkM, 0.05, 0.66, -2.38, body); // ม้านั่งคนขับท้ายเรือ
        // พวงมาลัยผ้าสามสีผูกหัวเรือ (ตามความเชื่อแม่ย่านาง)
        [0xd9534a, 0xf0c95a, 0x3f8f5a].forEach((cc, j) => {
          const rib = new THREE.Mesh(new THREE.ConeGeometry(0.05, 0.42, 4), sm2(cc));
          rib.position.set((j - 1) * 0.06, 1.0, 3.35);
          rib.rotation.x = 0.5;
          body.add(rib);
        });
        // เครื่องยนต์ท้ายเรือ + แกนหางยาว + ใบพัด
        const eng = new THREE.Group();
        eng.position.set(0, 0.78, -3.0);
        body.add(eng);
        box(0.42, 0.36, 0.62, engineM, 0, 0.1, 0, eng);
        box(0.3, 0.12, 0.3, steelM, 0, 0.34, 0.08, eng);
        // เพลาทอดจากแท่นเครื่อง (0, 0.05, 0) ลงลาดไปท้ายเรือถึงดุมใบพัด (0, -1.05, -3.2)
        const shaft = cyl(0.036, 0.036, 3.384, steelM, 0, -0.5, -1.6, eng, Math.atan2(-3.2, -1.1), 0);
        shaft.castShadow = false;
        ball(0.075, steelM, 0, 0.05, 0, eng); // ข้อต่อหมุนเพลากับเครื่อง
        cyl(0.05, 0.05, 0.18, engineM, 0, 0.18, 0, eng); // คอเครื่องยนต์
        const prop = new THREE.Group();
        prop.position.set(0, -1.05, -3.2);
        eng.add(prop);
        for (let b = 0; b < 3; b++) {
          const bl = box(0.05, 0.36, 0.1, steelM, 0, 0, 0, prop);
          bl.rotation.z = (b / 3) * Math.PI * 2;
          bl.position.set(Math.sin(bl.rotation.z) * -0.14, Math.cos(bl.rotation.z) * 0.14, 0);
        }
        // คันบังคับยื่นจากเครื่องมาถึงมือคนขับ + ด้ามจับไม้
        cyl(0.02, 0.026, 1.15, steelM, 0.235, 0.155, 0.44, eng, Math.atan2(1.12, -0.25), 0);
        cyl(0.03, 0.03, 0.16, woodDkM, 0.25, 0.03, 1.0, eng, Math.atan2(1.12, -0.25), 0);
        cyl(0.04, 0.03, 0.14, steelM, 0, 0, 0.02, prop, Math.PI / 2, 0); // ดุมใบพัด
        // ละอองน้ำปั่นพุ่งจากใบพัดท้ายเรือ (Propeller spray rooster plume)
        const sprayGeo = new THREE.ConeGeometry(0.16, 0.85, 4);
        sprayGeo.rotateX(-Math.PI / 2); // พุ่งไปข้างหลัง (-Z)
        const spray = new THREE.Mesh(sprayGeo, sprayMat);
        spray.position.set(0, -0.22, -6.1);
        body.add(spray);
        // คนขับเรือสวมงอบ นั่งบนม้านั่งท้ายเรือ มือหนึ่งจับคันบังคับ อีกมือวางบนเข่า
        seatedPerson(body, 0.05, 0.69, -2.38, {
          shirt: [0x3d4a5c, 0x8a5a3a, 0x3f6f5a][k % 3],
          pants: 0x2f3440,
          hat: 'ngop',
          scarf: 0xd9534a,
          pose: 'steer'
        });
        // หลังคาผ้าใบกันแดดสำหรับเรือโดยสาร + ผู้โดยสาร + ตะเกียงไว้จุดตอนค่ำ
        let lamp = null;
        if (roof) {
          const rm = sm2(ROOF[k % ROOF.length]);
          for (const sx of [-0.46, 0.46]) for (const z of [-1.7, 1.0]) cyl(0.025, 0.025, 1.3, woodDkM, sx, 1.1, z, body);
          box(1.15, 0.06, 3.0, rm, 0, 1.78, -0.35, body);
          box(1.2, 0.18, 0.06, rm, 0, 1.68, 1.15, body);
          box(1.2, 0.18, 0.06, rm, 0, 1.68, -1.85, body);
          seatedPerson(body, -0.2, 0.725, -0.2, { shirt: 0xe98f7d, pants: 0x4a5266, hair: 0x241c18, long: true, pose: 'rest' });
          seatedPerson(body, 0.2, 0.725, 1.2, { shirt: 0x6e9fb0, pants: 0x3a3a42, hair: 0x2a2420, hat: 'cap', hatc: 0xf0c95a, pose: 'rest' });
          lamp = new THREE.Mesh(new THREE.SphereGeometry(0.08, 8, 6), lampM);
          lamp.position.set(0, 1.62, 1.1);
          body.add(lamp);
        }
        // คลื่นท้ายเรือรูปตัววี
        const wakeMat = new THREE.MeshBasicMaterial({ map: wakeTex, transparent: true, opacity: 0.65, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -4, polygonOffsetUnits: -4 });
        const wake = new THREE.Mesh(wakeGeo, wakeMat);
        wake.position.y = 0.13;
        g.add(wake);
        g.scale.setScalar(1.15);
        root.add(g);
        return { g, body, prop, wake, wakeMat, lamp, spray };
      }

      // ตำแหน่งบนแม่น้ำจากระยะสะสม s (ม.) + ระยะตัดขวาง lane
      function sample(s, lane, out) {
        s = Math.max(0, Math.min(TOTAL - 0.001, s));
        let lo = 0,
          hi = N - 1;
        while (lo < hi - 1) {
          const mid = (lo + hi) >> 1;
          if (LEN[mid] <= s) lo = mid;
          else hi = mid;
        }
        const f = (s - LEN[lo]) / Math.max(1e-4, LEN[hi] - LEN[lo]),
          q0 = P[lo],
          q1 = P[hi],
          ax = AX[lo] + (AX[hi] - AX[lo]) * f,
          az = AZ[lo] + (AZ[hi] - AZ[lo]) * f,
          w = q0.w + (q1.w - q0.w) * f,
          L = Math.max(-w + 3, Math.min(w - 3, lane));
        out.x = q0.x + (q1.x - q0.x) * f + ax * L;
        out.z = q0.z + (q1.z - q0.z) * f + az * L;
        out.dx = DX[lo] + (DX[hi] - DX[lo]) * f;
        out.dz = DZ[lo] + (DZ[hi] - DZ[lo]) * f;
        return out;
      }

      const boats = [
        { s: TOTAL * 0.22, v: 6.2, dir: 1, lane: 4.2, roof: true },
        { s: TOTAL * 0.55, v: 7.4, dir: -1, lane: -4.6, roof: false },
        { s: TOTAL * 0.8, v: 5.4, dir: 1, lane: 3.4, roof: false },
        { s: TOTAL * 0.38, v: 5.9, dir: -1, lane: -3.8, roof: true }
      ].map((b, k) => Object.assign(b, makeBoat(k, b.roof), { ph: k * 1.9 }));

      // ---------- 5) ท่าน้ำไม้ + ศาลาริมน้ำทรงไทยล้านนา + ท่าเรือประมง + เรือเทียบท่า ----------
      const pierPlankM1 = sm2(0x8a5d3b), // ไม้กระดานสักทอง
        pierPlankM2 = sm2(0x6b4426),     // ไม้กระดานสีเข้มสลับ
        pierBeamM = sm2(0x442c19),       // เสาเข็มและคานไม้โครงสร้าง
        mossM = sm2(0x2f442a),           // ตะไคร่น้ำเขียวที่โคนเสาเข็มจุ่มน้ำ
        cleatM = sm2(0x282c2e),          // หมุดผูกเรือเหล็กหล่อสีเข้ม
        ropeM = sm2(0xc4ad7b),           // เชือกมะนิลา
        tireM = sm2(0x18181a),           // ยางกันกระแทกสีดำด้าน
        lifebuoyM = sm2(0xe64a28),       // ห่วงชูชีพสีส้มสด
        whiteM = sm2(0xf2f2f2),          // ขาวแถบสะท้อนแสง / นกยาง
        steelM_pier = sm2(0xa0a8ac),     // ท่อเหล็ก/บันไดสแตนเลส
        salaFloorM = sm2(0x94653e),      // พื้นชานศาลาไม้
        salaRoofM = sm2(0x9e3f28),       // กระเบื้องดินเผาหลังคาศาลาล้านนา
        salaKalaeM = sm2(0xd6ad63),      // กาแลไม้ฉลุสีทอง
        clayJarM = sm2(0x6f3e24),        // โอ่งน้ำดินเผาเคลือบ
        brassM = sm2(0xd4af37),          // กระบวยทองเหลือง
        pierLampGlowM = new THREE.MeshBasicMaterial({ color: 0xffdf78 }), // หลอดไฟโคม
        pierLamps = [];

      const pierSignTex = signTex(256, 96, (c, w, h) => {
        c.fillStyle = '#422817';
        c.fillRect(0, 0, w, h);
        c.strokeStyle = '#d4af37';
        c.lineWidth = 4;
        c.strokeRect(6, 6, w - 12, h - 12);
        c.textAlign = 'center';
        c.fillStyle = '#fcecc4';
        c.font = 'bold 24px ' + FONT;
        c.fillText('ท่าเรือริมธาร', w / 2, 42);
        c.font = '14px ' + FONT;
        c.fillStyle = '#d4af37';
        c.fillText('RIVER PIER · CHIANG RAI', w / 2, 72);
      });
      const pierSignM = new THREE.MeshLambertMaterial({ map: pierSignTex });

      [Math.floor(N * 0.42), Math.floor(N * 0.66)].forEach((i, n) => {
        const q = P[i],
          pier = new THREE.Group(),
          [bx, bz] = at(i, q.w + 1.6);
        pier.position.set(bx, 0, bz);
        pier.rotation.y = Math.atan2(-AX[i], -AZ[i]); // ยื่นจากตลิ่งลงไปในน้ำ (+Z ของ pier ชี้ลงแม่น้ำ, -Z ชี้ไปหาถนน)
        root.add(pier);

        if (n === 0) {
          // ==================== [ท่าเรือหลักแห่งที่ 1: ท่าเรือริมธาร + ศาลาริมน้ำล้านนา] ====================
          
          // 1) ทางเดินไม้เชื่อมจากไหล่ทางถนนลงมายังตลิ่ง (z = -5.6 ถึง z = 0)
          for (let z = -5.6; z <= -0.2; z += 0.35) {
            const f = (z + 5.6) / 5.4, // 0 = ริมถนน, 1 = ตลิ่ง
              y = 0.52 - f * 0.08,
              m = Math.round(z * 10) % 2 === 0 ? pierPlankM1 : pierPlankM2;
            box(2.2, 0.07, 0.32, m, 0, y, z, pier);
          }
          // คานแนวยาวใต้ทางเดินเชื่อมถนน
          box(0.1, 0.12, 5.6, pierBeamM, -1.0, 0.34, -2.8, pier);
          box(0.1, 0.12, 5.6, pierBeamM, 1.0, 0.34, -2.8, pier);
          // เสาค้ำทางเดิน
          for (const sz of [-4.4, -2.2]) {
            for (const sx of [-1.0, 1.0]) cyl(0.07, 0.08, 0.75, pierBeamM, sx, 0.05, sz, pier);
          }
          // ราวกันตกทางเดินเชื่อมถนน
          for (const sx of [-1.08, 1.08]) {
            box(0.08, 0.05, 5.6, pierPlankM1, sx, 1.15, -2.8, pier); // ราวมือจับ
            box(0.05, 0.04, 5.6, pierPlankM2, sx, 0.82, -2.8, pier); // ราวคั่น
            for (const sz of [-5.6, -4.2, -2.8, -1.4, 0.0]) {
              box(0.08, 0.85, 0.08, pierBeamM, sx, 0.85, sz, pier);
            }
          }
          // ซุ้มทางเข้าสะพานจากริมถนน (Entrance Portal at z = -5.6)
          for (const sx of [-1.08, 1.08]) {
            cyl(0.09, 0.1, 2.3, pierBeamM, sx, 1.15, -5.6, pier); // เสาซุ้ม
            // โคมไฟไม้หัวเสา
            box(0.2, 0.26, 0.2, pierPlankM2, sx, 2.38, -5.6, pier);
            const lp = new THREE.Mesh(SPH, pierLampGlowM);
            lp.scale.set(0.08, 0.08, 0.08);
            lp.position.set(sx, 2.38, -5.6);
            lp.visible = false;
            pier.add(lp);
            pierLamps.push(lp);
          }
          box(2.4, 0.12, 0.12, pierBeamM, 0, 2.25, -5.6, pier); // คานขวางบน
          box(1.7, 0.62, 0.06, pierSignM, 0, 1.9, -5.6, pier);  // ป้ายไม้ชื่อท่าเรือ

          // 2) ตัวสะพานทอดยื่นลงในแม่น้ำ (Main Jetty Deck: z = 0 ถึง z = 8.4, กว้าง 2.4 ม.)
          // แผ่นกระดานไม้ระแนงปูขวางสลับเฉดสีธรรมชาติ
          for (let z = 0.0; z <= 8.4; z += 0.28) {
            const m = Math.round(z * 10) % 2 === 0 ? pierPlankM1 : pierPlankM2;
            box(2.36, 0.06, 0.25, m, 0, 0.46, z, pier);
          }
          // ไม้คิ้วกันตกขอบสะพาน (Kicker curbs)
          box(0.1, 0.11, 8.5, pierPlankM2, -1.13, 0.52, 4.2, pier);
          box(0.1, 0.11, 8.5, pierPlankM2, 1.13, 0.52, 4.2, pier);
          // คานไม้แนวยาว 3 เส้นใต้พื้นสะพาน (Stringers)
          for (const sx of [-1.0, 0.0, 1.0]) box(0.11, 0.14, 8.5, pierBeamM, sx, 0.36, 4.2, pier);

          // เสาเข็มไม้ตอกลงน้ำ + คานขวางรองหัวเสา (Piles & Pile Caps)
          const pileZ = [0.6, 2.2, 3.8, 5.4, 7.0];
          for (const z of pileZ) {
            // คานขวางรองหัวเสา
            box(2.45, 0.14, 0.16, pierBeamM, 0, 0.28, z, pier);
            // เสาเข็มคู่ ซ้าย-ขวา
            for (const sx of [-1.15, 1.15]) {
              cyl(0.09, 0.1, 1.6, pierBeamM, sx, -0.25, z, pier); // เสาไม้หยั่งลึก
              cyl(0.105, 0.105, 0.35, mossM, sx, -0.05, z, pier); // ตะไคร่น้ำเขียวที่ระดับน้ำ
            }
          }
          // คานค้ำยันไขว้รูปตัว X (Cross Bracing) ระหว่างเสาในน้ำ ให้มีมิติเชิงโครงสร้างสมจริง
          for (const z of [2.2, 5.4, 7.0]) {
            cyl(0.038, 0.038, 2.3, pierBeamM, 0, -0.22, z, pier, 0, 0.68);
            cyl(0.038, 0.038, 2.3, pierBeamM, 0, -0.22, z, pier, 0, -0.68);
          }
          // เสาคู่ดอลฟิน (Cluster Dolphin Piles) ปลายสะพาน (z = 8.4)
          for (const sx of [-1.15, 1.15]) {
            cyl(0.1, 0.11, 2.2, pierBeamM, sx, 0.25, 8.4, pier); // เสาหลักยื่นสูงพ้นสะพาน
            cyl(0.09, 0.1, 2.0, pierBeamM, sx * 0.88, 0.15, 8.55, pier); // เสาคู่ดาม
            cyl(0.125, 0.125, 0.14, ropeM, sx, 0.72, 8.4, pier); // เชือกมะนิลาพันรอบหัวเสา
          }

          // ราวสะพานไม้ + ซี่ลูกกรงตั้ง (Balusters & Railings)
          // ฝั่งซ้าย (sx = -1.15): ปิดราวยาวตลอดแนวสะพาน
          box(0.08, 0.05, 8.4, pierPlankM1, -1.15, 1.25, 4.2, pier); // ราวมือจับ
          box(0.05, 0.04, 8.4, pierPlankM2, -1.15, 0.88, 4.2, pier); // ราวกลาง
          for (let z = 0.6; z <= 8.2; z += 1.6) {
            box(0.08, 0.82, 0.08, pierBeamM, -1.15, 0.88, z, pier); // เสาราว
          }
          for (let z = 0.8; z <= 8.0; z += 0.4) {
            box(0.035, 0.68, 0.035, pierPlankM1, -1.15, 0.88, z, pier); // ซี่ลูกกรงตั้ง
          }
          // ฝั่งขวา (sx = 1.15): ทำราวจนถึง z = 6.4 (ช่วงปลาย z = 6.4 - 8.4 เปิดช่องบันไดลงเรือ)
          box(0.08, 0.05, 6.4, pierPlankM1, 1.15, 1.25, 3.2, pier);
          box(0.05, 0.04, 6.4, pierPlankM2, 1.15, 0.88, 3.2, pier);
          for (let z = 0.6; z <= 6.4; z += 1.6) {
            box(0.08, 0.82, 0.08, pierBeamM, 1.15, 0.88, z, pier);
          }
          for (let z = 0.8; z <= 6.2; z += 0.4) {
            box(0.035, 0.68, 0.035, pierPlankM1, 1.15, 0.88, z, pier);
          }

          // ม้านั่งไม้ริมราวฝั่งซ้ายมีขา + ถังไม้เก็บอุปกรณ์ปลายสะพาน
          box(0.4, 0.05, 1.3, pierPlankM1, -0.85, 0.76, 5.6, pier);
          box(0.36, 0.26, 0.05, pierBeamM, -0.85, 0.62, 5.1, pier);
          box(0.36, 0.26, 0.05, pierBeamM, -0.85, 0.62, 6.1, pier);
          cyl(0.2, 0.22, 0.5, pierPlankM2, -0.72, 0.76, 7.4, pier);
          for (const by of [0.6, 0.9]) cyl(0.215, 0.215, 0.03, steelM_pier, -0.72, by, 7.4, pier);
          cyl(0.19, 0.19, 0.03, pierBeamM, -0.72, 1.02, 7.4, pier);
          // หมุดผูกเรือเหล็กหล่อ (Mooring Cleats) 3 ตัวบนขอบไม้ฝั่งลงเรือ
          for (const cz of [2.0, 4.4, 6.4]) {
            box(0.16, 0.05, 0.07, cleatM, 1.12, 0.55, cz, pier);
            box(0.05, 0.05, 0.24, cleatM, 1.12, 0.58, cz, pier);
          }
          // ขดเชือกมะนิลาวางม้วนบนพื้นสะพาน
          cyl(0.18, 0.18, 0.04, ropeM, 0.92, 0.51, 4.6, pier);
          cyl(0.12, 0.12, 0.03, ropeM, 0.92, 0.54, 4.6, pier);

          // ยางรถยนต์กันกระแทก (Dock Bumper Tires) แขวนห้อยข้างกราบสะพาน
          for (const tz of [1.8, 4.0, 6.2]) {
            cyl(0.24, 0.24, 0.12, tireM, 1.25, 0.24, tz, pier, 1.57, 0); // ยางแขวนแนบข้าง
            cyl(0.012, 0.012, 0.32, ropeM, 1.2, 0.42, tz, pier); // เชือกแขวน
          }

          // บันไดลิงสแตนเลสทอดลงน้ำตรงปลายสะพาน (Boarding Ladder at z = 8.4)
          for (const lx of [0.4, 0.8]) {
            cyl(0.02, 0.02, 1.0, steelM_pier, lx, 0.22, 8.42, pier); // ราวสองข้าง
          }
          for (const ly of [0.42, 0.22, 0.02, -0.18]) {
            box(0.38, 0.03, 0.04, pierPlankM1, 0.6, ly, 8.42, pier); // ขั้นเหยียบไม้
          }

          // ห่วงชูชีพสีส้มสดพร้อมแถบสะท้อนแสงขาว (Lifebuoy) แขวนที่เสาราวสะพาน
          {
            const lb = new THREE.Mesh(new THREE.TorusGeometry(0.22, 0.065, 8, 16), lifebuoyM);
            lb.position.set(-1.18, 0.95, 3.8);
            lb.rotation.y = Math.PI / 2;
            pier.add(lb);
            // แถบขาวสะท้อนแสง 4 จุด
            for (let b = 0; b < 4; b++) {
              const rb = box(0.02, 0.14, 0.14, whiteM, -1.18, 0.95, 3.8, pier);
              rb.rotation.x = (b * Math.PI) / 2;
            }
          }

          // โคมไฟหัวสะพาน 2 เสา (Nautical Lantern Posts at z = 8.0)
          for (const sx of [-1.15, 1.15]) {
            cyl(0.045, 0.05, 1.2, pierBeamM, sx, 1.8, 8.0, pier); // เสาโคมไฟ
            box(0.18, 0.22, 0.18, pierPlankM2, sx, 2.45, 8.0, pier); // ตัวโคมไม้
            const lp = new THREE.Mesh(SPH, pierLampGlowM);
            lp.scale.set(0.07, 0.07, 0.07);
            lp.position.set(sx, 2.45, 8.0);
            lp.visible = false;
            pier.add(lp);
            pierLamps.push(lp);
          }

          // นกกระยางขาว (White Egret / Heron) ยืนเกาะอย่างสงบที่หัวเสาเข็มปลายสะพาน
          {
            const egret = new THREE.Group();
            egret.position.set(-1.15, 1.35, 8.4);
            pier.add(egret);
            // ขานกสีดำ
            cyl(0.012, 0.012, 0.22, sm2(0x222222), -0.025, 0.11, 0, egret);
            cyl(0.012, 0.012, 0.22, sm2(0x222222), 0.025, 0.11, 0, egret);
            // ลำตัวรูปไข่สีขาวบริสุทธิ์
            ball(0.11, whiteM, 0, 0.28, -0.04, egret, 0.9, 1.1, 1.5);
            // คอยาวโค้งรูปตัว S + หัว
            cyl(0.022, 0.028, 0.26, whiteM, 0, 0.44, 0.06, egret, 0.35, 0);
            ball(0.045, whiteM, 0, 0.58, 0.12, egret, 0.8, 0.9, 1.2);
            // จะงอยปากสีเหลืองทองแหลม
            const beak = new THREE.Mesh(new THREE.ConeGeometry(0.016, 0.16, 4), sm2(0xe5a93b));
            beak.position.set(0, 0.57, 0.22);
            beak.rotation.x = Math.PI / 2;
            egret.add(beak);
          }

          // 3) ศาลาท่าน้ำทรงไทยล้านนา (Lanna Style Riverside Pavilion)
          // ตั้งอยู่บนชานตลิ่งข้างสะพาน (เยื้องไปทางขวา x = 3.4, z = -2.6) เพื่อไม่ให้บังทางเดิน และมีชานไม้เชื่อมเข้าสู่สะพาน
          const sala = new THREE.Group();
          sala.position.set(3.4, 0, -2.6);
          pier.add(sala);

          // ชานไม้ทางเดินเชื่อมระหว่างตัวสะพานกับศาลา
          box(1.6, 0.08, 1.8, pierPlankM1, 2.0, 0.46, -2.6, pier);
          box(0.08, 0.05, 1.8, pierPlankM1, 2.0, 1.25, -1.7, pier); // ราวมือจับข้างชาน

          // ฐานยกพื้น 2 ชั้นของศาลา
          box(4.4, 0.24, 4.0, pierBeamM, 0, 0.22, 0, sala);       // ฐานชั้นล่าง
          box(3.6, 0.16, 3.2, salaFloorM, 0, 0.40, 0, sala);      // ฐานยกพื้นศาลา
          // บันไดไม้ 2 ขั้นทางเข้าศาลาฝั่งเชื่อมสะพาน (x = -1.9)
          box(0.3, 0.12, 1.6, pierPlankM2, -1.95, 0.22, 0, sala);

          // เสาศาลาไม้ 4 ต้น + คานรัดรอบ 4 ด้าน
          for (const sx of [-1.45, 1.45]) {
            for (const sz of [-1.25, 1.25]) {
              cyl(0.1, 0.11, 2.5, pierBeamM, sx, 1.6, sz, sala); // เสาไม้กลม
              // ค้ำยันหูช้างไม้แกะสลัก 4 มุม (Eave Brackets)
              cyl(0.035, 0.035, 0.72, pierPlankM1, sx * 0.85, 2.45, sz * 0.85, sala, sz > 0 ? -0.7 : 0.7, sx > 0 ? 0.7 : -0.7);
            }
          }
          // คานไม้รัดเสา 4 ทิศ (Architrave beams)
          for (const sx of [-1.45, 1.45]) box(0.12, 0.14, 2.7, pierBeamM, sx, 2.78, 0, sala);
          for (const sz of [-1.25, 1.25]) box(3.1, 0.14, 0.12, pierBeamM, 0, 2.78, sz, sala);

          // ม้านั่งยาวรูปตัว U 3 ด้าน (มีพนักพิงไม้ระแนง)
          // โครงรองรับม้านั่ง (ขาและแผ่นปิดข้าง) ไม่ให้ลอยเหนือพื้นศาลา
          box(0.4, 0.17, 2.2, pierPlankM2, 1.35, 0.565, 0, sala);
          box(2.7, 0.17, 0.4, pierPlankM2, 0, 0.565, -1.15, sala);
          box(2.7, 0.17, 0.4, pierPlankM2, 0, 0.565, 1.15, sala);
          box(0.48, 0.08, 2.3, pierPlankM1, 1.35, 0.65, 0, sala);    // ม้านั่งฝั่งตะวันออก
          box(2.8, 0.08, 0.48, pierPlankM1, 0, 0.65, -1.15, sala);   // ม้านั่งฝั่งเหนือ
          box(2.8, 0.08, 0.48, pierPlankM1, 0, 0.65, 1.15, sala);    // ม้านั่งฝั่งใต้
          // พนักพิงหลัง
          box(0.06, 0.38, 2.3, pierPlankM2, 1.55, 0.88, 0, sala);
          box(2.8, 0.38, 0.06, pierPlankM2, 0, 0.88, -1.35, sala);
          box(2.8, 0.38, 0.06, pierPlankM2, 0, 0.88, 1.35, sala);
          // โต๊ะกลางไม้กลม
          cyl(0.42, 0.42, 0.06, pierPlankM1, 0, 0.62, 0, sala);
          cyl(0.08, 0.09, 0.42, pierBeamM, 0, 0.40, 0, sala);

          // โอ่งน้ำดินเผาโบราณ + ฝาไม้ + กระบวยตักน้ำทองเหลือง (Northern Clay Water Jar)
          cyl(0.18, 0.24, 0.46, clayJarM, -1.2, 0.68, -0.9, sala);
          cyl(0.22, 0.22, 0.04, pierPlankM2, -1.2, 0.93, -0.9, sala); // ฝาไม้
          cyl(0.015, 0.015, 0.38, brassM, -1.15, 0.96, -0.85, sala, 0.5, 0.4); // กระบวยทองเหลือง

          // โครงหลังคาซ้อน 2 ชั้นสไตล์ล้านนา (Two-Tier Lanna Roof)
          // ชั้นล่าง (Lower Eaves): แผ่กว้าง 4.6 x 4.2 ม.
          for (const sx of [-1, 1]) {
            const r1 = box(2.4, 0.08, 4.3, salaRoofM, sx * 1.05, 3.12, 0, sala);
            r1.rotation.z = sx * -0.52;
          }
          // ชั้นบน (Upper Tier Gable): จั่วยกสูงตรงกลาง กว้าง 3.0 x 3.6 ม.
          for (const sx of [-1, 1]) {
            const r2 = box(1.7, 0.08, 3.7, salaRoofM, sx * 0.72, 3.82, 0, sala);
            r2.rotation.z = sx * -0.72;
          }
          // สันจั่วหลังคาประดับสีทอง (Roof Ridge)
          box(0.12, 0.14, 3.9, salaKalaeM, 0, 4.38, 0, sala);

          // กาแลล้านนา (Kalae - ไม้แกะสลักไขว้เอกลักษณ์ภาคเหนือ) ที่ยอดจั่วทั้ง 2 ด้าน
          for (const zg of [-1.86, 1.86]) {
            const kl1 = box(0.06, 0.74, 0.04, salaKalaeM, -0.2, 4.56, zg, sala);
            kl1.rotation.z = -0.52;
            const kl2 = box(0.06, 0.74, 0.04, salaKalaeM, 0.2, 4.56, zg, sala);
            kl2.rotation.z = 0.52;
          }

          // โคมไฟล้านนาแขวนกึ่งกลางเพดานศาลา (Hanging Lanna Lantern)
          cyl(0.015, 0.015, 0.8, sm2(0x333333), 0, 3.7, 0, sala); // สายแขวน
          box(0.24, 0.32, 0.24, pierPlankM2, 0, 3.15, 0, sala); // ตัวโคมหกเหลี่ยม
          const salaLp = new THREE.Mesh(SPH, pierLampGlowM);
          salaLp.scale.set(0.1, 0.1, 0.1);
          salaLp.position.set(0, 3.15, 0);
          salaLp.visible = false;
          sala.add(salaLp);
          pierLamps.push(salaLp);
        } else {
          // ==================== [ท่าเรือที่ 2: ท่าเรือชุมชนประมงพื้นบ้าน] ====================
          // ทางเดินไม้ทอดลงน้ำ กว้าง 2.0 ม. ยาว 7.4 ม.
          for (let z = 0; z <= 7.4; z += 0.3) {
            const m = Math.round(z * 10) % 2 === 0 ? pierPlankM1 : pierPlankM2;
            box(2.0, 0.06, 0.26, m, 0, 0.42, z, pier);
          }
          // ต่อพื้นไม้ช่วงเพิงถึงหัวสะพาน (เดิมมีช่องว่าง) + ไม้คิ้วขอบ
          for (let z = -1.3; z < 0; z += 0.3) {
            const m = Math.round(z * 10) % 2 === 0 ? pierPlankM1 : pierPlankM2;
            box(2.0, 0.06, 0.26, m, 0, 0.42, z, pier);
          }
          box(0.09, 0.1, 7.5, pierPlankM2, -0.96, 0.48, 3.7, pier);
          box(0.09, 0.1, 7.5, pierPlankM2, 0.96, 0.48, 3.7, pier);
          for (const sx of [-0.96, 0.96]) box(0.09, 0.1, 1.3, pierPlankM2, sx, 0.48, -0.65, pier);
          for (const sx of [-0.85, 0.85]) box(0.1, 0.14, 8.8, pierBeamM, sx, 0.34, 2.9, pier);
          // ราวตากปลา: เสา 2 ต้น คานพาด และปลาห้อยเรียงแถว
          for (const rz of [1.3, 3.1]) cyl(0.04, 0.045, 1.3, pierBeamM, -0.74, 1.05, rz, pier);
          const fishRodM = sm2(0x6a4a2c), fishM = sm2(0xb9c6cc);
          cyl(0.025, 0.025, 1.9, fishRodM, -0.74, 1.62, 2.2, pier, Math.PI / 2, 0);
          for (let fz = 1.5; fz <= 2.95; fz += 0.28) {
            cyl(0.006, 0.006, 0.16, ropeM, -0.74, 1.54, fz, pier);
            ball(0.07, fishM, -0.74, 1.38, fz, pier, 0.45, 2.1, 0.35);
          }
          // เสาเข็มไม้ตอก 4 คู่
          for (const z of [0.6, 2.6, 4.8, 7.0]) {
            box(2.1, 0.12, 0.14, pierBeamM, 0, 0.26, z, pier);
            for (const sx of [-0.95, 0.95]) {
              cyl(0.08, 0.09, 1.5, pierBeamM, sx, -0.22, z, pier);
              cyl(0.095, 0.095, 0.35, mossM, sx, -0.05, z, pier);
            }
          }
          // คานค้ำยันไขว้
          cyl(0.035, 0.035, 2.0, pierBeamM, 0, -0.2, 4.8, pier, 0, 0.65);
          cyl(0.035, 0.035, 2.0, pierBeamM, 0, -0.2, 4.8, pier, 0, -0.65);

          // ราวไม้ฝั่งซ้าย
          box(0.07, 0.05, 7.4, pierPlankM1, -0.96, 1.15, 3.7, pier);
          for (let z = 0.6; z <= 7.0; z += 1.6) box(0.07, 0.75, 0.07, pierBeamM, -0.96, 0.82, z, pier);

          // เพิงพักไม้ชาวประมง (Fisherman's Lean-To Shed at z = -2.4)
          const shed = new THREE.Group();
          shed.position.set(0, 0, -2.4);
          pier.add(shed);
          box(2.8, 0.18, 2.4, pierBeamM, 0, 0.18, 0, shed);
          box(2.4, 0.1, 2.0, pierPlankM2, 0, 0.32, 0, shed);
          // เสาเพิง 4 ต้น
          for (const sx of [-1.1, 1.1]) {
            cyl(0.08, 0.09, 2.4, pierBeamM, sx, 1.5, -0.9, shed);
            cyl(0.08, 0.09, 2.1, pierBeamM, sx, 1.35, 0.9, shed);
          }
          // หลังคาเพิงเอียง
          const shedRoof = box(2.6, 0.06, 2.3, sm2(0x5a6369), 0, 2.58, 0, shed);
          shedRoof.rotation.x = 0.15;

          // ลังไม้ใส่ปลา 3 ใบ (Fish Crates)
          box(0.55, 0.28, 0.38, pierPlankM1, 0.6, 0.52, -0.2, shed);
          box(0.55, 0.28, 0.38, pierPlankM2, 0.6, 0.52, 0.3, shed);
          box(0.52, 0.26, 0.36, pierPlankM1, 0.6, 0.78, 0.05, shed);
          // ถังน้ำพลาสติกชาวประมง 2 ถัง
          cyl(0.18, 0.16, 0.42, sm2(0x285f82), -0.7, 0.58, 0.2, shed);
          cyl(0.16, 0.14, 0.36, sm2(0xc44535), -0.7, 0.55, -0.4, shed);
          // ทุ่นลอยสีส้ม 3 ลูก + พายไม้พิงเสาเพิง
          ball(0.13, sm2(0xe05a3a), -0.15, 0.5, -0.55, shed);
          ball(0.12, sm2(0xe8c542), 0.1, 0.49, -0.75, shed);
          ball(0.12, sm2(0xe05a3a), -0.3, 0.49, -0.85, shed);
          cyl(0.02, 0.022, 1.9, woodDkM, 1.0, 1.2, -0.55, shed, 0, -0.13);
          box(0.16, 0.5, 0.025, woodM, 1.22, 0.3, -0.55, shed);
          // ตาข่ายดักปลาพับพาดไว้
          box(0.42, 0.14, 0.65, sm2(0x6e786b), -0.6, 0.44, 0.8, shed);
          // คันเบ็ดตกปลาปักพิงราวสะพาน
          cyl(0.015, 0.02, 2.4, sm2(0x3a3a3a), -0.92, 1.4, 4.2, pier, -0.6, 0.3);

          // โคมไฟเพิงประมง
          const shedLp = new THREE.Mesh(SPH, pierLampGlowM);
          shedLp.scale.set(0.08, 0.08, 0.08);
          shedLp.position.set(0, 2.3, 0);
          shedLp.visible = false;
          shed.add(shedLp);
          pierLamps.push(shedLp);
        }

        // 4) เรือจอดเทียบท่า (Moored Boat with Mooring Rope & Gangplank)
        const moored = makeBoat(n + 4, n === 1);
        moored.wake.visible = false;
        if (moored.spray) moored.spray.visible = false;
        // เรือจอดขนานตัวสะพานด้านขวา (+x ของท่า) แปลงพิกัดท่า → โลกด้วยมุมหมุนของท่า
        {
          const th = pier.rotation.y,
            cs = Math.cos(th),
            sn = Math.sin(th),
            bLX = n === 0 ? 2.2 : 2.0, // ระยะข้างสะพาน (เหลือช่องว่างให้ยางกันกระแทก)
            bLZ = n === 0 ? 5.0 : 4.9; // กึ่งกลางเรือตามความยาวสะพาน (อยู่ในน้ำ ไม่ซ้อนตลิ่ง)
          moored.g.position.set(bx + bLX * cs + bLZ * sn, WY - 0.14, bz - bLX * sn + bLZ * cs);
          moored.g.rotation.y = th + (n ? Math.PI : 0);
        }
        boats.push(Object.assign(moored, { moored: true, ph: 3 + n * 2.3 }));

        // แผ่นไม้พาดจากพื้นสะพานขึ้นกราบเรือ (Gangplank) + ราวเชือกข้างแผ่นไม้
        {
          const gpX = n === 0 ? 1.5 : 1.3,
            gpZ = n === 0 ? 7.2 : 5.4,
            gp = box(0.95, 0.05, 0.5, pierPlankM1, gpX, 0.58, gpZ, pier);
          gp.rotation.z = 0.28;
          for (const dz of [-0.23, 0.23]) {
            const gr = box(0.95, 0.025, 0.025, ropeM, gpX, 0.86, gpZ + dz, pier);
            gr.rotation.z = 0.28;
            box(0.03, 0.34, 0.03, pierBeamM, gpX - 0.4, 0.66, gpZ + dz, pier);
            box(0.03, 0.34, 0.03, pierBeamM, gpX + 0.4, 0.78, gpZ + dz, pier);
          }
          // เชือกมะนิลาผูกเรือกับหลักบนสะพาน (ทอดตามขวางสะพานไปที่กราบเรือ)
          const rz = n === 0 ? 4.4 : 3.6;
          if (n === 1) {
            box(0.16, 0.05, 0.07, cleatM, 0.96, 0.5, rz, pier);
            box(0.05, 0.05, 0.24, cleatM, 0.96, 0.53, rz, pier);
          }
          cyl(0.016, 0.016, n === 0 ? 0.62 : 0.5, ropeM, n === 0 ? 1.4 : 1.15, 0.6, rz, pier, 0, Math.PI / 2 - 0.12);
        }
      });

      const tmp = { x: 0, z: 0, dx: 0, dz: 1 };
      let nearest = 1e9;
      function update(dt, time) {
        const ud = root.userData;
        if (ud.rippleTex) {
          ud.rippleTex.offset.y -= dt * 0.045; // กระแสน้ำไหลเอื่อย ๆ
          ud.rippleTex.offset.x = Math.sin(time * 0.3) * 0.02;
          ud.rippleMat.opacity = state.night ? 0.16 : 0.42;
        }
        if (pierLamps.length) {
          for (let li = 0; li < pierLamps.length; li++) pierLamps[li].visible = state.night;
        }
        const cx = car.position.x,
          cz = car.position.z;
        nearest = 1e9;
        for (const b of boats) {
          const bob = Math.sin(time * 1.6 + b.ph) * 0.035;
          if (b.moored) {
            b.body.rotation.z = Math.sin(time * 1.1 + b.ph) * 0.025;
            b.body.position.y = bob;
            if (b.lamp) b.lamp.visible = state.night;
            continue;
          }
          b.s += b.dir * b.v * dt;
          // วิ่งสุดปลายแม่น้ำ (ในหมอก) แล้ววนกลับเข้ามาใหม่จากอีกด้าน
          if (b.s > TOTAL - 4) b.s = 4;
          else if (b.s < 4) b.s = TOTAL - 4;
          sample(b.s, b.lane + Math.sin(time * 0.13 + b.ph) * 1.4, tmp);
          const dx = tmp.x - cx,
            dz = tmp.z - cz,
            d2 = dx * dx + dz * dz;
          if (d2 < nearest) nearest = d2;
          b.g.visible = d2 < 190 * 190;
          if (!b.g.visible) continue;
          b.g.position.set(tmp.x, WY - 0.14, tmp.z);
          const yaw = Math.atan2(tmp.dx * b.dir, tmp.dz * b.dir);
          let dy = yaw - b.g.rotation.y;
          dy = Math.atan2(Math.sin(dy), Math.cos(dy));
          b.g.rotation.y += dy * Math.min(1, dt * 3);
          b.body.position.y = bob;
          b.body.rotation.x = -0.045 + Math.sin(time * 2.1 + b.ph) * 0.012; // หัวเรือเชิดขึ้นตอนวิ่ง
          b.body.rotation.z = Math.sin(time * 1.3 + b.ph) * 0.03 - dy * 0.4;
          b.prop.rotation.z += dt * 38;
          if (b.spray) {
            const sc = 0.85 + Math.sin(time * 22 + b.ph) * 0.25;
            b.spray.scale.set(sc, sc, 1.0 + Math.cos(time * 19 + b.ph) * 0.35);
          }
          b.wakeMat.opacity = (state.night ? 0.3 : 0.62) * (0.85 + Math.sin(time * 5 + b.ph) * 0.15);
          if (b.lamp) b.lamp.visible = state.night;
        }
      }
      return { root, update, nearBoat: () => Math.sqrt(nearest) };
    })();
    window.__RIVER = RIVER;

    // --- สร้าง UI สำหรับแสดง FPS ---
    const fpsCounter = document.createElement('div');
    fpsCounter.style.display = 'inline-flex';
    fpsCounter.style.alignItems = 'center';
    fpsCounter.style.background = 'rgba(0, 0, 0, 0.25)'; // แมตช์กับปุ่มอื่นด้านในกรอบ
    fpsCounter.style.border = '1px solid rgba(255, 255, 255, 0.08)';
    fpsCounter.style.boxShadow = 'inset 0 2px 6px rgba(0, 0, 0, 0.2)';
    fpsCounter.style.padding = '8px 14px';
    fpsCounter.style.borderRadius = '999px';
    fpsCounter.style.fontSize = '12px';
    fpsCounter.style.fontFamily = '"Outfit", "Noto Sans Thai", sans-serif';
    fpsCounter.style.fontWeight = '500';
    fpsCounter.style.color = '#ffffff';
    fpsCounter.style.pointerEvents = 'none'; 
    fpsCounter.textContent = 'FPS: --';
    // ---------------------------------

    let fpsFrames = 0;
    let fpsLastTime = performance.now();
    const performanceHotspots = [
      ...(window.__TEMPLES || []).map(temple => ({ x: temple.x, z: temple.z, radius: 92, label: 'งานวัด' })),
      ...[T_SCHOOL_FIELD, 0.81].map(t => {
        const point = route.getPoint(t);
        return { x: point.x, z: point.z, radius: 76, label: 'โรงเรียน' };
      }),
      ...ROUTE.filter(stop => ['janjawa', 'chiangsaen', 'chiangkhong', 'wiangkaen'].includes(stop.id)).map(stop => {
        const point = route.getPoint(stop.t);
        return { x: point.x, z: point.z, radius: 82, label: 'ในเมือง' };
      })
    ];
    let hotspotCheckMs = 0;

    function updatePerformanceHotspot(frameMs) {
      hotspotCheckMs += frameMs;
      if (hotspotCheckMs < 500) return;
      hotspotCheckMs = 0;

      const x = car.position.x,
        z = car.position.z;
      let label = '';
      for (const hotspot of performanceHotspots) {
        const dx = x - hotspot.x,
          dz = z - hotspot.z;
        if (dx * dx + dz * dz <= hotspot.radius * hotspot.radius) {
          label = hotspot.label;
          break;
        }
      }
      if (label !== performanceHotspotLabel) {
        performanceHotspotLabel = label;
        nearPerformanceHotspot = !!label;
        applyQuality();
      }
    }
    // ---------------------------------

    function frame(ms) {
      requestAnimationFrame(frame);

      const frameMs = lastTime ? ms - lastTime : 16;
      lastTime = ms;
      if (document.hidden || currentView !== 'home') {
        fpsFrames = 0;
        fpsLastTime = performance.now();
        return;
      }

      updatePerformanceHotspot(frameMs);
      fpsFrames++;
      const fpsNow = performance.now();
      if (fpsNow - fpsLastTime >= 1000) {
        const fps = Math.round((fpsFrames * 1000) / (fpsNow - fpsLastTime));
        fpsCounter.textContent = 'FPS: ' + fps;
        // เปลี่ยนสีตัวหนังสือตามความลื่น (สีสว่างขึ้นเพื่อตัดกับพื้นหลังกระจก)
        if (fps >= 50) fpsCounter.style.color = '#6ee7b7'; // สีเขียวมิ้นต์ (ลื่นมาก)
        else if (fps >= 30) fpsCounter.style.color = '#fcd34d'; // สีเหลืองทอง (พอใช้)
        else fpsCounter.style.color = '#fca5a5'; // สีแดงพาสเทล (กระตุก)
        
        fpsFrames = 0;
        fpsLastTime = fpsNow;
      }

      let dt = Math.min(frameMs / 1000, 0.05);
      samplePerformance(frameMs);
      totalTime += dt;
      if (state.night || !window._schoolCrossingActive) {
        window._schoolCrossingStopped = false;
      }
      updateTraffic(dt);
      {
        const tg = dirT < 0 ? 1 : 0;
        turn += (tg - turn) * Math.min(1, dt * 2);
        const turning = Math.abs(turn - tg) > 0.03;
        if (!state.reduced && !turning) {
          const effSpeedMul = speedMul * (window._playerBrake || 1) * (window._playerBoost || 1);
          const pT = state.routeT,
            sp =
              ((DS = Math.max(
                150,
                route.getPoint(state.routeT).distanceTo(route.getPoint((state.routeT + 0.002) % 1)) / 0.002
              )),
              (((dirT * dt * effSpeedMul * KMH) / 3600) * ARCJ) / KM_TOTAL / DS);
          let nextRouteT = state.routeT + sp;
          if (dirT > 0 && !state.night && window._schoolCrossingActive) {
            const stopT = window._schoolCrossingStopT;
            const crossingT = window._schoolCrossingT;
            if (state.routeT < stopT && nextRouteT >= stopT) {
              nextRouteT = stopT;
            } else if (state.routeT >= stopT && state.routeT <= crossingT + 0.002) {
              nextRouteT = state.routeT;
            }

            if (nextRouteT !== state.routeT && nextRouteT === stopT && !window._schoolCrossingStopped) {
              toast('หยุดรถให้เด็กนักเรียนข้ามถนน');
              window._schoolCrossingStopped = true;
            } else if (state.routeT >= stopT && state.routeT <= crossingT + 0.002) {
              window._schoolCrossingStopped = true;
            }
          } else {
            window._schoolCrossingStopped = false;
          }
          state.routeT = nextRouteT;
          if (pT < T1 && state.routeT >= T1)
            toast('ถึงเวียงแก่นแล้ว · เส้นทางต่อไปดอยผาตั้งและภูชี้ฟ้า');
          if (pT < T2 && state.routeT >= T2)
            toast('ถึงดอยผาตั้งแล้ว · มุ่งหน้าต่อไปยังภูชี้ฟ้า');
          if (pT < T3 && state.routeT >= T3)
            toast('ถึงภูชี้ฟ้าแล้ว · สิ้นสุดเส้นทาง 200 กม.');
          if (!isFinite(state.routeT)) state.routeT = T0;
          if (state.routeT >= 1) state.routeT -= 1;
          else if (state.routeT < 0) state.routeT += 1;
          if (state.routeT >= pT) storyCheck(pT, state.routeT);
          updateRouteUI();
        }
      }
      const driveCurve = route,
        driveT = state.routeT,
        p = driveCurve.getPoint(driveT),
        tan = driveCurve.getTangent(driveT);
      n0.set(-tan.z, 0, tan.x);
      const ovtShift = (turn > 0.5 ? -1 : 1) * (window._ovt || 0);
      car.position.copy(p).addScaledVector(n0, -LANE * (1 - 2 * turn) + ovtShift);
      car.position.y = Math.sin(totalTime * 7) * 0.015;
      const ovtTiltAngle = (turn > 0.5 ? -1 : 1) * Math.max(-0.06, Math.min(0.06, (window._ovtTilt || 0) * 0.035));
      car.rotation.y = Math.atan2(tan.x, tan.z) + Math.PI * turn + ovtTiltAngle;
      {
        // ล้อหมุนตามความเร็วจริงของรถ: เร่งแซงหมุนเร็วขึ้น ชะลอตามท้ายคันหน้าก็หมุนช้าลงตามจังหวะรถ
        const _bo = window._playerBoost || 1,
          _br = window._playerBrake == null ? 1 : window._playerBrake;
        let _m = 1 + (_bo > 1.01 ? _bo - 1 : 0) - (_br < 0.99 ? 1 - _br : 0);
        _m = Math.max(0.05, Math.min(2, _m));
        window._wheelMul = (window._wheelMul == null ? 1 : window._wheelMul) + (_m - (window._wheelMul == null ? 1 : window._wheelMul)) * Math.min(1, dt * 4);
        const _spin = window._schoolCrossingStopped ? 0 : dt * 2.5 * Math.min(speedMul / 5, 4) * window._wheelMul;
        wheels.forEach(w => (w.rotation.x += _spin));
      }
      // คืนสายตากลับมาด้านหน้าอัตโนมัติอย่างนุ่มนวลเมื่อปล่อยเมาส์/นิ้วในห้องโดยสารเกิน 3.8 วินาที
      if (cockpit && !drag && performance.now() - lastCockDragTime > 3800) {
        targetAngle += (0 - targetAngle) * Math.min(1, dt * 0.85);
        pitch += (-0.025 - pitch) * Math.min(1, dt * 0.65);
      }
      angle += (targetAngle - angle) * Math.min(1, dt * 6);
      const a = Math.atan2(tan.x, tan.z) + angle + Math.PI * turn;
      desiredCamera.set(
        car.position.x - Math.sin(a) * camDist,
        p.y + 2.4 + camDist * 0.12,
        car.position.z - Math.cos(a) * camDist
      );
      if (cockpit) {
        const f2 = driveCurve.getTangent((driveT + 0.028 * dirT + 1) % 1),
          dr = tan.x * f2.z - tan.z * f2.x,
          ovtSteer = Math.max(-0.35, Math.min(0.35, (window._ovtTilt || 0) * 0.28 * (turn > 0.5 ? -1 : 1))),
          steerTarget = Math.max(-1.1, Math.min(1.1, dr * 2.5 * dirT + ovtSteer)) + Math.sin(totalTime * 1.4) * 0.022;
        swG.rotation.z += (steerTarget - swG.rotation.z) * Math.min(1, dt * 4.5);

        // พวงมาลัยดอกมะลิ ตุงใยแมงมุม พวงกุญแจไม้สัก และใบไม้จิ๋วแกว่งไกวตามแรงเหวี่ยงโค้งและจังหวะรถ
        const swayForce = -swG.rotation.z * 0.28 + Math.sin(totalTime * 2.4) * 0.042;
        garlandG.rotation.z += (swayForce - garlandG.rotation.z) * Math.min(1, dt * 5);
        garlandG.rotation.x = Math.cos(totalTime * 1.9) * 0.028;
        if (typeof tungG !== 'undefined') {
          tungG.rotation.z += (swayForce * 0.85 + Math.cos(totalTime * 2.8) * 0.03 - tungG.rotation.z) * Math.min(1, dt * 5);
          tungG.rotation.y = Math.sin(totalTime * 1.5) * 0.35;
        }
        if (typeof keyTagG !== 'undefined') {
          keyTagG.rotation.z += (-swG.rotation.z * 0.35 + Math.sin(totalTime * 5.2) * 0.06 - keyTagG.rotation.z) * Math.min(1, dt * 6);
        }
        plantLeavesG.rotation.z = Math.sin(totalTime * 3.8) * 0.04 - swG.rotation.z * 0.08;

        // อาการโคลงตัวรถตามโค้ง (Cabin Roll) และการยุบตัวเวลาชะลอ/เร่งแซง (Pitch)
        const _brVal = window._playerBrake == null ? 1 : window._playerBrake;
        const _boVal = window._playerBoost || 1;
        const targetRoll = Math.max(-0.026, Math.min(0.026, -swG.rotation.z * 0.022));
        const targetCabPitch = (_brVal < 0.95 ? (1 - _brVal) * 0.018 : 0) - (_boVal > 1.05 ? (_boVal - 1) * 0.014 : 0);
        window._cabRoll = (window._cabRoll || 0) + (targetRoll - (window._cabRoll || 0)) * Math.min(1, dt * 5);
        window._cabPitch = (window._cabPitch || 0) + (targetCabPitch - (window._cabPitch || 0)) * Math.min(1, dt * 5);

        // มองนำเข้าหาหัวโค้งอัตโนมัติ (Natural Apex Curve Look-Ahead) ผสานกับมุมที่ผู้เล่นหันมอง
        const curveLook = Math.max(-0.18, Math.min(0.18, -dr * 0.52 * dirT));
        window._curveLook = (window._curveLook || 0) + (curveLook - (window._curveLook || 0)) * Math.min(1, dt * 3.2);

        const th = car.rotation.y,
          ya = Math.atan2(tan.x, tan.z) + angle * 1.55 + window._curveLook + Math.PI * turn,
          cp = Math.cos(pitch - window._cabPitch);

        // Micro-suspension: ความนุ่มนวลของเบาะและช่วงล่างตามความเร็ว
        const spdFactor = window._schoolCrossingStopped ? 0.15 : Math.min(1.3, (speedMul / 12) * (window._wheelMul || 1));
        const seatBobY = (Math.sin(totalTime * 6.4) * 0.0045 + Math.sin(totalTime * 13.7) * 0.0018) * spdFactor;
        const seatSwayX = Math.cos(totalTime * 3.2) * 0.003 * spdFactor;

        // ตำแหน่งสายตาคนขับพร้อมการขยับศีรษะเล็กน้อยตามมุมที่หันมอง (Natural Head Pivot)
        const headShiftR = -0.35 + Math.sin(angle) * 0.04 + seatSwayX;
        const headShiftF = -0.09 + (1 - Math.cos(angle)) * 0.03;
        camera.position.set(
          car.position.x + headShiftR * Math.cos(th) + headShiftF * Math.sin(th),
          car.position.y + 1.335 + seatBobY,
          car.position.z - headShiftR * Math.sin(th) + headShiftF * Math.cos(th)
        );
        camera.up.set(Math.sin(window._cabRoll) * 0.65, 1, 0).normalize();
        targetPoint.set(
          camera.position.x + Math.sin(ya) * cp * 10,
          camera.position.y + Math.sin(pitch - window._cabPitch) * 10 - 0.02,
          camera.position.z + Math.cos(ya) * cp * 10
        );
        camera.lookAt(targetPoint);
        if (Math.abs(camera.fov - fovC) > 0.05) {
          camera.fov += (fovC - camera.fov) * Math.min(1, dt * 8);
          camera.updateProjectionMatrix();
        }
        cock.position.copy(car.position);
        cock.rotation.set(window._cabPitch, th, window._cabRoll);
        if (eOsc && eCtx.state === 'running')
          eOsc.frequency.setTargetAtTime(
            38 + Math.sqrt(speedMul) * 4 + Math.sin(totalTime * 3) * 1.2,
            eCtx.currentTime,
            0.25
          );
      } else {
        camera.up.set(0, 1, 0);
        // ใช้ totalTime < 0.1 เพื่อบังคับให้กล้องตัดไปจุดที่ตั้งไว้ทันทีในเสี้ยววินาทีแรก
        camera.position.lerp(desiredCamera, totalTime < 0.1 ? 1 : Math.min(1, dt * 4));
        targetPoint.set(car.position.x, p.y + 1.2, car.position.z);
        camera.lookAt(targetPoint);
      }
      camera.updateMatrixWorld();
      placeBubble();
      scene.background.lerp(desiredSky, dt * 2);
      scene.fog.color.copy(scene.background);
      groundMat.color.lerp(desiredGround, dt * 2);
      treeMat.color.lerp(desiredTree, dt * 2);
      treeMat2.color.copy(treeMat.color).lerp(_cTreeTint, 0.18);
      hillMat.color.lerp(desiredGround, dt);
      hillFar.color.lerp(desiredFar, dt);
      updateWetRoad(dt);
      roadMat.color.lerp(wetRoad.col, dt);
      if (!state.reduced) {
        const cx0 = car.position.x,
          cz0 = car.position.z;
        birds.forEach((b, idx) => {
          b.visible = !state.night;
          if (state.night) return;
          const u = b.userData;
          u.ph += dt * u.sp;
          const sg = Math.sign(u.sp) || 1;
          let bx = 0,
            by = u.alt,
            bz = 0,
            vx = 0,
            vy = 0,
            vz = 1,
            bank = 0,
            isGliding = false;

          if (u.mode === 'soar') {
            // 1. บินร่อนเป็นวงกว้างสลับกางปีกรับลม (Soaring & Thermal Gliding)
            bx = cx0 + u.ox + Math.cos(u.ph) * u.r;
            bz = cz0 + u.oz + Math.sin(u.ph) * u.r * 0.78;
            by = u.alt + Math.sin(u.ph * 2) * 0.9;
            vx = -Math.sin(u.ph) * u.r * sg;
            vz = Math.cos(u.ph) * u.r * 0.78 * sg;
            vy = Math.cos(u.ph * 2) * 0.45 * sg;
            bank = -0.26 * sg;
            isGliding = Math.sin(totalTime * 1.3 + u.glidePh) > -0.15;
          } else if (u.mode === 'fig8') {
            // 2. บินโฉบเป็นเลข 8 ขึ้นลงพลิ้วไหว (Figure-8 Lissajous Flight)
            const a = u.ph;
            bx = cx0 + u.ox + Math.sin(a) * u.r;
            bz = cz0 + u.oz + Math.sin(a * 2) * u.r * 0.52;
            by = u.alt + Math.cos(a * 2) * 1.4;
            vx = Math.cos(a) * u.r * sg;
            vz = Math.cos(a * 2) * 2 * u.r * 0.52 * sg;
            vy = -Math.sin(a * 2) * 0.9 * sg;
            bank = -Math.sin(a * 2) * 0.34 * sg;
            isGliding = Math.cos(a * 2) < -0.2;
          } else if (u.mode === 'swoop') {
            // 3. บินโฉบต่ำลงใกล้ยอดไม้แล้วเชิดหัวพุ่งขึ้น (Low Swoop & Climb)
            const a = u.ph * 1.25;
            const dip = Math.sin(a * 2);
            bx = cx0 + u.ox + Math.cos(a) * (u.r * 0.85);
            bz = cz0 + u.oz + Math.sin(a) * (u.r * 0.85);
            by = Math.max(4.6, u.alt * 0.75 + dip * 2.8);
            vx = -Math.sin(a) * sg;
            vz = Math.cos(a) * sg;
            vy = Math.cos(a * 2) * 0.55 * sg;
            bank = -0.22 * sg;
            isGliding = dip < 0; // กางปีกร่อนตอนโฉบลง กระพือปีกตอนไต่ระดับขึ้น
          } else {
            // 4. บินเกาะกลุ่มเป็นฝูงย่อยแปรขบวน (Mini-Flock Formation)
            const fa = totalTime * 0.24 + u.flockIdx * 2.1;
            const slot = idx % 4;
            const side = slot === 0 ? 0 : slot % 2 ? -1 : 1;
            const rank = (slot + 1) >> 1;
            const fx = cx0 + Math.cos(fa) * 24;
            const fz = cz0 + Math.sin(fa) * 20;
            const fyaw = Math.atan2(-Math.sin(fa), 0.83 * Math.cos(fa));
            const sY = Math.sin(fyaw),
              cY = Math.cos(fyaw);
            const offX = side * rank * 1.65,
              offZ = -rank * 1.45;
            bx = fx + cY * offX + sY * offZ;
            bz = fz - sY * offX + cY * offZ;
            by = 13.5 + u.flockIdx * 2.2 + Math.sin(totalTime * 2 + idx) * 0.45;
            vx = sY;
            vz = cY;
            vy = Math.cos(totalTime * 2 + idx) * 0.08;
            bank = -0.18;
            isGliding = Math.sin(totalTime * 0.9 + u.flockIdx) > 0.35;
          }

          b.position.set(bx, by, bz);
          b.rotation.y = Math.atan2(vx, vz);
          b.rotation.x = Math.max(-0.35, Math.min(0.35, -vy * 0.35));
          b.rotation.z = bank;

          const flap = isGliding
            ? 0.12 + Math.sin(totalTime * 2.5 + u.ph) * 0.04
            : Math.sin(totalTime * u.flapSp + u.ph * 2) * 0.58;
          u.wl.rotation.z = flap;
          u.wr.rotation.z = -flap;
        });
        updateWireBirds(dt, totalTime, cx0, cz0);
        animals.forEach((a, i) => {
          if (a.visible) animAnimal(a, i); // คำนวณแอนิเมชันเฉพาะตัวที่มองเห็นบนจอเท่านั้น
        });
      }
      updateWalkers(dt);
      memoryBoxes.forEach(b => {
        // ตัวหีบและแท่นวางตั้งอยู่ติดพื้นดินอย่างมั่นคง ขยับหมุนเฉพาะผลึกดาวเรืองแสงด้านบน
        b.group.position.y = b.baseY;
        b.group.rotation.y = b.baseYaw;
        if (b.star) {
          b.star.position.y = 0.78 + Math.sin(totalTime * 2.0 + b.phase) * 0.045;
          b.star.rotation.y = totalTime * 1.4 + b.phase;
        }
      });
      for (let i = lanterns.length - 1; i >= 0; i--) {
        const l = lanterns[i];
        l.age += dt;
        l.group.position.y = l.origin.y + l.age * (state.reduced ? 0.65 : 1.05);
        l.group.position.x = l.origin.x + Math.sin(l.age * 0.6 + l.phase) * 0.5 + l.age * 0.12;
        l.group.position.z = l.origin.z - l.age * 0.18;
        l.group.rotation.z = Math.sin(l.age + l.phase) * 0.06;
        if (l.age > 28) {
          scene.remove(l.group);
          l.owned.forEach(x => x.dispose());
          lanterns.splice(i, 1);
        }
      }
      updateWeather(dt);
      updateTalk();
      fx(dt);
      ENV(dt);
      LIFE(dt);
      SWAY_T.value = totalTime;
      RIVER.update(dt, totalTime);
      if (window.customModels) window.customModels.forEach(s => { if (s.group.visible) s.update(totalTime); });
      renderer.render(scene, camera);
    }

    const _cTreeTint = new THREE.Color(0xc9cda4),
      _cRoadNight = new THREE.Color(0x64756e),
      _cRoadDay = new THREE.Color(0x8b9586);
    let _placeLabelEl = null,
      _lastPlaceTxt = '';

    function updateRouteUI() {
      let near = ROUTE[0],
        minD = Math.abs(near.t - state.routeT);
      for (let i = 1; i < ROUTE.length; i++) {
        const d = Math.abs(ROUTE[i].t - state.routeT);
        if (d < minD) {
          minD = d;
          near = ROUTE[i];
        }
      }
      let txt = near.name + ' · ' + near.sub,
        ic = '';
      if (state.routeT > T3 + 0.012) {
        txt = 'ขับวนกลับ · เส้นทางชนบท';
      } else if (minD >= 0.025 && state.routeT > T1 + 0.012) {
        const rt = state.routeT;
        if (rt >= 0.565 && rt < 0.655) {
          ic = 'grain';
          txt = 'เส้นทางชนบท · ทุ่งนาขั้นบันได';
        } else if (rt >= 0.655 && rt < 0.73) {
          ic = 'grain';
          txt = 'เส้นทางชนบท · ไร่ข้าวโพด';
        } else if (rt >= 0.73 && rt < 0.80) {
          ic = 'boat';
          txt = 'เส้นทางริมน้ำ · แม่น้ำสายกว้าง & เรือหางยาว';
        } else if (rt >= 0.80 && rt < 0.86) {
          ic = 'fruit';
          txt = 'เส้นทางชนบท · สวนผลไม้';
        } else if (rt >= 0.86 && rt < 0.915) {
          ic = 'lotus';
          txt = 'หนองน้ำสวนมะพร้าว · วิถีชีวิตริมน้ำ & ยอยักษ์';
        } else if (rt >= 0.915 && rt < 0.94) {
          ic = 'tree';
          txt = 'เส้นทางชนบท · สวนมะพร้าว';
        } else if (rt < T3) {
          ic = 'mountain';
          txt = 'เส้นทางภูเขา · ดอยผาตั้ง → ภูชี้ฟ้า';
        } else txt = 'เส้นทางชนบท';
      }
      const key = ic + ':' + txt;
      if (key !== _lastPlaceTxt) {
        if (!_placeLabelEl) _placeLabelEl = $('placeLabel');
        if (_placeLabelEl) {
          if (ic) _placeLabelEl.innerHTML = svgInline(ic) + '<span>' + String(txt).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])) + '</span>';
          else _placeLabelEl.textContent = txt;
          _lastPlaceTxt = key;
        }
      }
      drawMini();
    }

    /* ============================================================================
     * src/scene/36-weather-state.js
     * สถานะอากาศ WXR (ใช้ร่วมกับ ENV / LIFE / VEG)
     * (ไฟล์นี้ถูกต่อรวมเป็น closure เดียวกับไฟล์อื่น — ไม่ต้อง import/export · ลำดับไฟล์ดู build.config.mjs)
     * ========================================================================== */

    const WXR = { rain: 0, fog: 0, cover: 0.15, storm: 0, kind: 'clear', auto: true };

    /* ===== ENV: เวลา · ท้องฟ้า · สภาพอากาศสุ่ม · ป่าไกล · นักปั่น ===== */
    const ENV = (() => {
      /* ============================================================================
       * src/scene/37-env/01-time-weather-config.js
       * ค่าตั้งต้นเวลา/อากาศ: keyframe สีท้องฟ้า (KF), ชนิดอากาศ (WK), ช่วงเวลา (PER), pick() สุ่มอากาศ
       * (ไฟล์นี้ถูกต่อรวมเป็น closure เดียวกับไฟล์อื่น — ไม่ต้อง import/export · ลำดับไฟล์ดู build.config.mjs)
       * ========================================================================== */

      const C3 = THREE.Color,
        V3 = THREE.Vector3,
        ER = (() => {
          let q = 20261023;
          return () => {
            q = (q * 16807) % 2147483647;
            return (q - 1) / 2147483646;
          };
        })(),
        cl = (v, a, b) => Math.max(a, Math.min(b, v)),
        WH = new C3(1, 1, 1);
      const KF = [
        [0, 0x070d24, 0x1b2c52, 0x7f9cff, 0.55, 0.95],
        [4.8, 0x141d45, 0x4b4a78, 0x8fa5ff, 0.5, 1],
        [5.8, 0x3f5f9f, 0xf4a27a, 0xff9a66, 1.4, 1.5],
        [7, 0x5b8fd0, 0xf6cfa0, 0xffd9a8, 2.4, 2],
        [9, 0x5fa0e0, 0xcfe6ee, 0xfff0d2, 3, 2.4],
        [12, 0x3f8fe6, 0xbfe0f0, 0xffffff, 3.4, 2.7],
        [15.5, 0x4f95dd, 0xd4e4e6, 0xfff1cf, 3.1, 2.5],
        [17.5, 0x6a8fc4, 0xffd39a, 0xffb35c, 2.4, 1.9],
        [18.8, 0x2f3f7c, 0xf08a6e, 0xff7a55, 1.1, 1.3],
        [19.8, 0x111a3d, 0x33407a, 0x7f9cff, 0.6, 1],
        [24, 0x070d24, 0x1b2c52, 0x7f9cff, 0.55, 0.95]
      ];
      const WK = {
        clear: [0, 0, 0.12, 0, 'แดดจ้า', svgIcon('sun')],
        cloudy: [0, 0, 0.78, 0, 'เมฆครึ้ม', svgIcon('cloud-sun')],
        fog: [0, 0.8, 0.5, 0, 'หมอกลง', svgIcon('fog')],
        rain: [0.75, 0.1, 0.92, 0, 'ฝนตก', svgIcon('rain')],
        storm: [1, 0.15, 1, 1, 'พายุฝนฟ้าคะนอง', svgIcon('storm')]
      };
      const PER = [
        [4.5, 'ดึก'],
        [6.5, 'รุ่งอรุณ'],
        [9, 'เช้า'],
        [11.5, 'สาย'],
        [13, 'เที่ยง'],
        [16.5, 'บ่าย'],
        [18.8, 'เย็น'],
        [20.5, 'หัวค่ำ'],
        [99, 'กลางคืน']
      ];
      let lastKey = '',
        tod = (() => {
          const d = new Date();
          return d.getHours() + d.getMinutes() / 60;
        })(),
        auto = true,
        wxT = 40,
        flash = 0,
        boltT = 6,
        boltL = 0,
        metT = 3,
        lastMin = -1,
        bolt = null;
      const kT = new C3(),
        kH = new C3(),
        kS = new C3(),
        tc = new C3(),
        fwd = new V3(),
        sd = new V3(),
        md = new V3(),
        ld = new V3();
      function pick() {
        const w = { clear: 34, cloudy: 24, fog: tod < 9 || tod > 20 ? 16 : 5, rain: 20, storm: 9 };
        w[WXR.kind] = 0;
        let t = 0,
          k;
        for (k in w) t += w[k];
        let r = ER() * t;
        for (k in w) {
          r -= w[k];
          if (r <= 0) {
            WXR.kind = k;
            return;
          }
        }
      }
      WXR.kind = ['clear', 'clear', 'cloudy', 'fog', 'rain'][Math.floor(ER() * 5)];
      {
        const q = WK[WXR.kind];
        WXR.rain = q[0];
        WXR.fog = q[1];
        WXR.cover = q[2];
        WXR.storm = q[3];
      }

      /* ============================================================================
       * src/scene/37-env/02-sky-dome-moon-stars.js
       * โดมท้องฟ้า (shader), ดวงจันทร์, ดาว และดาวตก
       * (ไฟล์นี้ถูกต่อรวมเป็น closure เดียวกับไฟล์อื่น — ไม่ต้อง import/export · ลำดับไฟล์ดู build.config.mjs)
       * ========================================================================== */

      /* ท้องฟ้า */
      const U = {
        top: { value: new C3() },
        hor: { value: new C3() },
        sunC: { value: new C3() },
        sunD: { value: new V3(0, 1, 0) },
        moonD: { value: new V3(0, -1, 0) },
        gl: { value: 1 },
        mg: { value: 0 }
      };
      const dome = new THREE.Mesh(
        new THREE.SphereGeometry(480, 32, 16),
        new THREE.ShaderMaterial({
          uniforms: U,
          side: THREE.BackSide,
          depthWrite: false,
          fog: false,
          vertexShader:
            'varying vec3 v;void main(){v=normalize(position);gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',
          fragmentShader:
            'uniform vec3 top,hor,sunC,sunD,moonD;uniform float gl,mg;varying vec3 v;void main(){float h=clamp(v.y,0.,1.);vec3 c=mix(hor,top,pow(h,.5));float s=max(dot(v,sunD),0.);c+=sunC*(pow(s,5.)*.3+pow(s,48.)*.55)*gl;float m=max(dot(v,moonD),0.);c+=vec3(.55,.68,1.)*pow(m,36.)*.4*mg;if(v.y<0.)c=hor;gl_FragColor=vec4(c,1.);\n#include <colorspace_fragment>\n}'
        })
      );
      dome.renderOrder = -10;
      dome.frustumCulled = false;
      scene.add(dome);
      sunMesh.material.fog = false;
      stars.visible = false;
      const mc = document.createElement('canvas');
      mc.width = mc.height = 128;
      {
        const c = mc.getContext('2d');
        c.fillStyle = '#f1eedd';
        c.beginPath();
        c.arc(64, 64, 62, 0, 7);
        c.fill();
        for (const q of [
          [44, 48, 16],
          [82, 58, 12],
          [60, 88, 14],
          [88, 92, 8],
          [36, 80, 8]
        ]) {
          c.fillStyle = 'rgba(150,150,140,.35)';
          c.beginPath();
          c.arc(q[0], q[1], q[2], 0, 7);
          c.fill();
        }
      }
      const moon = new THREE.Mesh(
        new THREE.SphereGeometry(1, 20, 14),
        new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(mc), fog: false })
      );
      moon.scale.setScalar(13);
      scene.add(moon);
      const sg = new THREE.Group(),
        sp = [];
      for (let i = 0; i < 1300; i++) {
        const a = ER() * 6.283,
          e = Math.asin(ER() * 0.98 + 0.02),
          r = 400;
        sp.push(Math.cos(a) * Math.cos(e) * r, Math.sin(e) * r, Math.sin(a) * Math.cos(e) * r);
      }
      const sGeo = new THREE.BufferGeometry();
      sGeo.setAttribute('position', new THREE.Float32BufferAttribute(sp, 3));
      const sMat = new THREE.PointsMaterial({
        color: 0xfff6dc,
        size: 1.9,
        sizeAttenuation: false,
        transparent: true,
        fog: false,
        depthWrite: false
      });
      const pts = new THREE.Points(sGeo, sMat);
      pts.frustumCulled = false;
      sg.add(pts);
      scene.add(sg);
      // ฝนดาวตกหลากสีแบบริบบิ้นโค้งพริ้วไหว (Multi-Color & Variable-Speed Meteor Shower)
      const MET_SEGS = 16;
      // พาเลตต์สีดาวตก: [สีหัวดาวสว่าง, สีกลางหางสดใส, สีปลายหางเข้มลึก]
      const MET_PALETTES = [
        [0xf5e6ff, 0xc266ff, 0x6b1aff], // ม่วงอเมทิสต์ (Purple / Violet)
        [0xfff3d6, 0xff8c2b, 0xd93010], // ส้มเพลิงอำพัน (Fiery Orange)
        [0xe6f9ff, 0x42cbff, 0x1862ff], // ฟ้าไอซ์บลู (Cyan / Electric Blue)
        [0xffe6f5, 0xff5eb8, 0xb81472], // ชมพูมาเจนต้า (Rose / Magenta)
        [0xe6fff5, 0x3ef2a8, 0x0e9e68], // เขียวมิ้นต์มรกต (Emerald Mint)
        [0xffffe0, 0xffd244, 0xe07812], // เหลืองทองประกาย (Golden Amber)
        [0xffffff, 0xcce6ff, 0x6495ed]  // ขาวเงินอมฟ้า (Classic Silver-White)
      ];
      const _metC0 = new THREE.Color(),
        _metC1 = new THREE.Color(),
        _metC2 = new THREE.Color(),
        _metCTmp = new THREE.Color();
      const _metHeadTex = (() => {
        const c = document.createElement('canvas');
        c.width = 64;
        c.height = 64;
        const ctx = c.getContext('2d');
        const g = ctx.createRadialGradient(32, 32, 1, 32, 32, 30);
        g.addColorStop(0.0, 'rgba(255, 255, 255, 1.0)');
        g.addColorStop(0.24, 'rgba(255, 255, 255, 0.94)');
        g.addColorStop(0.56, 'rgba(255, 255, 255, 0.42)');
        g.addColorStop(1.0, 'rgba(255, 255, 255, 0.0)');
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, 64, 64);
        // แฉกประกายดาวนุ่มๆ ที่หัวดาวตก
        ctx.fillStyle = 'rgba(255, 255, 255, 0.82)';
        ctx.fillRect(6, 31, 52, 2);
        ctx.fillRect(31, 6, 2, 52);
        return new THREE.CanvasTexture(c);
      })();
      const _metTrailTex = (() => {
        const c = document.createElement('canvas');
        c.width = 128;
        c.height = 32;
        const ctx = c.getContext('2d');
        for (let x = 0; x < 128; x++) {
          const u = x / 127; // 0 = หัวดาวตก, 1 = ปลายหางจางหาย
          const alphaX = Math.pow(1 - u, 1.65);
          for (let y = 0; y < 32; y++) {
            const v = Math.abs((y - 15.5) / 15.5);
            const alphaY = Math.pow(Math.max(0, 1 - v), 1.55);
            const a = (alphaX * alphaY * 0.96).toFixed(3);
            ctx.fillStyle = `rgba(255,255,255,${a})`;
            ctx.fillRect(x, y, 1, 1);
          }
        }
        const tex = new THREE.CanvasTexture(c);
        tex.wrapS = tex.wrapT = THREE.ClampToEdgeWrapping;
        return tex;
      })();

      const mets = [];
      for (let i = 0; i < 8; i++) {
        const grp = new THREE.Group();
        grp.visible = false;
        grp.frustumCulled = false;

        // ริบบิ้นหางดาวตกดัดโค้งตามวิถีการเคลื่อนที่จริง พร้อมไล่เฉดสี Vertex Colors
        const rGeo = new THREE.BufferGeometry();
        const posArr = new Float32Array((MET_SEGS + 1) * 2 * 3);
        const colArr = new Float32Array((MET_SEGS + 1) * 2 * 3);
        const uvArr = new Float32Array((MET_SEGS + 1) * 2 * 2);
        const idxArr = [];
        for (let s = 0; s <= MET_SEGS; s++) {
          const u = s / MET_SEGS;
          uvArr[s * 4 + 0] = u;
          uvArr[s * 4 + 1] = 0;
          uvArr[s * 4 + 2] = u;
          uvArr[s * 4 + 3] = 1;
          for (let k = 0; k < 6; k++) colArr[s * 6 + k] = 1;
          if (s < MET_SEGS) {
            const k = s * 2;
            idxArr.push(k, k + 1, k + 2, k + 1, k + 3, k + 2);
          }
        }
        rGeo.setAttribute('position', new THREE.BufferAttribute(posArr, 3));
        rGeo.setAttribute('color', new THREE.BufferAttribute(colArr, 3));
        rGeo.setAttribute('uv', new THREE.BufferAttribute(uvArr, 2));
        rGeo.setIndex(idxArr);

        const rMat = new THREE.MeshBasicMaterial({
          map: _metTrailTex,
          vertexColors: true,
          transparent: true,
          opacity: 0,
          blending: THREE.AdditiveBlending,
          side: THREE.DoubleSide,
          fog: false,
          depthWrite: false
        });
        const trailMesh = new THREE.Mesh(rGeo, rMat);
        trailMesh.frustumCulled = false;
        grp.add(trailMesh);

        // หัวดาวตกเรืองแสงพริ้วพราย (ชั้นนอกย้อมสีดาวตก + แกนกลางสว่างขาวประกาย)
        const hMat = new THREE.SpriteMaterial({
          map: _metHeadTex,
          color: 0xfff8dc,
          transparent: true,
          opacity: 0,
          blending: THREE.AdditiveBlending,
          fog: false,
          depthWrite: false
        });
        const headSpr = new THREE.Sprite(hMat);
        headSpr.scale.set(9.5, 9.5, 1);
        headSpr.frustumCulled = false;
        grp.add(headSpr);

        grp.userData = {
          life: 0,
          max: 4.5,
          trailSpan: 1.35,
          headSize: 8.5,
          rGeo,
          posArr,
          colArr,
          rMat,
          hMat,
          headSpr
        };
        scene.add(grp);
        mets.push(grp);
      }

      // สายรุ้งสองชั้น (Double Rainbow) ปรากฏตรงข้ามดวงอาทิตย์เมื่อฝนตกในเวลากลางวัน
      const rainbowTex = (() => {
        const c = document.createElement('canvas');
        c.width = c.height = 512;
        const x = c.getContext('2d');
        const g = x.createRadialGradient(256, 256, 0, 256, 256, 256);
        g.addColorStop(0, 'rgba(0,0,0,0)');
        const band = (r0, cols, alpha) => {
          const w = 0.056;
          cols.forEach((col, i) => {
            const a = r0 + i * w;
            g.addColorStop(a, 'rgba(' + col + ',0)');
            g.addColorStop(a + w * 0.3, 'rgba(' + col + ',' + alpha + ')');
            g.addColorStop(a + w * 0.7, 'rgba(' + col + ',' + alpha + ')');
            g.addColorStop(Math.min(1, a + w), 'rgba(' + col + ',0)');
          });
        };
        band(0.58, ['140,60,235', '60,80,255', '20,170,255', '40,225,100', '255,235,40', '255,140,20', '255,40,50'], 1.0);
        x.fillStyle = g;
        x.fillRect(0, 0, 512, 512);
        return new THREE.CanvasTexture(c);
      })();
      const rainbow = new THREE.Mesh(
        new THREE.RingGeometry(0, 1, 128, 1, 0, Math.PI),
        new THREE.MeshBasicMaterial({
          map: rainbowTex,
          transparent: true,
          opacity: 0,
          fog: false,
          depthWrite: false,
          side: THREE.DoubleSide,
          blending: THREE.NormalBlending
        })
      );
      {
        const pa = rainbow.geometry.attributes.position, ua = rainbow.geometry.attributes.uv;
        for (let i = 0; i < pa.count; i++) ua.setXY(i, (pa.getX(i) + 1) / 2, (pa.getY(i) + 1) / 2);
        ua.needsUpdate = true;
      }
      rainbow.visible = false;
      rainbow.frustumCulled = false;
      rainbow.renderOrder = -5;
      scene.add(rainbow);
      let rainbowA = 0;

      /* ============================================================================
       * src/scene/37-env/03-clouds-lightning.js
       * เมฆ และฟ้าผ่า (strike)
       * (ไฟล์นี้ถูกต่อรวมเป็น closure เดียวกับไฟล์อื่น — ไม่ต้อง import/export · ลำดับไฟล์ดู build.config.mjs)
       * ========================================================================== */

      /* เมฆ */
      const cM = new THREE.MeshLambertMaterial({ color: 0xffffff, flatShading: true }),
        cG = new THREE.IcosahedronGeometry(1, 1),
        cls = [];
      for (let i = 0; i < 36; i++) {
        const g = new THREE.Group(),
          n = 4 + Math.floor(ER() * 3);
        for (let j = 0; j < n; j++) {
          const m = new THREE.Mesh(cG, cM);
          m.position.set((j - n / 2) * 5.5 + ER() * 3, ER() * 2.5, (ER() - 0.5) * 6);
          m.scale.set(6 + ER() * 4, 3.2 + ER() * 1.8, 5 + ER() * 3);
          g.add(m);
        }
        const a = ER() * 6.283,
          R = 50 + ER() * 230;
        g.position.set(Math.cos(a) * R, 40 + ER() * 38, Math.sin(a) * R);
        const s0 = 0.8 + ER() * 0.9;
        g.scale.setScalar(0.01);
        g.userData = { th: ER(), s: s0, sp: 0.6 + ER() * 0.8 };
        scene.add(g);
        cls.push(g);
      }
      /* ฟ้าผ่า */
      function strike() {
        flash = 1;
        const az = ER() * 6.283,
          dist = 130 + ER() * 100,
          pp = [];
        let x = camera.position.x + Math.cos(az) * dist,
          z = camera.position.z + Math.sin(az) * dist;
        for (let y = 130; y >= 0; y -= 13) {
          pp.push(new V3(x, y, z));
          x += (ER() - 0.5) * 12;
          z += (ER() - 0.5) * 12;
        }
        if (bolt) {
          scene.remove(bolt);
          bolt.geometry.dispose();
        }
        bolt = new THREE.Line(
          new THREE.BufferGeometry().setFromPoints(pp),
          new THREE.LineBasicMaterial({ color: 0xf2f6ff, fog: false })
        );
        bolt.frustumCulled = false;
        scene.add(bolt);
        boltL = 0.35;
        setTimeout(() => {
          flash = 0.8;
        }, 130);
        setTimeout(
          () => {
            thunderSound(dist);
          },
          (dist / 340) * 1000
        );
      }

      /* ============================================================================
       * src/scene/37-env/04-weather-hud.js
       * แถบควบคุมเวลา/อากาศด้านบน (wxbar) และปุ่มต่าง ๆ
       * (ไฟล์นี้ถูกต่อรวมเป็น closure เดียวกับไฟล์อื่น — ไม่ต้อง import/export · ลำดับไฟล์ดู build.config.mjs)
       * ========================================================================== */

      /* ปุ่มควบคุมเวลา/อากาศ — แถบด้านบน จัดเป็นกลุ่ม รองรับมือถือ */
      const hud = document.createElement('div');
      hud.className = 'wxbar';
      hud.id = 'wxBar';
      hud.innerHTML =
        '<button type="button" class="wx-info" aria-expanded="false" aria-controls="wxPanel" aria-label="สภาพอากาศและเวลา แตะเพื่อแสดงปุ่มควบคุม"><span class="wx-txt" aria-live="off"></span><span class="wx-car" aria-hidden="true">▾</span></button><div class="wx-panel" id="wxPanel"><div class="wx-grp" role="group" aria-label="สภาพอากาศ"></div><div class="wx-grp" role="group" aria-label="ช่วงเวลา"></div></div>';
      
      const info = hud.querySelector('.wx-txt'),
        infoBtn = hud.querySelector('.wx-info'),
        [wxGW, wxGT] = hud.querySelectorAll('.wx-grp');

      // --- จัดกลุ่ม UI ใหม่ให้อยู่ใน Scene Top ---
      const topWrapper = document.querySelector('.scene-top'); 
      if(topWrapper) {
          topWrapper.innerHTML = ''; // ล้างของเก่า
          
          const leftGroup = document.createElement('div');
          leftGroup.className = 'scene-top-left';
          leftGroup.appendChild(hud);

          const placeBadge = document.createElement('span');
          placeBadge.className = 'badge';
          placeBadge.innerHTML = '<i class="dot"></i><span id="placeLabel">จันจว้า · จุดเริ่มต้น</span>';
          leftGroup.appendChild(placeBadge);
          
          topWrapper.appendChild(leftGroup);

          const syncBadge = document.createElement('button');
          syncBadge.type = 'button';
          syncBadge.id = 'syncStatusBadge';
          syncBadge.className = 'sync-badge';
          syncBadge.setAttribute('aria-live', 'polite');
          syncBadge.onclick = () => {
            if (typeof window.triggerManualSync === 'function') window.triggerManualSync();
          };
          topWrapper.appendChild(syncBadge);
          if (typeof window.renderSyncStatus === 'function') window.renderSyncStatus();

          const rightGroup = document.createElement('div');
          rightGroup.className = 'scene-top-right';
          rightGroup.appendChild(fpsCounter);

          const nightBtn = document.createElement('button');
          nightBtn.className = 'iconbtn';
          nightBtn.id = 'nightBtn';
          nightBtn.setAttribute('aria-label', 'สลับกลางวันและกลางคืน');
          nightBtn.innerHTML = '<svg><use href="#i-moon"/></svg>';
          nightBtn.onclick = () => {
            state.night = !state.night;
            tod = state.night ? 23 : 12; 
          };
          
          rightGroup.appendChild(nightBtn);
          topWrapper.appendChild(rightGroup);
      } else {
          host.appendChild(hud);
      }

      ['pointerdown', 'touchstart', 'wheel'].forEach(t =>
        hud.addEventListener(t, e => e.stopPropagation(), { passive: true })
      );
      const mobq = matchMedia('(max-width:740px)');
      let wxOpen = false,
        wxIdle = 0;
      function wxMeasure() {
        const h = Math.ceil(hud.offsetTop + hud.offsetHeight);
        document.documentElement.style.setProperty('--hudh', h + 'px');
        window.__hudH = h;
      }
      function wxSet(o) {
        wxOpen = o;
        hud.classList.toggle('open', o);
        infoBtn.setAttribute('aria-expanded', String(o));
        infoBtn.setAttribute(
          'aria-label',
          o ? 'สภาพอากาศและเวลา แตะเพื่อซ่อนปุ่มควบคุม' : 'สภาพอากาศและเวลา แตะเพื่อแสดงปุ่มควบคุม'
        );
        wxIdle = o ? 8 : 0;
        wxMeasure();
      }
      hud.classList.toggle('open', wxOpen);
      infoBtn.onclick = () => wxSet(!wxOpen);
      if (mobq.addEventListener) mobq.addEventListener('change', () => wxSet(false));
      if (window.ResizeObserver) new ResizeObserver(wxMeasure).observe(hud);
      else window.addEventListener('resize', wxMeasure);
      host.addEventListener('pointerdown', e => {
        if (mobq.matches && wxOpen && !hud.contains(e.target)) wxSet(false);
      });
      hud.addEventListener('click', () => {
        if (wxOpen) wxIdle = 8;
      });
      setInterval(() => {
        if (mobq.matches && wxOpen && wxIdle > 0 && --wxIdle === 0) wxSet(false);
      }, 1000);
      requestAnimationFrame(wxMeasure);
      const btns = [];
      function B(g, e, l, t, f, k) {
        const b = document.createElement('button');
        b.type = 'button';
        b.className = 'wx-b';
        b.title = t;
        b.setAttribute('aria-label', t);
        b.innerHTML = '<span class="e" aria-hidden="true">' + e + '</span><span class="l">' + l + '</span>';
        b.onclick = () => {
          f();
          paint();
        };
        g.appendChild(b);
        btns.push([b, k]);
        return b;
      }
      B(
        wxGW,
        svgIcon('dice'),
        'อัตโนมัติ',
        'สุ่มอากาศอัตโนมัติ',
        () => {
          WXR.auto = true;
          wxT = 0;
        },
        'a'
      );
      const WL = { clear: 'แดดจ้า', cloudy: 'เมฆครึ้ม', fog: 'หมอก', rain: 'ฝน', storm: 'พายุ' };
      for (const k in WK)
        B(
          wxGW,
          WK[k][5],
          WL[k],
          WK[k][4],
          () => {
            WXR.auto = false;
            WXR.kind = k;
          },
          k
        );
      B(
        wxGT,
        svgIcon('sunrise'),
        'เช้า',
        'เช้า',
        () => {
          tod = 7;
        },
        't7'
      );
      B(
        wxGT,
        svgIcon('sun'),
        'เที่ยง',
        'เที่ยง',
        () => {
          tod = 12;
        },
        't12'
      );
      B(
        wxGT,
        svgIcon('sunset'),
        'เย็น',
        'เย็น',
        () => {
          tod = 17.8;
        },
        't17'
      );
      B(
        wxGT,
        svgIcon('moon'),
        'กลางคืน',
        'กลางคืน',
        () => {
          tod = 23;
        },
        't23'
      );
      const bP = B(
        wxGT,
        svgIcon('playpause'),
        'เวลาเดิน',
        'เดินเวลา / หยุดเวลา',
        () => {
          auto = !auto;
        },
        'p'
      );
      function paint() {
        for (const q of btns) {
          const on =
            q[1] === 'a' ? WXR.auto : q[1] === 'p' ? auto : WK[q[1]] ? !WXR.auto && WXR.kind === q[1] : false;
          q[0].classList.toggle('on', on);
          q[0].setAttribute('aria-pressed', String(on));
        }
        bP.querySelector('.l').textContent = auto ? 'เวลาเดิน' : 'หยุดเวลา';
      }
      window.RODENV = { rain: () => WXR.rain, weather: k => { WXR.auto = false; WXR.kind = k; paint(); }, time: h => { tod = h; }, shot: () => { renderer.render(scene, camera); return renderer.domElement.toDataURL('image/jpeg', 0.92); } };
      paint();
      $('nightBtn').addEventListener('click', () => {
        tod = state.night ? 23 : 12;
      });

      /* ============================================================================
       * src/scene/37-env/05-far-forest.js
       * ป่าไกลและต้นไม้บนดอย
       * (ไฟล์นี้ถูกต่อรวมเป็น closure เดียวกับไฟล์อื่น — ไม่ต้อง import/export · ลำดับไฟล์ดู build.config.mjs)
       * ========================================================================== */

      /* ป่าไกลและต้นไม้บนดอย */
      {
        const D = new THREE.Object3D(),
          BL = [],
          CO = [],
          spot = (x, z, s, br) => {
            D.position.set(x, 0, z);
            D.rotation.set(0, ER() * 6, 0);
            D.scale.set(s, s * (0.8 + ER() * 0.5), s);
            return { x, z, s, br };
          },
          T = [];
        const hY = (h, x, z) => {
          const nx = (x - h.x) / h.r,
            nz = (z - h.z) / (h.r * 0.75),
            q = 1 - nx * nx - nz * nz;
          return q > 0 ? -2 + h.r * h.sy * Math.sqrt(q) : null;
        };
        let nl = 0;
        for (let i = 0; i < 6000 && nl < 850; i++) {
          const x = -170 + ER() * 680,
            z = -200 + ER() * 650;
          if (x > 95 && z > -70) continue; // เว้นพื้นที่โล่งให้โซนเกษตรกรรมใหม่
          if (HILLS.some(h => ((x - h.x) / h.r) ** 2 + ((z - h.z) / (h.r * 0.75)) ** 2 < 1.15)) continue;
          if (!spotOK(x, z, 9)) continue; // เพิ่มระยะห่างจากถนนไม่ให้ใบไม้ล้ำเข้าถนน
          nl++;
          taken.push([x, z, 3.0]);
          T.push([x, 0, z, 0.9 + ER() * 0.9, ER() < 0.55]);
        }
        const gT = new THREE.CylinderGeometry(0.14, 0.22, 2.2, 5).translate(0, 1.1, 0),
          gB = new THREE.IcosahedronGeometry(1, 1).scale(2.3, 1.9, 2.3).translate(0, 3.3, 0),
          gC = (() => {
            const P = [],
              N = [];
            [
              [1.6, 2.4, 2.3],
              [1.2, 2.2, 3.75],
              [0.8, 2, 5.2]
            ].forEach(q => {
              const c = new THREE.ConeGeometry(q[0], q[1], 7).translate(0, q[2], 0).toNonIndexed();
              P.push(...c.attributes.position.array);
              N.push(...c.attributes.normal.array);
            });
            const g = new THREE.BufferGeometry();
            g.setAttribute('position', new THREE.Float32BufferAttribute(P, 3));
            g.setAttribute('normal', new THREE.Float32BufferAttribute(N, 3));
            return g;
          })(),
          gT2 = new THREE.CylinderGeometry(0.09, 0.2, 5.2, 6).translate(0, 2.6, 0),
          fm = new THREE.MeshLambertMaterial({ color: 0xffffff, flatShading: true });
        const br = T.filter(t => t[4]),
          co = T.filter(t => !t[4]),
          mk = (g, m, L, tr) => {
            const chunkSize = 128,
              chunks = new Map(),
              c = new C3();
            L.forEach((t, i) => {
              const tileX = Math.floor(t[0] / chunkSize) * chunkSize + chunkSize / 2,
                tileZ = Math.floor(t[2] / chunkSize) * chunkSize + chunkSize / 2,
                key = tileX + ':' + tileZ;
              let chunk = chunks.get(key);
              if (!chunk) {
                chunk = { tileX, tileZ, instances: [] };
                chunks.set(key, chunk);
              }
              D.position.set(t[0], t[1], t[2]);
              D.rotation.set(0, ER() * 6, 0);
              D.scale.set(t[3], t[3] * (0.85 + ER() * 0.45), t[3]);
              D.updateMatrix();
              const matrix = D.matrix.clone();
              matrix.elements[12] -= tileX;
              matrix.elements[14] -= tileZ;
              const instance = { matrix };
              if (!tr) {
                c.setHSL(0.2 + ER() * 0.13, 0.3 + ER() * 0.25, 0.2 + ER() * 0.16);
                instance.color = c.clone();
              }
              chunk.instances.push(instance);
            });
            for (const chunk of chunks.values()) {
              const im = new THREE.InstancedMesh(g, m, chunk.instances.length);
              im.position.set(chunk.tileX, 0, chunk.tileZ);
              im.userData.selfCulled = true;
              for (let i = 0; i < chunk.instances.length; i++) {
                const instance = chunk.instances[i];
                im.setMatrixAt(i, instance.matrix);
                if (instance.color) im.setColorAt(i, instance.color);
              }
              im.instanceMatrix.needsUpdate = true;
              if (im.instanceColor) im.instanceColor.needsUpdate = true;
              im.computeBoundingSphere();
              scene.add(im);
            }
          };
        mk(gT, sm2(0x7d6648), br, 1);
        mk(gB, fm, br, 0);
        mk(gT2, sm2(0x6b563c), co, 1);
        mk(gC, fm, co, 0);
      }

      /* ============================================================================
       * src/scene/37-env/06-cyclists.js
       * นักปั่นจักรยานริมถนน (mkCyc, updCyc)
       * (ไฟล์นี้ถูกต่อรวมเป็น closure เดียวกับไฟล์อื่น — ไม่ต้อง import/export · ลำดับไฟล์ดู build.config.mjs)
       * ========================================================================== */

      /* นักปั่นจักรยานริมถนน */
      const CY = new THREE.CylinderGeometry(1, 1, 1, 10),
        _cycTorsoGeo = new THREE.CapsuleGeometry(0.132, 0.28, 4, 12),
        _cycPackGeo = new THREE.CapsuleGeometry(0.115, 0.16, 4, 10),
        _cycBskGeo = new THREE.CylinderGeometry(0.15, 0.115, 0.2, 12),
        UP = new V3(0, 1, 0),
        tv = new V3(),
        cyc = [];
      const lk = (r, m, p) => {
          const l = new THREE.Mesh(CY, m);
          l.userData.r = r;
          p.add(l);
          return l;
        },
        sl = (l, a, b) => {
          l.position.copy(a).add(b).multiplyScalar(0.5);
          tv.copy(b).sub(a);
          const L = tv.length() || 1,
            r = l.userData.r;
          l.scale.set(r, L, r);
          l.quaternion.setFromUnitVectors(UP, tv.divideScalar(L));
        };
      function mkCyc(i) {
        const g = new THREE.Group(),
          fm = pm2([0xc8553d, 0x3d6a8a, 0x7a9a5e, 0xd9b56b, 0x6e9fb0, 0xc7a4d0][i % 6]),
          dk = pm2(0x2f3d38),
          sk = pm2([0xe8bd9c, 0xd9a681, 0xc08a63][i % 3]),
          sh = pm2([0xe98f7d, 0x6e9fb0, 0xd9b56b, 0x8fb177, 0xf2efe6][i % 5]),
          pn = pm2(i % 2 ? 0x3d4a5c : 0x2f3d38),
          hr = pm2(0x2b221d),
          W = [],
          v = (x, y, z) => new V3(x, y, z);
        for (const z of [-0.55, 0.55]) {
          const w = new THREE.Group();
          w.position.set(0, 0.33, z);
          const t = new THREE.Mesh(new THREE.TorusGeometry(0.33, 0.022, 6, 20), rubber),
            r = new THREE.Mesh(new THREE.TorusGeometry(0.29, 0.007, 4, 18), hub);
          t.rotation.y = r.rotation.y = Math.PI / 2;
          w.add(t, r);
          for (let k = 0; k < 3; k++) {
            const q = cyl(0.004, 0.004, 0.58, hub, 0, 0, 0, w, k * 1.047, 0);
            q.castShadow = false;
          }
          g.add(w);
          W.push(w);
        }
        const bb = v(0, 0.4, 0.02),
          st = v(0, 0.95, -0.2),
          ht = v(0, 0.92, 0.46),
          rh = v(0, 0.33, -0.55),
          fh = v(0, 0.33, 0.55),
          hb = v(0, 1.08, 0.5);
        [
          [bb, st],
          [bb, ht],
          [st, ht],
          [bb, rh],
          [st, rh],
          [ht, fh],
          [ht, hb]
        ].forEach(q => sl(lk(0.017, fm, g), q[0], q[1]));
        // แฮนด์กลม + ปลอกแฮนด์ยาง + เบาะนั่งโค้งมน + ไฟหน้า/ไฟท้ายทรงมน (ไม่มีกล่องสี่เหลี่ยม)
        cyl(0.014, 0.014, 0.46, hub, 0, 1.08, 0.5, g, 0, Math.PI / 2);
        for (const s of [-1, 1]) cyl(0.02, 0.02, 0.1, dk, s * 0.19, 1.08, 0.5, g, 0, Math.PI / 2);
        ball(0.085, dk, 0, 0.98, -0.22, g, 0.72, 0.38, 1.38);
        ball(0.038, lampM, 0, 0.98, 0.56, g);
        ball(0.032, tailM, 0, 0.72, -0.56, g, 0.9, 0.65, 0.6);
        // ตะกร้าสานทรงกลมหน้าแฮนด์ (ยึดติดกับคอรถ ไม่ใช่กล่องสี่เหลี่ยมลอยกลางอากาศ)
        if (i % 3 === 0) {
          const bsk = new THREE.Mesh(_cycBskGeo, pm2(0xc49558));
          bsk.position.set(0, 0.96, 0.61);
          bsk.scale.set(1.05, 1, 0.85);
          g.add(bsk);
          cyl(0.01, 0.01, 0.12, hub, 0, 0.96, 0.52, g, Math.PI / 2, 0);
        }
        // สะโพกและลำตัวทรงแคปซูลโค้งมนเอียงรับท่าปั่น
        ball(0.132, pn, 0, 1.0, -0.18, g, 1.04, 0.72, 0.95);
        const torso = new THREE.Mesh(_cycTorsoGeo, sh);
        torso.position.set(0, 1.21, -0.06);
        torso.rotation.x = 0.48;
        torso.scale.set(1.05, 1, 0.84);
        torso.castShadow = true;
        g.add(torso);
        // กระเป๋าเป้ทรงแคปซูลมน แนบแผ่นหลังตามองศาการก้มตัว (ไม่ทะลุหน้าอก)
        if (i % 2) {
          const pack = new THREE.Mesh(_cycPackGeo, pm2(0x527d92));
          pack.position.set(0, 1.26, -0.18);
          pack.rotation.x = 0.48;
          pack.scale.set(1.05, 1, 0.68);
          g.add(pack);
        }
        // คอ ศีรษะ ผม และหมวก
        cyl(0.044, 0.048, 0.1, sk, 0, 1.46, 0.07, g, 0.2, 0);
        ball(0.112, sk, 0, 1.58, 0.1, g, 0.94, 1.05, 1);
        ball(0.116, hr, 0, 1.61, 0.08, g, 0.98, 0.84, 1.02);
        if (i % 3 === 2) {
          const h = new THREE.Mesh(new THREE.ConeGeometry(0.32, 0.13, 14), stT);
          h.position.set(0, 1.71, 0.09);
          g.add(h);
        } else {
          ball(0.124, pm2([0xd9534a, 0xf0c95a, 0xf2efe6][i % 3]), 0, 1.64, 0.09, g, 1.02, 0.72, 1.12);
        }
        // แขนพร้อมหัวไหล่ ข้อศอก และมือจับปลอกแฮนด์พอดี
        for (const s of [-1, 1]) {
          const S = v(s * 0.165, 1.37, 0.04),
            G = v(s * 0.19, 1.08, 0.5),
            E = S.clone()
              .add(G)
              .multiplyScalar(0.5)
              .add(v(s * 0.055, -0.05, -0.02));
          ball(0.05, sh, S.x, S.y, S.z, g);
          sl(lk(0.044, sh, g), S, E);
          ball(0.038, sk, E.x, E.y, E.z, g);
          sl(lk(0.035, sk, g), E, G);
          ball(0.036, sk, G.x, G.y, G.z, g);
        }
        // ขาพร้อมลูกสะบ้าหัวเข่า รองเท้าทรงมน และบันไดถีบกลม (ไร้กล่องสี่เหลี่ยม)
        const lg = [-1, 1].map(s => ({
            s,
            th: lk(0.066, pn, g),
            kn: ball(0.058, pn, 0, 0, 0, g),
            sn: lk(0.052, pn, g),
            ft: ball(0.055, dk, 0, 0, 0, g, 0.9, 0.62, 1.65),
            pd: cyl(0.018, 0.018, 0.09, dk, 0, 0, 0, g, 0, Math.PI / 2)
          })),
          pc = new THREE.Mesh(
            new THREE.ConeGeometry(0.42, 0.8, 12, 1, true),
            new THREE.MeshStandardMaterial({
              color: [0xf0c95a, 0x6e9fb0, 0xd9534a][i % 3],
              roughness: 0.6,
              side: THREE.DoubleSide
            })
          );
        pc.position.set(0, 1.18, -0.02);
        pc.visible = false;
        g.add(pc);
        g.scale.setScalar(1.15);
        scene.add(g);
        const sgn = i % 2 ? 1 : -1;
        return { g, W, lg, pc, t: 0.05 + i * 0.115 + ER() * 0.04, sg: sgn, k: ER(), ph: ER() * 6, wa: 0 };
      }
      for (let i = 0; i < 8; i++) cyc.push(mkCyc(i));
      const H = new V3(),
        F = new V3(),
        K = new V3(),
        u = new V3(),
        pp = new V3(),
        Z = new V3(0, 0, 1);
      function leg(l, ph) {
        H.set(l.s * 0.1, 0.98, -0.2);
        F.set(l.s * 0.13, 0.4 - Math.cos(ph) * 0.17, 0.02 + Math.sin(ph) * 0.17);
        u.copy(F).sub(H);
        let d = Math.min(u.length(), 0.9);
        u.normalize();
        const a = (0.2025 - 0.2116 + d * d) / (2 * d),
          h = Math.sqrt(Math.max(0.2025 - a * a, 0));
        pp.copy(Z).addScaledVector(u, -Z.dot(u)).normalize();
        K.copy(H).addScaledVector(u, a).addScaledVector(pp, h);
        sl(l.th, H, K);
        l.kn.position.copy(K);
        sl(l.sn, K, F);
        l.ft.position.set(F.x, F.y - 0.015, F.z + 0.035);
        l.pd.position.set(F.x, F.y - 0.035, F.z);
      }
      function updCyc(dt) {
        const c0 = Math.max((((speedMul * KMH) / 3600) * ARCJ) / KM_TOTAL / DS, 0.2 / DS),
          wet = WXR.rain > 0.3;
        for (const c of cyc) {
          const v = c0 * (0.08 + c.k * 0.05),
            su = v * DS;
          c.t = (((c.t + c.sg * v * dt) % 1) + 1) % 1;
          const p = route.getPoint(c.t),
            tn = route.getTangent(c.t);
          n0.set(-tn.z, 0, tn.x);
          c.g.position.copy(p).addScaledVector(n0, -c.sg * 3.15);
          const dx = c.g.position.x - car.position.x,
            dz = c.g.position.z - car.position.z;
          if (dx * dx + dz * dz > 7225) { // ซ่อนเมื่อไกลเกิน 85 เมตร
            c.g.visible = false;
            continue;
          }
          c.g.visible = true;
          c.g.rotation.y = Math.atan2(tn.x, tn.z) + (c.sg < 0 ? Math.PI : 0);
          c.ph -= su * dt * 1.5;
          c.wa += (su * dt) / 0.33;
          c.W.forEach(w => (w.rotation.x = c.wa));
          c.g.rotation.z = Math.sin(c.ph * 0.5) * 0.03;
          c.pc.visible = wet;
          leg(c.lg[0], c.ph);
          leg(c.lg[1], c.ph + Math.PI);
        }
      }
      function period(h) {
        for (const q of PER) if (h < q[0]) return q[1];
      }

      /* ============================================================================
       * src/scene/37-env/07-update-loop.js
       * ฟังก์ชันอัปเดต ENV ทุกเฟรม (ท้องฟ้า แสง สภาพอากาศ ฟ้าผ่า) — ถูก frame() เรียกใช้
       * (ไฟล์นี้ถูกต่อรวมเป็น closure เดียวกับไฟล์อื่น — ไม่ต้อง import/export · ลำดับไฟล์ดู build.config.mjs)
       * ========================================================================== */

      /* ลูปหลัก */
      return function (dt) {
        if (auto && !state.reduced) tod = (tod + dt * 0.08) % 24;
        let i = 0;
        while (i < KF.length - 2 && tod >= KF[i + 1][0]) i++;
        const A = KF[i],
          Bk = KF[i + 1],
          uu = (tod - A[0]) / (Bk[0] - A[0]);
        kT.set(A[1]).lerp(tc.set(Bk[1]), uu);
        kH.set(A[2]).lerp(tc.set(Bk[2]), uu);
        kS.set(A[3]).lerp(tc.set(Bk[3]), uu);
        const kI = A[4] + (Bk[4] - A[4]) * uu,
          kA = A[5] + (Bk[5] - A[5]) * uu;
        const q = WK[WXR.kind],
          k = Math.min(1, dt * 0.3);
        WXR.rain += (q[0] - WXR.rain) * k;
        WXR.fog += (q[1] - WXR.fog) * k;
        WXR.cover += (q[2] - WXR.cover) * k;
        WXR.storm += (q[3] - WXR.storm) * k;
        if (WXR.auto) {
          wxT -= dt;
          if (wxT <= 0) {
            wxT = 40 + ER() * 55;
            pick();
            paint();
          }
        }
        const ca = WXR.cover,
          st = WXR.storm,
          nF = cl((1.5 - kA) / 0.55, 0, 1),
          a = ((tod - 5.8) / 13) * Math.PI;
        sd.set(Math.cos(a) * 0.9, Math.sin(a) * 0.8, -0.45).normalize();
        const nb = ((tod >= 18.8 ? tod - 18.8 : tod + 5.2) / 11) * Math.PI,
          mUp = nF > 0.1 && (tod >= 18.8 || tod < 5.8);
        md.set(Math.cos(nb) * 0.9, Math.sin(nb) * 0.8, -0.45).normalize();
        stars.visible = false;
        const ns = nF > 0.55;
        if (state.night !== ns) {
          state.night = ns;
          theme();
        }
        flash = Math.max(0, flash - dt * 3.2);
        if (st > 0.45) {
          boltT -= dt;
          if (boltT <= 0) {
            boltT = 3 + ER() * 9;
            strike();
          }
        }
        if (bolt) {
          boltL -= dt;
          bolt.visible = boltL > 0;
        }
        const gr = ((kT.r + kT.g + kT.b) / 3) * 0.8;
        tc.setRGB(gr, gr * 1.03, gr * 1.08);
        const dk = 1 - st * 0.45;
        const top = U.top.value
            .copy(kT)
            .lerp(tc, ca * 0.7)
            .multiplyScalar(dk),
          hor = U.hor.value
            .copy(kH)
            .lerp(tc, ca * 0.5 + WXR.fog * 0.45)
            .multiplyScalar(1 - st * 0.35);
        if (WXR.fog > 0.2) {
          tc.setRGB(0.82, 0.86, 0.88).multiplyScalar(cl(kA / 2.6, 0.15, 1));
          hor.lerp(tc, WXR.fog * 0.55);
        }
        if (flash > 0) {
          tc.set(0xdfe8ff);
          top.lerp(tc, flash * 0.8);
          hor.lerp(tc, flash * 0.8);
        }
        desiredSky.copy(hor);
        WXR.nF = nF;
        WXR.tod = tod;
        WXR.hor = hor;
        const m = moodOf(state.mood);
        desiredGround
          .set(m.ground)
          .lerp(tc.set(0x506d62), nF)
          .multiplyScalar(1 - WXR.rain * 0.15);
        desiredTree.set(m.tree).lerp(tc.set(0x3d6257), nF);
        desiredFar.copy(desiredGround).lerp(hor, 0.35);
        U.sunD.value.copy(sd);
        U.moonD.value.copy(md);
        U.sunC.value.copy(kS);
        U.gl.value = sd.y > -0.3 ? 1 - ca * 0.85 : 0;
        U.mg.value = mUp ? nF * (1 - ca) : 0;
        dome.position.copy(camera.position);
        sg.position.copy(camera.position);
        sg.rotation.z = tod * 0.2618;
        sMat.opacity = nF * nF * (1 - ca * 0.92);
        sg.visible = sMat.opacity > 0.02;
        const lc = sd.y > 0.05;
        if (lc) ld.copy(sd);
        else if (mUp) ld.copy(md);
        else ld.set(0, 1, 0.3);
        sunLight.color.copy(kS);
        sunLight.intensity = (lc ? kI : Math.min(kI, 0.6)) * (1 - ca * 0.8 - st * 0.12);
        const sx0 = Math.round(car.position.x / 2) * 2,
          sz0 = Math.round(car.position.z / 2) * 2;
        sunLight.position.set(sx0 + ld.x * 40, Math.max(ld.y, 0.25) * 40, sz0 + ld.z * 40);
        sunLight.target.position.set(sx0, 0, sz0);
        ambient.color
          .copy(kH)
          .lerp(WH, 0.55)
          .lerp(tc.set(0x9fb0b8), ca * 0.4 + st * 0.15);
        ambient.groundColor.copy(desiredGround).multiplyScalar((0.35 + 0.65 * (1 - nF)) * 0.72);
        ambient.intensity = kA * (0.86 + ca * 0.2) * (1 - WXR.fog * 0.05) + flash * 2.5;
        sunMesh.position.copy(camera.position).addScaledVector(sd, 330);
        sunMesh.scale.setScalar(9);
        sunMesh.material.color.copy(kS).lerp(WH, 0.45);
        sunMesh.visible = sd.y > -0.06 && ca < 0.85;
        moon.position.copy(camera.position).addScaledVector(md, 330);
        moon.visible = mUp && ca < 0.9;
        clouds.forEach(c => (c.visible = false));
        cM.color.set(0xffffff).lerp(tc.set(0x6f7882), ca * 0.3 + st * 0.55);
        const wind = 0.7 + st * 2;
        for (const g of cls) {
          const d = g.userData;
          g.position.x += dt * wind * d.sp * 2;
          if (g.position.x > 300) g.position.x = -300;
          g.scale.setScalar(Math.max(0.01, d.s * cl((ca * 1.1 - d.th) * 5, 0, 1)));
          g.visible = g.scale.x > 0.02;
        }
        //roadMat.roughness = 0.85 - 0.55 * WXR.rain;
        //roadMat.metalness = 0.12 * WXR.rain;
        {
          // สายรุ้งโผล่เมื่อฝนตกตอนกลางวันที่ยังมีแดด ค่อยๆ เฟดเข้า-ออก
          const wantRb = WXR.rain > 0.2 && nF < 0.35 && sd.y > 0.06 && WXR.storm < 0.6 ? 1 : 0;
          rainbowA += (wantRb - rainbowA) * Math.min(1, dt * 0.45);
          rainbow.visible = rainbowA > 0.02;
          if (rainbow.visible) {
            const hl = Math.hypot(sd.x, sd.z) || 1,
              R = 360,
              dist = 320;
            rainbow.position.set(
              camera.position.x - (sd.x / hl) * dist,
              camera.position.y - 40,
              camera.position.z - (sd.z / hl) * dist
            );
            rainbow.scale.set(R, R * 0.9, 1);
            rainbow.lookAt(camera.position.x, camera.position.y - 40, camera.position.z);
            rainbow.material.opacity = rainbowA * (0.92 - Math.min(0.25, sd.y * 0.3)) * (1 - ca * 0.2);
          }
        }
        if (nF > 0.58 && ca < 0.65 && !state.reduced) {
          metT -= dt;
          if (metT <= 0) {
            // สุ่มให้บางจังหวะเกิดเป็นชุดฝนดาวตกต่อเนื่องหลายดวงติดกัน
            metT = ER() < 0.45 ? 0.35 + ER() * 0.75 : 1.65 + ER() * 2.4;
            const mt = mets.find(x => !x.visible);
            if (mt) {
              camera.getWorldDirection(fwd);
              const camAz = Math.atan2(fwd.z, fwd.x),
                sweepDir = ER() < 0.5 ? 1 : -1,
                az0 = camAz - sweepDir * (0.22 + ER() * 0.46) + (ER() - 0.5) * 0.38,
                el0 = 0.26 + ER() * 0.35,
                skyR = 262 + ER() * 38,
                d = mt.userData;
              d.az0 = az0;
              d.el0 = el0;
              d.skyR = skyR;
              d.life = 0;

              // สุ่มสีดาวตก (ม่วง, ส้ม, ฟ้า, ชมพู, เขียวมิ้นต์, ทอง, ขาวเงิน) พร้อมไล่เฉดตั้งแต่หัวจรดปลายหาง
              const pal = MET_PALETTES[Math.floor(ER() * MET_PALETTES.length)];
              _metC0.setHex(pal[0]);
              _metC1.setHex(pal[1]);
              _metC2.setHex(pal[2]);
              d.hMat.color.copy(_metC0).lerp(_metC1, 0.55);
              const colArr = d.colArr;
              for (let s = 0; s <= MET_SEGS; s++) {
                const u = s / MET_SEGS;
                if (u < 0.35) _metCTmp.copy(_metC0).lerp(_metC1, u / 0.35);
                else _metCTmp.copy(_metC1).lerp(_metC2, (u - 0.35) / 0.65);
                const ci = s * 6;
                colArr[ci + 0] = colArr[ci + 3] = _metCTmp.r;
                colArr[ci + 1] = colArr[ci + 4] = _metCTmp.g;
                colArr[ci + 2] = colArr[ci + 5] = _metCTmp.b;
              }
              d.rGeo.attributes.color.needsUpdate = true;

              // สุ่มความเร็วดาวตก 3 รูปแบบ: ไวพุ่งวาบ (Fast), ปานกลางพริ้วไหว (Medium), ช้าละมุนหางยาว (Slow Bolide)
              const spdRoll = ER();
              if (spdRoll < 0.36) {
                // 1. พุ่งไวปราดเปรียว (Fast Zippy Meteor: 1.0 - 1.75 วินาที)
                d.azVel = sweepDir * (0.36 + ER() * 0.25);
                d.elVel = -(0.105 + ER() * 0.085);
                d.elGravity = -(0.032 + ER() * 0.022);
                d.waveAmp = (ER() - 0.5) * 0.005;
                d.waveFreq = 3.2 + ER() * 1.8;
                d.max = 1.0 + ER() * 0.75;
                d.trailSpan = 0.34 + ER() * 0.15;
                d.ribbonW = 1.15 + ER() * 0.35;
                d.headSize = 7.4 + ER() * 1.6;
              } else if (spdRoll < 0.72) {
                // 2. ความเร็วปานกลางกำลังดี (Medium Shooting Star: 2.1 - 3.3 วินาที)
                d.azVel = sweepDir * (0.20 + ER() * 0.11);
                d.elVel = -(0.055 + ER() * 0.045);
                d.elGravity = -(0.022 + ER() * 0.015);
                d.waveAmp = (ER() - 0.5) * 0.011;
                d.waveFreq = 2.5 + ER() * 1.4;
                d.max = 2.1 + ER() * 1.2;
                d.trailSpan = 0.75 + ER() * 0.28;
                d.ribbonW = 1.42 + ER() * 0.42;
                d.headSize = 8.6 + ER() * 1.8;
              } else {
                // 3. ช้าละมุนหางยาวสง่างาม (Slow Graceful Fireball: 4.2 - 5.9 วินาที)
                d.azVel = sweepDir * (0.095 + ER() * 0.055);
                d.elVel = -(0.025 + ER() * 0.022);
                d.elGravity = -(0.015 + ER() * 0.012);
                d.waveAmp = (ER() - 0.5) * 0.016;
                d.waveFreq = 2.0 + ER() * 1.2;
                d.max = 4.2 + ER() * 1.7;
                d.trailSpan = 1.35 + ER() * 0.5;
                d.ribbonW = 1.65 + ER() * 0.55;
                d.headSize = 9.8 + ER() * 2.2;
              }
              mt.visible = true;
            }
          }
        }
        for (const mt of mets)
          if (mt.visible) {
            const d = mt.userData;
            d.life += dt;
            const f = d.life / d.max;
            if (f >= 1) {
              mt.visible = false;
              continue;
            }
            // ยึดจุดศูนย์กลาง Group ไว้ที่กล้อง แล้วคำนวณพิกัดท้องฟ้าทรงโค้งพริ้วไหว
            mt.position.copy(camera.position);
            const posArr = d.posArr;
            let hx = 0,
              hy = 0,
              hz = 0;
            for (let s = 0; s <= MET_SEGS; s++) {
              const u = s / MET_SEGS; // 0 = หัวดาวตก, 1 = ปลายหาง
              const tSample = Math.max(0, d.life - u * d.trailSpan);
              const az = d.az0 + d.azVel * tSample;
              const el =
                d.el0 +
                d.elVel * tSample +
                0.5 * d.elGravity * tSample * tSample +
                Math.sin(tSample * d.waveFreq) * d.waveAmp;
              const cosEl = Math.cos(el);
              const px = Math.cos(az) * cosEl * d.skyR;
              const py = Math.sin(el) * d.skyR;
              const pz = Math.sin(az) * cosEl * d.skyR;
              if (s === 0) {
                hx = px;
                hy = py;
                hz = pz;
              }
              // เวกเตอร์ตั้งฉากกับทิศทางการพุ่งและสายตากล้อง เพื่อแผ่ความกว้างริบบิ้นให้หันรับกล้องเสมอ
              const tNext = tSample + 0.04;
              const azN = d.az0 + d.azVel * tNext;
              const elN =
                d.el0 +
                d.elVel * tNext +
                0.5 * d.elGravity * tNext * tNext +
                Math.sin(tNext * d.waveFreq) * d.waveAmp;
              const cosElN = Math.cos(elN);
              const tx = Math.cos(azN) * cosElN * d.skyR - px;
              const ty = Math.sin(elN) * d.skyR - py;
              const tz = Math.sin(azN) * cosElN * d.skyR - pz;
              // Cross product: tangent x radial(p)
              let nx = ty * pz - tz * py;
              let ny = tz * px - tx * pz;
              let nz = tx * py - ty * px;
              const nLen = Math.hypot(nx, ny, nz) || 1;
              // ความกว้างริบบิ้นเรียวแหลมตั้งแต่หัวจรดปลายหางอย่างนุ่มนวล
              const halfW = d.ribbonW * Math.pow(1 - u, 0.75) * (0.35 + 0.65 * Math.sin(Math.min(1, u * 6) * Math.PI * 0.5));
              nx = (nx / nLen) * halfW;
              ny = (ny / nLen) * halfW;
              nz = (nz / nLen) * halfW;
              const vi = s * 6;
              posArr[vi + 0] = px + nx;
              posArr[vi + 1] = py + ny;
              posArr[vi + 2] = pz + nz;
              posArr[vi + 3] = px - nx;
              posArr[vi + 4] = py - ny;
              posArr[vi + 5] = pz - nz;
            }
            d.rGeo.attributes.position.needsUpdate = true;
            d.headSpr.position.set(hx, hy, hz);
            // ความสว่างเฟดเข้าอย่างนุ่มนวล ช่วงกลางสว่างพริ้ว และค่อยๆ จางหายที่ปลายวิถี
            const env = Math.sin(Math.pow(f, 0.75) * Math.PI);
            const shimmer = 0.9 + 0.1 * Math.sin(d.life * 16);
            d.rMat.opacity = env * 0.92;
            d.hMat.opacity = env * shimmer;
            const headSc = ((d.headSize || 8.5) + 2.5 * env) * shimmer;
            d.headSpr.scale.set(headSc, headSc, 1);
          }
        // อัปเดตไฟเตือนการบินสีแดงกระพริบบนยอดเสาส่งสัญญาณโทรศัพท์ตอนพลบค่ำและกลางคืน
        if (window.towerBeacons) {
          const nightVis = cl((nF - 0.18) / 0.35, 0, 1);
          for (const tb of window.towerBeacons) {
            if (!tb.group.visible) continue;
            if (nightVis > 0.01) {
              // จังหวะกระพริบมาตรฐานไฟเตือนการบิน (สว่างวาบ 1.1 วินาที สลับหรี่ลงนุ่มนวล)
              const wave = 0.5 + 0.5 * Math.sin(totalTime * 3.6 + tb.phase);
              const pulse = Math.pow(wave, 2.2) * nightVis;
              tb.spriteMat.opacity = pulse * 0.95;
              tb.bulbMat.color.setRGB(0.38 + 0.62 * pulse, 0.05 + 0.18 * pulse, 0.05 + 0.12 * pulse);
              const sc = 3.2 + pulse * 2.4;
              tb.topGlow.scale.set(sc, sc, 1);
            } else {
              tb.spriteMat.opacity = 0;
              tb.bulbMat.color.setHex(0x661414);
            }
          }
        }
        if (typeof vegUpdate === 'function') {
          try {
            vegUpdate(dt, sd, kS, nF, ca, st, flash);
          } catch (e) {
            if (!window.__vegErr) {
              window.__vegErr = 1;
              console.error(e);
            }
          }
        }
        updCyc(dt);
        const mm = Math.floor(tod * 60),
          key = mm + WXR.kind;
        if (key !== lastKey) {
          lastKey = key;
          const h = Math.floor(tod),
            mi = mm % 60;
          
          // คำนวณองศาเข็มนาฬิกา
          const hrAngle = (h % 12) * 30 + (mi / 60) * 30;
          const minAngle = mi * 6;
          
          // กำหนดไอคอนช่วงเวลา
          let todIcon = svgIcon('sun');
          if (tod < 6 || tod >= 19) todIcon = svgIcon('moon');
          else if (tod >= 17) todIcon = svgIcon('sunset');
          else if (tod < 8.5) todIcon = svgIcon('sunrise');

          // อัปเดต HTML แสดง ไอคอนสภาพอากาศ + นาฬิกาเข็ม + เวลา + ไอคอนช่วงเวลา
          info.innerHTML = `
            <span style="display:flex; align-items:center; gap:8px;">
              <span class="wx-ic" title="${q[4]}">${q[5]}</span>
              <span class="analog-clock" title="${String(h).padStart(2, '0')}:${String(mi).padStart(2, '0')} น.">
                <i class="clock-hour" style="transform: rotate(${hrAngle}deg)"></i>
                <i class="clock-min" style="transform: rotate(${minAngle}deg)"></i>
              </span>
              <span style="font-size:13px; font-weight:500; letter-spacing:1px; margin-top:1px;">${String(h).padStart(2, '0')}:${String(mi).padStart(2, '0')}</span>
              <span class="wx-ic" title="${period(tod)}">${todIcon}</span>
            </span>
          `;
        }
      };
    })();

    /* ===== LIFE: คนหลากหลาย · ทุ่งนากว้าง · หนองน้ำ · นก · หมอกใต้ยอดดอย ===== */
    const LIFE = (() => {
      /* ============================================================================
       * src/scene/38-life/01-setup-mist.js
       * ตัวช่วยพื้นฐานของ LIFE และหมอกใต้ยอดดอย
       * (ไฟล์นี้ถูกต่อรวมเป็น closure เดียวกับไฟล์อื่น — ไม่ต้อง import/export · ลำดับไฟล์ดู build.config.mjs)
       * ========================================================================== */

      const V3 = THREE.Vector3,
        LR = (() => {
          let q = 777123;
          return () => {
            q = (q * 16807) % 2147483647;
            return (q - 1) / 2147483646;
          };
        })(),
        cl = (v, a, b) => Math.max(a, Math.min(b, v)),
        pk = a => a[Math.floor(LR() * a.length)],
        D = new THREE.Object3D(),
        MC = {},
        mt = c => MC[c] || (MC[c] = pm2(c)),
        inH = (x, z, k) => HILLS.some(h => ((x - h.x) / h.r) ** 2 + ((z - h.z) / (h.r * 0.75)) ** 2 < k);
      /* หมอกใต้ยอดดอย */
      const mcv = document.createElement('canvas');
      mcv.width = mcv.height = 64;
      {
        const c = mcv.getContext('2d'),
          g = c.createRadialGradient(32, 32, 0, 32, 32, 32);
        g.addColorStop(0, 'rgba(255,255,255,.95)');
        g.addColorStop(0.55, 'rgba(255,255,255,.45)');
        g.addColorStop(1, 'rgba(255,255,255,0)');
        c.fillStyle = g;
        c.fillRect(0, 0, 64, 64);
      }
      const mistM = new THREE.MeshBasicMaterial({
          map: new THREE.CanvasTexture(mcv),
          transparent: true,
          depthWrite: false,
          opacity: 0.6,
          fog: false
        }),
        mistG = new THREE.CircleGeometry(1, 24);
      for (let hi = 0; hi < HILLS.length; hi += 3) {
        const h = HILLS[hi];
        if (h.isFar) continue;
        const m = new THREE.Mesh(mistG, mistM),
          k = Math.min(18, h.r * 0.95);
        m.rotation.x = -Math.PI / 2;
        m.position.set(h.x, -1 + h.r * h.sy * 0.18, h.z);
        m.scale.set(k, k * 0.75, 1);
        m.renderOrder = 2;
        scene.add(m);
      }

      /* ============================================================================
       * src/scene/38-life/02-human-model.js
       * โมเดลคนแบบละเอียด human()
       * (ไฟล์นี้ถูกต่อรวมเป็น closure เดียวกับไฟล์อื่น — ไม่ต้อง import/export · ลำดับไฟล์ดู build.config.mjs)
       * ========================================================================== */

      /* คนละเอียด (แยกชั้น PolygonOffset ป้องกันกระพริบ Z-Fighting และตั้งค่าจุดเดินไร้รอยต่อ) */
      const PG = new THREE.CylinderGeometry(0.86, 1, 1, 12).translate(0, -0.5, 0),
        SG = new THREE.SphereGeometry(1, 12, 10),
        CN = new THREE.ConeGeometry(1, 1, 12);
      const MD = {},
        MK = {},
        mtO = (c, ly = 1) => {
          const k = c + '_' + ly;
          return (
            MD[k] ||
            (MD[k] = new THREE.MeshStandardMaterial({
              color: c,
              roughness: 0.55,
              metalness: 0.08,
              polygonOffset: true,
              polygonOffsetFactor: -ly * 2,
              polygonOffsetUnits: -ly * 2
            }))
          );
        },
        mtS = c =>
          MK[c] ||
          (MK[c] = new THREE.MeshStandardMaterial({
            color: c,
            roughness: 0.7,
            metalness: 0.05,
            side: THREE.DoubleSide
          }));
      const lb = (p, m, r, l, x, y, z) => {
          const g = new THREE.Group(),
            s = new THREE.Mesh(PG, m);
          g.position.set(x, y, z);
          s.scale.set(r, l, r);
          s.castShadow = false;
          s.receiveShadow = false;
          g.add(s);
          p.add(g);
          return g;
        },
        bl = (p, m, r, x, y, z, sx = 1, sy = 1, sz = 1) => {
          const s = new THREE.Mesh(SG, m);
          s.position.set(x, y, z);
          s.scale.set(r * sx, r * sy, r * sz);
          s.castShadow = false;
          s.receiveShadow = false;
          p.add(s);
          return s;
        },
        cn = (p, m, r, h, x, y, z) => {
          const s = new THREE.Mesh(CN, m);
          s.position.set(x, y, z);
          s.scale.set(r, h, r);
          s.castShadow = false;
          s.receiveShadow = false;
          p.add(s);
          return s;
        };
      const _skirtGeo = new THREE.CylinderGeometry(0.18, 0.29, 0.52, 14, 1, true),
        _hemGeo = new THREE.CylinderGeometry(0.278, 0.296, 0.07, 14, 1, true),
        _torsoGeo = new THREE.CapsuleGeometry(0.168, 0.36, 5, 14),
        _packGeo = new THREE.CapsuleGeometry(0.115, 0.16, 4, 10);
      const SK = [0xf0c9a8, 0xe8bd9c, 0xd9a681, 0xc08a63, 0xa87650],
        HC = [0x2b221d, 0x1c1715, 0x3a2a20],
        GR = 0x9a9893,
        BRIGHT = [0xe98f7d, 0x6e9fb0, 0xd9b56b, 0x8fb177, 0xc7a4d0, 0xd96c7a, 0xf2efe6],
        DKP = [0x3d4a5c, 0x2f3d38, 0x6b5b4a, 0x4a3d5c];
      function human(o) {
        const g = new THREE.Group(),
          sk = mt(o.sk),
          top = mt(o.top),
          bt = mt(o.bt),
          hrO = mtO(o.hair, 1),
          whO = mtO(0xffffff, 1),
          eyO = mtO(0x1b1512, 2),
          lipO = mtO(0xc46960, 2),
          shC = o.shoe || 0x2a2420,
          shoeM = mt(shC),
          soleM = mtO(0xe8e2d5, 1);
        const pel = new THREE.Group(),
          tor = new THREE.Group(),
          hd = new THREE.Group(),
          P = { g, pel, tor, hd, sc: o.sc || 1, v: o.v || 0.5, mode: 'walk', skirt: !!o.skirt, pose: '' };
        pel.position.y = 0.93;
        g.add(pel);
        pel.add(tor);
        P.legs = [-1, 1].map(s => {
          // ต้นขาพร้อมหัวเข่าทรงมนไร้รอยต่อ
          const h = lb(
            pel,
            bt,
            o.skirt ? 0.052 : 0.082,
            o.skirt ? 0.38 : 0.45,
            s * (o.skirt ? 0.068 : 0.095),
            0,
            0
          );
          bl(h, o.short || o.skirt ? sk : bt, o.skirt ? 0.05 : 0.064, 0, -0.44, 0.006);
          const k = lb(h, o.short || o.skirt ? sk : bt, 0.058, 0.43, 0, -0.45, 0);
          if (o.kid && !o.run) cyl(0.058, 0.052, 0.16, whO, 0, -0.33, 0, k);
          bl(k, o.kid && !o.run ? whO : sk, 0.044, 0, -0.42, 0);
          const ft = new THREE.Group();
          ft.position.set(0, -0.44, 0.038);
          k.add(ft);
          bl(ft, shoeM, 0.062, 0, 0.004, 0.012, 0.95, 0.66, 1.82);
          bl(ft, soleM, 0.063, 0, -0.022, 0.012, 0.96, 0.28, 1.85);
          return { h, k };
        });
        if (o.skirt) {
          const skM = mtS(o.bt),
            hemM = mtO(o.top === o.bt ? 0xc76d1e : 0xd9b56b, 2);
          const s = new THREE.Mesh(_skirtGeo, skM);
          s.position.y = -0.22;
          s.castShadow = false;
          pel.add(s);
          const hm = new THREE.Mesh(_hemGeo, hemM);
          hm.position.y = -0.44;
          pel.add(hm);
        }
        bl(tor, bt, 0.168, 0, 0.03, 0, 1.02, 0.68, 0.84);
        if (!o.skirt || o.hs !== 3) {
          cyl(0.172, 0.172, 0.052, mtO(o.hs === 3 ? 0xb86818 : 0x3d2e22, 1), 0, 0.085, 0, tor);
          if (o.hs !== 3) bl(tor, mtO(0xd9b56b, 2), 0.032, 0, 0.085, 0.172, 1.1, 0.9, 0.35);
        }
        const torso = new THREE.Mesh(_torsoGeo, top);
        torso.position.set(0, 0.35, 0);
        torso.scale.set(1, 1, 0.83);
        torso.castShadow = true;
        tor.add(torso);
        cyl(0.072, 0.088, 0.06, mtO(o.kid ? 0xf6f3ea : o.top, 1), 0, 0.58, 0.01, tor);
        if (o.hs === 3) {
          const sash = cyl(0.065, 0.085, 0.54, mtO(0xc76d1e, 2), -0.09, 0.33, 0.02, tor, 0, 0.22);
          sash.scale.set(0.9, 1, 1.9);
        } else if (o.kid) {
          cyl(0.018, 0.026, 0.18, mtO(o.skirt ? 0x26364f : 0x8fb177, 2), 0, 0.47, 0.168, tor);
        }
        lb(tor, sk, 0.048, 0.13, 0, 0.66, 0);
        hd.position.y = 0.78;
        if (o.kid) hd.scale.setScalar(1.22);
        tor.add(hd);
        bl(hd, sk, 0.115, 0, 0, 0, 0.93, 1.08, 1);
        bl(hd, sk, 0.068, 0, -0.065, 0.035, 1, 0.65, 0.9);
        const glassFrmM = mtO(0x5a4a3a, 3);
        for (const s of [-1, 1]) {
          bl(hd, sk, 0.026, s * 0.112, -0.005, -0.005, 0.48, 1, 0.7);
          bl(hd, whO, 0.02, s * 0.042, 0.018, 0.11, 1, 0.85, 0.45);
          bl(hd, eyO, 0.011, s * 0.042, 0.018, 0.123, 1, 1, 0.6);
          const brw = box(0.032, 0.007, 0.008, mtO(o.hair, 2), s * 0.042, 0.048, 0.118, hd);
          brw.rotation.z = -s * 0.08;
          // แว่นตาผู้สูงอายุแบบกรอบโปร่ง (ไม่ใช้กล่องทึบบังดวงตา)
          if (o.old) {
            box(0.038, 0.004, 0.006, glassFrmM, s * 0.042, 0.033, 0.128, hd);
            box(0.038, 0.004, 0.006, glassFrmM, s * 0.042, 0.003, 0.128, hd);
            box(0.004, 0.03, 0.006, glassFrmM, s * 0.061, 0.018, 0.128, hd);
            box(0.004, 0.03, 0.006, glassFrmM, s * 0.023, 0.018, 0.128, hd);
          }
        }
        if (o.old) box(0.016, 0.004, 0.006, glassFrmM, 0, 0.022, 0.129, hd);
        bl(hd, sk, 0.019, 0, -0.012, 0.125, 0.85, 1.1, 1);
        bl(hd, lipO, 0.016, 0, -0.052, 0.116, 1.1, 0.35, 0.4);
        const hs = o.hs;
        if (hs !== 3) {
          bl(hd, hrO, 0.128, 0, 0.044, -0.024, 0.99, 0.86, 1.06);
          bl(hd, hrO, 0.096, 0, 0.097, 0.057, 1.15, 0.38, 0.65);
          for (const s of [-1, 1]) bl(hd, hrO, 0.036, s * 0.107, 0.01, 0.02, 0.45, 1.3, 0.7);
          if (hs === 1) {
            bl(hd, hrO, 0.068, 0, 0.135, -0.095);
            cyl(0.04, 0.04, 0.025, mtO(0xd96c7a, 2), 0, 0.11, -0.08, hd, 0.6, 0);
          }
          if (hs === 2) bl(hd, hrO, 0.105, 0, -0.095, -0.085, 0.98, 1.85, 0.72);
          if (hs === 4) {
            bl(hd, hrO, 0.046, 0, -0.09, -0.155, 0.9, 2.1, 0.9);
            cyl(0.028, 0.028, 0.02, mtO(0xf0c95a, 2), 0, 0.01, -0.13, hd, 0.8, 0);
          }
        }
        if (o.hat === 'straw') {
          cn(hd, mt(0xd8bd7a), 0.38, 0.15, 0, 0.18, 0);
          cyl(0.134, 0.138, 0.03, mtO(0x8a6a44, 2), 0, 0.12, 0, hd);
        } else if (o.hat === 'cap') {
          const hc = mtO(o.hatc || 0xd9534a, 2);
          bl(hd, hc, 0.138, 0, 0.075, -0.005, 1.02, 0.74, 1.08);
          bl(hd, hc, 0.095, 0, 0.062, 0.135, 0.95, 0.16, 0.85);
        } else if (o.hat === 'towel') {
          bl(hd, mtO(0xf6f3ea, 2), 0.142, 0, 0.07, 0, 1.03, 0.66, 1.08);
          cyl(0.14, 0.14, 0.045, mtO(0xd9534a, 3), 0, 0.058, 0, hd);
        } else if (o.hat === 'basket') {
          cn(hd, mt(0xc89b5a), 0.31, 0.19, 0, 0.205, 0);
        } else if (o.hat === 'wide') {
          cn(hd, mt(0xe6d5a8), 0.35, 0.07, 0, 0.15, 0);
          cyl(0.128, 0.138, 0.09, mt(0xe6d5a8), 0, 0.17, 0, hd);
          cyl(0.136, 0.136, 0.025, mtO(0x6e4d33, 2), 0, 0.14, 0, hd);
        }
        P.arms = [-1, 1].map(s => {
          const sh = lb(tor, top, 0.054, 0.29, s * 0.228, 0.54, 0);
          bl(sh, top, 0.062, 0, 0, 0);
          if (!o.long) cyl(0.058, 0.058, 0.04, mtO(o.top, 1), 0, -0.26, 0, sh);
          bl(sh, o.long ? top : sk, 0.046, 0, -0.29, 0);
          const el = lb(sh, o.long ? top : sk, 0.044, 0.27, 0, -0.29, 0);
          const hnd = new THREE.Group();
          hnd.position.set(0, -0.28, 0);
          el.add(hnd);
          bl(hnd, sk, 0.044, 0, 0, 0.008, 0.85, 1.1, 1.15);
          bl(hnd, sk, 0.018, -s * 0.032, 0.005, 0.035, 0.8, 1.2, 1);
          return { sh, el, hnd, s };
        });
        const w = mt(0x5a4b3f),
          p = o.p || '';
        // 1. ไม้เท้าคนแก่ (ยึดติดในมือขวาโดยตรง มือจับหัวไม้เท้าและปลายไม้แตะพื้นพอดี)
        if (p.includes('cane')) {
          P.hasCane = true;
          const rArm = P.arms[1];
          rArm.sh.rotation.x = -0.34;
          rArm.el.rotation.x = -0.24;
          const caneG = new THREE.Group();
          caneG.rotation.x = 0.58; // ชดเชยองศาแขนให้ไม้เท้าตั้งฉากลงพื้น
          rArm.hnd.add(caneG);
          // หัวไม้เท้าโค้งรับอุ้งมือ + ตัวไม้เท้า + จุกยางกันลื่นที่ปลาย
          cyl(0.015, 0.015, 0.11, w, 0, 0.01, 0.01, caneG, Math.PI / 2, 0);
          bl(caneG, w, 0.017, 0, 0.01, 0.065);
          bl(caneG, w, 0.017, 0, 0.01, -0.045);
          cyl(0.014, 0.01, 0.94, w, 0, -0.46, 0.025, caneG);
          cyl(0.013, 0.014, 0.035, shoeM, 0, -0.92, 0.025, caneG);
          P.caneG = caneG;
        }
        // 2. ร่มกันฝน/กันแดด (ยึดด้ามร่มเข้ากับฝ่ามือโดยตรง และกางคลุมตรงกลางศีรษะพอดี)
        if (p.includes('umb')) {
          const uSide = P.hasCane ? -1 : 1,
            uArm = P.hasCane ? P.arms[0] : P.arms[1],
            uCol = mt(o.uc || pk(BRIGHT));
          const u = new THREE.Group();
          uArm.hnd.add(u);
          // ด้ามจับร่มอยู่ในอุ้งมือ + ก้านร่ม + โครงหลังคาร่มทรงโดมคลุมเหนือศีรษะ
          cyl(0.016, 0.016, 0.12, uCol, 0, -0.02, 0, u);
          cyl(0.01, 0.011, 0.96, mt(0xc8d0d8), 0, 0.46, 0, u);
          cn(u, uCol, 0.64, 0.24, 0, 0.96, 0);
          bl(u, uCol, 0.12, 0, 1.04, 0, 1.4, 0.4, 1.4);
          cyl(0.008, 0.012, 0.06, mt(0xc8d0d8), 0, 1.1, 0, u);
          P.umb = u;
          P.umbSide = uSide;
          P.umbArm = uArm;
          u.visible = false;
        }
        // 3. คานหาบของ (วางพาดบ่าพร้อมเชือก 2 เส้นต่อข้าง และยกมือประคองคานหาบ)
        if (p.includes('pole')) {
          P.pose = 'pole';
          cyl(0.016, 0.016, 1.42, w, 0, 0.59, -0.02, tor, 0, Math.PI / 2);
          for (const s of [-1, 1]) {
            bl(tor, mt(0xc89b5a), 0.175, s * 0.66, 0.12, -0.02, 1, 0.62, 1);
            for (const rz of [-0.08, 0.08]) {
              cyl(0.004, 0.004, 0.46, w, s * 0.66, 0.35, -0.02 + rz * 0.5, tor, rz * 0.35, 0);
            }
          }
          P.arms[1].sh.rotation.x = -0.75;
          P.arms[1].el.rotation.x = -1.12;
        }
        // 4. จอบพาดบ่า (ยึดด้ามจอบเข้ากับฝ่ามือขวาโดยตรง และพาดผ่านหัวไหล่ขวาอย่างแม่นยำ)
        if (p.includes('hoe')) {
          P.pose = 'carryR';
          const rArm = P.arms[1];
          rArm.sh.rotation.set(-0.78, 0, -0.1);
          rArm.el.rotation.set(-1.16, 0, 0);
          const carryG = new THREE.Group();
          carryG.rotation.x = 1.94; // ชดเชยองศาแขนขวาให้แกนของ carryG ขนานกับลำตัวเสมอ
          rArm.hnd.add(carryG);
          // ด้ามจอบไม้ผ่านกลางฝ่ามือ (0,0,0) พาดขึ้นบนบ่าขวา (0, 0.15, -0.48) ไปด้านหลัง
          // ด้ามเอียงขึ้นจากมือหน้าอกข้ามหัวไหล่ไปด้านหลัง (ปลายด้ามด้านหลังสูงกว่ามือ)
          cyl(0.016, 0.015, 1.15, w, 0, 0.11, -0.356, carryG, -1.27, 0);
          // คอจอบเหล็กหักลงด้านล่างจากปลายด้าม ใบจอบห้อยลงหลังไหล่ ขอบคมชี้ลงพื้น
          cyl(0.022, 0.02, 0.12, mt(0x555b62), 0, 0.235, -0.936, carryG, 3.785, 0);
          const blade = box(0.2, 0.16, 0.022, mt(0x7c858e), 0, 0.126, -1.018, carryG);
          blade.rotation.x = 0.6435;
          box(0.2, 0.025, 0.03, mt(0xaab3ba), 0, 0.045, -1.066, carryG).rotation.x = 0.6435; // ขอบคมใบจอบ
          P.carryG = carryG;
        }
        // 5. กระเป๋าเป้ / กระเป๋านักเรียนทรงโค้งมนพร้อมสายสะพายไหล่โค้งแนบตัว
        if (p.includes('bag') || p.includes('sbag')) {
          const sm = p.includes('sbag'),
            bm = mt(o.bc || (sm ? 0x6e9fb0 : pk(BRIGHT))),
            strapM = mtO(0x2f3d38, 1);
          const pack = new THREE.Mesh(_packGeo, bm);
          pack.position.set(0, 0.35, -0.18);
          pack.scale.set(sm ? 0.95 : 1.08, sm ? 0.92 : 1.08, 0.68);
          tor.add(pack);
          bl(tor, strapM, sm ? 0.09 : 0.105, 0, 0.44, -0.18, 1.15, 0.45, 0.72);
          for (const s of [-1, 1]) {
            cyl(0.016, 0.016, 0.34, strapM, s * 0.115, 0.39, 0.11, tor, 0.12, 0);
            bl(tor, strapM, 0.028, s * 0.115, 0.56, 0.01, 0.7, 0.6, 2.2);
          }
        }
        // 6. คันเบ็ดตกปลาไม้ไผ่ (ยึดติดในฝ่ามือขวาพร้อมรอก สายเบ็ดหย่อนลงถึงผิวน้ำ และทุ่นลอยน้ำ)
        if (p.includes('rod')) {
          P.pose = 'carryR';
          const rArm = P.arms[1];
          rArm.sh.rotation.set(-0.74, 0, -0.04);
          rArm.el.rotation.set(-1.1, 0, 0);
          const carryG = new THREE.Group();
          carryG.rotation.x = 1.84;
          rArm.hnd.add(carryG);
          // ด้ามคันเบ็ดไม้ไผ่ยาวผ่านจุดกึ่งกลางมือ (0,0,0) ชี้เฉียงออกไปเหนือผิวน้ำด้านหน้า (ปลายคันเบ็ดอยู่ที่ y = 0.82, z = 1.78)
          cyl(0.004, 0.015, 2.05, w, 0, 0.41, 0.89, carryG, 1.14, 0);
          cyl(0.024, 0.024, 0.048, mt(0x3a4046), 0, -0.02, 0.08, carryG, 0, Math.PI / 2); // รอกตกปลา
          // สายเบ็ดหย่อนดิ่งจากปลายคันเบ็ด (y = 0.82) ลงไปจุ่มผิวน้ำ (y = -1.03 ในพิกัดมือ = ระดับผิวน้ำพอดี)
          cyl(0.0022, 0.0022, 1.85, mt(0xe8eef2), 0, -0.105, 1.78, carryG);
          // ทุ่นตกปลาสีแดง-ขาวลอยอยู่บนผิวน้ำ + วงคลื่นน้ำกระเพื่อมรอบทุ่น
          bl(carryG, mt(0xd9534a), 0.024, 0, -1.0, 1.78, 0.85, 1.35, 0.85);
          bl(carryG, mt(0xfaf8f5), 0.022, 0, -1.03, 1.78, 0.9, 0.85, 0.9);
          const ripM = new THREE.MeshBasicMaterial({ color: 0xdff6ff, transparent: true, opacity: 0.55, side: THREE.DoubleSide });
          const rip1 = new THREE.Mesh(new THREE.RingGeometry(0.045, 0.065, 12), ripM);
          rip1.rotation.x = -Math.PI / 2;
          rip1.position.set(0, -1.02, 1.78);
          const rip2 = new THREE.Mesh(new THREE.RingGeometry(0.11, 0.128, 14), ripM);
          rip2.rotation.x = -Math.PI / 2;
          rip2.position.set(0, -1.022, 1.78);
          carryG.add(rip1, rip2);
          P.carryG = carryG;
        }
        // 7. บาตรพระ (อุ้มประคองไว้ด้านหน้าด้วยสองมือ)
        if (p.includes('bowl')) {
          P.pose = 'bowl';
          bl(tor, mt(0x3a3028), 0.115, 0, 0.24, 0.2, 1, 0.84, 1);
          cyl(0.088, 0.095, 0.025, mtO(0xc76d1e, 2), 0, 0.32, 0.2, tor);
          for (const a of P.arms) {
            a.sh.rotation.x = -0.42;
            a.sh.rotation.z = -a.s * 0.24;
            a.el.rotation.x = -0.82;
          }
        }
        // 8. กล้องถ่ายรูปคล้องคอ (พร้อมสายคล้องคอ)
        if (p.includes('cam')) {
          const strapM = mtO(0x2f3d38, 2);
          for (const s of [-1, 1]) cyl(0.005, 0.005, 0.24, strapM, s * 0.045, 0.49, 0.145, tor, -0.35, -s * 0.15);
          box(0.11, 0.075, 0.055, mt(0x2b2b2b), 0, 0.38, 0.185, tor);
          cyl(0.03, 0.03, 0.04, mtO(0x1b1512, 2), 0, 0.38, 0.22, tor, Math.PI / 2, 0);
        }
        // 9. ย่ามสะพายข้าง (พร้อมสายผ้าพาดเฉียงจากไหล่ซ้ายมาเอวขวา)
        if (p.includes('sac')) {
          const sacM = mt(0xe6d5a8);
          bl(tor, sacM, 0.135, 0.165, 0.14, 0.06, 0.78, 1.05, 0.95);
          cyl(0.02, 0.02, 0.52, sacM, 0.02, 0.36, 0.13, tor, -0.18, 0.56);
          cyl(0.02, 0.02, 0.52, sacM, 0.02, 0.36, -0.11, tor, 0.18, 0.56);
        }
        // ปิด Frustum Culling รายชิ้นเพื่อไม่ให้ชิ้นส่วนร่างกายกระพริบหายที่ขอบจอ
        g.traverse(obj => {
          if (obj.isMesh) obj.frustumCulled = false;
        });
        g.userData.selfCulled = true;
        g.scale.setScalar(P.sc);
        scene.add(g);
        return P;
      }

      /* ============================================================================
       * src/scene/38-life/03-crowd-archetypes.js
       * รูปแบบตัวละคร (ARCH), ฝูงคน (crowd) และการวางคนเดินตามทาง
       * (ไฟล์นี้ถูกต่อรวมเป็น closure เดียวกับไฟล์อื่น — ไม่ต้อง import/export · ลำดับไฟล์ดู build.config.mjs)
       * ========================================================================== */

      const ARCH = [
        () => ({
          sk: pk(SK),
          top: 0x2f4a6b,
          bt: 0x3b4a5c,
          hair: pk(HC),
          hs: 0,
          hat: 'straw',
          long: 1,
          p: 'hoe',
          v: 0.45,
          k: 1
        }),
        () => ({
          sk: pk(SK),
          top: pk([0xd96c7a, 0x8fb177, 0xc7a4d0]),
          bt: pk([0x2f4a6b, 0x6b3a4a, 0x2f6b5a]),
          skirt: 1,
          short: 1,
          hair: pk(HC),
          hs: 1,
          hat: 'towel',
          long: 1,
          p: 'pole',
          v: 0.42,
          k: 1
        }),
        () => ({
          sk: 0xd9a681,
          top: 0xe08a2e,
          bt: 0xe08a2e,
          skirt: 1,
          short: 1,
          hair: 0x1c1715,
          hs: 3,
          p: 'umb bowl',
          uc: 0xe08a2e,
          v: 0.5,
          k: 3
        }),
        () => ({
          sk: pk(SK),
          top: 0xf6f3ea,
          bt: 0x26364f,
          skirt: 1,
          short: 1,
          hair: pk(HC),
          hs: pk([1, 2, 4]),
          p: 'sbag',
          bc: 0x6e9fb0,
          sc: 0.88,
          kid: 1,
          v: 0.6,
          k: 2
        }),
        () => ({
          sk: pk(SK),
          top: 0xf6f3ea,
          bt: 0x2b3b5a,
          short: 1,
          hair: pk(HC),
          hs: 0,
          p: 'sbag',
          bc: 0x8fb177,
          sc: 0.9,
          kid: 1,
          v: 0.65,
          k: 2
        }),
        () => ({
          sk: pk(SK),
          top: pk(BRIGHT),
          bt: pk(DKP),
          short: 1,
          hair: pk(HC),
          hs: pk([0, 1, 4]),
          sc: 0.65,
          kid: 1,
          hat: pk(['cap', 0]),
          v: 0.55,
          k: 5
        }),
        () => ({
          sk: pk(SK),
          top: 0xe8e4d8,
          bt: 0x5b5348,
          hair: GR,
          hs: 0,
          p: 'cane',
          sc: 0.97,
          v: 0.28,
          old: 1,
          long: 1,
          k: 4
        }),
        () => ({
          sk: pk(SK),
          top: 0xc7a4d0,
          bt: 0x6b3a4a,
          skirt: 1,
          short: 1,
          hair: GR,
          hs: 1,
          p: 'cane umb',
          long: 1,
          v: 0.27,
          old: 1,
          k: 4
        }),
        () => ({
          sk: pk(SK),
          top: pk([0x3d6a8a, 0xd9534a, 0x2f7d4f]),
          bt: 0x26364f,
          short: 1,
          hair: pk(HC),
          hs: pk([0, 4]),
          hat: 'cap',
          hatc: 0xf2efe6,
          v: 0.62,
          run: 1,
          k: 0
        }),
        () => ({
          sk: 0xf0c9a8,
          top: pk([0xe98f7d, 0x6e9fb0, 0xf2efe6]),
          bt: 0xc9b48a,
          short: 1,
          hair: 0x6b4a2e,
          hs: pk([0, 1]),
          hat: 'wide',
          p: 'bag cam',
          bc: 0x3d4a5c,
          sc: 1.04,
          v: 0.55,
          k: 0
        }),
        () => ({
          sk: pk(SK),
          top: pk([0xd96c7a, 0x6e9fb0, 0xf0c95a]),
          bt: pk([0x2f6b5a, 0x6b3a4a]),
          skirt: 1,
          short: 1,
          hair: pk(HC),
          hs: 2,
          p: 'umb',
          v: 0.5,
          k: 6
        }),
        () => ({
          sk: pk(SK),
          top: pk([0xe6d5a8, 0x8fb177]),
          bt: 0x3d4a5c,
          short: 1,
          hair: pk(HC),
          hs: 0,
          hat: 'towel',
          p: 'bag',
          v: 0.5,
          k: 1
        }),
        () => ({
          sk: pk(SK),
          top: pk([0xe98f7d, 0xf0c95a]),
          bt: 0x2f4a6b,
          skirt: 1,
          short: 1,
          hair: pk(HC),
          hs: 1,
          hat: 'basket',
          p: 'sac',
          v: 0.4,
          k: 6
        }),
        () => ({
          sk: pk(SK),
          top: 0xf2efe6,
          bt: 0x2f3d38,
          hair: pk(HC),
          hs: 0,
          p: 'bag',
          bc: 0x2f3d38,
          long: 1,
          v: 0.62,
          k: 0
        })
      ];
      const crowd = [],
        zoneIdx = [];
      function safeWalkT(t) {
        // ขยับจุดเกิดให้อยู่ห่างจากจุดตัดต่อเส้นโค้ง (0.56 และ 0.92) เพื่อป้องกันเวกเตอร์ถนนกระตุก
        t = ((t % 1) + 1) % 1;
        if (Math.abs(t - 0.56) < 0.022) t = t < 0.56 ? 0.535 : 0.585;
        if (Math.abs(t - 0.92) < 0.022) t = t < 0.92 ? 0.895 : 0.945;
        if (t < 0.02) t = 0.025;
        if (t > 0.98) t = 0.975;
        return t;
      }
      function addP(o, mode, x, z, t, off) {
        const h = human(o);
        h.mode = mode;
        h.ph = LR() * 6;
        h.nt = LR();
        const st = mode === 'walk' ? safeWalkT(t) : t;
        h.hotspotType = [T_SCHOOL_FIELD, 0.81].some(schoolT => Math.abs(st - schoolT) < 0.025) ? 'school' : '';
        h.hotspotIndex = crowd.length;
        h.t0 = h.t = st;
        h.dist = 0;
        h.dir = LR() < 0.5 ? 1 : -1;
        h.off = off;
        h.span = (o.run ? 14 : 8) + LR() * 14;
        h.run = o.run ? 1 : 0;
        h.v = cl(o.v || 0.45, 0.25, 0.65);
        h.x = x;
        h.z = z;
        h.yaw = LR() * 6;
        h.turn = h.dir > 0 ? 0 : Math.PI;
        h.k = o.k ?? 0;
        h.cool = 0;
        h.at = 0;
        h.dly = LR() * 1.2;
        h.headYaw = 0;
        if (mode === 'walk') {
          const pc = route.getPoint(st),
            tn = route.getTangent(st),
            p1 = route.getPoint((st + 0.001) % 1);
          h.ds = cl(pc.distanceTo(p1) / 0.001, 220, 1800);
          h.x0 = pc.x;
          h.z0 = pc.z;
          h.smoothTan = new V3(tn.x, 0, tn.z).normalize();
          n0.set(-tn.z, 0, tn.x);
          h.g.position.copy(pc).addScaledVector(n0, off);
          h.g.rotation.y = Math.atan2(tn.x, tn.z) + h.turn;
        }
        crowd.push(h);
        return h;
      }
      walkers.forEach(w => (w.g.visible = false));
      walkers.length = 0;
      // กระจายคนเดินตามความยาวถนนจริง (ช่วง 0.03..0.54 ยาว ~380m ใช้ 24% · ช่วง 0.56..0.95 ยาว ~1,450m ใช้ 76%) และเว้นระยะห่างไม่ให้แออัด
      for (let n = 0; n < 16; n++) {
        const u = (n + 0.5) / 16,
          t = (u < 0.25 ? 0.03 + (u / 0.25) * 0.51 : 0.565 + ((u - 0.25) / 0.75) * 0.385) + (LR() - 0.5) * 0.008,
          pc = route.getPoint(safeWalkT(t));
        if (crowd.some(h => h.mode === 'walk' && (h.x0 - pc.x) * (h.x0 - pc.x) + (h.z0 - pc.z) * (h.z0 - pc.z) < 28 * 28)) continue;
        const sd = LR() < 0.5 ? -1 : 1;
        addP(pk(ARCH)(), 'walk', 0, 0, t, sd * (4.15 + LR() * 0.5));
      }
      // นักวิ่งจ๊อกกิ้ง (Joggers) กระจายวิ่งทั่วทั้งแผนที่ (ตั้งแต่ 0.04 ถึง 0.94 ทั้งในเมืองและนอกเมือง) วิ่งระยะทางยาวและสมูท
      const JOG_TOPS = [0xff5c4d, 0x2ec4b6, 0xffbe0b, 0x3a86ff, 0x8338ec, 0x06d6a0, 0xf77f00],
        JOG_SHORTS = [0x1d2533, 0x263238, 0x1e3a5f, 0x2b2d42];
      for (let j = 0; j < 12; j++) {
        const jt = 0.045 + (j / 11) * 0.895 + (LR() - 0.5) * 0.012,
          jsd = j % 2 === 0 ? 1 : -1,
          jogger = addP(
            {
              sk: pk(SK),
              top: JOG_TOPS[j % JOG_TOPS.length],
              bt: JOG_SHORTS[j % JOG_SHORTS.length],
              short: 1,
              hair: pk(HC),
              hs: pk([0, 1, 2, 4]),
              hat: j % 3 === 0 ? 'cap' : 0,
              shoe: 0xf4f7fb,
              sc: 0.94 + LR() * 0.1,
              v: 0.68 + LR() * 0.12,
              run: 1,
              k: 2
            },
            'walk',
            0,
            0,
            jt,
            jsd * (3.95 + LR() * 0.35)
          );
        jogger.span = 65 + LR() * 45; // วิ่งระยะยาวต่อเนื่องตามแนวถนน
      }
      for (let i = 0; i < 6; i++) {
        const u = (i + 0.5) / 6,
          t = u < 0.34 ? 0.08 + (u / 0.34) * 0.44 : 0.58 + ((u - 0.34) / 0.66) * 0.34,
          tn = route.getTangent(t);
        let spot = null;
        for (const sd of i % 2 ? [-1, 1] : [1, -1]) {
          for (const off of [5.8, 6.6, 7.4]) {
            const o = offRoad(t, sd * off),
              a = { x: o.x - tn.x * 0.48, z: o.z - tn.z * 0.48 },
              b = { x: o.x + tn.x * 0.48, z: o.z + tn.z * 0.48 };
            if (spotOK(a.x, a.z, 0.55) && spotOK(b.x, b.z, 0.55)) {
              spot = { a, b, sd };
              break;
            }
          }
          if (spot) break;
        }
        if (!spot) continue;
        const outfit = () => ({
          sk: pk(SK),
          top: pk(BRIGHT),
          bt: pk(DKP),
          short: 1,
          hair: pk(HC),
          hs: pk([0, 1, 2, 4]),
          hat: pk([0, 'cap']),
          long: 1,
          sc: 0.9 + LR() * 0.15,
          v: 0.25,
          k: i % 7
        });
        const a = addP(outfit(), 'talk', spot.a.x, spot.a.z, t, spot.sd * 6),
          b = addP(outfit(), 'talk', spot.b.x, spot.b.z, t, spot.sd * 6);
        a.g.position.set(spot.a.x, 0, spot.a.z);
        b.g.position.set(spot.b.x, 0, spot.b.z);
        a.yaw = Math.atan2(spot.b.x - spot.a.x, spot.b.z - spot.a.z);
        b.yaw = Math.atan2(spot.a.x - spot.b.x, spot.a.z - spot.b.z);
        a.g.rotation.y = a.yaw;
        b.g.rotation.y = b.yaw;
        a.partner = b;
        b.partner = a;
        a.talkSide = 1;
        b.talkSide = -1;
      }

      /* ============================================================================
       * src/scene/38-life/04-ponds.js
       * หนองน้ำ ใบบัว และกก
       * (ไฟล์นี้ถูกต่อรวมเป็น closure เดียวกับไฟล์อื่น — ไม่ต้อง import/export · ลำดับไฟล์ดู build.config.mjs)
       * ========================================================================== */

      /* ลำดับสร้างโลก: หนองน้ำ → ทุ่งนา → ตาล/กระท่อม */
      const waterM = new THREE.MeshStandardMaterial({
          color: 0x0284c7,
          emissive: 0x0369a1,
          emissiveIntensity: 0.32,
          roughness: 0.06,
          metalness: 0.15
        }),
        PD = [];
      {
        const flat = new THREE.CircleGeometry(1, 32).rotateX(-Math.PI / 2),
          outerBermsM = mt(0x7d8450),
          shM = mt(0x7c6848),
          wetMudM = mt(0x5d4b33),
          shallowRimM = new THREE.MeshStandardMaterial({
            color: 0x38bdf8,
            emissive: 0x0284c7,
            emissiveIntensity: 0.28,
            roughness: 0.08,
            metalness: 0.1
          }),
          bankRockM = mt(0x78756e),
          padG = new THREE.CircleGeometry(0.5, 8).rotateX(-Math.PI / 2),
          padM = new THREE.MeshStandardMaterial({ color: 0x5e9a55, roughness: 0.9, side: THREE.DoubleSide }),
          lotM = mt(0xf0a7c0),
          reedM = swayMat(0.12);
          
        const reedG = buildReedClusterGeo(true);
        for (let i = 0, n = 0; n < 7 && i < 600; i++) {
          const x = 20 + LR() * 300,
            z = -130 + LR() * 340,
            rx = 10 + LR() * 10,
            rz = rx * (0.6 + LR() * 0.3);
          if (inH(x, z, 1.6) || !spotOK(x, z, rx + 8)) continue;
          taken.push([x, z, rx + 4]);
          n++;
          PD.push({ x, z, rx, rz });
          // คันดินปนหญ้ารอบสระชั้นนอก
          const berm = new THREE.Mesh(flat, outerBermsM);
          berm.position.set(x, 0.008, z);
          berm.scale.set(rx * 1.24, 1, rz * 1.24);
          scene.add(berm);
          // ตลิ่งดินปนทรายชั้นกลาง
          const sh = new THREE.Mesh(flat, shM);
          sh.position.set(x, 0.015, z);
          sh.scale.set(rx * 1.13, 1, rz * 1.13);
          scene.add(sh);
          // ขอบดินโคลนชื้นริมน้ำ
          const mud = new THREE.Mesh(flat, wetMudM);
          mud.position.set(x, 0.022, z);
          mud.scale.set(rx * 1.05, 1, rz * 1.05);
          scene.add(mud);
          // โซนน้ำตื้นไล่ระดับสีขอบบ่อ
          const shWater = new THREE.Mesh(flat, shallowRimM);
          shWater.position.set(x, 0.027, z);
          shWater.scale.set(rx * 1.0, 1, rz * 1.0);
          scene.add(shWater);
          // ผิวน้ำลึกกลางสระ
          const w = new THREE.Mesh(flat, waterM);
          w.position.set(x, 0.033, z);
          w.scale.set(rx * 0.93, 1, rz * 0.93);
          scene.add(w);
          // โขดหินริมตลิ่งรอบสระน้ำ
          for (let rk = 0; rk < 22; rk++) {
            const rAng = (rk / 22) * Math.PI * 2 + (LR() - 0.5) * 0.22,
              rDist = 0.97 + LR() * 0.14,
              rxP = x + Math.cos(rAng) * rx * rDist,
              rzP = z + Math.sin(rAng) * rz * rDist,
              rRad = 0.18 + LR() * 0.26;
            bl(scene, bankRockM, rRad, rxP, 0.04, rzP, 1.3 + LR() * 0.5, 0.48 + LR() * 0.25, 1.0 + LR() * 0.4);
          }
          const pads = new THREE.InstancedMesh(padG, padM, 45),
            L = [];
          for (let k = 0; k < 45; k++) {
            const a = LR() * 6.28,
              r = Math.sqrt(LR()) * 0.85;
            D.position.set(x + Math.cos(a) * r * rx, 0.05, z + Math.sin(a) * r * rz);
            D.rotation.set(0, LR() * 6, 0);
            D.scale.setScalar(0.8 + LR() * 1.2);
            D.updateMatrix();
            pads.setMatrixAt(k, D.matrix);
            if (k % 4 === 0) L.push([D.position.x, D.position.z]);
          }
          scene.add(pads);
          L.forEach(q => bl(scene, lotM, 0.16, q[0], 0.14, q[1], 1, 0.6, 1));
          const rd = new THREE.InstancedMesh(reedG, reedM, 80);
          for (let k = 0; k < 80; k++) {
            const a = LR() * 6.28,
              r = 1.02 + LR() * 0.18;
            D.position.set(x + Math.cos(a) * r * rx, 0, z + Math.sin(a) * r * rz);
            D.rotation.set((LR() - 0.5) * 0.3, LR() * 6.28, (LR() - 0.5) * 0.3);
            D.scale.setScalar(0.7 + LR() * 0.7);
            D.updateMatrix();
            rd.setMatrixAt(k, D.matrix);
          }
          rd.frustumCulled = false;
          scene.add(rd);
        }
      }

      /* ============================================================================
       * src/scene/38-life/05-rice-fields.js
       * ทุ่งนากว้าง
       * (ไฟล์นี้ถูกต่อรวมเป็น closure เดียวกับไฟล์อื่น — ไม่ต้อง import/export · ลำดับไฟล์ดู build.config.mjs)
       * ========================================================================== */

      /* ทุ่งนา */
      const cells = [];
      {
        const st = document.createElement('canvas');
        st.width = st.height = 64;
        const c = st.getContext('2d');
        c.fillStyle = '#fff';
        c.fillRect(0, 0, 64, 64);
        c.fillStyle = 'rgba(60,90,40,.28)';
        for (let i = 0; i < 64; i += 6) c.fillRect(0, i, 64, 2);
        const tx = new THREE.CanvasTexture(st);
        tx.wrapS = tx.wrapT = THREE.RepeatWrapping;
        tx.repeat.set(1, 1);
        const PL = new THREE.PlaneGeometry(1, 1).rotateX(-Math.PI / 2),
          fmat = new THREE.MeshStandardMaterial({ map: tx, roughness: 1 }),
          cs = [],
          PAL = [0x8fbf5a, 0x7fb04f, 0xa9c95a, 0xd9c25a, 0xc9a95a, 0x9c8456, 0x86b4c2, 0x6fa86a, 0xb7c75a];
        for (let x = -160; x < 520; x += 21)
          for (let z = -200; z < 460; z += 21) {
            const cx = x + (LR() - 0.5) * 3,
              cz = z + (LR() - 0.5) * 3;
            if (inH(cx, cz, 1.25) || !spotOK(cx, cz, 14.5)) continue;
            cs.push([cx, cz]);
          }
        const fi = new THREE.InstancedMesh(PL, fmat, cs.length),
          col = new THREE.Color();
        cs.forEach((q, i) => {
          D.position.set(q[0], 0.02 + LR() * 0.02, q[1]);
          D.rotation.set(0, LR() < 0.5 ? 0 : Math.PI / 2, 0);
          D.scale.set(16 + LR() * 2, 1, 16 + LR() * 2);
          D.updateMatrix();
          fi.setMatrixAt(i, D.matrix);
          {
            const _pc = pk(PAL);
            fi.setColorAt(i, col.set(_pc).multiplyScalar(0.9 + LR() * 0.2));
            q.c = _pc;
            cells.push(q);
            FIELDS.push(q);
          }
        });
        fi.receiveShadow = true;
        fi.frustumCulled = false;
        scene.add(fi);
      }

      /* ============================================================================
       * src/scene/38-life/06-palms-huts-farmers.js
       * ตาล กระท่อม หุ่นไล่กา และคนตามคันนา/ริมหนอง
       * (ไฟล์นี้ถูกต่อรวมเป็น closure เดียวกับไฟล์อื่น — ไม่ต้อง import/export · ลำดับไฟล์ดู build.config.mjs)
       * ========================================================================== */

      /* ================= ล้างแผ่นนาตารางสุ่มที่ทับโซนเกษตรกรรมก่อนวางหุ่นไล่กาและชาวนา ================= */
      for (let i = FIELDS.length - 1; i >= 0; i--) {
        if (FIELDS[i][0] > 85 && FIELDS[i][1] > -65) FIELDS.splice(i, 1);
      }
      scene.children.forEach(obj => {
        if (obj.isInstancedMesh && obj.count === cells.length) {
          const zeroM = new THREE.Matrix4().makeScale(0, 0, 0);
          cells.forEach((q, idx) => {
            if (q[0] > 85 && q[1] > -65) obj.setMatrixAt(idx, zeroM);
          });
          obj.instanceMatrix.needsUpdate = true;
        }
      });
      // คัดเฉพาะแปลงนาที่อยู่ใกล้ถนน (มีกอข้าว 3D จริง) เพื่อให้ชาวนาดำนาและหุ่นไล่กาอยู่ในแปลงนาข้าว 100%
      const activeRiceCells = FIELDS.map(q => {
        let m = 1e9;
        for (let i = 0; i < routePts.length; i += 24) {
          const dx = routePts[i] - q[0],
            dz = routePts[i + 1] - q[1];
          m = Math.min(m, dx * dx + dz * dz);
        }
        return { q, d: m };
      })
        .filter(o => o.d < 42 * 42)
        .sort((a, b) => a.d - b.d)
        .slice(0, 48)
        .map(o => o.q);
      const plantedRiceCells = activeRiceCells.filter(q => q.c !== 0x9c8456 && q.c !== 0x86b4c2);
      const safeRicePool = plantedRiceCells.length ? plantedRiceCells : activeRiceCells.length ? activeRiceCells : FIELDS;

      // ฟังก์ชันสร้าง "หุ่นไล่กา (Scarecrow)" แบบละเอียดสมจริง ตั้งอยู่ชิด/ในแปลงนาข้าว
      const _scBambooM = mt(0x8f7452),
        _scStrawM = mt(0xd9be6b),
        _scBurlapM = mt(0xc8b082),
        _scRopeM = mt(0x6e5536),
        _scShirts = [mt(0x2f4a6b), mt(0x8a3b2e), mt(0x3b6e52), mt(0x6b4c35)],
        _scPatches = [mt(0xe08a2e), mt(0xd96c7a), mt(0xf0c95a)],
        _scHatM = mt(0xd8bd7a),
        _scEyeM = mt(0x231b16);
      function makeScarecrow(wx, wz, yaw) {
        const s = new THREE.Group();
        s.position.set(wx, 0, wz);
        s.rotation.y = yaw;
        s.rotation.z = (LR() - 0.5) * 0.08;
        scene.add(s);

        const shM = pk(_scShirts),
          ptM = pk(_scPatches);

        // 1. เสาไม้ไผ่หลักปักดิน + คานไม้ไผ่กางแขน + เชือกมัดกากบาทกลางอก
        cyl(0.036, 0.044, 1.85, _scBambooM, 0, 0.92, 0, s);
        cyl(0.026, 0.028, 1.38, _scBambooM, 0, 1.34, 0, s, 0, Math.PI / 2);
        cyl(0.012, 0.012, 0.22, _scRopeM, 0, 1.34, 0.03, s, 0, 0.78);
        cyl(0.012, 0.012, 0.22, _scRopeM, 0, 1.34, 0.03, s, 0, -0.78);

        // 2. มัดฟางข้าวโผล่ที่ชายเสื้อด้านล่าง คอเสื้อ และปลายแขนเสื้อทั้งสองข้าง
        for (let k = -2; k <= 2; k++) {
          cyl(0.025, 0.05, 0.28, _scStrawM, k * 0.06, 0.82, (k % 2) * 0.02, s, 0, k * 0.09);
        }
        for (const side of [-1, 1]) {
          // แขนเสื้อหม้อห้อมสวมคานไม้ไผ่
          cyl(0.075, 0.09, 0.44, shM, side * 0.34, 1.34, 0, s, 0, Math.PI / 2);
          // ฟางข้าวบานออกที่ปลายแขนเสื้อ
          for (let f = -1; f <= 1; f++) {
            cyl(0.018, 0.04, 0.22, _scStrawM, side * 0.6, 1.34 + f * 0.03, f * 0.02, s, f * 0.18, side * 1.45);
          }
        }

        // 3. ตัวเสื้อหม้อห้อมชาวนา + เชือกฟางคาดเอว + รอยผ้าปะชุนสีสดใส
        cyl(0.17, 0.23, 0.56, shM, 0, 1.15, 0, s);
        cyl(0.185, 0.185, 0.05, _scRopeM, 0, 1.02, 0, s); // เชือกฟางมัดเอว
        box(0.11, 0.11, 0.02, ptM, 0.07, 1.22, 0.18, s).rotation.z = 0.15; // ผ้าปะชุนหน้าอก
        box(0.09, 0.08, 0.02, _scPatches[2], -0.08, 1.08, 0.19, s).rotation.z = -0.12;
        // ผ้าขาวม้าพันคอหุ่นไล่กา
        cyl(0.11, 0.12, 0.06, _scPatches[1], 0, 1.45, 0, s);

        // 4. หัวกระสอบป่านยัดฟาง + ตา/ปากเย็บด้ายดำ + งอบชาวนาสานปีกกว้าง
        bl(s, _scBurlapM, 0.145, 0, 1.64, 0, 0.96, 1.08, 0.96);
        for (const side of [-1, 1]) {
          box(0.028, 0.008, 0.01, _scEyeM, side * 0.048, 1.66, 0.135, s).rotation.z = 0.7;
          box(0.028, 0.008, 0.01, _scEyeM, side * 0.048, 1.66, 0.135, s).rotation.z = -0.7;
        }
        cn(s, _scStrawM, 0.022, 0.06, 0, 1.62, 0.15).rotation.x = Math.PI / 2; // จมูกฟาง
        box(0.07, 0.01, 0.01, _scEyeM, 0, 1.57, 0.132, s); // รอยยิ้มเย็บด้าย

        const hatG = new THREE.Group();
        hatG.position.set(0, 1.78, 0);
        hatG.rotation.z = 0.12;
        hatG.rotation.x = -0.08;
        s.add(hatG);
        cn(hatG, _scHatM, 0.42, 0.18, 0, 0.04, 0);
        cyl(0.14, 0.15, 0.05, _scRopeM, 0, -0.02, 0, hatG);

        // 5. นกกระจอกตัวเล็กเกาะปลายแขนหุ่นไล่กา
        bl(s, _scRopeM, 0.04, 0.52, 1.41, 0, 0.85, 0.8, 1.35);
        bl(s, _scRopeM, 0.026, 0.52, 1.45, 0.045);
        return s;
      }

      /* ตาล กระท่อม หุ่นไล่กา ตามคันนา */
      {
        const tg = new THREE.CylinderGeometry(0.16, 0.26, 7.5, 6).translate(0, 3.75, 0),
          cg = new THREE.IcosahedronGeometry(1, 1).scale(2.7, 0.8, 2.7).translate(0, 7.7, 0),
          pc = [];
        for (let i = 0; i < 300 && pc.length < 48; i++) {
          const q = pk(FIELDS),
            x = q[0] + 10.5,
            z = q[1] + 10.5;
          if (inH(x, z, 1.2) || !spotOK(x, z, 1.5)) continue;
          taken.push([x, z, 1.8]);
          pc.push([x, z, 0.85 + LR() * 0.5]);
        }
        const tm = new THREE.InstancedMesh(tg, mt(0x8a7352), pc.length),
          cm = new THREE.InstancedMesh(cg, mt(0x5f8a45), pc.length);
        pc.forEach((q, i) => {
          D.position.set(q[0], 0, q[1]);
          D.rotation.set(0, LR() * 6, (LR() - 0.5) * 0.08);
          D.scale.setScalar(q[2]);
          D.updateMatrix();
          tm.setMatrixAt(i, D.matrix);
          cm.setMatrixAt(i, D.matrix);
        });
        tm.frustumCulled = cm.frustumCulled = false;
        tm.castShadow = cm.castShadow = true;
        scene.add(tm, cm);
        const rf = mt(0xc2a05a),
          po = mt(0x8f7452);
        for (let i = 0, n = 0; i < 300 && n < 10; i++) {
          const q = pk(activeRiceCells.length ? activeRiceCells : FIELDS),
            x = q[0] - 8.2,
            z = q[1] + 8.2;
          if (inH(x, z, 1.2) || !spotOK(x, z, 2.5)) continue;
          taken.push([x, z, 2.5]);
          n++;
          const g = new THREE.Group();
          g.position.set(x, 0, z);
          g.rotation.y = LR() * 6;
          scene.add(g);
          for (const a of [-1, 1])
            for (const b of [-1, 1]) cyl(0.06, 0.07, 1.1, po, a * 0.9, 0.55, b * 0.8, g);
          box(2.1, 0.1, 1.8, po, 0, 1.1, 0, g);
          for (const a of [-1, 1])
            for (const b of [-1, 1]) cyl(0.04, 0.05, 1.2, po, a * 0.9, 1.7, b * 0.8, g);
          cn(g, rf, 1.75, 1.1, 0, 3, 0).rotation.y = Math.PI / 4;
          box(2.1, 0.05, 1.8, mt(0xd8c49a), 0, 0.9, 0, g);
        }
        // วางหุ่นไล่กาไว้ข้างในแปลงนาข้าวจริง (safeRicePool และแปลงนาริมทาง PADS)
        for (let i = 0; i < Math.min(12, safeRicePool.length); i++) {
          const q = safeRicePool[(i * 3) % safeRicePool.length];
          makeScarecrow(q[0] + (LR() - 0.5) * 7, q[1] + (LR() - 0.5) * 7, LR() * 6.28);
        }
        PADS.forEach(pd => {
          const pg = pd[0];
          const wp = new THREE.Vector3(2.2, 0, -2.8).applyMatrix4(pg.matrixWorld);
          makeScarecrow(wp.x, wp.z, pg.rotation.y + 0.4);
        });
      }
      // วางชาวนาก้มดำนา (mode: 'work') เฉพาะในแปลงนาที่มีต้นข้าว 3D จริงเท่านั้น (safeRicePool)
      for (let i = 0; i < 16; i++) {
        const q = safeRicePool[i % safeRicePool.length];
        addP(
          {
            sk: pk(SK),
            top: pk([0x2f4a6b, 0xd96c7a, 0x8fb177, 0xe6d5a8]),
            bt: 0x3b4a5c,
            short: 1,
            hair: pk(HC),
            hs: 0,
            hat: 'straw',
            long: 1,
            v: 0,
            k: 1
          },
          'work',
          q[0] + (LR() - 0.5) * 8.5,
          q[1] + (LR() - 0.5) * 8.5,
          0,
          0
        );
      }
      // วางคนตกปลาริมบ่อน้ำ (PD และสระบัวริมทาง) พร้อมสะพานไม้ตกปลาแบบละเอียด หันหน้าเข้าหาน้ำและหย่อนสายเบ็ดลงน้ำตรงเป๊ะ
      const _pierWoodM = sm2(0x7c5a38),
        _pierPlankAltM = sm2(0x6d4e2f),
        _pierPostM = sm2(0x4b331d),
        _pierRopeM = sm2(0xc4a472),
        _bambooCreelM = sm2(0xc8a35c),
        _bucketM = sm2(0x3b6e8c),
        _waterRingM = new THREE.MeshBasicMaterial({
          color: 0xd8f1f8,
          transparent: true,
          opacity: 0.42,
          side: THREE.DoubleSide
        }),
        _castNetMeshM = new THREE.MeshStandardMaterial({
          color: 0xe6edf2,
          roughness: 0.65,
          transparent: true,
          opacity: 0.48,
          side: THREE.DoubleSide
        }),
        _castLeadM = sm2(0x495057);
      const placeFishermanAtPond = (p, ang) => {
        const fx = p.x + Math.cos(ang) * (p.rx * 0.94),
          fz = p.z + Math.sin(ang) * ((p.rz || p.rx * 0.75) * 0.94),
          yawToWater = Math.atan2(p.x - fx, p.z - fz);
        // สร้างแท่นยืนตกปลาไม้แบบละเอียด (คานรับพื้น + แผ่นไม้กระดานเรียงซี่ + เสาตอม่อพันเชือก + ข้องใส่ปลา + ถังเหยื่อ + สวิง + เก้าอี้ไม้เตี้ย)
        const pier = new THREE.Group();
        pier.position.set(fx, 0, fz);
        pier.rotation.y = yawToWater;
        scene.add(pier);

        // หินและดินอัดคอสะพานฝั่งตลิ่ง
        for (let s = -1; s <= 1; s++) {
          ball(0.16, _pierPostM, s * 0.34, 0.04, -0.62, pier, 1.3, 0.5, 1.1);
        }
        // ขั้นบันไดไม้ก้าวขึ้นแท่น
        box(0.96, 0.045, 0.22, _pierPlankAltM, 0, 0.06, -0.52, pier);

        // คานตงไม้รับแผ่นพื้น 2 เส้นขนาน
        box(0.08, 0.07, 1.68, _pierPostM, -0.42, 0.085, 0.24, pier);
        box(0.08, 0.07, 1.68, _pierPostM, 0.42, 0.085, 0.24, pier);
        // คานขวางรัดหัว-ท้าย
        box(1.06, 0.06, 0.08, _pierPostM, 0, 0.08, -0.35, pier);
        box(1.06, 0.06, 0.08, _pierPostM, 0, 0.08, 0.92, pier);

        // แผ่นไม้กระดานปูพื้นเรียงทีละแผ่น (9 แผ่น) สลับเฉดสีไม้ธรรมชาติ
        for (let k = 0; k < 9; k++) {
          const pz = -0.36 + k * 0.165,
            plankM = k % 2 === 0 ? _pierWoodM : _pierPlankAltM;
          box(1.14, 0.036, 0.145, plankM, 0, 0.125, pz, pier);
        }

        // เสาตอม่อไม้ 6 ต้น พร้อมเชือกพันหัวเสาและวงคลื่นน้ำรอบโคนเสาในน้ำ
        for (const px of [-0.46, 0.46]) {
          for (const pz of [-0.34, 0.3, 0.92]) {
            const isFront = pz > 0.8;
            cyl(0.052, 0.058, isFront ? 0.58 : 0.42, _pierPostM, px, isFront ? 0.14 : 0.06, pz, pier);
            // เชือกมัดเสากับคาน
            cyl(0.062, 0.062, 0.045, _pierRopeM, px, 0.11, pz, pier);
            if (pz > 0) {
              const rip = new THREE.Mesh(new THREE.RingGeometry(0.065, 0.13, 14), _waterRingM);
              rip.rotation.x = -Math.PI / 2;
              rip.position.set(px, 0.048, pz);
              pier.add(rip);
            }
          }
        }
        // ราวไม้กั้นขอบด้านข้างเตี้ยๆ กันของตกน้ำ
        box(0.045, 0.04, 1.28, _pierPlankAltM, -0.52, 0.16, 0.28, pier);
        box(0.045, 0.04, 1.28, _pierPlankAltM, 0.52, 0.16, 0.28, pier);

        // อุปกรณ์ตกปลาบนแท่น: ถังน้ำใส่ปลา + ข้องสานไม้ไผ่ + เก้าอี้ไม้เตี้ย + สวิงช้อนปลาวางพาด
        cyl(0.13, 0.105, 0.23, _bucketM, -0.34, 0.255, 0.35, pier);
        cyl(0.115, 0.115, 0.02, waterM, -0.34, 0.35, 0.35, pier);
        // ข้องใส่ปลาสานไม้ไผ่ทรงกลมป่องมีคอขวด
        ball(0.13, _bambooCreelM, 0.35, 0.23, 0.46, pier, 1, 1.15, 1);
        cyl(0.065, 0.085, 0.09, _bambooCreelM, 0.35, 0.35, 0.46, pier);
        // เก้าอี้ตั่งไม้เตี้ยด้านหลังคนตกปลา
        box(0.28, 0.03, 0.22, _pierWoodM, 0.28, 0.24, -0.06, pier);
        box(0.035, 0.11, 0.2, _pierPostM, 0.17, 0.18, -0.06, pier);
        box(0.035, 0.11, 0.2, _pierPostM, 0.39, 0.18, -0.06, pier);
        // ด้ามสวิงตักปลาวางพาดขอบแท่น
        const dipPole = cyl(0.014, 0.016, 0.95, _bambooCreelM, -0.38, 0.17, 0.72, pier);
        dipPole.rotation.x = Math.PI / 2 + 0.12;
        dipPole.rotation.z = 0.18;

        const standX = fx + Math.sin(yawToWater) * 0.42,
          standZ = fz + Math.cos(yawToWater) * 0.42;
        const f = addP(
          {
            sk: pk(SK),
            top: pk([0xe6d5a8, 0x6e9fb0, 0x8fb177, 0xd9b56b]),
            bt: 0x4a3f35,
            short: 1,
            hair: pk(HC),
            hs: 0,
            hat: 'straw',
            p: 'rod',
            v: 0,
            k: 4
          },
          'fish',
          standX,
          standZ,
          0,
          0
        );
        f.yaw = yawToWater;
        f.g.position.set(standX, 0.145, standZ);
        f.g.rotation.y = yawToWater;
      };
      PD.forEach((p, idx) => {
        placeFishermanAtPond(p, idx % 2 === 0 ? 0.25 : -2.6);
      });
      if (window.__ROADSIDE_PONDS) {
        window.__ROADSIDE_PONDS.forEach((p, idx) => {
          placeFishermanAtPond(p, Math.atan2(-p.sd * p.tn.x, p.sd * p.tn.z) + (idx % 2 ? 0.35 : -0.35));
        });
      }

      // ================= คนทอดแห (Cast-Net Fishermen) และคนหาปลาข้างแม่น้ำ (River Fishermen & Trap Foragers) =================
      if (typeof RIVER_PTS !== 'undefined' && RIVER_PTS.length > 8) {
        const riverSampleIndices = [1, 3, 6, 9, 12, 15, 18, 21, 24, 27];
        riverSampleIndices.forEach((rIdx, sOrder) => {
          const q = RIVER_PTS[Math.min(rIdx, RIVER_PTS.length - 1)];
          if (!q) return;
          const dxR = q.px - q.x,
            dzR = q.pz - q.z,
            dLen = Math.hypot(dxR, dzR) || 1,
            ax = dxR / dLen,
            az = dzR / dLen,
            tx = -az,
            tz = ax,
            yawToRiver = Math.atan2(-ax, -az);

          if (sOrder % 2 === 0) {
            // 1. คนทอดแหริมแม่น้ำ (Cast-Net Fisherman) พร้อมแหจับปลาที่กางพุ่งลงผิวน้ำและวงน้ำกระเพื่อม
            const bankDist = q.w * 0.95,
              fx = q.x + ax * bankDist + tx * ((sOrder - 4) * 0.6),
              fz = q.z + az * bankDist + tz * ((sOrder - 4) * 0.6);
            const caster = addP(
              {
                sk: pk(SK),
                top: pk([0x8c3b2b, 0x3d5a80, 0x6b705c, 0xb5838d, 0x457b9d]),
                bt: 0x3b322c,
                short: 1,
                hair: pk(HC),
                hs: 0,
                hat: sOrder % 4 === 0 ? 'straw' : 'towel',
                v: 0,
                k: 4
              },
              'castnet',
              fx,
              fz,
              0,
              0
            );
            caster.yaw = yawToRiver;
            caster.g.position.set(fx, 0.02, fz);
            caster.g.rotation.y = yawToRiver;

            // ข้องใส่ปลาไม้ไผ่วางข้างตลิ่ง
            ball(0.14, _bambooCreelM, -0.45, 0.14, -0.2, caster.g, 1, 1.15, 1);
            cyl(0.07, 0.09, 0.09, _bambooCreelM, -0.45, 0.27, -0.2, caster.g);

            // โมเดลแหจับปลา (ทรงกรวยตาข่ายโปร่งแสง + ลูกถ่วงตะกั่วรอบชายแห + เชือกสาวแห + วงน้ำกระเพื่อม)
            const netG = new THREE.Group();
            netG.position.set(0, 0.06, 2.35);
            caster.g.add(netG);
            const netCone = new THREE.Mesh(new THREE.ConeGeometry(1.18, 0.95, 18, 2), _castNetMeshM);
            netCone.position.y = 0.46;
            netG.add(netCone);
            // ลูกถ่วงตะกั่วรอบชายแห
            for (let lk = 0; lk < 12; lk++) {
              const la = (lk / 12) * Math.PI * 2;
              ball(0.032, _castLeadM, Math.cos(la) * 1.15, 0.04, Math.sin(la) * 1.15, netG);
            }
            // เชือกสาวแหโยงจากจอมแหเข้าหามือคนทอดแห
            const rope = cyl(0.008, 0.008, 2.15, _pierRopeM, 0, 0.92, -0.95, netG);
            rope.rotation.x = 1.18;
            // วงน้ำกระเพื่อมตรงจุดที่แหตกกระทบน้ำ
            const splashRing = new THREE.Mesh(new THREE.RingGeometry(0.85, 1.32, 24), _waterRingM);
            splashRing.rotation.x = -Math.PI / 2;
            splashRing.position.y = 0.02;
            netG.add(splashRing);
            caster.castNetG = netG;
            caster.splashRing = splashRing;
          } else {
            // 2. คนหาปลาข้างแม่น้ำ (คนดักสุ่มจับปลา / ยกยอ / ตกปลาริมตลิ่ง)
            const bankDist = q.w * 0.98,
              fx = q.x + ax * bankDist + tx * ((sOrder - 5) * 0.5),
              fz = q.z + az * bankDist + tz * ((sOrder - 5) * 0.5),
              useTrap = sOrder % 4 === 1;
            const riverFisher = addP(
              {
                sk: pk(SK),
                top: pk([0x7f9eb2, 0xc9ada7, 0x95b89c, 0xd4a373]),
                bt: 0x3d352e,
                short: 1,
                hair: pk(HC),
                hs: 0,
                hat: 'straw',
                p: useTrap ? 0 : 'rod',
                v: 0,
                k: 4
              },
              useTrap ? 'work' : 'fish',
              fx,
              fz,
              0,
              0
            );
            riverFisher.yaw = yawToRiver;
            riverFisher.g.position.set(fx, 0.03, fz);
            riverFisher.g.rotation.y = yawToRiver;

            // สุ่มจับปลาไม้ไผ่สาน (ทรงกรวยตัดมีซี่ไม้ไผ่และช่องล้วงจับปลาด้านบน) + ข้องใส่ปลา + ถังน้ำ
            const trapG = new THREE.Group();
            trapG.position.set(useTrap ? 0 : 0.62, 0.02, useTrap ? 0.68 : 0.35);
            riverFisher.g.add(trapG);
            for (let r = 0; r < 10; r++) {
              const ra = (r / 10) * Math.PI * 2,
                rib = cyl(0.01, 0.012, 0.68, _bambooCreelM, Math.cos(ra) * 0.25, 0.31, Math.sin(ra) * 0.25, trapG);
              rib.rotation.z = Math.cos(ra) * 0.26;
              rib.rotation.x = -Math.sin(ra) * 0.26;
            }
            // ขอบปากสุ่มด้านบนและวงแหวนไม้ไผ่รัดกลางสุ่ม
            const topRim = new THREE.Mesh(new THREE.TorusGeometry(0.14, 0.018, 8, 16), _pierRopeM);
            topRim.rotation.x = Math.PI / 2;
            topRim.position.y = 0.62;
            trapG.add(topRim);
            const midRim = new THREE.Mesh(new THREE.TorusGeometry(0.24, 0.014, 8, 16), _bambooCreelM);
            midRim.rotation.x = Math.PI / 2;
            midRim.position.y = 0.32;
            trapG.add(midRim);
            // ข้องใส่ปลาและถังข้างตัว
            ball(0.13, _bambooCreelM, -0.42, 0.14, 0.1, riverFisher.g, 1, 1.15, 1);
            cyl(0.12, 0.095, 0.21, _bucketM, 0.42, 0.12, -0.15, riverFisher.g);
          }
        });
      }

      /* ================= โซนใหม่ 4 โซน (t: 0.55 - 0.95) ================= */

      // วัสดุสำหรับทั้ง 4 โซนเกษตรกรรม
      const paddyBaseM = sm2(0x7c6a46),
        ridgeSoilM = sm2(0x6b533b),
        darkSoilM = sm2(0x543f2b),
        strawGoldM = sm2(0xd9be6b),
        thatchRoofM = sm2(0xc9b068),
        bambooM = sm2(0x8c7148),
        fenceWoodM = sm2(0x9c7a50),
        crateWoodM = sm2(0xc49558),
        sackClothM = sm2(0xe2d0a4);

      const cornStalkM = mt(0x5b8c32),
        cornLeafM = new THREE.MeshStandardMaterial({
          color: 0x6ea13d,
          roughness: 0.75,
          side: THREE.DoubleSide
        }),
        cornHuskM = mt(0x8bbd52),
        cornKernelM = mt(0xf5c438),
        cornTasselM = mt(0xe5ce74),
        cornSilkM = mt(0x9e6332);

      const orcTrunkM = sm2(0x654832),
        orcLeafDark = sm2(0x3b6e2c),
        orcLeafMid = sm2(0x528a39),
        orcLeafLight = sm2(0x73ab4b),
        fruitStyles = [
          { m: mt(0xf2851d), r: 0.095, cluster: 1 }, // ส้มสายน้ำผึ้ง
          { m: mt(0xd93848), r: 0.068, cluster: 3 }, // ลิ้นจี่จักรพรรดิ (ออกเป็นพวง)
          { m: mt(0xc9974c), r: 0.058, cluster: 4 }  // ลำไยสีทอง (ออกเป็นพวง)
        ];

      const cocoTrunkM = sm2(0x846c4c),
        cocoLeafM = new THREE.MeshStandardMaterial({
          color: 0x5c8f36,
          roughness: 0.7,
          side: THREE.DoubleSide
        }),
        cocoNutGreen = mt(0x6e9c3b),
        cocoNutBrown = mt(0x5c462e);

      // สร้างรูปทรงใบโค้งธรรมชาติ (ใช้กับใบข้าวโพดและทางมะพร้าว)
      function makeArchedBladeGeo(len, width, archH, dropY) {
        const segs = 6,
          pos = [],
          idx = [];
        for (let i = 0; i <= segs; i++) {
          const u = i / segs,
            z = u * len,
            y = Math.sin(u * Math.PI) * archH - u * u * dropY,
            w = width * Math.sin((1 - u * 0.88) * Math.PI * 0.5) * (1 - u * 0.75);
          pos.push(-w, y, z, w, y, z);
          if (i < segs) {
            const a = i * 2;
            idx.push(a, a + 1, a + 2, a + 1, a + 3, a + 2);
          }
        }
        const geo = new THREE.BufferGeometry();
        geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
        geo.setIndex(idx);
        geo.computeVertexNormals();
        return geo;
      }

      const cornBladeGeo = makeArchedBladeGeo(0.78, 0.085, 0.18, 0.34);
      const palmFrondGeo = makeArchedBladeGeo(2.9, 0.34, 0.45, 1.35);
      const ridgeGeo = new THREE.CylinderGeometry(0.24, 0.32, 7.6, 8).rotateX(Math.PI / 2);

      // ฟังก์ชันสร้างต้นข้าวโพด (ลดชิ้นส่วนใบและฝักเพื่อเพิ่ม FPS)
      function makeCornPlant(sc) {
        const p = new THREE.Group();
        p.scale.setScalar(sc);
        cyl(0.026, 0.046, 1.75, cornStalkM, 0, 0.875, 0, p);
        cyl(0.008, 0.015, 0.28, cornTasselM, 0, 1.86, 0, p);
        
        // ลดใบข้าวโพดเหลือ 3 ใบ (จากเดิม 6)
        for (let l = 0; l < 3; l++) {
          const lf = new THREE.Mesh(cornBladeGeo, cornLeafM);
          lf.position.y = 0.4 + l * 0.45;
          lf.rotation.y = l * 2.15 + (LR() - 0.5) * 0.25;
          p.add(lf);
        }
        
        // ลดฝักข้าวโพดเหลือแค่ 1 ฝั่ง และสุ่มมีแค่ 50%
        if (LR() > 0.5) {
          const earG = new THREE.Group();
          earG.position.set(0.04, 0.98, 0);
          earG.rotation.z = -0.52;
          cyl(0.046, 0.054, 0.16, cornHuskM, 0, 0.07, 0, earG);
          cyl(0.032, 0.044, 0.22, cornKernelM, 0, 0.14, 0, earG);
          ball(0.032, cornKernelM, 0, 0.25, 0, earG);
          cyl(0.018, 0.006, 0.07, cornSilkM, 0, 0.29, 0, earG);
          p.add(earG);
        }
        return p;
      }

      const _soilRingGeo = new THREE.RingGeometry(0.22, 0.72, 12);
      // ฟังก์ชันสร้างต้นไม้ผล (ลดจำนวนพุ่มใบและผลไม้เพื่อเพิ่ม FPS)
      function makeOrchardTree(styleIdx, sc) {
        const g = new THREE.Group();
        g.scale.setScalar(sc);
        const st = fruitStyles[styleIdx % fruitStyles.length];
        const ring = new THREE.Mesh(_soilRingGeo, darkSoilM);
        ring.rotation.x = -Math.PI / 2;
        ring.position.y = 0.015;
        g.add(ring);
        
        cyl(0.16, 0.24, 0.28, orcTrunkM, 0, 0.14, 0, g);
        cyl(0.11, 0.16, 1.15, orcTrunkM, 0, 0.72, 0, g);
        for (let b = 0; b < 3; b++) { // ลดกิ่งหลักเหลือ 3
          const ba = b * 2.09;
          cyl(0.045, 0.08, 0.75, orcTrunkM, Math.cos(ba) * 0.24, 1.42, Math.sin(ba) * 0.24, g, Math.sin(ba) * 0.62, -Math.cos(ba) * 0.62);
        }
        
        const blobs = [
          [0, 1.95, 0, 0.95, orcLeafMid],
          [0.58, 1.75, 0.35, 0.72, orcLeafDark],
          [-0.38, 1.8, 0.56, 0.68, orcLeafMid],
          [0.25, 2.38, 0.18, 0.62, orcLeafLight]
        ]; // ลดพุ่มเหลือ 4 ก้อน
        blobs.forEach(([bx, by, bz, br, bm], bi) => {
          const m = new THREE.Mesh(leafGeo, bm);
          m.position.set(bx, by, bz);
          m.scale.set(br * 1.08, br * 0.86, br * 1.08);
          m.rotation.set(LR() * 2, LR() * 2, LR() * 2);
          m.castShadow = bi === 0;
          g.add(m);
          
          // ลดจำนวนลูกผลไม้ที่ต้องคำนวณ
          for (let f = 0; f < 2; f++) {
            const fa = LR() * 6.28, fe = -0.15 + LR() * 0.75;
            const fx = bx + Math.cos(fa) * Math.cos(fe) * br * 0.92;
            const fy = by + Math.sin(fe) * br * 0.72;
            const fz = bz + Math.sin(fa) * Math.cos(fe) * br * 0.92;
            ball(st.r, st.m, fx, fy, fz, g);
          }
        });
        return g;
      }

      zoneIdx.push(crowd.length);
      // ================= โซน 1: ทุ่งนาขั้นบันได & เถียงนา (t: 0.565 - 0.652) =================
      let paddyCount = 0;
      for (let t = 0.565; t < 0.652; t += 0.009) {
        for (const sd of [-1, 1]) {
          for (let tier = 0; tier < 2; tier++) {
            const off = sd * (12.8 + tier * 10.2),
              o = offRoad(t, off);
            if (!spotOK(o.x, o.z, 6.4)) continue;
            taken.push([o.x, o.z, 5.8]);
            paddyCount++;

            const estate = new THREE.Group();
            estate.position.set(o.x, 0, o.z);
            estate.rotation.y = Math.atan2(o.tn.x, o.tn.z);
            scene.add(estate);

            // แผ่นดินโคลนรองรับแปลงนาคู่ (เชื่อม 2 แปลงติดกันเป็นผืนเดียว)
            box(13.4, 0.05, 9.4, paddyBaseM, 0, 0.02, 0, estate);
            const isRipe = (paddyCount + tier) % 3 === 0;
            for (const subX of [-3.25, 3.25]) {
              const subG = new THREE.Group();
              subG.position.set(subX, 0, 0);
              estate.add(subG);
              PADS.push([subG, isRipe]);
            }

            // เพิ่มเถียงนาไม้ไผ่และกองฟางริมคันนาสำหรับแปลงแถวหน้า
            if (tier === 0 && paddyCount % 2 === 0) {
              const hut = new THREE.Group();
              hut.position.set(-sd * 5.2, 0, -3.6);
              estate.add(hut);
              for (const hx of [-0.75, 0.75])
                for (const hz of [-0.65, 0.65]) cyl(0.05, 0.06, 1.55, bambooM, hx, 0.77, hz, hut);
              box(1.7, 0.08, 1.5, bambooM, 0, 0.62, 0, hut);
              box(1.55, 0.04, 1.35, strawGoldM, 0, 0.67, 0, hut);
              const roof = new THREE.Mesh(new THREE.ConeGeometry(1.45, 0.85, 4), thatchRoofM);
              roof.position.y = 1.88;
              roof.rotation.y = Math.PI / 4;
              roof.castShadow = true;
              hut.add(roof);
              // กองฟางสีทองริมคันนา
              for (let s = 0; s < 2; s++) {
                const stack = new THREE.Group();
                stack.position.set(sd * (4.8 - s * 1.15), 0, 3.4);
                estate.add(stack);
                cyl(0.45, 0.55, 0.65, strawGoldM, 0, 0.32, 0, stack);
                const topCone = new THREE.Mesh(new THREE.ConeGeometry(0.48, 0.55, 10), strawGoldM);
                topCone.position.y = 0.9;
                topCone.castShadow = true;
                stack.add(topCone);
              }
            }

            // ชาวนาก้มดำนาอยู่ในแปลงนาจริงๆ + หุ่นไล่การิมคันนา
            if (tier === 0 && paddyCount % 2 === 1) {
              addP(
                {
                  sk: pk(SK),
                  top: pk([0x2f4a6b, 0x3d6a8a]),
                  bt: 0x2f3d38,
                  short: 1,
                  hair: pk(HC),
                  hs: 0,
                  hat: 'straw',
                  long: 1,
                  v: 0,
                  k: 1
                },
                'work',
                o.x - sd * o.tn.z * 3.25,
                o.z + sd * o.tn.x * 3.25,
                0,
                0
              );
              if (paddyCount % 3 === 1) {
                const sc = makeScarecrow(0.95 + LR() * 0.12);
                sc.position.set(-sd * 3.25, 0, (LR() - 0.5) * 2.2);
                sc.rotation.y = (LR() - 0.5) * 1.4;
                estate.add(sc);
              }
            }
          }
        }
      }

      zoneIdx.push(crowd.length);
      // ================= โซน 2: ไร่ข้าวโพดยกร่องสลับสวนฟักทองเป็นระยะ (t: 0.658 - 0.752) =================
      // วัสดุฟักทองแบบผิวเรียบนุ่ม (ไม่ใช้ flatShading) เพื่อให้พูฟักทองดูโค้งมนสมจริง
      const pumpkinOrangeM = new THREE.MeshLambertMaterial({ color: 0xe8701a }),
        pumpkinGoldM = new THREE.MeshLambertMaterial({ color: 0xe0a024 }),
        pumpkinGreenM = new THREE.MeshLambertMaterial({ color: 0x4d7a3a }),
        pumpkinCreamM = new THREE.MeshLambertMaterial({ color: 0xe9d3a6 }),
        pumpkinVineM = new THREE.MeshLambertMaterial({ color: 0x4f8236 }),
        pumpkinLeafM = new THREE.MeshLambertMaterial({ color: 0x3f7d2f, side: THREE.DoubleSide }),
        pumpkinLeafM2 = new THREE.MeshLambertMaterial({ color: 0x356b29, side: THREE.DoubleSide }),
        pumpkinStemM = new THREE.MeshLambertMaterial({ color: 0x5a6b2e }),
        pumpkinFlowerM = new THREE.MeshLambertMaterial({ color: 0xffbe1a }),
        bambooPoleM = sm2(0xc8a35c);

      // สร้าง Geometry ฟักทองสไตล์ Low-Poly ทรง 8 พูคมชัด (แคชใช้ซ้ำได้ประสิทธิภาพสูง)
      const pumpkinLowPolyGeo = (() => {
        const base = new THREE.SphereGeometry(1, 28, 16);
        const pos = base.attributes.position;
        for (let i = 0; i < pos.count; i++) {
          const x = pos.getX(i);
          const y = pos.getY(i);
          const z = pos.getZ(i);
          const theta = Math.atan2(z, x);
          const rH = Math.hypot(x, z);
          // ร่องพูฟักทอง 9 พู ไล่จากขั้วถึงก้นแบบธรรมชาติ (ร่องลึกที่ศูนย์สูตร จางลงที่ขั้ว)
          const rib = 1.0 + 0.11 * Math.cos(9 * theta) * rH;
          const newR = rH * rib;
          pos.setX(i, Math.cos(theta) * newR);
          pos.setZ(i, Math.sin(theta) * newR);
          // ทรงแป้นเตี้ย + รอยบุ๋มตรงขั้วและก้น
          const poleDist = Math.abs(y);
          const dent = poleDist > 0.6 ? (poleDist - 0.6) * 0.42 : 0;
          pos.setY(i, y * 0.8 - Math.sign(y) * dent);
        }
        base.computeVertexNormals();
        return base;
      })();

      // ใบฟักทองห้าแฉกแบบหยักโค้ง วางราบเรียบกับพื้น (ด้านบนหงายขึ้น)
      const pumpkinLeafGeo = (() => {
        const sh = new THREE.Shape();
        const N = 40;
        for (let i = 0; i <= N; i++) {
          const a = (i / N) * Math.PI * 2;
          const r = 0.27 * (0.74 + 0.26 * Math.cos(5 * (a - Math.PI / 2)));
          const px = Math.cos(a) * r,
            py = Math.sin(a) * r;
          if (i === 0) sh.moveTo(px, py);
          else sh.lineTo(px, py);
        }
        return new THREE.ShapeGeometry(sh).rotateX(-Math.PI / 2);
      })();

      const pumpkinStemGeo = new THREE.CylinderGeometry(0.08, 0.15, 0.44, 6);
      const pumpkinCalyxGeo = new THREE.CylinderGeometry(0.26, 0.02, 0.06, 8);
      const pumpkinFlowerGeo = new THREE.ConeGeometry(0.1, 0.18, 6, 1, true);

      const addPumpkinFruit = (parent, px, py, pz, rad, mat, rotY) => {
        const pg = new THREE.Group();
        pg.position.set(px, py + rad * 0.64, pz);
        pg.rotation.y = rotY !== undefined ? rotY : LR() * 6.28;
        parent.add(pg);

        const pmesh = new THREE.Mesh(pumpkinLowPolyGeo, mat);
        pmesh.scale.set(rad, rad, rad);
        pmesh.castShadow = true;
        pmesh.receiveShadow = true;
        pg.add(pmesh);

        // ฐานขั้ว
        const calyx = new THREE.Mesh(pumpkinCalyxGeo, pumpkinStemM);
        calyx.position.set(0, rad * 0.6, 0);
        calyx.scale.set(rad, rad, rad);
        pg.add(calyx);

        // ก้านขั้ว
        const stem = new THREE.Mesh(pumpkinStemGeo, pumpkinStemM);
        stem.position.set(rad * 0.04, rad * 0.82, 0);
        stem.scale.set(rad, rad, rad);
        stem.rotation.z = 0.18;
        pg.add(stem);
        return pg;
      };
      let cornPlotCount = 0;
      for (let t = 0.658; t < 0.752; t += 0.008) {
        if (window.__TEMPLES && window.__TEMPLES.some(tp => Math.abs(t - tp.t) < 0.016)) continue;
        for (const sd of [-1, 1]) {
          for (let tier = 0; tier < 2; tier++) {
            const off = sd * (10.5 + tier * 8.6),
              o = offRoad(t, off);
            if (!spotOK(o.x, o.z, 4.6)) continue;
            taken.push([o.x, o.z, 4.2]);
            cornPlotCount++;

            const plot = new THREE.Group();
            plot.position.set(o.x, 0, o.z);
            plot.rotation.y = Math.atan2(o.tn.x, o.tn.z);
            scene.add(plot);

            const isPumpkinPatch = cornPlotCount % 3 === 0;
            // ฐานดินและร่องแปลงลูกฟูกขนานเป็นระเบียบ
            box(7.2, 0.06, 7.8, darkSoilM, 0, 0.03, 0, plot);
            for (let rx = -2.7; rx <= 2.71; rx += 1.8) {
              const ridge = new THREE.Mesh(ridgeGeo, ridgeSoilM);
              ridge.position.set(rx, 0.06, 0);
              ridge.scale.set(1, isPumpkinPatch ? 0.46 : 0.55, 1);
              ridge.receiveShadow = true;
              plot.add(ridge);

              if (isPumpkinPatch) {
                // แปลงสวนฟักทอง: จัดเรียงเป็นตารางเท่ากันทุกแถว (แถวละ 5 ต้น ห่างกัน 1.5 ม.) ตรงกับสันร่องดิน
                const ix = Math.round((rx + 2.7) / 1.8);
                const vineMain = cyl(0.026, 0.03, 6.6, pumpkinVineM, rx, 0.2, 0, plot);
                vineMain.rotation.x = Math.PI / 2;
                for (let iz = 0; iz < 5; iz++) {
                  const cz = -3.0 + iz * 1.5,
                    seq = ix + iz;

                  // กอใบฟักทอง 3 ใบกางรอบโคนต้น วางราบและหงายรับแสง
                  for (let lf = 0; lf < 3; lf++) {
                    const ang = lf * 2.094 + seq * 0.7,
                      lx = rx + Math.cos(ang) * 0.34,
                      lz = cz + Math.sin(ang) * 0.34;
                    const lmesh = new THREE.Mesh(pumpkinLeafGeo, lf % 2 ? pumpkinLeafM2 : pumpkinLeafM);
                    lmesh.position.set(lx, 0.27 + lf * 0.02, lz);
                    lmesh.rotation.set(Math.sin(ang) * 0.14, ang + 1.57, -Math.cos(ang) * 0.14);
                    const ls = 0.95 + (seq % 3) * 0.1;
                    lmesh.scale.set(ls, 1, ls);
                    lmesh.castShadow = true;
                    plot.add(lmesh);
                  }

                  // ดอกฟักทองสีเหลือง (ทุกต้นที่ 3)
                  if (seq % 3 === 0) {
                    const fl = new THREE.Mesh(pumpkinFlowerGeo, pumpkinFlowerM);
                    fl.position.set(rx + 0.1, 0.34, cz + 0.12);
                    plot.add(fl);
                  }

                  // ลูกฟักทองวางบนพื้นดินข้างต้น สลับซ้าย-ขวาของร่องอย่างเป็นระเบียบ
                  if (seq % 3 !== 2) {
                    const side = seq % 2 ? 1 : -1,
                      pRad = [0.26, 0.3, 0.24, 0.28][seq % 4],
                      pMat = [pumpkinOrangeM, pumpkinOrangeM, pumpkinGoldM, pumpkinOrangeM, pumpkinGreenM, pumpkinCreamM][seq % 6];
                    addPumpkinFruit(plot, rx + side * 0.62, 0.06, cz + 0.72, pRad, pMat, seq * 0.9);
                  }
                }
              } else {
                // ปลูกต้นข้าวโพดเรียงแถวตรงบนสันร่องดิน
                for (let cz = -3.2; cz <= 3.21; cz += 1.6) {
                  const plant = makeCornPlant(0.88 + LR() * 0.24);
                  plant.position.set(rx + (LR() - 0.5) * 0.06, 0.08, cz + (LR() - 0.5) * 0.06);
                  plant.rotation.y = LR() * 6.28;
                  plot.add(plant);
                }
              }
            }

            // โครงค้างไม้ไผ่: เสาตั้งตรงคู่ 3 ชุด คานพาดบนยอด และรางยาวต่อกัน (ทุกชิ้นพิกัดตรงกัน ไม่เอียง)
            if (isPumpkinPatch) {
              const tH = 1.7; // ความสูงโครง
              for (const tz of [-3.0, 0, 3.0]) {
                cyl(0.04, 0.045, tH, bambooPoleM, -1.8, tH / 2, tz, plot);
                cyl(0.04, 0.045, tH, bambooPoleM, 1.8, tH / 2, tz, plot);
                cyl(0.032, 0.032, 3.76, bambooPoleM, 0, tH, tz, plot, 0, Math.PI / 2); // คานขวาง
              }
              cyl(0.032, 0.032, 6.2, bambooPoleM, -1.8, tH, 0, plot, Math.PI / 2, 0); // รางยาวซ้าย
              cyl(0.032, 0.032, 6.2, bambooPoleM, 1.8, tH, 0, plot, Math.PI / 2, 0); // รางยาวขวา

              // เถาเลื้อยพาดคานแต่ละชุด พร้อมใบเรียงเท่ากันและฟักทองลูกเล็กห้อยด้วยเชือก
              for (const tz of [-3.0, 0, 3.0]) {
                cyl(0.022, 0.022, 3.5, pumpkinVineM, 0, tH + 0.04, tz, plot, 0, Math.PI / 2);
                for (const lx of [-1.35, -0.45, 0.45, 1.35]) {
                  const lmesh = new THREE.Mesh(pumpkinLeafGeo, pumpkinLeafM);
                  lmesh.position.set(lx, tH + 0.08, tz + (lx > 0 ? 0.14 : -0.14));
                  lmesh.scale.set(0.9, 1, 0.9);
                  lmesh.rotation.y = lx * 1.3;
                  plot.add(lmesh);
                }
                for (const hx of [-0.9, 0.9]) {
                  const hRad = 0.17;
                  cyl(0.008, 0.008, 0.32, pumpkinVineM, hx, tH - 0.16, tz, plot);
                  addPumpkinFruit(plot, hx, tH - 0.32 - 1.04 * hRad - 0.64 * hRad, tz, hRad, hx > 0 ? pumpkinOrangeM : pumpkinGoldM, tz);
                }
              }
            }

            // รั้วไม้กั้นหน้าแปลงและจุดวางกระสอบข้าวโพด / กองฟักทองริมทาง (ฝั่งติดถนน = +sd)
            if (tier === 0) {
              const fx = sd * 3.85;
              for (let fz = -3.6; fz <= 3.61; fz += 1.8) {
                cyl(0.05, 0.06, 0.85, fenceWoodM, fx, 0.42, fz, plot);
              }
              box(0.06, 0.07, 7.3, fenceWoodM, fx, 0.65, 0, plot);
              box(0.06, 0.07, 7.3, fenceWoodM, fx, 0.35, 0, plot);

              if (isPumpkinPatch) {
                // ลังไม้เปิดบนใส่ฟักทอง: ก้นลัง + แผ่นข้าง 4 ด้าน + ฟักทองเรียงเป็นตาราง 2×3 ชั้นล่าง และ 2 ลูกชั้นบน
                const cx = fx + sd * 0.8,
                  cz0 = -1.6;
                box(1.1, 0.08, 1.7, crateWoodM, cx, 0.04, cz0, plot);
                box(1.1, 0.34, 0.06, crateWoodM, cx, 0.2, cz0 - 0.82, plot);
                box(1.1, 0.34, 0.06, crateWoodM, cx, 0.2, cz0 + 0.82, plot);
                box(0.06, 0.34, 1.7, crateWoodM, cx - 0.52, 0.2, cz0, plot);
                box(0.06, 0.34, 1.7, crateWoodM, cx + 0.52, 0.2, cz0, plot);
                const lowMats = [pumpkinOrangeM, pumpkinGoldM, pumpkinOrangeM, pumpkinOrangeM, pumpkinCreamM, pumpkinOrangeM];
                let li = 0;
                for (const dz of [-0.52, 0, 0.52]) {
                  for (const dx of [-0.26, 0.26]) {
                    addPumpkinFruit(plot, cx + dx, 0.08, cz0 + dz, 0.23, lowMats[li], li * 1.1);
                    li++;
                  }
                }
                addPumpkinFruit(plot, cx, 0.34, cz0 - 0.26, 0.2, pumpkinOrangeM, 0.4);
                addPumpkinFruit(plot, cx, 0.34, cz0 + 0.26, 0.2, pumpkinGreenM, 1.9);
                // ฟักทองใหญ่วางบนพื้นข้างลัง
                addPumpkinFruit(plot, cx, 0.02, cz0 + 1.4, 0.32, pumpkinOrangeM, 0.7);
                addPumpkinFruit(plot, cx + sd * 0.05, 0.02, cz0 + 2.0, 0.24, pumpkinGoldM, 2.2);
              } else if (cornPlotCount % 2 === 0) {
                box(0.85, 0.1, 1.3, crateWoodM, fx + sd * 0.55, 0.06, -1.8, plot);
                ball(0.28, sackClothM, fx + sd * 0.55, 0.28, -2.0, plot, 1, 0.85, 1.15);
                ball(0.26, sackClothM, fx + sd * 0.55, 0.26, -1.5, plot, 1, 0.8, 1.1);
                for (let k = 0; k < 5; k++) {
                  ball(
                    0.07,
                    cornKernelM,
                    fx + sd * 0.55 + (k - 2) * 0.08,
                    0.18,
                    -1.1,
                    plot,
                    1,
                    0.8,
                    2.1
                  );
                }
              }
            }
          }
        }
      }

      // สุ่มวางร้านข้าวโพดปิ้ง-ข้าวโพดต้มริมทาง (1-2 ร้าน) แถวโซนไร่ข้าวโพด พร้อมเตาถ่าน ฝักข้าวโพดปิ้งหอมๆ หม้อต้ม และแม่ค้า/ลูกค้า
      {
        const grillCharcoalM = sm2(0x2b2623),
          emberGlowM = new THREE.MeshBasicMaterial({ color: 0xff5a1f }),
          grateMetalM = sm2(0xb8c2cc),
          roastedCornM = sm2(0xebae2a),
          charSpotM = sm2(0x6b3e18),
          potSilverM = sm2(0xd6dfe6),
          umbrellaRedM = sm2(0xd94e41),
          umbrellaYelM = sm2(0xf2c14e);

        const cornStallSpots = [
          [0.678, -1],
          [0.728, 1]
        ];
        cornStallSpots.forEach(([ct, csd], idx) => {
          for (let tryOff = 5.4; tryOff <= 7.8; tryOff += 0.5) {
            const o = offRoad(ct, csd * tryOff);
            if (!spotOK(o.x, o.z, 2.5)) continue;
            taken.push([o.x, o.z, 2.5]);

            const cg = new THREE.Group();
            cg.position.set(o.x, 0, o.z);
            const rotY = Math.atan2(csd * o.tn.z, -csd * o.tn.x);
            cg.rotation.y = rotY;
            scene.add(cg);

            if (window.__addGroundPatch) window.__addGroundPatch(cg, 5.2, 4.2, 0, 0.35);

            // 1. แคร่ไม้ไผ่ เสาไม้ไผ่ 4 ต้น และหลังคามุงจากลาดเอียงพร้อมป้ายร้านข้าวโพดปิ้ง
            box(2.55, 0.1, 1.75, bambooM, 0, 0.05, 0.1, cg);
            for (const px of [-1.15, 1.15]) {
              for (const pz of [-0.55, 0.72]) {
                cyl(0.05, 0.055, 1.95, bambooM, px, 0.98, pz, cg);
              }
            }
            box(2.75, 0.1, 1.95, thatchRoofM, 0, 1.98, 0.1, cg).rotation.x = 0.16;
            box(1.75, 0.28, 0.06, fenceWoodM, 0, 2.16, 0.88, cg);
            box(1.65, 0.2, 0.08, umbrellaYelM, 0, 2.16, 0.89, cg);

            // 2. โต๊ะแผงไม้ไผ่หน้าร้าน
            box(2.3, 0.72, 0.82, crateWoodM, 0, 0.42, 0.42, cg);
            box(2.38, 0.06, 0.88, fenceWoodM, 0, 0.8, 0.42, cg);

            // 3. เตาถ่านปิ้งข้าวโพดแนวยาว + ถ่านแดงคุโชน + ตะแกรงเหล็ก + ข้าวโพดปิ้งเหลืองทองเรียงแถว
            box(1.05, 0.16, 0.42, grillCharcoalM, -0.48, 0.9, 0.46, cg);
            box(0.96, 0.04, 0.34, emberGlowM, -0.48, 0.97, 0.46, cg); // ถ่านไฟแดง
            box(1.02, 0.015, 0.38, grateMetalM, -0.48, 1.0, 0.46, cg); // ตะแกรงปิ้ง
            for (let c = 0; c < 6; c++) {
              const cx = -0.88 + c * 0.16;
              // ฝักข้าวโพดปิ้งสีเหลืองทอง + รอยไหม้เกรียมหอมๆ
              cyl(0.036, 0.04, 0.24, roastedCornM, cx, 1.04, 0.46, cg, Math.PI / 2, 0);
              ball(0.022, charSpotM, cx + (c % 2 ? 0.02 : -0.02), 1.07, 0.46, cg, 1.2, 0.5, 1.6);
              cyl(0.012, 0.014, 0.08, cornHuskM, cx, 1.04, 0.61, cg, Math.PI / 2, 0); // ด้ามเปลือกจับ
            }

            // 4. หม้ออะลูมิเนียมต้มข้าวโพดหวานใบใหญ่ + ฝาแง้มเห็นข้าวโพดต้มด้านใน
            cyl(0.22, 0.2, 0.28, potSilverM, 0.35, 0.96, 0.38, cg);
            cyl(0.23, 0.23, 0.03, potSilverM, 0.42, 1.11, 0.32, cg, 0.25, 0);
            for (let b = 0; b < 3; b++) {
              ball(0.045, cornKernelM, 0.32 + (b - 1) * 0.06, 1.09, 0.42, cg, 1, 0.8, 1.8);
            }

            // 5. กองข้าวโพดสดทั้งเปลือกสีเขียวในกระจาดสาน และเข่งข้าวโพดข้างร้าน + ร่มสนามแม่ค้า
            cyl(0.22, 0.17, 0.09, bambooM, 0.85, 0.87, 0.48, cg);
            for (let f = 0; f < 5; f++) {
              cyl(0.04, 0.045, 0.24, cornHuskM, 0.75 + (f % 3) * 0.09, 0.95 + (f > 2 ? 0.05 : 0), 0.48, cg, 1.4, (f - 2) * 0.2);
            }
            // เข่งไม้ไผ่ใส่ข้าวโพดสดข้างร้าน
            cyl(0.28, 0.22, 0.38, bambooM, -1.42, 0.19, 0.38, cg);
            for (let m = 0; m < 5; m++) {
              ball(0.08, cornHuskM, -1.42 + Math.cos(m * 1.25) * 0.11, 0.4, 0.38 + Math.sin(m * 1.25) * 0.11, cg, 0.8, 1.6, 0.8);
            }
            // ร่มแม่ค้าสีสดใสข้างร้านข้าวโพดปิ้ง
            cyl(0.025, 0.028, 2.1, potSilverM, 1.35, 1.05, -0.05, cg);
            const uCone = new THREE.Mesh(new THREE.ConeGeometry(1.15, 0.42, 10), idx % 2 === 0 ? umbrellaRedM : umbrellaYelM);
            uCone.position.set(1.35, 2.12, -0.05);
            uCone.castShadow = true;
            cg.add(uCone);

            // 6. แม่ค้าปิ้งข้าวโพดยืนหลังเตา และลูกค้าแวะซื้อข้าวโพดปิ้งหน้าร้าน
            const vX = o.x + Math.sin(rotY) * -0.25,
              vZ = o.z + Math.cos(rotY) * -0.25;
            const ven = addP(
              {
                sk: pk(SK),
                top: idx % 2 === 0 ? 0xd9534a : 0xf0c95a,
                bt: pk(DKP),
                skirt: 1,
                short: 1,
                hair: pk(HC),
                hs: 1,
                hat: 'straw',
                v: 0,
                k: 7
              },
              'talk',
              vX,
              vZ,
              ct,
              csd * tryOff
            );
            ven.yaw = rotY;
            ven.g.position.set(vX, 0, vZ);
            ven.g.rotation.y = rotY;

            const cX = o.x + Math.sin(rotY) * 1.35,
              cZ = o.z + Math.cos(rotY) * 1.35;
            const cust = addP(
              {
                sk: pk(SK),
                top: pk(BRIGHT),
                bt: pk(DKP),
                short: 1,
                hair: pk(HC),
                hs: pk([0, 1]),
                p: 'bag',
                v: 0,
                k: 6
              },
              'talk',
              cX,
              cZ,
              ct,
              csd * (tryOff - 1.3)
            );
            cust.yaw = rotY + Math.PI;
            cust.g.position.set(cX, 0, cZ);
            cust.g.rotation.y = rotY + Math.PI;
            ven.partner = cust;
            cust.partner = ven;
            break;
          }
        });
      }

      zoneIdx.push(crowd.length);
      // ================= โซน 3: สวนผลไม้จัดแถวตาราง (t: 0.758 - 0.852) =================
      window.__ORCHARDS = [];
      const crateDarkWoodM = sm2(0x6e4b2a),
        crateLinerLeafM = sm2(0x4e8c3d),
        orchardGrassM = sm2(0x659e44),
        orchardGrassLightM = sm2(0x82b856),
        orchardPathM = sm2(0x9e8462),
        orchardStoneM = sm2(0xb8b4a8),
        fruitHighlightMats = [
          mt(0xffa630), // ส้มสายน้ำผึ้งลูกสุกสว่าง
          mt(0xf05664), // ลิ้นจี่สีแดงชมพู
          mt(0xe0b262)  // ลำไยสีทองสว่าง
        ];

      // ฟังก์ชันสร้างลังไม้ระแนงใส่ผลไม้แบบละเอียด (มีเสามุม ซี่ไม้ระแนง ใบตองรองลัง และผลไม้เรียงพูนเป็นทรงพีระมิดพร้อมใบแซม)
      function makeDetailedFruitCrate(parent, cx, cy, cz, rotY, fruitKind) {
        const cg = new THREE.Group();
        cg.position.set(cx, cy, cz);
        cg.rotation.y = rotY;
        parent.add(cg);

        const fMain = fruitStyles[fruitKind].m,
          fAlt = fruitHighlightMats[fruitKind],
          W = 0.58,
          H = 0.28,
          D = 0.74;

        // 1. พื้นลังและเสามุมไม้เนื้อแข็ง 4 มุม
        box(W - 0.04, 0.03, D - 0.04, crateDarkWoodM, 0, 0.02, 0, cg);
        for (const px of [-W / 2 + 0.03, W / 2 - 0.03]) {
          for (const pz of [-D / 2 + 0.03, D / 2 - 0.03]) {
            box(0.05, H, 0.05, crateDarkWoodM, px, H / 2, pz, cg);
          }
        }
        // 2. ซี่ไม้ระแนงด้านข้าง 2 ชั้น (เว้นร่องระบายอากาศสมจริง) + แผ่นหัวท้ายพร้อมช่องมือจับ
        for (const sy of [0.08, 0.21]) {
          for (const sx of [-W / 2 + 0.015, W / 2 - 0.015]) {
            box(0.025, 0.075, D, crateWoodM, sx, sy, 0, cg);
          }
          for (const sz of [-D / 2 + 0.015, D / 2 - 0.015]) {
            box(W, 0.075, 0.025, fenceWoodM, 0, sy, sz, cg);
          }
        }
        // 3. ใบตอง/ใบไม้สีเขียวสดปูรองในลังและพับชายพ้นขอบลังเล็กน้อย
        box(W - 0.05, 0.025, D - 0.05, crateLinerLeafM, 0, 0.19, 0, cg);
        for (const sx of [-1, 1]) {
          const flap = box(0.08, 0.012, D * 0.65, crateLinerLeafM, sx * (W / 2 - 0.01), H - 0.02, 0, cg);
          flap.rotation.z = -sx * 0.45;
        }

        // 4. กองผลไม้เรียงพูน 2 ชั้นเต็มลัง พร้อมใบเขียวสดแซมบนยอด
        const rFruit = fruitKind === 0 ? 0.068 : fruitKind === 1 ? 0.06 : 0.055;
        // ชั้นแรก (3 x 4 ลูก)
        for (let ix = -1; ix <= 1; ix++) {
          for (let iz = -1.5; iz <= 1.5; iz += 1) {
            const mUse = (Math.abs(ix + iz) % 2 === 0) ? fMain : fAlt;
            ball(
              rFruit,
              mUse,
              ix * 0.145 + (LR() - 0.5) * 0.018,
              0.245,
              iz * 0.145 + (LR() - 0.5) * 0.018,
              cg,
              1,
              fruitKind === 1 ? 1.08 : 0.95,
              1
            );
          }
        }
        // ชั้นยอดพูนกลางลัง (2 x 3 ลูก) + ใบติดขั้วผลไม้
        for (let ix = -0.5; ix <= 0.5; ix += 1) {
          for (let iz = -1; iz <= 1; iz += 1) {
            const mUse = (ix + iz > 0) ? fAlt : fMain;
            ball(
              rFruit * 0.96,
              mUse,
              ix * 0.14,
              0.325,
              iz * 0.14,
              cg
            );
          }
        }
        // ใบไม้เขียวสดแซมยอดกองผลไม้
        for (const lz of [-0.14, 0.14]) {
          ball(0.045, orcLeafLight, 0, 0.365, lz, cg, 1.6, 0.3, 0.85);
        }
        return cg;
      }

      let orchardCount = 0;
      for (let t = 0.758; t < 0.852; t += 0.01) {
        if (window.__TEMPLES && window.__TEMPLES.some(tp => Math.abs(t - tp.t) < 0.016)) continue;
        for (const sd of [-1, 1]) {
          for (let tier = 0; tier < 2; tier++) {
            const off = sd * (11.8 + tier * 9.8),
              o = offRoad(t, off);
            if (!spotOK(o.x, o.z, 5.2)) continue;
            taken.push([o.x, o.z, 4.8]);
            orchardCount++;

            const grove = new THREE.Group();
            grove.position.set(o.x, 0, o.z);
            const groveYaw = Math.atan2(o.tn.x, o.tn.z);
            grove.rotation.y = groveYaw;
            scene.add(grove);

            // บันทึกพิกัดสวนผลไม้เพื่อให้ระบบหญ้าพลิ้วไหว (40-veg) ปลูกลงในสวนได้อย่างสมดุล
            window.__ORCHARDS.push({ x: o.x, z: o.z, sd, tn: o.tn, tier });

            // พื้นดินผสมหญ้าธรรมชาติใต้สวนผลไม้
            if (window.__addGroundPatch) {
              window.__addGroundPatch(grove, 10.6, 10.4, sd * 0.5, 0);
            }

            const fruitKind = orchardCount % 3;
            const fMat = fruitStyles[fruitKind].m;

            // จัดวางต้นไม้ผลเป็นแถวตาราง 3x3 ต้น พร้อมกอหญ้าเขียวชอุ่มแซมตามร่องสวนอย่างสมดุล
            for (const tx of [-3.0, 0, 3.0]) {
              for (const tz of [-3.2, 0, 3.2]) {
                const tr = makeOrchardTree(fruitKind, 0.92 + LR() * 0.16);
                tr.position.set(tx, 0, tz);
                tr.rotation.y = LR() * 6.28;
                grove.add(tr);

                // กอหญ้าสั้นและใบหญ้ารอบโคนต้นไม้ผลในสวน
                for (let gIdx = 0; gIdx < 2; gIdx++) {
                  const ga = LR() * 6.28,
                    gr = 0.65 + LR() * 0.55;
                  ball(
                    0.18 + LR() * 0.08,
                    gIdx % 2 === 0 ? orchardGrassM : orchardGrassLightM,
                    tx + Math.cos(ga) * gr,
                    0.05,
                    tz + Math.sin(ga) * gr,
                    grove,
                    1.35,
                    0.35,
                    1.2
                  );
                }
              }
            }

            // ฝั่งติดถนน (ใช้ +sd เพื่อให้หันเข้าหาฝั่งถนนเสมอ ไม่วางสลับไปด้านหลังสวน)
            if (tier === 0) {
              const fx = sd * 4.35; // แนวรั้วหน้าสวนฝั่งติดถนน

              // 1. ทางเดินดินและแผ่นหินธรรมชาติเชื่อมจากไหล่ทางถนนเข้าสู่กลางสวนผลไม้
              box(1.9, 0.025, 1.15, orchardPathM, sd * 4.15, 0.014, 0, grove);
              for (let stp = 0; stp < 3; stp++) {
                box(0.36, 0.032, 0.68, orchardStoneM, sd * (3.55 + stp * 0.62), 0.018, 0, grove);
              }

              // 2. รั้วไม้หน้าสวนแบบโปร่งสมดุล (เว้นช่องทางเดินเข้าตรงกลาง และพับมุมสั้นๆ ซ้าย-ขวา ไม่กั้นทึบ)
              for (const wingSign of [-1, 1]) {
                const zStart = wingSign * 1.05,
                  zEnd = wingSign * 3.85,
                  zMid = (zStart + zEnd) * 0.5,
                  wingLen = Math.abs(zEnd - zStart);

                // เสารั้วไม้หัวขาว 3 ต้นต่อฝั่ง พร้อมกอหญ้าริมเสารั้ว
                for (const fz of [zStart, zMid, zEnd]) {
                  cyl(0.055, 0.065, 0.86, fenceWoodM, fx, 0.43, fz, grove);
                  cyl(0.058, 0.058, 0.14, white, fx, 0.84, fz, grove);
                  ball(0.19, orchardGrassM, fx - sd * 0.08, 0.055, fz + wingSign * 0.12, grove, 1.3, 0.42, 1.3);
                }
                // คานรั้วไม้ 2 ชั้นด้านหน้า
                box(0.05, 0.07, wingLen + 0.08, white, fx, 0.66, zMid, grove);
                box(0.05, 0.07, wingLen + 0.08, fenceWoodM, fx, 0.35, zMid, grove);

                // รั้วพับเข้ามุมสวนสั้นๆ (ยาว 1.5 เมตร) เพื่อให้ดูมีขอบเขตสวนอย่างสมดุลแต่ยังโปร่งโล่ง
                const sideX = fx - sd * 0.75;
                cyl(0.05, 0.06, 0.82, fenceWoodM, fx - sd * 1.5, 0.41, zEnd, grove);
                box(1.52, 0.065, 0.05, white, sideX, 0.64, zEnd, grove);
                box(1.52, 0.065, 0.05, fenceWoodM, sideX, 0.34, zEnd, grove);
              }

              // 3. จุดวางลังไม้ผลไม้สดและเข่งผลผลิตหน้าสวน (อยู่ฝั่งติดถนน fx + sd * 0.68 มองเห็นชัดจากในรถ)
              const dispX = fx + sd * 0.68;
              // แคร่ไม้/พาเลทไม้เตี้ยรองลังผลไม้ไม่ให้จมดิน
              box(0.88, 0.06, 2.05, crateDarkWoodM, dispX, 0.03, -1.65, grove);
              for (const pz of [-2.45, -1.65, -0.85]) {
                box(0.92, 0.035, 0.14, crateWoodM, dispX, 0.07, pz, grove);
              }

              // ลังไม้ระแนงใส่ผลไม้พูนๆ 2 ลังเรียงข้างกัน + ลังที่ 3 ซ้อนด้านบนเอียงโชว์ผลไม้ฝั่งถนน
              makeDetailedFruitCrate(grove, dispX + sd * 0.04, 0.085, -2.1, sd * 0.08, fruitKind);
              makeDetailedFruitCrate(grove, dispX + sd * 0.02, 0.085, -1.22, -sd * 0.06, fruitKind);
              if (orchardCount % 2 === 0) {
                makeDetailedFruitCrate(grove, dispX - sd * 0.05, 0.365, -1.68, sd * 0.18, (fruitKind + 1) % 3);
              }

              // เข่งไม้ไผ่สานใบใหญ่ใส่ผลไม้สดพูนเต็มเข่ง + ใบตองรองปากเข่งวางเคียงข้างลังไม้
              const bskZ = -0.38;
              cyl(0.28, 0.21, 0.36, bambooM, dispX + sd * 0.05, 0.18, bskZ, grove);
              cyl(0.295, 0.285, 0.04, crateDarkWoodM, dispX + sd * 0.05, 0.35, bskZ, grove); // ขอบปากเข่งไม้ไผ่
              ball(0.26, crateLinerLeafM, dispX + sd * 0.05, 0.34, bskZ, grove, 1.05, 0.2, 1.05);
              for (let m = 0; m < 7; m++) {
                const ma = (m / 6) * 6.28,
                  mr = m === 6 ? 0 : 0.13;
                ball(
                  0.078,
                  m % 2 === 0 ? fMat : fruitHighlightMats[fruitKind],
                  dispX + sd * 0.05 + Math.cos(ma) * mr,
                  m === 6 ? 0.44 : 0.38,
                  bskZ + Math.sin(ma) * mr,
                  grove
                );
              }

              // ป้ายไม้หน้าสวนผลไม้ปักต้อนรับริมทางเข้าสวน
              const signZ = 0.78;
              cyl(0.04, 0.045, 1.25, crateDarkWoodM, dispX, 0.62, signZ, grove);
              box(0.08, 0.36, 0.64, crateDarkWoodM, dispX, 1.08, signZ, grove);
              box(0.095, 0.28, 0.56, cream, dispX, 1.08, signZ, grove);
              ball(0.075, fMat, dispX + sd * 0.055, 1.08, signZ, grove); // สัญลักษณ์ผลไม้ประจำสวนบนป้าย

              // ชาวสวนยืนคัดผลไม้อยู่ข้างลังผลไม้ฝั่งติดถนน หันทักทายรถที่วิ่งผ่าน
              if (orchardCount % 2 === 0) {
                const farmerX = o.x + sd * o.tn.z * 4.85 + o.tn.x * 0.35,
                  farmerZ = o.z - sd * o.tn.x * 4.85 + o.tn.z * 0.35;
                const fp = addP(
                  {
                    sk: pk(SK),
                    top: pk(BRIGHT),
                    bt: pk(DKP),
                    short: 1,
                    hair: pk(HC),
                    hs: 1,
                    hat: 'straw',
                    p: 'pole',
                    v: 0,
                    k: 0
                  },
                  'talk',
                  farmerX,
                  farmerZ,
                  t,
                  sd * 6.8
                );
                fp.yaw = Math.atan2(sd * o.tn.z, -sd * o.tn.x);
                fp.g.position.set(farmerX, 0, farmerZ);
                fp.g.rotation.y = fp.yaw;
              }
            }
          }
        }
      }

      zoneIdx.push(crowd.length);
      /* ======================================================================
       * หนองน้ำใหญ่โซนสวนมะพร้าวแบบละเอียด (Detailed Coconut Grove Wetland Lagoon)
       * - ผืนน้ำโค้งตามแนวถนนห่างถนนปลอดภัย 100% (ไม่ทับถนน) พร้อมไล่เฉดสีความลึกและประกายคลื่นแดด
       * - ตลิ่ง 3 มิติ 5 ระดับเชื่อมรอบ 360 องศา + กอกกพริ้วไหว 220 กอ + โขดหิน 75 ก้อน + มะพร้าวเอนริมน้ำ 14 ต้น
       * - ลูกเล่น 1: ยอยักษ์ยกปลาโบราณพร้อมหอคอยไม้ไผ่ เพิงพัก คานงัดถ่วงหิน โครงยอโค้ง 4 แฉก ปลาดิ้น 5 ตัว และคนยกยอ (human)
       * - ลูกเล่น 2: ดงบัวหลวง 3 มิติซ้อนกลีบ + ใบบัวเว้าแฉก + กบนาโมเดลละเอียดมีขาพับ-เหยียดกระโดดข้ามใบบัว
       * - ลูกเล่น 3: สะพานไม้ไผ่สาน (ขัวแตะ) + ศาลากลางน้ำทรงล้านนา 2 ชั้นมีกาแล + ฝูงควายปลักไทยแช่น้ำ 3 ตัว & นกยางเกาะหลัง
       * - แอนิเมชันนกโฉบจับปลา 2 ตัว (ปีกพับ 2 ข้อ + เม็ดน้ำกระเซ็น 3 มิติ) + ปลากระโดด 4 จุด + คนตกปลาชักเบ็ด & คนทอดแห
       * ====================================================================== */
      let coconutWetlandUpdate = null;
      if (typeof WETLAND_PTS !== 'undefined' && WETLAND_PTS.length > 8) {
        const wetlandRoot = new THREE.Group();
        wetlandRoot.name = 'coconutWetlandRoot';
        wetlandRoot.userData.selfCulled = true;
        Object.defineProperty(wetlandRoot, 'visible', { value: true, writable: false });
        window.__WETLAND_ROOT = wetlandRoot;
        scene.add(wetlandRoot);

        const P = WETLAND_PTS,
          N = P.length,
          WY = 0.025,
          AX = [],
          AZ = [],
          DX = [],
          DZ = [],
          LEN = [0];
        for (let i = 0; i < N; i++) {
          const q = P[i];
          let ax = q.px - q.x,
            az = q.pz - q.z;
          const al = Math.hypot(ax, az) || 1;
          AX.push(ax / al);
          AZ.push(az / al);
          const a = P[Math.max(0, i - 1)],
            b = P[Math.min(N - 1, i + 1)];
          let dx = b.x - a.x,
            dz = b.z - a.z;
          const dl = Math.hypot(dx, dz) || 1;
          DX.push(dx / dl);
          DZ.push(dz / dl);
          if (i > 0) LEN.push(LEN[i - 1] + Math.hypot(q.x - P[i - 1].x, q.z - P[i - 1].z));
        }
        const at = (i, s) => [P[i].x + AX[i] * s, P[i].z + AZ[i] * s],
          yawInward = i => Math.atan2(-AX[i], -AZ[i]),
          midPt = P[Math.floor(N * 0.5)];

        let wSeed = 918273;
        const WR = () => ((wSeed = (wSeed * 16807) % 2147483647) - 1) / 2147483646;

        // 1) ผืนน้ำไล่เฉดสีความลึก (Shallow Turquoise → Mid Azure → Deep Crystal Blue) + ระลอกคลื่นประกายแดด
        let wetlandRippleTex = null;
        {
          const ACROSS = [-1, -0.84, -0.58, -0.28, 0, 0.28, 0.58, 0.84, 1],
            cShallow = new THREE.Color(0x7ac5dc),
            cMid = new THREE.Color(0x3b92b8),
            cDeep = new THREE.Color(0x1d6ea3),
            tmpC = new THREE.Color(),
            pos = [],
            col = [],
            uv = [],
            idx = [],
            K = ACROSS.length;
          for (let i = 0; i < N; i++) {
            const q = P[i],
              edgeEnd = Math.min(i / 4, (N - 1 - i) / 4, 1);
            for (let k = 0; k < K; k++) {
              const s = ACROSS[k] * q.w;
              pos.push(q.x + AX[i] * s, WY, q.z + AZ[i] * s);
              const e = Math.max(Math.abs(ACROSS[k]), 1 - edgeEnd * 0.85);
              if (e > 0.62) tmpC.copy(cMid).lerp(cShallow, (e - 0.62) / 0.38);
              else tmpC.copy(cDeep).lerp(cMid, e / 0.62);
              col.push(tmpC.r, tmpC.g, tmpC.b);
              uv.push((ACROSS[k] + 1) * 0.5, LEN[i] / 12);
            }
            if (i < N - 1) {
              for (let k = 0; k < K - 1; k++) {
                const a = i * K + k,
                  b = a + K;
                idx.push(a, b, a + 1, a + 1, b, b + 1);
              }
            }
          }
          const wg = new THREE.BufferGeometry();
          wg.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
          wg.setAttribute('color', new THREE.Float32BufferAttribute(col, 3));
          wg.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
          wg.setIndex(idx);
          wg.computeVertexNormals();
          wg.computeBoundingSphere();

          const wMat = new THREE.MeshBasicMaterial({
            vertexColors: true,
            side: THREE.DoubleSide,
            fog: true,
            transparent: true,
            opacity: 0.9,
            depthWrite: true,
            polygonOffset: true,
            polygonOffsetFactor: -4,
            polygonOffsetUnits: -4
          });
          const waterMesh = new THREE.Mesh(wg, wMat);
          waterMesh.position.y = 0.055;
          waterMesh.frustumCulled = false;
          waterMesh.renderOrder = 2;
          Object.defineProperty(waterMesh, 'visible', { value: true, writable: false });
          wetlandRoot.add(waterMesh);

          const rc = document.createElement('canvas');
          rc.width = 128;
          rc.height = 128;
          const rx = rc.getContext('2d');
          rx.clearRect(0, 0, 128, 128);
          for (let i = 0; i < 110; i++) {
            const x = WR() * 128,
              y = WR() * 128,
              l = 5 + WR() * 18,
              a = 0.14 + WR() * 0.28;
            rx.strokeStyle = 'rgba(255,255,255,' + a + ')';
            rx.lineWidth = 0.8 + WR() * 1.2;
            rx.beginPath();
            rx.moveTo(x - l * 0.5, y);
            rx.quadraticCurveTo(x, y - 2.2, x + l * 0.5, y);
            rx.stroke();
          }
          wetlandRippleTex = new THREE.CanvasTexture(rc);
          wetlandRippleTex.wrapS = wetlandRippleTex.wrapT = THREE.RepeatWrapping;
          wetlandRippleTex.repeat.set(2, 1);
          const ripOverlay = new THREE.Mesh(
            wg,
            new THREE.MeshBasicMaterial({
              map: wetlandRippleTex,
              transparent: true,
              opacity: 0.38,
              depthWrite: false,
              polygonOffset: true,
              polygonOffsetFactor: -5,
              polygonOffsetUnits: -5
            })
          );
          ripOverlay.position.y = 0.062;
          ripOverlay.frustumCulled = false;
          ripOverlay.renderOrder = 3;
          wetlandRoot.add(ripOverlay);
        }

        // 2) ตลิ่งทรายเลนและคันหญ้า 3 มิติ 5 ระดับ ล้อมรอบหนองน้ำ 360 องศาแบบไร้รอยต่อ
        {
          const ring = [];
          ring.push({ x: P[0].x, z: P[0].z, cx: P[1].x, cz: P[1].z });
          for (let i = 1; i < N - 1; i++) {
            ring.push({ x: P[i].x + AX[i] * P[i].w, z: P[i].z + AZ[i] * P[i].w, cx: P[i].x, cz: P[i].z });
          }
          ring.push({ x: P[N - 1].x, z: P[N - 1].z, cx: P[N - 2].x, cz: P[N - 2].z });
          for (let i = N - 2; i >= 1; i--) {
            ring.push({ x: P[i].x - AX[i] * P[i].w, z: P[i].z - AZ[i] * P[i].w, cx: P[i].x, cz: P[i].z });
          }
          const M = ring.length;
          for (let k = 0; k < M; k++) {
            const prev = ring[(k - 1 + M) % M],
              next = ring[(k + 1) % M],
              cur = ring[k],
              tx = next.x - prev.x,
              tz = next.z - prev.z;
            let nx = -tz,
              nz = tx;
            const nl = Math.hypot(nx, nz) || 1;
            nx /= nl;
            nz /= nl;
            if (nx * (cur.x - cur.cx) + nz * (cur.z - cur.cz) < 0) {
              nx = -nx;
              nz = -nz;
            }
            cur.nx = nx;
            cur.nz = nz;
          }

          const prof = [
              [-0.85, -0.095, 0xa8c4c0],
              [0.15, 0.022, 0xc2ab7e],
              [0.95, 0.052, 0xd4c298],
              [1.65, 0.068, 0x8ea162],
              [2.25, -0.115, 0x6f8752]
            ],
            K = prof.length,
            pos = [],
            col = [],
            idx = [],
            tmpC = new THREE.Color();
          for (let k = 0; k < M; k++) {
            const cur = ring[k],
              wob = Math.sin(k * 0.85) * 0.16;
            for (let j = 0; j < K; j++) {
              const dist = prof[j][0] + (j > 0 ? wob : 0);
              pos.push(cur.x + cur.nx * dist, prof[j][1], cur.z + cur.nz * dist);
              tmpC.set(prof[j][2]).multiplyScalar(0.94 + Math.sin(k * 1.5 + j) * 0.05);
              col.push(tmpC.r, tmpC.g, tmpC.b);
            }
            const nextK = (k + 1) % M;
            for (let j = 0; j < K - 1; j++) {
              const a = k * K + j,
                b = nextK * K + j;
              idx.push(a, a + 1, b, a + 1, b + 1, b);
            }
          }
          const bg = new THREE.BufferGeometry();
          bg.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
          bg.setAttribute('color', new THREE.Float32BufferAttribute(col, 3));
          bg.setIndex(idx);
          bg.computeVertexNormals();
          bg.computeBoundingSphere();
          const bankMesh = new THREE.Mesh(
            bg,
            new THREE.MeshLambertMaterial({
              vertexColors: true,
              side: THREE.DoubleSide,
              polygonOffset: true,
              polygonOffsetFactor: -1,
              polygonOffsetUnits: -1
            })
          );
          bankMesh.frustumCulled = false;
          bankMesh.receiveShadow = true;
          wetlandRoot.add(bankMesh);
        }

        // 3) กอกกพริ้วไหว 220 กอ + โขดหินริมน้ำ 75 ก้อน + ต้นมะพร้าวเอนริมหนองน้ำ 14 ต้น
        {
          const reedGeo = buildReedClusterGeo(true),
            reedMat = swayMat(0.14),
            REED_CNT = 220,
            reedsIM = new THREE.InstancedMesh(reedGeo, reedMat, REED_CNT);
          let rn = 0;
          for (let i = 2; i < N - 2 && rn < REED_CNT; i++) {
            for (const side of [1, -1]) {
              // เว้นช่องหน้าสะพานไม้ ยอยักษ์ และท่าน้ำตกปลา
              if (side > 0 && (Math.abs(i - 11) <= 2 || Math.abs(i - 23) <= 2 || Math.abs(i - 38) <= 2)) continue;
              if (WR() < 0.32) continue;
              const clump = 2 + Math.floor(WR() * 3),
                cs = side * (P[i].w + 0.15 + WR() * 1.6);
              for (let c = 0; c < clump && rn < REED_CNT; c++) {
                const [rx, rz] = at(i, cs + (WR() - 0.5) * 0.8);
                D.position.set(rx + (WR() - 0.5) * 0.9, -0.08, rz + (WR() - 0.5) * 0.9);
                D.rotation.set((WR() - 0.5) * 0.22, WR() * 6.28, (WR() - 0.5) * 0.22);
                const h = 0.68 + WR() * 0.82,
                  wS = 0.82 + WR() * 0.42;
                D.scale.set(wS, h, wS);
                D.updateMatrix();
                reedsIM.setMatrixAt(rn++, D.matrix);
              }
            }
          }
          reedsIM.count = rn;
          reedsIM.instanceMatrix.needsUpdate = true;
          reedsIM.frustumCulled = false;
          wetlandRoot.add(reedsIM);

          const rockGeo = new THREE.IcosahedronGeometry(1, 0),
            ROCK_CNT = 75,
            rocksIM = new THREE.InstancedMesh(
              rockGeo,
              new THREE.MeshLambertMaterial({ color: 0x8e8a80, flatShading: true }),
              ROCK_CNT
            );
          let rkn = 0;
          for (let i = 1; i < N - 1 && rkn < ROCK_CNT; i++) {
            for (const side of [1, -1]) {
              if (WR() < 0.42) continue;
              const [kx, kz] = at(i, side * (P[i].w - 0.25 + WR() * 1.5)),
                ks = 0.16 + WR() * 0.38;
              D.position.set(kx, -0.04, kz);
              D.rotation.set(WR() * 3, WR() * 6, WR() * 3);
              D.scale.set(ks * 1.35, ks * 0.55, ks);
              D.updateMatrix();
              rocksIM.setMatrixAt(rkn++, D.matrix);
            }
          }
          rocksIM.count = rkn;
          rocksIM.instanceMatrix.needsUpdate = true;
          rocksIM.frustumCulled = false;
          wetlandRoot.add(rocksIM);
        }

        // ตัวช่วยสร้างท่อนไม้/ไม้ไผ่/ลำต้นโค้ง/เชือกเชื่อมระหว่างพิกัด 2 จุด (x1,y1,z1) -> (x2,y2,z2) แบบไร้รอยต่อ 100%
        const _wUpVec = new THREE.Vector3(0, 1, 0),
          _wDirVec = new THREE.Vector3();
        const rodTo = (x1, y1, z1, x2, y2, z2, rTop, rBot, mat, parent) => {
          const dx = x2 - x1,
            dy = y2 - y1,
            dz = z2 - z1,
            len = Math.hypot(dx, dy, dz);
          if (len < 1e-5) return null;
          const m = cyl(rTop, rBot, len, mat, (x1 + x2) * 0.5, (y1 + y2) * 0.5, (z1 + z2) * 0.5, parent);
          _wDirVec.set(dx / len, dy / len, dz / len);
          m.quaternion.setFromUnitVectors(_wUpVec, _wDirVec);
          return m;
        };

        {
          // ต้นมะพร้าวเอนริมหนองน้ำแบบละเอียด (ใช้ rodTo ต่อข้อลำต้นโค้ง 3 ท่อนไร้รอยต่อ + palmFrondGeo + ลูกมะพร้าวเป็นทะลาย)
          const palmSpots = [
            [3, 1, 1.8, 0.24],
            [7, 1, 2.1, 0.28],
            [15, 1, 2.0, 0.22],
            [20, 1, 2.2, 0.26],
            [27, 1, 2.1, 0.25],
            [32, 1, 1.9, 0.28],
            [41, 1, 1.8, 0.24],
            [5, -1, 1.8, 0.3],
            [11, -1, 2.0, 0.26],
            [17, -1, 1.6, 0.32],
            [23, -1, 2.2, 0.24],
            [29, -1, 1.8, 0.28],
            [35, -1, 2.0, 0.3],
            [40, -1, 1.9, 0.25]
          ];
          palmSpots.forEach(([pi, side, extraDist, lean]) => {
            const q = P[pi],
              [px, pz] = at(pi, side * (q.w + extraDist)),
              palmG = new THREE.Group();
            palmG.position.set(px, -0.05, pz);
            // หันยอดมะพร้าวโน้มเข้าหาผืนน้ำหนองน้ำ
            palmG.rotation.y = side > 0 ? yawInward(pi) + (WR() - 0.5) * 0.4 : yawInward(pi) + Math.PI + (WR() - 0.5) * 0.4;
            palmG.scale.setScalar(0.92 + WR() * 0.22);
            wetlandRoot.add(palmG);

            // ลำต้นมะพร้าวโค้ง 3 ท่อนเชื่อมข้อต่อสนิทด้วย rodTo
            const z1 = 0.08,
              y1 = 0.58,
              z2 = z1 + Math.sin(lean * 0.72) * 2.35,
              y2 = y1 + Math.cos(lean * 0.72) * 2.35,
              topZ = z2 + Math.sin(lean * 1.12) * 2.45,
              topY = y2 + Math.cos(lean * 1.12) * 2.45;
            rodTo(0, 0, 0, 0, y1, z1, 0.19, 0.26, cocoTrunkM, palmG);
            rodTo(0, y1 - 0.04, z1, 0, y2, z2, 0.14, 0.19, cocoTrunkM, palmG);
            rodTo(0, y2 - 0.04, z2, 0, topY, topZ, 0.10, 0.14, cocoTrunkM, palmG);
            for (let n = 0; n < 4; n++) {
              const na = n * 1.57;
              ball(
                0.145,
                n % 2 ? cocoNutGreen : cocoNutBrown,
                Math.cos(na) * 0.19,
                topY - 0.16,
                topZ + Math.sin(na) * 0.19,
                palmG
              );
            }
            for (let l = 0; l < 7; l++) {
              const frond = new THREE.Mesh(palmFrondGeo, cocoLeafM);
              frond.position.set(0, topY, topZ);
              frond.rotation.y = (l / 7) * 6.283 + (WR() - 0.5) * 0.15;
              frond.rotation.x = -0.14 - (l % 2) * 0.2;
              frond.castShadow = false;
              palmG.add(frond);
            }
          });
        }

        // วัสดุงานไม้ไผ่ ไม้สัก และอุปกรณ์ริมน้ำ
        const _wTimberM = sm2(0x5a3e28),
          _wPlank1M = sm2(0x846240),
          _wPlank2M = sm2(0x735334),
          _wBambooGoldM = sm2(0xc4a464),
          _wBambooGreenM = sm2(0x8fa15a),
          _wMossM = sm2(0x3f5e36),
          _wThatchM = sm2(0x9b7e4e),
          _wRoofDarkM = sm2(0x69482e),
          _wKalaeGoldM = sm2(0xd4a238),
          _wClayJarM = sm2(0x9e4b34),
          _wSplashDropM = new THREE.MeshBasicMaterial({ color: 0xe8f7fc, transparent: true, opacity: 0.85 }),
          _wWaveRingM = new THREE.MeshBasicMaterial({
            color: 0xdff4fc,
            transparent: true,
            opacity: 0.58,
            side: THREE.DoubleSide,
            depthWrite: false
          }),
          _wFishBodyM = new THREE.MeshStandardMaterial({ color: 0xb8e2f4, roughness: 0.22, metalness: 0.68 }),
          _wFishBackM = new THREE.MeshStandardMaterial({ color: 0x3b7a9e, roughness: 0.3, metalness: 0.5 }),
          _wFishFinM = new THREE.MeshStandardMaterial({
            color: 0x8ac4e0,
            roughness: 0.35,
            side: THREE.DoubleSide
          });

        // ตัวช่วยสร้างโมเดลปลา 3 มิติแบบละเอียด (หัว + ตา + ลำตัว + ครีบหลัง + ครีบอก + หางแฉกตัว V ขยับได้)
        const makeDetailedFish = (scale = 1) => {
          const fg = new THREE.Group();
          fg.scale.setScalar(scale);
          // ลำตัวและแผ่นหลังสีน้ำเงินเงินวาว
          ball(0.11, _wFishBodyM, 0, 0, 0, fg, 0.62, 1.15, 2.25);
          ball(0.095, _wFishBackM, 0, 0.045, 0.02, fg, 0.58, 0.72, 2.1);
          // ตาปลา 2 ข้าง + แผ่นเหงือก
          for (const s of [-1, 1]) {
            ball(0.018, sm2(0xffffff), s * 0.058, 0.025, 0.16, fg);
            ball(0.011, sm2(0x111111), s * 0.066, 0.025, 0.168, fg);
            // ครีบอกซ้าย-ขวา
            const pec = box(0.09, 0.012, 0.055, _wFishFinM, s * 0.085, -0.035, 0.06, fg);
            pec.rotation.z = -s * 0.45;
            pec.rotation.y = -s * 0.35;
          }
          // ครีบหลัง (Dorsal Fin)
          const dors = new THREE.Mesh(new THREE.ConeGeometry(0.045, 0.14, 4), _wFishFinM);
          dors.position.set(0, 0.13, -0.02);
          dors.rotation.x = -0.55;
          dors.scale.set(0.22, 1, 1.4);
          fg.add(dors);
          // โคนหางและครีบหางแฉกตัว V (Forked Caudal Tail)
          const tailPivot = new THREE.Group();
          tailPivot.position.set(0, 0, -0.22);
          fg.add(tailPivot);
          for (const tb of [-1, 1]) {
            const lobe = new THREE.Mesh(new THREE.ConeGeometry(0.038, 0.16, 4), _wFishFinM);
            lobe.position.set(0, tb * 0.048, -0.065);
            lobe.rotation.x = -Math.PI / 2 + tb * 0.48;
            lobe.scale.set(0.2, 1, 1.15);
            tailPivot.add(lobe);
          }
          fg.userData.tail = tailPivot;
          return fg;
        };

        // ======================================================================
        // ลูกเล่นที่ 1: ยอยักษ์ยกปลาโบราณแบบละเอียด (Giant Bamboo Lift-Net & Watchtower)
        // ======================================================================
        const iLift = 11,
          [lx0, lz0] = at(iLift, P[iLift].w - 0.15),
          liftStation = new THREE.Group();
        liftStation.position.set(lx0, 0, lz0);
        liftStation.rotation.y = yawInward(iLift);
        wetlandRoot.add(liftStation);

        // 1.1 แท่นหอคอยไม้ไผ่และไม้เนื้อแข็งยื่นลงน้ำ (z = -0.75 ถึง z = 2.45, กว้าง 2.0 ม., สูง y = 1.48 ม.)
        for (const px of [-0.92, 0.92]) {
          for (const pz of [-0.65, 0.85, 2.35]) {
            rodTo(px, -0.25, pz, px, 1.52, pz, 0.075, 0.085, _wTimberM, liftStation);
            cyl(0.09, 0.09, 0.28, _wMossM, px, 0.02, pz, liftStation);
            cyl(0.09, 0.09, 0.055, _pierRopeM, px, 1.42, pz, liftStation);
            if (pz > 0) {
              const pRip = new THREE.Mesh(new THREE.RingGeometry(0.09, 0.18, 14).rotateX(-Math.PI / 2), _wWaveRingM);
              pRip.position.set(px, 0.065, pz);
              liftStation.add(pRip);
            }
          }
          // คานตงรับพื้นและเสาราวกันตกด้านข้าง
          box(0.09, 0.11, 3.25, _wTimberM, px, 1.42, 0.85, liftStation);
          rodTo(px, 1.48, 2.35, px, 2.32, 2.35, 0.042, 0.046, _wBambooGoldM, liftStation);
          rodTo(px, 2.25, -0.65, px, 2.25, 2.35, 0.036, 0.036, _wBambooGoldM, liftStation);
          rodTo(px, 1.88, -0.65, px, 1.88, 2.35, 0.028, 0.028, _wBambooGoldM, liftStation);
        }
        // คานขวางรับตงและคานค้ำยันตัว X ใต้แท่นยอ (เชื่อมเสาซ้าย-ขวาเป๊ะทุกจุด)
        for (const pz of [-0.65, 0.85, 2.35]) {
          box(1.98, 0.1, 0.1, _wTimberM, 0, 1.36, pz, liftStation);
          if (pz > 0) {
            rodTo(-0.92, 0.12, pz, 0.92, 1.34, pz, 0.032, 0.032, _wBambooGoldM, liftStation);
            rodTo(0.92, 0.12, pz, -0.92, 1.34, pz, 0.032, 0.032, _wBambooGoldM, liftStation);
          }
        }
        // พื้นไม้กระดานเรียง 13 แผ่นสลับสี (y = 1.48)
        for (let k = 0; k < 13; k++) {
          const pz = -0.68 + k * 0.255;
          box(2.02, 0.048, 0.215, k % 2 ? _wPlank1M : _wPlank2M, 0, 1.48, pz, liftStation);
        }
        // ราวกันตกด้านหลัง (เว้นช่องทางเดินขึ้นบันไดตรงกลาง x = -0.42 ถึง 0.42)
        for (const sx of [-1, 1]) {
          rodTo(sx * 0.42, 1.48, -0.65, sx * 0.42, 2.28, -0.65, 0.038, 0.042, _wBambooGoldM, liftStation);
          rodTo(sx * 0.92, 2.25, -0.65, sx * 0.42, 2.25, -0.65, 0.032, 0.032, _wBambooGoldM, liftStation);
          rodTo(sx * 0.92, 1.88, -0.65, sx * 0.42, 1.88, -0.65, 0.026, 0.026, _wBambooGoldM, liftStation);
        }

        // บันไดไม้ไผ่พาดขึ้นหอคอยจากฝั่งตลิ่ง (วางถูกด้าน 100%: โคนบันไดปักดินบนตลิ่ง z = -1.95, y = 0.02 พาดเฉียงขึ้นไปเชื่อมขอบแท่น z = -0.70, y = 1.48)
        for (const lx of [-0.38, 0.38]) {
          // แม่บันไดไม้ไผ่ซ้าย-ขวา
          rodTo(lx, 0.02, -1.95, lx, 1.52, -0.7, 0.038, 0.044, _wBambooGoldM, liftStation);
          // เสาตั้งรับราวจับโคนบันได + ราวจับไม้ไผ่ขนานแม่บันไดขึ้นไปเชื่อมเสาประตูหอคอย
          rodTo(lx, 0.02, -1.95, lx, 0.78, -1.95, 0.03, 0.034, _wBambooGoldM, liftStation);
          rodTo(lx, 0.78, -1.95, lx * 1.1, 2.25, -0.65, 0.028, 0.028, _wBambooGoldM, liftStation);
        }
        // ลูกขั้นบันไดไม้ไผ่ 7 ขั้น เชื่อมแม่บันไดซ้าย-ขวาแนบสนิททุกขั้น
        for (let r = 0; r < 7; r++) {
          const u = (r + 0.5) / 7,
            ry = 0.02 + u * 1.46,
            rz = -1.95 + u * 1.25;
          rodTo(-0.41, ry, rz, 0.41, ry, rz, 0.024, 0.024, _wBambooGoldM, liftStation);
        }

        // เพิงหลังคาหญ้าคาบังแดดบนหอคอย + ข้องใส่ปลา & ถังน้ำ
        for (const sx of [-0.92, 0.92]) {
          for (const sz of [-0.65, 0.85]) {
            rodTo(sx, 1.48, sz, sx, 3.25, sz, 0.042, 0.048, _wBambooGoldM, liftStation);
          }
        }
        const shedRoof = box(2.22, 0.09, 1.9, _wThatchM, 0, 3.3, 0.1, liftStation);
        shedRoof.rotation.x = -0.15;
        ball(0.15, _bambooCreelM, -0.68, 1.64, 0.35, liftStation, 1, 1.18, 1);
        cyl(0.075, 0.095, 0.1, _bambooCreelM, -0.68, 1.8, 0.35, liftStation);
        cyl(0.13, 0.105, 0.24, _bucketM, 0.68, 1.62, 0.45, liftStation);

        // 1.2 เสาตอม่อคานงัด A-Frame คู่หน้า + คานงัดไม้ไผ่คู่ถ่วงหิน + โครงยอยักษ์ 4 แฉกแบบดั้งเดิม
        for (const sx of [-1, 1]) {
          rodTo(sx * 0.62, 1.48, 2.35, sx * 0.46, 3.42, 2.05, 0.062, 0.076, _wTimberM, liftStation);
          rodTo(sx * 0.62, 1.48, 1.68, sx * 0.46, 3.42, 2.05, 0.062, 0.076, _wTimberM, liftStation);
          cyl(0.085, 0.085, 0.07, _pierRopeM, sx * 0.46, 3.35, 2.05, liftStation);
        }
        // เพลาหมุนคานยอพาดขวางบนยอดเสาง่าม A-Frame (y = 3.35, z = 2.05)
        rodTo(-0.58, 3.35, 2.05, 0.58, 3.35, 2.05, 0.055, 0.055, _wTimberM, liftStation);
        // เสาหลักผูกเชือกดึงคานยอบนพื้นแท่นยืนตรงหน้าคนยกยอ (z = 0.60)
        rodTo(0, 1.48, 0.6, 0, 2.05, 0.6, 0.045, 0.05, _wTimberM, liftStation);

        const leverPivot = new THREE.Group();
        leverPivot.position.set(0, 3.35, 2.05);
        liftStation.add(leverPivot);

        // คานงัดไม้ไผ่ลำคู่ยาวจากท้ายคาน (z = -1.55) พุ่งสอบไปรวมกันที่ปลายคานด้านหน้าเหนือน้ำ (z = 5.60)
        for (const bx of [-0.15, 0.15]) {
          rodTo(bx, 0, -1.55, bx * 0.25, 0, 5.6, 0.036, 0.066, _wBambooGoldM, leverPivot);
        }
        for (let z = -1.4; z <= 5.2; z += 0.95) {
          const hw = 0.15 * (1 - ((z + 1.55) / 7.15) * 0.72) + 0.03;
          rodTo(-hw, 0, z, hw, 0, z, 0.022, 0.022, _wBambooGoldM, leverPivot);
        }

        // ชุดถ่วงน้ำหนักท้ายคาน & เชือกดึงคานยอ (อยู่ใน tailHanger ที่รักษาแนวดิ่งเสมอ ไม่หลุดแยกเมื่อคานกระดกขึ้นลง)
        const tailHanger = new THREE.Group();
        tailHanger.position.set(0, 0, -1.45);
        leverPivot.add(tailHanger);
        rodTo(-0.12, 0, 0, -0.1, -0.42, 0, 0.012, 0.012, _pierRopeM, tailHanger);
        rodTo(0.12, 0, 0, 0.1, -0.42, 0, 0.012, 0.012, _pierRopeM, tailHanger);
        cyl(0.24, 0.19, 0.38, _bambooCreelM, 0, -0.58, 0, tailHanger);
        for (let rk = 0; rk < 4; rk++) {
          const ra = rk * 1.57;
          ball(0.095, sm2(0x6e6a63), Math.cos(ra) * 0.09, -0.38, Math.sin(ra) * 0.09, tailHanger, 1.2, 0.8, 1);
        }
        // เชือกดึงคานยอเชื่อมจากท้ายคานลงมายังมือคนยกยอและหลักผูกเชือก (ยืดหดตามความสูงจริงทุกเฟรม)
        const pullRopeMesh = cyl(0.014, 0.014, 1.0, _pierRopeM, 0, -0.5, 0, tailHanger);

        // ======================================================================
        // 1.3 ส่วนที่จับปลา (โครงยอยักษ์ไม้ไผ่ดัดโค้ง 4 แฉก + ผืนอวนยอสี่เหลี่ยมจัตุรัสหย่อนท้องช้าง)
        // ทั้งหมดอยู่ใน netHanger ที่ปลายคาน (z = 5.60) และตั้งฉากกับผิวน้ำเสมอ ไม่แยกชิ้นเวลาขึ้นลง
        // ======================================================================
        const netHanger = new THREE.Group();
        netHanger.position.set(0, 0, 5.6);
        leverPivot.add(netHanger);

        // เชือกแขวนยอเส้นหลักจากปลายคาน (0,0,0) ลงมายังหัวกะโหลกยอ (0,-0.95,0)
        cyl(0.065, 0.065, 0.08, _pierRopeM, 0, 0, 0, netHanger);
        rodTo(0, 0, 0, 0, -0.95, 0, 0.02, 0.02, _pierRopeM, netHanger);

        // หัวกะโหลกยอ (Central Cross-Block Hub ที่จุดรวมก้านยอทั้ง 4 แฉก)
        box(0.34, 0.13, 0.13, _wTimberM, 0, -0.95, 0, netHanger).rotation.y = Math.PI / 4;
        box(0.13, 0.13, 0.34, _wTimberM, 0, -0.95, 0, netHanger).rotation.y = Math.PI / 4;
        cyl(0.11, 0.11, 0.15, _pierRopeM, 0, -0.95, 0, netHanger);

        // ก้านยอไม้ไผ่ดัดโค้ง 4 แฉก (4 Crossed Arched Bamboo Bows)
        // โค้งคว่ำจากหัวกะโหลกยอ (0,-0.95,0) ออกไปจับมุมผืนอวนทั้ง 4 มุมที่ (±1.95, -1.85, ±1.95) แบบเชื่อมสนิททุกปล้อง
        const NET_HALF = 1.95,
          CORNER_Y = -1.85;
        for (const sx of [-1, 1]) {
          for (const sz of [-1, 1]) {
            const p0 = [0, -0.95, 0],
              p1 = [sx * 0.68, -1.08, sz * 0.68],
              p2 = [sx * 1.35, -1.38, sz * 1.35],
              p3 = [sx * NET_HALF, CORNER_Y, sz * NET_HALF];
            rodTo(p0[0], p0[1], p0[2], p1[0], p1[1], p1[2], 0.026, 0.034, _wBambooGoldM, netHanger);
            rodTo(p1[0], p1[1], p1[2], p2[0], p2[1], p2[2], 0.02, 0.026, _wBambooGoldM, netHanger);
            rodTo(p2[0], p2[1], p2[2], p3[0], p3[1], p3[2], 0.015, 0.02, _wBambooGoldM, netHanger);
            // ข้อปล้องไม้ไผ่และปมเชือกมัดมุมอวนทั้ง 4 มุม
            ball(0.032, _wBambooGoldM, p1[0], p1[1], p1[2], netHanger);
            ball(0.026, _wBambooGoldM, p2[0], p2[1], p2[2], netHanger);
            ball(0.042, _pierRopeM, p3[0], p3[1], p3[2], netHanger);
          }
        }

        // ผืนอวนยอยักษ์ 3 มิติ (11x11 Grid) ที่มุมทั้ง 4 ยึดติดกับปลายก้านยอ (±1.95, -1.85, ±1.95) เป๊ะ 100%
        // ขอบอวนทั้ง 4 ด้านโค้งหย่อนตามแรงโน้มถ่วง (Catenary Edge) และตรงกลางเว้าเป็นก้นยอรับปลา (y = -2.63)
        {
          const nSeg = 10,
            nPos = [],
            nIdx = [],
            gridPts = [];
          const calcNetY = (u, v) => {
            const r2 = u * u + v * v,
              edgeSag = Math.max(0, 1 - 0.5 * r2) * 0.42, // มุมทั้ง 4 (|u|=1,|v|=1 -> r2=2) มีค่า edgeSag = 0 พอดี
              belly = Math.max(0, 1 - r2 * 0.85);
            return CORNER_Y - edgeSag - belly * belly * 0.36;
          };
          for (let iz = 0; iz <= nSeg; iz++) {
            const v = (iz / nSeg) * 2 - 1,
              row = [];
            for (let ix = 0; ix <= nSeg; ix++) {
              const u = (ix / nSeg) * 2 - 1,
                px = u * NET_HALF,
                pz = v * NET_HALF,
                py = calcNetY(u, v);
              nPos.push(px, py, pz);
              row.push([px, py, pz]);
              if (iz < nSeg && ix < nSeg) {
                const a = iz * (nSeg + 1) + ix,
                  b = a + (nSeg + 1);
                nIdx.push(a, b, a + 1, a + 1, b, b + 1);
              }
            }
            gridPts.push(row);
          }
          const netGeo = new THREE.BufferGeometry();
          netGeo.setAttribute('position', new THREE.Float32BufferAttribute(nPos, 3));
          netGeo.setIndex(nIdx);
          netGeo.computeVertexNormals();
          const netSurface = new THREE.Mesh(netGeo, _castNetMeshM);
          netHanger.add(netSurface);

          // สายคร่าวเชือกขึงขอบอวนทั้ง 4 ด้าน และเส้นโครงตาข่ายอวนตามแนวโค้งของผืนยอ
          for (const idxLine of [0, 3, 5, 7, nSeg]) {
            const isBorder = idxLine === 0 || idxLine === nSeg,
              rLine = isBorder ? 0.014 : 0.006,
              mLine = isBorder ? _pierRopeM : _wTimberM;
            for (let k = 0; k < nSeg; k++) {
              const a1 = gridPts[idxLine][k],
                a2 = gridPts[idxLine][k + 1];
              rodTo(a1[0], a1[1], a1[2], a2[0], a2[1], a2[2], rLine, rLine, mLine, netHanger);
              const b1 = gridPts[k][idxLine],
                b2 = gridPts[k + 1][idxLine];
              rodTo(b1[0], b1[1], b1[2], b2[0], b2[1], b2[2], rLine, rLine, mLine, netHanger);
            }
          }
        }

        // ปลา 3 มิติแบบละเอียด 5 ตัวดิ้นอยู่ในก้นอวนยอ (y ≈ -2.52) เมื่อยกพ้นน้ำ
        const liftNetFishes = [];
        for (let f = 0; f < 5; f++) {
          const fm = makeDetailedFish(0.85 + (f % 3) * 0.18),
            fa = (f / 5) * Math.PI * 2,
            fr = f === 0 ? 0.04 : 0.26 + (f % 2) * 0.16;
          fm.position.set(Math.cos(fa) * fr, -2.52, Math.sin(fa) * fr);
          fm.rotation.y = fa + 1.2;
          netHanger.add(fm);
          liftNetFishes.push({ m: fm, baseY: -2.52, ph: f * 1.3 });
        }

        // วงน้ำกระเพื่อมขนาดใหญ่ใต้ผืนยอยักษ์ (2 วงซ้อนตรงตำแหน่ง z = 7.65)
        const liftSplashRings = [
          new THREE.Mesh(new THREE.RingGeometry(1.1, 1.65, 24).rotateX(-Math.PI / 2), _wWaveRingM),
          new THREE.Mesh(new THREE.RingGeometry(1.85, 2.45, 24).rotateX(-Math.PI / 2), _wWaveRingM)
        ];
        liftSplashRings.forEach(r => {
          r.position.set(0, 0.068, 7.65);
          liftStation.add(r);
        });

        // คนยกยอแบบละเอียด (human() สวมงอบและเสื้อหม้อห้อม ยืนที่ z = 0.22 จับเชือกดึงท้ายคานงัดที่ z = 0.60)
        const liftOperator = human({
          sk: pk(SK),
          top: 0x2f4b6e,
          bt: 0x38322c,
          short: 1,
          hair: pk(HC),
          hs: 0,
          hat: 'straw',
          long: 1,
          sc: 0.96
        });
        liftOperator.g.position.set(0, 1.5, 0.22);
        liftStation.add(liftOperator.g);

        // ======================================================================
        // ลูกเล่นที่ 2: ดงบัวหลวง 3 มิติซ้อนกลีบ + กบนาโมเดลละเอียดกระโดดข้ามใบบัว
        // ======================================================================
        const iLotus = 34,
          [lotX, lotZ] = at(iLotus, 2.2),
          lotusGrove = new THREE.Group();
        lotusGrove.position.set(lotX, 0, lotZ);
        lotusGrove.rotation.y = yawInward(iLotus);
        wetlandRoot.add(lotusGrove);

        const padNotchGeo = new THREE.CircleGeometry(0.58, 14, 0.16, Math.PI * 1.88).rotateX(-Math.PI / 2),
          padColors = [mt(0x468239), mt(0x589649), mt(0x3a6e2e)],
          petalPinkM = mt(0xf29bb8),
          petalDeepPinkM = mt(0xd96b92),
          petalWhiteM = mt(0xfaf6f0),
          stamenGoldM = mt(0xf0b938),
          podGreenM = mt(0x6b9642);

        // ตัวช่วยสร้างดอกบัวหลวงซ้อนกลีบ 3 มิติ (กลีบนอก 8 กลีบ + กลีบใน 6 กลีบ + เกสรทอง + ฝักบัว)
        const makeLotusFlower3D = isPink => {
          const flw = new THREE.Group(),
            pOutM = isPink ? petalDeepPinkM : petalWhiteM,
            pInM = isPink ? petalPinkM : petalWhiteM;
          for (let k = 0; k < 8; k++) {
            const a = (k / 8) * Math.PI * 2,
              pet = ball(0.085, pOutM, Math.cos(a) * 0.095, 0.02, Math.sin(a) * 0.095, flw, 0.55, 0.32, 1.35);
            pet.rotation.y = a;
            pet.rotation.x = 0.38;
          }
          for (let k = 0; k < 6; k++) {
            const a = (k / 6) * Math.PI * 2 + 0.26,
              pet = ball(0.072, pInM, Math.cos(a) * 0.062, 0.055, Math.sin(a) * 0.062, flw, 0.5, 0.45, 1.2);
            pet.rotation.y = a;
            pet.rotation.x = 0.78;
          }
          cyl(0.048, 0.032, 0.045, stamenGoldM, 0, 0.05, 0, flw);
          cyl(0.032, 0.016, 0.055, podGreenM, 0, 0.075, 0, flw);
          return flw;
        };

        // ใบบัวหลัก 6 ใบที่กบน้อยกระโดดเวียนไปเกาะ + ใบบัวบริวารอีก 18 ใบ
        const frogPadCoords = [
            { x: 0, z: 0, sc: 1.25 },
            { x: 1.45, z: 0.72, sc: 1.18 },
            { x: 0.55, z: 1.95, sc: 1.22 },
            { x: -1.15, z: 1.45, sc: 1.15 },
            { x: -1.55, z: -0.25, sc: 1.2 },
            { x: -0.35, z: -1.25, sc: 1.18 }
          ],
          frogPadMeshes = [];

        frogPadCoords.forEach((pc, idx) => {
          const pm = new THREE.Mesh(padNotchGeo, padColors[idx % 3]);
          pm.position.set(pc.x, 0.064, pc.z);
          pm.rotation.y = idx * 1.1;
          pm.scale.setScalar(pc.sc);
          lotusGrove.add(pm);
          frogPadMeshes.push(pm);
        });

        for (let k = 0; k < 18; k++) {
          const ang = (k / 18) * Math.PI * 2 + WR() * 0.25,
            rad = 1.8 + WR() * 2.8,
            px = Math.cos(ang) * rad * 1.2,
            pz = Math.sin(ang) * rad * 0.95,
            sc = 0.68 + WR() * 0.55,
            pm = new THREE.Mesh(padNotchGeo, padColors[k % 3]);
          pm.position.set(px, 0.062, pz);
          pm.rotation.y = WR() * 6.28;
          pm.scale.setScalar(sc);
          lotusGrove.add(pm);

          // ใบบัวชูคอพ้นน้ำและดอกบัวหลวง 3 มิติ
          if (k % 2 === 0) {
            const flwH = 0.26 + (k % 3) * 0.09,
              fx = px + 0.18,
              fz = pz + 0.15;
            cyl(0.014, 0.018, flwH, padColors[0], fx, flwH * 0.5 + 0.04, fz, lotusGrove);
            const flw = makeLotusFlower3D(k % 4 !== 0);
            flw.position.set(fx, flwH + 0.04, fz);
            flw.scale.setScalar(1.05 + (k % 3) * 0.15);
            lotusGrove.add(flw);
          } else if (k % 3 === 1) {
            // ใบบัวชูคอสูงพ้นน้ำ
            const tallH = 0.32 + WR() * 0.18;
            cyl(0.015, 0.02, tallH, padColors[2], px, tallH * 0.5 + 0.04, pz, lotusGrove);
            const cupLeaf = new THREE.Mesh(new THREE.ConeGeometry(0.38, 0.12, 12, 1, true), padColors[1]);
            cupLeaf.position.set(px, tallH + 0.06, pz);
            cupLeaf.rotation.x = Math.PI + (WR() - 0.5) * 0.25;
            lotusGrove.add(cupLeaf);
          }
        }

        // โมเดลกบนาสีเขียวแบบละเอียด (หัว + ตาโปนสีทอง + ลำตัวลายหลัง + ถุงคอพองยุบ + ขาหน้า + ขาหลังพับ-เหยียดได้)
        const frogG = new THREE.Group(),
          frogBodyPivot = new THREE.Group();
        frogG.add(frogBodyPivot);
        lotusGrove.add(frogG);

        const _fGreenM = mt(0x3b8c32),
          _fStripeM = mt(0x285e22),
          _fBellyM = mt(0xeaf2c4),
          _fGoldEyeM = mt(0xf2c94c);
        // ลำตัวและลายหลังกบ
        ball(0.095, _fGreenM, 0, 0.068, 0, frogBodyPivot, 0.92, 0.72, 1.32);
        ball(0.082, _fBellyM, 0, 0.045, 0.015, frogBodyPivot, 0.85, 0.48, 1.15);
        ball(0.035, _fStripeM, 0, 0.118, -0.01, frogBodyPivot, 0.35, 0.25, 2.6);
        // หัวและปากกบ + ตาโปนสีทองมีรูม่านตาดำ
        ball(0.072, _fGreenM, 0, 0.088, 0.095, frogBodyPivot, 0.95, 0.68, 1.05);
        for (const sx of [-0.046, 0.046]) {
          ball(0.028, _fGreenM, sx, 0.132, 0.085, frogBodyPivot);
          ball(0.022, _fGoldEyeM, sx * 1.08, 0.136, 0.095, frogBodyPivot);
          ball(0.013, sm2(0x111111), sx * 1.14, 0.138, 0.105, frogBodyPivot);
          // ขาหน้าค้ำยัน
          cyl(0.014, 0.011, 0.085, _fGreenM, sx * 1.35, 0.042, 0.075, frogBodyPivot, 0.25, -sx * 2.2);
          ball(0.02, _fGreenM, sx * 1.45, 0.012, 0.095, frogBodyPivot, 1.1, 0.35, 1.4);
        }
        // ถุงคอพองเสียงร้อง (Vocal Throat Sac)
        const frogThroatSac = ball(0.048, _fBellyM, 0, 0.062, 0.115, frogBodyPivot, 0.95, 0.85, 0.95);
        // ขาหลังพับ-เหยียดสปริงตัว (ต้นขา + น่อง + เท้าพังผืด)
        const frogHindLegs = [];
        for (const sx of [-1, 1]) {
          const legPivot = new THREE.Group();
          legPivot.position.set(sx * 0.078, 0.055, -0.065);
          frogBodyPivot.add(legPivot);
          ball(0.048, _fGreenM, sx * 0.015, 0.01, -0.02, legPivot, 0.72, 0.85, 1.45); // ต้นขา
          cyl(0.022, 0.016, 0.095, _fGreenM, sx * 0.02, -0.02, -0.065, legPivot, 1.1, 0); // น่อง
          ball(0.028, _fGreenM, sx * 0.02, -0.04, -0.03, legPivot, 0.85, 0.3, 1.85); // เท้าพังผืด
          frogHindLegs.push(legPivot);
        }
        const frogRipple = new THREE.Mesh(new THREE.RingGeometry(0.14, 0.36, 18).rotateX(-Math.PI / 2), _wWaveRingM);
        frogRipple.position.set(0, 0.068, 0);
        lotusGrove.add(frogRipple);

        // ======================================================================
        // ลูกเล่นที่ 3: สะพานไม้ไผ่สาน (ขัวแตะ) + ศาลากลางน้ำทรงล้านนา 2 ชั้นมีกาแล + ควายปลักแช่น้ำ
        // ======================================================================
        const iBridge = 23,
          [brX, brZ] = at(iBridge, P[iBridge].w + 0.1),
          lannaPier = new THREE.Group();
        lannaPier.position.set(brX, 0, brZ);
        lannaPier.rotation.y = yawInward(iBridge);
        wetlandRoot.add(lannaPier);

        // 3.1 ซุ้มประตูทางเข้าสะพานไม้ไผ่ริมตลิ่ง + บันไดไม้ 3 ขั้นก้าวขึ้นจากพื้นตลิ่ง (z = -2.72 -> -2.0)
        for (const sx of [-0.95, 0.95]) {
          rodTo(sx, 0.02, -2.72, sx, 0.46, -2.0, 0.045, 0.05, _wTimberM, lannaPier);
          rodTo(sx, 0.65, -2.68, sx, 1.22, -2.0, 0.035, 0.035, _wPlank1M, lannaPier);
          cyl(0.035, 0.04, 0.66, _wTimberM, sx, 0.33, -2.68, lannaPier);
        }
        for (let st = 0; st < 3; st++) {
          const uSt = (st + 0.5) / 3,
            stY = 0.06 + uSt * 0.38,
            stZ = -2.68 + uSt * 0.62;
          box(1.96, 0.055, 0.22, st % 2 === 0 ? _wPlank1M : _wPlank2M, 0, stY, stZ, lannaPier);
        }
        for (const sx of [-1.05, 1.05]) {
          cyl(0.085, 0.095, 2.35, _wTimberM, sx, 1.18, -2.0, lannaPier);
          box(0.22, 0.28, 0.22, _wPlank2M, sx, 2.42, -2.0, lannaPier); // โคมไฟหัวเสา
          ball(0.075, sm2(0xffdfa0), sx, 2.42, -2.0, lannaPier);
        }
        box(2.45, 0.14, 0.14, _wTimberM, 0, 2.22, -2.0, lannaPier);
        box(1.65, 0.42, 0.06, _wPlank1M, 0, 1.92, -2.0, lannaPier);

        // 3.2 ตัวสะพานไม้ทอดยาวลงไปกลางหนองน้ำ (z = -2.0 ถึง z = 7.6, กว้าง 2.1 ม.)
        for (let z = -2.0; z <= 7.6; z += 0.28) {
          const m = Math.round(z * 10) % 2 === 0 ? _wPlank1M : _wPlank2M;
          box(2.08, 0.055, 0.24, m, 0, 0.46, z, lannaPier);
        }
        for (const sx of [-0.95, 0, 0.95]) {
          box(0.1, 0.13, 9.8, _wTimberM, sx, 0.36, 2.8, lannaPier); // คานตง 3 เส้น
        }
        for (const sx of [-1.02, 1.02]) {
          box(0.08, 0.05, 9.6, _wPlank1M, sx, 1.22, 2.8, lannaPier); // ราวมือจับบน
          box(0.05, 0.04, 9.6, _wPlank2M, sx, 0.86, 2.8, lannaPier); // ราวกลาง
          for (let z = -1.8; z <= 7.4; z += 1.5) {
            box(0.075, 0.8, 0.075, _wTimberM, sx, 0.84, z, lannaPier);
          }
          for (let z = -1.4; z <= 7.2; z += 0.45) {
            box(0.032, 0.66, 0.032, _wBambooGoldM, sx, 0.84, z, lannaPier); // ซี่ลูกกรงไม้ไผ่
          }
        }
        // เสาตอม่อสะพาน + ตะไคร่น้ำ + คานค้ำยันตัว X เชื่อมเสาจริง + วงคลื่นน้ำ
        for (const z of [-1.6, 0.2, 2.0, 3.8, 5.6, 7.4]) {
          box(2.22, 0.13, 0.15, _wTimberM, 0, 0.28, z, lannaPier);
          for (const sx of [-1.02, 1.02]) {
            cyl(0.082, 0.092, 1.45, _wTimberM, sx, -0.18, z, lannaPier);
            if (z > 0) {
              cyl(0.096, 0.096, 0.3, _wMossM, sx, 0.0, z, lannaPier);
              const rip = new THREE.Mesh(new THREE.RingGeometry(0.09, 0.19, 14).rotateX(-Math.PI / 2), _wWaveRingM);
              rip.position.set(sx, 0.065, z);
              lannaPier.add(rip);
            }
          }
          if (z > 0) {
            rodTo(-0.98, -0.32, z, 0.98, 0.26, z, 0.035, 0.035, _wTimberM, lannaPier);
            rodTo(0.98, -0.32, z, -0.98, 0.26, z, 0.035, 0.035, _wTimberM, lannaPier);
          }
        }
        // สุ่มจับปลาและข้องใส่ปลาวางประดับบนสะพาน
        cyl(0.14, 0.26, 0.58, _bambooCreelM, -0.72, 0.76, 3.2, lannaPier);
        ball(0.14, _bambooCreelM, 0.74, 0.62, 5.1, lannaPier, 1, 1.15, 1);

        // 3.3 ศาลากลางน้ำทรงล้านนา 2 ชั้นหลังคามีกาแล (ตั้งอยู่ปลายสะพาน z = 9.5 กลางหนองน้ำ)
        const waterSala = new THREE.Group();
        waterSala.position.set(0, 0, 9.5);
        lannaPier.add(waterSala);

        // เสาเข็มรองรับศาลากลางน้ำ 6 ต้น
        for (const sx of [-1.75, 0, 1.75]) {
          for (const sz of [-1.55, 1.55]) {
            cyl(0.09, 0.1, 1.5, _wTimberM, sx, -0.15, sz, waterSala);
            cyl(0.105, 0.105, 0.32, _wMossM, sx, 0.02, sz, waterSala);
          }
        }
        // ฐานยกพื้นศาลา 2 ชั้น
        box(4.2, 0.2, 3.8, _wTimberM, 0, 0.38, 0, waterSala);
        box(3.5, 0.14, 3.2, _wPlank1M, 0, 0.52, 0, waterSala);

        // เสาศาลา 4 ต้น + ค้ำยันหูช้างไม้แกะสลักเชื่อมหัวเสากับคานหลังคาด้วย rodTo + คานรัดหัวเสา
        for (const sx of [-1.42, 1.42]) {
          for (const sz of [-1.22, 1.22]) {
            cyl(0.095, 0.105, 2.45, _wTimberM, sx, 1.72, sz, waterSala);
            rodTo(sx, 2.25, sz, sx * 0.68, 2.86, sz, 0.032, 0.038, _wPlank1M, waterSala);
            rodTo(sx, 2.25, sz, sx, 2.86, sz * 0.68, 0.032, 0.038, _wPlank1M, waterSala);
          }
        }
        for (const sx of [-1.42, 1.42]) box(0.12, 0.14, 2.68, _wTimberM, sx, 2.88, 0, waterSala);
        for (const sz of [-1.22, 1.22]) box(3.08, 0.14, 0.12, _wTimberM, 0, 2.88, sz, waterSala);

        // ม้านั่งไม้มีพนักพิง 3 ด้าน + โต๊ะกลมกลางศาลา + หม้อน้ำต้นดินเผาโบราณ
        box(0.45, 0.08, 2.2, _wPlank1M, -1.32, 0.76, 0, waterSala);
        box(0.06, 0.36, 2.2, _wPlank2M, -1.52, 0.96, 0, waterSala);
        box(0.45, 0.08, 2.2, _wPlank1M, 1.32, 0.76, 0, waterSala);
        box(0.06, 0.36, 2.2, _wPlank2M, 1.52, 0.96, 0, waterSala);
        box(2.7, 0.08, 0.45, _wPlank1M, 0, 0.76, 1.15, waterSala);
        box(2.7, 0.36, 0.06, _wPlank2M, 0, 0.96, 1.35, waterSala);
        cyl(0.42, 0.42, 0.06, _wPlank1M, 0, 0.74, 0, waterSala);
        cyl(0.08, 0.09, 0.38, _wTimberM, 0, 0.56, 0, waterSala);
        cyl(0.15, 0.2, 0.38, _wClayJarM, -1.1, 0.82, 0.88, waterSala);

        // โครงหลังคาซ้อน 2 ชั้นทรงล้านนา + สันจั่วสีทอง + กาแลไม้แกะสลักไขว้
        for (const sx of [-1, 1]) {
          const r1 = box(2.35, 0.08, 4.15, _wRoofDarkM, sx * 1.02, 3.22, 0, waterSala);
          r1.rotation.z = sx * -0.52;
          const r2 = box(1.68, 0.08, 3.55, _wThatchM, sx * 0.7, 3.9, 0, waterSala);
          r2.rotation.z = sx * -0.72;
        }
        box(0.12, 0.14, 3.75, _wKalaeGoldM, 0, 4.44, 0, waterSala);
        for (const zg of [-1.78, 1.78]) {
          const kl1 = box(0.06, 0.72, 0.04, _wKalaeGoldM, -0.19, 4.62, zg, waterSala);
          kl1.rotation.z = -0.52;
          const kl2 = box(0.06, 0.72, 0.04, _wKalaeGoldM, 0.19, 4.62, zg, waterSala);
          kl2.rotation.z = 0.52;
        }
        // ชาวบ้าน 2 คน (human) พักผ่อนชมวิวหนองน้ำในศาลา
        const salaGuest1 = human({
            sk: pk(SK),
            top: 0xd96c7a,
            bt: 0x2f3d38,
            skirt: 1,
            hair: pk(HC),
            hs: 2,
            sc: 0.92
          }),
          salaGuest2 = human({
            sk: pk(SK),
            top: 0x6e9fb0,
            bt: 0x3d4a5c,
            short: 1,
            hair: pk(HC),
            hs: 0,
            hat: 'cap',
            sc: 0.94
          });
        salaGuest1.g.position.set(-0.65, 0.59, 0.25);
        salaGuest1.g.rotation.y = 1.25;
        salaGuest2.g.position.set(0.65, 0.59, 0.25);
        salaGuest2.g.rotation.y = -1.25;
        waterSala.add(salaGuest1.g, salaGuest2.g);

        // 3.4 ฝูงควายปลักไทยแช่น้ำโมเดลละเอียด 3 ตัว (แม่ควาย + พ่อควายเขาโค้งใหญ่ + ลูกควาย) & นกยางเกาะหลัง
        const _bSkinM = sm2(0x484542),
          _bDarkM = sm2(0x33302d),
          _bHornM = sm2(0x242220),
          _bNoseM = sm2(0x5c534e),
          wetlandBuffaloes = [];

        const makeDetailedWaterBuffalo = (scale = 1, hasEgret = false) => {
          const bg = new THREE.Group();
          bg.scale.setScalar(scale);
          // ลำตัว โหนกไหล่ และสะโพกที่โผล่พ้นผิวน้ำ
          ball(1, _bSkinM, 0, 0.12, 0, bg, 0.52, 0.36, 0.88);
          ball(1, _bSkinM, 0, 0.18, 0.42, bg, 0.48, 0.38, 0.46); // โหนกไหล่บึกบึน
          ball(1, _bSkinM, 0, 0.1, -0.45, bg, 0.46, 0.32, 0.42);
          // คอและหัวควายที่หันส่ายไปมาได้
          const neckPivot = new THREE.Group();
          neckPivot.position.set(0, 0.22, 0.68);
          bg.add(neckPivot);
          cyl(0.18, 0.25, 0.42, _bSkinM, 0, 0.08, 0.14, neckPivot, 1.05, 0);

          const hd = new THREE.Group();
          hd.position.set(0, 0.18, 0.32);
          neckPivot.add(hd);
          ball(1, _bSkinM, 0, 0, 0.08, hd, 0.21, 0.2, 0.32); // กะโหลกหัว
          ball(1, _bDarkM, 0, -0.04, 0.28, hd, 0.15, 0.13, 0.18); // สันจมูก
          ball(1, _bNoseM, 0, -0.05, 0.41, hd, 0.13, 0.095, 0.08); // ปลายจมูกชื้นน้ำ
          for (const s of [-1, 1]) {
            ball(0.022, sm2(0x181412), s * 0.055, -0.04, 0.47, hd); // รูจมูก
            ball(0.032, sm2(0x141210), s * 0.175, 0.055, 0.14, hd); // ดวงตา
            // ใบหูกระดิกได้
            const ear = ball(0.11, _bDarkM, s * 0.24, 0.04, -0.02, hd, 1.35, 0.42, 0.55);
            ear.rotation.z = -s * 0.35;
            bg.userData[s > 0 ? 'earR' : 'earL'] = ear;
            // เขาควายโค้งวงพระจันทร์ 4 ท่อนเชื่อมข้อต่อสนิทด้วย rodTo
            const hornG = new THREE.Group();
            hornG.position.set(s * 0.16, 0.1, 0.02);
            hd.add(hornG);
            rodTo(0, 0, 0, s * 0.22, -0.02, -0.08, 0.056, 0.068, _bHornM, hornG);
            rodTo(s * 0.21, -0.02, -0.08, s * 0.40, 0.05, -0.22, 0.044, 0.056, _bHornM, hornG);
            rodTo(s * 0.39, 0.05, -0.22, s * 0.48, 0.17, -0.35, 0.028, 0.044, _bHornM, hornG);
            rodTo(s * 0.48, 0.17, -0.35, s * 0.43, 0.31, -0.44, 0.010, 0.028, _bHornM, hornG);
          }
          // วงคลื่นน้ำ 2 ชั้นรอบตัวควายแช่น้ำ
          const w1 = new THREE.Mesh(new THREE.RingGeometry(0.75, 1.05, 20).rotateX(-Math.PI / 2), _wWaveRingM),
            w2 = new THREE.Mesh(new THREE.RingGeometry(1.2, 1.48, 20).rotateX(-Math.PI / 2), _wWaveRingM);
          w1.position.y = 0.042;
          w2.position.y = 0.04;
          bg.add(w1, w2);
          bg.userData.neck = neckPivot;
          bg.userData.w1 = w1;
          bg.userData.w2 = w2;

          // นกกระยางขาวคอยาวเกาะบนหลังควาย
          if (hasEgret) {
            const eg = new THREE.Group(),
              wWhiteM = mt(0xf8f6f0),
              wBeakM = mt(0xe5a132);
            eg.position.set(0, 0.45, -0.08);
            bg.add(eg);
            for (const s of [-1, 1]) cyl(0.01, 0.01, 0.24, sm2(0x26221e), s * 0.032, 0.12, 0, eg);
            ball(0.11, wWhiteM, 0, 0.26, -0.02, eg, 0.82, 0.92, 1.48);
            const egNeck = new THREE.Group();
            egNeck.position.set(0, 0.32, 0.08);
            eg.add(egNeck);
            cyl(0.022, 0.028, 0.26, wWhiteM, 0, 0.12, 0.03, egNeck, 0.25, 0);
            ball(0.042, wWhiteM, 0, 0.25, 0.08, egNeck, 0.85, 0.9, 1.2);
            cn(egNeck, wBeakM, 0.015, 0.15, 0, 0.24, 0.19).rotation.x = Math.PI / 2;
            bg.userData.egretNeck = egNeck;
          }
          return bg;
        };

        [
          { i: 28, s: 2.8, yaw: -0.65, sc: 1.12, eg: true },
          { i: 30, s: 0.4, yaw: -1.15, sc: 1.05, eg: false },
          { i: 29, s: 4.2, yaw: -0.35, sc: 0.78, eg: false }
        ].forEach((bCfg, bIdx) => {
          const [bx, bz] = at(bCfg.i, bCfg.s),
            bm = makeDetailedWaterBuffalo(bCfg.sc, bCfg.eg);
          bm.position.set(bx, 0.02, bz);
          bm.rotation.y = yawInward(bCfg.i) + bCfg.yaw;
          bm.userData.ph = bIdx * 2.1;
          wetlandRoot.add(bm);
          wetlandBuffaloes.push(bm);
        });

        // ======================================================================
        // แอนิเมชันที่ 1: นกโฉบจับปลา 2 ตัว (นกกระยางขาว & นกกระเต็นสีฟ้าทอง ปีกพับ 2 ข้อ + เม็ดน้ำกระเซ็น)
        // ======================================================================
        const makeDetailedSwoopBird = isKingfisher => {
          const bg = new THREE.Group(),
            bBackM = mt(isKingfisher ? 0x0284c7 : 0xf8f6f0),
            bBellyM = mt(isKingfisher ? 0xe68a2e : 0xfdfcf7),
            bWingTipM = mt(isKingfisher ? 0x0369a1 : 0xeae6dc),
            bBeakM = mt(isKingfisher ? 0xd9531e : 0xe9a93a);
          bg.scale.setScalar(isKingfisher ? 1.25 : 1.48);

          // ลำตัวเพรียวลม + อก + หางแฉก
          ball(0.14, bBackM, 0, 0.02, 0, bg, 0.82, 0.75, 1.65);
          ball(0.125, bBellyM, 0, -0.015, 0.02, bg, 0.76, 0.65, 1.45);
          for (let t = -1; t <= 1; t++) {
            const tf = box(0.065, 0.012, 0.24, bWingTipM, t * 0.045, 0.01, -0.28, bg);
            tf.rotation.y = t * -0.18;
          }
          // คอ + หัว + ตา + จะงอยปากแหลมยาว
          cyl(0.028, 0.036, 0.24, bBackM, 0, 0.04, 0.26, bg, 1.28, 0);
          ball(0.056, bBackM, 0, 0.065, 0.39, bg, 0.88, 0.88, 1.2);
          for (const s of [-1, 1]) ball(0.012, sm2(0x111111), s * 0.042, 0.078, 0.43, bg);
          cn(bg, bBeakM, 0.02, 0.22, 0, 0.055, 0.56).rotation.x = Math.PI / 2;

          // ปีก 2 ข้อต่อ (Inner Wing + Outer Wing Tip) ขยับพริ้วสมจริง
          const wings = [];
          for (const s of [-1, 1]) {
            const wIn = new THREE.Group();
            wIn.position.set(s * 0.09, 0.04, 0.02);
            box(0.42, 0.02, 0.28, bBackM, s * 0.21, 0, 0, wIn);
            const wOut = new THREE.Group();
            wOut.position.set(s * 0.41, 0, -0.01);
            const outMesh = box(0.44, 0.015, 0.22, bWingTipM, s * 0.21, 0, -0.02, wOut);
            outMesh.rotation.y = s * -0.18;
            wIn.add(wOut);
            bg.add(wIn);
            wings.push({ inG: wIn, outG: wOut, s });
          }

          // ปลา 3 มิติที่คาบอยู่ในปากนกหลังโฉบขึ้นจากน้ำ
          const caughtFish = makeDetailedFish(0.62);
          caughtFish.position.set(0, 0.04, 0.62);
          caughtFish.rotation.y = Math.PI / 2;
          caughtFish.visible = false;
          bg.add(caughtFish);

          // วงน้ำกระเพื่อม 2 ชั้น + เม็ดน้ำกระเซ็น 8 เม็ดตรงจุดโฉบ
          const splashG = new THREE.Group();
          splashG.visible = false;
          wetlandRoot.add(splashG);
          const ring1 = new THREE.Mesh(new THREE.RingGeometry(0.18, 0.38, 22).rotateX(-Math.PI / 2), _wWaveRingM),
            ring2 = new THREE.Mesh(new THREE.RingGeometry(0.42, 0.68, 22).rotateX(-Math.PI / 2), _wWaveRingM),
            drops = [];
          splashG.add(ring1, ring2);
          for (let d = 0; d < 8; d++) {
            const da = (d / 8) * Math.PI * 2,
              dm = ball(0.042, _wSplashDropM, 0, 0, 0, splashG, 0.8, 1.35, 0.8);
            drops.push({ m: dm, vx: Math.cos(da) * (0.65 + (d % 2) * 0.35), vz: Math.sin(da) * (0.65 + (d % 2) * 0.35), vy: 1.8 + (d % 3) * 0.45 });
          }

          wetlandRoot.add(bg);
          return { bg, wings, caughtFish, splashG, ring1, ring2, drops };
        };

        const swoopBirds = [
          { ...makeDetailedSwoopBird(false), iCenter: 17, rx: 9.5, rz: 6.8, cycle: 7.4, offset: 0.0 },
          { ...makeDetailedSwoopBird(true), iCenter: 31, rx: 8.2, rz: 5.8, cycle: 6.6, offset: 3.3 }
        ];

        // ======================================================================
        // แอนิเมชันที่ 2: ปลากระโดดเหนือน้ำ 4 จุด พร้อมเม็ดน้ำกระเซ็นและวงคลื่นน้ำ
        // ======================================================================
        const jumpingFishes = [
          { i: 14, s: -1.8, dirA: 0.4, dist: 2.3, hMax: 1.38, loop: 5.6, offset: 0.4 },
          { i: 20, s: 1.5, dirA: -1.1, dist: 2.1, hMax: 1.25, loop: 6.4, offset: 2.1 },
          { i: 27, s: -2.2, dirA: 0.85, dist: 2.4, hMax: 1.45, loop: 5.9, offset: 3.8 },
          { i: 36, s: -1.2, dirA: -0.6, dist: 2.2, hMax: 1.32, loop: 6.8, offset: 5.1 }
        ];

        jumpingFishes.forEach(jf => {
          const [x0, z0] = at(jf.i, jf.s),
            dx = Math.sin(jf.dirA) * jf.dist,
            dz = Math.cos(jf.dirA) * jf.dist,
            fMesh = makeDetailedFish(1.05);
          fMesh.visible = false;
          wetlandRoot.add(fMesh);

          const makeSplashNode = (sx, sz) => {
            const sg = new THREE.Group();
            sg.position.set(sx, 0.064, sz);
            sg.visible = false;
            wetlandRoot.add(sg);
            const r1 = new THREE.Mesh(new THREE.RingGeometry(0.15, 0.34, 18).rotateX(-Math.PI / 2), _wWaveRingM),
              r2 = new THREE.Mesh(new THREE.RingGeometry(0.38, 0.56, 18).rotateX(-Math.PI / 2), _wWaveRingM),
              drops = [];
            sg.add(r1, r2);
            for (let d = 0; d < 6; d++) {
              const a = (d / 6) * Math.PI * 2,
                dm = ball(0.036, _wSplashDropM, 0, 0, 0, sg, 0.8, 1.3, 0.8);
              drops.push({ m: dm, vx: Math.cos(a) * 0.55, vz: Math.sin(a) * 0.55, vy: 1.55 + (d % 2) * 0.35 });
            }
            return { sg, r1, r2, drops };
          };

          jf.x0 = x0;
          jf.z0 = z0;
          jf.dx = dx;
          jf.dz = dz;
          jf.mesh = fMesh;
          jf.spOut = makeSplashNode(x0, z0);
          jf.spIn = makeSplashNode(x0 + dx, z0 + dz);
        });

        // ======================================================================
        // แอนิเมชันที่ 3: คนหาปลา 2 จุด (คนตกปลาชักเบ็ดบนท่าน้ำไม้ + คนทอดแหหาปลาริมตลิ่ง)
        // ======================================================================
        // 3A. ท่าน้ำไม้ตกปลา + คนตกปลาชักเบ็ดเมื่อปลากินเหยื่อ (i = 38)
        const iAngler = 38,
          [angX, angZ] = at(iAngler, P[iAngler].w + 0.2),
          anglerPier = new THREE.Group();
        anglerPier.position.set(angX, 0, angZ);
        anglerPier.rotation.y = yawInward(iAngler);
        wetlandRoot.add(anglerPier);

        // บันไดไม้ก้าวขึ้นท่าน้ำจากฝั่งตลิ่ง (z = -0.68 -> -0.38)
        box(1.06, 0.045, 0.22, _wPlank2M, 0, 0.06, -0.62, anglerPier);
        box(1.1, 0.045, 0.22, _wPlank1M, 0, 0.12, -0.46, anglerPier);

        box(0.08, 0.07, 1.85, _wTimberM, -0.44, 0.14, 0.35, anglerPier);
        box(0.08, 0.07, 1.85, _wTimberM, 0.44, 0.14, 0.35, anglerPier);
        for (let k = 0; k < 9; k++) {
          box(1.16, 0.04, 0.15, k % 2 ? _wPlank1M : _wPlank2M, 0, 0.18, -0.32 + k * 0.175, anglerPier);
        }
        for (const px of [-0.48, 0.48]) {
          for (const pz of [-0.28, 0.38, 1.02]) {
            cyl(0.052, 0.058, 0.62, _wTimberM, px, 0.12, pz, anglerPier);
            cyl(0.064, 0.064, 0.045, _pierRopeM, px, 0.17, pz, anglerPier);
          }
        }
        cyl(0.13, 0.105, 0.23, _bucketM, -0.36, 0.31, 0.48, anglerPier);
        ball(0.13, _bambooCreelM, 0.36, 0.29, 0.52, anglerPier, 1, 1.15, 1);

        const anglerChar = human({
          sk: pk(SK),
          top: 0x3b6e8c,
          bt: 0x3d352e,
          short: 1,
          hair: pk(HC),
          hs: 0,
          hat: 'straw',
          sc: 0.95
        });
        anglerChar.g.position.set(0, 0.2, 0.45);
        anglerPier.add(anglerChar.g);

        // คันเบ็ดไม้ไผ่ดัดโค้งเรียว 3 ท่อนเชื่อมไร้รอยต่อด้วย rodTo + สายเอ็นห้อยดิ่งจากปลายเบ็ดเสมอไม่หลุดแยกเวลาชักเบ็ด
        const anglerRodPivot = new THREE.Group();
        anglerRodPivot.position.set(0.16, 1.05, 0.18);
        anglerChar.g.add(anglerRodPivot);
        rodTo(0, 0, 0, 0, 0.48, 0.58, 0.016, 0.024, _wBambooGoldM, anglerRodPivot);
        rodTo(0, 0.48, 0.58, 0, 0.92, 1.28, 0.011, 0.016, _wBambooGoldM, anglerRodPivot);
        rodTo(0, 0.92, 1.28, 0, 1.26, 2.02, 0.005, 0.011, _wBambooGoldM, anglerRodPivot);

        const anglerLineHanger = new THREE.Group();
        anglerLineHanger.position.set(0, 1.26, 2.02);
        anglerRodPivot.add(anglerLineHanger);
        const anglerLineMesh = cyl(0.003, 0.003, 1.0, sm2(0xe8eef2), 0, -0.5, 0, anglerLineHanger);

        const anglerBobber = new THREE.Group();
        anglerBobber.position.set(0.16, 0.065, 2.65);
        anglerPier.add(anglerBobber);
        ball(0.042, sm2(0xffffff), 0, 0, 0, anglerBobber);
        ball(0.038, sm2(0xe63946), 0, 0.038, 0, anglerBobber);
        cyl(0.006, 0.006, 0.09, sm2(0xe63946), 0, 0.08, 0, anglerBobber);
        const bobberRip = new THREE.Mesh(new THREE.RingGeometry(0.09, 0.22, 16).rotateX(-Math.PI / 2), _wWaveRingM);
        bobberRip.position.y = 0.004;
        anglerBobber.add(bobberRip);

        // 3B. คนทอดแหหาปลาริมหนองน้ำ (i = 17, ใช้ระบบ castnet เต็มรูปแบบ)
        {
          const iCast = 17,
            [cx, cz] = at(iCast, P[iCast].w + 0.35),
            yawC = yawInward(iCast),
            wetlandCaster = addP(
              {
                sk: pk(SK),
                top: 0x8c3b2b,
                bt: 0x3b322c,
                short: 1,
                hair: pk(HC),
                hs: 0,
                hat: 'straw',
                v: 0,
                k: 4
              },
              'castnet',
              cx,
              cz,
              0,
              0
            );
          wetlandCaster.yaw = yawC;
          wetlandCaster.g.position.set(cx, 0.04, cz);
          wetlandCaster.g.rotation.y = yawC;
          ball(0.14, _bambooCreelM, -0.45, 0.14, -0.2, wetlandCaster.g, 1, 1.15, 1);
          const netG = new THREE.Group();
          netG.position.set(0, 0.04, 2.35);
          wetlandCaster.g.add(netG);
          const netCone = new THREE.Mesh(new THREE.ConeGeometry(1.18, 0.95, 18, 2), _castNetMeshM);
          netCone.position.y = 0.46;
          netG.add(netCone);
          // จอมแหและสายเชือกสาวแหเชื่อมจากจอมแหเข้าหามือคนทอดแห
          cyl(0.035, 0.045, 0.12, _pierRopeM, 0, 0.94, 0, netG);
          rodTo(0, 0.96, 0, 0, 1.18, -1.95, 0.009, 0.011, _pierRopeM, netG);
          for (let lk = 0; lk < 12; lk++) {
            const la = (lk / 12) * Math.PI * 2;
            ball(0.032, _castLeadM, Math.cos(la) * 1.15, 0.04, Math.sin(la) * 1.15, netG);
          }
          const splashRing = new THREE.Mesh(new THREE.RingGeometry(0.85, 1.32, 24).rotateX(-Math.PI / 2), _wWaveRingM);
          splashRing.position.y = 0.02;
          netG.add(splashRing);
          wetlandCaster.castNetG = netG;
          wetlandCaster.splashRing = splashRing;
        }

        // ======================================================================
        // ฟังก์ชันอัปเดตแอนิเมชันหนองน้ำสวนมะพร้าวทุกเฟรม (Called in LIFE loop)
        // ======================================================================
        coconutWetlandUpdate = function (dt, tt, cX, cZ) {
          const dxC = cX - midPt.x,
            dzC = cZ - midPt.z;
          if (dxC * dxC + dzC * dzC > 48400) return; // เกิน 220m พักการอัปเดตชั่วคราว

          if (wetlandRippleTex) {
            wetlandRippleTex.offset.y = (tt * 0.045) % 1;
            wetlandRippleTex.offset.x = Math.sin(tt * 0.35) * 0.06;
          }

          // 1. อัปเดตนกโฉบจับปลา 2 ตัว (ปีกพับ 2 ข้อ + โฉบแตะน้ำ + เม็ดน้ำกระเซ็น + ปลาดิ้นในปาก)
          swoopBirds.forEach(sb => {
            const st = (tt + sb.offset) % sb.cycle,
              ang = (tt + sb.offset) * 0.52,
              cPt = P[sb.iCenter],
              bx = cPt.x + Math.cos(ang) * sb.rx,
              bz = cPt.z + Math.sin(ang) * sb.rz,
              vx = -Math.sin(ang) * sb.rx,
              vz = Math.cos(ang) * sb.rz;

            let by = 6.2 + Math.sin(ang * 2) * 0.45,
              pitch = 0,
              flapSp = 6.5,
              flapAmp = 0.55;
            if (st >= 2.4 && st < 3.35) {
              // พับปีกพุ่งดิ่งโฉบลงหาผิวน้ำ
              const u = (st - 2.4) / 0.95;
              by = 6.2 - (6.2 - 0.14) * (u * u);
              pitch = 0.52 * Math.sin(u * Math.PI);
              flapSp = 4.0;
              flapAmp = 0.22;
              sb.caughtFish.visible = false;
              sb.splashG.visible = false;
            } else if (st >= 3.35 && st < 4.75) {
              // โฉบคว้าปลาพ้นน้ำ + เม็ดน้ำแตกกระจาย + กระพือปีกถี่ไต่ระดับ
              const u = (st - 3.35) / 1.4;
              by = 0.14 + (6.6 - 0.14) * (1 - (1 - u) * (1 - u));
              pitch = -0.46 * (1 - u * 0.6);
              flapSp = 14.5;
              flapAmp = 0.72;
              sb.caughtFish.visible = true;
              sb.caughtFish.rotation.z = Math.sin(tt * 28) * 0.38;
              if (sb.caughtFish.userData.tail) sb.caughtFish.userData.tail.rotation.y = Math.sin(tt * 34) * 0.6;

              if (u === 0 || !sb.splashG.visible) {
                sb.splashG.position.set(bx, 0.065, bz);
              }
              sb.splashG.visible = true;
              sb.ring1.scale.setScalar(0.5 + u * 3.4);
              sb.ring2.scale.setScalar(0.3 + u * 2.6);
              sb.drops.forEach(d => {
                const dy = d.vy * u - 3.2 * u * u;
                d.m.visible = dy > 0;
                if (dy > 0) d.m.position.set(d.vx * u, dy, d.vz * u);
              });
            } else {
              sb.caughtFish.visible = st >= 4.75 && st < 5.35;
              sb.splashG.visible = false;
            }

            sb.bg.position.set(bx, by, bz);
            sb.bg.rotation.y = Math.atan2(vx, vz);
            sb.bg.rotation.x = pitch;
            sb.bg.rotation.z = -0.24;

            const wWave = Math.sin(tt * flapSp),
              wLag = Math.sin(tt * flapSp - 0.75);
            sb.wings.forEach(w => {
              w.inG.rotation.z = w.s * wWave * flapAmp;
              w.outG.rotation.z = w.s * wLag * flapAmp * 0.65;
            });
          });

          // 2. อัปเดตปลากระโดดเหนือน้ำ 4 จุด พร้อมหางสะบัดและเม็ดน้ำกระเซ็น
          jumpingFishes.forEach(jf => {
            const ft = (tt + jf.offset) % jf.loop,
              jumpDur = 1.18;
            if (ft < jumpDur) {
              const u = ft / jumpDur,
                jx = jf.x0 + jf.dx * u,
                jz = jf.z0 + jf.dz * u,
                jy = 0.05 + 4 * jf.hMax * u * (1 - u),
                vy = 4 * jf.hMax * (1 - 2 * u);
              jf.mesh.visible = true;
              jf.mesh.position.set(jx, jy, jz);
              jf.mesh.rotation.y = Math.atan2(jf.dx, jf.dz);
              jf.mesh.rotation.x = -Math.atan2(vy, jf.dist);
              jf.mesh.rotation.z = Math.sin(tt * 18) * 0.12;
              if (jf.mesh.userData.tail) jf.mesh.userData.tail.rotation.y = Math.sin(tt * 36) * 0.62;

              // น้ำกระเซ็นจุดกระโดดขึ้น
              if (u < 0.55) {
                const su = u / 0.55;
                jf.spOut.sg.visible = true;
                jf.spOut.r1.scale.setScalar(0.4 + su * 2.2);
                jf.spOut.r2.scale.setScalar(0.25 + su * 1.6);
                jf.spOut.drops.forEach(d => {
                  const dy = d.vy * su - 2.6 * su * su;
                  d.m.visible = dy > 0;
                  if (dy > 0) d.m.position.set(d.vx * su, dy, d.vz * su);
                });
              } else jf.spOut.sg.visible = false;

              // น้ำกระเซ็นจุดตกกระทบน้ำ
              if (u > 0.68) {
                const su = (u - 0.68) / 0.32;
                jf.spIn.sg.visible = true;
                jf.spIn.r1.scale.setScalar(0.35 + su * 2.3);
                jf.spIn.r2.scale.setScalar(0.2 + su * 1.7);
                jf.spIn.drops.forEach(d => {
                  const dy = d.vy * su - 2.5 * su * su;
                  d.m.visible = dy > 0;
                  if (dy > 0) d.m.position.set(d.vx * su, dy, d.vz * su);
                });
              } else jf.spIn.sg.visible = false;
            } else {
              jf.mesh.visible = false;
              jf.spOut.sg.visible = false;
              jf.spIn.sg.visible = false;
            }
          });

          // 3. อัปเดตยอยักษ์ยกปลาโบราณ + คนยกยอออกแรงดึงเชือก + ปลา 5 ตัวดิ้นในก้นยอ
          {
            const netCyc = 12.0,
              nt = tt % netCyc;
            let boomPitch = 0.34,
              fishActive = false;
            if (nt < 4.2) {
              // จมยอแช่น้ำรอปลาเข้า
              boomPitch = 0.34;
              liftSplashRings[0].scale.setScalar(1.0 + Math.sin(tt * 2.2) * 0.08);
              liftSplashRings[1].scale.setScalar(1.0 + Math.cos(tt * 2.2) * 0.08);
            } else if (nt < 6.8) {
              // คนยกยอออกแรงโน้มตัวดึงเชือกงัดคานยอขึ้นจากน้ำ
              const u = (nt - 4.2) / 2.6,
                ease = u * u * (3 - 2 * u);
              boomPitch = 0.34 - ease * 0.64;
              fishActive = u > 0.28;
              liftSplashRings[0].scale.setScalar(1.0 + u * 1.6);
              liftSplashRings[1].scale.setScalar(1.1 + u * 1.9);
            } else if (nt < 9.6) {
              // ยอยักษ์ลอยเด่นเหนือน้ำ ปลา 5 ตัวกระโดดดิ้นไปมาในก้นยอ
              boomPitch = -0.3 + Math.sin(tt * 3.5) * 0.015;
              fishActive = true;
              const fade = (nt - 6.8) / 2.8;
              liftSplashRings[0].scale.setScalar(1.2 + Math.sin(tt * 4) * 0.25);
              liftSplashRings[1].scale.setScalar(1.4 + fade * 0.8);
            } else {
              // ค่อยๆ ผ่อนคานยอจุ่มกลับลงน้ำ
              const u = (nt - 9.6) / 2.4,
                ease = u * u * (3 - 2 * u);
              boomPitch = -0.3 + ease * 0.64;
              fishActive = u < 0.35;
            }
            leverPivot.rotation.x = boomPitch;
            // รักษาโครงยอและชุดถ่วงท้ายคานให้ห้อยดิ่งตั้งฉากกับผิวน้ำเสมอ ไม่หลุดแยกชิ้น
            netHanger.rotation.x = -boomPitch;
            tailHanger.rotation.x = -boomPitch;

            // ปรับความยาวเชือกดึงคานยอให้เชื่อมจากท้ายคานลงมาถึงหลักผูกเชือกและมือคนยกยอพอดีทุกเฟรม
            const tailWorldY = 3.35 + 1.45 * Math.sin(boomPitch),
              ropeLen = Math.max(0.6, tailWorldY - 1.55);
            pullRopeMesh.scale.y = ropeLen;
            pullRopeMesh.position.y = -ropeLen * 0.5;

            // ท่าทางคนยกยอจับเชือกดึงคานงัด
            const pullAmt = (0.34 - boomPitch) / 0.64;
            liftOperator.tor.rotation.x = 0.1 + pullAmt * 0.26;
            for (const a of liftOperator.arms) {
              a.sh.rotation.x = -1.22 + pullAmt * 0.52;
              a.el.rotation.x = -0.52 - pullAmt * 0.32;
            }
            liftOperator.legs[0].k.rotation.x = pullAmt * 0.26;
            liftOperator.legs[1].k.rotation.x = pullAmt * 0.26;

            liftNetFishes.forEach((fObj, idx) => {
              fObj.m.visible = fishActive;
              if (fishActive) {
                const flop = Math.abs(Math.sin(tt * 9.5 + fObj.ph));
                fObj.m.position.y = fObj.baseY + flop * 0.22;
                fObj.m.rotation.z = Math.sin(tt * 18 + fObj.ph) * 0.65;
                fObj.m.rotation.x = Math.cos(tt * 14 + idx) * 0.4;
                if (fObj.m.userData.tail) fObj.m.userData.tail.rotation.y = Math.sin(tt * 34 + idx) * 0.65;
              }
            });
          }

          // 4. อัปเดตกบนาโมเดลละเอียดกระโดดข้ามใบบัว 6 ใบ พร้อมขาหลังเหยียด-พับและใบบัวยุบตัว
          {
            const frogCyc = 3.4,
              ft = tt % frogCyc,
              nPads = frogPadCoords.length,
              curIdx = Math.floor(tt / frogCyc) % nPads,
              nxtIdx = (curIdx + 1) % nPads,
              pA = frogPadCoords[curIdx],
              pB = frogPadCoords[nxtIdx];

            frogThroatSac.scale.setScalar(0.95 + Math.max(0, Math.sin(tt * 7.5)) * 0.38);
            frogPadMeshes.forEach(pm => {
              pm.position.y = 0.064;
            });

            if (ft < 0.68) {
              // กบกำลังกระโดดลอยตัวกลางอากาศ + ขาหลังเหยียดตรงส่งตัว
              const u = ft / 0.68,
                hx = pA.x + (pB.x - pA.x) * u,
                hz = pA.z + (pB.z - pA.z) * u,
                hy = 0.068 + 4 * 0.78 * u * (1 - u),
                ext = Math.sin(u * Math.PI);
              frogG.position.set(hx, hy, hz);
              frogG.rotation.y = Math.atan2(pB.x - pA.x, pB.z - pA.z);
              frogBodyPivot.rotation.x = -(0.5 - u) * 0.85;
              frogHindLegs[0].rotation.x = -ext * 1.35;
              frogHindLegs[1].rotation.x = -ext * 1.35;
              frogRipple.visible = false;
            } else {
              // เกาะบนใบบัว + ใบบัวยุบตัวรับน้ำหนักเมื่อแตะลง + วงน้ำกระเพื่อม
              frogG.position.set(pB.x, 0.068, pB.z);
              const afterIdx = (nxtIdx + 1) % nPads,
                pC = frogPadCoords[afterIdx],
                turnProg = Math.min(1, Math.max(0, (ft - 1.2) / 0.8)),
                yaw1 = Math.atan2(pB.x - pA.x, pB.z - pA.z),
                yaw2 = Math.atan2(pC.x - pB.x, pC.z - pB.z);
              frogG.rotation.y = yaw1 + (yaw2 - yaw1) * turnProg;
              frogBodyPivot.rotation.x = 0;
              frogHindLegs[0].rotation.x = 0;
              frogHindLegs[1].rotation.x = 0;

              if (ft < 1.35) {
                const lu = (ft - 0.68) / 0.67;
                frogPadMeshes[nxtIdx].position.y = 0.064 - Math.sin(lu * Math.PI) * 0.024;
                frogRipple.visible = true;
                frogRipple.position.set(pB.x, 0.065, pB.z);
                frogRipple.scale.setScalar(0.55 + lu * 1.9);
              } else {
                frogRipple.visible = false;
              }
            }
          }

          // 5. อัปเดตคนตกปลาชักเบ็ดบนท่าน้ำไม้ + สายเอ็นเชื่อมปลายเบ็ดกับทุ่นลอยน้ำไม่หลุดแยก
          {
            const biteT = tt % 5.4;
            let rodAngle = 0,
              bobY = 0.065;
            if (biteT > 3.9 && biteT < 4.85) {
              const bw = Math.sin((biteT - 3.9) * 14),
                pull = Math.max(0, bw);
              rodAngle = -pull * 0.42;
              anglerChar.tor.rotation.x = -pull * 0.14;
              anglerChar.arms[0].sh.rotation.x = -0.85 - pull * 0.42;
              anglerChar.arms[1].sh.rotation.x = -0.85 - pull * 0.42;
              bobY = 0.065 - Math.abs(bw) * 0.06;
              bobberRip.scale.setScalar(1.0 + Math.abs(bw) * 1.85);
            } else {
              rodAngle = Math.sin(tt * 1.4) * 0.03;
              anglerChar.tor.rotation.x = 0.04;
              anglerChar.arms[0].sh.rotation.x = -0.78;
              anglerChar.arms[1].sh.rotation.x = -0.78;
              bobY = 0.065 + Math.sin(tt * 2.6) * 0.012;
              bobberRip.scale.setScalar(1.0 + Math.sin(tt * 2.6) * 0.18);
            }
            anglerRodPivot.rotation.x = rodAngle;
            anglerLineHanger.rotation.x = -rodAngle;
            const cA = Math.cos(rodAngle),
              sA = Math.sin(rodAngle),
              tipY = 0.2 + 1.05 + 1.26 * cA - 2.02 * sA,
              tipZ = 0.45 + 0.18 + 1.26 * sA + 2.02 * cA,
              lineLen = Math.max(0.5, tipY - bobY);
            anglerLineMesh.scale.y = lineLen;
            anglerLineMesh.position.y = -lineLen * 0.5;
            anglerBobber.position.set(0.16, bobY, tipZ);
          }

          // 6. อัปเดตฝูงควายปลักแช่น้ำส่ายหัว กระดิกหู และนกยางบนหลังควายก้มจิก
          wetlandBuffaloes.forEach(wb => {
            const ph = wb.userData.ph || 0;
            if (wb.userData.neck) {
              wb.userData.neck.rotation.y = Math.sin(tt * 0.7 + ph) * 0.22;
              wb.userData.neck.rotation.x = Math.sin(tt * 1.1 + ph) * 0.06;
            }
            if (wb.userData.earL && wb.userData.earR) {
              const flick = Math.sin(tt * 4.2 + ph) * 0.28;
              wb.userData.earL.rotation.y = flick;
              wb.userData.earR.rotation.y = -flick;
            }
            if (wb.userData.egretNeck) {
              wb.userData.egretNeck.rotation.x = Math.max(0, Math.sin(tt * 1.6 + ph)) * 0.55;
            }
            if (wb.userData.w1 && wb.userData.w2) {
              wb.userData.w1.scale.setScalar(1.0 + Math.sin(tt * 1.8 + ph) * 0.08);
              wb.userData.w2.scale.setScalar(1.0 + Math.cos(tt * 1.8 + ph) * 0.1);
            }
          });
        };
      }

      // ================= สวนมะพร้าวสิ้นสุดก่อนเริ่มเส้นทางภูเขาใหม่ =================
      for (let t = 0.858; t < T_ROUTE_EXT_START; t += 0.009) {
        if (window.__TEMPLES && window.__TEMPLES.some(tp => Math.abs(t - tp.t) < 0.016)) continue;
        for (const sd of [-1, 1]) {
          const off = sd * 11.2,
            o = offRoad(t, off);
          if (!spotOK(o.x, o.z, 4.6)) continue;
          taken.push([o.x, o.z, 4.2]);

          const cocoGrove = new THREE.Group();
          cocoGrove.position.set(o.x, 0, o.z);
          cocoGrove.rotation.y = Math.atan2(o.tn.x, o.tn.z);
          scene.add(cocoGrove);

          // ปลูกต้นมะพร้าวเรียงแถวคู่ขนานถนน (2 แถว x 3 ต้น)
          for (const cx of [-2.4, 2.4]) {
            for (const cz of [-3.2, 0, 3.2]) {
              const treeG = new THREE.Group();
              treeG.position.set(cx, 0, cz);
              treeG.rotation.y = LR() * 6.28;
              treeG.scale.setScalar(0.88 + LR() * 0.22);
              cocoGrove.add(treeG);

              // ใช้ลำต้น 2 ท่อนแทน 7 ท่อน เพื่อลดจำนวน Mesh
              cyl(0.13, 0.17, 2.8, cocoTrunkM, 0.1, 1.4, 0, treeG, 0, -0.075);
              cyl(0.09, 0.13, 2.8, cocoTrunkM, 0.32, 4.15, 0, treeG, 0, -0.09);
              const topX = 0.44,
                topY = 5.55;
              for (let n = 0; n < 3; n++) {
                const na = n * 2.094;
                ball(
                  0.14,
                  n % 2 ? cocoNutGreen : cocoNutBrown,
                  topX + Math.cos(na) * 0.18,
                  topY - 0.18,
                  Math.sin(na) * 0.18,
                  treeG
                );
              }
              for (let l = 0; l < 5; l++) {
                const frond = new THREE.Mesh(palmFrondGeo, cocoLeafM);
                frond.position.set(topX, topY, 0);
                frond.rotation.y = (l / 5) * 6.28 + (LR() - 0.5) * 0.15;
                frond.rotation.x = -0.18 - (l % 2) * 0.18;
                frond.castShadow = false;
                treeG.add(frond);
              }
            }
          }
        }
      }
      /* ====================================================================== */


      /* ===== กระจายผู้คนตามโซน: เมือง (นักเรียน) · ชนบท · โรงเรียนทั้ง 2 แห่ง (ร้านค้า & รถเร่ขายของ) · ไร่/สวน ===== */
      {
        zoneIdx.push(crowd.length);
        const side = () => (LR() < 0.5 ? -1 : 1),
          walkOff = () => side() * (4.15 + LR() * 0.5);
        const stu = () => {
          const g = LR() < 0.5;
          return { sk: pk(SK), top: 0xf4f1e8, bt: g ? 0x26364f : 0x2a3550, skirt: g, short: 1, hair: pk(HC), hs: g ? pk([1, 2, 4]) : pk([0, 1]), hat: 0, long: 0, p: pk(['bag', 'sbag']), kid: 1, sc: 0.86 + LR() * 0.12, v: 0.52 + LR() * 0.15, k: 2 };
        };
        const elder = (p) => ({ sk: pk(SK), top: pk(BRIGHT), bt: pk(DKP), hair: 0xd2cdc4, old: 1, hs: 0, hat: pk([0, 'cap', 'wide']), long: 1, p: p || 'cane', v: 0.28, k: 4 });
        const monkOutfit = (withBowl = true) => ({
          sk: pk(SK),
          top: pk([0xe08a2e, 0xd4761c, 0xc86418]),
          bt: pk([0xd4761c, 0xc86418]),
          skirt: 1,
          short: 1,
          hair: 0x1c1715,
          hs: 3,
          p: withBowl ? 'bowl' : 'sac',
          uc: 0xd4761c,
          v: 0.34 + LR() * 0.08,
          k: 3
        });
        const farm = (top, hat, p, extra) => Object.assign({ sk: pk(SK), top: top || pk(BRIGHT), bt: pk(DKP), short: 1, hair: pk(HC), hs: pk([0, 1]), hat, long: 1, p, v: 0, k: 1 }, extra);
        const placeTalker = (outfit, wx, wz, yaw, tRef, offRef) => {
          const p = addP(outfit, 'talk', wx, wz, tRef, offRef);
          p.x = wx;
          p.z = wz;
          p.yaw = yaw;
          p.g.position.set(wx, 0, wz);
          p.g.rotation.y = yaw;
          return p;
        };
        const placeShopTalker = (...args) => {
          const p = placeTalker(...args);
          p.hideAtNight = true;
          return p;
        };
        const pair = (t, mk) => {
          const tn = route.getTangent(t);
          for (const sd of LR() < 0.5 ? [1, -1] : [-1, 1])
            for (const off of [5.8, 6.6, 7.4]) {
              const o = offRoad(t, sd * off),
                a = { x: o.x - tn.x * 0.48, z: o.z - tn.z * 0.48 },
                b = { x: o.x + tn.x * 0.48, z: o.z + tn.z * 0.48 };
              if (!spotOK(a.x, a.z, 0.55) || !spotOK(b.x, b.z, 0.55)) continue;
              const p1 = placeTalker(mk(), a.x, a.z, Math.atan2(b.x - a.x, b.z - a.z), t, sd * 6),
                p2 = placeTalker(mk(), b.x, b.z, Math.atan2(a.x - b.x, a.z - b.z), t, sd * 6);
              p1.partner = p2; p2.partner = p1; p1.talkSide = 1; p2.talkSide = -1;
              return;
            }
        };

        // 0. รอบๆ วัดทั้ง 5 แห่ง: พระสงฆ์ + งานทำบุญหน้าวัด (พระนั่งรับสังฆทาน ญาติโยมพับเพียบพนมมือ พ่อค้าแม่ค้า ลูกค้า และคนเดินเที่ยวงานด้วยโมเดลคนสมจริง)
        if (window.__TEMPLES) {
          const meritLady = (topCol, btCol, hs = 1, p = '') => ({
            sk: pk(SK),
            top: topCol || pk([0xfaf6ee, 0xf5e6d3, 0xe8d5dc, 0xd8eadf, 0xf2dca6]),
            bt: btCol || pk([0x6b3a4a, 0x2f4a6b, 0x2f6b5a, 0x5c3d2e]),
            skirt: 1,
            short: 1,
            hair: pk(HC),
            hs,
            long: 1,
            p,
            v: 0.36,
            k: 6
          });
          const meritMan = (topCol, old = 0, p = '') => ({
            sk: pk(SK),
            top: topCol || pk([0xf6f3ea, 0xe6dec8, 0xd4e2ea, 0x8fb177]),
            bt: pk([0x3b4a5c, 0x4a4238, 0x2f3d38]),
            hair: old ? 0xd2cdc4 : pk(HC),
            old,
            hs: 0,
            long: 1,
            p,
            v: 0.36,
            k: old ? 4 : 0
          });
          window.__TEMPLES.forEach(tp => {
            const cosR = Math.cos(tp.rot),
              sinR = Math.sin(tp.rot),
              toFair = (lx, lz) => ({
                x: tp.x + lx * cosR + lz * sinR,
                z: tp.z - lx * sinR + lz * cosR
              });
            const placeFairPerson = (outfit, mode, lx, lz, lrot, yBase = 0) => {
              const w = toFair(lx, lz),
                p = addP(outfit, mode, w.x, w.z, tp.t, tp.sd * 9);
              p.x = w.x;
              p.z = w.z;
              p.yBase = yBase;
              p.yaw = tp.rot + lrot;
              p.nt = 1; // กลางคืนหายไปทั้งหมด
              p.hotspotType = 'temple';
              p.g.position.set(w.x, yBase, w.z);
              p.g.rotation.y = p.yaw;
              return p;
            };
            const addFairWalker = (outfit, lx1, lz1, lx2, lz2, u0) => {
              const a = toFair(lx1, lz1),
                b = toFair(lx2, lz2),
                p = addP(outfit, 'fair_walk', a.x, a.z, tp.t, tp.sd * 9);
              p.ax = a.x;
              p.az = a.z;
              p.bx = b.x;
              p.bz = b.z;
              p.segLen = Math.max(0.5, Math.hypot(b.x - a.x, b.z - a.z));
              p.u = u0;
              p.dir = u0 > 0.5 ? -1 : 1;
              p.baseYaw = Math.atan2(b.x - a.x, b.z - a.z);
              p.turn = p.dir > 0 ? 0 : Math.PI;
              p.x = a.x + (b.x - a.x) * u0;
              p.z = a.z + (b.z - a.z) * u0;
              p.yaw = p.baseYaw + p.turn;
              p.nt = 1;
              p.hotspotType = 'temple';
              p.g.position.set(p.x, 0, p.z);
              p.g.rotation.y = p.yaw;
              return p;
            };

            const m1 = addP(monkOutfit(true), 'walk', 0, 0, tp.t - 0.004, tp.sd * 4.5);
            m1.span = 9.0;
            m1.nt = 1;
            // พระยืนสนทนาธรรม/ให้พรญาติโยมบริเวณหน้าทางเข้าวัด
            const gateDist = 14.5,
              gx = tp.x + sinR * gateDist,
              gz = tp.z + cosR * gateDist;
            const monkTalk = placeTalker(monkOutfit(true), gx - cosR * 0.55, gz + sinR * 0.55, tp.rot - 1.2, tp.t, tp.sd * 7.5);
            const layPerson = placeTalker(elder('sac'), gx + cosR * 0.55, gz - sinR * 0.55, tp.rot + 1.9, tp.t, tp.sd * 7.5);
            monkTalk.nt = 1;
            layPerson.nt = 1;
            monkTalk.partner = layPerson;
            layPerson.partner = monkTalk;

            // (ก) ปะรำพิธีทำบุญ: พระสงฆ์ 5 รูปนั่งขัดสมาธิบนอาสนะ เจริญพระพุทธมนต์/รับสังฆทาน
            const PVX = -12.2,
              PVZ = 21.5;
            [-2.2, -1.1, 0, 1.1, 2.2].forEach((mz, idx) => {
              const mk = placeFairPerson(monkOutfit(false), 'sit_monk', PVX - 0.9, PVZ + mz, Math.PI / 2, 0.24);
              mk.ph = idx * 1.1;
            });

            // (ข) ญาติโยม/ชาวบ้านนั่งพับเพียบพนมมือไหว้พระทำบุญ 2 แถวบนพรมแดง
            [-2.2, -1.1, 0, 1.1, 2.2].forEach((mz, idx) => {
              const out1 = idx % 2 === 0 ? meritLady(0, 0, (idx % 2) + 1) : meritMan(0, idx === 1 ? 1 : 0);
              const p1 = placeFairPerson(out1, 'sit_wai', PVX + 0.58, PVZ + mz + 0.22, -Math.PI / 2, 0.18);
              p1.ph = idx * 0.9;
              if (idx < 4) {
                const out2 = idx === 2 ? stu() : idx % 2 === 0 ? meritMan(0, 1) : meritLady(0, 0, 2);
                const p2 = placeFairPerson(out2, 'sit_wai', PVX + 1.52, PVZ + mz + 0.65, -Math.PI / 2, 0.18);
                p2.ph = idx * 1.3 + 0.5;
              }
            });

            // (ค) พ่อค้าแม่ค้าและลูกค้าตามซุ้มร้านค้างานวัด 4 ร้าน
            [
              [-4.4, 20.2, 1],
              [4.4, 20.2, -1],
              [-4.4, 23.0, 1],
              [4.4, 23.0, -1]
            ].forEach(([sx, sz, dir], idx) => {
              const sellerRot = dir > 0 ? Math.PI / 2 : -Math.PI / 2,
                buyerRot = -sellerRot;
              const sellerOutfit =
                idx % 2 === 0
                  ? { sk: pk(SK), top: pk([0xe98f7d, 0xf2c14e]), bt: 0x3d4a5c, skirt: 1, short: 1, hair: pk(HC), hs: 1, hat: 'towel', v: 0.2, k: 8 }
                  : { sk: pk(SK), top: pk([0x6e9fb0, 0x8fb177]), bt: 0x2f3d38, short: 1, hair: pk(HC), hs: 0, hat: 'straw', v: 0.2, k: 8 };
              const vnd = placeFairPerson(sellerOutfit, 'talk', sx - dir * 0.15, sz, sellerRot, 0);
              const buy1 = placeFairPerson(
                idx % 2 === 0 ? meritLady(0, 0, 2, 'sac') : meritMan(0, 0, 'bag'),
                'talk',
                sx + dir * 1.22,
                sz + 0.26,
                buyerRot - 0.15,
                0
              );
              vnd.partner = buy1;
              buy1.partner = vnd;
              if (idx < 3) {
                placeFairPerson(idx === 1 ? stu() : elder('umb'), 'talk', sx + dir * 1.32, sz - 0.38, buyerRot + 0.22, 0);
              }
            });

            // (ง) ชาวบ้านร่วมทำบุญต้นผ้าป่า & ครอบครัวชมชิงช้าสวรรค์
            placeFairPerson(meritLady(0xfaf6ee, 0x6b3a4a, 1, 'sac'), 'talk', -6.6, 23.4, -Math.PI / 2, 0);
            placeFairPerson(elder('cane'), 'talk', -7.4, 24.35, Math.PI, 0);
            placeFairPerson({ sk: pk(SK), top: 0xe98f7d, bt: 0xc9b48a, short: 1, hair: pk(HC), hs: 1, hat: 'wide', p: 'cam', v: 0.3, k: 0 }, 'talk', 10.2, 21.2, Math.PI / 2, 0);
            placeFairPerson(stu(), 'talk', 10.3, 22.0, Math.PI / 2 - 0.2, 0);

            // (จ) ผู้คนเดินเที่ยวงานวัดไป-มาบนทางเดินและลานหน้าวัด (มีแอนิเมชันก้าวขาแกว่งแขนสมจริง)
            addFairWalker(meritLady(0, 0, 1, 'sac'), -0.85, 17.8, -0.85, 24.6, 0.2);
            addFairWalker(meritMan(0, 0), 0.85, 24.6, 0.85, 17.8, 0.7);
            addFairWalker(stu(), -0.25, 18.4, -0.25, 24.2, 0.55);
            addFairWalker(elder('cane'), 0.35, 24.0, 0.35, 18.6, 0.35);
            addFairWalker(meritLady(0, 0, 2, 'umb'), -8.2, 24.6, 8.2, 24.6, 0.3);
            addFairWalker(meritMan(0, 0, 'bag'), 8.2, 24.9, -8.2, 24.9, 0.75);
          });
        }

        // 1. โซนเมือง (จันจว้า · เชียงแสน · เชียงของ · เวียงแก่น): ลดความแออัด เหลือจุดละ 2 คนพอดีตา
        ROUTE.forEach(s => {
          addP(stu(), 'walk', 0, 0, s.t + (LR() - 0.5) * 0.016, walkOff());
          addP(elder(), 'walk', 0, 0, s.t + (LR() - 0.5) * 0.02, walkOff());
        });

        // 2. โซนชนบทระยะยาว (0.565 - 0.95): เพิ่มคนเดินเฉพาะช่วงถนนยาวนอกเมือง (ไม่สุ่มพระบิณฑบาต ARCH[2] แถวหนองน้ำ/สวนมะพร้าวเพื่อไม่ให้ไปกระจุกตัว)
        const ARCH_NO_MONK = ARCH.filter((_, idx) => idx !== 2);
        let added = 0;
        for (let t = 0.568; t < 0.95 && added < 12; t += 0.032) {
          if ([T_SCHOOL_FIELD, 0.81].some(st => Math.abs(st - t) < 0.022)) continue;
          if (t >= 0.858 && t <= 0.912) continue; // เว้นช่วงริมหนองน้ำไม่ให้คนเดินสุ่มไปซ้อนกับจุดหาปลา
          if (crowd.some(h => h.mode === 'walk' && Math.abs(h.t0 - t) < 0.018)) continue;
          const pool = t > 0.82 ? ARCH_NO_MONK : ARCH;
          addP(pk(pool)(), 'walk', 0, 0, t + (LR() - 0.5) * 0.008, walkOff());
          added++;
        }

        // 3. โซนหน้าโรงเรียนทั้ง 2 แห่ง (t = 0.64 โซนทุ่งนา และ t = 0.81 โซนสวนผลไม้)
        // เพิ่มคนเดินหน้าโรงเรียน + ร้านค้าหน้าโรงเรียน + รถเร่ขายของ (ซาเล้งพ่วงข้าง & รถพุ่มพวง)
        const schoolZones = [T_SCHOOL_FIELD, 0.81];
        const woodStallM = mt(0xc49558),
          darkWoodM = mt(0x7a5636),
          metalCartM = mt(0xd8e0e6),
          redRoofM = mt(0xd9534a),
          blueRoofM = mt(0x4a8db7),
          yellowRoofM = mt(0xf2c14e),
          greenRoofM = mt(0x569e68),
          creamCanopyM = mt(0xfaf4e8),
          glassCaseM = new THREE.MeshStandardMaterial({ color: 0xdff2ff, transparent: true, opacity: 0.48, roughness: 0.15 });

        // ฟังก์ชันสร้างร่มแม่ค้าสีสดใส
        const buildUmbrella = (parent, ux, uy, uz, col1, col2, rad = 1.25) => {
          const uGrp = new THREE.Group();
          uGrp.position.set(ux, uy, uz);
          cyl(0.025, 0.028, 1.85, metalCartM, 0, 0.92, 0, uGrp);
          const cone1 = new THREE.Mesh(new THREE.ConeGeometry(rad, 0.42, 10), col1);
          cone1.position.y = 1.88;
          cone1.castShadow = true;
          const cone2 = new THREE.Mesh(new THREE.ConeGeometry(rad * 0.96, 0.14, 10), col2);
          cone2.position.y = 1.72;
          uGrp.add(cone1, cone2);
          parent.add(uGrp);
          return uGrp;
        };

        // ฟังก์ชันสร้างซุ้มร้านค้าหน้าโรงเรียน (ร้านน้ำปั่น-ขนม / ร้านลูกชิ้นปิ้ง-ผลไม้)
        const buildSchoolShop = (wx, wz, rotY, styleIdx) => {
          const g = new THREE.Group();
          g.position.set(wx, 0, wz);
          g.rotation.y = rotY;
          scene.add(g);
          taken.push([wx, wz, 2.6]);
          if (window.__addGroundPatch) window.__addGroundPatch(g, 5.0, 4.0, 0, 0.25);

          // พื้นแคร่ไม้และเสา 4 มุม
          box(2.5, 0.12, 1.7, darkWoodM, 0, 0.06, 0, g);
          for (const px of [-1.1, 1.1]) {
            for (const pz of [-0.7, 0.7]) {
              cyl(0.045, 0.05, 1.85, darkWoodM, px, 1.0, pz, g);
            }
          }
          // เคาน์เตอร์หน้าร้าน
          box(2.3, 0.78, 0.75, woodStallM, 0, 0.48, 0.35, g);
          box(2.42, 0.06, 0.86, creamCanopyM, 0, 0.89, 0.35, g);

          // หลังคาผ้าใบลายสลับสี + ป้ายหน้าร้าน
          const mainRoofM = styleIdx === 0 ? redRoofM : blueRoofM;
          box(2.7, 0.12, 1.95, mainRoofM, 0, 1.95, 0.05, g).rotation.x = 0.12;
          for (let s = -2; s <= 2; s++) {
            box(0.48, 0.14, 2.0, s % 2 === 0 ? mainRoofM : creamCanopyM, s * 0.5, 1.97, 0.05, g).rotation.x = 0.12;
          }
          box(1.8, 0.32, 0.06, yellowRoofM, 0, 2.18, 0.92, g);
          box(1.68, 0.22, 0.08, creamCanopyM, 0, 2.18, 0.93, g);

          if (styleIdx === 0) {
            // ร้านน้ำปั่น-น้ำหวาน & โหลขนมหน้าโรงเรียน
            const jarCols = [0xe84a5f, 0x5ab963, 0xf59e2d].map(c => mt(c));
            for (let j = 0; j < 3; j++) {
              const jx = -0.65 + j * 0.42;
              cyl(0.13, 0.12, 0.34, glassCaseM, jx, 1.09, 0.38, g);
              cyl(0.115, 0.11, 0.24, jarCols[j], jx, 1.05, 0.38, g);
              cyl(0.135, 0.135, 0.05, redRoofM, jx, 1.28, 0.38, g);
            }
            // แถวแก้วน้ำและโหลขนม
            for (let c = 0; c < 4; c++) {
              cyl(0.045, 0.035, 0.14, creamCanopyM, 0.35 + c * 0.16, 0.99, 0.48, g);
              cyl(0.01, 0.01, 0.2, redRoofM, 0.35 + c * 0.16, 1.08, 0.48, g);
            }
            box(0.55, 0.32, 0.38, glassCaseM, 0.65, 1.08, 0.18, g);
          } else {
            // ร้านลูกชิ้นปิ้ง-ของทอด & ผลไม้สด
            box(0.75, 0.16, 0.45, metalCartM, -0.55, 0.98, 0.35, g); // เตาปิ้ง
            for (let k = 0; k < 5; k++) {
              const kx = -0.78 + k * 0.11;
              for (let b = 0; b < 3; b++) {
                ball(0.038, mt(0xd98a5b), kx, 1.09, 0.25 + b * 0.09, g);
              }
            }
            // ถาดขนม/ผลไม้ และขวดซอส
            for (let t = 0; t < 2; t++) {
              box(0.46, 0.08, 0.38, woodStallM, 0.22 + t * 0.52, 0.95, 0.35, g);
              for (let f = 0; f < 4; f++) {
                ball(0.065, t === 0 ? yellowRoofM : redRoofM, 0.12 + t * 0.52 + (f % 2) * 0.18, 1.03, 0.28 + (f >> 1) * 0.14, g);
              }
            }
            cyl(0.04, 0.04, 0.22, redRoofM, -0.05, 1.02, 0.52, g);
            cyl(0.04, 0.04, 0.22, yellowRoofM, 0.06, 1.02, 0.52, g);
          }
          return g;
        };

        // ฟังก์ชันสร้าง "รถพ่วงข้างขายของ / ซาเล้งเร่ขายไอติม-ลูกชิ้นทอด"
        const buildSidecarVendor = (wx, wz, rotY, bikeColor) => {
          const g = new THREE.Group();
          g.position.set(wx, 0, wz);
          g.rotation.y = rotY;
          scene.add(g);
          taken.push([wx, wz, 2.5]);

          // ตัวรถมอเตอร์ไซค์หลัก (ถอดคนขับออกเพราะพ่อค้าลงมายืนขายข้างรถ)
          const bike = mkVeh('bike', bikeColor);
          bike.position.set(-0.55, 0, 0);
          while (bike.children.length > 22) bike.remove(bike.children[bike.children.length - 1]);
          g.add(bike);

          // โครงเหล็กเชื่อมและกระบะพ่วงข้าง
          const W = [];
          box(0.55, 0.05, 0.05, darkWoodM, -0.15, 0.36, 0.35, g);
          box(0.55, 0.05, 0.05, darkWoodM, -0.15, 0.36, -0.35, g);
          box(1.05, 0.1, 1.45, woodStallM, 0.42, 0.42, 0, g);
          box(1.08, 0.42, 1.48, metalCartM, 0.42, 0.68, 0, g);
          wheelG(0.3, 0.1, 0.98, 0.3, 0, g, W);

          // ตู้กระจกใส่ลูกชิ้น/ขนม + ถังไอติมหลอดสแตนเลส
          box(0.88, 0.42, 0.72, glassCaseM, 0.42, 1.1, 0.3, g);
          box(0.9, 0.04, 0.74, redRoofM, 0.42, 1.32, 0.3, g);
          for (let m = 0; m < 4; m++) {
            ball(0.06, m % 2 ? yellowRoofM : redRoofM, 0.25 + (m % 2) * 0.32, 1.0, 0.18 + (m >> 1) * 0.24, g);
          }
          cyl(0.24, 0.22, 0.45, metalCartM, 0.42, 1.1, -0.36, g);
          cyl(0.25, 0.25, 0.05, redRoofM, 0.42, 1.34, -0.36, g);

          // ร่มแม่ค้ากางบนรถพ่วงข้าง
          buildUmbrella(g, 0.42, 0.88, -0.05, redRoofM, yellowRoofM, 1.3);
          return g;
        };

        // ฟังก์ชันสร้าง "รถกระบะพุ่มพวง / รถเร่ขายของชำ-ขนม-ผลไม้"
        const buildPickupVendor = (wx, wz, rotY, truckColor) => {
          const g = new THREE.Group();
          g.position.set(wx, 0, wz);
          g.rotation.y = rotY;
          scene.add(g);
          taken.push([wx, wz, 3.2]);

          const truck = mkVeh('pickup', truckColor);
          g.add(truck);

          // โครงหลังคาผ้าใบรถพุ่มพวงครอบกระบะท้าย
          for (const sx of [-0.78, 0.78]) {
            for (const sz of [-0.25, -1.65]) {
              cyl(0.03, 0.03, 1.05, metalCartM, sx, 1.55, sz, g);
            }
          }
          box(1.72, 0.12, 1.65, blueRoofM, 0, 2.1, -0.95, g);
          box(1.66, 0.08, 1.58, creamCanopyM, 0, 2.17, -0.95, g);
          // กันสาดผ้าใบกางเปิดด้านข้าง
          const flapL = box(0.75, 0.04, 1.55, yellowRoofM, -1.12, 1.98, -0.95, g);
          flapL.rotation.z = 0.28;
          const flapR = box(0.75, 0.04, 1.55, yellowRoofM, 1.12, 1.98, -0.95, g);
          flapR.rotation.z = -0.28;

          // พวงขนมถุงและผลไม้ห้อยท้ายกระบะ
          const snackCols = [redRoofM, yellowRoofM, greenRoofM, mt(0xf2851d)];
          for (const sx of [-0.82, 0.82]) {
            for (let i = 0; i < 4; i++) {
              const sz = -0.4 - i * 0.36;
              for (let h = 0; h < 3; h++) {
                ball(0.075, snackCols[(i + h) % 4], sx, 1.85 - h * 0.17, sz, g, 0.8, 1.15, 0.65);
              }
            }
          }
          // โทรโข่งประกาศขายของบนหลังคารถพุ่มพวง
          const horn = new THREE.Mesh(new THREE.ConeGeometry(0.14, 0.32, 10), creamCanopyM);
          horn.position.set(0.45, 1.82, 0.55);
          horn.rotation.x = -Math.PI / 2;
          g.add(horn);
          return g;
        };

        schoolZones.forEach((scT, idx) => {
          const oRoad = offRoad(scT, 0),
            p0 = oRoad.p,
            tn = oRoad.tn;
          // แปลงพิกัด (ระยะตามแนวถนน along, ระยะห่างจากกึ่งกลางถนน off) เป็นพิกัดโลก (x, z)
          const toWorld = (along, off) => ({
            x: p0.x + tn.x * along - tn.z * off,
            z: p0.z + tn.z * along + tn.x * off
          });
          const rotFaceRoadRight = Math.atan2(tn.z, -tn.x), // หันหน้าจากฝั่งขวา (โรงเรียน) เข้าหาถนน
            rotFaceRoadLeft = Math.atan2(-tn.z, tn.x),      // หันหน้าจากฝั่งซ้าย (ตรงข้าม) เข้าหาถนน
            rotAlongRoad = Math.atan2(tn.x, tn.z);          // ขนานตามแนวถนน

          // (ก) ซุ้มร้านน้ำปั่น-ขนม (ตั้งฝั่งเดียวกับโรงเรียน ถัดจากมุมรั้วโรงเรียน)
          const shop1Pos = toWorld(-20.0, 6.0);
          buildSchoolShop(shop1Pos.x, shop1Pos.z, rotFaceRoadRight, 0);
          placeShopTalker(
            { sk: pk(SK), top: 0xe98f7d, bt: 0x3d4a5c, skirt: 1, short: 1, hair: pk(HC), hs: 1, hat: 'towel', v: 0.2, k: 8 },
            ...(() => { const p = toWorld(-20.0, 6.25); return [p.x, p.z]; })(),
            rotFaceRoadRight, scT, 6.25
          );
          // นักเรียนยืนซื้อน้ำปั่นหน้าร้าน
          const cust1 = toWorld(-19.6, 4.95), cust2 = toWorld(-20.4, 4.95);
          placeShopTalker(stu(), cust1.x, cust1.z, rotFaceRoadLeft, scT, 4.95);
          placeShopTalker(stu(), cust2.x, cust2.z, rotFaceRoadLeft + 0.25, scT, 4.95);

          // (ข) รถพ่วงข้าง/ซาเล้งขายไอติมหลอด & ลูกชิ้นทอด (จอดแวะขายริมทางหน้ากำแพงโรงเรียน)
          const cartPos = toWorld(8.0, 4.45);
          buildSidecarVendor(cartPos.x, cartPos.z, rotAlongRoad, idx === 0 ? 0xd9534a : 0x3d7ea6);
          const cartSeller = toWorld(7.8, 5.15);
          placeShopTalker(
            { sk: pk(SK), top: 0xf2c14e, bt: 0x2f3d38, short: 1, hair: pk(HC), hs: 0, hat: 'cap', v: 0.25, k: 8 },
            cartSeller.x, cartSeller.z, rotFaceRoadRight, scT, 5.15
          );
          const kidC1 = toWorld(6.6, 4.55), kidC2 = toWorld(9.3, 4.55);
          placeShopTalker(stu(), kidC1.x, kidC1.z, rotAlongRoad, scT, 4.55);
          placeShopTalker(stu(), kidC2.x, kidC2.z, rotAlongRoad + Math.PI, scT, 4.55);

          // (ค) รถกระบะพุ่มพวง / รถเร่ขายของชำ-ผลไม้-ขนม (จอดฝั่งตรงข้ามเยื้องประตูโรงเรียน)
          const truckPos = toWorld(-5.8, -5.85);
          buildPickupVendor(truckPos.x, truckPos.z, rotAlongRoad, idx === 0 ? 0x4f8bb0 : 0xe07a45);
          const truckSeller = toWorld(-8.2, -5.65);
          placeShopTalker(
            { sk: pk(SK), top: 0x6e9fb0, bt: 0x3d4a5c, short: 1, hair: pk(HC), hs: 0, hat: 'straw', v: 0.25, k: 8 },
            truckSeller.x, truckSeller.z, rotAlongRoad + Math.PI, scT, -5.65
          );
          const buyer1 = toWorld(-8.8, -4.85), buyer2 = toWorld(-7.5, -4.75);
          placeShopTalker(
            { sk: pk(SK), top: pk(BRIGHT), bt: pk(DKP), skirt: 1, short: 1, hair: pk(HC), hs: 2, p: 'bag', v: 0.25, k: 6 },
            buyer1.x, buyer1.z, rotFaceRoadRight, scT, -4.85
          );
          placeShopTalker(stu(), buyer2.x, buyer2.z, rotFaceRoadRight - 0.3, scT, -4.75);

          // (ง) ร้านลูกชิ้นปิ้ง-ผลไม้สดฝั่งตรงข้ามหน้าโรงเรียน
          const shop2Pos = toWorld(5.8, -5.9);
          buildSchoolShop(shop2Pos.x, shop2Pos.z, rotFaceRoadLeft, 1);
          const seller2 = toWorld(5.8, -6.15);
          placeShopTalker(
            { sk: pk(SK), top: 0x8fb177, bt: 0x2f3d38, skirt: 1, short: 1, hair: pk(HC), hs: 1, hat: 'straw', v: 0.2, k: 8 },
            seller2.x, seller2.z, rotFaceRoadLeft, scT, -6.15
          );
          const cust3 = toWorld(5.4, -4.75), cust4 = toWorld(6.3, -4.75);
          placeShopTalker(stu(), cust3.x, cust3.z, rotFaceRoadRight, scT, -4.75);
          placeShopTalker(elder('umb'), cust4.x, cust4.z, rotFaceRoadRight - 0.2, scT, -4.75);

          // (จ) นักเรียนยืนคุยกันตรงทางเข้าประตูโรงเรียน (alongRoad = -4.0)
          const gateA = toWorld(-2.2, 4.65), gateB = toWorld(-1.4, 4.65);
          const gp1 = placeTalker(stu(), gateA.x, gateA.z, rotAlongRoad + Math.PI, scT, 4.65),
            gp2 = placeTalker(stu(), gateB.x, gateB.z, rotAlongRoad, scT, 4.65);
          gp1.partner = gp2; gp2.partner = gp1; gp1.talkSide = 1; gp2.talkSide = -1;

          // (ฉ) กระจายคนเดิน (นักเรียน + ผู้ปกครอง + ครู) เดินริมถนนทั้งสองฝั่งรอบโรงเรียน
          const walkOffsets = [-0.026, -0.018, -0.011, -0.004, 0.005, 0.012, 0.019, 0.027];
          walkOffsets.forEach((dtOff, wIdx) => {
            const sd = wIdx % 2 === 0 ? 1 : -1;
            const charGen = wIdx % 4 === 3 ? () => elder() : wIdx % 4 === 1 ? () => pk(ARCH)() : stu;
            const w = addP(charGen(), 'walk', 0, 0, scT + dtOff, sd * (4.05 + (wIdx % 3) * 0.18));
            w.span = 10 + (wIdx % 3) * 4;
          });
        });

        // 4. โซนไร่/สวน 4 โซน: เพิ่มชาวสวนคนละแบบข้าง ๆ คนทำงานเดิม (เฉพาะโซนนาขั้นบันได z===0 ที่ก้มดำนาอยู่ในผืนนา)
        const ZV = [
          [() => farm(pk([0x7a3b2e, 0x3d6a8a]), 'wide', 'sac'), () => farm(0, 'straw', 0, { short: 1, kid: 1, sc: 0.8 })], // นาขั้นบันได
          [() => farm(0, 'towel', 'sac'), () => elder('umb')], // ไร่ข้าวโพด
          [() => farm(0, 'basket', 'bag'), () => farm(0, 'straw', 'pole')], // สวนผลไม้
          [() => farm(0x8a5a3c, 'towel', 'pole'), () => farm(0, 'cap', 'sac')] // สวนมะพร้าว
        ];
        for (let z = 0; z < 4; z++)
          crowd.slice(zoneIdx[z], zoneIdx[z + 1]).filter(h => h.mode === 'work' || h.mode === 'talk').forEach((w, i) => {
            if (i % 2) return;
            const an = LR() * 6.28,
              distOff = z === 0 ? 1.15 : 1.8,
              q = addP(pk(ZV[z])(), z === 0 ? 'work' : 'talk', w.x + Math.cos(an) * distOff, w.z + Math.sin(an) * distOff, 0, 0);
            q.yaw = LR() * 6;
          });
      }

      /* ============================================================================
       * src/scene/38-life/07-playground.js
       * สนามเด็กเล่น 5 รูปแบบ และการวางตำแหน่งคนที่ไม่ได้เดิน
       * (ไฟล์นี้ถูกต่อรวมเป็น closure เดียวกับไฟล์อื่น — ไม่ต้อง import/export · ลำดับไฟล์ดู build.config.mjs)
       * ========================================================================== */

      /* --- เริ่มโค้ด: สนามเด็กเล่น 5 รูปแบบ (Realistic Playgrounds with Dirt/Grass Grounds & Detailed Play Structures) --- */
      const playW = mt(0xa2784b),        // ไม้สนอบแห้งสีธรรมชาติสำหรับโครงสร้าง
        playDkW = mt(0x614830),          // ไม้ท่อนสีเข้ม/ขอนไม้กั้นขอบ
        playS = mt(0xdbc39c),            // ทรายละเอียดนุ่ม
        playI = mt(0x40484d),            // เสาเหล็ก/โซ่กัลวาไนซ์กันสนิม
        playT = mt(0x222629),            // ยางรถยนต์สีดำด้าน
        playRed = mt(0xd94336),          // สีแดงสดใสเครื่องเล่นเด็ก
        playBlue = mt(0x2b78c9),         // สีน้ำเงินสดใส
        playYellow = mt(0xf5b823),       // สีเหลืองสดใส
        playGreen = mt(0x3ea35b),        // สีเขียวสดใส
        playCanopy = mt(0xe36544);       // หลังคาผ้าใบกันแดดสีส้มอิฐ

      // แผ่นพื้นสนามเด็กเล่น: ลานดินผสมหญ้าที่ถูกเหยียบย่ำเป็นธรรมชาติ (Trampled Dirt & Sand Ground Patch)
      const playGroundTex = (() => {
        const SZ = 512, C = SZ / 2;
        const cv = document.createElement('canvas');
        cv.width = cv.height = SZ;
        const ctx = cv.getContext('2d');
        ctx.clearRect(0, 0, SZ, SZ);
        // ใช้ PRNG คงที่ เพื่อให้ลายเหมือนเดิมทุกครั้งที่โหลด
        let ps = 2024;
        const pr = () => ((ps = (ps * 16807) % 2147483647) - 1) / 2147483646;
        // ชั้นฐาน: หญ้าสีกลืนกับพื้นฉาก ไล่ใสเนียนที่ขอบวงกลม (ไม่มีขอบสี่เหลี่ยม)
        let g0 = ctx.createRadialGradient(C, C, 0, C, C, C);
        g0.addColorStop(0.0, 'rgba(158,138,104,1)');
        g0.addColorStop(0.35, 'rgba(160,140,104,0.98)');
        g0.addColorStop(0.62, 'rgba(150,152,102,0.85)');
        g0.addColorStop(0.82, 'rgba(146,168,112,0.45)');
        g0.addColorStop(1.0, 'rgba(150,176,120,0)');
        ctx.fillStyle = g0;
        ctx.fillRect(0, 0, SZ, SZ);
        // คราบดินและหย่อมหญ้านุ่ม ๆ ด้วยวงไล่ขอบ (soft blobs) แทนจุดแข็งๆ
        for (let s = 0; s < 70; s++) {
          const an = pr() * Math.PI * 2, rd = Math.sqrt(pr()) * C * 0.82;
          const x = C + Math.cos(an) * rd, y = C + Math.sin(an) * rd, r = 14 + pr() * 34;
          const dirt = pr() < 0.55;
          const gb = ctx.createRadialGradient(x, y, 0, x, y, r);
          const edge = 1 - Math.min(1, rd / (C * 0.9));
          const al = (dirt ? 0.28 : 0.3) * (0.35 + edge);
          gb.addColorStop(0, dirt ? 'rgba(176,152,112,' + al + ')' : 'rgba(120,158,84,' + al + ')');
          gb.addColorStop(1, dirt ? 'rgba(176,152,112,0)' : 'rgba(120,158,84,0)');
          ctx.fillStyle = gb;
          ctx.fillRect(x - r, y - r, r * 2, r * 2);
        }
        // ปลายหญ้าสั้นบางๆ ที่ขอบลาน
        ctx.lineCap = 'round';
        for (let s = 0; s < 260; s++) {
          const an = pr() * Math.PI * 2, rd = C * (0.52 + pr() * 0.4);
          const x = C + Math.cos(an) * rd, y = C + Math.sin(an) * rd;
          const fall = 1 - (rd / C - 0.52) / 0.4;
          ctx.strokeStyle = 'rgba(' + (96 + pr() * 40 | 0) + ',' + (140 + pr() * 36 | 0) + ',72,' + (0.45 * fall).toFixed(2) + ')';
          ctx.lineWidth = 1.4;
          ctx.beginPath();
          ctx.moveTo(x, y);
          ctx.lineTo(x + (pr() - 0.5) * 7, y - 5 - pr() * 6);
          ctx.stroke();
        }
        const tex = new THREE.CanvasTexture(cv);
        tex.wrapS = THREE.ClampToEdgeWrapping;
        tex.wrapT = THREE.ClampToEdgeWrapping;
        tex.anisotropy = 4;
        return tex;
      })();

      const playGroundMat = new THREE.MeshLambertMaterial({
        map: playGroundTex,
        transparent: true,
        depthWrite: false,
        polygonOffset: true,
        polygonOffsetFactor: -2,
        polygonOffsetUnits: -2
      });
      const playGroundGeo = new THREE.CircleGeometry(3.9, 48);
      playGroundGeo.rotateX(-Math.PI / 2);

      const locV = new THREE.Vector3(),
        axisY = new THREE.Vector3(0, 1, 0),
        playSpots = [];

      for (let i = 0; i < 10; i++) {
        const u = (i + LR() * 0.8) / 10,
          t = u < 0.25 ? 0.05 + (u / 0.25) * 0.49 : 0.57 + ((u - 0.25) / 0.75) * 0.37;
        const sd = LR() < 0.5 ? -1 : 1;
        const o = offRoad(t, sd * (8.5 + LR() * 5)); // ให้ห่างจากถนนหลัก
        if (!spotOK(o.x, o.z, 3.8)) continue;
        if (playSpots.some(p => (p.x - o.x) * (p.x - o.x) + (p.z - o.z) * (p.z - o.z) < 62 * 62)) continue;
        playSpots.push({ x: o.x, z: o.z });
        taken.push([o.x, o.z, 3.8]);

        const type = i % 5;
        const g = new THREE.Group();
        g.position.set(o.x, 0, o.z);
        g.rotation.y = LR() * 6.28; // สุ่มหันองศาเครื่องเล่น
        scene.add(g);

        // 1. แผ่นพื้นดินผสมหญ้าสำหรับสนามเด็กเล่น
        const pGround = new THREE.Mesh(playGroundGeo, playGroundMat);
        pGround.position.y = 0.025;
        g.add(pGround);

        // ขอนไม้โค้งกั้นขอบรอบสนามเด็กเล่น (แบ่งเป็นท่อนๆ กั้นขอบธรรมชาติ)
        for (let b = 0; b < 8; b++) {
          const bAng = (b / 8) * Math.PI * 2 + 0.15;
          const bx = Math.cos(bAng) * 3.45, bz = Math.sin(bAng) * 3.45;
          const bLog = cyl(0.07, 0.07, 2.35, playDkW, bx, 0.055, bz, g);
          bLog.rotation.set(Math.PI / 2, 0, -bAng);
        }

        // ฟังก์ชันสร้างเด็ก โดยคำนวณพิกัด Local -> World ตามองศาของเครื่องเล่น
        const addKid = (kx, kz, yaw, action = 'talk') => {
          locV.set(kx, 0, kz).applyAxisAngle(axisY, g.rotation.y);
          const h = addP(
            {
              sk: pk(SK),
              top: pk(BRIGHT),
              bt: pk(DKP),
              short: 1,
              hair: pk(HC),
              hs: 0,
              kid: 1,
              sc: 0.75 + LR() * 0.1,
              v: 0,
              k: 0
            },
            action,
            o.x,
            o.z,
            t,
            0
          );
          h.x = o.x + locV.x;
          h.z = o.z + locV.z;
          h.yaw = g.rotation.y + yaw;
        };

        if (type === 0) {
          // ==========================================
          // 1. หอคอยไม้สไลเดอร์และบันไดปีนป่าย (Wooden Tower Slide Play Structure)
          // ==========================================
          // เสาค้ำหอคอยไม้ 4 ต้น
          cyl(0.065, 0.065, 2.3, playDkW, -0.65, 1.15, -0.65, g);
          cyl(0.065, 0.065, 2.3, playDkW, 0.65, 1.15, -0.65, g);
          cyl(0.065, 0.065, 2.3, playDkW, -0.65, 1.15, 0.65, g);
          cyl(0.065, 0.065, 2.3, playDkW, 0.65, 1.15, 0.65, g);

          // พื้นชานพักยกสูง (Platform Deck)
          box(1.45, 0.09, 1.45, playW, 0, 1.05, 0, g);
          box(1.48, 0.06, 0.06, playDkW, 0, 0.98, 0.68, g);
          box(1.48, 0.06, 0.06, playDkW, 0, 0.98, -0.68, g);

          // รั้วกันตกด้านข้างซ้าย-ขวาเต็มแนว และด้านหลังเว้นช่องกลางสำหรับปีนบันไดขึ้นหอคอย
          for (const sx of [-0.65, 0.65]) {
            box(0.04, 0.04, 1.36, playW, sx, 1.5, 0, g);
            box(0.04, 0.04, 1.36, playW, sx, 1.28, 0, g);
            for (let f = -0.45; f <= 0.45; f += 0.3) {
              cyl(0.02, 0.02, 0.42, playYellow, sx, 1.36, f, g);
            }
          }
          // รั้วด้านหลังซ้าย-ขวา (เว้นช่องทางเข้าบันไดตรงกลาง x = -0.34..0.34)
          for (const bx of [-0.5, 0.5]) {
            box(0.32, 0.04, 0.04, playW, bx, 1.5, -0.65, g);
            box(0.32, 0.04, 0.04, playW, bx, 1.28, -0.65, g);
            cyl(0.02, 0.02, 0.42, playYellow, bx, 1.36, -0.65, g);
          }

          // หลังคาทรงจั่วสีส้มสดใส (Pitched Gable Roof)
          const roofL = box(1.55, 0.04, 0.92, playCanopy, 0, 2.38, 0.38, g);
          roofL.rotation.x = 0.48;
          const roofR = box(1.55, 0.04, 0.92, playCanopy, 0, 2.38, -0.38, g);
          roofR.rotation.x = -0.48;
          box(1.56, 0.06, 0.08, playW, 0, 2.62, 0, g); // สันหลังคา

          // รางสไลเดอร์สีเหลืองด้านหน้า พร้อมขอบกั้นสีแดง
          const slideChute = box(0.55, 0.04, 1.85, playYellow, 0, 0.56, 1.48, g);
          slideChute.rotation.x = 0.54;
          const slideLipL = box(0.06, 0.16, 1.85, playRed, -0.26, 0.61, 1.48, g);
          slideLipL.rotation.x = 0.54;
          const slideLipR = box(0.06, 0.16, 1.85, playRed, 0.26, 0.61, 1.48, g);
          slideLipR.rotation.x = 0.54;
          // ชานปล่อยตัวด้านล่างโค้งแนบพื้น
          box(0.55, 0.04, 0.45, playYellow, 0, 0.05, 2.44, g);

          // บันไดไม้ปีนขึ้นด้านหลัง (วางเอียงถูกต้องจากพื้น z = -1.26, y = 0.02 ขึ้นไปแตะขอบชานพัก z = -0.68, y = 1.05 พอดี + ราวจับเหล็กสองข้าง)
          const ladTilt = Math.atan2(0.58, 1.03); // +0.513 rad เอียงเข้าหาชานพักหอคอย
          for (const lx of [-0.32, 0.32]) {
            const rail = box(0.045, 1.22, 0.085, playDkW, lx, 0.535, -0.97, g);
            rail.rotation.x = ladTilt;
            // ราวจับเหล็กสีแดงขนานแนวบันไดช่วยให้เด็กจับปีนขึ้นอย่างปลอดภัย
            const handRail = cyl(0.018, 0.018, 1.24, playRed, lx, 0.76, -0.94, g, ladTilt);
            cyl(0.016, 0.016, 0.24, playRed, lx, 0.22, -1.21, g);
            cyl(0.016, 0.016, 0.48, playRed, lx, 1.28, -0.66, g);
          }
          for (let r = 0; r < 5; r++) {
            const uStep = (r + 0.6) / 5.4,
              ry = 0.04 + uStep * 0.98,
              rz = -1.26 + uStep * 0.58;
            box(0.62, 0.032, 0.13, r % 2 === 0 ? playBlue : playYellow, 0, ry, rz, g);
          }

          // เด็กๆ เล่นรอบหอคอย
          addKid(0.0, 0.25, 0, 'talk');             // เด็กยืนบนหอคอยเตรียมสไลด์ลง
          addKid(0.4, 2.7, Math.PI, 'talk');        // เด็กรอรับที่ปลายสไลเดอร์
        } else if (type === 1) {
          // ==========================================
          // 2. ชิงช้าคู่โครงเหล็ก A-Frame (Double A-Frame Swing Set)
          // ==========================================
          // โครงขา A-Frame ซ้าย (x = -1.65)
          cyl(0.045, 0.045, 2.45, playBlue, -1.65, 1.15, -0.65, g, -0.28);
          cyl(0.045, 0.045, 2.45, playBlue, -1.65, 1.15, 0.65, g, 0.28);
          cyl(0.03, 0.03, 0.82, playBlue, -1.65, 0.88, 0, g, Math.PI / 2); // คานขวางขา A

          // โครงขา A-Frame ขวา (x = 1.65)
          cyl(0.045, 0.045, 2.45, playBlue, 1.65, 1.15, -0.65, g, -0.28);
          cyl(0.045, 0.045, 2.45, playBlue, 1.65, 1.15, 0.65, g, 0.28);
          cyl(0.03, 0.03, 0.82, playBlue, 1.65, 0.88, 0, g, Math.PI / 2); // คานขวางขา A

          // คานเหล็กด้านบน (Top Crossbeam)
          const topBeam = cyl(0.05, 0.05, 3.75, playYellow, 0, 2.26, 0, g);
          topBeam.rotation.z = Math.PI / 2;

          // ช่องชิงช้าที่ 1 (ซ้าย: ชิงช้าแผ่นไม้มาตรฐาน)
          cyl(0.012, 0.012, 1.55, playI, -0.98, 1.42, 0, g);
          cyl(0.012, 0.012, 1.55, playI, -0.58, 1.42, 0, g);
          box(0.48, 0.04, 0.2, playRed, -0.78, 0.64, 0, g); // แผ่นที่นั่ง

          // ช่องชิงช้าที่ 2 (ขวา: ชิงช้ายางรถยนต์แขวนโซ่ 3 เส้น)
          cyl(0.012, 0.012, 1.48, playI, 0.78, 1.46, 0, g);
          const tireSwing = new THREE.Mesh(new THREE.TorusGeometry(0.32, 0.09, 8, 18), playT);
          tireSwing.position.set(0.78, 0.68, 0);
          tireSwing.rotation.x = Math.PI / 2;
          g.add(tireSwing);

          // เด็กเล่นชิงช้า
          addKid(-0.78, 0.08, 0, 'talk');
          addKid(0.78, 0.12, 0, 'talk');
        } else if (type === 2) {
          // ==========================================
          // 3. กระบะทรายไม้ทรงสี่เหลี่ยมพร้อมของเล่นและปราสาททราย (Timber Sandbox)
          // ==========================================
          // ขอนไม้ประกบ 4 ด้านเป็นขอบกระบะ
          const sbLogN = cyl(0.1, 0.1, 2.7, playDkW, 0, 0.1, 1.25, g);
          sbLogN.rotation.z = Math.PI / 2;
          const sbLogS = cyl(0.1, 0.1, 2.7, playDkW, 0, 0.1, -1.25, g);
          sbLogS.rotation.z = Math.PI / 2;
          const sbLogE = cyl(0.1, 0.1, 2.7, playDkW, 1.25, 0.1, 0, g);
          sbLogE.rotation.x = Math.PI / 2;
          const sbLogW = cyl(0.1, 0.1, 2.7, playDkW, -1.25, 0.1, 0, g);
          sbLogW.rotation.x = Math.PI / 2;

          // ที่นั่งไม้ตรงมุมกระบะทราย 4 มุม
          box(0.38, 0.04, 0.38, playW, 1.15, 0.22, 1.15, g);
          box(0.38, 0.04, 0.38, playW, -1.15, 0.22, 1.15, g);
          box(0.38, 0.04, 0.38, playW, 1.15, 0.22, -1.15, g);
          box(0.38, 0.04, 0.38, playW, -1.15, 0.22, -1.15, g);

          // พื้นทรายนุ่ม
          box(2.4, 0.12, 2.4, playS, 0, 0.06, 0, g);

          // กองทรายและปราสาททรายของเด็ก
          cyl(0.35, 0.55, 0.18, playS, 0.15, 0.18, -0.15, g);
          cyl(0.11, 0.14, 0.24, playS, 0.15, 0.32, -0.15, g); // ป้อมปราสาททราย
          cyl(0.08, 0.1, 0.18, playS, -0.15, 0.23, -0.22, g);
          // ธงปักบนปราสาท
          cyl(0.01, 0.01, 0.16, playI, 0.15, 0.48, -0.15, g);
          box(0.08, 0.05, 0.01, playRed, 0.18, 0.52, -0.15, g);

          // ของเล่นเด็กในบ่อทราย (ถังตักทราย, พลั่ว, รถดั๊มพ์, ลูกบอล)
          cyl(0.09, 0.07, 0.15, playRed, -0.5, 0.18, 0.45, g); // ถังตักทรายสีแดง
          box(0.05, 0.02, 0.24, playYellow, -0.32, 0.13, 0.5, g); // พลั่วตักทราย
          box(0.24, 0.12, 0.15, playBlue, 0.6, 0.17, 0.45, g); // รถของเล่น
          sphere(0.09, playGreen, 0.75, 0.2, -0.55, g, 8); // ลูกบอลกลิ้ง

          // เด็กๆ ก้มเล่นทราย
          addKid(-0.25, 0.6, Math.PI, 'work');
          addKid(0.48, -0.45, -Math.PI * 0.35, 'work');
        } else if (type === 3) {
          // ==========================================
          // 4. ม้ากระดกคู่พร้อมยางกันกระแทก (Dual Seesaws with Bumper Tires)
          // ==========================================
          [-0.6, 0.6].forEach((zOff, sIdx) => {
            // เสาค้ำแกนหมุนตรงกลาง (เหล็กกล้าทรงสามเหลี่ยม)
            cyl(0.05, 0.05, 0.56, playI, 0, 0.28, zOff, g);
            cyl(0.03, 0.03, 0.35, playI, 0, 0.5, zOff, g, Math.PI / 2);

            // คานไม้กระดก (สลับเอียง ซ้าย-ขวา ให้มีชีวิตชีวา)
            const tilt = sIdx === 0 ? 0.22 : -0.2;
            const plankColor = sIdx === 0 ? playRed : playYellow;
            const plank = box(2.6, 0.07, 0.22, plankColor, 0, 0.52, zOff, g);
            plank.rotation.z = tilt;

            // มือจับนิรภัยสองฝั่ง
            const hL = box(0.03, 0.22, 0.03, playI, -0.95, 0.52 - tilt * 0.95 + 0.15, zOff, g);
            hL.rotation.z = tilt;
            box(0.03, 0.03, 0.2, playGreen, -0.95, 0.52 - tilt * 0.95 + 0.26, zOff, g);

            const hR = box(0.03, 0.22, 0.03, playI, 0.95, 0.52 + tilt * 0.95 + 0.15, zOff, g);
            hR.rotation.z = tilt;
            box(0.03, 0.03, 0.2, playGreen, 0.95, 0.52 + tilt * 0.95 + 0.26, zOff, g);

            // ยางกันกระแทกใต้ปลายคานที่ฝังพื้น
            const bL = cyl(0.18, 0.18, 0.12, playT, -1.18, 0.08, zOff, g);
            bL.rotation.x = Math.PI / 2;
            const bR = cyl(0.18, 0.18, 0.12, playT, 1.18, 0.08, zOff, g);
            bR.rotation.x = Math.PI / 2;
          });

          // เด็กเล่นม้ากระดก
          addKid(-1.18, -0.6, Math.PI / 2, 'talk');
          addKid(1.18, -0.6, -Math.PI / 2, 'talk');
        } else if (type === 4) {
          // ==========================================
          // 5. ทางเดินทรงตัวยางรถยนต์หลากสี พร้อมม้านั่งผู้ปกครองและถังขยะ (Tire Stepping Course & Bench)
          // ==========================================
          const tireCols = [playRed, playYellow, playBlue, playGreen, playYellow, playRed, playBlue];
          const tPos = [
            [-1.5, -0.6, 0.14],
            [-1.0, -0.15, 0.2],
            [-0.5, 0.25, 0.26],
            [0.0, -0.05, 0.3],
            [0.5, 0.32, 0.24],
            [1.0, -0.1, 0.18],
            [1.5, 0.22, 0.12]
          ];
          tPos.forEach((tp, idx) => {
            const tMesh = new THREE.Mesh(new THREE.TorusGeometry(0.3, 0.1, 8, 16), tireCols[idx]);
            tMesh.position.set(tp[0], tp[2], tp[1]);
            tMesh.rotation.x = Math.PI / 2;
            g.add(tMesh);
            // ทรายอัดแน่นด้านในยางสำหรับเหยียบ
            cyl(0.22, 0.22, 0.08, playS, tp[0], tp[2] - 0.02, tp[1], g);
          });

          // ม้านั่งไม้สำหรับผู้ปกครองคอยดูแล (Park Bench)
          box(0.06, 0.45, 0.48, playI, -1.15, 0.22, 1.45, g);
          box(0.06, 0.45, 0.48, playI, 1.15, 0.22, 1.45, g);
          box(2.5, 0.04, 0.44, playW, 0, 0.44, 1.45, g); // แผ่นที่นั่ง
          box(2.5, 0.32, 0.04, playW, 0, 0.72, 1.66, g); // พนักพิงหลัง

          // ถังขยะสนามเด็กเล่นสีเขียว (Park Bin)
          cyl(0.18, 0.16, 0.6, playGreen, 1.8, 0.3, 1.45, g);
          cyl(0.2, 0.2, 0.06, playI, 1.8, 0.62, 1.45, g); // ฝาถัง

          // เด็กทรงตัวบนยาง และเด็กนั่งพัก
          addKid(0.0, -0.05, 0, 'talk');
          addKid(-0.35, 1.4, Math.PI, 'talk'); // นั่งพักบนม้านั่ง
        }
      }
      /* --- จบโค้ด: สนามเด็กเล่น --- */

      /* --- เริ่มโค้ด: จุดตั้งแคมป์แบบละเอียด (Detailed Campsites) --- */
      const campTentM1 = mt(0x4a6b5d), // เต็นท์สีเขียวขี้ม้าแคมป์ปิ้ง
        campTentM2 = mt(0xc27d5f), // เต็นท์สีส้มอิฐแคมป์ปิ้ง
        campFlyM1 = mt(0x365246),
        campFlyM2 = mt(0x9c5b40),
        campFloorM = mt(0x2f3638),
        campInnerM = mt(0x1f2426),
        campBagM = mt(0x4a7c9b),
        campPillowM = mt(0xf2efe6),
        logBarkM = mt(0x4e3926), // เปลือกขอนไม้
        logRingM = mt(0xc8a978), // หน้าตัดเนื้อไม้ขอนไม้
        stoneRingM = mt(0x888a86),
        potBlackM = mt(0x2b2d2f),
        chairFrameM = mt(0x3a3f42),
        chairClothM1 = mt(0xd4a359),
        chairClothM2 = mt(0x526b5c),
        coolerRedM = mt(0xc8463c),
        lanternGlowM = new THREE.MeshBasicMaterial({ color: 0xffe28a, fog: false }),
        fireM = new THREE.MeshBasicMaterial({ color: 0xff8c33, transparent: true, opacity: 0.92, fog: false }),
        fireCoreM = new THREE.MeshBasicMaterial({ color: 0xffe47a, transparent: true, opacity: 0.95, fog: false });

      // รูปทรงหลังคาเต็นท์ทรงจั่วโค้งแคมป์ปิ้ง
      const _tentRoofGeo = (() => {
        const sh = new THREE.Shape();
        sh.moveTo(-1.15, 0);
        sh.lineTo(1.15, 0);
        sh.lineTo(0.72, 0.92);
        sh.lineTo(0, 1.28);
        sh.lineTo(-0.72, 0.92);
        sh.closePath();
        const g = new THREE.ExtrudeGeometry(sh, { depth: 2.1, bevelEnabled: false });
        g.translate(0, 0, -1.05);
        return g;
      })();

      window.campLights = []; // เก็บอาร์เรย์กองไฟเพื่อทำแอนิเมชันตอนกลางคืน

      // สุ่มวางจุดกางเต็นท์ 6 จุดกระจายตามระยะทางจริง
      for (let i = 0; i < 6; i++) {
        const u = (i + LR() * 0.7) / 6,
          t = u < 0.25 ? 0.08 + (u / 0.25) * 0.45 : 0.58 + ((u - 0.25) / 0.75) * 0.35;
        const sd = LR() < 0.5 ? -1 : 1;
        const o = offRoad(t, sd * (10.5 + LR() * 5));
        if (!spotOK(o.x, o.z, 4.8)) continue;
        taken.push([o.x, o.z, 4.8]);

        const cg = new THREE.Group();
        cg.position.set(o.x, 0, o.z);
        // หันหน้าแคมป์เยื้องเข้าหาถนนเพื่อให้มองเห็นรายละเอียดเต็นท์ กองไฟ และคนนั่งได้ชัดเจน
        cg.rotation.y = Math.atan2(sd * o.tn.z, -sd * o.tn.x) + (LR() - 0.5) * 0.55;
        scene.add(cg);

        if (window.__addGroundPatch) window.__addGroundPatch(cg, 6.8, 6.8, 0, -0.35);

        const isGreen = i % 2 === 0,
          tMainM = isGreen ? campTentM1 : campTentM2,
          tFlyM = isGreen ? campFlyM1 : campFlyM2;

        // 1. เต็นท์แคมป์ปิ้งละเอียด: แผ่นรองพื้น (Groundsheet) + ตัวเต็นท์ + ฟลายชีทคลุม + ประตูเต็นท์เปิดเห็นถุงนอนและหมอนด้านใน + กันสาดหน้าเต็นท์พร้อมเสาค้ำและตะเกียงแขวน
        const tentG = new THREE.Group();
        tentG.position.set(0, 0, -1.85);
        cg.add(tentG);

        box(2.6, 0.04, 2.5, campFloorM, 0, 0.02, 0.08, tentG); // แผ่นกราวด์ชีทรองเต็นท์
        const tentBody = new THREE.Mesh(_tentRoofGeo, tMainM);
        tentBody.position.set(0, 0.04, 0);
        tentBody.castShadow = true;
        tentG.add(tentBody);

        // ฟลายชีทคลุมหลังคาเต็นท์
        const flyRoof = new THREE.Mesh(_tentRoofGeo, tFlyM);
        flyRoof.position.set(0, 0.24, 0);
        flyRoof.scale.set(1.06, 0.88, 1.06);
        tentG.add(flyRoof);

        // ช่องประตูหน้าเต็นท์เปิดออก + ผ้าประตูม้วนผูกซ้าย-ขวา + ถุงนอนและหมอนด้านใน
        box(0.95, 0.78, 0.06, campInnerM, 0, 0.43, 1.03, tentG);
        for (const s of [-1, 1]) {
          const flap = box(0.28, 0.82, 0.04, tFlyM, s * 0.56, 0.44, 1.06, tentG);
          flap.rotation.y = -s * 0.45;
          flap.rotation.z = s * 0.14;
        }
        // ถุงนอนและหมอนวางอยู่ในเต็นท์ยื่นออกมาที่พื้นหน้าเต็นท์เล็กน้อย
        ball(0.24, campBagM, -0.18, 0.12, 0.68, tentG, 1.15, 0.45, 2.2);
        ball(0.16, campPillowM, -0.18, 0.16, 0.25, tentG, 1.2, 0.55, 0.9);

        // ผ้าใบกันสาดหน้าเต็นท์ (Awning Canopy) กางยื่นออกมาพร้อมเสาค้ำ 2 ต้น และตะเกียงแคมป์ปิ้งแขวน
        const awning = box(2.15, 0.04, 1.35, tFlyM, 0, 1.34, 1.55, tentG);
        awning.rotation.x = 0.16;
        awning.castShadow = true;
        for (const px of [-0.95, 0.95]) {
          cyl(0.022, 0.025, 1.24, chairFrameM, px, 0.62, 2.15, tentG);
          // เชือกสมอบกตึงเสากันสาด
          const guy = cyl(0.005, 0.005, 0.95, campPillowM, px * 1.18, 0.45, 2.42, tentG, 0.45, -px * 0.25);
          guy.castShadow = false;
        }
        // ตะเกียงแคมป์ปิ้งแขวนใต้กันสาดหน้าเต็นท์
        cyl(0.008, 0.008, 0.18, chairFrameM, 0, 1.2, 1.65, tentG);
        cyl(0.055, 0.07, 0.04, tFlyM, 0, 1.1, 1.65, tentG);
        ball(0.048, lanternGlowM, 0, 1.04, 1.65, tentG, 0.9, 1.2, 0.9);

        // 2. กองไฟแคมป์ปิ้ง: ล้อมวงด้วยก้อนหิน + ท่อนฟืน + สามขาแขวนหม้อต้มสนามเหนือไฟ
        const fireGrp = new THREE.Group();
        fireGrp.position.set(0, 0, 0.55);
        cg.add(fireGrp);

        // วงหินล้อมกองไฟ 10 ก้อน
        for (let st = 0; st < 10; st++) {
          const sa = (st / 10) * Math.PI * 2;
          ball(0.11, stoneRingM, Math.cos(sa) * 0.46, 0.06, Math.sin(sa) * 0.46, fireGrp, 1.2, 0.75, 1.0);
        }
        for (let k = 0; k < 4; k++) {
          const lg = cyl(0.055, 0.06, 0.75, logBarkM, 0, 0.06, 0, fireGrp);
          lg.rotation.set(Math.PI / 2, (k * Math.PI) / 4, 0.12);
        }
        const flame = new THREE.Mesh(new THREE.ConeGeometry(0.24, 0.58, 6), fireM);
        flame.position.set(0, 0.3, 0);
        const flameIn = new THREE.Mesh(new THREE.ConeGeometry(0.13, 0.36, 5), fireCoreM);
        flameIn.position.set(0, -0.05, 0);
        flame.add(flameIn);
        fireGrp.add(flame);

        // ขาตั้งสามขาไม้ไผ่/เหล็ก แขวนหม้อต้มซุปแคมป์ปิ้งเหนือไฟ
        for (let tr = 0; tr < 3; tr++) {
          const ta = (tr / 3) * Math.PI * 2 + 0.3;
          cyl(0.018, 0.022, 1.25, chairFrameM, Math.cos(ta) * 0.28, 0.56, Math.sin(ta) * 0.28, fireGrp, -Math.sin(ta) * 0.42, Math.cos(ta) * 0.42);
        }
        cyl(0.006, 0.006, 0.36, chairFrameM, 0, 0.88, 0, fireGrp);
        cyl(0.14, 0.12, 0.2, potBlackM, 0, 0.66, 0, fireGrp);

        // โต๊ะพับแคมป์ปิ้งพร้อมกาน้ำชา แก้วแคมป์ปิ้ง และกระติกน้ำแข็งสีแดง
        box(0.75, 0.04, 0.52, logRingM, 0, 0.46, 1.65, cg);
        for (const tx of [-0.3, 0.3]) {
          for (const tz of [1.45, 1.85]) cyl(0.018, 0.018, 0.45, chairFrameM, tx, 0.22, tz, cg);
        }
        cyl(0.065, 0.08, 0.14, chairFrameM, -0.14, 0.55, 1.62, cg); // กาดริปกาแฟ
        cyl(0.038, 0.035, 0.09, coolerRedM, 0.16, 0.52, 1.68, cg); // แก้วมักแคมป์ปิ้ง
        box(0.56, 0.36, 0.38, coolerRedM, -1.05, 0.18, -0.55, cg); // กระติกน้ำแข็งสนาม
        box(0.58, 0.05, 0.4, campPillowM, -1.05, 0.38, -0.55, cg);
        // กองฟืนสำรองข้างเต็นท์
        for (let fw = 0; fw < 3; fw++) {
          cyl(0.055, 0.055, 0.65, logBarkM, 1.05, 0.06 + (fw === 2 ? 0.09 : 0), -0.55 + (fw % 2) * 0.12, cg, 0, Math.PI / 2);
        }

        const fLight = { intensity: 0 };
        window.campLights.push({ group: cg, light: fLight, flame: flame, baseR: LR() * 100 });

        // 3. คนตั้งแคมป์คนที่ 1: นั่งบน "ขอนไม้ใหญ่มีเปลือกและหน้าตัดวงปี" (ไม่นั่งลอยกลางอากาศ)
        const logSeatG = new THREE.Group();
        logSeatG.position.set(1.22, 0, 0.55);
        cg.add(logSeatG);
        // ตัวขอนไม้ใหญ่วางแนวยาว (สูงถึงผิวบน y = 0.41m) พร้อมหน้าตัดเนื้อไม้หัว-ท้ายและลิ่มไม้รองกันกลิ้ง
        cyl(0.2, 0.2, 1.18, logBarkM, 0, 0.21, 0, logSeatG, Math.PI / 2, 0);
        cyl(0.175, 0.175, 1.2, logRingM, 0, 0.21, 0, logSeatG, Math.PI / 2, 0);
        for (const chZ of [-0.38, 0.38]) {
          box(0.46, 0.08, 0.12, logBarkM, 0, 0.04, chZ, logSeatG);
        }

        const p1 = human({ sk: pk(SK), top: pk(BRIGHT), bt: pk(DKP), short: 1, hair: pk(HC), hs: 0, sc: 0.94 });
        p1.g.position.set(1.16, 0, 0.55);
        p1.g.rotation.y = -Math.PI / 2; // หันหน้าเข้าหากองไฟ
        // จัดท่านั่งให้สะโพกวางทับบนผิวบนของขอนไม้ (y = 0.41m) พอดี และปลายเท้าแตะพื้นดิน
        p1.pel.position.y = 0.45;
        p1.tor.rotation.x = 0.12;
        p1.legs[0].h.rotation.x = -1.42;
        p1.legs[1].h.rotation.x = -1.42;
        p1.legs[0].k.rotation.x = 1.42;
        p1.legs[1].k.rotation.x = 1.42;
        p1.arms[0].sh.rotation.x = -0.58;
        p1.arms[1].sh.rotation.x = -0.64;
        p1.arms[0].el.rotation.x = -0.55;
        p1.arms[1].el.rotation.x = -0.72;
        cg.add(p1.g);

        // 4. คนตั้งแคมป์คนที่ 2: นั่งบน "เก้าอี้สนามแคมป์ปิ้งพับได้มีพนักพิงและที่วางแขน" ฝั่งตรงข้ามกองไฟ
        const chairG = new THREE.Group();
        chairG.position.set(-1.22, 0, 0.55);
        chairG.rotation.y = Math.PI / 2; // หันเก้าอี้เข้าหากองไฟ
        cg.add(chairG);

        const cCloth = isGreen ? chairClothM1 : chairClothM2;
        // ขาเก้าอี้เหล็กไขว้ + แผ่นผ้าใบที่นั่ง (สูง y = 0.42m) + พนักพิงหลัง + ที่วางแขนซ้าย-ขวา
        for (const sx of [-0.26, 0.26]) {
          cyl(0.015, 0.015, 0.52, chairFrameM, sx, 0.22, 0, chairG, 0.45, 0);
          cyl(0.015, 0.015, 0.52, chairFrameM, sx, 0.22, 0, chairG, -0.45, 0);
          cyl(0.015, 0.015, 0.54, chairFrameM, sx, 0.66, -0.22, chairG, -0.18, 0);
          box(0.06, 0.025, 0.48, logBarkM, sx, 0.58, 0.02, chairG); // ที่วางแขนไม้
          cyl(0.014, 0.014, 0.22, chairFrameM, sx, 0.48, 0.22, chairG);
        }
        box(0.52, 0.04, 0.48, cCloth, 0, 0.41, 0.02, chairG); // เบาะนั่งผ้าใบ
        const backrest = box(0.52, 0.46, 0.04, cCloth, 0, 0.68, -0.22, chairG); // พนักพิงผ้าใบ
        backrest.rotation.x = -0.18;

        const p2 = human({ sk: pk(SK), top: pk(BRIGHT), bt: pk(DKP), hair: pk(HC), hs: 1, hat: 'cap', sc: 0.94 });
        p2.g.position.set(-1.2, 0, 0.55);
        p2.g.rotation.y = Math.PI / 2; // นั่งบนเก้าอี้สนามหันหน้าเข้าหากองไฟ
        p2.pel.position.y = 0.46; // สะโพกวางแนบบนเบาะเก้าอี้สนามพอดี (ไม่ลอยอากาศ)
        p2.tor.rotation.x = -0.06; // เอนหลังพิงพนักเก้าอี้เล็กน้อยอย่างเป็นธรรมชาติ
        p2.legs[0].h.rotation.x = -1.42;
        p2.legs[1].h.rotation.x = -1.42;
        p2.legs[0].k.rotation.x = 1.42;
        p2.legs[1].k.rotation.x = 1.42;
        p2.arms[0].sh.rotation.x = -0.55;
        p2.arms[1].sh.rotation.x = -0.55;
        p2.arms[0].el.rotation.x = -0.45;
        p2.arms[1].el.rotation.x = -0.45;
        cg.add(p2.g);
      }
      /* --- จบโค้ด: แคมป์ปิ้ง --- */


      
      for (const h of crowd)
        if (h.mode !== 'walk') {
          h.g.position.set(h.x, h.yBase !== undefined ? h.yBase : h.mode === 'work' ? 0.04 : h.mode === 'fish' ? 0.08 : 0, h.z);
          h.g.rotation.y = h.yaw;
        }

      /* ============================================================================
       * src/scene/38-life/08-birds.js
       * นกริมหนองน้ำและฝูงนกบิน
       * (ไฟล์นี้ถูกต่อรวมเป็น closure เดียวกับไฟล์อื่น — ไม่ต้อง import/export · ลำดับไฟล์ดู build.config.mjs)
       * ========================================================================== */

      /* นก */
      function bird(stand) {
        const g = new THREE.Group(),
          w = mt(0xf6f3ea),
          y = mt(0xe9a93a),
          dk = mt(0x4a4036);
        g.userData = { selfCulled: true };
        if (stand) {
          bl(g, w, 0.17, 0, 0.62, 0, 0.8, 0.9, 1.5);
          const nk = lb(g, w, 0.028, 0.42, 0, 1.02, 0.2);
          nk.rotation.x = 0.25;
          bl(g, w, 0.05, 0, 1.04, 0.26, 0.9, 0.9, 1.2);
          cn(g, y, 0.018, 0.14, 0, 1.02, 0.4).rotation.x = Math.PI / 2;
          for (const s of [-1, 1]) cyl(0.012, 0.012, 0.62, dk, s * 0.05, 0.31, -0.02, g);
          g.userData.nk = nk;
          g.scale.setScalar(1.3);
        } else {
          bl(g, w, 0.14, 0, 0, 0, 0.8, 0.75, 1.6);
          const nk = lb(g, w, 0.026, 0.3, 0, 0.04, 0.28);
          nk.rotation.x = -1.35;
          bl(g, w, 0.045, 0, 0.02, 0.5, 0.9, 0.9, 1.2);
          cn(g, y, 0.016, 0.14, 0, 0.0, 0.6).rotation.x = Math.PI / 2;
          for (const s of [-1, 1]) {
            const wg = new THREE.Group();
            wg.position.set(s * 0.08, 0.05, 0);
            const wp = box(0.7, 0.02, 0.3, w, s * 0.36, 0, 0, wg);
            wp.castShadow = false;
            g.add(wg);
            g.userData[s < 0 ? 'wl' : 'wr'] = wg;
            cyl(0.008, 0.008, 0.35, dk, s * 0.04, 0, -0.38, g, 1.4, 0);
          }
          g.scale.setScalar(1.5);
        }
        scene.add(g);
        return g;
      }
      const fl = [],
        stand = [],
        flock = [];
      for (const p of PD) {
        for (let k = 0; k < 3; k++) {
          const b = bird(1);
          b.position.set(p.x + (LR() - 0.5) * p.rx * 1.1, 0.03, p.z + (LR() - 0.5) * p.rz * 1.1);
          b.rotation.y = LR() * 6;
          b.userData.ph = LR() * 6;
          stand.push(b);
        }
        for (let k = 0; k < 6; k++)
          fl.push({
            b: bird(0),
            p,
            R: p.rx * (1.15 + LR() * 1.2) + 4,
            alt: 6 + LR() * 9,
            sp: (0.3 + LR() * 0.25) * (LR() < 0.5 ? -1 : 1),
            ph: LR() * 6,
            style: k % 3 // 0: บินวนร่อน, 1: บินเลขแปด (Figure-8), 2: บินโฉบขึ้นลงเหนือผิวน้ำ
          });
      }
      for (let k = 0; k < 7; k++) flock.push(bird(0));
      const FO = [
        [0, 0],
        [-2.6, 2.2],
        [2.6, 2.2],
        [-5.2, 4.4],
        [5.2, 4.4],
        [-7.8, 6.6],
        [7.8, 6.6]
      ];
      let fph = 0,
        tt = 0;
      const hp = new V3();

      /* ============================================================================
       * src/scene/38-life/09-update-loop.js
       * ฟังก์ชันอัปเดต LIFE ทุกเฟรม — ถูก frame() เรียกใช้
       * (ไฟล์นี้ถูกต่อรวมเป็น closure เดียวกับไฟล์อื่น — ไม่ต้อง import/export · ลำดับไฟล์ดู build.config.mjs)
       * ========================================================================== */

      const _cWhite = new THREE.Color(1, 1, 1),
        _cWaterTint = new THREE.Color(0x0284c7),
        _lifeFwd = new THREE.Vector3();
      return function (dt) {
        tt += dt;
        const nF = WXR.nF || 0,
          day = nF < 0.6,
          rain = WXR.rain > 0.25 || (WXR.tod > 10 && WXR.tod < 16 && WXR.cover < 0.4);
        if (WXR.hor) {
          mistM.color.copy(WXR.hor).lerp(_cWhite, 0.2);
          mistM.opacity = cl(0.38 + WXR.fog * 0.4 + (WXR.tod < 10 ? 0.18 : 0) - WXR.cover * 0.08, 0.25, 0.85);
          waterM.color.copy(WXR.hor).lerp(_cWaterTint, 0.85);
        }
        camera.getWorldDirection(_lifeFwd);
        const fX = _lifeFwd.x,
          fZ = _lifeFwd.z,
          cX = car.position.x,
          cZ = car.position.z,
          carWorldSp = (((speedMul * KMH) / 3600) * ARCJ) / KM_TOTAL,
          baseWalkSp = state.reduced ? 0 : Math.min(0.16, carWorldSp * 0.085);
        for (const v of vendors)
          if (v.armR) {
            const dx = v.g.position.x - cX,
              dz = v.g.position.z - cZ;
            v.armR.rotation.x = dx * dx + dz * dz < 120 ? -1.2 + Math.sin(tt * 3.5) * 0.28 : 0;
            v.armR.rotation.z = dx * dx + dz * dz < 120 ? Math.cos(tt * 3.5) * 0.16 : 0;
          }
        const curT = state.routeT,
          inWindingZone = curT <= 0.56 || curT >= 0.92;
        for (const h of crowd) {
          const wk = h.mode === 'walk',
            fwk = h.mode === 'fair_walk';
          // ในช่วงจันจว้า-เวียงแก่น (ถนนคดเคี้ยวซ้อนกันในพื้นที่แคบ) ซ่อนคนที่อยู่คนละช่วงโค้งถนนทันทีเพื่อประหยัด CPU/GPU
          if (inWindingZone && h.t0 > 0 && (h.t0 <= 0.56 || h.t0 >= 0.92)) {
            let dtR = Math.abs((wk ? h.t : h.t0) - curT);
            if (dtR > 0.5) dtR = 1 - dtR;
            if (dtR > 0.088) {
              h.g.visible = false;
              continue;
            }
          }
          if (wk) {
            const hdx = h.x0 - cX,
              hdz = h.z0 - cZ;
            if (hdx * hdx + hdz * hdz > 4900) {
              h.g.visible = false;
              continue;
            }
            const ds = h.ds || 350,
              walkSp = baseWalkSp * (h.run ? 2.15 : h.v / 0.45);
            h.dist += h.dir * walkSp * dt;
            if (h.dist > h.span) {
              h.dist = h.span;
              h.dir = -1;
            } else if (h.dist < -h.span) {
              h.dist = -h.span;
              h.dir = 1;
            }
            h.t = (((h.t0 + h.dist / ds) % 1) + 1) % 1;
            const pc = route.getPoint(h.t),
              tn = route.getTangent(h.t);
            n0.set(-tn.z, 0, tn.x);
            h.g.position.copy(pc).addScaledVector(n0, h.off);
            const tgtTurn = h.dir > 0 ? 0 : Math.PI;
            h.turn += (tgtTurn - h.turn) * Math.min(1, dt * (h.run ? 10 : 6));
            h.g.rotation.y = Math.atan2(tn.x, tn.z) + h.turn;
          } else if (fwk) {
            const walkSp = baseWalkSp * (h.v / 0.45);
            h.u += h.dir * (walkSp / h.segLen) * dt;
            if (h.u >= 1) {
              h.u = 1;
              h.dir = -1;
            } else if (h.u <= 0) {
              h.u = 0;
              h.dir = 1;
            }
            h.g.position.x = h.ax + (h.bx - h.ax) * h.u;
            h.g.position.z = h.az + (h.bz - h.az) * h.u;
            const tgtTurn = h.dir > 0 ? 0 : Math.PI;
            h.turn += (tgtTurn - h.turn) * Math.min(1, dt * 6);
            h.g.rotation.y = h.baseYaw + h.turn;
          }
          const dx = h.g.position.x - cX,
            dz = h.g.position.z - cZ,
            d2 = dx * dx + dz * dz,
            dot = dx * fX + dz * fZ;
          const lim = dot > -22 ? (h.g.visible ? 3844 : 3481) : 1225, // ด้านหน้า 59-62m, ด้านหลัง 35m
            far = d2 > lim,
            hid = (state.night || nF > 0.5) && (h.hideAtNight || h.nt > 0.15),
            hotspotLod =
              nearPerformanceHotspot &&
              (h.hotspotType === 'temple' || h.hotspotType === 'school') &&
              d2 > 32 * 32 &&
              h.hotspotIndex % 2 === 0;
          h.g.visible = !far && !hid && !hotspotLod;
          if (!h.g.visible) continue;
          if ((wk || fwk || h.mode === 'talk') && !h.at && totalTime > h.cool && d2 < (wk || fwk ? 70 : 100)) {
            h.cool = totalTime + 28;
            h.at = totalTime + h.dly;
          }
          if (
            h.at &&
            totalTime >= h.at &&
            say(
              h,
              Math.random() < 0.65
                ? nextEncouragement()
                : TALK[h.k % TALK.length][Math.floor(Math.random() * 3)],
              1.85 * h.sc + 0.35,
              3.6
            )
          )
            h.at = 0;
          h.ph += dt * (h.run ? 5.1 : 1.15 + h.v * 1.35);
          const s = Math.sin(h.ph),
            c = Math.cos(h.ph),
            am = h.run ? 0.64 : h.skirt ? 0.24 : 0.32;
          if (wk || fwk) {
            h.legs[0].h.rotation.x = -s * am + (h.run ? -0.08 : 0);
            h.legs[1].h.rotation.x = s * am + (h.run ? -0.08 : 0);
            h.legs[0].k.rotation.x = (h.run ? (0.55 + 0.45 * Math.max(0, c)) * 1.15 : Math.max(0, c) * (h.skirt ? 0.5 : 0.75)) * am * 1.2;
            h.legs[1].k.rotation.x = (h.run ? (0.55 + 0.45 * Math.max(0, -c)) * 1.15 : Math.max(0, -c) * (h.skirt ? 0.5 : 0.75)) * am * 1.2;
            h.arms[0].sh.rotation.x = s * am * (h.run ? 1.05 : 0.75) - (h.run ? 0.12 : 0);
            h.arms[0].sh.rotation.z = h.run ? 0.08 : 0;
            h.arms[1].sh.rotation.x = -s * am * (h.run ? 1.05 : 0.75) - (h.run ? 0.12 : 0);
            h.arms[1].sh.rotation.z = h.run ? -0.08 : 0;
            h.arms[0].el.rotation.x = h.run ? -1.32 - c * 0.22 : -0.22 - Math.max(0, -s) * 0.18;
            h.arms[1].el.rotation.x = h.run ? -1.32 + c * 0.22 : -0.22 - Math.max(0, s) * 0.18;
            h.pel.position.y = 0.93 + (h.run ? Math.abs(s) * 0.055 - 0.015 : Math.abs(s) * 0.018);
            h.tor.rotation.y = s * (h.run ? 0.12 : 0.05);
            h.tor.rotation.x = h.run ? 0.16 + Math.cos(h.ph * 2) * 0.025 : h.hasCane ? 0.06 : 0.02;
            h.hd.rotation.y =
              d2 < 85 ? cl(Math.sin(Math.atan2(-dx, -dz) - h.g.rotation.y), -0.45, 0.45) : -s * 0.04;
            h.hd.rotation.x = Math.cos(h.ph * 2) * (h.run ? 0.032 : 0.018);
          } else if (h.mode === 'sit_monk') {
            // ท่าพระสงฆ์นั่งขัดสมาธิบนอาสนะ พนมมือเจริญพระพุทธมนต์/ให้พร
            const motion = state.reduced ? 0 : 1,
              chant = Math.sin(tt * 1.35 + h.ph) * motion;
            h.pel.position.y = 0.24;
            h.legs[0].h.rotation.set(-1.42, 0.45, 0.55);
            h.legs[1].h.rotation.set(-1.42, -0.45, -0.55);
            h.legs[0].k.rotation.x = 2.15;
            h.legs[1].k.rotation.x = 2.15;
            h.tor.rotation.set(0.04 + chant * 0.025, Math.sin(tt * 0.55 + h.ph) * 0.035 * motion, 0);
            h.hd.rotation.set(0.06 + chant * 0.035, Math.sin(tt * 0.7 + h.ph) * 0.055 * motion, 0);
            h.arms[0].sh.rotation.set(-0.62, 0.25, -0.28);
            h.arms[0].el.rotation.set(-1.15, 0, -0.25);
            h.arms[1].sh.rotation.set(-0.62, -0.25, 0.28);
            h.arms[1].el.rotation.set(-1.15, 0, 0.25);
          } else if (h.mode === 'sit_wai') {
            // ท่าญาติโยมนั่งพับเพียบพนมมือไหว้พระและก้มกราบรับพรเป็นจังหวะนุ่มนวล
            const motion = state.reduced ? 0 : 1,
              bow = Math.max(0, Math.sin(tt * 0.85 + h.ph)) * 0.16 * motion;
            h.pel.position.y = 0.23;
            h.legs[0].h.rotation.set(-1.45, 0.35, 0.42);
            h.legs[0].k.rotation.x = 2.25;
            h.legs[1].h.rotation.set(-1.45, 0.25, 0.12);
            h.legs[1].k.rotation.x = 2.25;
            h.tor.rotation.set(0.1 + bow, Math.sin(tt * 0.6 + h.ph) * 0.03 * motion, 0);
            h.hd.rotation.set(0.12 + bow * 0.8, Math.sin(tt * 0.75 + h.ph) * 0.04 * motion, 0);
            h.arms[0].sh.rotation.set(-0.72 - bow * 0.2, 0.28, -0.32);
            h.arms[0].el.rotation.set(-1.28, 0, -0.28);
            h.arms[1].sh.rotation.set(-0.72 - bow * 0.2, -0.28, 0.32);
            h.arms[1].el.rotation.set(-1.28, 0, 0.28);
          } else if (h.mode === 'castnet') {
            // ท่าคนทอดแหและสาวแหขึ้นจากแม่น้ำเป็นจังหวะสมูท
            const cyc = (tt * 0.55 + h.ph) % (Math.PI * 2),
              castWave = Math.sin(cyc);
            h.tor.rotation.x = 0.22 + Math.max(0, castWave) * 0.28;
            h.tor.rotation.y = Math.cos(cyc) * 0.32;
            h.arms[0].sh.rotation.x = -0.75 - castWave * 0.45;
            h.arms[0].el.rotation.x = -0.55;
            h.arms[1].sh.rotation.x = -0.85 + castWave * 0.55;
            h.arms[1].el.rotation.x = -0.65;
            if (h.castNetG) {
              const spread = 0.65 + 0.42 * Math.max(0, castWave);
              h.castNetG.scale.set(spread, 1.15 - spread * 0.25, spread);
              h.castNetG.position.z = 1.65 + spread * 0.85;
            }
            if (h.splashRing) {
              const ripScale = Math.max(0.1, 0.7 + ((tt * 0.65 + h.ph) % 1) * 0.75);
              h.splashRing.scale.setScalar(ripScale);
            }
          } else if (h.mode === 'work') {
            h.tor.rotation.x = 0.85 + Math.sin(tt * 1.2 + h.ph) * 0.18;
            for (const a of h.arms) {
              a.sh.rotation.x = -0.65 + Math.sin(tt * 2.4 + h.ph) * 0.25;
              a.el.rotation.x = -0.4;
            }
            h.legs[0].h.rotation.x = -0.2;
            h.legs[1].h.rotation.x = -0.2;
            h.legs[0].k.rotation.x = 0.32;
            h.legs[1].k.rotation.x = 0.32;
          } else if (h.mode === 'talk') {
            const motion = state.reduced ? 0 : 1,
              gesture = Math.sin(tt * 2.2 + h.ph);
            h.pel.position.y = 0.93 + Math.sin(tt * 1.7 + h.ph) * 0.009 * motion;
            h.tor.rotation.x = (h.hasCane ? 0.05 : 0) + Math.sin(tt * 1.3 + h.ph) * 0.035 * motion;
            h.tor.rotation.y = Math.sin(tt * 0.8 + h.ph) * 0.055 * motion;
            h.arms[0].sh.rotation.x = -0.15 + Math.max(0, gesture) * 0.48 * motion;
            h.arms[0].sh.rotation.z = 0;
            h.arms[0].el.rotation.x = -0.48 - Math.max(0, gesture) * 0.18 * motion;
            h.arms[1].sh.rotation.x = -0.15 + Math.max(0, -gesture) * 0.38 * motion;
            h.arms[1].sh.rotation.z = 0;
            h.arms[1].el.rotation.x = -0.42;
            h.hd.rotation.y = Math.sin(tt * 1.15 + h.ph) * 0.12 * motion;
            if (d2 < 110)
              h.hd.rotation.y += cl(Math.sin(Math.atan2(-dx, -dz) - h.g.rotation.y), -0.45, 0.45) * 0.35;
          } else {
            h.tor.rotation.y = Math.sin(tt * 0.4 + h.ph) * 0.08;
            h.arms[1].sh.rotation.x = -0.9;
            h.arms[1].el.rotation.x = -0.55;
            h.hd.rotation.y = Math.sin(tt * 0.5 + h.ph) * 0.12;
          }
          // จัดท่ามือจับสิ่งของ (คานหาบ / จอบ / คันเบ็ด / บาตรพระ / ไม้เท้า / ร่ม) ให้ตรงกับของในมือเสมอ
          if (h.pose === 'pole' || h.pose === 'carryR') {
            h.arms[1].sh.rotation.x = -0.74 + s * 0.03;
            h.arms[1].sh.rotation.z = 0;
            h.arms[1].el.rotation.x = -1.1;
            if (h.carryG) {
              h.carryG.rotation.x = -(h.arms[1].sh.rotation.x + h.arms[1].el.rotation.x);
            }
          } else if (h.pose === 'bowl') {
            for (const a of h.arms) {
              a.sh.rotation.x = -0.42;
              a.sh.rotation.z = -a.s * 0.24;
              a.el.rotation.x = -0.82;
            }
          }
          if (h.hasCane) {
            const cSwing = wk ? s * 0.07 : 0;
            h.arms[1].sh.rotation.x = -0.34 + cSwing;
            h.arms[1].sh.rotation.z = 0;
            h.arms[1].el.rotation.x = -0.24;
            h.caneG.rotation.x = -(h.arms[1].sh.rotation.x + h.arms[1].el.rotation.x + h.tor.rotation.x);
          }
          if (h.umb) {
            h.umb.visible = rain;
            if (rain && h.umbArm) {
              h.umbArm.sh.rotation.x = -0.36;
              h.umbArm.sh.rotation.z = 0;
              h.umbArm.el.rotation.x = -1.2;
              h.umb.rotation.x = -(h.umbArm.sh.rotation.x + h.umbArm.el.rotation.x + h.tor.rotation.x) - 0.2;
              h.umb.rotation.z = h.umbSide * 0.22;
            }
          }
        }
        const bv = day;
        for (const f of fl) {
          f.b.visible = bv;
          if (!bv) continue;
          f.ph += dt * f.sp;
          const a = f.ph,
            p = f.p,
            sg = Math.sign(f.sp);
          if (f.style === 1) {
            // บินวนเป็นเลขแปด (Figure-8)
            const bx = p.x + Math.sin(a) * f.R * 1.15,
              bz = p.z + Math.sin(a * 2) * f.R * 0.65,
              vx = Math.cos(a) * f.R * 1.15 * sg,
              vz = Math.cos(a * 2) * 2 * f.R * 0.65 * sg;
            f.b.position.set(bx, f.alt + Math.cos(a * 2) * 0.9, bz);
            f.b.rotation.y = Math.atan2(vx, vz);
            f.b.rotation.z = -Math.sin(a * 2) * 0.28 * sg;
          } else if (f.style === 2) {
            // บินโฉบขึ้น-ลงเหนือผิวน้ำ
            const swoop = Math.sin(a * 1.5);
            f.b.position.set(
              p.x + Math.cos(a) * f.R,
              Math.max(2.2, f.alt - 2.2 + swoop * 2.8),
              p.z + Math.sin(a) * f.R * 0.85
            );
            f.b.rotation.y = Math.atan2(-Math.sin(a) * sg, 0.85 * Math.cos(a) * sg);
            f.b.rotation.z = -0.22 * sg;
            f.b.rotation.x = -Math.cos(a * 1.5) * 0.18;
          } else {
            // บินร่อนเป็นวงรีพร้อมสลับกระพือปีกและร่อนรับลม
            f.b.position.set(
              p.x + Math.cos(a) * f.R,
              f.alt + Math.sin(a * 2) * 0.6,
              p.z + Math.sin(a) * f.R * 0.8
            );
            f.b.rotation.y = Math.atan2(-Math.sin(a) * sg, 0.8 * Math.cos(a) * sg);
            f.b.rotation.z = -0.25 * sg;
          }
          const glide = Math.sin(tt * 1.6 + a * 2) > 0.35 ? 0.14 : 1,
            fp = Math.sin(tt * 8.5 + a * 3) * 0.58 * glide + (1 - glide) * 0.12,
            u = f.b.userData;
          u.wl.rotation.z = fp;
          u.wr.rotation.z = -fp;
        }
        for (const b of stand) {
          b.visible = bv;
          if (bv) b.userData.nk.rotation.x = 0.25 + Math.max(0, Math.sin(tt * 0.5 + b.userData.ph * 3)) * 0.9;
        }
        fph += dt * 0.1;
        const a = fph,
          cx = 150 + Math.cos(a) * 120,
          cz = 40 + Math.sin(a) * 95,
          yw = Math.atan2(-Math.sin(a), 0.8 * Math.cos(a)),
          sy = Math.sin(yw),
          cy = Math.cos(yw);
        flock.forEach((b, i) => {
          b.visible = bv;
          if (!bv) return;
          const o = FO[i];
          b.position.set(
            cx + cy * o[0] - sy * o[1],
            24 + Math.sin(tt + i) * 0.5,
            cz - sy * o[0] + cy * -o[1]
          );
          b.rotation.y = yw;
          const fp = Math.sin(tt * 7 + i * 0.7) * 0.6,
            u = b.userData;
          u.wl.rotation.z = fp;
          u.wr.rotation.z = -fp;
        });
        if (typeof coconutWetlandUpdate === 'function') {
          coconutWetlandUpdate(dt, tt, cX, cZ);
        }
      };
    })();

    /* ============================================================================
     * src/scene/39-veg-hook.js
     * ตัวแปร vegUpdate (hook) ที่ frame() เรียก — ค่าจริงถูกกำหนดใน 40-veg/05
     * (ไฟล์นี้ถูกต่อรวมเป็น closure เดียวกับไฟล์อื่น — ไม่ต้อง import/export · ลำดับไฟล์ดู build.config.mjs)
     * ========================================================================== */

    /* ===== VEG: หญ้า · ต้นข้าว · ดอกไม้ แบบละเอียด พลิ้วตามลม และรับแสงเงาตามสภาพอากาศ ===== */
    let vegUpdate = () => {};

    try {
      /* ============================================================================
       * src/scene/40-veg/01-geometry-builders.js
       * วัสดุหญ้าพลิ้วตามลม และตัวสร้างเรขาคณิตใบหญ้า/ใบข้าว/รวง/ดอกไม้ (vBlade, vEar, vGrassGeo, vFlowerGeo)
       * (ไฟล์นี้ถูกต่อรวมเป็น closure เดียวกับไฟล์อื่น — ไม่ต้อง import/export · ลำดับไฟล์ดู build.config.mjs)
       * ========================================================================== */

      const VEG = {
          t: { value: 0 },
          w: { value: 0.25 },
          g: { value: 0 },
          sc: { value: new THREE.Color(1, 0.85, 0.6) }
        },
        VMG = [],
        VMF = [];
      function vegMat(sw, list, r0) {
        const m = new THREE.MeshLambertMaterial({ // เปลี่ยนเป็น Lambert ลดภาระ CPU/GPU
          vertexColors: true,
          side: THREE.DoubleSide
        });
        m.userData.r0 = r0;
        m.onBeforeCompile = sh => {
          sh.uniforms.uT = VEG.t;
          sh.uniforms.uW = VEG.w;
          sh.uniforms.uG = VEG.g;
          sh.uniforms.uSC = VEG.sc;
          sh.uniforms.uSw = { value: sw };
          sh.vertexShader = sh.vertexShader
            .replace('#include <common>', '#include <common>\nuniform float uT,uW,uSw;\nvarying float vH;')
            .replace(
              '#include <begin_vertex>',
              'vec3 transformed=vec3(position);\nvH=clamp(position.y,0.,1.);\n#ifdef USE_INSTANCING\nvec4 vip=instanceMatrix*vec4(0.,0.,0.,1.);\n#else\nvec4 vip=vec4(0.);\n#endif\nfloat vph=vip.x*.62+vip.z*.83;\nfloat vbd=position.y*position.y*uW*uSw;\ntransformed.x+=(sin(uT*1.7+vph)+.45*sin(uT*3.1+vph*1.7))*vbd*.55;\ntransformed.z+=cos(uT*1.35+vph*1.2)*vbd*.38;'
            );
          sh.fragmentShader = sh.fragmentShader
            .replace(
              '#include <common>',
              '#include <common>\nuniform float uG;\nuniform vec3 uSC;\nvarying float vH;'
            )
            .replace(
              '#include <normal_fragment_begin>',
              THREE.ShaderChunk.normal_fragment_begin.replace('gl_FrontFacing ? 1.0 : - 1.0', '1.0')
            )
            .replace(
              '#include <opaque_fragment>',
              'outgoingLight+=uSC*uG*vH*vH*.55;\n#include <opaque_fragment>'
            );
        };
        list.push(m);
        return m;
      }
      function vMkR(s) {
        return () => {
          s = (s * 16807) % 2147483647;
          return (s - 1) / 2147483646;
        };
      }
      const vc = new THREE.Color();
      function VT(B, a, b, c) {
        for (const v of [a, b, c]) {
          B.P.push(v[0], v[1], v[2]);
          B.N.push(v[3], v[4], v[5]);
          B.C.push(v[6], v[7], v[8]);
        }
      }
      function VQ(B, a, b, c, d) {
        VT(B, a, b, c);
        VT(B, a, c, d);
      }
      function vGeo(B) {
        const g = new THREE.BufferGeometry();
        g.setAttribute('position', new THREE.Float32BufferAttribute(B.P, 3));
        g.setAttribute('normal', new THREE.Float32BufferAttribute(B.N, 3));
        g.setAttribute('color', new THREE.Float32BufferAttribute(B.C, 3));
        return g;
      }
      /* ใบหญ้า/ใบข้าว 1 ใบ: แถบเรียวโค้งงอ ไล่สีโคนเข้ม → ปลายสว่าง */
      function vBlade(B, x, z, h, w, yaw, lean, c0, c1, sh, S, dr) {
        const wx = Math.cos(yaw),
          wz = Math.sin(yaw),
          lx = -wz,
          lz = wx;
        let prev = null,
          tip = [x, h, z];
        for (let i = 0; i <= S; i++) {
          const u = i / S,
            bd = lean * u * u * h,
            yy = h * (u - dr * Math.pow(Math.max(0, u - 0.55), 2) * 2.4),
            ww = i === S ? 0 : w * 0.5 * (1 - Math.pow(u, 1.7) * 0.8),
            px = x + lx * bd,
            pz = z + lz * bd;
          let nx = x * 0.9 + lx * 0.5 * u,
            nz = z * 0.9 + lz * 0.5 * u;
          const q = Math.hypot(nx, 1, nz);
          nx /= q;
          nz /= q;
          const ny = 1 / q;
          vc.copy(c0).lerp(c1, Math.pow(u, 0.8)).multiplyScalar(sh);
          const L = [px - wx * ww, yy, pz - wz * ww, nx, ny, nz, vc.r, vc.g, vc.b],
            R = [px + wx * ww, yy, pz + wz * ww, nx, ny, nz, vc.r, vc.g, vc.b];
          if (prev) VQ(B, prev[0], prev[1], R, L);
          prev = [L, R];
          tip = [px, yy, pz];
        }
        return tip;
      }
      /* รวงข้าว / รวงหญ้า: แถบไขว้ 2 ชั้น */
      function vEar(B, x, y, z, len, w, dx, dz, kx, ky, kd, c0, c1, S) {
        const ax = -dz,
          az = dx;
        for (let pass = 0; pass < 2; pass++) {
          let prev = null;
          for (let i = 0; i <= S; i++) {
            const u = i / S,
              px = x + dx * u * len * kx,
              py = y + len * (ky * u - kd * u * u),
              pz = z + dz * u * len * kx,
              ww = i === S ? 0 : w * 0.5 * Math.sin(Math.PI * Math.min(1, u * 0.9 + 0.12));
            vc.copy(c0).lerp(c1, u);
            const wxv = pass ? 0 : ax,
              wzv = pass ? 0 : az,
              wyv = pass ? 1 : 0,
              L = [px - wxv * ww, py - wyv * ww, pz - wzv * ww, 0, 1, 0, vc.r, vc.g, vc.b],
              R = [px + wxv * ww, py + wyv * ww, pz + wzv * ww, 0, 1, 0, vc.r, vc.g, vc.b];
            if (prev) VQ(B, prev[0], prev[1], R, L);
            prev = [L, R];
          }
        }
      }
      function vGrassGeo(R, o) {
        const B = { P: [], N: [], C: [] };
        for (let i = 0; i < o.n; i++) {
          const a = R() * 6.283,
            d = Math.sqrt(R()) * o.sp,
            h = o.h0 + R() * (1 - o.h0),
            yaw = a - 1.5708 + (R() - 0.5) * 0.9,
            lean = (0.15 + R() * 0.6) * o.lean,
            tip = vBlade(
              B,
              Math.cos(a) * d,
              Math.sin(a) * d,
              h,
              o.w * (0.8 + R() * 0.5),
              yaw,
              lean,
              o.c0,
              o.c1,
              0.85 + R() * 0.3,
              o.S,
              o.dr || 0
            );
          if (o.ear && R() < o.ear)
            vEar(
              B,
              tip[0],
              tip[1] - 0.02,
              tip[2],
              o.el,
              o.ew,
              Math.cos(a),
              Math.sin(a),
              o.ekx,
              o.eky,
              o.ekd,
              o.e0,
              o.e1,
              2
            );
        }
        return vGeo(B);
      }
      /* ดอกไม้ 1 ต้น: ก้าน ใบโคน กลีบเรียงรอบ เกสร */
      function vFlowerGeo(R, o) {
        const B = { P: [], N: [], C: [] },
          sg0 = new THREE.Color(0x3b7433),
          sg1 = new THREE.Color(0x66a345),
          H = o.stem;
        const tipS = vBlade(B, 0, 0, H, 0.035, 0, 0.1, sg0, sg1, 1, 2, 0);
        vBlade(B, 0, 0, H, 0.035, 1.5708, 0.1, sg0, sg1, 1, 2, 0);
        for (let k = 0; k < 3; k++) {
          const a = k * 2.094 + R() * 0.5;
          vBlade(
            B,
            Math.cos(a) * 0.015,
            Math.sin(a) * 0.015,
            0.15 + R() * 0.08,
            0.075,
            a - 1.5708,
            1.1,
            sg0,
            sg1,
            1,
            2,
            0
          );
        }
        const cx = tipS[0],
          cy = tipS[1],
          cz = tipS[2],
          cB = new THREE.Color(o.c).multiplyScalar(0.78),
          cM = new THREE.Color(o.c),
          cT = new THREE.Color(o.c2 || o.c),
          cc = new THREE.Color(o.cen);
        for (let ly = 0; ly < (o.layers || 1); ly++)
          for (let k = 0; k < o.n; k++) {
            const ang = (k / o.n) * 6.283 + (ly * 3.1416) / o.n + R() * 0.1,
              dx = Math.cos(ang),
              dz = Math.sin(ang),
              tx = -dz,
              tz = dx,
              tl = o.tilt * (1 + ly * 0.5),
              L = o.L * (1 - ly * 0.18),
              Wd = o.W * (1 - ly * 0.1),
              yo = ly * 0.006;
            const nn = Math.hypot(tl, 1),
              n = [(-tl * dx) / nn, 1 / nn, (-tl * dz) / nn];
            const P = (r, t, c) => [
              cx + dx * r + tx * t,
              cy + yo + r * tl,
              cz + dz * r + tz * t,
              n[0],
              n[1],
              n[2],
              c.r,
              c.g,
              c.b
            ];
            const b0 = P(0.004, 0, cB),
              l0 = P(L * 0.5, -Wd, cM),
              r0 = P(L * 0.5, Wd, cM),
              t0 = P(L, 0, cT);
            VT(B, b0, l0, r0);
            VT(B, l0, t0, r0);
          }
        const ctr = [cx, cy + 0.016, cz, 0, 1, 0, cc.r, cc.g, cc.b];
        vc.copy(cc).multiplyScalar(0.7);
        for (let k = 0; k < 8; k++) {
          const a0 = (k / 8) * 6.283,
            a1 = ((k + 1) / 8) * 6.283;
          VT(
            B,
            ctr,
            [cx + Math.cos(a0) * o.cr, cy + 0.008, cz + Math.sin(a0) * o.cr, 0, 1, 0, vc.r, vc.g, vc.b],
            [cx + Math.cos(a1) * o.cr, cy + 0.008, cz + Math.sin(a1) * o.cr, 0, 1, 0, vc.r, vc.g, vc.b]
          );
        }
        return vGeo(B);
      }
      const vrn = vMkR(9157),
        vTint = () => new THREE.Color().setRGB(0.82 + vrn() * 0.22, 0.88 + vrn() * 0.16, 0.72 + vrn() * 0.26),
        vWhite = new THREE.Color(1, 1, 1);
      function vMesh(geo, mat, arr, cull) {
        if (!arr.length) return null;
        const im = new THREE.InstancedMesh(geo, mat, arr.length),
          D = new THREE.Object3D();
        arr.forEach((q, i) => {
          D.position.set(q.x, q.y === undefined ? -0.09 : q.y, q.z);
          D.rotation.set(q.rx || 0, q.ry || 0, q.rz || 0);
          D.scale.set(q.sx, q.sy, q.sz);
          D.updateMatrix();
          im.setMatrixAt(i, D.matrix);
          im.setColorAt(i, q.c || vWhite);
        });
        im.instanceMatrix.needsUpdate = true;
        if (im.instanceColor) im.instanceColor.needsUpdate = true;
        im.receiveShadow = true;
        im.castShadow = false;
        if (cull) im.computeBoundingSphere();
        else im.frustumCulled = false;
        return im;
      }
      const vMG = vegMat(1, VMG, 0.85),
        vMF = vegMat(2.6, VMF, 0.7);

      /* ============================================================================
       * src/scene/40-veg/02-grass-flower-types.js
       * ชนิดหญ้า ข้าว และดอกไม้ที่ใช้ในฉาก (gLawn, gTall, gRiceG, FT ...)
       * (ไฟล์นี้ถูกต่อรวมเป็น closure เดียวกับไฟล์อื่น — ไม่ต้อง import/export · ลำดับไฟล์ดู build.config.mjs)
       * ========================================================================== */

      const gLawn = vGrassGeo(vMkR(11), {
          n: 7,
          sp: 0.3,
          h0: 0.45,
          w: 0.07,
          lean: 0.6,
          S: 2,
          c0: new THREE.Color(0x2c5a2a),
          c1: new THREE.Color(0x8fc650)
        }),
        gTall = vGrassGeo(vMkR(23), {
          n: 8,
          sp: 0.34,
          h0: 0.5,
          w: 0.06,
          lean: 0.65,
          S: 3,
          c0: new THREE.Color(0x336a2f),
          c1: new THREE.Color(0xa9d46a)
        }),
        gSeed = vGrassGeo(vMkR(37), {
          n: 8,
          sp: 0.32,
          h0: 0.55,
          w: 0.055,
          lean: 0.55,
          S: 3,
          c0: new THREE.Color(0x56723a),
          c1: new THREE.Color(0xd5c571),
          ear: 0.6,
          el: 0.3,
          ew: 0.07,
          ekx: 0.12,
          eky: 1,
          ekd: 0.05,
          e0: new THREE.Color(0xb8a24a),
          e1: new THREE.Color(0xf1e4a0)
        }),
        gRiceG = vGrassGeo(vMkR(41), {
          n: 7,
          sp: 0.5,
          h0: 0.7,
          w: 0.11,
          lean: 0.55,
          S: 2,
          dr: 0.3,
          c0: new THREE.Color(0x3b7a2c),
          c1: new THREE.Color(0x96c84c)
        }),
        gRiceR = vGrassGeo(vMkR(43), {
          n: 7,
          sp: 0.5,
          h0: 0.7,
          w: 0.11,
          lean: 0.55,
          S: 2,
          dr: 0.5,
          c0: new THREE.Color(0x7b9a3a),
          c1: new THREE.Color(0xdcc25c),
          ear: 0.4,
          el: 0.26,
          ew: 0.08,
          ekx: 0.9,
          eky: 0.5,
          ekd: 1.2,
          e0: new THREE.Color(0xc9a63f),
          e1: new THREE.Color(0xf0d97a)
        }),
        gStub = vGrassGeo(vMkR(47), {
          n: 5,
          sp: 0.25,
          h0: 0.6,
          w: 0.08,
          lean: 0.3,
          S: 1,
          c0: new THREE.Color(0x6a5936),
          c1: new THREE.Color(0xb09a5e)
        });
      const FT = [
        {
          n: 13,
          L: 0.1,
          W: 0.028,
          tilt: 0.15,
          c: 0xffffff,
          c2: 0xf3ecd2,
          cen: 0xf2b91d,
          cr: 0.036,
          stem: 0.4
        },
        {
          n: 8,
          L: 0.12,
          W: 0.055,
          tilt: 0.3,
          c: 0xe97fa6,
          c2: 0xf7b6cc,
          cen: 0xf0c23a,
          cr: 0.028,
          stem: 0.55
        },
        {
          n: 5,
          L: 0.09,
          W: 0.06,
          tilt: 0.4,
          c: 0xf5cc2c,
          c2: 0xffe27a,
          cen: 0xe3961b,
          cr: 0.025,
          stem: 0.35
        },
        { n: 7, L: 0.1, W: 0.04, tilt: 0.25, c: 0x8c6ad0, c2: 0xb59ae8, cen: 0xf2d34f, cr: 0.02, stem: 0.5 },
        {
          n: 9,
          L: 0.1,
          W: 0.04,
          tilt: 0.35,
          c: 0xef8a1f,
          c2: 0xf9b84a,
          cen: 0xb85a10,
          cr: 0.03,
          stem: 0.38,
          layers: 2
        },
        { n: 6, L: 0.09, W: 0.05, tilt: 0.35, c: 0xdb4a3b, c2: 0xf07f66, cen: 0x3a2616, cr: 0.02, stem: 0.42 }
      ].map((o, i) => vFlowerGeo(vMkR(101 + i * 7), o));
      const vok = (x, z) => {
        for (const o of taken) {
          const dx = o[0] - x,
            dz = o[1] - z;
          if (dx * dx + dz * dz < o[2] * o[2]) return false;
        }
        return true;
      };

      /* ============================================================================
       * src/scene/40-veg/03-roadside-placement.js
       * การวางหญ้าและดอกไม้ริมทาง
       * (ไฟล์นี้ถูกต่อรวมเป็น closure เดียวกับไฟล์อื่น — ไม่ต้อง import/export · ลำดับไฟล์ดู build.config.mjs)
       * ========================================================================== */

      const vA = [[], [], []],
        vfi = FT.map(() => []);
      /* หญ้าริมทาง */
      for (let i = 0, n = 0; i < 4000 && n < 800; i++) { // ลดความหนาแน่นลง
        const t = vrn(),
          sd = vrn() < 0.5 ? -1 : 1,
          near = vrn() < 0.58,
          o = offRoad(t, sd * (near ? 3.7 + vrn() * 1.5 : 5.1 + vrn() * 6)),
          k = vrn();
        if (!vok(o.x, o.z)) continue;
        n++;
        const kind = k < 0.45 ? 0 : k < 0.82 ? 1 : 2,
          hh = [0.34 + vrn() * 0.22, 0.62 + vrn() * 0.4, 0.7 + vrn() * 0.42][kind],
          sw = hh * (kind ? 1.15 : 1.6);
        vA[kind].push({
          x: o.x,
          z: o.z,
          ry: vrn() * 6.28,
          rx: (vrn() - 0.5) * 0.2,
          rz: (vrn() - 0.5) * 0.2,
          sx: sw,
          sy: hh,
          sz: sw * (0.85 + vrn() * 0.3),
          c: vTint()
        });
      }
      /* ดอกไม้เป็นกอ พร้อมหญ้ารอบโคน */
      function vflowers(cx, cz, type, cnt, rad, s0) {
        for (let k = 0; k < cnt; k++) {
          const a = vrn() * 6.283,
            d = Math.sqrt(vrn()) * rad,
            ty = vrn() < 0.28 ? (type + 1 + Math.floor(vrn() * 2)) % FT.length : type,
            s = s0 * (0.8 + vrn() * 0.6);
          vfi[ty].push({
            x: cx + Math.cos(a) * d,
            z: cz + Math.sin(a) * d,
            ry: vrn() * 6.28,
            rx: (vrn() - 0.5) * 0.3,
            rz: (vrn() - 0.5) * 0.3,
            sx: s,
            sy: s * (0.85 + vrn() * 0.4),
            sz: s
          });
        }
        for (let k = 0; k < Math.max(2, cnt >> 1); k++) {
          const a = vrn() * 6.283,
            d = vrn() * rad * 1.1,
            hh = 0.5 + vrn() * 0.4;
          vA[1].push({
            x: cx + Math.cos(a) * d,
            z: cz + Math.sin(a) * d,
            ry: vrn() * 6.28,
            sx: hh * 1.2,
            sy: hh,
            sz: hh * 1.2,
            c: vTint()
          });
        }
      }
      FLSP.forEach(q => vflowers(q[0], q[1], q[2] % 6, 5 + Math.floor(vrn() * 4), 0.9, 1));
      // ปลูกหญ้าพลิ้วไหวและดอกไม้เล็กๆ แซมในสวนผลไม้และแนวรั้วหน้าสวนอย่างสมดุล (ไม่รกทึบ)
      if (window.__ORCHARDS) {
        window.__ORCHARDS.forEach((orc, oIdx) => {
          const grassCnt = orc.tier === 0 ? 14 : 9;
          for (let g = 0; g < grassCnt; g++) {
            const lx = (vrn() - 0.5) * 7.8,
              lz = (vrn() - 0.5) * 7.8;
            // เว้นช่องทางเดินกลางหน้าสวน
            if (Math.abs(lz) < 0.75 && lx * orc.sd > 2.2) continue;
            const wx = orc.x + lx * orc.tn.z + lz * orc.tn.x,
              wz = orc.z - lx * orc.tn.x + lz * orc.tn.z,
              kind = vrn() < 0.65 ? 0 : 1,
              hh = kind === 0 ? 0.32 + vrn() * 0.18 : 0.48 + vrn() * 0.25,
              sw = hh * (kind ? 1.15 : 1.55);
            vA[kind].push({
              x: wx,
              z: wz,
              ry: vrn() * 6.28,
              rx: (vrn() - 0.5) * 0.16,
              rz: (vrn() - 0.5) * 0.16,
              sx: sw,
              sy: hh,
              sz: sw,
              c: vTint()
            });
          }
          // ดอกไม้เล็กๆ ริมรั้วหน้าสวนผลไม้
          if (orc.tier === 0 && oIdx % 2 === 0) {
            const fx = orc.sd * 4.25,
              fz = (oIdx % 4 === 0 ? 1 : -1) * 2.4,
              fwx = orc.x + fx * orc.tn.z + fz * orc.tn.x,
              fwz = orc.z - fx * orc.tn.x + fz * orc.tn.z;
            vflowers(fwx, fwz, oIdx % 6, 4, 0.75, 0.85);
          }
        });
      }
      for (let i = 0, n = 0; i < 500 && n < 60; i++) {
        const t = vrn(),
          sd = vrn() < 0.5 ? -1 : 1,
          o = offRoad(t, sd * (5.4 + vrn() * 5));
        if (!spotOK(o.x, o.z, 1.6)) continue;
        taken.push([o.x, o.z, 1.4]);
        n++;
        vflowers(o.x, o.z, Math.floor(vrn() * 6), 10 + Math.floor(vrn() * 9), 1.5, 0.95 + vrn() * 0.3);
      }
      const vFM = [];
      const sunflowerGeo = vFlowerGeo(vMkR(743), {
          n: 16,
          L: 0.22,
          W: 0.074,
          tilt: 0.12,
          c: 0xf2b51d,
          c2: 0xffdf55,
          cen: 0x55391c,
          cr: 0.105,
          stem: 1.35,
          layers: 2
        }),
        sunflowerMat = new THREE.MeshLambertMaterial({ vertexColors: true, side: THREE.DoubleSide });
      VMF.push(sunflowerMat);
      sunflowerMat.onBeforeCompile = shader => {
        shader.uniforms.uSunflowerT = VEG.t;
        shader.uniforms.uSunflowerW = VEG.w;
        shader.vertexShader = shader.vertexShader
          .replace('#include <common>', '#include <common>\nuniform float uSunflowerT;\nuniform float uSunflowerW;')
          .replace(
            '#include <begin_vertex>',
            'vec3 transformed = vec3(position);\n' +
              '#ifdef USE_INSTANCING\nvec4 sunIp = instanceMatrix * vec4(0.,0.,0.,1.);\n#else\nvec4 sunIp = vec4(0.);\n#endif\n' +
              'float sunPhase = sunIp.x * .62 + sunIp.z * .83;\n' +
              'float sunHeight = clamp(position.y / 1.45, 0., 1.);\n' +
              'float sunBend = sunHeight * sunHeight * (.13 + uSunflowerW * .08) * clamp(uSunflowerW * 3., 0., 1.);\n' +
              'transformed.x += (sin(uSunflowerT * .55 + sunPhase) + .22 * sin(uSunflowerT * .82 + sunPhase * 1.7)) * sunBend;\n' +
              'transformed.z += cos(uSunflowerT * .48 + sunPhase * 1.3) * sunBend * .62;'
          );
        shader.fragmentShader = shader.fragmentShader.replace(
          '#include <normal_fragment_begin>',
          THREE.ShaderChunk.normal_fragment_begin.replace('gl_FrontFacing ? 1.0 : - 1.0', '1.0')
        );
      };
      const sunflowerSites = [
        [0.14, -1],
        [0.32, 1],
        [0.5, -1],
        [0.68, 1],
        [0.86, -1]
      ];
      for (const [t, side] of sunflowerSites) {
        const pathPoint = route.getPoint(t),
          tangent = route.getTangent(t),
          lateral = new THREE.Vector3(-tangent.z, 0, tangent.x),
          center = pathPoint.clone().addScaledVector(lateral, side * 8.6),
          D = new THREE.Object3D(),
          matrices = [];
        for (let row = -2; row <= 2; row++)
          for (let column = -1; column <= 1; column++) {
            const x = center.x + tangent.x * (row * 0.78) + lateral.x * (column * 0.78),
              z = center.z + tangent.z * (row * 0.78) + lateral.z * (column * 0.78);
            if (!spotOK(x, z, 0.26)) continue;
            D.position.set(x, -0.02, z);
            D.rotation.set((vrn() - 0.5) * 0.06, vrn() * 6.283, (vrn() - 0.5) * 0.06);
            const scale = 0.88 + vrn() * 0.24;
            D.scale.set(scale, scale, scale);
            D.updateMatrix();
            matrices.push(D.matrix.clone());
          }
        if (!matrices.length) continue;
        const patch = new THREE.InstancedMesh(sunflowerGeo, sunflowerMat, matrices.length);
        patch.name = 'sunflower-patch';
        matrices.forEach((matrix, i) => patch.setMatrixAt(i, matrix));
        patch.instanceMatrix.needsUpdate = true;
        patch.frustumCulled = false;
        scene.add(patch);
        vFM.push({ m: patch, x: center.x, z: center.z, maxDistance: 86, reducedDistance: 48 });
      }
      // แบ่งหญ้าและดอกไม้ริมทางออกเป็นโซนย่อย (Spatial Chunking 80x80m) เพื่อซ่อนโซนที่อยู่ไกลเกิน 95m
      function addChunkedVeg(geo, mat, list, hasColor) {
        const buckets = new Map();
        for (const item of list) {
          const gx = Math.floor(item.x / 80),
            gz = Math.floor(item.z / 80),
            key = gx + ',' + gz;
          let b = buckets.get(key);
          if (!b) {
            b = { arr: [], sx: 0, sz: 0 };
            buckets.set(key, b);
          }
          b.arr.push(item);
          b.sx += item.x;
          b.sz += item.z;
        }
        for (const b of buckets.values()) {
          const m = vMesh(geo, mat, b.arr, hasColor);
          if (m) {
            scene.add(m);
            vFM.push({ m, x: b.sx / b.arr.length, z: b.sz / b.arr.length });
          }
        }
      }
      [
        [gLawn, 0],
        [gTall, 1],
        [gSeed, 2]
      ].forEach(q => addChunkedVeg(q[0], vMG, vA[q[1]], false));
      FT.forEach((g, i) => addChunkedVeg(g, vMF, vfi[i], false));

      /* ============================================================================
       * src/scene/40-veg/04-rice-fields.js
       * ต้นข้าวในทุ่งนาใกล้ถนน และนาแปลงเล็กริมทาง (น้ำขัง คันนา กอข้าว)
       * (ไฟล์นี้ถูกต่อรวมเป็น closure เดียวกับไฟล์อื่น — ไม่ต้อง import/export · ลำดับไฟล์ดู build.config.mjs)
       * ========================================================================== */

      /* ทุ่งนาใกล้ถนน: ต้นข้าวเป็นแถว (เฉพาะแปลงที่อยู่ในระยะสายตา) */
      {
        const GR = new Set([0x8fbf5a, 0x7fb04f, 0xa9c95a, 0x6fa86a, 0xb7c75a]),
          GO = new Set([0xd9c25a, 0xc9a95a]);
        const vcells = FIELDS.map(q => {
          let m = 1e9;
          for (let i = 0; i < routePts.length; i += 24) {
            const dx = routePts[i] - q[0],
              dz = routePts[i + 1] - q[1];
            m = Math.min(m, dx * dx + dz * dz);
          }
          return { q, d: m };
        })
          .filter(o => o.d < 42 * 42)
          .sort((a, b) => a.d - b.d)
          .slice(0, 48);
        for (const { q } of vcells) {
          const kind = GR.has(q.c) ? 'g' : GO.has(q.c) ? 'r' : q.c === 0x9c8456 ? 's' : 'w',
            sp = { g: 1.5, r: 1.5, s: 1.3, w: 2 }[kind],
            half = 7.2,
            arr = [],
            tc = new THREE.Color(q.c).lerp(vWhite, 0.6);
          for (let x = -half; x <= half; x += sp)
            for (let z = -half; z <= half; z += sp) {
              const h = {
                  g: 0.55 + vrn() * 0.2,
                  r: 0.78 + vrn() * 0.2,
                  s: 0.13 + vrn() * 0.06,
                  w: 0.2 + vrn() * 0.08
                }[kind],
                sw = kind === 's' ? h * 3.4 : h * 1.9;
              arr.push({
                x: q[0] + x + (vrn() - 0.5) * sp * 0.4,
                y: 0.02,
                z: q[1] + z + (vrn() - 0.5) * sp * 0.4,
                ry: vrn() * 6.28,
                rx: (vrn() - 0.5) * 0.1,
                rz: (vrn() - 0.5) * 0.1,
                sx: sw,
                sy: h,
                sz: sw,
                c: tc.clone().multiplyScalar(0.9 + vrn() * 0.2)
              });
            }
          const m = vMesh(kind === 'r' ? gRiceR : kind === 's' ? gStub : gRiceG, vMG, arr, true);
          if (m) {
            scene.add(m);
            vFM.push({ m, x: q[0], z: q[1] });
          }
        }
      }

      /* นาข้าวแปลงเล็กริมทาง: น้ำขัง คันนา และกอข้าว */
      const vWater = new THREE.MeshStandardMaterial({
          color: 0x0284c7,
          emissive: 0x0369a1,
          emissiveIntensity: 0.25,
          roughness: 0.08,
          metalness: 0.12
        }),
        vMud = sm2(0x8b7a55);
      for (const pd of PADS) {
        const g = pd[0],
          ripe = pd[1],
          arr = [];
        for (let r = 0; r < 12; r++)
          for (let q = 0; q < 16; q++) {
            const h = (ripe ? 0.62 : 0.5) + vrn() * 0.16;
            arr.push({
              x: (r - 5.5) * 0.52 + (vrn() - 0.5) * 0.1,
              y: 0.04,
              z: (q - 7.5) * 0.52 + (vrn() - 0.5) * 0.1,
              ry: vrn() * 6.28,
              rx: (vrn() - 0.5) * 0.1,
              rz: (vrn() - 0.5) * 0.1,
              sx: h * 1.3,
              sy: h,
              sz: h * 1.3,
              c: vTint()
            });
          }
        const w = new THREE.Mesh(new THREE.PlaneGeometry(6.1, 8.7).rotateX(-Math.PI / 2), vWater);
        w.position.y = 0.062;
        w.receiveShadow = true;
        g.add(w);
        for (const sz of [-1, 1]) box(6.7, 0.12, 0.3, vMud, 0, 0.06, sz * 4.5, g);
        for (const sx of [-1, 1]) box(0.3, 0.12, 9.3, vMud, sx * 3.3, 0.06, 0, g);
        const m = vMesh(ripe ? gRiceR : gRiceG, vMG, arr, false);
        if (m) g.add(m);
      }

      /* ============================================================================
       * src/scene/40-veg/05-cloud-shadow-fx.js
       * เงาเมฆบนพื้น ฟิลเตอร์แสงตามอากาศ และ vegUpdate()
       * (ไฟล์นี้ถูกต่อรวมเป็น closure เดียวกับไฟล์อื่น — ไม่ต้อง import/export · ลำดับไฟล์ดู build.config.mjs)
       * ========================================================================== */

      /* เงาเมฆที่เคลื่อนผ่านพื้น + ฟิลเตอร์แสงตามอากาศ + แสงสะท้อนเย็นในเงา */
      const csTex = (() => {
        const c = document.createElement('canvas');
        c.width = c.height = 128;
        const x = c.getContext('2d'),
          g = x.createRadialGradient(64, 64, 0, 64, 64, 64);
        g.addColorStop(0, 'rgba(10,25,35,1)');
        g.addColorStop(0.55, 'rgba(10,25,35,.55)');
        g.addColorStop(1, 'rgba(10,25,35,0)');
        x.fillStyle = g;
        x.fillRect(0, 0, 128, 128);
        return new THREE.CanvasTexture(c);
      })();
      const csM = new THREE.MeshBasicMaterial({
          map: csTex,
          transparent: true,
          opacity: 0,
          depthWrite: false,
          fog: false,
          polygonOffset: true,
          polygonOffsetFactor: -3,
          polygonOffsetUnits: -3
        }),
        csG = new THREE.PlaneGeometry(1, 1).rotateX(-Math.PI / 2),
        csL = [];
      for (let i = 0; i < 7; i++) {
        const m = new THREE.Mesh(csG, csM),
          s = 34 + vrn() * 40;
        m.renderOrder = 1;
        m.frustumCulled = false;
        m.position.y = 0.07;
        m.scale.set(s, 1, s * (0.65 + vrn() * 0.3));
        m.userData = { x: (vrn() - 0.5) * 220, z: (vrn() - 0.5) * 220, sp: 1.5 + vrn() * 1.5 };
        scene.add(m);
        csL.push(m);
      }
      const FXE = document.createElement('div');
      FXE.className = 'wxfx';
      FXE.setAttribute('aria-hidden', 'true');
      host.appendChild(FXE);
      const fillL = new THREE.DirectionalLight(0x9db5e8, 0);
      scene.add(fillL, fillL.target);
      const vSV = new THREE.Vector3(),
        vG0 = new THREE.Color(0xb1c49b),
        vGt = new THREE.Color(),
        vRQ = matchMedia('(prefers-reduced-motion:reduce)'),
        vLast = {};
      function vSet(k, v) {
        if (vLast[k] !== v) {
          vLast[k] = v;
          FXE.style.setProperty(k, v);
        }
      }
      vegUpdate = function (dt, sd, kS, nF, ca, st, flash) {
        const cl = (v, a, b) => Math.max(a, Math.min(b, v)),
          rain = WXR.rain,
          fog = WXR.fog,
          day = (1 - nF) * cl(sd.y * 4, 0, 1);
        VEG.t.value += dt;
        VEG.w.value =
          state.reduced || vRQ.matches
            ? 0
            : 0.2 + 0.08 * Math.sin(VEG.t.value * 0.37) + rain * 0.12 + st * 0.7 + (ca > 0.6 ? 0.06 : 0);
        const low = cl(1 - sd.y * 2.3, 0, 1) * (sd.y > -0.03 ? 1 : 0) * (1 - ca) * (1 - fog * 0.7) * (1 - nF);
        VEG.g.value = low * 0.85;
        VEG.sc.value.copy(kS);
        vGt.set(1, 1, 1);
        vGt.r = cl(groundMat.color.r / vG0.r, 0.62, 1.2);
        vGt.g = cl(groundMat.color.g / vG0.g, 0.62, 1.2);
        vGt.b = cl(groundMat.color.b / vG0.b, 0.62, 1.2);
        for (const m of VMG) {
          m.color.copy(vGt).multiplyScalar(1 - rain * 0.22);
          // m.roughness = m.userData.r0 - 0.45 * rain;
        }
        for (const m of VMF) {
          m.color.setScalar(1 - rain * 0.2);
          // m.roughness = m.userData.r0 - 0.35 * rain;
        }
        // groundMat.roughness = 0.85 - 0.3 * rain;
        if (WXR.hor) vWater.color.copy(WXR.hor).lerp(vGt.set(0x0284c7), 0.85);
        const cs = cl((ca - 0.12) * 3, 0, 1) * (1 - cl((ca - 0.78) / 0.2, 0, 1)) * day;
        csM.opacity = 0.27 * cs;
        for (const m of csL) {
          const d = m.userData;
          d.x += dt * d.sp;
          const dx = d.x - car.position.x,
            dz = d.z - car.position.z;
          if (dx > 110) d.x -= 220;
          else if (dx < -110) d.x += 220;
          if (dz > 110) d.z -= 220;
          else if (dz < -110) d.z += 220;
          m.position.x = d.x;
          m.position.z = d.z;
          m.visible = cs > 0.02;
        }
        for (const f of vFM) {
          const dx = f.x - car.position.x,
            dz = f.z - car.position.z,
            maxDistance = state.reduced ? f.reducedDistance || 95 : f.maxDistance || 95;
          f.m.visible = dx * dx + dz * dz < maxDistance * maxDistance;
        }
        fillL.position.set(car.position.x - sd.x * 30, 16, car.position.z - sd.z * 30);
        fillL.target.position.set(car.position.x, 0, car.position.z);
        fillL.intensity = 0.55 * (1 - ca * 0.85) * (1 - nF) * cl(sd.y * 3, 0, 1) * (1 - st);
        // อัปเดต CSS variables ของเลเยอร์แสงอาทิตย์ทุก ~4 เฟรม หรือเมื่อเกิดฟ้าผ่า เพื่อไม่ให้เบราว์เซอร์คำนวณ CSS gradient ซ้ำทุกเฟรม
        if (flash > 0.01 || ((Math.floor(VEG.t.value * 60) & 3) === 0)) {
          vSV.copy(camera.position).addScaledVector(sd, 300).project(camera);
          const sx = (vSV.x * 0.5 + 0.5) * 100,
            sy = (1 - (vSV.y * 0.5 + 0.5)) * 100,
            vis = vSV.z < 1 && sx > -30 && sx < 130 && sy > -30 && sy < 130 ? 1 : 0,
            hx = kS.getHex();
          vSet('--sx', Math.round(sx) + '%');
          vSet('--sy', Math.round(sy) + '%');
          vSet(
            '--sg',
            (
              vis *
              (sd.y > -0.04 ? 1 : 0) *
              Math.pow(1 - ca, 1.5) *
              (1 - fog * 0.7) *
              (1 - nF) *
              (0.2 + 0.45 * cl(1 - sd.y * 2.4, 0, 1))
            ).toFixed(2)
          );
          vSet('--sgc', ((hx >> 16) & 255) + ',' + ((hx >> 8) & 255) + ',' + (hx & 255));
          vSet('--vg', cl(0.08 + 0.12 * ca + 0.1 * st + nF * 0.1, 0, 0.5).toFixed(2));
          vSet('--ta', (ca * 0.16 * (1 - nF) + st * 0.14).toFixed(2));
          vSet(
            '--tint',
            Math.round(125 - 75 * st) + ',' + Math.round(145 - 83 * st) + ',' + Math.round(160 - 80 * st)
          );
          vSet('--fl', (flash * 0.5).toFixed(2));
        }
      };
    } catch (e) {
      console.warn('vegetation module failed', e);
    }

    /* ============================================================================
     * src/scene/41-start.js
     * ตั้งกล้องเริ่มต้นและเริ่มลูปแอนิเมชัน
     * (ไฟล์นี้ถูกต่อรวมเป็น closure เดียวกับไฟล์อื่น — ไม่ต้อง import/export · ลำดับไฟล์ดู build.config.mjs)
     * ========================================================================== */

    // --- ระบบจำกัดระยะการมองเห็น (Real-life Distance Culling แบบแยกหน้า-หลัง) ---
    // รวบรวมวัตถุริมทางทั้งหมด
    const cullTargets = [];
    const customModelGroups = new Set((window.customModels || []).map(m => m.group));
    const ignoreObjs = new Set([car, cock, ground, sunLight, ambient, stars, sunMesh, rain, driftPts, canopyMesh, typeof RIVER !== 'undefined' ? RIVER.root : null, window.__WETLAND_ROOT || null]);
    scene.children.forEach(obj => {
      if (ignoreObjs.has(obj) || obj.isLight) return;
      if (obj.renderOrder === -10) return; // ข้ามโดมท้องฟ้า
      if (obj.userData && obj.userData.selfCulled) return; // ข้ามคนและนกที่มีระบบ Culling รายเฟรมของตัวเอง
      if (obj.isGroup || (obj.isInstancedMesh && obj.position.lengthSq() > 1)) {
        if (obj.children?.[0]?.isPoints) return;
        if (traffic.some(t => t.g === obj)) return;
        cullTargets.push(obj);
      }
    });

    // กำหนดระยะมองเห็นแบบแยก ด้านหน้า และ ด้านหลัง (เผื่อระยะกล้องที่อยู่หลังรถและสิ่งปลูกสร้างที่อยู่ห่างออกไปข้างถนน 12-26 เมตร)
    const FRONT_DIST_SQ = 92 * 92; // ระยะด้านหน้าโซนชนบท 92 เมตร
    const REAR_DIST_SQ  = 54 * 54; // ระยะด้านหลังโซนชนบท 54 เมตร
    const TOWN_FRONT_SQ = 72 * 72; // ระยะด้านหน้าโซนจันจว้า-เวียงแก่น (ถนนโค้งพับใกล้กัน) 72 เมตร เพื่อลด Draw Calls ข้ามโค้งถนน
    const TOWN_REAR_SQ  = 42 * 42; // ระยะด้านหลังโซนจันจว้า-เวียงแก่น 42 เมตร
    const CUSTOM_MODEL_DIST_SQ = 96 * 96; // ระยะสำหรับโมเดลขนาดใหญ่พิเศษ (โรงเรียน 34x26 ม. และ 7-11)
    
    // ตั้งเวลากวาดสายตาทุกๆ 200ms (ลดภาระ CPU ในการวนลูปจากเดิม 150ms)
    setInterval(() => {
      if (document.hidden || currentView !== 'home') return;
      const cx = car.position.x, cz = car.position.z;
      const inTownLoop = state.routeT <= 0.56 || state.routeT >= 0.92;
      const fSq = inTownLoop ? TOWN_FRONT_SQ : FRONT_DIST_SQ;
      const rSq = inTownLoop ? TOWN_REAR_SQ : REAR_DIST_SQ;
      
      // คำนวณเวกเตอร์ทิศทางที่หน้ารถกำลังมุ่งไป
      const dirX = Math.sin(car.rotation.y);
      const dirZ = Math.cos(car.rotation.y);

      // 1. ซ่อนสิ่งก่อสร้างและต้นไม้ที่อยู่นอกระยะสายตา
      for (let i = 0; i < cullTargets.length; i++) {
        const obj = cullTargets[i];
        const dx = obj.position.x - cx;
        const dz = obj.position.z - cz;
        const distSq = dx * dx + dz * dz;

        // โมเดลขนาดใหญ่พิเศษ (เช่น โรงเรียน, 7-11) ใช้รัศมีกว้างพิเศษทั้งหน้าและหลัง ป้องกันอาการวาร์ปหายขณะขับผ่าน
        if (customModelGroups.has(obj)) {
          obj.visible = distSq <= CUSTOM_MODEL_DIST_SQ;
          continue;
        }
        
        // Dot Product เช็คว่าโมเดลอยู่ด้านหน้า หรือ ด้านหลังรถ
        const dot = (dx * dirX) + (dz * dirZ);
        
        // เผื่อระยะด้านหลังรถ 28 เมตร (ครอบคลุมระยะกล้องด้านหลังรถ 10-17 ม. และความกว้างของวัด/บ้าน/แปลงเกษตร)
        if (obj.userData && obj.userData.bigRange) {
          obj.visible = dot > -60 ? distSq <= 130 * 130 : distSq <= 100 * 100;
          continue;
        }
        const limitSq = dot > -26 ? fSq : rSq;
        obj.visible = distSq <= limitSq;
      }
      
      // 2. ซ่อนกล่องความทรงจำ
      memoryBoxes.forEach(b => {
        const dx = b.group.position.x - cx;
        const dz = b.group.position.z - cz;
        const distSq = dx * dx + dz * dz;
        const dot = (dx * dirX) + (dz * dirZ);
        const limitSq = dot > -28 ? FRONT_DIST_SQ : REAR_DIST_SQ;
        b.group.visible = distSq <= limitSq;
      });
      
      // 3. แอนิเมชันกองไฟ (กระพริบและเปลวไฟขยับ)
      if (window.campLights) {
        const t = Date.now() * 0.005;
        window.campLights.forEach(c => {
          // คำนวณแสงเฉพาะตอนที่อยู่ในจอ (ประหยัด CPU)
          if (c.group.visible) {
            // เปิดแสงไฟเฉพาะตอนกลางคืน
            if (state.night) {
              // ทำให้แสงกระพริบแบบกองไฟ
              c.light.intensity = 1.5 + Math.sin(t * 2 + c.baseR) * 0.5 + Math.cos(t * 3.5) * 0.3;
              // ดึงเปลวไฟยืดหด
              c.flame.scale.set(1, 1 + Math.sin(t * 4 + c.baseR) * 0.2, 1);
              c.flame.visible = true;
            } else {
              // กลางวันปิดแสงทิ้งเลย การ์ดจอจะได้ลื่นๆ
              c.light.intensity = 0;
              c.flame.visible = false;
            }
          }
        });
      }
      
    }, 200);

    camera.position.set(18, 15, 20);
    requestAnimationFrame(frame);
  }

  /* ============================================================================
   * src/app/99-boot.js
   * จุดเริ่มต้นแอป: เรียก init3D() แล้ววาดหน้าจอครั้งแรก
   * (ไฟล์นี้ถูกต่อรวมเป็น closure เดียวกับไฟล์อื่น — ไม่ต้อง import/export · ลำดับไฟล์ดู build.config.mjs)
   * ========================================================================== */


  /* ============================================================================
   * src/app/98-relax-addons.js
   * จุดแวะพักชมวิว (rest stop) และตั้งเวลาหลับ (sleep timer)
   * ========================================================================== */
  {
    const REST_STOPS = [
      { id: 'chiangsaen', place: 'เชียงแสน · ริมโขง', q: 'หายใจลึก ๆ สักครั้ง แล้วนึกถึงสิ่งเล็ก ๆ ที่ทำให้วันนี้ยิ้มได้' },
      { id: 'chiangkhong', place: 'เชียงของ · ริมโขง', q: 'มองไกลไปที่ฝั่งตรงข้ามสักครู่ มีเรื่องไหนที่ตอนนี้ปล่อยวางได้บ้าง' },
      { id: 'wiangkaen', place: 'เวียงแก่น · ปลายทาง', q: 'ถึงแล้ว วันนี้มีเรื่องไหนที่อยากขอบคุณตัวเองบ้าง' }
    ].map(r => ({ ...r, t: ROUTE.find(x => x.id === r.id).t }));
    const REST_SECONDS = 25;
    let restOn = true,
      restTimer = null,
      restSavedSpeed = null,
      prevT = state.routeT;
    try {
      restOn = localStorage.getItem('road-of-days-rest') !== 'off';
    } catch (e) {}
    const card = document.createElement('div');
    card.className = 'rest-card';
    card.hidden = true;
    card.setAttribute('role', 'status');
    card.setAttribute('aria-live', 'polite');
    card.innerHTML =
      '<small>จุดแวะพักชมวิว</small><strong></strong><p></p><div class="rest-actions"><button type="button" class="secondary" data-rest="write">เขียนบันทึก</button><button type="button" class="primary" data-rest="go">ขับต่อ</button></div>';
    document.body.appendChild(card);
    const endRest = () => {
      clearTimeout(restTimer);
      if (restSavedSpeed !== null) {
        speedMul = restSavedSpeed;
        restSavedSpeed = null;
        setSpeedBtnLabel(speedMul);
      }
      card.hidden = true;
    };
    const startRest = r => {
      if (!restOn || restSavedSpeed !== null || state.reduced) return;
      restSavedSpeed = speedMul || 10;
      speedMul = 0;
      card.querySelector('strong').textContent = r.place;
      card.querySelector('p').textContent = r.q;
      card.dataset.place = r.place;
      card.hidden = false;
      restTimer = setTimeout(endRest, REST_SECONDS * 1000);
    };
    card.querySelector('[data-rest="go"]').onclick = endRest;
    card.querySelector('[data-rest="write"]').onclick = () => {
      const place = card.dataset.place || '';
      endRest();
      $('writeOpen').click();
      setTimeout(() => {
        if ($('entryPlace')) $('entryPlace').value = place;
      }, 50);
    };
    setInterval(() => {
      const t = state.routeT;
      if (currentView === 'home' && t > prevT && t - prevT < 0.05)
        for (const r of REST_STOPS) if (prevT < r.t && t >= r.t) startRest(r);
      prevT = t;
    }, 250);
    const restBtn = document.createElement('button');
    restBtn.type = 'button';
    restBtn.className = 'fab-item';
    restBtn.dataset.keep = '1';
    const restLabel = () => (restBtn.innerHTML = '<svg><use href="#i-pin"/></svg><span>จุดแวะพักชมวิว: ' + (restOn ? 'เปิด' : 'ปิด') + '</span>');
    restLabel();
    restBtn.onclick = () => {
      restOn = !restOn;
      try {
        localStorage.setItem('road-of-days-rest', restOn ? 'on' : 'off');
      } catch (e) {}
      restLabel();
      if (!restOn) endRest();
    };

    /* ตั้งเวลาหลับ: ชะลอรถ ปิดเพลง/เสียงธรรมชาติ แล้วจอดนิ่ง */
    const SLEEP_OPTS = [0, 15, 30, 60];
    let sleepIdx = 0,
      sleepEnd = 0,
      sleepTick = null,
      sleepBase = 0;
    const sleepBtn = document.createElement('button');
    sleepBtn.type = 'button';
    sleepBtn.className = 'fab-item';
    sleepBtn.dataset.keep = '1';
    const sleepLabel = () => (sleepBtn.innerHTML = '<svg><use href="#i-moon"/></svg><span>ตั้งเวลาหลับ: ' + (SLEEP_OPTS[sleepIdx] ? SLEEP_OPTS[sleepIdx] + ' นาที' : 'ปิด') + '</span>');
    sleepLabel();
    const stopAudio = () => {
      for (const id of ['musicBtn', 'soundBtn']) if ($(id).classList.contains('active')) $(id).click();
    };
    sleepBtn.onclick = () => {
      sleepIdx = (sleepIdx + 1) % SLEEP_OPTS.length;
      sleepLabel();
      clearInterval(sleepTick);
      if (audioCtx && soundOn) natureMaster.gain.setTargetAtTime(0.9, audioCtx.currentTime, 0.5);
      if (mBus && mOn) mBus.gain.setTargetAtTime(0.88 * MIXV.music, mCtx.currentTime, 0.5);
      if (!SLEEP_OPTS[sleepIdx]) return toast('ยกเลิกตั้งเวลาหลับแล้ว');
      sleepEnd = Date.now() + SLEEP_OPTS[sleepIdx] * 60000;
      sleepBase = speedMul || 10;
      toast('รถจะค่อย ๆ ชะลอและจอดนิ่งใน ' + SLEEP_OPTS[sleepIdx] + ' นาที · ราตรีสวัสดิ์');
      sleepTick = setInterval(() => {
        const left = sleepEnd - Date.now();
        if (left > 0 && left < 120000) {
          if (audioCtx && soundOn) natureMaster.gain.setTargetAtTime(Math.max(0.0001, 0.9 * left / 120000), audioCtx.currentTime, 0.5);
          if (mBus && mOn) mBus.gain.setTargetAtTime(Math.max(0.0001, 0.88 * MIXV.music * left / 120000), mCtx.currentTime, 0.5);
        }
        if (left <= 0) {
          clearInterval(sleepTick);
          sleepIdx = 0;
          sleepLabel();
          speedMul = 0;
          setSpeedBtnLabel(0);
          stopAudio();
          toast('หลับสบายนะ · รถจอดนิ่งอยู่ตรงนี้ กดปุ่มความเร็วเมื่อพร้อมขับต่อ');
        } else if (left < 120000 && restSavedSpeed === null) {
          speedMul = Math.max(1, Math.round(sleepBase * (left / 120000)));
          setSpeedBtnLabel(speedMul);
        }
      }, 1000);
    };
    const tripGrp = $('fabGrpTrip');
    tripGrp.appendChild(restBtn);
    tripGrp.appendChild(sleepBtn);
  }

  /* ============================================================================
   * src/app/97-mixer-presets-memory.js
   * มิกเซอร์เสียง · พรีเซ็ตบรรยากาศ · โหมดซ่อน UI · เสียงตามสถานที่ · เมื่อปีก่อน · โปสการ์ด · สรุปอารมณ์รายเดือน
   * ========================================================================== */
  {
    const LS = (k, v) => { try { localStorage.setItem(k, v); } catch (e) {} };
    const mk = (tag, cls, html) => { const e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; };
    const addFab = (label, icon, fn, grp) => { const b = mk('button', 'fab-item', '<svg><use href="#' + icon + '"/></svg><span>' + label + '</span>'); b.type = 'button'; b.onclick = fn; $(grp || 'fabGrpTrip').appendChild(b); return b; };
    const addModal = (id, title, body) => {
      const m = mk('div', 'overlay', '<section class="modal" role="dialog" aria-modal="true"><div class="modal-head"><h2>' + title + '</h2><button class="iconbtn" type="button" aria-label="ปิด"><svg><use href="#i-close"/></svg></button></div>' + body + '</section>');
      m.id = id; m.hidden = true; document.body.appendChild(m);
      m.querySelector('.iconbtn').onclick = () => closeModal(id);
      m.onclick = e => { if (e.target === m) closeModal(id); };
      return m;
    };
    let placeOn = true, boost = 1;

    /* ---------- มิกเซอร์ ---------- */
    const CH = [['wind', 'ลม'], ['water', 'สายน้ำ'], ['birds', 'นก/เรไร'], ['rain', 'เสียงฝน'], ['music', 'เพลง']];
    const mixApply = () => {
      LS('road-of-days-mix', JSON.stringify(MIXV));
      const t = audioCtx ? audioCtx.currentTime : 0;
      if (windGainN) windGainN.gain.setTargetAtTime(0.16 * MIXV.wind, t, 0.2);
      if (streamGainN) streamGainN.gain.setTargetAtTime(0.045 * MIXV.water * boost, t, 0.2);
      if (birdBus) birdBus.gain.setTargetAtTime(MIXV.birds, t, 0.2);
      if (mBus && mOn) mBus.gain.setTargetAtTime(0.88 * MIXV.music, mCtx.currentTime, 0.2);
    };
    addModal('mixModal', 'เสียงและบรรยากาศ',
      '<p>เลือกพรีเซ็ตเพื่อปรับเวลา อากาศ อารมณ์ และเสียงในครั้งเดียว</p><div class="chips" id="presetChips"></div><div id="mixRows"></div>' +
      '<label class="mix-row"><span>เสียงตามสถานที่ (เรือหางยาว · ระฆัง · กบเขียด)</span><input type="checkbox" class="switch" id="placeSnd" checked></label>');
    const rows = $('mixRows');
    CH.forEach(([k, l]) => {
      const r = mk('label', 'mix-row', '<span>' + l + '</span><input type="range" min="0" max="1.5" step="0.05" aria-label="' + l + '">');
      const s = r.querySelector('input'); s.value = MIXV[k];
      s.oninput = () => { MIXV[k] = +s.value; mixApply(); };
      r.dataset.k = k; rows.appendChild(r);
    });
    const syncRows = () => rows.querySelectorAll('.mix-row').forEach(r => (r.querySelector('input').value = MIXV[r.dataset.k]));
    $('placeSnd').onchange = e => { placeOn = e.target.checked; boost = 1; mixApply(); };

    /* ---------- พรีเซ็ต ---------- */
    const PRE = [
      [svgInline('fog'), 'เช้าหมอกริมโขง', { t: 6.3, w: 'fog', m: 'calm', s: 1, mu: 0, mix: { wind: .8, water: 1.3, birds: 1.2, rain: 1, music: .8 } }],
      [svgInline('rain'), 'ฝนยามค่ำ', { t: 21.5, w: 'rain', m: 'calm', s: 1, mu: 1, mix: { wind: .6, water: .6, birds: .3, rain: 1.4, music: .7 } }],
      [svgInline('sunset'), 'อาทิตย์ตกริมทาง', { t: 17.8, w: 'clear', m: 'hope', s: 1, mu: 1, mix: { wind: .8, water: 1, birds: 1, rain: 1, music: 1 } }],
      [svgInline('sun'), 'บ่ายแดดใส', { t: 14, w: 'clear', m: 'happy', s: 1, mu: 0, mix: { wind: 1, water: 1, birds: 1.3, rain: 1, music: .8 } }],
      [svgInline('moon'), 'ดึกเงียบสงบ', { t: 23.5, w: 'clear', m: 'tired', s: 1, mu: 1, zen: 1, mix: { wind: .7, water: .8, birds: .8, rain: 1, music: .6 } }]
    ];
    const zen = on => { document.body.classList.toggle('zen', on); if (on) toast('โหมดซ่อน UI · กดปุ่มมุมขวาล่างหรือกด H เพื่อกลับ'); };
    const applyPreset = p => {
      if (window.RODENV) { RODENV.weather(p.w); RODENV.time(p.t); }
      chooseMood(p.m, false);
      Object.assign(MIXV, p.mix); syncRows();
      if (!!soundOn !== !!p.s) $('soundBtn').click();
      if (!!mOn !== !!p.mu) $('musicBtn').click();
      setTimeout(mixApply, 900);
      closeModal('mixModal');
      if (p.zen) zen(true);
    };
    PRE.forEach(([e, n, p]) => { const b = mk('button', 'secondary', e + ' ' + n); b.type = 'button'; b.onclick = () => applyPreset(p); $('presetChips').appendChild(b); });
    addFab('มิกเซอร์เสียง', 'i-volume', () => openModal('mixModal'), 'fabGrpSound');

    /* ---------- โหมดซ่อน UI ---------- */
    addFab('ซ่อน UI', 'i-mountain', () => zen(true), 'fabGrpView');
    const zx = mk('button', 'zen-exit', 'แสดงเมนู'); zx.type = 'button'; zx.onclick = () => zen(false); document.body.appendChild(zx);
    document.addEventListener('keydown', e => {
      if ((e.key === 'h' || e.key === 'H') && !/INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName)) zen(!document.body.classList.contains('zen'));
    });

    /* ---------- เสียงตามสถานที่ ---------- */
    const env = (n, dur, pk, pan) => {
      const g = audioCtx.createGain(), p = audioCtx.createStereoPanner ? audioCtx.createStereoPanner() : null;
      g.gain.setValueAtTime(0.0001, n); g.gain.linearRampToValueAtTime(pk, n + 0.03); g.gain.exponentialRampToValueAtTime(0.0001, n + dur);
      if (p) { p.pan.value = pan; g.connect(p); p.connect(birdBus); } else g.connect(birdBus);
      return g;
    };
    const boat = (n, vol = 1) => { const pan = Math.random() * 1.2 - 0.6, f = audioCtx.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = 260;
      for (let i = 0; i < 8; i++) { const o = audioCtx.createOscillator(); o.type = 'sawtooth'; o.frequency.value = 78 + Math.random() * 6; o.connect(f); f.connect(env(n + i * 0.26, 0.22, 0.016 * vol, pan)); o.start(n + i * 0.26); o.stop(n + i * 0.26 + 0.24); } };
    const frog = n => { const pan = Math.random() * 1.6 - 0.8, f0 = 480 + Math.random() * 160;
      for (let i = 0; i < 4; i++) { const o = audioCtx.createOscillator(), f = audioCtx.createBiquadFilter(); o.type = 'square'; f.type = 'lowpass'; f.frequency.value = 900; o.frequency.value = f0; o.connect(f); f.connect(env(n + i * 0.12, 0.07, 0.018, pan)); o.start(n + i * 0.12); o.stop(n + i * 0.12 + 0.08); } };
    const bell = n => { const g = env(n, 3.5, 0.03, Math.random() - 0.5); [1, 2.76, 5.4].forEach((m, i) => { const o = audioCtx.createOscillator(), h = audioCtx.createGain(); o.frequency.value = 220 * m; h.gain.value = 1 / (i + 1); o.connect(h); h.connect(g); o.start(n); o.stop(n + 3.6); }); };
    setInterval(() => {
      if (!placeOn || !soundOn || !audioCtx || !birdBus || document.hidden) return;
      const km = kmAt(state.routeT);
      const nearTown = ROUTE.some(r => (r.id === 'chiangsaen' || r.id === 'chiangkhong') && Math.abs(km - r.km) < 7);
      const nearRiver = (typeof RIVER !== 'undefined' && RIVER.nearBoat && RIVER.nearBoat() < 130) || (state.routeT >= 0.71 && state.routeT <= 0.81);
      const near = nearTown || nearRiver;
      const nb = near ? 1.8 : 1; if (nb !== boost) { boost = nb; mixApply(); }
      const n = audioCtx.currentTime, rain = window.RODENV ? RODENV.rain() : 0;
      if (near && Math.random() < 0.3) boat(n, nearRiver && typeof RIVER !== 'undefined' && RIVER.nearBoat ? Math.max(0.15, Math.min(1, 1 - RIVER.nearBoat() / 130)) : 0.3);
      else if (state.night && rain < 0.4 && Math.random() < 0.7) frog(n);
      else if (!state.night && nearTown && Math.random() < 0.12) bell(n);
    }, 4000);

    /* ---------- เมื่อปีก่อน ---------- */
    const past = () => { const d = localDate(), md = d.slice(5), y = +d.slice(0, 4); return state.entries.filter(e => e.date.slice(5) === md && +e.date.slice(0, 4) < y).sort((a, b) => b.date.localeCompare(a.date)); };
    addModal('pastModal', 'วันนี้เมื่อปีก่อน', '<div id="pastList" class="sub"></div>');
    addFab('เมื่อปีก่อน', 'i-cal', () => { listMemory($('pastList'), past()); openModal('pastModal'); }, 'fabGrpMem');
    setTimeout(() => { const p = past(); if (p.length) toast('วันนี้เมื่อ ' + (+localDate().slice(0, 4) - +p[0].date.slice(0, 4)) + ' ปีก่อน คุณเขียนไว้ว่า “' + p[0].title + '” · ดูได้ที่เมนู “เมื่อปีก่อน”'); }, 5000);

    /* ---------- โปสการ์ด ---------- */
    addModal('pcModal', 'โปสการ์ดจากเส้นทาง',
      '<canvas id="pcCanvas" width="1200" height="800" style="width:100%;border-radius:14px;background:#dfe8dc"></canvas><input class="field" id="pcText" maxlength="90" placeholder="ข้อความบนโปสการ์ด" style="margin-top:12px;width:100%">' +
      '<div class="modal-actions"><button class="secondary" type="button" id="pcMake">สร้างใหม่</button><button class="secondary" type="button" id="pcSave" style="border-color:#376951;color:#376951">บันทึกเป็นรูป</button></div>');
    const wrap = (x, t, maxW) => { const out = []; let l = ''; for (const ch of t) { if (x.measureText(l + ch).width > maxW && l) { out.push(l); l = ch; } else l += ch; } if (l) out.push(l); return out.slice(0, 2); };
    const makeCard = () => {
      const url = window.RODENV && RODENV.shot(); if (!url) return toast('ฉาก 3D ยังไม่พร้อม');
      const im = new Image(); im.onload = () => {
        const c = $('pcCanvas'), W = c.width, H = c.height, x = c.getContext('2d'), s = Math.max(W / im.width, H / im.height);
        x.drawImage(im, (W - im.width * s) / 2, (H - im.height * s) / 2, im.width * s, im.height * s);
        const g = x.createLinearGradient(0, H * 0.45, 0, H); g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(10,25,18,.8)'); x.fillStyle = g; x.fillRect(0, 0, W, H);
        x.fillStyle = '#fff'; x.font = '600 56px "Noto Sans Thai",sans-serif';
        wrap(x, $('pcText').value || 'ขับช้า ๆ ไปตามเส้นทางความทรงจำ', W - 120).forEach((l, i) => x.fillText(l, 60, H - 190 + i * 72));
        x.font = '400 28px "Noto Sans Thai",sans-serif'; x.fillStyle = '#ffffffd9';
        x.fillText($('placeLabel').textContent + ' · ' + prettyDate(localDate()), 60, H - 60);
        x.textAlign = 'right'; x.fillText('Road of Days', W - 60, H - 60); x.textAlign = 'left';
      }; im.src = url;
    };
    $('pcMake').onclick = makeCard;
    $('pcSave').onclick = () => $('pcCanvas').toBlob(b => { const a = document.createElement('a'); a.href = URL.createObjectURL(b); a.download = 'road-of-days-' + localDate() + '.png'; a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 4000); });
    addFab('โปสการ์ด', 'i-star', () => { const e = state.entries[0]; $('pcText').value = e ? e.title : ''; openModal('pcModal'); setTimeout(makeCard, 120); }, 'fabGrpMem');

    /* ---------- สรุปอารมณ์รายเดือน ---------- */
    const moodSum = () => {
      let box = $('moodSum'); if (!box) { box = mk('div', 'mood-sum'); box.id = 'moodSum'; $('calendarGrid').after(box); }
      const pre = viewYear + '-' + String(viewMonth + 1).padStart(2, '0'), en = state.entries.filter(e => e.date.startsWith(pre)), cnt = {};
      en.forEach(e => (cnt[e.mood] = (cnt[e.mood] || 0) + 1));
      const mx = Math.max(1, ...Object.values(cnt));
      box.innerHTML = en.length ? '<strong>อารมณ์เดือนนี้ · ' + en.length + ' บันทึก</strong>' + moods.filter(m => cnt[m.id]).map(m => '<div class="ms-row"><span>' + m.label + '</span><i style="width:' + (cnt[m.id] / mx) * 100 + '%;background:' + m.color + '"></i><b>' + cnt[m.id] + '</b></div>').join('') : '<small>เดือนนี้ยังไม่มีบันทึก</small>';
    };
    const rc = renderCalendar; renderCalendar = function () { rc.apply(this, arguments); moodSum(); };
  }

  /* ============================================================================
   * src/app/99-boot.js
   * ดึงข้อมูลตำแหน่งจากคลาวด์ก่อนวาด 3D
   * ========================================================================== */
  
  async function bootApp() {
    // 1. ดึงข้อมูลล่าสุด (รวมถึงตำแหน่งรถ) จาก Supabase ก่อน
    const bootAccountId = myId;
    try {
      $('loading').innerHTML = '<div class="spinner"></div><span>กำลังเชื่อมต่อข้อมูลของคุณ...</span>';
      const res = await fetch(`${SUPABASE_URL}/rest/v1/road_of_days?id=eq.${encodeURIComponent(bootAccountId)}&select=data`, {
        headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}` }
      });
      const rows = await res.json();
      
      if (bootAccountId === myId && rows && rows.length > 0 && rows[0].data) {
        const cloudState = validData(rows[0].data);
        const cloudEntryIds = new Set(cloudState.entries.map(entry => entry.id));
        const hasPendingChanges = localStateAccountId === bootAccountId &&
          (localStorage.getItem(CLOUD_PENDING_KEY + bootAccountId) === '1' ||
            state.entries.some(entry => !cloudEntryIds.has(entry.id)));
        if (hasPendingChanges) {
          localStorage.setItem(CLOUD_PENDING_KEY + bootAccountId, '1');
        } else {
          state = cloudState;
          localStateAccountId = bootAccountId;
          localStorage.setItem(KEY, JSON.stringify(state)); // แบคอัพลง Local ไว้
        }
      }
    } catch (e) {
      console.warn('โหลดคลาวด์ไม่สำเร็จ ใช้ตำแหน่งจากเครื่องแทน');
    }

    $('loading').innerHTML = '<div class="spinner"></div><span>กำลังเตรียมเส้นทางเชียงรายให้คุณ…</span>';
    
    // 2. ข้อมูลพร้อมแล้ว สั่งรันฉาก 3D ณ ตำแหน่งปัจจุบัน
    init3D().catch(e => {
      $('loading').classList.remove('hidden');
      $('loading').innerHTML = '<p>ฉาก 3D ยังไม่พร้อม กรุณาโหลดหน้าใหม่<br>คุณยังใช้งานสมุดบันทึกและมุมพักใจได้</p>';
      console.error(e);
    });
    
    chooseMood(state.mood, false);
    stats();
    renderEntries();
    setView(location.hash.slice(1) || 'home');
  }

  bootApp();


  /* ============================================================================
   * UPGRADE: 2.5D Isometric Architectural Map Renderer (มีมิติสิ่งปลูกสร้าง + ป้องกันป้ายทับกัน)
   * ========================================================================== */
  (() => {
    // คำนวณเส้นโค้งถนน 2D สำหรับวาดลงแผนที่ (อิงตามพิกัดจริงในฉาก 3D)
    const MAP_W = 1000, MAP_H = 750;
    const rawPts = [
      [-52, 52], [-42, 44], [-30, 38], [-20, 28], [-8, 20], [4, 12], [16, 4], [26, -6],
      [20, -18], [6, -23], [0, -30], [2, -41], [22, -48], [38, -54], [54, -58], [86, -46],
      [200, -20], [350, 50], [450, 200], [400, 350], [250, 400], [100, 350], [150, 200],
      [102, 104], [64, 40], [16, 62], [-12, 68], [-43, 71], [-54, 61]
    ];

    function catmullRom(p0, p1, p2, p3, t) {
      const t2 = t * t, t3 = t2 * t;
      return [
        0.5 * ((2 * p1[0]) + (-p0[0] + p2[0]) * t + (2 * p0[0] - 5 * p1[0] + 4 * p2[0] - p3[0]) * t2 + (-p0[0] + 3 * p1[0] - 3 * p2[0] + p3[0]) * t3),
        0.5 * ((2 * p1[1]) + (-p0[1] + p2[1]) * t + (2 * p0[1] - 5 * p1[1] + 4 * p2[1] - p3[1]) * t2 + (-p0[1] + 3 * p1[1] - 3 * p2[1] + p3[1]) * t3)
      ];
    }

    // แปลงพิกัดโลก 3D (x, z) -> พิกัดแผนที่ 2D (mx, my)
    const minX = -85, maxX = 485, minZ = -90, maxZ = 435;
    const toMap = (wx, wz) => {
      const padX = 78, padY = 68;
      const sx = (MAP_W - padX * 2) / (maxX - minX);
      const sz = (MAP_H - padY * 2) / (maxZ - minZ);
      const s = Math.min(sx, sz);
      const ox = (MAP_W - (maxX - minX) * s) * 0.5;
      const oy = (MAP_H - (maxZ - minZ) * s) * 0.5 - 8;
      return [ox + (wx - minX) * s, oy + (wz - minZ) * s, s];
    };

    // สร้างจุดตัวอย่างละเอียดตามเส้นทาง t = 0..1
    // เริ่มจากจุดควบคุมคร่าว ๆ ก่อน (ใช้ตอนฉาก 3D ยังไม่โหลด) แล้วสลับเป็นเส้นทางจริงของฉากทันทีที่พร้อม
    // เพื่อให้ถนนช่วงขึ้นดอย/ภูชี้ฟ้าบนแผนที่ตรงกับถนนจริงในฉาก
    let SAMPLES = 600;
    const curveLut = [];
    let lutReal = false;
    for (let i = 0; i <= SAMPLES; i++) {
      const u = (i / SAMPLES) * rawPts.length;
      const idx = Math.floor(u) % rawPts.length;
      const f = u - Math.floor(u);
      const p0 = rawPts[(idx - 1 + rawPts.length) % rawPts.length];
      const p1 = rawPts[idx];
      const p2 = rawPts[(idx + 1) % rawPts.length];
      const p3 = rawPts[(idx + 2) % rawPts.length];
      const [wx, wz] = catmullRom(p0, p1, p2, p3, f);
      const [mx, my] = toMap(wx, wz);
      curveLut.push({ t: i / SAMPLES, wx, wz, mx, my });
    }
    const syncLut = () => {
      if (lutReal || typeof window.__ROD_ROUTE_XZ !== 'function') return;
      lutReal = true;
      SAMPLES = 1600;
      curveLut.length = 0;
      for (let i = 0; i <= SAMPLES; i++) {
        const [wx, wz] = window.__ROD_ROUTE_XZ((i / SAMPLES) % 1);
        const [mx, my] = toMap(wx, wz);
        curveLut.push({ t: i / SAMPLES, wx, wz, mx, my });
      }
    };

    const ptAtT = t => {
      syncLut();
      const norm = ((t % 1) + 1) % 1;
      const id = Math.min(SAMPLES - 1, Math.floor(norm * SAMPLES));
      const nx = curveLut[id + 1] || curveLut[0];
      const cur = curveLut[id];
      const dx = nx.mx - cur.mx, dy = nx.my - cur.my;
      const len = Math.hypot(dx, dy) || 1;
      return { x: cur.mx, y: cur.my, tx: dx / len, ty: dy / len, nx: -dy / len, ny: dx / len };
    };

    // --- ฟังก์ชันวาดโมเดลจำลอง 2.5D บนแผนที่ ---
    function draw3DBox(ctx, x, y, w, h, depth, topCol, frontCol, sideCol) {
      // เงาตกกระทบพื้น
      ctx.fillStyle = 'rgba(28, 45, 35, 0.22)';
      ctx.beginPath();
      ctx.ellipse(x + 3, y + h * 0.5 + 4, w * 0.65, h * 0.38, 0, 0, Math.PI * 2);
      ctx.fill();

      // ผนังด้านหน้า
      ctx.fillStyle = frontCol;
      ctx.fillRect(x - w / 2, y - h / 2, w, h);

      // ผนังด้านข้าง 2.5D
      ctx.fillStyle = sideCol;
      ctx.beginPath();
      ctx.moveTo(x + w / 2, y - h / 2);
      ctx.lineTo(x + w / 2 + depth, y - h / 2 - depth * 0.7);
      ctx.lineTo(x + w / 2 + depth, y + h / 2 - depth * 0.7);
      ctx.lineTo(x + w / 2, y + h / 2);
      ctx.closePath();
      ctx.fill();

      // หลังคาด้านบน 2.5D
      ctx.fillStyle = topCol;
      ctx.beginPath();
      ctx.moveTo(x - w / 2, y - h / 2);
      ctx.lineTo(x - w / 2 + depth, y - h / 2 - depth * 0.7);
      ctx.lineTo(x + w / 2 + depth, y - h / 2 - depth * 0.7);
      ctx.lineTo(x + w / 2, y - h / 2);
      ctx.closePath();
      ctx.fill();
    }

    function drawSchoolIcon(ctx, x, y) {
      // ลานสนามหญ้าโรงเรียน
      ctx.fillStyle = '#bfe0a8';
      ctx.strokeStyle = '#6b9c5c';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.roundRect(x - 18, y - 13, 36, 24, 5);
      ctx.fill();
      ctx.stroke();

      // อาคารเรียนทรงตัว U 2.5D + หลังคาสีแดงเลือดหมู
      draw3DBox(ctx, x, y - 4, 24, 8, 4, '#c0392b', '#fbf6ea', '#dfd6c3');
      // หน้าต่างอาคาร
      ctx.fillStyle = '#4a7c9b';
      for (let i = -8; i <= 8; i += 4) ctx.fillRect(x + i - 1, y - 6, 2.2, 3);
      // เสาธงและธงชาติไทยจิ๋วหน้าอาคาร
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(x, y + 7);
      ctx.lineTo(x, y - 3);
      ctx.stroke();
      ctx.fillStyle = '#e63946';
      ctx.fillRect(x + 0.5, y - 3, 6, 3.5);
      ctx.fillStyle = '#1d3557';
      ctx.fillRect(x + 0.5, y - 2, 6, 1.5);
    }

    function drawSevenIcon(ctx, x, y) {
      draw3DBox(ctx, x, y, 22, 13, 4, '#d5dbdb', '#ffffff', '#cfd6d6');
      // แถบสีส้ม-เขียว-แดง เอกลักษณ์ 7-11
      ctx.fillStyle = '#f58220'; ctx.fillRect(x - 11, y - 6.5, 22, 2);
      ctx.fillStyle = '#007f3f'; ctx.fillRect(x - 11, y - 4.5, 22, 2);
      ctx.fillStyle = '#e21b22'; ctx.fillRect(x - 11, y - 2.5, 22, 2);
      // ประตูกระจกฟ้า
      ctx.fillStyle = '#7ec8e3';
      ctx.fillRect(x - 4, y + 0.5, 8, 6);
      // ป้าย 7
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(x - 4, y - 5.5, 8, 5);
      ctx.fillStyle = '#e21b22';
      ctx.font = '900 7px Outfit, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('7', x, y - 1);
    }

    function drawTempleIcon(ctx, x, y) {
      // เงาวัด
      ctx.fillStyle = 'rgba(28, 45, 35, 0.2)';
      ctx.beginPath();
      ctx.ellipse(x + 2, y + 7, 13, 5, 0, 0, Math.PI * 2);
      ctx.fill();
      // ฐานวิหารสีขาว + หลังคาล้านนาซ้อน 2 ชั้น
      ctx.fillStyle = '#faf6eb';
      ctx.fillRect(x - 9, y - 1, 12, 7);
      ctx.fillStyle = '#b83227';
      ctx.beginPath();
      ctx.moveTo(x - 11, y - 1); ctx.lineTo(x - 3, y - 8); ctx.lineTo(x + 5, y - 1);
      ctx.closePath(); ctx.fill();
      ctx.strokeStyle = '#e8b93a'; ctx.lineWidth = 1.2; ctx.stroke();
      // องค์พระธาตุเจดีย์สีทองอร่ามด้านข้าง
      ctx.fillStyle = '#f2c12e';
      ctx.beginPath();
      ctx.moveTo(x + 4, y + 6);
      ctx.lineTo(x + 8, y - 10);
      ctx.lineTo(x + 12, y + 6);
      ctx.closePath();
      ctx.fill();
      ctx.beginPath();
      ctx.arc(x + 8, y - 11, 1.8, 0, Math.PI * 2);
      ctx.fill();
    }

    function drawMarketIcon(ctx, x, y) {
      draw3DBox(ctx, x, y + 2, 16, 7, 3, '#c89b5a', '#a6763c', '#7d5628');
      // กันสาดผ้าใบสลับสีแดง-ขาว
      for (let i = -2; i <= 1; i++) {
        ctx.fillStyle = i % 2 === 0 ? '#e63946' : '#ffffff';
        ctx.fillRect(x + i * 4, y - 5, 4, 4);
      }
      // กองผลไม้สีส้ม/เหลือง
      ctx.fillStyle = '#ff9f1c';
      ctx.beginPath();
      ctx.arc(x - 3, y, 2, 0, Math.PI * 2);
      ctx.arc(x + 2, y, 2, 0, Math.PI * 2);
      ctx.fill();
    }

    function drawMountain3D(ctx, x, y, r, h) {
      // ด้านรับแสง (ซ้าย)
      ctx.fillStyle = '#9ec296';
      ctx.beginPath();
      ctx.moveTo(x - r, y);
      ctx.lineTo(x, y - h);
      ctx.lineTo(x + r * 0.15, y + r * 0.22);
      ctx.closePath();
      ctx.fill();
      // ด้านเงา (ขวา)
      ctx.fillStyle = '#7ba375';
      ctx.beginPath();
      ctx.moveTo(x, y - h);
      ctx.lineTo(x + r, y);
      ctx.lineTo(x + r * 0.15, y + r * 0.22);
      ctx.closePath();
      ctx.fill();
      // หมอกจางๆ คลุมเชิงเขา
      ctx.fillStyle = 'rgba(255,255,255,0.35)';
      ctx.beginPath();
      ctx.ellipse(x, y + 2, r * 0.95, 5, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    // ระบบจองพื้นที่ป้ายข้อความ (ป้องกันป้ายซ้อนทับกัน 100%)
    function createLabelPlacer(ctx) {
      const boxes = [];
      return function placeLabel(text, anchorX, anchorY, bg, fg, borderCol, bold = false, prefDx = 16, prefDy = -4) {
        ctx.font = (bold ? '700 13px ' : '600 11px ') + '"Noto Sans Thai", sans-serif';
        const tw = ctx.measureText(text).width;
        const bw = tw + 24, bh = bold ? 22 : 18;
        const candidates = [
          [prefDx, prefDy], [18, -14], [18, 12], [-bw - 14, -4],
          [-bw - 14, -18], [-bw - 14, 14], [-bw * 0.5, -24], [-bw * 0.5, 22]
        ];
        let bestX = anchorX + prefDx, bestY = anchorY + prefDy;
        for (const [ox, oy] of candidates) {
          const cx = Math.max(12, Math.min(MAP_W - bw - 12, anchorX + ox));
          const cy = Math.max(18, Math.min(MAP_H - bh - 48, anchorY + oy));
          const hit = boxes.some(b => !(cx + bw + 4 < b.x || cx - 4 > b.x + b.w || cy + bh + 3 < b.y || cy - 3 > b.y + b.h));
          if (!hit) { bestX = cx; bestY = cy; break; }
        }
        boxes.push({ x: bestX, y: bestY, w: bw, h: bh });

        // เส้นชี้จากป้ายไปยังตัวอาคาร (Leader Line) หากป้ายถูกขยับออกห่าง
        const centerLabelX = bestX + bw * 0.5, centerLabelY = bestY + bh * 0.5;
        if (Math.hypot(centerLabelX - anchorX, centerLabelY - anchorY) > 26) {
          ctx.strokeStyle = borderCol || 'rgba(60,85,70,0.45)';
          ctx.lineWidth = 1.2;
          ctx.beginPath();
          ctx.moveTo(anchorX, anchorY);
          ctx.lineTo(centerLabelX, centerLabelY);
          ctx.stroke();
        }

        // กล่องป้ายชื่อมีเงา
        ctx.save();
        ctx.shadowColor = 'rgba(20, 35, 28, 0.16)';
        ctx.shadowBlur = 6;
        ctx.shadowOffsetY = 2;
        ctx.fillStyle = bg;
        ctx.beginPath();
        ctx.roundRect(bestX, bestY, bw, bh, bh * 0.5);
        ctx.fill();
        ctx.restore();

        if (borderCol) {
          ctx.strokeStyle = borderCol;
          ctx.lineWidth = 1.4;
          ctx.beginPath();
          ctx.roundRect(bestX, bestY, bw, bh, bh * 0.5);
          ctx.stroke();
        }

        // จุดไอคอนเวกเตอร์นำหน้าป้าย
        ctx.fillStyle = borderCol || fg;
        ctx.beginPath();
        ctx.arc(bestX + 9, bestY + bh * 0.5, bold ? 3.5 : 2.8, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = fg;
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';
        ctx.fillText(text, bestX + 16, bestY + bh * 0.5 + 0.5);
      };
    }

    function renderEnhancedMap(cv) {
      if (!cv) return;
      syncLut();
      if (cv.width !== MAP_W || cv.height !== MAP_H) {
        cv.width = MAP_W;
        cv.height = MAP_H;
      }
      const ctx = cv.getContext('2d');
      ctx.clearRect(0, 0, MAP_W, MAP_H);

      // 1. พื้นหลังภูมิประเทศไล่เฉด + เส้นชั้นความสูง (Topographic Contour Lines)
      const bgGrad = ctx.createRadialGradient(MAP_W * 0.52, MAP_H * 0.46, 40, MAP_W * 0.5, MAP_H * 0.5, 620);
      bgGrad.addColorStop(0, '#f3f8ec');
      bgGrad.addColorStop(0.65, '#e5efdc');
      bgGrad.addColorStop(1, '#d4e4c8');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, MAP_W, MAP_H);

      // ตารางพิกัดแผนที่จางๆ
      ctx.strokeStyle = 'rgba(95, 130, 100, 0.08)';
      ctx.lineWidth = 1;
      for (let gx = 0; gx < MAP_W; gx += 50) { ctx.beginPath(); ctx.moveTo(gx, 0); ctx.lineTo(gx, MAP_H); ctx.stroke(); }
      for (let gy = 0; gy < MAP_H; gy += 50) { ctx.beginPath(); ctx.moveTo(0, gy); ctx.lineTo(MAP_W, gy); ctx.stroke(); }

      // 2. วาดโซนเกษตรกรรมมีลวดลาย (แปลงนาขั้นบันได, ไร่ข้าวโพด, สวนผลไม้, สวนมะพร้าว)
      const drawZonePatch = (tCenter, offDist, rx, ry, fillCol, patternType) => {
        const p = ptAtT(tCenter);
        const cx = p.x + p.nx * offDist, cy = p.y + p.ny * offDist;
        ctx.save();
        ctx.beginPath();
        ctx.ellipse(cx, cy, rx, ry, 0.2, 0, Math.PI * 2);
        ctx.fillStyle = fillCol;
        ctx.fill();
        ctx.strokeStyle = 'rgba(90, 130, 75, 0.25)';
        ctx.lineWidth = 1.5;
        ctx.stroke();
        ctx.clip();

        if (patternType === 'paddy') {
          // ตารางคันนาและต้นข้าว
          ctx.strokeStyle = 'rgba(110, 160, 80, 0.35)';
          for (let x = cx - rx; x <= cx + rx; x += 14) { ctx.beginPath(); ctx.moveTo(x, cy - ry); ctx.lineTo(x, cy + ry); ctx.stroke(); }
          for (let y = cy - ry; y <= cy + ry; y += 12) { ctx.beginPath(); ctx.moveTo(cx - rx, y); ctx.lineTo(cx + rx, y); ctx.stroke(); }
        } else if (patternType === 'corn') {
          ctx.strokeStyle = 'rgba(210, 175, 55, 0.45)';
          ctx.lineWidth = 2;
          for (let y = cy - ry; y <= cy + ry; y += 8) { ctx.beginPath(); ctx.moveTo(cx - rx, y); ctx.lineTo(cx + rx, y + 6); ctx.stroke(); }
        } else if (patternType === 'orchard') {
          ctx.fillStyle = 'rgba(75, 135, 65, 0.45)';
          for (let x = cx - rx + 10; x < cx + rx; x += 16)
            for (let y = cy - ry + 10; y < cy + ry; y += 16) {
              ctx.beginPath(); ctx.arc(x, y, 4.5, 0, Math.PI * 2); ctx.fill();
            }
        }
        ctx.restore();
      };

      drawZonePatch(0.60, 42, 75, 42, 'rgba(182, 224, 150, 0.55)', 'paddy');   // โซนทุ่งนา
      drawZonePatch(0.69, -45, 72, 44, 'rgba(238, 222, 145, 0.50)', 'corn');   // โซนไร่ข้าวโพด
      drawZonePatch(0.79, -38, 68, 40, 'rgba(168, 214, 148, 0.52)', 'orchard');// โซนสวนผลไม้
      drawZonePatch(0.86, 38, 62, 36, 'rgba(155, 212, 168, 0.48)', 'orchard'); // โซนสวนมะพร้าว

      // 3. วาดแนวภูเขา 3 มิติ (Low-Poly Shaded Mountains) รอบนอกและกลางหุบเขา
      const mountains = [
        [155, 135, 36, 28], [210, 155, 28, 22], [115, 240, 32, 25],
        [520, 230, 46, 36], [565, 255, 34, 26], [480, 260, 30, 22],
        [790, 175, 42, 34], [835, 200, 30, 24], [740, 560, 40, 32],
        [210, 520, 38, 30], [255, 545, 28, 22], [580, 480, 36, 28]
      ];
      mountains.forEach(([mx, my, r, h]) => drawMountain3D(ctx, mx, my, r, h));

      // 4. วาดแม่น้ำสายกว้าง + ตลิ่งทราย + คลื่นน้ำ + เรือหางยาวแล่นในแม่น้ำ (t ≈ 0.71 - 0.81)
      ctx.save();
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.beginPath();
      for (let t = 0.708; t <= 0.812; t += 0.003) {
        const p = ptAtT(t);
        const rx = p.x - p.nx * 32, ry = p.y - p.ny * 32;
        if (t === 0.708) ctx.moveTo(rx, ry);
        else ctx.lineTo(rx, ry);
      }
      ctx.strokeStyle = '#d8c396'; ctx.lineWidth = 22; ctx.stroke(); // ตลิ่งทราย
      ctx.strokeStyle = '#5da9c9'; ctx.lineWidth = 16; ctx.stroke(); // ลำน้ำสีฟ้า
      ctx.strokeStyle = '#89cbe3'; ctx.lineWidth = 6; ctx.stroke();  // ร่องน้ำตื้นสะท้อนแสง

      // ท่าเรือไม้และเรือหางยาวจำลองบนแม่น้ำ
      const pierP = ptAtT(0.752);
      const px = pierP.x - pierP.nx * 26, py = pierP.y - pierP.ny * 26;
      ctx.fillStyle = '#8d5b34';
      ctx.fillRect(px - 7, py - 5, 14, 5);
      // เรือไม้ 2 ลำในแม่น้ำ
      for (const bt of [0.735, 0.772]) {
        const bp = ptAtT(bt);
        const bx = bp.x - bp.nx * 32, by = bp.y - bp.ny * 32;
        ctx.save();
        ctx.translate(bx, by);
        ctx.rotate(Math.atan2(bp.ty, bp.tx));
        ctx.fillStyle = '#6e4726';
        ctx.beginPath();
        ctx.moveTo(-8, 0); ctx.lineTo(-4, -3); ctx.lineTo(5, -3); ctx.lineTo(9, 0); ctx.lineTo(5, 3); ctx.lineTo(-4, 3);
        ctx.closePath(); ctx.fill();
        ctx.fillStyle = '#e76f51';
        ctx.fillRect(-3, -2, 5, 4); // หลังคาเรือ
        ctx.restore();
      }
      ctx.restore();

      // 4.2 วาดหนองน้ำใหญ่โซนสวนมะพร้าว (โค้งตามแนวถนน เว้นระยะห่างจากถนนชัดเจน) & ศาลากลางน้ำ + ยอยักษ์
      {
        ctx.save();
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.beginPath();
        for (let t = 0.865; t <= 0.905; t += 0.004) {
          const p = ptAtT(t);
          const wx = p.x + p.nx * 30, wy = p.y + p.ny * 30;
          if (t === 0.865) ctx.moveTo(wx, wy);
          else ctx.lineTo(wx, wy);
        }
        ctx.strokeStyle = '#cbb288'; ctx.lineWidth = 22; ctx.stroke(); // ขอบคันดินทรายและพงอ้อ
        ctx.strokeStyle = '#3b92b8'; ctx.lineWidth = 16; ctx.stroke(); // ผิวน้ำลึกสีฟ้าคราม
        ctx.strokeStyle = '#7ac5dc'; ctx.lineWidth = 8; ctx.stroke();  // ร่องน้ำตื้นสะท้อนแสง

        // สะพานไม้ไผ่สาน + ศาลากลางน้ำทรงล้านนา (t ≈ 0.888)
        const lkP = ptAtT(0.888);
        const lkX = lkP.x + lkP.nx * 29, lkY = lkP.y + lkP.ny * 29;
        ctx.beginPath();
        ctx.moveTo(lkP.x + lkP.nx * 14, lkP.y + lkP.ny * 14);
        ctx.lineTo(lkX, lkY);
        ctx.strokeStyle = '#8d6e4b'; ctx.lineWidth = 2.6; ctx.stroke();

        // หลังคาศาลากลางน้ำ 2 ชั้น
        ctx.fillStyle = '#5c3c20';
        ctx.beginPath();
        ctx.arc(lkX, lkY, 4.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#8f6239';
        ctx.beginPath();
        ctx.arc(lkX, lkY, 2.6, 0, Math.PI * 2);
        ctx.fill();

        // หอคอยและคานยอยักษ์ (t ≈ 0.873)
        const yoP = ptAtT(0.873);
        const yoX = yoP.x + yoP.nx * 22, yoY = yoP.y + yoP.ny * 22;
        const yoNetX = yoP.x + yoP.nx * 31, yoNetY = yoP.y + yoP.ny * 31;
        ctx.strokeStyle = '#5a3d1e'; ctx.lineWidth = 2.0;
        ctx.beginPath();
        ctx.moveTo(yoX, yoY);
        ctx.lineTo(yoNetX, yoNetY);
        ctx.stroke();
        ctx.strokeStyle = 'rgba(232, 224, 200, 0.85)'; ctx.lineWidth = 1.2;
        ctx.strokeRect(yoNetX - 3, yoNetY - 3, 6, 6);
        ctx.restore();
      }

      // 5. วาดถนนไฮเวย์มีมิติ (เงาใต้ถนน + ขอบไหล่ทาง + ผิวลาดยางมะตอย + เส้นแบ่งเลน)
      const drawRoadSegment = (iStart, iEnd, isMain) => {
        ctx.beginPath();
        for (let i = iStart; i <= iEnd; i++) {
          const q = curveLut[i % curveLut.length];
          if (i === iStart) ctx.moveTo(q.mx, q.my);
          else ctx.lineTo(q.mx, q.my);
        }
        // เงาถนน
        ctx.strokeStyle = 'rgba(30, 48, 38, 0.18)';
        ctx.lineWidth = 20;
        ctx.stroke();
        // ขอบทางสีครีม
        ctx.strokeStyle = '#fcf8ec';
        ctx.lineWidth = 16;
        ctx.stroke();
        // ผิวจราจรแยกสีชัดเจน (สายหลักสีเขียวเข้มสุขุม / สายชนบทสีเทาอมเขียว)
        ctx.strokeStyle = isMain ? '#3b6e52' : '#708278';
        ctx.lineWidth = 11;
        ctx.stroke();
        // เส้นประแบ่งเลนกลางถนน
        ctx.save();
        ctx.setLineDash([7, 7]);
        ctx.strokeStyle = isMain ? '#f7e39c' : '#eef2eb';
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.restore();
      };
      const splitIdx = Math.floor(0.55 * SAMPLES);
      drawRoadSegment(splitIdx, SAMPLES, false); // เส้นทางชนบทต่อจากเวียงแก่น
      drawRoadSegment(0, splitIdx, true);        // เส้นทางหลัก จันจว้า -> เวียงแก่น

      // 6. วาดสิ่งปลูกสร้าง 2.5D ลงตามพิกัดจริงบนเส้นทาง พร้อมป้ายชื่อไม่ทับกัน
      const placeLabel = createLabelPlacer(ctx);

      // จุดสะพานและอุโมงค์ต้นไม้ใช้ค่า t เดียวกับตำแหน่งในฉาก 3D
      const bridgePoint = ptAtT(0.735);
      ctx.save();
      ctx.translate(bridgePoint.x, bridgePoint.y);
      ctx.rotate(Math.atan2(bridgePoint.ty, bridgePoint.tx));
      ctx.strokeStyle = '#4a95bc';
      ctx.lineWidth = 5;
      ctx.lineCap = 'round';
      for (const y of [-12, 12]) {
        ctx.beginPath();
        ctx.moveTo(-26, y);
        ctx.quadraticCurveTo(-10, y - 2, 4, y);
        ctx.stroke();
      }
      draw3DBox(ctx, 0, 0, 42, 9, 6, '#ded8c4', '#858d86', '#68746e');
      ctx.fillStyle = '#40594b';
      for (const x of [-18, -9, 0, 9, 18]) {
        ctx.fillRect(x - 1, -8, 2, 7);
        ctx.fillRect(x - 1, 1, 2, 7);
      }
      ctx.fillRect(-22, -9, 44, 2);
      ctx.fillRect(-22, 7, 44, 2);
      ctx.restore();
      placeLabel('สะพานข้ามลำธาร', bridgePoint.x, bridgePoint.y, '#f4fbff', '#24536b', '#68a9c2', true, 28, -24);

      const tunnelPoint = ptAtT(0.32);
      ctx.save();
      ctx.translate(tunnelPoint.x, tunnelPoint.y);
      ctx.rotate(Math.atan2(tunnelPoint.ty, tunnelPoint.tx));
      ctx.fillStyle = 'rgba(46, 85, 52, 0.18)';
      ctx.beginPath();
      ctx.ellipse(0, 2, 30, 13, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#75543a';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(-24, 8);
      ctx.lineTo(-24, -4);
      ctx.quadraticCurveTo(0, -31, 24, -4);
      ctx.lineTo(24, 8);
      ctx.stroke();
      ctx.fillStyle = '#4f8751';
      for (const [x, y, r] of [[-21, -8, 9], [-12, -18, 10], [0, -22, 11], [12, -18, 10], [21, -8, 9]]) {
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = 'rgba(205, 231, 169, 0.58)';
        ctx.beginPath();
        ctx.arc(x - 2, y - 3, Math.max(2, r * 0.38), 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#4f8751';
      }
      ctx.restore();
      placeLabel('อุโมงค์ต้นไม้', tunnelPoint.x, tunnelPoint.y, '#f2faeb', '#315d37', '#79a76b', true, 26, -28);

      // 6.1 โรงเรียนชนบท 2 แห่ง (t = 0.64, 0.81)
      [
        { t: T_SCHOOL_FIELD, off: 28, name: 'โรงเรียนชนบท 1 (ทุ่งนา)' },
        { t: 0.81, off: 28, name: 'โรงเรียนชนบท 2 (สวนผลไม้)' }
      ].forEach(sc => {
        const p = ptAtT(sc.t);
        const sx = p.x + p.nx * sc.off, sy = p.y + p.ny * sc.off;
        drawSchoolIcon(ctx, sx, sy);
        placeLabel(sc.name, sx, sy, '#ffffff', '#2c4c3b', '#8ab096', false, 22, -6);
      });

      // 6.2 ร้าน 7-Eleven (t = 0.016)
      [0.016].forEach(t => {
        const p = ptAtT(t);
        const sx = p.x - p.nx * 24, sy = p.y - p.ny * 24;
        drawSevenIcon(ctx, sx, sy);
        placeLabel('7-Eleven', sx, sy, '#fff8f0', '#007f3f', '#f58220', false, 16, -6);
      });

      // 6.3 วัดล้านนา 5 แห่ง (t = 0.14, 0.33, 0.52, 0.70, 0.842)
      [
        [0.14, 24, 'วัดโบราณเชียงแสน'],
        [0.33, -24, 'วัดริมโขง'],
        [0.52, 26, 'วัดพระธาตุเวียงแก่น'],
        [0.70, -24, 'วัดทุ่งรวงทอง'],
        [0.842, 24, 'วัดป่าสักคำ']
      ].forEach(([t, off, label]) => {
        const p = ptAtT(t);
        const wx = p.x + p.nx * off, wy = p.y + p.ny * off;
        drawTempleIcon(ctx, wx, wy);
        placeLabel(label, wx, wy, '#fffdf2', '#8a5a12', '#e8b93a', false, off > 0 ? 15 : -95, -6);
      });

      // 6.4 แผงผลไม้สดริมทาง (t = 0.27, 0.58, 0.83)
      [
        [0.27, -20, 'แผงผลไม้สด'],
        [0.58, -22, 'ตลาดผลไม้ชาวบ้าน'],
        [0.83, -22, 'แผงส้มโอเวียงแก่น']
      ].forEach(([t, off, label]) => {
        const p = ptAtT(t);
        const mx = p.x + p.nx * off, my = p.y + p.ny * off;
        drawMarketIcon(ctx, mx, my);
        placeLabel(label, mx, my, '#fff5f2', '#9e3228', '#f0a399', false, 14, -4);
      });

      // แนวสันเขาดอยผาตั้ง-ภูชี้ฟ้าตามช่วงปลายเส้นทาง
      [
        [0.936, 30, 30, 34],
        [0.952, -28, 34, 42],
        [0.965, 28, 32, 38]
      ].forEach(([t, off, radius, height]) => {
        const p = ptAtT(t);
        drawMountain3D(ctx, p.x + p.nx * off, p.y + p.ny * off, radius, height);
      });

      // 6.5 ป้ายจุดแวะหลักตลอดเส้นทาง เด่นชัดที่สุด
      ROUTE.forEach((s, idx) => {
        const p = ptAtT(s.t);
        // วงแหวนหมุดเมืองหลัก
        ctx.fillStyle = '#ffffff';
        ctx.beginPath(); ctx.arc(p.x, p.y, 10, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = s.color;
        ctx.beginPath(); ctx.arc(p.x, p.y, 7, 0, Math.PI * 2); ctx.fill();

        const offsets = [
          [-145, 6],   // จันจว้า (ดึงไปซ้ายล่างไม่ให้ชนเชียงแสน)
          [-160, -18], // เชียงแสน (ดึงไปซ้ายบน)
          [-165, -12], // เชียงของ (ดึงออกทางซ้าย)
          [18, -26],   // เวียงแก่น
          [18, -26],   // ดอยผาตั้ง
          [18, -26]    // ภูชี้ฟ้า
        ];
        const [ox, oy] = offsets[idx] || [16, -10];
        placeLabel(s.name + ' (' + s.km + ' กม.)', p.x, p.y, '#ffffff', '#1e3f2f', s.color, true, ox, oy);
      });

      // 7. วาดตำแหน่งรถ EV ปัจจุบันของผู้เล่น (มีวงเรดาร์กระพริบ + ตัวรถ 3 มิติหันตามทิศถนน)
      const carP = ptAtT(state.routeT);
      const pulse = 14 + Math.sin(performance.now() * 0.006) * 4;
      ctx.fillStyle = 'rgba(230, 57, 70, 0.24)';
      ctx.beginPath(); ctx.arc(carP.x, carP.y, pulse, 0, Math.PI * 2); ctx.fill();

      ctx.save();
      ctx.translate(carP.x, carP.y);
      ctx.rotate(Math.atan2(carP.ty, carP.tx));
      // เงารถ
      ctx.fillStyle = 'rgba(0,0,0,0.3)';
      ctx.fillRect(-10, -5, 20, 12);
      // ตัวถังรถ EV สีแดง-ขาวโดดเด่นบนแผนที่
      ctx.fillStyle = '#d62828';
      ctx.beginPath(); ctx.roundRect(-10, -6, 20, 12, 4); ctx.fill();
      ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 2; ctx.stroke();
      // หลังคาสีครีม + กระจกหน้ารถ
      ctx.fillStyle = '#fff3d1';
      ctx.fillRect(-5, -4.5, 10, 9);
      ctx.fillStyle = '#457b9d';
      ctx.fillRect(3, -4, 3, 8);
      ctx.restore();

      placeLabel('รถของคุณอยู่ที่นี่', carP.x, carP.y, '#d62828', '#ffffff', '#ffffff', true, 16, -24);

      // 8. เข็มทิศ (Compass Rose) มุมขวาบนของแผนที่
      const cx = MAP_W - 48, cy = 48;
      ctx.fillStyle = 'rgba(255,255,255,0.88)';
      ctx.beginPath(); ctx.arc(cx, cy, 22, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = '#cad6c8'; ctx.lineWidth = 1.5; ctx.stroke();
      ctx.fillStyle = '#d62828';
      ctx.beginPath(); ctx.moveTo(cx, cy - 15); ctx.lineTo(cx - 5, cy); ctx.lineTo(cx + 5, cy); ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#5c7065';
      ctx.beginPath(); ctx.moveTo(cx, cy + 15); ctx.lineTo(cx - 5, cy); ctx.lineTo(cx + 5, cy); ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#1e3f2f';
      ctx.font = '800 10px Outfit, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('N', cx, cy - 16);
    }

  })();

})();