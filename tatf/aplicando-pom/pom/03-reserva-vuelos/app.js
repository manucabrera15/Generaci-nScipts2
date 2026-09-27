/* =========================================================
   Cielo Austral - reserva de vuelos para practicar Page Object Model
   Datos útiles para las pruebas:
   - Los vuelos se generan de forma DETERMINÍSTICA según ruta + fecha
     (misma búsqueda = mismos resultados), así los tests son estables.
   - La búsqueda demora ~1,2 s (spinner "flights-loading").
   - Pasajeros: mínimo 1, máximo 6.
   - Hay que elegir exactamente tantos asientos como pasajeros.
   - Filas 10 y 11 son salida de emergencia (+$40 por asiento).
   - El primer pasajero debe ser mayor de edad. Los documentos no pueden repetirse.
   ========================================================= */

const CITIES = [
  { code: 'MVD', name: 'Montevideo' }, { code: 'EZE', name: 'Buenos Aires' },
  { code: 'GRU', name: 'San Pablo' }, { code: 'SCL', name: 'Santiago' },
  { code: 'LIM', name: 'Lima' }, { code: 'MAD', name: 'Madrid' },
];
const AIRLINES = ['Austral Air', 'Pampa Jet', 'Andes Link', 'Atlántica'];
const CABIN_FACTOR = { economy: 1, premium: 1.6, business: 2.8 };
const CABIN_NAME = { economy: 'Económica', premium: 'Premium', business: 'Ejecutiva' };
const ROWS = 20, LETTERS = ['A', 'B', 'C', 'D', 'E', 'F'], EXIT_ROWS = [10, 11], EXIT_FEE = 40;

const state = { search: null, flights: [], flight: null, seats: [], pax: 1 };
const $ = (s) => document.querySelector(s);
const $$ = (s) => [...document.querySelectorAll(s)];
const money = (n) => 'US$ ' + n.toLocaleString('es-UY');
const localISO = (d) => new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
const cityName = (c) => CITIES.find((x) => x.code === c).name;

/* Generador pseudoaleatorio con semilla (resultados reproducibles) */
function seeded(str) {
  let h = 2166136261;
  for (const ch of str) { h ^= ch.charCodeAt(0); h = Math.imul(h, 16777619); }
  return () => { h ^= h << 13; h ^= h >>> 17; h ^= h << 5; return ((h >>> 0) % 10000) / 10000; };
}

/* ---------------- Navegación ---------------- */
const ORDER = ['search', 'results', 'seats', 'passengers', 'done'];
function go(page) {
  $$('.page').forEach((p) => p.classList.remove('active'));
  $('#page-' + page).classList.add('active');
  const idx = ORDER.indexOf(page);
  $$('.p-step').forEach((s) => {
    const i = ORDER.indexOf(s.dataset.step);
    s.classList.toggle('active', i === idx);
    s.classList.toggle('done', i < idx);
  });
  window.scrollTo(0, 0);
}
$$('[data-back]').forEach((b) => b.addEventListener('click', () => go(b.dataset.back)));

/* ---------------- Paso 1: búsqueda ---------------- */
function initSearch() {
  const opts = CITIES.map((c) => `<option value="${c.code}">${c.name} (${c.code})</option>`).join('');
  $('#origin').innerHTML = '<option value="">Elegí origen</option>' + opts;
  $('#destination').innerHTML = '<option value="">Elegí destino</option>' + opts;
  const t = new Date(); t.setDate(t.getDate() + 7);
  $('#departDate').value = localISO(t);
  t.setDate(t.getDate() + 7);
  $('#returnDate').value = localISO(t);
  $('#departDate').min = localISO(new Date());
}

$$('input[name="trip"]').forEach((r) => r.addEventListener('change', () => {
  $('#returnWrap').style.display = r.value === 'ida' && r.checked ? 'none' : '';
}));
$('#swapBtn').addEventListener('click', () => {
  const o = $('#origin').value; $('#origin').value = $('#destination').value; $('#destination').value = o;
});
$('#paxMinus').addEventListener('click', () => setPax(state.pax - 1));
$('#paxPlus').addEventListener('click', () => setPax(state.pax + 1));
function setPax(n) {
  state.pax = Math.min(6, Math.max(1, n));
  $('#paxCount').textContent = state.pax;
  $('#paxMinus').disabled = state.pax === 1;
  $('#paxPlus').disabled = state.pax === 6;
}

