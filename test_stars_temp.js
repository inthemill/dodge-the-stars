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
    min: Math.min,
    random: (a, b) => {
      if (b === undefined) return a / 2;
      return (a + b) / 2;
    },
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
    levelKnoepfe: [],
    frameCount: 0,
    width: 820,
    height: 560
  };

  const context = vm.createContext(sandbox);

  const testCode = `
  // Set up rundenStartZeit and frameCount
  rundenStartZeit = 0;
  frameCount = 30; // setting a spawn frame where frameCount % sternIntervall === 0

  // 1. At millis=0
  set_current_millis(0);
  erzeugeSterne();
  if (sterne.length !== 1) {
    throw new Error("Should have spawned 1 star at millis=0");
  }
  const speed0 = sterne[0].geschwindigkeit;
  console.log("Speed at 0:", speed0);

  // Clear stars
  sterne.length = 0;

  // 2. At millis=100000
  set_current_millis(100000);
  erzeugeSterne();
  if (sterne.length !== 1) {
    throw new Error("Should have spawned 1 star at millis=100000");
  }
  const speed100k = sterne[0].geschwindigkeit;
  console.log("Speed at 100k:", speed100k);
  if (Math.abs(speed100k - speed0 - 2) > 0.000001) {
    throw new Error("Speed at 100000 is not exactly 2 greater than speed at 0");
  }

  // Clear stars
  sterne.length = 0;

  // 3. At millis=300000
  set_current_millis(300000);
  erzeugeSterne();
  if (sterne.length !== 1) {
    throw new Error("Should have spawned 1 star at millis=300000");
  }
  const speed300k = sterne[0].geschwindigkeit;
  console.log("Speed at 300k:", speed300k);
  if (Math.abs(speed300k - speed0 - 2) > 0.000001) {
    throw new Error("Speed at 300000 is not capped at exactly 2 greater than speed at 0");
  }
  `;

  vm.runInContext(code + "\n" + testCode, context);
  console.log("RESULT: PASS");
} catch (error) {
  console.error("RESULT: FAIL", error.stack || error.message);
  process.exit(1);
}
