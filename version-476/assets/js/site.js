(function () {
    const menuButton = document.querySelector('[data-menu-toggle]');
    const mobileMenu = document.querySelector('[data-mobile-menu]');

    if (menuButton && mobileMenu) {
        menuButton.addEventListener('click', function () {
            mobileMenu.classList.toggle('is-open');
        });
    }

    const hero = document.querySelector('[data-hero]');

    if (hero) {
        const slides = Array.from(hero.querySelectorAll('[data-hero-slide]'));
        const dots = Array.from(hero.querySelectorAll('[data-hero-dot]'));
        let activeIndex = 0;

        function setHeroSlide(index) {
            activeIndex = (index + slides.length) % slides.length;

            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === activeIndex);
            });

            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === activeIndex);
            });
        }

        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                const index = Number(dot.getAttribute('data-hero-dot'));
                setHeroSlide(index);
            });
        });

        if (slides.length > 1) {
            window.setInterval(function () {
                setHeroSlide(activeIndex + 1);
            }, 5600);
        }
    }

    const searchInput = document.querySelector('[data-search-input]');
    const searchGrid = document.querySelector('[data-search-grid]');
    const resultCount = document.querySelector('[data-result-count]');
    const chipWrap = document.querySelector('[data-filter-chips]');

    function getQueryFromLocation() {
        const params = new URLSearchParams(window.location.search);
        return params.get('q') || '';
    }

    function normalize(value) {
        return String(value || '').trim().toLowerCase();
    }

    function filterCards(keyword) {
        if (!searchGrid) {
            return;
        }

        const cards = Array.from(searchGrid.querySelectorAll('.movie-card'));
        const query = normalize(keyword);
        let visibleCount = 0;

        cards.forEach(function (card) {
            const text = normalize([
                card.getAttribute('data-title'),
                card.getAttribute('data-region'),
                card.getAttribute('data-genre'),
                card.getAttribute('data-year'),
                card.textContent
            ].join(' '));
            const isVisible = !query || text.includes(query);
            card.style.display = isVisible ? '' : 'none';

            if (isVisible) {
                visibleCount += 1;
            }
        });

        if (resultCount) {
            resultCount.textContent = '当前显示 ' + visibleCount + ' 部影片';
        }
    }

    if (searchInput && searchGrid) {
        searchInput.value = getQueryFromLocation();
        filterCards(searchInput.value);

        searchInput.addEventListener('input', function () {
            filterCards(searchInput.value);
        });
    }

    if (chipWrap && searchInput) {
        const chips = Array.from(chipWrap.querySelectorAll('button'));

        chips.forEach(function (chip) {
            chip.addEventListener('click', function () {
                chips.forEach(function (item) {
                    item.classList.remove('is-active');
                });

                chip.classList.add('is-active');
                searchInput.value = chip.getAttribute('data-filter-value') || '';
                filterCards(searchInput.value);
            });
        });
    }
})();
