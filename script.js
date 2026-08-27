let punkte = 0;
let leben = 3;
let bestePunkte = 0;
let spieler;
let sterne = []; // [] erzeugt ein leeres Array, also eine Leere Liste
let schuesse = [];
let punkteText;
let bestePunkteText;
let lebenText;
let spielEndeAnzeige;
let spielEndePunkteText;
let neuStartenKnopf;

// Hier wird das Spiel vorbereitet.
// p5.js ruft setup einmal am Anfang auf: https://p5js.org/reference/p5/setup/
function setup() {
  // createCanvas erstellt die Zeichenflaeche: https://p5js.org/reference/p5/createCanvas/
  createCanvas(820, 560); // Breite und Hoehe des Spielfelds
  spieler = {
    positionX: width / 2,
    positionY: height - 40,
    groesse: 26,
    breite: 100,
    hoehe: 20,
    geschwindigkeit: 5,
  };

  // getElementById sucht ein HTML-Element mit einer bestimmten ID: https://developer.mozilla.org/de/docs/Web/API/Document/getElementById
  punkteText = document.getElementById("score");
  bestePunkteText = document.getElementById("best");
  lebenText = document.getElementById("leben");
  spielEndeAnzeige = document.getElementById("spiel-ende");
  spielEndePunkteText = document.getElementById("spiel-ende-punkte");
  neuStartenKnopf = document.getElementById("neu-starten-knopf");
  // addEventListener startet eine Funktion bei einem Klick auf den Button: https://developer.mozilla.org/de/docs/Web/API/EventTarget/addEventListener
  neuStartenKnopf.addEventListener("click", starteSpielNeu);
  aktualisiereAnzeige();
  // noCursor versteckt den Mauszeiger auf der Zeichenflaeche: https://p5js.org/reference/p5/noCursor/
  noCursor();
}

// Diese Funktion laeuft in jedem Spielbild.
// p5.js ruft draw wiederholt fuer die Animation auf: https://p5js.org/reference/p5/draw/
function draw() {
  // background fuellt die Zeichenflaeche mit einer Hintergrundfarbe: https://p5js.org/reference/p5/background/
  background('#331c1c'); // Hintergrundfarbe des Spielfelds

  bewegeSpieler();
  zeichneSpieler();
  erzeugeSterne();
  aktualisiereSterne();
  zeichneSterne();
  aktualisiereSchuesse();
  zeichneSchuesse();
  pruefeKollisionen();

  zeichneBoden();
}

// Die Pfeiltasten und A/D bewegen den Spieler.
function bewegeSpieler() {
  // keyIsDown prueft, ob eine Taste gerade gedrueckt wird: https://p5js.org/reference/p5/keyIsDown/
  if (keyIsDown(LEFT_ARROW) || keyIsDown(65)) {
    spieler.positionX -= spieler.geschwindigkeit;
  }

  if (keyIsDown(RIGHT_ARROW) || keyIsDown(68)) {
    spieler.positionX += spieler.geschwindigkeit;
  }

  // constrain begrenzt eine Zahl auf einen bestimmten Bereich: https://p5js.org/reference/p5/constrain/
  spieler.positionX = constrain(
    spieler.positionX, // Position, die begrenzt wird
    30, // Linker Rand
    width - 30 // Rechter Rand
  );
}

// Der Spieler wird als kleines Raumschiff gezeichnet.
function zeichneSpieler() {
  // fill legt die Fuellfarbe fuer Formen fest: https://p5js.org/reference/p5/fill/
  fill("#38bdf8");
  // rectMode legt fest, wie die Position eines Rechtecks bestimmt wird: https://p5js.org/reference/p5/rectMode/
  rectMode(CENTER);
  // rect zeichnet ein Rechteck: https://p5js.org/reference/p5/rect/
  rect(
    spieler.positionX, // Waagerechte Position des Raumschiffs
    spieler.positionY, // Senkrechte Position des Raumschiffs
    spieler.breite, // Breite des Raumschiffs
    spieler.hoehe,// Hoehe des Raumschiffs
    8 // Rundung der Ecken
  );

  // fill legt die Fuellfarbe fuer den Feuerstrahl fest: https://p5js.org/reference/p5/fill/
  fill("#facc15");
  // circle zeichnet einen Kreis: https://p5js.org/reference/p5/circle/
  circle(
    spieler.positionX, // Waagerechte Position
    spieler.positionY - 18, // Senkrechte Position ueber dem Raumschiff
    12 // Durchmesser des Feuerstrahls
  );
}

// Alle 35 Bilder erscheint ein neuer Stern.
function erzeugeSterne() {
  if (frameCount % 35 === 0) {
    let stern = {
      // random erzeugt eine zufaellige Zahl: https://p5js.org/reference/p5/random/
      positionX: random(20, width - 20), // Zufallsposition zwischen linkem und rechtem Rand
      positionY: -20,
      // random bestimmt auch die Groesse des Sterns: https://p5js.org/reference/p5/random/
      groesse: random(12, 22), // Zufallsgroesse zwischen 12 und 22
      // random bestimmt die Fallgeschwindigkeit: https://p5js.org/reference/p5/random/
      geschwindigkeit: random(2, 4), // Zufallsgeschwindigkeit zwischen 2 und 4
      farbe: erzeugeZufaelligeFarbe(),
    };

    // push fügt dem Array sterne ein neues Element (Stern) am Ende hinzu.
    sterne.push(stern);
  }
}

