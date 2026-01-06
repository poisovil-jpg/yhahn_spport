document.addEventListener('DOMContentLoaded', () => {
    initScrollReveal();
    initNavbarScroll();
    initParticleAnimation();
});

// Scroll Reveal Animation (Intersection Observer)
function initScrollReveal() {
    const revealElements = document.querySelectorAll('.scroll-reveal, .fade-in-up');

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: "0px 0px -50px 0px"
    });

    revealElements.forEach(el => observer.observe(el));
}

// Navbar Background on Scroll
function initNavbarScroll() {
    const navbar = document.getElementById('navbar');

    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.style.boxShadow = "0 4px 15px rgba(0,0,0,0.05)";
        } else {
            navbar.style.boxShadow = "none";
        }
    });
}

// Particle Network Animation
function initParticleAnimation() {
    const container = document.getElementById('global-canvas-container');
    if (!container) return;

    const canvas = document.createElement('canvas');
    container.appendChild(canvas);
    const ctx = canvas.getContext('2d');

    let particles = [];
    let particleCount = 80;
    let connectionDistance = 160;

    let width, height;

    // Party Colors: Blue-ish particles
    // Using a very light blue/white with low opacity
    const particleColor = 'rgba(230, 240, 255, 0.6)';
    const lineColor = 'rgba(230, 240, 255, 0.15)';

    function resize() {
        width = container.offsetWidth;
        height = container.offsetHeight;
        canvas.width = width;
        canvas.height = height;

        // Dynamic adjustment based on screen size
        if (width < 768) {
            particleCount = 25; // Drastically reduced for mobile
            connectionDistance = 80; // Shorten connections
        } else {
            particleCount = 80;
            connectionDistance = 160;
        }
    }

    class Particle {
        constructor() {
            this.x = Math.random() * width;
            this.y = Math.random() * height;
            // Slow, floaty movement
            this.vx = (Math.random() - 0.5) * 0.4;
            this.vy = (Math.random() - 0.5) * 0.4;
            this.size = Math.random() * 2 + 1;
        }

        update() {
            this.x += this.vx;
            this.y += this.vy;

            if (this.x < 0) this.x = width;
            if (this.x > width) this.x = 0;
            if (this.y < 0) this.y = height;
            if (this.y > height) this.y = 0;
        }

        draw() {
            ctx.fillStyle = particleColor;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    function init() {
        resize(); // resize now updates particleCount and connectionDistance
        particles = [];
        for (let i = 0; i < particleCount; i++) {
            particles.push(new Particle());
        }
    }

    function animate() {
        ctx.clearRect(0, 0, width, height);

        for (let i = 0; i < particles.length; i++) {
            particles[i].update();
            particles[i].draw();

            // Draw connections
            for (let j = i; j < particles.length; j++) {
                const dx = particles[i].x - particles[j].x;
                const dy = particles[i].y - particles[j].y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < connectionDistance) {
                    ctx.beginPath();
                    ctx.strokeStyle = lineColor;
                    ctx.lineWidth = 1;
                    ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(particles[j].x, particles[j].y);
                    ctx.stroke();
                }
            }
        }
        requestAnimationFrame(animate);
    }

    window.addEventListener('resize', () => {
        resize();
        init();
    });

    init();
    animate();
}

// Copy to Clipboard Function
function copyToClipboard() {
    const accountText = document.getElementById('accountNum').innerText;

    // Create temporary textarea
    const textarea = document.createElement('textarea');
    textarea.value = accountText;
    document.body.appendChild(textarea);
    textarea.select();

    try {
        document.execCommand('copy');
        showToast("계좌번호가 복사되었습니다.");
    } catch (err) {
        console.error('복사 실패:', err);
        showToast("복사에 실패했습니다. 직접 입력해주세요.");
    }

    document.body.removeChild(textarea);
}

// Toast Notification
function showToast() {
    const toast = document.getElementById('toast');
    toast.classList.add('show');
    toast.classList.remove('hidden');

    setTimeout(() => {
        toast.classList.remove('show');
        toast.classList.add('hidden');
    }, 3000);
}

// Profile Section Toggle
function toggleProfileSection(button) {
    const content = button.nextElementSibling;
    const icon = button.querySelector('.toggle-icon');

    if (content.style.maxHeight) {
        // Collapse
        content.style.maxHeight = null;
        icon.textContent = '+';
        button.classList.remove('active');
    } else {
        // Expand
        content.style.maxHeight = content.scrollHeight + "px";
        icon.textContent = '−';
        button.classList.add('active');
    }
}

// Related News Fetcher
(function () {
    const KEYWORD = "안영호 의원";
    const MAX_ITEMS = 5;
    const REFRESH_INTERVAL = 60000;

    const listEl = document.getElementById("news-list");
    const timeEl = document.getElementById("update-time");

    function loadNews() {
        const rssUrl =
            "https://news.google.com/rss/search?q=" +
            encodeURIComponent(KEYWORD) +
            "&hl=ko&gl=KR&ceid=KR:ko";

        const proxyUrl =
            "https://corsproxy.io/?" + encodeURIComponent(rssUrl);

        fetch(proxyUrl)
            .then(res => res.text())
            .then(text => {
                const parser = new DOMParser();
                const xml = parser.parseFromString(text, "text/xml");
                const items = xml.querySelectorAll("item");

                if (items.length === 0) {
                    listEl.innerHTML = "<li>관련 뉴스가 없습니다.</li>";
                    return;
                }

                listEl.innerHTML = "";

                items.forEach((item, i) => {
                    if (i >= MAX_ITEMS) return;

                    const title = item.querySelector("title").textContent;
                    const link = item.querySelector("link").textContent;

                    const li = document.createElement("li");
                    li.innerHTML = `<a href="${link}" target="_blank" rel="noopener">${title}</a>`;
                    listEl.appendChild(li);
                });

                timeEl.textContent =
                    "마지막 갱신: " + new Date().toLocaleTimeString();
            })
            .catch(() => {
                listEl.innerHTML = "<li>뉴스 로딩 실패</li>";
            });
    }

    // Initial load
    if (listEl) {
        loadNews();
        setInterval(loadNews, REFRESH_INTERVAL);
    }
})();
