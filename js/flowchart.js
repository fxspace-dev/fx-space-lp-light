gsap.registerPlugin(ScrollTrigger);

// Hero background chart — build elements but don't show yet
function revealHeroChart() {
    var ns = 'http://www.w3.org/2000/svg';
    var g = document.getElementById('hero-chart-candles');
    if (!g || g.childElementCount > 0) return;
    var raw = [
        {o:100,h:105,l:96,c:104},    {o:104,h:109,l:102,c:108},
        {o:108,h:112,l:105,c:111},   {o:111,h:114,l:105,c:106},
        {o:106,h:108,l:100,c:101},   {o:101,h:110,l:97,c:109},
        {o:109,h:116,l:107,c:115},   {o:115,h:119,l:112,c:118},
        {o:118,h:124,l:116,c:123},   {o:123,h:127,l:117,c:118},
        {o:118,h:121,l:113,c:114},   {o:114,h:122,l:110,c:121},
        {o:121,h:127,l:119,c:126},   {o:126,h:131,l:123,c:130},
        {o:130,h:135,l:127,c:134},   {o:134,h:138,l:131,c:137},
        {o:137,h:140,l:131,c:132},   {o:132,h:135,l:127,c:128},
        {o:128,h:136,l:125,c:135},   {o:135,h:141,l:133,c:140},
        {o:140,h:145,l:137,c:144},   {o:144,h:149,l:141,c:148},
        {o:148,h:152,l:142,c:143},   {o:143,h:146,l:138,c:139},
        {o:139,h:147,l:136,c:146},   {o:146,h:151,l:143,c:150},
        {o:150,h:155,l:147,c:154},   {o:154,h:160,l:152,c:159},
        {o:159,h:163,l:155,c:162},   {o:162,h:167,l:157,c:158},
        {o:158,h:161,l:153,c:154},   {o:154,h:162,l:150,c:161},
        {o:161,h:166,l:158,c:165},   {o:165,h:171,l:163,c:170},
        {o:170,h:175,l:167,c:174},   {o:174,h:178,l:168,c:169},
        {o:169,h:176,l:166,c:175},   {o:175,h:180,l:172,c:179},
        {o:179,h:184,l:176,c:183},   {o:183,h:188,l:180,c:187},
        {o:187,h:191,l:181,c:182},   {o:182,h:185,l:177,c:178},
        {o:178,h:186,l:175,c:185},   {o:185,h:191,l:183,c:190},
        {o:190,h:196,l:188,c:195},   {o:195,h:200,l:192,c:199},
        {o:199,h:205,l:197,c:204},   {o:204,h:210,l:201,c:209}
    ];
    var count = raw.length;
    var w = 1200, h = 600;
    var candleW = w / count;
    var candles = [];
    for (var i = 0; i < count; i++) {
        var r = raw[i];
        candles.push({ open: r.o, close: r.c, hi: r.h, lo: r.l, bull: r.c >= r.o });
    }
    var allHi = candles.reduce(function(m, c) { return Math.max(m, c.hi); }, -Infinity);
    var allLo = candles.reduce(function(m, c) { return Math.min(m, c.lo); }, Infinity);
    var pad = (allHi - allLo) * 0.1;
    allHi += pad; allLo -= pad;
    function py(p) { return h * 0.05 + (1 - (p - allLo) / (allHi - allLo)) * h * 0.9; }
    for (var i = 0; i < count; i++) {
        var c = candles[i];
        var cx = candleW * i + candleW / 2;
        var wick = document.createElementNS(ns, 'line');
        wick.setAttribute('x1', cx); wick.setAttribute('x2', cx);
        wick.setAttribute('y1', py(c.hi)); wick.setAttribute('y2', py(c.lo));
        wick.setAttribute('stroke', c.bull ? 'rgba(255,255,255,0.7)' : 'rgba(255,255,255,0.5)');
        wick.setAttribute('stroke-width', '1.5');
        wick.style.opacity = '0';
        g.appendChild(wick);
        var bodyTop = py(Math.max(c.open, c.close));
        var bodyBot = py(Math.min(c.open, c.close));
        var body = document.createElementNS(ns, 'rect');
        body.setAttribute('x', cx - candleW * 0.35);
        body.setAttribute('y', bodyTop);
        body.setAttribute('width', candleW * 0.7);
        body.setAttribute('height', Math.max(bodyBot - bodyTop, 3));
        body.setAttribute('rx', '1.5');
        body.setAttribute('fill', c.bull ? 'rgba(255,255,255,0.5)' : 'rgba(255,255,255,0.35)');
        body.style.opacity = '0';
        g.appendChild(body);
    }
    var els = g.children;
    for (var i = 0; i < els.length; i++) {
        (function(el, idx) {
            gsap.to(el, { opacity: 1, duration: 0.4, delay: idx * 0.03, ease: 'power2.out' });
        })(els[i], i);
    }
}

