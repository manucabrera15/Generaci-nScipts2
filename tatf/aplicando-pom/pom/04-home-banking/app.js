/* =========================================================
   Banco Rambla - home banking para practicar Page Object Model
   Datos útiles para las pruebas:
   - Login válido: CI 12345678 / Rambla2026
   - Usuario bloqueado: CI 87654321 (cualquier clave)
   - 3 intentos fallidos seguidos bloquean el acceso (se resetea recargando).
   - Token de transferencia: 246810 (3 errores cancelan la operación).
   - Límite diario por transferencia: $ 50.000 / US$ 1.500.
   - Sesión de 5 minutos. Para probar el aviso de vencimiento rápido,
     abrir con ?sesion=40 (duración en segundos).
   ========================================================= */

const USER = { doc: '12345678', password: 'Rambla2026', name: 'Lucía Martínez' };
const BLOCKED_DOC = '87654321';
const LIMITS = { UYU: 50000, USD: 1500 };
const TOKEN = '246810';

const accounts = [
  { id: 'ca-uyu', type: 'Caja de ahorro', currency: 'UYU', number: '0012345678', balance: 48750 },
  { id: 'cc-uyu', type: 'Cuenta corriente', currency: 'UYU', number: '0012349999', balance: 15200.5 },
  { id: 'ca-usd', type: 'Caja de ahorro', currency: 'USD', number: '0098765432', balance: 2340 },
];
const contacts = [
  { name: 'María López', number: '1122334455', currency: 'UYU' },
  { name: 'Inmobiliaria Sur', number: '5566778899', currency: 'UYU' },
  { name: 'Pedro Acosta', number: '9988776655', currency: 'USD' },
];

