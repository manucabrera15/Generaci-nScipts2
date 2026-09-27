/* =========================================================
   Nómina - gestión de personal para practicar Page Object Model
   Datos útiles para las pruebas:
   - 37 personas precargadas (datos determinísticos).
   - El legajo se asigna solo (1001, 1002, …).
   - Email único. Edad mínima 18. Ingreso no futuro.
   - Salario entre $ 25.000 y $ 500.000, solo números.
   - El select "Cargo" depende del "Área" elegida.
   - Borrar requiere escribir ELIMINAR en el diálogo.
   - "Seleccionar todos" solo marca las filas de la página actual.
   ========================================================= */

const DEPTS = {
  'Calidad': ['Tester QA', 'Automatizador/a', 'Analista de performance', 'Líder de testing'],
  'Desarrollo': ['Desarrollador/a frontend', 'Desarrollador/a backend', 'Arquitecto/a'],
  'Producto': ['Product owner', 'Diseñador/a UX'],
  'Operaciones': ['DevOps', 'Soporte técnico'],
  'Administración': ['Contador/a', 'Recursos humanos'],
};
const STATUS_LABEL = { activo: 'Activo', licencia: 'De licencia', inactivo: 'Inactivo' };
const MODE_LABEL = { presencial: 'Presencial', hibrida: 'Híbrida', remota: 'Remota' };

const $ = (s) => document.querySelector(s);
const $$ = (s) => [...document.querySelectorAll(s)];
const money = (n) => '$ ' + n.toLocaleString('es-UY');
const localISO = (d) => new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
const fmtDate = (iso) => new Date(iso + 'T00:00').toLocaleDateString('es-UY');
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

/* ---------------- Datos semilla ---------------- */
const FIRST = ['Ana', 'Bruno', 'Camila', 'Diego', 'Elena', 'Facundo', 'Gabriela', 'Hernán', 'Inés', 'Joaquín', 'Karina', 'Leandro', 'Mónica', 'Nicolás', 'Olivia', 'Pablo', 'Romina', 'Santiago', 'Tatiana', 'Valentín'];
const LAST = ['Rodríguez', 'González', 'Fernández', 'López', 'Martínez', 'Pérez', 'Sosa', 'Silva', 'Pereira', 'Castro', 'Núñez', 'Méndez'];
let nextId = 1001;
let people = [];
(function seed() {
  let s = 42;
  const r = () => { s = (s * 16807) % 2147483647; return s / 2147483647; };
  const deptNames = Object.keys(DEPTS);
  for (let i = 0; i < 37; i++) {
    const first = FIRST[Math.floor(r() * FIRST.length)], last = LAST[Math.floor(r() * LAST.length)];
    const dept = deptNames[Math.floor(r() * deptNames.length)];
    const role = DEPTS[dept][Math.floor(r() * DEPTS[dept].length)];
    const by = 1968 + Math.floor(r() * 35), sy = Math.max(by + 20, 2008 + Math.floor(r() * 17));
    const st = r();
    people.push({
      id: nextId++, first, last,
      email: `${first}.${last}${i}`.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '') + '@nomina.uy',
      phone: '09' + String(1000000 + Math.floor(r() * 8999999)),
      birth: `${by}-${String(1 + Math.floor(r() * 12)).padStart(2, '0')}-${String(1 + Math.floor(r() * 28)).padStart(2, '0')}`,
      dept, role,
      start: `${Math.min(sy, 2025)}-${String(1 + Math.floor(r() * 12)).padStart(2, '0')}-01`,
      salary: Math.round((45000 + r() * 185000) / 500) * 500,
      status: st < 0.75 ? 'activo' : st < 0.88 ? 'licencia' : 'inactivo',
      mode: ['presencial', 'hibrida', 'remota'][Math.floor(r() * 3)],
    });
  }
})();

/* ---------------- Estado de la tabla ---------------- */
const view = { sort: 'id', dir: 1, page: 1, size: 10, selected: new Set() };

