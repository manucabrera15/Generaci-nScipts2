/* =========================================================
   Pizarra - tablero de tareas para practicar Page Object Model
   Datos útiles para las pruebas:
   - Hay tareas precargadas (algunas vencidas).
   - No se puede crear una tarea con título repetido.
   - La fecha de vencimiento no puede ser anterior a hoy al crear.
   - Los toasts desaparecen a los 3 segundos.
   - No se puede mover a "Hecha" una tarea con etiqueta "bug" sin descripción.
   ========================================================= */

const STATUSES = ['pendiente', 'progreso', 'hecha'];
const STATUS_LABEL = { pendiente: 'Pendiente', progreso: 'En progreso', hecha: 'Hecha' };
const PEOPLE = ['Ana Pereira', 'Bruno Silva', 'Carla Méndez', 'Diego Fernández'];

const localISO = (d) => new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
const today = () => localISO(new Date());
const addDays = (n) => { const x = new Date(); x.setDate(x.getDate() + n); return localISO(x); };

let nextId = 1;
let tasks = [
  { title: 'Automatizar login', desc: 'Casos felices y negativos.', priority: 'alta', assignee: 'Ana Pereira', due: addDays(2), tags: ['testing'], status: 'pendiente' },
  { title: 'Corregir paginado de reportes', desc: '', priority: 'alta', assignee: 'Bruno Silva', due: addDays(-3), tags: ['bug', 'backend'], status: 'progreso' },
  { title: 'Documentar API de pagos', desc: 'Swagger + ejemplos.', priority: 'baja', assignee: 'Carla Méndez', due: addDays(10), tags: ['docs'], status: 'pendiente' },
  { title: 'Script de carga con 500 usuarios', desc: 'Escenario de checkout.', priority: 'media', assignee: 'Diego Fernández', due: addDays(-1), tags: ['testing'], status: 'pendiente' },
  { title: 'Nuevo header responsive', desc: 'Mobile first.', priority: 'media', assignee: 'Ana Pereira', due: addDays(5), tags: ['frontend'], status: 'hecha' },
].map((t) => ({ ...t, id: nextId++ }));

let pendingDeleteId = null;
const $ = (s) => document.querySelector(s);
const esc = (s) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

/* ---------------- Render ---------------- */
function isOverdue(t) { return t.status !== 'hecha' && t.due < today(); }

function filtered() {
  const q = $('#filterText').value.trim().toLowerCase();
  const pr = $('#filterPriority').value;
  const as = $('#filterAssignee').value;
  const od = $('#filterOverdue').checked;
  return tasks.filter((t) =>
    (!q || t.title.toLowerCase().includes(q) || t.tags.some((g) => g.includes(q))) &&
    (!pr || t.priority === pr) && (!as || t.assignee === as) && (!od || isOverdue(t)));
}

function taskCard(t) {
  const idx = STATUSES.indexOf(t.status);
  const due = new Date(t.due + 'T00:00').toLocaleDateString('es-UY');
  return `<li class="task p-${t.priority} ${t.status === 'hecha' ? 'done' : ''}" data-testid="task-card" data-task-id="${t.id}">
    <h3 data-testid="task-card-title">${esc(t.title)}</h3>
    ${t.desc ? `<p data-testid="task-card-desc">${esc(t.desc)}</p>` : ''}
    <div class="tags">${t.tags.map((g) => `<span class="tag" data-testid="task-card-tag">${g}</span>`).join('')}</div>
    <div class="meta">
      <span data-testid="task-card-assignee">${t.assignee}</span>
      <span data-testid="task-card-due" class="${isOverdue(t) ? 'overdue' : ''}">${isOverdue(t) ? 'Vencida · ' : ''}${due}</span>
    </div>
    <span hidden data-testid="task-card-priority">${t.priority}</span>
    <div class="actions">
      <button data-act="left" data-testid="task-move-left" ${idx === 0 ? 'disabled' : ''} aria-label="Mover a la izquierda">◀</button>
      <button data-act="right" data-testid="task-move-right" ${idx === 2 ? 'disabled' : ''} aria-label="Mover a la derecha">▶</button>
      <button data-act="edit" data-testid="task-edit">Editar</button>
      <button data-act="delete" class="del" data-testid="task-delete">Eliminar</button>
    </div>
  </li>`;
}

function render() {
  const list = filtered();
  STATUSES.forEach((s) => {
    const col = list.filter((t) => t.status === s);
    const ul = document.querySelector(`[data-testid="cards-${s}"]`);
    ul.innerHTML = col.length ? col.map(taskCard).join('') : `<li class="empty-col" data-testid="empty-${s}">Sin tareas</li>`;
    document.querySelector(`[data-testid="count-${s}"]`).textContent = col.length;
  });
  const overdue = tasks.filter(isOverdue).length;
  $('#boardStats').textContent = `${tasks.length} tareas en total · ${overdue} vencida${overdue === 1 ? '' : 's'}`;
}

/* ---------------- Toasts ---------------- */
function toast(msg, type = 'ok') {
  const el = document.createElement('div');
  el.className = 'toast-item' + (type === 'warn' ? ' warn' : '');
  el.dataset.testid = 'toast';
  el.textContent = msg;
  $('#toasts').appendChild(el);
  setTimeout(() => el.remove(), 3000);
}

