// Login simples, feito 100% no navegador.
// A senha nunca é salva: guardamos só um "hash" (PBKDF2 + sal) no localStorage deste navegador.
const Auth = (() => {
  const AUTH_KEY = 'hubPrompts.auth';
  const SESSION_KEY = 'hubPrompts.session';

  const toHex = buf => [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2, '0')).join('');
  const fromHex = hex => new Uint8Array(hex.match(/.{2}/g).map(h => parseInt(h, 16)));

  function store(kind) {
    try { const s = window[kind]; s.getItem('x'); return s; } catch (e) { return null; }
  }
  const local = store('localStorage');
  const session = store('sessionStorage');

  async function derive(password, saltHex) {
    const enc = new TextEncoder();
    const key = await crypto.subtle.importKey('raw', enc.encode(password), 'PBKDF2', false, ['deriveBits']);
    const bits = await crypto.subtle.deriveBits(
      { name: 'PBKDF2', salt: fromHex(saltHex), iterations: 150000, hash: 'SHA-256' }, key, 256);
    return toHex(bits);
  }

  function getAuth() {
    try { return JSON.parse(local && local.getItem(AUTH_KEY)); } catch (e) { return null; }
  }

  return {
    supported: () => !!(window.crypto && crypto.subtle) && !!local,
    hasAccount: () => !!getAuth(),
    user: () => (getAuth() || {}).user || '',

    async register(user, password) {
      const salt = toHex(crypto.getRandomValues(new Uint8Array(16)));
      const hash = await derive(password, salt);
      local.setItem(AUTH_KEY, JSON.stringify({ user, salt, hash }));
    },

    async login(user, password, remember) {
      const a = getAuth();
      if (!a || a.user.toLowerCase() !== user.trim().toLowerCase()) return false;
      if (await derive(password, a.salt) !== a.hash) return false;
      const token = a.hash.slice(0, 32);
      (remember ? local : session).setItem(SESSION_KEY, token);
      return true;
    },

    isLoggedIn() {
      const a = getAuth();
      if (!a) return false;
      const t = (session && session.getItem(SESSION_KEY)) || (local && local.getItem(SESSION_KEY));
      return t === a.hash.slice(0, 32);
    },

    requireLogin() {
      if (!this.isLoggedIn()) location.replace('index.html');
    },

    logout() {
      session && session.removeItem(SESSION_KEY);
      local && local.removeItem(SESSION_KEY);
      location.replace('index.html');
    },

    // "Esqueci a senha": apaga a conta E os prompts deste navegador,
    // senão qualquer pessoa poderia resetar a senha e ver tudo.
    resetAccount() {
      local.removeItem(AUTH_KEY);
      local.removeItem('hubPrompts.v1');
      local.removeItem(SESSION_KEY);
      session && session.removeItem(SESSION_KEY);
    }
  };
})();
