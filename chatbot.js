// ============================================================
// NAPPAN CHATBOT — Simple & Global
// ============================================================

const CHATBOT_CONFIG = {
  position: 'bottom-right',
  primaryColor: '#DAA520',
  secondaryColor: '#FFD93D',
};

class NappanChatbot {
  constructor() {
    this.isOpen = false;
    this.messages = [];
    this.init();
  }

  init() {
    this.createBubble();
    this.createWidget();
    this.bindEvents();
  }

  createBubble() {
    const bubble = document.createElement('div');
    bubble.id = 'chatbot-bubble';
    bubble.innerHTML = `
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
      </svg>
      <span class="unread-badge" style="display:none;">1</span>
    `;
    document.body.appendChild(bubble);
  }

  createWidget() {
    const widget = document.createElement('div');
    widget.id = 'chatbot-widget';
    widget.innerHTML = `
      <div class="chat-header">
        <h3>Nappan Chat</h3>
        <button id="close-chat" aria-label="Cerrar chat">✕</button>
      </div>
      <div class="chat-messages" id="chat-messages"></div>
      <div class="chat-input-area">
        <input
          type="text"
          id="chat-input"
          placeholder="Escribe tu pregunta..."
          aria-label="Mensaje"
        />
        <button id="send-btn" aria-label="Enviar mensaje">→</button>
      </div>
    `;
    document.body.appendChild(widget);
  }

  bindEvents() {
    const bubble = document.getElementById('chatbot-bubble');
    const closeBtn = document.getElementById('close-chat');
    const sendBtn = document.getElementById('send-btn');
    const input = document.getElementById('chat-input');

    bubble.addEventListener('click', () => this.toggleChat());
    closeBtn.addEventListener('click', () => this.toggleChat());
    sendBtn.addEventListener('click', () => this.sendMessage());
    input.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') this.sendMessage();
    });
  }

  toggleChat() {
    this.isOpen = !this.isOpen;
    const widget = document.getElementById('chatbot-widget');
    const bubble = document.getElementById('chatbot-bubble');

    if (this.isOpen) {
      widget.classList.add('open');
      bubble.classList.add('active');
      document.getElementById('chat-input').focus();
      if (this.messages.length === 0) {
        this.showWelcome();
      }
    } else {
      widget.classList.remove('open');
      bubble.classList.remove('active');
    }
  }

  showWelcome() {
    this.addMessage('bot', '¡Hola! 👋 Bienvenido a Nappan. ¿En qué te puedo ayudar?');
    this.addQuickReplies([
      { text: '🥞 Lunch Box', action: 'lunch' },
      { text: '🎨 Nappan Box', action: 'box' },
      { text: '💪 Protein Fit Bar', action: 'fitbar' },
      { text: '📞 Contactar', action: 'contact' },
    ]);
  }

  sendMessage() {
    const input = document.getElementById('chat-input');
    const text = input.value.trim();

    if (!text) return;

    this.addMessage('user', text);
    input.value = '';

    // Simular respuesta del bot después de 500ms
    setTimeout(() => this.processMessage(text.toLowerCase()), 500);
  }

  processMessage(text) {
    let response = '';

    if (text.includes('precio') || text.includes('costo') || text.includes('cuánto')) {
      response = '💰 Los precios varían según el producto. Te recomiendo contactar directamente por WhatsApp para una cotización exacta.';
      this.addMessage('bot', response);
      this.addQuickReplies([
        { text: '📞 Hablar por WhatsApp', action: 'contact' },
        { text: '← Volver al menú', action: 'welcome' },
      ]);
    } else if (text.includes('personal') || text.includes('custom') || text.includes('personaliz')) {
      response = '🎨 Nappan Box es nuestro servicio de ultra personalización. Hacemos pancakes con arte realista de lo que tú elijas.';
      this.addMessage('bot', response);
      this.addQuickReplies([
        { text: '📞 Pedir mi Nappan Box', action: 'contact' },
        { text: '← Menú', action: 'welcome' },
      ]);
    } else if (text.includes('fit') || text.includes('proteína') || text.includes('saludable')) {
      response = '💪 Nuestro Protein Fit Bar tiene opciones fit: Power Pancakes, Protein Minis, Boost Shots y Coffee proteico.';
      this.addMessage('bot', response);
      this.addQuickReplies([
        { text: '🏋️ Ver menú Fit Bar', action: 'contact' },
        { text: '← Menú', action: 'welcome' },
      ]);
    } else if (text.includes('evento') || text.includes('vivo')) {
      response = '🎪 En Eventos en Vivo hacemos pancakes artísticos directamente en tu evento. Cada invitado recibe uno hecho al momento.';
      this.addMessage('bot', response);
      this.addQuickReplies([
        { text: '📞 Cotizar evento', action: 'contact' },
        { text: '← Menú', action: 'welcome' },
      ]);
    } else {
      response = '👋 Entiendo. ¿Hay algo más en lo que pueda ayudarte? Cuéntame qué buscas hoy.';
      this.addMessage('bot', response);
      this.addQuickReplies([
        { text: '← Volver al menú', action: 'welcome' },
      ]);
    }
  }

  addMessage(sender, text) {
    this.messages.push({ sender, text });
    const messagesDiv = document.getElementById('chat-messages');
    const msgEl = document.createElement('div');
    msgEl.className = `chat-message chat-${sender}`;
    msgEl.textContent = text;
    messagesDiv.appendChild(msgEl);
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
  }

  addQuickReplies(replies) {
    const messagesDiv = document.getElementById('chat-messages');
    const repliesContainer = document.createElement('div');
    repliesContainer.className = 'quick-replies';

    replies.forEach((reply) => {
      const btn = document.createElement('button');
      btn.className = 'quick-reply-btn';
      btn.textContent = reply.text;
      btn.addEventListener('click', () => this.handleQuickReply(reply.action));
      repliesContainer.appendChild(btn);
    });

    messagesDiv.appendChild(repliesContainer);
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
  }

  handleQuickReply(action) {
    if (action === 'welcome') {
      document.getElementById('chat-messages').innerHTML = '';
      this.messages = [];
      this.showWelcome();
    } else if (action === 'contact') {
      this.openWhatsApp();
    } else if (action === 'lunch') {
      this.processMessage('lunch box');
    } else if (action === 'box') {
      this.processMessage('nappan box personalizado');
    } else if (action === 'fitbar') {
      this.processMessage('protein fit bar');
    }
  }

  openWhatsApp() {
    // Usar WA_NUMBER de utils.js si existe
    const number = typeof WA_NUMBER !== 'undefined' ? WA_NUMBER : '528123509768';
    const message = encodeURIComponent('Hola Nappan, me gustaría saber más sobre sus productos y servicios.');
    window.open(`https://wa.me/${number}?text=${message}`, '_blank');
  }
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
  new NappanChatbot();
});
