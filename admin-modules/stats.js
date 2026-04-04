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
      const data = await this.computeStats();

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
   * Compute all KPIs using Supabase RPC functions
   * Calls all 7 RPC functions in parallel for efficiency
   * Maintains exact same return interface as before (backward compatible)
   *
   * @returns {Promise<Object>} Computed stats object with all KPIs
   */
  async computeStats() {
    const db = this.getDb();

    try {
      // Call all RPC functions in parallel
      const [
        kpis,
        ordersBySection,
        ordersByStatus,
        revenueBySection,
        ordersByHour,
        topProducts,
        topCustomers
      ] = await Promise.all([
        db.getStatsKpis(),
        db.getOrdersBySection(),
        db.getOrdersByStatus(),
        db.getRevenueBySection(),
        db.getOrdersByHour(),
        db.getTopProducts(10),
        db.getTopCustomers(10)
      ]);

      return {
        totalOrders: kpis.total_orders,
        totalRevenue: kpis.total_revenue,
        averageOrder: kpis.average_order,
        ordersBySection,
        ordersByStatus,
        revenueBySection,
        ordersByHour,
        topProducts,
        topCustomers
      };
    } catch (error) {
      console.error('Error computing stats from RPC:', error);
      throw error;
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
