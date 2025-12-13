const state = {
  solved: JSON.parse(localStorage.getItem("ts_solved") || "[]"),
  presentUnlocked: JSON.parse(localStorage.getItem("ts_present") || "false"),
  currentEra: null
};

const erasBase = [
  {
    id: "pythagoras",
    era: "Antike",
    year: "ca. 500 v. Chr.",
    topic: "Mathematik",
    playable: true,
    desc: "Hilf bei einem klassischen Dreiecksproblem.",
    renderPuzzle: renderPythagoras
  },
  {
    id: "newton",
    era: "Frühe Neuzeit",
    year: "1666",
    topic: "Physik",
    playable: true,
    desc: "Berechne eine einfache Kraft nach Newton.",
    renderPuzzle: renderNewton
  },
  {
    id: "curie",
    era: "19./20. Jh.",
    year: "1898",
    topic: "Chemie",
    playable: true,
    desc: "Bestimme die Anzahl der Atome in einer Verbindung.",
    renderPuzzle: renderCurie
  },
  {
    id: "turing",
    era: "20. Jh.",
    year: "1943",
    topic: "Informatik",
    playable: true,
    desc: "Erkenne ein einfaches Algorithmus-Ergebnis.",
    renderPuzzle: renderTuring
  },
  {
    id: "hopper",
    era: "20. Jh.",
    year: "1952",
    topic: "Programmierung",
    playable: true,
    desc: "Finde den Fehler in einem Code-Fragment.",
    renderPuzzle: renderHopper
  }
];

const elStart = document.getElementById("start");
const elMenu = document.getElementById("menu");
const elGrid = document.getElementById("era-grid");
const elPuzzle = document.getElementById("puzzle");
const elPuzzleTitle = document.getElementById("puzzle-title");
const elPuzzleFlavor = document.getElementById("puzzle-flavor");
const elPuzzleBody = document.getElementById("puzzle-body");
const elPuzzleResult = document.getElementById("puzzle-result");
const elFinale = document.getElementById("finale");
const elStatus = document.getElementById("status");
const elReset = document.getElementById("reset");

/* Navigation */
document.getElementById("toMenu").addEventListener("click", () => showView("menu"));
document.getElementById("backToStart").addEventListener("click", () => showView("start"));
document.getElementById("backToMenu").addEventListener("click", () => showView("menu"));
document.getElementById("again").addEventListener("click", () => showView("menu"));
document.getElementById("againStart").addEventListener("click", () => showView("start"));

elReset.addEventListener("click", () => {
  if (confirm("Spielstand wirklich löschen?")) {
    localStorage.removeItem("ts_solved");
    localStorage.removeItem("ts_present");
    state.solved = [];
    state.presentUnlocked = false;
    updateStatus();
    showView("start");
  }
});

init();

function init() {
  updateStatus();
  renderMenu();
}

function updateStatus() {
  elStatus.textContent = `${state.solved.length}/5 gelöst`;
}

function buildEraList() {
  const list = [...erasBase];

  if (state.presentUnlocked) {
    list.push({
      id: "present",
      era: "Sonderziel",
      year: "Jetzt",
      topic: "Zurück in die Gegenwart",
      playable: true,
      special: true,
      renderPuzzle: renderPresent
    });
  }

  return list;
}

function renderMenu() {
  elGrid.innerHTML = "";
  const eras = buildEraList();

  eras.forEach(e => {
    const solved = state.solved.includes(e.id);

    const card = document.createElement("article");
    card.className = "card" + (e.special ? " special" : (!e.playable ? " locked" : ""));

    const inner = document.createElement("div");
    inner.className = e.special ? "inner" : "";

    const h3 = document.createElement("h3");
    h3.textContent = `${e.era} • ${e.topic}`;

    const meta = document.createElement("div");
    meta.className = "meta";
    meta.textContent = e.year;

    inner.append(h3, meta);

    if (e.playable && e.desc) {
      const desc = document.createElement("p");
      desc.className = "desc";
      desc.textContent = e.desc;
      inner.append(desc);
    }

    const badge = document.createElement("div");
    badge.innerHTML = `<span class="badge">${
      e.special
        ? "Freigeschaltet"
        : (solved ? "✔️ gelöst" : (e.playable ? "Spielbar" : "In Entwicklung"))
    }</span>`;

    const actions = document.createElement("div");
    actions.className = "actions";

    const btn = document.createElement("button");

    if (e.playable) {
      btn.textContent = e.special ? "Beenden" : (solved ? "Nochmal" : "Start");
      btn.className = e.special ? "primary" : "";
      btn.addEventListener("click", () =>
        e.special ? showView("finale") : startEra(e.id)
      );
    } else {
      btn.textContent = "In Entwicklung";
      btn.disabled = true;
    }

    actions.append(badge, btn);
    inner.append(actions);
    card.append(inner);
    elGrid.appendChild(card);
  });
}

function startEra(id) {
  const e = buildEraList().find(x => x.id === id);
  if (!e || !e.playable) return;

  state.currentEra = id;
  elPuzzleTitle.textContent = `${e.era} • ${e.topic} (${e.year})`;
  elPuzzleFlavor.textContent = "";
  elPuzzleBody.innerHTML = "";
  elPuzzleResult.textContent = "";

  e.renderPuzzle(elPuzzleBody, onSolve, onFail);
  showView("puzzle");
}

function onSolve() {
  const id = state.currentEra;

  if (!state.solved.includes(id) && id !== "present") {
    state.solved.push(id);
    localStorage.setItem("ts_solved", JSON.stringify(state.solved));
  }

  // Finale erst freischalten, wenn ALLE 5 Rätsel gelöst sind
  if (state.solved.length === erasBase.length && !state.presentUnlocked) {
    state.presentUnlocked = true;
    localStorage.setItem("ts_present", JSON.stringify(true));
  }

  updateStatus();
  showView("menu");
}

