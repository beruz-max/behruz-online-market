/**
 * VOLT MARKET - Core Public JavaScript
 */

// ========== CART ==========
const Cart = {
  get() {
    return DataService.get(VOLT_STORAGE_KEYS.cart) || [];
  },

  save(cart) {
    DataService.set(VOLT_STORAGE_KEYS.cart, cart);
    this.updateBadge();
  },

  add(productId, quantity = 1) {
    const products = DataService.get(VOLT_STORAGE_KEYS.products) || [];
    const product = products.find(p => p.id === productId);
    if (!product) {
      DataService.toast('Product not found', 'error');
      return false;
    }
    if (product.stock < 1) {
      DataService.toast('Product is out of stock', 'error');
      return false;
    }

    let cart = this.get();
    const existing = cart.find(item => item.productId === productId);
    
    if (existing) {
      if (existing.quantity + quantity > product.stock) {
        DataService.toast('Not enough stock available', 'warning');
        return false;
      }
      existing.quantity += quantity;
    } else {
      cart.push({
        productId,
        quantity,
        addedAt: new Date().toISOString()
      });
    }

    this.save(cart);
    DataService.toast('Added to cart', 'success');
    return true;
  },

  remove(productId) {
    let cart = this.get().filter(item => item.productId !== productId);
    this.save(cart);
    DataService.toast('Removed from cart', 'info');
  },

  updateQuantity(productId, quantity) {
    let cart = this.get();
    const item = cart.find(i => i.productId === productId);
    if (item) {
      if (quantity < 1) {
        this.remove(productId);
        return;
      }
      const products = DataService.get(VOLT_STORAGE_KEYS.products) || [];
      const product = products.find(p => p.id === productId);
      if (product && quantity > product.stock) {
        DataService.toast('Not enough stock', 'warning');
        return;
      }
      item.quantity = quantity;
      this.save(cart);
    }
  },

  clear() {
    this.save([]);
  },

  getCount() {
    return this.get().reduce((sum, item) => sum + item.quantity, 0);
  },

  getTotal() {
    const products = DataService.get(VOLT_STORAGE_KEYS.products) || [];
    return this.get().reduce((sum, item) => {
      const product = products.find(p => p.id === item.productId);
      return sum + (product ? product.price * item.quantity : 0);
    }, 0);
  },

  updateBadge() {
    const badges = document.querySelectorAll('.cart-count');
    const count = this.getCount();
    badges.forEach(b => {
      b.textContent = count;
      b.style.display = count > 0 ? 'flex' : 'none';
    });
  }
};

// ========== WISHLIST ==========
const Wishlist = {
  get() {
    return DataService.get(VOLT_STORAGE_KEYS.wishlist) || [];
  },

  save(list) {
    DataService.set(VOLT_STORAGE_KEYS.wishlist, list);
    this.updateBadge();
  },

  toggle(productId) {
    let list = this.get();
    const idx = list.indexOf(productId);
    if (idx > -1) {
      list.splice(idx, 1);
      DataService.toast('Removed from wishlist', 'info');
    } else {
      list.push(productId);
      DataService.toast('Added to wishlist', 'success');
    }
    this.save(list);
    return idx === -1;
  },

  has(productId) {
    return this.get().includes(productId);
  },

  updateBadge() {
    const badges = document.querySelectorAll('.wishlist-count');
    const count = this.get().length;
    badges.forEach(b => {
      b.textContent = count;
      b.style.display = count > 0 ? 'flex' : 'none';
    });
  }
};

