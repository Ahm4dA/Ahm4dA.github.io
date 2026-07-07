'use strict';

/* ============================================================
   MUHAMMAD AHMAD ADNAN — PORTFOLIO ENGINE
   Vanilla JS. No frameworks harmed.
   ============================================================ */

const RM = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const FINE_POINTER = window.matchMedia('(pointer: fine)').matches;

const EMAIL = 'ahmadadnan2003aaa@gmail.com';
const PHONE = '+923010411188';
const GITHUB_URL = 'https://github.com/Ahm4dA';
const LINKEDIN_URL = 'https://www.linkedin.com/in/muhammad-ahmad-adnan-a092ab228';

const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
const clamp = (v, min, max) => Math.min(max, Math.max(min, v));

// One broken module shouldn't take the whole site down
function safe(fn) {
    try { fn(); } catch (err) { console.error('[portfolio]', err); }
}

function escapeHtml(str) {
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

let booted = false;
function bootAfterPreloader() {
    if (booted) return;
    booted = true;
    document.body.classList.remove('loading');
    document.body.classList.add('loaded');
    safe(initReveals);
    safe(initScramble);
    safe(initCounters);
    safe(initRoleRotator);
    safe(initTerminal);
}

document.addEventListener('DOMContentLoaded', () => {
    safe(initNav);
    safe(initScrollProgress);
    safe(initBackToTop);
    safe(initCursor);
    safe(initParticles);
    safe(initMagnetic);
    safe(initTiltAndSpotlight);
    safe(initTimeline);
    safe(initClock);
    safe(initPalette);
    safe(initContactForm);
    safe(initYear);
    safe(consoleBanner);

    // Preloader gates the entrance choreography…
    safe(() => initPreloader(bootAfterPreloader));
    // …but content must never stay hidden if it breaks
    setTimeout(bootAfterPreloader, 4000);
});

/* ============================================================
   PRELOADER
   ============================================================ */
function initPreloader(onDone) {
    const preloader = $('#preloader');
    const fill = $('#preloader-fill');
    const count = $('#preloader-count');
    const line = $('#preloader-line');
    let finished = false;

    const finish = () => {
        if (finished) return;
        finished = true;
        if (preloader) {
            preloader.classList.add('done');
            setTimeout(() => preloader.remove(), 700);
        }
        onDone();
    };

    if (RM || !preloader || !fill) {
        if (preloader) preloader.remove();
        finish();
        return;
    }

    const messages = [
        'booting portfolio_os…',
        'loading neural nets…',
        'compiling experience…',
        'hydrating pixels…',
        'ready.'
    ];

    const t0 = performance.now();
    const DURATION = 1300;

    (function tick(now) {
        const raw = clamp((now - t0) / DURATION, 0, 1);
        const eased = 1 - Math.pow(1 - raw, 3);
        const pct = Math.round(eased * 100);
        fill.style.width = pct + '%';
        count.textContent = pct + '%';
        line.textContent = messages[Math.min(messages.length - 1, Math.floor(raw * messages.length))];
        if (raw < 1) {
            requestAnimationFrame(tick);
        } else {
            setTimeout(finish, 180);
        }
    })(t0);

    // Belt and braces: never trap the user behind the loader
    setTimeout(finish, DURATION + 1500);
}

/* ============================================================
   NAVIGATION — scrolled state, scroll spy, indicator, mobile
   ============================================================ */
function initNav() {
    const nav = $('#site-nav');
    const menu = $('#nav-menu');
    const links = $$('.nav-link', menu);
    const indicator = $('.nav-indicator', menu);
    const hamburger = $('#hamburger');
    const mobileMenu = $('#mobile-menu');
    const sections = links
        .map(l => $(l.getAttribute('href')))
        .filter(Boolean);

    let activeLink = null;

    function moveIndicator(link) {
        if (!indicator || !link || menu.offsetWidth === 0) return;
        indicator.style.opacity = '1';
        indicator.style.width = link.offsetWidth + 'px';
        indicator.style.transform = `translate(${link.offsetLeft}px, -50%)`;
    }

    function hideIndicator() {
        if (indicator) indicator.style.opacity = '0';
    }

    links.forEach(link => {
        link.addEventListener('mouseenter', () => moveIndicator(link));
    });
    menu?.addEventListener('mouseleave', () => {
        activeLink ? moveIndicator(activeLink) : hideIndicator();
    });

    let ticking = false;
    function onScroll() {
        nav.classList.toggle('scrolled', window.scrollY > 30);

        // Scroll spy
        let current = null;
        const probe = window.scrollY + window.innerHeight * 0.35;
        sections.forEach(section => {
            if (section.offsetTop <= probe) current = section.id;
        });
        // Bottom of page → last section wins
        if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4) {
            current = sections[sections.length - 1]?.id;
        }

        let newActive = null;
        links.forEach(link => {
            const match = link.getAttribute('href') === '#' + current;
            link.classList.toggle('active', match);
            if (match) newActive = link;
        });

        if (newActive !== activeLink) {
            activeLink = newActive;
            if (!menu.matches(':hover')) {
                activeLink ? moveIndicator(activeLink) : hideIndicator();
            }
        }
        ticking = false;
    }

    window.addEventListener('scroll', () => {
        if (!ticking) { ticking = true; requestAnimationFrame(onScroll); }
    }, { passive: true });

    window.addEventListener('resize', () => {
        if (activeLink) moveIndicator(activeLink);
    });

    onScroll();

    // Mobile menu
    function closeMobile() {
        mobileMenu.classList.remove('open');
        hamburger.classList.remove('active');
        hamburger.setAttribute('aria-expanded', 'false');
        mobileMenu.setAttribute('aria-hidden', 'true');
        document.body.classList.remove('no-scroll');
    }

    hamburger?.addEventListener('click', () => {
        const open = mobileMenu.classList.toggle('open');
        hamburger.classList.toggle('active', open);
        hamburger.setAttribute('aria-expanded', String(open));
        mobileMenu.setAttribute('aria-hidden', String(!open));
        document.body.classList.toggle('no-scroll', open);
    });

    $$('.mobile-link', mobileMenu).forEach(link => {
        link.addEventListener('click', closeMobile);
    });

    document.addEventListener('keydown', e => {
        if (e.key === 'Escape' && mobileMenu.classList.contains('open')) {
            closeMobile();
            hamburger.focus();
        }
    });
}

