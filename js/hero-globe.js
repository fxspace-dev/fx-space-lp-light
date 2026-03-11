(function () {
    var canvas = document.getElementById('hero-globe');
    if (!canvas || !window.THREE) return;

    // --- Setup ---
    var scene = new THREE.Scene();
    var camera = new THREE.PerspectiveCamera(45, canvas.clientWidth / canvas.clientHeight, 0.1, 100);
    function getCameraZ() {
        var w = window.innerWidth;
        if (w < 480) return 6.5;
        if (w < 768) return 5.5;
        if (w < 1024) return 4.8;
        return 4.2;
    }
    camera.position.z = getCameraZ();

    var renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: window.devicePixelRatio < 2 });
    var dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    renderer.setPixelRatio(dpr);
    renderer.setSize(canvas.clientWidth, canvas.clientHeight);

    var isMobile = window.innerWidth < 768;

    // --- Globe group ---
    var globeGroup = new THREE.Group();
    globeGroup.rotation.x = 0.25;
    globeGroup.rotation.z = -0.1;
    scene.add(globeGroup);

    // --- Solid dark core (occludes rings behind planet) ---
    var segments = isMobile ? 24 : 36;
    var coreGeo = new THREE.SphereGeometry(0.99, segments, segments / 2);
    var coreMat = new THREE.MeshBasicMaterial({ color: 0x020208 });
    var coreMesh = new THREE.Mesh(coreGeo, coreMat);
    globeGroup.add(coreMesh);

    // --- Wireframe globe ---
    var globeGeo = new THREE.SphereGeometry(1, segments, segments / 2);
    var globeMat = new THREE.MeshBasicMaterial({
        color: 0x6366f1,
        wireframe: true,
        transparent: true,
        opacity: 0.1,
        depthWrite: false
    });
    var globe = new THREE.Mesh(globeGeo, globeMat);
    globeGroup.add(globe);

    // --- Glow ring (inner atmosphere) ---
    var glowGeo = new THREE.SphereGeometry(1.005, segments, segments / 2);
    var glowMat = new THREE.MeshBasicMaterial({
        color: 0x818cf8,
        transparent: true,
        opacity: 0.04,
        side: THREE.BackSide,
        depthWrite: false
    });
    globeGroup.add(new THREE.Mesh(glowGeo, glowMat));


    // --- Saturn rings (lines) ---
    var saturnRingGroup = new THREE.Group();
    var ringLines = [];
    for (var ri = 0; ri < 4; ri++) ringLines.push({ r: 1.22 + ri * 0.035, op: 0.2, color: 0x818cf8 });
    for (var ri = 0; ri < 10; ri++) ringLines.push({ r: 1.38 + ri * 0.025, op: 0.35 + Math.random() * 0.1, color: 0xc4b5fd });
    ringLines.push({ r: 1.64, op: 0.04, color: 0x6366f1 });
    ringLines.push({ r: 1.66, op: 0.04, color: 0x6366f1 });
    for (var ri = 0; ri < 7; ri++) ringLines.push({ r: 1.7 + ri * 0.03, op: 0.28 + Math.random() * 0.08, color: 0xa5b4fc });
    ringLines.push({ r: 1.95, op: 0.2, color: 0xc4b5fd });

    var ringVertShader = [
        'varying vec3 vWorldPos;',
        'void main() {',
        '    vec4 wp = modelMatrix * vec4(position, 1.0);',
        '    vWorldPos = wp.xyz;',
        '    gl_Position = projectionMatrix * viewMatrix * wp;',
        '}'
    ].join('\n');

    var ringFragShader = [
        'uniform vec3 uColor;',
        'uniform float uOpacity;',
        'uniform float uFaintK;',
        'uniform float uSphereR;',
        'uniform vec3 uCamPos;',
        'varying vec3 vWorldPos;',
        'void main() {',
        '    vec3 rd = normalize(vWorldPos - uCamPos);',
        '    float b = dot(uCamPos, rd);',
        '    float c = dot(uCamPos, uCamPos) - uSphereR * uSphereR;',
        '    float disc = b * b - c;',
        '    float alpha = uOpacity;',
        '    if (disc > 0.0) {',
        '        float t = -b - sqrt(disc);',
        '        float fragDist = length(vWorldPos - uCamPos);',
        '        if (t > 0.0 && t < fragDist) {',
        '            alpha = uOpacity * uFaintK;',
        '        }',
        '    }',
        '    gl_FragColor = vec4(uColor, alpha);',
        '}'
    ].join('\n');

    ringLines.forEach(function (rl) {
        var geo = new THREE.RingGeometry(rl.r - 0.003, rl.r + 0.003, 128, 1);
        geo.rotateX(-Math.PI / 2);
        var c = new THREE.Color(rl.color);
        var mat = new THREE.ShaderMaterial({
            uniforms: {
                uColor: { value: new THREE.Vector3(c.r, c.g, c.b) },
                uOpacity: { value: rl.op },
                uFaintK: { value: 0.10 },
                uSphereR: { value: 0.99 },
                uCamPos: { value: camera.position }
            },
            vertexShader: ringVertShader,
            fragmentShader: ringFragShader,
            transparent: true,
            side: THREE.DoubleSide,
            depthTest: false,
            depthWrite: false
        });
        saturnRingGroup.add(new THREE.Mesh(geo, mat));
    });
    globeGroup.add(saturnRingGroup);

    // --- 3D candlestick chart wrapping around globe ---
    function latLonToVec3(lat, lon, r) {
        var phi = (90 - lat) * Math.PI / 180;
        var theta = (lon + 180) * Math.PI / 180;
        return new THREE.Vector3(
            r * Math.sin(phi) * Math.cos(theta),
            r * Math.cos(phi),
            r * Math.sin(phi) * Math.sin(theta)
        );
    }

    var chartStrips = [
        { lat: 15, lonStart: -80, count: 34, spread: 4, seed: 1, scale: 0.6, wave: 36 },
        { lat: -8, lonStart: 40, count: 30, spread: 4, seed: 7, scale: 0.52, wave: 38 },
        { lat: 30, lonStart: 120, count: 28, spread: 5.2, seed: 3, scale: 0.48, wave: 34 },
        { lat: -22, lonStart: -150, count: 26, spread: 4.2, seed: 12, scale: 0.44, wave: 36 }
    ];

    chartStrips.forEach(function (strip) {
        // Generate realistic candle data with big variation
        var price = 100;
        var rawCandles = [];
        // Use seeded pseudo-random for consistency
        var _seed = strip.seed * 9301 + 49297;
        function sRand() { _seed = (_seed * 9301 + 49297) % 233280; return _seed / 233280; }

        for (var i = 0; i < strip.count; i++) {
            var trend = Math.sin(i * 0.12 + strip.seed) * 9 + Math.sin(i * 0.04 + strip.seed * 3) * 6 + Math.sin(i * 0.22 + strip.seed * 2) * 4;
            price += trend + (sRand() - 0.48) * 7;
            price = Math.max(40, Math.min(180, price));

            // Body sizes: mostly medium-large, occasionally small
            var bodyType = sRand();
            var bodySize;
            if (bodyType < 0.05) bodySize = 5 + sRand() * 4;            // small
            else if (bodyType < 0.25) bodySize = 10 + sRand() * 10;     // medium
            else if (bodyType < 0.65) bodySize = 12.6 + sRand() * 18;   // large
            else bodySize = 21.6 + sRand() * 32.4;                       // very large

            var isGreen = sRand() > 0.45;
            var open = price;
            var close = isGreen ? open + bodySize : open - bodySize;

            // Wick lengths: proportional to body size
            var wickUp = bodySize * (0.3 + sRand() * 0.8);
            if (wickUp < 8) wickUp *= 1.7;
            var wickDown = bodySize * (0.45 + sRand() * 1.2);

            var high = Math.max(open, close) + wickUp;
            var low = Math.min(open, close) - wickDown;
            rawCandles.push({ open: open, close: close, high: high, low: low });
        }

        // Fix gaps: ensure bodies overlap generously (not just touch)
        for (var i = 1; i < rawCandles.length; i++) {
            var prev = rawCandles[i - 1];
            var cur = rawCandles[i];
            var prevBodyTop = Math.max(prev.open, prev.close);
            var prevBodyBot = Math.min(prev.open, prev.close);
            var prevMid = (prevBodyTop + prevBodyBot) / 2;
            var curBodyTop = Math.max(cur.open, cur.close);
            var curBodyBot = Math.min(cur.open, cur.close);
            var curBodyH = curBodyTop - curBodyBot;

            // Overlap target: current body midpoint should be within previous body range
            var overlap = 0.3 * curBodyH; // at least 30% of body should overlap
            if (curBodyBot > prevBodyTop - overlap) {
                var shift = curBodyBot - (prevBodyTop - overlap);
                cur.open -= shift; cur.close -= shift;
                cur.high -= shift; cur.low -= shift;
            } else if (curBodyTop < prevBodyBot + overlap) {
                var shift = (prevBodyBot + overlap) - curBodyTop;
                cur.open += shift; cur.close += shift;
                cur.high += shift; cur.low += shift;
            }
        }

        // Normalize to 0..1 range within this strip
        var allLow = Infinity, allHigh = -Infinity;
        rawCandles.forEach(function (c) {
            if (c.low < allLow) allLow = c.low;
            if (c.high > allHigh) allHigh = c.high;
        });
        var range = allHigh - allLow || 1;

        rawCandles.forEach(function (c, i) {
            var lon = strip.lonStart + i * strip.spread;
            var isGreen = c.close >= c.open;
            var color = isGreen ? 0x60a5fa : 0xa78bfa;
            // Price midpoint shifts candle position up/down on globe (undulating baseline)
            var midPrice = (c.open + c.close) / 2;
            var nMid = (midPrice - allLow) / range; // 0..1
            var latOffset = (nMid - 0.5) * strip.wave; // degrees based on price
            var surfacePoint = latLonToVec3(strip.lat + latOffset, lon, 1.01);
            var normal = surfacePoint.clone().normalize();

            var east = new THREE.Vector3(0, 1, 0).cross(normal).normalize();
            if (east.length() < 0.01) east = new THREE.Vector3(1, 0, 0).cross(normal).normalize();
            var up = normal.clone().cross(east).normalize();

            var nLow = (c.low - allLow) / range;
            var nHigh = (c.high - allLow) / range;
            var nOpen = (c.open - allLow) / range;
            var nClose = (c.close - allLow) / range;

            var base = surfacePoint.clone().add(normal.clone().multiplyScalar(0.01));

            var nBodyBot = Math.min(nOpen, nClose);
            var nBodyTop = Math.max(nOpen, nClose);

            // Upper wick (body top → high)
            var upperH = (nHigh - nBodyTop) * strip.scale;
            if (upperH < 0.08) upperH *= 2;
            if (upperH < 0.08) upperH *= 1.6;
            if (upperH > 0.001) {
                var uWickGeo = new THREE.BoxGeometry(0.006, upperH, 0.006);
                var uWickMat = new THREE.MeshBasicMaterial({ color: color, transparent: true, opacity: 0.8, depthWrite: false });
                var uWickMesh = new THREE.Mesh(uWickGeo, uWickMat);
                var uWickCenter = base.clone().add(up.clone().multiplyScalar((nBodyTop + (nHigh - nBodyTop) / 2) * strip.scale));
                uWickMesh.position.copy(uWickCenter);
                uWickMesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), up);
                globeGroup.add(uWickMesh);
            }

            // Lower wick (low → body bottom)
            var lowerH = (nBodyBot - nLow) * strip.scale;
            if (lowerH < 0.08) lowerH *= 1.5;
            if (lowerH > 0.16) lowerH -= 0.28;
            if (lowerH > 0.001) {
                var lWickGeo = new THREE.BoxGeometry(0.006, lowerH, 0.006);
                var lWickMat = new THREE.MeshBasicMaterial({ color: color, transparent: true, opacity: 0.8, depthWrite: false });
                var lWickMesh = new THREE.Mesh(lWickGeo, lWickMat);
                var lWickCenter = base.clone().add(up.clone().multiplyScalar((nLow + (nBodyBot - nLow) / 2) * strip.scale));
                lWickMesh.position.copy(lWickCenter);
                lWickMesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), up);
                globeGroup.add(lWickMesh);
            }

            // Body
            var rawBodyH = (nBodyTop - nBodyBot) * strip.scale;
            if (rawBodyH < 0.08) rawBodyH *= 2;
            var bodyH = Math.max(0.04, rawBodyH);
            var bodyGeo = new THREE.BoxGeometry(0.025, bodyH, 0.025);
            var bodyCenter = base.clone().add(up.clone().multiplyScalar((nBodyBot + (nBodyTop - nBodyBot) / 2) * strip.scale));
            var bodyQuat = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), up);

            // Solid fill (hides back edges)
            var fillMat = new THREE.MeshBasicMaterial({ color: 0x0a0a1a, depthWrite: true });
            var fillMesh = new THREE.Mesh(bodyGeo, fillMat);
            fillMesh.position.copy(bodyCenter);
            fillMesh.quaternion.copy(bodyQuat);
            globeGroup.add(fillMesh);

            // Wireframe edges (front only)
            var bodyEdges = new THREE.EdgesGeometry(bodyGeo);
            var bodyMat = new THREE.LineBasicMaterial({ color: color, transparent: true, opacity: 0.85 });
            var bodyMesh = new THREE.LineSegments(bodyEdges, bodyMat);
            bodyMesh.position.copy(bodyCenter);
            bodyMesh.quaternion.copy(bodyQuat);
            globeGroup.add(bodyMesh);
        });
    });

    // --- Star particles (starfield background) ---
    var starCount = isMobile ? 600 : 1800;
    var starPos = new Float32Array(starCount * 3);
    var starSizes = new Float32Array(starCount);
    var starPhases = new Float32Array(starCount);
    for (var i = 0; i < starCount; i++) {
        starPos[i * 3] = (Math.random() - 0.5) * 28;
        starPos[i * 3 + 1] = (Math.random() - 0.5) * 28;
        starPos[i * 3 + 2] = -2 - Math.random() * 22;
        starSizes[i] = 0.02 + Math.random() * 0.06;
        starPhases[i] = Math.random() * Math.PI * 2;
    }
    var starGeo = new THREE.BufferGeometry();
    starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
    // Star glow texture (soft radial gradient = twinkling look)
    var starCvs = document.createElement('canvas');
    starCvs.width = 64; starCvs.height = 64;
    var starCtx = starCvs.getContext('2d');
    var starGrad = starCtx.createRadialGradient(32, 32, 0, 32, 32, 32);
    starGrad.addColorStop(0, 'rgba(255,255,255,1)');
    starGrad.addColorStop(0.15, 'rgba(220,240,255,0.8)');
    starGrad.addColorStop(0.4, 'rgba(180,210,255,0.15)');
    starGrad.addColorStop(1, 'rgba(150,180,255,0)');
    starCtx.fillStyle = starGrad;
    starCtx.fillRect(0, 0, 64, 64);
    var starTex = new THREE.CanvasTexture(starCvs);

    // Small stars layer (たくさん、小さめ)
    var starMatSmall = new THREE.PointsMaterial({
        map: starTex, color: 0xffffff, size: 0.08,
        transparent: true, opacity: 0.9,
        sizeAttenuation: true, depthWrite: false,
        blending: THREE.AdditiveBlending
    });
    var starField = new THREE.Points(starGeo, starMatSmall);
    scene.add(starField);

    // Big stars layer (少なめ、大きく明るい)
    var bigStarCount = isMobile ? 100 : 250;
    var bigStarPos = new Float32Array(bigStarCount * 3);
    for (var i = 0; i < bigStarCount; i++) {
        bigStarPos[i * 3] = (Math.random() - 0.5) * 26;
        bigStarPos[i * 3 + 1] = (Math.random() - 0.5) * 26;
        bigStarPos[i * 3 + 2] = -2 - Math.random() * 18;
    }
    var bigStarGeo = new THREE.BufferGeometry();
    bigStarGeo.setAttribute('position', new THREE.BufferAttribute(bigStarPos, 3));
    var bigStarMat = new THREE.PointsMaterial({
        map: starTex, color: 0xffffff, size: 0.2,
        transparent: true, opacity: 1.0,
        sizeAttenuation: true, depthWrite: false,
        blending: THREE.AdditiveBlending
    });
    var bigStarField = new THREE.Points(bigStarGeo, bigStarMat);
    scene.add(bigStarField);

    // Extra stars cluster: bottom-left
    var blStarCount = isMobile ? 40 : 100;
    var blStarPos = new Float32Array(blStarCount * 3);
    for (var i = 0; i < blStarCount; i++) {
        blStarPos[i * 3] = -4 - Math.random() * 10;
        blStarPos[i * 3 + 1] = -3 - Math.random() * 10;
        blStarPos[i * 3 + 2] = -2 - Math.random() * 18;
    }
    var blStarGeo = new THREE.BufferGeometry();
    blStarGeo.setAttribute('position', new THREE.BufferAttribute(blStarPos, 3));
    var blStarMat = new THREE.PointsMaterial({
        map: starTex, color: 0xffffff, size: 0.1,
        transparent: true, opacity: 1.0,
        sizeAttenuation: true, depthWrite: false,
        blending: THREE.AdditiveBlending
    });
    scene.add(new THREE.Points(blStarGeo, blStarMat));

    // --- Bright accent stars (fewer, larger, colored) ---
    var accentCount = isMobile ? 15 : 35;
    var accentPos = new Float32Array(accentCount * 3);
    for (var i = 0; i < accentCount; i++) {
        accentPos[i * 3] = (Math.random() - 0.5) * 18;
        accentPos[i * 3 + 1] = (Math.random() - 0.5) * 18;
        accentPos[i * 3 + 2] = -2 - Math.random() * 10;
    }
    var accentGeo = new THREE.BufferGeometry();
    accentGeo.setAttribute('position', new THREE.BufferAttribute(accentPos, 3));
    var accentMat = new THREE.PointsMaterial({ color: 0xa5b4fc, size: 0.04, transparent: true, opacity: 0.4, sizeAttenuation: true });
    var accentStars = new THREE.Points(accentGeo, accentMat);
    scene.add(accentStars);

    // --- Nebula sprites (soft colored clouds in background) ---
    var nebulaCount = isMobile ? 4 : 8;
    var nebulaSprites = [];
    var nebulaColors = [
        { r: 99, g: 102, b: 241 },   // indigo
        { r: 139, g: 92, b: 246 },    // violet
        { r: 59, g: 130, b: 246 },    // blue
        { r: 96, g: 165, b: 250 }     // light blue
    ];
    for (var i = 0; i < nebulaCount; i++) {
        var nc = nebulaColors[i % nebulaColors.length];
        var nebCanvas = document.createElement('canvas');
        nebCanvas.width = 128;
        nebCanvas.height = 128;
        var nebCtx = nebCanvas.getContext('2d');
        var nebGrad = nebCtx.createRadialGradient(64, 64, 0, 64, 64, 64);
        nebGrad.addColorStop(0, 'rgba(' + nc.r + ',' + nc.g + ',' + nc.b + ',0.08)');
        nebGrad.addColorStop(0.6, 'rgba(' + nc.r + ',' + nc.g + ',' + nc.b + ',0.02)');
        nebGrad.addColorStop(1, 'rgba(' + nc.r + ',' + nc.g + ',' + nc.b + ',0)');
        nebCtx.fillStyle = nebGrad;
        nebCtx.fillRect(0, 0, 128, 128);
        var nebTex = new THREE.CanvasTexture(nebCanvas);
        var nebMat = new THREE.SpriteMaterial({ map: nebTex, transparent: true, opacity: 0.6 });
        var nebSprite = new THREE.Sprite(nebMat);
        nebSprite.position.set(
            (Math.random() - 0.5) * 12,
            (Math.random() - 0.5) * 10,
            -4 - Math.random() * 8
        );
        var nebScale = 2 + Math.random() * 4;
        nebSprite.scale.set(nebScale, nebScale, 1);
        scene.add(nebSprite);
        nebulaSprites.push({ sprite: nebSprite, mat: nebMat, phase: Math.random() * Math.PI * 2, baseOp: 0.3 + Math.random() * 0.3 });
    }

    // --- Shooting stars ---
    var shootingStarCount = isMobile ? 2 : 4;
    var shootingStars = [];
    function initShootingStar() {
        var x = (Math.random() - 0.5) * 12;
        var y = 2 + Math.random() * 5;
        var z = -3 - Math.random() * 6;
        var angle = -0.5 - Math.random() * 0.8;
        var speed = 0.06 + Math.random() * 0.08;
        return {
            pos: new THREE.Vector3(x, y, z),
            vel: new THREE.Vector3(Math.cos(angle) * speed, Math.sin(angle) * speed, 0),
            life: 0,
            maxLife: 40 + Math.random() * 60,
            delay: Math.random() * 200
        };
    }
    var shootGroup = new THREE.Group();
    for (var i = 0; i < shootingStarCount; i++) {
        var ss = initShootingStar();
        ss.delay = i * 80 + Math.random() * 100;
        var ssGeo = new THREE.BufferGeometry();
        var ssPositions = new Float32Array(6);
        ssGeo.setAttribute('position', new THREE.BufferAttribute(ssPositions, 3));
        var ssMat = new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0 });
        var ssLine = new THREE.Line(ssGeo, ssMat);
        shootGroup.add(ssLine);
        ss.geo = ssGeo;
        ss.mat = ssMat;
        ss.line = ssLine;
        shootingStars.push(ss);
    }
    scene.add(shootGroup);

    // (Saturn rings replace orbit rings)

    // --- Data pulse arcs (light trails between cities) ---
    var arcRoutes = [
        { from: { lat: 35.6, lon: 139.7 }, to: { lat: 40.7, lon: -74 } },      // Tokyo → NY
        { from: { lat: 51.5, lon: -0.1 }, to: { lat: 22.3, lon: 114.2 } },     // London → HK
        { from: { lat: -33.9, lon: 151.2 }, to: { lat: 1.3, lon: 103.8 } },    // Sydney → Singapore
        { from: { lat: 35.6, lon: 139.7 }, to: { lat: 51.5, lon: -0.1 } },     // Tokyo → London
        { from: { lat: 40.7, lon: -74 }, to: { lat: -23.5, lon: -46.6 } }      // NY → Sao Paulo
    ];
    var arcGroup = new THREE.Group();
    var arcPulses = [];

    arcRoutes.forEach(function (route) {
        var start = latLonToVec3(route.from.lat, route.from.lon, 1.01);
        var end = latLonToVec3(route.to.lat, route.to.lon, 1.01);
        var mid = start.clone().add(end).multiplyScalar(0.5).normalize().multiplyScalar(1.4);

        var curve = new THREE.QuadraticBezierCurve3(start, mid, end);
        var points = curve.getPoints(60);
        var positions = new Float32Array(60 * 3);
        var alphas = new Float32Array(60);
        for (var i = 0; i < 60; i++) {
            positions[i * 3] = points[i].x;
            positions[i * 3 + 1] = points[i].y;
            positions[i * 3 + 2] = points[i].z;
            alphas[i] = 0;
        }
        var geo = new THREE.BufferGeometry();
        geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));

        var mat = new THREE.LineBasicMaterial({ color: 0x34d399, transparent: true, opacity: 0.35 });
        var line = new THREE.Line(geo, mat);
        arcGroup.add(line);

        arcPulses.push({
            points: points,
            geo: geo,
            head: Math.random() * 60,
            speed: 0.15 + Math.random() * 0.15,
            color: Math.random() > 0.5 ? 0x34d399 : 0x60a5fa,
            mat: mat
        });
    });
    globeGroup.add(arcGroup);

    // --- Breathing endpoint dots ---
    var dotPositions = [];
    var dotGroup = new THREE.Group();
    var cities = [
        { lat: 35.6, lon: 139.7 }, { lat: 40.7, lon: -74 }, { lat: 51.5, lon: -0.1 },
        { lat: 22.3, lon: 114.2 }, { lat: -33.9, lon: 151.2 }, { lat: 1.3, lon: 103.8 },
        { lat: -23.5, lon: -46.6 }
    ];
    cities.forEach(function (c) {
        var pos = latLonToVec3(c.lat, c.lon, 1.015);
        var dotGeo = new THREE.SphereGeometry(0.012, 8, 8);
        var dotMat = new THREE.MeshBasicMaterial({ color: 0x60a5fa, transparent: true, opacity: 0.8 });
        var dot = new THREE.Mesh(dotGeo, dotMat);
        dot.position.copy(pos);
        dotGroup.add(dot);
        dotPositions.push({ mesh: dot, mat: dotMat, phase: Math.random() * Math.PI * 2 });
    });
    globeGroup.add(dotGroup);

    // (Light source removed)


    // --- Ambient glow sprite (subtle) ---
    var spriteCanvas = document.createElement('canvas');
    spriteCanvas.width = 256;
    spriteCanvas.height = 256;
    var ctx = spriteCanvas.getContext('2d');
    var grad = ctx.createRadialGradient(128, 128, 0, 128, 128, 128);
    grad.addColorStop(0, 'rgba(99,102,241,0.18)');
    grad.addColorStop(0.5, 'rgba(99,102,241,0.04)');
    grad.addColorStop(1, 'rgba(99,102,241,0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 256, 256);
    var spriteTex = new THREE.CanvasTexture(spriteCanvas);
    var spriteMat = new THREE.SpriteMaterial({ map: spriteTex, transparent: true, opacity: 0.6 });
    var sprite = new THREE.Sprite(spriteMat);
    sprite.scale.set(3.2, 3.2, 1);
    scene.add(sprite);

    // --- Animation ---
    var isVisible = true;
    if (window.IntersectionObserver) {
        var obs = new IntersectionObserver(function (entries) {
            isVisible = entries[0].isIntersecting;
        }, { threshold: 0 });
        obs.observe(canvas);
    }

    var clock = new THREE.Clock();
    function animate() {
        requestAnimationFrame(animate);
        if (!isVisible) return;
        var elapsed = clock.getElapsedTime();

        globeGroup.rotation.y += 0.0015;

        // Animate arc pulses
        arcPulses.forEach(function (pulse) {
            pulse.head += pulse.speed;
            if (pulse.head >= 60) pulse.head = 0;
            var tailLen = 15;
            var posArr = pulse.geo.attributes.position.array;
            for (var i = 0; i < 60; i++) {
                posArr[i * 3] = pulse.points[i].x;
                posArr[i * 3 + 1] = pulse.points[i].y;
                posArr[i * 3 + 2] = pulse.points[i].z;
            }
            pulse.geo.attributes.position.needsUpdate = true;
            var dist = pulse.head;
            pulse.mat.opacity = 0.08 + 0.25 * Math.abs(Math.sin(dist * 0.1));
        });

        // Animate breathing dots
        dotPositions.forEach(function (d) {
            var breath = 0.5 + 0.5 * Math.sin(elapsed * 1.8 + d.phase);
            d.mat.opacity = 0.3 + breath * 0.6;
            var s = 0.8 + breath * 0.4;
            d.mesh.scale.set(s, s, s);
        });

        // (no orbit ring animation - Saturn rings rotate with globe)

        // Twinkle stars
        starMatSmall.opacity = 0.5 + 0.15 * Math.sin(elapsed * 0.8);
        accentMat.opacity = 0.25 + 0.2 * Math.sin(elapsed * 1.2 + 1.0);

        // Nebula breathing
        nebulaSprites.forEach(function (n) {
            n.mat.opacity = n.baseOp * (0.7 + 0.3 * Math.sin(elapsed * 0.3 + n.phase));
        });

        // Shooting stars
        shootingStars.forEach(function (ss) {
            if (ss.delay > 0) { ss.delay--; return; }
            ss.life++;
            if (ss.life > ss.maxLife) {
                var fresh = initShootingStar();
                ss.pos.copy(fresh.pos);
                ss.vel.copy(fresh.vel);
                ss.life = 0;
                ss.maxLife = fresh.maxLife;
                ss.delay = 60 + Math.random() * 200;
                ss.mat.opacity = 0;
                return;
            }
            ss.pos.add(ss.vel);
            var tail = ss.pos.clone().sub(ss.vel.clone().multiplyScalar(8));
            var arr = ss.geo.attributes.position.array;
            arr[0] = ss.pos.x; arr[1] = ss.pos.y; arr[2] = ss.pos.z;
            arr[3] = tail.x; arr[4] = tail.y; arr[5] = tail.z;
            ss.geo.attributes.position.needsUpdate = true;
            var progress = ss.life / ss.maxLife;
            ss.mat.opacity = progress < 0.2 ? progress * 5 * 0.7 : (1 - progress) * 0.7;
        });

        renderer.render(scene, camera);
    }
    animate();

    // --- Resize (即時追従) ---
    function onResize() {
        var w = canvas.clientWidth;
        var h = canvas.clientHeight;
        if (w === 0 || h === 0) return;
        camera.aspect = w / h;
        camera.position.z = getCameraZ();
        camera.updateProjectionMatrix();
        renderer.setSize(w, h);
    }
    window.addEventListener('resize', onResize);
})();
