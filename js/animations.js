// Viewport-based animation controller: pause timelines when section is out of view, resume when in view
var _vpEntries = [];
var _vpObserver = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry) {
        for (var i = 0; i < _vpEntries.length; i++) {
            if (_vpEntries[i].el !== entry.target) continue;
            var tl;
            try { tl = _vpEntries[i].tl(); } catch(e) { continue; }
            if (!tl) continue;
            if (entry.isIntersecting) {
                tl.resume();
            } else {
                tl.pause();
            }
        }
    });
}, { threshold: 0.1 });

function vpWatch(el, tlGetter) {
    if (!el) return;
    _vpEntries.push({ el: el, tl: tlGetter });
    _vpObserver.observe(el);
}

var candleTl = null, yttP1Tl = null, yttP3Tl = null, yttP5Tl = null, commChatTl = null;

var yttAnimFuncs = [null, null, null, null]; // set after function definitions

var yttAnimPaused = [false, false, false, false, false, false];
var yttAnimDone = [false, false, false, false, false, false];

function yttShowStop(idx) {
    yttAnimDone[idx] = false;
    yttAnimPaused[idx] = false;
    var ctrl = document.querySelectorAll('.ytt-anim-ctrl')[idx];
    if (ctrl) {
        var playBtn = ctrl.querySelector('.ytt-play-btn');
        if (playBtn) playBtn.style.display = 'none';
    }
}
function yttTogglePause(idx) {
    var tls = [yttP1Tl, candleTl, yttP3Tl, yttP5Tl];
    var tl = tls[idx];
    if (!tl) return;
    var ctrl = document.querySelectorAll('.ytt-anim-ctrl')[idx];
    var playBtn = ctrl ? ctrl.querySelector('.ytt-play-btn') : null;
    if (yttAnimPaused[idx]) {
        tl.resume();
        yttAnimPaused[idx] = false;
        if (playBtn) playBtn.style.display = 'none';
    } else {
        tl.pause();
        yttAnimPaused[idx] = true;
        if (playBtn) playBtn.style.display = 'flex';
    }
}
function yttReplayAnim(idx) {
    yttAnimDone[idx] = false;
    yttAnimPaused[idx] = false;
    var ctrl = document.querySelectorAll('.ytt-anim-ctrl')[idx];
    if (ctrl) ctrl.querySelector('.ytt-replay-btn').style.display = 'none';
    if (yttAnimFuncs[idx]) yttAnimFuncs[idx]();
}

document.addEventListener('click', function(e) {
    var replayBtn = e.target.closest('.ytt-replay-btn');
    if (replayBtn) { yttReplayAnim(+replayBtn.parentElement.dataset.panel); return; }
    var playBtn = e.target.closest('.ytt-play-btn');
    if (playBtn) {
        var idx = +playBtn.parentElement.dataset.panel;
        yttTogglePause(idx);
        return;
    }
    var scene = e.target.closest('.ytt-panel-scene');
    if (scene) {
        var panel = scene.querySelector('.ytt-anim-ctrl');
        if (!panel) return;
        var idx = +panel.dataset.panel;
        if (yttAnimDone[idx]) return;
        yttTogglePause(idx);
    }
});

function animateCandles() {
    if (candleTl) candleTl.kill();
    yttShowStop(1);
    var candles = document.querySelectorAll('#scene-ytt .candle');
    var scenarioPath = document.querySelector('#scene-ytt .scenario-path');
    var buyMarker = document.getElementById('ytt-buy');
    var tpMarker = document.getElementById('ytt-tp');
    var slMarker = document.getElementById('ytt-sl');
    var status = document.querySelector('#scene-ytt .ytt-status');
    candleTl = gsap.timeline({ repeat: -1, repeatDelay: 2 });
    candleTl.set(candles, { opacity: 0 });
    candleTl.set(scenarioPath, { strokeDashoffset: 300, opacity: 0 });
    candleTl.set([buyMarker, tpMarker, slMarker], { opacity: 0, scale: 1 });
    candleTl.set(status, { opacity: 0 });
    candles.forEach(function(c, i) { candleTl.to(c, { opacity: 1, duration: 0.08 }, 0.15 + i * 0.05); });
    candleTl.call(function() { status.textContent = 'シナリオ作成中...'; });
    candleTl.to(status, { opacity: 1, duration: 0.3 }, "+=0.15");
    candleTl.to(scenarioPath, { strokeDashoffset: 0, opacity: 1, duration: 1, ease: "power1.inOut" }, "+=0.15");
    candleTl.to(buyMarker, { opacity: 1, duration: 0.25, ease: "back.out(2.5)" }, "+=0.05");
    candleTl.to(tpMarker, { opacity: 1, duration: 0.25, ease: "back.out(2.5)" }, "+=0.05");
    candleTl.to(slMarker, { opacity: 1, duration: 0.25, ease: "back.out(2.5)" }, "+=0.05");
    candleTl.call(function() { status.textContent = 'シナリオ完成'; });
}

function animateYttP1() {
    if (yttP1Tl) yttP1Tl.kill();
    yttShowStop(0);
    var panel=document.getElementById('p1-panel'),title=document.getElementById('p1-title'),buy=document.getElementById('p1-buy'),sell=document.getElementById('p1-sell'),lot=document.getElementById('p1-lot'),cls=document.getElementById('p1-cls'),half=document.getElementById('p1-half'),pl=document.getElementById('p1-pl');
    var plVal = document.getElementById('p1-pl-val');
    var plDot = document.getElementById('p1-pl-dot');
    var plCounter = { v: 0 };
    yttP1Tl = gsap.timeline({ repeat: -1, repeatDelay: 2 });
    yttP1Tl.set([panel,title,buy,sell,lot,cls,half,pl], { opacity: 0 });
    yttP1Tl.set(plCounter, { v: 0 });
    yttP1Tl.to(panel, { opacity: 1, duration: 0.4 }, 0.2);
    yttP1Tl.to(title, { opacity: 1, duration: 0.3 }, 0.4);
    yttP1Tl.to(lot, { opacity: 1, duration: 0.3 }, 0.7);
    yttP1Tl.to([sell,buy], { opacity: 1, duration: 0.3, stagger: 0.1, ease: 'back.out(2)' }, 1.1);
    yttP1Tl.to([cls,half], { opacity: 1, duration: 0.3, stagger: 0.15, ease: 'back.out(1.5)' }, 1.6);
    // BUY click
    yttP1Tl.to(buy, { scale: 0.93, duration: 0.1, transformOrigin: 'center center' }, 2.3);
    yttP1Tl.to(buy, { scale: 1, duration: 0.15 }, 2.4);
    // P/L appears after BUY
    yttP1Tl.to(pl, { opacity: 1, duration: 0.4, ease: 'power2.out' }, 2.6);
    // Blink dot throughout P/L phase
    yttP1Tl.to(plDot, { opacity: 0.3, duration: 0.3, yoyo: true, repeat: 19 }, 2.8);
    // P/L fluctuates: 0 → +3200 → -1500 → +4800 → -800 → +7200 → +5100 → +9600 → +12500 then close
    var plSteps = [0, 3200, -1500, 4800, -800, 7200, 5100, 9600, 12500];
    plSteps.forEach(function(v, i) {
        yttP1Tl.to(plCounter, { v: v, duration: 0.6, ease: 'power1.inOut',
            onUpdate: function() {
                if (!plVal) return;
                var n = Math.round(plCounter.v);
                var color = n >= 0 ? '#4ade80' : '#ef4444';
                var sign = n >= 0 ? '+' : '';
                plVal.textContent = sign + n.toLocaleString() + ' 円';
                plVal.setAttribute('fill', color);
            }
        }, 3.0 + i * 0.8);
    });
    // 全決済 click to close at +12,500
    var clsTime = 3.0 + plSteps.length * 0.8 + 0.3;
    yttP1Tl.to(cls, { scale: 0.93, duration: 0.1, transformOrigin: 'center center' }, clsTime);
    yttP1Tl.to(cls, { scale: 1, duration: 0.15 }, clsTime + 0.1);
    // Flash P/L green on close
    yttP1Tl.to(plVal, { attr: { 'font-size': 17 }, duration: 0.15, yoyo: true, repeat: 1 }, clsTime + 0.2);
}

