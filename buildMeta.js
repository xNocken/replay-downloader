const Replay = require('./Replay');
const Size = require('./Size');

const buildMeta = (header) => {
    let size = new Size();

    size.size += 4;
    size.size += 4;
    size.size += 4;
    size.size += 4;
    size.size += 4;

    size.size += header.FriendlyName.length + 5;

    size.size += 4;
    size.size += 8;
    size.size += 4;
    size.size += 4;

    size.size += 4;

    const buffer = new Replay(size.getBuffer());

    buffer.writeInt32(0x1CA2E27F);
    buffer.writeInt32(6);
    buffer.writeInt32(header.LengthInMS);
    buffer.writeInt32(header.NetworkVersion); 
    buffer.writeInt32(2147483647);
    buffer.writeString(header.FriendlyName);
    buffer.writeInt32(header.bIsLive ? 1 : 0);
    buffer.writeInt64(BigInt(new Date(header.Timestamp).getTime() * 10000) + 621355968000000000n);
    buffer.writeInt32(header.bCompressed);
    buffer.writeInt32(0);
    buffer.writeArray([], (a, value) => a.writeByte(value));

    size.validate(buffer);

    return buffer.buffer;
}

module.exports = buildMeta;