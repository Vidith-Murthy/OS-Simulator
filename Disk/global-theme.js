// ── Shared Global Theme Scripts for Disk pages ──

// Loader
window.addEventListener('load', function () {
    setTimeout(function () {
        const lw = document.querySelector('.loader-wrapper');
        if (lw) {
            lw.style.opacity = '0';
            lw.style.visibility = 'hidden';
        }
    }, 1200);
});

// Particles
if (typeof particlesJS !== 'undefined') {
    particlesJS("particles-js", {
        "particles": {
            "number": { "value": 30, "density": { "enable": true, "value_area": 1200 } },
            "color": { "value": "#e03030" },
            "shape": { "type": "circle" },
            "opacity": { "value": 0.15, "random": true, "anim": { "enable": true, "speed": 0.5, "opacity_min": 0.03, "sync": false } },
            "size": { "value": 1.5, "random": true },
            "line_linked": { "enable": true, "distance": 180, "color": "#e03030", "opacity": 0.06, "width": 1 },
            "move": { "enable": true, "speed": 0.4, "direction": "none", "random": true, "straight": false, "out_mode": "out" }
        },
        "interactivity": {
            "detect_on": "canvas",
            "events": { "onhover": { "enable": true, "mode": "grab" }, "onclick": { "enable": false }, "resize": true },
            "modes": { "grab": { "distance": 140, "line_linked": { "opacity": 0.2 } } }
        },
        "retina_detect": true
    });
}

// Nav scroll
window.addEventListener('scroll', function () {
    const nav = document.querySelector('nav');
    if (nav) nav.classList.toggle('scrolled', window.scrollY > 50);

    const btt = document.querySelector('.back-to-top');
    if (btt) btt.classList.toggle('visible', window.scrollY > 300);
});

// Back to top
const btt = document.querySelector('.back-to-top');
if (btt) btt.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

// Hamburger
const hamburger = document.querySelector('.hamburger');
const navMenu = document.querySelector('nav ul');
if (hamburger && navMenu) {
    hamburger.addEventListener('click', function () {
        hamburger.classList.toggle('active');
        navMenu.classList.toggle('active');
    });
}

// Mobile dropdown toggle
document.querySelectorAll('.dropdown').forEach(d => {
    const btn = d.querySelector('.button');
    if (btn) {
        btn.addEventListener('click', function (e) {
            if (window.innerWidth <= 768) {
                e.stopPropagation();
                d.classList.toggle('active');
            }
        });
    }
});

// GSAP Animations
if (typeof gsap !== 'undefined') {
    gsap.from('h1', { opacity: 0, y: 30, duration: 0.8, delay: 0.3, ease: "power3.out" });

    if (typeof ScrollTrigger !== 'undefined') {
        gsap.registerPlugin(ScrollTrigger);

        gsap.utils.toArray('.content, .simulation-container, .info-card').forEach((el) => {
            gsap.from(el, {
                scrollTrigger: { trigger: el, start: "top bottom-=80", toggleActions: "play none none none" },
                y: 30,
                opacity: 0,
                duration: 0.7,
                ease: "power3.out"
            });
        });
    }
}

// Plotly Dark Theme - Apply dark background to all charts
(function() {
    function applyDarkTheme() {
        var charts = document.querySelectorAll('.chart-container > div, #seekChart');
        charts.forEach(function(el) {
            if (el && el._fullLayout) {
                Plotly.relayout(el, {
                    paper_bgcolor: '#0a0a0a',
                    plot_bgcolor: '#111111',
                    'font.color': '#e8e8e8',
                    'font.family': 'Syne, sans-serif',
                    'xaxis.gridcolor': 'rgba(224,48,48,0.1)',
                    'xaxis.linecolor': 'rgba(224,48,48,0.2)',
                    'xaxis.zerolinecolor': 'rgba(224,48,48,0.15)',
                    'yaxis.gridcolor': 'rgba(224,48,48,0.1)',
                    'yaxis.linecolor': 'rgba(224,48,48,0.2)',
                    'yaxis.zerolinecolor': 'rgba(224,48,48,0.15)'
                });
            }
        });
    }

    // Monitor for Plotly chart creation using MutationObserver
    var observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(m) {
            if (m.addedNodes.length > 0) {
                setTimeout(applyDarkTheme, 100);
            }
        });
    });

    var seekChart = document.getElementById('seekChart');
    if (seekChart) {
        observer.observe(seekChart, { childList: true, subtree: true });
    }

    // Also run on any Plotly.react / newPlot calls
    document.addEventListener('plotly_afterplot', applyDarkTheme);

    // Periodic fallback check
    setInterval(function() {
        var charts = document.querySelectorAll('.js-plotly-plot');
        if (charts.length > 0) {
            applyDarkTheme();
        }
    }, 2000);
})();