// ========== COMPARE ==========
const Compare = {
  get() {
    return DataService.get(VOLT_STORAGE_KEYS.compare) || [];
  },

  save(list) {
    DataService.set(VOLT_STORAGE_KEYS.compare, list);
    this.updateBadge();
  },

  toggle(productId) {
    let list = this.get();
    const idx = list.indexOf(productId);
    if (idx > -1) {
      list.splice(idx, 1);
      DataService.toast('Removed from compare', 'info');
    } else {
      if (list.length >= 4) {
        DataService.toast('You can compare max 4 products', 'warning');
        return false;
      }
      list.push(productId);
      DataService.toast('Added to compare', 'success');
    }
    this.save(list);
    return idx === -1;
  },

  has(productId) {
    return this.get().includes(productId);
  },

  updateBadge() {
    const badges = document.querySelectorAll('.compare-count');
    const count = this.get().length;
    badges.forEach(b => {
      b.textContent = count;
      b.style.display = count > 0 ? 'flex' : 'none';
    });
  }
};

// ========== AUTH ==========
const Auth = {
  getCurrentUser() {
    return DataService.get(VOLT_STORAGE_KEYS.currentUser);
  },

  login(email, password) {
    const users = DataService.get(VOLT_STORAGE_KEYS.users) || [];
    const user = users.find(u => u.email === email && u.password === password);
    if (user) {
      const { password: _, ...safeUser } = user;
      DataService.set(VOLT_STORAGE_KEYS.currentUser, safeUser);
      return { success: true, user: safeUser };
    }
    return { success: false, message: 'Invalid email or password' };
  },

  register(data) {
    const users = DataService.get(VOLT_STORAGE_KEYS.users) || [];
    if (users.find(u => u.email === data.email)) {
      return { success: false, message: 'Email already registered' };
    }
    const newUser = {
      id: DataService.generateId('user'),
      email: data.email,
      password: data.password,
      firstName: data.firstName,
      lastName: data.lastName,
      phone: data.phone || '',
      avatar: null,
      addresses: [],
      createdAt: new Date().toISOString(),
      status: 'active',
      totalSpent: 0,
      orderCount: 0
    };
    users.push(newUser);
    DataService.set(VOLT_STORAGE_KEYS.users, users);
    const { password: _, ...safeUser } = newUser;
    DataService.set(VOLT_STORAGE_KEYS.currentUser, safeUser);
    return { success: true, user: safeUser };
  },

  logout() {
    DataService.remove(VOLT_STORAGE_KEYS.currentUser);
    window.location.href = 'index.html';
  },

  isLoggedIn() {
    return !!this.getCurrentUser();
  },

  requireAuth() {
    if (!this.isLoggedIn()) {
      window.location.href = 'login.html?redirect=' + encodeURIComponent(window.location.pathname);
      return false;
    }
    return true;
  }
};

