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
  const tasks = [
    {
      text: `
        Rechtwinkliges Dreieck mit ganzzahligen Seiten.<br>
        Die Hypotenuse ist 13 Einheiten lang.<br><br>
        <strong>Aufgabe:</strong> Gib die beiden anderen Seiten ein.
      `,
      type: "two",
      a: 5,
      b: 12
    },
    {
      text: `
        Ein rechtwinkliges Dreieck hat die Hypotenuse 10 und eine Kathete 6.<br><br>
        <strong>Aufgabe:</strong> Wie lang ist die andere Kathete?
      `,
      type: "one",
      result: 8
    },
    {
      text: `
        Ein Dreieck hat die Seiten 9, 12 und 15.<br><br>
        <strong>Aufgabe:</strong>
        Ist das Dreieck rechtwinklig? (1 = ja, 0 = nein)
      `,
      type: "check",
      result: 1
    }
  ];

  let current = 0;
  const box = document.createElement("div");
  container.appendChild(box);

  function renderTask() {
    box.innerHTML =  `
      Du bist in der Antike gelandet und musst Pythagoras mit ein paar mathematischen Problemen helfen
    `;
    const t = tasks[current];

    const p = document.createElement("p");
    p.innerHTML = t.text;
    box.appendChild(p);

    const form = document.createElement("form");

    if (t.type === "two") {
      const a = document.createElement("input");
      const b = document.createElement("input");
      a.type = b.type = "number";
      a.placeholder = "Seite a";
      b.placeholder = "Seite b";
      a.required = b.required = true;
      form.append(a, b);

      form.addEventListener("submit", e => {
        e.preventDefault();
        const va = Number(a.value);
        const vb = Number(b.value);
        const ok =
          (va === t.a && vb === t.b) ||
          (va === t.b && vb === t.a);
        ok ? next() : fail("Falsch. Prüfe den Satz des Pythagoras.");
      });
    }

    if (t.type === "one") {
      const input = document.createElement("input");
      input.type = "number";
      input.required = true;
      form.append(input);

      form.addEventListener("submit", e => {
        e.preventDefault();
        Number(input.value) === t.result
          ? next()
          : fail("Falsch. Berechne die fehlende Kathete.");
      });
    }

    if (t.type === "check") {
      const input = document.createElement("input");
      input.type = "number";
      input.required = true;
      form.append(input);

      form.addEventListener("submit", e => {
        e.preventDefault();
        Number(input.value) === t.result
          ? next()
          : fail("Falsch. Prüfe a² + b² = c².");
      });
    }

    const btn = document.createElement("button");
    btn.className = "primary";
    btn.textContent = "Prüfen";
    form.appendChild(btn);

    box.appendChild(form);
  }

  function next() {
    current++;
    current < tasks.length ? renderTask() : solved();
  }

  renderTask();
}


function renderNewton(container, solved, fail) {
  const questions = [
    {
      text: `
        <strong>Frage 1:</strong><br>
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
        v₀ = 4 m/s<br>
        a = 2 m/s²<br>
        t = 3 s<br><br>
        <strong>Frage:</strong><br>
        Wie groß ist die Endgeschwindigkeit?
      `,
      answers: ["6 m/s", "8 m/s", "10 m/s", "14 m/s"],
      correct: 2
    },
    {
      text: `
        <strong>Frage 4:</strong><br>
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
    England, 1666. Isaac Newton prüft dein Verständnis der Bewegungsgesetze.<br>
    Jede Aufgabe muss korrekt gelöst werden, bevor du weiterkommst.
  `;

  const questionBox = document.createElement("div");
  const feedbackBox = document.createElement("div");
  feedbackBox.className = "feedback";

  container.append(intro, questionBox, feedbackBox);

  function renderQuestion() {
    questionBox.innerHTML = "";
    feedbackBox.textContent = "";

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
          feedbackBox.innerHTML =
            `<div class="notice">Alle Aufgaben korrekt gelöst.</div>`;
          setTimeout(solved, 800);
        }
      } else {
        feedbackBox.textContent =
          "Falsch. Überprüfe deine Rechnung und versuche es erneut.";
      }
    });
  }

  renderQuestion();
}

