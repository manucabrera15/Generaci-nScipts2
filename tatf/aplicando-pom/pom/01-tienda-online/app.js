/* =========================================================
   Almacén del Puerto - tienda de práctica para Page Object Model
   Datos útiles para las pruebas:
   - Cupón válido: DESCUENTO10 (10% off). Cupón vencido: VERANO2025
   - Tarjeta válida: 16 dígitos, vencimiento futuro MM/AA, CVV 3-4 dígitos
   - La carga del catálogo demora ~800 ms (practicar esperas explícitas)
   ========================================================= */

const PRODUCTS = [
  { id: 1, name: 'Yerba mate 1 kg', category: 'almacen', price: 285, stock: 12, icon: '🧉', desc: 'Yerba con palo, molienda tradicional.' },
  { id: 2, name: 'Dulce de leche 500 g', category: 'lacteos', price: 145, stock: 30, icon: '🍯', desc: 'Dulce de leche familiar, receta clásica.' },
  { id: 3, name: 'Agua mineral 2 L', category: 'bebidas', price: 60, stock: 50, icon: '💧', desc: 'Agua mineral sin gas.' },
  { id: 4, name: 'Vino tannat 750 ml', category: 'bebidas', price: 520, stock: 0, icon: '🍷', desc: 'Tannat joven de Canelones.' },
  { id: 5, name: 'Queso colonia 1 kg', category: 'lacteos', price: 690, stock: 4, icon: '🧀', desc: 'Queso semiduro estacionado.' },
  { id: 6, name: 'Arroz 1 kg', category: 'almacen', price: 79, stock: 40, icon: '🍚', desc: 'Arroz largo fino tipo patna.' },
  { id: 7, name: 'Detergente 750 ml', category: 'limpieza', price: 98, stock: 18, icon: '🧴', desc: 'Detergente concentrado aroma limón.' },
  { id: 8, name: 'Galletitas de campaña', category: 'almacen', price: 112, stock: 22, icon: '🍘', desc: 'Paquete de 400 g.' },
  { id: 9, name: 'Leche entera 1 L', category: 'lacteos', price: 52, stock: 0, icon: '🥛', desc: 'Leche entera larga vida.' },
  { id: 10, name: 'Refresco cola 1,5 L', category: 'bebidas', price: 110, stock: 35, icon: '🥤', desc: 'Bebida cola regular.' },
  { id: 11, name: 'Jabón en polvo 800 g', category: 'limpieza', price: 235, stock: 9, icon: '🧺', desc: 'Para lavado a mano y lavarropas.' },
  { id: 12, name: 'Aceite de girasol 900 ml', category: 'almacen', price: 165, stock: 15, icon: '🌻', desc: 'Aceite refinado.' },
];
const CATEGORY_NAMES = { almacen: 'Almacén', bebidas: 'Bebidas', lacteos: 'Lácteos', limpieza: 'Limpieza' };
const SHIPPING_COST = 150;

const state = { cart: [], coupon: null, step: 1, currentProduct: null };
const $ = (sel) => document.querySelector(sel);
const money = (n) => '$' + n.toLocaleString('es-UY');

/* ---------------- Vistas ---------------- */
function showView(name) {
  document.querySelectorAll('.view').forEach((v) => v.classList.remove('active'));
  $('#view-' + name).classList.add('active');
  window.scrollTo(0, 0);
}

/* ---------------- Catálogo ---------------- */
function getFiltered() {
  const q = $('#searchInput').value.trim().toLowerCase();
  const cat = $('#categorySelect').value;
  const max = Number($('#priceRange').value);
  const stockOnly = $('#stockOnly').checked;
  let list = PRODUCTS.filter((p) =>
    p.name.toLowerCase().includes(q) && (!cat || p.category === cat) && p.price <= max && (!stockOnly || p.stock > 0));
  const sort = $('#sortSelect').value;
  if (sort === 'price-asc') list.sort((a, b) => a.price - b.price);
  if (sort === 'price-desc') list.sort((a, b) => b.price - a.price);
  if (sort === 'name') list.sort((a, b) => a.name.localeCompare(b.name));
  return list;
}

