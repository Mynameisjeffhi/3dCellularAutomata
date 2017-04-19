class CellularAutomaton {
  constructor (size, generationBufferSize) {
    // Log off all of our creation data
    this._generationBufferSize = generationBufferSize;
    this._gridBaseSize = size;
    this._gridDoubleSize = 2*size;
    this._yOffset = this._gridDoubleSize;
    this._zOffset = this._gridDoubleSize * this._yOffset;

    // Initialize the grid
    this._grids = new Array(generationBufferSize);
    for (var genIdx = 0; genIdx < generationBufferSize; genIdx++) {
      this._grids[genIdx] = new Uint8Array(2*size*2*size*size);
    }
    // curGen is the actual current generation; curGenIdx is the index
    // in the ring buffer; oldestGenIdx is the index of the oldest gen
    // in the ring buffer.
    this._curGen = 0;
    this._curGenIdx = 0;
    this._oldestGenIdx = 0;

    // Initialize the rules set
    this._NEIGHBOR_COUNT=12;
    this._rulesArray = new Uint8Array((this._NEIGHBOR_COUNT+1)*2);
  }

  // we return the 'large' size
  size () {
    return this._gridDoubleSize;
  }

  setRule (cellVal, neighborCount, value) {
    this._rulesArray[cellVal*(this._NEIGHBOR_COUNT+1)+neighborCount] = value;
  }

  // This sets the grid up randomly based on the provided density for 'on' cells.
  initializeRandomly (density) {
    this._curGen = 0;
    this._curGenIdx = 0;
    this._oldestGenIdx = 0;
    for (var xIdx = 0; xIdx < this._gridDoubleSize; xIdx++) {
      for (var yIdx = 0; yIdx < this._gridDoubleSize; yIdx++) {
        for (var zIdx = 0; zIdx < this._gridBaseSize; zIdx++) {
          if (Math.random() < density) {
            this.setCell(xIdx, yIdx, zIdx, 1);
          }
        }
      }
    }
  }

  // Updates the grid from the current generation to the next one.
  updateGrid () {
    var nextGenIdx = (this._curGenIdx+1)%this._generationBufferSize;
    for (var zIdx = 0; zIdx < this._gridBaseSize; zIdx++) {
      for (var yIdx = 0; yIdx < this._gridDoubleSize; yIdx++) {
        for (var xIdx = 0; xIdx < this._gridDoubleSize; xIdx++) {
          var neighborSum = 0;
          for (var neighborIdx = 0; neighborIdx < this._NEIGHBOR_COUNT; neighborIdx++) {
            var tmpX = (xIdx + CellularAutomaton._neighborList[3*neighborIdx  ] + this._gridDoubleSize) % this._gridDoubleSize;
            var tmpY = (yIdx + CellularAutomaton._neighborList[3*neighborIdx+1] + this._gridDoubleSize) % this._gridDoubleSize;
            var tmpZ = (zIdx + CellularAutomaton._neighborList[3*neighborIdx+2] + this._gridBaseSize) % this._gridBaseSize;
            neighborSum += this._grids[this._curGenIdx][tmpX + tmpY*this._yOffset + tmpZ*this._zOffset];
          }
          var currentValue = this._grids[this._curGenIdx][xIdx + yIdx*this._yOffset + zIdx*this._zOffset];
          this._grids[nextGenIdx][xIdx + yIdx*this._yOffset + zIdx*this._zOffset]
           = this._rulesArray[currentValue*(this._NEIGHBOR_COUNT+1)+neighborSum];
        }
      }
    }
    this._curGen++;
    this._curGenIdx = nextGenIdx;
    // Walk forward the oldest index in the buffer if we've hit it
    if (this._curGenIdx == this._oldestGenIdx)
      this._oldestGenIdx = (this._oldestGenIdx+1)%this._generationBufferSize;
  }

  // Steps backwards one generation
  rewindGrid () {
    if (this._curGenIdx != this._oldestGenIdx) {
      var prevGenIdx = (this._curGenIdx+this._generationBufferSize-1) % this._generationBufferSize;
      this._curGenIdx = prevGenIdx;
      this._curGen--;
    }
  }

  // Get the value of a cell (in the current generation)
  getValueAt (x, y, z) {
    return this._grids[this._curGenIdx][x+y*this._yOffset+z*this._zOffset];
  }

  // Set the value of a cell (in the current generation)
  setCell (x, y, z, value) {
    this._grids[this._curGenIdx][x+y*this._yOffset+z*this._zOffset] = value;
  }

  // Return the current generation for the CA
  currentGeneration () {
    return this._curGen;
  }

}

CellularAutomaton._neighborList = new Int32Array( [
   0,  1,  0,
   0,  1, -1,
   0, -1,  0,
   0, -1,  1,
   1,  0,  0,
   1,  0, -1,
  -1,  0,  0,
  -1,  0,  1,
   1, -1,  0,
  -1,  1,  0,
   1,  1, -1,
  -1, -1,  1
] );

