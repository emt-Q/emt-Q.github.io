(function () {
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Scroll reveal
  var reveals = [].slice.call(document.querySelectorAll('.reveal'));
  if (reduce || !('IntersectionObserver' in window)) {
    reveals.forEach(function (el) { el.classList.add('in'); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          en.target.classList.add('in');
          io.unobserve(en.target);
        }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.05 });
    reveals.forEach(function (el) { io.observe(el); });
  }
  if (reduce) return;

  // Parallax: data-speed is the fraction of scroll the element lags behind.
  //   data-anchor="top"  offset = scrollY * speed (hero items, zero at page top)
  //   otherwise          offset = 0 when the element is centred in the viewport
  //   data-max           clamp in px;  data-rotate  degrees per scrolled px
  var items = [].slice.call(document.querySelectorAll('[data-speed]'));
  var vh = window.innerHeight, scale = 1, ticking = false;

  function update() {
    ticking = false;
    var y = window.pageYOffset;
    items.forEach(function (el) {
      var s = parseFloat(el.dataset.speed) * scale;
      var d = el.dataset.anchor === 'top' ? y * s : (y + vh / 2 - el._c) * s;
      var max = parseFloat(el.dataset.max);
      if (max) d = Math.max(-max, Math.min(max, d));
      var t = 'translate3d(0,' + d.toFixed(1) + 'px,0)';
      if (el.dataset.rotate) t += ' rotate(' + (y * el.dataset.rotate).toFixed(2) + 'deg)';
      el.style.transform = t;
    });
  }

  function measure() {
    vh = window.innerHeight;
    scale = window.innerWidth < 720 ? 0.6 : 1;
    items.forEach(function (el) {
      el.style.transform = '';
      var r = el.getBoundingClientRect();
      el._c = r.top + window.pageYOffset + r.height / 2;
    });
    update();
  }

  window.addEventListener('scroll', function () {
    if (!ticking) { ticking = true; requestAnimationFrame(update); }
  }, { passive: true });
  window.addEventListener('resize', measure);
  window.addEventListener('load', measure);
  measure();
})();
