/**
 * admin-modules/state.js
 * Centralized state store for the Nappan Admin Dashboard
 *
 * This module manages all admin dashboard state and provides cache invalidation
 * with explicit dependency tracking. Domains that depend on other domains are
 * invalidated automatically when their dependencies change.
 *
 * Cache Dependency Graph:
 * - stats depends on: orders, products
 * - customers: independent
 * - config: independent
 * - auth: independent
 */

// ============================================================================
// AUTH STATE
// ============================================================================

const authState = {
  user: null,
  loading: false,
  error: null,
  cache: { loaded: false, date: null }
};

// ============================================================================
// ORDERS STATE
// ============================================================================

const ordersState = {
  all: [],
  filtered: [],
  currentPage: 1,
  pageSize: 20,
  activeFilters: {
    search: '',
    section: '',
    status: '',
    showDeleted: false
  },
  expanded: null,      // ID of expanded order
  editing: null,       // ID of order being edited
  editingData: null,   // Form data for editing
  editingProducts: [], // Product list for editing
  pendingDelete: null, // ID of order pending deletion
  cache: {
    loaded: false,
    date: null
  }
};

// ============================================================================
// PRODUCTS STATE
// ============================================================================

const productsState = {
  all: [],
  cache: {
    loaded: false,
    date: null
  }
};

// ============================================================================
// CUSTOMERS STATE
// ============================================================================

const customersState = {
  all: [],
  cache: {
    loaded: false,
    date: null
  }
};

// ============================================================================
// CONFIG STATE
// ============================================================================

const configState = {
  whatsapp: '',
  shipping: [],
  extras: [],
  gallery: [],
  tierDiscounts: {},
  cache: {
    loaded: false,
    date: null
  }
};

// ============================================================================
// STATS STATE
// ============================================================================

const statsState = {
  data: null,
  charts: {
    sections: null,
    revenue: null,
    status: null,
    hourly: null
  },
  cache: {
    loaded: false,
    date: null
  }
};

// ============================================================================
// ADMIN STATE OBJECT
// ============================================================================

const AdminState = {
  auth: authState,
  orders: ordersState,
  products: productsState,
  customers: customersState,
  config: configState,
  stats: statsState,

  /**
   * Invalidate cache for one or more domains.
   * Automatically handles dependency invalidation:
   * - 'all' clears everything
   * - 'orders' clears orders AND stats (since stats depends on orders)
   * - 'products' clears products AND stats (since stats depends on products)
   * - 'customers', 'config', 'stats' clear only themselves
   *
   * @param {string} domain - Domain to invalidate ('auth', 'orders', 'products', 'customers', 'config', 'stats', 'all')
   */
  invalidate(domain) {
    if (domain === 'all') {
      // Clear all caches
      authState.cache = { loaded: false, date: null };
      ordersState.cache = { loaded: false, date: null };
      productsState.cache = { loaded: false, date: null };
      customersState.cache = { loaded: false, date: null };
      configState.cache = { loaded: false, date: null };
      statsState.cache = { loaded: false, date: null };

      // Reset all data
      authState.user = null;
      authState.loading = false;
      authState.error = null;
      ordersState.all = [];
      ordersState.filtered = [];
      productsState.all = [];
      customersState.all = [];
      configState.whatsapp = '';
      configState.shipping = [];
      configState.extras = [];
      configState.gallery = [];
      configState.tierDiscounts = {};
      statsState.data = null;
      statsState.charts = { sections: null, revenue: null, status: null, hourly: null };
    } else if (domain === 'orders') {
      // Orders depend on nothing, but stats depend on orders
      ordersState.cache = { loaded: false, date: null };
      ordersState.all = [];
      ordersState.filtered = [];

      // Cascade: invalidate stats since it depends on orders
      statsState.cache = { loaded: false, date: null };
      statsState.data = null;
      statsState.charts = { sections: null, revenue: null, status: null, hourly: null };
    } else if (domain === 'products') {
      // Products depend on nothing, but stats depend on products
      productsState.cache = { loaded: false, date: null };
      productsState.all = [];

      // Cascade: invalidate stats since it depends on products
      statsState.cache = { loaded: false, date: null };
      statsState.data = null;
      statsState.charts = { sections: null, revenue: null, status: null, hourly: null };
    } else if (domain === 'customers') {
      // Customers are independent
      customersState.cache = { loaded: false, date: null };
      customersState.all = [];
    } else if (domain === 'config') {
      // Config is independent
      configState.cache = { loaded: false, date: null };
      configState.whatsapp = '';
      configState.shipping = [];
      configState.extras = [];
      configState.gallery = [];
      configState.tierDiscounts = {};
    } else if (domain === 'stats') {
      // Stats can be invalidated independently
      statsState.cache = { loaded: false, date: null };
      statsState.data = null;
      statsState.charts = { sections: null, revenue: null, status: null, hourly: null };
    }
  },

  /**
   * Get a copy of all orders
   * @returns {Array} Copy of orders.all
   */
  getOrders() {
    return JSON.parse(JSON.stringify(this.orders.all));
  },

  /**
   * Get a copy of filtered orders
   * @returns {Array} Copy of orders.filtered
   */
  getFilteredOrders() {
    return JSON.parse(JSON.stringify(this.orders.filtered));
  },

  /**
   * Get a copy of all products
   * @returns {Array} Copy of products.all
   */
  getProducts() {
    return JSON.parse(JSON.stringify(this.products.all));
  },

  /**
   * Get a copy of all customers
   * @returns {Array} Copy of customers.all
   */
  getCustomers() {
    return JSON.parse(JSON.stringify(this.customers.all));
  }
};

// ============================================================================
// EXPORT
// ============================================================================

// Export to window for backward compatibility
if (typeof window !== 'undefined') {
  window.AdminState = AdminState;
}

// Also support ES6 modules and CommonJS
if (typeof module !== 'undefined' && module.exports) {
  module.exports = AdminState;
}

export default AdminState;