// ========== PRODUCT HELPERS ==========
const ProductHelper = {
  getAll() {
    return DataService.get(VOLT_STORAGE_KEYS.products) || [];
  },

  getById(id) {
    return this.getAll().find(p => p.id === id);
  },

  getByCategory(categoryId) {
    return this.getAll().filter(p => p.categoryId === categoryId && p.status === 'active');
  },

  getFeatured(limit = 8) {
    return this.getAll().filter(p => p.isFeatured && p.status === 'active').slice(0, limit);
  },

  getNewArrivals(limit = 8) {
    return this.getAll()
      .filter(p => p.isNew && p.status === 'active')
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, limit);
  },

  getBestSellers(limit = 8) {
    return this.getAll()
      .filter(p => p.isBestSeller && p.status === 'active')
      .sort((a, b) => b.soldCount - a.soldCount)
      .slice(0, limit);
  },

  getDeals(limit = 12) {
    return this.getAll()
      .filter(p => p.discount > 0 && p.status === 'active')
      .sort((a, b) => b.discount - a.discount)
      .slice(0, limit);
  },

  search(query) {
    const q = query.toLowerCase().trim();
    if (!q) return [];
    return this.getAll().filter(p =>
      p.status === 'active' && (
        p.name.toLowerCase().includes(q) ||
        p.brandName.toLowerCase().includes(q) ||
        p.categoryName.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q)
      )
    );
  },

  filter(products, filters = {}) {
    let result = [...products];
    
    if (filters.category) {
      result = result.filter(p => p.categoryId === filters.category);
    }
    if (filters.brand) {
      result = result.filter(p => p.brandId === filters.brand);
    }
    if (filters.minPrice !== undefined) {
      result = result.filter(p => p.price >= filters.minPrice);
    }
    if (filters.maxPrice !== undefined) {
      result = result.filter(p => p.price <= filters.maxPrice);
    }
    if (filters.inStock) {
      result = result.filter(p => p.stock > 0);
    }
    if (filters.onSale) {
      result = result.filter(p => p.discount > 0);
    }
    if (filters.rating) {
      result = result.filter(p => p.rating >= filters.rating);
    }

    // Sort
    if (filters.sort) {
      switch (filters.sort) {
        case 'price-asc': result.sort((a, b) => a.price - b.price); break;
        case 'price-desc': result.sort((a, b) => b.price - a.price); break;
        case 'name': result.sort((a, b) => a.name.localeCompare(b.name)); break;
        case 'rating': result.sort((a, b) => b.rating - a.rating); break;
        case 'newest': result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)); break;
        case 'popular': result.sort((a, b) => b.soldCount - a.soldCount); break;
        default: break;
      }
    }

    return result;
  },

  renderCard(product) {
    const stars = '★'.repeat(Math.floor(product.rating)) + '☆'.repeat(5 - Math.floor(product.rating));
    const inWishlist = Wishlist.has(product.id);
    const inCompare = Compare.has(product.id);

    return `
      <div class="product-card" data-id="${product.id}">
        <div class="product-card-image">
          <a href="product.html?id=${product.id}">
            <img src="${product.mainImage}" alt="${product.name}" loading="lazy" onerror="this.src='assets/images/product-placeholder.svg'">
          </a>
          ${product.discount > 0 ? `<span class="product-badge badge-sale">-${product.discount}%</span>` : ''}
          ${product.isNew ? `<span class="product-badge badge-new" style="top:${product.discount > 0 ? '40px' : '12px'}">NEW</span>` : ''}
          ${product.isBestSeller && !product.isNew ? `<span class="product-badge badge-best">BEST</span>` : ''}
          <div class="product-actions">
            <button class="product-action-btn ${inWishlist ? 'active' : ''}" onclick="Wishlist.toggle('${product.id}'); this.classList.toggle('active')" title="Wishlist">
              <svg width="16" height="16" fill="${inWishlist ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
            </button>
            <button class="product-action-btn ${inCompare ? 'active' : ''}" onclick="Compare.toggle('${product.id}'); this.classList.toggle('active')" title="Compare">
              <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M18 20V10M12 20V4M6 20v-6"/></svg>
            </button>
            <button class="product-action-btn" onclick="Cart.add('${product.id}')" title="Add to Cart">
              <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
            </button>
          </div>
        </div>
        <div class="product-card-body">
          <div class="product-brand">${product.brandName}</div>
          <a href="product.html?id=${product.id}" class="product-name">${product.name}</a>
          <div class="product-rating">
            <span class="stars">${stars}</span>
            <span style="color:var(--text-muted)">(${product.reviewCount})</span>
          </div>
          <div class="product-price">
            <span class="price-current">${DataService.formatPrice(product.price)}</span>
            ${product.oldPrice ? `<span class="price-old">${DataService.formatPrice(product.oldPrice)}</span>` : ''}
          </div>
        </div>
      </div>
    `;
  },

  renderStars(rating) {
    return '★'.repeat(Math.floor(rating)) + '☆'.repeat(5 - Math.floor(rating));
  }
};

