(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
      return;
    }
    document.addEventListener("DOMContentLoaded", fn);
  }

  function normalize(value) {
    return (value || "").toString().trim().toLowerCase();
  }

  ready(function () {
    var toggle = document.querySelector("[data-menu-toggle]");
    var mobileNav = document.querySelector("[data-mobile-nav]");
    if (toggle && mobileNav) {
      toggle.addEventListener("click", function () {
        mobileNav.classList.toggle("is-open");
      });
    }

    var hero = document.querySelector("[data-hero]");
    if (hero) {
      var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
      var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
      var prev = hero.querySelector("[data-hero-prev]");
      var next = hero.querySelector("[data-hero-next]");
      var current = 0;

      function show(index) {
        if (!slides.length) {
          return;
        }
        current = (index + slides.length) % slides.length;
        slides.forEach(function (slide, i) {
          slide.classList.toggle("is-active", i === current);
        });
        dots.forEach(function (dot, i) {
          dot.classList.toggle("is-active", i === current);
        });
      }

      if (prev) {
        prev.addEventListener("click", function () {
          show(current - 1);
        });
      }
      if (next) {
        next.addEventListener("click", function () {
          show(current + 1);
        });
      }
      dots.forEach(function (dot) {
        dot.addEventListener("click", function () {
          show(parseInt(dot.getAttribute("data-hero-dot"), 10));
        });
      });
      window.setInterval(function () {
        show(current + 1);
      }, 5200);
    }

    var mainSearch = document.querySelector("[data-main-search]");
    if (mainSearch) {
      var params = new URLSearchParams(window.location.search);
      var q = params.get("q");
      if (q) {
        mainSearch.value = q;
      }
    }

    var filterInputs = Array.prototype.slice.call(document.querySelectorAll("[data-filter-input]"));
    var typeFilters = Array.prototype.slice.call(document.querySelectorAll("[data-type-filter]"));
    var yearFilters = Array.prototype.slice.call(document.querySelectorAll("[data-year-filter]"));
    var cards = Array.prototype.slice.call(document.querySelectorAll(".movie-card, .rank-row"));

    function applyFilters() {
      var text = normalize(filterInputs.map(function (input) { return input.value; }).join(" "));
      var typeValue = normalize(typeFilters.map(function (select) { return select.value; }).join(" "));
      var yearValue = normalize(yearFilters.map(function (select) { return select.value; }).join(" "));
      cards.forEach(function (card) {
        var hay = normalize(card.getAttribute("data-search"));
        var type = normalize(card.getAttribute("data-type"));
        var year = normalize(card.getAttribute("data-year"));
        var okText = !text || hay.indexOf(text) !== -1;
        var okType = !typeValue || type === typeValue;
        var okYear = !yearValue || year === yearValue;
        card.classList.toggle("is-hidden", !(okText && okType && okYear));
      });
    }

    filterInputs.forEach(function (input) {
      input.addEventListener("input", applyFilters);
    });
    typeFilters.forEach(function (select) {
      select.addEventListener("change", applyFilters);
    });
    yearFilters.forEach(function (select) {
      select.addEventListener("change", applyFilters);
    });
    if (filterInputs.length || typeFilters.length || yearFilters.length) {
      applyFilters();
    }
  });
})();