const $ = (s) => document.querySelector(s);
const $$ = (s) => [...document.querySelectorAll(s)];
const fmt = (n, cur) => (cur === 'USD' ? 'US$ ' : '$ ') + n.toLocaleString('es-UY', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const localISO = (d) => new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
const accById = (id) => accounts.find((a) => a.id === id);

/* ---------------- Movimientos precargados (determinísticos) ---------------- */
const DESCS = [['Sueldo', 'credito'], ['Supermercado Tienda Inglesa', 'debito'], ['UTE factura', 'debito'], ['OSE factura', 'debito'],
  ['Transferencia recibida', 'credito'], ['Farmacia', 'debito'], ['Antel', 'debito'], ['Reintegro IVA', 'credito'], ['Combustible', 'debito'], ['Restaurante', 'debito']];
let movements = [];
(function seedMovements() {
  let s = 7;
  const rnd = () => { s = (s * 9301 + 49297) % 233280; return s / 233280; };
  for (let i = 0; i < 48; i++) {
    const acc = accounts[i % 3 === 2 ? 2 : Math.floor(rnd() * 2)];
    const [desc, kind] = DESCS[Math.floor(rnd() * DESCS.length)];
    const d = new Date(); d.setDate(d.getDate() - Math.floor(i * 1.8));
    const base = acc.currency === 'USD' ? 20 + rnd() * 300 : 300 + rnd() * 9000;
    const amt = Math.round((desc === 'Sueldo' ? base * 6 : base) * 100) / 100;
    movements.push({ date: localISO(d), desc, account: acc.id, amount: kind === 'credito' ? amt : -amt });
  }
})();

/* ---------------- Login ---------------- */
let failed = 0;
try { const saved = localStorage.getItem('rambla-doc'); if (saved) { $('#docNumber').value = saved; $('#remember').checked = true; } } catch (e) { /* sin storage */ }

$('#togglePw').addEventListener('click', () => {
  const pw = $('#password');
  const show = pw.type === 'password';
  pw.type = show ? 'text' : 'password';
  $('#togglePw').textContent = show ? 'Ocultar' : 'Ver';
  $('#togglePw').setAttribute('aria-label', show ? 'Ocultar contraseña' : 'Mostrar contraseña');
});

function loginError(msg) { const e = $('#loginError'); e.textContent = msg; e.classList.remove('hidden'); }

$('#loginForm').addEventListener('submit', (e) => {
  e.preventDefault();
  $('#loginError').classList.add('hidden');
  const doc = $('#docNumber').value.trim();
  const pw = $('#password').value;
  if (failed >= 3) return loginError('Tu usuario quedó bloqueado por intentos fallidos. Comunicate al 1996.');
  if (!doc || !pw) return loginError('Completá documento y contraseña.');
  if ($('#docType').value === 'ci' && !/^\d{7,8}$/.test(doc)) return loginError('La cédula debe tener 7 u 8 dígitos, sin puntos ni guion.');

  const btn = $('#loginBtn');
  btn.disabled = true; btn.textContent = 'Ingresando…';
  setTimeout(() => {
    btn.disabled = false; btn.textContent = 'Ingresar';
    if (doc === BLOCKED_DOC) return loginError('Este usuario está bloqueado. Comunicate al 1996.');
    if (doc !== USER.doc || pw !== USER.password) {
      failed++;
      if (failed >= 3) { btn.disabled = true; return loginError('Tu usuario quedó bloqueado por intentos fallidos. Comunicate al 1996.'); }
      return loginError(`Documento o contraseña incorrectos. Te quedan ${3 - failed} intento${3 - failed === 1 ? '' : 's'}.`);
    }
    failed = 0;
    try { $('#remember').checked ? localStorage.setItem('rambla-doc', doc) : localStorage.removeItem('rambla-doc'); } catch (err) { /* sin storage */ }
    enterApp();
  }, 700);
});

function enterApp() {
  $('#loginScreen').classList.remove('active');
  $('#appScreen').classList.add('active');
  $('#welcome').textContent = `Hola, ${USER.name}`;
  switchTab('accounts');
  renderAccounts(); fillTransferSelects(); fillHistoryFilters(); renderHistory();
  startSession();
}

function logout(reason) {
  stopSession();
  $$('dialog[open]').forEach((d) => d.close());
  $('#appScreen').classList.remove('active');
  $('#loginScreen').classList.add('active');
  $('#password').value = '';
  if (reason) loginError(reason); else $('#loginError').classList.add('hidden');
}
$('#logoutBtn').addEventListener('click', () => logout());

/* ---------------- Sesión ---------------- */
const SESSION_SECONDS = Number(new URLSearchParams(location.search).get('sesion')) || 300;
let remaining, sessionTimer, countdownTimer;
function startSession() {
  stopSession();
  remaining = SESSION_SECONDS;
  paintSession();
  sessionTimer = setInterval(() => {
    remaining--; paintSession();
    if (remaining === 30) openSessionWarning();
    if (remaining <= 0) logout('Tu sesión venció por inactividad. Volvé a ingresar.');
  }, 1000);
}
function stopSession() { clearInterval(sessionTimer); clearInterval(countdownTimer); }
function paintSession() {
  const m = Math.floor(Math.max(remaining, 0) / 60), s = Math.max(remaining, 0) % 60;
  $('#sessionTime').textContent = `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}
function openSessionWarning() {
  $('#sessionCountdown').textContent = remaining;
  $('#sessionDialog').showModal();
  countdownTimer = setInterval(() => { $('#sessionCountdown').textContent = Math.max(remaining, 0); }, 250);
}
$('#sessionExtend').addEventListener('click', () => { $('#sessionDialog').close(); startSession(); });
$('#sessionLogout').addEventListener('click', () => logout());

/* ---------------- Tabs ---------------- */
function switchTab(name) {
  $$('.tab').forEach((t) => { const on = t.dataset.tab === name; t.classList.toggle('active', on); t.setAttribute('aria-selected', on); });
  $$('.panel').forEach((p) => p.classList.toggle('active', p.id === 'panel-' + name));
}
$$('.tab').forEach((t) => t.addEventListener('click', () => switchTab(t.dataset.tab)));

/* ---------------- Cuentas ---------------- */
let hideBalances = false;
function renderAccounts() {
  $('#accountsList').innerHTML = accounts.map((a) => `
    <article class="account ${a.currency === 'USD' ? 'usd' : ''}" data-testid="account-card" data-account-id="${a.id}">
      <div class="type" data-testid="account-type">${a.type} · ${a.currency === 'USD' ? 'Dólares' : 'Pesos'}</div>
      <div class="number" data-testid="account-number">${a.number}</div>
      <div class="balance" data-testid="account-balance">${hideBalances ? '••••••' : fmt(a.balance, a.currency)}</div>
      <div class="type">Saldo disponible</div>
      <div class="actions">
        <button class="btn-line" data-act="transfer" data-testid="account-transfer-btn">Transferir</button>
        <button class="btn-line" data-act="history" data-testid="account-history-btn">Ver movimientos</button>
      </div>
    </article>`).join('');
}
$('#toggleBalances').addEventListener('click', () => {
  hideBalances = !hideBalances;
  $('#toggleBalances').textContent = hideBalances ? 'Mostrar saldos' : 'Ocultar saldos';
  renderAccounts();
});
$('#accountsList').addEventListener('click', (e) => {
  const b = e.target.closest('button[data-act]');
  if (!b) return;
  const id = b.closest('.account').dataset.accountId;
  if (b.dataset.act === 'transfer') { $('#fromAccount').value = id; onFromChange(); switchTab('transfer'); }
  else { $('#histAccount').value = id; page = 1; renderHistory(); switchTab('history'); }
});

/* ---------------- Transferencia ---------------- */
function fillTransferSelects() {
  $('#fromAccount').innerHTML = '<option value="">Seleccioná una cuenta</option>' +
    accounts.map((a) => `<option value="${a.id}">${a.type} ${a.currency} · ${a.number}</option>`).join('');
  $('#toOwn').innerHTML = '<option value="">Seleccioná una cuenta</option>' +
    accounts.map((a) => `<option value="${a.id}">${a.type} ${a.currency} · ${a.number}</option>`).join('');
  renderContacts();
  onFromChange();
}
function renderContacts() {
  $('#toContact').innerHTML = '<option value="">Seleccioná un contacto</option>' +
    contacts.map((c) => `<option value="${c.number}">${c.name} · ${c.number} (${c.currency})</option>`).join('');
}
function onFromChange() { const a = accById($('#fromAccount').value); $('#currency').value = a ? a.currency : ''; }
$('#fromAccount').addEventListener('change', onFromChange);

$$('input[name="destType"]').forEach((r) => r.addEventListener('change', () => {
  const v = document.querySelector('input[name="destType"]:checked').value;
  $('#toOwnWrap').classList.toggle('hidden', v !== 'own');
  $('#toContactWrap').classList.toggle('hidden', v !== 'contact');
  $('#toNewWrap').classList.toggle('hidden', v !== 'new');
  $('#errTo').textContent = '';
}));

function parseAmount(txt) {
  const clean = txt.trim().replace(/\./g, '').replace(',', '.');
  return /^\d+(\.\d{1,2})?$/.test(clean) ? Number(clean) : NaN;
}

let pending = null;
$('#transferForm').addEventListener('submit', (e) => {
  e.preventDefault();
  ['#errFrom', '#errTo', '#errAmount', '#errConcept'].forEach((x) => ($(x).textContent = ''));
  $$('#transferForm .invalid').forEach((x) => x.classList.remove('invalid'));
  let ok = true;
  const from = accById($('#fromAccount').value);
  if (!from) { $('#errFrom').textContent = 'Elegí la cuenta de origen'; $('#fromAccount').classList.add('invalid'); ok = false; }

  const type = document.querySelector('input[name="destType"]:checked').value;
  let dest = null;
  if (type === 'own') {
    const to = accById($('#toOwn').value);
    if (!to) $('#errTo').textContent = 'Elegí la cuenta destino';
    else if (from && to.id === from.id) $('#errTo').textContent = 'La cuenta destino debe ser distinta a la de origen';
    else if (from && to.currency !== from.currency) $('#errTo').textContent = 'Solo podés transferir entre cuentas de la misma moneda';
    else dest = { label: `${to.type} ${to.currency} · ${to.number}`, number: to.number, ownId: to.id, currency: to.currency };
  } else if (type === 'contact') {
    const c = contacts.find((x) => x.number === $('#toContact').value);
    if (!c) $('#errTo').textContent = 'Elegí un contacto';
    else if (from && c.currency !== from.currency) $('#errTo').textContent = 'Solo podés transferir entre cuentas de la misma moneda';
    else dest = { label: `${c.name} · ${c.number}`, number: c.number, currency: c.currency };
  } else {
    const n = $('#toNew').value.trim(), name = $('#toNewName').value.trim();
    if (!/^\d{10}$/.test(n)) $('#errTo').textContent = 'El número de cuenta debe tener 10 dígitos';
    else if (accounts.some((a) => a.number === n)) $('#errTo').textContent = 'Esa cuenta es tuya: elegí "Cuenta propia"';
    else if (name.length < 3) $('#errTo').textContent = 'Ingresá el nombre del titular';
    else dest = { label: `${name} · ${n}`, number: n, name, currency: from ? from.currency : 'UYU', save: $('#saveContact').checked };
  }
  if (!dest) ok = false;

  const amount = parseAmount($('#amount').value);
  let aErr = '';
  if (isNaN(amount) || amount <= 0) aErr = 'Ingresá un importe válido (hasta 2 decimales)';
  else if (from && amount > from.balance) aErr = 'Saldo insuficiente';
  else if (from && amount > LIMITS[from.currency]) aErr = `Supera el límite por transferencia de ${fmt(LIMITS[from.currency], from.currency)}`;
  if (aErr) { $('#errAmount').textContent = aErr; $('#amount').classList.add('invalid'); ok = false; }

  const concept = $('#concept').value.trim();
  if (concept.length < 3) { $('#errConcept').textContent = 'El concepto debe tener al menos 3 caracteres'; $('#concept').classList.add('invalid'); ok = false; }
  if (!ok) return;

  pending = { from, dest, amount, concept, tokenFails: 0 };
  $('#confirmDetails').innerHTML = `
    <dt>Desde</dt><dd data-testid="confirm-from">${from.type} ${from.currency} · ${from.number}</dd>
    <dt>Hacia</dt><dd data-testid="confirm-to">${dest.label}</dd>
    <dt>Importe</dt><dd data-testid="confirm-amount">${fmt(amount, from.currency)}</dd>
    <dt>Concepto</dt><dd data-testid="confirm-concept">${concept.replace(/</g, '&lt;')}</dd>`;
  $('#tokenInput').value = ''; $('#errToken').textContent = '';
  $('#confirmTransfer').showModal();
  $('#tokenInput').focus();
});

$('#cancelTransfer').addEventListener('click', () => { pending = null; $('#confirmTransfer').close(); });

$('#doTransfer').addEventListener('click', () => {
  const tok = $('#tokenInput').value.trim();
  if (!/^\d{6}$/.test(tok)) { $('#errToken').textContent = 'El token tiene 6 dígitos'; return; }
  if (tok !== TOKEN) {
    pending.tokenFails++;
    if (pending.tokenFails >= 3) {
      $('#confirmTransfer').close(); pending = null;
      return showResult('Transferencia cancelada', 'Ingresaste mal el token 3 veces. Por seguridad cancelamos la operación.');
    }
    $('#errToken').textContent = `Token incorrecto. Te quedan ${3 - pending.tokenFails} intento${3 - pending.tokenFails === 1 ? '' : 's'}.`;
    return;
  }
  const { from, dest, amount, concept } = pending;
  from.balance = Math.round((from.balance - amount) * 100) / 100;
  const today = localISO(new Date());
  movements.unshift({ date: today, desc: `Transferencia a ${dest.label.split(' · ')[0]} - ${concept}`, account: from.id, amount: -amount });
  if (dest.ownId) {
    const to = accById(dest.ownId);
    to.balance = Math.round((to.balance + amount) * 100) / 100;
    movements.unshift({ date: today, desc: `Transferencia desde ${from.number} - ${concept}`, account: to.id, amount });
  }
  if (dest.save && !contacts.some((c) => c.number === dest.number)) { contacts.push({ name: dest.name, number: dest.number, currency: dest.currency }); renderContacts(); }
  const ref = 'TR' + Date.now().toString().slice(-8);
  $('#confirmTransfer').close();
  pending = null;
  $('#transferForm').reset(); onFromChange();
  $$('input[name="destType"]')[0].dispatchEvent(new Event('change'));
  renderAccounts(); renderHistory();
  showResult('Transferencia realizada', `Transferiste ${fmt(amount, from.currency)}. Número de referencia: ${ref}.`, ref);
});

function showResult(title, text, ref) {
  $('#resultTitle').textContent = title;
  $('#resultText').textContent = text;
  $('#resultText').dataset.reference = ref || '';
  $('#resultDialog').showModal();
}
$('#resultOk').addEventListener('click', () => $('#resultDialog').close());

/* ---------------- Movimientos ---------------- */
const PAGE_SIZE = 10;
let page = 1;
function fillHistoryFilters() {
  $('#histAccount').innerHTML = '<option value="">Todas</option>' +
    accounts.map((a) => `<option value="${a.id}">${a.type} ${a.currency} · ${a.number}</option>`).join('');
}
function filteredMovements() {
  const acc = $('#histAccount').value, type = $('#histType').value;
  const from = $('#histFrom').value, to = $('#histTo').value, q = $('#histSearch').value.trim().toLowerCase();
  return movements.filter((m) =>
    (!acc || m.account === acc) &&
    (!type || (type === 'credito' ? m.amount > 0 : m.amount < 0)) &&
    (!from || m.date >= from) && (!to || m.date <= to) &&
    (!q || m.desc.toLowerCase().includes(q)));
}
function renderHistory() {
  const list = filteredMovements();
  // saldo corrido por cuenta (del más reciente hacia atrás)
  const running = {}; accounts.forEach((a) => (running[a.id] = a.balance));
  const withBalance = movements.map((m) => { const b = running[m.account]; running[m.account] = Math.round((b - m.amount) * 100) / 100; return { ...m, after: b }; });
  const rows = list.map((m) => withBalance[movements.indexOf(m)]);
  const pages = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));
  page = Math.min(page, pages);
  const slice = rows.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  $('#histBody').innerHTML = slice.map((m) => {
    const a = accById(m.account);
    return `<tr data-testid="history-row">
      <td data-testid="row-date">${new Date(m.date + 'T00:00').toLocaleDateString('es-UY')}</td>
      <td data-testid="row-desc">${m.desc.replace(/</g, '&lt;')}</td>
      <td data-testid="row-account">${a.number}</td>
      <td class="num ${m.amount > 0 ? 'credit' : 'debit'}" data-testid="row-amount">${m.amount > 0 ? '+' : '−'}${fmt(Math.abs(m.amount), a.currency)}</td>
      <td class="num" data-testid="row-balance">${fmt(m.after, a.currency)}</td>
    </tr>`;
  }).join('');
  $('#histEmpty').classList.toggle('hidden', rows.length > 0);
  $('#pageInfo').textContent = `Página ${page} de ${pages} · ${rows.length} movimientos`;
  $('#prevPage').disabled = page === 1;
  $('#nextPage').disabled = page === pages;
}
['#histAccount', '#histType', '#histFrom', '#histTo', '#histSearch'].forEach((s) => $(s).addEventListener('input', () => { page = 1; renderHistory(); }));
$('#prevPage').addEventListener('click', () => { page--; renderHistory(); });
$('#nextPage').addEventListener('click', () => { page++; renderHistory(); });
