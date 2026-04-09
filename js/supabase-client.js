/**
 * Nappan App — Supabase Client Initialization
 * This file initializes the Supabase client and exports the NappanDB API
 *
 * Credentials are injected via window.NappanConfig (from js/config.js)
 * which loads environment variables from Vercel at runtime
 */

let supabaseClient = null;

// Get credentials from config
const supabaseUrl = window.NappanConfig?.SUPABASE_URL;
const supabaseAnonKey = window.NappanConfig?.SUPABASE_ANON_KEY;

async function syncCustomerFromOrder(orderId, orderPayload, orderCreatedAt) {
  if (!supabaseClient) return { customer_id: null, error: 'Supabase not initialized' };

  const cleanPhone = (orderPayload.customer_phone || '').replace(/\D/g, '') || null;
  if (!cleanPhone) {
    return { customer_id: null, error: null };
  }

  const { data, error } = await supabaseClient.rpc('sync_public_customer_from_order', {
    p_order_id: orderId,
    p_phone: cleanPhone,
    p_name: orderPayload.customer_name || 'Cliente',
    p_total: orderPayload.total || 0,
    p_order_created_at: orderCreatedAt || new Date().toISOString()
  });

  return { customer_id: data || null, error };
}

/**
 * Initialize Supabase Client with credentials from window.NappanConfig
 *
 * This function is called by js/config.js after credentials are loaded from /api/config
 * Separated from immediate execution to avoid race conditions with async config loading
 */
function initializeSupabaseClient() {
  // Validate prerequisites
  if (typeof window.supabase === 'undefined') {
    console.error('❌ Supabase CDN not loaded!');
    return false;
  }

  // Get fresh credentials from config
  const url = window.NappanConfig?.SUPABASE_URL;
  const key = window.NappanConfig?.SUPABASE_ANON_KEY;

  if (!url || !key) {
    console.warn('⚠️ Supabase config not ready yet. Initialization deferred.');
    return false;
  }

  try {
    supabaseClient = window.supabase.createClient(url, key);
    console.log('✓ Supabase client initialized with credentials from window.NappanConfig');
    return true;
  } catch (error) {
    console.error('❌ Failed to initialize Supabase:', error);
    return false;
  }
}

/**
 * Expose reinitialization function for config.js to call
 * This allows creating the Supabase client after credentials are asynchronously loaded
 */
window.reinitializeSupabase = initializeSupabaseClient;

// Attempt initialization immediately (fallback for edge cases)
initializeSupabaseClient();

// Save order to database
async function saveOrder(orderPayload) {
  if (!supabaseClient) {
    console.warn('⚠️ Supabase not ready. Order not saved.');
    return null;
  }

  try {
    const cleanPhone = (orderPayload.customer_phone || '').replace(/\D/g, '') || null;

    const { data: order, error: orderError } = await supabaseClient.rpc('public_save_order', {
      p_section: orderPayload.section,
      p_customer_name: orderPayload.customer_name,
      p_customer_phone: cleanPhone,
      p_delivery_date: orderPayload.delivery_date || null,
      p_delivery_time: orderPayload.delivery_time || null,
      p_delivery_address: orderPayload.delivery_address || null,
      p_event_type: orderPayload.event_type || null,
      p_guest_count: orderPayload.guest_count || null,
      p_subtotal: orderPayload.subtotal || 0,
      p_discount_amount: orderPayload.discount_amount || 0,
      p_shipping_cost: orderPayload.shipping_cost || 0,
      p_total: orderPayload.total || 0,
      p_whatsapp_sent: orderPayload.whatsapp_sent || true,
      p_notes: orderPayload.notes || null,
      p_raw_cart: orderPayload.raw_cart || {}
    });

    if (orderError) {
      console.error('❌ Order insert failed:', orderError);
      return null;
    }

    console.log('✓ Order saved:', order.order_number);

    let customerSyncError = null;

    if (cleanPhone) {
      const customerSync = await syncCustomerFromOrder(order.id, orderPayload, order.created_at);
      customerSyncError = customerSync.error;

      if (customerSyncError) {
        console.error('❌ Customer sync failed after order insert:', customerSyncError);
      } else {
        console.log('✓ Customer synced for phone:', cleanPhone);
      }
    }

    return {
      order_id: order.id,
      order_number: order.order_number,
      customer_synced: !customerSyncError
    };
  } catch (error) {
    console.error('❌ saveOrder error:', error);
    return null;
  }
}

// Load app config
async function loadAppConfig() {
  if (!supabaseClient) return {};
  try {
    const { data, error } = await supabaseClient
      .from('app_config')
      .select('key, value');

    if (error) throw error;

    const config = {};
    (data || []).forEach(row => {
      config[row.key] = row.value;
    });
    return config;
  } catch (error) {
    console.error('loadAppConfig failed:', error);
    return {};
  }
}

