// === APP.JS - Main Application Logic ===
(function() {
  'use strict';

  let currentTermIdx = getCurrentTermIndex();
  let activeFilter = 'all';
  let modalTermIdx = null;

  // --- INITIALIZATION ---
  document.addEventListener('DOMContentLoaded', init);

  function init() {
    renderParticles();
    renderFeatured();
    renderWheel();
    renderCards();
    bindFilterButtons();
    bindHeroButton();
    bindModalEvents();
  }

  // --- HERO BUTTON ---
  function bindHeroButton() {
    const btn = document.getElementById('hero-btn');
    if (btn) {
      btn.addEventListener('click', function() {
        document.getElementById('featured').scrollIntoView({ behavior: 'smooth' });
      });
    }
  }

  // --- PARTICLES ---
  function renderParticles() {
    const container = document.getElementById('particles');
    if (!container) return;
    const term = SOLAR_TERMS[currentTermIdx];
    const season = term.season;
    const count = 25;
    let className, baseSize;

    switch (season) {
      case 'spring': className = 'particle--petal'; break;
      case 'summer': className = 'particle--firefly'; break;
      case 'autumn': className = 'particle--leaf'; break;
      case 'winter': className = 'particle--snow'; break;
    }

    for (let i = 0; i < count; i++) {
      const p = document.createElement('div');
      p.className = 'particle ' + className;
      p.style.left = Math.random() * 100 + '%';
      p.style.animationDelay = (Math.random() * 8) + 's';
      p.style.animationDuration = (6 + Math.random() * 8) + 's';
      if (className === 'particle--petal' || className === 'particle--leaf') {
        const s = 0.5 + Math.random() * 1;
        p.style.transform = 'scale(' + s + ')';
      }
      if (className === 'particle--snow') {
        const s = 0.5 + Math.random() * 1.2;
        p.style.width = (4 + Math.random() * 5) + 'px';
        p.style.height = p.style.width;
      }
      container.appendChild(p);
    }
  }

  // --- FEATURED SECTION ---
  function renderFeatured() {
    const el = document.getElementById('featured-content');
    if (!el) return;
    const term = SOLAR_TERMS[currentTermIdx];
    const season = SEASONS[term.season];

    el.innerHTML =
      '<div class="featured__badge">当前节气</div>' +
      '<div class="featured__icon">' + season.icon + '</div>' +
      '<h2 class="featured__name">' + term.name + '</h2>' +
      '<p class="featured__date">' + term.date + ' · ' + season.label + '</p>' +
      '<p class="featured__desc">' + term.description + '</p>' +
      '<div class="featured__details">' +
        '<div class="featured__detail-box"><h4>时令食材</h4><ul>' +
          term.foods.map(function(f) { return '<li>' + f + '</li>'; }).join('') +
        '</ul></div>' +
        '<div class="featured__detail-box"><h4>养生建议</h4><ul>' +
          term.tips.map(function(t) { return '<li>' + t + '</li>'; }).join('') +
        '</ul></div>' +
        '<div class="featured__poem-box"><h4>相关古诗</h4>' +
          '<div class="featured__poem-text">' + term.poem + '</div>' +
          '<div class="featured__poem-author">—— ' + term.poemAuthor + '</div>' +
        '</div>' +
      '</div>';
  }

  // --- SVG WHEEL ---
  function renderWheel() {
    const container = document.getElementById('wheel-svg');
    if (!container) return;

    const size = 500;
    const cx = size / 2, cy = size / 2;
    const outerR = 210, innerR = 80;
    const ns = 'http://www.w3.org/2000/svg';

    const svg = document.createElementNS(ns, 'svg');
    svg.setAttribute('viewBox', '0 0 ' + size + ' ' + size);
    svg.setAttribute('width', '100%');
    svg.setAttribute('height', '100%');

    // Draw 24 segments
    const angleStep = (2 * Math.PI) / 24;

    for (let i = 0; i < 24; i++) {
      const term = SOLAR_TERMS[i];
      const season = SEASONS[term.season];
      const startAngle = i * angleStep - Math.PI / 2;
      const endAngle = startAngle + angleStep;

      // Outer arc points
      const x1 = cx + outerR * Math.cos(startAngle);
      const y1 = cy + outerR * Math.sin(startAngle);
      const x2 = cx + outerR * Math.cos(endAngle);
      const y2 = cy + outerR * Math.sin(endAngle);
      // Inner arc points
      const x3 = cx + innerR * Math.cos(endAngle);
      const y3 = cy + innerR * Math.sin(endAngle);
      const x4 = cx + innerR * Math.cos(startAngle);
      const y4 = cy + innerR * Math.sin(startAngle);

      const path = document.createElementNS(ns, 'path');
      const d = 'M ' + x1 + ' ' + y1 +
                ' A ' + outerR + ' ' + outerR + ' 0 0 1 ' + x2 + ' ' + y2 +
                ' L ' + x3 + ' ' + y3 +
                ' A ' + innerR + ' ' + innerR + ' 0 0 0 ' + x4 + ' ' + y4 +
                ' Z';
      path.setAttribute('d', d);

      let fillColor = season.color;
      if (i === currentTermIdx) {
        fillColor = '#c1440e';
      }
      path.setAttribute('fill', fillColor);
      path.setAttribute('stroke', 'rgba(255,255,255,0.3)');
      path.setAttribute('stroke-width', '1');
      path.setAttribute('class', 'wheel-segment' + (i === currentTermIdx ? ' active' : ''));
      path.setAttribute('data-index', i);

      // Events
      path.addEventListener('click', function() {
        openModal(i);
      });
      path.addEventListener('mouseenter', function(e) {
        showWheelTooltip(e, term.name + ' ' + term.date);
      });
      path.addEventListener('mousemove', function(e) {
        moveWheelTooltip(e);
      });
      path.addEventListener('mouseleave', hideWheelTooltip);

      svg.appendChild(path);

      // Label
      const midAngle = startAngle + angleStep / 2;
      const labelR = (outerR + innerR) / 2 + 10;
      const lx = cx + labelR * Math.cos(midAngle);
      const ly = cy + labelR * Math.sin(midAngle);

      const text = document.createElementNS(ns, 'text');
      text.setAttribute('x', lx);
      text.setAttribute('y', ly);
      text.setAttribute('class', 'wheel-label');
      text.setAttribute('text-anchor', 'middle');
      text.setAttribute('dominant-baseline', 'central');
      // Rotate text to follow the arc
      const deg = (midAngle * 180 / Math.PI) + 90;
      text.setAttribute('transform', 'rotate(' + deg + ' ' + lx + ' ' + ly + ')');
      text.textContent = term.name;
      svg.appendChild(text);
    }

    // Season labels at cardinal positions
    var seasonLabels = [
      { text: '春', angle: -Math.PI / 2 + (3 * angleStep), color: 'var(--spring)' },
      { text: '夏', angle: -Math.PI / 2 + (9 * angleStep), color: 'var(--summer)' },
      { text: '秋', angle: -Math.PI / 2 + (15 * angleStep), color: 'var(--autumn)' },
      { text: '冬', angle: -Math.PI / 2 + (21 * angleStep), color: 'var(--winter)' }
    ];

    seasonLabels.forEach(function(sl) {
      var lr = outerR + 28;
      var slx = cx + lr * Math.cos(sl.angle);
      var sly = cy + lr * Math.sin(sl.angle);
      var t = document.createElementNS(ns, 'text');
      t.setAttribute('x', slx);
      t.setAttribute('y', sly);
      t.setAttribute('class', 'wheel-season-label');
      t.setAttribute('text-anchor', 'middle');
      t.setAttribute('dominant-baseline', 'central');
      t.setAttribute('fill', sl.color);
      t.textContent = sl.text;
      svg.appendChild(t);
    });

    // Center text
    var centerText = document.createElementNS(ns, 'text');
    centerText.setAttribute('x', cx);
    centerText.setAttribute('y', cy - 8);
    centerText.setAttribute('class', 'wheel-center-text');
    centerText.setAttribute('text-anchor', 'middle');
    centerText.setAttribute('dominant-baseline', 'central');
    centerText.textContent = '二十四';
    svg.appendChild(centerText);

    var centerText2 = document.createElementNS(ns, 'text');
    centerText2.setAttribute('x', cx);
    centerText2.setAttribute('y', cy + 14);
    centerText2.setAttribute('class', 'wheel-center-text');
    centerText2.setAttribute('text-anchor', 'middle');
    centerText2.setAttribute('dominant-baseline', 'central');
    centerText2.textContent = '节气';
    svg.appendChild(centerText2);

    container.appendChild(svg);
  }

  // Tooltip helpers
  function showWheelTooltip(e, text) {
    var tip = document.getElementById('wheel-tooltip');
    tip.textContent = text;
    tip.classList.add('visible');
    moveWheelTooltip(e);
  }

  function moveWheelTooltip(e) {
    var tip = document.getElementById('wheel-tooltip');
    tip.style.left = (e.clientX + 12) + 'px';
    tip.style.top = (e.clientY - 30) + 'px';
  }

  function hideWheelTooltip() {
    document.getElementById('wheel-tooltip').classList.remove('visible');
  }

  // --- CARDS ---
  function renderCards() {
    var grid = document.getElementById('cards-grid');
    if (!grid) return;

    SOLAR_TERMS.forEach(function(term, i) {
      var season = SEASONS[term.season];
      var isCurrent = (i === currentTermIdx);
      var card = document.createElement('div');
      card.className = 'card' + (isCurrent ? ' current' : '');
      card.setAttribute('data-season', term.season);
      card.setAttribute('data-index', i);

      card.innerHTML =
        '<div class="card__season-bar" style="background:' + season.color + '"></div>' +
        (isCurrent ? '<span class="card__current-badge">当前</span>' : '') +
        '<div class="card__icon">' + season.icon + '</div>' +
        '<h3 class="card__name">' + term.name + '</h3>' +
        '<p class="card__date">' + term.date + '</p>' +
        '<p class="card__desc">' + term.description + '</p>' +
        '<div class="card__foods">' +
          term.foods.map(function(f) { return '<span class="card__food-tag">' + f + '</span>'; }).join('') +
        '</div>';

      card.addEventListener('click', function() {
        openModal(i);
      });

      grid.appendChild(card);
    });
  }

  // --- FILTER ---
  function bindFilterButtons() {
    var btns = document.querySelectorAll('.filter-btn');
    btns.forEach(function(btn) {
      btn.addEventListener('click', function() {
        var season = this.getAttribute('data-season');
        activeFilter = season;

        // Update active state
        btns.forEach(function(b) { b.classList.remove('active'); });
        this.classList.add('active');

        // Filter cards
        filterCards(season);
      });
    });

    // Set initial active
    var allBtn = document.querySelector('.filter-btn[data-season="all"]');
    if (allBtn) allBtn.classList.add('active');
  }

  function filterCards(season) {
    var cards = document.querySelectorAll('.card');
    cards.forEach(function(card) {
      if (season === 'all' || card.getAttribute('data-season') === season) {
        card.classList.remove('hidden');
      } else {
        card.classList.add('hidden');
      }
    });
  }

  // --- MODAL ---
  function openModal(idx) {
    modalTermIdx = idx;
    var term = SOLAR_TERMS[idx];
    var season = SEASONS[term.season];
    var overlay = document.getElementById('modal-overlay');

    document.getElementById('modal-icon').textContent = season.icon;
    document.getElementById('modal-name').textContent = term.name;
    document.getElementById('modal-date').textContent = term.date;

    var tag = document.getElementById('modal-season-tag');
    tag.textContent = season.label;
    tag.style.background = season.color;

    document.getElementById('modal-desc').textContent = term.description;

    document.getElementById('modal-foods').innerHTML =
      term.foods.map(function(f) { return '<span class="modal__food-item">' + f + '</span>'; }).join('');

    document.getElementById('modal-tips').innerHTML =
      term.tips.map(function(t) { return '<li>' + t + '</li>'; }).join('');

    document.getElementById('modal-poem-text').textContent = term.poem;
    document.getElementById('modal-poem-author').textContent = '—— ' + term.poemAuthor;

    overlay.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeModal() {
    var overlay = document.getElementById('modal-overlay');
    overlay.classList.remove('open');
    document.body.style.overflow = '';
    modalTermIdx = null;
  }

  function navModal(dir) {
    if (modalTermIdx === null) return;
    var newIdx = modalTermIdx + dir;
    if (newIdx < 0) newIdx = 23;
    if (newIdx > 23) newIdx = 0;

    // If filter is active, skip hidden terms
    if (activeFilter !== 'all') {
      var attempts = 0;
      while (SOLAR_TERMS[newIdx].season !== activeFilter && attempts < 24) {
        newIdx += dir;
        if (newIdx < 0) newIdx = 23;
        if (newIdx > 23) newIdx = 0;
        attempts++;
      }
    }

    openModal(newIdx);
  }

  function bindModalEvents() {
    document.getElementById('modal-close').addEventListener('click', closeModal);

    document.getElementById('modal-overlay').addEventListener('click', function(e) {
      if (e.target === this) closeModal();
    });

    document.getElementById('modal-prev').addEventListener('click', function(e) {
      e.stopPropagation();
      navModal(-1);
    });

    document.getElementById('modal-next').addEventListener('click', function(e) {
      e.stopPropagation();
      navModal(1);
    });

    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape') closeModal();
      if (modalTermIdx !== null) {
        if (e.key === 'ArrowLeft') navModal(-1);
        if (e.key === 'ArrowRight') navModal(1);
      }
    });
  }

})();
