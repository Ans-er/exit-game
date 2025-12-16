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
  const sideA = 5;
  const sideB = 12;
  const hypotenuse = 13;

  const intro = document.createElement("p");
  intro.innerHTML = `
    <strong>Gegeben:</strong><br>
    Antike Werkstatt, Wachstafel, rechtwinkliges Dreieck:<br>
    Das Dreieck hat ganzzahlige Seitenlängen, die längste Seite hat eine Länge von 13 Einheiten.<br>
    Pythagoras will eine klare Rechnung – kurz, korrekt, überzeugend.<br><br>
    <strong>Aufgabe:</strong><br>
    Gib die beiden anderen Seiten ein.
  `;

  const form = document.createElement("form");

  const labelA = document.createElement("label");
  labelA.textContent = "Seite a =";
  const inputA = document.createElement("input");
  inputA.type = "number";
  inputA.required = true;

  const labelB = document.createElement("label");
  labelB.textContent = "Seite b =";
  const inputB = document.createElement("input");
  inputB.type = "number";
  inputB.required = true;

  const btn = document.createElement("button");
  btn.type = "submit";
  btn.className = "primary";
  btn.textContent = "Prüfen";

  form.append(labelA, inputA, labelB, inputB, btn);
  container.append(intro, form);

  form.addEventListener("submit", e => {
    e.preventDefault();
    const valA = Number(inputA.value);
    const valB = Number(inputB.value);

    const correct =
      (valA === sideA && valB === sideB) || (valA === sideB && valB === sideA);

    if (correct) {
      container.insertAdjacentHTML(
        "beforeend",
        `<div class="notice">Korrekt. Die Seiten sind ${sideA} und ${sideB}.</div>`
      );
      setTimeout(solved, 600);
    } else {
      fail("Falsch. Überprüfe nochmal die Ganzzahlseiten des rechtwinkligen Dreiecks.");
    }
  });
}


function renderNewton(container, solved, fail) {
  const questions = [
    {
      text: `
        <strong>Frage 1:</strong><br>
        Ein Körper bewegt sich mit konstanter Geschwindigkeit.<br><br>
        <strong>Gegeben:</strong><br>
        v = 5 m/s<br><br>
        <strong>Frage:</strong><br>
        Wie weit bewegt sich der Körper in 4 Sekunden?
      `,
      answers: ["9 m", "20 m", "25 m", "40 m"],
      correct: 1
    },
    {
      text: `
        <strong>Frage 2:</strong><br>
        Newton untersucht beschleunigte Bewegung.<br><br>
        <strong>Gegeben:</strong><br>
        a = 3 m/s²<br>
        t = 2 s<br><br>
        <strong>Frage:</strong><br>
        Wie stark ändert sich die Geschwindigkeit?
      `,
      answers: ["3 m/s", "5 m/s", "6 m/s", "12 m/s"],
      correct: 2
    },
    {
      text: `
        <strong>Frage 3:</strong><br>
        <strong>Gegeben:</strong><br>
        Anfangsgeschwindigkeit v₀ = 4 m/s<br>
        Beschleunigung a = 2 m/s²<br>
        Zeit t = 3 s<br><br>
        <strong>Frage:</strong><br>
        Wie groß ist die Endgeschwindigkeit?
      `,
      answers: ["6 m/s", "8 m/s", "10 m/s", "14 m/s"],
      correct: 2
    },
    {
      text: `
        <strong>Frage 4:</strong><br>
        Newtons zweites Gesetz lautet: F = m · a<br><br>
        <strong>Gegeben:</strong><br>
        m = 2 kg<br>
        a = 5 m/s²<br><br>
        <strong>Frage:</strong><br>
        Wie groß ist die wirkende Kraft?
      `,
      answers: ["7 N", "10 N", "12 N", "15 N"],
      correct: 1
    }
  ];

  let current = 0;

  const intro = document.createElement("p");
  intro.innerHTML = `
    England, 1666. Isaac Newton stellt dir mehrere Aufgaben.<br>
    Jede baut auf der vorherigen auf – sauber, logisch, überprüfbar.
  `;

  const questionBox = document.createElement("div");
  const resultBox = document.createElement("div");
  resultBox.className = "result";

  container.append(intro, questionBox, resultBox);

  function renderQuestion() {
    resultBox.textContent = "";
    questionBox.innerHTML = "";

    const q = questions[current];

    const qText = document.createElement("p");
    qText.innerHTML = q.text;
    questionBox.appendChild(qText);

    const form = document.createElement("form");

    q.answers.forEach((ans, index) => {
      const label = document.createElement("label");
      label.style.display = "block";

      const radio = document.createElement("input");
      radio.type = "radio";
      radio.name = "answer";
      radio.value = index;
      radio.required = true;

      label.append(radio, " ", ans);
      form.appendChild(label);
    });

    const btn = document.createElement("button");
    btn.type = "submit";
    btn.className = "primary";
    btn.textContent = "Antwort prüfen";

    form.appendChild(btn);
    questionBox.appendChild(form);

    form.addEventListener("submit", e => {
      e.preventDefault();
      const selected = Number(
        form.querySelector("input[name='answer']:checked").value
      );

      if (selected === q.correct) {
        current++;
        if (current < questions.length) {
          renderQuestion();
        } else {
          resultBox.innerHTML =
            `<div class="notice">Alle Aufgaben korrekt gelöst.</div>`;
          setTimeout(solved, 800);
        }
      } else {
        fail("Falsch. Überprüfe deine Rechnung und versuche es erneut.");
      }
    });
  }

  renderQuestion();
}