function animateYttP3() {
    if (yttP3Tl) yttP3Tl.kill();
    yttShowStop(2);
    var candles=document.getElementById('p3-candles');
    var hl1=document.getElementById('p3-hl1'),hl1Lbl=document.getElementById('p3-hl1-lbl');
    var hl2=document.getElementById('p3-hl2'),hl2Lbl=document.getElementById('p3-hl2-lbl');
    var hl3=document.getElementById('p3-hl3'),hl3Lbl=document.getElementById('p3-hl3-lbl');
    var hl4=document.getElementById('p3-hl4');
    var ch1=document.getElementById('p3-ch1'),ch2=document.getElementById('p3-ch2');
    var trend=document.getElementById('p3-trend');
    var tr1=document.getElementById('p3-tr1'),tr2=document.getElementById('p3-tr2'),tr3=document.getElementById('p3-tr3'),tr4=document.getElementById('p3-tr4');
    var econ=document.getElementById('p3-econ'),econT=document.getElementById('p3-econ-t');
    yttP3Tl = gsap.timeline({ repeat: -1, repeatDelay: 2 });
    // Reset
    yttP3Tl.set(candles, { opacity: 0 });
    yttP3Tl.set([hl1Lbl,hl2Lbl,hl3,hl3Lbl,hl4,trend,tr1,tr2,tr3,tr4,econ,econT], { opacity: 0 });
    yttP3Tl.set([hl1,hl2], { attr: { 'stroke-dashoffset': 195 } });
    yttP3Tl.set([ch1,ch2], { attr: { 'stroke-dashoffset': 220 } });
    // Phase 1: Candles fade in
    yttP3Tl.to(candles, { opacity: 0.25, duration: 0.5 }, 0.2);
    // Phase 2: Horizontal lines by importance (red→cyan solid→cyan dashed→white dashed)
    yttP3Tl.to(hl1, { attr: { 'stroke-dashoffset': 0 }, duration: 0.8, ease: 'power1.inOut' }, 0.8);
    yttP3Tl.to(hl1Lbl, { opacity: 1, duration: 0.25 }, 1.4);
    yttP3Tl.to(hl2, { attr: { 'stroke-dashoffset': 0 }, duration: 0.7, ease: 'power1.inOut' }, 1.7);
    yttP3Tl.to(hl2Lbl, { opacity: 1, duration: 0.25 }, 2.2);
    yttP3Tl.to(hl3, { opacity: 1, duration: 0.5 }, 2.5);
    yttP3Tl.to(hl3Lbl, { opacity: 1, duration: 0.25 }, 2.8);
    yttP3Tl.to(hl4, { opacity: 1, duration: 0.5 }, 3.1);
    // Phase 3: Channel lines draw in diagonally
    yttP3Tl.to(ch1, { attr: { 'stroke-dashoffset': 0 }, duration: 0.9, ease: 'power1.inOut' }, 3.6);
    yttP3Tl.to(ch2, { attr: { 'stroke-dashoffset': 0 }, duration: 0.9, ease: 'power1.inOut' }, 3.8);
    // Phase 4: Trend panel slides in, rows appear one by one
    yttP3Tl.fromTo(trend, { opacity: 0, x: 20 }, { opacity: 1, x: 0, duration: 0.4, ease: 'power2.out' }, 4.8);
    yttP3Tl.to(tr1, { opacity: 1, duration: 0.2 }, 5.1);
    yttP3Tl.to(tr2, { opacity: 1, duration: 0.2 }, 5.3);
    yttP3Tl.to(tr3, { opacity: 1, duration: 0.2 }, 5.5);
    yttP3Tl.to(tr4, { opacity: 1, duration: 0.2 }, 5.7);
    // Phase 5: Economic indicator drops in
    yttP3Tl.to(econ, { opacity: 0.7, duration: 0.4 }, 6.1);
    yttP3Tl.to(econT, { opacity: 1, duration: 0.3 }, 6.3);
    // Hold
}

function animateYttP5() {
    if (yttP5Tl) yttP5Tl.kill();
    yttShowStop(3);
    var title=document.getElementById('p5-title'),
        balance=document.getElementById('p5-balance'),
        rate=document.getElementById('p5-rate'),
        arrow=document.getElementById('p5-arrow'),
        maxloss=document.getElementById('p5-maxloss'),
        lot=document.getElementById('p5-lot');
    yttP5Tl = gsap.timeline({ repeat: -1, repeatDelay: 2 });
    yttP5Tl.set([title,balance,rate,arrow,maxloss,lot], { opacity: 0 });
    yttP5Tl.to(title, { opacity: 1, duration: 0.8 }, 0.5);
    yttP5Tl.to(balance, { opacity: 1, duration: 0.8 }, 1.8);
    yttP5Tl.to(rate, { opacity: 1, duration: 0.8 }, 3.0);
    yttP5Tl.to(arrow, { opacity: 1, duration: 0.5 }, 4.2);
    yttP5Tl.to(maxloss, { opacity: 1, duration: 0.8 }, 5.0);
    yttP5Tl.fromTo(lot, { opacity: 0, scale: 0.9 }, { opacity: 1, scale: 1, duration: 0.8, ease: 'back.out(1.5)', transformOrigin: 'center center' }, 6.2);
}

yttAnimFuncs = [animateYttP1, animateCandles, animateYttP3, animateYttP5];

// ===== ZEROPRO 90 ANIMATIONS (v2) =====

// ---- Hero ----
function animateZpHero() {
    var section = document.getElementById('zeropro-section');
    if (!section) return;
    var badge  = document.getElementById('zp-badge');
    var glitch = document.getElementById('zp-glitch-num');
    var chars  = section.querySelectorAll('.zp-char');
    var sub    = document.getElementById('zp-hero-sub');

    var st = { trigger: section, start: 'top 80%', once: true };

    gsap.to(badge, { opacity: 1, y: 0, duration: 0.5, delay: 0.1, scrollTrigger: st });

    gsap.to(chars, {
        opacity: 1, scale: 1, y: 0, duration: 0.45, stagger: 0.07, ease: 'back.out(2)', delay: 0.9,
        scrollTrigger: st
    });
    gsap.to(sub, { opacity: 1, duration: 0.7, delay: 1.9, scrollTrigger: st });
}

// ---- Overview: journey steps animation ----
function animateZpOverview() {
    var journey = document.getElementById('zp-journey');
    if (!journey) return;

    // Fade in container
    gsap.to(journey, {
        opacity: 1, duration: 0.5,
        scrollTrigger: { trigger: '#zp-overview', start: 'top 70%', once: true }
    });

    var tl = gsap.timeline({
        scrollTrigger: { trigger: '#zp-overview', start: 'top 65%', once: true }
    });

    var steps = ['jStep0', 'jStep1', 'jStep2', 'jStep3'];
    var arrows = ['jArrow1', 'jArrow2', 'jArrow3'];

    for (var i = 0; i < steps.length; i++) {
        var step = document.getElementById(steps[i]);
        if (!step) continue;
        tl.to(step, { opacity: 1, y: 0, duration: 0.35, ease: 'power2.out' }, i === 0 ? '+=0' : '-=0.1');
        if (i < arrows.length) {
            var arr = document.getElementById(arrows[i]);
            if (arr) tl.to(arr, { opacity: 1, duration: 0.2, ease: 'power2.out' }, '-=0.15');
        }
    }

    // Goal step pulse
    var goal = document.getElementById('jStep3');
    if (goal) {
        tl.to(goal, { scale: 1.04, duration: 0.25, ease: 'back.out(2)' });
        tl.to(goal, { scale: 1, duration: 0.2, ease: 'power2.out' });
    }
}