function renderCatalog() {
  const list = getFiltered();
  const grid = $('#productGrid');
  grid.innerHTML = list.map((p) => `
    <article class="card" data-testid="product-card" data-product-id="${p.id}">
      <div class="swatch" aria-hidden="true">${p.icon}</div>
      <h3 data-testid="product-name">${p.name}</h3>
      <span class="cat" data-testid="product-category">${CATEGORY_NAMES[p.category]}</span>
      <span class="price" data-testid="product-price">${money(p.price)}</span>
      ${p.stock === 0 ? '<span class="stock-out" data-testid="product-out-of-stock">Sin stock</span>' : `<span class="cat" data-testid="product-stock">Stock: ${p.stock}</span>`}
      <div class="actions">
        <button class="secondary" data-action="detail" data-testid="product-detail-btn">Ver detalle</button>
        <button class="primary" data-action="add" data-testid="add-to-cart-btn" ${p.stock === 0 ? 'disabled' : ''}>Agregar</button>
      </div>
    </article>`).join('');
  $('#emptyState').classList.toggle('hidden', list.length > 0);
  $('#resultsInfo').textContent = `${list.length} producto${list.length === 1 ? '' : 's'} encontrado${list.length === 1 ? '' : 's'}`;
}

function loadCatalog() {
  $('#loader').classList.remove('hidden');
  $('#productGrid').innerHTML = '';
  setTimeout(() => { $('#loader').classList.add('hidden'); renderCatalog(); }, 800);
}

$('#productGrid').addEventListener('click', (e) => {
  const btn = e.target.closest('button');
  if (!btn) return;
  const id = Number(btn.closest('.card').dataset.productId);
  if (btn.dataset.action === 'add') addToCart(id, 1);
  if (btn.dataset.action === 'detail') openModal(id);
});
['#searchInput', '#categorySelect', '#sortSelect', '#stockOnly'].forEach((s) => $(s).addEventListener('input', renderCatalog));
$('#priceRange').addEventListener('input', (e) => { $('#priceOutput').textContent = e.target.value; renderCatalog(); });
$('#clearFilters').addEventListener('click', () => {
  $('#searchInput').value = ''; $('#categorySelect').value = ''; $('#sortSelect').value = 'relevance';
  $('#priceRange').value = 1000; $('#priceOutput').textContent = '1000'; $('#stockOnly').checked = false;
  renderCatalog();
});

/* ---------------- Modal de producto ---------------- */
function openModal(id) {
  const p = PRODUCTS.find((x) => x.id === id);
  state.currentProduct = p;
  $('#modalTitle').textContent = p.name;
  $('#modalDesc').textContent = p.desc;
  $('#modalPrice').textContent = money(p.price);
  $('#qtyInput').value = 1;
  $('#qtyInput').max = p.stock;
  $('#modalAdd').disabled = p.stock === 0;
  $('#productModal').showModal();
}
$('#closeModal').addEventListener('click', () => $('#productModal').close());
$('#qtyMinus').addEventListener('click', () => { $('#qtyInput').value = Math.max(1, Number($('#qtyInput').value) - 1); });
$('#qtyPlus').addEventListener('click', () => {
  const max = state.currentProduct.stock;
  $('#qtyInput').value = Math.min(max, Number($('#qtyInput').value) + 1);
});
$('#modalAdd').addEventListener('click', () => {
  addToCart(state.currentProduct.id, Number($('#qtyInput').value) || 1);
  $('#productModal').close();
});

/* ---------------- Carrito ---------------- */
function addToCart(id, qty) {
  const p = PRODUCTS.find((x) => x.id === id);
  const item = state.cart.find((i) => i.id === id);
  const current = item ? item.qty : 0;
  if (current + qty > p.stock) { toast(`Solo hay ${p.stock} unidades de ${p.name}`); return; }
  if (item) item.qty += qty; else state.cart.push({ id, qty });
  renderCart();
  toast(`${p.name} agregado al carrito`);
}

function totals() {
  const subtotal = state.cart.reduce((s, i) => s + PRODUCTS.find((p) => p.id === i.id).price * i.qty, 0);
  const discount = state.coupon ? Math.round(subtotal * 0.1) : 0;
  const shipping = document.querySelector('input[name="shipping"]:checked').value === 'domicilio' ? SHIPPING_COST : 0;
  return { subtotal, discount, shipping, total: subtotal - discount + shipping };
}

