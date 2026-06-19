/* ============================================================
   Encantos da Lua — script.js
   Tema claro/escuro, modais, menu mobile, scroll dots, revelação
============================================================ */

(function () {
    'use strict';

    /* ====== ELEMENTOS ====== */
    var root = document.documentElement;
    var header = document.getElementById('header-principal');
    var scrollDots = document.getElementById('scroll-dots');
    var btnTopo = document.getElementById('btn-voltar-topo');
    var waBtn = document.getElementById('wa-float-btn');
    var dotLinks = document.querySelectorAll('.scroll-dot[href^="#"]');
    var navToggle = document.getElementById('nav-toggle');
    var navPrincipal = document.getElementById('nav-principal');
    var themeToggle = document.getElementById('theme-toggle');
    var themeTransition = document.getElementById('theme-transition');

    var lastScrollY = 0;
    var scrollThreshold = 280;
    var headerVisible = true;

    var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    /* ====== TEMA CLARO / ESCURO ====== */
    function temaAtual() {
        return root.getAttribute('data-theme') === 'light' ? 'light' : 'dark';
    }

    function atualizarAriaToggle(tema) {
        if (!themeToggle) return;
        var indoPara = tema === 'dark' ? 'claro' : 'escuro';
        themeToggle.setAttribute('aria-label', 'Alternar para tema ' + indoPara);
        themeToggle.setAttribute('aria-pressed', tema === 'light' ? 'true' : 'false');
    }

    atualizarAriaToggle(temaAtual());

    function aplicarTema(novoTema) {
        root.setAttribute('data-theme', novoTema);
        atualizarAriaToggle(novoTema);
    }

    function alternarTema() {
        var atual = temaAtual();
        var proximo = atual === 'dark' ? 'light' : 'dark';

        if (reduceMotion || !themeTransition || typeof themeToggle.getBoundingClientRect !== 'function') {
            aplicarTema(proximo);
            return;
        }

        var rect = themeToggle.getBoundingClientRect();
        var x = rect.left + rect.width / 2;
        var y = rect.top + rect.height / 2;
        var raio = Math.hypot(window.innerWidth, window.innerHeight);

        themeTransition.style.setProperty('--x', x + 'px');
        themeTransition.style.setProperty('--y', y + 'px');
        themeTransition.style.setProperty('--r', raio + 'px');

        themeTransition.classList.remove('is-dark', 'is-light', 'expand', 'fade');
        themeTransition.classList.add(proximo === 'dark' ? 'is-dark' : 'is-light');

        /* força reflow antes de iniciar a transição */
        void themeTransition.offsetWidth;

        function aoExpandir(evento) {
            if (evento.propertyName !== 'clip-path' && evento.propertyName !== '-webkit-clip-path') return;
            themeTransition.removeEventListener('transitionend', aoExpandir);
            aplicarTema(proximo);

            requestAnimationFrame(function () {
                themeTransition.classList.add('fade');
            });

            themeTransition.addEventListener('transitionend', function aoSumir(ev2) {
                if (ev2.propertyName !== 'opacity') return;
                themeTransition.removeEventListener('transitionend', aoSumir);
                themeTransition.classList.remove('expand', 'fade');
            });
        }

        themeTransition.addEventListener('transitionend', aoExpandir);
        themeTransition.classList.add('expand');
    }

    if (themeToggle) {
        themeToggle.addEventListener('click', alternarTema);
    }

    /* ====== MENU MOBILE ====== */
    if (navToggle && navPrincipal) {
        navToggle.addEventListener('click', function () {
            var aberto = navPrincipal.classList.toggle('aberto');
            navToggle.setAttribute('aria-expanded', aberto ? 'true' : 'false');
            navToggle.innerHTML = aberto ? '<i class="fa-solid fa-xmark"></i>' : '<i class="fa-solid fa-bars"></i>';
        });

        navPrincipal.querySelectorAll('a').forEach(function (link) {
            link.addEventListener('click', function () {
                navPrincipal.classList.remove('aberto');
                navToggle.setAttribute('aria-expanded', 'false');
                navToggle.innerHTML = '<i class="fa-solid fa-bars"></i>';
            });
        });
    }

    /* ====== MODAIS ====== */
    window.abrirModal = function (titulo, texto, link, iconeClasse) {
        document.getElementById('modal-titulo').innerText = titulo;
        document.getElementById('modal-texto').innerText = texto;
        document.getElementById('modal-link').href = link;
        var icone = document.getElementById('modal-icone-i');
        if (icone && iconeClasse) { icone.className = iconeClasse; }
        document.getElementById('modal-overlay').classList.add('aberto');
    };

    window.fecharModal = function (evento) {
        if (evento.target.id === 'modal-overlay' || evento.target.classList.contains('btn-fechar')) {
            document.getElementById('modal-overlay').classList.remove('aberto');
        }
    };

    window.abrirModalContatos = function (evento) {
        evento.preventDefault();
        document.getElementById('modal-contatos').classList.add('aberto');
    };

    window.fecharModalContatos = function (evento) {
        if (evento.target.id === 'modal-contatos' || evento.target.classList.contains('btn-fechar')) {
            document.getElementById('modal-contatos').classList.remove('aberto');
        }
    };

    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') {
            document.getElementById('modal-overlay').classList.remove('aberto');
            document.getElementById('modal-contatos').classList.remove('aberto');
        }
    });

    /* ====== ESTRELAS DECORATIVAS DO HERO ====== */
    var camposEstrelas = document.getElementById('hero-estrelas');
    if (camposEstrelas && !reduceMotion) {
        var totalEstrelas = window.innerWidth < 640 ? 18 : 34;
        var frag = document.createDocumentFragment();
        for (var i = 0; i < totalEstrelas; i++) {
            var estrela = document.createElement('span');
            estrela.style.top = Math.random() * 100 + '%';
            estrela.style.left = Math.random() * 100 + '%';
            estrela.style.animationDelay = (Math.random() * 3.6).toFixed(2) + 's';
            estrela.style.animationDuration = (2.6 + Math.random() * 2.4).toFixed(2) + 's';
            frag.appendChild(estrela);
        }
        camposEstrelas.appendChild(frag);
    }

    /* ====== SCROLL: HEADER + DOTS + WA ====== */
    function onScroll() {
        var scrollY = window.scrollY || window.pageYOffset;

        if (scrollY > 250) {
            scrollDots.classList.add('visivel');
            waBtn.classList.add('visivel');
        } else {
            scrollDots.classList.remove('visivel');
            waBtn.classList.remove('visivel');
        }

        if (scrollY > scrollThreshold && scrollY > lastScrollY) {
            if (headerVisible) {
                header.classList.add('header-escondido');
                headerVisible = false;
            }
        } else if (scrollY < scrollThreshold || scrollY < lastScrollY) {
            if (!headerVisible) {
                header.classList.remove('header-escondido');
                headerVisible = true;
            }
        }

        var sections = document.querySelectorAll('main section[id]');
        var currentId = '';
        sections.forEach(function (sec) {
            var top = sec.offsetTop - 200;
            if (scrollY >= top) {
                currentId = sec.getAttribute('id');
            }
        });

        dotLinks.forEach(function (dot) {
            dot.classList.remove('ativo');
            if (dot.getAttribute('href') === '#' + currentId) {
                dot.classList.add('ativo');
            }
        });

        var headerLinks = document.querySelectorAll('header nav a[href^="#"]');
        headerLinks.forEach(function (link) {
            link.classList.remove('ativo');
            if (link.getAttribute('href') === '#' + currentId) {
                link.classList.add('ativo');
            }
        });

        lastScrollY = scrollY;
    }

    if (btnTopo) {
        btnTopo.addEventListener('click', function () {
            window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
        });
    }

    function smoothScrollLinks(selector) {
        var links = document.querySelectorAll(selector);
        links.forEach(function (link) {
            link.addEventListener('click', function (e) {
                var href = this.getAttribute('href');
                if (!href || href.charAt(0) !== '#' || href.length < 2) return;
                var target = document.querySelector(href);
                if (target) {
                    e.preventDefault();
                    target.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
                }
            });
        });
    }

    smoothScrollLinks('.scroll-dot[href^="#"]');
    smoothScrollLinks('header nav a[href^="#"]');

    /* ====== INTERSECTION OBSERVER — REVELAR ====== */
    var observerOptions = { root: null, rootMargin: '0px 0px -60px 0px', threshold: 0.12 };

    var revealObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
            if (entry.isIntersecting) {
                entry.target.classList.add('revelado');
                revealObserver.unobserve(entry.target);
            }
        });
    }, observerOptions);

    var elementosRevelar = document.querySelectorAll('.revelar, .revelar-esquerda, .revelar-direita, .revelar-escala');
    elementosRevelar.forEach(function (el) { revealObserver.observe(el); });

    /* ====== SCROLL LISTENER ====== */
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

})();
