const section = document.querySelector<HTMLElement>('[data-show]');
const device = section?.querySelector<HTMLElement>('[data-device]');
const ui = section?.querySelector<HTMLElement>('[data-ui]');

const desktop = matchMedia('(min-width: 1024px)');
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)');

// Pantalla del iPad en foto-3 (1672×941) y tamaño lógico de la interfaz.
const IMG = { w: 1672, h: 941, x: 348, y: 136, sw: 978, sh: 646, r: 20 };
const UI_W = 900;

type Lens = 'none' | 'empty' | 'inf' | 'ssr' | 'wchr';
const LENS_LABEL: Record<Lens, string> = { none: '', empty: 'Sillas vacías', inf: 'INF', ssr: 'SSR', wchr: 'WCHR' };

const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));

let step = 1;
let manual: { lens?: Lens; attended?: boolean; meal?: number | null } = {};
let raf = 0;

const stage = section?.querySelector<HTMLElement>('[data-stage]');
const backdrop = section?.querySelector<HTMLElement>('.show-backdrop');
const caption = section?.querySelector<HTMLElement>('.show-caption');

// Tramo inicial: la pantalla negra del hero se enciende y se aleja hasta quedar dentro del iPad.
const INTRO = 0.1;
const smooth = (a: number, b: number, v: number) => {
  const t = clamp((v - a) / (b - a));
  return t * t * (3 - 2 * t);
};
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

// Tamaño natural del marco y su posición final (escala kF) en coordenadas del viewport.
let geo = { w0: 1, h0: 1, x: 0, y: 0, kF: 1 };

function layout() {
  if (!device || !ui || !section) return;
  const vw = innerWidth;
  const vh = innerHeight;
  if (desktop.matches) {
    const k = Math.max(vw / IMG.w, vh / IMG.h);
    const ox = (vw - IMG.w * k) / 2;
    const oy = (vh - IMG.h * k) / 2;
    device.style.setProperty('--dw', `${IMG.sw * k}px`);
    device.style.setProperty('--dh', `${IMG.sh * k}px`);
    device.style.setProperty('--dr', `${IMG.r * k}px`);
    ui.style.setProperty('--k', String((IMG.sw * k) / UI_W));
    const map = ui.querySelector<HTMLElement>('.ui-map');
    const fus = ui.querySelector<HTMLElement>('.fus');
    if (map && fus) ui.style.setProperty('--fit', String(Math.min(1, map.clientHeight / fus.offsetHeight)));
    geo = { w0: IMG.sw * k, h0: IMG.sh * k, x: ox + IMG.x * k, y: oy + IMG.y * k, kF: 1 };
  } else {
    ['--dw', '--dh', '--dr'].forEach((p) => device.style.removeProperty(p));
    ui.style.removeProperty('--k');
    ui.style.removeProperty('--fit');
    // En teléfonos el marco se reduce lo necesario para que no choque con el pie del paso.
    const w0 = device.offsetWidth;
    const h0 = device.offsetHeight;
    const avail = (caption ? caption.offsetTop + 56 : vh) - 76 - 8;
    const kF = clamp(avail / h0, 0.62, 1);
    geo = { w0, h0, x: (vw - w0 * kF) / 2, y: 76, kF };
  }
}

function place(p: number) {
  if (!device || !stage) return;
  const live = section!.getBoundingClientRect().top <= 1;
  stage.toggleAttribute('data-live', live);
  const vw = innerWidth;
  const vh = innerHeight;
  const intro = reduceMotion.matches ? 1 : clamp(p / INTRO);
  const e = smooth(0.25, 1, intro);
  const s0 = Math.max(vw / geo.w0, vh / geo.h0);
  const sc = lerp(s0, geo.kF, e);
  const x = lerp((vw - geo.w0 * s0) / 2, geo.x, e);
  const y = lerp((vh - geo.h0 * s0) / 2, geo.y, e);
  device.style.transform = `translate3d(${x}px, ${y}px, 0) scale(${sc})`;
  if (ui) ui.style.opacity = String(smooth(0, 0.3, intro));
  if (backdrop) backdrop.style.opacity = String(smooth(0.3, 1, intro));
  if (caption) caption.style.opacity = String(smooth(0.7, 1, intro));
}

function progress() {
  if (!section) return 0;
  const r = section.getBoundingClientRect();
  const total = r.height - innerHeight;
  return total > 0 ? clamp(-r.top / total) : 0;
}

