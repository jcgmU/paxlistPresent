const figures = document.querySelectorAll<HTMLElement>('.dg[data-dg]');

if ('IntersectionObserver' in window) {
  const io = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        entry.target.setAttribute('data-play', '');
        io.unobserve(entry.target);
      }
    },
    { threshold: 0.3 },
  );

  figures.forEach((figure) => {
    figure.setAttribute('data-js', '');
    io.observe(figure);
  });
}
