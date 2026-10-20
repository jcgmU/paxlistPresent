# Storytelling de la landing — Avianca SeatMap Pro (v2: producto + backend)

Landing para la presentación de mañana. Cuenta **un mismo vuelo dos veces**: primero desde la cabina (lo que ve la tripulante) y luego desde el dato (lo que hace posible que funcione sin red). El backend no es un anexo: es el segundo acto.

## 0. Supuestos y reglas

- **Audiencia mixta:** operaciones / experiencia de cabina (deciden) y TI / arquitectura (validan). Por eso hay dos capas: la historia se entiende sin saber de tecnología, y cada pieza técnica tiene un "detalle para TI" desplegable.
- **Duración:** 10 min completa, 6 min en modo corto (se salta el Acto V).
- **Honestidad (regla de `PRODUCT.md`):** hoy todo son datos de demostración; backend, offline y P2P **están diseñados, no implementados**. Cada pieza lleva una etiqueta de estado visible: **Construido** (verde), **Diseñado** (neutro) o **Por confirmar** (ámbar). Sin cifras, testimonios ni logos de sistemas inventados.
- **Estética:** manda el `DESIGN.md` de la raíz (cabina nocturna grafito, una brasa roja, Outfit + Hanken Grotesk, sin emojis, 44 px táctil, AA). Las referencias de `design-refs/` solo aportan composición.

## 1. Idea central

> **La cabina de un vistazo, incluso sin conexión.**
> El manifiesto pasa de ser una tabla que se lee a ser un mapa que se entiende, y funciona a 10 horas del suelo.

**Hilo conductor:** el vuelo. Una **línea de ruta fija** arriba (origen → destino) con un punto que avanza al hacer scroll, con dos carriles: **Cabina** (acto I–IV) y **Dato** (acto V–VII). La ruta es el elemento dominante del producto, así que ancla la landing.

**Metáfora que une producto y backend:** el sistema vive las mismas **tres fases** que el vuelo, y la landing las muestra dos veces.

| Fase | En la cabina (Actos I–IV) | En el dato (Actos V–VII) |
|---|---|---|
| Tierra, embarque | Abre el vuelo y ve a quién viene | El iPad descarga el manifiesto en 10–15 min |
| En el aire, sin red | Atiende, filtra, toma comandas | Todo se guarda y se sincroniza entre iPads, sin internet |
| Tierra, desembarque | Cierra el servicio | Se sube todo a tierra sin duplicar ni perder nada |

Personaje: una **tripulante de cabina** en un vuelo nocturno (sin nombre ni foto de stock). Cada acto responde una pregunta que ella se hace.

## 2. Arco narrativo completo

| Acto | Sección | Pregunta | Mensaje | Prueba en pantalla | Estado |
|---|---|---|---|---|---|
| I | 1 Hero | ¿Qué es esto? | Toda la cabina, de un vistazo | Mapa real, vivo | Construido |
| I | 2 Pre-vuelo | ¿Por qué hoy cuesta? | El manifiesto es una tabla de códigos | Tabla → mapa | Construido |
| II | 3 Embarque | ¿Quién viene? | Cada asiento sabe quién es | Élite e insignias, perfil | Construido |
| III | 4 Crucero | ¿Qué atiendo primero? | Pregúntale al mapa | Filtros INF/SSR/comidas/códigos | Construido |
| IV | 5 Servicio | ¿Quién tuvo un mal vuelo? ¿Cuánto queda? | Recuperar el servicio y la comanda | NPS + comanda + kit | Construido (datos demo) |
| V | 6 El dato llega | ¿De dónde sale todo esto? | Un backend junta seis sistemas en uno | Mapa de fuentes → BFF → iPad | Diseñado |
| VI | 7 Sin red | ¿Y si no hay internet? | Cada iPad lleva el vuelo completo | 3 iPads sincronizando entre sí | Diseñado |
| VII | 8 Al aterrizar | ¿Se pierde algo? | Todo se sube una sola vez, sin duplicados | Outbox → reconcile → NPS/catering | Diseñado |
| VIII | 9 Confianza | ¿Es seguro con datos personales? | Solo iPads corporativos, datos cifrados, purga | Capas de seguridad + privacidad | Diseñado / Por confirmar |
| IX | 10 Ruta | ¿Qué falta? | Hoy demo; esto sigue | Roadmap + bloqueantes | Mixto |
| X | 11 Aterrizaje | ¿Qué decidimos? | Probémoslo en un vuelo | 3 decisiones | n/a |

## 3. Guion por pantalla

### Acto I — Pre-vuelo