function render() {
  raf = 0;
  if (!section || !ui) return;
  const raw = progress();
  place(raw);
  const p = clamp((raw - INTRO) / (1 - INTRO));
  const next = Math.min(4, Math.floor(p * 4) + 1);
  const local = clamp(p * 4 - (next - 1));
  if (next !== step) {
    step = next;
    manual = {};
  }

  const autoLens: Lens = step === 3 ? (['empty', 'inf', 'ssr', 'wchr'] as const)[Math.min(3, Math.floor(local * 4))] : 'none';
  const lens = manual.lens ?? autoLens;
  const attended = manual.attended ?? (step === 4 && local >= 0.45);
  const meal = manual.meal !== undefined ? manual.meal : step === 4 && local >= 0.8 ? 1 : null;

  ui.dataset.step = String(step);
  ui.dataset.lens = lens;
  if (attended) ui.setAttribute('data-attended', '');
  else ui.removeAttribute('data-attended');

  const chip = ui.querySelector<HTMLElement>('[data-filter-chip]');
  const lensButtons = ui.querySelectorAll<HTMLButtonElement>('[data-lens-btn]');
  let count = 0;
  lensButtons.forEach((b) => {
    const on = b.dataset.lensBtn === lens;
    b.setAttribute('aria-pressed', String(on));
    if (on) count = Number(b.querySelector('.lens-n')?.textContent ?? 0);
  });
  if (chip) {
    chip.hidden = lens === 'none';
    chip.textContent = `Filtro: ${LENS_LABEL[lens]} · ${count}`;
  }
  const legend = ui.querySelector<HTMLElement>('[data-legend-match]');
  if (legend) {
    legend.textContent = `Coincide (${count} ${count === 1 ? 'asiento' : 'asientos'})`;
  }

  const card = ui.querySelector<HTMLElement>('[data-nps-card]');
  const attend = ui.querySelector<HTMLButtonElement>('[data-attend]');
  if (card) {
    if (attended) card.setAttribute('data-done', '');
    else card.removeAttribute('data-done');
  }
  attend?.setAttribute('aria-pressed', String(attended));

  ui.querySelectorAll<HTMLButtonElement>('[data-meal]').forEach((b) => {
    const i = Number(b.dataset.meal);
    const stock = Number(b.dataset.stock);
    const on = meal === i;
    b.setAttribute('aria-pressed', String(on));
    const rest = b.querySelector('[data-rest]');
    if (rest) rest.textContent = String(on ? stock - 1 : stock);
  });

  section.querySelectorAll<HTMLElement>('[data-cap]').forEach((el) => {
    el.hidden = Number(el.dataset.cap) !== step;
  });
  if (!desktop.matches) layout();
  const n = section.querySelector('[data-cap-n]');
  if (n) n.textContent = String(step);
  section.querySelectorAll<HTMLButtonElement>('[data-go]').forEach((b) => {
    if (Number(b.dataset.go) === step) b.setAttribute('aria-current', 'step');
    else b.removeAttribute('aria-current');
  });
}

function schedule() {
  if (!raf) raf = requestAnimationFrame(render);
}

function goTo(n: number) {
  if (!section) return;
  const top = section.getBoundingClientRect().top + scrollY;
  const total = section.offsetHeight - innerHeight;
  scrollTo({ top: top + (INTRO + (1 - INTRO) * ((n - 1) / 4 + 0.002)) * total, behavior: reduceMotion.matches ? 'auto' : 'smooth' });
}

if (section && ui) {
  layout();
  render();
  addEventListener('scroll', schedule, { passive: true });
  addEventListener('resize', () => {
    layout();
    schedule();
  });
  desktop.addEventListener('change', layout);

  section.querySelectorAll<HTMLButtonElement>('[data-go]').forEach((b) => b.addEventListener('click', () => goTo(Number(b.dataset.go))));

  ui.querySelectorAll<HTMLButtonElement>('[data-lens-btn]').forEach((b) =>
    b.addEventListener('click', () => {
      const name = b.dataset.lensBtn as Lens;
      manual.lens = ui.dataset.lens === name ? 'none' : name;
      render();
    }),
  );
  ui.querySelector<HTMLButtonElement>('[data-attend]')?.addEventListener('click', () => {
    manual.attended = !ui.hasAttribute('data-attended');
    render();
  });
  ui.querySelectorAll<HTMLButtonElement>('[data-meal]').forEach((b) =>
    b.addEventListener('click', () => {
      const i = Number(b.dataset.meal);
      manual.meal = b.getAttribute('aria-pressed') === 'true' ? null : i;
      render();
    }),
  );
  ui.querySelectorAll<HTMLElement>('.kit-row').forEach((row) =>
    row.querySelectorAll<HTMLButtonElement>('.size').forEach((b) =>
      b.addEventListener('click', () => {
        row.querySelectorAll('.size').forEach((o) => o.setAttribute('aria-pressed', 'false'));
        b.setAttribute('aria-pressed', 'true');
      }),
    ),
  );
}
