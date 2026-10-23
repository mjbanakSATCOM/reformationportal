/* ============================================================
   BOOK MODAL ENGINE
   Animated scripture book for Five Solas
   Depends on: solas-content.js (SOLAS_DATA)
   ============================================================ */

(function () {
  'use strict';

  // ── Inject Modal HTML ──────────────────────────────────────
  function buildModal() {
    const html = `
<div class="book-backdrop" id="bookBackdrop" role="dialog" aria-modal="true" aria-labelledby="bookSolaTitle">
  <div class="book-container" id="bookContainer">
    <button class="book-close" id="bookClose" aria-label="Close book">✕</button>
    <div class="book" id="bookEl">

      <!-- Spine -->
      <div class="book-spine" aria-hidden="true">
        <span class="spine-cross">✟</span>
        <span class="spine-title" id="spineTitle">Sola</span>
        <span class="spine-cross">✟</span>
      </div>

      <!-- Left Page: Summary -->
      <div class="book-page-left" role="document" aria-label="Summary">
        <div class="book-sola-title-wrap">
          <span class="book-sola-icon" id="bookIcon">✟</span>
          <span class="book-sola-latin" id="bookSolaTitle">Sola Scriptura</span>
          <span class="book-sola-english" id="bookSolaEnglish">Scripture Alone</span>
          <div class="book-title-rule"></div>
        </div>
        <div class="book-summary-scroll">
          <div class="book-summary" id="bookSummary"></div>
        </div>
        <span class="page-num" aria-hidden="true">i</span>
      </div>

      <!-- Right Page: Verses -->
      <div class="book-page-right" role="document" aria-label="Scripture verses">
        <div class="book-verses-header">
          <span class="book-verses-eyebrow">Legacy Standard Bible</span>
          <p class="book-verses-title">Foundational Scriptures</p>
          <div class="book-verses-rule"></div>
        </div>
        <div class="book-verses-scroll">
          <div id="bookVerses"></div>
        </div>
        <span class="page-num" aria-hidden="true">ii</span>
      </div>

    </div>
  </div>
</div>`;
    document.body.insertAdjacentHTML('beforeend', html);
  }

  // ── Populate Content ───────────────────────────────────────
  function populateBook(solaKey) {
    const data = SOLAS_DATA[solaKey];
    if (!data) return;

    // Spine
    document.getElementById('spineTitle').textContent = data.latin;

    // Left page
    document.getElementById('bookIcon').textContent = data.icon;
    document.getElementById('bookSolaTitle').textContent = data.latin;
    document.getElementById('bookSolaEnglish').textContent = data.english;

    // Summary — split into paragraphs, add drop-cap to first
    const summaryEl = document.getElementById('bookSummary');
    const paragraphs = data.summary.split(/\n\n+/).filter(Boolean);
    summaryEl.innerHTML = paragraphs.map((p, i) => {
      const cls = i === 0 ? 'drop-cap' : '';
      return `<p class="${cls}">${p.trim()}</p>`;
    }).join('');
    if (data.grokUrl) {
      summaryEl.insertAdjacentHTML('beforeend',
        `<p class="book-grok-link"><a href="${escHtml(data.grokUrl)}" target="_blank" rel="noopener noreferrer">Read more on Grokipedia →</a></p>`);
    }

    // Right page — verses, staggered animation
    const versesEl = document.getElementById('bookVerses');
    versesEl.innerHTML = data.verses.map((v, i) => `
      <div class="book-verse" style="animation-delay:${0.35 + i * 0.12}s">
        <span class="verse-ref">${escHtml(v.ref)}</span>
        <p class="verse-text">${escHtml(v.text)}</p>
        <span class="verse-translation">LSB — Legacy Standard Bible</span>
      </div>
    `).join('');
  }

  function escHtml(str) {
    return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }

  // ── Particle / candle shimmer ──────────────────────────────
  // Adds tiny golden mote particles that drift upward inside the book when opened
  function spawnParticles() {
    const bookEl = document.getElementById('bookEl');
    const count = 12;
    for (let i = 0; i < count; i++) {
      const mote = document.createElement('span');
      mote.className = 'book-mote';
      mote.setAttribute('aria-hidden', 'true');
      const size = 2 + Math.random() * 3;
      const left = 10 + Math.random() * 80;
      const delay = Math.random() * 2.5;
      const dur   = 2.5 + Math.random() * 2;
      mote.style.cssText = `
        position: absolute;
        width: ${size}px; height: ${size}px;
        border-radius: 50%;
        background: radial-gradient(circle, #f0d080 0%, #c5a24e 60%, transparent 100%);
        left: ${left}%;
        bottom: 5%;
        opacity: 0;
        pointer-events: none;
        z-index: 10;
        animation: moteDrift ${dur}s ${delay}s ease-in-out infinite;
      `;
      bookEl.appendChild(mote);
    }
  }

  function clearParticles() {
    document.querySelectorAll('.book-mote').forEach(m => m.remove());
  }

  // Inject mote keyframe if not already present
  function injectMoteKeyframe() {
    if (document.getElementById('mote-kf')) return;
    const style = document.createElement('style');
    style.id = 'mote-kf';
    style.textContent = `
      @keyframes moteDrift {
        0%   { opacity: 0;    transform: translateY(0)   translateX(0); }
        20%  { opacity: 0.7; }
        80%  { opacity: 0.3; }
        100% { opacity: 0;    transform: translateY(-60px) translateX(${(Math.random()-0.5)*20}px); }
      }
    `;
    document.head.appendChild(style);
  }

  // ── Open / Close ───────────────────────────────────────────
  let currentKey = null;
  let previousFocus = null;

  function openBook(solaKey) {
    if (currentKey === solaKey && backdrop().classList.contains('is-open')) return;
    currentKey = solaKey;
    previousFocus = document.activeElement;

    populateBook(solaKey);

    const bd = backdrop();
    bd.classList.add('is-open');

    // Trigger verse appear animations after page swings open
    setTimeout(() => {
      document.querySelectorAll('.book-verse').forEach(v => {
        v.classList.add('verse-appear');
      });
      spawnParticles();
    }, 450);

    // Trap focus
    setTimeout(() => {
      document.getElementById('bookClose').focus();
    }, 200);

    // Prevent body scroll
    document.body.style.overflow = 'hidden';
  }

  function closeBook() {
    const bd = backdrop();
    bd.classList.remove('is-open');
    clearParticles();

    // Reset verse animations
    setTimeout(() => {
      document.querySelectorAll('.book-verse').forEach(v => {
        v.classList.remove('verse-appear');
        v.style.opacity = '0';
      });
      document.body.style.overflow = '';
    }, 500);

    if (previousFocus) {
      previousFocus.focus();
      previousFocus = null;
    }
    currentKey = null;
  }

  function backdrop() {
    return document.getElementById('bookBackdrop');
  }

  // ── Event Wiring ───────────────────────────────────────────
  function wireEvents() {
    // Sola cards
    document.querySelectorAll('.sola-card[data-sola]').forEach(card => {
      card.setAttribute('tabindex', '0');
      card.setAttribute('role', 'button');
      card.setAttribute('aria-haspopup', 'dialog');

      card.addEventListener('click', () => {
        openBook(card.dataset.sola);
      });
      card.addEventListener('keydown', e => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          openBook(card.dataset.sola);
        }
      });
    });

    // Close button
    document.getElementById('bookClose').addEventListener('click', closeBook);

    // Backdrop click-outside
    backdrop().addEventListener('click', e => {
      if (e.target === backdrop()) closeBook();
    });

    // Escape key
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && backdrop().classList.contains('is-open')) {
        closeBook();
      }
    });

    // Focus trap inside modal
    backdrop().addEventListener('keydown', e => {
      if (e.key !== 'Tab') return;
      const focusables = backdrop().querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      const first = focusables[0];
      const last  = focusables[focusables.length - 1];
      if (e.shiftKey) {
        if (document.activeElement === first) { e.preventDefault(); last.focus(); }
      } else {
        if (document.activeElement === last)  { e.preventDefault(); first.focus(); }
      }
    });
  }

  // ── Init ───────────────────────────────────────────────────
  function init() {
    injectMoteKeyframe();
    buildModal();
    wireEvents();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
