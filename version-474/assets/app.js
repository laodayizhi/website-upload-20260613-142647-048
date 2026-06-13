(function () {
    function all(selector, root) {
        return Array.prototype.slice.call((root || document).querySelectorAll(selector));
    }

    function normalize(value) {
        return String(value || '').toLowerCase().trim();
    }

    function setupMenu() {
        var button = document.querySelector('[data-menu-toggle]');
        if (!button) {
            return;
        }
        button.addEventListener('click', function () {
            document.body.classList.toggle('menu-open');
        });
    }

    function setupHero() {
        var hero = document.querySelector('[data-hero]');
        if (!hero) {
            return;
        }
        var slides = all('[data-hero-slide]', hero);
        var dots = all('[data-hero-dot]', hero);
        var prev = hero.querySelector('[data-hero-prev]');
        var next = hero.querySelector('[data-hero-next]');
        var index = 0;
        var timer = null;

        function show(nextIndex) {
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === index);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === index);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5200);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        dots.forEach(function (dot, dotIndex) {
            dot.addEventListener('click', function () {
                show(dotIndex);
                start();
            });
        });

        if (prev) {
            prev.addEventListener('click', function () {
                show(index - 1);
                start();
            });
        }

        if (next) {
            next.addEventListener('click', function () {
                show(index + 1);
                start();
            });
        }

        hero.addEventListener('mouseenter', stop);
        hero.addEventListener('mouseleave', start);
        show(0);
        start();
    }

    function setupFilters() {
        all('[data-filter-zone]').forEach(function (zone) {
            var input = zone.querySelector('[data-filter-input]');
            var typeSelect = zone.querySelector('[data-filter-type]');
            var yearSelect = zone.querySelector('[data-filter-year]');
            var empty = zone.querySelector('[data-empty-state]');
            var cards = all('[data-movie-card]', zone);

            if (!cards.length) {
                return;
            }

            function apply() {
                var q = normalize(input && input.value);
                var type = normalize(typeSelect && typeSelect.value);
                var year = normalize(yearSelect && yearSelect.value);
                var visible = 0;

                cards.forEach(function (card) {
                    var haystack = normalize(card.getAttribute('data-search'));
                    var cardType = normalize(card.getAttribute('data-type'));
                    var cardYear = normalize(card.getAttribute('data-year'));
                    var ok = true;

                    if (q && haystack.indexOf(q) === -1) {
                        ok = false;
                    }
                    if (type && cardType !== type) {
                        ok = false;
                    }
                    if (year && cardYear !== year) {
                        ok = false;
                    }

                    card.classList.toggle('hidden-card', !ok);
                    if (ok) {
                        visible += 1;
                    }
                });

                if (empty) {
                    empty.classList.toggle('is-visible', visible === 0);
                }
            }

            if (input) {
                input.addEventListener('input', apply);
            }
            if (typeSelect) {
                typeSelect.addEventListener('change', apply);
            }
            if (yearSelect) {
                yearSelect.addEventListener('change', apply);
            }

            var params = new URLSearchParams(window.location.search);
            var q = params.get('q');
            if (q && input) {
                input.value = q;
            }
            apply();
        });
    }

    function setupPlayers() {
        all('[data-player]').forEach(function (player) {
            var video = player.querySelector('video');
            var start = player.querySelector('[data-player-start]');
            var source = player.getAttribute('data-src');
            var hls = null;
            var initialized = false;

            function init() {
                if (initialized || !video || !source) {
                    return;
                }
                initialized = true;
                if (window.Hls && window.Hls.isSupported()) {
                    hls = new window.Hls({
                        enableWorker: true,
                        lowLatencyMode: true,
                        backBufferLength: 90
                    });
                    hls.loadSource(source);
                    hls.attachMedia(video);
                } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
                    video.src = source;
                } else {
                    video.src = source;
                }
            }

            function play() {
                init();
                player.classList.add('is-playing');
                var playPromise = video.play();
                if (playPromise && playPromise.catch) {
                    playPromise.catch(function () {});
                }
            }

            if (start) {
                start.addEventListener('click', function (event) {
                    event.preventDefault();
                    play();
                });
            }

            player.addEventListener('click', function (event) {
                if (event.target === video || event.target.closest('button') || event.target.closest('a')) {
                    return;
                }
                play();
            });

            video.addEventListener('play', function () {
                player.classList.add('is-playing');
            });

            window.addEventListener('beforeunload', function () {
                if (hls) {
                    hls.destroy();
                    hls = null;
                }
            });
        });
    }

    document.addEventListener('DOMContentLoaded', function () {
        setupMenu();
        setupHero();
        setupFilters();
        setupPlayers();
    });
}());