// ========== UI COMPONENTS ==========
const UI = {
  renderHeader() {
    const user = Auth.getCurrentUser();
    const settings = DataService.get(VOLT_STORAGE_KEYS.settings) || {};
    const cartCount = Cart.getCount();
    const wishCount = Wishlist.get().length;
    const compareCount = Compare.get().length;

    return `
      <header class="header">
        <div class="header-top">
          <div class="container">
            <span>🚚 <span data-i18n="Free delivery on orders over">${window.I18n?.t('Free delivery on orders over') || 'Free delivery on orders over'}</span> ${DataService.formatPrice(settings.freeDeliveryMin ?? 1280000)}</span>
            <div style="display:flex;gap:1.5rem">
              <a href="admin/">Admin</a>
              ${user ? `<span><span data-i18n="Hi,">${window.I18n?.t('Hi,') || 'Hi,'}</span> ${user.firstName}</span>` : `<a href="login.html">Login</a> / <a href="register.html">Register</a>`}
              <label class="header-locale" aria-label="Site language">
                <span>◎</span>
                <select data-language-switch aria-label="Site language">
                  <option value="uz">UZ</option><option value="ru">RU</option><option value="en">EN</option>
                </select>
              </label>
            </div>
          </div>
        </div>
        <div class="header-main">
          <div class="container">
            <a href="index.html" class="logo">
              <div class="logo-icon">⚡</div>
              <span>VOLT</span>
            </a>
            <div class="search-box">
              <svg class="search-icon" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
              <input type="text" id="globalSearch" placeholder="Search products, brands..." autocomplete="off">
              <div id="searchResults" style="display:none;position:absolute;top:100%;left:0;right:0;background:var(--bg-secondary);border:1px solid var(--border-color);border-radius:var(--radius-md);margin-top:4px;max-height:400px;overflow-y:auto;z-index:100;box-shadow:var(--shadow-lg)"></div>
            </div>
            <div class="header-actions">
              <a href="compare.html" class="header-action" title="Compare">
                <svg width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M18 20V10M12 20V4M6 20v-6"/></svg>
                <span class="badge-count compare-count" style="display:${compareCount > 0 ? 'flex' : 'none'}">${compareCount}</span>
              </a>
              <a href="wishlist.html" class="header-action" title="Wishlist">
                <svg width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
                <span class="badge-count wishlist-count" style="display:${wishCount > 0 ? 'flex' : 'none'}">${wishCount}</span>
              </a>
              <a href="cart.html" class="header-action" title="Cart">
                <svg width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
                <span class="badge-count cart-count" style="display:${cartCount > 0 ? 'flex' : 'none'}">${cartCount}</span>
              </a>
              <a href="login.html" class="header-action" title="Account">
                <svg width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
              </a>
            </div>
          </div>
        </div>
        <nav class="nav-bar">
          <div class="container">
            <a href="catalog.html" class="nav-link">All Products</a>
            <a href="catalog.html?cat=smartphones" class="nav-link">Smartphones</a>
            <a href="catalog.html?cat=laptops" class="nav-link">Laptops</a>
            <a href="catalog.html?cat=tvs" class="nav-link">TVs</a>
            <a href="catalog.html?cat=audio" class="nav-link">Audio</a>
            <a href="catalog.html?cat=smart-home" class="nav-link">Smart Home</a>
            <a href="catalog.html?filter=deals" class="nav-link" style="color:var(--error)">🔥 Deals</a>
            <a href="catalog.html?filter=new" class="nav-link">New Arrivals</a>
          </div>
        </nav>
      </header>
    `;
  },

  renderFooter() {
    return `
      <footer class="footer">
        <div class="container">
          <div class="footer-grid">
            <div class="footer-brand">
              <a href="index.html" class="logo">
                <div class="logo-icon">⚡</div>
                <span>VOLT MARKET</span>
              </a>
              <p>Your premier destination for cutting-edge electronics and premium technology. Experience the future of shopping.</p>
            </div>
            <div class="footer-col">
              <h4>Shop</h4>
              <a href="catalog.html">All Products</a>
              <a href="catalog.html?filter=deals">Deals & Offers</a>
              <a href="catalog.html?filter=new">New Arrivals</a>
              <a href="cart.html">Shopping Cart</a>
            </div>
            <div class="footer-col">
              <h4>Account</h4>
              <a href="login.html">Sign In</a>
              <a href="register.html">Create Account</a>
              <a href="admin/">Admin Panel</a>
            </div>
          </div>
          <div class="footer-bottom">
            <span>© ${new Date().getFullYear()} VOLT MARKET. All rights reserved.</span>
            <span>Demo Platform • LocalStorage Based</span>
          </div>
        </div>
      </footer>
    `;
  },

  initSearch() {
    const input = document.getElementById('globalSearch');
    const results = document.getElementById('searchResults');
    if (!input || !results) return;

    const doSearch = DataService.debounce((q) => {
      if (q.length < 2) {
        results.style.display = 'none';
        return;
      }
      const found = ProductHelper.search(q).slice(0, 8);
      if (found.length === 0) {
        results.innerHTML = '<div style="padding:1rem;color:var(--text-muted)">No products found</div>';
      } else {
        results.innerHTML = found.map(p => `
          <a href="product.html?id=${p.id}" style="display:flex;align-items:center;gap:12px;padding:0.75rem 1rem;border-bottom:1px solid var(--border-color);transition:background 0.15s" onmouseover="this.style.background='var(--bg-tertiary)'" onmouseout="this.style.background='transparent'">
            <img src="${p.mainImage}" style="width:40px;height:40px;object-fit:cover;border-radius:6px" onerror="this.src='assets/images/product-placeholder.svg'">
            <div>
              <div style="font-size:0.9rem;font-weight:500">${p.name}</div>
              <div style="font-size:0.8rem;color:var(--accent-secondary)">${DataService.formatPrice(p.price)}</div>
            </div>
          </a>
        `).join('') + `<a href="catalog.html?q=${encodeURIComponent(q)}" style="display:block;padding:0.75rem;text-align:center;color:var(--accent-secondary);font-weight:600;font-size:0.9rem">View all results →</a>`;
      }
      results.style.display = 'block';
    }, 250);

    input.addEventListener('input', (e) => doSearch(e.target.value));
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        const q = e.target.value.trim();
        if (q) window.location.href = `catalog.html?q=${encodeURIComponent(q)}`;
      }
    });

    document.addEventListener('click', (e) => {
      if (!input.contains(e.target) && !results.contains(e.target)) {
        results.style.display = 'none';
      }
    });
  },

  getUrlParam(name) {
    const params = new URLSearchParams(window.location.search);
    return params.get(name);
  }
};