function filtered() {
  const q = $('#q').value.trim().toLowerCase();
  const d = $('#fDept').value, st = $('#fStatus').value;
  const list = people.filter((p) =>
    (!q || `${p.first} ${p.last}`.toLowerCase().includes(q) || p.email.includes(q) || String(p.id).includes(q)) &&
    (!d || p.dept === d) && (!st || p.status === st));
  const key = view.sort;
  list.sort((a, b) => {
    const va = key === 'name' ? `${a.last} ${a.first}` : a[key];
    const vb = key === 'name' ? `${b.last} ${b.first}` : b[key];
    return (typeof va === 'number' ? va - vb : String(va).localeCompare(String(vb))) * view.dir;
  });
  return list;
}

function render() {
  const list = filtered();
  const pages = Math.max(1, Math.ceil(list.length / view.size));
  view.page = Math.min(view.page, pages);
  const start = (view.page - 1) * view.size;
  const slice = list.slice(start, start + view.size);

  $('#tbody').innerHTML = slice.map((p) => `
    <tr data-testid="employee-row" data-employee-id="${p.id}" class="${view.selected.has(p.id) ? 'selected' : ''}">
      <td><input type="checkbox" class="row-check" data-testid="row-checkbox" aria-label="Seleccionar ${esc(p.first)} ${esc(p.last)}" ${view.selected.has(p.id) ? 'checked' : ''}></td>
      <td data-testid="cell-id">${p.id}</td>
      <td><button class="name-link" data-act="view" data-testid="cell-name">${esc(p.last)}, ${esc(p.first)}</button></td>
      <td data-testid="cell-dept">${p.dept}</td>
      <td data-testid="cell-role">${p.role}</td>
      <td data-testid="cell-start">${fmtDate(p.start)}</td>
      <td class="num" data-testid="cell-salary">${money(p.salary)}</td>
      <td><span class="status ${p.status}" data-testid="cell-status">${STATUS_LABEL[p.status]}</span></td>
      <td class="row-actions">
        <button data-act="edit" data-testid="row-edit">Editar</button>
        <button data-act="delete" class="del" data-testid="row-delete">Eliminar</button>
      </td>
    </tr>`).join('');

  $('#empty').classList.toggle('hidden', list.length > 0);
  $('#range').textContent = list.length ? `${start + 1}–${start + slice.length} de ${list.length}` : '0 resultados';

  let btns = `<button data-page="prev" data-testid="page-prev" ${view.page === 1 ? 'disabled' : ''} aria-label="Página anterior">‹</button>`;
  for (let i = 1; i <= pages; i++) btns += `<button data-page="${i}" data-testid="page-${i}" ${i === view.page ? 'aria-current="page"' : ''}>${i}</button>`;
  btns += `<button data-page="next" data-testid="page-next" ${view.page === pages ? 'disabled' : ''} aria-label="Página siguiente">›</button>`;
  $('#pages').innerHTML = btns;

  const pageIds = slice.map((p) => p.id);
  const allOnPage = pageIds.length > 0 && pageIds.every((id) => view.selected.has(id));
  $('#selectAll').checked = allOnPage;
  $('#selectAll').indeterminate = !allOnPage && pageIds.some((id) => view.selected.has(id));

  $$('.sort').forEach((b) => b.setAttribute('aria-sort', b.dataset.sort === view.sort ? (view.dir === 1 ? 'ascending' : 'descending') : 'none'));

  const act = people.filter((p) => p.status === 'activo').length;
  $('#totalsLine').textContent = `${people.length} personas · ${act} activas`;

  $('#bulkBar').classList.toggle('hidden', view.selected.size === 0);
  $('#bulkCount').textContent = `${view.selected.size} seleccionada${view.selected.size === 1 ? '' : 's'}`;
}

