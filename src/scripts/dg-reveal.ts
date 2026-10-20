const figures = document.querySelectorAll<HTMLElement>('.dg[data-dg]');

if ('IntersectionObserver' in window) {
  // data-play: entrada única. data-live: el flujo se anima solo mientras el diagrama está visible.
  const io = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        const el = entry.target;
        if (entry.isIntersecting) el.setAttribute('data-play', '');
        el.toggleAttribute('data-live', entry.isIntersecting);
      }
    },
    { threshold: 0.2 },
  );

  figures.forEach((figure) => {
    figure.setAttribute('data-js', '');
    io.observe(figure);
  });
}