/* ============================================================
   SCROLL PROGRESS BAR
   ============================================================ */
function initScrollProgress() {
    const bar = $('#scroll-progress');
    if (!bar) return;
    let ticking = false;

    function update() {
        const max = document.documentElement.scrollHeight - window.innerHeight;
        bar.style.transform = `scaleX(${max > 0 ? window.scrollY / max : 0})`;
        ticking = false;
    }

    window.addEventListener('scroll', () => {
        if (!ticking) { ticking = true; requestAnimationFrame(update); }
    }, { passive: true });
    update();
}

/* ============================================================
   BACK TO TOP
   ============================================================ */
function initBackToTop() {
    const btn = $('#back-to-top');
    if (!btn) return;

    window.addEventListener('scroll', () => {
        btn.classList.toggle('show', window.scrollY > 700);
    }, { passive: true });

    btn.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: RM ? 'auto' : 'smooth' });
    });
}

/* ============================================================
   CUSTOM CURSOR — dot + lerped ring (fine pointers only)
   ============================================================ */
function initCursor() {
    if (!FINE_POINTER || RM) return;

    const dot = document.createElement('div');
    const ring = document.createElement('div');
    dot.className = 'cursor-dot is-hidden';
    ring.className = 'cursor-ring is-hidden';
    document.body.append(dot, ring);
    document.documentElement.classList.add('has-cursor');

    let mx = innerWidth / 2, my = innerHeight / 2;
    let rx = mx, ry = my;

    document.addEventListener('mousemove', e => {
        mx = e.clientX; my = e.clientY;
        dot.style.transform = `translate(${mx}px, ${my}px) translate(-50%, -50%)`;
        dot.classList.remove('is-hidden');
        ring.classList.remove('is-hidden');
    });

    (function follow() {
        rx += (mx - rx) * 0.16;
        ry += (my - ry) * 0.16;
        ring.style.transform = `translate(${rx}px, ${ry}px) translate(-50%, -50%)`;
        requestAnimationFrame(follow);
    })();

    document.addEventListener('mouseover', e => {
        const interactive = e.target.closest('a, button, .chip, .tag, [role="button"], label, summary');
        ring.classList.toggle('is-hover', !!interactive);
        const isText = e.target.closest('input, textarea, select');
        dot.classList.toggle('is-hidden', !!isText);
        ring.classList.toggle('is-hidden', !!isText);
    });

    document.addEventListener('mouseleave', () => {
        dot.classList.add('is-hidden');
        ring.classList.add('is-hidden');
    });
}

/* ============================================================
   NEURAL PARTICLE FIELD — hero canvas
   ============================================================ */