**1 · Hero.** Titular: *Toda la cabina, de un vistazo.* Sub: *Avianca SeatMap Pro, el apoyo a bordo para la tripulación. Funciona incluso sin conexión.* Visual: mapa real con la cabina Business en foco, glow rojo en la nariz del fuselaje. CTA: **Ver un vuelo** (píldora blanca) + **Abrir la demo**. Entrada: fade + subida 300 ms. Referencia: SpaceX (pantalla completa) + Ferrari (un solo rojo, escaso).

**2 · Pre-vuelo.** Titular: *Hoy, la información llega como una tabla.* Copy: asiento, nombre y una fila de códigos (GFML, WCHR, INF, PETC); para saber a quién atender hay que leer, cruzar y recordar. Visual: manifiesto crudo que, al hacer scroll, "cae" fila por fila en su asiento y se disuelve en el mapa (scrub ligado al scroll, ≤ 1.2 s). Puente: *Mismos datos. Otra forma de leerlos.* No decir: porcentajes de ahorro.

### Acto II — Embarque

**3 · Cada asiento sabe quién es.** Titular: *Sabes quién viaja antes de llegar a su fila.* Copy: Diamond y Gold se ven sin abrir nada; el color marca estatus, no decora. Visual: zoom a Business con corona/estrella y leyenda; tocar un asiento abre el perfil real. **Chip "De dónde sale":** LifeMiles CRM. Línea pequeña: señal doble (color + insignia) por accesibilidad.

### Acto III — Crucero

**4 · Pregúntale al mapa.** Titular: *¿Dónde están los infantes? Tócalo.* Copy: INF, SSR, comidas y cada código se vuelven un filtro; el mapa atenúa el resto y cuenta los asientos. Visual: **demo interactiva embebida** con las tarjetas reales de Estadísticas (INF → SSR → WCHR → quitar; "Sillas vacías" en verde/ámbar). Móvil: la barra de Estadísticas queda abajo, plegada. **Chip "De dónde sale":** reservas (GDS/PNR).

### Acto IV — Servicio

**5 · Servicio.** Dos escenas seguidas.
- *Un mal vuelo anterior no tiene por qué repetirse.* Asiento con alerta NPS (única animación en bucle del sistema) → **Atención ofrecida** → check verde. Chip: Salesforce NPS.
- *Toma la comanda sin contar platos.* Opciones siempre visibles, la elegida en verde, "N rest." por opción, stock compartido por vuelo; kit de confort (pijama/sleepers, S/M, L/XL, XXL). Botón de Comanda blanco → rojo → verde. Chip: Catering/Provisioning.

### Acto V — El dato llega (Tierra, embarque)

**6 · Un backend junta seis sistemas en uno.**
- **Titular:** *La tripulante ve un mapa. Detrás hay seis sistemas.*
- **Copy plano:** un servicio intermedio (BFF) consulta en paralelo el sistema de abordaje, las reservas, LifeMiles, Salesforce, catering y el rol de la tripulación, y entrega un solo paquete pequeño por vuelo.
- **Visual:** diagrama animado (SVG/HyperFrames) con los seis sistemas a la izquierda, el BFF al centro y tres iPads a la derecha. Los paquetes viajan de izquierda a derecha; un sistema se "apaga" y el BFF sigue entregando (degradación parcial).
- **Datos duros del diseño (se pueden decir):** ventana de conexión real de 10–15 min; paquete < 200 KB comprimido, sin fotos; descarga incremental (**Delta Sync**) en vez de completa; cada vuelo se consulta una sola vez a los sistemas legacy (caché).
- **Detalle para TI (desplegable):** NestJS + PostgreSQL; `ManifestAggregatorService` con Circuit Breaker por adapter; caché por `{flightId, flightDate}`; `sync_version` monotónico con *tombstones* para no-shows (`410 Gone` fuerza descarga completa); contrato OpenAPI 3.1 + errores RFC 9457.
- **Estado:** Diseñado. **Por confirmar:** si el sistema de abordaje entrega por API o por mensajes PNL/ADL vía SITA (A1).

### Acto VI — Sin red (en el aire)

**7 · Cada iPad lleva el vuelo completo.**
- **Titular:** *Diez horas sin internet. La cabina no se entera.*
- **Copy plano:** al embarcar, el iPad guarda todo el vuelo en una base de datos cifrada local. En el aire lee y escribe solo ahí. Los tres iPads de la tripulación se pasan los cambios entre sí (Bluetooth / Wi-Fi Direct o la red del avión), así que si un iPad registra que se agotó el plato, los otros lo saben al instante.
- **Visual:** tres iPads en cabina; se toma una comanda en uno y la barra "N rest." baja en los otros dos con un hilo de luz entre ellos. Un recuadro "Sin conexión" en el carril de ruta, sin dramatismo.
- **Cómo no se pelean los iPads (frase de una línea, detalle en desplegable):** cada cambio lleva un reloj lógico (no la hora del iPad, que se desfasa) y las comandas se combinan sin conflictos; si dos iPads toman el último plato, gana el evento más antiguo y gana igual en los tres.
- **Detalle para TI:** SQLite nativo + SQLCipher (sin PowerSync ni RxDB); Hybrid Logical Clock con desempate por `deviceId`; OR-Set de comandas con máquina de estados; topología en estrella con prioridad P2P firmada (Purser = host); A320: Wi-Fi local preferido con MPC de respaldo, B787: Multipeer; plugin nativo Swift `@avianca/capacitor-multipeer`.
- **Estado:** Diseñado. **Por confirmar:** aislamiento de clientes en el Wi-Fi del A320 (A4) y access point del B787 (A5).