// Get single config value
async function getConfigValue(key, fallback = null) {
  const config = await loadAppConfig();
  return config[key] || fallback;
}

// Load products
async function loadProducts(section) {
  if (!supabaseClient) return [];
  try {
    const { data, error } = await supabaseClient
      .from('products')
      .select('*')
      .eq('section', section)
      .eq('is_active', true)
      .order('sort_order', { ascending: true });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('loadProducts failed:', error);
    return [];
  }
}

async function loadProductsForSections(sections = []) {
  if (!supabaseClient) return [];
  const groups = await Promise.all((sections || []).map(section => loadProducts(section)));
  return groups.flat();
}

// Load product extras
async function loadExtras(productId) {
  if (!supabaseClient) return [];
  try {
    const { data, error } = await supabaseClient
      .from('product_extras')
      .select('*')
      .eq('product_id', productId)
      .eq('is_active', true)
      .order('sort_order', { ascending: true });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('loadExtras failed:', error);
    return [];
  }
}

async function loadProductsWithExtras(sections = []) {
  if (!supabaseClient) return [];
  const products = await loadProductsForSections(sections);
  const extrasGroups = await Promise.all(products.map(product => loadExtras(product.id)));

  return products.map((product, index) => ({
    ...product,
    extras: extrasGroups[index] || []
  }));
}

// Load art options
async function loadArtOptions() {
  if (!supabaseClient) return [];
  try {
    const { data, error } = await supabaseClient
      .from('art_options')
      .select('*')
      .eq('is_active', true)
      .order('sort_order', { ascending: true });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('loadArtOptions failed:', error);
    return [];
  }
}

// Load gallery photos
async function loadGalleryPhotos() {
  if (!supabaseClient) return {};
  try {
    const { data, error } = await supabaseClient
      .from('event_gallery')
      .select('*')
      .eq('is_active', true)
      .order('event_type_key', { ascending: true })
      .order('slot', { ascending: true });

    if (error) throw error;

    const grouped = {};
    (data || []).forEach(row => {
      if (!grouped[row.event_type_key]) {
        grouped[row.event_type_key] = {
          label: row.label,
          images: []
        };
      }
      grouped[row.event_type_key].images.push({
        slot: row.slot,
        image_url: row.image_url
      });
    });

    return grouped;
  } catch (error) {
    console.error('loadGalleryPhotos failed:', error);
    return {};
  }
}

// Load pricing rules
async function loadActivePricingRules() {
  if (!supabaseClient) return [];
  try {
    const now = new Date().toISOString();
    const { data, error } = await supabaseClient
      .from('pricing_rules')
      .select('*')
      .eq('is_active', true)
      .order('priority', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('loadActivePricingRules failed:', error);
    return [];
  }
}

// Find customer by phone
async function findCustomerByPhone(phone) {
  if (!supabaseClient) return null;
  try {
    const { data, error } = await supabaseClient.rpc('find_customer_by_phone', {
      p_phone: phone
    });

    if (error) throw error;
    return data && data.length > 0 ? data[0] : null;
  } catch (error) {
    console.warn('findCustomerByPhone warning:', error);
    return null;
  }
}

// Admin: Sign in
async function signIn(email, password) {
  if (!supabaseClient) return { session: null, error: 'Supabase not initialized' };
  const { data, error } = await supabaseClient.auth.signInWithPassword({
    email,
    password
  });
  return { session: data.session, error };
}

// Admin: Sign out
async function signOut() {
  if (!supabaseClient) return {};
  return supabaseClient.auth.signOut();
}

// Admin: Get session
async function getSession() {
  if (!supabaseClient) return { session: null, error: 'Supabase not initialized' };
  const { data, error } = await supabaseClient.auth.getSession();
  return { session: data.session, error };
}

function onAuthStateChange(callback) {
  if (!supabaseClient) {
    return { data: { subscription: { unsubscribe() {} } } };
  }

  return supabaseClient.auth.onAuthStateChange((event, session) => {
    callback(session, event);
  });
}

// Admin: Load all orders
async function loadAllOrders(filters = {}) {
  if (!supabaseClient) return [];
  try {
    let query = supabaseClient
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });

    if (filters.section) query = query.eq('section', filters.section);
    if (filters.status) query = query.eq('status', filters.status);
    if (filters.startDate) query = query.gte('created_at', filters.startDate);
    if (filters.endDate) query = query.lte('created_at', filters.endDate);

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('loadAllOrders failed:', error);
    return [];
  }
}