function initParticles() {
    const canvas = $('#hero-canvas');
    const hero = $('.hero');
    if (!canvas || !hero || RM) return;

    const ctx = canvas.getContext('2d');
    const COLORS = ['139, 92, 246', '34, 211, 238'];
    const LINK_DIST = 130;
    const MOUSE_DIST = 180;

    let nodes = [];
    let w = 0, h = 0, dpr = 1;
    let running = true;
    let inView = true;
    let rafId = null;
    const mouse = { x: -9999, y: -9999 };

    function resize() {
        const rect = hero.getBoundingClientRect();
        w = rect.width;
        h = rect.height;
        dpr = Math.min(window.devicePixelRatio || 1, 2);
        canvas.width = w * dpr;
        canvas.height = h * dpr;
        canvas.style.width = w + 'px';
        canvas.style.height = h + 'px';
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        seed();
    }

    function seed() {
        const divisor = FINE_POINTER ? 16000 : 26000;
        const target = clamp(Math.floor((w * h) / divisor), 24, 96);
        nodes = Array.from({ length: target }, () => ({
            x: Math.random() * w,
            y: Math.random() * h,
            vx: (Math.random() - 0.5) * 0.45,
            vy: (Math.random() - 0.5) * 0.45,
            r: 1 + Math.random() * 1.4,
            c: COLORS[Math.random() < 0.6 ? 0 : 1]
        }));
    }

    function step() {
        ctx.clearRect(0, 0, w, h);

        for (const n of nodes) {
            n.x += n.vx;
            n.y += n.vy;
            if (n.x < 0 || n.x > w) n.vx *= -1;
            if (n.y < 0 || n.y > h) n.vy *= -1;
        }

        // Links between close nodes
        for (let i = 0; i < nodes.length; i++) {
            const a = nodes[i];
            for (let j = i + 1; j < nodes.length; j++) {
                const b = nodes[j];
                const dx = a.x - b.x, dy = a.y - b.y;
                const d = Math.hypot(dx, dy);
                if (d < LINK_DIST) {
                    ctx.strokeStyle = `rgba(${a.c}, ${(1 - d / LINK_DIST) * 0.22})`;
                    ctx.lineWidth = 1;
                    ctx.beginPath();
                    ctx.moveTo(a.x, a.y);
                    ctx.lineTo(b.x, b.y);
                    ctx.stroke();
                }
            }

            // Link to the mouse
            const mdx = a.x - mouse.x, mdy = a.y - mouse.y;
            const md = Math.hypot(mdx, mdy);
            if (md < MOUSE_DIST) {
                ctx.strokeStyle = `rgba(34, 211, 238, ${(1 - md / MOUSE_DIST) * 0.35})`;
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.moveTo(a.x, a.y);
                ctx.lineTo(mouse.x, mouse.y);
                ctx.stroke();
            }
        }

        for (const n of nodes) {
            ctx.fillStyle = `rgba(${n.c}, 0.75)`;
            ctx.beginPath();
            ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
            ctx.fill();
        }

        rafId = running && inView ? requestAnimationFrame(step) : null;
    }

    function play() {
        if (rafId === null && running && inView) rafId = requestAnimationFrame(step);
    }

    hero.addEventListener('mousemove', e => {
        const rect = hero.getBoundingClientRect();
        mouse.x = e.clientX - rect.left;
        mouse.y = e.clientY - rect.top;
    });
    hero.addEventListener('mouseleave', () => { mouse.x = -9999; mouse.y = -9999; });

    new IntersectionObserver(entries => {
        inView = entries[0].isIntersecting;
        play();
    }).observe(hero);

    document.addEventListener('visibilitychange', () => {
        running = !document.hidden;
        play();
    });

    let resizeTimer;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(resize, 200);
    });

    resize();
    play();
}

/* ============================================================
   MAGNETIC BUTTONS
   ============================================================ */
function initMagnetic() {
    if (!FINE_POINTER || RM) return;

    $$('.magnetic').forEach(el => {
        el.addEventListener('mousemove', e => {
            const rect = el.getBoundingClientRect();
            const dx = e.clientX - (rect.left + rect.width / 2);
            const dy = e.clientY - (rect.top + rect.height / 2);
            el.style.transform = `translate(${clamp(dx * 0.25, -8, 8)}px, ${clamp(dy * 0.25, -8, 8)}px)`;
        });
        el.addEventListener('mouseleave', () => {
            el.style.transform = '';
        });
    });
}

/* ============================================================
   TILT + SPOTLIGHT — cards follow the mouse
   ============================================================ */
function initTiltAndSpotlight() {
    if (!FINE_POINTER) return;

    $$('.spotlight, .tilt').forEach(card => {
        card.addEventListener('pointermove', e => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            card.style.setProperty('--mx', x + 'px');
            card.style.setProperty('--my', y + 'px');

            if (!RM && card.classList.contains('tilt')) {
                const px = x / rect.width - 0.5;
                const py = y / rect.height - 0.5;
                card.style.setProperty('--ry', (px * 5).toFixed(2) + 'deg');
                card.style.setProperty('--rx', (-py * 5).toFixed(2) + 'deg');
            }
        });

        card.addEventListener('pointerleave', () => {
            card.style.setProperty('--rx', '0deg');
            card.style.setProperty('--ry', '0deg');
        });
    });
}

/* ============================================================
   REVEAL ON SCROLL (+ stagger groups)
   ============================================================ */
