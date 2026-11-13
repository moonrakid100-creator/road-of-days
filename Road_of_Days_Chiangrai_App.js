/* Road of Days - application logic */
(() => {
  'use strict';

  /* Edit this file and Road_of_Days_Scene_Models.js, then run npm run build:app. */

  /* ============================================================================
   * app/01-constants-moods.js
   * ค่าคงที่พื้นฐาน: ตัวช่วย $ (getElementById), KEY ของ localStorage และรายการอารมณ์ (moods) พร้อมสี/ข้อความ/ธีมฉาก
   * (ไฟล์นี้ถูกต่อรวมเป็น closure เดียวกับไฟล์อื่น — ไม่ต้อง import/export · ลำดับไฟล์ดู scripts/build-app.js)
   * ========================================================================== */

  const $ = id => document.getElementById(id),
    KEY = 'road-of-days-3d-v4';
  const CLOUD_PENDING_KEY = 'road-of-days-cloud-pending:';
  const PLACES_PENDING_KEY = 'road-of-days-places-pending:';
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
   * app/02-constants-route.js
   * ค่าคงที่เส้นทาง: ระยะทาง/ความเร็ว (KM_TOTAL, KMH), จุดแวะ (ROUTE)
   * (ไฟล์นี้ถูกต่อรวมเป็น closure เดียวกับไฟล์อื่น — ไม่ต้อง import/export · ลำดับไฟล์ดู scripts/build-app.js)
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
   * app/03-state-storage.js
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
  function cloudReadFailureMessage(error) {
    const status = error instanceof Error && /^Supabase Fetch Error: (\d+)$/.exec(error.message);
    if (status) {
      const code = Number(status[1]);
      if (code === 401) return 'Supabase ปฏิเสธ API key (HTTP 401)';
      if (code === 403) return 'ไม่มีสิทธิ์อ่านข้อมูล · ตรวจ RLS Policy (HTTP 403)';
      if (code === 404) return 'ไม่พบตารางหรือ REST endpoint (HTTP 404)';
      if (code === 429) return 'คำขอถูกจำกัดชั่วคราว (HTTP 429)';
      if (code >= 500) return `Supabase ขัดข้องชั่วคราว (HTTP ${code})`;
      return `Supabase ตอบกลับผิดพลาด (HTTP ${code})`;
    }
    if (error instanceof TypeError) return 'เชื่อมต่อ Supabase ไม่ได้ · ตรวจอินเทอร์เน็ตหรือ CORS';
    if (error instanceof SyntaxError) return 'ข้อมูลตอบกลับจาก Supabase อ่านไม่ได้';
    return 'ข้อมูลจาก Supabase ไม่ถูกต้อง';
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
      places: [],
      placesUpdatedAt: 0,
      lanterns: 0,
      mood: 'calm',
      night: false,
      routeT: 0.0112,
      routeUpdatedAt: 0,
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
    if (!s || !Array.isArray(s.entries) || s.entries.length > 10000 ||
      (s.places !== undefined && (!Array.isArray(s.places) || s.places.length > 200))) throw Error('format');
    const ids = new Set();
    s.entries.forEach(e => {
      if (!e || typeof e.id !== 'string' || ids.has(e.id) || !/^\d{4}-\d{2}-\d{2}$/.test(e.date) || !Number.isFinite(new Date(e.date + 'T12:00:00').getTime()) || typeof e.title !== 'string' || !e.title.trim() || e.title.length > 90 || typeof e.text !== 'string' || !e.text.trim() || e.text.length > 3000 || typeof e.place !== 'string' || e.place.length > 100 || !moods.some(m => m.id === e.mood) || typeof e.routeT !== 'number' || e.routeT < 0 || e.routeT > 1) throw Error('entry');
      ids.add(e.id);
    });
    const placeIds = new Set(),
      placeNames = new Set();
    const places = (s.places || []).map(place => {
      if (!place || typeof place.id !== 'string' || !place.id || place.id.length > 80 ||
        placeIds.has(place.id) || typeof place.name !== 'string' || !place.name.trim() ||
        place.name.length > 80 ||
        (place.note !== undefined && place.note !== null && typeof place.note !== 'string') ||
        (place.note || '').length > 160 ||
        placeNames.has(place.name.trim().toLocaleLowerCase())) throw Error('place');
      placeIds.add(place.id);
      placeNames.add(place.name.trim().toLocaleLowerCase());
      return { id: place.id, name: place.name.trim(), note: (place.note || '').trim() };
    });
    return {
      entries: s.entries.map(e => ({ id: e.id, date: e.date, title: e.title, text: e.text, place: e.place, mood: e.mood, routeT: e.routeT, fav: !!e.fav })),
      places,
      placesUpdatedAt: Number.isSafeInteger(s.placesUpdatedAt) && s.placesUpdatedAt >= 0 ? s.placesUpdatedAt : 0,
      lanterns: Number.isSafeInteger(s.lanterns) && s.lanterns >= 0 ? s.lanterns : 0,
      mood: moods.some(m => m.id === s.mood) ? s.mood : 'calm',
      night: !!s.night,
      routeT: Math.min(0.98, Math.max(0.01, +s.routeT || 0.0112)),
      routeUpdatedAt: Number.isSafeInteger(s.routeUpdatedAt) && s.routeUpdatedAt >= 0 ? s.routeUpdatedAt : 0,
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
  let lastRouteCloudSaveAt = 0;

  // 2. ฟังก์ชันดึงข้อมูลจาก Cloud
  async function loadOnline() {
    const accountId = myId;
    const localRouteAtRequest = state.routeUpdatedAt;
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
        const keepLocalPlaces = localStateAccountId === accountId &&
          (localStorage.getItem(PLACES_PENDING_KEY + accountId) === '1' ||
            state.placesUpdatedAt > cloudState.placesUpdatedAt);
        if (keepLocalPlaces) {
          cloudState.places = state.places;
          cloudState.placesUpdatedAt = state.placesUpdatedAt;
        }
        const keepLocalRoute = localStateAccountId === accountId &&
          state.routeUpdatedAt > cloudState.routeUpdatedAt;
        if (keepLocalRoute || (localStateAccountId === accountId && localRouteAtRequest > cloudState.routeUpdatedAt)) {
          cloudState.routeT = state.routeT;
          cloudState.routeUpdatedAt = state.routeUpdatedAt;
        } else {
          lastRouteCloudSaveAt = cloudState.routeUpdatedAt;
        }
        const cloudEntryIds = new Set(cloudState.entries.map(entry => entry.id));
        const hasPendingChanges = localStateAccountId === accountId &&
          (localStorage.getItem(CLOUD_PENDING_KEY + accountId) === '1' ||
            state.entries.some(entry => !cloudEntryIds.has(entry.id)) ||
            keepLocalPlaces);
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
        if (typeof renderSavedPlaces === 'function') renderSavedPlaces();
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
      const failure = cloudReadFailureMessage(e);
      setSyncStatus('error', failure);
      toast(svgInline('alert') + ' ' + failure + ' · ข้อมูลในเครื่องยังอยู่');
      return false;
    }
  }

  setTimeout(loadOnline, 600);

  // 3. ฟังก์ชันยิงข้อมูลขึ้น Supabase (Upsert)
  async function saveOnline(manual = false) {
    if (isReloading) return false;
    const accountId = myId;
    const savedRouteAt = state.routeUpdatedAt;
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
        if (accountId === myId) {
          localStateAccountId = accountId;
          lastRouteCloudSaveAt = Math.max(lastRouteCloudSaveAt, savedRouteAt);
        }
        localStorage.removeItem(CLOUD_PENDING_KEY + accountId);
        localStorage.removeItem(PLACES_PENDING_KEY + accountId);
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

  // เก็บตำแหน่งรถก่อนพักแท็บ แล้วดึงข้อมูลล่าสุดเมื่อกลับมา
  document.addEventListener('visibilitychange', () => {
    if (document.hidden && !isReloading) {
      persist(true);
    } else if (syncStatusState.mode !== 'syncing') {
      loadOnline();
    }
  });
  
  // ส่ง checkpoint ล่าสุดก่อนปิดหน้า; fetch ใช้ keepalive ใน saveOnline
  window.addEventListener('pagehide', () => {
    if (!isReloading) persist(true);
  });

  setInterval(() => {
    if (document.hidden || syncStatusState.mode === 'syncing') return;
    if (isCloudSynced && state.routeUpdatedAt > lastRouteCloudSaveAt) persist(true);
    else loadOnline();
  }, 15000);

  /* ============================================================================
   * app/04-utils.js
   * ฟังก์ชันช่วยเล็ก ๆ: toast, วันที่ (localDate / prettyDate), moodOf, svgIcon
   * (ไฟล์นี้ถูกต่อรวมเป็น closure เดียวกับไฟล์อื่น — ไม่ต้อง import/export · ลำดับไฟล์ดู scripts/build-app.js)
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
   * app/05-mood-selector.js
   * วันที่หน้าแรก, เลือกอารมณ์ (chooseMood) และสร้างปุ่มอารมณ์
   * (ไฟล์นี้ถูกต่อรวมเป็น closure เดียวกับไฟล์อื่น — ไม่ต้อง import/export · ลำดับไฟล์ดู scripts/build-app.js)
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
   * app/06-navigation.js
   * สลับหน้า (setView: home / journal / rest / memory), hash routing และปุ่มนำทาง
   * (ไฟล์นี้ถูกต่อรวมเป็น closure เดียวกับไฟล์อื่น — ไม่ต้อง import/export · ลำดับไฟล์ดู scripts/build-app.js)
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
   * app/07-journal-form.js
   * ฟอร์มเขียนบันทึก: นับตัวอักษร, ล้างฟอร์ม, บันทึก/แก้ไข (submit) และ stats
   * (ไฟล์นี้ถูกต่อรวมเป็น closure เดียวกับไฟล์อื่น — ไม่ต้อง import/export · ลำดับไฟล์ดู scripts/build-app.js)
   * ========================================================================== */

  $('entryText').oninput = () =>
    ($('charCount').textContent = $('entryText').value.length.toLocaleString() + ' / 3,000');
  let editingPlaceId = null;
  function markPlacesUpdated() {
    state.placesUpdatedAt = Math.max(Date.now(), state.placesUpdatedAt + 1);
    try {
      localStorage.setItem(PLACES_PENDING_KEY + myId, '1');
    } catch (e) {
      console.error('Unable to queue place changes for cloud sync:', e);
    }
  }
  function resetSavedPlaceForm() {
    editingPlaceId = null;
    $('savedPlaceForm').reset();
    $('savedPlaceSubmit').textContent = 'เพิ่มสถานที่';
    $('savedPlaceCancel').hidden = true;
  }
  function renderSavedPlaces() {
    const list = $('savedPlaceList'),
      options = $('savedPlaceOptions');
    if (!list || !options) return;
    list.replaceChildren();
    options.replaceChildren();
    state.places.forEach(place => {
      const option = document.createElement('option');
      option.value = place.name;
      option.label = place.note || place.name;
      options.append(option);

      const item = document.createElement('article');
      item.className = 'saved-place-item';
      const copy = document.createElement('div');
      copy.className = 'saved-place-copy';
      const name = document.createElement('strong');
      name.textContent = place.name;
      copy.append(name);
      if (place.note) {
        const note = document.createElement('span');
        note.textContent = place.note;
        copy.append(note);
      }
      const actions = document.createElement('div');
      actions.className = 'saved-place-actions';
      const edit = document.createElement('button');
      edit.type = 'button';
      edit.className = 'secondary';
      edit.textContent = 'แก้ไข';
      edit.onclick = () => {
        editingPlaceId = place.id;
        $('savedPlaceName').value = place.name;
        $('savedPlaceNote').value = place.note;
        $('savedPlaceSubmit').textContent = 'บันทึกการแก้ไข';
        $('savedPlaceCancel').hidden = false;
        $('savedPlaceName').focus();
      };
      const remove = document.createElement('button');
      remove.type = 'button';
      remove.className = 'secondary danger';
      remove.textContent = 'ลบ';
      remove.onclick = () => ask('ลบสถานที่ “' + place.name + '” ออกจากรายการหรือไม่? บันทึกเดิมจะยังคงชื่อสถานที่ไว้', () => {
        state.places = state.places.filter(item => item.id !== place.id);
        markPlacesUpdated();
        const ok = persist();
        if (editingPlaceId === place.id) resetSavedPlaceForm();
        renderSavedPlaces();
        if (ok) toast(isCloudSynced ? 'ลบสถานที่แล้ว · กำลังซิงก์ขึ้นฐานข้อมูล' : 'ลบสถานที่แล้ว · เก็บไว้ในเครื่อง รอซิงก์เมื่อออนไลน์');
        else toast('ลบสถานที่ไม่สำเร็จ พื้นที่จัดเก็บในเครื่องอาจเต็ม');
      });
      actions.append(edit, remove);
      item.append(copy, actions);
      list.append(item);
    });
    if (!state.places.length) {
      const empty = document.createElement('p');
      empty.className = 'saved-place-empty';
      empty.textContent = 'ยังไม่มีสถานที่ที่บันทึกไว้ เพิ่มสถานที่แรกของคุณได้เลย';
      list.append(empty);
    }
  }
  $('savedPlaceForm').onsubmit = e => {
    e.preventDefault();
    if (!isCloudSynced && syncStatusState.mode === 'syncing')
      return toast('กำลังตรวจสอบข้อมูลคลาวด์ กรุณารอสักครู่แล้วลองอีกครั้ง');
    const name = $('savedPlaceName').value.trim(),
      note = $('savedPlaceNote').value.trim(),
      duplicate = state.places.some(place =>
        place.id !== editingPlaceId && place.name.toLocaleLowerCase() === name.toLocaleLowerCase()
      );
    if (!name) return toast('กรุณาระบุชื่อสถานที่');
    if (duplicate) return toast('มีสถานที่ชื่อนี้อยู่แล้ว');
    if (!editingPlaceId && state.places.length >= 200) return toast('บันทึกสถานที่ได้สูงสุด 200 แห่ง');
    const place = {
      id: editingPlaceId || globalThis.crypto?.randomUUID?.() || Date.now().toString(36) + Math.random().toString(36).slice(2),
      name,
      note
    };
    const index = state.places.findIndex(item => item.id === editingPlaceId);
    if (index >= 0) state.places[index] = place;
    else state.places.push(place);
    markPlacesUpdated();
    const ok = persist();
    renderSavedPlaces();
    resetSavedPlaceForm();
    if (ok) toast(isCloudSynced ? 'บันทึกสถานที่แล้ว · กำลังซิงก์ขึ้นฐานข้อมูล' : 'บันทึกสถานที่แล้ว · เก็บไว้ในเครื่อง รอซิงก์เมื่อออนไลน์');
    else toast('บันทึกสถานที่ไม่สำเร็จ พื้นที่จัดเก็บในเครื่องอาจเต็ม');
  };
  $('savedPlaceCancel').onclick = resetSavedPlaceForm;
  renderSavedPlaces();
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
    renderSavedPlaces();
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
   * app/08-journal-list.js
   * รายการบันทึก: ค้นหา/กรอง/แสดงผล (renderEntries), แก้ไข (editEntry), ปุ่มเขียนใหม่, ถูกใจ (toggleFav)
   * (ไฟล์นี้ถูกต่อรวมเป็น closure เดียวกับไฟล์อื่น — ไม่ต้อง import/export · ลำดับไฟล์ดู scripts/build-app.js)
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
   * app/09-entry-reader.js
   * หน้าต่างอ่านบันทึก (openReader) และปุ่มถูกใจ/แก้ไข/ลบ
   * (ไฟล์นี้ถูกต่อรวมเป็น closure เดียวกับไฟล์อื่น — ไม่ต้อง import/export · ลำดับไฟล์ดู scripts/build-app.js)
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
  $('rdVisit').onclick = () => {
    const entry = state.entries.find(x => x.id === readerId);
    if (entry) revisitMemory(entry);
  };
  $('rdPostcard').onclick = () => {
    const entry = state.entries.find(x => x.id === readerId);
    if (entry) revisitMemory(entry, true);
  };
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
   * app/10-modal-system.js
   * ระบบหน้าต่างป๊อปอัป: openModal / closeModal, ปิดด้วย overlay หรือ Esc และกล่องยืนยัน (ask)
   * (ไฟล์นี้ถูกต่อรวมเป็น closure เดียวกับไฟล์อื่น — ไม่ต้อง import/export · ลำดับไฟล์ดู scripts/build-app.js)
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
   * app/11-settings-data.js
   * การตั้งค่า (ลดการเคลื่อนไหว / ประหยัดภาพ) และส่งออก/นำเข้า/ลบข้อมูล JSON
   * (ไฟล์นี้ถูกต่อรวมเป็น closure เดียวกับไฟล์อื่น — ไม่ต้อง import/export · ลำดับไฟล์ดู scripts/build-app.js)
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
        markPlacesUpdated();
        const ok = persist();
        renderSavedPlaces();
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
    ask('ลบบันทึก สถานที่ส่วนตัว และจำนวนโคมทั้งหมดในเครื่องนี้อย่างถาวรหรือไม่?', () => {
      state.entries = [];
      state.places = [];
      markPlacesUpdated();
      state.lanterns = 0;
      clearForm();
      const ok = persist();
      resetSavedPlaceForm();
      renderSavedPlaces();
      stats();
      renderEntries();
      sceneAPI?.refresh();
      if (currentView === 'memory') renderMemory();
      if (ok) toast('ล้างข้อมูลแล้ว พร้อมเริ่มหน้าใหม่');
      else toast('ล้างข้อมูลไม่สำเร็จ พื้นที่จัดเก็บในเครื่องอาจเต็ม');
    });

  /* ============================================================================
   * app/12-lantern-night.js
   * โคมลอย (วางความรู้สึก) และปุ่มกลางวัน/กลางคืน
   * (ไฟล์นี้ถูกต่อรวมเป็น closure เดียวกับไฟล์อื่น — ไม่ต้อง import/export · ลำดับไฟล์ดู scripts/build-app.js)
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
   * app/13-nature-sound.js
   * เสียงธรรมชาติบำบัด (ลม สายน้ำ นก/เรไร ฝน) ด้วย Web Audio
   * (ไฟล์นี้ถูกต่อรวมเป็น closure เดียวกับไฟล์อื่น — ไม่ต้อง import/export · ลำดับไฟล์ดู scripts/build-app.js)
   * ========================================================================== */

  /* ===== 1. ระบบเสียงธรรมชาติบำบัด (Nature Sounds: ลมภูเขา · สายน้ำ · นก/เรไร · เสียงฝนตามฉาก) ===== */
  let audioCtx = null,
    soundOn = false,
    birdTimer = null,
    natureMaster = null,
    rainGainNode = null,
    birdBus = null,
    placeBus = null,
    windGainN = null,
    streamGainN = null,
    riverAmbienceGainN = null,
    riverAmbienceProximity = 0;
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
        placeBus = audioCtx.createGain();
        placeBus.gain.value = 0.8;
        placeBus.connect(natureMaster);

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

        // เสียงน้ำกระทบตลิ่งเบา ๆ เพิ่มเฉพาะช่วงที่อยู่ใกล้แม่น้ำ
        const riverSrc = audioCtx.createBufferSource();
        riverSrc.buffer = b;
        riverSrc.loop = true;
        riverSrc.playbackRate.value = 0.72;
        const riverHigh = audioCtx.createBiquadFilter();
        riverHigh.type = 'highpass';
        riverHigh.frequency.value = 150;
        const riverLow = audioCtx.createBiquadFilter();
        riverLow.type = 'lowpass';
        riverLow.frequency.value = 570;
        const riverLfo = audioCtx.createOscillator(),
          riverLfoGain = audioCtx.createGain();
        riverLfo.frequency.value = 0.14;
        riverLfoGain.gain.value = 75;
        riverLfo.connect(riverLfoGain).connect(riverLow.frequency);
        riverLfo.start();
        riverAmbienceGainN = audioCtx.createGain();
        riverAmbienceGainN.gain.value = 0.0001;
        riverSrc.connect(riverHigh).connect(riverLow).connect(riverAmbienceGainN).connect(placeBus);
        riverSrc.start();
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
   * app/14-ambient-music.js
   * เพลงบรรเลงผ่อนคลาย (เปียโนนุ่ม ๆ + Warm Pad) ปรับตามอารมณ์ ด้วย Web Audio
   * (ไฟล์นี้ถูกต่อรวมเป็น closure เดียวกับไฟล์อื่น — ไม่ต้อง import/export · ลำดับไฟล์ดู scripts/build-app.js)
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
   * app/15-breath.js
   * มุมพักใจ: แบบฝึกหายใจ
   * (ไฟล์นี้ถูกต่อรวมเป็น closure เดียวกับไฟล์อื่น — ไม่ต้อง import/export · ลำดับไฟล์ดู scripts/build-app.js)
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
   * app/16-route-ui.js
   * ป้ายชื่อสถานที่ตามตำแหน่งบนเส้นทาง (updateRouteUI)
   * (ไฟล์นี้ถูกต่อรวมเป็น closure เดียวกับไฟล์อื่น — ไม่ต้อง import/export · ลำดับไฟล์ดู scripts/build-app.js)
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
   * app/17-memory-calendar.js
   * หน้าความทรงจำ: ปฏิทิน รายการตามวัน และแผนที่เส้นทางความทรงจำ
   * (ไฟล์นี้ถูกต่อรวมเป็น closure เดียวกับไฟล์อื่น — ไม่ต้อง import/export · ลำดับไฟล์ดู scripts/build-app.js)
   * ========================================================================== */

  let viewYear = new Date().getFullYear(),
    viewMonth = new Date().getMonth(),
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

    entries.forEach((e, index) => {
      const mood = moodOf(e.mood),
        card = document.createElement('article');
      card.className = 'day-story';
      card.style.setProperty('--story-color', mood.color);
      const top = document.createElement('div');
      top.className = 'day-story-top';
      const sequence = document.createElement('span');
      sequence.className = 'day-story-index';
      sequence.textContent = 'MOMENT ' + String(index + 1).padStart(2, '0');
      const moodTag = document.createElement('span');
      moodTag.className = 'day-mood';
      moodTag.style.setProperty('--mood-color', mood.color);
      moodTag.innerHTML = svgIcon(mood.icon);
      moodTag.append(document.createTextNode(mood.label));
      top.append(sequence, moodTag);
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
      const actions = document.createElement('div');
      actions.className = 'day-story-actions';
      const visit = document.createElement('button');
      visit.type = 'button';
      visit.className = 'day-read';
      visit.textContent = 'กลับไปดูจุดนี้';
      visit.onclick = () => revisitMemory(e);
      const postcard = document.createElement('button');
      postcard.type = 'button';
      postcard.className = 'day-read';
      postcard.textContent = 'ทำโปสการ์ด';
      postcard.onclick = () => revisitMemory(e, true);
      actions.append(read, visit, postcard);
      card.append(top, title, excerpt, actions);
      target.append(card);
    });

    const keepGoing = document.createElement('div');
    keepGoing.className = 'day-keep-going';
    const keepCopy = document.createElement('div');
    keepCopy.innerHTML = '<strong>ทุกเรื่องเล็ก ๆ มีความหมาย</strong><span>แวะเติมอีกหนึ่งหน้าลงในสมุดบันทึกเล่มนี้</span>';
    const add = document.createElement('button');
    add.type = 'button';
    add.className = 'day-write';
    add.textContent = '＋ เพิ่มเรื่องราว';
    add.onclick = () => startMemoryEntry(selectedDay);
    keepGoing.append(keepCopy, add);
    target.append(keepGoing);
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
  function revisitMemory(entry, makePostcard = false) {
    if (!$('readerModal').hidden) closeModal('readerModal');
    location.hash = 'home';
    setView('home');
    if (!sceneAPI?.goToRoute || !sceneAPI.goToRoute(entry.routeT)) {
      toast('ฉากกำลังเตรียมพร้อม กรุณาลองอีกครั้ง');
      return;
    }
    if (makePostcard) {
      setTimeout(() => {
        document.dispatchEvent(new CustomEvent('road-days:postcard', { detail: { entry } }));
      }, 250);
    } else {
      const stop = routeStops.reduce((a, b) =>
        Math.abs(a.t - entry.routeT) < Math.abs(b.t - entry.routeT) ? a : b
      );
      toast('กลับมายัง “' + (entry.place || stop.name) + '” · ' + prettyDate(entry.date));
    }
  }
  function renderMemory() {
    renderCalendar();
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
   * app/18-scene-buttons.js
   * ปุ่มควบคุมฉาก: ซูม ความเร็วรถ และทางลัดเปิดหน้าต่าง ๆ
   * (ไฟล์นี้ถูกต่อรวมเป็น closure เดียวกับไฟล์อื่น — ไม่ต้อง import/export · ลำดับไฟล์ดู scripts/build-app.js)
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
   * app/19-stories.js
   * เรื่องเล่าระหว่างทาง (STORIES), ป๊อปอัป และปุ่มเปิด/ปิด
   * (ไฟล์นี้ถูกต่อรวมเป็น closure เดียวกับไฟล์อื่น — ไม่ต้อง import/export · ลำดับไฟล์ดู scripts/build-app.js)
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
   * app/20-memory-peek-bubble.js
   * การ์ดทบทวนความทรงจำสุ่ม (peek), แผงด้านข้างบนมือถือ และฟองอารมณ์ลอย
   * (ไฟล์นี้ถูกต่อรวมเป็น closure เดียวกับไฟล์อื่น — ไม่ต้อง import/export · ลำดับไฟล์ดู scripts/build-app.js)
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
   * app/21-dock-fab.js
   * ตำแหน่ง dock ด้านล่างฉาก และปุ่มลัดลอย (FAB)
   * (ไฟล์นี้ถูกต่อรวมเป็น closure เดียวกับไฟล์อื่น — ไม่ต้อง import/export · ลำดับไฟล์ดู scripts/build-app.js)
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
/* ROAD_OF_DAYS_SCENE_MODELS */  /* ============================================================================
   * app/99-boot.js
   * จุดเริ่มต้นแอป: เรียก init3D() แล้ววาดหน้าจอครั้งแรก
   * (ไฟล์นี้ถูกต่อรวมเป็น closure เดียวกับไฟล์อื่น — ไม่ต้อง import/export · ลำดับไฟล์ดู scripts/build-app.js)
   * ========================================================================== */


  /* ============================================================================
   * app/98-relax-addons.js
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
   * app/97-mixer-presets-memory.js
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
      if (riverAmbienceGainN && audioCtx) riverAmbienceGainN.gain.setTargetAtTime(0.018 * MIXV.water * riverAmbienceProximity, t, 0.35);
      if (birdBus) birdBus.gain.setTargetAtTime(MIXV.birds, t, 0.2);
      if (mBus && mOn) mBus.gain.setTargetAtTime(0.88 * MIXV.music, mCtx.currentTime, 0.2);
    };
    addModal('mixModal', 'เสียงและบรรยากาศ',
      '<p>เลือกพรีเซ็ตเพื่อปรับเวลา อากาศ อารมณ์ และเสียงในครั้งเดียว</p><div class="chips" id="presetChips"></div><div id="mixRows"></div>' +
      '<label class="mix-row"><span>เสียงตามสถานที่ (เรือหางยาว · น้ำกระทบตลิ่ง · ระฆัง · กบเขียด)</span><input type="checkbox" class="switch" id="placeSnd" checked></label>');
    const rows = $('mixRows');
    CH.forEach(([k, l]) => {
      const r = mk('label', 'mix-row', '<span>' + l + '</span><input type="range" min="0" max="1.5" step="0.05" aria-label="' + l + '">');
      const s = r.querySelector('input'); s.value = MIXV[k];
      s.oninput = () => { MIXV[k] = +s.value; mixApply(); };
      r.dataset.k = k; rows.appendChild(r);
    });
    const syncRows = () => rows.querySelectorAll('.mix-row').forEach(r => (r.querySelector('input').value = MIXV[r.dataset.k]));
    $('placeSnd').onchange = e => { placeOn = e.target.checked; boost = 1; if (!placeOn) riverAmbienceProximity = 0; mixApply(); };

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
      if (p) { p.pan.value = pan; g.connect(p); p.connect(placeBus || birdBus); } else g.connect(placeBus || birdBus);
      return g;
    };
    const boat = (n, vol = 1) => {
      const engine = audioCtx.createOscillator(),
        harmonic = audioCtx.createOscillator(),
        flutter = audioCtx.createOscillator(),
        flutterGain = audioCtx.createGain(),
        harmonicGain = audioCtx.createGain(),
        engineFilter = audioCtx.createBiquadFilter(),
        engineGain = audioCtx.createGain(),
        pan = audioCtx.createStereoPanner ? audioCtx.createStereoPanner() : null,
        direction = Math.random() < 0.5 ? -1 : 1,
        destination = placeBus || birdBus;
      engine.type = 'sawtooth';
      engine.frequency.setValueAtTime(52, n);
      engine.frequency.exponentialRampToValueAtTime(68, n + 1.7);
      engine.frequency.exponentialRampToValueAtTime(63, n + 3.1);
      engine.frequency.exponentialRampToValueAtTime(50, n + 5.2);
      harmonic.type = 'triangle';
      harmonic.frequency.setValueAtTime(104, n);
      harmonic.frequency.exponentialRampToValueAtTime(136, n + 1.7);
      harmonic.frequency.exponentialRampToValueAtTime(126, n + 3.1);
      harmonic.frequency.exponentialRampToValueAtTime(100, n + 5.2);
      engineFilter.type = 'lowpass';
      engineFilter.frequency.setValueAtTime(240, n);
      engineFilter.frequency.linearRampToValueAtTime(410, n + 1.7);
      engineFilter.frequency.linearRampToValueAtTime(310, n + 3.1);
      engineFilter.frequency.linearRampToValueAtTime(220, n + 5.2);
      engineFilter.Q.value = 0.6;
      harmonicGain.gain.value = 0.2;
      engineGain.gain.setValueAtTime(0.0001, n);
      engineGain.gain.linearRampToValueAtTime(0.035 * vol, n + 1.1);
      engineGain.gain.setValueAtTime(0.028 * vol, n + 2.8);
      engineGain.gain.exponentialRampToValueAtTime(0.0001, n + 5.4);
      flutter.type = 'sine';
      flutter.frequency.value = 16;
      flutterGain.gain.value = 0.003 * vol;
      flutter.connect(flutterGain).connect(engineGain.gain);
      engine.connect(engineFilter);
      harmonic.connect(harmonicGain).connect(engineFilter);
      engineFilter.connect(engineGain);
      if (pan) {
        pan.pan.setValueAtTime(direction * 0.75, n);
        pan.pan.linearRampToValueAtTime(direction * -0.75, n + 5.4);
        engineGain.connect(pan).connect(destination);
      } else engineGain.connect(destination);
      engine.start(n);
      harmonic.start(n);
      flutter.start(n);
      engine.stop(n + 5.5);
      harmonic.stop(n + 5.5);
      flutter.stop(n + 5.5);
    };
    const frog = n => { const pan = Math.random() * 1.6 - 0.8, f0 = 480 + Math.random() * 160;
      for (let i = 0; i < 4; i++) { const o = audioCtx.createOscillator(), f = audioCtx.createBiquadFilter(); o.type = 'square'; f.type = 'lowpass'; f.frequency.value = 900; o.frequency.value = f0; o.connect(f); f.connect(env(n + i * 0.12, 0.07, 0.018, pan)); o.start(n + i * 0.12); o.stop(n + i * 0.12 + 0.08); } };
    const bell = n => { const g = env(n, 3.5, 0.03, Math.random() - 0.5); [1, 2.76, 5.4].forEach((m, i) => { const o = audioCtx.createOscillator(), h = audioCtx.createGain(); o.frequency.value = 220 * m; h.gain.value = 1 / (i + 1); o.connect(h); h.connect(g); o.start(n); o.stop(n + 3.6); }); };
    setInterval(() => {
      if (!soundOn || !audioCtx || !birdBus) return;
      const km = kmAt(state.routeT);
      const nearTown = ROUTE.some(r => (r.id === 'chiangsaen' || r.id === 'chiangkhong') && Math.abs(km - r.km) < 7);
      const boatDistance = typeof RIVER !== 'undefined' && RIVER.nearBoat ? RIVER.nearBoat() : Infinity;
      const routeNearRiver = state.routeT >= 0.71 && state.routeT <= 0.81;
      const boatNear = boatDistance < 170;
      const nearRiver = boatNear || routeNearRiver;
      riverAmbienceProximity = placeOn && nearRiver
        ? (boatNear ? Math.max(0.25, 1 - boatDistance / 190) : 0.35)
        : 0;
      const nb = nearRiver ? 1.8 : 1; if (nb !== boost) { boost = nb; mixApply(); }
      const n = audioCtx.currentTime, rain = window.RODENV ? RODENV.rain() : 0;
      if (riverAmbienceGainN) riverAmbienceGainN.gain.setTargetAtTime(0.018 * MIXV.water * riverAmbienceProximity, n, 1.2);
      if (!placeOn || document.hidden) return;
      if (boatNear && Math.random() < 0.3) boat(n, Math.max(0.15, Math.min(1, 1 - boatDistance / 190)));
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
    let postcardDate = localDate();
    const makeCard = (entry = null) => {
      const url = window.RODENV && RODENV.shot(); if (!url) return toast('ฉาก 3D ยังไม่พร้อม');
      const im = new Image(); im.onload = () => {
        const c = $('pcCanvas'), W = c.width, H = c.height, x = c.getContext('2d'), s = Math.max(W / im.width, H / im.height);
        x.drawImage(im, (W - im.width * s) / 2, (H - im.height * s) / 2, im.width * s, im.height * s);
        const g = x.createLinearGradient(0, H * 0.45, 0, H); g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(10,25,18,.8)'); x.fillStyle = g; x.fillRect(0, 0, W, H);
        x.fillStyle = '#ffffffd9'; x.font = '500 22px "Noto Sans Thai",sans-serif';
        x.fillText('A MEMORY ALONG THE WAY', 60, 64);
        x.fillStyle = '#fff'; x.font = '600 56px "Noto Sans Thai",sans-serif';
        wrap(x, $('pcText').value || 'ขับช้า ๆ ไปตามเส้นทางความทรงจำ', W - 120).forEach((l, i) => x.fillText(l, 60, H - 250 + i * 66));
        let placeLabel = $('placeLabel').textContent;
        if (entry) {
          const stop = routeStops.reduce((a, b) =>
            Math.abs(a.t - entry.routeT) < Math.abs(b.t - entry.routeT) ? a : b
          );
          placeLabel = (entry.place || stop.name) + ' · ' + prettyDate(entry.date);
          x.font = '400 25px "Noto Sans Thai",sans-serif'; x.fillStyle = '#ffffffd9';
          wrap(x, entry.text, W - 120).forEach((line, i) => x.fillText(line, 60, H - 101 - (1 - i) * 34));
        } else {
          placeLabel += ' · ' + prettyDate(localDate());
        }
        x.font = '400 28px "Noto Sans Thai",sans-serif'; x.fillStyle = '#ffffffd9';
        x.fillText(placeLabel, 60, H - 35);
        x.textAlign = 'right'; x.fillText('Road of Days', W - 60, H - 60); x.textAlign = 'left';
      }; im.src = url;
    };
    $('pcMake').onclick = makeCard;
    $('pcSave').onclick = () => $('pcCanvas').toBlob(b => { const a = document.createElement('a'); a.href = URL.createObjectURL(b); a.download = 'road-of-days-' + postcardDate + '.png'; a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 4000); });
    document.addEventListener('road-days:postcard', event => {
      const entry = state.entries.find(item => item.id === event.detail?.entry?.id);
      if (!entry) return toast('ไม่พบบันทึกนี้แล้ว');
      postcardDate = entry.date;
      $('pcText').value = entry.title;
      openModal('pcModal');
      requestAnimationFrame(() => makeCard(entry));
    });
    addFab('โปสการ์ด', 'i-star', () => { const e = state.entries[0]; postcardDate = localDate(); $('pcText').value = e ? e.title : ''; openModal('pcModal'); setTimeout(makeCard, 120); }, 'fabGrpMem');

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
   * app/99-cloud-boot.js
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
            localStorage.getItem(PLACES_PENDING_KEY + bootAccountId) === '1' ||
            state.placesUpdatedAt > cloudState.placesUpdatedAt ||
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