// ── Hero entrance (Speak-inspired staggered sequence) ──
(function() {
    // Skip hero animation if inside hero-lp (LP-light uses static hero)
    if (document.querySelector('.hero.hero-lp')) return;

    var badge = document.querySelector('.hero-title-badge');
    var words = document.querySelectorAll('.heading-xl.hero-gradient .word');
    var subtitle = document.querySelector('.hero-subtitle-accent');
    var statsEl = document.getElementById('hero-stats');
    var prosEl = document.getElementById('stat-pros');
    var amountEl = document.getElementById('stat-amount');
    var ctaEl = document.getElementById('hero-cta-text');
    var ctaMain = document.getElementById('hero-cta-main-text');
    var ctaSub = ctaEl ? ctaEl.querySelector('.hero-cta-sub') : null;
    var scrollCue = document.querySelector('.scroll-cue');

    var ctaText = '次は、あなたの番。';

    // ── Sequential timeline ──
    var master = gsap.timeline();
    var h1El = document.querySelector('.heading-xl.hero-gradient');
    var headingText = '経験ゼロから 最短プロへ';

    // Hide all elements initially (they appear after heading shrinks)
    if (badge) gsap.set(badge, { opacity: 0, scale: 0.7, y: 10 });
    if (subtitle) gsap.set(subtitle, { opacity: 0, y: 12, letterSpacing: '0.22em' });
    if (scrollCue) gsap.set(scrollCue, { opacity: 0 });

    // Phase 1: Heading BIG typewriter in center
    if (h1El) {
        h1El.innerHTML = '';
        var heroInner = document.querySelector('.hero-inner');
        // Start big — use wide max-width so text never wraps vertically
        if (heroInner) gsap.set(heroInner, { maxWidth: '95vw' });
        gsap.set(h1El, {
            fontSize: 'clamp(3.2rem, 7.5vw, 5.5rem)'
        });

        var line1 = '経験ゼロから';
        var line2 = '最短プロへ';

        master.call(function() {
            var heroCursor = document.createElement('span');
            heroCursor.className = 'hero-cursor';
            h1El.appendChild(heroCursor);

            // Line1: insert each char before cursor one by one
            var tl = gsap.timeline({ delay: 0.15 });
            var underlineWrap = null;
            for (var i = 0; i < line1.length; i++) {
                (function(ch, idx) {
                    tl.call(function() {
                        var sp = document.createElement('span');
                        sp.className = 'hero-char';
                        sp.style.opacity = '1';
                        sp.textContent = ch;
                        h1El.insertBefore(sp, heroCursor);
                        // After "経験ゼロ" (4th char), insert underline
                        if (idx === 3) {
                            var allChars = h1El.querySelectorAll('.hero-char');
                            // Wrap first 4 chars in a container
                            var textWrap = document.createElement('span');
                            textWrap.className = 'hero-underline-text';
                            h1El.insertBefore(textWrap, allChars[0]);
                            for (var k = 0; k < 4; k++) {
                                textWrap.appendChild(allChars[k]);
                            }
                            // Add underline inside wrapper
                            underlineWrap = document.createElement('span');
                            underlineWrap.className = 'hero-underline-wrap';
                            var img = document.createElement('img');
                            img.className = 'hero-underline-img';
                            img.src = 'img/underline-gold.png';
                            img.alt = '';
                            underlineWrap.appendChild(img);
                            textWrap.appendChild(underlineWrap);
                            setTimeout(function() { img.classList.add('draw'); }, 50);
                        }
                    });
                    tl.to({}, { duration: 0.09 });
                })(line1[i], i);
            }

            // Pause, then line2
            tl.call(function() {
                // Insert br before cursor
                h1El.insertBefore(document.createElement('br'), heroCursor);

                // Line2: insert each char before cursor
                var tl2 = gsap.timeline({ delay: 0.3 });
                var line2StartIdx = h1El.querySelectorAll('.hero-char').length;
                for (var j = 0; j < line2.length; j++) {
                    (function(ch, jIdx) {
                        tl2.call(function() {
                            var sp = document.createElement('span');
                            sp.className = 'hero-char';
                            sp.style.opacity = '1';
                            sp.textContent = ch;
                            h1El.insertBefore(sp, heroCursor);
                            // After "プロ" (index 3 in line2), wrap them
                            if (jIdx === 3) {
                                var allChars = h1El.querySelectorAll('.hero-char');
                                var proStart = line2StartIdx + 2; // "プ"
                                var proEnd = line2StartIdx + 3;   // "ロ"
                                var textWrap2 = document.createElement('span');
                                textWrap2.className = 'hero-underline-text2';
                                h1El.insertBefore(textWrap2, allChars[proStart]);
                                textWrap2.appendChild(allChars[proStart]);
                                textWrap2.appendChild(allChars[proEnd]);
                                var ulWrap2 = document.createElement('span');
                                ulWrap2.className = 'hero-underline-wrap2';
                                var imgTop = document.createElement('img');
                                imgTop.className = 'hero-underline-img2 hero-underline-img2--top';
                                imgTop.src = 'img/underline-double.png';
                                imgTop.alt = '';
                                var imgBot = document.createElement('img');
                                imgBot.className = 'hero-underline-img2 hero-underline-img2--bottom';
                                imgBot.src = 'img/underline-double.png';
                                imgBot.alt = '';
                                ulWrap2.appendChild(imgTop);
                                ulWrap2.appendChild(imgBot);
                                textWrap2.appendChild(ulWrap2);
                                // Top line draws first, then bottom line
                                setTimeout(function() { imgTop.classList.add('draw'); }, 50);
                                setTimeout(function() { imgBot.classList.add('draw'); }, 400);
                            }
                        });
                        tl2.to({}, { duration: 0.09 });
                    })(line2[j], j);
                }

                // After line2 completes
                tl2.call(function() {
                    // Cursor fades
                    gsap.to(heroCursor, {
                        opacity: 0, duration: 0.3, delay: 0.6,
                        onComplete: function() { heroCursor.style.display = 'none'; }
                    });

                    // Phase 2: Shrink heading to normal size
                    gsap.to(h1El, {
                        fontSize: 'clamp(2.6rem, 6.5vw, 4.8rem)',
                        duration: 0.8,
                        delay: 1.2,
                        ease: 'power3.inOut',
                        onComplete: function() {
                            if (heroInner) gsap.to(heroInner, { maxWidth: '680px', duration: 0.5, ease: 'power2.inOut' });
                            // Phase 3: Reveal everything else (ゆっくり)
                            var t3 = gsap.timeline();

                            // Stats slide up (チャートの動きが止まる前に表示)
                            if (statsEl) {
                                t3.to(statsEl, {
                                    opacity: 1, y: 0,
                                    duration: 0.8, ease: 'power3.out'
                                }, 0.5);

                                // Count-up
                                var obj = { pros: 0, amount: 0 };
                                t3.to(obj, {
                                    pros: 430, duration: 1.4, ease: 'power2.out',
                                    onUpdate: function() { prosEl.textContent = Math.round(obj.pros); }
                                }, 0.9);
                                t3.to(obj, {
                                    amount: 1.2, duration: 1.4, ease: 'power2.out',
                                    onUpdate: function() { amountEl.textContent = obj.amount.toFixed(1); }
                                }, 0.9);
                            }

                            // CTA container (カウンター完了直後 0.9+1.4=2.3)
                            if (ctaEl) {
                                t3.to(ctaEl, {
                                    opacity: 1, y: 0, duration: 0.7, ease: 'power3.out'
                                }, 2.3);
                            }

                            // CTA typewriter
                            if (ctaMain) {
                                t3.call(function() {
                                    ctaMain.innerHTML = '';
                                    var cursor = document.createElement('span');
                                    cursor.className = 'cta-cursor';
                                    ctaMain.appendChild(cursor);

                                    var tl4 = gsap.timeline({ delay: 0.2 });
                                    for (var ci = 0; ci < ctaText.length; ci++) {
                                        (function(ch) {
                                            tl4.call(function() {
                                                var sp = document.createElement('span');
                                                sp.className = 'cta-char';
                                                sp.style.opacity = '1';
                                                sp.textContent = ch;
                                                ctaMain.insertBefore(sp, cursor);
                                            });
                                            tl4.to({}, { duration: 0.08 });
                                        })(ctaText[ci]);
                                    }
                                    tl4.call(function() {
                                        gsap.to(cursor, {
                                            opacity: 0, duration: 0.3, delay: 0.6,
                                            onComplete: function() { cursor.style.display = 'none'; }
                                        });
                                        // Wave underline under CTA
                                        var waveImg = document.createElement('img');
                                        waveImg.className = 'cta-underline-wave';
                                        waveImg.src = 'img/underline-wave.png';
                                        waveImg.alt = '';
                                        // Measure actual text width so wave matches on all devices
                                        var chars = ctaMain.querySelectorAll('.cta-char');
                                        var tw = 0;
                                        for (var ci2 = 0; ci2 < chars.length; ci2++) { tw += chars[ci2].offsetWidth; }
                                        if (tw > 0) waveImg.style.width = tw + 'px';
                                        ctaMain.appendChild(waveImg);
                                        setTimeout(function() { waveImg.classList.add('draw'); }, 500);
                                    });
                                }, null, 2.7);
                            }

                            // Sub-text & Scroll cue (タイプライター完了後)
                            if (ctaSub) {
                                t3.fromTo(ctaSub,
                                    { opacity: 0, y: 8 },
                                    { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out' },
                                    4.2);
                            }

                            if (scrollCue) {
                                t3.to(scrollCue, { opacity: 1, duration: 0.5 }, 4.2);
                            }
                        }
                    });

                    // Subtitle, badge, background chart appear simultaneously with heading shrink
                    if (subtitle) {
                        gsap.to(subtitle, {
                            opacity: 1, y: 0, letterSpacing: '0.08em',
                            duration: 0.9, delay: 1.2, ease: 'power3.out'
                        });
                    }
                    if (badge) {
                        gsap.to(badge, {
                            opacity: 1, scale: 1, y: 0,
                            duration: 0.7, delay: 1.2, ease: 'power3.out'
                        });
                    }
                    gsap.delayedCall(1.2, revealHeroChart);
                });
            });
        }, null, 0.3);
    }
})();

// Hero parallax on scroll
gsap.to('.hero-inner', {
    y: 120, opacity: 0, scale: 0.95, filter: 'blur(6px)',
    ease: 'none',
    scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true }
});