// ========== INIT ==========
document.addEventListener('DOMContentLoaded', () => {
  // Inject header/footer if placeholders exist
  const headerEl = document.getElementById('site-header');
  const footerEl = document.getElementById('site-footer');
  if (headerEl) headerEl.innerHTML = UI.renderHeader();
  if (footerEl) footerEl.innerHTML = UI.renderFooter();

  // Init search
  UI.initSearch();

  // Update badges
  Cart.updateBadge();
  Wishlist.updateBadge();
  Compare.updateBadge();

  // Reveal sections and cards as they enter the viewport. This is purely
  // decorative and leaves all content visible for users who reduce motion.
  if ('IntersectionObserver' in window && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const revealObserver = new IntersectionObserver(entries => entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        revealObserver.unobserve(entry.target);
      }
    }), { threshold: 0.08, rootMargin: '0px 0px -24px 0px' });
    const revealSelector = '.section, .hero-showcase, .service-item, .product-card, .category-card, .newsletter-panel';
    const revealTree = node => {
      if (!(node instanceof Element)) return;
      if (node.matches(revealSelector)) {
        node.classList.add('reveal-on-scroll');
        revealObserver.observe(node);
      }
      node.querySelectorAll(revealSelector).forEach(element => {
        element.classList.add('reveal-on-scroll');
        revealObserver.observe(element);
      });
    };
    revealTree(document.body);
    new MutationObserver(records => records.forEach(record => record.addedNodes.forEach(revealTree)))
      .observe(document.body, { childList: true, subtree: true });
  }
});