function initReveals() {
    const items = $$('[data-reveal]');

    // Stagger children of marked containers
    $$('[data-stagger]').forEach(group => {
        $$('[data-reveal]', group).forEach((el, i) => {
            if (!el.style.getPropertyValue('--d')) {
                el.style.setProperty('--d', (i * 0.08).toFixed(2) + 's');
            }
        });
    });

    // Once the entrance transition ends, strip the reveal styles so they
    // never fight with hover/tilt transforms on the same element.
    function finalize(el) {
        el.removeAttribute('data-reveal');
        el.classList.remove('revealed');
        el.style.removeProperty('--d');
    }

    function reveal(el) {
        el.classList.add('revealed');
        const onEnd = e => {
            if (e.target === el && e.propertyName === 'transform') {
                el.removeEventListener('transitionend', onEnd);
                finalize(el);
            }
        };
        el.addEventListener('transitionend', onEnd);
        setTimeout(() => finalize(el), 2600); // fallback if transitionend never fires
    }

    if (RM || !('IntersectionObserver' in window)) {
        items.forEach(finalize);
        return;
    }

    const io = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            io.unobserve(entry.target);
            reveal(entry.target);
        });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

    // Anything already on screen (the hero on load) reveals immediately —
    // no observer round-trip — so the entrance is deterministic.
    const vh = window.innerHeight;
    items.forEach(el => {
        const rect = el.getBoundingClientRect();
        if (rect.top < vh * 0.92 && rect.bottom > 0) {
            requestAnimationFrame(() => requestAnimationFrame(() => reveal(el)));
        } else {
            io.observe(el);
        }
    });
}

/* ============================================================
   SCRAMBLE-DECODE SECTION TITLES
   ============================================================ */
function initScramble() {
    const CHARS = '!<>-_\\/[]{}—=+*^?#01';
    const titles = $$('[data-scramble]');
    if (RM || titles.length === 0) return;

    function scramble(el) {
        const node = el.firstChild;
        if (!node || node.nodeType !== Node.TEXT_NODE) return;
        const finalText = node.nodeValue;
        const len = finalText.length;
        let frame = 0;
        const totalFrames = Math.max(24, len * 2.4);

        (function tick() {
            frame++;
            const progress = (frame / totalFrames) * len;
            let out = '';
            for (let i = 0; i < len; i++) {
                if (finalText[i] === ' ') { out += ' '; continue; }
                out += i < progress
                    ? finalText[i]
                    : CHARS[Math.floor(Math.random() * CHARS.length)];
            }
            node.nodeValue = out;
            if (progress < len) requestAnimationFrame(tick);
            else node.nodeValue = finalText;
        })();
    }

    const io = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                scramble(entry.target);
                io.unobserve(entry.target);
            }
        });
    }, { threshold: 0.6 });

    titles.forEach(el => io.observe(el));
}

/* ============================================================
   COUNTERS
   ============================================================ */
function initCounters() {
    const counters = $$('[data-count]');
    if (counters.length === 0) return;

    function animate(el) {
        const target = parseInt(el.dataset.count, 10);
        if (isNaN(target)) return;

        if (RM) {
            el.textContent = target.toLocaleString('en-US');
            return;
        }

        const t0 = performance.now();
        const DURATION = 1800;

        (function tick(now) {
            const raw = clamp((now - t0) / DURATION, 0, 1);
            const eased = 1 - Math.pow(1 - raw, 3);
            el.textContent = Math.round(eased * target).toLocaleString('en-US');
            if (raw < 1) requestAnimationFrame(tick);
        })(t0);
    }

    if (RM || !('IntersectionObserver' in window)) {
        counters.forEach(animate);
        return;
    }

    const io = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animate(entry.target);
                io.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });

    counters.forEach(el => io.observe(el));
}

/* ============================================================
   TIMELINE — line draws as you scroll, markers ignite
   ============================================================ */
function initTimeline() {
    const timeline = $('#timeline');
    const progress = $('#timeline-progress');
    const items = $$('.t-item', timeline);
    if (!timeline || !progress) return;

    if (RM) {
        progress.style.transform = 'scaleY(1)';
        items.forEach(item => item.classList.add('lit'));
        return;
    }

    let ticking = false;

    function update() {
        const rect = timeline.getBoundingClientRect();
        const trigger = window.innerHeight * 0.55;
        const p = clamp((trigger - rect.top) / rect.height, 0, 1);
        progress.style.transform = `scaleY(${p})`;

        items.forEach(item => {
            const markerY = item.getBoundingClientRect().top + 30;
            item.classList.toggle('lit', markerY < trigger);
        });
        ticking = false;
    }

    window.addEventListener('scroll', () => {
        if (!ticking) { ticking = true; requestAnimationFrame(update); }
    }, { passive: true });
    window.addEventListener('resize', update);
    update();
}

/* ============================================================
   ROLE ROTATOR — typewriter loop in the hero
   ============================================================ */
function initRoleRotator() {
    const el = $('#role-typed');
    if (!el) return;

    const ROLES = [
        'AI voice agents.',
        'ML pipelines.',
        'chatbots that convert.',
        'full-stack systems.',
        'things that ship.'
    ];

    if (RM) {
        el.textContent = ROLES[0];
        return;
    }

    let roleIdx = 0;
    let charIdx = 0;
    let deleting = false;

    (function loop() {
        const word = ROLES[roleIdx];

        if (!deleting) {
            charIdx++;
            el.textContent = word.slice(0, charIdx);
            if (charIdx === word.length) {
                deleting = true;
                setTimeout(loop, 2100);
                return;
            }
            setTimeout(loop, 55 + Math.random() * 40);
        } else {
            charIdx--;
            el.textContent = word.slice(0, charIdx);
            if (charIdx === 0) {
                deleting = false;
                roleIdx = (roleIdx + 1) % ROLES.length;
                setTimeout(loop, 350);
                return;
            }
            setTimeout(loop, 28);
        }
    })();
}

