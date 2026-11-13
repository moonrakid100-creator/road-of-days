// Road_of_Days_Models.js
// แหล่งรวบรวมโมเดล 3D แบบ Custom (เช่น 7-11, โรงเรียนสไตล์ Low-Poly)

window.ROD_Models = {
  // ==========================================
  // 1. โมเดล 7-11 (คงเดิมตามที่คุณพอใจแล้ว)
  // ==========================================
  createSevenEleven: function (THREE, scene, x, z, rotationY) {
    const group = new THREE.Group();
    group.position.set(x, 0, z);
    group.rotation.y = rotationY;
    scene.add(group);

    const whiteMat = new THREE.MeshLambertMaterial({ color: 0xffffff });
    const wallMat = new THREE.MeshLambertMaterial({ color: 0xeaeaea });
    const darkMat = new THREE.MeshLambertMaterial({ color: 0x333333 });
    const atmMat = new THREE.MeshLambertMaterial({ color: 0x00a950 }); 
    const woodMat = new THREE.MeshLambertMaterial({ color: 0xd2b48c }); 
    const glassMat = new THREE.MeshStandardMaterial({ color: 0xaaddff, transparent: true, opacity: 0.35, roughness: 0.1, metalness: 0.8 });
    
    const signTex = (() => {
      const cv = document.createElement('canvas');
      cv.width = 256; cv.height = 128;
      const ctx = cv.getContext('2d');
      ctx.fillStyle = '#ffffff'; ctx.fillRect(0, 0, 256, 128);
      ctx.fillStyle = '#f58220'; ctx.fillRect(0, 10, 256, 25); 
      ctx.fillStyle = '#007f3f'; ctx.fillRect(0, 45, 256, 25); 
      ctx.fillStyle = '#e21b22'; ctx.fillRect(0, 80, 256, 25); 
      ctx.fillStyle = '#ffffff'; ctx.fillRect(90, 35, 75, 75); 
      ctx.font = 'bold 75px "Arial Black", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillStyle = '#e21b22'; ctx.fillText('7', 115, 105);
      ctx.font = 'bold 22px Arial';
      ctx.fillStyle = '#007f3f'; ctx.fillText('ELEVEn', 170, 95);
      const tex = new THREE.CanvasTexture(cv);
      tex.colorSpace = THREE.SRGBColorSpace;
      return tex;
    })();
    const signMat = new THREE.MeshBasicMaterial({ map: signTex });
    const posterMat = new THREE.MeshBasicMaterial({ color: 0xff3366 }); 

    const bW = 5.5, bH = 2.8, bD = 4.5;

    // พื้นดินผสมกรวดและลานจอดหน้าเซเว่นเชื่อมเข้าหาไหล่ทางถนนแบบไร้รอยต่อ
    const blendTex = (() => {
      const cv = document.createElement('canvas');
      cv.width = cv.height = 128;
      const ctx = cv.getContext('2d');
      const g = ctx.createRadialGradient(64, 64, 14, 64, 64, 62);
      g.addColorStop(0, 'rgba(168, 148, 118, 0.92)');
      g.addColorStop(0.62, 'rgba(152, 134, 104, 0.65)');
      g.addColorStop(1, 'rgba(138, 122, 92, 0)');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, 128, 128);
      return new THREE.CanvasTexture(cv);
    })();
    const blendMat = new THREE.MeshLambertMaterial({
      map: blendTex,
      transparent: true,
      depthWrite: false,
      polygonOffset: true,
      polygonOffsetFactor: -1,
      polygonOffsetUnits: -1
    });
    const blendPad = new THREE.Mesh(new THREE.PlaneGeometry(13.5, 11.2), blendMat);
    blendPad.rotation.x = -Math.PI / 2;
    blendPad.position.set(0.4, 0.015, 1.3);
    group.add(blendPad);

    const forecourtMat = new THREE.MeshLambertMaterial({
      color: 0xc8c4ba,
      polygonOffset: true,
      polygonOffsetFactor: -2,
      polygonOffsetUnits: -2
    });
    const forecourt = new THREE.Mesh(new THREE.BoxGeometry(bW + 2.6, 0.05, 3.2), forecourtMat);
    forecourt.position.set(0, 0.03, bD / 2 + 1.6);
    forecourt.receiveShadow = true;
    group.add(forecourt);
    
    const floor = new THREE.Mesh(new THREE.BoxGeometry(bW + 1, 0.2, bD + 1), wallMat);
    floor.position.set(0, 0.1, 0); floor.receiveShadow = true; group.add(floor);
    const wallL = new THREE.Mesh(new THREE.BoxGeometry(0.2, bH, bD), wallMat); wallL.position.set(-bW/2, bH/2 + 0.2, 0);
    const wallR = new THREE.Mesh(new THREE.BoxGeometry(0.2, bH, bD), wallMat); wallR.position.set(bW/2, bH/2 + 0.2, 0);
    const wallB = new THREE.Mesh(new THREE.BoxGeometry(bW, bH, 0.2), wallMat); wallB.position.set(0, bH/2 + 0.2, -bD/2);
    [wallL, wallR, wallB].forEach(w => { w.castShadow = true; w.receiveShadow = true; group.add(w); });

    const roof = new THREE.Mesh(new THREE.BoxGeometry(bW + 0.4, 0.2, bD + 0.4), wallMat);
    roof.position.set(0, bH + 0.3, 0); roof.castShadow = true; roof.receiveShadow = true; group.add(roof);

    const fascia = new THREE.Mesh(new THREE.BoxGeometry(bW, 0.8, 0.3), signMat);
    fascia.position.set(0, bH - 0.1, bD/2 + 0.1); group.add(fascia);

    const glassL = new THREE.Mesh(new THREE.BoxGeometry(1.8, 2.2, 0.1), glassMat); glassL.position.set(-1.6, 1.3, bD/2);
    const glassR = new THREE.Mesh(new THREE.BoxGeometry(1.8, 2.2, 0.1), glassMat); glassR.position.set(1.6, 1.3, bD/2);
    group.add(glassL, glassR);

    const poster = new THREE.Mesh(new THREE.PlaneGeometry(0.6, 0.8), posterMat);
    poster.position.set(-1.6, 1.4, bD/2 + 0.06); group.add(poster);

    const doorFrame = new THREE.Mesh(new THREE.BoxGeometry(1.6, 2.3, 0.15), darkMat);
    doorFrame.position.set(0, 1.35, bD/2 - 0.05); group.add(doorFrame);
    const doorSlideL = new THREE.Mesh(new THREE.BoxGeometry(0.7, 2.1, 0.05), glassMat); doorSlideL.position.set(-0.35, 1.3, bD/2);
    const doorSlideR = new THREE.Mesh(new THREE.BoxGeometry(0.7, 2.1, 0.05), glassMat); doorSlideR.position.set(0.35, 1.3, bD/2);
    group.add(doorSlideL, doorSlideR);

    const counter = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.9, 0.8), woodMat); counter.position.set(-1.2, 0.65, -0.5); group.add(counter);
    const posMachine = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.2, 0.3), darkMat); posMachine.position.set(-0.8, 1.2, -0.4); group.add(posMachine);
    const posScreen = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.2, 0.02), new THREE.MeshBasicMaterial({color: 0x00ccff})); posScreen.position.set(-0.8, 1.3, -0.3); posScreen.rotation.x = -0.2; group.add(posScreen);
    const microwave = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.3, 0.35), whiteMat); microwave.position.set(-1.6, 1.25, -0.6);
    const mwGlass = new THREE.Mesh(new THREE.PlaneGeometry(0.25, 0.2), new THREE.MeshBasicMaterial({color: 0x111111})); mwGlass.position.set(-1.55, 1.25, -0.42); group.add(microwave, mwGlass);

    const clerk = new THREE.Group(); clerk.position.set(-1.2, 1.2, -1.2); 
    const clerkBody = new THREE.Mesh(new THREE.CapsuleGeometry(0.15, 0.3, 4, 8), new THREE.MeshLambertMaterial({color: 0x007f3f})); 
    const clerkHead = new THREE.Mesh(new THREE.SphereGeometry(0.12, 8, 8), new THREE.MeshLambertMaterial({ color: 0xffccaa })); clerkHead.position.y = 0.35;
    clerk.add(clerkBody, clerkHead); group.add(clerk);

    const fridge = new THREE.Mesh(new THREE.BoxGeometry(2.5, 2.0, 0.5), whiteMat); fridge.position.set(1.0, 1.2, -1.9);
    const fridgeGlass = new THREE.Mesh(new THREE.BoxGeometry(2.4, 1.8, 0.52), glassMat); fridgeGlass.position.set(1.0, 1.2, -1.9);
    group.add(fridge, fridgeGlass);

    const shelfMat = new THREE.MeshLambertMaterial({color: 0xdddddd});
    const snackMats = [0xff6600, 0xff0000, 0x0044ff, 0x00ff00].map(c => new THREE.MeshLambertMaterial({color: c}));
    for(let i=0; i<2; i++) {
        const shelfGroup = new THREE.Group(); shelfGroup.position.set(1.2, 0, -0.8 + i*1.0);
        const shelfBase = new THREE.Mesh(new THREE.BoxGeometry(1.2, 1.5, 0.4), shelfMat); shelfBase.position.y = 0.95; shelfGroup.add(shelfBase);
        // แก้ไข FPS: ใช้กล่องยาวแทนการเรียงขนมชิ้นเล็กๆ 
        for (let level = 0; level < 3; level++) {
            const yPos = 0.5 + level * 0.45;
            const rowBlock = new THREE.Mesh(new THREE.BoxGeometry(1.0, 0.15, 0.28), snackMats[level % 4]);
            rowBlock.position.set(0, yPos, 0);
            shelfGroup.add(rowBlock);
        }
        group.add(shelfGroup);
    }
    const ceilingLamp = new THREE.Mesh(new THREE.PlaneGeometry(3.8, 2.4), new THREE.MeshBasicMaterial({ color: 0xfffef2, side: THREE.DoubleSide })); ceilingLamp.rotation.x = Math.PI / 2; ceilingLamp.position.set(0, 2.75, -0.2); group.add(ceilingLamp);

    const atmGroup = new THREE.Group(); atmGroup.position.set(-2.2, 1.0, bD/2 + 0.3);
    const atmBody = new THREE.Mesh(new THREE.BoxGeometry(0.8, 1.8, 0.6), atmMat);
    const atmScreenPanel = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.8, 0.62), darkMat); atmScreenPanel.position.y = 0.2;
    const atmScreen = new THREE.Mesh(new THREE.PlaneGeometry(0.4, 0.3), new THREE.MeshBasicMaterial({color: 0xadd8e6})); atmScreen.position.set(0, 0.3, 0.315);
    atmGroup.add(atmBody, atmScreenPanel, atmScreen); group.add(atmGroup);

    const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 4.5, 8), darkMat); pole.position.set(bW/2 + 1.5, 2.25, bD/2 + 0.5); pole.castShadow = true; group.add(pole);
    const pylonSign = new THREE.Mesh(new THREE.BoxGeometry(1.8, 1.2, 0.4), signMat); pylonSign.position.set(bW/2 + 1.5, 4.5, bD/2 + 0.5); group.add(pylonSign);

    // --- โมเดลเด็ก/วัยรุ่นเดินเข้า-ออก 7-Eleven แบบละเอียดสมจริง ---
    const npc = new THREE.Group();
    const skinM = new THREE.MeshLambertMaterial({ color: 0xf1c29d });
    const shirtM = new THREE.MeshLambertMaterial({ color: 0xf7f5ee });
    const collarM = new THREE.MeshLambertMaterial({ color: 0x2b4c7e });
    const pantsM = new THREE.MeshLambertMaterial({ color: 0x283747 });
    const hairM = new THREE.MeshLambertMaterial({ color: 0x231b16 });
    const shoeM = new THREE.MeshLambertMaterial({ color: 0x222629 });
    const soleM = new THREE.MeshLambertMaterial({ color: 0xf5f5f5 });
    const packM = new THREE.MeshLambertMaterial({ color: 0x4a7c59 });
    const strapM = new THREE.MeshLambertMaterial({ color: 0x2c3e35 });
    const eyeM = new THREE.MeshBasicMaterial({ color: 0x1a1412 });
    const whiteEyeM = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const mouthM = new THREE.MeshBasicMaterial({ color: 0xc46d5e });

    const pel = new THREE.Group();
    pel.position.y = 0.78;
    npc.add(pel);

    const hipMesh = new THREE.Mesh(new THREE.SphereGeometry(0.125, 10, 8), pantsM);
    hipMesh.scale.set(1.05, 0.72, 0.88);
    pel.add(hipMesh);

    const tor = new THREE.Group();
    pel.add(tor);

    const bodyMesh = new THREE.Mesh(new THREE.CapsuleGeometry(0.125, 0.24, 5, 12), shirtM);
    bodyMesh.position.y = 0.22;
    bodyMesh.scale.set(1.06, 1, 0.82);
    bodyMesh.castShadow = true;
    tor.add(bodyMesh);

    // ปกเสื้อกะลาสี/เสื้อนักเรียนและเนคไท
    const collar = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.13, 0.05, 10), collarM);
    collar.position.set(0, 0.39, 0.01);
    tor.add(collar);
    const tie = new THREE.Mesh(new THREE.BoxGeometry(0.035, 0.14, 0.02), collarM);
    tie.position.set(0, 0.3, 0.105);
    tor.add(tie);

    // กระเป๋าเป้สะพายหลังพร้อมสายสะพายไหล่
    const backpack = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.28, 0.12), packM);
    backpack.position.set(0, 0.23, -0.14);
    backpack.castShadow = true;
    const packPocket = new THREE.Mesh(new THREE.BoxGeometry(0.17, 0.13, 0.04), strapM);
    packPocket.position.set(0, -0.04, -0.07);
    backpack.add(packPocket);
    tor.add(backpack);
    for (const s of [-1, 1]) {
      const strap = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.26, 0.18), strapM);
      strap.position.set(s * 0.085, 0.26, -0.01);
      tor.add(strap);
    }

    // คอและศีรษะพร้อมใบหน้า-ทรงผมละเอียด
    const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.042, 0.048, 0.09, 8), skinM);
    neck.position.y = 0.43;
    tor.add(neck);

    const headGrp = new THREE.Group();
    headGrp.position.y = 0.54;
    tor.add(headGrp);

    const head = new THREE.Mesh(new THREE.SphereGeometry(0.125, 14, 12), skinM);
    head.scale.set(0.95, 1.05, 0.98);
    head.castShadow = true;
    headGrp.add(head);

    const hairCap = new THREE.Mesh(new THREE.SphereGeometry(0.132, 14, 12), hairM);
    hairCap.position.set(0, 0.025, -0.012);
    hairCap.scale.set(0.98, 0.92, 1.02);
    headGrp.add(hairCap);

    const bangs = new THREE.Mesh(new THREE.SphereGeometry(0.115, 10, 8), hairM);
    bangs.position.set(0, 0.065, 0.045);
    bangs.scale.set(1.02, 0.42, 0.65);
    headGrp.add(bangs);

    for (const s of [-1, 1]) {
      const ear = new THREE.Mesh(new THREE.SphereGeometry(0.026, 8, 6), skinM);
      ear.position.set(s * 0.118, -0.005, 0);
      ear.scale.set(0.5, 1, 0.7);
      headGrp.add(ear);

      const eyeW = new THREE.Mesh(new THREE.SphereGeometry(0.019, 8, 6), whiteEyeM);
      eyeW.position.set(s * 0.044, 0.012, 0.11);
      eyeW.scale.set(1, 0.85, 0.45);
      headGrp.add(eyeW);

      const pupil = new THREE.Mesh(new THREE.SphereGeometry(0.011, 8, 6), eyeM);
      pupil.position.set(s * 0.044, 0.012, 0.118);
      headGrp.add(pupil);

      const brow = new THREE.Mesh(new THREE.BoxGeometry(0.032, 0.007, 0.008), hairM);
      brow.position.set(s * 0.044, 0.042, 0.114);
      headGrp.add(brow);
    }
    const nose = new THREE.Mesh(new THREE.SphereGeometry(0.014, 6, 6), skinM);
    nose.position.set(0, -0.008, 0.122);
    headGrp.add(nose);
    const mouth = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.008, 0.008), mouthM);
    mouth.position.set(0, -0.045, 0.116);
    headGrp.add(mouth);

    // แขนซ้าย-ขวา แบบมีข้อต่อไหล่ + ข้อศอก + มือ
    function makeArm(side) {
      const sh = new THREE.Group();
      sh.position.set(side * 0.165, 0.36, 0);
      tor.add(sh);
      const sleeve = new THREE.Mesh(new THREE.CapsuleGeometry(0.042, 0.1, 4, 8), shirtM);
      sleeve.position.y = -0.05;
      sh.add(sleeve);
      const upper = new THREE.Mesh(new THREE.CapsuleGeometry(0.033, 0.11, 4, 8), skinM);
      upper.position.y = -0.12;
      sh.add(upper);
      const el = new THREE.Group();
      el.position.y = -0.2;
      sh.add(el);
      const fore = new THREE.Mesh(new THREE.CapsuleGeometry(0.03, 0.13, 4, 8), skinM);
      fore.position.y = -0.09;
      el.add(fore);
      const hnd = new THREE.Group();
      hnd.position.y = -0.18;
      el.add(hnd);
      const palm = new THREE.Mesh(new THREE.SphereGeometry(0.034, 8, 6), skinM);
      palm.scale.set(0.85, 1.1, 0.75);
      hnd.add(palm);
      return { sh, el, hnd };
    }
    const armL = makeArm(-1);
    const armR = makeArm(1);

    // ถุงพลาสติก 7-Eleven ในมือขวา (มีหูหิ้วและแถบสีเขียว-ส้ม-แดง)
    const shoppingBag = new THREE.Group();
    shoppingBag.position.set(0, -0.02, 0.02);
    const bagMat = new THREE.MeshLambertMaterial({ color: 0xfafafa, transparent: true, opacity: 0.92 });
    const bagBody = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.21, 0.095), bagMat);
    bagBody.position.y = -0.14;
    shoppingBag.add(bagBody);
    for (const s of [-0.04, 0.04]) {
      const handle = new THREE.Mesh(new THREE.BoxGeometry(0.018, 0.07, 0.02), bagMat);
      handle.position.set(s, -0.015, 0);
      shoppingBag.add(handle);
    }
    const stripeG = new THREE.Mesh(new THREE.BoxGeometry(0.154, 0.018, 0.098), new THREE.MeshBasicMaterial({ color: 0x007f3f }));
    stripeG.position.y = -0.12;
    const stripeO = new THREE.Mesh(new THREE.BoxGeometry(0.154, 0.014, 0.098), new THREE.MeshBasicMaterial({ color: 0xf36f21 }));
    stripeO.position.y = -0.14;
    const stripeR = new THREE.Mesh(new THREE.BoxGeometry(0.154, 0.014, 0.098), new THREE.MeshBasicMaterial({ color: 0xee2524 }));
    stripeR.position.y = -0.16;
    shoppingBag.add(stripeG, stripeO, stripeR);
    armR.hnd.add(shoppingBag);

    // แก้วน้ำปั่น/สเลอปี้พร้อมหลอดดูดในมือซ้าย (ถือออกมาหลังซื้อของเสร็จ)
    const drinkCup = new THREE.Group();
    drinkCup.position.set(0, -0.01, 0.04);
    const cupBody = new THREE.Mesh(new THREE.CylinderGeometry(0.036, 0.026, 0.11, 10), new THREE.MeshLambertMaterial({ color: 0xe8f8f5 }));
    const cupLid = new THREE.Mesh(new THREE.SphereGeometry(0.037, 10, 6, 0, Math.PI * 2, 0, Math.PI * 0.5), new THREE.MeshLambertMaterial({ color: 0xffffff }));
    cupLid.position.y = 0.055;
    const straw = new THREE.Mesh(new THREE.CylinderGeometry(0.005, 0.005, 0.09, 6), new THREE.MeshBasicMaterial({ color: 0xee2524 }));
    straw.position.set(0.01, 0.085, 0);
    straw.rotation.z = -0.2;
    drinkCup.add(cupBody, cupLid, straw);
    armL.hnd.add(drinkCup);

    // ขาซ้าย-ขวา แบบมีข้อต่อสะโพก + หัวเข่า + ถุงเท้า + รองเท้าผ้าใบ
    function makeLeg(side) {
      const hip = new THREE.Group();
      hip.position.set(side * 0.075, 0, 0);
      pel.add(hip);
      const shorts = new THREE.Mesh(new THREE.CylinderGeometry(0.058, 0.054, 0.2, 8), pantsM);
      shorts.position.y = -0.1;
      hip.add(shorts);
      const thigh = new THREE.Mesh(new THREE.CapsuleGeometry(0.044, 0.16, 4, 8), skinM);
      thigh.position.y = -0.18;
      hip.add(thigh);
      const knee = new THREE.Group();
      knee.position.y = -0.34;
      hip.add(knee);
      const calf = new THREE.Mesh(new THREE.CapsuleGeometry(0.038, 0.22, 4, 8), skinM);
      calf.position.y = -0.15;
      knee.add(calf);
      const sock = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.038, 0.1, 8), shirtM);
      sock.position.y = -0.28;
      knee.add(sock);
      const shoe = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.055, 0.17), shoeM);
      shoe.position.set(0, -0.35, 0.025);
      const sole = new THREE.Mesh(new THREE.BoxGeometry(0.096, 0.02, 0.18), soleM);
      sole.position.set(0, -0.375, 0.025);
      knee.add(shoe, sole);
      return { hip, knee };
    }
    const legL = makeLeg(-1);
    const legR = makeLeg(1);
    group.add(npc);

    // จุดหมายการเดินเข้า-เลือกซื้อของ-จ่ายเงิน-เดินออกอย่างเป็นธรรมชาติ (ไม่วาร์ปหายและไม่เดินถอยหลังซ้ำเส้นเดิม)
    const waypoints = [
      { t: 0.0,  x: -4.4, z: bD / 2 + 4.2, act: 'walk', hasBag: false }, // 1. เดินมาจากทางเท้าด้านซ้าย
      { t: 2.6,  x: -0.35, z: bD / 2 + 1.5, act: 'walk', hasBag: false }, // 2. เลี้ยวเข้าหน้าพรมทางเข้า
      { t: 4.5,  x: -0.25, z: bD / 2 - 0.5, act: 'walk', hasBag: false }, // 3. เดินผ่านประตูเลื่อนอัตโนมัติเข้าสู่ตัวร้าน
      { t: 6.4,  x: 1.15,  z: -0.55,        act: 'walk', hasBag: false }, // 4. เดินไปที่ชั้นวางขนม/เครื่องดื่มด้านใน
      { t: 8.6,  x: 1.15,  z: -0.55,        act: 'browse', lookY: 0.15, hasBag: false }, // 5. ยืนเลือกหยิบขนมจากชั้นวาง
      { t: 10.4, x: -2.15, z: -0.85,        act: 'walk', hasBag: false }, // 6. เดินถือของไปหน้าเคาน์เตอร์แคชเชียร์
      { t: 12.6, x: -2.15, z: -0.85,        act: 'pay', lookY: Math.PI, hasBag: true },  // 7. ยืนคิดเงินและรับถุงเซเว่น + แก้วน้ำ
      { t: 14.3, x: 0.25,  z: bD / 2 - 0.3, act: 'walk', hasBag: true },  // 8. เดินถือถุงและแก้วน้ำมุ่งหน้าออกประตู
      { t: 16.2, x: 0.35,  z: bD / 2 + 1.8, act: 'walk', hasBag: true },  // 9. เดินพ้นประตูเลื่อนออกมาหน้าร้าน
      { t: 19.2, x: 4.6,   z: bD / 2 + 4.2, act: 'walk', hasBag: true },  // 10. เดินเลี้ยวไปตามทางเท้าด้านขวาพร้อมจิบน้ำ
      { t: 20.0, x: 5.4,   z: bD / 2 + 4.3, act: 'walk', hasBag: true }
    ];

    return {
      group: group,
      update: function (totalTime) {
        // ถ้าตัวรถอยู่ห่างเกิน 110 หน่วย ให้ข้ามการคำนวณแอนิเมชันทันทีเพื่อประหยัด CPU
        if (typeof car !== 'undefined' && group.position.distanceToSquared(car.position) > 12100) {
          group.visible = false;
          return;
        }
        group.visible = true;

        const cycle = totalTime % 20;
        let seg = waypoints[0], next = waypoints[1];
        for (let i = 0; i < waypoints.length - 1; i++) {
          if (cycle >= waypoints[i].t && cycle <= waypoints[i + 1].t) {
            seg = waypoints[i];
            next = waypoints[i + 1];
            break;
          }
        }
        const span = Math.max(0.001, next.t - seg.t);
        const u = Math.max(0, Math.min(1, (cycle - seg.t) / span));
        // Smoothstep สำหรับช่วงหยุดยืนให้ชะลอและออกตัวนุ่มนวล
        const su = next.act !== 'walk' ? u : u * u * (3 - 2 * u * 0.2) / (3 - 0.4);
        const nx = seg.x + (next.x - seg.x) * su;
        const nz = seg.z + (next.z - seg.z) * su;

        npc.position.x = nx;
        npc.position.z = nz;
        npc.visible = true;

        const hasItems = next.hasBag;
        shoppingBag.visible = hasItems;
        drinkCup.visible = hasItems;

        // ประตูบานเลื่อนอัตโนมัติเปิดเมื่อลูกค้าเดินเข้าใกล้รัศมีหน้าประตู
        const distDoor = Math.hypot(nx, nz - bD / 2);
        const doorOpen = Math.max(0, Math.min(1, (2.1 - distDoor) / 1.1));
        doorSlideL.position.x = -0.35 - doorOpen * 0.62;
        doorSlideR.position.x = 0.35 + doorOpen * 0.62;

        const isWalking = next.act === 'walk' && Math.hypot(next.x - seg.x, next.z - seg.z) > 0.05;
        if (isWalking) {
          const targetYaw = Math.atan2(next.x - seg.x, next.z - seg.z);
          npc.rotation.y = targetYaw;
          const phase = totalTime * 6.8;
          const s = Math.sin(phase), c = Math.cos(phase);

          legL.hip.rotation.x = -s * 0.42;
          legR.hip.rotation.x = s * 0.42;
          legL.knee.rotation.x = Math.max(0, c) * 0.55;
          legR.knee.rotation.x = Math.max(0, -c) * 0.55;

          if (hasItems) {
            // มือซ้ายประคองแก้วน้ำปั่นยกจิบเบาๆ มือขวาแกว่งถือถุงเซเว่น
            armL.sh.rotation.x = -0.65 + Math.sin(totalTime * 2.2) * 0.12;
            armL.el.rotation.x = -0.85;
            armR.sh.rotation.x = -0.15 - s * 0.22;
            armR.el.rotation.x = -0.25;
            shoppingBag.rotation.x = -(armR.sh.rotation.x + armR.el.rotation.x);
          } else {
            armL.sh.rotation.x = s * 0.36;
            armL.el.rotation.x = -0.22 - Math.max(0, -s) * 0.2;
            armR.sh.rotation.x = -s * 0.36;
            armR.el.rotation.x = -0.22 - Math.max(0, s) * 0.2;
          }
          pel.position.y = 0.78 + Math.abs(s) * 0.022;
          tor.rotation.y = s * 0.06;
          headGrp.rotation.y = Math.sin(totalTime * 1.8) * 0.08;
        } else {
          // ท่ายืนเลือกขนมที่ชั้นวาง หรือยืนจ่ายเงินหน้าเคาน์เตอร์
          npc.rotation.y = next.lookY || 0;
          legL.hip.rotation.x = 0;
          legR.hip.rotation.x = 0;
          legL.knee.rotation.x = 0.04;
          legR.knee.rotation.x = 0.04;
          pel.position.y = 0.78 + Math.sin(totalTime * 2.4) * 0.006;
          tor.rotation.y = Math.sin(totalTime * 1.5) * 0.08;
          headGrp.rotation.y = Math.sin(totalTime * 2.6) * 0.22;

          if (next.act === 'browse') {
            // ยื่นมือขวาเลือกหยิบขนมบนชั้น
            const reach = Math.max(0, Math.sin(totalTime * 3.2));
            armR.sh.rotation.x = -0.55 - reach * 0.45;
            armR.el.rotation.x = -0.55 + reach * 0.2;
            armL.sh.rotation.x = -0.15;
            armL.el.rotation.x = -0.35;
          } else {
            // ยืนรับของและจ่ายเงินที่แคชเชียร์
            armL.sh.rotation.x = -0.55;
            armL.el.rotation.x = -0.75;
            armR.sh.rotation.x = -0.35;
            armR.el.rotation.x = -0.45;
            shoppingBag.rotation.x = -(armR.sh.rotation.x + armR.el.rotation.x);
          }
        }
      }
    };
  },

