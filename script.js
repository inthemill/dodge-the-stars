let punkte = 0;
let leben = 3;
let bestePunkte = 0;
const MAX_MAGAZIN = 5;
let magazin = MAX_MAGAZIN;
let nachladeTimerId = null;
let letzteHerzZeit = 0;
let naechsteSuperkraftZeit = 0;
let superLaserEndZeit = 0;
let schildEndZeit = 0;
let nachladeZeit = 1000;
let schnellesNachladenEndZeit = 0;
let hatGoldenesHerz = false;
let rundenStartZeit = 0;
let sternIntervall = 30;
let sternGeschwindigkeitMin = 2;
let sternGeschwindigkeitMax = 4;
let spieler;
let raumschiffBild;
let lootboxBild;
let sterne = []; // [] erzeugt ein leeres Array, also eine Leere Liste
let schuesse = [];
let punkteText;
let bestePunkteText;
let lebenText;
let goldenesHerzText;
let magazinText;
let magazinAnzeige;
let spielEndeAnzeige;
let spielEndePunkteText;
let neuStartenKnopf;
let levelAuswahl;
let levelKnoepfe;

// p5.js laedt Bilder vor dem Start des Spiels.
function preload() {
  raumschiffBild = loadImage("raumschiff.svg");
  lootboxBild = loadImage("lootbox.svg");
}

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
  goldenesHerzText = document.getElementById("goldenes-herz");
  magazinText = document.getElementById("magazin");
  magazinAnzeige = document.getElementById("magazin-anzeige");
  spielEndeAnzeige = document.getElementById("spiel-ende");
  spielEndePunkteText = document.getElementById("spiel-ende-punkte");
  neuStartenKnopf = document.getElementById("neu-starten-knopf");
  levelAuswahl = document.getElementById("level-auswahl");
  levelKnoepfe = document.querySelectorAll("[data-level]");
  // addEventListener startet eine Funktion bei einem Klick auf den Button: https://developer.mozilla.org/de/docs/Web/API/EventTarget/addEventListener
  neuStartenKnopf.addEventListener("click", starteSpielNeu);
  for (let levelKnopf of levelKnoepfe) {
    levelKnopf.addEventListener("click", () => starteLevel(levelKnopf.dataset.level));
  }
  aktualisiereAnzeige();
  // noCursor versteckt den Mauszeiger auf der Zeichenflaeche: https://p5js.org/reference/p5/noCursor/
  noCursor();
  noLoop();
}

// Diese Funktion laeuft in jedem Spielbild.
// p5.js ruft draw wiederholt fuer die Animation auf: https://p5js.org/reference/p5/draw/
function draw() {
  // background fuellt die Zeichenflaeche mit einer Hintergrundfarbe: https://p5js.org/reference/p5/background/
  background('#0f172a'); // Hintergrundfarbe des Spielfelds

  bewegeSpieler();
  zeichneSpieler();
  erzeugeSterne();
  aktualisiereSterne();
  zeichneSterne();
  aktualisiereSchuesse();
  zeichneSchuesse();
  pruefeKollisionen();
  zeichneSuperLaser();
  zeichneSchild();
  aktualisiereFaehigkeiten();
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
  imageMode(CENTER);
  image(raumschiffBild, spieler.positionX, spieler.positionY, 100, 67);
}

// Je nach gewaehltem Level erscheint ein neuer Stern.
function erzeugeSterne() {
  if (frameCount % sternIntervall === 0) {
    let istHerz = millis() - letzteHerzZeit >= 30000;
    let istSuperkraft = !istHerz && millis() >= naechsteSuperkraftZeit;
    if (istHerz) {
      letzteHerzZeit = millis();
    }
    if (istSuperkraft) {
      naechsteSuperkraftZeit = millis() + random(40000, 60000);
    }

    let geschwindigkeitsBonus = min(
      floor((millis() - rundenStartZeit) / 10000) * 0.2,
      2
    );
    let stern = {
      // random erzeugt eine zufaellige Zahl: https://p5js.org/reference/p5/random/
      positionX: random(20, width - 20), // Zufallsposition zwischen linkem und rechtem Rand
      positionY: -20,
      // random bestimmt auch die Groesse des Sterns: https://p5js.org/reference/p5/random/
      groesse: random(12, 22), // Zufallsgroesse zwischen 12 und 22
      // random bestimmt die Fallgeschwindigkeit: https://p5js.org/reference/p5/random/
      geschwindigkeit: random(sternGeschwindigkeitMin, sternGeschwindigkeitMax) + geschwindigkeitsBonus,
      farbe: erzeugeSternFarbe(),
      istHerz: istHerz,
      istSuperkraft: istSuperkraft,
    };

    // push fügt dem Array sterne ein neues Element (Stern) am Ende hinzu.
    sterne.push(stern);
  }
}

