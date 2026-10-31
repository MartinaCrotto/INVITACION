/* ==========================================================
   Solapa verde: se levanta sola con el primer gesto de scroll
   y no vuelve a bajar.
   ========================================================== */
(() => {
  'use strict';
  const html = document.documentElement;

  // Siempre arrancar arriba y con el scroll bloqueado
  if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
  window.scrollTo(0, 0);
  html.classList.add('bloqueado');

  document.addEventListener('DOMContentLoaded', () => {
    const portada = document.querySelector('.portada');
    if (!portada) { html.classList.remove('bloqueado'); return; }

    let abierta = false;
    let toqueY = null;

    const abrir = () => {
      if (abierta) return;
      abierta = true;
      document.removeEventListener('wheel', alRueda);
      document.removeEventListener('touchstart', alTocar);
      document.removeEventListener('touchmove', alDeslizar);
      document.removeEventListener('keydown', alTecla);
      portada.removeEventListener('click', abrir);

      portada.classList.add('sube');
      const fin = () => {
        html.classList.remove('bloqueado'); // desbloquea el scroll
        portada.hidden = true;               // la solapa ya no vuelve
      };
      portada.addEventListener('transitionend', fin, { once: true });
      setTimeout(fin, 2000); // por si el navegador no avisa que terminó
    };

    const alRueda = (e) => { if (e.deltaY > 0) abrir(); };
    const alTocar = (e) => { toqueY = e.touches[0].clientY; };
    const alDeslizar = (e) => {
      if (toqueY !== null && toqueY - e.touches[0].clientY > 10) abrir(); // deslizar hacia arriba
    };
    const alTecla = (e) => {
      if (['ArrowDown', 'PageDown', ' ', 'Enter'].includes(e.key)) { e.preventDefault(); abrir(); }
    };

    document.addEventListener('wheel', alRueda, { passive: true });
    document.addEventListener('touchstart', alTocar, { passive: true });
    document.addEventListener('touchmove', alDeslizar, { passive: true });
    document.addEventListener('keydown', alTecla);
    portada.addEventListener('click', abrir);
  });
})();


/* ---------- Cuenta regresiva ---------- */
(() => {
  document.addEventListener('DOMContentLoaded', () => {
    const seccion = document.querySelector('.cuenta');
    if (!seccion) return;

    const meta = new Date(seccion.dataset.fecha).getTime();
    const $ = (id) => document.getElementById(id);
    const pad = (n) => String(n).padStart(2, '0');
    const plural = (n, uno, varios) => (n === 1 ? uno : varios);

    function actualizar() {
      const ms = Math.max(0, meta - Date.now());
      const total = Math.floor(ms / 60000);
      const dias = Math.floor(total / 1440);
      const horas = Math.floor((total % 1440) / 60);
      const minutos = total % 60;

      $('cd-dias').textContent = dias;
      $('cd-horas').textContent = pad(horas);
      $('cd-minutos').textContent = pad(minutos);
      $('cd-dias-label').textContent = plural(dias, 'Día', 'Días');
      $('cd-horas-label').textContent = plural(horas, 'Hora', 'Horas');
      $('cd-minutos-label').textContent = plural(minutos, 'Minuto', 'Minutos');

      if (ms === 0) $('cuenta-titulo').textContent = '¡Llegó el día!';
    }

    actualizar();
    setInterval(actualizar, 1000);
  });
})();