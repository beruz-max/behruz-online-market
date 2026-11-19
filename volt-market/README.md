# ⚡ VOLT MARKET

**Professional Premium E-Commerce Platform**  
Dark Premium Design + Electric Blue · Vanilla JS · LocalStorage

---

## 🚀 Overview

VOLT MARKET is a full-featured, multi-page e-commerce platform built entirely with:

- **HTML5**
- **CSS3** (Glassmorphism, Neon effects, Responsive)
- **Vanilla JavaScript ES6+**
- **LocalStorage** for all data persistence

No frameworks (React/Vue/Angular). No backend. Fully functional demo.

---

## 📁 Project Structure

```
volt-market/
├── index.html              # Homepage
├── catalog.html            # Product catalog with filters
├── product.html            # Product detail page
├── cart.html               # Shopping cart
├── checkout.html           # Checkout flow
├── login.html              # User login
├── register.html           # User registration
├── order-success.html      # Order confirmation
├── wishlist.html           # Saved product shortlist
├── compare.html            # Side-by-side product comparison
├── css/
│   ├── variables.css       # Design system tokens
│   └── main.css            # Main public styles
├── js/
│   ├── i18n.js           # Uzbek / Russian / English UI translations
│   ├── data-service.js     # Core data layer + 1000 products generator
│   ├── payment-config.js   # Public Click endpoint setting; contains no secrets
│   ├── i18n.js             # Uzbek / Russian / English UI translations
│   └── core.js             # Cart, Wishlist, Auth, Product helpers
├── admin/
│   ├── index.html          # /admin entry and session redirect
│   ├── login.html          # Admin login
│   ├── dashboard.html      # Admin dashboard with stats
│   ├── products.html       # Product management
│   ├── add-product.html    # Create / Edit product
│   ├── css/
│   │   └── admin.css       # Admin panel styles
│   └── js/
│       ├── admin-auth.js   # Admin authentication
│       └── admin-core.js   # Admin UI & data helpers
└── README.md
```

---

## 🔑 Demo Credentials

### Public User
- **Email:** `demo@voltmarket.com`
- **Password:** `demo123`

### Admin Panel
- **URL:** `/admin` (or `/admin/`)
- **Username:** `norsafarov.mvp`
- **Password:** `behruzcr7`

---

## ✨ Features

### Public Website
- ✅ Premium dark theme with electric blue accents
- ✅ Glassmorphism UI + neon glow effects
- ✅ 1000+ auto-generated demo products
- ✅ 10 categories (Smartphones, Laptops, TVs, Audio, Smart Home, etc.)
- ✅ 20 brands
- ✅ Live search with debounce
- ✅ Product filtering by category, brand, rating, price, stock and deals
- ✅ Product detail with gallery, specs, reviews
- ✅ Shopping cart (add / update / remove)
- ✅ Dedicated wishlist and side-by-side comparison for up to four products
- ✅ Checkout with current stock, coupon expiry and usage-limit checks
- ✅ Local browser newsletter signup demo
- ✅ Uzbek / Russian / English language switch
- ✅ Uzbekistan default currency (UZS); existing browser demo data is converted once using a demo rate of 12,800 UZS/USD
- ✅ Order placement → stock update → admin sync
- ✅ User authentication (register / login)
- ✅ Toast notifications
- ✅ Fully responsive

### Admin Panel
- ✅ Cyber-operations dark design with animated live status
- ✅ Uzbek / Russian / English controls across the admin and storefront
- ✅ Demo login with 24-hour browser session
- ✅ Dashboard with live stats (revenue, orders, customers, stock)
- ✅ Revenue chart (7-day)
- ✅ Top selling products
- ✅ Recent orders table
- ✅ Product CRUD (list, search, filter, sort, pagination, delete)
- ✅ Add / Edit product form
- ✅ Shared LocalStorage with public site
- ✅ Collapsible sidebar
- ✅ Responsive admin layout

### Shared Data System (LocalStorage Keys)
```
volt_products · volt_categories · volt_brands
volt_users · volt_current_user · volt_cart
volt_orders · volt_wishlist · volt_compare
volt_reviews · volt_coupons · volt_banners
volt_messages · volt_settings · volt_admin_session
```

---

## 🛠 How to Run

1. Extract the ZIP
2. Open `index.html` in a modern browser (Chrome / Firefox / Edge)
3. For Admin: open `/admin` while using a local server; it routes to login or the dashboard.

> **Note:** Because the project uses LocalStorage and relative paths, it works best when served via a local server or opened directly. No build step required.

### Optional Local Server
```bash
# Python
python -m http.server 8080

# Node
npx serve .
```

Then visit: `http://localhost:8080`

---

## 📊 Demo Data

On first load, the system automatically generates:

- **1000 products** across 10 categories
- **20 brands**
- **50 demo orders**
- **200 reviews**
- **3 users**
- **4 coupons** (WELCOME10, SAVE50, FLASH25, FREESHIP)
- **3 banners**
- **Store settings**

---

## 🎨 Design System

| Token | Value |
|-------|-------|
| Background Primary | `#07111F` |
| Background Secondary | `#0B192B` |
| Accent Primary | `#4B8DFF` |
| Accent Secondary | `#53E1E3` |
| Text Primary | `#F5F8FF` |
| Text Secondary | `#8B9BB4` |

Fonts: **Inter** + **Outfit**

---

## ⚠️ Important Notes

- This is a **frontend demo**, not a live store: generated sample products are not verified real inventory, and LocalStorage is not a shared database.
- Admin authentication is browser-side demo authentication and is not secure for production use.
- Click card checkout is deliberately disabled until a secure server endpoint is configured in `js/payment-config.js`. The backend must keep merchant secrets private, calculate/validate prices and stock, create the Click session, and verify signed payment callbacks. Never collect or store card numbers in this frontend.
- The public `clickCreateUrl` setting is only a URL, not a credential. Merchant keys and Click signatures must be configured as server-side environment secrets, never pasted into HTML or JavaScript.
- Cash-on-delivery orders are demo records stored in the browser. Do not use this prototype to take real orders or payments until a production backend, real inventory feed, delivery workflow, and payment merchant account are connected.
- Product photos load from Unsplash when online; a local VOLT illustration is used if an image cannot load. Brand names remain visible without external logo services.
- All data resets if LocalStorage is cleared.

---

## 📈 Extending the Project

The architecture is modular. You can easily add:

- More public pages (wishlist, compare, deals, account, etc.) using the same `core.js` helpers
- More admin pages (orders, customers, coupons, analytics) using `admin-core.js`
- Additional product fields, filters, or payment methods

---

## 📄 License

Demo project for educational / portfolio purposes.

---

**Built with ⚡ by VOLT MARKET Team**
