const Replay = require("./Replay");
const Size = require("./Size");

const buildReplay = (parts) => {
  const size = new Size();

  parts.forEach((chunk) => {
    size.size += chunk.size;
  });

  let newBuffer = new Replay(size.getBuffer());

  parts.forEach((part) => {
    switch (part.type) {
      case 'meta':
        newBuffer.writeBytes(part.data);
        break;

      case 'chunk':
        newBuffer.writeInt32(part.chunkType);
        const chunkTypeOffset = newBuffer.offset;
        newBuffer.skip(4);

        const startOffset = newBuffer.offset;

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
        }

        newBuffer.writeInt32(newBuffer.offset - startOffset, chunkTypeOffset);
    }
  });

  return newBuffer.buffer;
};

module.exports = buildReplay;
