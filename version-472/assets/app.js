(function () {
    var toggle = document.querySelector(".mobile-toggle");
    var menu = document.querySelector(".mobile-nav");

    if (toggle && menu) {
        toggle.addEventListener("click", function () {
            var open = menu.classList.toggle("is-open");
            toggle.setAttribute("aria-expanded", String(open));
        });
    }

    var hero = document.querySelector("[data-hero-carousel]");

    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
        var dots = Array.prototype.slice.call(hero.querySelectorAll(".hero-dot"));
        var current = 0;

        function showSlide(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("is-active", dotIndex === current);
            });
        }

        dots.forEach(function (dot, index) {
            dot.addEventListener("click", function () {
                showSlide(index);
            });
        });

        if (slides.length > 1) {
            window.setInterval(function () {
                showSlide(current + 1);
            }, 5200);
        }
    }

    function normalize(value) {
        return (value || "").toString().trim().toLowerCase();
    }

    function applyFilters(scope) {
        var input = scope.querySelector(".js-filter-input");
        var region = scope.querySelector(".js-filter-region");
        var category = scope.querySelector(".js-filter-category");
        var cards = Array.prototype.slice.call(scope.querySelectorAll(".js-movie-card"));
        var query = normalize(input ? input.value : "");
        var regionValue = normalize(region ? region.value : "");
        var categoryValue = normalize(category ? category.value : "");

        cards.forEach(function (card) {
            var text = normalize([
                card.dataset.title,
                card.dataset.region,
                card.dataset.type,
                card.dataset.genre,
                card.dataset.tags,
                card.dataset.category
            ].join(" "));
            var matchesQuery = !query || text.indexOf(query) !== -1;
            var matchesRegion = !regionValue || normalize(card.dataset.region) === regionValue;
            var matchesCategory = !categoryValue || normalize(card.dataset.category) === categoryValue;
            card.classList.toggle("is-hidden", !(matchesQuery && matchesRegion && matchesCategory));
        });
    }

    var filterScopes = Array.prototype.slice.call(document.querySelectorAll(".js-filter-list"));

    filterScopes.forEach(function (list) {
        var scope = list.closest("section") || document;
        var controls = Array.prototype.slice.call(scope.querySelectorAll(".js-filter-input, .js-filter-region, .js-filter-category"));
        controls.forEach(function (control) {
            control.addEventListener("input", function () {
                applyFilters(scope);
            });
            control.addEventListener("change", function () {
                applyFilters(scope);
            });
        });
        applyFilters(scope);
    });

    var searchPage = document.querySelector(".js-search-page");

    if (searchPage) {
        var params = new URLSearchParams(window.location.search);
        var q = params.get("q");
        var input = searchPage.querySelector(".js-filter-input");

        if (q && input) {
            input.value = q;
            applyFilters(searchPage);
        }
    }
})();
