export function launchConfetti() {
  if (typeof window === "undefined" || typeof document === "undefined") return;

  const colors = ["#f97316", "#fb923c", "#fde68a", "#22c55e", "#38bdf8"];
  const pieces = 120;
  const container = document.createElement("div");
  container.style.position = "fixed";
  container.style.left = "0";
  container.style.top = "0";
  container.style.width = "100vw";
  container.style.height = "100vh";
  container.style.pointerEvents = "none";
  container.style.zIndex = "9999";
  document.body.appendChild(container);

  for (let i = 0; i < pieces; i += 1) {
    const piece = document.createElement("div");
    const size = Math.random() * 8 + 4;
    const left = Math.random() * window.innerWidth;
    const duration = Math.random() * 1000 + 1300;
    const delay = Math.random() * 300;
    const drift = (Math.random() - 0.5) * 220;

    piece.style.position = "absolute";
    piece.style.left = `${left}px`;
    piece.style.top = "-12px";
    piece.style.width = `${size}px`;
    piece.style.height = `${size * 0.65}px`;
    piece.style.borderRadius = "2px";
    piece.style.opacity = "0.95";
    piece.style.background = colors[Math.floor(Math.random() * colors.length)];
    piece.style.transform = `rotate(${Math.random() * 360}deg)`;
    piece.animate(
      [
        { transform: "translate3d(0,0,0) rotate(0deg)", opacity: 1 },
        {
          transform: `translate3d(${drift}px, ${window.innerHeight + 80}px, 0) rotate(${Math.random() * 720 + 360}deg)`,
          opacity: 0.1,
        },
      ],
      {
        duration,
        delay,
        easing: "cubic-bezier(.14,.64,.19,.99)",
        fill: "forwards",
      },
    );
    container.appendChild(piece);
  }

  window.setTimeout(() => {
    container.remove();
  }, 2800);
}