function renderCurie(container, solved, fail) {
  const densityFactor = 0.5;

  const intro = document.createElement("p");
  intro.innerHTML = `
    Paris, 1898. Marie Curie untersucht das Verhalten von Gasen.<br>
    Sie erwartet klare, logische Berechnungen.<br><br>

    <strong>Gegeben:</strong><br>
    Ein ideales Gas füllt bei konstantem Druck 2 Liter.<br>
    Das Volumen wird auf 4 Liter verdoppelt.<br><br>

    <strong>Aufgabe:</strong><br>
    Um wie viel mal ändert sich die Dichte des Gases?
    (Gib den Faktor als Zahl ein, z.B. 0.5)
  `;

  const form = document.createElement("form");
  const label = document.createElement("label");
  label.textContent = "Faktor der Dichteänderung:";

  const input = document.createElement("input");
  input.type = "number";
  input.step = "0.01";
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

    if (Math.abs(val - densityFactor) < 0.01) {
      container.insertAdjacentHTML(
        "beforeend",
        `<div class="notice">Richtig. Die Dichte halbiert sich.</div>`
      );
      setTimeout(solved, 600);
    } else {
      fail("Falsch. Denke an die Formel Dichte = Masse / Volumen.");
    }
  });
}



function renderTuring(container, solved, fail) {
  const numbers = [4, 1, 3, 2];
  const steps = 2;

  const intro = document.createElement("p");
  intro.innerHTML = `
    Großbritannien, 1943. Alan Turing hat eine Aufgabe für dich.<br>
    Er will das du im hilfst eine Zahlenfolge zu sortieren.<br>
    Du darfst immer nur zwei benachbarte Zahlen vertauschen. <br><br>

    <strong>Die Zahlenfolge:</strong><br>
    Zahlenfolge = ${numbers.join(", ")}<br>
    
    <strong>Aufgabe:</strong>
    Wie viele Schritte brauchst du mindestens um die Zahlenfolge zu sortieren
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

    if (val === steps) {
      container.insertAdjacentHTML(
        "beforeend",
        `<div class="notice">Korrekt. Man braucht mindestens ${steps} Schritte um die Zahlenfolge zu sortieren.</div>`
      );
      setTimeout(solved, 600);
    } else {
      fail("Falsch. Gehe Schritt für Schritt vor und achte auf die Reihenfolge der Sortierung, ist es aufsteigend oder absteigend.");
    }
  });
}

function renderHopper(container, solved, fail) {
  const result = 120;

  const intro = document.createElement("p");
  intro.innerHTML = `
    USA, 1952. Grace Hopper analysiert einen rekursiven Programmablauf.
    Jeder Funktionsaufruf baut auf dem vorherigen auf – Schritt für Schritt.<br><br>

    <strong>Pseudocode:</strong><br>
    <code>
      funktion f(n):<br>
      &nbsp;&nbsp;wenn n == 1:<br>
      &nbsp;&nbsp;&nbsp;&nbsp;gib 1 zurück<br>
      &nbsp;&nbsp;sonst:<br>
      &nbsp;&nbsp;&nbsp;&nbsp;gib n * f(n - 1) zurück
    </code><br><br>

    <strong>Aufgabe:</strong><br>
    Welchen Wert liefert <strong>f(5)</strong>?
  `;

  const form = document.createElement("form");

  const label = document.createElement("label");
  label.textContent = "Ergebnis von f(5):";

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
        `<div class="notice">Korrekt.</div>`
      );
      setTimeout(solved, 600);
    } else {
      fail("Falsch. Verfolge die Funktionsaufrufe Schritt für Schritt.");
    }
  });
}


function renderPresent() {}