/* ===== Flowchart Interaction ===== */

function revealFcLevel1() {
    var conn1 = document.getElementById('fc-conn1');
    var split1 = document.getElementById('fc-split1');
    conn1.style.display = '';
    split1.style.display = '';
    gsap.fromTo(conn1, { scaleY: 0 }, { scaleY: 1, duration: 0.3, ease: 'power2.out' });
    var lbls = split1.querySelectorAll(':scope > .fc-branch > .fc-lbl');
    gsap.fromTo(lbls, { opacity: 0, scale: 0.5 }, { opacity: 1, scale: 1, stagger: 0.1, duration: 0.35, delay: 0.15, ease: 'back.out(1.5)' });
}

function revealFcSublevel(connId, qId, connSplitId, splitId) {
    var conn = document.getElementById(connId);
    var q = document.getElementById(qId);
    var connSplit = document.getElementById(connSplitId);
    var split = document.getElementById(splitId);
    conn.style.display = '';
    q.style.display = '';
    gsap.fromTo(conn, { scaleY: 0 }, { scaleY: 1, duration: 0.3, ease: 'power2.out' });
    gsap.fromTo(q, { opacity: 0, scale: 0.7, y: 20 }, { opacity: 1, scale: 1, y: 0, duration: 0.5, delay: 0.15, ease: 'back.out(2)', onComplete: function() {
        connSplit.style.display = '';
        split.style.display = '';
        gsap.fromTo(connSplit, { scaleY: 0 }, { scaleY: 1, duration: 0.3, ease: 'power2.out' });
        var lbls = split.querySelectorAll(':scope > .fc-branch > .fc-lbl');
        gsap.fromTo(lbls, { opacity: 0, scale: 0.5 }, { opacity: 1, scale: 1, stagger: 0.1, duration: 0.35, delay: 0.15, ease: 'back.out(1.5)' });
    }});
}

function fcAnswer(qId, answer) {
    if (qId === 'q1') {
        document.getElementById('fc-q1').classList.add('fc-active');
        var branches = document.querySelectorAll('#fc-split1 > .fc-branch');
        branches.forEach(function(b, i) {
            var isSelected = (answer === 'none' && i === 0) || (answer === 'have' && i === 1);
            if (!isSelected) b.classList.add('fc-path-dim');
        });
        if (answer === 'none') {
            revealFcSublevel('fc-conn-q2a', 'fc-q2a', 'fc-conn-q2a-split', 'fc-split-q2a');
            document.getElementById('fc-q2a').classList.add('fc-active');
        } else if (answer === 'have') {
            revealFcSublevel('fc-conn-q2b', 'fc-q2b', 'fc-conn-q2b-split', 'fc-split-q2b');
            document.getElementById('fc-q2b').classList.add('fc-active');
        }
    } else if (qId === 'q2b') {
        var branches2 = document.querySelectorAll('#fc-split-q2b > .fc-branch');
        branches2.forEach(function(b, i) {
            var isSelected = (answer === 'skillup' && i === 0) || (answer === 'pro' && i === 1);
            if (!isSelected) b.classList.add('fc-path-dim');
        });
        if (answer === 'skillup') {
            revealFcSublevel('fc-conn-q3a', 'fc-q3a', 'fc-conn-q3a-split', 'fc-split-q3a');
            document.getElementById('fc-q3a').classList.add('fc-active');
        } else if (answer === 'pro') {
            revealFcSublevel('fc-conn-q3', 'fc-q3', 'fc-conn-q3-split', 'fc-split-q3');
            document.getElementById('fc-q3').classList.add('fc-active');
        }
    }
}

