/**
 * admin-modules/customers.js
 *
 * Customers domain: load, CRUD operations.
 */

import { AdminState } from './state.js';
import { UI } from './ui.js';

export const Customers = {
  getDb() {
    if (!window.NappanDB) throw new Error('Supabase client unavailable');
    return window.NappanDB;
  },

  async load({ force = false } = {}) {
    if (AdminState.customers.cache.loaded && !force) {
      return AdminState.customers.all;
    }

    UI.setLoading('customersContainer');
    try {
      const db = this.getDb();
      const customers = await db.loadCustomers({});
      AdminState.customers.all = customers || [];
      AdminState.customers.cache.loaded = true;
      AdminState.customers.cache.date = new Date();
      return customers;
    } catch (err) {
      console.error('Customers load error:', err);
      UI.setError('customersContainer', `Error: ${err.message}`);
      return [];
    }
  },

  async insert(phone, name, tier) {
    try {
      const db = this.getDb();
      const newCustomer = await db.insertCustomer({ phone, name, tier });
      AdminState.customers.all.push(newCustomer);
      UI.showToast('Cliente agregado', 'success');
      AdminState.invalidate('customers');
      return newCustomer;
    } catch (err) {
      UI.showToast(`Error: ${err.message}`, 'error');
      return null;
    }
  },

  async update(customerId, updates) {
    try {
      const db = this.getDb();
      await db.updateCustomer(customerId, updates);
      const customer = AdminState.customers.all.find(c => c.id === customerId);
      if (customer) Object.assign(customer, updates);
      UI.showToast('Cliente actualizado', 'success');
      AdminState.invalidate('customers');
      return true;
    } catch (err) {
      UI.showToast(`Error: ${err.message}`, 'error');
      return false;
    }
  },

  async delete(customerId) {
    try {
      const db = this.getDb();
      await db.deleteCustomer(customerId);
      AdminState.customers.all = AdminState.customers.all.filter(c => c.id !== customerId);
      UI.showToast('Cliente eliminado', 'success');
      AdminState.invalidate('customers');
    } catch (err) {
      UI.showToast(`Error: ${err.message}`, 'error');
    }
  },

  render() {
    // Placeholder - implemented in later phase
  }
};

window.Customers = Customers;
