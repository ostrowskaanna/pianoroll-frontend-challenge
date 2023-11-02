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

  drawLine(svg, x) {
    var line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line.setAttribute('x1', x);
    line.setAttribute('y1', 0); 
    line.setAttribute('x2', x); 
    line.setAttribute('y2', 1); 
    line.setAttribute('stroke', '#944038');
    line.setAttribute('stroke-width', 0.002);
    svg.appendChild(line);
    return line;
  }

  drawRect(svg) {
    const x1 = parseFloat(startLine.getAttribute('x1'));
    const x2 = parseFloat(endLine.getAttribute('x1'));
    const width = Math.abs(x2 - x1);

    const rectangle = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    rectangle.setAttribute('x', Math.min(x1, x2));
    rectangle.setAttribute('y', 0); 
    rectangle.setAttribute('width', width); 
    rectangle.setAttribute('height', 150); 
    rectangle.setAttribute('fill', '#944038'); 
    svg.appendChild(rectangle);
    rangeRect = rectangle;
  }

  preparePianoRollCard(rollId) {
    const cardDiv = document.createElement('div');
    cardDiv.classList.add('piano-roll-card');
    cardDiv.id = 'piano-roll-card-' + rollId;
    cardDiv.setAttribute('roll-id', rollId);

    // Handle PianoRoll selection
    cardDiv.addEventListener("click", function() {
      if(selectedRollId != rollId) {
        selectedRollId = rollId;
        setMainView();
      }
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
    
    // Handle start selection
    svg.addEventListener('mousedown', (e) => {
      isDown = true;
      if(selectedRollId == rollId) {
        const svgRect = svg.getBoundingClientRect(); // svg position
        var mouseX = e.clientX - svgRect.left; // mouse position on svg
        var x = mouseX / svgRect.width; // mouse position normalized 
        console.log("starting line");

        // Create starting line if first
        if(startLine == null) {
          startLine = this.drawLine(svg, x);

        }
        // Move starting line
        else {
          startLine.setAttribute('x1', x);
          startLine.setAttribute('x2', x);

          // Move ending line so it's not visible
          if(endLine) {
            endLine.setAttribute('x1', 0);
            endLine.setAttribute('x2', 0);
          }
        }
      }
    });

    // Handle mouse move
    svg.addEventListener('mousemove', (e) => {
      if(selectedRollId == rollId  && isDown) {
        isSelecting = true;
        // TODO draw selection while moving
      }
    });
    
    // Handle end selection 
    svg.addEventListener('mouseup', (e) => {
      if(selectedRollId == rollId && isDown && isSelecting) {
        const svgRect = svg.getBoundingClientRect(); // svg position
        var mouseX = e.clientX - svgRect.left; // mouse position on svg
        var x = mouseX / svgRect.width; // mouse position normalized 
        console.log("ending line");

        // Create ending line if first
        if(endLine == null) {
          endLine = this.drawLine(svg, x);
        }
        // Move ending line so it's visible
        else {
          endLine.setAttribute('x1', x);
          endLine.setAttribute('x2', x); 
        }
        isSelecting = false;
        isDown = false;
        this.getSelectionData();
      }
    });

    // Handle out of range selection
    svg.addEventListener('mouseleave', () => {
      isSelecting = false;
      isDown = false;
    });

    // Append the SVG to the card container
    cardDiv.appendChild(svg);

    return { cardDiv, svg }
  }

  getSelectionData() {
    const x1 = parseFloat(startLine.getAttribute('x1'));
    const x2 = parseFloat(endLine.getAttribute('x1'));
    console.log(x1, x2);
  }

  async generateSVGs() {
    if (!this.data) await this.loadPianoRollData();
    if (!this.data) return;
    
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
  setGridView(); // reset view
  const csvToSVG = new PianoRollDisplay();
  await csvToSVG.generateSVGs();
});

// Global variables
var selectedRollId = null;
var selectedRoll = null;
var startLine = null;
var endLine = null;
var rangeRect = null;
var isDown = false;
var isSelecting = false;

// DOM elements
let pianoRollContainer = null;
let viewContainer = null;
let mainPianoRollContainer = null;
window.addEventListener('load', () => {
  pianoRollContainer = document.getElementById('pianoRollContainer');
  viewContainer = document.getElementById('viewContainer');
  mainPianoRollContainer = document.getElementById('mainPianoRollContainer');
});

// Remove and clear PianoRoll from Main View
function clearCardSelection() {
  pianoRollContainer.appendChild(selectedRoll);
  // remove lines from svg
  const selectedRollSvg = selectedRoll.querySelector('svg');
  if(startLine) {
    selectedRollSvg.removeChild(startLine);
  }
  if(endLine) {
    selectedRollSvg.removeChild(endLine);
  }
  startLine = null;
  endLine = null;
  selectedRoll = null;
}

// Change view to Main
function setMainView() {
  pianoRollContainer.classList.add('mainView');
  pianoRollContainer.classList.remove('gridView');

  viewContainer.classList.add('mainViewContainer');
  viewContainer.classList.remove('gridViewContainer');

  if(selectedRoll != null) {
    clearCardSelection();
  }
  // Add selected PianoRoll to Main View
  selectedRoll = document.getElementById('piano-roll-card-' + selectedRollId);
  mainPianoRollContainer.appendChild(selectedRoll);
}

// Change view to Grid
function setGridView() {
  pianoRollContainer.classList.add('gridView');
  pianoRollContainer.classList.remove('mainView');

  viewContainer.classList.add('gridViewContainer');
  viewContainer.classList.remove('mainViewContainer');

  if(selectedRoll != null) {
    clearCardSelection();
  }
}