// Diese Funktion erstellt eine zufaellige Farbe in der Schreibweise #rrggbb.
function erzeugeZufaelligeFarbe() {
  // random erzeugt eine zufaellige Zahl: https://p5js.org/reference/p5/random/
  // floor rundet eine Zahl auf die naechste ganze Zahl ab: https://p5js.org/reference/p5/floor/
  let farbNummer = floor(random(0, 16777216)); // Eine von 16.777.216 moeglichen Farben
  return `#${farbNummer.toString(16).padStart(6, "0")}`;
}

// Die Sterne fallen nach unten.
function aktualisiereSterne() {
  // sterne ist ein Array, also eine Liste mit allen Sternen.
  // Die Schleife startet beim letzten Stern und zaehlt rueckwaerts bis zum ersten.
  // Das ist praktisch, falls spaeter ein Stern aus der Liste entfernt wird.
  for (let index = sterne.length - 1; index >= 0; index--) {
    // sterne[index] ist der Stern an der aktuellen Stelle in der Liste.
    sterne[index].positionY += sterne[index].geschwindigkeit;

    // Dieser Stern ist unter dem Spielfeld und wurde nicht gefangen.
    if (sterne[index].positionY > height + 30) {
      leben -= 1;
      lebenText.textContent = leben;
      sterne.splice(index, 1);
      if (leben <= 0) {
        beendeSpiel();
      }
      // return beendet diese Funktion sofort.
      return;
    }
  }
}

// Alle Sterne werden auf dem Spielfeld angezeigt.
function zeichneSterne() {
  for (let stern of sterne) {
    // fill legt die Farbe des aktuellen Sterns fest: https://p5js.org/reference/p5/fill/
    fill(stern.farbe);
    // circle zeichnet den aktuellen Stern als Kreis: https://p5js.org/reference/p5/circle/
    circle(
      stern.positionX, // Waagerechte Position des Sterns
      stern.positionY, // Senkrechte Position des Sterns
      stern.groesse // Durchmesser des Sterns
    );
  }
}
// Die Sterne fallen nach unten.
function aktualisiereSchuesse () {
  for (let index = schuesse.length - 1; index >= 0; index--) {
    let schuss = schuesse[index];
    schuss.positionY  = schuss.positionY - 7;
    if (schuss.positionY < 0) {
      schuesse.splice(index, 1);
    }
  }
}

function zeichneSchuesse() {
  for (let schuss of schuesse) {
    circle(schuss.positionX, schuss.positionY, 10);
  }
}
// Hier wird geprueft, ob der Spieler einen Stern faengt.
function pruefeKollisionen() {
  for (let index = sterne.length - 1; index >= 0; index = index -1) {
    let stern = sterne[index];
    // dist berechnet den Abstand zwischen zwei Punkten: https://p5js.org/reference/p5/dist/
    let linkerRandSpieler = spieler.positionX - spieler.breite / 2;
    let rechterRandSpieler = spieler.positionX + spieler.breite / 2;
    let obererRandSpieler = spieler.positionY - spieler.hoehe / 2;
    let abstandSchuss = 1000;
    for (let schuss of schuesse) {
      let abstandDieserSchuss = dist(
        schuss.positionX,
        schuss.positionY,
        stern.positionX,
        stern.positionY
      );
      abstandSchuss = min(abstandSchuss, abstandDieserSchuss);
    }
    if ((linkerRandSpieler< stern.positionX && 
        rechterRandSpieler > stern.positionX && 
        obererRandSpieler < stern.positionY) || 
      abstandSchuss < (stern.groesse + 10) / 2) {
      sterne.splice(index, 1);
      punkte += 1;
      // max gibt den groesseren von zwei Werten zurueck: https://p5js.org/reference/p5/max/
      bestePunkte = max(bestePunkte, punkte);
      aktualisiereAnzeige();
    }
  }
}

// Wenn ein Stern verpasst wird, wird Game Over angezeigt.
function beendeSpiel() {
  if (punkte > 0) {
    // max verhindert, dass der bisherige Rekord kleiner wird: https://p5js.org/reference/p5/max/
    bestePunkte = max(bestePunkte, punkte);
  }
  spielEndePunkteText.textContent = punkte;
  sterne = [];
  spielEndeAnzeige.hidden = false;
  // noLoop haelt die Animation an: https://p5js.org/reference/p5/noLoop/
  noLoop();
}

// Der Button setzt das Spiel fuer eine neue Runde zurueck.
function starteSpielNeu() {
  punkte = 0;
  leben = 3;
  sterne = [];
  spieler.positionX = width / 2;
  aktualisiereAnzeige();
  spielEndeAnzeige.hidden = true;
  // loop laesst die Animation wieder weiterlaufen: https://p5js.org/reference/p5/loop/
  loop();
}

// Die Punktzahlen werden oben im Spiel angezeigt.
function aktualisiereAnzeige() {
  punkteText.textContent = punkte;
  bestePunkteText.textContent = bestePunkte;
  lebenText.textContent = leben;
}

// Der gruene Boden zeigt das Ende des Spielfelds.
function zeichneBoden() {
  // fill legt die Farbe des Bodens fest: https://p5js.org/reference/p5/fill/
  fill("#22c55e");
  // rect zeichnet den Boden als Rechteck: https://p5js.org/reference/p5/rect/
  rect(
    0, // Start am linken Rand
    height - 8, // Position nahe am unteren Rand
    width, // Breite des gesamten Spielfelds
    10 // Hoehe des Bodens
  );
}

// Die Maus kann den Spieler ebenfalls bewegen.
// p5.js ruft mouseMoved bei einer Mausbewegung auf: https://p5js.org/reference/p5/mouseMoved/
function mouseMoved() {
  spieler.positionX = mouseX;
}
function mousePressed() {
  let schuss = {
    positionX: spieler.positionX,
    positionY: spieler.positionY,
  };
  console.log("Schuss abgefeuert:", schuss);
  schuesse.push(schuss);
}