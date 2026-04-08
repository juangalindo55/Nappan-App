/**
 * admin-modules/ui.js
 * Shared UI Helpers Module
 *
 * Provides reusable UI utilities for the admin dashboard:
 * - Toast notifications
 * - HTML escaping (XSS prevention)
 * - Element manipulation (clear, loading, empty, error states)
 */

const UI = {
  /**
   * Show a toast notification
   * @param {string} message - The message to display
   * @param {string} type - Type of toast: 'info' | 'success' | 'error'
   */
  showToast(message, type = 'info') {
    const colors = {
      info: '#4DABF7',
      success: '#51CF66',
      error: '#FF6B6B'
    };

    const color = colors[type] || colors.info;

    const toast = document.createElement('div');
    toast.style.cssText = `
      position: fixed;
      bottom: 20px;
      right: 20px;
      padding: 15px;
      background-color: ${color};
      color: white;
      border-radius: 6px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      font-family: Inter, sans-serif;
      font-size: 14px;
      max-width: 300px;
      word-wrap: break-word;
      z-index: 10000;
    `;

    toast.textContent = message;
    document.body.appendChild(toast);

    // Auto-remove after 3 seconds
    setTimeout(() => {
      toast.remove();
    }, 3000);
  },

  /**
   * Escape HTML special characters to prevent XSS attacks
   * @param {string} text - The text to escape
   * @returns {string} - Escaped HTML-safe string
   */
  escapeHtml(text) {
    if (!text) return '';

    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  },

  /**
   * Clear the contents of an element by ID
   * @param {string} elementId - The ID of the element to clear
   */
  clearElement(elementId) {
    const element = document.getElementById(elementId);
    if (element) {
      element.innerHTML = '';
    }
  },

  /**
   * Set an element to loading state
   * @param {string} elementId - The ID of the element to show loading in
   * @param {boolean} isLoading - Whether to show or hide loading state
   */
  setLoading(elementId, isLoading = true) {
    const element = document.getElementById(elementId);
    if (!element) return;

    if (isLoading) {
      element.innerHTML = '<div class="loading">Cargando...</div>';
    }
    // If not loading, do nothing - caller will set content
  },

  /**
   * Set an element to empty state
   * @param {string} elementId - The ID of the element to show empty state in
   * @param {string} message - The message to display
   */
  setEmpty(elementId, message = 'Sin datos') {
    const element = document.getElementById(elementId);
    if (!element) return;

    const emptyDiv = document.createElement('div');
    emptyDiv.style.cssText = `
      padding: 40px;
      text-align: center;
      color: #999;
      font-family: Inter, sans-serif;
      font-size: 14px;
    `;
    emptyDiv.textContent = message;

    element.innerHTML = '';
    element.appendChild(emptyDiv);
  },

  /**
   * Set an element to error state
   * @param {string} elementId - The ID of the element to show error in
   * @param {string} message - The error message to display
   */
  setError(elementId, message = 'Error al cargar') {
    const element = document.getElementById(elementId);
    if (!element) return;

    const errorDiv = document.createElement('div');
    errorDiv.style.cssText = `
      padding: 40px;
      text-align: center;
      color: #FF6B6B;
      font-family: Inter, sans-serif;
      font-size: 14px;
      font-weight: 600;
    `;
    errorDiv.textContent = message;

    element.innerHTML = '';
    element.appendChild(errorDiv);
  }
};

// Export to window for backward compatibility
window.UI = UI;

// Export as ES module
export { UI };

// Also export as CommonJS if needed
if (typeof module !== 'undefined' && module.exports) {
  module.exports = UI;
}
