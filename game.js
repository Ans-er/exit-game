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

const eraThemes = {
  pythagoras: "antike",
  newton: "neuzeit",
  curie: "moderne",
  turing: "krieg",
  hopper: "digital",
  present: "gegenwart"
};

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
  setTheme(id);
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
  if (name === "menu" || name === "start" || name === "finale") {
    clearTheme();
  }
  elStart.hidden = name !== "start";
  elMenu.hidden = name !== "menu";
  elPuzzle.hidden = name !== "puzzle";
  elFinale.hidden = name !== "finale";

  if (name === "menu") renderMenu();
}

function setTheme(eraId) {
  const theme = eraThemes[eraId];
  if (theme) {
    document.body.setAttribute("data-era", theme);
  }
}

function clearTheme() {
  document.body.removeAttribute("data-era");
}

/* ================= Rätsel ================= */

function renderPythagoras(container, solved, fail) {
  const a = 7;
  const b = 5;
  const cTrue = Math.sqrt(a * a + b * b);
  const cRound = Math.round(cTrue * 10) / 10;

  const intro = document.createElement("p");
  intro.innerHTML=`
    <strong>Gegeben:</strong><br>
    Antike Werkstatt, Wachstafel, rechtwinkliges Dreieck:
    a = <strong>${a}</strong>, b = <strong>${b}</strong>.
    Pythagoras will eine klare Rechnung – kurz, korrekt, überzeugend.<br><br>
    <strong>Aufgabe:</strong>
    Berechne die Hypotenuse <em>c</em> und runde auf eine Nachkommastelle.
    `;
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
  const v0 = 2;   // m/s
  const a = 4;    // m/s²
  const t = 3;    // s
  const vTrue = v0 + a * t;

  const intro = document.createElement("p");
  intro.innerHTML = `
    England, 1666. Isaac Newton analysiert eine beschleunigte Bewegung.<br>
    Newton fordert eine saubere Herleitung – logisch, präzise, überprüfbar.<br><br>

    <strong>Gegeben:</strong><br>
    Anfangsgeschwindigkeit v₀ = ${v0} m/s<br>
    Beschleunigung a = ${a} m/s²<br>
    Zeit t = ${t} s<br><br>

    <strong>Aufgabe:</strong>
    Berechne die Endgeschwindigkeit v.
  `;

  const form = document.createElement("form");
  const label = document.createElement("label");
  label.textContent = "v = (in m/s)";
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
    const val = Number(input.value);

    if (val === vTrue) {
      container.insertAdjacentHTML(
        "beforeend",
        `<div class="notice">Korrekt. v = ${vTrue} m/s.</div>`
      );
      setTimeout(solved, 600);
    } else {
      fail("Falsch. Nutze v = v₀ + a · t.");
    }
  });
}


function renderCurie(container, solved, fail) {
  const molecules = 3;
  const atomsPer = 3; // H2O = 3 Atome
  const totalAtoms = molecules * atomsPer;

  const intro = document.createElement("p");
  intro.innerHTML = `
    Paris, 1898. Marie Curie untersucht einfache Molekülmodelle.<br>
    Sie erwartet eine klare Zählung – sachlich, exakt, nachvollziehbar.<br><br>

    <strong>Gegeben:</strong><br>
    Ein Wassermolekül H₂O besteht aus 3 Atomen.<br>
    Anzahl der Moleküle: ${molecules}<br><br>

    <strong>Aufgabe:</strong>
    Wie viele Atome sind es insgesamt?
  `;

  const form = document.createElement("form");
  const label = document.createElement("label");
  label.textContent = "Anzahl Atome:";
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
    const val = Number(input.value);

    if (val === totalAtoms) {
      container.insertAdjacentHTML(
        "beforeend",
        `<div class="notice">Richtig. Insgesamt ${totalAtoms} Atome.</div>`
      );
      setTimeout(solved, 600);
    } else {
      fail("Nicht korrekt. Multipliziere Moleküle × Atome pro Molekül.");
    }
  });
}


function renderTuring(container, solved, fail) {
  const start = 1;
  const steps = 4;
  const result = 9;

  const intro = document.createElement("p");
  intro.innerHTML = `
    Großbritannien, 1943. Alan Turing denkt in klaren Abläufen.<br>
    Jeder Schritt folgt einer festen Regel – ohne Interpretation.<br><br>

    <strong>Algorithmus:</strong><br>
    Startwert = ${start}<br>
    Wiederhole ${steps}-mal:<br>
    → addiere 2<br><br>

    <strong>Aufgabe:</strong>
    Welcher Wert entsteht am Ende?
  `;

  const form = document.createElement("form");
  const label = document.createElement("label");
  label.textContent = "Endwert:";
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
    const val = Number(input.value);

    if (val === result) {
      container.insertAdjacentHTML(
        "beforeend",
        `<div class="notice">Korrekt. Der Algorithmus endet bei ${result}.</div>`
      );
      setTimeout(solved, 600);
    } else {
      fail("Falsch. Gehe Schritt für Schritt vor.");
    }
  });
}

function renderHopper(container, solved, fail) {
  const result = 14;

  const intro = document.createElement("p");
  intro.innerHTML = `
    USA, 1952. Grace Hopper überprüft einen Programmablauf.<br>
    Sie achtet auf Reihenfolge – jeder Befehl zählt.<br><br>

    <strong>Code:</strong><br>
    <code>
      let x = 4;<br>
      x = x * 3;<br>
      x = x + 2;
    </code><br><br>

    <strong>Aufgabe:</strong>
    Welchen Wert hat <em>x</em> am Ende?
  `;

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
    const val = Number(input.value);

    if (val === result) {
      container.insertAdjacentHTML(
        "beforeend",
        `<div class="notice">Richtig. x endet bei ${result}.</div>`
      );
      setTimeout(solved, 600);
    } else {
      fail("Falsch. Achte genau auf die Reihenfolge der Operationen.");
    }
  });
}

function renderPresent() {}