function revealAllResults(selectedId) {
    var DIM = 0.7;
    // Reveal ALL hidden sublevels (other branches) dimmed
    var allSubs = ['fc-conn-q2a','fc-q2a','fc-conn-q2a-split','fc-split-q2a',
                   'fc-conn-q2b','fc-q2b','fc-conn-q2b-split','fc-split-q2b',
                   'fc-conn-q3a','fc-q3a','fc-conn-q3a-split','fc-split-q3a',
                   'fc-conn-q3','fc-q3','fc-conn-q3-split','fc-split-q3'];
    allSubs.forEach(function(id) {
        var el = document.getElementById(id);
        if (el && el.style.display === 'none') {
            el.style.display = '';
            el.classList.add('fc-other-result');
            gsap.set(el, { opacity: DIM });
        }
    });
    // Reveal all result nodes + connectors
    document.querySelectorAll('.fc-result-conn, .fc-result-node').forEach(function(el) {
        if (el.style.display === 'none') {
            el.style.display = '';
            el.classList.add('fc-other-result');
            gsap.set(el, { opacity: DIM });
        } else if (el.id !== selectedId && !el.classList.contains('fc-other-result')) {
            el.classList.add('fc-other-result');
            gsap.set(el, { opacity: DIM });
        }
    });
    // Unify opacity on all dimmed elements
    document.querySelectorAll('.fc-path-dim').forEach(function(el) {
        gsap.set(el, { opacity: DIM });
    });
    document.querySelectorAll('.fc-other-result').forEach(function(el) {
        gsap.set(el, { opacity: DIM });
    });
}

function selectRoute(route) {
    // Hide CTA prompt
    var fcCta = document.getElementById('fc-cta');
    if (fcCta) gsap.to(fcCta, { opacity: 0, y: -20, duration: 0.3, onComplete: function() { fcCta.style.display = 'none'; } });

    // 1. Highlight flowchart path
    highlightFlowchartPath(route);

    // 2. Hide other results, show selected
    document.querySelectorAll('.result-section').forEach(function(el) {
        el.style.display = 'none';
        el.classList.remove('active');
    });
    var resultRoute = (route === 'zeropro2') ? 'zeropro' : route;
    var resultEl = document.getElementById('result-' + resultRoute);
    if (resultEl) {
        resultEl.style.display = 'block';
        resultEl.classList.add('active');
        gsap.fromTo(resultEl, {opacity:0, y:20}, {opacity:1, y:0, duration:0.5});
        // コース説明セクションへスクロール
        setTimeout(function() {
            resultEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 200);
    }

    // 3. Content card recommendations
    document.querySelectorAll('.content-card').forEach(function(card) {
        card.classList.remove('recommended');
        var rec = card.getAttribute('data-rec');
        if (rec && rec.split(',').indexOf(route) !== -1) card.classList.add('recommended');
    });
}

function clearFlowchartHighlights() {
    // ハイライト系クラスを除去し、全要素の opacity をリセット（非表示にはしない）
    document.querySelectorAll('.fc-active').forEach(function(el) { el.classList.remove('fc-active'); });
    document.querySelectorAll('.fc-result-active').forEach(function(el) { el.classList.remove('fc-result-active'); });
    document.querySelectorAll('.fc-path-dim').forEach(function(el) { el.classList.remove('fc-path-dim'); gsap.set(el, { opacity: 1 }); });
    document.querySelectorAll('.fc-other-result').forEach(function(el) { el.classList.remove('fc-other-result'); gsap.set(el, { opacity: 1 }); });
}

function highlightFlowchartPath(route) {
    var resultNodes = {
        'elearning': 'fc-r-elearning',
        'zeropro': 'fc-r-zeropro',
        'zeropro2': 'fc-r-zeropro2',
        'ytt': 'fc-r-ytt',
        'community': 'fc-r-community',
        'fintokei': 'fc-r-fintokei'
    };
    var targetId = resultNodes[route];
    var targetNode = document.getElementById(targetId);
    if (!targetNode) return;

    // 前回のハイライトをクリア
    clearFlowchartHighlights();

    // Reveal result node with animation
    var conn = targetNode.previousElementSibling;
    if (conn && conn.classList.contains('fc-result-conn')) {
        conn.style.display = '';
        gsap.fromTo(conn, { scaleY: 0 }, { scaleY: 1, duration: 0.3, ease: 'power2.out' });
    }
    targetNode.style.display = '';
    gsap.fromTo(targetNode, { opacity: 0, scale: 0.7, y: 20 }, { opacity: 1, scale: 1, y: 0, duration: 0.5, delay: 0.15, ease: 'back.out(2)' });
    targetNode.classList.add('fc-active');
    targetNode.classList.add('fc-result-active');

    // Show all other results dimmed after a short delay
    setTimeout(function() { revealAllResults(targetId); }, 300);
}

function resetFlowchartHighlight() {
    document.querySelectorAll('.fc-active').forEach(function(el) { el.classList.remove('fc-active'); });
    document.querySelectorAll('.fc-result-active').forEach(function(el) { el.classList.remove('fc-result-active'); });
    document.querySelectorAll('.fc-path-dim').forEach(function(el) { el.classList.remove('fc-path-dim'); });
    document.querySelectorAll('.fc-result-node').forEach(function(el) { el.style.display = 'none'; el.classList.remove('fc-other-result'); gsap.set(el, { opacity: 1 }); });
    document.querySelectorAll('.fc-result-conn').forEach(function(el) { el.style.display = 'none'; el.classList.remove('fc-other-result'); gsap.set(el, { opacity: 1 }); });
    document.querySelectorAll('.fc-other-result').forEach(function(el) { el.classList.remove('fc-other-result'); gsap.set(el, { opacity: 1 }); });
    // Hide all sub-levels
    ['fc-conn-q2a','fc-q2a','fc-conn-q2a-split','fc-split-q2a',
     'fc-conn-q2b','fc-q2b','fc-conn-q2b-split','fc-split-q2b',
     'fc-conn-q3','fc-q3','fc-conn-q3-split','fc-split-q3'].forEach(function(id) {
        var el = document.getElementById(id);
        if (el) { el.style.display = 'none'; el.classList.remove('fc-active'); }
    });
}

function toggleYttFullscreen() {
    var frame = document.getElementById('ytt-demo-frame');
    var exitBtn = document.getElementById('ytt-demo-exit-btn');
    var isFs = frame.classList.toggle('is-fullscreen');
    if (isFs) {
        exitBtn.classList.add('visible');
        document.body.style.overflow = 'hidden';
    } else {
        exitBtn.classList.remove('visible');
        document.body.style.overflow = '';
    }
}
function closeYttDemo() {
    var frame = document.getElementById('ytt-demo-frame');
    if (frame.classList.contains('is-fullscreen')) {
        toggleYttFullscreen();
    }
}
// Listen for exit message from iframe
window.addEventListener('message', function(e) {
    if (e.data && e.data.type === 'ytt-demo-exit') {
        closeYttDemo();
    }
});
// Escape key to close
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        var frame = document.getElementById('ytt-demo-frame');
        if (frame && frame.classList.contains('is-fullscreen')) {
            closeYttDemo();
        }
        var frame2 = document.getElementById('ytt-demo-frame-2');
        if (frame2 && frame2.classList.contains('is-fullscreen')) {
            closeYttDemo2();
        }
    }
});