function renderCart() {
  const count = state.cart.reduce((s, i) => s + i.qty, 0);
  $('#cartCount').textContent = count;
  $('#cartItems').innerHTML = state.cart.map((i) => {
    const p = PRODUCTS.find((x) => x.id === i.id);
    return `<li class="cart-item" data-testid="cart-item" data-product-id="${p.id}">
      <span data-testid="cart-item-name">${p.name}</span>
      <strong data-testid="cart-item-subtotal">${money(p.price * i.qty)}</strong>
      <div class="qty-controls">
        <button class="icon" data-action="dec" data-testid="cart-item-decrease">−</button>
        <span data-testid="cart-item-qty">${i.qty}</span>
        <button class="icon" data-action="inc" data-testid="cart-item-increase">+</button>
      </div>
      <button class="remove" data-action="remove" data-testid="cart-item-remove">Quitar</button>
    </li>`;
  }).join('');
  $('#cartEmpty').classList.toggle('hidden', state.cart.length > 0);
  $('#cartTotal').textContent = money(totals().subtotal - totals().discount);
  $('#goCheckout').disabled = state.cart.length === 0;
}

$('#cartItems').addEventListener('click', (e) => {
  const btn = e.target.closest('button');
  if (!btn) return;
  const id = Number(btn.closest('.cart-item').dataset.productId);
  const item = state.cart.find((i) => i.id === id);
  const p = PRODUCTS.find((x) => x.id === id);
  if (btn.dataset.action === 'inc') { if (item.qty < p.stock) item.qty++; else toast('No hay más stock'); }
  if (btn.dataset.action === 'dec') item.qty--;
  if (btn.dataset.action === 'remove' || item.qty === 0) state.cart = state.cart.filter((i) => i.id !== id);
  renderCart();
});

function openCart() { $('#cartDrawer').classList.add('open'); $('#cartDrawer').setAttribute('aria-hidden', 'false'); $('#overlay').classList.remove('hidden'); }
function closeCart() { $('#cartDrawer').classList.remove('open'); $('#cartDrawer').setAttribute('aria-hidden', 'true'); $('#overlay').classList.add('hidden'); }
$('#cartToggle').addEventListener('click', openCart);
$('#closeCart').addEventListener('click', closeCart);
$('#overlay').addEventListener('click', closeCart);

$('#applyCoupon').addEventListener('click', () => {
  const code = $('#couponInput').value.trim().toUpperCase();
  const msg = $('#couponMsg');
  if (code === 'DESCUENTO10') { state.coupon = code; msg.textContent = 'Cupón aplicado: 10% de descuento'; msg.className = 'coupon-msg ok'; }
  else if (code === 'VERANO2025') { state.coupon = null; msg.textContent = 'Este cupón está vencido'; msg.className = 'coupon-msg bad'; }
  else { state.coupon = null; msg.textContent = 'El código no existe'; msg.className = 'coupon-msg bad'; }
  renderCart();
});

$('#goCheckout').addEventListener('click', () => { closeCart(); goToStep(1); renderSummary(); showView('checkout'); });
$('#backToCatalog').addEventListener('click', () => showView('catalog'));

/* ---------------- Checkout ---------------- */
function renderSummary() {
  $('#summaryItems').innerHTML = state.cart.map((i) => {
    const p = PRODUCTS.find((x) => x.id === i.id);
    return `<li data-testid="summary-item"><span>${i.qty} × ${p.name}</span><span>${money(p.price * i.qty)}</span></li>`;
  }).join('');
  const t = totals();
  $('#sumSubtotal').textContent = money(t.subtotal);
  $('#sumDiscount').textContent = t.discount ? '-' + money(t.discount) : money(0);
  $('#sumShipping').textContent = t.shipping ? money(t.shipping) : 'Gratis';
  $('#sumTotal').textContent = money(t.total);
}

