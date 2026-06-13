(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function initMenu() {
    var button = document.querySelector("[data-menu-toggle]");
    var nav = document.querySelector("[data-main-nav]");
    if (!button || !nav) {
      return;
    }
    button.addEventListener("click", function () {
      nav.classList.toggle("open");
    });
  }

  function initHeroSlider() {
    var slider = document.querySelector("[data-hero-slider]");
    if (!slider) {
      return;
    }
    var slides = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-dot]"));
    var prev = slider.querySelector("[data-hero-prev]");
    var next = slider.querySelector("[data-hero-next]");
    var active = 0;

    function show(index) {
      active = (index + slides.length) % slides.length;
      slides.forEach(function (slide, current) {
        slide.classList.toggle("active", current === active);
      });
      dots.forEach(function (dot, current) {
        dot.classList.toggle("active", current === active);
      });
    }

    if (prev) {
      prev.addEventListener("click", function () {
        show(active - 1);
      });
    }
    if (next) {
      next.addEventListener("click", function () {
        show(active + 1);
      });
    }
    dots.forEach(function (dot, index) {
      dot.addEventListener("click", function () {
        show(index);
      });
    });
    if (slides.length > 1) {
      window.setInterval(function () {
        show(active + 1);
      }, 5000);
    }
  }

  function initCategoryFilter() {
    var form = document.querySelector("[data-category-filter]");
    var grid = document.querySelector("[data-card-grid]");
    if (!form || !grid) {
      return;
    }
    var textInput = form.querySelector("[data-filter-text]");
    var regionSelect = form.querySelector("[data-filter-region]");
    var yearSelect = form.querySelector("[data-filter-year]");
    var cards = Array.prototype.slice.call(grid.querySelectorAll(".movie-card"));
    var empty = document.createElement("div");
    empty.className = "empty-state";
    empty.textContent = "没有匹配的影片";

    function apply() {
      var query = (textInput && textInput.value ? textInput.value : "").trim().toLowerCase();
      var region = regionSelect && regionSelect.value ? regionSelect.value : "";
      var year = yearSelect && yearSelect.value ? yearSelect.value : "";
      var visible = 0;
      cards.forEach(function (card) {
        var haystack = [card.dataset.title, card.dataset.region, card.dataset.year, card.dataset.tags].join(" ").toLowerCase();
        var matchesQuery = !query || haystack.indexOf(query) !== -1;
        var matchesRegion = !region || card.dataset.region === region;
        var matchesYear = !year || card.dataset.year === year;
        var show = matchesQuery && matchesRegion && matchesYear;
        card.classList.toggle("hidden-card", !show);
        if (show) {
          visible += 1;
        }
      });
      if (visible === 0) {
        if (!empty.parentNode) {
          grid.appendChild(empty);
        }
      } else if (empty.parentNode) {
        empty.parentNode.removeChild(empty);
      }
    }

    [textInput, regionSelect, yearSelect].forEach(function (element) {
      if (element) {
        element.addEventListener("input", apply);
        element.addEventListener("change", apply);
      }
    });
  }

  function movieCardTemplate(movie) {
    var tags = (movie.tags || []).slice(0, 3).map(function (tag) {
      return "<span>" + escapeHtml(tag) + "</span>";
    }).join("");
    return [
      "<article class=\"movie-card\">",
      "<a class=\"poster-link\" href=\"" + escapeHtml(movie.url) + "\" aria-label=\"" + escapeHtml(movie.title) + "\">",
      "<img src=\"" + escapeHtml(movie.cover) + "\" alt=\"" + escapeHtml(movie.title) + "\" loading=\"lazy\">",
      "<span class=\"type-badge\">" + escapeHtml(movie.type) + "</span>",
      "</a>",
      "<div class=\"movie-card-body\">",
      "<h2><a href=\"" + escapeHtml(movie.url) + "\">" + escapeHtml(movie.title) + "</a></h2>",
      "<p>" + escapeHtml(movie.oneLine || movie.genre || "") + "</p>",
      "<div class=\"tag-row\">" + tags + "</div>",
      "<div class=\"card-meta\"><span>" + escapeHtml(movie.region) + "</span><span>" + escapeHtml(movie.year) + "</span></div>",
      "</div>",
      "</article>"
    ].join("");
  }

  function initSearchPage() {
    var results = document.getElementById("searchResults");
    if (!results || !window.MOVIE_INDEX) {
      return;
    }
    var form = document.querySelector("[data-search-form]");
    var input = document.querySelector("[data-search-input]");
    var regionSelect = document.querySelector("[data-search-region]");
    var yearSelect = document.querySelector("[data-search-year]");
    var params = new URLSearchParams(window.location.search);
    var initialQuery = params.get("q") || "";
    var regions = [];
    var years = [];

    window.MOVIE_INDEX.forEach(function (movie) {
      if (regions.indexOf(movie.region) === -1) {
        regions.push(movie.region);
      }
      if (years.indexOf(String(movie.year)) === -1) {
        years.push(String(movie.year));
      }
    });
    regions.sort();
    years.sort(function (a, b) {
      return Number(b) - Number(a);
    });
    regions.forEach(function (region) {
      var option = document.createElement("option");
      option.value = region;
      option.textContent = region;
      regionSelect.appendChild(option);
    });
    years.forEach(function (year) {
      var option = document.createElement("option");
      option.value = year;
      option.textContent = year;
      yearSelect.appendChild(option);
    });
    if (input) {
      input.value = initialQuery;
    }

    function render() {
      var query = input && input.value ? input.value.trim().toLowerCase() : "";
      var region = regionSelect && regionSelect.value ? regionSelect.value : "";
      var year = yearSelect && yearSelect.value ? yearSelect.value : "";
      var matches = window.MOVIE_INDEX.filter(function (movie) {
        var haystack = [movie.title, movie.region, movie.type, movie.year, movie.genre, (movie.tags || []).join(" "), movie.oneLine].join(" ").toLowerCase();
        var matchesQuery = !query || haystack.indexOf(query) !== -1;
        var matchesRegion = !region || movie.region === region;
        var matchesYear = !year || String(movie.year) === year;
        return matchesQuery && matchesRegion && matchesYear;
      }).slice(0, 240);
      if (!matches.length) {
        results.innerHTML = "<div class=\"empty-state\">没有匹配的影片</div>";
        return;
      }
      results.innerHTML = matches.map(movieCardTemplate).join("");
    }

    if (form) {
      form.addEventListener("submit", function (event) {
        event.preventDefault();
        render();
      });
    }
    [input, regionSelect, yearSelect].forEach(function (element) {
      if (element) {
        element.addEventListener("input", render);
        element.addEventListener("change", render);
      }
    });
    render();
  }

  window.initMoviePlayer = function (videoId, buttonId, sourceUrl) {
    var video = document.getElementById(videoId);
    var button = document.getElementById(buttonId);
    if (!video || !button) {
      return;
    }
    var frame = video.closest(".player-frame");
    var player = null;

    function attach() {
      if (video.dataset.ready === "1") {
        return;
      }
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = sourceUrl;
      } else if (window.Hls && window.Hls.isSupported()) {
        player = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        player.loadSource(sourceUrl);
        player.attachMedia(video);
      } else {
        video.src = sourceUrl;
      }
      video.dataset.ready = "1";
    }

    function play() {
      attach();
      if (frame) {
        frame.classList.add("is-playing");
      }
      video.setAttribute("controls", "controls");
      var promise = video.play();
      if (promise && typeof promise.catch === "function") {
        promise.catch(function () {});
      }
    }

    button.addEventListener("click", play);
    video.addEventListener("click", function () {
      if (video.dataset.ready !== "1") {
        play();
      }
    });
    window.addEventListener("beforeunload", function () {
      if (player && typeof player.destroy === "function") {
        player.destroy();
      }
    });
  };

  ready(function () {
    initMenu();
    initHeroSlider();
    initCategoryFilter();
    initSearchPage();
  });
})();