// ---- PDCA: circular diagram with arc draw-in + parallax ----
function animateZpPdca() {
    var cycle = document.getElementById('zp-pdca-cycle');
    if (!cycle) return;

    var steps = cycle.querySelectorAll('.zp-pdca-step');
    var arcs = cycle.querySelectorAll('.zp-pdca-arc');
    var ring = cycle.querySelector('.zp-pdca-ring');
    var repeat = document.getElementById('zp-pdca-repeat');
    var title = document.querySelector('#zp-pdca .zp-block-title');
    var lead = document.querySelector('#zp-pdca .zp-block-lead');

    // Prepare arc stroke-dasharray for draw-in animation
    arcs.forEach(function(arc) {
        var len = arc.getTotalLength();
        arc.style.strokeDasharray = len;
        arc.style.strokeDashoffset = len;
    });

    var tl = gsap.timeline({
        scrollTrigger: { trigger: '#zp-pdca', start: 'top 60%', end: 'center 30%', scrub: 0.5 }
    });

    // Cards pop in + arcs draw between them (P→D→C→A→P)
    steps.forEach(function(step, i) {
        tl.to(step, { opacity: 1, scale: 1, duration: 0.4, ease: 'power2.out' }, i * 0.4);
        if (arcs[i]) {
            tl.to(arcs[i], { opacity: 1, strokeDashoffset: 0, duration: 0.35, ease: 'power2.inOut' }, i * 0.4 + 0.2);
        }
    });

    if (repeat) {
        tl.to(repeat, { opacity: 1, scale: 1, duration: 0.4, ease: 'power2.out' }, '+=0.3');
    }

    // Start endless spin after arcs appear
    var spinEl = cycle.querySelector('.zp-pdca-spin');
    if (spinEl) {
        ScrollTrigger.create({
            trigger: '#zp-pdca', start: 'top 40%', once: true,
            onEnter: function() { spinEl.style.animationPlayState = 'running'; }
        });
    }

    // === Parallax effects (scroll-scrub) ===

    // Each card drifts outward from center — breathing parallax
    gsap.to(steps[0], { y: -15, ease: 'none',
        scrollTrigger: { trigger: '#zp-pdca', start: 'top bottom', end: 'bottom top', scrub: 1 } });
    gsap.to(steps[1], { x: 15, ease: 'none',
        scrollTrigger: { trigger: '#zp-pdca', start: 'top bottom', end: 'bottom top', scrub: 1 } });
    gsap.to(steps[2], { y: 15, ease: 'none',
        scrollTrigger: { trigger: '#zp-pdca', start: 'top bottom', end: 'bottom top', scrub: 1 } });
    gsap.to(steps[3], { x: -15, ease: 'none',
        scrollTrigger: { trigger: '#zp-pdca', start: 'top bottom', end: 'bottom top', scrub: 1 } });

    // Title + lead text scroll at a slightly different rate
    if (title) {
        gsap.to(title, { y: -20, ease: 'none',
            scrollTrigger: { trigger: '#zp-pdca', start: 'top bottom', end: 'bottom top', scrub: 1 } });
    }
    if (lead) {
        gsap.to(lead, { y: -15, ease: 'none',
            scrollTrigger: { trigger: '#zp-pdca', start: 'top bottom', end: 'bottom top', scrub: 1 } });
    }
}

// ---- 7 Stages: scroll-driven progress ----
function animateZpStages() {
    var track = document.getElementById('zp-stage-track');
    if (!track) return;

    var lineFill = document.getElementById('zp-stage-line-fill');
    var stages = track.querySelectorAll('.zp-stage');

    // Progressive reveal of stages
    stages.forEach(function(stage, i) {
        ScrollTrigger.create({
            trigger: stage,
            start: 'top 80%',
            once: true,
            onEnter: function() {
                gsap.to(stage, { opacity: 1, x: 0, duration: 0.5, ease: 'power2.out', delay: 0.1 });
                stage.classList.add('is-active');
            }
        });
    });

    // Line fill based on scroll progress through the track
    if (lineFill) {
        gsap.to(lineFill, {
            height: '100%',
            ease: 'none',
            scrollTrigger: {
                trigger: track,
                start: 'top 70%',
                end: 'bottom 60%',
                scrub: 0.5
            }
        });
    }
}

