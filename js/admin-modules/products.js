/**
 * admin-modules/products.js
 * Products Module for Admin Dashboard
 *
 * Handles loading products with extras, updating prices, and managing product state.
 */

import { AdminState } from './state.js';
import { UI } from './ui.js';

// ============================================================================
// CONSTANTS
// ============================================================================

const ADMIN_SECTIONS = ['lunchbox', 'nappanbox', 'fitbar', 'eventos'];

// ============================================================================
// PRODUCTS MODULE
// ============================================================================

const Products = {
  /**
   * Get the Supabase database client
   * @returns {object} window.NappanDB or throws error
   */
  getDb() {
    if (!window.NappanDB) {
      throw new Error('Supabase not initialized. window.NappanDB is not available.');
    }
    return window.NappanDB;
  },

  /**
   * Load all products with extras from all sections
   * @param {object} options - Options for loading
   * @param {boolean} options.force - Force reload even if cached
   * @returns {Promise<Array>} Array of products with extras
   */
  async load({ force = false } = {}) {
    try {
      const db = this.getDb();

      // Return cached if available and not forcing
      if (AdminState.products.cache.loaded && !force) {
        console.log('Products cache hit');
        return AdminState.products.all;
      }

      // Show loading state
      UI.setLoading('productsContainer', true);

      let products = [];

      // Try to use loadProductsForSections if available, otherwise use fallback
      if (typeof db.loadProductsForSections === 'function') {
        products = await db.loadProductsForSections(ADMIN_SECTIONS);
      } else {
        // Fallback: load sections in parallel and flatten
        const productsBySection = await Promise.all(
          ADMIN_SECTIONS.map(section => db.loadProducts(section))
        );
        products = productsBySection.flat();
      }

      // Load extras for all products in parallel
      const extrasGroups = await Promise.all(
        products.map(product => db.loadExtras(product.id))
      );

      // Map products to include extras
      const productsWithExtras = products.map((product, index) => ({
        ...product,
        extras: extrasGroups[index] || []
      }));

      // Update state
      AdminState.products.all = productsWithExtras;
      AdminState.products.cache.loaded = true;
      AdminState.products.cache.date = new Date();

      console.log(`✓ Loaded ${productsWithExtras.length} products with extras`);

      return productsWithExtras;
    } catch (error) {
      console.error('❌ Products.load error:', error);
      UI.setError('productsContainer', `Error al cargar productos: ${error.message}`);
      throw error;
    }
  },

  /**
   * Update a product's base price
   * @param {string} productId - Product ID to update
   * @param {number} newPrice - New price value
   * @returns {Promise<boolean>} Success or failure
   */
  async updatePrice(productId, newPrice) {
    try {
      const db = this.getDb();

      // Update in database
      const result = await db.updateProductPrice(productId, newPrice);

      if (result.error) {
        throw result.error;
      }

      // Find and update in state
      const product = AdminState.products.all.find(p => p.id === productId);
      if (product) {
        product.base_price = parseFloat(newPrice);
      }

      // Show success toast
      UI.showToast('Precio actualizado correctamente', 'success');

      // Invalidate cache
      AdminState.invalidate('products');

      return true;
    } catch (error) {
      console.error('❌ Products.updatePrice error:', error);
      UI.showToast(`Error al actualizar precio: ${error.message}`, 'error');
      return false;
    }
  },

  /**
   * Render products (placeholder for future use)
   */
  render() {
    // Placeholder - to be implemented in future phases
  }
};

// ============================================================================
// EXPORT
// ============================================================================

// Export to window for backward compatibility
if (typeof window !== 'undefined') {
  window.Products = Products;
}

// Also export as ES module
export { Products };