### Acto VII — Al aterrizar

**8 · Todo se sube una sola vez.**
- **Titular:** *Al aterrizar, todo cuadra.*
- **Copy plano:** con señal, cada iPad sube lo que él mismo originó. Aunque los tres suban la misma comanda, el servidor la reconoce y queda una sola vez. Lo que falle se aparta para revisión, no se pierde. Luego el iPad borra los datos del vuelo.
- **Visual:** los tres iPads suben paquetes; el servidor muestra "3 recibidos → 1 registro" y una pila "Para revisión" con un caso apartado. Después, dos flechas de salida: **Catering** (conciliación de inventario y demanda) y **Salesforce** (cierre de casos NPS para que Servicio al Cliente no duplique compensaciones).
- **Detalle para TI:** Transactional Outbox; `POST /sync/reconcile` con respuesta por transacción y `sync_dead_letter`; idempotencia en dos niveles (`transactionId` de transporte + `entityId` de negocio); las réplicas P2P no entran al Outbox; `nps_recoveries` con estado `PENDING_CRM / SENT / FAILED`; la telemetría entra solo por el Outbox.
- **Disponibilidad (frase clave):** *el sistema tolera el backend caído por diseño; los iPads vuelan solos y reintentan.* Lo que sí exige el backend es **no perder datos** (backups + PITR + dead-letter).
- **Estado:** Diseñado. **Por confirmar:** proceso de cierre de casos NPS en Salesforce (A3).

### Acto VIII — Confianza

**9 · Seguro con datos personales.**
- **Titular:** *Datos de salud y de viajeros, tratados como lo que son.*
- **Copy plano:** el manifiesto incluye nombres, viajero frecuente y solicitudes médicas. Solo entran iPads corporativos; la tripulante inicia sesión con su cuenta de Avianca; en el aire la sesión funciona sin red; los datos del vuelo se cifran y se borran al terminar.
- **Visual:** capas concéntricas alrededor del iPad (dispositivo → persona → vuelo → dato), cada una con su mecanismo en una línea.
- **Detalle para TI:** mTLS con certificados del MDM; OIDC contra el IdP corporativo; *Flight Session Token* firmado y validable offline (vence en llegada estimada + 6 h); SSL pinning sobre CA intermedia con doble pin y kill-switch por MDM; RBAC del portal (`CATERING_EDITOR`, `OPS_VIEWER`, `ADMIN`); purga por vuelo tras el reconcile (tope 24 h); `audit_log`.
- **Estado:** Diseñado. **Por confirmar:** IdP y viabilidad de mTLS con MDM (A6). **Gate del piloto:** sesión Legal/DPO y DPIA de la ruta BOG–MAD (A7).

### Acto IX — Ruta

**10 · Qué es real hoy y qué falta.**
- **Titular:** *Hoy es una demo funcional. Esto es lo que falta para volarla.*
- **Visual:** línea de tiempo con tres estados (verde/ neutro/ ámbar) y fases solapadas, tomadas del roadmap v3:

| Fase | Contenido | Duración |
|---|---|---|
| Hecho | App completa con datos demo | (hecho) |
| 0 · Descubrimiento | Confirmar sistema de abordaje, IdP+mTLS, rostering, infra; sesión legal; borrador OpenAPI | 2 sem |
| 1 · Backend y fundamentos | BFF (auth, delta sync, reconcile, modelo PG), esquema SQLite, portal de catering en paralelo | 5 sem (portal 3 sem) |
| 2 · P2P nativo | Plugin Swift: prototipo, dispositivos reales, hardening con MDM | 6 sem |
| 3 · Lógica P2P | HLC + CRDT, prioridad firmada, Outbox y telemetría | 5 sem |
| 4 · Seguridad y QA | SQLCipher, mTLS + pinning, pruebas en iPads, migración y carga | solapa con 2–3 |
| 5 · Piloto | Ruta BOG–MAD, tras aprobar la DPIA | 2 sem |