$('#searchForm').addEventListener('submit', (e) => {
  e.preventDefault();
  const errors = [];
  const trip = document.querySelector('input[name="trip"]:checked').value;
  const o = $('#origin').value, d = $('#destination').value;
  const dep = $('#departDate').value, ret = $('#returnDate').value;
  if (!o) errors.push('Elegí una ciudad de origen');
  if (!d) errors.push('Elegí una ciudad de destino');
  if (o && d && o === d) errors.push('El origen y el destino no pueden ser iguales');
  if (!dep) errors.push('Indicá la fecha de salida');
  else if (dep < localISO(new Date())) errors.push('La fecha de salida no puede ser anterior a hoy');
  if (trip === 'idavuelta') {
    if (!ret) errors.push('Indicá la fecha de regreso');
    else if (dep && ret < dep) errors.push('El regreso debe ser posterior a la salida');
  }
  $('#searchErrors').innerHTML = errors.map((x) => `<li data-testid="search-error">${x}</li>`).join('');
  if (errors.length) return;
  state.search = { trip, o, d, dep, ret, cabin: $('#cabin').value, pax: state.pax };
  loadFlights();
});

/* ---------------- Paso 2: resultados ---------------- */
function loadFlights() {
  const s = state.search;
  $('#routeTitle').textContent = `${cityName(s.o)} → ${cityName(s.d)}`;
  go('results');
  $('#flightsLoading').style.display = '';
  $('#flightsList').innerHTML = '';
  $('#flightsCount').textContent = '';
  setTimeout(() => {
    const rnd = seeded(s.o + s.d + s.dep);
    state.flights = Array.from({ length: 8 }, (_, i) => {
      const stops = Math.floor(rnd() * 3);
      const depMin = 360 + Math.floor(rnd() * 900);
      const dur = 90 + stops * 110 + Math.floor(rnd() * 200);
      const base = 180 + Math.floor(rnd() * 500) - stops * 40;
      return {
        id: `${s.o}${s.d}-${i + 1}`,
        number: 'CA' + (100 + Math.floor(rnd() * 900)),
        airline: AIRLINES[Math.floor(rnd() * AIRLINES.length)],
        stops, depMin, dur,
        price: Math.round(base * CABIN_FACTOR[s.cabin]),
        seatsLeft: 1 + Math.floor(rnd() * 9),
      };
    });
    $('#airlineFilter').innerHTML = '<option value="">Todas</option>' +
      [...new Set(state.flights.map((f) => f.airline))].map((a) => `<option>${a}</option>`).join('');
    $('#flightsLoading').style.display = 'none';
    renderFlights();
  }, 1200);
}

const hhmm = (m) => `${String(Math.floor(m / 60) % 24).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`;
const durTxt = (m) => `${Math.floor(m / 60)} h ${m % 60} min`;

function renderFlights() {
  const stops = $$('.stops-filter:checked').map((c) => Number(c.value));
  const air = $('#airlineFilter').value;
  const sort = $('#sortFlights').value;
  const list = state.flights.filter((f) => stops.includes(f.stops) && (!air || f.airline === air));
  list.sort((a, b) => sort === 'price' ? a.price - b.price : sort === 'duration' ? a.dur - b.dur : a.depMin - b.depMin);
  $('#flightsCount').textContent = `${list.length} vuelo${list.length === 1 ? '' : 's'} disponible${list.length === 1 ? '' : 's'}`;
  $('#flightsList').innerHTML = list.map((f) => `
    <li class="flight" data-testid="flight-card" data-flight-id="${f.id}">
      <div>
        <strong data-testid="flight-airline">${f.airline}</strong><br>
        <span class="muted" data-testid="flight-number">${f.number}</span>
      </div>
      <div>
        <span class="times"><span data-testid="flight-depart-time">${hhmm(f.depMin)}</span> – <span data-testid="flight-arrive-time">${hhmm(f.depMin + f.dur)}</span></span>
        <div class="route-line"><span data-testid="flight-duration">${durTxt(f.dur)}</span><span data-testid="flight-stops">${f.stops === 0 ? 'Directo' : f.stops + ' escala' + (f.stops > 1 ? 's' : '')}</span></div>
      </div>
      <div>
        <div class="price" data-testid="flight-price">${money(f.price)}</div>
        ${f.seatsLeft < state.search.pax
          ? `<div class="seats-left" data-testid="flight-not-enough-seats">No hay lugar para ${state.search.pax} pasajeros</div>`
          : f.seatsLeft <= 3 ? `<div class="seats-left" data-testid="flight-seats-left">Quedan ${f.seatsLeft} lugares</div>` : ''}
      </div>
      <button class="cta" data-testid="select-flight" ${f.seatsLeft < state.search.pax ? 'disabled' : ''}>Elegir</button>
    </li>`).join('') || '<li class="muted" data-testid="no-flights">No hay vuelos con esos filtros.</li>';
}
$$('.stops-filter').forEach((c) => c.addEventListener('change', renderFlights));
$('#airlineFilter').addEventListener('change', renderFlights);
$('#sortFlights').addEventListener('change', renderFlights);