function toggleYttFullscreen2() {
    if(window.innerWidth<=768) return;
    var frame = document.getElementById('ytt-demo-frame-2');
    var exitBtn = document.getElementById('ytt-demo-exit-btn-2');
    var iframe = frame.querySelector('iframe');
    var isFs = !frame.classList.contains('is-fullscreen');
    if (isFs) {
        // 1) Hide iframe BEFORE going fullscreen to prevent dark flash
        frame.style.transition = 'none';
        frame.style.opacity = '0';
        // 2) Go fullscreen (invisible)
        frame.classList.add('is-fullscreen');
        // 3) Create background overlay
        var ov = document.getElementById('ytt-fs-overlay');
        if (!ov) {
            ov = document.createElement('div');
            ov.id = 'ytt-fs-overlay';
            document.body.appendChild(ov);
        }
        // 4) After layout settles, fade in iframe + overlay together
        requestAnimationFrame(function(){ requestAnimationFrame(function(){
            ov.classList.add('visible');
            frame.style.transition = 'opacity 0.35s ease';
            frame.style.opacity = '1';
        }); });
        exitBtn.classList.add('visible');
        document.body.style.overflow = 'hidden';
        if (iframe && iframe.contentWindow) iframe.contentWindow.postMessage({type:'ytt-fullscreen-state',fullscreen:true},'*');
    } else {
        frame.style.transition = 'opacity 0.25s ease';
        frame.style.opacity = '0';
        var ov = document.getElementById('ytt-fs-overlay');
        if (ov) ov.classList.remove('visible');
        setTimeout(function(){
            frame.classList.remove('is-fullscreen');
            frame.style.transition = '';
            frame.style.opacity = '';
            if (ov) ov.remove();
        }, 300);
        exitBtn.classList.remove('visible');
        document.body.style.overflow = '';
        if (iframe && iframe.contentWindow) iframe.contentWindow.postMessage({type:'ytt-fullscreen-state',fullscreen:false},'*');
    }
}
function closeYttDemo2() {
    var frame = document.getElementById('ytt-demo-frame-2');
    if (frame.classList.contains('is-fullscreen')) {
        toggleYttFullscreen2();
    }
}
window.addEventListener('message', function(e) {
    if (e.data && e.data.type === 'ytt-go-fullscreen') {
        var frame = document.getElementById('ytt-demo-frame-2');
        if (frame && !frame.classList.contains('is-fullscreen')) {
            toggleYttFullscreen2();
        }
    }
    if (e.data && e.data.type === 'ytt-close-fullscreen') {
        closeYttDemo2();
    }
});

function resetRoute() {
    // Hide results
    document.querySelectorAll('.result-section').forEach(function(el) {
        el.style.display = 'none';
        el.classList.remove('active');
    });
    // Kill route-specific timelines
    if (mondaiTl) mondaiTl.kill();
    if (zeroproTl) zeroproTl.kill();
    // Reset flowchart
    resetFlowchartHighlight();
    // Reset wizard state for mobile
    wizardState.currentStep = '1';
    wizardState.selectedRoute = null;
    // Scroll to flowchart
    document.getElementById('flowchart').scrollIntoView({ behavior: 'smooth' });
    // Re-evaluate layout (mobile ↔ desktop)
    resizeFlowchart();
}

var scrollTriggerInstances = [];

