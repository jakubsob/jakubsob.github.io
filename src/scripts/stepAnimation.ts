const HIGHLIGHT_COLOR = "oklch(72% 0.08 145 / 0.18)";
const STEP_DELAY = 600;
const PREAMBLE_DELAY = 200;

function flash(elements: Element[]) {
  elements.forEach((el) => {
    (el as HTMLElement).style.backgroundColor = HIGHLIGHT_COLOR;
    setTimeout(() => {
      (el as HTMLElement).style.backgroundColor = "";
    }, STEP_DELAY);
  });
}

function runStepAnimation(container: HTMLElement) {
  const preambles = container.querySelectorAll<HTMLElement>(
    ".shiki .line:not([data-step])"
  );
  preambles.forEach((el) => {
    el.style.opacity = "1";
  });

  const steps = Array.from(
    new Set(
      Array.from(container.querySelectorAll<HTMLElement>(".line[data-step]")).map(
        (el) => el.dataset.step!
      )
    )
  ).sort();

  steps.forEach((step, i) => {
    setTimeout(() => {
      const paired = Array.from(
        container.querySelectorAll<HTMLElement>(`.line[data-step="${step}"]`)
      );
      paired.forEach((el) => {
        el.style.opacity = "1";
      });
      flash(paired);
    }, PREAMBLE_DELAY + (i + 1) * STEP_DELAY);
  });
}

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        runStepAnimation(entry.target as HTMLElement);
        observer.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.25 }
);

document
  .querySelectorAll<HTMLElement>("[data-step-animate]")
  .forEach((el) => observer.observe(el));
