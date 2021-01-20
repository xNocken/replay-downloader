const request = require('request');
const buildMeta = require('./buildMeta');
const getAccessToken = require("./getAccessToken");
const Size = require('./Size');
const fs = require('fs');
const Replay = require('./replay');

let headers;
const parts = [];
let chunksDone = false;
let headerDone = false;
let metaDone = false;
let eventsDone = false;

const size = new Size();

const metadataPath = `https://datastorage-public-service-live.ol.epicgames.com/api/v1/access/fnreplaysmetadata/public%2F${ process.argv[2] }.json`;
const baseFolderUrl = `https://datastorage-public-service-live.ol.epicgames.com/api/v1/access/fnreplays/public%2F${ process.argv[2] }`;

const buildReplay = () => {
  if (!chunksDone || !headerDone || !metaDone || !eventsDone) {
    return;
  }

  let newBuffer = new Replay(size.getBuffer());

  parts.forEach((part, index) => {
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
          case 2:
            newBuffer.writeBytes(part.data);
            break;

          case 1:
            newBuffer.writeInt32(part.Time1);
            newBuffer.writeInt32(part.Time2);
            newBuffer.writeInt32(part.data.length);
            newBuffer.writeInt32(part.SizeInBytes);
            newBuffer.writeBytes(part.data);
            break;

          case 3:
            newBuffer.writeString(part.Id);
            newBuffer.writeString(part.Group);
            newBuffer.writeString(part.Metadata ||'');
            newBuffer.writeInt32(part.Time1);
            newBuffer.writeInt32(part.Time2);
            newBuffer.writeInt32(part.data.length);
            newBuffer.writeBytes(part.data);
        }

        if (part.size !== (newBuffer.offset - startOffset)) {
          throw Error(`Invalid size in type ${ part.chunkType }, Expected: ${ part.size } Got: ${ newBuffer.offset - startOffset }`)
        }

        newBuffer.writeInt32(newBuffer.offset - startOffset, chunkTypeOffset);
    }
  });

  size.validate(newBuffer);

  fs.writeFileSync('result.replay', newBuffer.buffer);
};

const handleChunks = (chunks) => {
  let resultCount = 0;
  let i = 0;

  const interval = setInterval(() => {
    const chunkPath = chunks[i];

    if (!chunkPath) {
      clearInterval(interval);
      return;
    }
    const index = i;
    i++;

    request(`${ baseFolderUrl }%2F${ chunkPath.Id }.bin`, {
      headers,
      method: 'get',
    }, (_, __, data) => {
      if (_) {
        console.log(_);
      }
      const { files } = JSON.parse(data);

      Object.values(files).forEach(({ readLink }) => {
        request(readLink, {
          method: 'get',
          encoding: null,
        }, (_, __, chunk) => {
          if (_) {
            console.log(_);
          }

          resultCount++;
          parts[index + 2] = {
            ...chunkPath,
            data: chunk,
            type: 'chunk',
            chunkType: 1,
            size: chunk.length + 16,
          }

          size.size += chunk.length + 8 + 16;

          if (resultCount === chunks.length) {
            chunksDone = true;

            buildReplay();
          }
        });
      })
    })
  }, 300);
}

const handleEvents = (chunks, partsOffset) => {
  let resultCount = 0;
  let i = 0;

  const interval = setInterval(() => {
    const chunkPath = chunks[i];

    if (!chunkPath) {
      clearInterval(interval);
      return;
    }
    const index = i;
    i++;

    request(`${ baseFolderUrl }%2F${ chunkPath.Id }.bin`, {
      headers,
      method: 'get',
    }, (_, __, data) => {
      if (_) {
        console.log(_);
      }
      const { files } = JSON.parse(data);

      Object.values(files).forEach(({ readLink }) => {
        request(readLink, {
          method: 'get',
          encoding: null,
        }, (_, __, chunk) => {
          if (_) {
            console.log(_);
          }

          resultCount++;
          parts[index + partsOffset] = {
            ...chunkPath,
            data: chunk,
            type: 'chunk',
            chunkType: 3,
            size: chunk.length + 12 + chunkPath.Id.length + 5 + chunkPath.Group.length + 5 + (chunkPath.Metadata ? chunkPath.Metadata.length + 5 : 5),
          }

            size.size += chunk.length + 8 + 12 + chunkPath.Id.length + 5 + chunkPath.Group.length + 5 + (chunkPath.Metadata ? chunkPath.Metadata.length + 5 : 5);

          if (resultCount === chunks.length) {
            eventsDone = true;

            buildReplay();
          }
        });
      })
    })
  }, 300);
}

getAccessToken((accessToken) => {
  headers = {
    Authorization: accessToken,
  };

  request(metadataPath, {
    headers,
    method: 'get',
  }, (_, __, data) => {
    const { files } = JSON.parse(data);

    Object.values(files).forEach(({ readLink }) => {
      request(readLink, {
        method: 'get',
      }, (_, __, replayMeta) => {
        const meta = JSON.parse(replayMeta);

        const { DataChunks, Checkpoints, Events } = meta;

        fs.writeFileSync('meta.json', JSON.stringify(meta, null, 2));

        delete meta.DataChunks;
        delete meta.Checkpoints;
        delete meta.Events;

        handleChunks(DataChunks);
        handleEvents(Events, DataChunks.length + 2);

        request((`${ baseFolderUrl }%2Fheader.bin`), {
          headers,
          method: 'get',
        }, (_, __, data) => {
          Object.values(JSON.parse(data).files).forEach(({ readLink }) => {
            request((readLink), {
              method: 'get',
              encoding: null
            }, (_, __, header) => {
              parts[1] = {
                type: 'chunk',
                chunkType: 0,
                size: header.length,
                data: header,
              }

              size.size += header.length + 8;

              headerDone = true;

              buildReplay();
            });
          });
        });

        const metaBuffer = buildMeta(meta);

        parts[0] = {
          type: 'meta',
          size: metaBuffer.length,
          data: metaBuffer,
        };

        size.size += metaBuffer.length;

        metaDone = true;

        buildReplay();
      });
    });
  });
});