/* ============================================================
   INTERACTIVE TERMINAL
   ============================================================ */
function initTerminal() {
    const output = $('#term-output');
    const input = $('#term-input');
    const body = $('#terminal-body');
    const terminal = $('#terminal');
    if (!output || !input) return;

    const history = [];
    let historyIdx = -1;

    function print(html, cls = '') {
        const line = document.createElement('div');
        line.className = 'line' + (cls ? ' ' + cls : '');
        line.innerHTML = html;
        output.appendChild(line);
        output.scrollTop = output.scrollHeight;
    }

    function echo(cmd) {
        print(`<span class="t-ok">❯</span> ${escapeHtml(cmd)}`);
    }

    const HELP_ROWS = [
        ['whoami', 'who am I'],
        ['about', 'short bio'],
        ['skills', 'tech I work with'],
        ['projects', 'featured work'],
        ['experience', "where I've worked"],
        ['contact', 'how to reach me'],
        ['socials', 'github & linkedin'],
        ['neofetch', 'system info'],
        ['clear', 'clear the screen'],
        ['sudo hire-me', 'try it ;)']
    ];

    const COMMANDS = {
        help() {
            print('<span class="t-dim">available commands:</span>');
            HELP_ROWS.forEach(([cmd, desc]) => {
                print(`  <span class="t-cy">${cmd.padEnd(14)}</span><span class="t-dim">${desc}</span>`);
            });
        },
        whoami() {
            print('<span class="t-accent">Muhammad Ahmad Adnan</span> — Software Engineer &amp; AI/ML Developer');
            print('<span class="t-dim">currently building AI voice agents @ KeyOB</span>');
        },
        about() {
            print('B.Sc. Software Engineering, FAST-NUCES (2021–2025).');
            print('I ship AI chatbots, voice agents &amp; data pipelines that run');
            print('in production — handling real calls, users and workflows.');
        },
        skills() {
            print('<span class="t-cy">langs</span>      Python · JavaScript · Java · C++ · C#');
            print('<span class="t-cy">ai/ml</span>      TensorFlow · PyTorch · BERT · Deep RL');
            print('<span class="t-cy">cloud</span>      AWS · Bedrock · Docker · MLOps');
            print('<span class="t-cy">web</span>        MERN · Spring Boot · Node.js');
        },
        projects() {
            print('<span class="t-accent">→ AI Voice Agents</span> <span class="t-dim">— AWS Bedrock · Twilio · booking calls end-to-end</span>');
            print('<span class="t-accent">→ HR &amp; Payroll System</span> <span class="t-dim">— 1,200+ users, led a 15-member team</span>');
            print('<span class="t-accent">→ AQI Predictor</span> <span class="t-dim">— LSTM air-quality forecasting</span>');
            print('<span class="t-accent">→ Trading AI Pipeline</span> <span class="t-dim">— Dockerized research environment</span>');
            print('<span class="t-dim">scroll down or run</span> <span class="t-cmd">sudo hire-me</span>');
        },
        experience() {
            print('<span class="t-ok">2024→now</span>  Software Engineer @ KeyOB');
            print('<span class="t-dim">2024</span>      ML Engineer @ Clab AI INC');
            print('<span class="t-dim">2024</span>      Research Assistant @ FAST NUCES');
            print('<span class="t-dim">2024</span>      QA Automation @ Folio3');
            print('<span class="t-dim">2023–24</span>   ML Research Intern @ BioticsAI');
        },
        contact() {
            print(`<span class="t-cy">email</span>     <a href="mailto:${EMAIL}">${EMAIL}</a>`);
            print(`<span class="t-cy">phone</span>     <a href="tel:${PHONE}">+92 301 0411188</a>`);
            print(`<span class="t-cy">linkedin</span>  <a href="${LINKEDIN_URL}" target="_blank" rel="noopener">muhammad-ahmad-adnan</a>`);
        },
        socials() {
            print(`<span class="t-cy">github</span>    <a href="${GITHUB_URL}" target="_blank" rel="noopener">github.com/Ahm4dA</a>`);
            print(`<span class="t-cy">linkedin</span>  <a href="${LINKEDIN_URL}" target="_blank" rel="noopener">linkedin.com/in/muhammad-ahmad-adnan</a>`);
        },
        neofetch() {
            print(
                `<pre><span class="t-accent"> __  __   ___</span>     <span class="t-cy">ahmad</span>@<span class="t-cy">portfolio</span>
<span class="t-accent">|  \\/  | / _ \\</span>    ─────────────────
<span class="t-accent">| |\\/| || |_| |</span>   <span class="t-cy">os</span>      PortfolioOS 2.0
<span class="t-accent">|_|  |_||_| |_|</span>   <span class="t-cy">role</span>    SWE @ KeyOB
                  <span class="t-cy">uptime</span>  2+ yrs in production
                  <span class="t-cy">stack</span>   py · js · aws · ml</pre>`
            );
        },
        ls() {
            print('<span class="t-cy">about.md</span>  <span class="t-cy">projects/</span>  <span class="t-cy">skills.json</span>  <span class="t-cy">contact.txt</span>  <span class="t-err">secrets/</span> <span class="t-dim">(permission denied)</span>');
        },
        pwd() {
            print('/home/ahmad/portfolio');
        },
        date() {
            print(new Date().toString());
        },
        clear() {
            output.innerHTML = '';
        }
    };

    function hireMe() {
        print('<span class="t-dim">[sudo] password for recruiter:</span> ********');
        setTimeout(() => {
            print('<span class="t-ok">✓ access granted</span>');
            setTimeout(() => {
                print('<span class="t-dim">launching contact form…</span>');
                $('#contact')?.scrollIntoView({ behavior: RM ? 'auto' : 'smooth' });
                showToast('Excellent choice 😄 — the form is right there.', 'success');
            }, 500);
        }, 600);
    }

    function run(raw) {
        const cmd = raw.trim();
        if (!cmd) return;
        echo(cmd);

        const lower = cmd.toLowerCase();

        if (/^sudo\s+hire[- ]?me$/.test(lower) || lower === 'hire-me' || lower === 'hire me') {
            hireMe();
        } else if (lower.startsWith('sudo')) {
            print('<span class="t-err">recruiter is not in the sudoers file. this incident will be reported.</span>');
            print('<span class="t-dim">(unless you try</span> <span class="t-cmd">sudo hire-me</span><span class="t-dim">)</span>');
        } else if (lower.startsWith('echo ')) {
            print(escapeHtml(cmd.slice(5)));
        } else if (COMMANDS[lower]) {
            COMMANDS[lower]();
        } else {
            print(`<span class="t-err">zsh: command not found: ${escapeHtml(cmd)}</span> <span class="t-dim">— try</span> <span class="t-cmd">help</span>`);
        }
    }

    input.addEventListener('keydown', e => {
        if (e.key === 'Enter') {
            const value = input.value;
            if (value.trim()) {
                history.push(value);
                historyIdx = history.length;
            }
            input.value = '';
            run(value);
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            if (history.length && historyIdx > 0) {
                historyIdx--;
                input.value = history[historyIdx];
            }
        } else if (e.key === 'ArrowDown') {
            e.preventDefault();
            if (historyIdx < history.length - 1) {
                historyIdx++;
                input.value = history[historyIdx];
            } else {
                historyIdx = history.length;
                input.value = '';
            }
        }
    });

    body.addEventListener('click', () => {
        if (!window.getSelection()?.toString()) input.focus({ preventScroll: true });
    });

    // Expose for the command palette
    window.__focusTerminal = () => {
        $('#home')?.scrollIntoView({ behavior: RM ? 'auto' : 'smooth' });
        setTimeout(() => {
            input.focus({ preventScroll: true });
            terminal.classList.add('flash');
            setTimeout(() => terminal.classList.remove('flash'), 1400);
        }, RM ? 0 : 650);
    };

    // Boot sequence
    const bootLines = [
        () => print(`<span class="t-dim">Last login: ${new Date().toDateString()} on ttys001</span>`),
        () => print('<span class="t-ok">❯</span> <span class="t-cy">whoami</span>'),
        () => print('<span class="t-accent">Muhammad Ahmad Adnan</span> — Software Engineer &amp; AI/ML Developer'),
        () => print('<span class="t-dim">currently building AI voice agents @ KeyOB</span>'),
        () => print('type <span class="t-cmd">help</span> to explore')
    ];

    if (RM) {
        bootLines.forEach(fn => fn());
        return;
    }

    bootLines.forEach((fn, i) => setTimeout(fn, 500 + i * 340));
}