- **Bloqueantes a nombrar sin rodeos:** A1 (cómo llega el manifiesto), A6 (identidad), A7 (legal). Con A1 y A6 resueltos en la Fase 0, el resto es ejecutable.
- **No decir:** una fecha de piloto (el plan no la fija) ni que ya funciona sin conexión.

### Acto X — Aterrizaje

**11 · Probémoslo en un vuelo.** Titular: *Probémoslo en un vuelo real.* Tres decisiones: 1) fuente del manifiesto (A1), 2) vuelo piloto y tripulación, 3) accesos a LifeMiles / Salesforce / rostering y arranque de la sesión legal. CTA: **Abrir la demo**. Cierre: el punto de la línea de ruta llega a DESTINO.

## 4. Sistema visual y motion

- **Estructura:** columna de lectura corta (≤ ~60 caracteres) + escenario con el producto real. Alternar lados. Los "detalles para TI" son un desplegable bajo cada escena técnica (cerrado por defecto) para no romper el ritmo.
- **Carriles:** Cabina (producto) con fondo `ink`; Dato (backend) con la misma paleta pero líneas finas y tipografía numérica, sin cambiar de marca. Los diagramas usan líneas `line`, nodos `glass-panel` y un solo acento rojo en el flujo activo.
- **Etiquetas de estado:** píldora de 11 px con texto (Construido / Diseñado / Por confirmar), nunca solo color.
- **Composición de referencia (`design-refs/`):** Ferrari (rojo escaso, ritmo editorial), SpaceX (secciones a pantalla completa en los actos V–VII), Apple (jerarquía y ritmo de scroll en las demos). Nada de fuentes, logos ni imágenes ajenas.
- **Motion:** 150–250 ms feedback, 300 ms entradas, ease-out exponencial. Scrub de scroll solo en el Acto I y el diagrama del Acto V. Una sola animación en bucle (alerta NPS). `prefers-reduced-motion` deja los estados finales.
- **Producto real, no maqueta:** reutilizar `app-seat-map`, `app-stats-sidebar` y `app-comanda-mode` con datos demo en los Actos I–IV.

## 5. Herramientas y su rol

| Herramienta | Uso |
|---|---|
| `impeccable-design` + `emil-design-eng` | Construir y revisar la landing con el DESIGN.md propio; motion y detalles |
| `design-refs/` (Ferrari, SpaceX, Apple) | Solo composición y ritmo |
| **HyperFrames** | (a) video de apertura de 60–90 s con las 3 fases del vuelo; (b) clips de los diagramas del backend (Actos V–VII) para incrustar en la página |
| `web-design-guidelines` | Auditoría final de la landing contra las guías de interfaz web |
| `npx impeccable detect`, Playwright, tests | Verificación: 390/768/1440 px, claro/oscuro, sin desborde |

**Video HyperFrames (opcional, si alcanza el tiempo):** 5 escenas de ~15 s — vuelo desde la cabina (mapa se llena), filtros, sin red con tres iPads, aterrizaje con "3 → 1", ruta. Sin voz en off propia ni cifras inventadas; subtítulos sobrios.

## 6. Guion de la presentación en vivo (10 min)

1. Hero (30 s) · 2. Pre-vuelo (45 s) · 3. Embarque (45 s) · 4. Crucero en vivo: INF → SSR → WCHR (90 s) · 5. NPS y comanda (75 s).
6. **Bajo el capó** (3 min): el dato llega (60 s) · sin red (70 s) · al aterrizar (50 s).
7. Confianza (45 s) · 8. Ruta y bloqueantes (60 s) · 9. Tres decisiones (30 s).

**Modo corto (6 min):** saltar el Acto V y resumir VI–VII en una frase ("los iPads se sincronizan entre sí y suben todo al aterrizar, sin duplicados").

**Plan B:** producción abierta en otra pestaña (`https://pax-list-angular.vercel.app`).

## 7. Qué no se puede afirmar

- Que el backend, el modo sin conexión o el P2P ya existen (solo hay documentos de diseño).
- Que hay cifras de ahorro, adopción o satisfacción (no hay evidencia).
- Que existe integración real con LifeMiles, Salesforce, DCS o rostering.
- Una fecha de piloto.

## 8. Pendientes antes de construirla

- Confirmar audiencia, tiempo real y si TI estará en la sala (decide si el Acto V–VII va completo).
- Dónde vive: ruta `/presentacion` dentro del Angular (reusa componentes y datos demo, recomendado) con los diagramas en SVG propio; el video HyperFrames, aparte.
- Validar con Cami los nombres de los actos y el titular del hero.
- Verificar los números del roadmap contra `ARQUITECTURA_V3.md` §14 antes de proyectarlos (las duraciones salen del diagrama de Gantt).