// ---- Discord preview: simple fade-in ----
function animateZpReview() {
    var submit = document.getElementById('zp-discord-submit');
    var review = document.getElementById('zp-discord-review');
    var label1 = document.getElementById('zp-dc-label1');
    var label2 = document.getElementById('zp-dc-label2');
    if (!submit && !review) return;

    // === STEP 1 entrance ===
    var tl1 = gsap.timeline({
        scrollTrigger: { trigger: '#zp-review', start: 'top 70%', once: true }
    });
    var num1 = label1 ? label1.querySelector('.zp-dc-step-num') : null;
    tl1.fromTo(label1, { opacity: 0, x: -40 }, { opacity: 1, x: 0, duration: 0.5, ease: 'power3.out' });
    if (num1) {
        tl1.fromTo(num1, { rotation: -180, scale: 0 }, { rotation: 0, scale: 1, duration: 0.6, ease: 'back.out(1.8)' }, '<');
    }
    tl1.fromTo(submit, { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' }, '-=0.2');

    // Sidebar 1 — same timing as Discord box
    var sb1 = submit ? submit.closest('.zp-dc-submit-row').querySelector('.zp-dc-sidebar') : null;
    if (sb1) {
        tl1.to(sb1, { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' }, '<');
    }


    // === STEP 2 entrance ===
    var tl2 = gsap.timeline({
        scrollTrigger: { trigger: label2, start: 'top 85%', once: true }
    });
    var num2 = label2 ? label2.querySelector('.zp-dc-step-num') : null;
    tl2.fromTo(label2, { opacity: 0, x: -40 }, { opacity: 1, x: 0, duration: 0.5, ease: 'power3.out' });
    if (num2) {
        tl2.fromTo(num2, { rotation: -180, scale: 0 }, { rotation: 0, scale: 1, duration: 0.6, ease: 'back.out(1.8)' }, '<');
    }
    tl2.fromTo(review, { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' }, '-=0.2');

    // Sidebar 2 — same timing as Discord box
    var sb2 = review ? review.closest('.zp-dc-submit-row').querySelector('.zp-dc-sidebar') : null;
    if (sb2) {
        tl2.to(sb2, { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' }, '<');
    }
}

// ---- Community circle-reveal ----
function animateZpCommunityReveal() {
    var pin = document.getElementById('zp-community-pin');
    var reveal = document.getElementById('zp-community-reveal');
    if (!pin || !reveal) return;
    gsap.set(reveal, { clipPath: 'circle(0% at 50% 0%)' });
    gsap.to(reveal, {
        clipPath: 'circle(160% at 50% 0%)',
        ease: 'none',
        scrollTrigger: {
            trigger: pin, start: 'top 65%', end: 'center 70%',
            scrub: 0.3
        }
    });
}

// ---- Community carousel ----
function animateZpCommunity() {
    var slides = document.querySelectorAll('.zp-carousel-slide');
    var track = document.querySelector('.zp-carousel-track');
    var prevBtn = document.getElementById('zp-carousel-prev');
    var nextBtn = document.getElementById('zp-carousel-next');
    var labelEl = document.getElementById('zp-carousel-label');
    var descEl = document.getElementById('zp-carousel-desc');
    var captionEl = document.getElementById('zp-carousel-caption');
    if (!slides.length) return;

    var current = 0;
    var total = slides.length;
    var isAnimating = false;

    function getLayout() {
        var isMobile = track.offsetWidth < 700;
        return {
            activeW: isMobile ? 300 : 480,
            inactiveW: isMobile ? 180 : 280,
            gap: isMobile ? 16 : 28,
            sideScale: isMobile ? 0.88 : 0.9
        };
    }

    function positionSlides() {
        var L = getLayout();
        var prevIdx = (current - 1 + total) % total;
        var nextIdx = (current + 1) % total;
        // Offset from center for side cards: half active + gap + half side visual
        var sideOffset = L.activeW / 2 + L.gap + (L.inactiveW * L.sideScale) / 2;

        slides.forEach(function(s, i) {
            s.classList.toggle('is-active', i === current);
            // Clear old order property if any
            s.style.order = '';

            if (i === current) {
                s.style.transform = 'translate(-50%, -50%)';
                s.style.opacity = '1';
                s.style.zIndex = '2';
                s.style.filter = 'none';
            } else if (i === prevIdx) {
                s.style.transform = 'translate(calc(-50% - ' + sideOffset + 'px), -50%) scale(' + L.sideScale + ')';
                s.style.opacity = '0.45';
                s.style.zIndex = '1';
                s.style.filter = 'blur(1.5px)';
            } else if (i === nextIdx) {
                s.style.transform = 'translate(calc(-50% + ' + sideOffset + 'px), -50%) scale(' + L.sideScale + ')';
                s.style.opacity = '0.45';
                s.style.zIndex = '1';
                s.style.filter = 'blur(1.5px)';
            } else {
                s.style.transform = 'translate(-50%, -50%) scale(0.8)';
                s.style.opacity = '0';
                s.style.zIndex = '0';
                s.style.filter = 'blur(4px)';
            }
        });
    }

    function updateCaption() {
        var active = slides[current];
        var newLabel = active.getAttribute('data-label') || '';
        var newDesc = active.getAttribute('data-desc') || '';
        if (captionEl) {
            captionEl.style.opacity = '0';
            setTimeout(function() {
                if (labelEl) labelEl.textContent = newLabel;
                if (descEl) descEl.textContent = newDesc;
                captionEl.style.opacity = '1';
            }, 220);
        } else {
            if (labelEl) labelEl.textContent = newLabel;
            if (descEl) descEl.textContent = newDesc;
        }
    }

    function goTo(idx) {
        if (isAnimating) return;
        isAnimating = true;
        current = (idx + total) % total;
        positionSlides();
        updateCaption();
        setTimeout(function() { isAnimating = false; }, 750);
    }

    if (prevBtn) prevBtn.addEventListener('click', function() { goTo(current - 1); });
    if (nextBtn) nextBtn.addEventListener('click', function() { goTo(current + 1); });

    // Click on side slides to select
    slides.forEach(function(s, i) {
        s.addEventListener('click', function() { if (i !== current) goTo(i); });
    });

    // Handle resize
    var resizeTimer;
    window.addEventListener('resize', function() {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(positionSlides, 100);
    });

    positionSlides();
    updateCaption();
}

// ---- Bottom: info cards stagger ----
function animateZpBottom() {
    var cards = document.querySelectorAll('.zp-info-chip');
    if (!cards.length) return;
    gsap.to(cards, {
        opacity: 1, y: 0, duration: 0.55, stagger: 0.13, ease: 'back.out(1.8)',
        scrollTrigger: { trigger: '.zp-bottom', start: 'top 80%', once: true }
    });
}

function initZpAnimations() {
    animateZpOverview();
    animateZpPdca();
    animateZpStages();
    animateZpReview();
    animateZpCommunity();
    animateZpBottom();
}
var discordTl = null;
function animateDiscord() {
    if (discordTl) discordTl.kill();
    var cursor=document.getElementById('d-cursor'),popup=document.getElementById('d-popup'),label=document.getElementById('d-step-label');
    discordTl = gsap.timeline({ repeat: -1, repeatDelay: 1 });
    discordTl.set(cursor, { opacity: 1, left: 22, top: 26 }).set(popup, { opacity: 0 }).set(label, { textContent: '手順① サーバー通知設定' })
        .to(cursor, { left: 22, top: 26, duration: 0.4 }).to(popup, { opacity: 1, duration: 0.25 }, "+=0.3").to({}, { duration: 1.2 })
        .to(popup, { opacity: 0, duration: 0.25 }).set(label, { textContent: '手順② チャンネル通知設定' })
        .to(cursor, { left: 160, top: 68, duration: 0.5 }).to(popup, { opacity: 1, duration: 0.25 }, "+=0.2").to({}, { duration: 1.2 })
        .to(popup, { opacity: 0, duration: 0.25 }).set(label, { textContent: '✅ 設定完了！' }).to({}, { duration: 1.2 }).to(cursor, { opacity: 0, duration: 0.25 });
}

/* e-Learning Quiz Simulator */
var elSimData = [
    {
        chapter: '第1章',
        question: 'FXとは何の略？',
        options: ['Foreign Exchange（外国為替）','Financial Experience','Future Exchange','Fixed Exchange'],
        correct: 0,
        ok: 'FX = Foreign Exchange（外国為替）。通貨を交換して利益を狙う投資です。',
        ng: 'FX = Foreign Exchange（外国為替）の略です。通貨を交換して利益を狙う投資です。'
    },
    {
        chapter: '第1章',
        question: 'ドル円(USD/JPY)を「ロング」するとは？',
        options: ['ドルを売り、円を買うこと','長期間ポジションを持つこと','ドルを買い、円を売ること','円の価値が上がると予想すること'],
        correct: 2,
        ok: 'ロング＝買い。USD/JPYのロングは「ドルを買い、円を売る」ことです。',
        ng: 'ロング＝買い。USD/JPYのロングは「ドルを買い、円を売る」ことを意味します。'
    },
    {
        chapter: '第1章',
        question: 'FX市場が開いている時間は？',
        options: ['平日9時〜15時のみ','月曜の朝〜土曜の朝方まで24時間','24時間365日','月曜〜金曜の9時〜17時'],
        correct: 1,
        ok: 'FX市場は月曜の朝から土曜の朝方まで、ほぼ24時間取引可能です。',
        ng: 'FX市場は月曜の朝から土曜の朝方まで、ほぼ24時間取引できます。株式市場とは異なります。'
    },
    {
        chapter: '第2章',
        question: 'FXで勝つために最も重要なことは？',
        options: ['毎日たくさんトレードすること','高い期待値の瞬間を見つけること','常にレバレッジを最大にすること','ニュースが出たらすぐトレードすること'],
        correct: 1,
        ok: 'FXは「高い期待値の瞬間」を見つけるゲーム。優位性のある場面を待つことが大切です。',
        ng: 'FXは「高い期待値の瞬間」を見つけるゲームです。量ではなく質が重要です。'
    }
];
var elSimState = { current: 0, score: 0, answered: [] };

var featChartTl = null;
function animateFeatureCards() {

    // チャートアニメーション（毎日シナリオで力試しセクション）
    var dailyCandles = document.querySelectorAll('#feat-daily-candles > g');
    if (dailyCandles.length > 0) {
        if (featChartTl) featChartTl.kill();
        featChartTl = gsap.timeline({ repeat: -1, repeatDelay: 3 });
        featChartTl.set(dailyCandles, { opacity: 0 });
        featChartTl.set('#feat-daily-trendline', { opacity: 0 });
        featChartTl.set('#feat-daily-resist', { opacity: 0 });
        for (var d = 0; d < dailyCandles.length; d++) {
            featChartTl.to(dailyCandles[d], { opacity: 1, duration: 0.15, ease: 'power2.out' }, d * 0.08);
        }
        featChartTl.to('#feat-daily-trendline', { opacity: 1, duration: 0.5 }, 1.2);
        featChartTl.to('#feat-daily-resist', { opacity: 1, duration: 0.5 }, 1.5);
        featChartTl.fromTo('#feat-daily-entry', { opacity: 0, y: 5 }, { opacity: 1, y: 0, duration: 0.4, ease: 'back.out(2)' }, 2.0);
        featChartTl.fromTo('#feat-daily-tp', { opacity: 0, scale: 0.5 }, { opacity: 1, scale: 1, duration: 0.4, ease: 'back.out(2)', transformOrigin: 'center center' }, 2.3);
        featChartTl.fromTo('#feat-daily-sl', { opacity: 0 }, { opacity: 1, duration: 0.3 }, 2.7);
    }
}

function initElSim() {
    elSimState = { current: 0, score: 0, answered: [] };
    document.getElementById('el-sim-score-num').textContent = '0';
    var dotsEl = document.getElementById('el-sim-dots');
    dotsEl.innerHTML = '';
    for (var i = 0; i < elSimData.length; i++) {
        var dot = document.createElement('div');
        dot.className = 'el-sim-dot';
        dot.id = 'el-sim-dot-' + i;
        dotsEl.appendChild(dot);
    }
    updateElSimProgress();
    renderElSimSlide(0);
}

function renderElSimStart() {
    var body = document.getElementById('el-sim-body');
    body.innerHTML = '<div class="el-sim-start">' +
        '<div class="el-sim-start-visual">📝</div>' +
        '<h3>FXの基礎知識をチェック！</h3>' +
        '<p>Y式億トレ再現アカデミー第1章・第2章から4問出題。<br>あなたはどれだけ知っていますか？</p>' +
        '<div class="el-sim-start-meta">' +
            '<div class="el-sim-start-meta-item"><span>📋</span> 全4問</div>' +
            '<div class="el-sim-start-meta-item"><span>⏱</span> 約1分</div>' +
            '<div class="el-sim-start-meta-item"><span>🎯</span> 4択クイズ</div>' +
        '</div>' +
        '<button class="el-sim-start-btn" onclick="startElSimQuiz()">▶ ここでクイズに挑戦する</button>' +
    '</div>';
}

function startElSimQuiz() {
    elSimState.current = 0;
    renderElSimSlide(0);
}

function updateElSimProgress() {
    var answered = elSimState.answered.length;
    var total = elSimData.length;
    var pct = Math.round((answered / total) * 100);
    document.getElementById('el-sim-progress').style.width = pct + '%';
    document.getElementById('el-sim-progress-text').textContent = answered + ' / ' + total;
}

function spawnParticles(el, color) {
    var rect = el.getBoundingClientRect();
    var body = document.getElementById('el-sim-body');
    var bodyRect = body.getBoundingClientRect();
    var cx = rect.left - bodyRect.left + rect.width / 2;
    var cy = rect.top - bodyRect.top + rect.height / 2;
    var container = document.createElement('div');
    container.className = 'el-sim-particles';
    body.appendChild(container);
    for (var i = 0; i < 12; i++) {
        var p = document.createElement('div');
        p.className = 'el-sim-particle';
        var angle = (Math.PI * 2 / 12) * i + (Math.random() - 0.5) * 0.5;
        var dist = 40 + Math.random() * 60;
        p.style.cssText = 'left:' + cx + 'px;top:' + cy + 'px;width:' + (4 + Math.random() * 4) + 'px;height:' + (4 + Math.random() * 4) + 'px;background:' + color + ';--px:' + Math.round(Math.cos(angle) * dist) + 'px;--py:' + Math.round(Math.sin(angle) * dist) + 'px;';
        container.appendChild(p);
    }
    setTimeout(function() { if (container.parentNode) container.parentNode.removeChild(container); }, 900);
}

function renderElSimSlide(idx) {
    var body = document.getElementById('el-sim-body');
    if (idx >= elSimData.length) { renderElSimResult(); return; }
    var q = elSimData[idx];
    var labels = ['A','B','C','D'];
    var html = '<div class="el-sim-slide active">';
    html += '<div class="el-sim-q-num">' + (idx + 1) + '</div>';
    html += '<span class="el-sim-chapter-tag">' + q.chapter + '</span>';
    html += '<div class="el-sim-q-title">' + q.question + '</div>';
    html += '<div class="el-sim-options" id="el-sim-opts">';
    for (var i = 0; i < q.options.length; i++) {
        html += '<div class="el-sim-opt" data-idx="' + i + '" onclick="selectElSimOpt(this,' + idx + ',' + i + ')">';
        html += '<div class="el-sim-opt-marker">' + labels[i] + '</div>';
        html += '<div class="el-sim-opt-text">' + q.options[i] + '</div>';
        html += '</div>';
    }
    html += '</div>';
    html += '<div class="el-sim-feedback" id="el-sim-feedback"></div>';
    html += '<div class="el-sim-next-wrap"><button class="el-sim-next" id="el-sim-next" onclick="nextElSimSlide()">' + (idx === elSimData.length - 1 ? '結果を見る →' : '次の問題 →') + '</button></div>';
    html += '</div>';
    body.innerHTML = html;
    for (var j = 0; j < elSimData.length; j++) {
        var dot = document.getElementById('el-sim-dot-' + j);
        if (dot) {
            dot.className = 'el-sim-dot';
            if (j === idx) dot.classList.add('active');
            else if (j < elSimState.answered.length) dot.classList.add(elSimState.answered[j] ? 'done' : 'wrong-dot');
        }
    }
}

function selectElSimOpt(el, qIdx, optIdx) {
    var opts = document.querySelectorAll('#el-sim-opts .el-sim-opt');
    var alreadyAnswered = false;
    opts.forEach(function(o) { if (o.classList.contains('disabled')) alreadyAnswered = true; });
    if (alreadyAnswered) return;

    var q = elSimData[qIdx];
    var isCorrect = optIdx === q.correct;
    opts.forEach(function(o, i) {
        o.classList.add('disabled');
        if (i === q.correct) o.classList.add('correct');
        else if (i === optIdx && !isCorrect) o.classList.add('wrong');
    });
    if (isCorrect) {
        el.querySelector('.el-sim-opt-marker').textContent = '✓';
        elSimState.score++;
        document.getElementById('el-sim-score-num').textContent = elSimState.score;
        spawnParticles(el, '#10b981');
        gsap.fromTo('#el-sim-score-badge', { scale: 1 }, { scale: 1.3, duration: 0.15, yoyo: true, repeat: 1, ease: 'power2.out' });
    } else {
        el.querySelector('.el-sim-opt-marker').textContent = '✗';
        opts[q.correct].querySelector('.el-sim-opt-marker').textContent = '✓';
    }
    elSimState.answered.push(isCorrect);
    updateElSimProgress();
    var dot = document.getElementById('el-sim-dot-' + qIdx);
    if (dot) { dot.classList.remove('active'); dot.classList.add(isCorrect ? 'done' : 'wrong-dot'); }

    var fb = document.getElementById('el-sim-feedback');
    fb.className = 'el-sim-feedback show ' + (isCorrect ? 'is-correct' : 'is-wrong');
    fb.innerHTML = '<div class="el-sim-feedback-icon">' + (isCorrect ? '🎉' : '💡') + '</div>' +
        '<div class="el-sim-feedback-text"><strong>' + (isCorrect ? '正解！' : '不正解') + '</strong>' + (isCorrect ? q.ok : q.ng) + '</div>';
    document.getElementById('el-sim-next').classList.add('show');
}

function nextElSimSlide() {
    elSimState.current++;
    renderElSimSlide(elSimState.current);
}

function renderElSimResult() {
    var body = document.getElementById('el-sim-body');
    var score = elSimState.score;
    var total = elSimData.length;
    var icon, msg;
    if (score === total) { icon = '🏆'; msg = '満点です！FXの基礎がしっかり身についています。<br>Y式億トレ再現アカデミーで続きの章も学んでみましょう！'; }
    else if (score >= 2) { icon = '👏'; msg = 'いい調子です！<br>Y式億トレ再現アカデミーで全12章を学べば、さらに理解が深まります。'; }
    else { icon = '📚'; msg = 'FXの基礎を学ぶチャンスです！<br>Y式億トレ再現アカデミーなら体系的に理解できます。'; }
    body.innerHTML = '<div class="el-sim-slide active"><div class="el-sim-result">' +
        '<div class="el-sim-result-icon">' + icon + '</div>' +
        '<h3>クイズ結果</h3>' +
        '<div class="el-sim-result-score">' + score + ' / ' + total + '</div>' +
        '<div class="el-sim-result-msg">' + msg + '</div>' +
        '<div class="el-sim-result-actions">' +
        '<button class="el-sim-retry" onclick="initElSim()">もう一度挑戦する</button>' +
        '<a href="https://fx-space.learnworlds.com/course/zeroprokiso" target="_blank" class="btn btn-primary">Y式億トレ再現アカデミーで全章を学ぶ →</a>' +
        '</div></div></div>';
    for (var j = 0; j < elSimData.length; j++) {
        var dot = document.getElementById('el-sim-dot-' + j);
        if (dot) dot.className = 'el-sim-dot ' + (elSimState.answered[j] ? 'done' : 'wrong-dot');
    }
    document.getElementById('el-sim-progress').style.width = '100%';
    document.getElementById('el-sim-progress-text').textContent = score + ' / ' + total + ' 正解';
    if (score >= 3) setTimeout(function(){ spawnParticles(body.querySelector('.el-sim-result-icon'), '#fbbf24'); }, 400);
}

function filterContent(cat,btn) {
    document.querySelectorAll('.content-tab').forEach(function(t){t.classList.remove('active');});
    if(btn) btn.classList.add('active');
    document.querySelectorAll('.content-card').forEach(function(card){
        if(cat==='all'||card.dataset.cat===cat){card.style.display='';gsap.fromTo(card,{opacity:0,scale:0.97},{opacity:1,scale:1,duration:0.25});}
        else{card.style.display='none';}
    });
}

var elPreviewTl = null;
function animateElPreview() {
    if (elPreviewTl) elPreviewTl.kill();
    gsap.set(['#elp-ch1','#elp-ch2','#elp-ch3','#elp-ch4'], { opacity: 0, y: 10 });
    gsap.set('#elp-bar', { attr: { width: 0 } });
    elPreviewTl = gsap.timeline({ repeat: -1, repeatDelay: 2 });
    elPreviewTl
        .to('#elp-ch1', { opacity: 1, y: 0, duration: 0.4, ease: 'power2.out' }, 0.3)
        .to('#elp-bar', { attr: { width: 60 }, duration: 0.3 }, 0.5)
        .to('#elp-ch2', { opacity: 1, y: 0, duration: 0.4, ease: 'power2.out' }, 1.0)
        .to('#elp-bar', { attr: { width: 120 }, duration: 0.3 }, 1.2)
        .to('#elp-ch3', { opacity: 1, y: 0, duration: 0.4, ease: 'power2.out' }, 1.7)
        .to('#elp-bar', { attr: { width: 160 }, duration: 0.3 }, 1.9)
        .to('#elp-ch4', { opacity: 1, y: 0, duration: 0.4, ease: 'power2.out' }, 2.4)
        .to({}, { duration: 3 })
        .to(['#elp-ch1','#elp-ch2','#elp-ch3','#elp-ch4'], { opacity: 0, duration: 0.3 })
        .to('#elp-bar', { attr: { width: 0 }, duration: 0.2 });
}

// Community tab switching
(function() {
    document.querySelectorAll('.community-tab-btn').forEach(function(btn) {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.community-tab-btn').forEach(function(b) { b.classList.remove('active'); });
            btn.classList.add('active');
            var tab = btn.getAttribute('data-comm-tab');
            document.querySelectorAll('.community-chat-panel').forEach(function(p) { p.classList.remove('active'); });
            document.getElementById('comm-panel-' + tab).classList.add('active');
        });
    });
})();

/* ===== Pricing Section: Scroll Animations ===== */
/* Scroll-triggered reveal for pricing elements */
(function() {
    var reveals = document.querySelectorAll('.pricing-reveal');
    if (!reveals.length) return;
    var observer = new IntersectionObserver(function(entries) {
        entries.forEach(function(entry) {
            if (entry.isIntersecting) {
                entry.target.classList.add('revealed');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
    reveals.forEach(function(el) { observer.observe(el); });
})();



// Fintokei Simulator
var fintokeiPlans = {
    'sokko-bronze': { name: 'ブロンズ', balance: 2000000, rate: 1.00 },
    'sokko-silver': { name: 'シルバー', balance: 5000000, rate: 1.00 },
    'sokko-gold': { name: 'ゴールド', balance: 10000000, rate: 1.00 },
    'sokko-platinum': { name: 'プラチナ', balance: 20000000, rate: 1.00 },
    'sokko-diamond': { name: 'ダイヤモンド', balance: 35000000, rate: 1.00 },
    'challenge-crystal': { name: 'クリスタル', balance: 2000000, rate: 0.80 },
    'challenge-pearl': { name: 'パール', balance: 5000000, rate: 0.80 },
    'challenge-ruby': { name: 'ルビー', balance: 10000000, rate: 0.80 },
    'challenge-sapphire': { name: 'サファイア', balance: 20000000, rate: 0.80 },
    'challenge-topaz': { name: 'トパーズ', balance: 35000000, rate: 0.80 },
    'challenge-emerald': { name: 'エメラルド', balance: 50000000, rate: 0.80 }
};
var fintokeiAnimId = null;
function formatYen(n) {
    if (n >= 10000) return (n / 10000).toFixed(n >= 100000000 ? 0 : (n >= 10000000 ? 0 : 1)) + '万円';
    return Math.round(n).toLocaleString() + '円';
}
function formatYenShort(n) {
    if (n >= 100000000) return (n / 100000000).toFixed(1) + '億円';
    if (n >= 10000) return Math.round(n / 10000).toLocaleString() + '万円';
    return Math.round(n).toLocaleString() + '円';
}
function parseYenShort(text) {
    if (!text || text === '-') return 0;
    var m;
    if ((m = text.match(/([\d,.]+)\s*億円/))) return parseFloat(m[1].replace(/,/g, '')) * 100000000;
    if ((m = text.match(/([\d,.]+)\s*万円/))) return parseFloat(m[1].replace(/,/g, '')) * 10000;
    if ((m = text.match(/([\d,.]+)\s*円/)))   return parseFloat(m[1].replace(/,/g, ''));
    return 0;
}
var _fkAnimTimers = {};
function animateValue(el, fromVal, toVal, duration, formatter) {
    var id = el.id || el.className;
    if (_fkAnimTimers[id]) cancelAnimationFrame(_fkAnimTimers[id]);
    if (fromVal === toVal) { el.textContent = formatter(toVal); return; }
    var startTime = null;
    function step(ts) {
        if (!startTime) startTime = ts;
        var p = Math.min((ts - startTime) / duration, 1);
        var ease = 1 - Math.pow(1 - p, 3);
        var cur = fromVal + (toVal - fromVal) * ease;
        el.textContent = formatter(cur);
        if (p < 1) { _fkAnimTimers[id] = requestAnimationFrame(step); }
        else { delete _fkAnimTimers[id]; }
    }
    _fkAnimTimers[id] = requestAnimationFrame(step);
}
function runFintokeiSim() {
    var planKey = document.getElementById('fintokei-plan').value;
    var monthlyRate = parseFloat(document.getElementById('fintokei-rate').value) / 100;
    var months = parseInt(document.getElementById('fintokei-months').value);
    if (isNaN(monthlyRate) || isNaN(months) || months < 1) return;
    var plan = fintokeiPlans[planKey];
    if (!plan) return;

    var data = [];
    var initBalance = plan.balance;
    var monthlyProfit = initBalance * monthlyRate;
    for (var i = 0; i < months; i++) {
        data.push(monthlyProfit * (i + 1));
    }
    var totalProfit = data[data.length - 1];
    var totalReward = totalProfit * plan.rate;
    var avgMonthly = totalReward / months;

    // Y軸: エメラルド基準(2200万)と実データの幾何平均 → エメラルドが最大、他プランも見栄え良く
    var refMax = Math.sqrt(22000000 * Math.max(data[data.length - 1], 1)) * 1.03;

    var elMonthly = document.getElementById('fintokei-monthly');
    var elTotal   = document.getElementById('fintokei-total');
    var fromMonthly = parseYenShort(elMonthly.textContent);
    var fromTotal   = parseYenShort(elTotal.textContent);

    animateValue(elMonthly, fromMonthly, avgMonthly, 600, formatYenShort);
    animateValue(elTotal,   fromTotal,   totalReward, 600, formatYenShort);

    document.getElementById('fintokei-graph-label').textContent = plan.name + ' / 月利' + (monthlyRate * 100) + '% / ' + months + 'ヶ月';

    // Subtle pulse on result cards
    var cards = document.querySelectorAll('.fintokei-result-card');
    for (var ci = 0; ci < cards.length; ci++) {
        gsap.fromTo(cards[ci], { scale: 1 }, { scale: 1.03, duration: 0.15, yoyo: true, repeat: 1, ease: 'power1.inOut' });
    }

    drawFintokeiChart(data, months, refMax);
}
function drawFintokeiChart(data, months, refBalance) {
    if (fintokeiAnimId) cancelAnimationFrame(fintokeiAnimId);
    var canvas = document.getElementById('fintokei-chart');
    if (!canvas) return;
    var ctx = canvas.getContext('2d');
    var dpr = window.devicePixelRatio || 1;
    var w = canvas.clientWidth;
    var h = canvas.clientHeight;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    ctx.scale(dpr, dpr);

    var isMobile = w < 400;
    var padL = isMobile ? 52 : 90, padR = isMobile ? 12 : 24, padT = isMobile ? 24 : 32, padB = isMobile ? 32 : 40;
    var axisFont = isMobile ? '9px Inter, sans-serif' : '11px Inter, sans-serif';
    var cw = w - padL - padR;
    var ch = h - padT - padB;
    var lastVal = data[data.length - 1];
    if (lastVal === 0) lastVal = 1;
    var maxVal = Math.max(refBalance || lastVal, lastVal * 1.05);
    if (maxVal === 0) maxVal = 1;
    var barW = Math.max(cw / months * 0.6, 4);

    var animStart = null;
    var staggerDelay = 80;
    var barGrowDuration = 500;
    var hoverIdx = -1;
    var animDone = false;

    function easeOutCubic(t) { return 1 - Math.pow(1 - t, 3); }

    function drawFrame(timestamp) {
        if (!animStart) animStart = timestamp;
        var elapsed = timestamp - animStart;
        ctx.clearRect(0, 0, w, h);
        // Grid lines
        ctx.strokeStyle = '#f0f0f0';
        ctx.lineWidth = 1;
        for (var g = 0; g <= 4; g++) {
            var gy = padT + ch - (ch * g / 4);
            ctx.beginPath(); ctx.moveTo(padL, gy); ctx.lineTo(w - padR, gy); ctx.stroke();
            if (g > 0) {
                ctx.fillStyle = '#aaa'; ctx.font = axisFont; ctx.textAlign = 'right';
                var yLabel = isMobile ? formatYenShort(maxVal * g / 4) : formatYen(maxVal * g / 4);
                ctx.fillText(yLabel, padL - 6, gy + 4);
            }
        }
        // X labels
        ctx.fillStyle = '#aaa'; ctx.font = axisFont; ctx.textAlign = 'center';
        var step;
        if (isMobile) {
            step = months <= 6 ? 1 : (months <= 12 ? 3 : (months <= 24 ? 6 : 12));
        } else {
            step = months <= 12 ? 1 : (months <= 24 ? 2 : 6);
        }
        for (var xi = 0; xi < months; xi += step) {
            var lx = padL + (cw * xi / (months - 1 || 1));
            ctx.fillText((xi + 1) + '月', lx, h - (isMobile ? 6 : 10));
        }

        // Bar chart with staggered grow animation
        for (var i = 0; i < data.length; i++) {
            var barStart = i * staggerDelay;
            var barElapsed = elapsed - barStart;
            if (barElapsed <= 0) continue;
            var fraction = animDone ? 1 : Math.min(barElapsed / barGrowDuration, 1);
            fraction = easeOutCubic(fraction);

            var bx = padL + (cw * i / (months - 1 || 1)) - barW / 2;
            var bh = (data[i] / maxVal) * ch * fraction;
            var by = padT + ch - bh;
            var isHover = (i === hoverIdx);
            var grad = ctx.createLinearGradient(0, by, 0, padT + ch);
            grad.addColorStop(0, isHover ? '#6366f1' : '#4f46e5');
            grad.addColorStop(1, isHover ? '#a5b4fc' : '#818cf8');
            ctx.fillStyle = grad;
            ctx.beginPath();
            var r = Math.min(barW / 2, 6);
            ctx.moveTo(bx + r, by);
            ctx.lineTo(bx + barW - r, by);
            ctx.quadraticCurveTo(bx + barW, by, bx + barW, by + r);
            ctx.lineTo(bx + barW, padT + ch);
            ctx.lineTo(bx, padT + ch);
            ctx.lineTo(bx, by + r);
            ctx.quadraticCurveTo(bx, by, bx + r, by);
            ctx.fill();
        }

        // Hover tooltip
        if (hoverIdx >= 0 && hoverIdx < data.length && animDone) {
            var tx = padL + (cw * hoverIdx / (months - 1 || 1));
            var ty = padT + ch - (data[hoverIdx] / maxVal) * ch;
            var label = (hoverIdx + 1) + 'ヶ月目: ' + formatYenShort(data[hoverIdx]);
            ctx.font = 'bold 12px Inter, sans-serif';
            var tw = ctx.measureText(label).width + 16;
            var thh = 26;
            var ttx = Math.min(Math.max(tx - tw / 2, 2), w - tw - 2);
            var tty = ty - thh - 10;
            if (tty < 2) tty = ty + 10;
            // Tooltip background
            ctx.fillStyle = 'rgba(30,30,46,0.92)';
            ctx.beginPath();
            ctx.roundRect(ttx, tty, tw, thh, 6);
            ctx.fill();
            // Tooltip text
            ctx.fillStyle = '#fff'; ctx.textAlign = 'center';
            ctx.fillText(label, ttx + tw / 2, tty + 17);
            // Dot on bar top
            ctx.fillStyle = '#fff';
            ctx.beginPath(); ctx.arc(tx, ty, 4, 0, Math.PI * 2); ctx.fill();
            ctx.fillStyle = '#4f46e5';
            ctx.beginPath(); ctx.arc(tx, ty, 2.5, 0, Math.PI * 2); ctx.fill();
        }

        var lastBarEnd = (data.length - 1) * staggerDelay + barGrowDuration;
        if (!animDone && elapsed < lastBarEnd) {
            fintokeiAnimId = requestAnimationFrame(drawFrame);
        } else {
            animDone = true;
        }
    }
    fintokeiAnimId = requestAnimationFrame(drawFrame);

    // Hover handler (PC with fine pointer only)
    if (matchMedia('(hover: hover) and (pointer: fine)').matches) {
        canvas.onmousemove = function(e) {
            if (!animDone) return;
            var rect = canvas.getBoundingClientRect();
            var mx = e.clientX - rect.left;
            var closest = -1, closestDist = Infinity;
            for (var i = 0; i < data.length; i++) {
                var bx = padL + (cw * i / (months - 1 || 1));
                var d = Math.abs(mx - bx);
                if (d < closestDist && d < barW + 10) { closestDist = d; closest = i; }
            }
            if (closest !== hoverIdx) { hoverIdx = closest; drawFrame(performance.now()); }
        };
        canvas.onmouseleave = function() {
            if (hoverIdx !== -1) { hoverIdx = -1; if (animDone) drawFrame(performance.now()); }
        };
        canvas.style.cursor = 'crosshair';
    }
}
// Fintokei card scroll animation
(function() {
    var fkCard = document.querySelector('.fintokei-card');
    if (!fkCard) return;
    var countEl = document.getElementById('fk-countup');
    var counted = false;

    // Count-up animation
    function countUp(target, duration) {
        if (counted) return;
        counted = true;
        var start = 0, startTime = null;
        function step(ts) {
            if (!startTime) startTime = ts;
            var p = Math.min((ts - startTime) / duration, 1);
            var ease = 1 - Math.pow(1 - p, 3); // easeOutCubic
            var val = Math.round(ease * target);
            countEl.textContent = '月' + val + '万円';
            if (p < 1) requestAnimationFrame(step);
        }
        requestAnimationFrame(step);
    }

    // Stagger children entrance with GSAP
    function animateIn() {
        gsap.from(fkCard.children, {
            y: 30, opacity: 0, duration: 0.6, stagger: 0.12, ease: 'power2.out'
        });
        countUp(120, 1500);
    }

    ScrollTrigger.create({
        trigger: fkCard,
        start: 'top 80%',
        once: true,
        onEnter: animateIn
    });
})();

// Mouse stalker for content section only (PC with fine pointer only)
(function() {
    if (!matchMedia('(hover: hover) and (pointer: fine)').matches) return;

    var inv = document.createElement('div');
    inv.id = 'cs-ring-inv';
    document.body.appendChild(inv);
    var ring = document.createElement('div');
    ring.id = 'cs-ring';
    document.body.appendChild(ring);
    var dot = document.createElement('div');
    dot.id = 'cs-dot';
    document.body.appendChild(dot);

    var section = document.getElementById('content-section');
    if (!section) return;

    var onCard = false;
    var activeCard = null;
    var mx = 0, my = 0;
    var rx = 0, ry = 0;
    var RING_R = 40;

    // Emoji shields: clones above ring layers to prevent backdrop-filter inversion
    var emojiShields = [];
    section.querySelectorAll('.card-emoji').forEach(function(el) {
        var cs = getComputedStyle(el);
        var shield = document.createElement('div');
        shield.textContent = el.textContent.trim();
        shield.style.cssText =
            'position:fixed;display:flex;align-items:center;justify-content:center;' +
            'pointer-events:none;z-index:10001;' +
            'font-size:' + cs.fontSize + ';' +
            'width:' + cs.width + ';height:' + cs.height + ';' +
            'border-radius:' + cs.borderRadius + ';' +
            'background-image:' + cs.backgroundImage + ';' +
            'background-color:' + cs.backgroundColor + ';' +
            'clip-path:circle(0px at 0px 0px);';
        document.body.appendChild(shield);
        emojiShields.push({ orig: el, shield: shield });
    });

    window.addEventListener('mousemove', function(e) {
        mx = e.clientX;
        my = e.clientY;
        if (onCard) {
            dot.style.left = mx + 'px';
            dot.style.top = my + 'px';
        }
    });

    function followLoop() {
        if (onCard && activeCard) {
            rx += (mx - rx) * 0.15;
            ry += (my - ry) * 0.15;
            ring.style.left = rx + 'px';
            ring.style.top = ry + 'px';
            inv.style.left = rx + 'px';
            inv.style.top = ry + 'px';
            // Clip inv to active card bounds so inversion doesn't leak outside
            var cr = activeCard.getBoundingClientRect();
            var eLeft = rx - RING_R, eTop = ry - RING_R, eSize = RING_R * 2;
            var cTop  = Math.max(0, cr.top - eTop);
            var cRight = Math.max(0, (eLeft + eSize) - cr.right);
            var cBottom = Math.max(0, (eTop + eSize) - cr.bottom);
            var cLeft  = Math.max(0, cr.left - eLeft);
            inv.style.clipPath = 'inset(' + cTop + 'px ' + cRight + 'px ' + cBottom + 'px ' + cLeft + 'px round 14px)';
            // Update emoji shields
            for (var i = 0; i < emojiShields.length; i++) {
                var item = emojiShields[i];
                var r = item.orig.getBoundingClientRect();
                item.shield.style.left = r.left + 'px';
                item.shield.style.top = r.top + 'px';
                item.shield.style.clipPath = 'circle(' + RING_R + 'px at ' + (rx - r.left) + 'px ' + (ry - r.top) + 'px)';
            }
        }
        requestAnimationFrame(followLoop);
    }
    followLoop();

    function hideRing() {
        onCard = false;
        activeCard = null;
        ring.style.display = 'none';
        inv.style.display = 'none';
        dot.style.display = 'none';
        inv.style.clipPath = '';
        for (var i = 0; i < emojiShields.length; i++) {
            emojiShields[i].shield.style.clipPath = 'circle(0px at 0px 0px)';
        }
    }

    // カード単位で表示/非表示
    section.querySelectorAll('.content-card').forEach(function(card) {
        card.addEventListener('mouseenter', function() {
            onCard = true;
            activeCard = card;
            rx = mx; ry = my;
            ring.style.left = rx + 'px';
            ring.style.top = ry + 'px';
            inv.style.left = rx + 'px';
            inv.style.top = ry + 'px';
            dot.style.left = mx + 'px';
            dot.style.top = my + 'px';
            ring.style.display = 'block';
            inv.style.display = 'block';
            dot.style.display = 'block';
        });
        card.addEventListener('mouseleave', hideRing);
    });
})();

// Custom plan selector
(function() {
    var selector = document.getElementById('fk-plan-selector');
    var toggle = document.getElementById('fk-plan-toggle');
    var dropdown = document.getElementById('fk-plan-dropdown');
    var toggleText = document.getElementById('fk-plan-toggle-text');
    var hiddenInput = document.getElementById('fintokei-plan');
    if (!selector || !toggle || !dropdown) return;

    toggle.addEventListener('click', function(e) {
        e.stopPropagation();
        var isOpen = selector.classList.toggle('open');
        if (isOpen) {
            // Scroll active item into view
            var active = dropdown.querySelector('.fk-plan-active');
            if (active) active.scrollIntoView({ block: 'nearest' });
        }
    });

    dropdown.addEventListener('click', function(e) {
        var btn = e.target.closest('.fk-plan-option');
        if (!btn) return;
        var val = btn.getAttribute('data-value');
        // Update active state
        var allOpts = dropdown.querySelectorAll('.fk-plan-option');
        for (var i = 0; i < allOpts.length; i++) allOpts[i].classList.remove('fk-plan-active');
        btn.classList.add('fk-plan-active');
        // Update toggle text
        toggleText.textContent = btn.textContent;
        // Update hidden input and run sim
        hiddenInput.value = val;
        selector.classList.remove('open');
        runFintokeiSim();
    });

    document.addEventListener('click', function(e) {
        if (!selector.contains(e.target)) selector.classList.remove('open');
    });
})();

// Fintokei graph: trigger animation on scroll into view
(function() {
    var graphCard = document.querySelector('.fintokei-graph-card');
    if (!graphCard) { runFintokeiSim(); return; }
    var fkChartVisible = false;
    var fkObserver = new IntersectionObserver(function(entries) {
        entries.forEach(function(entry) {
            if (entry.isIntersecting && !fkChartVisible) {
                fkChartVisible = true;
                runFintokeiSim();
            }
        });
    }, { threshold: 0.3 });
    fkObserver.observe(graphCard);

    // Wrap runFintokeiSim: skip only the very first auto-call before scroll
    var origRun = runFintokeiSim;
    var firstCall = true;
    runFintokeiSim = function() {
        if (firstCall && !fkChartVisible) { firstCall = false; return; }
        fkChartVisible = true;
        origRun();
    };
})();

// Register all timelines with viewport-based pause/resume controller
(function() {
    var pairs = [
        ['ytt-p1', function() { return yttP1Tl; }],
        ['ytt-p2', function() { return candleTl; }],
        ['ytt-p3', function() { return yttP3Tl; }],
        ['ytt-p5', function() { return yttP5Tl; }],
        ['notif-section', function() { return discordTl; }],
        ['features', function() { return featChartTl; }],
        ['elearning-section', function() { return elPreviewTl; }],
        ['community-section', function() { return commChatTl; }]
    ];
    for (var i = 0; i < pairs.length; i++) {
        var el = document.getElementById(pairs[i][0]);
        if (el) vpWatch(el, pairs[i][1]);
    }

    // Mobile long-press tooltip removed (カーソル系機能はPC専用)

    // 画像・フォント読み込み後にScrollTriggerの位置を再計算
    window.addEventListener('load', function() {
        if (typeof ScrollTrigger !== 'undefined') {
            ScrollTrigger.refresh();
        }
    });

    // ── Feature card & fintokei card click → smooth scroll ──
    document.querySelectorAll('.feature-card[data-href], .fintokei-card[data-href]').forEach(function(card) {
        card.addEventListener('click', function() {
            var target = document.querySelector(card.getAttribute('data-href'));
            if (target) target.scrollIntoView({ behavior: 'smooth' });
        });
    });

    // ── Daily-chart comm-row fade-in (same pattern as other comm-rows) ──
    var dailyRow = document.getElementById('daily-chart');
    if (dailyRow && typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
        gsap.from(dailyRow, {
            y: 40, opacity: 0, duration: 0.8,
            ease: 'power2.out',
            scrollTrigger: { trigger: dailyRow, start: 'top 85%', once: true }
        });
    }

    // ── Plan Carousel ──
    initPlanCarousel();

})();

// ---- Plan carousel ----
function initPlanCarousel() {
    var slides = document.querySelectorAll('.plan-carousel-slide');
    var track = document.querySelector('.plan-carousel-track');
    var prevBtn = document.getElementById('plan-carousel-prev');
    var nextBtn = document.getElementById('plan-carousel-next');
    if (!slides.length) return;

    var current = 1; // Standard centered initially
    var total = slides.length;
    var isAnimating = false;

    function getLayout() {
        var isMobile = track.offsetWidth < 700;
        return {
            activeW: isMobile ? 300 : 420,
            inactiveW: isMobile ? 240 : 340,
            gap: isMobile ? 16 : 28,
            sideScale: isMobile ? 0.88 : 0.9
        };
    }

    function updateArrows() {
        if (prevBtn) prevBtn.style.display = current <= 0 ? 'none' : '';
        if (nextBtn) nextBtn.style.display = current >= total - 1 ? 'none' : '';
    }

    function positionSlides() {
        var L = getLayout();
        var prevIdx = current - 1;
        var nextIdx = current + 1;
        var sideOffset = L.activeW / 2 + L.gap + (L.inactiveW * L.sideScale) / 2;

        slides.forEach(function(s, i) {
            s.classList.toggle('is-active', i === current);

            if (i === current) {
                s.style.transform = 'translate(-50%, -50%)';
                s.style.opacity = '1';
                s.style.zIndex = '2';
                s.style.filter = 'none';
            } else if (i === prevIdx) {
                s.style.transform = 'translate(calc(-50% - ' + sideOffset + 'px), -50%) scale(' + L.sideScale + ')';
                s.style.opacity = '0.45';
                s.style.zIndex = '1';
                s.style.filter = 'blur(1.5px)';
            } else if (i === nextIdx) {
                s.style.transform = 'translate(calc(-50% + ' + sideOffset + 'px), -50%) scale(' + L.sideScale + ')';
                s.style.opacity = '0.45';
                s.style.zIndex = '1';
                s.style.filter = 'blur(1.5px)';
            } else {
                s.style.transform = 'translate(-50%, -50%) scale(0.8)';
                s.style.opacity = '0';
                s.style.zIndex = '0';
                s.style.filter = 'blur(4px)';
            }
        });
        updateArrows();
    }

    function goTo(idx) {
        if (isAnimating || idx < 0 || idx >= total) return;
        isAnimating = true;
        current = idx;
        positionSlides();
        setTimeout(function() { isAnimating = false; }, 750);
    }

    if (prevBtn) prevBtn.addEventListener('click', function() { goTo(current - 1); });
    if (nextBtn) nextBtn.addEventListener('click', function() { goTo(current + 1); });

    slides.forEach(function(s, i) {
        s.addEventListener('click', function() { if (i !== current) goTo(i); });
    });

    var resizeTimer;
    window.addEventListener('resize', function() {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(positionSlides, 100);
    });

    positionSlides();
}