/* ============================================================
   COMMAND PALETTE (Ctrl/⌘ + K)
   ============================================================ */
function initPalette() {
    const palette = $('#palette');
    const inputEl = $('#palette-input');
    const listEl = $('#palette-list');
    if (!palette || !inputEl || !listEl) return;

    const isMac = /mac|iphone|ipad/i.test(navigator.platform || navigator.userAgent);
    const kbdLabel = isMac ? '⌘K' : 'Ctrl K';
    const kbdEl = $('#palette-kbd');
    const hintEl = $('#kbd-hint-key');
    if (kbdEl) kbdEl.textContent = kbdLabel;
    if (hintEl) hintEl.textContent = kbdLabel;

    function goTo(hash) {
        close();
        $(hash)?.scrollIntoView({ behavior: RM ? 'auto' : 'smooth' });
    }

    function copyEmail() {
        close();
        const done = () => showToast('Email copied to clipboard', 'success');
        if (navigator.clipboard?.writeText) {
            navigator.clipboard.writeText(EMAIL).then(done).catch(() => fallbackCopy(EMAIL, done));
        } else {
            fallbackCopy(EMAIL, done);
        }
    }

    function fallbackCopy(text, done) {
        const tmp = document.createElement('textarea');
        tmp.value = text;
        tmp.style.position = 'fixed';
        tmp.style.opacity = '0';
        document.body.appendChild(tmp);
        tmp.select();
        try { document.execCommand('copy'); done(); } catch (e) { /* ignore */ }
        tmp.remove();
    }

    const ITEMS = [
        { group: 'Navigate', icon: 'fas fa-house', label: 'Home', hint: '00', keywords: 'top start hero', run: () => goTo('#home') },
        { group: 'Navigate', icon: 'fas fa-user', label: 'About', hint: '01', keywords: 'bio education stats', run: () => goTo('#about') },
        { group: 'Navigate', icon: 'fas fa-briefcase', label: 'Experience', hint: '02', keywords: 'work career jobs timeline', run: () => goTo('#experience') },
        { group: 'Navigate', icon: 'fas fa-folder-open', label: 'Projects', hint: '03', keywords: 'work portfolio built', run: () => goTo('#projects') },
        { group: 'Navigate', icon: 'fas fa-layer-group', label: 'Skills', hint: '04', keywords: 'tech stack toolbox', run: () => goTo('#skills') },
        { group: 'Navigate', icon: 'fas fa-paper-plane', label: 'Contact', hint: '05', keywords: 'email message reach', run: () => goTo('#contact') },
        { group: 'Actions', icon: 'fas fa-copy', label: 'Copy email address', keywords: 'clipboard mail', run: copyEmail },
        { group: 'Actions', icon: 'fas fa-envelope', label: 'Send me an email', keywords: 'mail compose', run: () => { close(); window.location.href = 'mailto:' + EMAIL; } },
        { group: 'Actions', icon: 'fas fa-phone', label: 'Call me', keywords: 'phone dial', run: () => { close(); window.location.href = 'tel:' + PHONE; } },
        { group: 'Actions', icon: 'fas fa-terminal', label: 'Play with the terminal', keywords: 'console commands fun', run: () => { close(); window.__focusTerminal?.(); } },
        { group: 'Links', icon: 'fab fa-github', label: 'Open GitHub', keywords: 'code repos', run: () => { close(); window.open(GITHUB_URL, '_blank', 'noopener'); } },
        { group: 'Links', icon: 'fab fa-linkedin-in', label: 'Open LinkedIn', keywords: 'connect network', run: () => { close(); window.open(LINKEDIN_URL, '_blank', 'noopener'); } }
    ];

    let filtered = ITEMS;
    let selected = 0;

    function render() {
        listEl.innerHTML = '';
        if (filtered.length === 0) {
            listEl.innerHTML = '<div class="palette-empty">No results. Try “projects” or “email”.</div>';
            return;
        }

        let lastGroup = null;
        filtered.forEach((item, i) => {
            if (item.group !== lastGroup) {
                lastGroup = item.group;
                const title = document.createElement('div');
                title.className = 'palette-group-title';
                title.textContent = item.group;
                listEl.appendChild(title);
            }
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'palette-item' + (i === selected ? ' selected' : '');
            btn.innerHTML = `<i class="${item.icon}" aria-hidden="true"></i><span>${item.label}</span>` +
                (item.hint ? `<span class="pi-hint mono">${item.hint}</span>` : '');
            btn.addEventListener('click', item.run);
            btn.addEventListener('mousemove', () => {
                if (selected !== i) { selected = i; render(); }
            });
            listEl.appendChild(btn);
        });

        listEl.querySelector('.palette-item.selected')?.scrollIntoView({ block: 'nearest' });
    }

    function filter(query) {
        const q = query.trim().toLowerCase();
        filtered = q
            ? ITEMS.filter(it => (it.label + ' ' + it.group + ' ' + (it.keywords || '')).toLowerCase().includes(q))
            : ITEMS;
        selected = 0;
        render();
    }

    function open() {
        palette.hidden = false;
        document.body.classList.add('no-scroll');
        inputEl.value = '';
        filter('');
        setTimeout(() => inputEl.focus(), 30);
    }

    function close() {
        palette.hidden = true;
        document.body.classList.remove('no-scroll');
    }

    function toggle() {
        palette.hidden ? open() : close();
    }

    document.addEventListener('keydown', e => {
        if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
            e.preventDefault();
            toggle();
            return;
        }
        if (palette.hidden) return;

        if (e.key === 'Escape') {
            close();
        } else if (e.key === 'ArrowDown' && filtered.length) {
            e.preventDefault();
            selected = (selected + 1) % filtered.length;
            render();
        } else if (e.key === 'ArrowUp' && filtered.length) {
            e.preventDefault();
            selected = (selected - 1 + filtered.length) % filtered.length;
            render();
        } else if (e.key === 'Enter') {
            e.preventDefault();
            filtered[selected]?.run();
        }
    });

    inputEl.addEventListener('input', () => filter(inputEl.value));
    $('#palette-open')?.addEventListener('click', open);
    $('#kbd-hint')?.addEventListener('click', open);
    $$('[data-palette-close]', palette).forEach(el => el.addEventListener('click', close));
}

