const section = document.querySelector<HTMLElement>('[data-hero]');
const video = section?.querySelector<HTMLVideoElement>('[data-video]');
const media = section?.querySelector<HTMLElement>('[data-media]');
const copy = section?.querySelector<HTMLElement>('[data-copy]');
const hint = section?.querySelector<HTMLElement>('[data-hint]');
const portal = section?.querySelector<HTMLElement>('[data-portal]');
const studio = section?.querySelector<HTMLElement>('[data-studio]');

const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)');

// Pantalla del iPad en el último fotograma (1920×1080), medida sobre el video.
const FRAME = { w: 1920, h: 1080, x0: 761, y0: 474, x1: 1012, y1: 727 };
// Reparto del recorrido: el video avanza hasta SCRUB_END y el resto es la entrada al iPad.
const SCRUB_END = 0.78;

const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const smooth = (a: number, b: number, v: number) => {
  const t = clamp((v - a) / (b - a));
  return t * t * (3 - 2 * t);
};

let geo = { vw: 0, vh: 0, cx: 0, cy: 0, rw: 0, rh: 0 };
let target = 0;
let current = 0;
let raf = 0;
let unlocked = false;

function measure() {
  const vw = innerWidth;
  const vh = innerHeight;
  const k = Math.max(vw / FRAME.w, vh / FRAME.h);
  const ox = (vw - FRAME.w * k) / 2;
  const oy = (vh - FRAME.h * k) / 2;
  const x0 = ox + FRAME.x0 * k;
  const y0 = oy + FRAME.y0 * k;
  const rw = (FRAME.x1 - FRAME.x0) * k;
  const rh = (FRAME.y1 - FRAME.y0) * k;
  geo = { vw, vh, cx: x0 + rw / 2, cy: y0 + rh / 2, rw, rh };
  if (media) media.style.transformOrigin = `${geo.cx}px ${geo.cy}px`;
}

function progress() {
  if (!section) return 0;
  const r = section.getBoundingClientRect();
  const total = r.height - innerHeight;
  return total > 0 ? clamp(-r.top / total) : 0;
}

function unlockVideo() {
  if (unlocked || !video) return;
  unlocked = true;
  video.play().then(() => video.pause()).catch(() => {});
}

function render() {
  raf = 0;
  if (!section || !video || !media || !copy || !portal || !studio) return;
  const p = progress();

  const copyOpacity = 1 - smooth(0.07, 0.22, p);
  copy.style.opacity = String(copyOpacity);
  copy.style.transform = `translate3d(0, ${(1 - copyOpacity) * -28}px, 0)`;
  copy.style.visibility = copyOpacity < 0.01 ? 'hidden' : 'visible';
  if (hint) hint.style.opacity = String(1 - smooth(0, 0.05, p));

  if (video.duration) target = clamp(p / SCRUB_END) * video.duration;
  const diff = target - current;
  current = Math.abs(diff) < 1 / 48 ? target : current + diff * 0.5;
  if (!video.seeking && Math.abs(video.currentTime - current) > 1 / 120) video.currentTime = current;

  const z = clamp((p - SCRUB_END) / (1 - SCRUB_END));
  const zEase = z * z * (3 - 2 * z);
  const s = 1 + 1.1 * zEase;
  media.style.transform = z > 0 ? `scale(${s})` : '';

  const e = z * z * z;
  const w = lerp(geo.rw * s, geo.vw, e);
  const h = lerp(geo.rh * s, geo.vh, e);
  const cx = lerp(geo.cx, geo.vw / 2, e);
  const cy = lerp(geo.cy, geo.vh / 2, e);
  const sx = w / geo.vw;
  const sy = h / geo.vh;
  const radius = 12 * (1 - smooth(0.85, 1, z));
  portal.style.opacity = String(smooth(0, 0.22, z));
  portal.style.transform = `translate3d(${cx - geo.vw / 2}px, ${cy - geo.vh / 2}px, 0) scale(${sx}, ${sy})`;
  portal.style.borderRadius = `${radius / sx}px / ${radius / sy}px`;
  studio.style.opacity = String(smooth(0.55, 0.95, z));

  if (current !== target || Math.abs(video.currentTime - current) > 1 / 120) schedule();
}

function schedule() {
  if (!raf) raf = requestAnimationFrame(render);
}

function start() {
  if (reduceMotion.matches || !section || !video) return;
  measure();
  addEventListener('scroll', () => {
    unlockVideo();
    schedule();
  }, { passive: true });
  addEventListener('resize', () => {
    measure();
    schedule();
  });
  video.addEventListener('loadedmetadata', schedule);
  video.addEventListener('seeked', schedule);
  schedule();
}

start();
