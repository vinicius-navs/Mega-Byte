'use strict';

(() => {
  const root = document.documentElement;
  const themeButton = document.querySelector('.theme-toggle');
  const themeColor = document.querySelector('meta[name="theme-color"]');
  const systemTheme = window.matchMedia('(prefers-color-scheme: dark)');
  let preference = null;
  try {
    const saved = localStorage.getItem('megabyte-theme');
    if (saved === 'light' || saved === 'dark') preference = saved;
  } catch (_) { /* O site também funciona com o armazenamento bloqueado. */ }

  function setTheme(theme) {
    root.dataset.theme = theme;
    const dark = theme === 'dark';
    themeButton.setAttribute('aria-pressed', String(dark));
    themeButton.setAttribute('aria-label', dark ? 'Ativar tema claro' : 'Ativar tema escuro');
    themeButton.title = dark ? 'Ativar tema claro' : 'Ativar tema escuro';
    themeColor.content = dark ? '#121310' : '#f5f3ed';
  }

  setTheme(preference || (systemTheme.matches ? 'dark' : 'light'));
  themeButton.hidden = false;
  themeButton.addEventListener('click', () => {
    preference = root.dataset.theme === 'dark' ? 'light' : 'dark';
    setTheme(preference);
    try { localStorage.setItem('megabyte-theme', preference); } catch (_) {}
  });
  const handleSystemTheme = (event) => {
    if (!preference) setTheme(event.matches ? 'dark' : 'light');
  };
  if (systemTheme.addEventListener) systemTheme.addEventListener('change', handleSystemTheme);
  else if (systemTheme.addListener) systemTheme.addListener(handleSystemTheme);

  // Menu acessível. Sem JavaScript, a navegação continua visível.
  const menuButton = document.querySelector('.menu-toggle');
  const nav = document.querySelector('.main-nav');
  const header = document.querySelector('.site-header');
  const desktop = window.matchMedia('(min-width: 801px)');

  function setMenu(open, restoreFocus = false) {
    nav.classList.toggle('is-open', open);
    menuButton.setAttribute('aria-expanded', String(open));
    menuButton.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
    if (restoreFocus) menuButton.focus();
  }

  menuButton.hidden = false;
  root.classList.add('js');
  menuButton.addEventListener('click', () => setMenu(menuButton.getAttribute('aria-expanded') !== 'true'));
  nav.addEventListener('click', (event) => {
    const link = event.target.closest('a[href^="#"]');
    if (!link) return;
    const wasOpen = nav.classList.contains('is-open');
    setMenu(false);
    if (wasOpen) {
      const section = document.querySelector(link.getAttribute('href'));
      if (section) {
        section.setAttribute('tabindex', '-1');
        section.focus({ preventScroll: true });
        section.addEventListener('blur', () => section.removeAttribute('tabindex'), { once: true });
      }
    }
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && nav.classList.contains('is-open')) setMenu(false, true);
  });
  document.addEventListener('click', (event) => {
    if (!header.contains(event.target)) setMenu(false);
  });
  document.addEventListener('focusin', (event) => {
    if (!header.contains(event.target)) setMenu(false);
  });
  const closeOnDesktop = (event) => { if (event.matches) setMenu(false); };
  if (desktop.addEventListener) desktop.addEventListener('change', closeOnDesktop);
  else if (desktop.addListener) desktop.addListener(closeOnDesktop);

  // Abre uma mensagem no WhatsApp. Nenhum envio ou agendamento é automático.
  const form = document.getElementById('contact-form');
  const messageInput = document.getElementById('customer-message');
  messageInput.addEventListener('input', () => messageInput.setCustomValidity(''));
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const name = document.getElementById('customer-name').value.trim();
    const type = document.getElementById('customer-type').value;
    const service = document.getElementById('service').value;
    const details = messageInput.value.trim();
    if (!details) {
      messageInput.setCustomValidity('Conte um pouco sobre o atendimento que você precisa.');
      messageInput.reportValidity();
      return;
    }
    messageInput.setCustomValidity('');
    if (!form.reportValidity()) return;
    const lines = ['Olá, Mega Byte!'];
    if (name) lines.push(`Meu nome é ${name}.`);
    lines.push('', `Atendimento para: ${type}`, `Serviço: ${service}`, '', details, '', 'Podemos combinar uma retirada em Monte Carmelo?');
    const url = new URL('https://wa.me/5534988785335');
    url.searchParams.set('text', lines.join('\n'));
    window.location.assign(url.href);
  });

  document.getElementById('year').textContent = String(new Date().getFullYear());

  // Anima somente elementos abaixo da primeira dobra e respeita o sistema.
  const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const revealElements = [...document.querySelectorAll('.reveal')];
  let observer = null;
  function showAll() {
    if (observer) observer.disconnect();
    revealElements.forEach((element) => element.classList.remove('is-pending'));
  }
  if ('IntersectionObserver' in window && !motion.matches) {
    observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.remove('is-pending');
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.08 });
    revealElements.forEach((element) => {
      if (element.getBoundingClientRect().top < window.innerHeight) return;
      element.classList.add('is-pending');
      observer.observe(element);
    });
    const handleMotionChange = (event) => { if (event.matches) showAll(); };
    if (motion.addEventListener) motion.addEventListener('change', handleMotionChange);
    else if (motion.addListener) motion.addListener(handleMotionChange);
  }
  window.addEventListener('beforeprint', showAll);
})();