/* ============================================================
   LIVE CLOCK (PKT)
   ============================================================ */
function initClock() {
    const el = $('#pk-time');
    if (!el) return;

    const fmt = new Intl.DateTimeFormat('en-GB', {
        timeZone: 'Asia/Karachi',
        hour: '2-digit', minute: '2-digit', second: '2-digit',
        hour12: false
    });

    function update() { el.textContent = fmt.format(new Date()); }
    update();
    setInterval(update, 1000);
}

/* ============================================================
   CONTACT FORM (Formspree) + validation
   ============================================================ */
function initContactForm() {
    const form = $('#contact-form');
    if (!form) return;

    const submitBtn = $('#form-submit');
    const label = $('.btn-label', submitBtn);
    const icon = $('i', submitBtn);

    const fields = $$('input:not(.gotcha), textarea', form);
    fields.forEach(field => {
        field.addEventListener('blur', () => validateField(field));
        field.addEventListener('input', () => {
            if (field.classList.contains('invalid')) validateField(field);
        });
    });

    form.addEventListener('submit', async e => {
        e.preventDefault();

        const allValid = fields.map(f => validateField(f)).every(Boolean);
        if (!allValid) {
            showToast('Please fix the highlighted fields.', 'error');
            return;
        }

        setBtnState('sending', 'Sending…');

        try {
            const response = await fetch(form.action, {
                method: 'POST',
                body: new FormData(form),
                headers: { 'Accept': 'application/json' }
            });
            if (!response.ok) throw new Error('Formspree error ' + response.status);

            setBtnState('success', 'Message sent!');
            form.reset();
            fields.forEach(f => f.classList.remove('valid', 'invalid'));
            showToast('Message sent successfully — I\'ll get back to you soon!', 'success');
        } catch (err) {
            setBtnState('error', 'Failed to send');
            showToast('Sending failed. Email me directly at ' + EMAIL, 'error');
        }

        setTimeout(() => setBtnState('', 'Send message'), 3200);
    });

    function setBtnState(state, text) {
        submitBtn.classList.remove('sending', 'success', 'error');
        if (state) submitBtn.classList.add(state);
        label.textContent = text;
        if (icon) {
            icon.className = state === 'sending' ? 'spinner'
                : state === 'success' ? 'fas fa-check'
                : state === 'error' ? 'fas fa-triangle-exclamation'
                : 'fas fa-paper-plane';
        }
        submitBtn.disabled = state === 'sending';
    }
}

