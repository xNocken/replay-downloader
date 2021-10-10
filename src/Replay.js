class Replay {
  /**
   * @type {Buffer}
   */
  buffer;

  header = {};

  offset = 0;

  constructor(replay) {
    this.buffer = replay;
  }

  skip(amount) {
    this.offset += amount;
  }

  goTo(offset) {
    this.offset = offset;
  }

  writeInt64(value, offset) {
    if (!offset) {
      this.offset += 8;
    }

    return this.buffer.writeBigInt64LE(BigInt(value), offset || this.offset - 8);
  }

  writeInt32(value, offset) {
    if (!offset) {
      this.offset += 4;
    }

    return this.buffer.writeInt32LE(value, offset || this.offset - 4);
  }

  writeUInt32(value, offset) {
    if (!offset) {
      this.offset += 4;
    }

    return this.buffer.writeUInt32LE(value, offset || this.offset - 4);
  }

  writeInt16(value, offset) {
    if (!offset) {
      this.offset += 2;
    }

    return this.buffer.writeInt16LE(value, offset || this.offset - 2);
  }

  writeUInt16(value, offset) {
    if (!offset) {
      this.offset += 2;
    }

    return this.buffer.writeUInt16LE(value, offset || this.offset - 2);
  }

  writeByte(value, offset) {
    if (!offset) {
      this.offset += 1;
    }

    this.buffer[offset || (this.offset - 1)] = value & 255;
  }

  writeGuid(guid) {
    this.writeBytes(Buffer.from(guid, 'hex'));
  }

  writeString(string, offset) {
    this.writeInt32(string.length + 1, offset);

    this.writeBytes(Buffer.from(string, offset + 4));

    this.writeByte(0, offset);
  }

  writeBytes(bytes, offset) {
    bytes.forEach((byte, index) => {
      this.writeByte(byte, offset + index);
    });
  }

  writeArray(array, fn) {
    this.writeInt32(array.length);

    array.forEach((entry) => {
      fn(this, entry);
    });
  }

  writeObject(array, fn1, fn2) {
    this.writeInt32(Object.values(array).length);

    Object.entries(array).forEach(([key, value]) => {
      fn1(this, key);
      fn2(this, value);
    });
  }

  atEnd() {
    return this.offset >= this.buffer.byteLength;
  }
}

module.exports = Replay;