function setupAnimations() {
    scrollTriggerInstances.forEach(function(st) { st.kill(); });
    scrollTriggerInstances = [];
    var triggerStart = "top 95%";

    // Features section animation
    // Features: カードが回転しながら下から飛び上がる
    scrollTriggerInstances.push(ScrollTrigger.create({ trigger: '#features', start: triggerStart, onEnter: function() {
        gsap.fromTo('#features .badge', { opacity: 0, y: -20 }, { opacity: 1, y: 0, duration: 0.4 });
        gsap.fromTo('#features .heading-lg', { opacity: 0, scale: 0.6, filter: 'blur(10px)' }, { opacity: 1, scale: 1, filter: 'blur(0px)', duration: 0.7, ease: 'power3.out', delay: 0.1 });
        gsap.fromTo('.feature-card', { opacity: 0, y: 120, rotationX: 40, transformPerspective: 800 }, { opacity: 1, y: 0, rotationX: 0, stagger: 0.2, duration: 0.8, ease: "power3.out", delay: 0.3, onComplete: animateFeatureCards });
    }, once: true }));

    // E-learning: 画面全体がズームインして現れる
    scrollTriggerInstances.push(ScrollTrigger.create({ trigger: '#elearning-section', start: triggerStart, onEnter: function() {
        gsap.fromTo('.elearning-text', { opacity: 0, y: 60, scale: 0.85 }, { opacity: 1, y: 0, scale: 1, duration: 0.8, ease: "power3.out" });
        gsap.fromTo('.el-sim', { opacity: 0, scale: 0.5, rotation: -3 }, { opacity: 1, scale: 1, rotation: 0, duration: 1, ease: "elastic.out(1, 0.6)", delay: 0.25 });
        if (!document.getElementById('elearning-section').classList.contains('coming-soon-section')) { initElSim(); }
    }, once: true }));

    // Zeropro 90
    if (document.getElementById('zeropro-section')) {
        initZpAnimations();
    }

    // Result sections (animate steps when visible)
    document.querySelectorAll('.result-section').forEach(function(resultEl) {
        resultEl.querySelectorAll('.route-step-item').forEach(function(step, i) {
            var children = step.children;
            var fromLeft = i % 2 === 0;
            if (children[0]) { var st1 = ScrollTrigger.create({ trigger: step, start: triggerStart, onEnter: function() { gsap.fromTo(children[0], { opacity: 0, x: fromLeft ? -80 : 80 }, { opacity: 1, x: 0, duration: 0.7, ease: "power3.out" }); }, once: true }); scrollTriggerInstances.push(st1); }
            if (children[1]) { var st2 = ScrollTrigger.create({ trigger: step, start: triggerStart, onEnter: function() { gsap.fromTo(children[1], { opacity: 0, x: fromLeft ? 80 : -80, scale: 0.9 }, { opacity: 1, x: 0, scale: 1, duration: 0.7, ease: "power3.out", delay: 0.15 }); }, once: true }); scrollTriggerInstances.push(st2); }
        });
    });

    // Flowchart: 見出しがタイプライター風に、質問ノードがバウンスイン
    scrollTriggerInstances.push(ScrollTrigger.create({ trigger: '#flowchart', start: triggerStart, onEnter: function() {
        gsap.fromTo('#flowchart .heading-lg', { opacity: 0, letterSpacing: '0.5em', filter: 'blur(8px)' }, { opacity: 1, letterSpacing: 'normal', filter: 'blur(0px)', duration: 0.8, ease: 'power3.out' });
        gsap.fromTo('#flowchart > p', { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.4, delay: 0.4 });
        gsap.fromTo('#fc-q1', { opacity: 0, scale: 0, rotation: 10 }, { opacity: 1, scale: 1, rotation: 0, duration: 0.7, ease: "elastic.out(1, 0.5)", delay: 0.6, onComplete: function() { revealFcLevel1(); } });
    }, once: true }));

    // All routes: タブが横からスライドイン
    scrollTriggerInstances.push(ScrollTrigger.create({ trigger: '#all-routes', start: triggerStart, onEnter: function() {
        gsap.fromTo('#all-routes .heading-lg', { opacity: 0, x: -80 }, { opacity: 1, x: 0, duration: 0.6, ease: 'power3.out' });
        gsap.fromTo('.route-tabs .route-tab', { opacity: 0, x: 60, rotation: 5 }, { opacity: 1, x: 0, rotation: 0, stagger: 0.12, duration: 0.5, ease: 'back.out(1.5)', delay: 0.2 });
    }, once: true }));

    var yttPanelAnims = [animateYttP1, animateCandles, animateYttP3, animateYttP5];
    var yttSceneIds = ['#scene-ytt-p1', '#scene-ytt', '#scene-ytt-p3', '#scene-ytt-p5'];
    var yttAnimPlayed = [false, false, false, false];
    // LP-light: only panel 1 exists — use simple fade instead of scrub
    var isLpLight = !!document.querySelector('.hero.hero-lp');
    for (var pi = 0; pi < 4; pi++) {
        (function(idx) {
            var panelId = '#ytt-p' + (idx + 1);
            if (!document.querySelector(panelId)) return; // skip missing panels
            if (isLpLight) {
                // Simple scroll-triggered fade-in for LP-light
                gsap.set(panelId + ' .ytt-panel-text', { opacity: 1, x: 0 });
                gsap.set(yttSceneIds[idx], { opacity: 1, scale: 1 });
                // Just trigger the SVG animation on scroll
                var st = ScrollTrigger.create({ trigger: panelId, start: 'top 70%', onEnter: function() {
                    if (!yttAnimPlayed[idx]) { yttAnimPlayed[idx] = true; yttPanelAnims[idx](); }
                }, once: true });
                scrollTriggerInstances.push(st);
                return;
            }
            var tl = gsap.timeline({
                scrollTrigger: {
                    trigger: panelId,
                    start: idx === 0 ? 'top 80%' : 'top 40%',
                    end: idx === 0 ? 'top 30%' : 'top top',
                    scrub: 0.8
                }
            });
            tl.fromTo(panelId + ' .ytt-panel-text', { opacity: 0, x: -60 }, { opacity: 1, x: 0, duration: 1, ease: 'power2.out' }, 0);
            tl.fromTo(yttSceneIds[idx], { opacity: 0, scale: 0.92 }, { opacity: 1, scale: 1, duration: 1, ease: 'power2.out' }, 0.1);
            scrollTriggerInstances.push(tl.scrollTrigger);
            var st = ScrollTrigger.create({ trigger: panelId, start: idx === 0 ? 'top 60%' : 'top 30%', onEnter: function() {
                if (!yttAnimPlayed[idx]) { yttAnimPlayed[idx] = true; yttPanelAnims[idx](); }
            }, once: true });
            scrollTriggerInstances.push(st);
        })(pi);
    }


    // Notification: ステップが階段状にスライドイン
    scrollTriggerInstances.push(ScrollTrigger.create({ trigger: '#notif-section', start: triggerStart, onEnter: function() {
        gsap.fromTo('#notif-section .heading-lg', { opacity: 0, y: -30, filter: 'blur(6px)' }, { opacity: 1, y: 0, filter: 'blur(0px)', duration: 0.6, ease: 'power3.out' });
        gsap.fromTo('.notif-step', { opacity: 0, x: -100, skewX: -5 }, { opacity: 1, x: 0, skewX: 0, stagger: 0.2, duration: 0.6, ease: 'power3.out', delay: 0.3 });
        gsap.fromTo('#scene-discord', { opacity: 0, y: 80, rotation: 3 }, { opacity: 1, y: 0, rotation: 0, duration: 0.9, ease: 'power3.out', delay: 0.4 });
        animateDiscord();
    }, once: true }));

    // Community circle-reveal
    animateZpCommunityReveal();

    // Community: チャットが中央からズーム＋ブラー解除で登場
    scrollTriggerInstances.push(ScrollTrigger.create({ trigger: '#community-section', start: triggerStart, onEnter: function() {
        document.querySelectorAll('.comm-row').forEach(function(row, i) { gsap.fromTo(row, { opacity: 0, y: 60, filter: 'blur(6px)' }, { opacity: 1, y: 0, filter: 'blur(0px)', duration: 0.7, delay: 0.2 + i * 0.2, ease: 'power3.out' }); });
    }, once: true }));

    // Content: カードが放射状にポップイン
    scrollTriggerInstances.push(ScrollTrigger.create({ trigger: '#content-section', start: triggerStart, onEnter: function() {
        gsap.fromTo('#content-section .heading-lg', { opacity: 0, scale: 1.3, filter: 'blur(10px)' }, { opacity: 1, scale: 1, filter: 'blur(0px)', duration: 0.6, ease: 'power3.out' });
        gsap.fromTo('.content-tab', { opacity: 0, y: -20 }, { opacity: 1, y: 0, stagger: 0.08, duration: 0.3, delay: 0.2 });
        document.querySelectorAll('.content-card').forEach(function(card, i) {
            var angle = ((i % 4) - 1.5) * 30;
            var dist = 60 + Math.random() * 40;
            var dx = Math.sin(angle * Math.PI / 180) * dist;
            var dy = dist;
            gsap.fromTo(card, { opacity: 0, x: dx, y: dy, scale: 0.7, rotation: (Math.random() - 0.5) * 10 }, { opacity: 1, x: 0, y: 0, scale: 1, rotation: 0, duration: 0.6, delay: 0.4 + i * 0.06, ease: 'back.out(1.2)' });
        });
    }, once: true }));

    // Founder: 横からカーテンが開くように登場
    scrollTriggerInstances.push(ScrollTrigger.create({ trigger: '#founder-section', start: triggerStart, onEnter: function() {
        gsap.fromTo('#founder-section .heading-lg', { opacity: 0, x: -60 }, { opacity: 1, x: 0, duration: 0.6, ease: 'power3.out' });
        gsap.fromTo('.founder-avatar', { opacity: 0, scale: 0, rotation: -15 }, { opacity: 1, scale: 1, rotation: 0, duration: 0.8, ease: 'elastic.out(1, 0.5)', delay: 0.2 });
        gsap.fromTo('.founder-info', { opacity: 0, x: 40, filter: 'blur(6px)' }, { opacity: 1, x: 0, filter: 'blur(0px)', duration: 0.6, ease: 'power3.out', delay: 0.5 });
    }, once: true }));

    // CTA: 全体が大きくバウンスしてインパクトのある登場
    scrollTriggerInstances.push(ScrollTrigger.create({ trigger: '#cta-section', start: triggerStart, onEnter: function() {
        gsap.fromTo('.cta-section h2', { opacity: 0, scale: 0.3, y: 60, filter: 'blur(12px)' }, { opacity: 1, scale: 1, y: 0, filter: 'blur(0px)', duration: 0.8, ease: 'elastic.out(1, 0.5)' });
        gsap.fromTo('.cta-section .subtitle', { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.5, delay: 0.3 });
        gsap.fromTo('.cta-section .btn', { opacity: 0, scale: 0, rotation: -10 }, { opacity: 1, scale: 1, rotation: 0, duration: 0.7, delay: 0.5, ease: 'elastic.out(1, 0.4)', clearProps: 'transform,scale,rotate,translate' });
    }, once: true }));
}

