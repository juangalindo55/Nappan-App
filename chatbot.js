// ============================================================
// NAPPAN CHATBOT — Simple & Global (estilos self-contained)
// ============================================================

(function () {

  // ── ESTILOS ────────────────────────────────────────────────
  const css = `
    #chatbot-bubble {
      position: fixed;
      bottom: 80px;
      right: 20px;
      width: 56px;
      height: 56px;
      background: #DAA520;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      z-index: 99999;
      box-shadow: 0 4px 16px rgba(218,165,32,0.45);
      transition: transform 0.25s ease, background 0.25s ease;
      color: #fff;
      border: none;
    }
    #chatbot-bubble:hover { transform: scale(1.1); }
    #chatbot-bubble.active { background: #1A1008; color: #DAA520; }
    #chatbot-bubble svg { pointer-events: none; }

    #chatbot-widget {
      position: fixed;
      bottom: 148px;
      right: 20px;
      width: 340px;
      max-width: calc(100vw - 24px);
      height: 480px;
      max-height: calc(100vh - 200px);
      background: #fff;
      border-radius: 16px;
      box-shadow: 0 12px 48px rgba(0,0,0,0.18);
      display: flex;
      flex-direction: column;
      opacity: 0;
      transform: translateY(16px) scale(0.96);
      pointer-events: none;
      transition: opacity 0.25s ease, transform 0.25s ease;
      z-index: 99998;
      overflow: hidden;
      font-family: 'Inter', -apple-system, sans-serif;
    }
    #chatbot-widget.open {
      opacity: 1;
      transform: translateY(0) scale(1);
      pointer-events: auto;
    }

    .nap-chat-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 14px 16px;
      background: #1A1008;
      border-bottom: 2px solid #DAA520;
    }
    .nap-chat-header h3 {
      margin: 0;
      font-size: 15px;
      font-weight: 600;
      color: #FFF8ED;
      font-family: 'Inter', sans-serif;
      letter-spacing: 0.3px;
    }
    .nap-chat-header button {
      background: none;
      border: none;
      color: #FFF8ED;
      font-size: 18px;
      cursor: pointer;
      line-height: 1;
      padding: 2px 6px;
      border-radius: 4px;
      transition: color 0.2s;
    }
    .nap-chat-header button:hover { color: #DAA520; }

    #chat-messages {
      flex: 1;
      overflow-y: auto;
      padding: 14px 12px;
      display: flex;
      flex-direction: column;
      gap: 10px;
      background: #fafafa;
    }
    .chat-message {
      font-size: 14px;
      line-height: 1.5;
      padding: 10px 12px;
      border-radius: 10px;
      max-width: 82%;
      word-break: break-word;
      font-family: 'Inter', sans-serif;
    }
    .chat-bot {
      align-self: flex-start;
      background: #fff;
      color: #2D1B0E;
      border: 1px solid #eee;
      border-radius: 4px 10px 10px 10px;
    }
    .chat-user {
      align-self: flex-end;
      background: #DAA520;
      color: #fff;
      border-radius: 10px 4px 10px 10px;
    }

    .quick-replies {
      display: flex;
      flex-direction: column;
      gap: 6px;
      margin-top: 2px;
    }
    .quick-reply-btn {
      padding: 9px 12px;
      background: #fff;
      border: 1px solid #ddd;
      border-radius: 8px;
      font-size: 13px;
      font-weight: 500;
      font-family: 'Inter', sans-serif;
      cursor: pointer;
      text-align: left;
      transition: background 0.2s, border-color 0.2s, color 0.2s;
    }
    .quick-reply-btn:hover {
      background: #DAA520;
      border-color: #DAA520;
      color: #fff;
    }

    .nap-chat-input-area {
      display: flex;
      gap: 8px;
      padding: 10px 12px;
      background: #f0f0f0;
      border-top: 1px solid #e0e0e0;
    }
    #chat-input {
      flex: 1;
      padding: 9px 12px;
      border: 1px solid #ccc;
      border-radius: 8px;
      font-size: 14px;
      font-family: 'Inter', sans-serif;
      outline: none;
      background: #fff;
      color: #2D1B0E;
    }
    #chat-input:focus { border-color: #DAA520; }
    #send-btn {
      padding: 9px 14px;
      background: #DAA520;
      border: none;
      border-radius: 8px;
      color: #fff;
      font-size: 16px;
      font-weight: 700;
      cursor: pointer;
      transition: background 0.2s, transform 0.15s;
    }
    #send-btn:hover { background: #1A1008; transform: translateY(-1px); }
    #send-btn:active { transform: translateY(0); }

    @media (max-width: 480px) {
      #chatbot-bubble { bottom: 88px; right: 16px; }
      #chatbot-widget { bottom: 156px; right: 8px; max-width: calc(100vw - 16px); }
    }
  `;

  const styleEl = document.createElement('style');
  styleEl.textContent = css;
  document.head.appendChild(styleEl);

  // ── CONFIGURACIÓN ──────────────────────────────────────────
  const GOOGLE_MAPS_API_KEY = 'AIzaSyBnpclaToCM90xqFNsEtWWJFWwJGyAMJcA';
  const ORIGIN_ADDRESS = 'Caparroso 5609, Cumbres, Monterrey, 64349, Mexico';

  // ── CLASE CHATBOT ──────────────────────────────────────────
  class NappanChatbot {
    constructor() {
      this.isOpen = false;
      this.messages = [];
      this.waitingForCP = false; // Estado para esperar código postal
      this.createBubble();
      this.createWidget();
      this.bindEvents();
    }

    createBubble() {
      const bubble = document.createElement('div');
      bubble.id = 'chatbot-bubble';
      bubble.setAttribute('role', 'button');
      bubble.setAttribute('aria-label', 'Abrir chat');
      bubble.innerHTML = `
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none"
             stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
        </svg>`;
      document.body.appendChild(bubble);
    }

    createWidget() {
      const widget = document.createElement('div');
      widget.id = 'chatbot-widget';
      widget.innerHTML = `
        <div class="nap-chat-header">
          <h3>Nappan Chat</h3>
          <button id="close-chat" aria-label="Cerrar chat">✕</button>
        </div>
        <div id="chat-messages"></div>
        <div class="nap-chat-input-area">
          <input type="text" id="chat-input" placeholder="Escribe tu pregunta..." aria-label="Mensaje" autocomplete="off"/>
          <button id="send-btn" aria-label="Enviar">→</button>
        </div>`;
      document.body.appendChild(widget);
    }

    bindEvents() {
      document.getElementById('chatbot-bubble').addEventListener('click', () => this.toggleChat());
      document.getElementById('close-chat').addEventListener('click', () => this.toggleChat());
      document.getElementById('send-btn').addEventListener('click', () => this.sendMessage());
      document.getElementById('chat-input').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') this.sendMessage();
      });
      this.loadGoogleMapsSDK();
    }

    loadGoogleMapsSDK() {
      if (window.google && window.google.maps) return;
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places`;
      script.async = true;
      script.defer = true;
      document.head.appendChild(script);
    }

    toggleChat() {
      this.isOpen = !this.isOpen;
      document.getElementById('chatbot-widget').classList.toggle('open', this.isOpen);
      document.getElementById('chatbot-bubble').classList.toggle('active', this.isOpen);
      if (this.isOpen) {
        document.getElementById('chat-input').focus();
        if (this.messages.length === 0) this.showWelcome();
      }
    }

    showWelcome() {
      this.addMessage('bot', '¡Hola! 👋 Bienvenido a Nappan. ¿En qué te puedo ayudar?');
      this.addQuickReplies([
        { text: '🥞 Lunch Box', action: 'lunch' },
        { text: '🎨 Nappan Box', action: 'box' },
        { text: '💪 Protein Fit Bar', action: 'fitbar' },
        { text: '🚚 Calcular Envío', action: 'shipping' },
        { text: '📞 Contactar', action: 'contact' },
      ]);
    }

    sendMessage() {
      const input = document.getElementById('chat-input');
      const text = input.value.trim();
      if (!text) return;
      this.addMessage('user', text);
      input.value = '';

      if (this.waitingForCP) {
        this.waitingForCP = false;
        setTimeout(() => this.handleShipping(text), 450);
      } else {
        setTimeout(() => this.processMessage(text.toLowerCase()), 450);
      }
    }

    processMessage(text) {
      if (text.includes('precio') || text.includes('costo') || text.includes('cuánto') || text.includes('cuanto')) {
        this.addMessage('bot', '💰 Los precios varían según el producto. Te recomiendo contactar directamente por WhatsApp para una cotización exacta.');
        this.addQuickReplies([
          { text: '📞 Hablar por WhatsApp', action: 'contact' },
          { text: '← Volver al menú', action: 'welcome' },
        ]);
      } else if (text.includes('personal') || text.includes('custom') || text.includes('nappan box')) {
        this.addMessage('bot', '🎨 Nappan Box es nuestro servicio de ultra personalización. Hacemos pancakes con arte realista de lo que tú elijas.');
        this.addQuickReplies([
          { text: '📞 Pedir mi Nappan Box', action: 'contact' },
          { text: '← Menú', action: 'welcome' },
        ]);
      } else if (text.includes('fit') || text.includes('proteína') || text.includes('proteina') || text.includes('saludable')) {
        this.addMessage('bot', '💪 Nuestro Protein Fit Bar tiene opciones fit: Power Pancakes, Protein Minis, Boost Shots y Coffee proteico.');
        this.addQuickReplies([
          { text: '🏋️ Ver menú Fit Bar', action: 'contact' },
          { text: '← Menú', action: 'welcome' },
        ]);
      } else if (text.includes('evento') || text.includes('vivo') || text.includes('lunch')) {
        this.addMessage('bot', '🎪 En Eventos en Vivo hacemos pancakes artísticos directamente en tu evento. Cada invitado recibe uno hecho al momento.');
        this.addQuickReplies([
          { text: '📞 Cotizar evento', action: 'contact' },
          { text: '← Menú', action: 'welcome' },
        ]);
      } else if (text.includes('envío') || text.includes('envio') || text.includes('distancia') || text.includes('domicilio')) {
        this.handleQuickReply('shipping');
      } else {
        this.addMessage('bot', '👋 Entiendo. ¿Hay algo más en lo que pueda ayudarte? Cuéntame qué buscas hoy.');
        this.addQuickReplies([{ text: '← Volver al menú', action: 'welcome' }]);
      }
    }

    addMessage(sender, text) {
      this.messages.push({ sender, text });
      const div = document.createElement('div');
      div.className = `chat-message chat-${sender}`;
      div.textContent = text;
      const msgs = document.getElementById('chat-messages');
      msgs.appendChild(div);
      msgs.scrollTop = msgs.scrollHeight;
    }

    addQuickReplies(replies) {
      const container = document.createElement('div');
      container.className = 'quick-replies';
      replies.forEach(({ text, action }) => {
        const btn = document.createElement('button');
        btn.className = 'quick-reply-btn';
        btn.textContent = text;
        btn.addEventListener('click', () => this.handleQuickReply(action));
        container.appendChild(btn);
      });
      const msgs = document.getElementById('chat-messages');
      msgs.appendChild(container);
      msgs.scrollTop = msgs.scrollHeight;
    }

    handleQuickReply(action) {
      const map = {
        welcome: () => { document.getElementById('chat-messages').innerHTML = ''; this.messages = []; this.showWelcome(); },
        contact: () => this.openWhatsApp(),
        lunch: () => this.processMessage('lunch'),
        box: () => this.processMessage('nappan box'),
        fitbar: () => this.processMessage('fit'),
        shipping: () => {
          this.waitingForCP = true;
          this.addMessage('bot', '🚚 ¡Claro! Por favor, ingresa tu código postal (CP) de Monterrey para calcular el costo de envío.');
        }
      };
      (map[action] || map.welcome)();
    }

    async handleShipping(cp) {
      if (!/^\d{5}$/.test(cp)) {
        this.addMessage('bot', '❌ El código postal debe ser de 5 números. Por favor, intenta de nuevo.');
        this.waitingForCP = true;
        return;
      }

      this.addMessage('bot', 'Calculando distancia... 🔄');

      try {
        const distance = await this.fetchDistance(cp);
        if (distance === null) throw new Error('No distance');

        const cost = this.calculateShippingCost(distance);
        if (cost === null) {
          this.addMessage('bot', `📍 La distancia calculada es de ${distance.toFixed(1)} km. Lamentablemente, queda fuera de nuestra cobertura actual (máximo 45 km).`);
          this.addQuickReplies([{ text: '← Ver menú', action: 'welcome' }]);
        } else {
          this.addMessage('bot', `✅ La distancia es de ${distance.toFixed(1)} km. El costo de envío para tu zona es de: $${cost} MXN.`);
          this.addQuickReplies([
            { text: '🛒 Pedir por WhatsApp', action: 'contact' },
            { text: '← Volver al menú', action: 'welcome' },
          ]);
        }
      } catch (error) {
        console.error('Error calculando envío:', error);
        this.addMessage('bot', '⚠️ Hubo un detalle al calcular la distancia. Por favor, asegúrate de que sea un CP válido en Monterrey o intenta más tarde.');
        this.addQuickReplies([{ text: '← Reintentar', action: 'shipping' }]);
      }
    }

    async fetchDistance(destinationCP) {
      return new Promise((resolve) => {
        // Fallback de 5 segundos para evitar que el chat se quede colgado
        const timeout = setTimeout(() => {
          console.error('Distance Matrix timeout');
          resolve(null);
        }, 5000);

        if (!window.google || !window.google.maps) {
          clearTimeout(timeout);
          console.error('Google Maps SDK no cargado');
          return resolve(null);
        }

        try {
          const service = new google.maps.DistanceMatrixService();
          service.getDistanceMatrix({
            origins: [ORIGIN_ADDRESS],
            destinations: [`${destinationCP}, Monterrey, NL, Mexico`],
            travelMode: google.maps.TravelMode.DRIVING,
            unitSystem: google.maps.UnitSystem.METRIC,
          }, (response, status) => {
            clearTimeout(timeout);
            try {
              if (status === 'OK' && response && response.rows && response.rows[0] && response.rows[0].elements && response.rows[0].elements[0].status === 'OK') {
                const distanceMeters = response.rows[0].elements[0].distance.value;
                resolve(distanceMeters / 1000);
              } else {
                console.error('Error de Distance Matrix:', status, response);
                resolve(null);
              }
            } catch (err) {
              console.error('Error procesando Matrix:', err);
              resolve(null);
            }
          });
        } catch (err) {
          clearTimeout(timeout);
          console.error('Excepción al instanciar DistanceMatrix:', err);
          resolve(null);
        }
      });
    }

    calculateShippingCost(km) {
      if (km <= 3) return 50;
      if (km <= 8) return 85;
      if (km <= 15) return 130;
      if (km <= 20) return 150;
      if (km <= 45) return 200;
      return null;
    }

    openWhatsApp() {
      const number = typeof WA_NUMBER !== 'undefined' ? WA_NUMBER : '528123509768';
      const msg = encodeURIComponent('Hola Nappan, me gustaría saber más sobre sus productos y servicios.');
      window.open(`https://wa.me/${number}?text=${msg}`, '_blank');
    }
  }

  // ── INIT ───────────────────────────────────────────────────
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => new NappanChatbot());
  } else {
    new NappanChatbot();
  }

})();
