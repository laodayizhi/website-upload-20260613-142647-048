(function () {
  var hlsLoader = null;

  function ready(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
    } else {
      callback();
    }
  }

  function loadHls() {
    if (window.Hls) {
      return Promise.resolve(window.Hls);
    }
    if (hlsLoader) {
      return hlsLoader;
    }
    hlsLoader = new Promise(function (resolve) {
      var script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/hls.js@1/dist/hls.min.js';
      script.onload = function () {
        resolve(window.Hls || null);
      };
      script.onerror = function () {
        resolve(null);
      };
      document.head.appendChild(script);
    });
    return hlsLoader;
  }

  function initMenu() {
    var button = document.querySelector('[data-menu-toggle]');
    var nav = document.querySelector('[data-nav-links]');
    if (!button || !nav) {
      return;
    }
    button.addEventListener('click', function () {
      nav.classList.toggle('is-open');
    });
  }

  function initHero() {
    var root = document.querySelector('[data-hero-carousel]');
    if (!root) {
      return;
    }
    var slides = Array.prototype.slice.call(root.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(root.querySelectorAll('[data-hero-dot]'));
    if (slides.length < 2) {
      return;
    }
    var current = 0;
    var timer = null;

    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === current);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('is-active', i === current);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        show(index);
        start();
      });
    });

    root.addEventListener('mouseenter', stop);
    root.addEventListener('mouseleave', start);
    show(0);
    start();
  }

  function normalize(value) {
    return (value || '').toString().trim().toLowerCase();
  }

  function initFilters() {
    document.querySelectorAll('[data-filter-scope]').forEach(function (form) {
      var list = form.parentElement.querySelector('[data-filter-list]');
      var empty = form.parentElement.querySelector('[data-empty-state]');
      if (!list) {
        return;
      }
      var input = form.querySelector('[data-filter-input]');
      var year = form.querySelector('[data-filter-year]');
      var region = form.querySelector('[data-filter-region]');
      var type = form.querySelector('[data-filter-type]');
      var cards = Array.prototype.slice.call(list.querySelectorAll('[data-movie-card]'));

      function apply() {
        var query = normalize(input && input.value);
        var selectedYear = normalize(year && year.value);
        var selectedRegion = normalize(region && region.value);
        var selectedType = normalize(type && type.value);
        var shown = 0;
        cards.forEach(function (card) {
          var haystack = normalize([
            card.dataset.title,
            card.dataset.year,
            card.dataset.region,
            card.dataset.type,
            card.dataset.genre
          ].join(' '));
          var ok = true;
          if (query && haystack.indexOf(query) === -1) {
            ok = false;
          }
          if (selectedYear && normalize(card.dataset.year) !== selectedYear) {
            ok = false;
          }
          if (selectedRegion && normalize(card.dataset.region) !== selectedRegion) {
            ok = false;
          }
          if (selectedType && normalize(card.dataset.type) !== selectedType) {
            ok = false;
          }
          card.hidden = !ok;
          if (ok) {
            shown += 1;
          }
        });
        if (empty) {
          empty.hidden = shown !== 0;
        }
      }

      form.addEventListener('submit', function (event) {
        event.preventDefault();
      });
      [input, year, region, type].forEach(function (node) {
        if (node) {
          node.addEventListener('input', apply);
          node.addEventListener('change', apply);
        }
      });
      apply();
    });
  }

  function nativeHls(video) {
    return video.canPlayType('application/vnd.apple.mpegurl') || video.canPlayType('application/x-mpegURL');
  }

  function initPlayers() {
    document.querySelectorAll('[data-player]').forEach(function (shell) {
      var video = shell.querySelector('video');
      var button = shell.querySelector('.play-overlay');
      if (!video || !button) {
        return;
      }
      var url = video.getAttribute('src');
      var loaded = false;

      function prepare() {
        if (loaded) {
          return Promise.resolve();
        }
        loaded = true;
        if (nativeHls(video)) {
          video.src = url;
          return Promise.resolve();
        }
        return loadHls().then(function (Hls) {
          if (Hls && Hls.isSupported()) {
            video.removeAttribute('src');
            video.load();
            var hls = new Hls({
              lowLatencyMode: true
            });
            hls.loadSource(url);
            hls.attachMedia(video);
            shell.hlsInstance = hls;
            return new Promise(function (resolve) {
              hls.on(Hls.Events.MANIFEST_PARSED, function () {
                resolve();
              });
              window.setTimeout(resolve, 1400);
            });
          }
          video.src = url;
          return Promise.resolve();
        });
      }

      function play() {
        button.classList.add('is-hidden');
        prepare().then(function () {
          return video.play();
        }).catch(function () {
          button.classList.remove('is-hidden');
        });
      }

      button.addEventListener('click', play);
      video.addEventListener('play', function () {
        button.classList.add('is-hidden');
      });
      video.addEventListener('ended', function () {
        button.classList.remove('is-hidden');
      });
    });
  }

  ready(function () {
    initMenu();
    initHero();
    initFilters();
    initPlayers();
  });
})();