/* ===== Mobile Wizard ===== */

var wizardState = { currentStep: '1', selectedRoute: null };

var WIZARD_NEXT = {
    '1': { 'none': '2a', 'have': '2b' },
    '2b': { 'skillup': '3a', 'pro': '3b' }
};

var WIZARD_DOT_MAP = { '1': 0, '2a': 1, '2b': 1, '3a': 2, '3b': 2 };

function isMobileFlowchart() {
    var fc = document.querySelector('.flowchart');
    var section = document.querySelector('.flowchart-section');
    if (!fc || !section) return false;
    var cs = getComputedStyle(section);
    var available = section.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
    return (available / 980) < 0.6;
}

function wizardGoToStep(nextStep, direction) {
    var current = document.querySelector('.fc-wiz-step.active');
    var next = document.querySelector('.fc-wiz-step[data-step="' + nextStep + '"]');
    if (!current || !next || current === next) return;

    var dir = direction === 'back' ? -1 : 1;
    current.classList.remove('active');
    gsap.to(current, { opacity: 0, x: -60 * dir, duration: 0.25, ease: 'power2.in', onComplete: function() {
        current.style.display = 'none';
        gsap.set(current, { opacity: 1, x: 0 });
    }});

    next.style.display = 'flex';
    next.classList.add('active');
    gsap.fromTo(next, { opacity: 0, x: 60 * dir }, { opacity: 1, x: 0, duration: 0.35, ease: 'power2.out' });

    wizardState.currentStep = nextStep;
    updateWizardProgress(nextStep);
}

function updateWizardProgress(step) {
    var dotIdx = WIZARD_DOT_MAP[step] || 0;
    var dots = document.querySelectorAll('.fc-wiz-dot');
    var lines = document.querySelectorAll('.fc-wiz-dot-line');
    dots.forEach(function(d, i) {
        d.classList.remove('active', 'done');
        if (i < dotIdx) d.classList.add('done');
        else if (i === dotIdx) d.classList.add('active');
    });
    lines.forEach(function(l, i) {
        l.classList.toggle('done', i < dotIdx);
    });
}

function wizardSelectRoute(route) {
    wizardState.selectedRoute = route;
    var wizard = document.getElementById('fc-wizard');
    gsap.to(wizard, { opacity: 0, y: -20, duration: 0.3, onComplete: function() {
        wizard.style.display = 'none';
        gsap.set(wizard, { opacity: 1, y: 0 });
        showTreemap(route);
        selectRoute(route);
    }});
}