// Admin: Update order status
async function updateOrderStatus(orderId, status) {
  if (!supabaseClient) return { error: 'Supabase not initialized' };
  const { error } = await supabaseClient
    .from('orders')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', orderId);
  return { error };
}

// Admin: Update order (generic)
async function updateOrder(orderId, updates) {
  if (!supabaseClient) return { error: 'Supabase not initialized' };
  try {
    const { data, error } = await supabaseClient
      .from('orders')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', orderId)
      .select()
      .single();
    return { data, error };
  } catch (error) {
    console.error('updateOrder error:', error);
    return { data: null, error };
  }
}

// Admin: Load customers
async function loadCustomers(filters = {}) {
  if (!supabaseClient) return [];
  try {
    let query = supabaseClient
      .from('customers')
      .select('*')
      .order('last_order_at', { ascending: false });

    if (filters.membership_tier) query = query.eq('membership_tier', filters.membership_tier);
    if (filters.min_orders) query = query.gte('order_count', filters.min_orders);

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('loadCustomers failed:', error);
    return [];
  }
}

// Admin: Update customer
async function updateCustomer(customerId, updates) {
  if (!supabaseClient) return { error: 'Supabase not initialized' };
  const { error } = await supabaseClient
    .from('customers')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', customerId);
  return { error };
}

// Admin: Insert new customer
async function insertCustomer(phone, name, tier) {
  if (!supabaseClient) return { error: 'Supabase not initialized' };
  const { error } = await supabaseClient
    .from('customers')
    .insert([{ phone, name, membership_tier: tier || 'individual' }]);
  return { error };
}

// Admin: Delete customer
async function deleteCustomer(customerId) {
  if (!supabaseClient) return { error: 'Supabase not initialized' };
  const { error } = await supabaseClient
    .from('customers')
    .delete()
    .eq('id', customerId);
  return { error };
}

// Admin: Get stats
async function getStats() {
  if (!supabaseClient) return {};
  try {
    const { data, error } = await supabaseClient.rpc('get_dashboard_stats', {});
    if (error) throw error;
    return data || {};
  } catch (error) {
    console.warn('getStats warning:', error);
    return {};
  }
}

// Phase 3: Update config value
async function updateConfigValue(key, value) {
  if (!supabaseClient) return { error: 'Supabase not initialized' };

  try {
    const { error } = await supabaseClient
      .from('app_config')
      .upsert([{ key, value, updated_at: new Date().toISOString() }], { onConflict: 'key' });

    return { error };
  } catch (error) {
    console.error('updateConfigValue error:', error);
    return { error };
  }
}

// Phase 3: Update gallery photo
async function updateGalleryPhoto(eventType, slot, imageUrl) {
  if (!supabaseClient) return { error: 'Supabase not initialized' };

  try {
    const { data: existing } = await supabaseClient
      .from('event_gallery')
      .select('id')
      .eq('event_type_key', eventType)
      .eq('slot', slot)
      .single();

    if (existing) {
      const { error } = await supabaseClient
        .from('event_gallery')
        .update({ image_url: imageUrl, updated_at: new Date().toISOString() })
        .eq('id', existing.id);
      return { error };
    } else {
      const { error } = await supabaseClient
        .from('event_gallery')
        .insert([{
          event_type_key: eventType,
          label: eventType.charAt(0).toUpperCase() + eventType.slice(1),
          image_url: imageUrl,
          slot: slot,
          is_active: true
        }]);
      return { error };
    }
  } catch (error) {
    console.error('updateGalleryPhoto error:', error);
    return { error };
  }
}

// Phase 4: Update product price
async function updateProductPrice(productId, newPrice) {
  if (!supabaseClient) return { error: 'Supabase not initialized' };

  try {
    const { error } = await supabaseClient
      .from('products')
      .update({ base_price: parseFloat(newPrice), updated_at: new Date().toISOString() })
      .eq('id', productId);
    return { error };
  } catch (error) {
    console.error('updateProductPrice error:', error);
    return { error };
  }
}

// Phase 4: Update extra price
async function updateExtraPrice(extraId, newPrice) {
  if (!supabaseClient) return { error: 'Supabase not initialized' };

  try {
    const { error } = await supabaseClient
      .from('product_extras')
      .update({ price: parseFloat(newPrice), updated_at: new Date().toISOString() })
      .eq('id', extraId);
    return { error };
  } catch (error) {
    console.error('updateExtraPrice error:', error);
    return { error };
  }
}

// Phase 7: Analytics RPC methods for KPI computation

