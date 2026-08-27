const vm = require('vm');
const fs = require('fs');
const assert = require('assert');

console.log("Starting script.js verification tests...");

// Fake Timers Implementation
let currentTime = 0;
let nextTimerId = 1;
const timers = new Map();

const customSetTimeout = (callback, delay) => {
  const id = nextTimerId++;
  timers.set(id, { callback, expiry: currentTime + delay, delay });
  return id;
};

const customClearTimeout = (id) => {
  timers.delete(id);
};

function tick(ms) {
  currentTime += ms;
  while (true) {
    let nextToRun = null;
    for (const [id, t] of timers.entries()) {
      if (t.expiry <= currentTime) {
        if (!nextToRun || t.expiry < nextToRun.expiry || (t.expiry === nextToRun.expiry && id < nextToRun.id)) {
          nextToRun = { id, ...t };
        }
      }
    }
    if (!nextToRun) break;
    timers.delete(nextToRun.id);
    nextToRun.callback();
  }
}

function getPendingTimersCount() {
  return timers.size;
}

function getPendingTimers() {
  return Array.from(timers.values());
}

// Read script.js content
const code = fs.readFileSync('script.js', 'utf8');

// DOM and P5 elements mock
const elements = {
  score: { textContent: '' },
  best: { textContent: '' },
  leben: { textContent: '' },
  magazin: { textContent: '' },
  'spiel-ende': { hidden: false },
  'spiel-ende-punkte': { textContent: '' },
  'neu-starten-knopf': { addEventListener: (event, handler) => { elements['neu-starten-knopf'].handler = handler; } }
};

const contextObject = {
  console,
  setTimeout: customSetTimeout,
  clearTimeout: customClearTimeout,
  document: {
    getElementById: (id) => elements[id] || { addEventListener: () => {}, textContent: '', hidden: false }
  },
  createCanvas: () => {},
  noCursor: () => {},
  loop: () => {},
  noLoop: () => {},
  width: 820,
  height: 560,
};

const context = vm.createContext(contextObject);
vm.runInContext(code, context);

// Call setup to initialize game state
try {
  context.setup();
  console.log("Mock setup loaded and executed successfully.");
} catch (e) {
  console.error("Error during setup:", e);
  process.exit(1);
}

const tests = [];

function runTest(name, fn) {
  try {
    fn();
    tests.push({ name, passed: true });
    console.log(`[PASS] ${name}`);
  } catch (err) {
    tests.push({ name, passed: false, error: err.message });
    console.log(`[FAIL] ${name}: ${err.message}`);
  }
}

// Reset timers and game state helper
function resetState() {
  currentTime = 0;
  timers.clear();
  nextTimerId = 1;
  context.starteSpielNeu();
}

// Test 1: mousePressed logic and initial state
runTest("Confirm initial magazine is 5 / 5 and no timers pending", () => {
  resetState();
  assert.strictEqual(context.magazin, 5, "Initial magazine is 5");
  assert.strictEqual(elements.magazin.textContent, "5 / 5", "Anzeige shows correct full magazine text");
  assert.strictEqual(getPendingTimersCount(), 0, "No reload timers should be pending initially");
});

// Test 2: Five rapid clicks
runTest("Confirm five rapid calls to mousePressed schedules exactly one 1000ms timer", () => {
  resetState();
  for (let i = 0; i < 5; i++) {
    context.mousePressed();
  }
  assert.strictEqual(context.magazin, 0, "Magazine should be empty after 5 fires");
  assert.strictEqual(elements.magazin.textContent, "0 / 5", "Anzeige shows correct magazine text 0 / 5");
  
  const pending = getPendingTimers();
  assert.strictEqual(pending.length, 1, "Exactly one timer is pending");
  assert.strictEqual(pending[0].delay, 1000, "Timer is scheduled for 1000ms");
});

// Test 3: Sequential reload step by step
runTest("Each timer execution restores only one bullet and schedules one further timer", () => {
  resetState();
  for (let i = 0; i < 5; i++) {
    context.mousePressed();
  }
  
  // Magazine is at 0 index. Let's do 1 tick of 1000ms.
  tick(1000);
  assert.strictEqual(context.magazin, 1, "After 1st reload tick, bullet count should be 1");
  assert.strictEqual(elements.magazin.textContent, "1 / 5", "Anzeige updated to 1 / 5");
  assert.strictEqual(getPendingTimersCount(), 1, "Exactly one further timer is pending for next reload step");
  
  // Tick a second time
  tick(1000);
  assert.strictEqual(context.magazin, 2, "After 2nd reload tick, bullet count should be 2");
  assert.strictEqual(getPendingTimersCount(), 1, "Exactly one further timer pending");
  
  // Tick a third time
  tick(1000);
  assert.strictEqual(context.magazin, 3, "After 3rd reload tick, bullet count should be 3");
  assert.strictEqual(getPendingTimersCount(), 1, "Exactly one further timer pending");

  // Tick a fourth time
  tick(1000);
  assert.strictEqual(context.magazin, 4, "After 4th reload tick, bullet count should be 4");
  assert.strictEqual(getPendingTimersCount(), 1, "Exactly one further timer pending");
  
  // Tick a fifth time
  tick(1000);
  assert.strictEqual(context.magazin, 5, "After 5th reload tick, bullet count should be 5");
  assert.strictEqual(elements.magazin.textContent, "5 / 5", "Anzeige updated to 5 / 5");
  assert.strictEqual(getPendingTimersCount(), 0, "No timer remains at full magazine");
});

// Test 4: starteSpielNeu clears outstanding timer and restores '5 / 5'
runTest("starteSpielNeu clears an outstanding timer and restores '5 / 5'", () => {
  resetState();
  // Fire 1 bullet
  context.mousePressed();
  assert.strictEqual(context.magazin, 4, "Magazine is 4 after 1 shot");
  assert.strictEqual(getPendingTimersCount(), 1, "Timer is pending standard reload");
  
  // Call starteSpielNeu
  context.starteSpielNeu();
  assert.strictEqual(context.magazin, 5, "Magazine restored to 5");
  assert.strictEqual(elements.magazin.textContent, "5 / 5", "Anzeige shows 5 / 5");
  assert.strictEqual(getPendingTimersCount(), 0, "Timer was successfully cleared and none pending");
});

console.log("\n--- TEST SUMMARY ---");
const failed = tests.filter(t => !t.passed);
if (failed.length === 0) {
  console.log("ALL TESTS PASSED SUCCESSFULLY!");
  process.exit(0);
} else {
  console.log(`${failed.length} TEST(S) FAILED:`);
  failed.forEach(f => {
    console.log(` - ${f.name}: ${f.error}`);
  });
  process.exit(1);
}
