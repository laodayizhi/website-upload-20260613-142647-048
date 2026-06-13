(function () {
  const mobileButton = document.querySelector('.mobile-toggle');
  const mobilePanel = document.querySelector('[data-mobile-panel]');

  if (mobileButton && mobilePanel) {
    mobileButton.addEventListener('click', function () {
      const expanded = mobileButton.getAttribute('aria-expanded') === 'true';
      mobileButton.setAttribute('aria-expanded', String(!expanded));
      mobilePanel.classList.toggle('is-open', expanded === false);
    });
  }

  const hero = document.querySelector('[data-hero]');

  if (hero) {
    const slides = Array.from(hero.querySelectorAll('[data-hero-slide]'));
    const dots = Array.from(hero.querySelectorAll('[data-hero-dot]'));
    let current = 0;

    const showSlide = function (index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === current);
      });
    };

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        showSlide(Number(dot.getAttribute('data-hero-dot')) || 0);
      });
    });

    if (slides.length > 1) {
      setInterval(function () {
        showSlide(current + 1);
      }, 5600);
    }
  }

  const params = new URLSearchParams(window.location.search);
  const queryFromUrl = params.get('q') || '';

  document.querySelectorAll('[data-filter-panel]').forEach(function (panel) {
    const section = panel.closest('section') || document;
    const input = panel.querySelector('input[name="local-search"]');
    const category = panel.querySelector('select[name="category-filter"]');
    const year = panel.querySelector('select[name="year-filter"]');
    const cards = Array.from(section.querySelectorAll('[data-card]'));

    if (input && queryFromUrl) {
      input.value = queryFromUrl;
    }

    const apply = function () {
      const keyword = input ? input.value.trim().toLowerCase() : '';
      const categoryValue = category ? category.value : '';
      const yearValue = year ? year.value : '';

      cards.forEach(function (card) {
        const text = (card.getAttribute('data-text') || '').toLowerCase();
        const cardCategory = card.getAttribute('data-category') || '';
        const cardYear = card.getAttribute('data-year') || '';
        const keywordMatch = !keyword || text.indexOf(keyword) !== -1;
        const categoryMatch = !categoryValue || cardCategory === categoryValue;
        const yearMatch = !yearValue || cardYear === yearValue;
        card.hidden = !(keywordMatch && categoryMatch && yearMatch);
      });
    };

    [input, category, year].forEach(function (control) {
      if (control) {
        control.addEventListener('input', apply);
        control.addEventListener('change', apply);
      }
    });

    apply();
  });
})();