/* ---------------- Eventos de tabla ---------------- */
$$('.sort').forEach((b) => b.addEventListener('click', () => {
  if (view.sort === b.dataset.sort) view.dir *= -1; else { view.sort = b.dataset.sort; view.dir = 1; }
  render();
}));
['#q', '#fDept', '#fStatus'].forEach((s) => $(s).addEventListener('input', () => { view.page = 1; render(); }));
$('#clearBtn').addEventListener('click', () => { $('#q').value = ''; $('#fDept').value = ''; $('#fStatus').value = ''; view.page = 1; render(); });
$('#pageSize').addEventListener('change', (e) => { view.size = Number(e.target.value); view.page = 1; render(); });
$('#pages').addEventListener('click', (e) => {
  const b = e.target.closest('button'); if (!b || b.disabled) return;
  view.page = b.dataset.page === 'prev' ? view.page - 1 : b.dataset.page === 'next' ? view.page + 1 : Number(b.dataset.page);
  render();
});
$('#selectAll').addEventListener('change', (e) => {
  $$('#tbody tr').forEach((tr) => { const id = Number(tr.dataset.employeeId); e.target.checked ? view.selected.add(id) : view.selected.delete(id); });
  render();
});
$('#tbody').addEventListener('change', (e) => {
  if (!e.target.classList.contains('row-check')) return;
  const id = Number(e.target.closest('tr').dataset.employeeId);
  e.target.checked ? view.selected.add(id) : view.selected.delete(id);
  render();
});
$('#tbody').addEventListener('click', (e) => {
  const b = e.target.closest('button[data-act]'); if (!b) return;
  const p = people.find((x) => x.id === Number(b.closest('tr').dataset.employeeId));
  if (b.dataset.act === 'view') openDetail(p);
  if (b.dataset.act === 'edit') openForm(p);
  if (b.dataset.act === 'delete') askDelete([p.id], `¿Eliminar a ${p.first} ${p.last} (legajo ${p.id})?`);
});

/* ---------------- Acciones masivas ---------------- */
$('#bulkApply').addEventListener('click', () => {
  const action = $('#bulkAction').value;
  if (!action) return snack('Elegí una acción masiva');
  const ids = [...view.selected];
  if (action === 'delete') return askDelete(ids, `¿Eliminar a ${ids.length} persona${ids.length === 1 ? '' : 's'}?`);
  people.forEach((p) => { if (view.selected.has(p.id)) p.status = action; });
  view.selected.clear(); $('#bulkAction').value = '';
  snack(`${ids.length} persona${ids.length === 1 ? '' : 's'} actualizada${ids.length === 1 ? '' : 's'}`);
  render();
});

/* ---------------- Confirmación de borrado ---------------- */
let toDelete = [];
function askDelete(ids, msg) {
  toDelete = ids;
  $('#confirmMsg').textContent = msg + ' Esta acción no se puede deshacer.';
  $('#confirmInput').value = '';
  $('#confirmOk').disabled = true;
  $('#confirmDlg').showModal();
  $('#confirmInput').focus();
}
$('#confirmInput').addEventListener('input', (e) => ($('#confirmOk').disabled = e.target.value !== 'ELIMINAR'));
$('#confirmCancel').addEventListener('click', () => $('#confirmDlg').close());
$('#confirmOk').addEventListener('click', () => {
  people = people.filter((p) => !toDelete.includes(p.id));
  toDelete.forEach((id) => view.selected.delete(id));
  $('#confirmDlg').close(); closeDetail();
  snack(toDelete.length === 1 ? 'Persona eliminada' : `${toDelete.length} personas eliminadas`);
  $('#bulkAction').value = '';
  render();
});