function validateField(field) {
    const value = field.value.trim();
    let message = '';

    if (field.hasAttribute('required') && !value) {
        message = 'This field is required';
    } else if (field.type === 'email' && value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
        message = 'Enter a valid email address';
    }

    const wrapper = field.closest('.field');
    wrapper?.querySelector('.error-message')?.remove();

    if (message) {
        field.classList.remove('valid');
        field.classList.add('invalid');
        field.setAttribute('aria-invalid', 'true');
        const err = document.createElement('div');
        err.className = 'error-message';
        err.textContent = message;
        wrapper?.appendChild(err);
        return false;
    }

    field.classList.remove('invalid');
    if (value) field.classList.add('valid');
    field.removeAttribute('aria-invalid');
    return true;
}

/* ============================================================
   TOASTS
   ============================================================ */
function showToast(message, type = 'info') {
    const root = $('#toast-root');
    if (!root) return;

    const icons = {
        success: 'fas fa-circle-check',
        error: 'fas fa-circle-exclamation',
        info: 'fas fa-circle-info'
    };

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.setAttribute('role', 'status');
    toast.innerHTML = `<i class="${icons[type] || icons.info}" aria-hidden="true"></i><span></span>`;
    toast.querySelector('span').textContent = message;
    root.appendChild(toast);

    requestAnimationFrame(() => requestAnimationFrame(() => toast.classList.add('show')));

    setTimeout(() => {
        toast.classList.add('hide');
        setTimeout(() => toast.remove(), 450);
    }, 4500);
}

/* ============================================================
   MISC
   ============================================================ */
function initYear() {
    const el = $('#year');
    if (el) el.textContent = new Date().getFullYear();
}

function consoleBanner() {
    console.log(
        '%c👋 Curious about the code?%c\nThis site is hand-built with vanilla HTML/CSS/JS.\nLet\'s talk → ' + EMAIL,
        'font-size:14px;font-weight:bold;color:#8b5cf6;',
        'font-size:12px;color:#22d3ee;'
    );
}
