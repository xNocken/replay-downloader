const crypto = require('crypto');

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

    readInt64() {
        this.offset += 8;

        return this.buffer.readBigUInt64LE(this.offset - 8);
    }

    readInt32() {
        this.offset += 4;

        return this.buffer.readInt32LE(this.offset - 4);
    }

    readInt16() {
        this.offset += 2;

        return this.buffer.readInt16LE(this.offset - 2);
    }

    readByte() {
        this.offset += 1;

        return this.buffer[this.offset - 1];
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

        return this.buffer[offset || (this.offset - 1)] = value & 255;
    }

    writeGuid(guid) {
        this.writeBytes(Buffer.from(guid, 'hex'));
    }

    writeString(string, offset) {
        this.writeInt32(string.length + 1, offset);

        this.writeBytes(Buffer.from(string, offset + 4))

        this.writeByte(0, offset);
    }

    writeBytes(bytes, offset) {
        bytes.forEach((byte, index) => {
            this.writeByte(byte, offset + index);
        })
    }

    readBytes(length) {
        const result = this.buffer.slice(this.offset, this.offset + length);

        this.offset += length;

        return result;
    }

    readId() {
        return this.readBytes(16).toString('hex');
    }

    readFString() {
        const length = this.readInt32();

        if (length === 0) {
            return '';

        }


        if (length < 0) {
            return this.readBytes(length * -2).slice(0, -2).toString('utf16le').trim();
        }

        return this.readBytes(length).slice(0, -1).toString('utf-8');
    }

    writeArray(array, fn) {
        this.writeInt32(array.length);

        array.forEach((entry) => {
            fn(this, entry);
        });
    };

    writeObject(array, fn1, fn2) {
        this.writeInt32(Object.values(array).length);

        Object.entries(array).forEach(([key, value]) => {
            fn1(this, key);
            fn2(this, value);
        });
    };


    /**
     * Decrypt a buffer
     * @param {number} length buffer length
     * @returns {Buffer} decrypted buffer
     */
    decryptBuffer(length) {
        const bytes = this.readBytes(length);
        if (!this.header.isEncrypted) return bytes;

        const decipher = crypto.createDecipheriv('aes-256-ecb', this.header.encryptionKey, null);
        return Buffer.from(decipher.update(bytes, 'binary', 'binary') + decipher.final('binary'), 'binary');
    }

    atEnd() {
        return this.offset >= this.buffer.byteLength;
    }
}

module.exports = Replay;