/* ---------------- Modal crear / editar ---------------- */
function fillAssignees() {
  $('#taskAssignee').innerHTML = '<option value="">Seleccioná…</option>' + PEOPLE.map((p) => `<option>${p}</option>`).join('');
  $('#filterAssignee').innerHTML = '<option value="">Todos los responsables</option>' + PEOPLE.map((p) => `<option>${p}</option>`).join('');
}

function clearErrors() {
  ['#errTitle', '#errAssignee', '#errDue'].forEach((e) => ($(e).textContent = ''));
  document.querySelectorAll('.invalid').forEach((e) => e.classList.remove('invalid'));
}

function openForm(task) {
  clearErrors();
  $('#taskForm').reset();
  $('#taskId').value = task ? task.id : '';
  $('#dialogTitle').textContent = task ? 'Editar tarea' : 'Nueva tarea';
  $('#saveTask').textContent = task ? 'Guardar cambios' : 'Crear tarea';
  if (task) {
    $('#taskTitle').value = task.title;
    $('#taskDesc').value = task.desc;
    document.querySelector(`input[name="priority"][value="${task.priority}"]`).checked = true;
    $('#taskAssignee').value = task.assignee;
    $('#taskDue').value = task.due;
    document.querySelectorAll('.tags input').forEach((c) => (c.checked = task.tags.includes(c.value)));
  }
  $('#titleCounter').textContent = $('#taskTitle').value.length;
  $('#taskDialog').showModal();
  $('#taskTitle').focus();
}

function validate(id) {
  clearErrors();
  let ok = true;
  const title = $('#taskTitle').value.trim();
  if (title.length < 3) { $('#errTitle').textContent = 'El título debe tener al menos 3 caracteres'; ok = false; }
  else if (tasks.some((t) => t.title.toLowerCase() === title.toLowerCase() && t.id !== id)) { $('#errTitle').textContent = 'Ya existe una tarea con ese título'; ok = false; }
  if (!ok) $('#taskTitle').classList.add('invalid');
  if (!$('#taskAssignee').value) { $('#errAssignee').textContent = 'Elegí un responsable'; $('#taskAssignee').classList.add('invalid'); ok = false; }
  const due = $('#taskDue').value;
  if (!due) { $('#errDue').textContent = 'Indicá la fecha de vencimiento'; $('#taskDue').classList.add('invalid'); ok = false; }
  else if (!id && due < today()) { $('#errDue').textContent = 'La fecha no puede ser anterior a hoy'; $('#taskDue').classList.add('invalid'); ok = false; }
  return ok;
}

$('#taskForm').addEventListener('submit', (e) => {
  e.preventDefault();
  const id = Number($('#taskId').value) || null;
  if (!validate(id)) return;
  const data = {
    title: $('#taskTitle').value.trim(),
    desc: $('#taskDesc').value.trim(),
    priority: document.querySelector('input[name="priority"]:checked').value,
    assignee: $('#taskAssignee').value,
    due: $('#taskDue').value,
    tags: [...document.querySelectorAll('.tags input:checked')].map((c) => c.value),
  };
  if (id) { Object.assign(tasks.find((t) => t.id === id), data); toast('Tarea actualizada'); }
  else { tasks.push({ ...data, id: nextId++, status: 'pendiente' }); toast('Tarea creada'); }
  $('#taskDialog').close();
  render();
});

$('#taskTitle').addEventListener('input', (e) => ($('#titleCounter').textContent = e.target.value.length));
$('#cancelTask').addEventListener('click', () => $('#taskDialog').close());
$('#newTaskBtn').addEventListener('click', () => openForm(null));

/* ---------------- Acciones de tarjeta ---------------- */
document.querySelector('.board').addEventListener('click', (e) => {
  const btn = e.target.closest('button[data-act]');
  if (!btn) return;
  const id = Number(btn.closest('.task').dataset.taskId);
  const t = tasks.find((x) => x.id === id);
  const idx = STATUSES.indexOf(t.status);
  switch (btn.dataset.act) {
    case 'left': t.status = STATUSES[idx - 1]; toast(`Movida a ${STATUS_LABEL[t.status]}`); break;
    case 'right':
      if (STATUSES[idx + 1] === 'hecha' && t.tags.includes('bug') && !t.desc) {
        toast('Un bug necesita descripción antes de cerrarse', 'warn');
        return;
      }
      t.status = STATUSES[idx + 1]; toast(`Movida a ${STATUS_LABEL[t.status]}`); break;
    case 'edit': openForm(t); return;
    case 'delete':
      pendingDeleteId = id;
      $('#confirmText').textContent = `¿Eliminar la tarea "${t.title}"? Esta acción no se puede deshacer.`;
      $('#confirmDialog').showModal();
      return;
  }
  render();
});

$('#confirmNo').addEventListener('click', () => { pendingDeleteId = null; $('#confirmDialog').close(); });
$('#confirmYes').addEventListener('click', () => {
  tasks = tasks.filter((t) => t.id !== pendingDeleteId);
  pendingDeleteId = null;
  $('#confirmDialog').close();
  toast('Tarea eliminada');
  render();
});

/* ---------------- Filtros ---------------- */
['#filterText', '#filterPriority', '#filterAssignee', '#filterOverdue'].forEach((s) => $(s).addEventListener('input', render));
$('#resetFilters').addEventListener('click', () => {
  $('#filterText').value = ''; $('#filterPriority').value = ''; $('#filterAssignee').value = ''; $('#filterOverdue').checked = false;
  render();
});

fillAssignees();
render();
