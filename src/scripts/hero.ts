const section = document.querySelector<HTMLElement>('[data-hero]');
const video = section?.querySelector<HTMLVideoElement>('[data-video]');
const media = section?.querySelector<HTMLElement>('[data-media]');
const copy = section?.querySelector<HTMLElement>('[data-copy]');
const hint = section?.querySelector<HTMLElement>('[data-hint]');
const canvas = section?.querySelector<HTMLCanvasElement>('[data-canvas]');
const blackout = section?.querySelector<HTMLElement>('[data-black]');

const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)');

// Pantalla del iPad en el último fotograma (1920×1080), medida sobre el video.
const FRAME_VIDEO = { w: 1920, h: 1080, x0: 761, y0: 474, x1: 1012, y1: 727 };
// En vertical (teléfonos) se usa una secuencia de imágenes recortada al centro: 540×960, 97 fotogramas.
const FRAME_SEQ = { w: 540, h: 960, x0: 93.3, y0: 421.3, x1: 316.4, y1: 646.2 };
const SEQ_COUNT = 97;
const seqUrl = (i: number) => `/frames/f_${String(i + 1).padStart(3, '0')}.webp`;
// Reparto del recorrido: pausa de lectura hasta SCRUB_START, video hasta SCRUB_END y luego la entrada al iPad.
const SCRUB_START = 0.2;
const SCRUB_END = 0.75;
const scrub = (p: number) => clamp((p - SCRUB_START) / (SCRUB_END - SCRUB_START));

const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const smooth = (a: number, b: number, v: number) => {
  const t = clamp((v - a) / (b - a));
  return t * t * (3 - 2 * t);
};

let geo = { vw: 0, vh: 0, cx: 0, cy: 0, rw: 0, rh: 0 };
let framesMode = false;
let FRAME = FRAME_VIDEO;
const seq: (HTMLImageElement | null)[] = new Array(SEQ_COUNT).fill(null);
let seqStarted = false;
let lastDrawn = -1;
let target = 0;
let current = 0;
let raf = 0;
let unlocked = false;

function wantFrames() {
  return matchMedia('(max-width: 899px), (orientation: portrait)').matches;
}

function loadSequence() {
  if (seqStarted) return;
  seqStarted = true;
  let next = 0;
  const worker = () => {
    const i = next++;
    if (i >= SEQ_COUNT) return;
    const img = new Image();
    img.decoding = 'async';
    img.onload = () => {
      seq[i] = img;
      lastDrawn = -1;
      schedule();
      worker();
    };
    img.onerror = worker;
    img.src = seqUrl(i);
  };
  for (let k = 0; k < 6; k++) worker();
}

function drawFrame(index: number) {
  if (!canvas || index === lastDrawn) return;
  let j = index;
  while (j >= 0 && !seq[j]) j--;
  if (j < 0) {
    j = index;
    while (j < SEQ_COUNT && !seq[j]) j++;
  }
  const img = seq[j];
  if (!img) return;
  const c = canvas.getContext('2d');
  if (!c) return;
  const k = Math.max(canvas.width / FRAME_SEQ.w, canvas.height / FRAME_SEQ.h);
  const dw = FRAME_SEQ.w * k;
  const dh = FRAME_SEQ.h * k;
  c.drawImage(img, (canvas.width - dw) / 2, (canvas.height - dh) / 2, dw, dh);
  lastDrawn = index;
}

function setMode() {
  framesMode = wantFrames();
  FRAME = framesMode ? FRAME_SEQ : FRAME_VIDEO;
  section?.setAttribute('data-mode', framesMode ? 'frames' : 'video');
  if (framesMode) {
    loadSequence();
  } else if (video && video.preload !== 'auto') {
    video.preload = 'auto';
    video.load();
  }
}

function measure() {
  const vw = innerWidth;
  const vh = innerHeight;
  if (canvas) {
    const dpr = Math.min(devicePixelRatio || 1, 2);
    canvas.width = Math.round(vw * dpr);
    canvas.height = Math.round(vh * dpr);
    lastDrawn = -1;
  }
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
  if (unlocked || !video || framesMode) return;
  unlocked = true;
  video.play().then(() => video.pause()).catch(() => {});
}

function render() {
  raf = 0;
  if (!section || !video || !media || !copy || !blackout) return;
  const p = progress();

  const copyOpacity = 1 - smooth(0.16, 0.24, p);
  copy.style.opacity = String(copyOpacity);
  copy.style.transform = `translate3d(0, ${(1 - copyOpacity) * -28}px, 0)`;
  copy.style.visibility = copyOpacity < 0.01 ? 'hidden' : 'visible';
  if (hint) hint.style.opacity = String(1 - smooth(0, 0.05, p));

  let busy = false;
  if (framesMode) {
    drawFrame(Math.round(scrub(p) * (SEQ_COUNT - 1)));
  } else {
    if (video.duration) target = scrub(p) * video.duration;
    const diff = target - current;
    current = Math.abs(diff) < 1 / 48 ? target : current + diff * 0.5;
    if (!video.seeking && Math.abs(video.currentTime - current) > 1 / 120) video.currentTime = current;
    busy = current !== target || Math.abs(video.currentTime - current) > 1 / 120;
  }

  // Entrada a la pantalla: acercamiento continuo hasta que la pantalla negra del iPad llena el viewport.
  const z = clamp((p - SCRUB_END) / (1 - SCRUB_END));
  const e = z * z * (3 - 2 * z);
  const sEnd = Math.max(geo.vw / geo.rw, geo.vh / geo.rh) * 1.08;
  const s = Math.pow(sEnd, e);
  const tx = (geo.vw / 2 - geo.cx) * e;
  const ty = (geo.vh / 2 - geo.cy) * e;
  media.style.transform = z > 0 ? `translate3d(${tx}px, ${ty}px, 0) scale(${s})` : '';
  blackout.style.opacity = String(smooth(0.72, 1, z));

  if (busy) schedule();
}

function schedule() {
  if (!raf) raf = requestAnimationFrame(render);
}

function start() {
  if (reduceMotion.matches || !section || !video) return;
  setMode();
  measure();
  addEventListener('scroll', () => {
    unlockVideo();
    schedule();
  }, { passive: true });
  addEventListener('load', () => {
    measure();
    schedule();
  });
  addEventListener('resize', () => {
    const was = framesMode;
    setMode();
    if (was !== framesMode) lastDrawn = -1;
    measure();
    schedule();
  });
  video.addEventListener('loadedmetadata', schedule);
  video.addEventListener('seeked', schedule);
  schedule();
}

start();
