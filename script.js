/**
 * Visual Square - Design & Printing Studio
 * Interactive JavaScript
 */

/**
 * Language Switcher (EN / KO) - Declared first for global access
 */
window.LanguageSwitcher = {
    currentLang: 'en',

    init: function() {
        var toggles = document.querySelectorAll('.lang-toggle');
        if (!toggles.length) return;

        toggles.forEach(function(toggle) {
            toggle.addEventListener('click', function() {
                window.LanguageSwitcher.switchLang();
            });
        });
    },

    switchLang: function() {
        this.currentLang = this.currentLang === 'en' ? 'ko' : 'en';
        this.applyLanguage();
        this.updateToggles();
    },

    applyLanguage: function() {
        var lang = this.currentLang;
        var elements = document.querySelectorAll('[data-en][data-ko]');

        elements.forEach(function(el) {
            var text = el.getAttribute('data-' + lang);
            if (text) {
                if (text.indexOf('<span') !== -1 || text.indexOf('<br') !== -1) {
                    el.innerHTML = text;
                } else {
                    el.textContent = text;
                }
            }
        });

        document.documentElement.lang = lang === 'ko' ? 'ko' : 'en';
        document.title = lang === 'ko'
            ? 'Visual Square | 디자인 & 프린팅 스튜디오'
            : 'Visual Square | Design & Printing Studio';

        if (window.HeroCopyRotator) {
            window.HeroCopyRotator.setLanguage(lang);
        }
    },

    updateToggles: function() {
        var currentLang = this.currentLang;
        var toggles = document.querySelectorAll('.lang-toggle');
        toggles.forEach(function(toggle) {
            var label = toggle.querySelector('.lang-label');
            if (currentLang === 'ko') {
                toggle.classList.add('active');
                label.textContent = 'EN';
            } else {
                toggle.classList.remove('active');
                label.textContent = 'KR';
            }
        });
    }
};

function initVisualSquareHome() {
    // Initialize all modules
    Loader.init();
    Cursor.init();
    Navigation.init();
    Portfolio.init();
    Stats.init();
    ScrollReveal.init();
    Form.init();
    window.HeroCopyRotator.init();
    window.LanguageSwitcher.init();
}

/**
 * Hero Copy Rotator
 */
window.HeroCopyRotator = {
    title: null,
    currentIndex: 0,
    currentLang: 'en',
    timer: null,
    isReducedMotion: false,
    phrases: {
        en: [
            {
                lines: [
                    ['Design', 'Systems'],
                    ['That', 'Print'],
                    ['Beautifully']
                ],
                accent: 'Print'
            },
            {
                lines: [
                    ['Brands', 'That'],
                    ['Look', 'Good'],
                    ['Everywhere']
                ],
                accent: 'Good'
            },
            {
                lines: [
                    ['Websites,', 'Signs'],
                    ['And', 'Print'],
                    ['That', 'Match']
                ],
                accent: 'Match'
            },
            {
                lines: [
                    ['Visual', 'Systems'],
                    ['For', 'Real'],
                    ['Businesses']
                ],
                accent: 'Real'
            }
        ],
        ko: [
            {
                lines: [
                    ['좋은'],
                    ['브랜드를'],
                    ['만듭니다']
                ],
                accent: '좋은'
            },
            {
                lines: [
                    ['웹과'],
                    ['인쇄를'],
                    ['맞춥니다']
                ],
                accent: '맞춥니다'
            },
            {
                lines: [
                    ['기억나는'],
                    ['비주얼을'],
                    ['설계합니다']
                ],
                accent: '비주얼을'
            },
            {
                lines: [
                    ['로컬'],
                    ['비즈니스를'],
                    ['돕습니다']
                ],
                accent: '로컬'
            }
        ]
    },

    init: function() {
        this.title = document.querySelector('.hero-title');
        if (!this.title) return;

        this.stop();
        this.currentIndex = 0;
        this.currentLang = window.LanguageSwitcher && window.LanguageSwitcher.currentLang === 'ko' ? 'ko' : 'en';
        this.isReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        this.title.classList.remove('is-ready', 'is-changing');
        this.renderPhrase(this.currentIndex);

        setTimeout(function() {
            window.HeroCopyRotator.title.classList.add('is-ready');
        }, this.isReducedMotion ? 0 : 2300);

        this.start();
    },

    start: function() {
        this.stop();
        this.timer = window.setInterval(function() {
            window.HeroCopyRotator.next();
        }, 4200);
    },

    stop: function() {
        if (this.timer) {
            window.clearInterval(this.timer);
            this.timer = null;
        }
    },

    setLanguage: function(lang) {
        if (!this.title) return;

        this.currentLang = lang === 'ko' ? 'ko' : 'en';
        this.currentIndex = 0;
        this.renderPhrase(this.currentIndex);
    },

    next: function() {
        var phraseCount = this.phrases[this.currentLang].length;
        this.currentIndex = (this.currentIndex + 1) % phraseCount;
        this.transitionTo(this.currentIndex);
    },

    transitionTo: function(index) {
        if (!this.title) return;

        if (this.isReducedMotion) {
            this.renderPhrase(index);
            return;
        }

        this.title.classList.add('is-changing');

        window.setTimeout(function() {
            this.renderPhrase(index);
            this.title.classList.remove('is-changing');
        }.bind(this), 360);
    },

    renderPhrase: function(index) {
        var phrase = this.phrases[this.currentLang][index];
        if (!phrase || !this.title) return;

        this.title.setAttribute('aria-label', phrase.lines.map(function(line) {
            return line.join(' ');
        }).join(' '));

        this.title.innerHTML = phrase.lines.map(function(line) {
            return '<span class="title-line">' + line.map(function(word) {
                var classes = word === phrase.accent ? 'title-word accent' : 'title-word';
                return '<span class="' + classes + '">' + word + '</span>';
            }).join(' ') + '</span>';
        }).join('');
    }
};