function onFail(msg) {
  elPuzzleResult.textContent = msg || "Falsch. Bitte erneut versuchen.";
}

function showView(name) {
  elStart.hidden = name !== "start";
  elMenu.hidden = name !== "menu";
  elPuzzle.hidden = name !== "puzzle";
  elFinale.hidden = name !== "finale";

  if (name === "menu") renderMenu();
}

/* ================= Rätsel ================= */

function renderPythagoras(container, solved, fail) {
  const a = 7;
  const b = 5;
  const cTrue = Math.sqrt(a * a + b * b);
  const cRound = Math.round(cTrue * 10) / 10;

  const intro = document.createElement("p");
  intro.innerHTML = `Antike Werkstatt, Wachstafel, rechtwinkliges Dreieck: a = <strong>${a}</strong>, b = <strong>${b}</strong>.<br><br><strong>Aufgabe:</strong> Berechne die Hypotenuse <em>c</em> und runde auf eine Nachkommastelle.`;

  const form = document.createElement("form");
  const label = document.createElement("label");
  label.textContent = "c =";

  const input = document.createElement("input");
  input.type = "number";
  input.step = "0.1";
  input.required = true;

  const btn = document.createElement("button");
  btn.type = "submit";
  btn.className = "primary";
  btn.textContent = "Prüfen";

  form.append(label, input, btn);
  container.append(intro, form);

  form.addEventListener("submit", e => {
    e.preventDefault();
    const val = Number(input.value);

    if (Math.abs(val - cRound) <= 0.05) {
      container.insertAdjacentHTML(
        "beforeend",
        `<div class="notice">Korrekt. c ≈ ${cRound.toFixed(1)}.</div>`
      );
      setTimeout(solved, 600);
    } else {
      fail(`Falsch. Korrekt wäre etwa ${cRound.toFixed(1)}.`);
    }
  });
}

function renderNewton(container, solved, fail) {
  const m = 2;
  const a = 3;
  const fTrue = m * a;

  const intro = document.createElement("p");
  intro.innerHTML = `England, 1666.<br><br><strong>Aufgabe:</strong> Berechne die Kraft F (F = m · a).`;

  const form = document.createElement("form");
  const label = document.createElement("label");
  label.textContent = "F =";

  const input = document.createElement("input");
  input.type = "number";
  input.required = true;

  const btn = document.createElement("button");
  btn.type = "submit";
  btn.className = "primary";
  btn.textContent = "Prüfen";

  form.append(label, input, btn);
  container.append(intro, form);

  form.addEventListener("submit", e => {
    e.preventDefault();
    if (Number(input.value) === fTrue) {
      container.insertAdjacentHTML("beforeend", `<div class="notice">Richtig.</div>`);
      setTimeout(solved, 600);
    } else {
      fail("Falsch. Nutze F = m · a.");
    }
  });
}

function renderCurie(container, solved, fail) {
  const intro = document.createElement("p");
  intro.innerHTML = `Paris, 1898.<br><br><strong>Aufgabe:</strong> Wie viele Wasserstoff-Atome hat H₂O?`;

  const form = document.createElement("form");
  const label = document.createElement("label");
  label.textContent = "Anzahl:";

  const input = document.createElement("input");
  input.type = "number";
  input.required = true;

  const btn = document.createElement("button");
  btn.type = "submit";
  btn.className = "primary";
  btn.textContent = "Prüfen";

  form.append(label, input, btn);
  container.append(intro, form);

  form.addEventListener("submit", e => {
    e.preventDefault();
    if (Number(input.value) === 2) {
      container.insertAdjacentHTML("beforeend", `<div class="notice">Richtig.</div>`);
      setTimeout(solved, 600);
    } else {
      fail("Nicht korrekt.");
    }
  });
}

function renderTuring(container, solved, fail) {
  const intro = document.createElement("p");
  intro.innerHTML = `Startwert 2, dreimal verdoppeln.<br><br><strong>Endwert?</strong>`;

  const form = document.createElement("form");
  const label = document.createElement("label");
  label.textContent = "Wert:";

  const input = document.createElement("input");
  input.type = "number";
  input.required = true;

  const btn = document.createElement("button");
  btn.type = "submit";
  btn.className = "primary";
  btn.textContent = "Prüfen";

  form.append(label, input, btn);
  container.append(intro, form);

  form.addEventListener("submit", e => {
    e.preventDefault();
    if (Number(input.value) === 16) {
      container.insertAdjacentHTML("beforeend", `<div class="notice">Korrekt.</div>`);
      setTimeout(solved, 600);
    } else {
      fail("Falsch.");
    }
  });
}

function renderHopper(container, solved, fail) {
  const intro = document.createElement("p");
  intro.innerHTML = `let x = 5;<br>x = x + 3;<br>x = x * 2;<br><br><strong>Endwert?</strong>`;

  const form = document.createElement("form");
  const label = document.createElement("label");
  label.textContent = "x =";

  const input = document.createElement("input");
  input.type = "number";
  input.required = true;

  const btn = document.createElement("button");
  btn.type = "submit";
  btn.className = "primary";
  btn.textContent = "Prüfen";

  form.append(label, input, btn);
  container.append(intro, form);

  form.addEventListener("submit", e => {
    e.preventDefault();
    if (Number(input.value) === 16) {
      container.insertAdjacentHTML("beforeend", `<div class="notice">Richtig.</div>`);
      setTimeout(solved, 600);
    } else {
      fail("Falsch.");
    }
  });
}

function renderPresent() {}
