/**
 * VOLT MARKET - Core Data Service
 * Shared LocalStorage management for Public & Admin
 */

const VOLT_STORAGE_KEYS = {
  products: 'volt_products',
  categories: 'volt_categories',
  brands: 'volt_brands',
  users: 'volt_users',
  currentUser: 'volt_current_user',
  cart: 'volt_cart',
  orders: 'volt_orders',
  wishlist: 'volt_wishlist',
  compare: 'volt_compare',
  reviews: 'volt_reviews',
  coupons: 'volt_coupons',
  banners: 'volt_banners',
  messages: 'volt_messages',
  settings: 'volt_settings',
  adminSession: 'volt_admin_session',
  notifications: 'volt_notifications'
};

// ========== UTILITY ==========
const DataService = {
  get(key) {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : null;
    } catch (e) {
      console.error('Error reading from storage:', key, e);
      return null;
    }
  },

  set(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (e) {
      console.error('Error writing to storage:', key, e);
      return false;
    }
  },

  remove(key) {
    localStorage.removeItem(key);
  },

  // Generate unique ID
  generateId(prefix = 'id') {
    return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  },

  // Generate SKU
  generateSKU(category, brand) {
    const catCode = (category || 'GEN').substring(0, 3).toUpperCase();
    const brandCode = (brand || 'VLT').substring(0, 3).toUpperCase();
    const num = Math.floor(Math.random() * 90000) + 10000;
    return `${catCode}-${brandCode}-${num}`;
  },

  // Format currency
  formatPrice(price) {
    const settings = this.get(VOLT_STORAGE_KEYS.settings) || {};
    const currency = settings.currency || 'UZS';
    const language = window.I18n?.language || 'uz';
    const locale = language === 'ru' ? 'ru-RU' : language === 'en' ? 'en-US' : 'uz-UZ';
    if (currency === 'UZS') {
      const amount = new Intl.NumberFormat(locale, { maximumFractionDigits: 0 }).format(price);
      const label = language === 'uz' ? 'soʻm' : language === 'ru' ? 'сум' : 'UZS';
      return language === 'en' ? `${label} ${amount}` : `${amount} ${label}`;
    }
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(price);
  },

  // Format date
  formatDate(dateStr) {
    if (!dateStr) return '-';
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  },

  // Toast notification
  toast(message, type = 'info', duration = 3000) {
    const existing = document.querySelector('.volt-toast');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.className = `volt-toast volt-toast-${type}`;
    toast.innerHTML = `
      <span class="toast-icon">${type === 'success' ? '✓' : type === 'error' ? '✕' : type === 'warning' ? '⚠' : 'ℹ'}</span>
      <span class="toast-msg">${message}</span>
    `;
    document.body.appendChild(toast);
    
    requestAnimationFrame(() => toast.classList.add('show'));
    
    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 300);
    }, duration);
  },

  // Debounce
  debounce(fn, delay = 300) {
    let timer;
    return (...args) => {
      clearTimeout(timer);
      timer = setTimeout(() => fn.apply(this, args), delay);
    };
  }
};

// Existing demo records were stored in USD. Convert once so the Uzbekistan
// catalog, checkout, admin totals, and future admin-entered UZS prices agree.
function migrateDemoDataToUzs() {
  const migrationKey = 'volt_currency_uzs_v1';
  if (localStorage.getItem(migrationKey)) return;

  const rate = 12800;
  const products = DataService.get(VOLT_STORAGE_KEYS.products) || [];
  products.forEach(product => {
    if (Number.isFinite(product.price)) product.price = Math.round(product.price * rate);
    if (Number.isFinite(product.oldPrice)) product.oldPrice = Math.round(product.oldPrice * rate);
  });
  DataService.set(VOLT_STORAGE_KEYS.products, products);

  const coupons = DataService.get(VOLT_STORAGE_KEYS.coupons) || [];
  coupons.forEach(coupon => {
    if (Number.isFinite(coupon.minOrder)) coupon.minOrder = Math.round(coupon.minOrder * rate);
    if (coupon.type === 'fixed' && Number.isFinite(coupon.value)) coupon.value = Math.round(coupon.value * rate);
  });
  DataService.set(VOLT_STORAGE_KEYS.coupons, coupons);

  const orders = DataService.get(VOLT_STORAGE_KEYS.orders) || [];
  orders.forEach(order => {
    ['subtotal', 'shipping', 'tax', 'discount', 'total'].forEach(field => {
      if (Number.isFinite(order[field])) order[field] = Math.round(order[field] * rate);
    });
    (order.items || []).forEach(item => {
      if (Number.isFinite(item.price)) item.price = Math.round(item.price * rate);
      if (Number.isFinite(item.total)) item.total = Math.round(item.total * rate);
    });
  });
  DataService.set(VOLT_STORAGE_KEYS.orders, orders);

  const users = DataService.get(VOLT_STORAGE_KEYS.users) || [];
  users.forEach(user => {
    if (Number.isFinite(user.totalSpent)) user.totalSpent = Math.round(user.totalSpent * rate);
  });
  DataService.set(VOLT_STORAGE_KEYS.users, users);

  const settings = DataService.get(VOLT_STORAGE_KEYS.settings) || {};
  ['deliveryFee', 'freeDeliveryMin', 'minOrderAmount'].forEach(field => {
    if (Number.isFinite(settings[field])) settings[field] = Math.round(settings[field] * rate);
  });
  settings.currency = 'UZS';
  settings.currencySymbol = 'soʻm';
  settings.exchangeRate = rate;
  settings.taxRate = 0.12;
  settings.storePhone = '+998 71 200 00 00';
  settings.storeAddress = 'Toshkent, O‘zbekiston';
  DataService.set(VOLT_STORAGE_KEYS.settings, settings);
  localStorage.setItem(migrationKey, 'true');
}

