/**
 * admin-modules/auth.js
 * 
 * Authentication module: login, logout, session management.
 */

import { AdminState } from './state.js';
import { UI } from './ui.js';

export const Auth = {
  getDb() {
    if (!window.NappanDB) {
      throw new Error('Supabase client no disponible');
    }
    return window.NappanDB;
  },

  async init() {
    AdminState.auth.loading = true;
    try {
      const db = this.getDb();
      if (typeof db.onAuthStateChange === 'function') {
        db.onAuthStateChange((user) => {
          AdminState.auth.user = user;
          AdminState.auth.loading = false;
          if (user) {
            this.showDashboard();
          } else {
            this.showLogin();
          }
        });
      }
    } catch (err) {
      console.error('Auth init error:', err);
      AdminState.auth.error = err.message;
      AdminState.auth.loading = false;
      this.showLogin();
    }
  },

  async login(email, password) {
    AdminState.auth.loading = true;
    AdminState.auth.error = null;

    try {
      const db = this.getDb();
      const { data, error } = await db.supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        AdminState.auth.error = error.message;
        UI.showToast(`Error: ${error.message}`, 'error');
        AdminState.auth.loading = false;
        return false;
      }

      AdminState.auth.user = data.user;
      AdminState.auth.loading = false;
      return true;
    } catch (err) {
      AdminState.auth.error = err.message;
      UI.showToast(`Error: ${err.message}`, 'error');
      AdminState.auth.loading = false;
      return false;
    }
  },

  async logout() {
    try {
      const db = this.getDb();
      await db.supabase.auth.signOut();
      AdminState.auth.user = null;
      AdminState.invalidate('all');
      this.showLogin();
      UI.showToast('Sesión cerrada', 'success');
    } catch (err) {
      UI.showToast(`Error: ${err.message}`, 'error');
    }
  },

  showDashboard() {
    const login = document.getElementById('loginSection');
    const dash = document.getElementById('dashboardSection');
    if (login) login.style.display = 'none';
    if (dash) dash.style.display = 'block';
  },

  showLogin() {
    const login = document.getElementById('loginSection');
    const dash = document.getElementById('dashboardSection');
    if (login) login.style.display = 'flex';
    if (dash) dash.style.display = 'none';
  }
};

window.Auth = Auth;
