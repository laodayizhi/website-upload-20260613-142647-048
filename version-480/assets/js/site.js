(function () {
    const HLS_CDN = 'https://cdn.jsdelivr.net/npm/hls.js@1/dist/hls.min.js';
    let hlsLoaderPromise = null;

    function ready(callback) {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', callback);
        } else {
            callback();
        }
    }

    function loadHlsLibrary() {
        if (window.Hls) {
            return Promise.resolve(window.Hls);
        }

        if (hlsLoaderPromise) {
            return hlsLoaderPromise;
        }

        hlsLoaderPromise = new Promise(function (resolve, reject) {
            const script = document.createElement('script');
            script.src = HLS_CDN;
            script.async = true;
            script.onload = function () {
                if (window.Hls) {
                    resolve(window.Hls);
                } else {
                    reject(new Error('HLS library unavailable'));
                }
            };
            script.onerror = function () {
                reject(new Error('HLS library failed to load'));
            };
            document.head.appendChild(script);
        });

        return hlsLoaderPromise;
    }

    function initHeader() {
        const searchToggle = document.querySelector('[data-search-toggle]');
        const searchPanel = document.querySelector('[data-search-panel]');
        const mobileToggle = document.querySelector('[data-mobile-toggle]');
        const mobilePanel = document.querySelector('[data-mobile-panel]');

        if (searchToggle && searchPanel) {
            searchToggle.addEventListener('click', function () {
                searchPanel.classList.toggle('is-open');
            });
        }

        if (mobileToggle && mobilePanel) {
            mobileToggle.addEventListener('click', function () {
                mobilePanel.classList.toggle('is-open');
                mobileToggle.textContent = mobilePanel.classList.contains('is-open') ? '×' : '☰';
            });
        }
    }

    function initSearchForms() {
        document.querySelectorAll('[data-search-form]').forEach(function (form) {
            form.addEventListener('submit', function (event) {
                const input = form.querySelector('input[name="q"], input[type="search"]');
                const query = input ? input.value.trim() : '';

                if (!query) {
                    event.preventDefault();
                    if (input) {
                        input.focus();
                    }
                }
            });
        });
    }

    function initHeroCarousel() {
        const carousel = document.querySelector('[data-hero-carousel]');
        if (!carousel) {
            return;
        }

        const slides = Array.from(carousel.querySelectorAll('[data-hero-slide]'));
        const dots = Array.from(carousel.querySelectorAll('[data-hero-dot]'));
        const prev = carousel.querySelector('[data-hero-prev]');
        const next = carousel.querySelector('[data-hero-next]');
        let index = 0;
        let timer = null;

        function show(nextIndex) {
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === index);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === index);
            });
        }

        function play() {
            stop();
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5000);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        if (prev) {
            prev.addEventListener('click', function () {
                show(index - 1);
                play();
            });
        }

        if (next) {
            next.addEventListener('click', function () {
                show(index + 1);
                play();
            });
        }

        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                show(Number(dot.dataset.heroDot || 0));
                play();
            });
        });

        carousel.addEventListener('mouseenter', stop);
        carousel.addEventListener('mouseleave', play);
        show(0);
        play();
    }

    function initMovieFilters() {
        document.querySelectorAll('[data-movie-filter]').forEach(function (scope) {
            const textInput = scope.querySelector('[data-filter-text]');
            const yearSelect = scope.querySelector('[data-filter-year]');
            const typeSelect = scope.querySelector('[data-filter-type]');
            const cards = Array.from(scope.querySelectorAll('[data-movie-card]'));
            const empty = scope.querySelector('[data-empty-result]');

            function apply() {
                const text = textInput ? textInput.value.trim().toLowerCase() : '';
                const year = yearSelect ? yearSelect.value : '';
                const type = typeSelect ? typeSelect.value : '';
                let visibleCount = 0;

                cards.forEach(function (card) {
                    const haystack = card.dataset.search || '';
                    const matchesText = !text || haystack.includes(text);
                    const matchesYear = !year || card.dataset.year === year;
                    const matchesType = !type || card.dataset.type === type;
                    const visible = matchesText && matchesYear && matchesType;

                    card.style.display = visible ? '' : 'none';
                    if (visible) {
                        visibleCount += 1;
                    }
                });

                if (empty) {
                    empty.classList.toggle('is-visible', visibleCount === 0);
                }
            }

            [textInput, yearSelect, typeSelect].forEach(function (control) {
                if (control) {
                    control.addEventListener('input', apply);
                    control.addEventListener('change', apply);
                }
            });

            apply();
        });
    }

    function initPlayers() {
        document.querySelectorAll('[data-player]').forEach(function (player) {
            const video = player.querySelector('video');
            const source = player.dataset.source;
            const cover = player.querySelector('[data-player-cover]');
            const loading = player.querySelector('[data-player-loading]');
            const message = player.querySelector('[data-player-message]');
            const controls = player.querySelector('[data-player-controls]');
            const toggle = player.querySelector('[data-player-toggle]');
            const mute = player.querySelector('[data-player-mute]');
            const fullscreen = player.querySelector('[data-player-fullscreen]');
            let hls = null;
            let prepared = false;

            if (!video || !source) {
                return;
            }

            function setLoading(visible) {
                if (loading) {
                    loading.classList.toggle('is-visible', visible);
                }
            }

            function setMessage(text) {
                if (message) {
                    message.textContent = text || '';
                    message.classList.toggle('is-visible', Boolean(text));
                }
            }

            function updateControls() {
                if (toggle) {
                    toggle.textContent = video.paused ? '播放' : '暂停';
                }
                if (mute) {
                    mute.textContent = video.muted ? '取消静音' : '静音';
                }
                if (controls) {
                    controls.classList.add('is-visible');
                }
            }

            function prepare() {
                if (prepared) {
                    return Promise.resolve();
                }

                prepared = true;
                setLoading(true);
                setMessage('');

                if (video.canPlayType('application/vnd.apple.mpegurl')) {
                    video.src = source;
                    return Promise.resolve();
                }

                return loadHlsLibrary().then(function (Hls) {
                    if (!Hls.isSupported()) {
                        throw new Error('当前浏览器不支持 HLS 播放');
                    }

                    hls = new Hls({
                        enableWorker: true,
                        lowLatencyMode: true
                    });

                    hls.loadSource(source);
                    hls.attachMedia(video);
                    hls.on(Hls.Events.ERROR, function (event, data) {
                        if (data && data.fatal) {
                            setMessage('视频加载失败，请稍后重试');
                            setLoading(false);
                        }
                    });
                }).catch(function () {
                    prepared = false;
                    setMessage('播放器初始化失败，请稍后重试');
                });
            }

            function play() {
                prepare().then(function () {
                    if (message && message.textContent) {
                        return;
                    }

                    const playPromise = video.play();
                    if (playPromise && typeof playPromise.then === 'function') {
                        playPromise.catch(function () {
                            setMessage('浏览器阻止了自动播放，请再次点击播放');
                        });
                    }
                    if (cover) {
                        cover.classList.add('is-hidden');
                    }
                    setLoading(false);
                    updateControls();
                });
            }

            function togglePlay() {
                if (video.paused) {
                    play();
                } else {
                    video.pause();
                    updateControls();
                }
            }

            if (cover) {
                cover.addEventListener('click', play);
            }

            if (toggle) {
                toggle.addEventListener('click', togglePlay);
            }

            if (mute) {
                mute.addEventListener('click', function () {
                    video.muted = !video.muted;
                    updateControls();
                });
            }

            if (fullscreen) {
                fullscreen.addEventListener('click', function () {
                    if (document.fullscreenElement) {
                        document.exitFullscreen();
                    } else if (player.requestFullscreen) {
                        player.requestFullscreen();
                    }
                });
            }

            video.addEventListener('click', togglePlay);
            video.addEventListener('play', updateControls);
            video.addEventListener('pause', updateControls);
            video.addEventListener('loadedmetadata', function () {
                setLoading(false);
            });
        });
    }

    function htmlEscape(value) {
        return String(value || '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');
    }

    function cardTemplate(movie) {
        return [
            '<article class="movie-card card">',
            '    <a href="' + htmlEscape(movie.url) + '" aria-label="观看 ' + htmlEscape(movie.title) + '">',
            '        <div class="poster-wrap">',
            '            <img src="' + htmlEscape(movie.cover) + '" alt="' + htmlEscape(movie.title) + '" loading="lazy">',
            '            <span class="poster-badge">' + htmlEscape(movie.year) + '</span>',
            '            <span class="poster-type">' + htmlEscape(movie.type) + '</span>',
            '        </div>',
            '        <div class="movie-card-body">',
            '            <h3>' + htmlEscape(movie.title) + '</h3>',
            '            <p>' + htmlEscape(movie.oneLine) + '</p>',
            '            <div class="movie-meta">',
            '                <span>' + htmlEscape(movie.region) + '</span>',
            '                <span>' + htmlEscape(movie.genre) + '</span>',
            '            </div>',
            '        </div>',
            '    </a>',
            '</article>'
        ].join('');
    }

    function initSearchPage() {
        const results = document.querySelector('[data-search-results]');
        if (!results || !Array.isArray(window.MOVIE_SEARCH_DATA)) {
            return;
        }

        const params = new URLSearchParams(window.location.search);
        const query = (params.get('q') || '').trim();
        const input = document.querySelector('[data-search-page-input]');
        const title = document.querySelector('[data-search-title]');
        const count = document.querySelector('[data-search-count]');

        if (input) {
            input.value = query;
        }

        if (!query) {
            results.innerHTML = '';
            return;
        }

        const words = query.toLowerCase().split(/\s+/).filter(Boolean);
        const matches = window.MOVIE_SEARCH_DATA.filter(function (movie) {
            const haystack = [
                movie.title,
                movie.region,
                movie.type,
                movie.year,
                movie.genre,
                movie.tags,
                movie.oneLine
            ].join(' ').toLowerCase();

            return words.every(function (word) {
                return haystack.includes(word);
            });
        }).slice(0, 120);

        if (title) {
            title.textContent = '“' + query + '”的搜索结果';
        }

        if (count) {
            count.textContent = matches.length ? '找到 ' + matches.length + ' 个相关内容。' : '没有找到相关内容，可尝试更换关键词。';
        }

        results.innerHTML = matches.map(cardTemplate).join('');
    }

    ready(function () {
        initHeader();
        initSearchForms();
        initHeroCarousel();
        initMovieFilters();
        initPlayers();
        initSearchPage();
    });
})();