$('#flightsList').addEventListener('click', (e) => {
  const btn = e.target.closest('[data-testid="select-flight"]');
  if (!btn) return;
  state.flight = state.flights.find((f) => f.id === btn.closest('.flight').dataset.flightId);
  state.seats = [];
  renderSeats();
  go('seats');
});

/* ---------------- Paso 3: asientos ---------------- */
function renderSeats() {
  const rnd = seeded(state.flight.id + state.search.dep);
  const taken = new Set();
  for (let r = 1; r <= ROWS; r++) LETTERS.forEach((l) => { if (rnd() < 0.45) taken.add(r + l); });
  let html = '<span></span>' + LETTERS.slice(0, 3).map((l) => `<span class="col-head">${l}</span>`).join('') +
    '<span></span>' + LETTERS.slice(3).map((l) => `<span class="col-head">${l}</span>`).join('');
  for (let r = 1; r <= ROWS; r++) {
    html += `<span class="row-label">${r}</span>`;
    LETTERS.forEach((l, i) => {
      if (i === 3) html += '<span class="aisle"></span>';
      const id = r + l;
      const isTaken = taken.has(id);
      const cls = ['seat', isTaken ? 'taken' : 'free', EXIT_ROWS.includes(r) ? 'exit' : ''].join(' ');
      html += `<button class="${cls}" data-seat="${id}" data-testid="seat-${id}" ${isTaken ? 'disabled aria-disabled="true"' : ''} aria-label="Asiento ${id}">${id}</button>`;
    });
  }
  $('#seatGrid').innerHTML = html;
  updateSeatSummary();
}

function seatFee() { return state.seats.filter((s) => EXIT_ROWS.includes(parseInt(s, 10))).length * EXIT_FEE; }

function updateSeatSummary() {
  const n = state.search.pax;
  $('#seatHint').textContent = `Seleccioná ${n} asiento${n > 1 ? 's' : ''}. Llevás ${state.seats.length} de ${n}.`;
  $('#selectedSeats').innerHTML = state.seats.map((s) => `<li data-testid="selected-seat">${s}</li>`).join('') || '<li class="muted">Ninguno</li>';
  $('#seatFee').textContent = money(seatFee());
  $('#seatsContinue').disabled = state.seats.length !== n;
  $$('.seat[data-seat]').forEach((b) => {
    b.classList.toggle('mine', state.seats.includes(b.dataset.seat));
    b.setAttribute('aria-pressed', state.seats.includes(b.dataset.seat));
  });
}

$('#seatGrid').addEventListener('click', (e) => {
  const b = e.target.closest('.seat.free');
  if (!b) return;
  const id = b.dataset.seat;
  if (state.seats.includes(id)) state.seats = state.seats.filter((s) => s !== id);
  else if (state.seats.length < state.search.pax) state.seats.push(id);
  else { state.seats.shift(); state.seats.push(id); } // reemplaza el más antiguo
  updateSeatSummary();
});
$('#seatsContinue').addEventListener('click', () => { renderPaxForms(); go('passengers'); });

/* ---------------- Paso 4: pasajeros ---------------- */
function renderPaxForms() {
  $('#paxForms').innerHTML = Array.from({ length: state.search.pax }, (_, i) => `
    <fieldset class="pax-card" data-testid="passenger-form-${i + 1}" data-index="${i}">
      <legend>Pasajero ${i + 1} · Asiento ${state.seats[i]}</legend>
      <label>Nombre <input name="first" data-testid="pax-${i + 1}-first-name"></label>
      <label>Apellido <input name="last" data-testid="pax-${i + 1}-last-name"></label>
      <span class="err" data-testid="pax-${i + 1}-first-name-error"></span>
      <span class="err" data-testid="pax-${i + 1}-last-name-error"></span>
      <label>Documento <input name="doc" data-testid="pax-${i + 1}-document"></label>
      <label>Fecha de nacimiento <input type="date" name="birth" data-testid="pax-${i + 1}-birthdate"></label>
      <span class="err" data-testid="pax-${i + 1}-document-error"></span>
      <span class="err" data-testid="pax-${i + 1}-birthdate-error"></span>
      <label>Nacionalidad
        <select name="nat" data-testid="pax-${i + 1}-nationality">
          <option value="">Seleccioná…</option><option>Uruguaya</option><option>Argentina</option>
          <option>Brasileña</option><option>Chilena</option><option>Otra</option>
        </select>
      </label>
      <span></span>
      <span class="err" data-testid="pax-${i + 1}-nationality-error"></span>
    </fieldset>`).join('');
  const tickets = state.flight.price * state.search.pax * (state.search.trip === 'idavuelta' ? 2 : 1);
  $('#ticketsTotal').textContent = money(tickets);
  $('#seatsTotal').textContent = money(seatFee());
  $('#grandTotal').textContent = money(tickets + seatFee());
}