/* ---------------- Panel de detalle ---------------- */
function openDetail(p) {
  $('#detailBody').innerHTML = `
    <h2 data-testid="detail-name">${esc(p.first)} ${esc(p.last)}</h2>
    <span class="status ${p.status}" data-testid="detail-status">${STATUS_LABEL[p.status]}</span>
    <dl>
      <dt>Legajo</dt><dd data-testid="detail-id">${p.id}</dd>
      <dt>Email</dt><dd data-testid="detail-email">${esc(p.email)}</dd>
      <dt>Teléfono</dt><dd data-testid="detail-phone">${esc(p.phone)}</dd>
      <dt>Nacimiento</dt><dd data-testid="detail-birth">${fmtDate(p.birth)}</dd>
      <dt>Área</dt><dd data-testid="detail-dept">${p.dept}</dd>
      <dt>Cargo</dt><dd data-testid="detail-role">${p.role}</dd>
      <dt>Ingreso</dt><dd data-testid="detail-start">${fmtDate(p.start)}</dd>
      <dt>Salario</dt><dd data-testid="detail-salary">${money(p.salary)}</dd>
      <dt>Modalidad</dt><dd data-testid="detail-mode">${MODE_LABEL[p.mode]}</dd>
    </dl>
    <button class="btn primary" data-testid="detail-edit" id="detailEdit">Editar</button>`;
  $('#detailEdit').onclick = () => openForm(p);
  $('#detail').classList.add('open');
  $('#detail').setAttribute('aria-hidden', 'false');
}
function closeDetail() { $('#detail').classList.remove('open'); $('#detail').setAttribute('aria-hidden', 'true'); }
$('#closeDetail').addEventListener('click', closeDetail);

/* ---------------- Formulario ---------------- */
const form = $('#empForm');
const F = (n) => form.elements[n];
let editingId = null;

function fillDepts() {
  const opts = Object.keys(DEPTS).map((d) => `<option>${d}</option>`).join('');
  $('#fDept').innerHTML = '<option value="">Todas las áreas</option>' + opts;
  F('dept').innerHTML = '<option value="">Seleccioná…</option>' + opts;
}
function fillRoles(dept, selected) {
  const role = F('role');
  if (!dept) { role.innerHTML = '<option value="">Primero elegí un área</option>'; role.disabled = true; return; }
  role.disabled = false;
  role.innerHTML = '<option value="">Seleccioná…</option>' + DEPTS[dept].map((r) => `<option ${r === selected ? 'selected' : ''}>${r}</option>`).join('');
}
F('dept').addEventListener('change', (e) => fillRoles(e.target.value));

function switchFormTab(name) {
  $$('.ftab').forEach((t) => { t.classList.toggle('active', t.dataset.ftab === name); t.setAttribute('aria-selected', t.dataset.ftab === name); });
  $$('.fpanel').forEach((p) => p.classList.toggle('active', p.dataset.fpanel === name));
}
$$('.ftab').forEach((t) => t.addEventListener('click', () => switchFormTab(t.dataset.ftab)));

function openForm(p) {
  editingId = p ? p.id : null;
  form.reset();
  clearErrors();
  $('#empTitle').textContent = p ? `Editar legajo ${p.id}` : 'Agregar persona';
  $('#saveEmp').textContent = p ? 'Guardar cambios' : 'Agregar';
  if (p) {
    ['first', 'last', 'email', 'phone', 'birth', 'start', 'status'].forEach((k) => (F(k).value = p[k]));
    F('salary').value = p.salary;
    F('dept').value = p.dept;
    fillRoles(p.dept, p.role);
    form.querySelector(`input[name="mode"][value="${p.mode}"]`).checked = true;
  } else fillRoles('');
  switchFormTab('personal');
  $('#empDialog').showModal();
  F('first').focus();
}
$('#addBtn').addEventListener('click', () => openForm(null));
$('#cancelEmp').addEventListener('click', () => $('#empDialog').close());

function clearErrors() {
  $$('[data-err]').forEach((e) => (e.textContent = ''));
  $$('#empForm .invalid').forEach((e) => e.classList.remove('invalid'));
  $$('.dot').forEach((d) => d.classList.add('hidden'));
  $('#formAlert').classList.add('hidden');
}
function err(name, msg) {
  form.querySelector(`[data-err="${name}"]`).textContent = msg;
  F(name).classList.add('invalid');
}
function yearsBetween(a, b) {
  const x = new Date(a + 'T00:00'), y = new Date(b + 'T00:00');
  let n = y.getFullYear() - x.getFullYear();
  if (y < new Date(y.getFullYear(), x.getMonth(), x.getDate())) n--;
  return n;
}

