const Replay = require('./Replay');
const Size = require('./Size');

const buildReplay = (parts) => {
  const size = new Size();

  parts.forEach((chunk) => {
    size.size += chunk.size;
  });

  const newBuffer = new Replay(size.getBuffer());

  parts.forEach((part) => {
    let chunkTypeOffset = 0;
    let startOffset = 0;

    switch (part.type) {
      case 'meta':
        newBuffer.writeBytes(part.data);
        break;

      case 'chunk':
        newBuffer.writeInt32(part.chunkType);
        chunkTypeOffset = newBuffer.offset;
        newBuffer.skip(4);
        startOffset = newBuffer.offset;

        switch (part.chunkType) {
          case 0:
            newBuffer.writeBytes(part.data);
            break;

          case 1:
            newBuffer.writeInt32(part.Time1);
            newBuffer.writeInt32(part.Time2);
            newBuffer.writeInt32(part.data.length);
            newBuffer.writeInt32(part.SizeInBytes);
            newBuffer.writeBytes(part.data);
            break;

          case 2:
          case 3:
            newBuffer.writeString(part.Id);
            newBuffer.writeString(part.Group);
            newBuffer.writeString(part.Metadata || '');
            newBuffer.writeInt32(part.Time1);
            newBuffer.writeInt32(part.Time2);
            newBuffer.writeInt32(part.data.length);
            newBuffer.writeBytes(part.data);
            break;

          default:
            break;
        }

        newBuffer.writeInt32(newBuffer.offset - startOffset, chunkTypeOffset);
        break;

      default:
        break;
    }
  });

  return newBuffer.buffer;
};

module.exports = buildReplay;