function setErr(testid, msg, input) {
  document.querySelector(`[data-testid="${testid}-error"]`).textContent = msg || '';
  if (input) input.classList.toggle('invalid', !!msg);
  return !msg;
}

function ageAt(birth) {
  const b = new Date(birth + 'T00:00'); const n = new Date();
  let a = n.getFullYear() - b.getFullYear();
  if (n < new Date(n.getFullYear(), b.getMonth(), b.getDate())) a--;
  return a;
}

$('#paxForm').addEventListener('submit', (e) => {
  e.preventDefault();
  let ok = true;
  const docs = [];
  $$('.pax-card').forEach((card, i) => {
    const p = `pax-${i + 1}`;
    const f = (n) => card.querySelector(`[name="${n}"]`);
    ok &= setErr(`${p}-first-name`, f('first').value.trim().length < 2 ? 'Ingresá el nombre' : '', f('first'));
    ok &= setErr(`${p}-last-name`, f('last').value.trim().length < 2 ? 'Ingresá el apellido' : '', f('last'));
    const doc = f('doc').value.trim();
    let docErr = '';
    if (!/^[A-Z0-9]{6,12}$/i.test(doc)) docErr = 'Documento de 6 a 12 caracteres alfanuméricos';
    else if (docs.includes(doc.toUpperCase())) docErr = 'Este documento ya se usó para otro pasajero';
    docs.push(doc.toUpperCase());
    ok &= setErr(`${p}-document`, docErr, f('doc'));
    const birth = f('birth').value;
    let bErr = '';
    if (!birth) bErr = 'Indicá la fecha de nacimiento';
    else if (birth > localISO(new Date())) bErr = 'La fecha no puede ser futura';
    else if (i === 0 && ageAt(birth) < 18) bErr = 'El primer pasajero debe ser mayor de edad';
    ok &= setErr(`${p}-birthdate`, bErr, f('birth'));
    ok &= setErr(`${p}-nationality`, f('nat').value ? '' : 'Elegí la nacionalidad', f('nat'));
  });
  const em = $('#contactEmail').value.trim();
  ok &= setErr('contact-email', /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i.test(em) ? '' : 'Email inválido', $('#contactEmail'));
  ok &= setErr('contact-email-confirm', $('#contactEmail2').value.trim() === em && em ? '' : 'Los emails no coinciden', $('#contactEmail2'));
  if (!ok) { document.querySelector('.invalid')?.focus(); return; }

  const code = Array.from({ length: 6 }, () => 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'[Math.floor(Math.random() * 32)]).join('');
  $('#bookingCode').textContent = code;
  const s = state.search;
  $('#ticketDetails').innerHTML = `
    <dt>Ruta</dt><dd data-testid="ticket-route">${cityName(s.o)} → ${cityName(s.d)}</dd>
    <dt>Vuelo</dt><dd data-testid="ticket-flight">${state.flight.number} · ${state.flight.airline}</dd>
    <dt>Salida</dt><dd data-testid="ticket-date">${new Date(s.dep + 'T00:00').toLocaleDateString('es-UY')} ${hhmm(state.flight.depMin)}</dd>
    ${s.trip === 'idavuelta' ? `<dt>Regreso</dt><dd data-testid="ticket-return">${new Date(s.ret + 'T00:00').toLocaleDateString('es-UY')}</dd>` : ''}
    <dt>Clase</dt><dd data-testid="ticket-cabin">${CABIN_NAME[s.cabin]}</dd>
    <dt>Asientos</dt><dd data-testid="ticket-seats">${state.seats.join(', ')}</dd>
    <dt>Total</dt><dd data-testid="ticket-total">${$('#grandTotal').textContent}</dd>`;
  go('done');
});

$('#newSearch').addEventListener('click', () => {
  $('#paxForm').reset(); $('#searchErrors').innerHTML = '';
  go('search');
});

initSearch();
setPax(1);