form.addEventListener('submit', (e) => {
  e.preventDefault();
  clearErrors();
  const v = (k) => F(k).value.trim();
  const errs = { personal: 0, work: 0 };
  const bad = (tab, name, msg) => { errs[tab]++; err(name, msg); };
  const nameRx = /^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ' -]{2,}$/;
  const todayISO = localISO(new Date());

  if (!nameRx.test(v('first'))) bad('personal', 'first', 'Solo letras, mínimo 2');
  if (!nameRx.test(v('last'))) bad('personal', 'last', 'Solo letras, mínimo 2');
  if (!/^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i.test(v('email'))) bad('personal', 'email', 'Email inválido');
  else if (people.some((p) => p.email.toLowerCase() === v('email').toLowerCase() && p.id !== editingId)) bad('personal', 'email', 'Ese email ya está registrado');
  if (!/^0?9\d{7}$|^\d{8}$/.test(v('phone').replace(/\s/g, ''))) bad('personal', 'phone', 'Celular (09XXXXXXX) o fijo de 8 dígitos');
  if (!v('birth')) bad('personal', 'birth', 'Indicá la fecha');
  else if (yearsBetween(v('birth'), todayISO) < 18) bad('personal', 'birth', 'Debe ser mayor de 18 años');

  if (!v('dept')) bad('work', 'dept', 'Elegí un área');
  if (!v('role')) bad('work', 'role', 'Elegí un cargo');
  if (!v('start')) bad('work', 'start', 'Indicá la fecha de ingreso');
  else if (v('start') > todayISO) bad('work', 'start', 'No puede ser una fecha futura');
  else if (v('birth') && yearsBetween(v('birth'), v('start')) < 18) bad('work', 'start', 'Debía tener 18 años al ingresar');
  const sal = v('salary');
  if (!/^\d+$/.test(sal)) bad('work', 'salary', 'Solo números, sin puntos');
  else if (Number(sal) < 25000 || Number(sal) > 500000) bad('work', 'salary', 'Debe estar entre 25.000 y 500.000');

  if (errs.personal || errs.work) {
    if (errs.personal) form.querySelector('[data-dot="personal"]').classList.remove('hidden');
    if (errs.work) form.querySelector('[data-dot="work"]').classList.remove('hidden');
    $('#formAlert').classList.remove('hidden');
    switchFormTab(errs.personal ? 'personal' : 'work');
    return;
  }

  const data = {
    first: v('first'), last: v('last'), email: v('email').toLowerCase(), phone: v('phone').replace(/\s/g, ''),
    birth: v('birth'), dept: v('dept'), role: v('role'), start: v('start'), salary: Number(sal),
    status: v('status'), mode: form.querySelector('input[name="mode"]:checked').value,
  };
  const btn = $('#saveEmp');
  btn.disabled = true; btn.textContent = 'Guardando…';
  setTimeout(() => {
    btn.disabled = false;
    if (editingId) {
      const p = people.find((x) => x.id === editingId);
      Object.assign(p, data);
      if ($('#detail').classList.contains('open')) openDetail(p);
      snack('Cambios guardados');
    } else {
      people.push({ id: nextId++, ...data });
      snack(`Persona agregada con legajo ${nextId - 1}`);
    }
    $('#empDialog').close();
    render();
  }, 600);
});

/* ---------------- Snackbar ---------------- */
let snackTimer;
function snack(msg) {
  const s = $('#snack'); s.textContent = msg; s.classList.add('show');
  clearTimeout(snackTimer); snackTimer = setTimeout(() => s.classList.remove('show'), 2800);
}

fillDepts();
render();