// Diese Funktion legt die gelbe Farbe aller Sterne fest.
function erzeugeSternFarbe() {
  return "#ffff00";
}

// Die Sterne fallen nach unten.
function aktualisiereSterne() {
  // sterne ist ein Array, also eine Liste mit allen Sternen.
  // Die Schleife startet beim letzten Stern und zaehlt rueckwaerts bis zum ersten.
  // Das ist praktisch, falls spaeter ein Stern aus der Liste entfernt wird.
  for (let index = sterne.length - 1; index >= 0; index--) {
    // sterne[index] ist der Stern an der aktuellen Stelle in der Liste.
    sterne[index].positionY += sterne[index].geschwindigkeit;

    // Dieser Stern ist unter dem Spielfeld und wird entfernt.
    if (sterne[index].positionY > height + 30) {
      sterne.splice(index, 1);
    }
  }
}

// Alle Sterne werden auf dem Spielfeld angezeigt.
function zeichneSterne() {
  for (let stern of sterne) {
    if (stern.istSuperkraft) {
      imageMode(CENTER);
      image(lootboxBild, stern.positionX, stern.positionY, 42, 42);
      continue;
    }

    if (stern.istHerz) {
      zeichneHerz(stern);
      continue;
    }

    // fill legt die Farbe des aktuellen Sterns fest: https://p5js.org/reference/p5/fill/
    fill(stern.farbe);
    zeichneStern(stern);
  }
}

function zeichneStern(stern) {
  let aussenRadius = stern.groesse / 2;
  let innenRadius = aussenRadius / 2;
  beginShape();
  for (let zacke = 0; zacke < 10; zacke++) {
    let radius = zacke % 2 === 0 ? aussenRadius : innenRadius;
    let winkel = -HALF_PI + zacke * PI / 5;
    vertex(
      stern.positionX + cos(winkel) * radius,
      stern.positionY + sin(winkel) * radius
    );
  }
  endShape(CLOSE);
}

function zeichneHerz(herz) {
  fill("#ff0000");
  circle(herz.positionX - herz.groesse / 4, herz.positionY - herz.groesse / 6, herz.groesse / 2);
  circle(herz.positionX + herz.groesse / 4, herz.positionY - herz.groesse / 6, herz.groesse / 2);
  triangle(
    herz.positionX - herz.groesse / 2,
    herz.positionY,
    herz.positionX + herz.groesse / 2,
    herz.positionY,
    herz.positionX,
    herz.positionY + herz.groesse / 2
  );
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
    rectMode(CENTER);
    fill("#ff0000");
    rect(schuss.positionX, schuss.positionY, 8, 20, 4);
    fill("#fff7ed");
    rect(schuss.positionX, schuss.positionY, 3, 16, 2);
  }
}

function zeichneSuperLaser() {
  if (millis() >= superLaserEndZeit) {
    return;
  }

  rectMode(CENTER);
  fill("#ff0000");
  rect(spieler.positionX, spieler.positionY / 2, 40, spieler.positionY, 12);
  fill("#fff7ed");
  rect(spieler.positionX, spieler.positionY / 2, 16, spieler.positionY, 8);
}

function zeichneSchild() {
  if (millis() >= schildEndZeit) {
    return;
  }

  fill(56, 189, 248, 70);
  stroke("#38bdf8");
  strokeWeight(5);
  circle(spieler.positionX, spieler.positionY, 115);
  noStroke();
}

function aktiviereZufaelligeSuperkraft() {
  let superkraft = floor(random(4));
  if (superkraft === 0) {
    superLaserEndZeit = millis() + 2000;
  } else if (superkraft === 1) {
    schildEndZeit = millis() + 5000;
  } else if (superkraft === 2) {
    nachladeZeit = 250;
    schnellesNachladenEndZeit = millis() + 10000;
  } else {
    hatGoldenesHerz = true;
    leben = 4;
  }
}

function aktualisiereFaehigkeiten() {
  if (nachladeZeit === 250 && millis() >= schnellesNachladenEndZeit) {
    nachladeZeit = 1000;
    aktualisiereAnzeige();
  }
}

