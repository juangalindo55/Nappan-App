/**
 * Nappan App — Supabase Client Initialization
 * This file initializes the Supabase client and exports the NappanDB API
 */

const supabaseUrl = 'https://rbhjacmuelcjgxdyxmuh.supabase.co';
const supabaseAnonKey = 'sb_publishable_d958WcFSLNa6yVan61MiWQ_e7FS8NL1';

let supabaseClient = null;

// Initialize Supabase
if (typeof window.supabase === 'undefined') {
  console.error('❌ Supabase CDN not loaded!');
} else {
  try {
    supabaseClient = window.supabase.createClient(supabaseUrl, supabaseAnonKey);
    console.log('✓ Supabase client initialized');
  } catch (error) {
    console.error('❌ Failed to init Supabase:', error);
  }
}

// Save order to database
async function saveOrder(orderPayload) {
  if (!supabaseClient) {
    console.warn('⚠️ Supabase not ready. Order not saved.');
    return null;
  }

  try {
    const { data: order, error: orderError } = await supabaseClient
      .from('orders')
      .insert([{
        section: orderPayload.section,
        customer_name: orderPayload.customer_name,
        customer_phone: orderPayload.customer_phone || null,
        delivery_date: orderPayload.delivery_date || null,
        delivery_time: orderPayload.delivery_time || null,
        delivery_address: orderPayload.delivery_address || null,
        event_type: orderPayload.event_type || null,
        guest_count: orderPayload.guest_count || null,
        subtotal: orderPayload.subtotal || 0,
        discount_amount: orderPayload.discount_amount || 0,
        shipping_cost: orderPayload.shipping_cost || 0,
        total: orderPayload.total || 0,
        whatsapp_sent: orderPayload.whatsapp_sent || true,
        notes: orderPayload.notes || null,
        raw_cart: orderPayload.raw_cart || {},
        status: 'pending'
      }])
      .select('id, order_number')
      .single();

    if (orderError) {
      console.error('❌ Order insert failed:', orderError);
      return null;
    }

    console.log('✓ Order saved:', order.order_number);

    // Auto-create/update customer if phone provided
    if (orderPayload.customer_phone) {
      const cleanPhone = orderPayload.customer_phone.replace(/\D/g, '');
      if (cleanPhone) {
        const { data: existing, error: checkError } = await supabaseClient
          .from('customers')
          .select('id, name')
          .eq('phone', cleanPhone)
          .maybeSingle();

        if (!checkError && !existing) {
          // Customer doesn't exist, create it
          const { error: insertError } = await supabaseClient
            .from('customers')
            .insert([{
              phone: cleanPhone,
              name: orderPayload.customer_name || 'Cliente',
              membership_tier: 'individual'
            }]);
          if (insertError) {
            console.warn('⚠️ Customer auto-create failed:', insertError);
          } else {
            console.log('✓ Cliente registrado automáticamente:', cleanPhone);
          }
        } else if (!checkError && existing) {
          // Customer exists, update name if different
          if (existing.name !== orderPayload.customer_name) {
            const { error: updateError } = await supabaseClient
              .from('customers')
              .update({ name: orderPayload.customer_name })
              .eq('phone', cleanPhone);
            if (updateError) {
              console.warn('⚠️ Customer name update failed:', updateError);
            }
          }
        }
      }
    }

    return { order_id: order.id, order_number: order.order_number };
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
    const { error: updateError } = await supabaseClient
      .from('app_config')
      .update({ value, updated_at: new Date().toISOString() })
      .eq('key', key);

    if (updateError) {
      const { error: insertError } = await supabaseClient
        .from('app_config')
        .insert([{ key, value }]);
      return { error: insertError };
    }

    return { error: null };
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

// Export API
window.NappanDB = {
  client: supabaseClient,
  saveOrder,
  loadAppConfig,
  getConfigValue,
  loadProducts,
  loadExtras,
  loadArtOptions,
  loadGalleryPhotos,
  loadActivePricingRules,
  findCustomerByPhone,
  signIn,
  signOut,
  getSession,
  loadAllOrders,
  updateOrderStatus,
  loadCustomers,
  updateCustomer,
  insertCustomer,
  deleteCustomer,
  getStats,
  updateConfigValue,
  updateGalleryPhoto,
  updateProductPrice,
  updateExtraPrice
};

console.log('✓ NappanDB API ready');
