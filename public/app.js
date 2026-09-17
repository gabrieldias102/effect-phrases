const ROTATE_MS = 8000;

const textEl = document.getElementById("quote-text");
const authorEl = document.getElementById("quote-author");
const footerEl = document.querySelector(".quote-footer");
const progressBar = document.getElementById("progress-bar");
const prevBtn = document.getElementById("prev-btn");
const nextBtn = document.getElementById("next-btn");
const pauseBtn = document.getElementById("pause-btn");

let phrases = [];
let order = [];
let index = -1;
let paused = false;
let timer = null;

function shuffle(list) {
  const copy = [...list];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function startProgress() {
  progressBar.classList.remove("animate");
  progressBar.style.width = "0%";
  // force reflow so the transition restarts
  void progressBar.offsetWidth;
  progressBar.classList.add("animate");
  progressBar.style.transitionDuration = `${ROTATE_MS}ms`;
  progressBar.style.width = "100%";
}

function stopProgress() {
  const computed = getComputedStyle(progressBar).width;
  progressBar.style.width = computed;
  progressBar.classList.remove("animate");
}

function render(phrase) {
  textEl.classList.remove("visible");
  footerEl.classList.remove("visible");

  setTimeout(() => {
    textEl.textContent = phrase.text;
    authorEl.textContent = phrase.author;
    textEl.classList.add("visible");
    footerEl.classList.add("visible");
  }, 250);
}

function show(step) {
  if (order.length === 0) return;
  index = (index + step + order.length) % order.length;
  render(order[index]);
  if (!paused) {
    startProgress();
  }
}

function scheduleNext() {
  clearTimeout(timer);
  if (paused) return;
  timer = setTimeout(() => {
    show(1);
    scheduleNext();
  }, ROTATE_MS);
}

function goNext() {
  show(1);
  scheduleNext();
}

function goPrev() {
  show(-1);
  scheduleNext();
}

function togglePause() {
  paused = !paused;
  pauseBtn.innerHTML = paused ? "&#9654;" : "&#10073;&#10073;";
  if (paused) {
    clearTimeout(timer);
    stopProgress();
  } else {
    startProgress();
    scheduleNext();
  }
}

async function loadPhrases() {
  const res = await fetch("/api/phrases", { cache: "no-store" });
  const data = await res.json();
  if (!Array.isArray(data) || data.length === 0) {
    textEl.textContent = "Nenhuma frase cadastrada ainda.";
    textEl.classList.add("visible");
    return;
  }
  phrases = data;
  order = shuffle(phrases);
  index = -1;
  goNext();
}

prevBtn.addEventListener("click", goPrev);
nextBtn.addEventListener("click", goNext);
pauseBtn.addEventListener("click", togglePause);

document.addEventListener("keydown", (e) => {
  if (e.key === "ArrowRight") goNext();
  if (e.key === "ArrowLeft") goPrev();
  if (e.key === " ") {
    e.preventDefault();
    togglePause();
  }
});

loadPhrases();
