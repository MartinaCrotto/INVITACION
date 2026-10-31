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


/* ---------- Datos bancarios (overlay) ---------- */
(() => {
  document.addEventListener('DOMContentLoaded', () => {
    const overlay = document.getElementById('overlay-banco');
    const abrirBtn = document.querySelector('[data-abrir-banco]');
    if (!overlay || !abrirBtn) return;

    const html = document.documentElement;
    let focoPrevio = null;

    const abrir = () => {
      focoPrevio = document.activeElement;
      overlay.hidden = false;
      html.classList.add('con-overlay');
      overlay.querySelector('.banco__cerrar').focus();
    };
    const cerrar = () => {
      overlay.hidden = true;
      html.classList.remove('con-overlay');
      if (focoPrevio && focoPrevio.focus) focoPrevio.focus();
    };

    abrirBtn.addEventListener('click', abrir);
    overlay.querySelector('.banco__cerrar').addEventListener('click', cerrar);
    overlay.addEventListener('click', (e) => { if (e.target === overlay) cerrar(); }); // clic afuera

    document.addEventListener('keydown', (e) => {
      if (overlay.hidden) return;
      if (e.key === 'Escape') cerrar();
      if (e.key === 'Tab') {                    // el foco no se escapa del cuadro
        const f = [...overlay.querySelectorAll('button')];
        const primero = f[0], ultimo = f[f.length - 1];
        if (e.shiftKey && document.activeElement === primero) { e.preventDefault(); ultimo.focus(); }
        else if (!e.shiftKey && document.activeElement === ultimo) { e.preventDefault(); primero.focus(); }
      }
    });

    /* Copiar alias / CBU */
    async function copiar(texto) {
      try { await navigator.clipboard.writeText(texto); }
      catch (_) {
        const t = document.createElement('textarea');
        t.value = texto; t.style.cssText = 'position:fixed;opacity:0';
        document.body.append(t); t.select();
        try { document.execCommand('copy'); } catch (__) {}
        t.remove();
      }
    }
    overlay.querySelectorAll('[data-copiar]').forEach((b) => {
      const original = b.textContent;
      b.addEventListener('click', async () => {
        await copiar(b.dataset.copiar);
        b.textContent = '¡copiado!';
        setTimeout(() => { b.textContent = original; }, 1500);
      });
    });
  });
})();

/* ---------- Lista de regalos (pantalla aparte: #lista-regalos) ---------- */
(() => {
  document.addEventListener('DOMContentLoaded', () => {
    const vista = document.getElementById('vista-regalos');
    const principal = document.querySelector('main');
    const grid = document.getElementById('regalos-grid');
    if (!vista || !principal || !grid) return;

    /* Armar las tarjetas desde js/regalos.js */
    const el = (tag, clase, texto) => {
      const n = document.createElement(tag);
      if (clase) n.className = clase;
      if (texto != null) n.textContent = texto;
      return n;
    };
    (typeof REGALOS !== 'undefined' ? REGALOS : []).forEach((g) => {
      const tarjeta = el(g.url ? 'a' : 'div', 'regalo');
      if (g.url) { tarjeta.href = g.url; tarjeta.target = '_blank'; tarjeta.rel = 'noopener'; }

      const foto = el('div', 'regalo__foto');
      if (g.imagen) {
        const img = el('img');
        img.src = g.imagen; img.alt = g.nombre; img.loading = 'lazy';
        foto.append(img);
      }
      const info = el('div', 'regalo__info');
      info.append(el('p', 'regalo__nombre', g.nombre), el('p', 'regalo__precio', g.precio));
      tarjeta.append(foto, info);
      grid.append(tarjeta);
    });

    /* Cambiar entre la invitación y la lista, recordando dónde estabas */
    let scrollGuardado = null;
    const irA = (y = 0) => window.scrollTo({ top: y, behavior: 'instant' });

    function ruta() {
      const enLista = location.hash === '#lista-regalos';
      if (enLista && vista.hidden) {
        scrollGuardado = window.scrollY;
        principal.hidden = true; vista.hidden = false;
        irA(0);
      } else if (!enLista && !vista.hidden) {
        vista.hidden = true; principal.hidden = false;
        if (scrollGuardado !== null) irA(scrollGuardado);
        else document.getElementById('regalos')?.scrollIntoView({ behavior: 'instant' });
      }
    }

    document.querySelector('[data-volver]').addEventListener('click', () => {
      if (scrollGuardado !== null) history.back(); else location.hash = '';
    });
    window.addEventListener('hashchange', ruta);
    ruta();
  });
})();


/* ---------- Botones sin link todavía: aviso "Disponible pronto" ---------- */
(() => {
  document.addEventListener('DOMContentLoaded', () => {
    const toast = document.getElementById('toast');
    if (!toast) return;
    let timer;
    document.addEventListener('click', (e) => {
      if (!e.target.closest('[data-pronto]')) return;
      e.preventDefault();
      toast.textContent = 'Disponible pronto';
      toast.classList.add('on');
      clearTimeout(timer);
      timer = setTimeout(() => toast.classList.remove('on'), 2200);
    });
  });
})();