// Hier wird geprueft, ob Sterne das Raumschiff oder einen Schuss treffen.
function pruefeKollisionen() {
  for (let index = sterne.length - 1; index >= 0; index = index -1) {
    let stern = sterne[index];
    // dist berechnet den Abstand zwischen zwei Punkten: https://p5js.org/reference/p5/dist/
    let linkerRandSpieler = spieler.positionX - spieler.breite / 2;
    let rechterRandSpieler = spieler.positionX + spieler.breite / 2;
    let obererRandSpieler = spieler.positionY - spieler.hoehe / 2;
    let untererRandSpieler = spieler.positionY + spieler.hoehe / 2;
    let schildGetroffen = millis() < schildEndZeit &&
      dist(stern.positionX, stern.positionY, spieler.positionX, spieler.positionY) <
        57.5 + stern.groesse / 2;
    if (schildGetroffen && !stern.istHerz && !stern.istSuperkraft) {
      sterne.splice(index, 1);
      continue;
    }

    if (linkerRandSpieler < stern.positionX &&
        rechterRandSpieler > stern.positionX &&
        obererRandSpieler < stern.positionY &&
        untererRandSpieler > stern.positionY) {
      sterne.splice(index, 1);
      if (stern.istSuperkraft) {
        aktiviereZufaelligeSuperkraft();
      } else if (stern.istHerz) {
        leben = min(leben + 1, hatGoldenesHerz ? 4 : 3);
      } else {
        leben -= 1;
        if (hatGoldenesHerz && leben <= 3) {
          hatGoldenesHerz = false;
        }
      }
      aktualisiereAnzeige();
      if (leben <= 0) {
        beendeSpiel();
        return;
      }
      continue;
    }

    if (!stern.istHerz && !stern.istSuperkraft && millis() < superLaserEndZeit &&
        abs(stern.positionX - spieler.positionX) < 20) {
      sterne.splice(index, 1);
      punkte += 1;
      bestePunkte = max(bestePunkte, punkte);
      aktualisiereAnzeige();
      continue;
    }

    let abstandSchuss = 1000;
    let getroffenerSchussIndex = -1;
    for (let schussIndex = 0; schussIndex < schuesse.length; schussIndex++) {
      let schuss = schuesse[schussIndex];
      let abstandDieserSchuss = dist(
        schuss.positionX,
        schuss.positionY,
        stern.positionX,
        stern.positionY
      );
      if (abstandDieserSchuss < abstandSchuss) {
        abstandSchuss = abstandDieserSchuss;
        getroffenerSchussIndex = schussIndex;
      }
    }
    if (abstandSchuss < (stern.groesse + 10) / 2) {
      sterne.splice(index, 1);
      schuesse.splice(getroffenerSchussIndex, 1);
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

// Der Button zeigt nach einer verlorenen Runde die Level-Auswahl.
function starteSpielNeu() {
  spielEndeAnzeige.hidden = true;
  levelAuswahl.hidden = false;
}

// Ein Level setzt die Runde zurueck und bestimmt die Sternschwierigkeit.
function starteLevel(level) {
  if (level === "leicht") {
    sternIntervall = 30;
    sternGeschwindigkeitMin = 2;
    sternGeschwindigkeitMax = 4;
  } else if (level === "mittel") {
    sternIntervall = 20;
    sternGeschwindigkeitMin = 3;
    sternGeschwindigkeitMax = 5;
  } else {
    sternIntervall = 13;
    sternGeschwindigkeitMin = 4;
    sternGeschwindigkeitMax = 7;
  }

  punkte = 0;
  leben = 3;
  magazin = MAX_MAGAZIN;
  sterne = [];
  schuesse = [];
  if (nachladeTimerId !== null) {
    clearTimeout(nachladeTimerId);
  }
  nachladeTimerId = null;
  rundenStartZeit = millis();
  letzteHerzZeit = millis();
  naechsteSuperkraftZeit = millis() + random(40000, 60000);
  superLaserEndZeit = 0;
  schildEndZeit = 0;
  nachladeZeit = 1000;
  schnellesNachladenEndZeit = 0;
  hatGoldenesHerz = false;
  spieler.positionX = width / 2;
  aktualisiereAnzeige();
  levelAuswahl.hidden = true;
  // loop laesst die Animation wieder weiterlaufen: https://p5js.org/reference/p5/loop/
  loop();
}

// Die Punktzahlen werden oben im Spiel angezeigt.
function aktualisiereAnzeige() {
  punkteText.textContent = punkte;
  bestePunkteText.textContent = bestePunkte;
  lebenText.textContent = leben;
  goldenesHerzText.hidden = !hatGoldenesHerz;
  magazinText.textContent = `${magazin} / ${MAX_MAGAZIN}`;
  magazinAnzeige.classList.toggle("schnelles-nachladen", nachladeZeit === 250);
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

function starteNachladen() {
  if (nachladeTimerId !== null || magazin === MAX_MAGAZIN) {
    return;
  }

  nachladeTimerId = setTimeout(() => {
    nachladeTimerId = null;
    magazin += 1;
    aktualisiereAnzeige();
    starteNachladen();
  }, nachladeZeit);
}

function mousePressed() {
  if (!spieler || !levelAuswahl.hidden || magazin === 0) {
    return;
  }

  let schuss = {
    positionX: spieler.positionX,
    positionY: spieler.positionY,
  };
  console.log("Schuss abgefeuert:", schuss);
  schuesse.push(schuss);
  magazin -= 1;
  aktualisiereAnzeige();
  starteNachladen();
}