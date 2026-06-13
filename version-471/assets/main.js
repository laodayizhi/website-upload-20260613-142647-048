(function () {
    var navButton = document.querySelector("[data-nav-toggle]");
    var nav = document.querySelector("[data-site-nav]");

    if (navButton && nav) {
        navButton.addEventListener("click", function () {
            nav.classList.toggle("open");
        });
    }

    var hero = document.querySelector("[data-hero-carousel]");

    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
        var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
        var current = 0;

        function showSlide(index) {
            current = (index + slides.length) % slides.length;

            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("active", slideIndex === current);
            });

            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("active", dotIndex === current);
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
            }, 5600);
        }
    }

    var filterRoots = Array.prototype.slice.call(document.querySelectorAll("[data-filter-root]"));

    filterRoots.forEach(function (root) {
        var input = root.querySelector("[data-movie-search]");
        var selects = Array.prototype.slice.call(root.querySelectorAll("[data-filter]"));
        var cards = Array.prototype.slice.call(root.querySelectorAll(".movie-card"));
        var empty = root.querySelector("[data-empty-state]");

        function normalize(value) {
            return String(value || "").toLowerCase().trim();
        }

        function applyFilters() {
            var query = input ? normalize(input.value) : "";
            var visible = 0;

            cards.forEach(function (card) {
                var haystack = normalize([
                    card.getAttribute("data-title"),
                    card.getAttribute("data-region"),
                    card.getAttribute("data-type"),
                    card.getAttribute("data-year"),
                    card.getAttribute("data-genre")
                ].join(" "));
                var matched = !query || haystack.indexOf(query) !== -1;

                selects.forEach(function (select) {
                    var key = select.getAttribute("data-filter");
                    var value = normalize(select.value);
                    var cardValue = normalize(card.getAttribute("data-" + key));

                    if (value && cardValue !== value) {
                        matched = false;
                    }
                });

                card.style.display = matched ? "" : "none";

                if (matched) {
                    visible += 1;
                }
            });

            if (empty) {
                empty.style.display = visible ? "none" : "block";
            }
        }

        if (input) {
            input.addEventListener("input", applyFilters);
        }

        selects.forEach(function (select) {
            select.addEventListener("change", applyFilters);
        });

        applyFilters();
    });
})();
