# Práctica de Page Object Model (POM)

Cinco aplicaciones web estáticas (HTML + CSS + JS, sin dependencias ni servidor) para practicar el diseño e implementación de Page Objects con Selenium, Playwright, Cypress o la herramienta que se use en el curso.

Se abren directamente con doble clic en `index.html`, o sirviendo la carpeta con cualquier servidor estático (`npx serve`, `python -m http.server`, etc.). Todos los datos viven en memoria: recargar la página vuelve al estado inicial.

Todos los elementos relevantes tienen atributo `data-testid`. Si querés que los alumnos practiquen otras estrategias de localización (CSS, XPath, texto, roles ARIA), podés pedirles que no usen `data-testid` en alguna de las apps.

---

## 1. Tienda online (`01-tienda-online`)

**Qué tiene:** catálogo con búsqueda, filtros y orden; modal de detalle con cantidad; carrito lateral (drawer) con cupones; checkout en 3 pasos con validaciones; pantalla de confirmación.

**Datos de prueba**
- Cupón válido: `DESCUENTO10` (10 %). Cupón vencido: `VERANO2025`.
- Tarjeta: 16 dígitos, vencimiento futuro `MM/AA`, CVV de 3 o 4 dígitos.
- Teléfono: 9 dígitos empezando con `09`.
- El catálogo tarda ~800 ms en cargar; la compra ~1,2 s.

**Page Objects sugeridos:** `CatalogPage`, `CheckoutPage`, `ConfirmationPage`. Componentes: `HeaderComponent`, `ProductCard`, `ProductModal`, `CartDrawer`, `FiltersPanel`.

**Ejercicios**
1. Agregar dos productos y verificar el total del carrito.
2. Aplicar cupón válido, vencido e inexistente (test parametrizado).
3. Compra completa con envío a domicilio, validando el resumen.
4. Verificar que no se pueda agregar más unidades que el stock.
5. Validar cada mensaje de error del checkout.

---

## 2. Tablero de tareas (`02-tablero-tareas`)

**Qué tiene:** tres columnas (Pendiente, En progreso, Hecha), modal de alta y edición, radios, checkboxes, fechas, filtros combinables, diálogo de confirmación y toasts que desaparecen a los 3 s.

**Reglas de negocio**
- El título es único (sin distinguir mayúsculas) y tiene de 3 a 60 caracteres.
- Al crear, la fecha de vencimiento no puede ser anterior a hoy.
- Una tarea con etiqueta `bug` y sin descripción no puede pasar a "Hecha".

**Page Objects sugeridos:** `BoardPage`. Componentes: `Toolbar`, `Column` (instanciado por estado), `TaskCard`, `TaskFormDialog`, `ConfirmDialog`, `Toast`.

**Ejercicios**
1. Crear una tarea y encontrarla en "Pendiente" por su título.
2. Moverla hasta "Hecha" y verificar los contadores.
3. Editar prioridad y etiquetas.
4. Intentar cerrar un bug sin descripción.
5. Combinar filtros y validar los resultados.

---

## 3. Reserva de vuelos (`03-reserva-vuelos`)

**Qué tiene:** wizard de 5 pasos con indicador de progreso; búsqueda con validaciones cruzadas; resultados asincrónicos con filtros y orden; mapa de asientos; formularios de pasajero generados dinámicamente.

**Reglas de negocio**
- Los vuelos y asientos ocupados son **determinísticos** para la misma ruta y fecha, así que los tests son repetibles.
- De 1 a 6 pasajeros. Hay que elegir exactamente un asiento por pasajero.
- Filas 10 y 11: salida de emergencia, US$ 40 extra por asiento.
- El primer pasajero debe ser mayor de edad. Los documentos no pueden repetirse.
- Ida y vuelta duplica el precio de los pasajes.

**Page Objects sugeridos:** `SearchPage`, `ResultsPage`, `SeatSelectionPage`, `PassengersPage`, `ConfirmationPage`. Componentes: `ProgressBar`, `FlightCard`, `SeatMap`, `PassengerForm` (uno por índice).

