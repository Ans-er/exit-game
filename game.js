// Minimaler State
const state = {
  sceneId: "start",
  inventory: new Set(JSON.parse(localStorage.getItem("inv") || "[]")),
};

const elScene = document.getElementById("scene");
const elActions = document.getElementById("actions");
const elInventory = document.getElementById("inventory");

const SCENES = {
  start: {
    title: "Verschlossener Raum",
    text: "Du wachst in einem Raum auf. Eine Tür mit 3-stelligem Schloss.",
    actions: [
      { label: "Zettel suchen", goto: "zettel" },
      { label: "Zur Tür", goto: "tuer" },
    ],
  },
  zettel: {
    title: "Unter dem Bett",
    text: "Ein Zettel: 'Code: 241'.",
    actions: [
      { label: "Zettel einstecken", goto: "start", gives: ["zettel_code"] },
    ],
  },
  tuer: {
    title: "Tür",
    text: "Die Tür hat ein Drehrad. Versuche den Code.",
    puzzle: { type: "code", length: 3, solution: "241" },
    actions: [{ label: "Zurück", goto: "start" }],
  },
  frei: { title: "Freiheit", text: "Die Tür klickt. Du bist draußen!", actions: [] },
};

function save() {
  localStorage.setItem("inv", JSON.stringify([...state.inventory]));
}

function renderInventory() {
  elInventory.innerHTML = "";
  [...state.inventory].forEach((item) => {
    const span = document.createElement("span");
    span.className = "badge";
    span.textContent = item.replace(/^zettel_/, "Zettel: ");
    elInventory.appendChild(span);
  });
}

function goto(id) {
  if (!SCENES[id]) id = "start";
  state.sceneId = id;
  render();
}

function give(items = []) {
  let changed = false;
  items.forEach((x) => {
    state.inventory.add(x);
    changed = true;
  });
  if (changed) save();
}

function render() {
  const sc = SCENES[state.sceneId];
  renderInventory();
  elScene.innerHTML = "";
  const h2 = document.createElement("h2");
  h2.textContent = sc.title || "";
  const p = document.createElement("p");
  p.textContent = sc.text || "";
  elScene.append(h2, p);

  elActions.innerHTML = "";
  if (sc.puzzle && sc.puzzle.type === "code") {
    const form = document.createElement("form");
    const label = document.createElement("label");
    label.textContent = `Code (${sc.puzzle.length} Stellen): `;
    const input = document.createElement("input");
    input.type = "text";
    input.maxLength = sc.puzzle.length;
    input.pattern = "\\d+";
    input.inputMode = "numeric";
    const submit = document.createElement("button");
    submit.type = "submit";
    submit.textContent = "Öffnen";
    const hint = document.createElement("div");
    hint.className = "warn";
    hint.textContent = "";

    form.append(label, input, submit);
    elActions.append(form, hint);

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const val = input.value.trim();
      if (val === sc.puzzle.solution) {
        location.hash = "#/frei";
        goto("frei");
      } else {
        hint.textContent = "Falsch. Schau dich nochmal um.";
      }
    });
  }

  const grid = document.createElement("div");
  grid.className = "actions";
  (sc.actions || []).forEach((a) => {
    const btn = document.createElement("button");
    btn.textContent = a.label;
    btn.addEventListener("click", () => {
      if (a.gives?.length) give(a.gives);
      if (a.goto) goto(a.goto);
    });
    grid.appendChild(btn);
  });
  elActions.appendChild(grid);
}

render();
