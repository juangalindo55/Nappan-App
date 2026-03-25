function goTo(page) {
  if (
    page === 'nappan-lunchbox.html' ||
    page === 'nappan-box.html' ||
    page === 'nappan-fitbar.html'
  ) {
    window.location.href = page;
  } else {
    showComingSoon();
  }
}

function showComingSoon() {
  const toast = document.createElement('div');
  toast.style.cssText = `
    position:fixed; bottom:32px; left:50%; transform:translateX(-50%);
    background:#2D1B0E; color:#FFF8ED; padding:14px 28px;
    border-radius:50px; font-family:'Lora',serif; font-style:italic;
    font-size:14px; z-index:9999; white-space:nowrap;
    box-shadow:0 8px 32px rgba(0,0,0,0.4);
    border:1px solid rgba(255,217,61,0.3);
  `;
  toast.textContent = '✨ Próximamente disponible';
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 2500);
}