function migrateUzbekistanTaxRate() {
  const migrationKey = 'volt_uz_tax_rate_v1';
  if (localStorage.getItem(migrationKey)) return;
  const settings = DataService.get(VOLT_STORAGE_KEYS.settings) || {};
  if (settings.currency === 'UZS' && settings.taxRate === 0.08) {
    settings.taxRate = 0.12;
    DataService.set(VOLT_STORAGE_KEYS.settings, settings);
  }
  localStorage.setItem(migrationKey, 'true');
}

// ========== INITIALIZATION ==========
function initializeDemoData() {
  // Check if already initialized
  if (DataService.get(VOLT_STORAGE_KEYS.products) && DataService.get(VOLT_STORAGE_KEYS.products).length > 100) {
    migrateDemoDataToUzs();
    migrateUzbekistanTaxRate();
    console.log('Demo data already exists');
    return;
  }

  console.log('Initializing VOLT MARKET demo data...');

  // Categories
  const categories = [
    { id: 'cat_smartphones', name: 'Smartphones', slug: 'smartphones', description: 'Latest smartphones from top brands', image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400', productCount: 0, status: 'active', createdAt: '2024-01-15' },
    { id: 'cat_laptops', name: 'Laptops', slug: 'laptops', description: 'High-performance laptops for work and gaming', image: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400', productCount: 0, status: 'active', createdAt: '2024-01-15' },
    { id: 'cat_computers', name: 'Computers', slug: 'computers', description: 'Desktop PCs and workstations', image: 'https://images.unsplash.com/photo-1587831990711-23ca6441447b?w=400', productCount: 0, status: 'active', createdAt: '2024-01-15' },
    { id: 'cat_tvs', name: 'TVs', slug: 'tvs', description: 'Smart TVs and displays', image: 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=400', productCount: 0, status: 'active', createdAt: '2024-01-15' },
    { id: 'cat_refrigerators', name: 'Refrigerators', slug: 'refrigerators', description: 'Energy-efficient refrigerators', image: 'https://images.unsplash.com/photo-1571175443880-49e1d7b8b2e8?w=400', productCount: 0, status: 'active', createdAt: '2024-01-15' },
    { id: 'cat_washing', name: 'Washing Machines', slug: 'washing-machines', description: 'Front and top load washing machines', image: 'https://images.unsplash.com/photo-1626806787461-102c1bfaaea1?w=400', productCount: 0, status: 'active', createdAt: '2024-01-15' },
    { id: 'cat_kitchen', name: 'Kitchen Appliances', slug: 'kitchen-appliances', description: 'Microwaves, ovens, blenders and more', image: 'https://images.unsplash.com/photo-1556911220-bff31c812dba?w=400', productCount: 0, status: 'active', createdAt: '2024-01-15' },
    { id: 'cat_ac', name: 'Air Conditioners', slug: 'air-conditioners', description: 'Split and portable ACs', image: 'https://images.unsplash.com/photo-1631545910441-0c4e5a2c8f3e?w=400', productCount: 0, status: 'active', createdAt: '2024-01-15' },
    { id: 'cat_audio', name: 'Audio', slug: 'audio', description: 'Headphones, speakers and sound systems', image: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=400', productCount: 0, status: 'active', createdAt: '2024-01-15' },
    { id: 'cat_smarthome', name: 'Smart Home', slug: 'smart-home', description: 'Smart devices for modern living', image: 'https://images.unsplash.com/photo-1558002038-1055907df827?w=400', productCount: 0, status: 'active', createdAt: '2024-01-15' }
  ];

  // Brands
  const brands = [
    { id: 'brand_apple', name: 'Apple', slug: 'apple', logo: 'https://logo.clearbit.com/apple.com', description: 'Think Different', productCount: 0, status: 'active' },
    { id: 'brand_samsung', name: 'Samsung', slug: 'samsung', logo: 'https://logo.clearbit.com/samsung.com', description: 'Do What You Can\'t', productCount: 0, status: 'active' },
    { id: 'brand_sony', name: 'Sony', slug: 'sony', logo: 'https://logo.clearbit.com/sony.com', description: 'Be Moved', productCount: 0, status: 'active' },
    { id: 'brand_lg', name: 'LG', slug: 'lg', logo: 'https://logo.clearbit.com/lg.com', description: 'Life\'s Good', productCount: 0, status: 'active' },
    { id: 'brand_xiaomi', name: 'Xiaomi', slug: 'xiaomi', logo: 'https://logo.clearbit.com/mi.com', description: 'Innovation for Everyone', productCount: 0, status: 'active' },
    { id: 'brand_huawei', name: 'Huawei', slug: 'huawei', logo: 'https://logo.clearbit.com/huawei.com', description: 'Building a Fully Connected Intelligent World', productCount: 0, status: 'active' },
    { id: 'brand_dell', name: 'Dell', slug: 'dell', logo: 'https://logo.clearbit.com/dell.com', description: 'Technology that drives human progress', productCount: 0, status: 'active' },
    { id: 'brand_hp', name: 'HP', slug: 'hp', logo: 'https://logo.clearbit.com/hp.com', description: 'Keep Reinventing', productCount: 0, status: 'active' },
    { id: 'brand_lenovo', name: 'Lenovo', slug: 'lenovo', logo: 'https://logo.clearbit.com/lenovo.com', description: 'Smarter Technology for All', productCount: 0, status: 'active' },
    { id: 'brand_asus', name: 'ASUS', slug: 'asus', logo: 'https://logo.clearbit.com/asus.com', description: 'In Search of Incredible', productCount: 0, status: 'active' },
    { id: 'brand_msi', name: 'MSI', slug: 'msi', logo: 'https://logo.clearbit.com/msi.com', description: 'True Gaming', productCount: 0, status: 'active' },
    { id: 'brand_bosch', name: 'Bosch', slug: 'bosch', logo: 'https://logo.clearbit.com/bosch.com', description: 'Invented for life', productCount: 0, status: 'active' },
    { id: 'brand_philips', name: 'Philips', slug: 'philips', logo: 'https://logo.clearbit.com/philips.com', description: 'Innovation and you', productCount: 0, status: 'active' },
    { id: 'brand_panasonic', name: 'Panasonic', slug: 'panasonic', logo: 'https://logo.clearbit.com/panasonic.com', description: 'A Better Life, A Better World', productCount: 0, status: 'active' },
    { id: 'brand_whirlpool', name: 'Whirlpool', slug: 'whirlpool', logo: 'https://logo.clearbit.com/whirlpool.com', description: 'Every day, care', productCount: 0, status: 'active' },
    { id: 'brand_bose', name: 'Bose', slug: 'bose', logo: 'https://logo.clearbit.com/bose.com', description: 'Better sound through research', productCount: 0, status: 'active' },
    { id: 'brand_jbl', name: 'JBL', slug: 'jbl', logo: 'https://logo.clearbit.com/jbl.com', description: 'Loud and Clear', productCount: 0, status: 'active' },
    { id: 'brand_google', name: 'Google', slug: 'google', logo: 'https://logo.clearbit.com/google.com', description: 'Organize the world\'s information', productCount: 0, status: 'active' },
    { id: 'brand_amazon', name: 'Amazon', slug: 'amazon', logo: 'https://logo.clearbit.com/amazon.com', description: 'Work hard. Have fun. Make history.', productCount: 0, status: 'active' },
    { id: 'brand_microsoft', name: 'Microsoft', slug: 'microsoft', logo: 'https://logo.clearbit.com/microsoft.com', description: 'Empower every person and organization', productCount: 0, status: 'active' }
  ];

  // Product templates by category
  const productTemplates = {
    smartphones: {
      names: ['Pro Max', 'Ultra', 'Plus', 'Lite', 'Note', 'Fold', 'Flip', 'Edge', 'Nova', 'Pixel'],
      specs: ['6.1" AMOLED', '6.7" Dynamic AMOLED', '6.8" LTPO', '5.4" OLED'],
      colors: ['Black', 'White', 'Blue', 'Green', 'Purple', 'Gold', 'Silver', 'Titanium'],
      priceRange: [299, 1499],
      images: [
        'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=500',
        'https://images.unsplash.com/photo-1592890288564-76628a30a657?w=500',
        'https://images.unsplash.com/photo-1598327105666-5b89351aff32?w=500',
        'https://images.unsplash.com/photo-1580910051074-3eb694886505?w=500'
      ]
    },
    laptops: {
      names: ['ProBook', 'Ultrabook', 'Gaming', 'Studio', 'Air', 'Elite', 'Swift', 'ZenBook', 'ThinkPad', 'Inspiron'],
      specs: ['14" FHD IPS', '15.6" 144Hz', '16" 4K OLED', '13.3" Retina'],
      colors: ['Silver', 'Space Gray', 'Black', 'Blue', 'White'],
      priceRange: [499, 2999],
      images: [
        'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=500',
        'https://images.unsplash.com/photo-1525547717930-92dcec2ad03c?w=500',
        'https://images.unsplash.com/photo-1588872657578-7b1fe4fc1a2c?w=500',
        'https://images.unsplash.com/photo-1593642702821-c8da6771f0c6?w=500'
      ]
    },
    computers: {
      names: ['Desktop Pro', 'Gaming Tower', 'Workstation', 'Mini PC', 'All-in-One', 'Creator'],
      specs: ['Intel i7', 'AMD Ryzen 9', 'RTX 4070', '32GB RAM'],
      colors: ['Black', 'White', 'RGB'],
      priceRange: [599, 3499],
      images: [
        'https://images.unsplash.com/photo-1587831990711-23ca6441447b?w=500',
        'https://images.unsplash.com/photo-1593640408182-31c70c8268f5?w=500',
        'https://images.unsplash.com/photo-1625948515291-69613efd103f?w=500'
      ]
    },
    tvs: {
      names: ['OLED', 'QLED', 'Neo QLED', 'Crystal', 'NanoCell', 'Mini-LED'],
      specs: ['55"', '65"', '75"', '85"', '4K UHD', '8K'],
      colors: ['Black', 'Silver'],
      priceRange: [399, 4999],
      images: [
        'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=500',
        'https://images.unsplash.com/photo-1461151293854-98f2b5b2c5f1?w=500',
        'https://images.unsplash.com/photo-1593784991095-a205069470b6?w=500'
      ]
    },
    refrigerators: {
      names: ['French Door', 'Side-by-Side', 'Bottom Freezer', 'Top Freezer', 'Smart Fridge'],
      specs: ['500L', '600L', '700L', 'Inverter', 'No Frost'],
      colors: ['Stainless Steel', 'Black', 'White', 'Silver'],
      priceRange: [599, 3499],
      images: [
        'https://images.unsplash.com/photo-1571175443880-49e1d7b8b2e8?w=500',
        'https://images.unsplash.com/photo-1584568694244-14fbdf83bd30?w=500'
      ]
    },
    washing: {
      names: ['Front Load', 'Top Load', 'Washer Dryer', 'Smart Wash'],
      specs: ['8kg', '10kg', '12kg', 'Inverter Motor', 'Steam'],
      colors: ['White', 'Silver', 'Black'],
      priceRange: [349, 1499],
      images: [
        'https://images.unsplash.com/photo-1626806787461-102c1bfaaea1?w=500',
        'https://images.unsplash.com/photo-1610557892470-55d9e80c0bce?w=500'
      ]
    },
    kitchen: {
      names: ['Microwave', 'Air Fryer', 'Blender', 'Coffee Maker', 'Toaster', 'Electric Oven', 'Food Processor'],
      specs: ['1000W', '1500W', 'Digital', 'Smart Control'],
      colors: ['Black', 'White', 'Red', 'Silver', 'Stainless'],
      priceRange: [49, 599],
      images: [
        'https://images.unsplash.com/photo-1556911220-bff31c812dba?w=500',
        'https://images.unsplash.com/photo-1585515320310-259814833e62?w=500',
        'https://images.unsplash.com/photo-1574269909862-7e1d70bb8078?w=500'
      ]
    },
    ac: {
      names: ['Split AC', 'Portable AC', 'Window AC', 'Inverter AC', 'Smart AC'],
      specs: ['1 Ton', '1.5 Ton', '2 Ton', 'Energy Star', 'WiFi'],
      colors: ['White', 'Silver'],
      priceRange: [299, 1299],
      images: [
        'https://images.unsplash.com/photo-1631545910441-0c4e5a2c8f3e?w=500',
        'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=500'
      ]
    },
    audio: {
      names: ['Wireless Headphones', 'Noise Cancelling', 'Bluetooth Speaker', 'Soundbar', 'Earbuds', 'Gaming Headset'],
      specs: ['ANC', '40mm Drivers', 'IPX7', '30h Battery', 'Hi-Res Audio'],
      colors: ['Black', 'White', 'Blue', 'Red', 'Green'],
      priceRange: [29, 499],
      images: [
        'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=500',
        'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500',
        'https://images.unsplash.com/photo-1484704849700-f032a568e944?w=500',
        'https://images.unsplash.com/photo-1545127398-14699f92334b?w=500'
      ]
    },
    smarthome: {
      names: ['Smart Speaker', 'Smart Bulb', 'Security Camera', 'Smart Lock', 'Thermostat', 'Robot Vacuum', 'Smart Plug'],
      specs: ['WiFi', 'Zigbee', 'Matter', 'Alexa', 'Google Home', '1080p', '4K'],
      colors: ['White', 'Black', 'Gray'],
      priceRange: [19, 399],
      images: [
        'https://images.unsplash.com/photo-1558002038-1055907df827?w=500',
        'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=500',
        'https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=500'
      ]
    }
  };

  const categoryMap = {
    'cat_smartphones': 'smartphones',
    'cat_laptops': 'laptops',
    'cat_computers': 'computers',
    'cat_tvs': 'tvs',
    'cat_refrigerators': 'refrigerators',
    'cat_washing': 'washing',
    'cat_kitchen': 'kitchen',
    'cat_ac': 'ac',
    'cat_audio': 'audio',
    'cat_smarthome': 'smarthome'
  };

  // Generate 1000+ products
  const products = [];
  let productIndex = 1;

  categories.forEach(cat => {
    const templateKey = categoryMap[cat.id];
    const template = productTemplates[templateKey];
    const relevantBrands = brands.filter(b => {
      // Assign brands more realistically
      if (templateKey === 'smartphones') return ['brand_apple', 'brand_samsung', 'brand_xiaomi', 'brand_huawei', 'brand_google', 'brand_sony'].includes(b.id);
      if (templateKey === 'laptops' || templateKey === 'computers') return ['brand_apple', 'brand_dell', 'brand_hp', 'brand_lenovo', 'brand_asus', 'brand_msi', 'brand_microsoft'].includes(b.id);
      if (templateKey === 'tvs') return ['brand_samsung', 'brand_lg', 'brand_sony', 'brand_panasonic'].includes(b.id);
      if (templateKey === 'audio') return ['brand_sony', 'brand_bose', 'brand_jbl', 'brand_apple', 'brand_samsung'].includes(b.id);
      if (templateKey === 'smarthome') return ['brand_google', 'brand_amazon', 'brand_apple', 'brand_samsung', 'brand_xiaomi', 'brand_philips'].includes(b.id);
      return ['brand_lg', 'brand_samsung', 'brand_bosch', 'brand_philips', 'brand_panasonic', 'brand_whirlpool'].includes(b.id);
    });

    // Generate ~100 products per category
    for (let i = 0; i < 100; i++) {
      const brand = relevantBrands[Math.floor(Math.random() * relevantBrands.length)];
      const namePart = template.names[Math.floor(Math.random() * template.names.length)];
      const year = 2023 + Math.floor(Math.random() * 3);
      const name = `${brand.name} ${namePart} ${year}`;
      
      const basePrice = template.priceRange[0] + Math.random() * (template.priceRange[1] - template.priceRange[0]);
      const price = Math.round(basePrice / 10) * 10;
      const hasDiscount = Math.random() > 0.5;
      const discountPercent = hasDiscount ? Math.floor(Math.random() * 30) + 5 : 0;
      const oldPrice = hasDiscount ? Math.round(price / (1 - discountPercent / 100) / 10) * 10 : null;

      const colors = [];
      const numColors = Math.floor(Math.random() * 3) + 1;
      const shuffledColors = [...template.colors].sort(() => Math.random() - 0.5);
      for (let c = 0; c < numColors; c++) colors.push(shuffledColors[c]);

      const stock = Math.floor(Math.random() * 100) + 5;
      const isNew = Math.random() > 0.7;
      const isBestSeller = Math.random() > 0.8;
      const rating = (3.5 + Math.random() * 1.5).toFixed(1);
      const reviewCount = Math.floor(Math.random() * 500) + 10;

      const mainImage = template.images[Math.floor(Math.random() * template.images.length)];
      const gallery = template.images.filter(img => img !== mainImage).slice(0, 3);

      const specs = {};
      if (templateKey === 'smartphones') {
        specs.display = template.specs[Math.floor(Math.random() * template.specs.length)];
        specs.ram = `${[6, 8, 12, 16][Math.floor(Math.random() * 4)]}GB`;
        specs.storage = `${[128, 256, 512, 1024][Math.floor(Math.random() * 4)]}GB`;
        specs.battery = `${[4000, 4500, 5000, 5500][Math.floor(Math.random() * 4)]}mAh`;
        specs.camera = `${[48, 50, 64, 108, 200][Math.floor(Math.random() * 5)]}MP`;
        specs.processor = ['Snapdragon 8 Gen 2', 'A17 Pro', 'Dimensity 9200', 'Exynos 2400', 'Tensor G3'][Math.floor(Math.random() * 5)];
      } else if (templateKey === 'laptops') {
        specs.display = template.specs[Math.floor(Math.random() * template.specs.length)];
        specs.processor = ['Intel Core i5-13500H', 'Intel Core i7-13700H', 'AMD Ryzen 7 7735HS', 'Apple M2', 'Apple M3 Pro'][Math.floor(Math.random() * 5)];
        specs.ram = `${[8, 16, 32, 64][Math.floor(Math.random() * 4)]}GB`;
        specs.storage = `${[256, 512, 1024, 2048][Math.floor(Math.random() * 4)]}GB SSD`;
        specs.graphics = ['Integrated', 'RTX 4050', 'RTX 4060', 'RTX 4070', 'Apple GPU'][Math.floor(Math.random() * 5)];
      } else {
        specs.feature1 = template.specs[Math.floor(Math.random() * template.specs.length)];
        specs.feature2 = template.specs[Math.floor(Math.random() * template.specs.length)];
        specs.warranty = `${[1, 2, 3][Math.floor(Math.random() * 3)]} Year`;
      }

      products.push({
        id: `prod_${String(productIndex).padStart(5, '0')}`,
        sku: DataService.generateSKU(cat.name, brand.name),
        name,
        slug: name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        categoryId: cat.id,
        categoryName: cat.name,
        brandId: brand.id,
        brandName: brand.name,
        price,
        oldPrice,
        discount: discountPercent,
        description: `Experience the premium ${name}. Designed for performance and style. Perfect for everyday use with advanced features and reliable build quality. Part of the VOLT MARKET exclusive collection.`,
        shortDescription: `Premium ${cat.name.toLowerCase()} with advanced features.`,
        mainImage,
        gallery,
        colors,
        specifications: specs,
        stock,
        warranty: `${[1, 2, 3][Math.floor(Math.random() * 3)]} Year Official Warranty`,
        status: stock > 0 ? 'active' : 'out_of_stock',
        isNew,
        isBestSeller,
        isFeatured: Math.random() > 0.85,
        rating: parseFloat(rating),
        reviewCount,
        soldCount: Math.floor(Math.random() * 1000),
        views: Math.floor(Math.random() * 5000),
        createdAt: new Date(2024, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1).toISOString(),
        updatedAt: new Date().toISOString()
      });

      productIndex++;
      cat.productCount++;
      brand.productCount = (brand.productCount || 0) + 1;
    }
  });

  // Demo users
  const users = [
    {
      id: 'user_001',
      email: 'demo@voltmarket.com',
      password: 'demo123',
      firstName: 'Behruz',
      lastName: 'Karimov',
      phone: '+998 90 000 00 01',
      avatar: null,
      addresses: [
        {
          id: 'addr_001',
          type: 'home',
          fullName: 'Behruz Karimov',
          phone: '+998 90 000 00 01',
          address: 'Amir Temur ko‘chasi, 1',
          city: 'Toshkent',
          state: 'Toshkent shahri',
          zip: '100000',
          country: 'UZ',
          isDefault: true
        }
      ],
      createdAt: '2024-06-15T10:00:00Z',
      status: 'active',
      totalSpent: 2450.00,
      orderCount: 5
    },
    {
      id: 'user_002',
      email: 'sarah@example.com',
      password: 'password123',
      firstName: 'Malika',
      lastName: 'Rahimova',
      phone: '+998 90 000 00 02',
      avatar: null,
      addresses: [],
      createdAt: '2024-08-20T14:30:00Z',
      status: 'active',
      totalSpent: 890.00,
      orderCount: 2
    },
    {
      id: 'user_003',
      email: 'mike@example.com',
      password: 'password123',
      firstName: 'Sardor',
      lastName: 'Qodirov',
      phone: '+998 90 000 00 03',
      avatar: null,
      addresses: [],
      createdAt: '2024-09-10T09:15:00Z',
      status: 'active',
      totalSpent: 3200.00,
      orderCount: 8
    }
  ];

  // Demo coupons
  const coupons = [
    { id: 'coup_001', code: 'WELCOME10', type: 'percentage', value: 10, minOrder: 50, maxUses: 1000, usedCount: 245, expiresAt: '2026-12-31', status: 'active', description: '10% off for new customers' },
    { id: 'coup_002', code: 'SAVE50', type: 'fixed', value: 50, minOrder: 200, maxUses: 500, usedCount: 89, expiresAt: '2026-12-31', status: 'active', description: '$50 off orders over $200' },
    { id: 'coup_003', code: 'FLASH25', type: 'percentage', value: 25, minOrder: 100, maxUses: 100, usedCount: 67, expiresAt: '2026-06-30', status: 'expired', description: '25% flash sale' },
    { id: 'coup_004', code: 'FREESHIP', type: 'fixed', value: 15, minOrder: 75, maxUses: 9999, usedCount: 1200, expiresAt: '2026-12-31', status: 'active', description: 'Free shipping equivalent' }
  ];

  // Demo banners
  const banners = [
    { id: 'ban_001', title: 'Summer Tech Sale', description: 'Up to 40% off on selected electronics', image: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=1200', link: 'catalog.html?filter=deals', status: 'active', order: 1 },
    { id: 'ban_002', title: 'New Arrivals 2025', description: 'Discover the latest gadgets', image: 'https://images.unsplash.com/photo-1468495244123-6c6c332eeece?w=1200', link: 'catalog.html?filter=new', status: 'active', order: 2 },
    { id: 'ban_003', title: 'Premium Audio Collection', description: 'Immerse yourself in pure sound', image: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=1200', link: 'catalog.html?cat=audio', status: 'active', order: 3 }
  ];

  // Demo reviews
  const reviews = [];
  const reviewTexts = [
    'Excellent product! Highly recommend.',
    'Great value for money. Works perfectly.',
    'Good quality but shipping was slow.',
    'Amazing features, love it!',
    'Solid build quality. Happy with purchase.',
    'Exactly as described. Fast delivery.',
    'Premium feel and performance.',
    'Best purchase this year!',
    'Satisfied overall, minor issues with setup.',
    'Outstanding product, will buy again.'
  ];

  for (let i = 0; i < 200; i++) {
    const product = products[Math.floor(Math.random() * products.length)];
    const user = users[Math.floor(Math.random() * users.length)];
    reviews.push({
      id: `rev_${String(i + 1).padStart(4, '0')}`,
      productId: product.id,
      productName: product.name,
      userId: user.id,
      userName: `${user.firstName} ${user.lastName}`,
      rating: Math.floor(Math.random() * 2) + 4, // 4-5 mostly
      title: ['Great product!', 'Highly recommended', 'Worth every penny', 'Good buy', 'Excellent quality'][Math.floor(Math.random() * 5)],
      comment: reviewTexts[Math.floor(Math.random() * reviewTexts.length)],
      status: Math.random() > 0.1 ? 'approved' : 'pending',
      createdAt: new Date(2024, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1).toISOString(),
      helpful: Math.floor(Math.random() * 50)
    });
  }

  // Demo orders
  const orders = [];
  const statuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
  const paymentMethods = ['credit_card', 'paypal', 'cash_on_delivery', 'bank_transfer'];

  for (let i = 0; i < 50; i++) {
    const user = users[Math.floor(Math.random() * users.length)];
    const numItems = Math.floor(Math.random() * 3) + 1;
    const orderItems = [];
    let subtotal = 0;

    for (let j = 0; j < numItems; j++) {
      const product = products[Math.floor(Math.random() * products.length)];
      const qty = Math.floor(Math.random() * 2) + 1;
      const itemTotal = product.price * qty;
      subtotal += itemTotal;
      orderItems.push({
        productId: product.id,
        productName: product.name,
        productImage: product.mainImage,
        price: product.price,
        quantity: qty,
        total: itemTotal
      });
    }

    const shipping = subtotal > 100 ? 0 : 15;
    const tax = Math.round(subtotal * 0.08 * 100) / 100;
    const total = subtotal + shipping + tax;
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    const daysAgo = Math.floor(Math.random() * 90);

    orders.push({
      id: `ORD-${String(10000 + i)}`,
      userId: user.id,
      customerName: `${user.firstName} ${user.lastName}`,
      customerEmail: user.email,
      customerPhone: user.phone,
      items: orderItems,
      subtotal,
      shipping,
      tax,
      discount: 0,
      total,
      status,
      paymentMethod: paymentMethods[Math.floor(Math.random() * paymentMethods.length)],
      paymentStatus: status === 'cancelled' ? 'refunded' : 'paid',
      shippingAddress: {
        fullName: `${user.firstName} ${user.lastName}`,
        phone: user.phone,
        address: 'Amir Temur ko‘chasi, 1',
        city: 'Toshkent',
        state: 'Toshkent shahri',
        zip: '100000',
        country: 'UZ'
      },
      trackingNumber: status === 'shipped' || status === 'delivered' ? `TRK${Math.random().toString(36).substr(2, 10).toUpperCase()}` : null,
      notes: '',
      createdAt: new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date().toISOString()
    });
  }

  // Settings
  const settings = {
    storeName: 'VOLT MARKET',
    storeEmail: 'support@voltmarket.com',
    storePhone: '+998 71 200 00 00',
    storeAddress: 'Toshkent, O‘zbekiston',
    currency: 'USD',
    currencySymbol: '$',
    deliveryFee: 15,
    freeDeliveryMin: 100,
    minOrderAmount: 20,
    taxRate: 0.12,
    logo: null,
    theme: 'dark',
    notifications: {
      orderUpdates: true,
      promotions: true,
      newsletter: true
    }
  };

  // Messages
  const messages = [
    { id: 'msg_001', name: 'Alice Brown', email: 'alice@email.com', subject: 'Product Inquiry', message: 'Hi, is the Samsung Galaxy S24 available in stock?', status: 'unread', createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() },
    { id: 'msg_002', name: 'Bob Smith', email: 'bob@email.com', subject: 'Order Issue', message: 'My order ORD-10005 has not arrived yet. Can you check?', status: 'read', createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString() },
    { id: 'msg_003', name: 'Carol White', email: 'carol@email.com', subject: 'Return Request', message: 'I would like to return the headphones I purchased last week.', status: 'unread', createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString() }
  ];

  // Save everything
  DataService.set(VOLT_STORAGE_KEYS.categories, categories);
  DataService.set(VOLT_STORAGE_KEYS.brands, brands);
  DataService.set(VOLT_STORAGE_KEYS.products, products);
  DataService.set(VOLT_STORAGE_KEYS.users, users);
  DataService.set(VOLT_STORAGE_KEYS.coupons, coupons);
  DataService.set(VOLT_STORAGE_KEYS.banners, banners);
  DataService.set(VOLT_STORAGE_KEYS.reviews, reviews);
  DataService.set(VOLT_STORAGE_KEYS.orders, orders);
  DataService.set(VOLT_STORAGE_KEYS.settings, settings);
  DataService.set(VOLT_STORAGE_KEYS.messages, messages);
  DataService.set(VOLT_STORAGE_KEYS.cart, []);
  DataService.set(VOLT_STORAGE_KEYS.wishlist, []);
  DataService.set(VOLT_STORAGE_KEYS.compare, []);
  DataService.set(VOLT_STORAGE_KEYS.notifications, []);
  migrateDemoDataToUzs();
  migrateUzbekistanTaxRate();

  console.log(`Initialized: ${products.length} products, ${categories.length} categories, ${brands.length} brands, ${orders.length} orders`);
}

// Auto-initialize on load
if (typeof window !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    initializeDemoData();
  });
}

// Export for modules
if (typeof module !== 'undefined') {
  module.exports = { DataService, VOLT_STORAGE_KEYS, initializeDemoData };
}
