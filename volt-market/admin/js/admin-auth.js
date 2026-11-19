/**
 * VOLT MARKET Admin Authentication
 * Demo-only authentication using LocalStorage
 */

const ADMIN_CREDENTIALS = {
  username: 'norsafarov.mvp',
  password: 'behruzcr7'
};

const AdminAuth = {
  isLoggedIn() {
    const data = this.getSession();
    if (!data || data.username !== ADMIN_CREDENTIALS.username || !Number.isFinite(data.loginTime)) {
      return false;
    }
    // Session expires after 24 hours.
    if (Date.now() - data.loginTime > 24 * 60 * 60 * 1000) {
      localStorage.removeItem('volt_admin_session');
      sessionStorage.removeItem('volt_admin_session');
      return false;
    }
    return true;
  },

  login(username, password, remember = false) {
    if (username === ADMIN_CREDENTIALS.username && password === ADMIN_CREDENTIALS.password) {
      const session = {
        username,
        loginTime: Date.now()
      };
      const storage = remember ? localStorage : sessionStorage;
      const otherStorage = remember ? sessionStorage : localStorage;
      otherStorage.removeItem('volt_admin_session');
      storage.setItem('volt_admin_session', JSON.stringify(session));
      return { success: true };
    }
    return { success: false, message: 'Invalid username or password' };
  },

  logout() {
    localStorage.removeItem('volt_admin_session');
    sessionStorage.removeItem('volt_admin_session');
    window.location.href = 'login.html';
  },

  getSession() {
    try {
      const session = sessionStorage.getItem('volt_admin_session') || localStorage.getItem('volt_admin_session');
      return session ? JSON.parse(session) : null;
    } catch {
      return null;
    }
  },

  requireAuth() {
    if (!this.isLoggedIn()) {
      window.location.href = 'login.html';
      return false;
    }
    return true;
  }
};

// Protect admin pages (except login)
if (!window.location.pathname.includes('login.html')) {
  document.addEventListener('DOMContentLoaded', () => {
    AdminAuth.requireAuth();
  });
}
