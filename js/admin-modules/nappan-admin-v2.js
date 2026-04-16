  // Global state
  const ADMIN_SECTIONS = ['lunchbox', 'nappanbox', 'fitbar', 'eventos'];
  let allOrders = [];
  let currentPage = 1;
  const PAGE_SIZE = 20;
  let activeFilters = { search: '', section: '', status: '', showDeleted: false };
  let expandedOrderId = null;
  let editingOrderId = null;
  let editingOrderData = null;
  let pendingDeleteOrderId = null;
  let editingOrderProducts = [];
  let allProducts = [];
  let allCustomers = [];
  let chartSectionsInst = null, chartRevenueInst = null, chartStatusInst = null, chartHourlyInst = null;
  let statsCache = { orders: [], date: null };

  window.NappanAdminState = {
    get allOrders() { return allOrders; },
    get currentPage() { return currentPage; },
    get activeFilters() { return { ...activeFilters }; },
    get expandedOrderId() { return expandedOrderId; },
    get editingOrderId() { return editingOrderId; },
    get editingOrderData() { return editingOrderData; },
    get pendingDeleteOrderId() { return pendingDeleteOrderId; },
    get editingOrderProducts() { return [...editingOrderProducts]; },
    get allProducts() { return [...allProducts]; },
    get allCustomers() { return [...allCustomers]; },
    get statsCache() { return { ...statsCache }; }
  };

  // HTML Escape function for XSS prevention
  function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  function normalizePhone(phone) {
    return (phone || '').replace(/\D/g, '');
  }

  async function resolveCustomerByPhone(phone) {
    const normalized = normalizePhone(phone);
    if (!normalized) return null;

    const localCustomer = allCustomers.find(customer => normalizePhone(customer.phone) === normalized);
    if (localCustomer) return localCustomer;

    try {
      return await window.NappanDB.findCustomerByPhone(phone);
    } catch (error) {
      console.warn('resolveCustomerByPhone failed:', error);
      return null;
    }
  }

  async function syncOrdersWithCustomerIdByPhone(customerId, phone) {
    const normalized = normalizePhone(phone);
    if (!customerId || !normalized) return 0;

    if (allOrders.length === 0) {
      allOrders = await (await getDb()).loadAllOrders({});
    }

    const targetOrders = allOrders.filter(order => normalizePhone(order.customer_phone) === normalized);
    if (targetOrders.length === 0) return 0;

    const results = await Promise.all(
      targetOrders.map(order => window.NappanDB.updateOrder(order.id, { customer_id: customerId }))
    );

    const failed = results.filter(result => result && result.error);
    if (failed.length > 0) {
      console.warn('syncOrdersWithCustomerIdByPhone partial failures:', failed);
    }

    targetOrders.forEach(order => {
      order.customer_id = customerId;
    });

    return targetOrders.length;
  }

  // Cache state and invalidation (only for Orders tab which has real cache logic)
  let cacheState = {
    ordersLoaded: false
  };

  function invalidateCache(section) {
    if (section === 'orders' || section === 'all') {
      cacheState.ordersLoaded = false;
      allOrders = [];
      currentPage = 1;
    }
    if (section === 'stats') {
      statsCache = { orders: [], date: null };
    }
  }

  async function refreshStatsIfVisible() {
    const statsTab = document.getElementById('estadisticas-tab');
    if (!statsTab) return false;

    if (getComputedStyle(statsTab).display === 'none') {
      return false;
    }

    await loadStats();
    return true;
  }

  async function getDb() {
    if (!window.NappanDB && window.NappanConfig?.readyPromise) {
      await window.NappanConfig.readyPromise;
    }
    if (!window.NappanDB) {
      throw new Error('Supabase client no disponible');
    }
    return window.NappanDB;
  }

  async function loadSectionProducts() {
    const db = await getDb();
    if (typeof db.loadProductsForSections === 'function') {
      return db.loadProductsForSections(ADMIN_SECTIONS);
    }

    const productGroups = await Promise.all(ADMIN_SECTIONS.map(section => db.loadProducts(section)));
    return productGroups.flat();
  }

  async function loadProductsWithExtras() {
    const db = await getDb();
    if (typeof db.loadProductsWithExtras === 'function') {
      return db.loadProductsWithExtras(ADMIN_SECTIONS);
    }

    const products = await loadSectionProducts();
    const extrasByProduct = await Promise.all(products.map(product => db.loadExtras(product.id)));
    return products.map((product, index) => ({
      ...product,
      extras: extrasByProduct[index] || []
    }));
  }

  async function showDashboardShell() {
    document.getElementById('loginSection').style.display = 'none';
    document.getElementById('dashboardSection').style.display = 'block';
    await ensureOrdersLoaded();
  }

  function showLoginShell() {
    document.getElementById('dashboardSection').style.display = 'none';
    document.getElementById('loginSection').style.display = 'flex';
  }

  async function handleLogin(e) {
    e.preventDefault();

    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value.trim();

    if (!email || !password) {
      showToast('Completa email y contraseña', 'error');
      return;
    }

    document.getElementById('submitBtn').disabled = true;
    document.getElementById('submitBtn').textContent = 'Entrando...';

    try {
      const db = await getDb();
      const { session, error } = await db.signIn(email, password);

      if (error || !session) {
        showToast('Email o contraseña incorrectos', 'error');
        document.getElementById('loginError').textContent = 'Credenciales inválidas';
        document.getElementById('loginError').style.display = 'block';
      } else {
        showDashboardShell();
        await loadOrders();
      }
    } catch (error) {
      console.error('Login error:', error);
      showToast('Error: ' + error.message, 'error');
    } finally {
      document.getElementById('submitBtn').disabled = false;
      document.getElementById('submitBtn').textContent = 'Entrar';
    }
  }

  async function handleLogout() {
    const db = await getDb();
    await db.signOut();
    showLoginShell();
    document.getElementById('loginForm').reset();
  }

  async function loadOrders() {
    const container = document.getElementById('tableContainer');
    container.innerHTML = '<div class="loading">Cargando pedidos...</div>';

    try {
      allOrders = await (await getDb()).loadAllOrders({});

      if (!allOrders || allOrders.length === 0) {
        container.innerHTML = '<div class="loading">No hay pedidos</div>';
        document.getElementById('paginationControls').style.display = 'none';
        return;
      }

      currentPage = 1;
      renderOrdersTable();
    } catch (error) {
      console.error('Error loading orders:', error);
      container.innerHTML = '<div class="loading">Error cargando pedidos</div>';
    }
  }

  function applyOrderFilters() {
    activeFilters.search = document.getElementById('searchInput').value.toLowerCase();
    activeFilters.section = document.getElementById('sectionFilter').value;
    activeFilters.status = document.getElementById('statusFilter').value;
    activeFilters.showDeleted = document.getElementById('showDeletedFilter').checked;
    currentPage = 1;
    renderOrdersTable();
  }

  function getFilteredOrders() {
    return allOrders.filter(o => {
      const matchSearch = !activeFilters.search ||
        o.customer_name.toLowerCase().includes(activeFilters.search) ||
        (o.order_number || '').toLowerCase().includes(activeFilters.search);
      const matchSection = !activeFilters.section || o.section === activeFilters.section;
      const matchStatus = !activeFilters.status || o.status === activeFilters.status;
      const matchDeleted = activeFilters.showDeleted || o.status !== 'deleted';
      return matchSearch && matchSection && matchStatus && matchDeleted;
    });
  }

  function renderOrdersTable() {
    const container = document.getElementById('tableContainer');
    const filtered = getFilteredOrders();

    if (filtered.length === 0) {
      container.innerHTML = '<div class="loading">No hay pedidos que coincidan</div>';
      document.getElementById('paginationControls').style.display = 'none';
      return;
    }

    const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
    const start = (currentPage - 1) * PAGE_SIZE;
    const page = filtered.slice(start, start + PAGE_SIZE);

    let html = '<table><thead><tr>';
    html += '<th></th>';
    html += '<th>Pedido</th>';
    html += '<th>Cliente</th>';
    html += '<th class="hide-mobile">Sección</th>';
    html += '<th>Total</th>';
    html += '<th>Estado</th>';
    html += '<th>Fecha</th>';
    html += '<th>Acciones</th>';
    html += '</tr></thead><tbody>';

    for (let i = 0; i < page.length; i++) {
      const order = page[i];
      const date = new Date(order.created_at).toLocaleDateString('es-MX');
      const statusLabel = getStatusLabel(order.status);
      const isExpanded = expandedOrderId === order.id;
      const isDeleted = order.status === 'deleted';
      const rowStyle = isDeleted ? 'opacity: 0.6; text-decoration: line-through;' : '';

      html += '<tr style="' + rowStyle + '">';
      html += '<td><button type="button" class="btn-expand" data-action="toggle-order-detail" data-order-id="' + order.id + '">▶</button></td>';
      html += '<td class="order-number">' + escapeHtml(order.order_number || 'N/A') + '</td>';
      html += '<td>' + escapeHtml(order.customer_name || 'N/A') + '</td>';
      html += '<td class="hide-mobile">' + escapeHtml(order.section || 'N/A') + '</td>';
      html += '<td>$' + (order.total || 0) + '</td>';
      html += '<td><select data-action="change-order-status" data-order-id="' + order.id + '" style="padding: 6px; border: 1px solid #ddd; border-radius: 4px;">';
      html += '<option value="pending" ' + (order.status === 'pending' ? 'selected' : '') + '>Pendiente</option>';
      html += '<option value="confirmed" ' + (order.status === 'confirmed' ? 'selected' : '') + '>Confirmado</option>';
      html += '<option value="in_progress" ' + (order.status === 'in_progress' ? 'selected' : '') + '>En Progreso</option>';
      html += '<option value="delivered" ' + (order.status === 'delivered' ? 'selected' : '') + '>Entregado</option>';
      html += '<option value="cancelled" ' + (order.status === 'cancelled' ? 'selected' : '') + '>Cancelado</option>';
      html += '</select></td>';
      html += '<td>' + date + '</td>';
      html += '<td style="display: flex; gap: 8px; justify-content: center;">';
      if (isDeleted) {
        html += '<button type="button" data-action="recover-deleted-order" data-order-id="' + order.id + '" title="Recuperar" style="background: none; border: none; cursor: pointer; font-size: 16px;">↩️</button>';
      } else {
        html += '<button type="button" data-action="open-edit-order" data-order-id="' + order.id + '" title="Editar" style="background: none; border: none; cursor: pointer; font-size: 16px;">✏️</button>';
        html += '<button type="button" data-action="confirm-delete-order" data-order-id="' + order.id + '" title="Eliminar" style="background: none; border: none; cursor: pointer; font-size: 16px;">🗑️</button>';
      }
      html += '</td>';
      html += '</tr>';

      // Detail row
      if (isExpanded) {
        const deliveryDate = order.delivery_date ? new Date(order.delivery_date).toLocaleDateString('es-MX') : 'No especificada';
        const deliveryTime = order.delivery_time || order.deliveryTime || 'No especificada';
        const phone = order.customer_phone || 'No proporcionado';
        const notes = order.notes || 'Sin notas';
        let cartDisplay = 'Carrito vacío';
        try {
          if (order.raw_cart) {
            const cart = typeof order.raw_cart === 'string' ? JSON.parse(order.raw_cart) : order.raw_cart;
            cartDisplay = formatCartForDisplay(cart);
          }
        } catch (e) {
          cartDisplay = 'Error al parsear carrito';
        }

        const createdAt = order.created_at ? new Date(order.created_at).toLocaleString('es-MX') : 'No disponible';
        const updatedAt = order.updated_at ? new Date(order.updated_at).toLocaleString('es-MX') : createdAt;
        const discountAmount = order.discount_amount ? parseFloat(order.discount_amount) : 0;
        const shippingCost = order.shipping_cost ? parseFloat(order.shipping_cost) : 0;
        const tier = order.membership_tier || 'individual';
        
        // Buscar el cliente actual para comparar el Tier
        const currentCustomer = allCustomers.find(c => c.phone === order.customer_phone);
        const currentTier = currentCustomer ? currentCustomer.membership_tier : null;
        const showTierAlert = currentTier && currentTier !== tier;

        html += '<tr class="detail-row show">';
        html += '<td colspan="8"><div class="detail-content">';
        html += '<div class="detail-grid">';
        html += '<div class="detail-field"><div class="detail-field-label">Teléfono</div><div class="detail-field-value">' + escapeHtml(phone) + '</div></div>';
        html += '<div class="detail-field"><div class="detail-field-label">Fecha de Entrega</div><div class="detail-field-value">' + escapeHtml(deliveryDate) + '</div></div>';
        html += '<div class="detail-field"><div class="detail-field-label">Hora Aproximada</div><div class="detail-field-value">' + escapeHtml(deliveryTime) + '</div></div>';
        
        if (discountAmount > 0) {
          const tierLabel = tier.charAt(0).toUpperCase() + tier.slice(1);
          let alertHtml = '';
          if (showTierAlert) {
            alertHtml = ' <span style="font-size: 10px; background: #fff3cd; padding: 2px 4px; border-radius: 3px; color: #856404;">Actual: ' + currentTier.charAt(0).toUpperCase() + currentTier.slice(1) + '</span>';
          }
          html += '<div class="detail-field"><div class="detail-field-label">✨ Descuento (' + escapeHtml(tierLabel) + ')' + alertHtml + '</div><div class="detail-field-value" style="color: #27ae60; font-weight: 600;">-$' + discountAmount.toFixed(2) + '</div></div>';
        }
        
        html += '<div class="detail-field"><div class="detail-field-label">🚚 Envío</div><div class="detail-field-value">$' + shippingCost.toFixed(2) + '</div></div>';
        
        html += '<div class="detail-field"><div class="detail-field-label">📅 Creado</div><div class="detail-field-value" style="font-size: 12px; color: #999;">' + escapeHtml(createdAt) + '</div></div>';
        html += '<div class="detail-field"><div class="detail-field-label">✏️ Último cambio</div><div class="detail-field-value" style="font-size: 12px; color: #999;">' + escapeHtml(updatedAt) + '</div></div>';
        html += '<div class="detail-field raw-cart-section"><div class="detail-field-label">Notas</div><div class="detail-field-value">' + escapeHtml(notes) + '</div></div>';
        html += '</div>';
        html += '<div class="detail-field raw-cart-section"><div class="detail-field-label">Carrito</div><div class="raw-cart-list">' + cartDisplay + '</div></div>';
        html += '</div></td></tr>';
      }
    }

    html += '</tbody></table>';
    container.innerHTML = html;

    // Pagination
    const paginationControls = document.getElementById('paginationControls');
    if (totalPages > 1) {
      paginationControls.style.display = 'flex';
      document.getElementById('pageInfo').textContent = currentPage + ' de ' + totalPages;
      document.getElementById('btnPrev').disabled = currentPage === 1;
      document.getElementById('btnNext').disabled = currentPage === totalPages;
    } else {
      paginationControls.style.display = 'none';
    }
  }

  function toggleOrderDetail(orderId) {
    expandedOrderId = expandedOrderId === orderId ? null : orderId;
    renderOrdersTable();
  }

  function previousPage() {
    if (currentPage > 1) {
      currentPage--;
      renderOrdersTable();
    }
  }

  function nextPage() {
    const filtered = getFilteredOrders();
    const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
    if (currentPage < totalPages) {
      currentPage++;
      renderOrdersTable();
    }
  }

  async function changeOrderStatus(orderId, newStatus) {
    try {
      const { error } = await window.NappanDB.updateOrderStatus(orderId, newStatus);

      if (error) {
        showToast('Error actualizando estado: ' + error.message, 'error');
      } else {
        // Actualizar en memoria
        const order = allOrders.find(o => o.id === orderId);
        if (order) order.status = newStatus;
        showToast('✓ Estado actualizado', 'success');
        renderOrdersTable();
        invalidateCache('stats');
        await refreshStatsIfVisible();
      }
    } catch (error) {
      console.error('Error:', error);
      showToast('Error: ' + error.message, 'error');
    }
  }

  function confirmDeleteOrder(orderId) {
    const order = allOrders.find(o => o.id === orderId);
    if (!order) {
      showToast('Pedido no encontrado', 'error');
      return;
    }

    pendingDeleteOrderId = orderId;
    document.getElementById('confirmDeleteCustomer').textContent = order.customer_name || 'sin nombre';
    document.getElementById('confirmDeleteModal').style.display = 'flex';
  }

  function cancelDeleteConfirm() {
    document.getElementById('confirmDeleteModal').style.display = 'none';
    pendingDeleteOrderId = null;
  }

  async function confirmDeleteFinal() {
    if (!pendingDeleteOrderId) return;
    const orderId = pendingDeleteOrderId;
    cancelDeleteConfirm();
    await changeOrderStatus(orderId, 'deleted');
  }

  async function recoverDeletedOrder(orderId) {
    const order = allOrders.find(o => o.id === orderId);
    if (!order) return;

    try {
      await changeOrderStatus(orderId, 'pending');
      showToast('✓ Pedido recuperado', 'success');
    } catch (error) {
      showToast('Error al recuperar: ' + error.message, 'error');
    }
  }

  async function openEditOrder(orderId) {
    const order = allOrders.find(o => o.id === orderId);
    if (!order) {
      showToast('Pedido no encontrado', 'error');
      return;
    }

    editingOrderId = orderId;
    editingOrderData = { ...order };

    document.getElementById('editOrderTitle').textContent = 'Editar Pedido #' + (order.order_number || orderId.substring(0, 8));
    document.getElementById('editName').value = order.customer_name || '';
    document.getElementById('editPhone').value = order.customer_phone || '';
    document.getElementById('editDate').value = order.delivery_date ? order.delivery_date.substring(0, 10) : '';
    document.getElementById('editTime').value = order.delivery_time || order.deliveryTime || '';
    document.getElementById('editNotes').value = order.notes || '';
    document.getElementById('editTotal').value = order.total || 0;

    // Cargar productos de TODAS las secciones
    try {
      editingOrderProducts = await loadSectionProducts();
    } catch (error) {
      console.warn('Error loading products:', error);
      editingOrderProducts = [];
    }

    // Renderizar carrito editable
    renderEditCart(order);

    // Mostrar modal
    document.getElementById('editOrderModal').style.display = 'flex';
  }

  function renderEditCart(order) {
    const tbody = document.getElementById('editCartBody');
    tbody.innerHTML = '';

    let cart = [];
    try {
      if (order.raw_cart) {
        const parsed = typeof order.raw_cart === 'string' ? JSON.parse(order.raw_cart) : order.raw_cart;

        // Detectar formato Nappan Box (objeto con type, character, etc)
        if (parsed && typeof parsed === 'object' && !Array.isArray(parsed) && parsed.type) {
          // Convertir formato Nappan Box a array para mostrar
          const desc = parsed.character || parsed.design || 'Diseño personalizado';
          // Leer precio del raw_cart (pedidos nuevos) o inferir por tipo (pedidos anteriores)
          const NAPPANBOX_PRICES = { normal: 450, premium: 850 };
          const basePrice = parsed.base_price || NAPPANBOX_PRICES[parsed.type] || 0;
          cart = [{
            name: (parsed.type === 'normal' ? '🎨 Normal - ' : '⭐ Premium - ') + desc,
            qty: 1,
            price: basePrice,
            description: parsed.type === 'normal'
              ? `Personaje: ${parsed.character}, ${parsed.description}`
              : `Diseño: ${parsed.design}, Referencia: ${parsed.reference}`,
            extras: parsed.extras || 0
          }];
        } else if (Array.isArray(parsed)) {
          cart = parsed;
        } else {
          cart = [];
        }
      }
    } catch (e) {
      console.warn('Error parsing raw_cart:', e, 'raw_cart:', order.raw_cart);
      cart = [];
    }

    console.log('Rendering cart with', cart.length, 'items:', cart);

    cart.forEach((item, idx) => {
      const name = item.name || item.product_name || '';
      const qty = item.qty || item.quantity || 1;
      const price = item.price || item.unit_price || item.unitPrice || 0;
      const subtotal = qty * price;

      let html = '<tr>';
      html += '<td style="padding: 10px;"><input data-action="cart-item-name" data-row-index="' + idx + '" type="text" value="' + name + '" style="width: 100%; padding: 6px; border: 1px solid #ddd; border-radius: 4px;"></td>';
      html += '<td style="padding: 10px; text-align: center;"><input data-action="cart-item-qty" data-row-index="' + idx + '" type="number" id="qty-' + idx + '" value="' + qty + '" min="1" style="width: 60px; padding: 6px; border: 1px solid #ddd; border-radius: 4px;"></td>';
      html += '<td style="padding: 10px; text-align: right;"><input data-action="cart-item-price" data-row-index="' + idx + '" type="number" id="price-' + idx + '" value="' + price + '" step="0.01" min="0" style="width: 80px; padding: 6px; border: 1px solid #ddd; border-radius: 4px;"></td>';
      html += '<td style="padding: 10px; text-align: right; font-weight: 600;">$' + subtotal.toFixed(2) + '</td>';
      html += '<td style="padding: 10px; text-align: center;"><button type="button" data-action="remove-cart-row" data-row-index="' + idx + '" style="background: none; border: none; cursor: pointer; color: #d32f2f;">🗑️</button></td>';
      html += '</tr>';

      tbody.innerHTML += html;

      // Si hay descripción (formato Nappan Box), mostrarla en otra fila
      if (item.description) {
        html = '<tr class="cart-description-row" style="background: #f9f9f9;">';
        html += '<td colspan="5" style="padding: 8px 10px; font-size: 12px; color: #666; font-style: italic;">' + item.description;
        if (item.extras > 0) {
          html += ' + ' + item.extras + ' extras';
        }
        html += '</td>';
        html += '</tr>';
        tbody.innerHTML += html;
      }
    });

    updateEditTotal();
  }

  function addCartRow() {
    if (editingOrderProducts.length === 0) {
      showToast('No hay productos disponibles para esta sección', 'error');
      return;
    }
    showProductSelector();
  }

  function showProductSelector() {
    const selector = document.getElementById('productSelector');
    selector.innerHTML = '';

    if (editingOrderProducts.length === 0) {
      selector.innerHTML = '<div style="padding: 20px; text-align: center; color: #999;">No hay productos disponibles</div>';
      document.getElementById('selectProductModal').style.display = 'flex';
      return;
    }

    editingOrderProducts.forEach(product => {
      const btn = document.createElement('button');
      btn.style.cssText = 'padding: 15px; background: #f9f9f9; border: 1px solid #ddd; border-radius: 8px; cursor: pointer; text-align: left; font-size: 14px; transition: background 0.2s;';
      btn.onmouseover = () => btn.style.background = '#f0f0f0';
      btn.onmouseout = () => btn.style.background = '#f9f9f9';

      const sectionLabel = product.section === 'lunchbox' ? '🍱 Lunch Box' :
                          product.section === 'nappanbox' ? '🎨 Nappan Box' :
                          product.section === 'fitbar' ? '💪 Fit Bar' :
                          product.section === 'eventos' ? '🎉 Eventos' : 'Otro';

      btn.innerHTML = '<div style="font-weight: 600;">' + escapeHtml(product.name) + '</div>' +
                     '<div style="font-size: 12px; color: #999;">' + sectionLabel + ' • $' + (product.base_price || 0).toFixed(2) + '</div>';
      btn.type = 'button';
      btn.dataset.action = 'select-edit-product';
      btn.dataset.productId = product.id;

      selector.appendChild(btn);
    });

    document.getElementById('selectProductModal').style.display = 'flex';
  }

  function closeProductSelector() {
    document.getElementById('selectProductModal').style.display = 'none';
  }

  function addProductToCart(product) {
    closeProductSelector();

    const tbody = document.getElementById('editCartBody');
    const idx = tbody.children.length;

    let html = '<tr>';
    html += '<td style="padding: 10px;"><input data-action="cart-item-name" data-row-index="' + idx + '" type="text" value="' + escapeHtml(product.name) + '" style="width: 100%; padding: 6px; border: 1px solid #ddd; border-radius: 4px;"></td>';
    html += '<td style="padding: 10px; text-align: center;"><input data-action="cart-item-qty" data-row-index="' + idx + '" type="number" id="qty-' + idx + '" value="1" min="1" style="width: 60px; padding: 6px; border: 1px solid #ddd; border-radius: 4px;"></td>';
    html += '<td style="padding: 10px; text-align: right;"><input data-action="cart-item-price" data-row-index="' + idx + '" type="number" id="price-' + idx + '" value="' + (product.base_price || 0) + '" step="0.01" min="0" style="width: 80px; padding: 6px; border: 1px solid #ddd; border-radius: 4px;"></td>';
    html += '<td style="padding: 10px; text-align: right; font-weight: 600;">$' + (product.base_price || 0).toFixed(2) + '</td>';
    html += '<td style="padding: 10px; text-align: center;"><button type="button" data-action="remove-cart-row" data-row-index="' + idx + '" style="background: none; border: none; cursor: pointer; color: #d32f2f;">🗑️</button></td>';
    html += '</tr>';

    tbody.innerHTML += html;
    updateEditTotal();
  }

  function updateCartItemName(idx, newName) {
    // Las filas editan directamente en el form
  }

  function updateCartItem(idx, qty, price) {
    // Los valores se actualizan directamente en los inputs
    updateEditTotal();
  }

  function removeCartRow(target) {
    const tbody = document.getElementById('editCartBody');
    let row = null;

    if (typeof target === 'number') {
      const button = tbody.querySelector('[data-action="remove-cart-row"][data-row-index="' + target + '"]');
      row = button ? button.closest('tr') : null;
    } else if (target && typeof target.closest === 'function') {
      row = target.closest('tr');
    }

    if (!row) return;

    const nextRow = row.nextElementSibling;
    row.remove();
    if (nextRow && nextRow.classList.contains('cart-description-row')) {
      nextRow.remove();
    }

    updateEditTotal();
  }

  function updateEditTotal() {
    const tbody = document.getElementById('editCartBody');
    let total = 0;

    for (let i = 0; i < tbody.children.length; i++) {
      const row = tbody.children[i];
      const inputs = row.querySelectorAll('input[type="number"]');
      if (inputs.length >= 2) {
        const qty = parseFloat(inputs[0].value) || 0;
        const price = parseFloat(inputs[1].value) || 0;
        total += qty * price;

        // Actualizar subtotal de la fila
        const subtotalCell = row.children[3];
        subtotalCell.textContent = '$' + (qty * price).toFixed(2);
      }
    }

    document.getElementById('editTotal').value = total.toFixed(2);
  }

  function closeEditOrder() {
    document.getElementById('editOrderModal').style.display = 'none';
    editingOrderId = null;
    editingOrderData = null;
  }

  async function saveEditOrder() {
    if (!editingOrderId) return;

    try {
      const name = document.getElementById('editName').value.trim();
      const phone = document.getElementById('editPhone').value.trim();
      const date = document.getElementById('editDate').value;
      const time = document.getElementById('editTime').value.trim();
      const notes = document.getElementById('editNotes').value.trim();
      const total = parseFloat(document.getElementById('editTotal').value) || 0;

      if (!name) {
        showToast('El nombre del cliente es requerido', 'error');
        return;
      }

      // Construir carrito desde la tabla
      const tbody = document.getElementById('editCartBody');
      const cart = [];

      for (let i = 0; i < tbody.children.length; i++) {
        const row = tbody.children[i];
        const inputs = row.querySelectorAll('input');
        if (inputs.length >= 3) {
          const itemName = inputs[0].value.trim();
          const qty = parseInt(inputs[1].value) || 0;
          const price = parseFloat(inputs[2].value) || 0;

          if (itemName && qty > 0) {
            cart.push({
              name: itemName,
              qty: qty,
              price: price
            });
          }
        }
      }

      const updates = {
        customer_name: name,
        customer_phone: phone || null,
        delivery_date: date || null,
        delivery_time: time || null,
        notes: notes || null,
        total: total,
        raw_cart: JSON.stringify(cart)
      };

      const matchedCustomer = phone ? await resolveCustomerByPhone(phone) : null;
      updates.customer_id = matchedCustomer ? matchedCustomer.id : null;

      const { error } = await window.NappanDB.updateOrder(editingOrderId, updates);

      if (error) {
        showToast('Error al guardar: ' + (error.message || error), 'error');
      } else {
        // Actualizar en memoria
        const order = allOrders.find(o => o.id === editingOrderId);
        if (order) {
          order.customer_name = name;
          order.customer_phone = phone;
          order.delivery_date = date;
          order.delivery_time = time;
          order.notes = notes;
          order.total = total;
          order.raw_cart = cart;
          order.customer_id = updates.customer_id;
        }

        showToast('✓ Pedido actualizado', 'success');
        closeEditOrder();
        renderOrdersTable();
        invalidateCache('stats');
        await refreshStatsIfVisible();
      }
    } catch (error) {
      console.error('Error saving order:', error);
      showToast('Error: ' + error.message, 'error');
    }
  }

  function exportOrdersCSV() {
    const filtered = getFilteredOrders();
    if (filtered.length === 0) {
      showToast('No hay pedidos para exportar', 'error');
      return;
    }

    const headers = ['Pedido', 'Cliente', 'Teléfono', 'Sección', 'Total', 'Estado', 'Fecha', 'Notas'];
    const rows = [headers];

    filtered.forEach(order => {
      const date = new Date(order.created_at).toLocaleDateString('es-MX');
      const statusLabel = getStatusLabel(order.status);
      const phone = order.customer_phone || '';
      const notes = (order.notes || '').replace(/"/g, '""'); // Escape quotes for CSV

      rows.push([
        order.order_number || '',
        order.customer_name || '',
        phone,
        order.section || '',
        '$' + (order.total || 0),
        statusLabel,
        date,
        '"' + notes + '"'
      ]);
    });

    const csv = rows.map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv; charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'pedidos_' + new Date().getTime() + '.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast('✓ CSV exportado (' + filtered.length + ' pedidos)', 'success');
  }

  function getStatusLabel(status) {
    const labels = {
      'pending': 'Pendiente',
      'confirmed': 'Confirmado',
      'in_progress': 'En Progreso',
      'delivered': 'Entregado',
      'cancelled': 'Cancelado'
    };
    return labels[status] || status;
  }

  function formatCartForDisplay(cart) {
    if (!cart) return 'Carrito vacío';

    // Si es un array de items
    if (Array.isArray(cart)) {
      let html = '<ul style="list-style: none; padding: 0;">';
      cart.forEach((item, idx) => {
        html += '<li style="padding: 10px; margin-bottom: 10px; background: white; border-radius: 4px; border-left: 3px solid #DAA520;">';
        html += '<div style="font-weight: 600; margin-bottom: 5px;">' + (item.icon || '🛒') + ' ' + escapeHtml(item.name || 'Item') + '</div>';
        if (item.qty) html += '<div>Cantidad: <strong>' + item.qty + '</strong></div>';
        if (item.art) html += '<div>Arte: <strong>' + escapeHtml(item.art) + '</strong></div>';
        if (item.fruitType) html += '<div>Tipo: <strong>' + escapeHtml(item.fruitType) + '</strong></div>';
        if (item.unitPrice) html += '<div>Precio unitario: <strong>$' + item.unitPrice + '</strong></div>';
        if (item.totalPrice) html += '<div style="color: #DAA520; font-weight: 600;">Total: $' + item.totalPrice + '</div>';
        if (item.extras && Array.isArray(item.extras) && item.extras.length > 0) {
          html += '<div style="margin-top: 8px; padding-top: 8px; border-top: 1px solid #eee;"><strong>Extras:</strong><ul style="list-style: none; padding: 0; margin-top: 5px;">';
          item.extras.forEach(extra => {
            html += '<li style="padding: 4px 0;">• ' + escapeHtml(extra.label) + ' — <strong>$' + extra.price + '</strong></li>';
          });
          html += '</ul></div>';
        }
        html += '</li>';
      });
      html += '</ul>';
      return html;
    }

    // Si es un objeto simple (para pedidos especiales como Nappan Box)
    if (typeof cart === 'object') {
      let html = '<div style="padding: 10px; background: white; border-radius: 4px; border-left: 3px solid #DAA520;">';
      for (const key in cart) {
        if (typeof cart[key] === 'object') {
          html += '<div style="margin-bottom: 8px;"><strong>' + escapeHtml(key) + ':</strong> ' + escapeHtml(JSON.stringify(cart[key])) + '</div>';
        } else {
          html += '<div style="margin-bottom: 8px;"><strong>' + escapeHtml(key) + ':</strong> ' + escapeHtml(cart[key]) + '</div>';
        }
      }
      html += '</div>';
      return html;
    }

    return 'Formato de carrito no reconocido';
  }

  function showToast(message, type) {
    if (!type) type = 'success';
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.className = 'toast show ' + type;
    setTimeout(() => toast.classList.remove('show'), 3000);
  }

  // Cache-aware order loading
  async function ensureOrdersLoaded({ force = false } = {}) {
    if (cacheState.ordersLoaded && !force) return;
    document.getElementById('tableContainer').innerHTML = '<div class="loading">Cargando pedidos...</div>';
    try {
      allOrders = await (await getDb()).loadAllOrders({});
      cacheState.ordersLoaded = true;
      renderOrdersTable();
    } catch (error) {
      console.error('Error loading orders:', error);
      document.getElementById('tableContainer').innerHTML = '<div class="loading">Error cargando pedidos</div>';
    }
  }

  function switchTabTo(tabName, btnEl) {
    document.querySelectorAll('[id$="-tab"]').forEach(el => {
      el.style.display = 'none';
    });
    document.querySelectorAll('.tab-btn').forEach(el => {
      el.classList.remove('active');
    });

    const tab = document.getElementById(tabName + '-tab');
    if (tab) {
      tab.style.display = 'block';
      btnEl?.classList.add('active');
    }

    if (tabName === 'pedidos') {
      ensureOrdersLoaded();
    } else if (tabName === 'config') {
      loadConfig();
    } else if (tabName === 'productos') {
      loadProductsList();
    } else if (tabName === 'clientes') {
      loadCustomersList();
    } else if (tabName === 'estadisticas') {
      loadStats();
    }
  }

  async function loadProductsList() {
    const container = document.getElementById('productsContainer');
    container.innerHTML = '<div class="loading">Cargando productos...</div>';

    try {
      allProducts = await loadSectionProducts();

      if (!allProducts || allProducts.length === 0) {
        container.innerHTML = '<div class="loading">No hay productos</div>';
        return;
      }

      let html = '<table><thead><tr>';
      html += '<th>Sección</th>';
      html += '<th>Nombre</th>';
      html += '<th>SKU</th>';
      html += '<th>Precio</th>';
      html += '<th>Acciones</th>';
      html += '</tr></thead><tbody>';

      allProducts.forEach(product => {
        html += '<tr id="prod-row-' + product.id + '">';
        html += '<td>' + escapeHtml(product.section || 'N/A') + '</td>';
        html += '<td>' + escapeHtml(product.name || 'N/A') + '</td>';
        html += '<td style="font-family: monospace; font-size: 12px;">' + escapeHtml(product.sku || 'N/A') + '</td>';
        html += '<td id="price-cell-' + product.id + '" style="font-weight: 600; color: #DAA520;">$' + (product.base_price || 0) + '</td>';
        html += '<td><button type="button" class="btn" style="padding: 8px 12px; font-size: 13px;" data-action="start-edit-product-price" data-product-id="' + product.id + '" data-current-price="' + (product.base_price || 0) + '">Editar</button></td>';
        html += '</tr>';
      });

      html += '</tbody></table>';
      container.innerHTML = html;
    } catch (error) {
      console.error('Error loading products:', error);
      container.innerHTML = '<div class="loading">Error cargando productos</div>';
    }
  }

  function startEditProductPrice(productId, currentPrice) {
    const cellEl = document.getElementById('price-cell-' + productId);
    cellEl.innerHTML = '<div class="inline-edit"><span>$</span><input type="number" id="input-' + productId + '" value="' + currentPrice + '" min="0" step="0.01"><button type="button" class="btn-confirm" data-action="confirm-edit-product-price" data-product-id="' + productId + '">✓</button><button type="button" class="btn-cancel" data-action="cancel-edit-product-price" data-product-id="' + productId + '" data-current-price="' + currentPrice + '">✗</button></div>';
    document.getElementById('input-' + productId).focus();
  }

  async function confirmEditProductPrice(productId) {
    const input = document.getElementById('input-' + productId);
    const newPrice = parseFloat(input.value);

    if (isNaN(newPrice) || newPrice < 0) {
      showToast('Ingresa un precio válido', 'error');
      return;
    }

    try {
      const { error } = await window.NappanDB.updateProductPrice(productId, newPrice);

      if (error) {
        showToast('Error guardando precio: ' + error.message, 'error');
      } else {
        // Update in memory
        const product = allProducts.find(p => p.id === productId);
        if (product) product.base_price = newPrice;
        showToast('✓ Precio actualizado', 'success');

        // Update cell display
        const cellEl = document.getElementById('price-cell-' + productId);
        cellEl.innerHTML = '$' + newPrice;
        cellEl.style.fontWeight = '600';
        cellEl.style.color = '#DAA520';
        invalidateCache('stats');
      }
    } catch (error) {
      console.error('Error:', error);
      showToast('Error: ' + error.message, 'error');
    }
  }

  function cancelEditProductPrice(productId, originalPrice) {
    const cellEl = document.getElementById('price-cell-' + productId);
    cellEl.innerHTML = '$' + originalPrice;
    cellEl.style.fontWeight = '600';
    cellEl.style.color = '#DAA520';
  }

  async function loadConfig() {
    try {
      const config = await window.NappanDB.loadAppConfig();

      document.getElementById('configWhatsapp').value = config.whatsapp_number || '';
      document.getElementById('configPremiumDiscount').value = config.tier_premium_discount || '';
      document.getElementById('configBusinessDiscount').value = config.tier_business_discount || '';

      let shippingHtml = '';
      for (let i = 1; i <= 5; i++) {
        const km = config['shipping_tier_' + i + '_km'] || '';
        const price = config['shipping_tier_' + i + '_price'] || '';
        shippingHtml += '<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 15px;">';
        shippingHtml += '<div><label style="display: block; font-size: 12px; font-weight: 600; color: #999; margin-bottom: 8px;">Tier ' + i + ' (km)</label>';
        shippingHtml += '<input type="number" class="shipping-km" data-tier="' + i + '" value="' + km + '" style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 6px;"></div>';
        shippingHtml += '<div><label style="display: block; font-size: 12px; font-weight: 600; color: #999; margin-bottom: 8px;">Precio (MXN)</label>';
        shippingHtml += '<input type="number" class="shipping-price" data-tier="' + i + '" value="' + price + '" style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 6px;"></div>';
        shippingHtml += '</div>';
      }
      document.getElementById('shippingContainer').innerHTML = shippingHtml;

      const gallery = await window.NappanDB.loadGalleryPhotos();
      let galleryHtml = '';
      for (const eventType in gallery) {
        galleryHtml += '<div style="margin-bottom: 20px; padding: 15px; background: #f9f9f9; border-radius: 6px;">';
        galleryHtml += '<h4 style="margin-bottom: 10px;">' + gallery[eventType].label + '</h4>';
        if (gallery[eventType].images) {
          gallery[eventType].images.forEach((img, idx) => {
            galleryHtml += '<div style="margin-bottom: 10px;">';
            galleryHtml += '<label style="display: block; font-size: 12px; font-weight: 600; color: #999; margin-bottom: 5px;">Imagen ' + (idx + 1) + ' URL</label>';
            galleryHtml += '<input type="text" class="gallery-url" data-event="' + eventType + '" data-slot="' + (idx + 1) + '" value="' + (img.image_url || '') + '" placeholder="images/ejemplo.webp" style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 6px; font-family: monospace; font-size: 12px;">';
            galleryHtml += '</div>';
          });
        }
        galleryHtml += '</div>';
      }
      document.getElementById('galleryContainer').innerHTML = galleryHtml;

      // Load extras
      await loadExtrasForConfig();
    } catch (error) {
      console.error('Error loading config:', error);
      showToast('Error cargando configuración', 'error');
    }
  }

  async function loadExtrasForConfig() {
    try {
      const allProducts = await loadProductsWithExtras();
      const appConfig = await window.NappanDB.loadAppConfig();

      let extrasHtml = '';
      for (const product of allProducts) {
        const extras = product.extras || [];
        if (extras && extras.length > 0) {
          extrasHtml += '<div style="margin-bottom: 15px; padding: 15px; background: #f9f9f9; border-radius: 6px;">';
          extrasHtml += '<h4 style="margin-bottom: 10px;">' + escapeHtml(product.name) + ' (' + escapeHtml(product.section) + ')</h4>';
          extras.forEach((extra, idx) => {
            const labelKey = 'extra_label_' + product.sku + '_' + (idx + 1);
            const labelValue = appConfig[labelKey] || extra.label;
            extrasHtml += '<div style="margin-bottom: 10px;">';
            extrasHtml += '<label style="display: block; font-size: 12px; font-weight: 600; color: #999; margin-bottom: 5px;">' + escapeHtml(labelValue) + '</label>';
            extrasHtml += '<input type="text" class="extra-label" data-config-key="' + escapeHtml(labelKey) + '" value="' + escapeHtml(labelValue) + '" style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 6px; margin-bottom: 8px;">';
            extrasHtml += '<input type="number" class="extra-price" data-extra-id="' + extra.id + '" value="' + extra.price + '" style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 6px;">';
            extrasHtml += '</div>';
          });
          extrasHtml += '</div>';
        }
      }
      document.getElementById('extrasContainer').innerHTML = extrasHtml || '<div class="loading">No hay extras</div>';
    } catch (error) {
      console.error('Error loading extras:', error);
      document.getElementById('extrasContainer').innerHTML = '<div class="loading">Error cargando extras</div>';
    }
  }

  async function saveExtras() {
    try {
      const labelInputs = document.querySelectorAll('.extra-label');
      const inputs = document.querySelectorAll('.extra-price');
      if (inputs.length === 0 && labelInputs.length === 0) {
        showToast('No hay extras para guardar', 'error');
        return;
      }

      for (const input of labelInputs) {
        const configKey = input.dataset.configKey;
        const label = input.value.trim();

        if (configKey) {
          const { error } = await window.NappanDB.updateConfigValue(configKey, label);
          if (error) {
            console.error('Error saving extra label:', error);
          }
        }
      }

      for (const input of inputs) {
        const extraId = input.dataset.extraId;
        const price = input.value.trim();

        if (price) {
          const { error } = await window.NappanDB.updateExtraPrice(extraId, parseFloat(price));
          if (error) {
            console.error('Error saving extra:', error);
          }
        }
      }

      showToast('✓ Extras guardados', 'success');
      invalidateCache('config');
      await loadExtrasForConfig();
    } catch (error) {
      console.error('Error:', error);
      showToast('Error: ' + error.message, 'error');
    }
  }

  async function saveWhatsapp() {
    const value = document.getElementById('configWhatsapp').value.trim();
    if (!value) {
      showToast('Ingresa un número', 'error');
      return;
    }

    try {
      const { error } = await window.NappanDB.updateConfigValue('whatsapp_number', value);

      if (error) {
        showToast('Error guardando: ' + error.message, 'error');
      } else {
        showToast('✓ WhatsApp actualizado', 'success');
        invalidateCache('config');
      }
    } catch (error) {
      console.error('Error:', error);
      showToast('Error: ' + error.message, 'error');
    }
  }

  async function saveTierDiscounts() {
    const premium = document.getElementById('configPremiumDiscount').value.trim();
    const business = document.getElementById('configBusinessDiscount').value.trim();

    if (!premium || !business) {
      showToast('Ingresa ambos descuentos', 'error');
      return;
    }

    try {
      const { error: e1 } = await window.NappanDB.updateConfigValue('tier_premium_discount', premium);
      const { error: e2 } = await window.NappanDB.updateConfigValue('tier_business_discount', business);

      if (e1 || e2) {
        showToast('Error guardando descuentos', 'error');
      } else {
        showToast('✓ Descuentos actualizados', 'success');
        invalidateCache('config');
      }
    } catch (error) {
      console.error('Error:', error);
      showToast('Error: ' + error.message, 'error');
    }
  }

  async function saveShipping() {
    try {
      const inputs = document.querySelectorAll('.shipping-km');
      let success = true;

      for (const input of inputs) {
        const tier = input.dataset.tier;
        const km = input.value.trim();
        const priceInput = document.querySelector('.shipping-price[data-tier="' + tier + '"]');
        const price = priceInput.value.trim();

        if (km && price) {
          const { error: kmError } = await window.NappanDB.updateConfigValue('shipping_tier_' + tier + '_km', km);
          const { error: priceError } = await window.NappanDB.updateConfigValue('shipping_tier_' + tier + '_price', price);

          if (kmError || priceError) {
            success = false;
          }
        }
      }

      if (success) {
        showToast('✓ Tarifas guardadas', 'success');
        invalidateCache('config');
      } else {
        showToast('Error guardando algunas tarifas', 'error');
      }
    } catch (error) {
      console.error('Error:', error);
      showToast('Error: ' + error.message, 'error');
    }
  }

  async function saveGallery() {
    try {
      const inputs = document.querySelectorAll('.gallery-url');
      let success = true;

      for (const input of inputs) {
        const eventType = input.dataset.event;
        const slot = input.dataset.slot;
        const imageUrl = input.value.trim() || null;

        const { error } = await window.NappanDB.updateGalleryPhoto(eventType, parseInt(slot), imageUrl);

        if (error) {
          success = false;
        }
      }

      if (success) {
        showToast('✓ Galería actualizada', 'success');
        invalidateCache('config');
        await loadConfig();
      } else {
        showToast('Error guardando algunas fotos', 'error');
      }
    } catch (error) {
      console.error('Error:', error);
      showToast('Error: ' + error.message, 'error');
    }
  }

  // CLIENTES TAB
  async function loadCustomersList() {
    const container = document.getElementById('customersContainer');
    container.innerHTML = '<div class="loading">Cargando clientes...</div>';

    try {
      allCustomers = await (await getDb()).loadCustomers({});

      if (!allCustomers || allCustomers.length === 0) {
        container.innerHTML = '<div class="loading">No hay clientes</div>';
        return;
      }

      // Recargar órdenes desde Supabase para obtener cambios recientes (e.g., eliminaciones)
      allOrders = await (await getDb()).loadAllOrders({});

      // Enriquecer datos de clientes con información de órdenes
      await enrichCustomersWithOrderData();

      renderCustomersTable();
    } catch (error) {
      console.error('Error loading customers:', error);
      container.innerHTML = '<div class="loading">Error cargando clientes</div>';
    }
  }

  async function enrichCustomersWithOrderData() {
    try {
      const validOrders = allOrders.filter(o => o.status !== 'cancelled' && o.status !== 'deleted');
      const ordersByCustomerId = {};
      const ordersByPhone = {};

      validOrders.forEach(order => {
        const customerId = order.customer_id || '';
        if (customerId) {
          if (!ordersByCustomerId[customerId]) {
            ordersByCustomerId[customerId] = [];
          }
          ordersByCustomerId[customerId].push(order);
        }

        const phone = normalizePhone(order.customer_phone);
        if (phone) {
          if (!ordersByPhone[phone]) {
            ordersByPhone[phone] = [];
          }
          ordersByPhone[phone].push(order);
        }
      });

      allCustomers.forEach(customer => {
        const phone = normalizePhone(customer.phone);
        const linkedOrders = ordersByCustomerId[customer.id] || [];
        const fallbackOrders = ordersByPhone[phone] || [];
        const ordersById = new Map();
        [...linkedOrders, ...fallbackOrders].forEach(order => {
          ordersById.set(order.id, order);
        });
        const customerOrders = Array.from(ordersById.values());

        customer.order_count = customerOrders.length;
        customer.total_spent = customerOrders.reduce((sum, o) => sum + (parseFloat(o.total) || 0), 0);

        // Encontrar el pedido más reciente
        if (customerOrders.length > 0) {
          const sorted = customerOrders.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
          customer.last_order_at = sorted[0].created_at;
        } else {
          customer.last_order_at = null;
        }
      });
    } catch (error) {
      console.error('Error enriching customer data:', error);
      // Si falla, al menos los datos básicos están allí
    }
  }

  function renderCustomersTable() {
    const container = document.getElementById('customersContainer');

    let html = '<table><thead><tr>';
    html += '<th>Teléfono</th>';
    html += '<th>Nombre</th>';
    html += '<th>Tier</th>';
    html += '<th>Pedidos</th>';
    html += '<th>Total Gastado</th>';
    html += '<th>Último Pedido</th>';
    html += '<th>Acciones</th>';
    html += '</tr></thead><tbody>';

    allCustomers.forEach(customer => {
      const lastOrder = customer.last_order_at ? new Date(customer.last_order_at).toLocaleDateString('es-MX') : '—';
      const totalSpent = parseFloat(customer.total_spent || 0).toLocaleString('es-MX', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
      html += '<tr>';
      html += '<td id="phone-' + customer.id + '">' + escapeHtml(customer.phone || '—') + ' <button type="button" class="btn" style="padding:4px 8px; font-size:11px; width:auto;" data-action="start-edit-customer" data-customer-id="' + customer.id + '" data-field="phone">✏️</button></td>';
      html += '<td id="name-' + customer.id + '">' + escapeHtml(customer.name || '—') + ' <button type="button" class="btn" style="padding:4px 8px; font-size:11px; width:auto;" data-action="start-edit-customer" data-customer-id="' + customer.id + '" data-field="name">✏️</button></td>';
      html += '<td><select data-action="change-customer-tier" data-customer-id="' + customer.id + '">';
      html += '<option value="individual" ' + (customer.membership_tier === 'individual' ? 'selected' : '') + '>Individual</option>';
      html += '<option value="premium" ' + (customer.membership_tier === 'premium' ? 'selected' : '') + '>Premium</option>';
      html += '<option value="business" ' + (customer.membership_tier === 'business' ? 'selected' : '') + '>Business</option>';
      html += '</select></td>';
      html += '<td style="text-align:center;"><strong>' + (customer.order_count || 0) + '</strong></td>';
      html += '<td style="text-align:right;">$' + totalSpent + '</td>';
      html += '<td style="font-size:13px;color:#666;">' + lastOrder + '</td>';
      html += '<td><button type="button" class="btn-cancel" style="padding:6px 10px; font-size:12px; background:#FF6B6B; color:white; border:none; border-radius:4px; cursor:pointer;" data-action="delete-customer" data-customer-id="' + customer.id + '">🗑️</button></td>';
      html += '</tr>';
    });

    html += '</tbody></table>';
    container.innerHTML = html;
  }

  function startEditCustomer(id, field, currentVal, cellEl) {
    cellEl.innerHTML = '<input type="text" id="input-' + id + '" value="' + escapeHtml(currentVal) + '" style="padding:6px; border:1px solid #DAA520; border-radius:4px;"> <button type="button" class="btn-confirm" data-action="confirm-edit-customer" data-customer-id="' + id + '" data-field="' + field + '">✓</button> <button type="button" class="btn-cancel" style="padding:4px 8px; font-size:11px; background:#FF6B6B; color:white; border:none; border-radius:4px; cursor:pointer;" data-action="cancel-edit-customer" data-customer-id="' + id + '" data-field="' + field + '" data-original-value="' + escapeHtml(currentVal) + '">✗</button>';
    document.getElementById('input-' + id).focus();
  }

  async function confirmEditCustomer(id, field) {
    const newVal = document.getElementById('input-' + id).value.trim();
    if (!newVal) {
      showToast('No puede estar vacío', 'error');
      return;
    }

    const customer = allCustomers.find(c => c.id === id);
    const oldVal = customer ? customer[field] : '';
    const updates = {};
    updates[field] = newVal;

    try {
      const { error } = await window.NappanDB.updateCustomer(id, updates);
      if (error) {
        showToast('Error: ' + error.message, 'error');
      } else {
        if (customer) customer[field] = newVal;
        showToast('✓ ' + field.charAt(0).toUpperCase() + field.slice(1) + ' actualizado', 'success');

        if (field === 'phone') {
          const linked = await syncOrdersWithCustomerIdByPhone(id, oldVal);
          if (linked > 0) {
            showToast('✓ ' + linked + ' pedidos vinculados al cliente', 'success');
          }
        }

        renderCustomersTable();
        invalidateCache('stats');
        await refreshStatsIfVisible();
      }
    } catch (error) {
      showToast('Error: ' + error.message, 'error');
    }
  }

  function cancelEditCustomer(id, field, originalVal) {
    renderCustomersTable();
  }

  async function changeCustomerTier(id, newTier) {
    try {
      const { error } = await window.NappanDB.updateCustomer(id, { membership_tier: newTier });
      if (error) {
        showToast('Error: ' + error.message, 'error');
      } else {
        const customer = allCustomers.find(c => c.id === id);
        if (customer) customer.membership_tier = newTier;
        showToast('✓ Tier actualizado', 'success');
        invalidateCache('stats');
      }
    } catch (error) {
      showToast('Error: ' + error.message, 'error');
    }
  }

  async function deleteCustomerRow(id) {
    if (!confirm('¿Estás seguro de que quieres eliminar este cliente?')) return;

    try {
      const { error } = await window.NappanDB.deleteCustomer(id);
      if (error) {
        showToast('Error: ' + error.message, 'error');
      } else {
        allCustomers = allCustomers.filter(c => c.id !== id);
        showToast('✓ Cliente eliminado', 'success');
        renderCustomersTable();
        invalidateCache('stats');
        await refreshStatsIfVisible();
      }
    } catch (error) {
      showToast('Error: ' + error.message, 'error');
    }
  }

  function showAddCustomerForm() {
    document.getElementById('addCustomerForm').style.display = 'block';
    document.getElementById('newCustPhone').focus();
  }

  function hideAddCustomerForm() {
    document.getElementById('addCustomerForm').style.display = 'none';
    document.getElementById('newCustPhone').value = '';
    document.getElementById('newCustName').value = '';
    document.getElementById('newCustTier').value = 'individual';
  }

  async function saveNewCustomer() {
    const phone = document.getElementById('newCustPhone').value.trim();
    const name = document.getElementById('newCustName').value.trim();
    const tier = document.getElementById('newCustTier').value;

    if (!phone || !name) {
      showToast('Completa todos los campos', 'error');
      return;
    }

    try {
      const { data, error } = await window.NappanDB.insertCustomer(phone, name, tier);
      if (error) {
        showToast('Error: ' + error.message, 'error');
      } else {
        showToast('✓ Cliente agregado', 'success');
        if (data?.id) {
          const linked = await syncOrdersWithCustomerIdByPhone(data.id, phone);
          if (linked > 0) {
            showToast('✓ ' + linked + ' pedidos vinculados al cliente', 'success');
          }
        }
        hideAddCustomerForm();
        invalidateCache('customers');
        invalidateCache('stats');
        await ensureCustomersLoaded({ force: true });
        await refreshStatsIfVisible();
      }
    } catch (error) {
      showToast('Error: ' + error.message, 'error');
    }
  }

  function setupAdminInteractions() {
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
      loginForm.addEventListener('submit', handleLogin);
    }

    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
      searchInput.addEventListener('input', applyOrderFilters);
    }

    ['sectionFilter', 'statusFilter', 'showDeletedFilter'].forEach(id => {
      const el = document.getElementById(id);
      if (el) {
        el.addEventListener('change', applyOrderFilters);
      }
    });

    document.addEventListener('click', event => {
      const actionEl = event.target.closest('[data-action]');
      if (!actionEl) return;

      const { action } = actionEl.dataset;
      switch (action) {
        case 'logout':
          handleLogout();
          break;
        case 'switch-tab':
          switchTabTo(actionEl.dataset.tab, actionEl);
          break;
        case 'export-orders':
          exportOrdersCSV();
          break;
        case 'previous-page':
          previousPage();
          break;
        case 'next-page':
          nextPage();
          break;
        case 'show-add-customer':
          showAddCustomerForm();
          break;
        case 'save-new-customer':
          saveNewCustomer();
          break;
        case 'hide-add-customer':
          hideAddCustomerForm();
          break;
        case 'save-whatsapp':
          saveWhatsapp();
          break;
        case 'save-shipping':
          saveShipping();
          break;
        case 'save-extras':
          saveExtras();
          break;
        case 'save-tier-discounts':
          saveTierDiscounts();
          break;
        case 'save-gallery':
          saveGallery();
          break;
        case 'stats-quick-range':
          setQuickDateRange(actionEl.dataset.range);
          break;
        case 'load-stats':
          loadStats();
          break;
        case 'reset-stats':
          resetStatsDate();
          break;
        case 'export-stats':
          exportStatsCSV();
          break;
        case 'add-cart-row':
          addCartRow();
          break;
        case 'close-edit-order':
          closeEditOrder();
          break;
        case 'save-edit-order':
          saveEditOrder();
          break;
        case 'close-product-selector':
          closeProductSelector();
          break;
        case 'cancel-delete-confirm':
          cancelDeleteConfirm();
          break;
        case 'confirm-delete-final':
          confirmDeleteFinal();
          break;
        case 'toggle-order-detail':
          toggleOrderDetail(actionEl.dataset.orderId);
          break;
        case 'change-order-status':
          changeOrderStatus(actionEl.dataset.orderId, actionEl.value);
          break;
        case 'recover-deleted-order':
          recoverDeletedOrder(actionEl.dataset.orderId);
          break;
        case 'open-edit-order':
          openEditOrder(actionEl.dataset.orderId);
          break;
        case 'confirm-delete-order':
          confirmDeleteOrder(actionEl.dataset.orderId);
          break;
        case 'start-edit-product-price':
          startEditProductPrice(actionEl.dataset.productId, parseFloat(actionEl.dataset.currentPrice) || 0);
          break;
        case 'confirm-edit-product-price':
          confirmEditProductPrice(actionEl.dataset.productId);
          break;
        case 'cancel-edit-product-price':
          cancelEditProductPrice(actionEl.dataset.productId, parseFloat(actionEl.dataset.currentPrice) || 0);
          break;
        case 'start-edit-customer': {
          const field = actionEl.dataset.field || 'name';
          const cellEl = document.getElementById(field + '-' + actionEl.dataset.customerId);
          const currentVal = cellEl ? (cellEl.childNodes[0]?.textContent || cellEl.textContent || '').trim() : '';
          startEditCustomer(
            actionEl.dataset.customerId,
            field,
            currentVal,
            cellEl
          );
          break;
        }
        case 'confirm-edit-customer':
          confirmEditCustomer(actionEl.dataset.customerId, actionEl.dataset.field || 'name');
          break;
        case 'cancel-edit-customer':
          cancelEditCustomer(actionEl.dataset.customerId, actionEl.dataset.field || 'name', actionEl.dataset.originalValue || '');
          break;
        case 'delete-customer':
          deleteCustomerRow(actionEl.dataset.customerId);
          break;
        case 'select-edit-product': {
          const product = editingOrderProducts.find(item => String(item.id) === String(actionEl.dataset.productId));
          if (product) {
            addProductToCart(product);
          }
          break;
        }
        case 'remove-cart-row':
          removeCartRow(actionEl);
          break;
        default:
          break;
      }
    });

    document.addEventListener('input', event => {
      const actionEl = event.target.closest('[data-action]');
      if (!actionEl) return;

      if (actionEl.dataset.action === 'cart-item-qty' || actionEl.dataset.action === 'cart-item-price') {
        updateEditTotal();
      }
    });

    document.addEventListener('change', event => {
      const actionEl = event.target.closest('[data-action]');
      if (!actionEl) return;

      if (actionEl.dataset.action === 'change-order-status') {
        changeOrderStatus(actionEl.dataset.orderId, actionEl.value);
        return;
      }

      if (actionEl.dataset.action === 'change-customer-tier') {
        changeCustomerTier(actionEl.dataset.customerId, actionEl.value);
        return;
      }

      if (actionEl.dataset.action === 'cart-item-qty' || actionEl.dataset.action === 'cart-item-price') {
        updateEditTotal();
      }
    });
  }

  async function checkAuth() {
    if (!window.NappanDB) {
      showToast('Supabase client no disponible', 'error');
      return;
    }

    const db = await getDb();
    const result = await db.getSession();
    if (result && result.session) {
      showDashboardShell();
      await loadOrders();
    }

    if (typeof db.onAuthStateChange === 'function') {
      db.onAuthStateChange(async (session, event) => {
        if (event === 'SIGNED_OUT' || !session) {
          showLoginShell();
          return;
        }

        showDashboardShell();
        if (!allOrders.length) {
          await loadOrders();
        }
      });
    }
  }

  setupAdminInteractions();
  checkAuth();

  // ---- PHASE 6: ESTADÍSTICAS (mejorado) ----

  // Helpers para fechas
  function getDateRange(type) {
    const today = new Date();
    let start, end;
    end = new Date(today.getFullYear(), today.getMonth(), today.getDate());

    if (type === 'week') {
      start = new Date(end);
      start.setDate(start.getDate() - 7);
    } else if (type === 'month') {
      start = new Date(today.getFullYear(), today.getMonth(), 1);
    } else if (type === 'prevMonth') {
      end = new Date(today.getFullYear(), today.getMonth(), 0);
      start = new Date(end.getFullYear(), end.getMonth(), 1);
    }
    return { start: start.toISOString().split('T')[0], end: end.toISOString().split('T')[0] };
  }

  function setQuickDateRange(type) {
    const range = getDateRange(type);
    document.getElementById('statsFrom').value = range.start;
    document.getElementById('statsTo').value = range.end;
    loadStats();
  }

  function resetStatsDate() {
    document.getElementById('statsFrom').value = '';
    document.getElementById('statsTo').value = '';
    document.getElementById('statsSection').value = '';
    document.getElementById('statsStatus').value = '';
    loadStats();
  }

  // Extrae productos reales del raw_cart
  function parseProducts(rawCart) {
    if (!rawCart) return [];
    try {
      const cart = typeof rawCart === 'string' ? JSON.parse(rawCart) : rawCart;

      // Si es un array (Lunch Box, Fit Bar, Eventos)
      if (Array.isArray(cart)) {
        return cart;
      }

      // Si es un objeto (Nappan Box - normal/premium)
      if (typeof cart === 'object' && cart.type) {
        return [{
          name: 'Nappan Box',
          icon: '🎨',
          type: cart.type,
          qty: 1
        }];
      }

      return [];
    } catch (e) {
      return [];
    }
  }

  async function loadStats() {
    try {
      const statsLoading = document.getElementById('statsLoading');
      const statsContent = document.getElementById('statsContent');
      const statsNoData = document.getElementById('statsNoData');

      // Mostrar loader
      statsLoading.style.display = 'block';
      statsContent.style.display = 'none';
      statsNoData.style.display = 'none';

      const fromVal   = document.getElementById('statsFrom').value;
      const toVal     = document.getElementById('statsTo').value;
      const sectionVal = document.getElementById('statsSection').value;
      const statusVal = document.getElementById('statsStatus').value;

      // Cargar todas las órdenes (usar caché si existen)
      if (allOrders.length === 0) {
        allOrders = await (await getDb()).loadAllOrders({});
      }

      if (allCustomers.length === 0) {
        allCustomers = await (await getDb()).loadCustomers({});
      }

      const customerById = {};
      const customerIdByPhone = {};
      allCustomers.forEach(customer => {
        customerById[customer.id] = customer;
        const phone = normalizePhone(customer.phone);
        if (phone && !customerIdByPhone[phone]) {
          customerIdByPhone[phone] = customer.id;
        }
      });

      const getStatsCustomerKey = (order) => {
        const phone = normalizePhone(order.customer_phone);
        return order.customer_id || customerIdByPhone[phone] || (phone ? 'phone:' + phone : (order.customer_name ? 'name:' + order.customer_name.trim().toLowerCase() : 'unknown'));
      };

      const getStatsCustomerLabel = (order) => {
        if (order.customer_id && customerById[order.customer_id]) {
          return customerById[order.customer_id].name || order.customer_name || order.customer_phone || 'Desconocido';
        }

        const phone = normalizePhone(order.customer_phone);
        if (phone && customerIdByPhone[phone] && customerById[customerIdByPhone[phone]]) {
          return customerById[customerIdByPhone[phone]].name || order.customer_name || order.customer_phone || 'Desconocido';
        }

        return order.customer_name || order.customer_phone || 'Desconocido';
      };

      // Filtrar en cliente (excluir pedidos eliminados y cancelados por defecto)
      let orders = allOrders.filter(o => o.status !== 'cancelled' && o.status !== 'deleted');
      if (fromVal) orders = orders.filter(o => o.created_at.slice(0,10) >= fromVal);
      if (toVal)   orders = orders.filter(o => o.created_at.slice(0,10) <= toVal);
      if (sectionVal) orders = orders.filter(o => o.section === sectionVal);
      if (statusVal) orders = orders.filter(o => o.status === statusVal);

      statsCache = { orders, date: new Date() };

      // Si no hay datos
      if (orders.length === 0) {
        statsLoading.style.display = 'none';
        statsNoData.style.display = 'block';
        return;
      }

      // KPIs
      const totalRevenue = orders.reduce((s, o) => s + (parseFloat(o.total) || 0), 0);
      const totalOrders  = orders.length;
      const avgTicket    = totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0;

      // Clientes recurrentes (contar de TODAS las órdenes válidas, excluyendo canceladas y eliminadas)
      let repeatCustomers = 0;
      const phoneCounts = {};
      allOrders.filter(o => o.status !== 'cancelled' && o.status !== 'deleted').forEach(o => {
        const key = getStatsCustomerKey(o);
        phoneCounts[key] = (phoneCounts[key] || 0) + 1;
      });
      repeatCustomers = Object.values(phoneCounts).filter(c => c > 1).length;

      // Actualizar KPIs
      document.getElementById('kpiRevenue').textContent = '$' + totalRevenue.toLocaleString('es-MX');
      document.getElementById('kpiOrders').textContent  = totalOrders;
      document.getElementById('kpiTicket').textContent  = '$' + avgTicket;
      document.getElementById('kpiRepeat').textContent  = repeatCustomers;

      // Calcular y mostrar badges comparativos
      if (fromVal || toVal) {
        const prevRange = getPreviousPeriod(fromVal, toVal);
        let prevOrders = allOrders.filter(o => o.status !== 'cancelled' && o.status !== 'deleted');
        prevOrders = prevOrders.filter(o => o.created_at.slice(0,10) >= prevRange.start && o.created_at.slice(0,10) <= prevRange.end);
        if (sectionVal) prevOrders = prevOrders.filter(o => o.section === sectionVal);
        if (statusVal) prevOrders = prevOrders.filter(o => o.status === statusVal);

        const prevRevenue = prevOrders.reduce((s, o) => s + (parseFloat(o.total) || 0), 0);
        const prevTicket  = prevOrders.length > 0 ? Math.round(prevRevenue / prevOrders.length) : 0;
        const prevOrdersCount = prevOrders.length;

        showKPIBadge('kpiBadgeRevenue', totalRevenue, prevRevenue);
        showKPIBadge('kpiBadgeOrders', totalOrders, prevOrdersCount);
        showKPIBadge('kpiBadgeTicket', avgTicket, prevTicket);
      }

      // --- CHART: Ventas por Sección ---
      const sections = {};
      orders.forEach(o => { sections[o.section || 'otro'] = (sections[o.section || 'otro'] || 0) + (parseFloat(o.total) || 0); });
      const secLabels = Object.keys(sections);
      const secData   = Object.values(sections);
      const sectionColors = ['#DAA520','#FFD93D','#A8E6CF','#FFB3C6','#B3E5FC'];
      if (chartSectionsInst) chartSectionsInst.destroy();
      chartSectionsInst = new Chart(document.getElementById('chartSections'), {
        type: 'doughnut',
        data: { labels: secLabels, datasets: [{ data: secData, backgroundColor: sectionColors.slice(0, secLabels.length), borderWidth: 0 }] },
        options: { maintainAspectRatio: true, plugins: { legend: { position: 'bottom', labels: { font: { family: 'Inter', size: 12 } } }, tooltip: { callbacks: { label: ctx => '$' + ctx.parsed.toLocaleString('es-MX') } } } }
      });

      // --- TOP PRODUCTS (productos reales) ---
      const prodMap = {};
      orders.forEach(o => {
        const prods = parseProducts(o.raw_cart);
        prods.forEach(p => {
          const name = p.name || p.producto || 'Producto sin nombre';
          if (!prodMap[name]) prodMap[name] = { count: 0, total: 0 };
          prodMap[name].count++;
          prodMap[name].total += (parseFloat(o.total) || 0) / prods.length; // Distribuir el total entre productos
        });
      });
      const sortedProds = Object.entries(prodMap).sort((a,b) => b[1].total - a[1].total).slice(0,5);
      const prodTbody = document.querySelector('#topProductsTable tbody');
      prodTbody.innerHTML = sortedProds.map(([ name, d ], i) =>
        `<tr><td><span class="rank-badge">${i+1}</span></td><td>${name}</td><td>${d.count}</td><td>$${d.total.toLocaleString('es-MX', {maximumFractionDigits: 0})}</td></tr>`
      ).join('') || '<tr><td colspan="4" style="color:#999;text-align:center;">Sin datos</td></tr>';

      // --- CHART: Ingresos por Día ---
      const dayMap = {};
      orders.forEach(o => {
        const day = (o.created_at || '').slice(0,10);
        if (day) dayMap[day] = (dayMap[day] || 0) + (parseFloat(o.total) || 0);
      });
      const sortedDays = Object.keys(dayMap).sort();
      const dayData = sortedDays.map(d => dayMap[d]);
      if (chartRevenueInst) chartRevenueInst.destroy();
      chartRevenueInst = new Chart(document.getElementById('chartRevenue'), {
        type: 'line',
        data: { labels: sortedDays, datasets: [{ label: 'Ingresos', data: dayData, borderColor: '#DAA520', backgroundColor: 'rgba(218,165,32,0.1)', tension: 0.4, fill: true, pointBackgroundColor: '#DAA520' }] },
        options: { maintainAspectRatio: true, plugins: { legend: { display: false }, tooltip: { callbacks: { label: ctx => '$' + ctx.parsed.y.toLocaleString('es-MX') } } }, scales: { y: { beginAtZero: true, ticks: { font: { family: 'Inter', size: 11 } }, grid: { color: 'rgba(0,0,0,0.05)' } }, x: { ticks: { font: { family: 'Inter', size: 11 } }, grid: { display: false } } } }
      });

      // --- CHART: Pedidos por Hora ---
      const hourMap = {};
      for (let h = 0; h < 24; h++) hourMap[h] = 0;
      orders.forEach(o => {
        const hour = new Date(o.created_at).getHours();
        hourMap[hour]++;
      });
      const hourLabels = Array.from({length:24}, (_, i) => `${i}h`);
      const hourData = Array.from({length:24}, (_, i) => hourMap[i]);
      if (chartHourlyInst) chartHourlyInst.destroy();
      chartHourlyInst = new Chart(document.getElementById('chartHourly'), {
        type: 'bar',
        data: { labels: hourLabels, datasets: [{ label: 'Pedidos', data: hourData, backgroundColor: '#B3E5FC', borderWidth: 0 }] },
        options: { indexAxis: 'y', maintainAspectRatio: true, plugins: { legend: { display: false } }, scales: { x: { beginAtZero: true, ticks: { stepSize: 1, font: { family: 'Inter', size: 11 } } } } }
      });

      // --- CHART: Estado de pedidos ---
      const statusMap = {};
      orders.forEach(o => { statusMap[o.status || 'pending'] = (statusMap[o.status || 'pending'] || 0) + 1; });
      const statusLabels = { pending:'Pendiente', confirmed:'Confirmado', in_progress:'En progreso', delivered:'Entregado', cancelled:'Cancelado' };
      const stKeys   = Object.keys(statusMap);
      const stData   = stKeys.map(k => statusMap[k]);
      const stLabels = stKeys.map(k => statusLabels[k] || k);
      const stColors = { pending:'#FFE5B4', confirmed:'#B3E5FC', in_progress:'#FFF9C4', delivered:'#C8E6C9', cancelled:'#FFCDD2' };
      if (chartStatusInst) chartStatusInst.destroy();
      chartStatusInst = new Chart(document.getElementById('chartStatus'), {
        type: 'bar',
        data: { labels: stLabels, datasets: [{ data: stData, backgroundColor: stKeys.map(k => stColors[k] || '#ddd'), borderWidth: 0 }] },
        options: { maintainAspectRatio: true, plugins: { legend: { display: false }, tooltip: { callbacks: { label: ctx => ctx.parsed.y + ' pedidos' } } }, scales: { y: { beginAtZero: true, ticks: { stepSize: 1, font: { family: 'Inter', size: 11 } }, grid: { color: 'rgba(0,0,0,0.05)' } }, x: { ticks: { font: { family: 'Inter', size: 11 } }, grid: { display: false } } } }
      });

      // --- TOP CUSTOMERS ---
      const custMap = {};
      orders.forEach(o => {
        const key = getStatsCustomerKey(o);
        if (!custMap[key]) {
          custMap[key] = {
            label: getStatsCustomerLabel(o),
            count: 0,
            total: 0
          };
        }
        custMap[key].count++;
        custMap[key].total += (parseFloat(o.total) || 0);
      });
      const sortedCusts = Object.entries(custMap).sort((a,b) => b[1].total - a[1].total).slice(0,5);
      const custTbody = document.querySelector('#topCustomersTable tbody');
      custTbody.innerHTML = sortedCusts.map(([ key, d ], i) =>
        `<tr><td><span class="rank-badge">${i+1}</span></td><td>${d.label}</td><td>${d.count}</td><td>$${d.total.toLocaleString('es-MX')}</td></tr>`
      ).join('') || '<tr><td colspan="4" style="color:#999;text-align:center;">Sin datos</td></tr>';

      // Ocultar loader y mostrar contenido
      statsLoading.style.display = 'none';
      statsContent.style.display = 'block';
      statsNoData.style.display = 'none';

    } catch (err) {
      console.error('loadStats error:', err);
      showToast('Error cargando estadísticas', 'error');
      document.getElementById('statsLoading').style.display = 'none';
      document.getElementById('statsNoData').style.display = 'block';
    }
  }

  // Calcula el período anterior para comparativa
  function getPreviousPeriod(startStr, endStr) {
    if (!startStr && !endStr) {
      // Comparar mes anterior vs mes actual
      const today = new Date();
      const endDate = new Date(today.getFullYear(), today.getMonth(), 0);
      const startDate = new Date(endDate.getFullYear(), endDate.getMonth(), 1);
      return { start: startDate.toISOString().split('T')[0], end: endDate.toISOString().split('T')[0] };
    }

    const start = new Date(startStr || '2000-01-01');
    const end = new Date(endStr || new Date());
    const duration = end - start;
    const prevEnd = new Date(start - 1);
    const prevStart = new Date(prevEnd - duration);
    return { start: prevStart.toISOString().split('T')[0], end: prevEnd.toISOString().split('T')[0] };
  }

  // Muestra badge comparativo en KPI
  function showKPIBadge(elementId, current, previous) {
    const badge = document.getElementById(elementId);
    if (previous === 0 && current === 0) {
      badge.style.display = 'none';
      return;
    }
    const pct = previous === 0 ? 100 : Math.round((current - previous) / previous * 100);
    const isUp = pct >= 0;
    badge.className = 'kpi-badge ' + (isUp ? 'up' : 'down');
    badge.textContent = (isUp ? '↑ +' : '↓ ') + Math.abs(pct) + '%';
    badge.style.display = 'inline-block';
  }

  // Exporta estadísticas a CSV
  function exportStatsCSV() {
    if (statsCache.orders.length === 0) {
      showToast('Sin datos para exportar', 'error');
      return;
    }

    const headers = ['Pedido', 'Cliente', 'Teléfono', 'Sección', 'Hora de Entrega', 'Total', 'Estado', 'Fecha'];
    const rows = [headers];

    statsCache.orders.forEach(order => {
      const date = new Date(order.created_at).toLocaleDateString('es-MX');
      const statusLabel = getStatusLabel(order.status);
      const deliveryTime = order.delivery_time || order.deliveryTime || '';
      const totalNumber = Number.parseFloat(order.total) || 0;
      rows.push([
        order.order_number || '',
        order.customer_name || '',
        order.customer_phone || '',
        order.section || '',
        deliveryTime,
        totalNumber.toFixed(2),
        statusLabel,
        date
      ]);
    });

    const csv = rows.map(r => r.map(cell => '"' + (cell || '').toString().replace(/"/g, '""') + '"').join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv; charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'estadisticas_' + new Date().toISOString().split('T')[0] + '.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast('✓ CSV exportado (' + statsCache.orders.length + ' pedidos)', 'success');
  }
  // ---- END PHASE 6 ----

  // Expose the handlers for any legacy consumers outside this script.
  Object.assign(window, {
    handleLogin,
    handleLogout,
    switchTabTo,
    // Orders tab
    applyOrderFilters,
    toggleOrderDetail,
    changeOrderStatus,
    confirmDeleteOrder,
    cancelDeleteConfirm,
    confirmDeleteFinal,
    recoverDeletedOrder,
    openEditOrder,
    closeEditOrder,
    saveEditOrder,
    addCartRow,
    showProductSelector,
    closeProductSelector,
    addProductToCart,
    updateCartItemName,
    updateCartItem,
    removeCartRow,
    nextPage,
    previousPage,
    exportOrdersCSV,
    // Products tab
    startEditProductPrice,
    confirmEditProductPrice,
    cancelEditProductPrice,
    // Customers tab
    showAddCustomerForm,
    hideAddCustomerForm,
    saveNewCustomer,
    startEditCustomer,
    confirmEditCustomer,
    cancelEditCustomer,
    deleteCustomerRow,
    // Config tab
    saveWhatsapp,
    saveShipping,
    saveTierDiscounts,
    saveExtras,
    saveGallery,
    // Stats tab
    loadStats,
    resetStatsDate,
    setQuickDateRange,
    exportStatsCSV,
  });
