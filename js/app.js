/**
 * 海洋職人 (Ocean Craftsman) - 魚類百科
 * 互動核心邏輯 (Interactive Core Application Logic)
 */

document.addEventListener('DOMContentLoaded', () => {
  // --- 狀態管理 (App State) ---
  const state = {
    species: window.SPECIES_DATA || [],
    filteredSpecies: window.SPECIES_DATA || [],
    currentCategory: 'all',
    currentDifficulty: 'all',
    searchQuery: '',
    sortBy: 'default',
    viewMode: 'grid', // 'grid' | 'list'
    favorites: JSON.parse(localStorage.getItem('ocean_craftsman_favs') || '[]'),
    compatTank: JSON.parse(localStorage.getItem('ocean_craftsman_compat_tank') || '[]'),
    waterLogs: JSON.parse(localStorage.getItem('ocean_craftsman_water_logs') || 'null'),
    tanks: JSON.parse(localStorage.getItem('ocean_craftsman_tanks') || 'null'),
    activeTankId: localStorage.getItem('ocean_craftsman_active_tank_id') || null,
    activeChartTab: 'nitrogen',
    activeModalSpecies: null,
    isAudioPlaying: false,
    audioContext: null,
    audioNodes: null
  };

  // --- DOM 元素快取 (DOM Selectors) ---
  const el = {
    // 導覽列
    navbar: document.querySelector('.navbar'),
    navLinks: document.querySelectorAll('.nav-link'),
    btnWishlist: document.getElementById('btn-wishlist'),
    wishlistCount: document.getElementById('wishlist-count'),
    btnAudio: document.getElementById('btn-audio'),
    
    // 訪客計數器
    navVisitorCount: document.getElementById('nav-visitor-count'),
    heroVisitorStat: document.getElementById('hero-visitor-stat'),
    footerTotalVisits: document.getElementById('footer-total-visits'),
    footerTodayVisits: document.getElementById('footer-today-visits'),
    footerUserRank: document.getElementById('footer-user-rank'),
    navVisitorBadge: document.getElementById('nav-visitor-badge'),
    btnReplay3d: document.getElementById('btn-replay-3d-entrance'),
    curtain3d: document.getElementById('aquatic-welcome-curtain'),
    toastEl: document.getElementById('ocean-toast'),
    toastMsg: document.getElementById('toast-message'),

    // 精選區塊
    curatedGrid: document.getElementById('curated-grid'),

    // 百科典藏區塊
    speciesGrid: document.getElementById('species-grid'),
    searchInput: document.getElementById('search-species'),
    searchClearBtn: document.getElementById('search-clear-btn'),
    sortSelect: document.getElementById('sort-species'),
    categoryChips: document.querySelectorAll('.filter-chip[data-category]'),
    difficultyChips: document.querySelectorAll('.diff-chip[data-diff]'),
    btnGridView: document.getElementById('btn-view-grid'),
    btnListView: document.getElementById('btn-view-list'),
    resultsCount: document.getElementById('results-count'),

    // 物種詳細彈窗
    speciesModal: document.getElementById('species-modal'),
    modalCloseBtn: document.getElementById('modal-close-btn'),
    modalContent: document.getElementById('modal-body-dynamic'),

    // 收藏清單抽屜
    wishlistDrawer: document.getElementById('wishlist-drawer'),
    wishlistOverlay: document.getElementById('wishlist-overlay'),
    wishlistCloseBtn: document.getElementById('wishlist-close-btn'),
    wishlistItemsContainer: document.getElementById('wishlist-items-container'),
    btnExportWishlist: document.getElementById('btn-export-wishlist'),
    btnClearWishlist: document.getElementById('btn-clear-wishlist'),

    // 混養相容性實驗室
    compatSelect: document.getElementById('compat-species-select'),
    compatQtyInput: document.getElementById('compat-add-qty'),
    btnCompatAdd: document.getElementById('btn-compat-add'),
    compatTankList: document.getElementById('compat-tank-list'),
    compatTotalFishCount: document.getElementById('compat-total-fish-count'),
    btnClearCompat: document.getElementById('btn-clear-compat'),
    compatScoreNum: document.getElementById('compat-score-num'),
    scoreCircle: document.getElementById('score-circle'),
    compatGradeBadge: document.getElementById('compat-grade-badge'),
    compatScoreTitle: document.getElementById('compat-score-title'),
    compatScoreSummary: document.getElementById('compat-score-summary'),
    diagTempStatus: document.getElementById('diag-temp-status'),
    diagTempBody: document.getElementById('diag-temp-body'),
    diagPhStatus: document.getElementById('diag-ph-status'),
    diagPhBody: document.getElementById('diag-ph-body'),
    diagTemperStatus: document.getElementById('diag-temper-status'),
    diagTemperBody: document.getElementById('diag-temper-body'),
    diagLayerStatus: document.getElementById('diag-layer-status'),
    diagLayerBody: document.getElementById('diag-layer-body'),
    compatAdviceContent: document.getElementById('compat-advice-content'),
    btnExportCompat: document.getElementById('btn-export-compat'),
    btnSyncToCalc: document.getElementById('btn-sync-to-calc'),
    compatPresetBtns: document.querySelectorAll('.compat-preset-btn'),

    // 魚缸計算機
    tankLength: document.getElementById('calc-length'),
    tankWidth: document.getElementById('calc-width'),
    tankHeight: document.getElementById('calc-height'),
    tankSubstrate: document.getElementById('calc-substrate'),
    tankFishLength: document.getElementById('calc-fish-cm'),
    presetBtns: document.querySelectorAll('.btn-tank-preset'),
    outGrossVol: document.getElementById('out-gross-vol'),
    outNetVol: document.getElementById('out-net-vol'),
    outFilterFlow: document.getElementById('out-filter-flow'),
    outHeaterWatt: document.getElementById('out-heater-watt'),
    outDensityStatus: document.getElementById('out-density-status'),
    outDensityDesc: document.getElementById('out-density-desc'),
    densityEvalBox: document.getElementById('density-eval-box'),

    // 燈箱展示
    lightbox: document.getElementById('gallery-lightbox'),
    lightboxImg: document.getElementById('lightbox-img'),
    lightboxCaption: document.getElementById('lightbox-caption'),
    lightboxClose: document.getElementById('lightbox-close'),

    // 我的魚缸建立管家
    mtTabsList: document.getElementById('mytank-tabs-list'),
    btnCreateTank: document.getElementById('btn-create-tank'),
    btnDeleteTank: document.getElementById('btn-delete-tank'),
    mtForm: document.getElementById('mytank-form'),
    mtName: document.getElementById('mt-name'),
    mtLength: document.getElementById('mt-length'),
    mtWidth: document.getElementById('mt-width'),
    mtHeight: document.getElementById('mt-height'),
    mtSubstrateType: document.getElementById('mt-substrate-type'),
    mtSubstrateCm: document.getElementById('mt-substrate-cm'),
    mtPlants: document.getElementById('mt-plants'),
    mtSpeciesSelect: document.getElementById('mt-species-select'),
    mtSpeciesQty: document.getElementById('mt-species-qty'),
    btnMtAddFish: document.getElementById('btn-mt-add-fish'),
    mtFishChipsContainer: document.getElementById('mt-fish-chips-container'),
    mtTotalFishNum: document.getElementById('mt-total-fish-num'),
    mtFilter: document.getElementById('mt-filter'),
    mtLight: document.getElementById('mt-light'),
    mtHeater: document.getElementById('mt-heater'),
    mtDispType: document.getElementById('mt-disp-type'),
    mtDispName: document.getElementById('mt-disp-name'),
    mtDispDims: document.getElementById('mt-disp-dims'),
    mtDispHealthBadge: document.getElementById('mt-disp-health-badge'),
    mtOutNetVol: document.getElementById('mt-out-net-vol'),
    mtOutFishCount: document.getElementById('mt-out-fish-count'),
    mtOutFilterName: document.getElementById('mt-out-filter-name'),
    mtOutHeaterName: document.getElementById('mt-out-heater-name'),
    mtCalcDensityStatus: document.getElementById('mt-calc-density-status'),
    mtCalcDensityDesc: document.getElementById('mt-calc-density-desc'),
    mtCalcNetWater: document.getElementById('mt-calc-net-water'),
    mtCalcNetDesc: document.getElementById('mt-calc-net-desc'),
    mtCalcWaterChange: document.getElementById('mt-calc-water-change'),
    mtCalcChangeDesc: document.getElementById('mt-calc-change-desc'),
    mtDiagItemsList: document.getElementById('mt-diag-items-list'),
    btnCopyTankReport: document.getElementById('btn-copy-tank-report'),

    // 水質日誌系統
    wlForm: document.getElementById('waterlog-form'),
    wlInDate: document.getElementById('wl-in-date'),
    wlInTemp: document.getElementById('wl-in-temp'),
    wlInPh: document.getElementById('wl-in-ph'),
    wlInKh: document.getElementById('wl-in-kh'),
    wlInGh: document.getElementById('wl-in-gh'),
    wlInNh3: document.getElementById('wl-in-nh3'),
    wlInNo2: document.getElementById('wl-in-no2'),
    wlInNo3: document.getElementById('wl-in-no3'),
    wlInNotes: document.getElementById('wl-in-notes'),
    wlHealthTitle: document.getElementById('wl-health-title'),
    wlHealthPill: document.getElementById('wl-health-pill'),
    wlHealthDesc: document.getElementById('wl-health-desc'),
    wlToxicityTitle: document.getElementById('wl-toxicity-title'),
    wlToxicityPill: document.getElementById('wl-toxicity-pill'),
    wlToxicityDesc: document.getElementById('wl-toxicity-desc'),
    wlActionTitle: document.getElementById('wl-action-title'),
    wlActionPill: document.getElementById('wl-action-pill'),
    wlActionDesc: document.getElementById('wl-action-desc'),
    wlChartCanvas: document.getElementById('waterlog-chart-canvas'),
    wlChartTooltip: document.getElementById('chart-tooltip'),
    wlChartLegendBar: document.getElementById('chart-legend-bar'),
    wlTableBody: document.getElementById('waterlog-table-body'),
    wlHistoryCount: document.getElementById('wl-history-count'),
    btnExportCsv: document.getElementById('btn-export-csv'),
    btnClearWaterlogs: document.getElementById('btn-clear-waterlogs'),
    btnLoadSampleData: document.getElementById('btn-load-sample-data'),
    chartTabBtns: document.querySelectorAll('.chart-tab-btn')
  };

  // ==========================================
  // 1. 初始化與事件綁定 (Initialization & Events)
  // ==========================================
  function init() {
    renderCuratedFlagships();
    filterAndRenderSpecies();
    updateWishlistBadge();
    bindEvents();
    initVisitorCounter();
    initCompatibilityMatcher();
    initMyTankManager();
    initWaterLogger();
    calculateTankParameters();
    initScrollSpy();
    initAquaticWelcome3D();
    initGuestbookReviews();
  }

  function bindEvents() {
    // 滾動導覽列效果
    window.addEventListener('scroll', () => {
      if (window.scrollY > 50) {
        el.navbar.classList.add('scrolled');
      } else {
        el.navbar.classList.remove('scrolled');
      }
    });

    // 搜尋即時過濾
    if (el.searchInput) {
      el.searchInput.addEventListener('input', (e) => {
        state.searchQuery = e.target.value.trim().toLowerCase();
        if (el.searchClearBtn) {
          el.searchClearBtn.style.display = state.searchQuery ? 'block' : 'none';
        }
        filterAndRenderSpecies();
      });
    }

    if (el.searchClearBtn) {
      el.searchClearBtn.addEventListener('click', () => {
        el.searchInput.value = '';
        state.searchQuery = '';
        el.searchClearBtn.style.display = 'none';
        filterAndRenderSpecies();
      });
    }

    // 分類篩選標籤
    el.categoryChips.forEach(chip => {
      chip.addEventListener('click', () => {
        el.categoryChips.forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        state.currentCategory = chip.getAttribute('data-category');
        filterAndRenderSpecies();
      });
    });

    // 難度篩選標籤
    el.difficultyChips.forEach(chip => {
      chip.addEventListener('click', () => {
        el.difficultyChips.forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        state.currentDifficulty = chip.getAttribute('data-diff');
        filterAndRenderSpecies();
      });
    });

    // 排序下拉選單
    if (el.sortSelect) {
      el.sortSelect.addEventListener('change', (e) => {
        state.sortBy = e.target.value;
        filterAndRenderSpecies();
      });
    }

    // 視圖切換 (Grid vs List)
    if (el.btnGridView && el.btnListView) {
      el.btnGridView.addEventListener('click', () => {
        state.viewMode = 'grid';
        el.btnGridView.classList.add('active');
        el.btnListView.classList.remove('active');
        el.speciesGrid.classList.remove('list-view');
      });

      el.btnListView.addEventListener('click', () => {
        state.viewMode = 'list';
        el.btnListView.classList.add('active');
        el.btnGridView.classList.remove('active');
        el.speciesGrid.classList.add('list-view');
      });
    }

    // 收藏抽屜開關
    if (el.btnWishlist) {
      el.btnWishlist.addEventListener('click', openWishlistDrawer);
    }
    if (el.wishlistCloseBtn) {
      el.wishlistCloseBtn.addEventListener('click', closeWishlistDrawer);
    }
    if (el.wishlistOverlay) {
      el.wishlistOverlay.addEventListener('click', closeWishlistDrawer);
    }
    if (el.btnClearWishlist) {
      el.btnClearWishlist.addEventListener('click', clearAllFavorites);
    }
    if (el.btnExportWishlist) {
      el.btnExportWishlist.addEventListener('click', exportWishlistReport);
    }

    // 彈窗關閉
    if (el.modalCloseBtn) {
      el.modalCloseBtn.addEventListener('click', closeSpeciesModal);
    }
    if (el.speciesModal) {
      el.speciesModal.addEventListener('click', (e) => {
        if (e.target === el.speciesModal) {
          closeSpeciesModal();
        }
      });
    }

    // ESC 鍵關閉所有彈窗
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        closeSpeciesModal();
        closeWishlistDrawer();
        closeLightbox();
      }
    });

    // 計算機輸入即時運算
    const calcInputs = [el.tankLength, el.tankWidth, el.tankHeight, el.tankSubstrate, el.tankFishLength];
    calcInputs.forEach(input => {
      if (input) {
        input.addEventListener('input', calculateTankParameters);
      }
    });

    // 計算機預設規格按鈕
    el.presetBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const l = btn.getAttribute('data-l');
        const w = btn.getAttribute('data-w');
        const h = btn.getAttribute('data-h');
        if (l && w && h) {
          el.tankLength.value = l;
          el.tankWidth.value = w;
          el.tankHeight.value = h;
          calculateTankParameters();
        }
      });
    });

    // 音效切換
    if (el.btnAudio) {
      el.btnAudio.addEventListener('click', toggleOceanSoundscape);
    }

    // 燈箱項目點擊
    document.querySelectorAll('.gallery-item').forEach(item => {
      item.addEventListener('click', () => {
        const img = item.querySelector('img');
        const title = item.querySelector('.gallery-item-title')?.textContent || '微距攝影展示';
        const desc = item.querySelector('.gallery-item-desc')?.textContent || '';
        openLightbox(img.src, title, desc);
      });
    });

    if (el.lightboxClose) {
      el.lightboxClose.addEventListener('click', closeLightbox);
    }
    if (el.lightbox) {
      el.lightbox.addEventListener('click', (e) => {
        if (e.target === el.lightbox) closeLightbox();
      });
    }
  }

  // ==========================================
  // 2. 精選旗艦魚種渲染 (Curated Species)
  // ==========================================
  function renderCuratedFlagships() {
    if (!el.curatedGrid) return;
    const featuredItems = state.species.filter(s => s.featured).slice(0, 6);

    el.curatedGrid.innerHTML = featuredItems.map(item => `
      <div class="curated-card">
        <div class="curated-card-media">
          <img src="${item.image}" alt="${item.name}" loading="lazy" onerror="this.onerror=null; this.src='images/discus.jpg';">
          <div class="curated-badge">${item.badge || item.categoryLabel}</div>
        </div>
        <div class="curated-card-body">
          <div class="curated-species-names">
            <h3>${item.name}</h3>
            <div class="sci-name">${item.sciName}</div>
          </div>
          <div class="curated-meta-pills">
            <div class="meta-pill temp"><i class="fas fa-temperature-low"></i> ${item.tempMin}~${item.tempMax}°C</div>
            <div class="meta-pill ph"><i class="fas fa-vial"></i> pH ${item.phMin}~${item.phMax}</div>
            <div class="meta-pill"><i class="fas fa-ruler-horizontal"></i> ${item.sizeCm} cm</div>
          </div>
          <p style="font-size: 0.84rem; color: var(--text-secondary); line-height: 1.5; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">
            ${item.craftsmanTip}
          </p>
          <div class="curated-card-footer">
            <div class="card-stars-difficulty">
              <span>難度:</span>
              ${renderStarRating(item.difficulty)}
            </div>
            <button class="btn-card-detail" onclick="window.oceanApp.openSpeciesDetail('${item.id}')">
              探索職人檔案 <i class="fas fa-arrow-right"></i>
            </button>
          </div>
        </div>
      </div>
    `).join('');
  }

  // ==========================================
  // 3. 50 種魚種搜尋、過濾與排序渲染 (Filter & Render 50)
  // ==========================================
  function filterAndRenderSpecies() {
    let result = [...state.species];

    // 分類過濾
    if (state.currentCategory !== 'all') {
      result = result.filter(item => item.category === state.currentCategory);
    }

    // 難度過濾
    if (state.currentDifficulty !== 'all') {
      if (state.currentDifficulty === 'easy') {
        result = result.filter(item => item.difficulty <= 2);
      } else if (state.currentDifficulty === 'medium') {
        result = result.filter(item => item.difficulty === 3 || item.difficulty === 4);
      } else if (state.currentDifficulty === 'hard') {
        result = result.filter(item => item.difficulty >= 5);
      }
    }

    // 關鍵字搜尋 (支援中英文、學名、編號、原產地、標籤)
    if (state.searchQuery) {
      const q = state.searchQuery;
      result = result.filter(item => {
        return (
          item.name.toLowerCase().includes(q) ||
          item.enName.toLowerCase().includes(q) ||
          item.sciName.toLowerCase().includes(q) ||
          item.code.toLowerCase().includes(q) ||
          item.origin.toLowerCase().includes(q) ||
          item.tags.some(t => t.toLowerCase().includes(q))
        );
      });
    }

    // 排序
    if (state.sortBy === 'diff-asc') {
      result.sort((a, b) => a.difficulty - b.difficulty);
    } else if (state.sortBy === 'diff-desc') {
      result.sort((a, b) => b.difficulty - a.difficulty);
    } else if (state.sortBy === 'size-desc') {
      result.sort((a, b) => b.sizeCm - a.sizeCm);
    } else if (state.sortBy === 'temp-desc') {
      result.sort((a, b) => b.tempMax - a.tempMax);
    }

    state.filteredSpecies = result;

    // 更新計數
    if (el.resultsCount) {
      el.resultsCount.innerHTML = `共收錄 <strong>${result.length}</strong> 種珍稀物種 (總資料庫 100 種)`;
    }

    // 渲染網格
    if (!el.speciesGrid) return;

    if (result.length === 0) {
      el.speciesGrid.innerHTML = `
        <div class="no-results-box">
          <i class="fas fa-fish"></i>
          <h3>未找到相符的魚種</h3>
          <p>請嘗試使用其他關鍵字、或重設分類與難度篩選條件</p>
        </div>
      `;
      return;
    }

    el.speciesGrid.innerHTML = result.map(species => {
      const isFav = state.favorites.includes(species.id);
      return `
        <div class="species-card" data-id="${species.id}">
          <div class="card-top-banner">
            <img src="${species.image}" alt="${species.name}" class="card-banner-bg" loading="lazy" onerror="this.onerror=null; this.src='images/discus.jpg';">
            <div class="card-badge-code">${species.code} · ${species.categoryLabel}</div>
            <button class="btn-fav-card ${isFav ? 'favorited' : ''}" 
                    title="${isFav ? '從收藏移除' : '加入收藏'}"
                    onclick="window.oceanApp.toggleFavorite('${species.id}', event)">
              <i class="fas fa-heart"></i>
            </button>
          </div>
          <div class="card-info-content">
            <div class="card-header-titles">
              <div class="species-cname">${species.name}</div>
              <div class="species-ename">${species.enName}</div>
              <div class="species-sname">${species.sciName}</div>
            </div>

            <div class="card-params-grid">
              <div class="param-cell">
                <span class="param-cell-label">適應水溫</span>
                <span class="param-cell-val highlight-temp">${species.tempMin}°C ~ ${species.tempMax}°C</span>
              </div>
              <div class="param-cell">
                <span class="param-cell-label">酸鹼度 (pH)</span>
                <span class="param-cell-val highlight-ph">pH ${species.phMin} ~ ${species.phMax}</span>
              </div>
              <div class="param-cell">
                <span class="param-cell-label">成體長度</span>
                <span class="param-cell-val">${species.sizeCm} cm</span>
              </div>
              <div class="param-cell">
                <span class="param-cell-label">飼養難度</span>
                <span class="param-cell-val" style="color: var(--primary);">${renderStarRating(species.difficulty)}</span>
              </div>
            </div>

            <div class="card-tag-chips">
              ${species.tags.map(t => `<span class="card-tag-chip">#${t}</span>`).join('')}
            </div>

            <div class="card-action-bar" style="display:flex; gap:8px;">
              <button class="btn-view-details" style="flex:1;" onclick="window.oceanApp.openSpeciesDetail('${species.id}')">
                <i class="fas fa-book-open"></i> 查閱檔案
              </button>
              <button class="btn-quick-add-compat" title="將此魚加入混養相容性實驗室" onclick="window.oceanApp.quickAddToCompat('${species.id}', event)">
                <i class="fas fa-balance-scale"></i> 混養配對
              </button>
            </div>
          </div>
        </div>
      `;
    }).join('');
  }

  // 輔助函式：星級渲染
  function renderStarRating(rating) {
    let stars = '';
    for (let i = 1; i <= 5; i++) {
      if (i <= rating) {
        stars += '<i class="fas fa-star" style="color:#f5b942; margin-right:1px;"></i>';
      } else {
        stars += '<i class="far fa-star" style="color:#475569; margin-right:1px;"></i>';
      }
    }
    return stars;
  }

  // ==========================================
  // 4. 物種詳細彈窗 (Species Modal)
  // ==========================================
  function openSpeciesDetail(speciesId) {
    const item = state.species.find(s => s.id === speciesId);
    if (!item || !el.speciesModal || !el.modalContent) return;

    state.activeModalSpecies = item;
    const isFav = state.favorites.includes(item.id);

    el.modalContent.innerHTML = `
      <div class="modal-header-banner">
        <div class="modal-species-media">
          <img src="${item.image}" alt="${item.name}" onerror="this.onerror=null; this.src='images/discus.jpg';">
          <div class="curated-badge" style="top:12px; left:12px;">${item.badge || item.code}</div>
        </div>
        <div class="modal-title-area">
          <div style="display:flex; align-items:center; justify-content:space-between; gap:12px; margin-bottom:6px; flex-wrap:wrap;">
            <span style="background:rgba(245,185,66,0.15); border:1px solid var(--border-gold); color:var(--primary); font-size:0.78rem; padding:3px 10px; border-radius:var(--radius-full); font-weight:700;">
              ${item.code} · ${item.categoryLabel}
            </span>
            <div style="display:flex; gap:8px;">
              <button class="btn-primary" style="padding:6px 14px; font-size:0.82rem;" onclick="window.oceanApp.quickAddToCompat('${item.id}');">
                <i class="fas fa-balance-scale"></i> 加入混養配對
              </button>
              <button class="btn-wishlist" style="padding:6px 14px; font-size:0.82rem;" onclick="window.oceanApp.toggleFavorite('${item.id}', event)">
                <i class="fas fa-heart" style="color:${isFav ? 'var(--accent-ruby)' : 'inherit'}"></i> ${isFav ? '已收藏' : '加入收藏'}
              </button>
            </div>
          </div>
          <h2>${item.name}</h2>
          <div class="modal-sci-name">${item.sciName} (${item.enName})</div>
          <div class="modal-origin"><i class="fas fa-map-marker-alt" style="color:var(--accent-coral); margin-right:6px;"></i> 原產流域：${item.origin}</div>
          <div style="margin-top:12px; display:flex; align-items:center; gap:8px;">
            <span style="font-size:0.86rem; color:var(--text-muted);">飼育難度等級：</span>
            ${renderStarRating(item.difficulty)}
          </div>
        </div>
      </div>

      <!-- 水質儀表盤指標 -->
      <div class="modal-meters-grid">
        <div class="meter-card">
          <div class="meter-card-label"><i class="fas fa-temperature-low" style="color:var(--accent-coral);"></i> 適應水溫</div>
          <div class="meter-card-value" style="color:var(--accent-coral);">${item.tempMin}°C ~ ${item.tempMax}°C</div>
        </div>
        <div class="meter-card">
          <div class="meter-card-label"><i class="fas fa-vial" style="color:var(--accent-cyan);"></i> 酸鹼度 (pH)</div>
          <div class="meter-card-value" style="color:var(--accent-cyan);">pH ${item.phMin} ~ ${item.phMax}</div>
        </div>
        <div class="meter-card">
          <div class="meter-card-label"><i class="fas fa-tint" style="color:var(--accent-emerald);"></i> 總硬度 (GH)</div>
          <div class="meter-card-value" style="color:var(--accent-emerald);">${item.ghMin} ~ ${item.ghMax} °dGH</div>
        </div>
        <div class="meter-card">
          <div class="meter-card-label"><i class="fas fa-ruler-combined" style="color:var(--primary);"></i> 最大成體</div>
          <div class="meter-card-value">${item.sizeCm} cm</div>
        </div>
      </div>

      <!-- 職人飼育秘訣 -->
      <div class="modal-craftsman-tip-box">
        <div class="tip-box-title">
          <i class="fas fa-gem"></i> 職人飼育心得與水質要點 (Craftsman Protocol)
        </div>
        <div class="tip-box-desc">
          ${item.craftsmanTip}
        </div>
      </div>

      <!-- 詳細生物學與飼育參數 -->
      <div class="modal-detail-specs-table">
        <div class="spec-item">
          <span class="spec-key"><i class="fas fa-layer-group"></i> 棲息水層</span>
          <span class="spec-val">${item.swimmingLayer}</span>
        </div>
        <div class="spec-item">
          <span class="spec-key"><i class="fas fa-heart"></i> 性情與社會性</span>
          <span class="spec-val">${item.temperament}</span>
        </div>
        <div class="spec-item">
          <span class="spec-key"><i class="fas fa-utensils"></i> 食性建議</span>
          <span class="spec-val">${item.diet}</span>
        </div>
        <div class="spec-item">
          <span class="spec-key"><i class="fas fa-mountain"></i> 推薦底砂</span>
          <span class="spec-val">${item.substrate}</span>
        </div>
        <div class="spec-item">
          <span class="spec-key"><i class="fas fa-water"></i> 水流與溶氧</span>
          <span class="spec-val">${item.waterFlow}</span>
        </div>
        <div class="spec-item">
          <span class="spec-key"><i class="fas fa-certificate"></i> 保育 / 檢疫規格</span>
          <span class="spec-val">${item.citesStatus}</span>
        </div>
      </div>
    `;

    el.speciesModal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeSpeciesModal() {
    if (el.speciesModal) {
      el.speciesModal.classList.remove('active');
      document.body.style.overflow = '';
      state.activeModalSpecies = null;
    }
  }

  // ==========================================
  // 5. 收藏清單系統 (Wishlist / Favorites)
  // ==========================================
  function toggleFavorite(speciesId, event) {
    if (event) event.stopPropagation();

    const idx = state.favorites.indexOf(speciesId);
    if (idx > -1) {
      state.favorites.splice(idx, 1);
    } else {
      state.favorites.push(speciesId);
    }

    localStorage.setItem('ocean_craftsman_favs', JSON.stringify(state.favorites));
    updateWishlistBadge();
    renderWishlistDrawerItems();
    filterAndRenderSpecies();

    // 若當前有開啟彈窗，刷新按鈕狀態
    if (state.activeModalSpecies && state.activeModalSpecies.id === speciesId) {
      openSpeciesDetail(speciesId);
    }
  }

  function updateWishlistBadge() {
    if (el.wishlistCount) {
      el.wishlistCount.textContent = state.favorites.length;
    }
  }

  function openWishlistDrawer() {
    renderWishlistDrawerItems();
    if (el.wishlistDrawer) el.wishlistDrawer.classList.add('open');
    if (el.wishlistOverlay) el.wishlistOverlay.classList.add('active');
  }

  function closeWishlistDrawer() {
    if (el.wishlistDrawer) el.wishlistDrawer.classList.remove('open');
    if (el.wishlistOverlay) el.wishlistOverlay.classList.remove('active');
  }

  function renderWishlistDrawerItems() {
    if (!el.wishlistItemsContainer) return;

    if (state.favorites.length === 0) {
      el.wishlistItemsContainer.innerHTML = `
        <div style="text-align:center; padding:40px 10px; color:var(--text-muted);">
          <i class="far fa-heart" style="font-size:2.5rem; margin-bottom:12px; color:var(--text-dim);"></i>
          <p>您的職人水族願望清單目前為空</p>
          <span style="font-size:0.8rem;">在魚種卡片上點擊愛心即可收藏</span>
        </div>
      `;
      return;
    }

    const favItems = state.species.filter(s => state.favorites.includes(s.id));

    el.wishlistItemsContainer.innerHTML = favItems.map(item => `
      <div class="wishlist-item-card">
        <div class="wishlist-item-info">
          <h4>${item.name} (${item.code})</h4>
          <p>${item.tempMin}~${item.tempMax}°C · pH ${item.phMin}~${item.phMax} · 難度 ★${item.difficulty}</p>
        </div>
        <button class="btn-remove-wishlist" onclick="window.oceanApp.toggleFavorite('${item.id}', event)" title="移除">
          <i class="fas fa-trash-alt"></i>
        </button>
      </div>
    `).join('');
  }

  function clearAllFavorites() {
    if (confirm('確定要清空所有收藏的魚種清單嗎？')) {
      state.favorites = [];
      localStorage.setItem('ocean_craftsman_favs', JSON.stringify(state.favorites));
      updateWishlistBadge();
      renderWishlistDrawerItems();
      filterAndRenderSpecies();
    }
  }

  function exportWishlistReport() {
    const favItems = state.species.filter(s => state.favorites.includes(s.id));
    if (favItems.length === 0) {
      alert('清單中尚無收藏魚種！');
      return;
    }

    let report = `========================================\n`;
    report += `海洋職人 (Ocean Craftsman) - 魚類養殖配置清單\n`;
    report += `生成時間：${new Date().toLocaleString()}\n`;
    report += `共收錄 ${favItems.length} 種珍稀物種\n`;
    report += `========================================\n\n`;

    favItems.forEach((item, index) => {
      report += `[${index + 1}] ${item.name} (${item.enName})\n`;
      report += `    學名：${item.sciName} | 編號：${item.code}\n`;
      report += `    水溫：${item.tempMin}~${item.tempMax}°C | 酸鹼度：pH ${item.phMin}~${item.phMax}\n`;
      report += `    體長：${item.sizeCm}cm | 難度等級：★${item.difficulty}\n`;
      report += `    原產地：${item.origin}\n`;
      report += `    職人秘訣：${item.craftsmanTip}\n\n`;
    });

    const blob = new Blob([report], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `海洋職人_水族配置清單_${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }

  // ==========================================
  // 6. 職人魚缸水質與體積計算機 (Tank Calculator)
  // ==========================================
  function calculateTankParameters() {
    if (!el.tankLength || !el.tankWidth || !el.tankHeight) return;

    const length = parseFloat(el.tankLength.value) || 60;
    const width = parseFloat(el.tankWidth.value) || 30;
    const height = parseFloat(el.tankHeight.value) || 36;
    const substrateHeight = parseFloat(el.tankSubstrate?.value) || 3;
    const totalFishCm = parseFloat(el.tankFishLength?.value) || 20;

    // 總水容量 Gross Volume = (長 x 寬 x 高) / 1000 (公升)
    const grossVolume = (length * width * height) / 1000;

    // 扣除頂部留水邊 (約 3cm) 與底砂體積
    const effectiveWaterHeight = Math.max(height - substrateHeight - 3, 5);
    const netVolume = (length * width * effectiveWaterHeight) / 1000 * 0.95; // 扣除沉木造景約 5%

    // 推薦過濾器循環流量 (每小時水體 5~8 次循環)
    const minFlow = Math.round(netVolume * 5);
    const maxFlow = Math.round(netVolume * 8);

    // 推薦加熱棒瓦數 (一般每公升 1.5 ~ 2 瓦)
    const recommendedWatt = Math.ceil((netVolume * 1.5) / 25) * 25; // 取 25W 整倍數

    // 更新 DOM
    if (el.outGrossVol) el.outGrossVol.textContent = `${grossVolume.toFixed(1)} L`;
    if (el.outNetVol) el.outNetVol.textContent = `${netVolume.toFixed(1)} L`;
    if (el.outFilterFlow) el.outFilterFlow.textContent = `${minFlow} ~ ${maxFlow} L/h`;
    if (el.outHeaterWatt) el.outHeaterWatt.textContent = `${recommendedWatt} W`;

    // 養殖密度評估 (安全標準：1L 水體對應 0.8~1.0 cm 成魚長度)
    if (el.outDensityStatus && el.outDensityDesc && el.densityEvalBox) {
      const ratio = totalFishCm / netVolume;

      el.densityEvalBox.classList.remove('warning', 'danger');

      if (ratio <= 0.8) {
        el.outDensityStatus.innerHTML = '<i class="fas fa-check-circle" style="color:var(--accent-emerald);"></i> 密度優良 (安全狀態)';
        el.outDensityDesc.textContent = `當前生物負載每公升水約 ${(ratio).toFixed(2)} cm 魚體，水質緩衝極佳，適合鼠魚與各類珍稀魚種繁衍生息。`;
      } else if (ratio <= 1.2) {
        el.densityEvalBox.classList.add('warning');
        el.outDensityStatus.innerHTML = '<i class="fas fa-exclamation-circle" style="color:var(--primary);"></i> 密度適中 (需維持良好過濾)';
        el.outDensityDesc.textContent = `當前生物負載每公升水約 ${(ratio).toFixed(2)} cm 魚體，請確保過濾流量維持在 ${maxFlow} L/h 以上並每週換水 25%。`;
      } else {
        el.densityEvalBox.classList.add('danger');
        el.outDensityStatus.innerHTML = '<i class="fas fa-exclamation-triangle" style="color:var(--accent-coral);"></i> 密度偏高 (建議擴缸或加強溶氧)';
        el.outDensityDesc.textContent = `當前生物負載每公升水約 ${(ratio).toFixed(2)} cm 魚體，高密度環境可能造成溶氧不足與鼠魚鬍鬚融損，建議調整魚隻數量。`;
      }
    }
  }

  // ==========================================
  // 7. 微距燈箱展示 (Lightbox)
  // ==========================================
  function openLightbox(src, title, desc) {
    if (!el.lightbox || !el.lightboxImg) return;
    el.lightboxImg.src = src;
    if (el.lightboxCaption) {
      el.lightboxCaption.innerHTML = `<h3>${title}</h3><p>${desc}</p>`;
    }
    el.lightbox.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeLightbox() {
    if (el.lightbox) {
      el.lightbox.classList.remove('active');
      document.body.style.overflow = '';
    }
  }

  // ==========================================
  // 8. 水下環境氛圍音效 (Ocean Soundscape Synth)
  // ==========================================
  function toggleOceanSoundscape() {
    if (!state.isAudioPlaying) {
      startAmbientSynth();
      state.isAudioPlaying = true;
      if (el.btnAudio) el.btnAudio.classList.add('playing');
    } else {
      stopAmbientSynth();
      state.isAudioPlaying = false;
      if (el.btnAudio) el.btnAudio.classList.remove('playing');
    }
  }

  function startAmbientSynth() {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!state.audioContext) {
        state.audioContext = new AudioCtx();
      }

      if (state.audioContext.state === 'suspended') {
        state.audioContext.resume();
      }

      // 生成粉紅/棕色水流噪聲
      const bufferSize = state.audioContext.sampleRate * 2;
      const noiseBuffer = state.audioContext.createBuffer(1, bufferSize, state.audioContext.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      let lastOut = 0.0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        output[i] = (lastOut + (0.02 * white)) / 1.02;
        lastOut = output[i];
        output[i] *= 3.5;
      }

      const whiteNoise = state.audioContext.createBufferSource();
      whiteNoise.buffer = noiseBuffer;
      whiteNoise.loop = true;

      // 低通濾波器模擬深海水流聲
      const filter = state.audioContext.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(320, state.audioContext.currentTime);

      const gainNode = state.audioContext.createGain();
      gainNode.gain.setValueAtTime(0.08, state.audioContext.currentTime);

      whiteNoise.connect(filter);
      filter.connect(gainNode);
      gainNode.connect(state.audioContext.destination);

      whiteNoise.start();
      state.audioNodes = { whiteNoise, filter, gainNode };
    } catch (e) {
      console.log('Audio Context not started yet:', e);
    }
  }

  function stopAmbientSynth() {
    if (state.audioNodes && state.audioNodes.whiteNoise) {
      try {
        state.audioNodes.whiteNoise.stop();
        state.audioNodes.whiteNoise.disconnect();
      } catch (e) {}
      state.audioNodes = null;
    }
  }

  // ==========================================
  // 9. 滾動監聽與高亮 (ScrollSpy)
  // ==========================================
  function initScrollSpy() {
    const sections = document.querySelectorAll('section[id]');
    window.addEventListener('scroll', () => {
      const scrollY = window.pageYOffset + 200;
      sections.forEach(sec => {
        const top = sec.offsetTop;
        const height = sec.offsetHeight;
        const id = sec.getAttribute('id');
        if (scrollY >= top && scrollY < top + height) {
          el.navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${id}`) {
              link.classList.add('active');
            }
          });
        }
      });
    });
  }

  // ==========================================
  // 10. 互動浮動提示 (Toast Notification)
  // ==========================================
  let toastTimer = null;
  function showToast(message, duration = 3200) {
    if (!el.toastEl || !el.toastMsg) return;
    el.toastMsg.textContent = message;
    el.toastEl.classList.add('show');
    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      el.toastEl.classList.remove('show');
    }, duration);
  }

  // ==========================================
  // 11. 全站即時同步瀏覽人次計數器 (Global Synchronized Visitor Counter)
  // ==========================================
  function initVisitorCounter() {
    // 自動清理舊版 1,288 基準的 localStorage 快取
    localStorage.removeItem('ocean_craftsman_visits');

    // 專屬全新雲端即時同步計數金鑰 (從 0 全新起算)
    const GLOBAL_KEY = 'ocean_craftsman_official_visits_v2';
    const API_URL = `https://countapi.mileshilliard.com/api/v1/hit/${GLOBAL_KEY}`;

    // 取得本地快取（起始為 0）
    let cachedVisits = parseInt(localStorage.getItem('ocean_craftsman_global_visits') || '0', 10);
    let todayVisits = parseInt(localStorage.getItem('ocean_craftsman_today_visits') || '0', 10);
    const todayStr = new Date().toISOString().slice(0, 10);
    const lastDate = localStorage.getItem('ocean_craftsman_visit_date');

    if (lastDate === todayStr && todayVisits > 0) {
      todayVisits += 1;
    } else {
      todayVisits = 1;
      localStorage.setItem('ocean_craftsman_visit_date', todayStr);
    }
    localStorage.setItem('ocean_craftsman_today_visits', todayVisits.toString());

    // 立即以現有快取渲染 (起始顯示 0)
    renderVisitCounts(cachedVisits, todayVisits, false);

    // 呼叫雲端跨裝置即時同步計數 API
    fetch(API_URL)
      .then(res => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then(data => {
        if (data && typeof data.value === 'number') {
          const globalCount = data.value;
          localStorage.setItem('ocean_craftsman_global_visits', globalCount.toString());
          renderVisitCounts(globalCount, todayVisits, true);
        }
      })
      .catch(err => {
        console.warn('無法連線至雲端即時計數伺服器，切換為本地計數模式:', err);
        cachedVisits += 1;
        localStorage.setItem('ocean_craftsman_global_visits', cachedVisits.toString());
        renderVisitCounts(cachedVisits, todayVisits, true);
      });

    // 點擊計數徽章跳出職人致謝
    if (el.navVisitorBadge) {
      el.navVisitorBadge.addEventListener('click', () => {
        const currentCount = parseInt(localStorage.getItem('ocean_craftsman_global_visits') || '0', 10);
        showToast(`✨ 感謝蒞臨！您是本百科全球第 ${currentCount.toLocaleString()} 位水族探索鑑賞家！`);
      });
    }
  }

  function renderVisitCounts(totalVisits, todayVisits, useAnimation = true) {
    const formattedTotal = totalVisits.toLocaleString();
    const formattedToday = todayVisits.toLocaleString();

    if (useAnimation) {
      animateCountUp(el.navVisitorCount, totalVisits, 1200);
      animateCountUp(el.heroVisitorStat, totalVisits, 1500);
      animateCountUp(el.footerTotalVisits, totalVisits, 1200);
    } else {
      if (el.navVisitorCount) el.navVisitorCount.textContent = formattedTotal;
      if (el.heroVisitorStat) el.heroVisitorStat.textContent = formattedTotal;
      if (el.footerTotalVisits) el.footerTotalVisits.textContent = formattedTotal;
    }

    if (el.footerTodayVisits) el.footerTodayVisits.textContent = formattedToday;
    if (el.footerUserRank) el.footerUserRank.textContent = `第 ${formattedTotal} 位`;
  }

  function animateCountUp(targetElement, targetVal, durationMs = 1000) {
    if (!targetElement) return;
    const startVal = Math.max(0, targetVal - 40);
    const startTime = performance.now();

    function updateCounter(currentTime) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / durationMs, 1);
      // Ease-out cubic
      const ease = 1 - Math.pow(1 - progress, 3);
      const currentVal = Math.floor(startVal + (targetVal - startVal) * ease);
      targetElement.textContent = currentVal.toLocaleString();
      if (progress < 1) {
        requestAnimationFrame(updateCounter);
      } else {
        targetElement.textContent = targetVal.toLocaleString();
      }
    }
    requestAnimationFrame(updateCounter);
  }

  // ==========================================
  // 12. 魚類混養相容性智能配對實驗室 (Compatibility Lab)
  // ==========================================
  function initCompatibilityMatcher() {
    // 1. 填入 100 種魚類下拉選單 (按分類分組)
    if (el.compatSelect) {
      const categories = [
        { keys: ['angelfish'], label: '神仙魚品系大系 (Pterophyllum 50種)' },
        { keys: ['corydoras'], label: '鼠魚深度專題 (Corydoradinae 28種)' },
        { keys: ['flagship'], label: '職人特選旗艦名種 (Flagships 7種)' },
        { keys: ['cichlids', 'cichlid'], label: '南美短鯛與特色慈鯛 (Cichlids 8種)' },
        { keys: ['tetras', 'tetra'], label: '精品加拉辛脂鯉 (Characidae 7種)' }
      ];

      let optionsHtml = '<option value="">-- 請選擇欲混養的魚種 (共100種) --</option>';
      categories.forEach(cat => {
        const catSpecies = state.species.filter(s => cat.keys.includes(s.category));
        if (catSpecies.length > 0) {
          optionsHtml += `<optgroup label="【${cat.label}】">`;
          catSpecies.forEach(sp => {
            optionsHtml += `<option value="${sp.id}">[${sp.code}] ${sp.name} (${sp.sciName}) - ${sp.sizeCm}cm</option>`;
          });
          optionsHtml += `</optgroup>`;
        }
      });
      el.compatSelect.innerHTML = optionsHtml;
    }

    // 2. 如果混養清單為空，預載經典和平群游組合 (金翅珍珠鼠 × 6 + 白金孔雀魚 × 10 + 精靈鼠 × 5)
    if (!state.compatTank || state.compatTank.length === 0) {
      state.compatTank = [
        { id: 'cory-10', qty: 6 },  // 金翅珍珠鼠
        { id: 'flag-06', qty: 10 }, // 白金全紅白子孔雀魚
        { id: 'cory-12', qty: 5 }   // 精靈鼠
      ];
      saveCompatTank();
    }

    // 3. 綁定按鈕事件
    if (el.btnCompatAdd) {
      el.btnCompatAdd.addEventListener('click', () => {
        const selectedId = el.compatSelect.value;
        const qty = parseInt(el.compatQtyInput.value, 10) || 1;
        if (!selectedId) {
          showToast('⚠️ 請先選擇欲加入的魚種！');
          return;
        }
        addSpeciesToCompat(selectedId, qty);
      });
    }

    if (el.btnClearCompat) {
      el.btnClearCompat.addEventListener('click', () => {
        if (state.compatTank.length === 0) return;
        state.compatTank = [];
        saveCompatTank();
        renderCompatTankList();
        analyzeCompatibility();
        showToast('🗑️ 已清空混養配對清單');
      });
    }

    // 快捷情境範例按鈕
    if (el.compatPresetBtns) {
      el.compatPresetBtns.forEach(btn => {
        btn.addEventListener('click', () => {
          const presetType = btn.getAttribute('data-preset');
          loadCompatPreset(presetType);
        });
      });
    }

    // 複製評估報告
    if (el.btnExportCompat) {
      el.btnExportCompat.addEventListener('click', exportCompatReport);
    }

    // 帶入魚缸計算機
    if (el.btnSyncToCalc) {
      el.btnSyncToCalc.addEventListener('click', syncCompatToTankCalc);
    }

    // 初始渲染與分析
    renderCompatTankList();
    analyzeCompatibility();
  }

  function saveCompatTank() {
    localStorage.setItem('ocean_craftsman_compat_tank', JSON.stringify(state.compatTank));
  }

  function addSpeciesToCompat(speciesId, qty = 1) {
    const existing = state.compatTank.find(item => item.id === speciesId);
    const sp = state.species.find(s => s.id === speciesId);
    const spName = sp ? sp.name : '魚隻';

    if (existing) {
      existing.qty += qty;
    } else {
      state.compatTank.push({ id: speciesId, qty: Math.max(1, qty) });
    }
    saveCompatTank();
    renderCompatTankList();
    analyzeCompatibility();
    showToast(`✅ 已將 ${spName} × ${qty} 加入混養實驗室！`);
  }

  function quickAddToCompat(speciesId, event) {
    if (event) {
      event.stopPropagation();
      event.preventDefault();
    }
    if (el.speciesModal) closeSpeciesModal();

    const sp = state.species.find(s => s.id === speciesId);
    const defaultQty = (sp && sp.sizeCm <= 4) ? 6 : (sp && sp.sizeCm <= 7) ? 4 : 2;
    addSpeciesToCompat(speciesId, defaultQty);

    const compatSec = document.getElementById('compatibility');
    if (compatSec) {
      compatSec.scrollIntoView({ behavior: 'smooth' });
    }
  }

  function updateCompatQty(speciesId, delta) {
    const item = state.compatTank.find(i => i.id === speciesId);
    if (!item) return;
    item.qty += delta;
    if (item.qty <= 0) {
      removeCompatFish(speciesId);
      return;
    }
    saveCompatTank();
    renderCompatTankList();
    analyzeCompatibility();
  }

  function removeCompatFish(speciesId) {
    state.compatTank = state.compatTank.filter(i => i.id !== speciesId);
    saveCompatTank();
    renderCompatTankList();
    analyzeCompatibility();
  }

  function loadCompatPreset(presetType) {
    if (presetType === 'peaceful-community') {
      state.compatTank = [
        { id: 'cory-10', qty: 6 },  // 金翅珍珠鼠
        { id: 'flag-06', qty: 10 }, // 白金全紅白子孔雀魚
        { id: 'cory-12', qty: 5 },  // 精靈鼠
        { id: 'tetra-01', qty: 12 } // 頂級野生寶蓮燈
      ];
      showToast('🌿 已載入「南美和平水草群游缸」經典範例');
    } else if (presetType === 'blackwater-apisto') {
      state.compatTank = [
        { id: 'cich-01', qty: 2 },  // 酋長短鯛
        { id: 'cich-02', qty: 2 },  // 荷蘭鳳凰短鯛
        { id: 'tetra-02', qty: 8 }, // 皇室紅蓮燈
        { id: 'tetra-03', qty: 10 } // 噴火燈
      ];
      showToast('🍂 已載入「弱酸黑水短鯛造景缸」經典範例');
    } else if (presetType === 'cory-paradise') {
      state.compatTank = [
        { id: 'cory-03', qty: 4 },  // 黃金雷射鼠
        { id: 'cory-05', qty: 4 },  // 超級舒瓦茲鼠
        { id: 'cory-06', qty: 4 },  // 阿道夫鼠
        { id: 'cory-08', qty: 6 }   // 熊貓鼠
      ];
      showToast('⚡ 已載入「珍稀鼠魚沙地大觀」深度專題範例');
    } else if (presetType === 'predator-conflict') {
      state.compatTank = [
        { id: 'flag-01', qty: 1 },  // 特級亞洲紅龍 (65cm 掠食)
        { id: 'flag-06', qty: 10 }, // 白金全紅白子孔雀魚 (5cm)
        { id: 'cory-12', qty: 5 }   // 精靈鼠 (2.5cm)
      ];
      showToast('🚨 已載入「掠食危險混養禁忌測試」範例');
    }
    saveCompatTank();
    renderCompatTankList();
    analyzeCompatibility();
  }

  function renderCompatTankList() {
    if (!el.compatTankList) return;

    let totalCount = 0;
    state.compatTank.forEach(item => totalCount += item.qty);
    if (el.compatTotalFishCount) {
      el.compatTotalFishCount.textContent = totalCount;
    }

    if (state.compatTank.length === 0) {
      el.compatTankList.innerHTML = `
        <div class="compat-empty-state">
          <i class="fas fa-water"></i>
          <div>目前魚缸內尚未加入任何魚種</div>
          <div style="font-size:0.78rem; margin-top:4px;">請從上方選單添加，或點擊上方「經典混養範例」！</div>
        </div>
      `;
      return;
    }

    el.compatTankList.innerHTML = state.compatTank.map(item => {
      const sp = state.species.find(s => s.id === item.id);
      if (!sp) return '';
      return `
        <div class="compat-fish-card">
          <img src="${sp.image}" alt="${sp.name}" class="compat-fish-img" onerror="this.onerror=null; this.src='images/discus.jpg';">
          <div class="compat-fish-info">
            <div class="compat-fish-name">${sp.name}</div>
            <div class="compat-fish-meta">
              <span><i class="fas fa-temperature-low"></i> ${sp.tempMin}~${sp.tempMax}°C</span>
              <span><i class="fas fa-vial"></i> pH ${sp.phMin}~${sp.phMax}</span>
              <span><i class="fas fa-ruler-horizontal"></i> ${sp.sizeCm}cm</span>
            </div>
          </div>
          <div class="compat-fish-qty-controls">
            <button class="btn-qty-step" onclick="window.oceanApp.updateCompatQty('${sp.id}', -1)">-</button>
            <span class="compat-fish-count-display">${item.qty}</span>
            <button class="btn-qty-step" onclick="window.oceanApp.updateCompatQty('${sp.id}', 1)">+</button>
          </div>
          <button class="btn-remove-fish" title="移除此魚種" onclick="window.oceanApp.removeCompatFish('${sp.id}')">
            <i class="fas fa-times"></i>
          </button>
        </div>
      `;
    }).join('');
  }

  // ==========================================
  // 13. 核心演算法：多維度混養相容性診斷分析
  // ==========================================
  function analyzeCompatibility() {
    if (!el.compatScoreNum) return;

    if (state.compatTank.length === 0) {
      resetCompatUI('請先加入魚種', '--', '尚無魚隻加入', '在左側選擇魚種以啟動分析。', 'empty');
      return;
    }

    // 取得所有選中魚種的實例
    const activeFish = [];
    state.compatTank.forEach(item => {
      const sp = state.species.find(s => s.id === item.id);
      if (sp) {
        activeFish.push({ ...sp, count: item.qty });
      }
    });

    if (activeFish.length === 1) {
      const sole = activeFish[0];
      resetCompatUI(
        '單一物種生態',
        '100',
        `${sole.name} 單種群聚`,
        `目前僅有 ${sole.name}（${sole.count} 隻）。請再加入其他魚種以分析跨物種混養相容性！`,
        'excellent'
      );
      updateSingleSpeciesDiags(sole);
      return;
    }

    // --- 開始多維度評分 (基準分 100) ---
    let score = 100;
    const notes = [];
    let isPredatorThreat = false;
    let isBettaConflict = false;

    // 1. 水溫相容分析
    const maxTempMin = Math.max(...activeFish.map(f => f.tempMin));
    const minTempMax = Math.min(...activeFish.map(f => f.tempMax));
    let tempStatus = 'pass';
    let tempText = '';

    if (maxTempMin <= minTempMax) {
      const idealTemp = ((maxTempMin + minTempMax) / 2).toFixed(1);
      const overlapSpan = minTempMax - maxTempMin;
      if (overlapSpan >= 2) {
        tempStatus = 'pass';
        tempText = `✅ <strong>水溫高度相容</strong><br>所有魚種共用適溫區間為 <strong>${maxTempMin}°C ~ ${minTempMax}°C</strong>（建議恆溫 <strong>${idealTemp}°C</strong>）。`;
      } else {
        tempStatus = 'warn';
        score -= 6;
        tempText = `⚠️ <strong>水溫重疊較窄</strong><br>適溫交集僅為 <strong>${maxTempMin}°C ~ ${minTempMax}°C</strong>，請務必精準控制水溫。`;
      }
    } else {
      tempStatus = 'fail';
      const gap = (maxTempMin - minTempMax).toFixed(1);
      score -= (20 + gap * 5);
      tempText = `❌ <strong>水溫需求嚴重衝突</strong><br>低溫需求魚隻（最高 ${minTempMax}°C）與高溫需求魚隻（最低 ${maxTempMin}°C）相差 ${gap}°C，無法同時健康生活！`;
    }

    // 2. pH 酸鹼度與硬度相容分析
    const maxPhMin = Math.max(...activeFish.map(f => f.phMin));
    const minPhMax = Math.min(...activeFish.map(f => f.phMax));
    let phStatus = 'pass';
    let phText = '';

    if (maxPhMin <= minPhMax) {
      const idealPh = ((maxPhMin + minPhMax) / 2).toFixed(1);
      phStatus = 'pass';
      phText = `✅ <strong>pH 水質相容</strong><br>共同適應酸鹼範圍為 <strong>pH ${maxPhMin.toFixed(1)} ~ ${minPhMax.toFixed(1)}</strong>（建議維持 <strong>pH ${idealPh}</strong> 中性/微酸）。`;
    } else {
      const phGap = (maxPhMin - minPhMax).toFixed(1);
      if (phGap <= 0.4) {
        phStatus = 'warn';
        score -= 8;
        phText = `⚠️ <strong>pH 範圍略有差異</strong><br>部分魚種偏好弱鹼 (如孔雀魚)，部分偏好弱酸 (如短鯛/鼠魚)。建議將水質穩定在 <strong>pH 6.8 ~ 7.0</strong> 中性緩衝。`;
      } else {
        phStatus = 'fail';
        score -= (18 + phGap * 10);
        phText = `❌ <strong>酸鹼需求不相容</strong><br>強酸黑水魚種（最高 pH ${minPhMax}）與中硬水弱鹼魚種（最低 pH ${maxPhMin}）環境落差過大。`;
      }
    }

    // 3. 掠食威脅與脾氣性格分析
    let temperStatus = 'pass';
    let temperText = '';
    const predatorFish = activeFish.filter(f => f.sizeCm >= 30 || f.id === 'flag-01' || f.id === 'flag-02');
    const smallFish = activeFish.filter(f => f.sizeCm <= 6);
    const microFish = activeFish.filter(f => f.sizeCm <= 3.5);
    const bettaFish = activeFish.find(f => f.id === 'flag-05');
    const guppyFish = activeFish.find(f => f.id === 'flag-06');

    if (predatorFish.length > 0 && smallFish.length > 0) {
      isPredatorThreat = true;
      temperStatus = 'fail';
      score -= 50;
      const predNames = predatorFish.map(f => f.name).join('、');
      const preyNames = smallFish.map(f => f.name).join('、');
      temperText = `❌ <strong>極度危險：嚴重吞食掠食威脅</strong><br>大型魚（${predNames}）成體長度達 30~65cm，會將缸內小型魚（${preyNames}）當作活餌吞食！`;
    } else if (bettaFish && bettaFish.count > 1) {
      isBettaConflict = true;
      temperStatus = 'fail';
      score -= 35;
      temperText = `❌ <strong>鬥魚同類決鬥衝突</strong><br>雄性冠尾鬥魚領地意識極強，同缸超過 1 隻將發生死鬥傷亡！`;
    } else if (bettaFish && guppyFish) {
      temperStatus = 'warn';
      score -= 10;
      temperText = `⚠️ <strong>啄鰭風險警示</strong><br>鬥魚可能會誤將孔雀魚飄逸絢麗的長尾鰭視為挑釁而進行啄咬，需密集水草遮蔽。`;
    } else {
      temperStatus = 'pass';
      temperText = `✅ <strong>性格極度溫和親善</strong><br>所選物種皆無強烈掠食性與兇悍攻擊性，能和睦共處、共享水體空間。`;
    }

    // 4. 水層立體生態分佈分析
    let layerStatus = 'pass';
    let layerText = '';
    const layerCounts = { upper: 0, mid: 0, bottom: 0 };
    let totalFishSum = 0;

    activeFish.forEach(f => {
      totalFishSum += f.count;
      const layer = (f.swimmingLayer || '').toLowerCase();
      if (layer.includes('上層') || layer.includes('中上層')) {
        layerCounts.upper += f.count;
      } else if (layer.includes('底層') || layer.includes('沙地')) {
        layerCounts.bottom += f.count;
      } else {
        layerCounts.mid += f.count;
      }
    });

    const bottomPct = Math.round((layerCounts.bottom / totalFishSum) * 100);
    const midPct = Math.round((layerCounts.mid / totalFishSum) * 100);
    const upperPct = Math.round((layerCounts.upper / totalFishSum) * 100);

    if (bottomPct >= 80 && totalFishSum > 15) {
      layerStatus = 'warn';
      score -= 5;
      layerText = `⚠️ <strong>底層水域密度偏高</strong> (${bottomPct}%)<br>沙地活動魚隻較密集，建議配置細緻圓潤矽砂並廣設沉木洞穴供底棲魚歇息。`;
    } else {
      layerStatus = 'pass';
      layerText = `✅ <strong>水層立體分佈均衡</strong><br>底層 ${bottomPct}% · 中層 ${midPct}% · 上層 ${upperPct}%。全缸視覺層次豐富，各水層魚隻不爭搶活動空間。`;
    }

    // 5. 生物長度與魚缸最低容量計算
    let totalCm = 0;
    activeFish.forEach(f => totalCm += (f.sizeCm * f.count));
    const suggestedLiters = Math.round(totalCm * 1.2);

    // 6. 計算最終評分
    let finalScore = Math.max(15, Math.min(100, Math.round(score)));
    if (isPredatorThreat) finalScore = Math.min(finalScore, 42);

    // 7. 更新 UI 元件
    el.compatScoreNum.textContent = finalScore;
    el.scoreCircle.className = 'score-circle';

    let gradeClass = 'badge-good';
    let gradeLabel = '良好相容';
    let gradeTitle = '混養生態相容評估';
    let gradeSummary = '';

    if (finalScore >= 90) {
      el.scoreCircle.classList.add('score-excellent');
      gradeClass = 'badge-excellent';
      gradeLabel = '🌟 完美共生生態 (Perfect Harmony)';
      gradeTitle = '極致相容 · 職人推薦混養名單';
      gradeSummary = '此混養組合在水溫、pH、性格與水層分佈上展現極佳的生態協同效應，非常適合長期穩定飼育！';
    } else if (finalScore >= 75) {
      el.scoreCircle.classList.add('score-good');
      gradeClass = 'badge-good';
      gradeLabel = '✅ 良好相容 (Good Compatibility)';
      gradeTitle = '相容度良好 · 需微調中介水質';
      gradeSummary = '各魚種環境偏好吻合，只需維持水溫與 pH 在交集平均值，即可建立健康活力的水族生態。';
    } else if (finalScore >= 55) {
      el.scoreCircle.classList.add('score-warning');
      gradeClass = 'badge-warning';
      gradeLabel = '⚠️ 需技巧監測 (Moderate Caution)';
      gradeTitle = '存在水質或領域差異 · 需額外照料';
      gradeSummary = '部分魚隻在水溫、pH 或活動領域存在邊界落差，建議加強過濾培菌並提供多樣化隱蔽物。';
    } else {
      el.scoreCircle.classList.add('score-danger');
      gradeClass = 'badge-danger';
      gradeLabel = '🚨 高危混養禁忌 (Critical Incompatibility)';
      gradeTitle = '強烈不建議混養 · 存在傷亡風險';
      gradeSummary = '存在嚴重的掠食吞食威脅或不可調和的水質溫差衝突，強烈建議分缸個別飼養以策安全！';
    }

    el.compatGradeBadge.className = `score-grade-badge ${gradeClass}`;
    el.compatGradeBadge.textContent = gradeLabel;
    el.compatScoreTitle.textContent = gradeTitle;
    el.compatScoreSummary.textContent = gradeSummary;

    // 更新四張診斷卡片
    updateDiagCard(el.diagTempStatus, el.diagTempBody, tempStatus, tempText);
    updateDiagCard(el.diagPhStatus, el.diagPhBody, phStatus, phText);
    updateDiagCard(el.diagTemperStatus, el.diagTemperBody, temperStatus, temperText);
    updateDiagCard(el.diagLayerStatus, el.diagLayerBody, layerStatus, layerText);

    // 8. 職人混養處方箋錦囊
    if (el.compatAdviceContent) {
      let adviceHtml = `
        <div style="margin-bottom:10px;">
          <strong>🎯 建議魚缸規格：</strong> 總體成體長度約 <strong>${totalCm.toFixed(1)} cm</strong>，建議配置至少 <strong>${suggestedLiters} 公升</strong> 水體以上之魚缸。
        </div>
        <div style="margin-bottom:10px;">
          <strong>💧 職人調水指南：</strong> 建議控制水溫於 <strong>${((Math.min(maxTempMin, minTempMax) + Math.max(maxTempMin, minTempMax))/2).toFixed(1)}°C</strong>，pH 調節至 <strong>${((maxPhMin + minPhMax)/2).toFixed(1)}</strong>。
        </div>
        <div>
          <strong>🌿 造景與餵食策略：</strong> 建議配置 0.5mm 圓潤天然河砂防鬍鬚磨損，沉底肉食錠與微顆粒緩沉飼料配合投餵，確保底層與中上層魚隻均勻攝食。
        </div>
      `;
      if (isPredatorThreat) {
        adviceHtml = `
          <div style="color:#fda4af; font-weight:700; margin-bottom:8px;">
            ⚠️ 職人緊急警告：大型掠食魚（如紅龍、魟魚）成長極為迅速，一旦體長超過小魚 3 倍以上將引發夜間追咬與吞食，切勿冒險同缸！
          </div>
        ` + adviceHtml;
      }
      el.compatAdviceContent.innerHTML = adviceHtml;
    }
  }

  function updateDiagCard(statusEl, bodyEl, status, contentHtml) {
    if (!statusEl || !bodyEl) return;
    statusEl.className = 'diag-status';
    if (status === 'pass') {
      statusEl.classList.add('status-pass');
      statusEl.textContent = '✅ 相容優良';
    } else if (status === 'warn') {
      statusEl.classList.add('status-warn');
      statusEl.textContent = '⚠️ 需留意';
    } else {
      statusEl.classList.add('status-fail');
      statusEl.textContent = '❌ 嚴重衝突';
    }
    bodyEl.innerHTML = contentHtml;
  }

  function resetCompatUI(badge, score, title, summary, type) {
    el.compatScoreNum.textContent = score;
    el.compatGradeBadge.className = 'score-grade-badge';
    el.compatGradeBadge.textContent = badge;
    el.compatScoreTitle.textContent = title;
    el.compatScoreSummary.textContent = summary;
    el.scoreCircle.className = 'score-circle';

    if (type === 'empty') {
      if (el.diagTempStatus) el.diagTempStatus.textContent = '待分析';
      if (el.diagTempBody) el.diagTempBody.textContent = '尚未加入足夠魚種進行分析。';
      if (el.diagPhStatus) el.diagPhStatus.textContent = '待分析';
      if (el.diagPhBody) el.diagPhBody.textContent = '尚未加入足夠魚種進行分析。';
      if (el.diagTemperStatus) el.diagTemperStatus.textContent = '待分析';
      if (el.diagTemperBody) el.diagTemperBody.textContent = '尚未加入足夠魚種進行分析。';
      if (el.diagLayerStatus) el.diagLayerStatus.textContent = '待分析';
      if (el.diagLayerBody) el.diagLayerBody.textContent = '尚未加入足夠魚種進行分析。';
      if (el.compatAdviceContent) el.compatAdviceContent.textContent = '請從左側添加魚種或點擊上方經典範例。';
    }
  }

  function updateSingleSpeciesDiags(sole) {
    updateDiagCard(el.diagTempStatus, el.diagTempBody, 'pass', `✅ 適應水溫：<strong>${sole.tempMin}°C ~ ${sole.tempMax}°C</strong>`);
    updateDiagCard(el.diagPhStatus, el.diagPhBody, 'pass', `✅ 酸鹼適應：<strong>pH ${sole.phMin} ~ ${sole.phMax}</strong>`);
    updateDiagCard(el.diagTemperStatus, el.diagTemperBody, 'pass', `✅ 脾氣特質：${sole.temperament || '溫和'}`);
    updateDiagCard(el.diagLayerStatus, el.diagLayerBody, 'pass', `✅ 水層空間：${sole.swimmingLayer}`);
    if (el.compatAdviceContent) {
      el.compatAdviceContent.innerHTML = `
        <div><strong>💡 飼育秘訣：</strong> ${sole.craftsmanTip || '維持穩定水質與優質過濾。'}</div>
      `;
    }
  }

  function exportCompatReport() {
    if (state.compatTank.length === 0) {
      showToast('⚠️ 魚缸內尚無魚隻可導出報告！');
      return;
    }
    const lines = [];
    lines.push('🌊 【海洋職人】魚類混養相容性智能配對報告');
    lines.push(`📅 評估日期：${new Date().toLocaleDateString('zh-TW')}`);
    lines.push('----------------------------------------');
    lines.push('🐟 缸內魚種名單：');
    let totalLen = 0;
    state.compatTank.forEach(item => {
      const sp = state.species.find(s => s.id === item.id);
      if (sp) {
        lines.push(`• ${sp.name} × ${item.qty} 隻 (${sp.tempMin}~${sp.tempMax}°C, pH ${sp.phMin}~${sp.phMax}, 成體 ${sp.sizeCm}cm)`);
        totalLen += (sp.sizeCm * item.qty);
      }
    });
    lines.push('----------------------------------------');
    lines.push(`📊 總體混養相容度評分：${el.compatScoreNum.textContent} / 100`);
    lines.push(`🏷️ 評估等級：${el.compatGradeBadge.textContent}`);
    lines.push(`💧 建議魚缸水體：至少 ${Math.round(totalLen * 1.2)} 公升 (魚體總長度合計 ${totalLen.toFixed(1)} cm)`);
    lines.push('----------------------------------------');
    lines.push('📜 海洋職人 · 100種珍稀魚類圖鑑百科');

    const textToCopy = lines.join('\n');
    navigator.clipboard.writeText(textToCopy).then(() => {
      showToast('📋 混養評估診斷報告已複製至剪貼簿！');
    }).catch(() => {
      showToast('📋 報告生成完成！');
    });
  }

  function syncCompatToTankCalc() {
    if (state.compatTank.length === 0) {
      showToast('⚠️ 請先加入魚種！');
      return;
    }
    let totalLen = 0;
    state.compatTank.forEach(item => {
      const sp = state.species.find(s => s.id === item.id);
      if (sp) totalLen += (sp.sizeCm * item.qty);
    });

    if (el.tankFishLength) {
      el.tankFishLength.value = Math.round(totalLen);
      calculateTankParameters();
      const calcSec = document.getElementById('calculator');
      if (calcSec) calcSec.scrollIntoView({ behavior: 'smooth' });
      showToast(`📏 已將總魚長 ${Math.round(totalLen)} cm 同步帶入水質計算機！`);
    }
  }

  // ==========================================
  // 14. 職人水質紀錄與監測日誌系統 (Water Logger Engine)
  // ==========================================
  function initWaterLogger() {
    // 1. 設定日期欄位預設為今日
    if (el.wlInDate) {
      el.wlInDate.value = new Date().toISOString().slice(0, 10);
    }

    // 2. 若尚無水質紀錄，自動載入 7 天逼真示範歷史數據
    if (!state.waterLogs || state.waterLogs.length === 0) {
      loadSampleWaterLogs(false);
    }

    // 3. 表單提交新增水質紀錄
    if (el.wlForm) {
      el.wlForm.addEventListener('submit', (e) => {
        e.preventDefault();
        saveNewWaterLogFromForm();
      });
    }

    // 4. 圖表分類切換 Tabs
    if (el.chartTabBtns) {
      el.chartTabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
          el.chartTabBtns.forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          state.activeChartTab = btn.getAttribute('data-chart');
          renderWaterLogChart();
        });
      });
    }

    // 5. 載入範例按鈕
    if (el.btnLoadSampleData) {
      el.btnLoadSampleData.addEventListener('click', () => {
        loadSampleWaterLogs(true);
      });
    }

    // 6. 清空數據按鈕
    if (el.btnClearWaterlogs) {
      el.btnClearWaterlogs.addEventListener('click', () => {
        if (!confirm('確定要清空所有水質紀錄日誌嗎？')) return;
        state.waterLogs = [];
        saveWaterLogs();
        analyzeLatestWaterHealth();
        renderWaterLogChart();
        renderWaterLogTable();
        showToast('🗑️ 已清空水質紀錄日誌');
      });
    }

    // 7. 導出 CSV 按鈕
    if (el.btnExportCsv) {
      el.btnExportCsv.addEventListener('click', exportWaterLogsCSV);
    }

    // 8. 綁定視窗縮放以重繪圖表
    window.addEventListener('resize', () => {
      renderWaterLogChart();
    });

    // 9. 執行初始分析與渲染
    analyzeLatestWaterHealth();
    renderWaterLogChart();
    renderWaterLogTable();
  }

  function saveWaterLogs() {
    localStorage.setItem('ocean_craftsman_water_logs', JSON.stringify(state.waterLogs));
  }

  function getDemoSevenDays() {
    const today = new Date();
    const records = [];
    const baseSamples = [
      { offset: 6, temp: 25.0, ph: 6.6, kh: 2.5, gh: 4.5, nh3: 0.00, no2: 0.00, no3: 5, notes: '換水 25% 後水質穩定清澈' },
      { offset: 5, temp: 25.2, ph: 6.7, kh: 2.5, gh: 4.5, nh3: 0.00, no2: 0.00, no3: 8, notes: '投餵活體豐年蝦與鼠魚肉食薄片' },
      { offset: 4, temp: 25.4, ph: 6.8, kh: 3.0, gh: 5.0, nh3: 0.00, no2: 0.00, no3: 12, notes: '補充活體消化菌粉，水質微循環良好' },
      { offset: 3, temp: 25.6, ph: 6.8, kh: 3.0, gh: 5.0, nh3: 0.01, no2: 0.00, no3: 16, notes: '硝化系統維持良好，溶氧充足' },
      { offset: 2, temp: 25.5, ph: 6.7, kh: 3.0, gh: 5.0, nh3: 0.00, no2: 0.00, no3: 22, notes: '修剪生長過盛水草，底砂微量吸塵' },
      { offset: 1, temp: 25.3, ph: 6.8, kh: 3.0, gh: 5.0, nh3: 0.00, no2: 0.00, no3: 28, notes: '例行更換 20% 養水，清洗前置濾棉' },
      { offset: 0, temp: 25.5, ph: 6.8, kh: 3.0, gh: 5.0, nh3: 0.00, no2: 0.00, no3: 10, notes: '換水後 NO3 明顯下降至安全區間' }
    ];

    baseSamples.forEach(sample => {
      const d = new Date(today);
      d.setDate(today.getDate() - sample.offset);
      const dateStr = d.toISOString().slice(0, 10);
      records.push({
        id: 'log_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
        date: dateStr,
        temp: sample.temp,
        ph: sample.ph,
        kh: sample.kh,
        gh: sample.gh,
        nh3: sample.nh3,
        no2: sample.no2,
        no3: sample.no3,
        notes: sample.notes
      });
    });
    return records;
  }

  function loadSampleWaterLogs(isUserAction = true) {
    state.waterLogs = getDemoSevenDays();
    saveWaterLogs();
    analyzeLatestWaterHealth();
    renderWaterLogChart();
    renderWaterLogTable();
    if (isUserAction) {
      showToast('✨ 已成功載入 7 天完整水質示範數據！');
    }
  }

  function saveNewWaterLogFromForm() {
    const newEntry = {
      id: 'log_' + Date.now(),
      date: el.wlInDate.value,
      temp: parseFloat(el.wlInTemp.value) || 25.0,
      ph: parseFloat(el.wlInPh.value) || 7.0,
      kh: parseFloat(el.wlInKh.value) || 3.0,
      gh: parseFloat(el.wlInGh.value) || 5.0,
      nh3: parseFloat(el.wlInNh3.value) || 0.00,
      no2: parseFloat(el.wlInNo2.value) || 0.00,
      no3: parseFloat(el.wlInNo3.value) || 0,
      notes: (el.wlInNotes.value || '').trim()
    };

    // 若同一日期已存在，則更新，否則加入
    const existingIndex = state.waterLogs.findIndex(l => l.date === newEntry.date);
    if (existingIndex >= 0) {
      state.waterLogs[existingIndex] = newEntry;
    } else {
      state.waterLogs.push(newEntry);
    }

    // 依日期排序
    state.waterLogs.sort((a, b) => a.date.localeCompare(b.date));
    saveWaterLogs();

    analyzeLatestWaterHealth();
    renderWaterLogChart();
    renderWaterLogTable();
    showToast(`📝 已成功記錄 ${newEntry.date} 的水質測量數據！`);
  }

  function deleteWaterLog(id) {
    state.waterLogs = state.waterLogs.filter(l => l.id !== id);
    saveWaterLogs();
    analyzeLatestWaterHealth();
    renderWaterLogChart();
    renderWaterLogTable();
    showToast('🗑️ 已刪除該筆水質紀錄');
  }

  // ==========================================
  // 15. 水質健康指數、毒性警戒與換水處方箋分析
  // ==========================================
  function analyzeLatestWaterHealth() {
    if (!el.wlHealthTitle) return;

    if (!state.waterLogs || state.waterLogs.length === 0) {
      el.wlHealthTitle.textContent = '尚無紀錄數據';
      el.wlHealthPill.textContent = '-- 分';
      el.wlHealthPill.className = 'wl-status-pill';
      el.wlHealthDesc.textContent = '請在下方輸入今日水質數據，系統將立即為您啟動科學分析。';

      el.wlToxicityTitle.textContent = '待檢測';
      el.wlToxicityPill.textContent = '待測';
      el.wlToxicityPill.className = 'wl-status-pill';
      el.wlToxicityDesc.textContent = '無毒性檢測數據。';

      el.wlActionTitle.textContent = '待評估';
      el.wlActionPill.textContent = '--';
      el.wlActionPill.className = 'wl-status-pill';
      el.wlActionDesc.textContent = '請記錄水質以獲取換水建議。';
      return;
    }

    // 取得最新一筆紀錄
    const latest = state.waterLogs[state.waterLogs.length - 1];

    let healthScore = 100;
    let isNh3Critical = latest.nh3 >= 0.20;
    let isNh3Warn = latest.nh3 > 0.02 && latest.nh3 < 0.20;

    let isNo2Critical = latest.no2 >= 0.50;
    let isNo2Warn = latest.no2 >= 0.10 && latest.no2 < 0.50;

    let isNo3Critical = latest.no3 >= 50;
    let isNo3Warn = latest.no3 >= 25 && latest.no3 < 50;

    let isTempAbnormal = latest.temp < 21 || latest.temp > 30;
    let isPhAbnormal = latest.ph < 5.5 || latest.ph > 8.2;

    // 扣分計算法
    if (isNh3Critical) healthScore -= 45;
    else if (isNh3Warn) healthScore -= 20;

    if (isNo2Critical) healthScore -= 40;
    else if (isNo2Warn) healthScore -= 18;

    if (isNo3Critical) healthScore -= 20;
    else if (isNo3Warn) healthScore -= 8;

    if (isTempAbnormal) healthScore -= 12;
    if (isPhAbnormal) healthScore -= 15;

    healthScore = Math.max(10, Math.min(100, healthScore));

    // --- 1. 更新水質健康指數看板 ---
    if (healthScore >= 90) {
      el.wlHealthTitle.textContent = '生態平衡極佳';
      el.wlHealthPill.textContent = `${healthScore} 分 / 理想`;
      el.wlHealthPill.className = 'wl-status-pill status-pass';
      el.wlHealthDesc.textContent = `水溫 ${latest.temp}°C、pH ${latest.ph} 及各項理化參數處於黃金穩態，生物過濾機能健全。`;
    } else if (healthScore >= 70) {
      el.wlHealthTitle.textContent = '水質良好 (輕度波動)';
      el.wlHealthPill.textContent = `${healthScore} 分 / 良好`;
      el.wlHealthPill.className = 'wl-status-pill status-warn';
      el.wlHealthDesc.textContent = `水質整體穩定，但存在輕度指標上升 (如 NO3 累積)，建議安排近日例行換水以防震盪。`;
    } else {
      el.wlHealthTitle.textContent = '⚠️ 水質出現高危警訊';
      el.wlHealthPill.textContent = `${healthScore} 分 / 危險`;
      el.wlHealthPill.className = 'wl-status-pill status-fail';
      el.wlHealthDesc.textContent = `偵測到致命指標異常（氨氮或亞硝酸偏高），硝化系統負荷受損，魚隻存在中毒或生病風險！`;
    }

    // --- 2. 更新毒性指標診斷看板 ---
    if (isNh3Critical || isNo2Critical) {
      el.wlToxicityTitle.textContent = '🚨 劇毒警戒：急需處置';
      el.wlToxicityPill.textContent = '高危劇毒';
      el.wlToxicityPill.className = 'wl-status-pill status-fail';
      let msg = '';
      if (isNh3Critical) msg += `NH3/NH4 高達 ${latest.nh3.toFixed(2)} ppm (嚴重灼傷魚鰓)！ `;
      if (isNo2Critical) msg += `NO2 高達 ${latest.no2.toFixed(2)} ppm (引發血液缺氧窒息)！ `;
      el.wlToxicityDesc.innerHTML = `<span style="color:#fda4af; font-weight:700;">${msg}</span>建議立即停止餵食，並立刻實施緊急大換水！`;
    } else if (isNh3Warn || isNo2Warn || isNo3Critical) {
      el.wlToxicityTitle.textContent = '⚠️ 毒素累積中 (輕度警戒)';
      el.wlToxicityPill.textContent = '注意警戒';
      el.wlToxicityPill.className = 'wl-status-pill status-warn';
      el.wlToxicityDesc.textContent = `NH3: ${latest.nh3} ppm, NO2: ${latest.no2} ppm, NO3: ${latest.no3} ppm。消化系統轉化不完全，需加強供氧與補菌。`;
    } else {
      el.wlToxicityTitle.textContent = '✅ 無氨氮毒性威脅';
      el.wlToxicityPill.textContent = '安全';
      el.wlToxicityPill.className = 'wl-status-pill status-pass';
      el.wlToxicityDesc.textContent = `NH3: ${latest.nh3} ppm · NO2: ${latest.no2} ppm · NO3: ${latest.no3} ppm。硝化循環極度完善，生物膜運作無虞。`;
    }

    // --- 3. 更新智慧換水處方箋看板 ---
    if (isNh3Critical || isNo2Critical) {
      el.wlActionTitle.textContent = '緊急換水搶救';
      el.wlActionPill.textContent = '立即換水 40%~50%';
      el.wlActionPill.className = 'wl-status-pill status-fail';
      el.wlActionDesc.textContent = '強烈建議今日立即換水 40~50% (需同溫除氯)，加強打氣機最大溶氧，並添加雙倍硝化活菌粉與水質解毒劑。';
    } else if (isNo3Critical) {
      el.wlActionTitle.textContent = '降低硝酸鹽換水';
      el.wlActionPill.textContent = '建議今日換水 30%';
      el.wlActionPill.className = 'wl-status-pill status-warn';
      el.wlActionDesc.textContent = `NO3 累積達 ${latest.no3} ppm，易滋生黑毛藻與造成魚隻緊迫。建議今日換水 30% 並徹底虹吸清洗底砂積垢。`;
    } else if (isNo3Warn) {
      el.wlActionTitle.textContent = '安排例行換水';
      el.wlActionPill.textContent = '建議 2天內換水 20%';
      el.wlActionPill.className = 'wl-status-pill status-warn';
      el.wlActionDesc.textContent = `NO3 處於 ${latest.no3} ppm 緩慢上升期，建議在 48 小時內進行 20% 溫和換水，維護水質清亮。`;
    } else {
      el.wlActionTitle.textContent = '維持週期性換水';
      el.wlActionPill.textContent = '每週換水 15%';
      el.wlActionPill.className = 'wl-status-pill status-pass';
      el.wlActionDesc.textContent = '水質指標極為優秀！維持每 7 天換水 15~20% 即可，避免過度頻繁大動水體破壞穩定微生態。';
    }
  }

  // ==========================================
  // 16. 高清動態 Canvas 水質折線圖繪製引擎
  // ==========================================
  function renderWaterLogChart() {
    const canvas = el.wlChartCanvas;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const container = canvas.parentElement;
    const width = container.clientWidth || 800;
    const height = container.clientHeight || 320;

    // Retina HD 高清適配
    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);

    ctx.clearRect(0, 0, width, height);

    if (!state.waterLogs || state.waterLogs.length === 0) {
      ctx.fillStyle = '#64748b';
      ctx.font = '14px Manrope, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('尚無水質歷史數據，請於右側登記或點擊「載入範例」', width / 2, height / 2);
      if (el.wlChartLegendBar) el.wlChartLegendBar.innerHTML = '';
      return;
    }

    const padding = { top: 30, right: 30, bottom: 40, left: 45 };
    const chartW = width - padding.left - padding.right;
    const chartH = height - padding.top - padding.bottom;

    const data = state.waterLogs;
    const count = data.length;

    // 依當前 Tab 決定繪製指標
    let series = [];
    if (state.activeChartTab === 'nitrogen') {
      series = [
        { key: 'nh3', name: '氨氮 NH3/NH4', color: '#ef4444', unit: 'ppm', maxVal: 1.0 },
        { key: 'no2', name: '亞硝酸鹽 NO2', color: '#f97316', unit: 'ppm', maxVal: 1.0 },
        { key: 'no3', name: '硝酸鹽 NO3', color: '#eab308', unit: 'ppm', maxVal: 50.0 }
      ];
    } else {
      series = [
        { key: 'temp', name: '水溫 (°C)', color: '#f43f5e', unit: '°C', minVal: 15, maxVal: 35 },
        { key: 'ph', name: '酸鹼值 (pH)', color: '#38bdf8', unit: '', minVal: 4, maxVal: 10 },
        { key: 'kh', name: '碳酸硬度 (KH)', color: '#a78bfa', unit: 'dKH', minVal: 0, maxVal: 15 },
        { key: 'gh', name: '總硬度 (GH)', color: '#2dd4bf', unit: 'dGH', minVal: 0, maxVal: 20 }
      ];
    }

    // 計算 Y 軸最大最小值
    let yMin = 0;
    let yMax = 10;
    if (state.activeChartTab === 'nitrogen') {
      const maxNo3 = Math.max(...data.map(d => d.no3 || 0));
      yMax = Math.max(30, Math.ceil(maxNo3 * 1.2));
    } else {
      const allVals = [];
      data.forEach(d => {
        allVals.push(d.temp || 25, d.ph || 7, d.kh || 3, d.gh || 5);
      });
      yMin = Math.max(0, Math.floor(Math.min(...allVals) - 2));
      yMax = Math.ceil(Math.max(...allVals) + 2);
    }

    // 1. 繪製背景水平網格線與 Y 軸刻度
    ctx.strokeStyle = 'rgba(148, 163, 184, 0.12)';
    ctx.lineWidth = 1;
    ctx.fillStyle = '#64748b';
    ctx.font = '11px Outfit, sans-serif';
    ctx.textAlign = 'right';

    const ySteps = 5;
    for (let i = 0; i <= ySteps; i++) {
      const yVal = yMin + (yMax - yMin) * (i / ySteps);
      const yPos = padding.top + chartH - (i / ySteps) * chartH;

      ctx.beginPath();
      ctx.moveTo(padding.left, yPos);
      ctx.lineTo(padding.left + chartW, yPos);
      ctx.stroke();

      ctx.fillText(yVal.toFixed(state.activeChartTab === 'nitrogen' ? 0 : 1), padding.left - 8, yPos + 4);
    }

    // 2. 繪製 X 軸日期標籤
    ctx.textAlign = 'center';
    const xStep = count > 1 ? chartW / (count - 1) : chartW / 2;

    data.forEach((item, idx) => {
      const xPos = count === 1 ? padding.left + chartW / 2 : padding.left + idx * xStep;
      // 簡化日期文字: MM/DD
      const dateText = item.date.length >= 10 ? item.date.slice(5) : item.date;
      ctx.fillText(dateText, xPos, padding.top + chartH + 22);
    });

    // 3. 繪製各條數據折線與發光點
    series.forEach(s => {
      ctx.strokeStyle = s.color;
      ctx.lineWidth = 2.5;
      ctx.beginPath();

      const points = [];
      data.forEach((item, idx) => {
        const val = item[s.key] !== undefined ? item[s.key] : 0;
        const xPos = count === 1 ? padding.left + chartW / 2 : padding.left + idx * xStep;
        const yNorm = (val - yMin) / (yMax - yMin);
        const yPos = padding.top + chartH - Math.max(0, Math.min(1, yNorm)) * chartH;
        points.push({ x: xPos, y: yPos, val: val, date: item.date });

        if (idx === 0) {
          ctx.moveTo(xPos, yPos);
        } else {
          ctx.lineTo(xPos, yPos);
        }
      });
      ctx.stroke();

      // 繪製發光圓點
      points.forEach(pt => {
        ctx.fillStyle = s.color;
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, 4, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = '#070d1a';
        ctx.lineWidth = 2;
        ctx.stroke();
      });
    });

    // 4. 渲染圖表下方圖例
    if (el.wlChartLegendBar) {
      const latest = data[data.length - 1];
      el.wlChartLegendBar.innerHTML = series.map(s => {
        const val = latest ? latest[s.key] : '--';
        return `
          <div class="legend-item">
            <span class="legend-dot" style="background:${s.color}; box-shadow:0 0 8px ${s.color};"></span>
            <span class="legend-name">${s.name}:</span>
            <strong style="color:#fff;">${val} ${s.unit}</strong>
          </div>
        `;
      }).join('');
    }
  }

  // ==========================================
  // 17. 水質紀錄表格渲染與 CSV 導出
  // ==========================================
  function renderWaterLogTable() {
    if (!el.wlTableBody) return;

    if (el.wlHistoryCount) {
      el.wlHistoryCount.textContent = state.waterLogs.length;
    }

    if (!state.waterLogs || state.waterLogs.length === 0) {
      el.wlTableBody.innerHTML = `
        <tr>
          <td colspan="11" style="text-align:center; padding:30px; color:var(--text-dim);">
            目前尚無歷史測量紀錄，請於上方表單進行登錄。
          </td>
        </tr>
      `;
      return;
    }

    // 倒序排列 (最新日期在最上方)
    const sorted = [...state.waterLogs].reverse();

    el.wlTableBody.innerHTML = sorted.map(log => {
      const isNh3Bad = log.nh3 >= 0.05;
      const isNo2Bad = log.no2 >= 0.10;
      const isNo3Bad = log.no3 >= 35;

      let statusBadge = '<span class="badge-metric-safe">🟢 優良</span>';
      if (log.nh3 >= 0.2 || log.no2 >= 0.5 || log.no3 >= 50) {
        statusBadge = '<span class="badge-metric-danger">🔴 毒性危險</span>';
      } else if (isNh3Bad || isNo2Bad || isNo3Bad) {
        statusBadge = '<span class="badge-metric-warn">🟡 需注意</span>';
      }

      return `
        <tr>
          <td><strong style="color:var(--text-primary);"><i class="fas fa-calendar-day" style="color:var(--primary); margin-right:4px;"></i>${log.date}</strong></td>
          <td>${log.temp}°C</td>
          <td>pH ${log.ph}</td>
          <td>${log.kh} dKH</td>
          <td>${log.gh} dGH</td>
          <td><span class="${log.nh3 >= 0.2 ? 'badge-metric-danger' : log.nh3 > 0.02 ? 'badge-metric-warn' : 'badge-metric-safe'}">${log.nh3.toFixed(2)}</span></td>
          <td><span class="${log.no2 >= 0.5 ? 'badge-metric-danger' : log.no2 >= 0.1 ? 'badge-metric-warn' : 'badge-metric-safe'}">${log.no2.toFixed(2)}</span></td>
          <td><span class="${log.no3 >= 40 ? 'badge-metric-danger' : log.no3 >= 25 ? 'badge-metric-warn' : 'badge-metric-safe'}">${log.no3}</span></td>
          <td>${statusBadge}</td>
          <td style="max-width:200px; overflow:hidden; text-overflow:ellipsis;" title="${log.notes || ''}">${log.notes || '--'}</td>
          <td>
            <button class="btn-del-log" title="刪除此筆日誌" onclick="window.oceanApp.deleteWaterLog('${log.id}')">
              <i class="fas fa-trash-alt"></i>
            </button>
          </td>
        </tr>
      `;
    }).join('');
  }

  function exportWaterLogsCSV() {
    if (!state.waterLogs || state.waterLogs.length === 0) {
      showToast('⚠️ 尚無水質日誌數據可供導出！');
      return;
    }

    const headers = ['測量日期', '水溫(C)', 'pH酸鹼值', '碳酸硬度(KH)', '總硬度(GH)', '氨氮NH3(ppm)', '亞硝酸鹽NO2(ppm)', '硝酸鹽NO3(ppm)', '維護備註'];
    const rows = state.waterLogs.map(l => [
      l.date,
      l.temp,
      l.ph,
      l.kh,
      l.gh,
      l.nh3,
      l.no2,
      l.no3,
      `"${(l.notes || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `海洋職人_水質監測日誌_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('📊 水質監測日誌 CSV 已成功導出下載！');
  }

  // ==========================================
  // 18. 「我的魚缸」智能造缸與硬體配置管家 (My Tank Manager)
  // ==========================================
  function initMyTankManager() {
    // 1. 初始化 100 種魚類下拉選單
    if (el.mtSpeciesSelect) {
      const categories = [
        { keys: ['angelfish'], label: '神仙魚品系大系 (Pterophyllum 50種)' },
        { keys: ['corydoras'], label: '鼠魚深度專題 (Corydoradinae 28種)' },
        { keys: ['flagship'], label: '職人特選旗艦名種 (Flagships 7種)' },
        { keys: ['cichlids', 'cichlid'], label: '南美短鯛與特色慈鯛 (Cichlids 8種)' },
        { keys: ['tetras', 'tetra'], label: '精品加拉辛脂鯉 (Characidae 7種)' }
      ];

      let optionsHtml = '';
      categories.forEach(cat => {
        const catSpecies = state.species.filter(s => cat.keys.includes(s.category));
        if (catSpecies.length > 0) {
          optionsHtml += `<optgroup label="【${cat.label}】">`;
          catSpecies.forEach(sp => {
            optionsHtml += `<option value="${sp.id}">[${sp.code}] ${sp.name} (${sp.sizeCm}cm)</option>`;
          });
          optionsHtml += `</optgroup>`;
        }
      });
      el.mtSpeciesSelect.innerHTML = optionsHtml;
    }

    // 2. 若無魚缸資料，載入預設 3 座經典魚缸
    if (!state.tanks || state.tanks.length === 0) {
      state.tanks = [
        {
          id: 'tank_cory_60',
          name: '我的 60 × 45 × 45 鼠魚專屬細砂缸',
          length: 60,
          width: 45,
          height: 45,
          substrateType: 'fine-sand',
          substrateCm: 4.0,
          plants: 'wood-anubias',
          filter: 'canister-800',
          light: 'rgb-full',
          heater: 150,
          fish: [
            { id: 'cory-10', qty: 6 }, // 金翅珍珠鼠
            { id: 'cory-06', qty: 4 }, // 阿道夫鼠
            { id: 'cory-03', qty: 4 }, // 黃金雷射鼠
            { id: 'cory-12', qty: 6 }  // 精靈鼠
          ]
        },
        {
          id: 'tank_plant_90',
          name: '客廳 90 × 45 × 45 南美水草造景群游缸',
          length: 90,
          width: 45,
          height: 45,
          substrateType: 'black-soil',
          substrateCm: 6.0,
          plants: 'heavy-planted',
          filter: 'canister-1200',
          light: 'rgb-full',
          heater: 200,
          fish: [
            { id: 'tetra-01', qty: 20 }, // 頂級野生寶蓮燈
            { id: 'tetra-03', qty: 15 }, // 噴火燈
            { id: 'cich-01', qty: 2 },   // 酋長短鯛
            { id: 'cory-08', qty: 6 }    // 熊貓鼠
          ]
        },
        {
          id: 'tank_nano_30',
          name: '書房 30 × 18 × 24 白金孔雀魚迷你缸',
          length: 30,
          width: 18,
          height: 24,
          substrateType: 'silica-sand',
          substrateCm: 2.0,
          plants: 'floating-only',
          filter: 'hang-on',
          light: 'led-white',
          heater: 50,
          fish: [
            { id: 'flag-06', qty: 6 },  // 白金全紅白子孔雀魚
            { id: 'cory-12', qty: 4 }   // 精靈鼠
          ]
        }
      ];
      state.activeTankId = 'tank_cory_60';
      saveTanks();
    }

    if (!state.activeTankId || !state.tanks.find(t => t.id === state.activeTankId)) {
      state.activeTankId = state.tanks[0].id;
      saveTanks();
    }

    // 3. 綁定按鈕與事件
    if (el.btnCreateTank) {
      el.btnCreateTank.addEventListener('click', createNewTank);
    }

    if (el.btnDeleteTank) {
      el.btnDeleteTank.addEventListener('click', deleteCurrentTank);
    }

    if (el.btnMtAddFish) {
      el.btnMtAddFish.addEventListener('click', addFishToCurrentTank);
    }

    if (el.mtForm) {
      el.mtForm.addEventListener('submit', (e) => {
        e.preventDefault();
        saveCurrentTankFromForm();
      });

      // 即時連動計算
      const liveInputs = [el.mtLength, el.mtWidth, el.mtHeight, el.mtSubstrateType, el.mtSubstrateCm, el.mtPlants, el.mtFilter, el.mtLight, el.mtHeater];
      liveInputs.forEach(input => {
        if (input) {
          input.addEventListener('input', recalcCurrentTank);
          input.addEventListener('change', recalcCurrentTank);
        }
      });
    }

    if (el.btnCopyTankReport) {
      el.btnCopyTankReport.addEventListener('click', copyCurrentTankReport);
    }

    // 4. 渲染魚缸標籤並載入目前活躍魚缸
    renderMyTankTabs();
    loadTankIntoForm(state.activeTankId);
  }

  function saveTanks() {
    localStorage.setItem('ocean_craftsman_tanks', JSON.stringify(state.tanks));
    localStorage.setItem('ocean_craftsman_active_tank_id', state.activeTankId);
  }

  function renderMyTankTabs() {
    if (!el.mtTabsList) return;
    el.mtTabsList.innerHTML = state.tanks.map(t => {
      const isActive = t.id === state.activeTankId;
      return `
        <button class="mytank-tab-pill ${isActive ? 'active' : ''}" onclick="window.oceanApp.switchMyTank('${t.id}')">
          <i class="fas fa-cube" style="color:${isActive ? 'var(--primary)' : 'var(--text-muted)'};"></i>
          <span>${t.name}</span>
        </button>
      `;
    }).join('');
  }

  function switchMyTank(tankId) {
    state.activeTankId = tankId;
    saveTanks();
    renderMyTankTabs();
    loadTankIntoForm(tankId);
    showToast(`🔄 已切換至「${getCurrentTank().name}」`);
  }

  function getCurrentTank() {
    return state.tanks.find(t => t.id === state.activeTankId) || state.tanks[0];
  }

  function loadTankIntoForm(tankId) {
    const tank = state.tanks.find(t => t.id === tankId);
    if (!tank) return;

    if (el.mtName) el.mtName.value = tank.name;
    if (el.mtLength) el.mtLength.value = tank.length;
    if (el.mtWidth) el.mtWidth.value = tank.width;
    if (el.mtHeight) el.mtHeight.value = tank.height;
    if (el.mtSubstrateType) el.mtSubstrateType.value = tank.substrateType;
    if (el.mtSubstrateCm) el.mtSubstrateCm.value = tank.substrateCm;
    if (el.mtPlants) el.mtPlants.value = tank.plants;
    if (el.mtFilter) el.mtFilter.value = tank.filter;
    if (el.mtLight) el.mtLight.value = tank.light;
    if (el.mtHeater) el.mtHeater.value = tank.heater;

    renderCurrentTankFishChips();
    recalcCurrentTank();
  }

  function renderCurrentTankFishChips() {
    if (!el.mtFishChipsContainer) return;
    const tank = getCurrentTank();
    if (!tank.fish || tank.fish.length === 0) {
      el.mtFishChipsContainer.innerHTML = '<span style="color:var(--text-dim); font-size:0.78rem; padding:4px;">尚未加入魚隻，請從上方選擇魚種添加。</span>';
      if (el.mtTotalFishNum) el.mtTotalFishNum.textContent = '0';
      return;
    }

    let totalCount = 0;
    el.mtFishChipsContainer.innerHTML = tank.fish.map(f => {
      totalCount += f.qty;
      const sp = state.species.find(s => s.id === f.id);
      const name = sp ? sp.name : '魚隻';
      const img = sp ? sp.image : 'images/discus.jpg';
      return `
        <div class="mt-fish-chip">
          <img src="${img}" alt="${name}" onerror="this.onerror=null; this.src='images/discus.jpg';">
          <span>${name}</span>
          <span class="mt-fish-chip-qty">× ${f.qty}</span>
          <i class="fas fa-times-circle btn-del-chip" title="移除此魚種" onclick="window.oceanApp.removeFishFromCurrentTank('${f.id}')"></i>
        </div>
      `;
    }).join('');

    if (el.mtTotalFishNum) el.mtTotalFishNum.textContent = totalCount;
  }

  function addFishToCurrentTank() {
    const speciesId = el.mtSpeciesSelect.value;
    const qty = parseInt(el.mtSpeciesQty.value, 10) || 1;
    if (!speciesId) return;

    const tank = getCurrentTank();
    if (!tank.fish) tank.fish = [];

    const existing = tank.fish.find(f => f.id === speciesId);
    if (existing) {
      existing.qty += qty;
    } else {
      tank.fish.push({ id: speciesId, qty: qty });
    }

    saveTanks();
    renderCurrentTankFishChips();
    recalcCurrentTank();
    const sp = state.species.find(s => s.id === speciesId);
    showToast(`🐟 已將 ${sp ? sp.name : ''} × ${qty} 隻加入魚缸！`);
  }

  function removeFishFromCurrentTank(speciesId) {
    const tank = getCurrentTank();
    if (!tank.fish) return;
    tank.fish = tank.fish.filter(f => f.id !== speciesId);
    saveTanks();
    renderCurrentTankFishChips();
    recalcCurrentTank();
  }

  function createNewTank() {
    const newName = prompt('請輸入新魚缸名稱：', `我的 ${state.tanks.length + 1} 號新魚缸`);
    if (!newName || !newName.trim()) return;

    const newId = 'tank_' + Date.now();
    const newTank = {
      id: newId,
      name: newName.trim(),
      length: 60,
      width: 30,
      height: 36,
      substrateType: 'fine-sand',
      substrateCm: 3.0,
      plants: 'wood-anubias',
      filter: 'canister-800',
      light: 'rgb-full',
      heater: 100,
      fish: [
        { id: 'cory-10', qty: 6 },
        { id: 'flag-06', qty: 6 }
      ]
    };

    state.tanks.push(newTank);
    state.activeTankId = newId;
    saveTanks();
    renderMyTankTabs();
    loadTankIntoForm(newId);
    showToast(`🎉 成功建立新魚缸「${newTank.name}」！`);
  }

  function deleteCurrentTank() {
    if (state.tanks.length <= 1) {
      showToast('⚠️ 至少需保留一座魚缸！');
      return;
    }
    const current = getCurrentTank();
    if (!confirm(`確定要刪除「${current.name}」嗎？`)) return;

    state.tanks = state.tanks.filter(t => t.id !== state.activeTankId);
    state.activeTankId = state.tanks[0].id;
    saveTanks();
    renderMyTankTabs();
    loadTankIntoForm(state.activeTankId);
    showToast(`🗑️ 已刪除魚缸`);
  }

  function saveCurrentTankFromForm() {
    const tank = getCurrentTank();
    tank.name = el.mtName.value.trim() || tank.name;
    tank.length = parseFloat(el.mtLength.value) || 60;
    tank.width = parseFloat(el.mtWidth.value) || 45;
    tank.height = parseFloat(el.mtHeight.value) || 45;
    tank.substrateType = el.mtSubstrateType.value;
    tank.substrateCm = parseFloat(el.mtSubstrateCm.value) || 0;
    tank.plants = el.mtPlants.value;
    tank.filter = el.mtFilter.value;
    tank.light = el.mtLight.value;
    tank.heater = parseInt(el.mtHeater.value, 10) || 0;

    saveTanks();
    renderMyTankTabs();
    recalcCurrentTank();
    showToast(`💾 已成功儲存「${tank.name}」配置設定！`);
  }

  // ==========================================
  // 19. 魚缸生物負載、淨水體容量與硬體匹配即時計算
  // ==========================================
  function recalcCurrentTank() {
    const tank = getCurrentTank();
    const l = parseFloat(el.mtLength.value) || tank.length || 60;
    const w = parseFloat(el.mtWidth.value) || tank.width || 45;
    const h = parseFloat(el.mtHeight.value) || tank.height || 45;
    const subCm = parseFloat(el.mtSubstrateCm.value) || 0;
    const subType = el.mtSubstrateType.value || tank.substrateType;
    const filterKey = el.mtFilter.value || tank.filter;
    const heaterWatt = parseInt(el.mtHeater.value, 10) || tank.heater;
    const plantType = el.mtPlants.value || tank.plants;

    // 1. 容積計算
    const grossVol = (l * w * h) / 1000;
    const effHeight = Math.max(5, h - subCm);
    // 扣除底砂並乘 0.95 扣除沉木造景與未裝滿水位
    const netVol = (l * w * effHeight * 0.95) / 1000;

    // 2. 魚隻生物量計算
    let totalFishCount = 0;
    let totalFishCm = 0;
    let hasCorydoras = false;
    let hasBigPredator = false;

    if (tank.fish) {
      tank.fish.forEach(f => {
        totalFishCount += f.qty;
        const sp = state.species.find(s => s.id === f.id);
        if (sp) {
          totalFishCm += (sp.sizeCm * f.qty);
          if (sp.category === 'corydoras') hasCorydoras = true;
          if (sp.sizeCm >= 30 || sp.id === 'flag-01') hasBigPredator = true;
        }
      });
    }

    // 3. 生物密度 (cm / L)
    const densityRatio = netVol > 0 ? (totalFishCm / netVol) : 0;

    // 4. 更新頂部預覽卡
    if (el.mtDispName) el.mtDispName.textContent = el.mtName.value || tank.name;
    if (el.mtDispDims) el.mtDispDims.textContent = `${l} × ${w} × ${h} cm (總幾何容積 ${grossVol.toFixed(1)} L)`;
    if (el.mtOutNetVol) el.mtOutNetVol.textContent = `${netVol.toFixed(1)} L`;
    if (el.mtOutFishCount) el.mtOutFishCount.textContent = `${totalFishCount} 隻 (${totalFishCm.toFixed(1)} cm)`;

    // 過濾系統名稱解析
    const filterNames = {
      'canister-1200': '動力圓桶 1200 L/h',
      'canister-800': '動力圓桶 800 L/h',
      'canister-500': '小型圓桶 400 L/h',
      'top-drip': '上部滴流盒 1500 L/h',
      'hang-on': '外掛瀑布 250 L/h',
      'sponge-filter': '雙頭氣動水妖精'
    };
    if (el.mtOutFilterName) el.mtOutFilterName.textContent = filterNames[filterKey] || '標準過濾';
    if (el.mtOutHeaterName) el.mtOutHeaterName.textContent = heaterWatt > 0 ? `${heaterWatt} W` : '無加溫';

    // 5. 生物負載狀態診斷
    if (densityRatio <= 0.85) {
      el.mtCalcDensityStatus.innerHTML = `🟢 負載良好 (${densityRatio.toFixed(2)} cm/L)`;
      el.mtCalcDensityDesc.textContent = '生物負載極為安全！水體自淨緩衝力充沛，魚隻享有寬敞游動水域。';
      el.mtDispHealthBadge.className = 'mt-tank-health-badge';
      el.mtDispHealthBadge.innerHTML = '<span class="live-pulse-dot"></span> 系統運作優良';
    } else if (densityRatio <= 1.25) {
      el.mtCalcDensityStatus.innerHTML = `🟡 負載適中偏高 (${densityRatio.toFixed(2)} cm/L)`;
      el.mtCalcDensityDesc.textContent = '生物量處於飽和邊緣，需依賴健全的培菌系統與定額換水以防亞硝酸累積。';
      el.mtDispHealthBadge.className = 'mt-tank-health-badge status-warn';
      el.mtDispHealthBadge.innerHTML = '⚠️ 負載稍高';
    } else {
      el.mtCalcDensityStatus.innerHTML = `🔴 密度超載警戒 (${densityRatio.toFixed(2)} cm/L)`;
      el.mtCalcDensityDesc.textContent = '魚隻數量已大幅超出安全水體承載量！極易引發缺氧、水質混濁與疾病，建議分缸！';
      el.mtDispHealthBadge.className = 'mt-tank-health-badge status-fail';
      el.mtDispHealthBadge.innerHTML = '🚨 密度超載';
    }

    // 6. 目前實質有效水體
    const substrateLoss = ((l * w * subCm) / 1000).toFixed(1);
    if (el.mtCalcNetWater) el.mtCalcNetWater.textContent = `約 ${netVol.toFixed(1)} L`;
    if (el.mtCalcNetDesc) el.mtCalcNetDesc.textContent = `幾何總水體 ${grossVol.toFixed(1)} L，扣除 ${subCm}cm 底砂佔比約 ${substrateLoss} L 及沉木造景空間。`;

    // 7. 建議換水計算
    let changePct = 20;
    if (densityRatio > 1.2) changePct = 35;
    else if (densityRatio > 0.85) changePct = 25;
    else if (densityRatio < 0.4) changePct = 15;

    const changeLiters = Math.round(netVol * (changePct / 100));
    if (el.mtCalcWaterChange) el.mtCalcWaterChange.textContent = `每週 ${changePct}% (約 ${changeLiters} L)`;
    if (el.mtCalcChangeDesc) el.mtCalcChangeDesc.textContent = `依據當前 ${totalFishCount} 隻成體魚隻生物量及過濾配置，建議每 7 天定期換水 ${changeLiters} 公升。`;

    // 8. 硬體匹配診斷報告清單
    if (el.mtDiagItemsList) {
      const items = [];

      // 過濾診斷
      const flowRates = {
        'canister-1200': 1200,
        'canister-800': 800,
        'canister-500': 400,
        'top-drip': 1500,
        'hang-on': 250,
        'sponge-filter': 120
      };
      const flow = flowRates[filterKey] || 500;
      const turnover = (flow / netVol).toFixed(1);
      if (turnover >= 5.0) {
        items.push(`
          <div class="mt-diag-item">
            <i class="fas fa-check-circle" style="color:#34d399; margin-top:2px;"></i>
            <div class="mt-diag-item-text">
              <strong>過濾循環效率極佳：</strong> 每小時循環水體 <strong>${turnover} 次</strong> (建議 5~8 次)，培菌與溶氧效能強勁。
            </div>
          </div>
        `);
      } else {
        items.push(`
          <div class="mt-diag-item">
            <i class="fas fa-exclamation-triangle" style="color:#fb923c; margin-top:2px;"></i>
            <div class="mt-diag-item-text">
              <strong>過濾循環稍嫌偏弱：</strong> 每小時僅循環水體 <strong>${turnover} 次</strong>，在高密度下可能累積排泄廢物。
            </div>
          </div>
        `);
      }

      // 加溫棒瓦數匹配
      const wattRatio = (heaterWatt / netVol).toFixed(2);
      if (heaterWatt > 0) {
        if (wattRatio >= 1.2 && wattRatio <= 2.5) {
          items.push(`
            <div class="mt-diag-item">
              <i class="fas fa-check-circle" style="color:#34d399; margin-top:2px;"></i>
              <div class="mt-diag-item-text">
                <strong>加溫功率配比完美：</strong> <strong>${wattRatio} W/L</strong> (黃金比例 1.5~2.0 W/L)，冬季抗寒保溫迅速省電。
              </div>
            </div>
          `);
        } else if (wattRatio < 1.2) {
          items.push(`
            <div class="mt-diag-item">
              <i class="fas fa-exclamation-triangle" style="color:#fb923c; margin-top:2px;"></i>
              <div class="mt-diag-item-text">
                <strong>加溫功率偏低：</strong> 僅 <strong>${wattRatio} W/L</strong>，寒流來襲時可能無法維持目標水溫。
              </div>
            </div>
          `);
        }
      }

      // 底砂與鼠魚吻部適配
      if (hasCorydoras) {
        if (subType === 'fine-sand' || subType === 'silica-sand') {
          items.push(`
            <div class="mt-diag-item">
              <i class="fas fa-check-circle" style="color:#34d399; margin-top:2px;"></i>
              <div class="mt-diag-item-text">
                <strong>鼠魚底砂適配極佳：</strong> 圓潤天然細砂可完美保護鼠魚敏感觸鬚與鑽砂覓食習性。
              </div>
            </div>
          `);
        } else {
          items.push(`
            <div class="mt-diag-item">
              <i class="fas fa-info-circle" style="color:var(--primary); margin-top:2px;"></i>
              <div class="mt-diag-item-text">
                <strong>鼠魚底砂溫馨叮嚀：</strong> 當前底砂材質非純細河砂，建議避免鋒利粗礫以防鬍鬚磨損發炎。
              </div>
            </div>
          `);
        }
      }

      el.mtDiagItemsList.innerHTML = items.join('');
    }
  }

  function copyCurrentTankReport() {
    const tank = getCurrentTank();
    const l = parseFloat(el.mtLength.value) || tank.length;
    const w = parseFloat(el.mtWidth.value) || tank.width;
    const h = parseFloat(el.mtHeight.value) || tank.height;
    const subCm = parseFloat(el.mtSubstrateCm.value) || 0;
    const netVol = ((l * w * Math.max(5, h - subCm) * 0.95) / 1000).toFixed(1);

    const lines = [];
    lines.push(`🐠 【海洋職人】我的專屬魚缸硬體與生態配置報告`);
    lines.push(`🏷️ 魚缸名稱：${el.mtName.value || tank.name}`);
    lines.push(`📐 缸體尺寸：${l} × ${w} × ${h} cm (實質淨水約 ${netVol} L)`);
    lines.push(`🏔️ 底砂材質：${el.mtSubstrateType.options[el.mtSubstrateType.selectedIndex].text} (厚度 ${subCm} cm)`);
    lines.push(`🌿 水草造景：${el.mtPlants.options[el.mtPlants.selectedIndex].text}`);
    lines.push(`⚙️ 過濾系統：${el.mtFilter.options[el.mtFilter.selectedIndex].text}`);
    lines.push(`💡 燈具照明：${el.mtLight.options[el.mtLight.selectedIndex].text}`);
    lines.push(`🔥 加溫配備：${el.mtHeater.options[el.mtHeater.selectedIndex].text}`);
    lines.push('----------------------------------------');
    lines.push('🐟 缸內魚種族群：');
    if (tank.fish && tank.fish.length > 0) {
      tank.fish.forEach(f => {
        const sp = state.species.find(s => s.id === f.id);
        lines.push(`• ${sp ? sp.name : ''} × ${f.qty} 隻`);
      });
    } else {
      lines.push('• 尚未登錄魚隻');
    }
    lines.push('----------------------------------------');
    lines.push(`⚖️ 生物負載狀態：${el.mtCalcDensityStatus.textContent}`);
    lines.push(`💧 建議換水頻率：${el.mtCalcWaterChange.textContent}`);
    lines.push('📜 海洋職人 · 沉浸式珍稀魚類百科系統');

    const textToCopy = lines.join('\n');
    navigator.clipboard.writeText(textToCopy).then(() => {
      showToast('📋 魚缸硬體配置與診斷報告已複製至剪貼簿！');
    }).catch(() => {
      showToast('📋 報告生成完成！');
    });
  }

  // ==========================================
  // 19. 3D 水下迎賓魚群入場特效 (Realistic 3D Aquatic Entrance)
  // ==========================================
  let welcome3dTimeout = null;
  let bubbleInterval = null;

  function initAquaticWelcome3D() {
    // 進入網頁時自動播放 3D 迎賓泳姿
    playAquaticWelcome3D(false);

    // 綁定手動重新播放按鈕
    if (el.btnReplay3d) {
      el.btnReplay3d.addEventListener('click', (e) => {
        e.preventDefault();
        playAquaticWelcome3D(true);
      });
    }

    // 點擊品牌 Logo 也可重現 3D 泳姿
    const logoLink = document.querySelector('.brand-logo');
    if (logoLink) {
      logoLink.addEventListener('click', (e) => {
        e.preventDefault();
        playAquaticWelcome3D(true);
      });
    }
  }

  let welcomeTimeouts = [];
  let welcomePlayCount = 0;

  const aquaticActorPoolRight = [
    {
      id: "heckel-discus",
      name: "黑格爾野生七彩神仙",
      src: "images/3d_heckel_discus_cutout.png",
      filter: "drop-shadow(0 18px 42px rgba(6, 182, 212, 0.65)) drop-shadow(0 4px 14px rgba(0, 0, 0, 0.8))",
      bubbleClass: "ambient-bubble discus-bubble"
    },
    {
      id: "gold-angelfish",
      name: "蜜桃黃金神仙魚",
      src: "images/3d_gold_angelfish_cutout.png",
      filter: "drop-shadow(0 18px 42px rgba(245, 185, 66, 0.7)) drop-shadow(0 4px 14px rgba(0, 0, 0, 0.8))",
      bubbleClass: "ambient-bubble cory-bubble"
    },
    {
      id: "asian-arowana",
      name: "特級亞洲紅龍",
      src: "images/3d_arowana_cutout.png",
      filter: "drop-shadow(0 18px 42px rgba(239, 68, 68, 0.75)) drop-shadow(0 4px 14px rgba(245, 185, 66, 0.5))",
      bubbleClass: "ambient-bubble betta-bubble"
    },
    {
      id: "platinum-guppy",
      name: "白金雙劍孔雀魚",
      src: "images/3d_guppy_cutout.png",
      filter: "drop-shadow(0 18px 42px rgba(56, 189, 248, 0.7)) drop-shadow(0 4px 14px rgba(255, 255, 255, 0.6))",
      bubbleClass: "ambient-bubble discus-bubble"
    }
  ];

  const aquaticActorPoolLeft = [
    {
      id: "crowntail-betta",
      name: "皇家藍冠尾鬥魚",
      src: "images/3d_crowntail_betta_cutout.png",
      filter: "drop-shadow(0 18px 42px rgba(59, 130, 246, 0.7)) drop-shadow(0 4px 16px rgba(225, 29, 72, 0.55))",
      bubbleClass: "ambient-bubble betta-bubble"
    },
    {
      id: "corydoras-gold",
      name: "帝王金線鼠魚",
      src: "images/3d_corydoras_cutout.png",
      filter: "drop-shadow(0 18px 42px rgba(245, 185, 66, 0.65)) drop-shadow(0 4px 12px rgba(0, 0, 0, 0.8))",
      bubbleClass: "ambient-bubble cory-bubble"
    },
    {
      id: "imperial-pleco",
      name: "帝王斑馬異型 (L046)",
      src: "images/3d_pleco_cutout.png",
      filter: "drop-shadow(0 18px 42px rgba(6, 182, 212, 0.65)) drop-shadow(0 4px 14px rgba(255, 255, 255, 0.7))",
      bubbleClass: "ambient-bubble discus-bubble"
    }
  ];

  let lastRightFishIdx = 0;
  let lastLeftFishIdx = 0;

  function clearWelcomeTimeouts() {
    welcomeTimeouts.forEach(t => clearTimeout(t));
    welcomeTimeouts = [];
  }

  function playAquaticWelcome3D(isManual = false) {
    const curtain = document.getElementById('aquatic-welcome-curtain');
    if (!curtain) return;

    // 清除先前的定時器
    clearWelcomeTimeouts();
    if (bubbleInterval) clearInterval(bubbleInterval);

    // 重置動畫與迎賓文字狀態
    curtain.classList.remove('fade-out');
    curtain.style.display = 'block';

    const welcomeBanner = document.getElementById('aquatic-welcome-banner');
    const welcomeTitle = document.getElementById('welcome-banner-text');
    const welcomeScroll = document.getElementById('welcome-banner-scroll');

    if (welcomeBanner) {
      welcomeBanner.classList.remove('visible');
    }
    if (welcomeTitle) {
      welcomeTitle.textContent = '歡迎來到奇奇水族館';
      welcomeTitle.classList.remove('text-swap');
    }
    if (welcomeScroll) {
      welcomeScroll.classList.remove('visible');
    }

    const actorDiscus = document.getElementById('actor-discus') || document.getElementById('actor-angelfish');
    const actorBetta = document.getElementById('actor-betta') || document.getElementById('actor-corydoras');
    const discusBubbles = document.getElementById('discus-bubbles') || document.getElementById('angelfish-bubbles');
    const bettaBubbles = document.getElementById('betta-bubbles') || document.getElementById('corydoras-bubbles');

    if (discusBubbles) discusBubbles.innerHTML = '';
    if (bettaBubbles) bettaBubbles.innerHTML = '';

    // 判斷是否為第 2 次及後續游動：若是，隨機更換魚種
    let currentRightFish = aquaticActorPoolRight[0]; // 預設第1次：黑格爾野生七彩神仙
    let currentLeftFish = aquaticActorPoolLeft[0];   // 預設第1次：皇家藍冠尾鬥魚

    if (welcomePlayCount >= 1) {
      // 第 2 次及之後隨機抽選 (避免連續抽中同一隻)
      let rIdx;
      do {
        rIdx = Math.floor(Math.random() * aquaticActorPoolRight.length);
      } while (rIdx === lastRightFishIdx && aquaticActorPoolRight.length > 1);
      lastRightFishIdx = rIdx;
      currentRightFish = aquaticActorPoolRight[rIdx];

      let lIdx;
      do {
        lIdx = Math.floor(Math.random() * aquaticActorPoolLeft.length);
      } while (lIdx === lastLeftFishIdx && aquaticActorPoolLeft.length > 1);
      lastLeftFishIdx = lIdx;
      currentLeftFish = aquaticActorPoolLeft[lIdx];
    }

    welcomePlayCount++;

    // 動態更新上層魚隻 (游向右方，魚頭朝右)
    if (actorDiscus) {
      const img = actorDiscus.querySelector('img');
      if (img) {
        img.src = currentRightFish.src;
        img.alt = `3D ${currentRightFish.name}`;
        img.style.filter = currentRightFish.filter;
        img.style.transform = 'scaleX(1)';
        img.classList.remove('hydro-pod');
      }
      actorDiscus.style.animation = 'none';
      void actorDiscus.offsetHeight;
      actorDiscus.style.animation = 'swimDiscus3DPath 5.2s cubic-bezier(0.25, 1, 0.45, 1) forwards';
    }

    // 動態更新下層魚隻 (游向左方，魚頭朝左)
    if (actorBetta) {
      const img = actorBetta.querySelector('img');
      if (img) {
        img.src = currentLeftFish.src;
        img.alt = `3D ${currentLeftFish.name}`;
        img.style.filter = currentLeftFish.filter;
        img.style.transform = 'scaleX(1)';
        img.classList.remove('hydro-pod');
      }
      actorBetta.style.animation = 'none';
      void actorBetta.offsetHeight;
      actorBetta.style.animation = 'swimBetta3DPath 4.9s cubic-bezier(0.22, 1, 0.36, 1) forwards';
    }

    if (isManual) {
      showToast(`✨ 3D 【${currentRightFish.name}】與【${currentLeftFish.name}】迎賓泳姿已隨機啟動！`);
    }

    // 動態產生水下微型氣泡流
    let bubbleCount = 0;
    bubbleInterval = setInterval(() => {
      bubbleCount++;
      if (bubbleCount > 28) {
        clearInterval(bubbleInterval);
        return;
      }

      // 上層魚專屬微氣泡
      if (discusBubbles && actorDiscus) {
        const b = document.createElement('span');
        b.className = currentRightFish.bubbleClass || 'ambient-bubble discus-bubble';
        const sz = Math.floor(Math.random() * 8 + 4);
        b.style.width = `${sz}px`;
        b.style.height = `${sz}px`;
        b.style.setProperty('--bx', (Math.random() * 40 - 20).toString());
        discusBubbles.appendChild(b);
        setTimeout(() => b.remove(), 2200);
      }

      // 下層魚專屬微氣泡
      if (bettaBubbles && actorBetta) {
        const b = document.createElement('span');
        b.className = currentLeftFish.bubbleClass || 'ambient-bubble betta-bubble';
        const sz = Math.floor(Math.random() * 8 + 3);
        b.style.width = `${sz}px`;
        b.style.height = `${sz}px`;
        b.style.setProperty('--bx', (Math.random() * 50 - 25).toString());
        bettaBubbles.appendChild(b);
        setTimeout(() => b.remove(), 2200);
      }
    }, 180);

    // =======================================================
    // 依序執行迎賓文字與向下滑動引導
    // 開場動畫結束後 (約 4.8 秒魚游過畫面後)
    // 1. 顯示「歡迎來到奇奇水族館」2 秒
    // 2. 隨後顯示「歡迎光臨」1 秒
    // 3. 隨後顯示並引導往下滑 0.5 秒並帶動滾動
    // =======================================================

    // 階段 1：4.8 秒時開場游姿結束，淡入「歡迎來到奇奇水族館」 (顯示 2.0 秒)
    const t1 = setTimeout(() => {
      if (welcomeBanner && welcomeTitle) {
        welcomeTitle.textContent = '歡迎來到奇奇水族館';
        welcomeBanner.classList.add('visible');
      }
    }, 4800);
    welcomeTimeouts.push(t1);

    // 階段 2：4800ms + 2000ms = 6800ms (轉換為「歡迎光臨」，顯示 1.0 秒)
    const t2 = setTimeout(() => {
      if (welcomeTitle) {
        welcomeTitle.classList.add('text-swap');
        setTimeout(() => {
          welcomeTitle.textContent = '歡迎光臨';
          welcomeTitle.classList.remove('text-swap');
        }, 150);
      }
    }, 6800);
    welcomeTimeouts.push(t2);

    // 階段 3：6800ms + 1000ms = 7800ms (展開向下滑動引導提示，顯示 0.5 秒)
    const t3 = setTimeout(() => {
      if (welcomeScroll) {
        welcomeScroll.classList.add('visible');
      }
    }, 7800);
    welcomeTimeouts.push(t3);

    // 階段 4：7800ms + 500ms = 8300ms (引導 0.5 秒後，平滑帶動向下滑動並淡出迎賓簾幕)
    const t4 = setTimeout(() => {
      if (welcomeBanner) {
        welcomeBanner.classList.remove('visible');
      }
      curtain.classList.add('fade-out');
      clearInterval(bubbleInterval);

      // 平滑帶動向下滑動微滾動 (若使用者位於頂部)
      if (window.scrollY < 80) {
        window.scrollBy({ top: 320, behavior: 'smooth' });
      }
    }, 8300);
    welcomeTimeouts.push(t4);
  }

  // ==========================================
  // 20. 水族職人交流留言板與評分系統 (Guestbook & Reviews)
  // ==========================================
  const GB_STORAGE_KEY = 'ocean_craftsman_guestbook_v1';

  const defaultGuestbookReviews = [
    {
      id: "gb-review-1",
      name: "尼格羅黑水客 · 廷宇",
      badge: "🌟 水族大師",
      avatar: "🐠",
      rating: 5,
      tag: "魚種百科心得",
      speciesCode: "HECKEL-DISCUS",
      speciesName: "黑格爾七彩神仙 (野生黑格爾)",
      message: "網站的黑格爾野生七彩專題寫得極度精確！尤其是第五棟線特徵與 TDS < 50 ppm、pH 4.8~6.2 弱酸黑水的繁育參數，完全吻合我飼養野生七彩十餘年的心得。3D 開場泳姿更是一絕，魚頭引領滑翔的流體姿態非常生動！",
      timestamp: "2026-08-28 16:45",
      likes: 42,
      liked: false,
      isCustom: false,
      replies: [
        {
          author: "海洋職人官方團隊",
          avatar: "🌊",
          text: "感謝廷宇大師的專業肯定！黑格爾七彩是我們最珍視的旗艦品系之一，持續推廣黑水原生生態造景是我們的核心宗旨。",
          timestamp: "2026-08-28 17:10"
        }
      ]
    },
    {
      id: "gb-review-2",
      name: "皇家鬥魂 · 展鰭所",
      badge: "👑 鬥魚王者",
      avatar: "👑",
      rating: 5,
      tag: "3D迎賓泳姿",
      speciesCode: "CROWN-BETTA",
      speciesName: "皇家藍冠尾鬥魚 (王者之冠)",
      message: "身為展鬥品系愛好者，看到皇家藍冠尾鬥魚 180° 放射狀針芒在大螢幕上霸氣游動時真的熱血沸騰！混養相容性計算機把『同種死鬥衝突』列為極危險警示，非常具有科學教育意義，強烈推薦給所有剛入坑展鬥的新手！",
      timestamp: "2026-08-27 21:15",
      likes: 31,
      liked: false,
      isCustom: false,
      replies: []
    },
    {
      id: "gb-review-3",
      name: "亞馬遜底層控 · 阿宏",
      badge: "🦐 鼠魚愛好者",
      avatar: "🐟",
      rating: 5,
      tag: "水質設備交流",
      speciesCode: "C-GOLD-STRIPE",
      speciesName: "帝王金線鼠 (CW010)",
      message: "Corydoras 專題收錄了整整 28 款鼠魚，從帝王金線、綠線到超級舒瓦茲應有盡有！水質日誌搭配 NH3/NO2 毒性預警系統非常實用，以前測完水質都記在紙本筆記，現在直接在網站上記錄並生成折線圖與換水建議，太神啦！",
      timestamp: "2026-08-26 14:30",
      likes: 25,
      liked: false,
      isCustom: false,
      replies: []
    },
    {
      id: "gb-review-4",
      name: "翠綠水影 · 浩然",
      badge: "🌿 造景達人",
      avatar: "🌿",
      rating: 5,
      tag: "混養相容性評測",
      speciesCode: "ALTUM-ANGEL",
      speciesName: "埃及神仙魚 (Altum)",
      message: "五大混養評測矩陣（水溫、酸鹼、性情、水層、食性）非常客觀嚴謹！特別是神仙魚成體與極小燈魚的混養警示，避免了很多新手倒缸的慘劇。整體深海毛玻璃 UI 質感非常奢華，已加入瀏覽器書籤每天回訪！",
      timestamp: "2026-08-25 10:05",
      likes: 28,
      liked: false,
      isCustom: false,
      replies: []
    }
  ];

  let gbState = {
    reviews: [],
    filter: 'all',
    search: '',
    sort: 'latest',
    selectedAvatar: '🐠',
    selectedRating: 5
  };

  const ratingDescriptions = {
    5: "5 星 - 極致典藏 · 必訪水族殿堂",
    4: "4 星 - 專業詳實 · 值得深度收藏",
    3: "3 星 - 內容豐富 · 期待更多品系",
    2: "2 星 - 基本實用 · 有待優化功能",
    1: "1 星 - 尚需改進 · 建議加強更新"
  };

  function loadGuestbookReviews() {
    try {
      const stored = localStorage.getItem(GB_STORAGE_KEY);
      if (stored) {
        gbState.reviews = JSON.parse(stored);
      } else {
        gbState.reviews = JSON.parse(JSON.stringify(defaultGuestbookReviews));
        saveGuestbookReviews();
      }
    } catch (e) {
      console.warn('Failed to load guestbook from storage', e);
      gbState.reviews = JSON.parse(JSON.stringify(defaultGuestbookReviews));
    }
  }

  function saveGuestbookReviews() {
    try {
      localStorage.setItem(GB_STORAGE_KEY, JSON.stringify(gbState.reviews));
    } catch (e) {
      console.warn('Failed to save guestbook to storage', e);
    }
  }

  function populateGbSpeciesDropdown() {
    const select = document.getElementById('gb-species');
    if (!select) return;

    const currentVal = select.value;
    select.innerHTML = '<option value="">-- 無特別關聯 / 全站評價 --</option>';

    const speciesList = (state.species && state.species.length > 0) ? state.species : (window.allSpeciesData || []);
    speciesList.forEach(fish => {
      const opt = document.createElement('option');
      opt.value = fish.code || fish.id;
      opt.textContent = `${fish.name} (${fish.sciName || ''})`;
      select.appendChild(opt);
    });

    if (currentVal) select.value = currentVal;
  }

  function initGuestbookReviews() {
    loadGuestbookReviews();
    populateGbSpeciesDropdown();

    // 1. 互動 5 星評分器
    const starPicker = document.getElementById('gb-star-picker');
    const ratingDesc = document.getElementById('gb-rating-desc');
    const ratingInput = document.getElementById('gb-selected-rating');

    if (starPicker) {
      const stars = starPicker.querySelectorAll('.star-btn');
      stars.forEach(star => {
        const val = parseInt(star.getAttribute('data-rating'), 10);

        star.addEventListener('mouseenter', () => {
          stars.forEach(s => {
            const sVal = parseInt(s.getAttribute('data-rating'), 10);
            if (sVal <= val) {
              s.classList.add('hover');
            } else {
              s.classList.remove('hover');
            }
          });
          if (ratingDesc) ratingDesc.textContent = ratingDescriptions[val] || `${val} 星`;
        });

        star.addEventListener('mouseleave', () => {
          stars.forEach(s => s.classList.remove('hover'));
          if (ratingDesc) ratingDesc.textContent = ratingDescriptions[gbState.selectedRating] || `${gbState.selectedRating} 星`;
        });

        star.addEventListener('click', () => {
          gbState.selectedRating = val;
          if (ratingInput) ratingInput.value = val.toString();
          stars.forEach(s => {
            const sVal = parseInt(s.getAttribute('data-rating'), 10);
            if (sVal <= val) {
              s.classList.add('active');
            } else {
              s.classList.remove('active');
            }
          });
          if (ratingDesc) ratingDesc.textContent = ratingDescriptions[val] || `${val} 星`;
        });
      });
    }

    // 2. 頭像選擇器
    const avatarPicker = document.getElementById('gb-avatar-picker');
    const avatarInput = document.getElementById('gb-selected-avatar');
    if (avatarPicker) {
      const btns = avatarPicker.querySelectorAll('.avatar-opt');
      btns.forEach(btn => {
        btn.addEventListener('click', () => {
          btns.forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          const av = btn.getAttribute('data-avatar');
          gbState.selectedAvatar = av;
          if (avatarInput) avatarInput.value = av;
        });
      });
    }

    // 3. 字數即時統計
    const messageInput = document.getElementById('gb-message');
    const charCounter = document.getElementById('gb-char-now');
    if (messageInput && charCounter) {
      messageInput.addEventListener('input', () => {
        charCounter.textContent = messageInput.value.length.toString();
      });
    }

    // 4. 表單提交
    const form = document.getElementById('guestbook-form');
    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const nameInput = document.getElementById('gb-name');
        const badgeInput = document.getElementById('gb-badge');
        const tagInput = document.getElementById('gb-tag');
        const speciesSelect = document.getElementById('gb-species');

        const name = nameInput ? nameInput.value.trim() : '';
        const message = messageInput ? messageInput.value.trim() : '';

        if (!name || !message) {
          showToast('⚠️ 請填寫魚友暱稱與留言內容！');
          return;
        }

        const badge = badgeInput ? badgeInput.value : '🌟 水族大師';
        const tag = tagInput ? tagInput.value : '魚種百科心得';
        const speciesCode = speciesSelect ? speciesSelect.value : '';
        let speciesName = '';
        if (speciesCode) {
          const matched = (state.species || []).find(s => s.code === speciesCode || s.id === speciesCode);
          speciesName = matched ? matched.name : (speciesSelect.options[speciesSelect.selectedIndex]?.text || '');
        }

        const now = new Date();
        const pad = n => n.toString().padStart(2, '0');
        const timeStr = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}`;

        const newReview = {
          id: `gb-user-${Date.now()}`,
          name: name,
          badge: badge,
          avatar: gbState.selectedAvatar,
          rating: gbState.selectedRating,
          tag: tag,
          speciesCode: speciesCode,
          speciesName: speciesName,
          message: message,
          timestamp: timeStr,
          likes: 1,
          liked: true,
          isCustom: true,
          replies: []
        };

        gbState.reviews.unshift(newReview);
        saveGuestbookReviews();
        renderGuestbook();

        form.reset();
        if (charCounter) charCounter.textContent = '0';
        gbState.selectedRating = 5;
        if (ratingInput) ratingInput.value = '5';
        if (ratingDesc) ratingDesc.textContent = ratingDescriptions[5];
        if (starPicker) {
          starPicker.querySelectorAll('.star-btn').forEach(s => s.classList.add('active'));
        }

        showToast('🎉 您的水族評價已成功發布！感謝您與廣大魚友分享心得！');
      });
    }

    // 5. 篩選標籤
    const filterChips = document.querySelectorAll('.gb-chip');
    filterChips.forEach(chip => {
      chip.addEventListener('click', () => {
        filterChips.forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        gbState.filter = chip.getAttribute('data-filter') || 'all';
        renderGuestbook();
      });
    });

    // 6. 搜尋框
    const searchInput = document.getElementById('gb-search-input');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        gbState.search = e.target.value.trim().toLowerCase();
        renderGuestbook();
      });
    }

    // 7. 排序切換
    const sortSelect = document.getElementById('gb-sort-select');
    if (sortSelect) {
      sortSelect.addEventListener('change', (e) => {
        gbState.sort = e.target.value;
        renderGuestbook();
      });
    }

    // 初次渲染
    renderGuestbook();
  }

  function renderGuestbook() {
    updateGuestbookStats();
    renderGuestbookList();
  }

  function updateGuestbookStats() {
    const total = gbState.reviews.length;
    const avgScoreEl = document.getElementById('gb-avg-score');
    const avgStarsEl = document.getElementById('gb-avg-stars');
    const totalCountEl = document.getElementById('gb-total-reviews-count');
    const recommendRateEl = document.getElementById('gb-recommend-rate');

    if (!avgScoreEl) return;

    if (total === 0) {
      avgScoreEl.textContent = '5.0';
      if (totalCountEl) totalCountEl.textContent = '0';
      if (recommendRateEl) recommendRateEl.textContent = '100%';
      return;
    }

    const sumScore = gbState.reviews.reduce((acc, r) => acc + (r.rating || 5), 0);
    const avgScore = (sumScore / total).toFixed(1);
    avgScoreEl.textContent = avgScore;

    if (totalCountEl) totalCountEl.textContent = total.toString();

    // 星星圖標計算
    if (avgStarsEl) {
      const rounded = Math.round(parseFloat(avgScore));
      let starsHtml = '';
      for (let i = 1; i <= 5; i++) {
        if (i <= rounded) {
          starsHtml += '<i class="fas fa-star"></i>';
        } else {
          starsHtml += '<i class="far fa-star"></i>';
        }
      }
      avgStarsEl.innerHTML = starsHtml;
    }

    // 推薦度 (4星以上比例)
    const recCount = gbState.reviews.filter(r => (r.rating || 5) >= 4).length;
    const recRate = Math.round((recCount / total) * 100);
    if (recommendRateEl) recommendRateEl.textContent = `${recRate}%`;

    // 各星級數量與長度
    for (let s = 1; s <= 5; s++) {
      const count = gbState.reviews.filter(r => (r.rating || 5) === s).length;
      const pct = Math.round((count / total) * 100);
      const barEl = document.getElementById(`gb-bar-${s}`);
      const countEl = document.getElementById(`gb-count-${s}star`);

      if (barEl) barEl.style.width = `${pct}%`;
      if (countEl) countEl.textContent = count.toString();
    }
  }

  function renderGuestbookList() {
    const container = document.getElementById('gb-comments-container');
    if (!container) return;

    let list = [...gbState.reviews];

    // 篩選
    if (gbState.filter === '5star') {
      list = list.filter(r => r.rating === 5);
    } else if (gbState.filter === '4plus') {
      list = list.filter(r => r.rating >= 4);
    } else if (gbState.filter === 'fish') {
      list = list.filter(r => (r.tag && (r.tag.includes('魚種') || r.tag.includes('品系') || r.tag.includes('繁育'))) || r.speciesCode);
    } else if (gbState.filter === 'water') {
      list = list.filter(r => r.tag && (r.tag.includes('水質') || r.tag.includes('造景') || r.tag.includes('設備')));
    }

    // 搜尋
    if (gbState.search) {
      const q = gbState.search;
      list = list.filter(r =>
        (r.name && r.name.toLowerCase().includes(q)) ||
        (r.message && r.message.toLowerCase().includes(q)) ||
        (r.tag && r.tag.toLowerCase().includes(q)) ||
        (r.speciesName && r.speciesName.toLowerCase().includes(q))
      );
    }

    // 排序
    if (gbState.sort === 'highest') {
      list.sort((a, b) => (b.rating || 0) - (a.rating || 0) || (b.likes || 0) - (a.likes || 0));
    } else if (gbState.sort === 'likes') {
      list.sort((a, b) => (b.likes || 0) - (a.likes || 0) || (b.rating || 0) - (a.rating || 0));
    } else {
      // latest (預設原始順序)
    }

    if (list.length === 0) {
      container.innerHTML = `
        <div class="gb-empty-state">
          <i class="fas fa-water"></i>
          <h4>暫無符合條件的職人留言</h4>
          <p>歡迎成為第一位發表評價或分享養殖心得的水族同好！</p>
        </div>
      `;
      return;
    }

    container.innerHTML = list.map(item => {
      const starsHtml = Array.from({ length: 5 }, (_, i) =>
        i < item.rating ? '<i class="fas fa-star"></i>' : '<i class="far fa-star"></i>'
      ).join('');

      const speciesBadge = (item.speciesCode && item.speciesName) ? `
        <span class="gb-species-pill" onclick="oceanApp.openSpeciesDetail('${item.speciesCode}')" title="點擊檢視【${item.speciesName}】微距百科">
          <i class="fas fa-fish"></i> ${item.speciesName}
        </span>
      ` : '';

      const deleteBtn = item.isCustom ? `
        <button type="button" class="gb-action-btn gb-delete-btn" onclick="oceanApp.deleteCustomReview('${item.id}')" title="刪除此則留言">
          <i class="fas fa-trash-alt"></i> 刪除
        </button>
      ` : '';

      const repliesHtml = (item.replies && item.replies.length > 0) ? `
        <div class="gb-replies-list">
          ${item.replies.map(rep => `
            <div class="gb-reply-item">
              <span class="gb-reply-avatar">${rep.avatar || '💬'}</span>
              <div class="gb-reply-content">
                <div class="gb-reply-meta">
                  <span class="gb-reply-author">${rep.author || '水族同好'}</span>
                  <span class="gb-reply-time">${rep.timestamp || ''}</span>
                </div>
                <div class="gb-reply-text">${rep.text}</div>
              </div>
            </div>
          `).join('')}
        </div>
      ` : '';

      return `
        <div class="gb-comment-card" id="card-${item.id}">
          <div class="gb-card-top">
            <div class="gb-user-info">
              <div class="gb-user-avatar">${item.avatar || '🐠'}</div>
              <div class="gb-user-meta">
                <div class="gb-user-name-row">
                  <span class="gb-author-name">${item.name}</span>
                  <span class="gb-author-badge">${item.badge || '🌟 水族大師'}</span>
                </div>
                <span class="gb-post-time"><i class="far fa-clock"></i> ${item.timestamp}</span>
              </div>
            </div>

            <div class="gb-card-rating">
              <div class="gb-card-stars">${starsHtml}</div>
              <span class="gb-card-score">${item.rating}.0</span>
            </div>
          </div>

          <div class="gb-card-tags-row">
            <span class="gb-tag-pill">${item.tag || '魚種百科心得'}</span>
            ${speciesBadge}
          </div>

          <div class="gb-card-body">${item.message}</div>

          <div class="gb-card-footer">
            <div class="gb-card-actions">
              <button type="button" class="gb-action-btn ${item.liked ? 'liked' : ''}" onclick="oceanApp.toggleReviewLike('${item.id}')">
                <i class="${item.liked ? 'fas fa-heart' : 'far fa-heart'}"></i>
                <span id="likes-count-${item.id}">${item.likes || 0}</span> 個讚
              </button>
              <button type="button" class="gb-action-btn" onclick="oceanApp.toggleReplyBox('${item.id}')">
                <i class="far fa-comment"></i> 回覆 (${(item.replies || []).length})
              </button>
              ${deleteBtn}
            </div>
          </div>

          <div class="gb-replies-section" id="replies-section-${item.id}">
            ${repliesHtml}
            <div class="gb-reply-form" id="reply-form-${item.id}" style="display: none;">
              <input type="text" class="gb-reply-input" id="reply-input-${item.id}" placeholder="寫下您的回覆或交流見解..." maxlength="200" onkeydown="if(event.key==='Enter'){oceanApp.submitReviewReply('${item.id}');}">
              <button type="button" class="gb-reply-submit" onclick="oceanApp.submitReviewReply('${item.id}')">發送</button>
            </div>
          </div>
        </div>
      `;
    }).join('');
  }

  function toggleReviewLike(id) {
    const review = gbState.reviews.find(r => r.id === id);
    if (!review) return;

    if (review.liked) {
      review.likes = Math.max(0, (review.likes || 1) - 1);
      review.liked = false;
    } else {
      review.likes = (review.likes || 0) + 1;
      review.liked = true;
      showToast('❤️ 已為魚友的精彩心得點讚！');
    }

    saveGuestbookReviews();
    renderGuestbook();
  }

  function toggleReplyBox(id) {
    const formEl = document.getElementById(`reply-form-${id}`);
    if (!formEl) return;
    if (formEl.style.display === 'none' || !formEl.style.display) {
      formEl.style.display = 'flex';
      const input = document.getElementById(`reply-input-${id}`);
      if (input) input.focus();
    } else {
      formEl.style.display = 'none';
    }
  }

  function submitReviewReply(id) {
    const input = document.getElementById(`reply-input-${id}`);
    if (!input) return;
    const text = input.value.trim();
    if (!text) {
      showToast('⚠️ 請輸入回覆內容！');
      return;
    }

    const review = gbState.reviews.find(r => r.id === id);
    if (!review) return;

    if (!review.replies) review.replies = [];

    const now = new Date();
    const pad = n => n.toString().padStart(2, '0');
    const timeStr = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}`;

    review.replies.push({
      author: '熱心魚友',
      avatar: '💬',
      text: text,
      timestamp: timeStr
    });

    saveGuestbookReviews();
    renderGuestbook();
    showToast('💬 回覆已成功送出！');
  }

  function deleteCustomReview(id) {
    if (!confirm('確定要刪除這則您發布的留言嗎？')) return;
    gbState.reviews = gbState.reviews.filter(r => r.id !== id);
    saveGuestbookReviews();
    renderGuestbook();
    showToast('🗑️ 留言已成功刪除。');
  }

  // ==========================================
  // 21. 滾動導覽列偵測 (ScrollSpy)
  // ==========================================
  function initScrollSpy() {
    const sections = document.querySelectorAll('section[id], header[id]');
    const navLinks = document.querySelectorAll('.nav-links .nav-link');

    window.addEventListener('scroll', () => {
      let currentSectionId = '';
      const scrollY = window.pageYOffset || document.documentElement.scrollTop;

      sections.forEach(section => {
        const sectionTop = section.offsetTop - 120;
        const sectionHeight = section.offsetHeight;
        if (scrollY >= sectionTop && scrollY < sectionTop + sectionHeight) {
          currentSectionId = section.getAttribute('id');
        }
      });

      if (currentSectionId) {
        navLinks.forEach(link => {
          link.classList.remove('active');
          if (link.getAttribute('href') === `#${currentSectionId}`) {
            link.classList.add('active');
          }
        });
      }
    });
  }

  // 將方法掛載至 window 以便 HTML 內 onclick 呼叫
  window.oceanApp = {
    openSpeciesDetail,
    closeSpeciesModal,
    toggleFavorite,
    openWishlistDrawer,
    closeWishlistDrawer,
    quickAddToCompat,
    updateCompatQty,
    removeCompatFish,
    deleteWaterLog,
    switchMyTank,
    removeFishFromCurrentTank,
    play3DEntrance: playAquaticWelcome3D,
    toggleReviewLike,
    toggleReplyBox,
    submitReviewReply,
    deleteCustomReview
  };

  // 啟動應用
  init();
});

