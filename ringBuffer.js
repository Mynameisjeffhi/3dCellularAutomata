class RingBuffer {
  constructor (bufferSize) {
    // Log off all of our creation data
    this._bufferSize = bufferSize;
    this._ringBuffer = new Array(bufferSize);
    this._curIdx = -1;
    this._startIdx = 0;
  }

  add (thing) {
    if (this._curIdx == -1) {
      this._curIdx = 0;
    } else {
      this._curIdx = (this._curIdx+1) % this._bufferSize;
      if (this._curIdx == this._startIdx) {
        this.startIdx = (this._startIdx+1) % this._bufferSize;
      }
    }
    this._ringBuffer[this._curIdx] = thing;
  }

  count () {
    if (this._startIdx == 0) {
      return (this._curIdx+1);
    } else {
      return this._bufferSize;
    }
  }

  getCurrent () {
    return this._ringBuffer[this._curIdx];
  }

  getPrevious (offset) {
    if (offset > this.count()) {
      return undefined;
    } else {
      var idx = (this._curIdx + this._bufferSize - offset) % this._bufferSize;
      return this._ringBuffer[idx];
    }
  }
}
