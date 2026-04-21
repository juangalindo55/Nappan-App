/**
 * admin-modules/orders.js
 * 
 * Orders domain: load, filter, paginate, edit, delete, export.
 */

import { AdminState } from './state.js';
import { UI } from './ui.js';

const ADMIN_SECTIONS = ['lunchbox', 'nappanbox', 'fitbar', 'eventos'];

export const Orders = {
  getDb() {
    if (!window.NappanDB) throw new Error('Supabase client unavailable');
    return window.NappanDB;
  },

  async load({ force = false } = {}) {
    if (AdminState.orders.cache.loaded && !force) {
      return AdminState.orders.all;
    }

    UI.setLoading('tableContainer');
    try {
      const db = this.getDb();
      const orders = await db.loadOrders();
      AdminState.orders.all = orders || [];
      AdminState.orders.cache.loaded = true;
      AdminState.orders.cache.date = new Date();
      this.applyFilters();
      return AdminState.orders.all;
    } catch (err) {
      console.error('Orders load error:', err);
      UI.setError('tableContainer', `Error: ${err.message}`);
      return [];
    }
  },

  applyFilters() {
    const { search, section, status, showDeleted } = AdminState.orders.activeFilters;
    const all = AdminState.orders.all;

    AdminState.orders.filtered = all.filter(order => {
      if (!showDeleted && order.is_deleted) return false;
      if (search && !order.order_number.toString().includes(search) &&
          !order.customer_phone?.includes(search) &&
          !order.customer_name?.toLowerCase().includes(search.toLowerCase())) {
        return false;
      }
      if (section && order.section !== section) return false;
      if (status && order.order_status !== status) return false;
      return true;
    });

    AdminState.orders.currentPage = 1;
  },

  setFilter(key, value) {
    AdminState.orders.activeFilters[key] = value;
    this.applyFilters();
  },

  getCurrentPageOrders() {
    const { currentPage, pageSize } = AdminState.orders;
    const filtered = AdminState.orders.filtered;
    const start = (currentPage - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  },

  getTotalPages() {
    return Math.ceil(AdminState.orders.filtered.length / AdminState.orders.pageSize);
  },

  nextPage() {
    if (AdminState.orders.currentPage < this.getTotalPages()) {
      AdminState.orders.currentPage++;
    }
  },

  previousPage() {
    if (AdminState.orders.currentPage > 1) {
      AdminState.orders.currentPage--;
    }
  },

  async updateStatus(orderId, newStatus) {
    try {
      const db = this.getDb();
      await db.updateOrderStatus(orderId, newStatus);
      const order = AdminState.orders.all.find(o => o.id === orderId);
      if (order) order.order_status = newStatus;
      UI.showToast(`Pedido actualizado a ${newStatus}`, 'success');
      AdminState.invalidate('orders');
    } catch (err) {
      UI.showToast(`Error: ${err.message}`, 'error');
    }
  },

  async saveEdit(orderId, updatedData) {
    try {
      const db = this.getDb();
      await db.updateOrder(orderId, updatedData);
      const order = AdminState.orders.all.find(o => o.id === orderId);
      if (order) {
        Object.assign(order, updatedData);
      }
      UI.showToast('Pedido guardado', 'success');
      AdminState.invalidate('orders');
      return true;
    } catch (err) {
      UI.showToast(`Error: ${err.message}`, 'error');
      return false;
    }
  },

  async delete(orderId) {
    try {
      const db = this.getDb();
      await db.softDeleteOrder(orderId);
      const order = AdminState.orders.all.find(o => o.id === orderId);
      if (order) order.is_deleted = true;
      UI.showToast('Pedido eliminado', 'success');
      AdminState.invalidate('orders');
    } catch (err) {
      UI.showToast(`Error: ${err.message}`, 'error');
    }
  },

  async recover(orderId) {
    try {
      const db = this.getDb();
      await db.recoverDeletedOrder(orderId);
      const order = AdminState.orders.all.find(o => o.id === orderId);
      if (order) order.is_deleted = false;
      UI.showToast('Pedido recuperado', 'success');
      AdminState.invalidate('orders');
    } catch (err) {
      UI.showToast(`Error: ${err.message}`, 'error');
    }
  },

  exportCSV() {
    const orders = AdminState.orders.filtered;
    if (!orders.length) {
      UI.showToast('No hay pedidos para exportar', 'info');
      return;
    }

    const headers = ['ID', 'Número', 'Fecha', 'Cliente', 'Teléfono', 'Sección', 'Total', 'Estado'];
    const rows = orders.map(o => [
      o.id,
      o.order_number,
      new Date(o.created_at).toLocaleDateString('es-MX'),
      UI.escapeHtml(o.customer_name || ''),
      o.customer_phone || '',
      o.section,
      `$${(o.total || 0).toFixed(2)}`,
      o.order_status
    ]);

    const csv = [headers, ...rows].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `pedidos-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    UI.showToast('CSV descargado', 'success');
  },

  render() {
    // Placeholder for rendering
  }
};

window.Orders = Orders;