// Get basic statistics KPIs (totalOrders, totalRevenue, averageOrder)
async function getStatsKpis() {
  if (!supabaseClient) return { error: 'Supabase not initialized' };

  try {
    const { data, error } = await supabaseClient.rpc('get_stats_kpis');
    if (error) throw new Error(`RPC get_stats_kpis failed: ${error.message}`);

    // RPC returns array with one row, extract it
    const row = data && data.length > 0 ? data[0] : {};
    return {
      total_orders: row.total_orders || 0,
      total_revenue: row.total_revenue || 0,
      average_order: row.average_order || 0
    };
  } catch (error) {
    console.error('getStatsKpis error:', error);
    throw error;
  }
}

// Get orders grouped by section
async function getOrdersBySection() {
  if (!supabaseClient) return { error: 'Supabase not initialized' };

  try {
    const { data, error } = await supabaseClient.rpc('get_orders_by_section');
    if (error) throw new Error(`RPC get_orders_by_section failed: ${error.message}`);

    // Convert to object format matching stats.js output: { section: count }
    const result = {};
    (data || []).forEach(row => {
      result[row.section] = row.order_count;
    });
    return result;
  } catch (error) {
    console.error('getOrdersBySection error:', error);
    throw error;
  }
}

// Get orders grouped by status
async function getOrdersByStatus() {
  if (!supabaseClient) return { error: 'Supabase not initialized' };

  try {
    const { data, error } = await supabaseClient.rpc('get_orders_by_status');
    if (error) throw new Error(`RPC get_orders_by_status failed: ${error.message}`);

    const result = {};
    (data || []).forEach(row => {
      result[row.status] = row.order_count;
    });
    return result;
  } catch (error) {
    console.error('getOrdersByStatus error:', error);
    throw error;
  }
}

// Get revenue grouped by section
async function getRevenueBySection() {
  if (!supabaseClient) return { error: 'Supabase not initialized' };

  try {
    const { data, error } = await supabaseClient.rpc('get_revenue_by_section');
    if (error) throw new Error(`RPC get_revenue_by_section failed: ${error.message}`);

    const result = {};
    (data || []).forEach(row => {
      result[row.section] = row.revenue_sum;
    });
    return result;
  } catch (error) {
    console.error('getRevenueBySection error:', error);
    throw error;
  }
}

// Get orders grouped by hour (0-23)
async function getOrdersByHour() {
  if (!supabaseClient) return { error: 'Supabase not initialized' };

  try {
    const { data, error } = await supabaseClient.rpc('get_orders_by_hour');
    if (error) throw new Error(`RPC get_orders_by_hour failed: ${error.message}`);

    const result = {};
    (data || []).forEach(row => {
      result[row.hour_of_day] = row.order_count;
    });
    return result;
  } catch (error) {
    console.error('getOrdersByHour error:', error);
    throw error;
  }
}

// Get top products by count
async function getTopProducts(limit = 10) {
  if (!supabaseClient) return { error: 'Supabase not initialized' };

  try {
    const { data, error } = await supabaseClient.rpc('get_top_products', { limit_count: limit });
    if (error) throw new Error(`RPC get_top_products failed: ${error.message}`);

    return (data || []).map(row => ({
      name: row.product_name,
      count: row.product_count
    }));
  } catch (error) {
    console.error('getTopProducts error:', error);
    throw error;
  }
}

// Get top customers by revenue
async function getTopCustomers(limit = 10) {
  if (!supabaseClient) return { error: 'Supabase not initialized' };

  try {
    const { data, error } = await supabaseClient.rpc('get_top_customers', { limit_count: limit });
    if (error) throw new Error(`RPC get_top_customers failed: ${error.message}`);

    return (data || []).map(row => ({
      name: row.customer_name,
      count: row.order_count,
      revenue: row.total_revenue
    }));
  } catch (error) {
    console.error('getTopCustomers error:', error);
    throw error;
  }
}

// Export API
window.NappanDB = {
  client: supabaseClient,
  saveOrder,
  loadAppConfig,
  getConfigValue,
  loadProducts,
  loadProductsForSections,
  loadExtras,
  loadProductsWithExtras,
  loadArtOptions,
  loadGalleryPhotos,
  loadActivePricingRules,
  findCustomerByPhone,
  signIn,
  signOut,
  getSession,
  onAuthStateChange,
  loadAllOrders,
  updateOrderStatus,
  updateOrder,
  loadCustomers,
  updateCustomer,
  insertCustomer,
  deleteCustomer,
  getStats,
  updateConfigValue,
  updateGalleryPhoto,
  updateProductPrice,
  updateExtraPrice,
  // Analytics RPC methods
  getStatsKpis,
  getOrdersBySection,
  getOrdersByStatus,
  getRevenueBySection,
  getOrdersByHour,
  getTopProducts,
  getTopCustomers
};

console.log('✓ NappanDB API ready');