function showTreemap(activeRoute) {
    var treemap = document.getElementById('fc-treemap');
    treemap.style.display = 'block';
    gsap.fromTo(treemap, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.4, ease: 'power2.out' });

    var leaves = treemap.querySelectorAll('.fc-tm-leaf');
    leaves.forEach(function(leaf) {
        leaf.classList.remove('fc-tm-active', 'fc-tm-dim');
        if (leaf.getAttribute('data-route') === activeRoute) {
            leaf.classList.add('fc-tm-active');
        } else {
            leaf.classList.add('fc-tm-dim');
        }
    });
}

function wizardReset() {
    wizardState.currentStep = '1';
    wizardState.selectedRoute = null;

    // Hide results + reset flowchart (without calling resizeFlowchart)
    document.querySelectorAll('.result-section').forEach(function(el) {
        el.style.display = 'none';
        el.classList.remove('active');
    });
    if (typeof mondaiTl !== 'undefined' && mondaiTl) mondaiTl.kill();
    if (typeof zeroproTl !== 'undefined' && zeroproTl) zeroproTl.kill();
    resetFlowchartHighlight();

    var treemap = document.getElementById('fc-treemap');
    gsap.to(treemap, { opacity: 0, y: -20, duration: 0.3, onComplete: function() {
        treemap.style.display = 'none';
        gsap.set(treemap, { opacity: 1, y: 0 });

        // Reset all wizard steps
        document.querySelectorAll('.fc-wiz-step').forEach(function(s) {
            s.classList.remove('active');
            s.style.display = 'none';
            gsap.set(s, { opacity: 1, x: 0 });
        });
        var first = document.querySelector('.fc-wiz-step[data-step="1"]');
        if (first) { first.classList.add('active'); first.style.display = 'flex'; }
        updateWizardProgress('1');

        var wizard = document.getElementById('fc-wizard');
        wizard.style.display = 'block';
        gsap.fromTo(wizard, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.4, ease: 'power2.out' });
    }});

    // Scroll to flowchart section
    document.getElementById('flowchart').scrollIntoView({ behavior: 'smooth' });
}

function initWizardEvents() {
    var wizard = document.getElementById('fc-wizard');
    if (!wizard) return;

    // Wizard button clicks (event delegation)
    wizard.addEventListener('click', function(e) {
        var btn = e.target.closest('.fc-wiz-btn');
        if (btn) {
            var step = btn.getAttribute('data-step');
            var answer = btn.getAttribute('data-answer');
            var route = btn.getAttribute('data-route');

            if (route) {
                // Terminal step — select route
                wizardSelectRoute(route);
            } else if (answer && WIZARD_NEXT[step] && WIZARD_NEXT[step][answer]) {
                // Navigate to next step
                wizardGoToStep(WIZARD_NEXT[step][answer], 'forward');
            }
            return;
        }

        var back = e.target.closest('.fc-wiz-back');
        if (back) {
            var backTo = back.getAttribute('data-back');
            if (backTo) wizardGoToStep(backTo, 'back');
        }
    });

    // Treemap leaf clicks (event delegation)
    var treemap = document.getElementById('fc-treemap');
    if (treemap) {
        treemap.addEventListener('click', function(e) {
            var leaf = e.target.closest('.fc-tm-leaf');
            if (leaf) {
                var route = leaf.getAttribute('data-route');
                if (route) {
                    wizardState.selectedRoute = route;
                    showTreemap(route);
                    selectRoute(route);
                }
            }
        });
    }
}

/* ===== Flowchart Responsive Zoom ===== */
function resizeFlowchart() {
    var fc = document.querySelector('.flowchart');
    var section = document.querySelector('.flowchart-section');
    if (!fc || !section) return;

    var wizard = document.getElementById('fc-wizard');
    var treemap = document.getElementById('fc-treemap');
    var fcCta = document.getElementById('fc-cta');

    var refWidth = 1300;   // デザイン基準幅（全展開時のコンテンツ幅に合わせる）
    var minScale = 0.5;    // これ以下でウィザード（質問形式）に切替
    var cs = getComputedStyle(section);
    var available = section.clientWidth
        - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);

    var scale = available / refWidth;
    var mobile = scale < minScale;

    // リセット
    fc.classList.remove('fc-mobile');
    fc.style.zoom = '';
    fc.style.width = '';
    fc.style.maxWidth = '100%';
    fc.style.removeProperty('--fc-s');

    if (mobile) {
        // モバイル: flowchart非表示、wizard or treemap表示
        fc.style.display = 'none';
        if (fcCta) fcCta.style.display = 'none';

        if (wizardState.selectedRoute) {
            if (wizard) wizard.style.display = 'none';
            showTreemap(wizardState.selectedRoute);
        } else {
            if (treemap) treemap.style.display = 'none';
            if (wizard) {
                wizard.style.display = 'block';
                gsap.set(wizard, { opacity: 1, y: 0 });
            }
        }
    } else {
        // デスクトップ/タブレット: flowchart表示、wizard/treemap非表示
        fc.style.display = '';
        if (fcCta) fcCta.style.display = '';
        if (wizard) wizard.style.display = 'none';
        if (treemap) treemap.style.display = 'none';

        if (available >= refWidth) {
            // フルサイズ — 変更不要
            return;
        }

        // PC版と同じ比率のまま縮小:
        // --fc-s を 1 に固定し zoom だけでスケーリング
        fc.style.width = refWidth + 'px';
        fc.style.maxWidth = 'none';
        fc.style.setProperty('--fc-s', '1');
        fc.style.zoom = scale;
    }
}

window.addEventListener('resize', resizeFlowchart);

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    setupAnimations();
    initWizardEvents();
    resizeFlowchart();

    // 結果ノードをクリック可能にする
    var resultNodeMap = {
        'fc-r-elearning': 'elearning',
        'fc-r-zeropro': 'zeropro',
        'fc-r-zeropro2': 'zeropro2',
        'fc-r-ytt': 'ytt',
        'fc-r-community': 'community',
        'fc-r-fintokei': 'fintokei'
    };
    Object.keys(resultNodeMap).forEach(function(nodeId) {
        var node = document.getElementById(nodeId);
        if (node) {
            node.style.cursor = 'pointer';
            node.addEventListener('click', function() {
                selectRoute(resultNodeMap[nodeId]);
            });
        }
    });
});
