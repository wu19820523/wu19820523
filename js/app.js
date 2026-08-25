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
    lightboxClose: document.getElementById('lightbox-close')
  };

  // ==========================================
  // 1. 初始化與事件綁定 (Initialization & Events)
  // ==========================================
  function init() {
    renderCuratedFlagships();
    filterAndRenderSpecies();
    updateWishlistBadge();
    bindEvents();
    calculateTankParameters();
    initScrollSpy();
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
    const featuredItems = state.species.filter(s => s.featured).slice(0, 4);

    el.curatedGrid.innerHTML = featuredItems.map(item => `
      <div class="curated-card">
        <div class="curated-card-media">
          <img src="${item.image}" alt="${item.name}" loading="lazy">
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
      el.resultsCount.innerHTML = `共收錄 <strong>${result.length}</strong> 種珍稀物種 (總資料庫 50 種)`;
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
            <img src="${species.image}" alt="${species.name}" class="card-banner-bg" loading="lazy">
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

            <div class="card-action-bar">
              <button class="btn-view-details" onclick="window.oceanApp.openSpeciesDetail('${species.id}')">
                <i class="fas fa-book-open"></i> 查閱職人檔案
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
          <img src="${item.image}" alt="${item.name}">
          <div class="curated-badge" style="top:12px; left:12px;">${item.badge || item.code}</div>
        </div>
        <div class="modal-title-area">
          <div style="display:flex; align-items:center; justify-content:space-between; gap:12px; margin-bottom:6px;">
            <span style="background:rgba(245,185,66,0.15); border:1px solid var(--border-gold); color:var(--primary); font-size:0.78rem; padding:3px 10px; border-radius:var(--radius-full); font-weight:700;">
              ${item.code} · ${item.categoryLabel}
            </span>
            <button class="btn-wishlist" style="padding:6px 14px; font-size:0.82rem;" onclick="window.oceanApp.toggleFavorite('${item.id}', event)">
              <i class="fas fa-heart" style="color:${isFav ? 'var(--accent-ruby)' : 'inherit'}"></i> ${isFav ? '已收藏' : '加入收藏'}
            </button>
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

  // 將方法掛載至 window 以便 HTML 內 onclick 呼叫
  window.oceanApp = {
    openSpeciesDetail,
    closeSpeciesModal,
    toggleFavorite,
    openWishlistDrawer,
    closeWishlistDrawer
  };

  // 啟動應用
  init();
});
