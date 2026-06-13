(function () {
  var searchToggle = document.querySelector('[data-search-toggle]');
  var searchPanel = document.querySelector('[data-search-panel]');
  var menuToggle = document.querySelector('[data-menu-toggle]');
  var mobilePanel = document.querySelector('[data-mobile-panel]');

  if (searchToggle && searchPanel) {
    searchToggle.addEventListener('click', function () {
      searchPanel.classList.toggle('open');
      var input = searchPanel.querySelector('input');
      if (searchPanel.classList.contains('open') && input) {
        input.focus();
      }
    });
  }

  if (menuToggle && mobilePanel) {
    menuToggle.addEventListener('click', function () {
      mobilePanel.classList.toggle('open');
      menuToggle.classList.toggle('open');
    });
  }

  document.querySelectorAll('[data-rail]').forEach(function (rail) {
    var section = rail.closest('section');
    var prev = section ? section.querySelector('[data-rail-prev]') : null;
    var next = section ? section.querySelector('[data-rail-next]') : null;

    if (prev) {
      prev.addEventListener('click', function () {
        rail.scrollBy({ left: -420, behavior: 'smooth' });
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        rail.scrollBy({ left: 420, behavior: 'smooth' });
      });
    }
  });

  document.querySelectorAll('[data-hero]').forEach(function (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var prev = hero.querySelector('[data-hero-prev]');
    var next = hero.querySelector('[data-hero-next]');
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, position) {
        slide.classList.toggle('active', position === index);
      });
      dots.forEach(function (dot, position) {
        dot.classList.toggle('active', position === index);
      });
    }

    function start() {
      if (timer) {
        clearInterval(timer);
      }
      timer = setInterval(function () {
        show(index + 1);
      }, 5000);
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-hero-dot')) || 0);
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

    show(0);
    start();
  });

  function applyQuery(input, list) {
    var query = (input.value || '').trim().toLowerCase();
    var cards = list ? list.querySelectorAll('[data-card]') : document.querySelectorAll('[data-card]');
    cards.forEach(function (card) {
      var value = (card.getAttribute('data-search') || card.textContent || '').toLowerCase();
      card.classList.toggle('is-hidden', query && value.indexOf(query) === -1);
    });
  }

  document.querySelectorAll('[data-filter-input]').forEach(function (input) {
    var list = document.querySelector('[data-filter-list]');
    var params = new URLSearchParams(window.location.search);
    var q = params.get('q');
    if (q) {
      input.value = q;
    }
    applyQuery(input, list);
    input.addEventListener('input', function () {
      applyQuery(input, list);
    });
  });

  document.querySelectorAll('[data-player]').forEach(function (wrap) {
    var video = wrap.querySelector('video');
    var button = wrap.querySelector('[data-play-button]');
    var stream = wrap.getAttribute('data-stream');
    var ready = false;
    var hls = null;

    function attach() {
      if (!video || !stream || ready) {
        return;
      }

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = stream;
      } else if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls();
        hls.loadSource(stream);
        hls.attachMedia(video);
      } else {
        video.src = stream;
      }
      ready = true;
    }

    function play() {
      attach();
      if (button) {
        button.classList.add('hidden');
      }
      if (video) {
        var result = video.play();
        if (result && typeof result.catch === 'function') {
          result.catch(function () {});
        }
      }
    }

    if (button) {
      button.addEventListener('click', play);
    }

    if (video) {
      video.addEventListener('click', function () {
        if (!ready) {
          play();
        }
      });
      video.addEventListener('play', function () {
        if (button) {
          button.classList.add('hidden');
        }
      });
    }

    window.addEventListener('pagehide', function () {
      if (hls) {
        hls.destroy();
      }
    });
  });
})();