**Ejercicios**
1. Reserva de punta a punta con 1 pasajero, solo ida.
2. Reserva con 3 pasajeros: hay que iterar los formularios dinámicos.
3. Validar que el filtro "Directo" deje solo vuelos sin escalas.
4. Validar que el orden por precio sea ascendente.
5. Calcular el total esperado con asientos de emergencia.
6. Encadenar métodos (fluent interface): cada acción que navega devuelve el Page Object siguiente.

---

## 4. Home banking (`04-home-banking`)

**Qué tiene:** login con errores y bloqueo, navegación por pestañas, tarjetas de cuentas, transferencia con tres tipos de destino, confirmación por token, tabla de movimientos con filtros y paginado, aviso de sesión por vencer.

**Datos de prueba**
- Login válido: CI `12345678`, clave `Rambla2026`.
- Usuario bloqueado: CI `87654321`.
- 3 claves incorrectas bloquean el acceso (se resetea recargando).
- Token: `246810` (3 errores cancelan la transferencia).
- Límite por transferencia: $ 50.000 o US$ 1.500.
- Abrir con `?sesion=40` hace que la sesión dure 40 s, para probar el aviso de vencimiento.

**Page Objects sugeridos:** `LoginPage`, `DashboardPage` (con acceso a las pestañas), `AccountsTab`, `TransferTab`, `HistoryTab`. Componentes: `TransferConfirmDialog`, `ResultDialog`, `SessionDialog`, `Pagination`.

**Ejercicios**
1. Login exitoso, fallido y bloqueo tras 3 intentos.
2. Transferencia entre cuentas propias, validando ambos saldos.
3. Intentar transferir entre monedas distintas o superar el límite.
4. Validar que la transferencia aparezca primera en Movimientos.
5. Recorrer todas las páginas de movimientos y sumar importes.
6. Probar la sesión por vencer con `?sesion=40`.

---

## 5. Gestión de empleados (`05-gestion-empleados`)

**Qué tiene:** tabla con 37 registros, orden por columna, paginado con tamaño configurable, selección por fila y masiva, acciones masivas, panel lateral de detalle, formulario en dos pestañas con select dependiente, confirmación escribiendo una palabra.

**Reglas de negocio**
- Email único. Edad mínima 18. Debía tener 18 años a la fecha de ingreso.
- Salario entre 25.000 y 500.000, solo números.
- "Cargo" se habilita recién al elegir un "Área".
- Los errores marcan con un punto rojo la pestaña que los tiene.
- "Seleccionar todos" marca solo la página actual.
- Para eliminar hay que escribir `ELIMINAR`.

**Page Objects sugeridos:** `EmployeesPage`. Componentes: `EmployeesTable`, `EmployeeRow`, `Pagination`, `BulkActionsBar`, `EmployeeDetailPanel`, `EmployeeFormDialog` (con métodos por pestaña), `ConfirmDialog`, `Snackbar`.

**Ejercicios**
1. Alta completa y búsqueda por el legajo asignado.
2. Validar que el orden por salario funcione en ambos sentidos.
3. Recorrer todas las páginas contando registros "Activo".
4. Acción masiva sobre la página actual y verificación del estado.
5. Editar desde el panel de detalle y verificar que el panel se actualice.
6. Validar que se muestre la pestaña con errores al guardar.

---

## Consignas generales

- Ningún test debe tener localizadores: todos viven en los Page Objects.
- Los Page Objects no tienen asserts: devuelven datos o estado para que el test verifique.
- Modelar como componentes reutilizables las partes que se repiten (filas, tarjetas, diálogos, paginado).
- Usar esperas explícitas donde hay carga asincrónica; nunca `sleep` fijos.
- Nombrar los métodos según la intención del usuario (`addToCart`, `transferBetweenOwnAccounts`) y no según la mecánica (`clickButton3`).
