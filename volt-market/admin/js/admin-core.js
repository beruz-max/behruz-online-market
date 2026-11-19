/**
 * VOLT MARKET Admin Core
 */

const AdminUI = {
  sidebarItems: [
    { section: 'Main' },
    { id: 'dashboard', label: 'Dashboard', icon: '📊', href: 'dashboard.html' },
    { section: 'Catalog' },
    { id: 'products', label: 'Products', icon: '📦', href: 'products.html' },
    { id: 'add-product', label: 'Add Product', icon: '➕', href: 'add-product.html' },
    { section: 'Sales' },
    { id: 'orders', label: 'Orders', icon: '🛒', href: 'orders.html' }
  ],

  renderSidebar(activeId) {
    let html = `
      <aside class="admin-sidebar" id="adminSidebar">
        <div class="sidebar-logo">
          <div class="icon">⚡</div>
          <span class="text">VOLT // OPS</span>
        </div>
        <div class="sidebar-node-state"><span>NODE // 07</span><strong><i></i> LOCAL DEMO</strong></div>
        <nav class="sidebar-nav">
    `;

    this.sidebarItems.forEach(item => {
      if (item.section) {
        html += `<div class="nav-section-title">${item.section}</div>`;
      } else {
        html += `
          <a href="${item.href}" class="nav-item ${activeId === item.id ? 'active' : ''}">
            <span style="font-size:1.1rem;width:24px;text-align:center">${item.icon}</span>
            <span class="nav-text">${item.label}</span>
          </a>
        `;
      }
    });

    html += `
        </nav>
        <div class="sidebar-footer">
          <a href="#" class="nav-item" onclick="AdminAuth.logout(); return false;">
            <span style="font-size:1.1rem;width:24px;text-align:center">🚪</span>
            <span class="nav-text">Logout</span>
          </a>
          <a href="../index.html" class="nav-item" target="_blank">
            <span style="font-size:1.1rem;width:24px;text-align:center">🌐</span>
            <span class="nav-text">View Store</span>
          </a>
        </div>
      </aside>
    `;
    return html;
  },

  renderHeader(title) {
    const session = AdminAuth.getSession();
    return `
      <header class="admin-header">
        <div class="header-left">
          <button class="toggle-sidebar" onclick="AdminUI.toggleSidebar()">
            <svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M3 12h18M3 6h18M3 18h18"/></svg>
          </button>
          <h1 class="page-title">${title}</h1>
        </div>
        <div class="header-right">
          <span class="admin-live-status"><i></i> LOCAL DEMO / ACTIVE</span>
          <label class="admin-locale" aria-label="Site language">
            <select data-language-switch aria-label="Site language"><option value="uz">UZ</option><option value="ru">RU</option><option value="en">EN</option></select>
          </label>
          <span style="font-size:0.85rem;color:var(--admin-text2)">Admin: ${session?.username || 'admin'}</span>
          <button class="a-btn a-btn-secondary a-btn-sm" onclick="AdminAuth.logout()">Logout</button>
        </div>
      </header>
    `;
  },

  toggleSidebar() {
    const sidebar = document.getElementById('adminSidebar');
    if (window.innerWidth <= 1024) {
      sidebar.classList.toggle('open');
    } else {
      sidebar.classList.toggle('collapsed');
    }
  },

  toast(message, type = 'info') {
    const existing = document.querySelector('.admin-toast');
    if (existing) existing.remove();
    const toast = document.createElement('div');
    toast.className = 'admin-toast';
    toast.innerHTML = `<span>${type === 'success' ? '✓' : type === 'error' ? '✕' : 'ℹ'}</span> <span>${message}</span>`;
    document.body.appendChild(toast);
    requestAnimationFrame(() => toast.classList.add('show'));
    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  },

  formatPrice(price) {
    if (typeof DataService !== 'undefined') return DataService.formatPrice(price);
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(price);
  },

  formatDate(dateStr) {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  },

  getStatusBadge(status) {
    const map = {
      active: 'success', pending: 'warning', processing: 'info',
      shipped: 'primary', delivered: 'success', cancelled: 'error',
      approved: 'success', rejected: 'error', unread: 'warning',
      read: 'muted', out_of_stock: 'error', inactive: 'muted'
    };
    return `<span class="a-badge a-badge-${map[status] || 'muted'}">${status}</span>`;
  },

  // Data helpers that use the shared storage
  getProducts() { return JSON.parse(localStorage.getItem('volt_products') || '[]'); },
  getCategories() { return JSON.parse(localStorage.getItem('volt_categories') || '[]'); },
  getBrands() { return JSON.parse(localStorage.getItem('volt_brands') || '[]'); },
  getOrders() { return JSON.parse(localStorage.getItem('volt_orders') || '[]'); },
  getUsers() { return JSON.parse(localStorage.getItem('volt_users') || '[]'); },
  getReviews() { return JSON.parse(localStorage.getItem('volt_reviews') || '[]'); },
  getCoupons() { return JSON.parse(localStorage.getItem('volt_coupons') || '[]'); },
  getBanners() { return JSON.parse(localStorage.getItem('volt_banners') || '[]'); },
  getMessages() { return JSON.parse(localStorage.getItem('volt_messages') || '[]'); },
  getSettings() { return JSON.parse(localStorage.getItem('volt_settings') || '{}'); },

  saveProducts(data) { localStorage.setItem('volt_products', JSON.stringify(data)); },
  saveCategories(data) { localStorage.setItem('volt_categories', JSON.stringify(data)); },
  saveBrands(data) { localStorage.setItem('volt_brands', JSON.stringify(data)); },
  saveOrders(data) { localStorage.setItem('volt_orders', JSON.stringify(data)); },
  saveUsers(data) { localStorage.setItem('volt_users', JSON.stringify(data)); },
  saveReviews(data) { localStorage.setItem('volt_reviews', JSON.stringify(data)); },
  saveCoupons(data) { localStorage.setItem('volt_coupons', JSON.stringify(data)); },
  saveBanners(data) { localStorage.setItem('volt_banners', JSON.stringify(data)); },
  saveMessages(data) { localStorage.setItem('volt_messages', JSON.stringify(data)); },
  saveSettings(data) { localStorage.setItem('volt_settings', JSON.stringify(data)); },

  initLayout(activeId, title) {
    // Ensure demo data exists
    if (typeof initializeDemoData === 'function') {
      initializeDemoData();
    } else {
      // Load parent data service if available
      const script = document.createElement('script');
      script.src = '../js/data-service.js';
      document.head.appendChild(script);
    }

    const body = document.body;
    body.innerHTML = `
      <div class="admin-layout">
        ${this.renderSidebar(activeId)}
        <div class="admin-main">
          ${this.renderHeader(title)}
          <div class="admin-content" id="adminContent">
            <!-- Page content will be injected -->
          </div>
        </div>
      </div>
    `;
    return document.getElementById('adminContent');
  }
};
