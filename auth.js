(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  // Misma función RPC y clave pública utilizadas por los simuladores Movida SST.
  // La clave publishable NO es una clave de servicio ni concede acceso a expedientes.
  const API_URL = 'https://lfdmbkzghnwvsapxypvt.supabase.co';
  const API_KEY = 'sb_publishable_bRnkA6PA8-v073nrw9zxiQ_8rVGiOn1';
  const SESSION_KEY = 'movida-sst-contratistas-session';
  const ATTEMPT_KEY = 'movida-sst-contratistas-attempts';
  const DURATION_MS = 20 * 60 * 1000;
  const BLOCK_MS = 15 * 60 * 1000;
  const MAX_ATTEMPTS = 5;
  let expiryTimer;

  function stored(storage, key, fallback) {
    try { return JSON.parse(storage.getItem(key) || 'null') || fallback; }
    catch (_) { return fallback; }
  }
  function message(text, success = false) {
    const box = $('loginMessage');
    box.textContent = text;
    box.classList.toggle('success', success);
  }
  function attempts() {
    const a = stored(localStorage, ATTEMPT_KEY, { count: 0, blockedUntil: 0 });
    if (a.blockedUntil && a.blockedUntil <= Date.now()) {
      localStorage.removeItem(ATTEMPT_KEY);
      return { count: 0, blockedUntil: 0 };
    }
    return a;
  }
  function blockedMessage(until) {
    const n = Math.max(1, Math.ceil((until - Date.now()) / 60000));
    return 'Demasiados intentos. Vuelve a intentar en ' + n + ' minuto(s).';
  }
  function failedAttempt() {
    const a = attempts();
    a.count++;
    if (a.count >= MAX_ATTEMPTS) {
      a.count = 0;
      a.blockedUntil = Date.now() + BLOCK_MS;
    }
    localStorage.setItem(ATTEMPT_KEY, JSON.stringify(a));
    return a.blockedUntil ? blockedMessage(a.blockedUntil) : 'Datos no válidos. Intentos restantes: ' + (MAX_ATTEMPTS - a.count) + '.';
  }
  async function namespaceFor(cedula) {
    if (!crypto?.subtle) throw new Error('La conexión debe utilizar HTTPS.');
    const bytes = await crypto.subtle.digest('SHA-256', new TextEncoder().encode('movidasst/contratistas/' + cedula));
    return 'movidasst_contratistas_v2_' + Array.from(new Uint8Array(bytes), b => b.toString(16).padStart(2, '0')).join('');
  }
  async function validateMember(cedula, codigo) {
    const controller = new AbortController();
    const t = setTimeout(() => controller.abort(), 15000);
    try {
      const response = await fetch(API_URL + '/rest/v1/rpc/acceso_integrante', {
        method: 'POST', mode: 'cors', credentials: 'omit', cache: 'no-store',
        signal: controller.signal,
        headers: { apikey: API_KEY, Authorization: 'Bearer ' + API_KEY, 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ p_cedula: cedula, p_codigo: codigo })
      });
      if (!response.ok) throw new Error('HTTP ' + response.status);
      const payload = await response.json();
      const member = Array.isArray(payload) ? payload[0] : payload;
      return member && typeof member === 'object' && !Array.isArray(member) ? member : null;
    } finally { clearTimeout(t); }
  }
  function showGate(note = '') {
    clearTimeout(expiryTimer);
    sessionStorage.removeItem(SESSION_KEY);
    $('app').hidden = true;
    $('app').setAttribute('aria-hidden', 'true');
    $('loginGate').hidden = false;
    document.body.classList.add('auth-locked');
    window.dispatchEvent(new Event('movida:integrante-salio'));
    $('memberLogin').reset();
    message(note);
    $('memberId').focus({ preventScroll: true });
  }
  function openApplication(session, persist = true) {
    if (!/^movidasst_contratistas_v2_[0-9a-f]{64}$/.test(session?.namespace || '') || session.expiresAt <= Date.now()) {
      showGate('Debes validar de nuevo tus credenciales.');
      return;
    }
    if (persist) sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
    $('memberName').textContent = session.name;
    $('loginGate').hidden = true;
    $('app').hidden = false;
    $('app').setAttribute('aria-hidden', 'false');
    document.body.classList.remove('auth-locked');
    window.dispatchEvent(new CustomEvent('movida:integrante-autenticado', { detail: { storageKey: session.namespace } }));
    clearTimeout(expiryTimer);
    expiryTimer = setTimeout(() => showGate('Tu sesión de 20 minutos finalizó. Ingresa nuevamente.'), Math.max(0, session.expiresAt - Date.now()));
  }
  async function submitLogin(event) {
    event.preventDefault();
    const cedula = $('memberId').value.replace(/\D/g, '');
    const codigo = $('memberPassword').value.trim();
    const status = attempts();
    if (status.blockedUntil > Date.now()) return message(blockedMessage(status.blockedUntil));
    if (!cedula || !codigo) return message('Escribe tu cédula y tu clave para continuar.');
    const button = $('loginSubmit');
    button.disabled = true;
    message('Validando tus datos con el registro de integrantes…', true);
    try {
      const member = await validateMember(cedula, codigo);
      if (!member) {
        $('memberPassword').value = '';
        return message(failedAttempt());
      }
      const namespace = await namespaceFor(cedula);
      const name = [member.nombres, member.apellidos].filter(Boolean).join(' ').trim() || member.nombre || 'Integrante';
      localStorage.removeItem(ATTEMPT_KEY);
      $('memberLogin').reset();
      openApplication({ namespace, name, expiresAt: Date.now() + DURATION_MS });
    } catch (error) {
      console.error('No fue posible verificar acceso de integrante', error);
      message(error?.name === 'AbortError' ? 'El servicio tardó demasiado. Intenta nuevamente.' : 'No fue posible validar el acceso. Revisa tu conexión.');
    } finally { button.disabled = false; }
  }
  function init() {
    $('memberLogin').addEventListener('submit', submitLogin);
    $('togglePassword').addEventListener('click', () => {
      const field = $('memberPassword'), open = field.type === 'password';
      field.type = open ? 'text' : 'password';
      $('togglePassword').textContent = open ? 'Ocultar' : 'Mostrar';
      $('togglePassword').setAttribute('aria-pressed', String(open));
    });
    $('logoutBtn').addEventListener('click', () => showGate('Sesión cerrada correctamente.'));
    $('logoutSidebar').addEventListener('click', () => showGate('Sesión cerrada correctamente.'));
    const previous = stored(sessionStorage, SESSION_KEY, null);
    if (previous?.expiresAt > Date.now()) openApplication(previous, false);
    else showGate();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
  else init();
})();