function renderCurie(container, solved, fail) {
  const questions = [
    {
      text: `
        <strong>Frage 1:</strong><br>
        Ein ideales Gas wird bei konstantem Druck auf das doppelte Volumen gebracht.<br><br>
        <strong>Aussage:</strong><br>
        Die Dichte des Gases halbiert sich.
      `,
      correct: true
    },
    {
      text: `
        <strong>Frage 2:</strong><br>
        <strong>Aussage:</strong><br>
        Wenn sich das Volumen eines Gases verdoppelt, verdoppelt sich auch seine Masse.
      `,
      correct: false
    },
    {
      text: `
        <strong>Frage 3:</strong><br>
        <strong>Aussage:</strong><br>
        Die Dichte eines Stoffes berechnet man aus Masse geteilt durch Volumen.
      `,
      correct: true
    },
    {
      text: `
        <strong>Frage 4:</strong><br>
        <strong>Aussage:</strong><br>
        Bei konstantem Druck und konstanter Masse nimmt die Dichte eines Gases zu,
        wenn das Volumen größer wird.
      `,
      correct: false
    }
  ];

  let current = 0;

  const intro = document.createElement("p");
  intro.innerHTML = `
    Paris, 1898. Marie Curie prüft dein Verständnis von Gasen.<br>
    Jede Aussage muss korrekt bewertet werden – sachlich, logisch, präzise.
  `;

  const questionBox = document.createElement("div");
  const feedbackBox = document.createElement("div");
  feedbackBox.className = "feedback";

  container.append(intro, questionBox, feedbackBox);

  function renderQuestion() {
    questionBox.innerHTML = "";
    feedbackBox.textContent = "";

    const q = questions[current];

    const qText = document.createElement("p");
    qText.innerHTML = q.text;
    questionBox.appendChild(qText);

    const form = document.createElement("form");

    ["Wahr", "Falsch"].forEach((labelText, index) => {
      const label = document.createElement("label");
      label.style.display = "block";

      const radio = document.createElement("input");
      radio.type = "radio";
      radio.name = "answer";
      radio.value = index === 0;
      radio.required = true;

      label.append(radio, " ", labelText);
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

      const selected =
        form.querySelector("input[name='answer']:checked").value === "true";

      if (selected === q.correct) {
        current++;
        if (current < questions.length) {
          renderQuestion();
        } else {
          feedbackBox.innerHTML =
            `<div class="notice">Alle chemischen Aussagen korrekt bewertet.</div>`;
          setTimeout(solved, 800);
        }
      } else {
        feedbackBox.textContent =
          "Falsch. Überprüfe die Aussage noch einmal sorgfältig.";
      }
    });
  }

  renderQuestion();
}


function renderTuring(container, solved, fail) {
  const tasks = [
    {
      text: `
        Zahlenfolge: [4, 1, 3, 2],<br>
        Du darfst nur benachbarte Zahlen tauschen.<br><br>
        <strong>Aufgabe:</strong>
        Wie viele Schritte brauchst du mindestens um die Zahlenfolge zu sortieren
      `,
      result: 2
    },
    {
      text: `
        Startwert = 2<br>
        Wiederhole 3-mal: Wert = Wert · 2<br><br>
        <strong>Aufgabe:</strong> Was kommt als Endwert raus?
      `,
      result: 16
    },
    {
      text: `
        Ein Algorithmus benötigt pro Schleifendurchlauf 1 Sekunde.<br>
        Die Schleife läuft 5-mal.<br><br>
        <strong>Aufgabe:</strong> Was ist die Gesamtdauer die der Algorithmus braucht in Sekunden?
      `,
      result: 5
    }
  ];

  let current = 0;
  const box = document.createElement("div");
  container.appendChild(box);

  function renderTask() {
    box.innerHTML = `
      Großbritannien, 1943. Alan Turing hat eine Aufgabe für dich.<br>
    `;
    const t = tasks[current];

    const p = document.createElement("p");
    p.innerHTML = t.text;

    const form = document.createElement("form");
    const input = document.createElement("input");
    input.type = "number";
    input.required = true;

    const btn = document.createElement("button");
    btn.className = "primary";
    btn.textContent = "Prüfen";

    form.append(input, btn);
    box.append(p, form);

    form.addEventListener("submit", e => {
      e.preventDefault();
      Number(input.value) === t.result
        ? next()
        : fail("Falsch. Gehe Schritt für Schritt vor.");
    });
  }

  function next() {
    current++;
    current < tasks.length ? renderTask() : solved();
  }

  renderTask();
}


function renderHopper(container, solved, fail) {
  const tasks = [
    {
      text: `
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
      `,
      result: 120
    },
    {
      text: `
        <strong>Pseudocode:</strong><br>
        let x = 1;<br>
        wiederhole 4-mal: x = x + 3;<br><br>
        <strong>Aufgabe:</strong> Endwert von x?
      `,
      result: 13
    },
    {
      text: `
        <strong>Pseudocode:</strong><br>
        let x = 10;<br>
        x = x / 2;<br>
        x = x + 5;<br><br>
        <strong>Aufgabe:</strong> Endwert von x?
      `,
      result: 10
    }
  ];

  let current = 0;
  const box = document.createElement("div");
  container.appendChild(box);

  function renderTask() {
    box.innerHTML = `
    USA, 1952. Grace Hopper analysiert einen rekursiven Programmablauf.
    Jeder Funktionsaufruf baut auf dem vorherigen auf – Schritt für Schritt.<br><br>
  `;
    const t = tasks[current];

    const p = document.createElement("p");
    p.innerHTML = t.text;

    const form = document.createElement("form");
    const input = document.createElement("input");
    input.type = "number";
    input.required = true;

    const btn = document.createElement("button");
    btn.className = "primary";
    btn.textContent = "Prüfen";

    form.append(input, btn);
    box.append(p, form);

    form.addEventListener("submit", e => {
      e.preventDefault();
      Number(input.value) === t.result
        ? next()
        : fail("Falsch. Verfolge den Ablauf genau.");
    });
  }

  function next() {
    current++;
    current < tasks.length ? renderTask() : solved();
  }

  renderTask();
}


function renderPresent() {}
