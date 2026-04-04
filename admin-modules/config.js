/**
 * admin-modules/config.js
 * 
 * Configuration domain: WhatsApp, shipping, extras, gallery, tier discounts.
 */

import { AdminState } from './state.js';
import { UI } from './ui.js';

export const Config = {
  getDb() {
    if (!window.NappanDB) throw new Error('Supabase client unavailable');
    return window.NappanDB;
  },

  async load({ force = false } = {}) {
    if (AdminState.config.cache.loaded && !force) {
      return AdminState.config;
    }

    UI.setLoading('config-tab');
    try {
      const db = this.getDb();
      
      const [wa, shipping, extras, gallery, discounts] = await Promise.all([
        db.getConfigValue('whatsapp_number', '528123509768'),
        db.getConfigValue('shipping_rates', JSON.stringify({})).then(v => {
          try { return JSON.parse(v); } catch { return {}; }
        }),
        db.getConfigValue('product_extras', JSON.stringify({})).then(v => {
          try { return JSON.parse(v); } catch { return {}; }
        }),
        db.getConfigValue('event_gallery', JSON.stringify([])).then(v => {
          try { return JSON.parse(v); } catch { return []; }
        }),
        db.getConfigValue('tier_discounts', JSON.stringify({})).then(v => {
          try { return JSON.parse(v); } catch { return {}; }
        })
      ]);

      AdminState.config.whatsapp = wa;
      AdminState.config.shipping = Array.isArray(shipping) ? shipping : [];
      AdminState.config.extras = Array.isArray(extras) ? extras : [];
      AdminState.config.gallery = Array.isArray(gallery) ? gallery : [];
      AdminState.config.tierDiscounts = discounts || {};

      AdminState.config.cache.loaded = true;
      AdminState.config.cache.date = new Date();
      return AdminState.config;
    } catch (err) {
      console.error('Config load error:', err);
      UI.setError('config-tab', `Error: ${err.message}`);
      return AdminState.config;
    }
  },

  async saveWhatsapp(number) {
    try {
      const db = this.getDb();
      await db.setConfigValue('whatsapp_number', number);
      AdminState.config.whatsapp = number;
      UI.showToast('Número de WhatsApp guardado', 'success');
      AdminState.invalidate('config');
    } catch (err) {
      UI.showToast(`Error: ${err.message}`, 'error');
    }
  },

  async saveShipping(rates) {
    try {
      const db = this.getDb();
      await db.setConfigValue('shipping_rates', JSON.stringify(rates));
      AdminState.config.shipping = rates;
      UI.showToast('Tarifas de envío guardadas', 'success');
      AdminState.invalidate('config');
    } catch (err) {
      UI.showToast(`Error: ${err.message}`, 'error');
    }
  },

  async saveTierDiscounts(discounts) {
    try {
      const db = this.getDb();
      await db.setConfigValue('tier_discounts', JSON.stringify(discounts));
      AdminState.config.tierDiscounts = discounts;
      UI.showToast('Descuentos por membresía guardados', 'success');
      AdminState.invalidate('config');
    } catch (err) {
      UI.showToast(`Error: ${err.message}`, 'error');
    }
  },

  render() {
    // Placeholder for rendering
  }
};

window.Config = Config;
