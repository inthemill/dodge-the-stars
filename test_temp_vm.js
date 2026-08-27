const fs = require('fs');
const vm = require('vm');

try {
  let code = fs.readFileSync('script.js', 'utf8');

  let current_millis = 0;
  const classes = new Set();
  const classList = {
    add(c) { classes.add(c); },
    remove(c) { classes.delete(c); },
    toggle(c, force) {
      if (force === undefined) {
        if (classes.has(c)) { classes.delete(c); } else { classes.add(c); }
      } else {
        if (force) { classes.add(c); } else { classes.delete(c); }
      }
    },
    contains(c) { return classes.has(c); }
  };

  const sandbox = {
    millis: () => current_millis,
    set_current_millis: (val) => { current_millis = val; },
    floor: Math.floor,
    random: (max) => 2,
    console: console,
    classList: classList,
    get_classes: () => classes,
    document: {
      getElementById: () => ({ addEventListener: () => {} }),
      querySelectorAll: () => []
    },
    loadImage: () => ({}),
    // define other potential globals/variables
    punkteText: { textContent: "" },
    bestePunkteText: { textContent: "" },
    lebenText: { textContent: "" },
    goldenesHerzText: { hidden: false },
    magazinText: { textContent: "" },
    magazinAnzeige: { classList: classList },
    punkte: 0,
    bestePunkte: 0,
    leben: 3,
    MAX_MAGAZIN: 5,
    magazin: 5,
    nachladeTimerId: null,
    letzteHerzZeit: 0,
    naechsteSuperkraftZeit: 0,
    superLaserEndZeit: 0,
    schildEndZeit: 0,
    nachladeZeit: 1000,
    schnellesNachladenEndZeit: 0,
    hatGoldenesHerz: false,
    sternIntervall: 30,
    sternGeschwindigkeitMin: 2,
    sternGeschwindigkeitMax: 4,
    spieler: {},
    raumschiffBild: null,
    lootboxBild: null,
    sterne: [],
    schuesse: [],
    spielEndeAnzeige: { hidden: false },
    spielEndePunkteText: { textContent: "" },
    neuStartenKnopf: { addEventListener: () => {} },
    levelAuswahl: { hidden: false },
    levelKnoepfe: []
  };

  const context = vm.createContext(sandbox);

  const testCode = `
  // 1. At millis=500 activate the random branch
  set_current_millis(500);
  aktiviereZufaelligeSuperkraft();

  // Assert nachladeZeit=250 and schnellesNachladenEndZeit=10500
  if (nachladeZeit !== 250) {
    throw new Error("Assert failed: nachladeZeit should be 250, but got " + nachladeZeit);
  }
  if (schnellesNachladenEndZeit !== 10500) {
    throw new Error("Assert failed: schnellesNachladenEndZeit should be 10500, but got " + schnellesNachladenEndZeit);
  }

  // Prep for class checks
  aktualisiereAnzeige();
  if (!classList.contains("schnelles-nachladen")) {
    throw new Error("Assert failed: magazinAnzeige should have class 'schnelles-nachladen'");
  }

  // 2. At millis=10499 call aktualisiereFaehigkeiten and assert still 250
  set_current_millis(10499);
  aktualisiereFaehigkeiten();
  if (nachladeZeit !== 250) {
    throw new Error("Assert failed: nachladeZeit should still be 250 at 10499, but got " + nachladeZeit);
  }
  if (!classList.contains("schnelles-nachladen")) {
    throw new Error("Assert failed: magazinAnzeige should still have class 'schnelles-nachladen' at 10499");
  }

  // 3. At 10500 call it and assert nachladeZeit=1000 and class removed
  set_current_millis(10500);
  aktualisiereFaehigkeiten();
  if (nachladeZeit !== 1000) {
    throw new Error("Assert failed: nachladeZeit should be 1000 at 10500, but got " + nachladeZeit);
  }
  if (classList.contains("schnelles-nachladen")) {
    throw new Error("Assert failed: magazinAnzeige should NOT have class 'schnelles-nachladen' at 10500");
  }
  `;

  vm.runInContext(code + "\n" + testCode, context);
  console.log("PASS");
} catch (error) {
  console.error("FAIL:", error.stack || error.message);
  process.exit(1);
}
