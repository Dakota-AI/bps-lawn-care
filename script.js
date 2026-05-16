const year = document.getElementById('year');
if (year) year.textContent = String(new Date().getFullYear());

const cards = document.querySelectorAll('.listing-card');
if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('show');
          io.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15 }
  );

  cards.forEach((card) => io.observe(card));
} else {
  cards.forEach((card) => card.classList.add('show'));
}

document.querySelector('.contact-form')?.addEventListener('submit', (event) => {
  event.preventDefault();
  const button = event.currentTarget.querySelector('button');
  if (button) {
    button.textContent = 'Sent';
    button.disabled = true;
  }
});