function goToStep(n) {
  state.step = n;
  document.querySelectorAll('.step-panel').forEach((p) => p.classList.toggle('active', Number(p.dataset.panel) === n));
  document.querySelectorAll('.step').forEach((s) => {
    const k = Number(s.dataset.step);
    s.classList.toggle('current', k === n);
    s.classList.toggle('done', k < n);
  });
  $('#prevStep').classList.toggle('hidden', n === 1);
  $('#nextStep').classList.toggle('hidden', n === 3);
  $('#placeOrder').classList.toggle('hidden', n !== 3);
}

function setError(field, message) {
  const el = document.querySelector(`[data-error-for="${field}"]`);
  el.textContent = message || '';
  const input = document.getElementById(field);
  if (input) input.classList.toggle('invalid', !!message);
  return !message;
}

function validateStep(n) {
  let ok = true;
  if (n === 1) {
    const name = $('#fullName').value.trim();
    ok &= setError('fullName', name.split(/\s+/).length < 2 ? 'Ingresá nombre y apellido' : '');
    ok &= setError('email', /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i.test($('#email').value.trim()) ? '' : 'Ingresá un email válido');
    ok &= setError('phone', /^09\d{7}$/.test($('#phone').value.replace(/\s/g, '')) ? '' : 'El teléfono debe tener 9 dígitos y empezar con 09');
  }
  if (n === 2 && document.querySelector('input[name="shipping"]:checked').value === 'domicilio') {
    ok &= setError('address', $('#address').value.trim().length < 5 ? 'Ingresá una dirección' : '');
    ok &= setError('department', $('#department').value ? '' : 'Seleccioná un departamento');
  }
  if (n === 3) {
    ok &= setError('cardNumber', /^\d{16}$/.test($('#cardNumber').value.replace(/\s/g, '')) ? '' : 'La tarjeta debe tener 16 dígitos');
    const exp = $('#cardExp').value.match(/^(\d{2})\/(\d{2})$/);
    let expOk = false;
    if (exp) {
      const m = Number(exp[1]); const y = 2000 + Number(exp[2]);
      const now = new Date();
      expOk = m >= 1 && m <= 12 && (y > now.getFullYear() || (y === now.getFullYear() && m >= now.getMonth() + 1));
    }
    ok &= setError('cardExp', expOk ? '' : 'Vencimiento inválido o tarjeta vencida');
    ok &= setError('cardCvv', /^\d{3,4}$/.test($('#cardCvv').value) ? '' : 'CVV inválido');
    ok &= setError('terms', $('#terms').checked ? '' : 'Tenés que aceptar los términos');
  }
  return !!ok;
}

$('#nextStep').addEventListener('click', () => { if (validateStep(state.step)) goToStep(state.step + 1); });
$('#prevStep').addEventListener('click', () => goToStep(state.step - 1));
document.querySelectorAll('input[name="shipping"]').forEach((r) => r.addEventListener('change', () => {
  $('#addressBlock').classList.toggle('hidden', r.value !== 'domicilio' || !r.checked);
  renderSummary();
}));
$('#cardNumber').addEventListener('input', (e) => {
  const digits = e.target.value.replace(/\D/g, '').slice(0, 16);
  e.target.value = digits.replace(/(\d{4})(?=\d)/g, '$1 ');
});

$('#checkoutForm').addEventListener('submit', (e) => {
  e.preventDefault();
  if (!validateStep(3)) return;
  const btn = $('#placeOrder');
  btn.disabled = true; btn.textContent = 'Procesando…';
  setTimeout(() => {
    state.cart.forEach((i) => { PRODUCTS.find((p) => p.id === i.id).stock -= i.qty; });
    $('#orderNumber').textContent = 'AP-' + Math.floor(100000 + Math.random() * 900000);
    $('#confirmEmail').textContent = $('#email').value.trim();
    btn.disabled = false; btn.textContent = 'Confirmar compra';
    showView('confirmation');
  }, 1200);
});

$('#newPurchase').addEventListener('click', () => {
  state.cart = []; state.coupon = null;
  $('#checkoutForm').reset(); $('#addressBlock').classList.add('hidden');
  $('#couponInput').value = ''; $('#couponMsg').textContent = '';
  renderCart(); showView('catalog'); loadCatalog();
});

/* ---------------- Toast ---------------- */
let toastTimer;
function toast(text) {
  const t = $('#toast');
  t.textContent = text; t.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('show'), 2500);
}

renderCart();
loadCatalog();
