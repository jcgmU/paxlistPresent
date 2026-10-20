const section = document.querySelector<HTMLElement>('[data-show]');
const device = section?.querySelector<HTMLElement>('[data-device]');
const ui = section?.querySelector<HTMLElement>('[data-ui]');

const desktop = matchMedia('(min-width: 1024px)');
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)');

// Pantalla del iPad en foto-3 (1672×941) y tamaño lógico de la interfaz.
const IMG = { w: 1672, h: 941, x: 348, y: 136, sw: 978, sh: 646, r: 20 };
const UI_W = 900;

type Lens = 'none' | 'inf' | 'ssr' | 'wchr';
const LENS_LABEL: Record<Lens, string> = { none: '', inf: 'INF', ssr: 'SSR', wchr: 'WCHR' };

const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));

let step = 1;
let manual: { lens?: Lens; attended?: boolean; meal?: number | null } = {};
let raf = 0;

function layout() {
  if (!device || !ui) return;
  const props = ['--dx', '--dy', '--dw', '--dh', '--dr'];
  if (!desktop.matches) {
    props.forEach((p) => device.style.removeProperty(p));
    ui.style.removeProperty('--k');
    return;
  }
  const vw = innerWidth;
  const vh = innerHeight;
  const k = Math.max(vw / IMG.w, vh / IMG.h);
  const ox = (vw - IMG.w * k) / 2;
  const oy = (vh - IMG.h * k) / 2;
  device.style.setProperty('--dx', `${ox + IMG.x * k}px`);
  device.style.setProperty('--dy', `${oy + IMG.y * k}px`);
  device.style.setProperty('--dw', `${IMG.sw * k}px`);
  device.style.setProperty('--dh', `${IMG.sh * k}px`);
  device.style.setProperty('--dr', `${IMG.r * k}px`);
  ui.style.setProperty('--k', String((IMG.sw * k) / UI_W));
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
  const p = progress();
  const next = Math.min(4, Math.floor(p * 4) + 1);
  const local = clamp(p * 4 - (next - 1));
  if (next !== step) {
    step = next;
    manual = {};
  }

  const autoLens: Lens = step === 3 ? (local < 0.34 ? 'inf' : local < 0.67 ? 'ssr' : 'wchr') : 'none';
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
    if (on) count = Number(b.querySelector('b')?.textContent ?? 0);
  });
  if (chip) {
    chip.hidden = lens === 'none';
    chip.textContent = `Filtro: ${LENS_LABEL[lens]} · ${count}`;
  }
  const legend = ui.querySelector<HTMLElement>('[data-legend-match]');
  if (legend) {
    legend.textContent = lens === 'none' ? 'Coincide' : `Coincide (${count} ${count === 1 ? 'asiento' : 'asientos'}) · ${LENS_LABEL[lens]}`;
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
  scrollTo({ top: top + ((n - 1) / 4 + 0.002) * total, behavior: reduceMotion.matches ? 'auto' : 'smooth' });
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