/**
 * Page Loader
 */
var Loader = {
    init: function() {
        var loader = document.querySelector('.loader');
        if (!loader) return;

        var hideLoader = function() {
            setTimeout(function() {
                loader.classList.add('hidden');
                document.body.style.overflow = '';
            }, 900);
        };

        if (document.readyState === 'complete') {
            hideLoader();
        } else {
            window.addEventListener('load', hideLoader);
        }

        document.body.style.overflow = 'hidden';
    }
};

/**
 * Custom Cursor
 */
var Cursor = {
    cursor: null,
    follower: null,
    mouseX: 0,
    mouseY: 0,
    cursorX: 0,
    cursorY: 0,
    followerX: 0,
    followerY: 0,

    init: function() {
        this.cursor = document.querySelector('.cursor');
        this.follower = document.querySelector('.cursor-follower');

        if (!this.cursor || !this.follower) return;
        if (window.matchMedia('(max-width: 768px)').matches) return;

        document.addEventListener('mousemove', function(e) {
            Cursor.mouseX = e.clientX;
            Cursor.mouseY = e.clientY;
        });

        this.animate();
        this.setupHoverEffects();
    },

    animate: function() {
        this.cursorX += (this.mouseX - this.cursorX) * 0.2;
        this.cursorY += (this.mouseY - this.cursorY) * 0.2;
        this.followerX += (this.mouseX - this.followerX) * 0.1;
        this.followerY += (this.mouseY - this.followerY) * 0.1;

        this.cursor.style.left = this.cursorX + 'px';
        this.cursor.style.top = this.cursorY + 'px';
        this.follower.style.left = this.followerX + 'px';
        this.follower.style.top = this.followerY + 'px';

        requestAnimationFrame(function() { Cursor.animate(); });
    },

    setupHoverEffects: function() {
        var hoverElements = document.querySelectorAll('a, button, .portfolio-item, .service-card');

        hoverElements.forEach(function(el) {
            el.addEventListener('mouseenter', function() {
                document.body.classList.add('cursor-hover');
            });

            el.addEventListener('mouseleave', function() {
                document.body.classList.remove('cursor-hover');
            });
        });
    }
};

/**
 * Navigation
 */
var Navigation = {
    nav: null,
    toggle: null,
    mobileMenu: null,
    links: null,

    init: function() {
        this.nav = document.querySelector('.nav');
        this.toggle = document.querySelector('.nav-toggle');
        this.mobileMenu = document.querySelector('.mobile-menu');
        this.links = document.querySelectorAll('.mobile-link, .nav-link');

        if (!this.nav) return;

        this.setupScroll();
        this.setupMobileMenu();
        this.setupSmoothScroll();
    },

    setupScroll: function() {
        var syncNavState = function() {
            if (!Navigation.nav) return;

            var currentScroll = window.pageYOffset || document.documentElement.scrollTop || 0;
            Navigation.nav.classList.toggle('scrolled', currentScroll > 64);
        };

        syncNavState();
        window.requestAnimationFrame(syncNavState);
        window.addEventListener('load', syncNavState);
        window.addEventListener('hashchange', syncNavState);
        window.addEventListener('scroll', syncNavState, { passive: true });
    },

    setupMobileMenu: function() {
        if (!this.toggle || !this.mobileMenu) return;

        this.toggle.addEventListener('click', function() {
            Navigation.toggle.classList.toggle('active');
            Navigation.mobileMenu.classList.toggle('active');
            document.body.style.overflow = Navigation.mobileMenu.classList.contains('active') ? 'hidden' : '';
        });

        this.mobileMenu.querySelectorAll('.mobile-link').forEach(function(link) {
            link.addEventListener('click', function() {
                Navigation.toggle.classList.remove('active');
                Navigation.mobileMenu.classList.remove('active');
                document.body.style.overflow = '';
            });
        });
    },

    setupSmoothScroll: function() {
        this.links.forEach(function(link) {
            link.addEventListener('click', function(e) {
                var href = link.getAttribute('href');
                if (href && href.startsWith('#')) {
                    e.preventDefault();
                    var target = document.querySelector(href);
                    if (target) {
                        var offset = 100;
                        var targetPosition = target.getBoundingClientRect().top + window.pageYOffset - offset;

                        window.scrollTo({
                            top: targetPosition,
                            behavior: 'smooth'
                        });
                    }
                }
            });
        });
    }
};

