/**
 * admin-modules/stats.js
 * Statistics Module for Admin Dashboard
 *
 * Provides methods for loading and computing statistics including:
 * - KPI aggregation (revenue, order count, average order value, etc.)
 * - Grouping and filtering by section, status, hour, etc.
 * - Top products and customers analytics
 *
 * Dependencies:
 * - AdminState (for caching stats data)
 * - UI (for toast and loading state management)
 * - window.NappanDB (Supabase client)
 * - window.Orders (for loading orders)
 * - window.Products (for loading products)
 */

import AdminState from './state.js';
import { UI } from './ui.js';

const Stats = {
  /**
   * Get the Supabase client or throw error
   * @returns {Object} window.NappanDB instance
   * @throws {Error} If Supabase client not available
   */
  getDb() {
    if (!window.NappanDB) {
      throw new Error('Supabase client no disponible');
    }
    return window.NappanDB;
  },

  /**
   * Load statistics with KPI computation
   * Checks cache first; if already loaded and force=false, returns cached data
   * Otherwise loads dependencies and computes all stats
   *
   * @param {Object} options - Options for loading
   * @param {boolean} options.force - Force reload even if cached (default: false)
   * @returns {Promise<Object|null>} Computed stats object or null on error
   */
  async load({ force = false } = {}) {
    // Return cached data if available and not forcing reload
    if (AdminState.stats.cache.loaded && !force) {
      return AdminState.stats.data;
    }

    // Show loading state
    UI.setLoading('estadisticas-tab', true);

    try {
      // Ensure dependencies are loaded
      if (!AdminState.orders.cache.loaded && window.Orders) {
        await window.Orders.load();
      }
      if (!AdminState.products.cache.loaded && window.Products) {
        await window.Products.load();
      }

      // Compute all stats
      const data = this.computeStats();

      // Cache the results
      AdminState.stats.data = data;
      AdminState.stats.cache.loaded = true;
      AdminState.stats.cache.date = new Date();

      return data;
    } catch (error) {
      console.error('Stats.load error:', error);
      UI.setError('estadisticas-tab', `Error cargando estadísticas: ${error.message}`);
      return null;
    }
  },

  /**
   * Compute all KPIs from orders in AdminState
   * Filters out deleted/cancelled orders
   *
   * @returns {Object} Computed stats object with all KPIs
   */
  computeStats() {
    // Get all orders from state (excludes deleted orders based on caller filter)
    const orders = AdminState.getOrders();

    // Filter out deleted orders
    const activeOrders = orders.filter(o => o.status !== 'deleted' && o.status !== 'cancelled');

    return {
      totalOrders: activeOrders.length,
      totalRevenue: this._calculateTotalRevenue(activeOrders),
      averageOrder: this._calculateAverageOrder(activeOrders),
      ordersBySection: this.groupBySection(activeOrders),
      ordersByStatus: this.groupByStatus(activeOrders),
      revenueBySection: this.revenueBySection(activeOrders),
      ordersByHour: this.groupByHour(activeOrders),
      topProducts: this.topProducts(activeOrders),
      topCustomers: this.topCustomers(activeOrders)
    };
  },

  /**
   * Calculate total revenue from orders
   * @private
   * @param {Array} orders - Array of orders
   * @returns {number} Total revenue
   */
  _calculateTotalRevenue(orders) {
    return orders.reduce((sum, order) => sum + (parseFloat(order.total) || 0), 0);
  },

  /**
   * Calculate average order value
   * @private
   * @param {Array} orders - Array of orders
   * @returns {number} Average order value (rounded), or 0 if no orders
   */
  _calculateAverageOrder(orders) {
    if (orders.length === 0) return 0;
    const totalRevenue = this._calculateTotalRevenue(orders);
    return Math.round(totalRevenue / orders.length);
  },

  /**
   * Group orders by section
   * Returns count of orders per section
   *
   * @param {Array} orders - Array of orders
   * @returns {Object} Object with section names as keys and order counts as values
   * Example: { lunchbox: 5, nappanbox: 3, fitbar: 8 }
   */
  groupBySection(orders) {
    return orders.reduce((acc, order) => {
      const section = order.section || 'otro';
      acc[section] = (acc[section] || 0) + 1;
      return acc;
    }, {});
  },

  /**
   * Group orders by status
   * Returns count of orders per status
   *
   * @param {Array} orders - Array of orders
   * @returns {Object} Object with status names as keys and order counts as values
   * Example: { pending: 2, confirmed: 5, delivered: 8 }
   */
  groupByStatus(orders) {
    return orders.reduce((acc, order) => {
      const status = order.status || 'pending';
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {});
  },

  /**
   * Sum revenue by section
   * Returns total revenue per section
   *
   * @param {Array} orders - Array of orders
   * @returns {Object} Object with section names as keys and revenue sums as values
   * Example: { lunchbox: 500.50, nappanbox: 250.00, fitbar: 1200.00 }
   */
  revenueBySection(orders) {
    return orders.reduce((acc, order) => {
      const section = order.section || 'otro';
      acc[section] = (acc[section] || 0) + (parseFloat(order.total) || 0);
      return acc;
    }, {});
  },

  /**
   * Group order count by hour (0-23)
   * Returns count of orders placed per hour
   *
   * @param {Array} orders - Array of orders
   * @returns {Object} Object with hour (0-23) as keys and order counts as values
   * Example: { 0: 2, 1: 0, ..., 9: 5, ..., 23: 1 }
   */
  groupByHour(orders) {
    // Initialize all hours 0-23 with 0 count
    const hourMap = {};
    for (let h = 0; h < 24; h++) {
      hourMap[h] = 0;
    }

    // Count orders by hour
    orders.forEach(order => {
      try {
        const hour = new Date(order.created_at).getHours();
        hourMap[hour]++;
      } catch (e) {
        // Skip orders with invalid timestamps
      }
    });

    return hourMap;
  },

  /**
   * Get top 10 products by count
   * Parses cart items from orders and counts occurrences
   *
   * @param {Array} orders - Array of orders
   * @returns {Array} Array of top 10 products: [{ name, count }, ...]
   * Sorted by count descending
   */
  topProducts(orders) {
    const productMap = {};

    orders.forEach(order => {
      // Parse raw_cart to extract products
      const products = this._parseProducts(order.raw_cart);
      products.forEach(product => {
        const name = product.name || product.producto || 'Producto sin nombre';
        if (!productMap[name]) {
          productMap[name] = 0;
        }
        productMap[name]++;
      });
    });

    // Sort by count descending and return top 10
    return Object.entries(productMap)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  },

  /**
   * Get top 10 customers by spending
   * Groups orders by phone, sums total and counts orders
   *
   * @param {Array} orders - Array of orders
   * @returns {Array} Array of top 10 customers: [{ phone, name, total, count }, ...]
   * Sorted by total spending descending
   */
  topCustomers(orders) {
    const customerMap = {};

    orders.forEach(order => {
      const key = order.customer_phone || 'desconocido';
      if (!customerMap[key]) {
        customerMap[key] = {
          phone: order.customer_phone || '',
          name: order.customer_name || 'Desconocido',
          total: 0,
          count: 0
        };
      }
      customerMap[key].total += parseFloat(order.total) || 0;
      customerMap[key].count++;
    });

    // Sort by total descending and return top 10
    return Object.values(customerMap)
      .sort((a, b) => b.total - a.total)
      .slice(0, 10);
  },

  /**
   * Parse products from raw_cart JSON string
   * Handles both array and individual product formats
   *
   * @private
   * @param {string|Array} rawCart - Raw cart data (JSON string or array)
   * @returns {Array} Array of parsed product objects
   */
  _parseProducts(rawCart) {
    if (!rawCart) return [];

    try {
      // If it's a string, try to parse it
      let cart = rawCart;
      if (typeof rawCart === 'string') {
        cart = JSON.parse(rawCart);
      }

      // Handle both array and single object
      if (Array.isArray(cart)) {
        return cart;
      } else if (typeof cart === 'object') {
        return [cart];
      }
      return [];
    } catch (e) {
      // If parsing fails, return empty array
      console.warn('Failed to parse raw_cart:', rawCart, e);
      return [];
    }
  },

  /**
   * Render charts (placeholder for Phase 7)
   * Currently a no-op; will be implemented in Phase 7
   */
  renderCharts() {
    // Placeholder for chart rendering logic
    // To be implemented in Phase 7
  }
};

// Export to window for backward compatibility and global access
if (typeof window !== 'undefined') {
  window.Stats = Stats;
}

// Also export as ES module
if (typeof module !== 'undefined' && module.exports) {
  module.exports = Stats;
}

export default Stats;
export { Stats };
