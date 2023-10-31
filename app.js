import PianoRoll from './pianoroll.js';

class PianoRollDisplay {
  constructor(csvURL) {
    this.csvURL = csvURL;
    this.data = null;
  }

  async loadPianoRollData() {
    try {
      const response = await fetch('https://pianoroll.ai/random_notes');
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      this.data = await response.json();
    } catch (error) {
      console.error('Error loading data:', error);
    }
  }

  preparePianoRollCard(rollId) {
    const cardDiv = document.createElement('div');
    cardDiv.classList.add('piano-roll-card');
    cardDiv.id = 'piano-roll-card-' + rollId;
    cardDiv.setAttribute('roll-id', rollId);

    // Handle PianoRoll selection
    cardDiv.addEventListener("click", function() {
      console.log(selectedRollId);
      if(selectedRollId != rollId) {
        selectedRollId = rollId;
        setMainView();
      }
      else {
        selectedRollId = null;
        setGridView();
      }
      console.log(selectedRollId);
    });

    // Create and append other elements to the card container as needed
    const descriptionDiv = document.createElement('div');
    descriptionDiv.classList.add('description');
    descriptionDiv.textContent = `This is a piano roll number ${rollId}`;
    cardDiv.appendChild(descriptionDiv);

    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.classList.add('piano-roll-svg');
    svg.setAttribute('width', '80%');
    svg.setAttribute('height', '150');

    // Append the SVG to the card container
    cardDiv.appendChild(svg);

    return { cardDiv, svg }
  }

  async generateSVGs() {
    if (!this.data) await this.loadPianoRollData();
    if (!this.data) return;
    
    const pianoRollContainer = document.getElementById('pianoRollContainer');
    pianoRollContainer.innerHTML = '';
    for (let it = 0; it < 20; it++) {
      const start = it * 60;
      const end = start + 60;
      const partData = this.data.slice(start, end);

      const { cardDiv, svg } = this.preparePianoRollCard(it)

      pianoRollContainer.appendChild(cardDiv);
      const roll = new PianoRoll(svg, partData);
    }
  }
}

document.getElementById('loadCSV').addEventListener('click', async () => {
  const csvToSVG = new PianoRollDisplay();
  await csvToSVG.generateSVGs();
});

// Global variables
var selectedRollId = null;
var selectedCardIdPrev = null;
let pianoRollContainer = null;
let viewContainer = null;
let mainPianoRollContainer = null;

// DOM elements
window.addEventListener('load', () => {
  pianoRollContainer = document.getElementById('pianoRollContainer');
  viewContainer = document.getElementById('viewContainer');
  mainPianoRollContainer = document.getElementById('mainPianoRollContainer');
});

// Remove PianoRoll from Main View
function clearCardSelection() {
  const prevCard = document.getElementById(selectedCardIdPrev);
  pianoRollContainer.appendChild(prevCard);
  selectedCardIdPrev = null;
}

// Change view to Main
function setMainView() {
  pianoRollContainer.classList.add('mainView');
  pianoRollContainer.classList.remove('gridView');

  viewContainer.classList.add('mainViewContainer');
  viewContainer.classList.remove('gridViewContainer');

  if(selectedCardIdPrev != null) {
    clearCardSelection();
  }
  // Add PianoRoll to Main View
  const selectedCardId = 'piano-roll-card-' + selectedRollId;
  const selectedCard = document.getElementById(selectedCardId);
  mainPianoRollContainer.appendChild(selectedCard);
  selectedCardIdPrev = selectedCardId;
}

// Chnage view to Grid
function setGridView() {
  pianoRollContainer.classList.add('gridView');
  pianoRollContainer.classList.remove('mainView');

  viewContainer.classList.add('gridViewContainer');
  viewContainer.classList.remove('mainViewContainer');

  if(selectedCardIdPrev != null) {
    clearCardSelection();
  }
}