/**
 * Portfolio Filter
 */
var Portfolio = {
    filterBtns: null,
    items: null,

    init: function() {
        this.filterBtns = document.querySelectorAll('.filter-btn');
        this.items = document.querySelectorAll('.portfolio-item');

        if (!this.filterBtns.length) return;

        this.filterBtns.forEach(function(btn) {
            btn.addEventListener('click', function() {
                var filter = btn.dataset.filter;
                Portfolio.filter(filter);
                Portfolio.setActiveBtn(btn);
            });
        });
    },

    filter: function(category) {
        this.items.forEach(function(item) {
            var itemCategory = item.dataset.category;

            if (category === 'all' || itemCategory === category) {
                item.classList.remove('hidden');
                item.style.animation = 'fadeInUp 0.6s ease forwards';
            } else {
                item.classList.add('hidden');
            }
        });
    },

    setActiveBtn: function(activeBtn) {
        this.filterBtns.forEach(function(btn) { btn.classList.remove('active'); });
        activeBtn.classList.add('active');
    }
};

/**
 * Stats Counter Animation
 */
var Stats = {
    init: function() {
        var stats = document.querySelectorAll('.stat-number');
        if (!stats.length) return;

        var observer = new IntersectionObserver(function(entries) {
            entries.forEach(function(entry) {
                if (entry.isIntersecting) {
                    Stats.animateCount(entry.target);
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.5 });

        stats.forEach(function(stat) { observer.observe(stat); });
    },

    animateCount: function(element) {
        var target = parseInt(element.dataset.count);
        var duration = 2000;
        var step = target / (duration / 16);
        var current = 0;

        var timer = setInterval(function() {
            current += step;
            if (current >= target) {
                element.textContent = target;
                clearInterval(timer);
            } else {
                element.textContent = Math.floor(current);
            }
        }, 16);
    }
};

/**
 * Scroll Reveal Animation
 */
var ScrollReveal = {
    init: function() {
        var elements = document.querySelectorAll('.service-card, .portfolio-item, .about-content, .about-visual, .contact-info, .contact-form');

        elements.forEach(function(el) { el.classList.add('reveal'); });

        var observer = new IntersectionObserver(function(entries) {
            entries.forEach(function(entry) {
                if (entry.isIntersecting) {
                    entry.target.classList.add('revealed');
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        });

        elements.forEach(function(el) { observer.observe(el); });
    }
};

/**
 * Contact Form
 */
var Form = {
    init: function() {
        var form = document.querySelector('.contact-form');
        if (!form) return;

        form.addEventListener('submit', function(e) {
            e.preventDefault();
            Form.handleSubmit(form);
        });

        var inputs = form.querySelectorAll('input, select, textarea');
        inputs.forEach(function(input) {
            input.addEventListener('focus', function() {
                input.parentElement.classList.add('focused');
            });

            input.addEventListener('blur', function() {
                input.parentElement.classList.remove('focused');
            });
        });
    },

    handleSubmit: function(form) {
        var btn = form.querySelector('button[type="submit"]');
        var btnSpan = btn.querySelector('span');
        var btnSvg = btn.querySelector('svg');
        var originalText = btnSpan.textContent;
        var isKo = window.LanguageSwitcher.currentLang === 'ko';

        btnSpan.textContent = isKo ? '전송 중...' : 'Sending...';
        if (btnSvg) btnSvg.style.display = 'none';
        btn.disabled = true;

        setTimeout(function() {
            btnSpan.textContent = isKo ? '전송 완료!' : 'Message Sent!';
            btn.style.background = '#4CAF50';

            setTimeout(function() {
                btnSpan.textContent = originalText;
                if (btnSvg) btnSvg.style.display = '';
                btn.style.background = '';
                btn.disabled = false;
                form.reset();
            }, 3000);
        }, 2000);
    }
};

/**
 * Parallax Effect for Hero
 */
window.addEventListener('scroll', function() {
    var scrolled = window.pageYOffset;
    var heroContent = document.querySelector('.hero-content');

    if (heroContent && scrolled < window.innerHeight) {
        heroContent.style.transform = 'translateY(' + (scrolled * 0.3) + 'px)';
        heroContent.style.opacity = 1 - (scrolled / window.innerHeight);
    }
});

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initVisualSquareHome);
} else {
    initVisualSquareHome();
}