// ==========================================
  // 2. โมเดลโรงเรียนชนบทแบบละเอียด (ซุ้มประตู ป้อมยาม อาคารมีระเบียง โรงอาหาร สนามเด็กเล่น สนามบอล)
  // ==========================================
  createSchool: function (THREE, scene, x, z, rotationY) {
    const group = new THREE.Group();
    group.position.set(x, 0, z);
    group.rotation.y = rotationY;

    // --- 1. เตรียม Materials แบบป้องกัน Z-Fighting ---
    const matOptions = { flatShading: true };
    const bldgMat = new THREE.MeshLambertMaterial({ color: 0xfbf6ea, ...matOptions });
    const upperWallMat = new THREE.MeshLambertMaterial({ color: 0xf4ead5, ...matOptions });
    const trimMat = new THREE.MeshLambertMaterial({ color: 0xd8cfc0, ...matOptions });
    const pillarMat = new THREE.MeshLambertMaterial({ color: 0xffffff, ...matOptions });
    const roofMat = new THREE.MeshLambertMaterial({ color: 0xb53832, ...matOptions });
    const roofSubMat = new THREE.MeshLambertMaterial({ color: 0x3b6e8c, ...matOptions });
    const baseMat = new THREE.MeshLambertMaterial({ color: 0x9aa89e, ...matOptions });
    const grassMat = new THREE.MeshLambertMaterial({ color: 0x6ca344, ...matOptions });
    const darkGrassMat = new THREE.MeshLambertMaterial({ color: 0x558732, ...matOptions });
    const trunkMat = new THREE.MeshLambertMaterial({ color: 0x6e4e37, ...matOptions });
    const woodMat = new THREE.MeshLambertMaterial({ color: 0x7a5230, ...matOptions });
    const lightWoodMat = new THREE.MeshLambertMaterial({ color: 0xb88652, ...matOptions });
    const glassMat = new THREE.MeshLambertMaterial({ color: 0x5c8ab8, ...matOptions });
    const goldMat = new THREE.MeshLambertMaterial({ color: 0xe8b93a, ...matOptions });
    const ironMat = new THREE.MeshLambertMaterial({ color: 0x344048, ...matOptions });
    const brickMat = new THREE.MeshLambertMaterial({ color: 0xb85d43, ...matOptions });

    // ใช้ polygonOffset ดันลำดับการวาดของเส้นสนามและแผ่นทางเดินขึ้นมาด้านหน้าเสมอ ไม่ให้ตีกับพื้นหญ้า
    const lineMat = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      polygonOffset: true,
      polygonOffsetFactor: -4,
      polygonOffsetUnits: -4
    });
    const pathMat = new THREE.MeshLambertMaterial({
      color: 0xd8d0be,
      ...matOptions,
      polygonOffset: true,
      polygonOffsetFactor: -2,
      polygonOffsetUnits: -2
    });

    // พื้นดินผสมหญ้าหน้าโรงเรียนและรอบขอบรั้ว เชื่อมกับพื้นโลกอย่างเป็นธรรมชาติ
    const groundBlendTex = (() => {
      const cv = document.createElement('canvas');
      cv.width = cv.height = 128;
      const ctx = cv.getContext('2d');
      const g = ctx.createRadialGradient(64, 64, 18, 64, 64, 63);
      g.addColorStop(0, 'rgba(162, 140, 106, 0.90)');
      g.addColorStop(0.68, 'rgba(146, 128, 96, 0.58)');
      g.addColorStop(1, 'rgba(130, 118, 88, 0)');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, 128, 128);
      return new THREE.CanvasTexture(cv);
    })();
    const groundBlendMat = new THREE.MeshLambertMaterial({
      map: groundBlendTex,
      transparent: true,
      depthWrite: false,
      polygonOffset: true,
      polygonOffsetFactor: -1,
      polygonOffsetUnits: -1
    });
    const outerApron = new THREE.Mesh(new THREE.PlaneGeometry(42, 34), groundBlendMat);
    outerApron.rotation.x = -Math.PI / 2;
    outerApron.position.set(0, 0.015, 2.2);
    group.add(outerApron);

    // ป้ายชื่อโรงเรียนคมชัดสำหรับซุ้มประตูหน้าโรงเรียน
    const schoolSignTex = (() => {
      const cv = document.createElement('canvas');
      cv.width = 512;
      cv.height = 128;
      const ctx = cv.getContext('2d');
      ctx.fillStyle = '#1d3b58';
      ctx.fillRect(0, 0, 512, 128);
      ctx.strokeStyle = '#e8b93a';
      ctx.lineWidth = 10;
      ctx.strokeRect(8, 8, 496, 112);
      ctx.fillStyle = '#fff8e7';
      ctx.font = 'bold 44px "Noto Sans Thai", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('โรงเรียนบ้านเวียงแก่นวิทยา', 256, 62);
      ctx.fillStyle = '#f5d061';
      ctx.font = '500 26px "Noto Sans Thai", sans-serif';
      ctx.fillText('ความรู้คู่คุณธรรม · นำชุมชนพัฒนา', 256, 100);
      const tex = new THREE.CanvasTexture(cv);
      tex.colorSpace = THREE.SRGBColorSpace;
      return tex;
    })();
    const schoolSignMat = new THREE.MeshBasicMaterial({ map: schoolSignTex });

    // --- 2. เครื่องมือสร้างหลังคาทรงจั่ว (ExtrudeGeometry) ---
    const gableShape = new THREE.Shape();
    gableShape.moveTo(-0.5, 0);
    gableShape.lineTo(0.5, 0);
    gableShape.lineTo(0, 1);
    gableShape.closePath();
    const baseGableGeo = new THREE.ExtrudeGeometry(gableShape, { depth: 1, bevelEnabled: false });
    baseGableGeo.translate(0, 0, -0.5);

    const createGableRoof = (spanW, roofH, length, px, py, pz, alongX, parent, customMat) => {
      const mesh = new THREE.Mesh(baseGableGeo, customMat || roofMat);
      mesh.position.set(px, py, pz);
      if (alongX) mesh.rotation.y = Math.PI / 2;
      mesh.scale.set(spanW, roofH, length);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      parent.add(mesh);

      // สันหลังคาและปั้นลมสีขาวคาดขอบจั่ว
      const ridge = new THREE.Mesh(
        new THREE.BoxGeometry(alongX ? length + 0.12 : 0.16, 0.12, alongX ? 0.16 : length + 0.12),
        trimMat
      );
      ridge.position.set(px, py + roofH + 0.02, pz);
      parent.add(ridge);
      return mesh;
    };

    // --- 3. พื้นที่โรงเรียน (จัดเรียงชั้นความสูง Y แบบขั้นบันได ไม่ให้เนื้อโมเดลซ้อนกัน) ---
    const baseW = 34, baseD = 26;
    const base = new THREE.Mesh(new THREE.BoxGeometry(baseW, 0.14, baseD), baseMat);
    base.position.set(0, 0.07, 0);
    base.receiveShadow = true;
    group.add(base);

    const field = new THREE.Mesh(new THREE.BoxGeometry(baseW - 1.6, 0.06, baseD - 1.6), grassMat);
    field.position.set(0, 0.17, 0);
    field.receiveShadow = true;
    group.add(field);

    // ลานปูนอเนกประสงค์หน้าเสาธงและหน้าอาคารเรียน
    const courtyard = new THREE.Mesh(new THREE.BoxGeometry(17.5, 0.04, 6.2), baseMat);
    courtyard.position.set(4, 0.22, -3.4);
    courtyard.receiveShadow = true;
    group.add(courtyard);

    // ถนนทางเดินเข้าโรงเรียนเชื่อมจากริมถนนใหญ่ผ่านซุ้มประตูเข้าสู่ลานเสาธง
    const entranceWalk = new THREE.Mesh(new THREE.BoxGeometry(3.8, 0.05, 5.2), pathMat);
    entranceWalk.position.set(4, 0.215, 12.6);
    entranceWalk.receiveShadow = true;
    group.add(entranceWalk);

    // แผ่นหินทางเดินเรียงนำสายตาหน้าซุ้มประตูโรงเรียน
    for (let s = 0; s < 4; s++) {
      const stepStone = new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.04, 0.45), trimMat);
      stepStone.position.set(4, 0.03, 13.5 + s * 0.72);
      group.add(stepStone);
    }

    // --- 3.1 รั้วกำแพงโรงเรียนแบบละเอียด (เสารั้วเว้นช่อง + กำแพงอิฐฉาบ + ลูกกรงเหล็ก + แปลงดอกไม้หน้ากำแพง) ---
    const buildDetailedFence = (x0, x1, zPos) => {
      const len = x1 - x0;
      const midX = (x0 + x1) * 0.5;
      const lowWall = new THREE.Mesh(new THREE.BoxGeometry(len, 0.55, 0.26), bldgMat);
      lowWall.position.set(midX, 0.42, zPos);
      lowWall.castShadow = true;
      const wallBase = new THREE.Mesh(new THREE.BoxGeometry(len + 0.06, 0.18, 0.32), brickMat);
      wallBase.position.set(midX, 0.23, zPos);
      const topRail = new THREE.Mesh(new THREE.BoxGeometry(len, 0.07, 0.12), ironMat);
      topRail.position.set(midX, 1.02, zPos);
      group.add(lowWall, wallBase, topRail);

      const nPosts = Math.max(2, Math.round(len / 2.6));
      for (let i = 0; i <= nPosts; i++) {
        const px = x0 + (i / nPosts) * len;
        const post = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.98, 0.34), trimMat);
        post.position.set(px, 0.63, zPos);
        post.castShadow = true;
        const cap = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.1, 0.42), roofMat);
        cap.position.set(px, 1.16, zPos);
        group.add(post, cap);
      }

      // แปลงไม้พุ่มดอกไม้ประดับด้านนอกกำแพงหน้าโรงเรียน
      const planter = new THREE.Mesh(new THREE.BoxGeometry(len - 0.8, 0.22, 0.55), brickMat);
      planter.position.set(midX, 0.12, zPos + 0.42);
      group.add(planter);
      const flCols = [0xe85d75, 0xf5c438, 0x5ab963];
      for (let fx = x0 + 0.8; fx <= x1 - 0.8; fx += 1.1) {
        const bush = new THREE.Mesh(
          new THREE.IcosahedronGeometry(0.24, 0),
          new THREE.MeshLambertMaterial({ color: flCols[Math.abs(Math.round(fx)) % 3], ...matOptions })
        );
        bush.position.set(fx, 0.32, zPos + 0.42);
        bush.scale.set(1.15, 0.8, 1);
        group.add(bush);
      }
    };
    buildDetailedFence(-16.5, 1.8, 12.6);
    buildDetailedFence(6.2, 16.5, 12.6);

    // ซุ้มประตูใหญ่หน้าโรงเรียนพร้อมหลังคาทรงจั่วและป้ายชื่อโรงเรียน
    for (const gx of [1.85, 6.15]) {
      const gatePillar = new THREE.Mesh(new THREE.BoxGeometry(0.62, 3.1, 0.62), pillarMat);
      gatePillar.position.set(gx, 1.68, 12.6);
      gatePillar.castShadow = true;
      const pBase = new THREE.Mesh(new THREE.BoxGeometry(0.76, 0.45, 0.76), brickMat);
      pBase.position.set(gx, 0.36, 12.6);
      group.add(gatePillar, pBase);
    }
    const archBeam = new THREE.Mesh(new THREE.BoxGeometry(5.1, 0.65, 0.52), trimMat);
    archBeam.position.set(4, 3.15, 12.6);
    const signBoard = new THREE.Mesh(new THREE.BoxGeometry(4.3, 0.82, 0.58), schoolSignMat);
    signBoard.position.set(4, 3.22, 12.6);
    group.add(archBeam, signBoard);
    createGableRoof(1.5, 0.85, 5.5, 4, 3.55, 12.6, true, group, roofMat);

    // บานประตูรั้วเหล็กดัดเปิดอ้าต้อนรับสองฝั่ง + ป้อมยามหน้าประตูโรงเรียน
    for (const side of [-1, 1]) {
      const gateLeaf = new THREE.Mesh(new THREE.BoxGeometry(1.65, 1.1, 0.08), ironMat);
      gateLeaf.position.set(4 + side * 1.65, 0.72, 12.15);
      gateLeaf.rotation.y = side * 0.55;
      group.add(gateLeaf);
    }
    const guardBox = new THREE.Group();
    guardBox.position.set(0.3, 0.2, 11.2);
    const gBody = new THREE.Mesh(new THREE.BoxGeometry(1.5, 1.8, 1.5), bldgMat);
    gBody.position.y = 0.9;
    gBody.castShadow = true;
    const gWin = new THREE.Mesh(new THREE.BoxGeometry(1.56, 0.65, 1.1), glassMat);
    gWin.position.y = 1.15;
    guardBox.add(gBody, gWin);
    createGableRoof(1.9, 0.65, 1.9, 0, 1.8, 0, false, guardBox, roofSubMat);
    group.add(guardBox);

    // --- 4. อาคารเรียนทรงตัว U แบบ 2 ชั้นครึ่งยกพื้นมีระเบียงทางเดิน เสาเรียงแถว และนาฬิกาโรงเรียน ---
    const bldgGrp = new THREE.Group();
    bldgGrp.position.set(4, 0.20, -7);
    group.add(bldgGrp);

    const createWingBuilding = (w, h, d, px, pz, alongX) => {
      // ฐานอาคารยกพื้นสูง (Plinth)
      const plinth = new THREE.Mesh(new THREE.BoxGeometry(w + 0.6, 0.42, d + 0.6), trimMat);
      plinth.position.set(px, 0.21, pz);
      plinth.receiveShadow = true;
      bldgGrp.add(plinth);

      // ตัวอาคารชั้นล่างและชั้นบนคาดแถบสีครีมอ่อน-ขาว
      const lowerBody = new THREE.Mesh(new THREE.BoxGeometry(w, h * 0.48, d), bldgMat);
      lowerBody.position.set(px, h * 0.24 + 0.42, pz);
      lowerBody.castShadow = true;
      lowerBody.receiveShadow = true;
      const midBelt = new THREE.Mesh(new THREE.BoxGeometry(w + 0.16, 0.14, d + 0.16), trimMat);
      midBelt.position.set(px, h * 0.48 + 0.42, pz);
      const upperBody = new THREE.Mesh(new THREE.BoxGeometry(w, h * 0.52, d), upperWallMat);
      upperBody.position.set(px, h * 0.74 + 0.42, pz);
      upperBody.castShadow = true;
      upperBody.receiveShadow = true;
      const cornice = new THREE.Mesh(new THREE.BoxGeometry(w + 0.32, 0.22, d + 0.32), trimMat);
      cornice.position.set(px, h + 0.42, pz);
      bldgGrp.add(lowerBody, midBelt, upperBody, cornice);

      if (alongX) {
        // หลังคาจั่วหลักพร้อมระเบียงทางเดินด้านหน้า (Veranda Corridor)
        createGableRoof(d + 1.3, 1.65, w + 1.0, px, h + 0.48, pz + 0.2, true, bldgGrp);

        // พื้นระเบียงหน้าห้องเรียน + ราวกันตกไม้ + เสาระเบียงเรียงแถว
        const verandaZ = pz + d / 2 + 0.55;
        const verandaFloor = new THREE.Mesh(new THREE.BoxGeometry(w + 0.2, 0.12, 1.1), pathMat);
        verandaFloor.position.set(px, 0.44, verandaZ);
        const railBar = new THREE.Mesh(new THREE.BoxGeometry(w - 2.4, 0.52, 0.1), woodMat);
        railBar.position.set(px, 0.72, verandaZ + 0.48);
        bldgGrp.add(verandaFloor, railBar);

        for (let ix = px - w / 2 + 1.6; ix <= px + w / 2 - 1.6; ix += 2.2) {
          // เสาระเบียงด้านหน้า
          const col = new THREE.Mesh(new THREE.BoxGeometry(0.2, h, 0.2), pillarMat);
          col.position.set(ix - 1.05, h / 2 + 0.42, verandaZ + 0.45);
          col.castShadow = true;
          bldgGrp.add(col);

          // หน้าต่าง 2 ชั้น (ชั้นล่างและชั้นบน) พร้อมกรอบไม้และกันสาด
          for (const wy of [1.22, 2.58]) {
            const frame = new THREE.Mesh(new THREE.BoxGeometry(1.22, 0.92, d + 0.08), woodMat);
            frame.position.set(ix, wy, pz);
            const glass = new THREE.Mesh(new THREE.BoxGeometry(1.0, 0.72, d + 0.14), glassMat);
            glass.position.set(ix, wy, pz);
            const mullion = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.74, d + 0.18), trimMat);
            mullion.position.set(ix, wy, pz);
            const awning = new THREE.Mesh(new THREE.BoxGeometry(1.32, 0.06, d + 0.36), roofMat);
            awning.position.set(ix, wy + 0.48, pz);
            bldgGrp.add(frame, glass, mullion, awning);
          }
        }
      } else {
        createGableRoof(w + 1.0, 1.48, d + 1.0, px, h + 0.48, pz, false, bldgGrp);
        for (let iz = pz - d / 2 + 1.5; iz <= pz + d / 2 - 1.5; iz += 2.2) {
          for (const wy of [1.22, 2.58]) {
            const frame = new THREE.Mesh(new THREE.BoxGeometry(w + 0.08, 0.92, 1.22), woodMat);
            frame.position.set(px, wy, iz);
            const glass = new THREE.Mesh(new THREE.BoxGeometry(w + 0.14, 0.72, 1.0), glassMat);
            glass.position.set(px, wy, iz);
            const mullion = new THREE.Mesh(new THREE.BoxGeometry(w + 0.18, 0.74, 0.06), trimMat);
            mullion.position.set(px, wy, iz);
            const awning = new THREE.Mesh(new THREE.BoxGeometry(w + 0.36, 0.06, 1.32), roofMat);
            awning.position.set(px, wy + 0.48, iz);
            bldgGrp.add(frame, glass, mullion, awning);
          }
        }
      }
    };

    // อาคารกลางและปีกซ้าย-ขวา
    createWingBuilding(16.4, 3.2, 4.2, 0, -2, true);
    createWingBuilding(4.0, 3.0, 7.2, -6.2, 2.5, false);
    createWingBuilding(4.0, 3.0, 7.2, 6.2, 2.5, false);

    // มุขทางเข้ากลางอาคารเรียน + บันไดขึ้นอาคาร + ประตูไม้บานคู่ + นาฬิกาหน้าจั่ว
    const mainDoorFrame = new THREE.Mesh(new THREE.BoxGeometry(1.9, 2.2, 0.16), trimMat);
    mainDoorFrame.position.set(0, 1.52, 0.12);
    const mainDoor = new THREE.Mesh(new THREE.BoxGeometry(1.65, 2.05, 0.2), woodMat);
    mainDoor.position.set(0, 1.48, 0.14);
    bldgGrp.add(mainDoorFrame, mainDoor);

    for (let st = 0; st < 3; st++) {
      const step = new THREE.Mesh(new THREE.BoxGeometry(2.5, 0.14, 0.36), trimMat);
      step.position.set(0, 0.08 + st * 0.14, 1.55 - st * 0.32);
      bldgGrp.add(step);
    }
    for (const sx of [-1.15, 1.15]) {
      const porchCol = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.13, 2.6, 6), pillarMat);
      porchCol.position.set(sx, 1.72, 1.05);
      bldgGrp.add(porchCol);
    }
    createGableRoof(3.2, 0.95, 2.1, 0, 2.95, 0.65, false, bldgGrp);

    // นาฬิกาโรงเรียนหน้าปัดกลมติดหน้าจั่วกลาง
    const clockRim = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.42, 0.1, 12), goldMat);
    clockRim.rotation.x = Math.PI / 2;
    clockRim.position.set(0, 3.38, 1.72);
    const clockFace = new THREE.Mesh(new THREE.CylinderGeometry(0.34, 0.34, 0.12, 12), pillarMat);
    clockFace.rotation.x = Math.PI / 2;
    clockFace.position.set(0, 3.38, 1.73);
    const hand1 = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.22, 0.04), ironMat);
    hand1.position.set(0, 3.45, 1.8);
    const hand2 = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.04, 0.04), ironMat);
    hand2.position.set(0.07, 3.38, 1.8);
    bldgGrp.add(clockRim, clockFace, hand1, hand2);

    // --- 5. เสาธงหน้าอาคารเรียนแบบฐานย่อมุม 3 ชั้นและแท่นผู้นำเชิญธง ---
    const flagBase1 = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.18, 1.8), trimMat);
    flagBase1.position.set(4, 0.31, -2.5);
    const flagBase2 = new THREE.Mesh(new THREE.BoxGeometry(1.3, 0.2, 1.3), pillarMat);
    flagBase2.position.set(4, 0.48, -2.5);
    const flagBase3 = new THREE.Mesh(new THREE.BoxGeometry(0.85, 0.22, 0.85), goldMat);
    flagBase3.position.set(4, 0.68, -2.5);
    const podium = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.28, 0.7), trimMat);
    podium.position.set(4, 0.36, -3.75);
    group.add(flagBase1, flagBase2, flagBase3, podium);

    const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.07, 6.2, 8), pillarMat);
    pole.position.set(4, 3.65, -2.5);
    pole.castShadow = true;
    const poleTop = new THREE.Mesh(new THREE.SphereGeometry(0.11, 8, 8), goldMat);
    poleTop.position.set(4, 6.8, -2.5);
    group.add(pole, poleTop);

    const flagGrp = new THREE.Group();
    flagGrp.position.set(4.55, 6.25, -2.5);
    group.add(flagGrp);
    const fColors = [0xce1126, 0xffffff, 0x002868, 0xffffff, 0xce1126];
    const fHeights = [0.11, 0.11, 0.22, 0.11, 0.11];
    let curY = 0.28;
    fColors.forEach((col, idx) => {
      const h = fHeights[idx];
      const strip = new THREE.Mesh(new THREE.BoxGeometry(1.1, h, 0.02), new THREE.MeshBasicMaterial({ color: col }));
      strip.position.y = curY - h / 2;
      curY -= h;
      flagGrp.add(strip);
    });

    // --- 5.5 ศาลาอเนกประสงค์ / โรงอาหารนักเรียน (ฝั่งขวาของสนาม) + แป้นบาสเกตบอล ---
    const canteen = new THREE.Group();
    canteen.position.set(14.2, 0.2, -1.2);
    const cFloor = new THREE.Mesh(new THREE.BoxGeometry(3.8, 0.16, 7.6), trimMat);
    cFloor.position.y = 0.08;
    cFloor.receiveShadow = true;
    canteen.add(cFloor);
    for (const cx of [-1.6, 1.6]) {
      for (const cz of [-3.2, -1.1, 1.1, 3.2]) {
        const cCol = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.1, 2.2, 6), woodMat);
        cCol.position.set(cx, 1.18, cz);
        cCol.castShadow = true;
        canteen.add(cCol);
      }
    }
    // โต๊ะม้านั่งโรงอาหาร 3 ชุด
    for (const tz of [-2.1, 0, 2.1]) {
      const tbl = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.08, 0.7), lightWoodMat);
      tbl.position.set(0, 0.68, tz);
      const b1 = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.06, 0.3), woodMat);
      b1.position.set(0, 0.42, tz - 0.55);
      const b2 = b1.clone();
      b2.position.z = tz + 0.55;
      canteen.add(tbl, b1, b2);
    }
    createGableRoof(4.5, 1.15, 8.4, 0, 2.28, 0, false, canteen, roofSubMat);
    group.add(canteen);

    // แป้นบาสเกตบอลริมลานปูน
    const hoopGrp = new THREE.Group();
    hoopGrp.position.set(12.2, 0.22, -3.5);
    const hPole = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.07, 2.8, 6), ironMat);
    hPole.position.y = 1.4;
    const hBoard = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.9, 1.25), pillarMat);
    hBoard.position.set(-0.25, 2.55, 0);
    const hRim = new THREE.Mesh(new THREE.TorusGeometry(0.22, 0.025, 6, 12), roofMat);
    hRim.rotation.x = Math.PI / 2;
    hRim.position.set(-0.52, 2.32, 0);
    hoopGrp.add(hPole, hBoard, hRim);
    group.add(hoopGrp);

    // --- 6. สวนหย่อม & เครื่องเล่นสนามโรงเรียน (สไลเดอร์ & ชิงช้า) ---
    const gardenBase = new THREE.Mesh(new THREE.BoxGeometry(9.5, 0.04, 16), darkGrassMat);
    gardenBase.position.set(-10.5, 0.22, -2);
    gardenBase.receiveShadow = true;
    group.add(gardenBase);

    const path1 = new THREE.Mesh(new THREE.BoxGeometry(8.5, 0.03, 1.4), pathMat);
    path1.position.set(-10.5, 0.255, -2);
    const path2 = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.035, 14.5), pathMat);
    path2.position.set(-10.5, 0.262, -2);
    group.add(path1, path2);

    const createBench = (bx, bz, rotY) => {
      const bGrp = new THREE.Group();
      bGrp.position.set(bx, 0.24, bz);
      bGrp.rotation.y = rotY;
      const seat = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.08, 0.45), woodMat);
      seat.position.y = 0.35;
      seat.castShadow = true;
      const backrest = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.32, 0.07), lightWoodMat);
      backrest.position.set(0, 0.54, -0.19);
      const leg1 = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.35, 0.4), trimMat);
      leg1.position.set(-0.5, 0.175, 0);
      const leg2 = leg1.clone();
      leg2.position.x = 0.5;
      bGrp.add(seat, backrest, leg1, leg2);
      group.add(bGrp);
    };
    createBench(-12.5, -0.6, 0);
    createBench(-8.5, -3.4, Math.PI);

    // เครื่องเล่นสนามโรงเรียน: สไลเดอร์และชิงช้าในสวนหย่อม
    const playSet = new THREE.Group();
    playSet.position.set(-12.6, 0.24, 3.2);
    const tower = new THREE.Mesh(new THREE.BoxGeometry(1.1, 1.2, 1.1), lightWoodMat);
    tower.position.y = 0.6;
    const tRoof = new THREE.Mesh(new THREE.ConeGeometry(0.95, 0.7, 4), roofMat);
    tRoof.position.y = 1.95;
    tRoof.rotation.y = Math.PI / 4;
    for (const tx of [-0.45, 0.45]) {
      for (const tz of [-0.45, 0.45]) {
        const tp = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 1.6, 6), woodMat);
        tp.position.set(tx, 0.8, tz);
        playSet.add(tp);
      }
    }
    const slideChute = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.08, 1.85), goldMat);
    slideChute.position.set(0, 0.58, 1.25);
    slideChute.rotation.x = 0.58;
    playSet.add(tower, tRoof, slideChute);
    group.add(playSet);

    const treeLeafGeo = new THREE.IcosahedronGeometry(1, 0);
    const treeBranchGeo = new THREE.CylinderGeometry(0.035, 0.075, 1, 5);
    const createLowPolyTree = (px, pz, scale, colorHex) => {
      const treeGrp = new THREE.Group();
      treeGrp.position.set(px, 0.24, pz);
      treeGrp.scale.setScalar(scale);

      const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.28, 1.65, 6), trunkMat);
      trunk.position.y = 0.82;
      trunk.castShadow = true;
      treeGrp.add(trunk);

      const leafM = new THREE.MeshLambertMaterial({ color: colorHex, flatShading: true, ...matOptions });
      const leafShadeM = new THREE.MeshLambertMaterial({ color: colorHex, flatShading: true, ...matOptions });
      leafShadeM.color.multiplyScalar(0.78);
      const leafLightM = new THREE.MeshLambertMaterial({ color: colorHex, flatShading: true, ...matOptions });
      leafLightM.color.lerp(new THREE.Color(0xffffff), 0.16);
      const levels = [
        { y: 1.38, length: 1.02 },
        { y: 1.92, length: 0.76 },
        { y: 2.42, length: 0.48 }
      ];
      const crownWind = (px - pz) * 0.025;
      levels.forEach((level, li) => {
        for (let b = 0; b < 4; b++) {
          const angle = (b / 4) * Math.PI * 2 + li * 0.52,
            direction = new THREE.Vector3(Math.cos(angle) + crownWind, 0.22, Math.sin(angle) - crownWind * 0.5).normalize(),
            length = level.length * (0.9 + ((b + li) % 3) * 0.06),
            start = new THREE.Vector3(0, level.y, 0),
            end = start.clone().addScaledVector(direction, length),
            branch = new THREE.Mesh(treeBranchGeo, trunkMat);
          branch.position.copy(start).lerp(end, 0.5);
          branch.scale.y = length;
          branch.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction);
          branch.castShadow = li === 0;
          treeGrp.add(branch);

          const leafMaterials = [leafM, leafShadeM, leafLightM],
            foliage = new THREE.Mesh(treeLeafGeo, leafMaterials[(b + li) % leafMaterials.length]);
          foliage.position.copy(end);
          const leafSize = 0.54 + ((b * 3 + li * 2) % 6) * 0.1;
          if ((b + li * 2) % 4 === 0) {
            foliage.scale.set(leafSize * 0.9, leafSize * 0.72, leafSize * 0.84);
          } else {
            foliage.scale.set(leafSize, 0.15 + leafSize * 0.11, 0.2 + leafSize * 0.2);
          }
          foliage.rotation.set((b % 3 - 1) * 0.08, angle + (b % 2 ? 0.12 : -0.08), -direction.y * 0.5);
          treeGrp.add(foliage);
        }
      });
      group.add(treeGrp);
    };

    createLowPolyTree(-13.5, -7.5, 1.35, 0x489b4b);
    createLowPolyTree(-7.5, -7.5, 1.48, 0x56ab5a);
    createLowPolyTree(-13.8, 7.2, 1.25, 0x3d8c40);
    createLowPolyTree(-7.5, 6.8, 1.32, 0x489b4b);
    createLowPolyTree(14.5, -9.5, 1.42, 0x56ab5a);
    createLowPolyTree(14.5, 9.5, 1.28, 0x3d8c40);

    const bushColors = [0xe86f88, 0xf2c14e, 0x62ab57];
    for (let i = 0; i < 8; i++) {
      const bMesh = new THREE.Mesh(
        new THREE.IcosahedronGeometry(0.38, 0),
        new THREE.MeshLambertMaterial({ color: bushColors[i % 3], ...matOptions })
      );
      bMesh.position.set(-14 + (i % 2) * 7, 0.46, -5.5 + Math.floor(i / 2) * 2.5);
      bMesh.scale.set(1, 0.75, 1);
      bMesh.castShadow = true;
      group.add(bMesh);
    }

    // --- 7. สนามฟุตบอลพร้อมตาข่ายประตูและลูกฟุตบอลกลิ้งในสนาม ---
    const fW = 16, fD = 9;
    const fCenterX = 4, fCenterZ = 5.2;
    const createLine = (w, d, px, pz) => {
      const line = new THREE.Mesh(new THREE.BoxGeometry(w, 0.02, d), lineMat);
      line.position.set(px, 0.215, pz);
      group.add(line);
    };
    createLine(fW, 0.12, fCenterX, fCenterZ + fD / 2);
    createLine(fW, 0.12, fCenterX, fCenterZ - fD / 2);
    createLine(0.12, fD, fCenterX - fW / 2, fCenterZ);
    createLine(0.12, fD, fCenterX + fW / 2, fCenterZ);
    createLine(0.12, fD, fCenterX, fCenterZ);
    // กรอบเขตโทษซ้าย-ขวา
    createLine(2.2, 0.1, fCenterX - fW / 2 + 1.1, fCenterZ - 2.1);
    createLine(2.2, 0.1, fCenterX - fW / 2 + 1.1, fCenterZ + 2.1);
    createLine(0.1, 4.2, fCenterX - fW / 2 + 2.2, fCenterZ);
    createLine(2.2, 0.1, fCenterX + fW / 2 - 1.1, fCenterZ - 2.1);
    createLine(2.2, 0.1, fCenterX + fW / 2 - 1.1, fCenterZ + 2.1);
    createLine(0.1, 4.2, fCenterX + fW / 2 - 2.2, fCenterZ);

    const circleRing = new THREE.Mesh(new THREE.RingGeometry(1.4, 1.52, 16), lineMat);
    circleRing.rotation.x = -Math.PI / 2;
    circleRing.position.set(fCenterX, 0.225, fCenterZ);
    group.add(circleRing);

    const goalMat = new THREE.MeshLambertMaterial({ color: 0xffffff, ...matOptions });
    const netMat = new THREE.MeshBasicMaterial({ color: 0xeef4f8, wireframe: true, transparent: true, opacity: 0.45 });
    const createGoal = (px, pz, rotY) => {
      const goalGrp = new THREE.Group();
      goalGrp.position.set(px, 0.20, pz);
      goalGrp.rotation.y = rotY;
      const pL = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 1.4, 6), goalMat);
      pL.position.set(-1.3, 0.7, 0);
      const pR = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 1.4, 6), goalMat);
      pR.position.set(1.3, 0.7, 0);
      const pT = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 2.6, 6), goalMat);
      pT.rotation.z = Math.PI / 2;
      pT.position.set(0, 1.4, 0);
      const netBox = new THREE.Mesh(new THREE.BoxGeometry(2.55, 1.35, 0.75, 4, 3, 2), netMat);
      netBox.position.set(0, 0.68, -0.38);
      goalGrp.add(pL, pR, pT, netBox);
      group.add(goalGrp);
    };
    createGoal(fCenterX - fW / 2, fCenterZ, Math.PI / 2);
    createGoal(fCenterX + fW / 2, fCenterZ, -Math.PI / 2);

    const soccerBall = new THREE.Mesh(
      new THREE.IcosahedronGeometry(0.14, 1),
      new THREE.MeshLambertMaterial({ color: 0xf7f7f7, flatShading: true })
    );
    soccerBall.position.set(fCenterX, 0.34, fCenterZ);
    group.add(soccerBall);

    // แก้ไข: สร้าง Bounding Sphere คลุมโรงเรียนแทนการปิด Culling เพื่อให้ GPU ตัดการทำงานตอนรถขับผ่านไปแล้ว (ดึง FPS กลับมา)
    const box3 = new THREE.Box3().setFromObject(group);
    const sphere = new THREE.Sphere();
    box3.getBoundingSphere(sphere);
    group.boundingSphere = sphere;
    
    scene.add(group);

    // --- 8. นักเรียน 14 คน ---
    const students = [];
    const skinM = new THREE.MeshLambertMaterial({ color: 0xffccaa, ...matOptions });
    const shirtM = new THREE.MeshLambertMaterial({ color: 0xffffff, ...matOptions });
    const boyPantsM = new THREE.MeshLambertMaterial({ color: 0x8b7355, ...matOptions });
    const girlSkirtM = new THREE.MeshLambertMaterial({ color: 0x1a2b4c, ...matOptions });
    const sockM = new THREE.MeshLambertMaterial({ color: 0xffffff, ...matOptions });
    const shoeM = new THREE.MeshLambertMaterial({ color: 0x222222, ...matOptions });
    const hairM = new THREE.MeshLambertMaterial({ color: 0x1a1615, ...matOptions });
    const bagMats = [0x2b5b84, 0xc23b3b, 0x3b7a57].map(c => new THREE.MeshLambertMaterial({ color: c, ...matOptions }));

    const randomSafeTarget = (zone) => {
      if (zone === 'garden') {
        return {
          x: -12.5 + Math.random() * 4.5,
          z: -6.0 + Math.random() * 8.0
        };
      }
      return {
        x: -3.2 + Math.random() * 14.5,
        z: 0.5 + Math.random() * 9.5
      };
    };

    const createStudent = (isBoy, zone, idx) => {
      const stu = new THREE.Group();
      const startPos = randomSafeTarget(zone);
      const groundY = zone === 'garden' ? 0.25 : 0.21;
      stu.position.set(startPos.x, groundY, startPos.z);
      group.add(stu);

      const innerGrp = new THREE.Group();
      stu.add(innerGrp);

      const headGrp = new THREE.Group();
      headGrp.position.y = 0.58;
      const head = new THREE.Mesh(new THREE.IcosahedronGeometry(0.09, 1), skinM);
      const hair = new THREE.Mesh(new THREE.IcosahedronGeometry(0.096, 1), hairM);
      hair.position.set(0, 0.025, -0.01);
      hair.scale.set(1, 0.85, 1.05);
      headGrp.add(head, hair);
      if (!isBoy) {
        const ponytail = new THREE.Mesh(new THREE.ConeGeometry(0.04, 0.14, 5), hairM);
        ponytail.position.set(0, -0.02, -0.1);
        ponytail.rotation.x = -0.6;
        headGrp.add(ponytail);
      }
      innerGrp.add(headGrp);

      const torso = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.21, 0.1), shirtM);
      torso.position.y = 0.35;
      torso.castShadow = true;
      innerGrp.add(torso);

      const bottom = new THREE.Mesh(
        isBoy ? new THREE.BoxGeometry(0.155, 0.11, 0.095) : new THREE.CylinderGeometry(0.075, 0.115, 0.14, 6),
        isBoy ? boyPantsM : girlSkirtM
      );
      bottom.position.y = 0.2;
      innerGrp.add(bottom);

      const backpack = new THREE.Mesh(new THREE.BoxGeometry(0.13, 0.18, 0.07), bagMats[idx % 3]);
      backpack.position.set(0, 0.35, -0.08);
      innerGrp.add(backpack);

      const armL = new THREE.Group();
      armL.position.set(-0.105, 0.43, 0);
      innerGrp.add(armL);
      const armR = new THREE.Group();
      armR.position.set(0.105, 0.43, 0);
      innerGrp.add(armR);

      const buildArm = (armGrp) => {
        const sleeve = new THREE.Mesh(new THREE.BoxGeometry(0.048, 0.07, 0.048), shirtM);
        sleeve.position.y = -0.03;
        const forearm = new THREE.Mesh(new THREE.BoxGeometry(0.038, 0.12, 0.038), skinM);
        forearm.position.y = -0.11;
        armGrp.add(sleeve, forearm);
      };
      buildArm(armL);
      buildArm(armR);

      const legL = new THREE.Group();
      legL.position.set(-0.042, 0.15, 0);
      innerGrp.add(legL);
      const legR = new THREE.Group();
      legR.position.set(0.042, 0.15, 0);
      innerGrp.add(legR);

      const buildLeg = (legGrp) => {
        const calf = new THREE.Mesh(new THREE.BoxGeometry(0.042, 0.08, 0.042), skinM);
        calf.position.y = -0.04;
        const sock = new THREE.Mesh(new THREE.BoxGeometry(0.044, 0.05, 0.044), sockM);
        sock.position.y = -0.1;
        const shoe = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.035, 0.085), shoeM);
        shoe.position.set(0, -0.135, 0.018);
        legGrp.add(calf, sock, shoe);
      };
      buildLeg(legL);
      buildLeg(legR);

      const nextTarget = randomSafeTarget(zone);
      students.push({
        grp: stu,
        innerGrp,
        arms: [armL, armR],
        legs: [legL, legR],
        zone,
        tx: nextTarget.x,
        tz: nextTarget.z,
        speed: zone === 'garden' ? 0.65 + Math.random() * 0.25 : 0.85 + Math.random() * 0.85,
        pauseTime: Math.random() * 2.5,
        walkCycle: Math.random() * Math.PI * 2
      });
    };

    for (let i = 0; i < 14; i++) {
      createStudent(i % 2 === 0, i < 3 ? 'garden' : 'field', i);
    }

    let lastTime = 0;

    return {
      group: group,
      update: function (totalTime) {
        // ถ้าตัวรถอยู่ห่างเกิน 110 หน่วย ให้ข้ามการคำนวณแอนิเมชันทันทีเพื่อประหยัด CPU
        if (typeof car !== 'undefined' && group.position.distanceToSquared(car.position) > 12100) {
          group.visible = false;
          return;
        }
        group.visible = true;

        const dt = Math.min(0.05, lastTime === 0 ? 0.016 : Math.max(0.001, totalTime - lastTime));
        lastTime = totalTime;

        flagGrp.rotation.y = Math.sin(totalTime * 2.5) * 0.15;

        // เช็คว่าเป็นตอนกลางคืน หรือฝนกำลังตกหรือไม่
        const isNightOrRain = (typeof window.__isNight !== 'undefined' && window.__isNight) || 
                              (window.RODENV && window.RODENV.rain() > 0.15);

        students.forEach(stu => {
          if (isNightOrRain) {
            stu.grp.visible = false; // ซ่อนเด็กนักเรียนเข้าอาคารเมื่อมืดหรือฝนตก
            return;
          }
          stu.grp.visible = true;

          if (stu.pauseTime > 0) {
            stu.pauseTime -= dt;
            stu.innerGrp.position.y = 0;
            stu.arms[0].rotation.x *= 0.85;
            stu.arms[1].rotation.x *= 0.85;
            stu.legs[0].rotation.x *= 0.85;
            stu.legs[1].rotation.x *= 0.85;
            return;
          }

          const dx = stu.tx - stu.grp.position.x;
          const dz = stu.tz - stu.grp.position.z;
          const dist = Math.hypot(dx, dz);

          if (dist < 0.4) {
            const next = randomSafeTarget(stu.zone);
            stu.tx = next.x;
            stu.tz = next.z;
            stu.speed = stu.zone === 'garden' ? 0.65 + Math.random() * 0.25 : 0.85 + Math.random() * 0.85;
            stu.pauseTime = 1.0 + Math.random() * 2.8;
            return;
          }

          const step = Math.min(dist, stu.speed * dt);
          const vx = (dx / dist) * step;
          const vz = (dz / dist) * step;

          stu.grp.position.x += vx;
          stu.grp.position.z += vz;

          const targetYaw = Math.atan2(dx, dz);
          let diff = targetYaw - stu.grp.rotation.y;
          while (diff > Math.PI) diff -= Math.PI * 2;
          while (diff < -Math.PI) diff += Math.PI * 2;
          stu.grp.rotation.y += diff * Math.min(1, dt * 7);

          stu.walkCycle += stu.speed * dt * 4.2;
          const isJogging = stu.speed > 1.3;
          const swingAmp = isJogging ? 0.55 : 0.35;
          const swing = Math.sin(stu.walkCycle) * swingAmp;

          stu.arms[0].rotation.x = swing;
          stu.arms[1].rotation.x = -swing;
          stu.legs[0].rotation.x = -swing;
          stu.legs[1].rotation.x = swing;

          stu.innerGrp.position.y = Math.abs(Math.sin(stu.walkCycle)) * (isJogging ? 0.035 : 0.018);
        });
      }
    };
  },

  // ==========================================
  // 3. โมเดลคาเฟ่ไม้สไตล์มินิมอล (Drip Coffee Hut)
  // ==========================================
  createCoffeeHut: function (THREE, scene, x, z, rotationY) {
    const group = new THREE.Group();
    group.position.set(x, 0, z);
    group.rotation.y = rotationY;
    
    const woodMat = new THREE.MeshLambertMaterial({ color: 0x79502f, flatShading: true });
    const plankMat = new THREE.MeshLambertMaterial({ color: 0xb98551, flatShading: true });
    const lightWoodMat = new THREE.MeshLambertMaterial({ color: 0xd2b48c, flatShading: true });
    const darkMat = new THREE.MeshLambertMaterial({ color: 0x303832, flatShading: true });
    const darkRoofMat = new THREE.MeshLambertMaterial({ color: 0x41463f, flatShading: true });
    const roofRibMat = new THREE.MeshLambertMaterial({ color: 0x66685d, flatShading: true });
    const whiteMat = new THREE.MeshLambertMaterial({ color: 0xfffdfa, flatShading: true });
    const metalMat = new THREE.MeshLambertMaterial({ color: 0x777c75, flatShading: true });
    const ceramicMat = new THREE.MeshLambertMaterial({ color: 0xe9e1d1, flatShading: true });
    const glassMat = new THREE.MeshStandardMaterial({ color: 0xadd8e6, transparent: true, opacity: 0.5, roughness: 0.35, metalness: 0.15 });
    const coffeeMat = new THREE.MeshLambertMaterial({ color: 0x4b2d1f });
    const skinMat = new THREE.MeshLambertMaterial({ color: 0xd9a17f });
    const apronMat = new THREE.MeshLambertMaterial({ color: 0x526653, flatShading: true });
    const signTex = (() => {
      const cv = document.createElement('canvas');
      cv.width = 512;
      cv.height = 160;
      const ctx = cv.getContext('2d');
      ctx.fillStyle = '#303832';
      ctx.fillRect(0, 0, 512, 160);
      ctx.strokeStyle = '#d7b574';
      ctx.lineWidth = 8;
      ctx.strokeRect(8, 8, 496, 144);
      ctx.textAlign = 'center';
      ctx.fillStyle = '#fff2d6';
      ctx.font = '700 58px "Noto Sans Thai", sans-serif';
      ctx.fillText('กาแฟริมทาง', 256, 80);
      ctx.fillStyle = '#e5c889';
      ctx.font = '600 25px Outfit, sans-serif';
      ctx.fillText('SLOW BAR  ·  FRESH COFFEE', 256, 124);
      const texture = new THREE.CanvasTexture(cv);
      texture.colorSpace = THREE.SRGBColorSpace;
      if (document.fonts) document.fonts.ready.then(() => { texture.needsUpdate = true; });
      return texture;
    })();
    const signFaceMat = new THREE.MeshBasicMaterial({ map: signTex });
    const menuTex = (() => {
      const cv = document.createElement('canvas');
      cv.width = 256;
      cv.height = 320;
      const ctx = cv.getContext('2d');
      ctx.fillStyle = '#eee1c5';
      ctx.fillRect(0, 0, 256, 320);
      ctx.fillStyle = '#4d3827';
      ctx.textAlign = 'center';
      ctx.font = '700 30px "Noto Sans Thai", sans-serif';
      ctx.fillText('เมนูกาแฟ', 128, 48);
      ctx.font = '500 20px "Noto Sans Thai", sans-serif';
      ['กาแฟดริป', 'ลาเต้', 'ชาเชียงราย'].forEach((label, i) => {
        const yy = 105 + i * 58;
        ctx.textAlign = 'left';
        ctx.fillText(label, 22, yy);
        ctx.textAlign = 'right';
        ctx.fillText(['45.-', '50.-', '40.-'][i], 232, yy);
        ctx.strokeStyle = '#c9b894';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(20, yy + 14);
        ctx.lineTo(236, yy + 14);
        ctx.stroke();
      });
      const texture = new THREE.CanvasTexture(cv);
      texture.colorSpace = THREE.SRGBColorSpace;
      if (document.fonts) document.fonts.ready.then(() => { texture.needsUpdate = true; });
      return texture;
    })();
    
    // แผ่นพื้นไม้
    const floor = new THREE.Mesh(new THREE.BoxGeometry(3.5, 0.1, 2.5), woodMat);
    floor.position.set(0, 0.05, 0);
    group.add(floor);
    for (let i = 0; i < 7; i++) {
      const plank = new THREE.Mesh(new THREE.BoxGeometry(3.42, 0.012, 0.025), plankMat);
      plank.position.set(0, 0.106, -1.02 + i * 0.34);
      group.add(plank);
    }
    
    // เคาน์เตอร์บาร์
    const counter = new THREE.Mesh(new THREE.BoxGeometry(2.8, 0.9, 0.8), lightWoodMat);
    counter.position.set(0, 0.5, 0.6);
    group.add(counter);
    const counterTop = new THREE.Mesh(new THREE.BoxGeometry(2.92, 0.09, 0.92), woodMat);
    counterTop.position.set(0, 0.995, 0.58);
    group.add(counterTop);
    for (let i = 0; i < 9; i++) {
      const slat = new THREE.Mesh(new THREE.BoxGeometry(0.035, 0.66, 0.025), plankMat);
      slat.position.set(-1.25 + i * 0.3125, 0.5, 1.012);
      group.add(slat);
    }
    const counterFoot = new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.08, 0.84), darkMat);
    counterFoot.position.set(0, 0.14, 0.6);
    group.add(counterFoot);
    
    // เสา 4 ต้น และหลังคาเพิงหมาแหงน
    for (const sx of [-1.6, 1.6]) {
      for (const sz of [-1.1, 1.1]) {
        const pillar = new THREE.Mesh(new THREE.BoxGeometry(0.15, 2.5, 0.15), woodMat);
        pillar.position.set(sx, 1.25, sz);
        group.add(pillar);
      }
    }
    const roof = new THREE.Group();
    roof.position.set(0, 2.6, 0);
    roof.rotation.x = -0.15;
    const roofBase = new THREE.Mesh(new THREE.BoxGeometry(3.8, 0.15, 2.8), darkRoofMat);
    roof.add(roofBase);
    for (let i = 0; i < 9; i++) {
      const rib = new THREE.Mesh(new THREE.BoxGeometry(3.72, 0.035, 0.045), roofRibMat);
      rib.position.set(0, 0.095, -1.25 + i * 0.31);
      roof.add(rib);
    }
    for (const zPos of [-1.38, 1.38]) {
      const fascia = new THREE.Mesh(new THREE.BoxGeometry(3.9, 0.17, 0.1), woodMat);
      fascia.position.set(0, -0.03, zPos);
      roof.add(fascia);
    }
    for (const zPos of [-0.88, 0, 0.88]) {
      const rafter = new THREE.Mesh(new THREE.BoxGeometry(3.5, 0.09, 0.1), woodMat);
      rafter.position.set(0, -0.16, zPos);
      roof.add(rafter);
    }
    group.add(roof);
    
    // อุปกรณ์ชงกาแฟและเครื่องเอสเปรสโซบนเคาน์เตอร์
    const kettle = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.15, 0.25, 8), new THREE.MeshStandardMaterial({color: 0x111111, metalness: 0.8}));
    kettle.position.set(-0.87, 1.14, 0.42);
    const kettleSpout = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.035, 0.22, 6), metalMat);
    kettleSpout.position.set(-0.68, 1.17, 0.45);
    kettleSpout.rotation.z = -0.7;
    const kettleHandle = new THREE.Mesh(new THREE.TorusGeometry(0.075, 0.012, 5, 8, Math.PI), metalMat);
    kettleHandle.position.set(-0.87, 1.29, 0.42);
    kettleHandle.rotation.z = Math.PI;
    const dripper = new THREE.Mesh(new THREE.ConeGeometry(0.12, 0.16, 8), ceramicMat);
    dripper.position.set(-0.38, 1.11, 0.42);
    const dripServer = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.07, 0.13, 8), glassMat);
    dripServer.position.set(-0.38, 1.02, 0.42);
    const espressoBody = new THREE.Mesh(new THREE.BoxGeometry(0.62, 0.38, 0.4), metalMat);
    espressoBody.position.set(0.55, 1.22, 0.37);
    const espressoTop = new THREE.Mesh(new THREE.BoxGeometry(0.66, 0.06, 0.43), darkMat);
    espressoTop.position.set(0.55, 1.44, 0.37);
    const espressoPanel = new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.13, 0.025), darkMat);
    espressoPanel.position.set(0.55, 1.3, 0.584);
    group.add(kettle, kettleSpout, kettleHandle, dripper, dripServer, espressoBody, espressoTop, espressoPanel);
    for (const dx of [-0.13, 0, 0.13]) {
      const button = new THREE.Mesh(new THREE.SphereGeometry(0.025, 6, 5), dx === 0 ? plankMat : whiteMat);
      button.position.set(0.55 + dx, 1.31, 0.605);
      group.add(button);
    }
    const cupSaucer = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, 0.018, 10), ceramicMat);
    cupSaucer.position.set(0.52, 1.055, 0.76);
    const cup = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.045, 0.12, 8), whiteMat);
    cup.position.set(0.52, 1.12, 0.76);
    const coffee = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.008, 8), coffeeMat);
    coffee.position.set(0.52, 1.181, 0.76);
    const cupHandle = new THREE.Mesh(new THREE.TorusGeometry(0.035, 0.009, 5, 8, Math.PI), ceramicMat);
    cupHandle.position.set(0.58, 1.13, 0.76);
    cupHandle.rotation.z = Math.PI / 2;
    group.add(cupSaucer, cup, coffee, cupHandle);

    // ป้ายหน้าร้านและเมนูอ่านได้จากฝั่งถนน
    const sign = new THREE.Mesh(new THREE.BoxGeometry(1.95, 0.62, 0.09), darkMat);
    sign.position.set(0, 2.2, 1.2);
    const signFace = new THREE.Mesh(new THREE.PlaneGeometry(1.82, 0.52), signFaceMat);
    signFace.position.set(0, 2.2, 1.251);
    group.add(sign, signFace);
    const menuBoard = new THREE.Mesh(new THREE.BoxGeometry(0.72, 0.9, 0.07), woodMat);
    menuBoard.position.set(-1.16, 1.7, 1.12);
    const menuFace = new THREE.Mesh(new THREE.PlaneGeometry(0.58, 0.76), new THREE.MeshBasicMaterial({ map: menuTex }));
    menuFace.position.set(-1.16, 1.7, 1.16);
    group.add(menuBoard, menuFace);

    // โคมไฟใต้ชายคา โทนอุ่นแบบร้านกาแฟชนบท
    const lanternFrameMat = new THREE.MeshLambertMaterial({ color: 0x493a2a });
    const lanternGlowMat = new THREE.MeshBasicMaterial({ color: 0xffd98a });
    const lanternTop = new THREE.Mesh(new THREE.ConeGeometry(0.16, 0.12, 6), lanternFrameMat);
    lanternTop.position.set(0.95, 2.34, 0.72);
    const lanternGlass = new THREE.Mesh(new THREE.SphereGeometry(0.09, 8, 6), lanternGlowMat);
    lanternGlass.position.set(0.95, 2.21, 0.72);
    const lanternBase = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.08, 0.05, 6), lanternFrameMat);
    lanternBase.position.set(0.95, 2.1, 0.72);
    group.add(lanternTop, lanternGlass, lanternBase);

    // ม้านั่งเตี้ยและกระถางไม้ประดับช่วยให้หน้าร้านไม่โล่ง
    const stoolSeatMat = new THREE.MeshLambertMaterial({ color: 0x98633b });
    for (const sx of [-0.92, 0.92]) {
      const seat = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.2, 0.09, 8), stoolSeatMat);
      seat.position.set(sx, 0.53, -0.57);
      const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.045, 0.43, 6), woodMat);
      leg.position.set(sx, 0.28, -0.57);
      group.add(seat, leg);
    }
    const potMat = new THREE.MeshLambertMaterial({ color: 0xa65f43, flatShading: true });
    const leafMat = new THREE.MeshLambertMaterial({ color: 0x52754a, flatShading: true });
    for (const sx of [-1.38, 1.38]) {
      const pot = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.1, 0.2, 7), potMat);
      pot.position.set(sx, 0.25, 0.92);
      group.add(pot);
      for (let i = 0; i < 3; i++) {
        const leaf = new THREE.Mesh(new THREE.ConeGeometry(0.07, 0.28, 5), leafMat);
        leaf.position.set(sx + (i - 1) * 0.07, 0.48 + (i === 1 ? 0.05 : 0), 0.92);
        leaf.rotation.z = (i - 1) * 0.3;
        group.add(leaf);
      }
    }
    
    // บาริสต้าพร้อมผ้ากันเปื้อนและแขนที่วางหลังเคาน์เตอร์
    const barista = new THREE.Group();
    barista.position.set(0, 1.0, -0.2);
    const shirtMat = new THREE.MeshLambertMaterial({ color: 0xeee6d4, flatShading: true });
    const bBody = new THREE.Mesh(new THREE.CapsuleGeometry(0.17, 0.3, 4, 10), shirtMat);
    bBody.position.y = 0.31;
    bBody.castShadow = true;
    const waist = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.16, 0.16, 8), apronMat);
    waist.position.y = 0.12;
    const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.05, 0.1, 7), skinMat);
    neck.position.y = 0.55;
    const bHead = new THREE.Mesh(new THREE.SphereGeometry(0.135, 10, 8), skinMat);
    bHead.position.set(0, 0.68, 0.015);
    bHead.scale.set(0.92, 1.08, 0.92);
    const hair = new THREE.Mesh(new THREE.SphereGeometry(0.14, 9, 6), woodMat);
    hair.scale.set(1.02, 0.5, 1.02);
    hair.position.set(0, 0.76, -0.025);
    const fringe = new THREE.Mesh(new THREE.SphereGeometry(0.09, 8, 5), woodMat);
    fringe.scale.set(1.25, 0.36, 0.65);
    fringe.position.set(0, 0.765, 0.105);
    const apron = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.35, 0.045), apronMat);
    apron.position.set(0, 0.28, 0.155);
    const apronPocket = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.09, 0.015), lightWoodMat);
    apronPocket.position.set(0, 0.24, 0.184);
    const apronStrap = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.17, 0.035), apronMat);
    apronStrap.position.set(0, 0.48, 0.13);
    const eyeMat = new THREE.MeshLambertMaterial({ color: 0x30251e });
    const eyes = [-1, 1].map(side => {
      const eye = new THREE.Mesh(new THREE.SphereGeometry(0.014, 6, 5), eyeMat);
      eye.position.set(side * 0.045, 0.69, 0.132);
      return eye;
    });
    const nose = new THREE.Mesh(new THREE.SphereGeometry(0.018, 6, 5), skinMat);
    nose.position.set(0, 0.655, 0.14);
    barista.add(bBody, waist, neck, bHead, hair, fringe, apron, apronPocket, apronStrap, ...eyes, nose);
    const workArms = [];
    for (const sx of [-1, 1]) {
      const shoulder = new THREE.Group();
      shoulder.position.set(sx * 0.15, 0.4, 0.02);
      shoulder.rotation.x = -0.45;
      shoulder.rotation.z = sx * 0.12;
      const sleeve = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.05, 0.2, 7), shirtMat);
      sleeve.position.y = -0.1;
      const forearm = new THREE.Mesh(new THREE.CylinderGeometry(0.038, 0.043, 0.22, 7), skinMat);
      forearm.position.set(-sx * 0.02, -0.25, 0.08);
      forearm.rotation.x = -0.72;
      const cuff = new THREE.Mesh(new THREE.CylinderGeometry(0.044, 0.038, 0.035, 7), apronMat);
      cuff.position.set(-sx * 0.02, -0.19, 0.055);
      cuff.rotation.x = -0.72;
      const hand = new THREE.Mesh(new THREE.SphereGeometry(0.043, 7, 5), skinMat);
      hand.position.set(-sx * 0.02, -0.31, 0.16);
      shoulder.add(sleeve, cuff, forearm, hand);
      barista.add(shoulder);
      workArms.push(shoulder);
    }
    barista.userData.workArms = workArms;
    group.add(barista);

    scene.add(group);
    return group;
  }
};