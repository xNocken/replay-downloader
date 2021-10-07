class Size {
  size = 0;

  getBuffer() {
    return Buffer.from({ length: this.size + (this.bitSize ? 1 : 0) });
  }

  validate(replay) {
    if (replay.offset !== this.size + (this.bitSize ? 1 : 0)) {
      throw Error(`Invalid buffer size. Expected to write ${this.size} bytes, instead wrote ${replay.offset}`);
    }
  }
}

module.exports = Size;
