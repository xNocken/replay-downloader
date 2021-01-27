const request = require('request');
const buildMeta = require('./buildMeta');
const getAccessToken = require("./getAccessToken");
const Size = require('./Size');
const Replay = require('./replay');

let headers;
let parts = [];
let chunksDone = false;
let checkpointsDone = false;
let headerDone = false;
let metaDone = false;
let eventsDone = false;
let isFailed = false;
let config;

let size = new Size();
let callback;

const metadataPath = (id) => `https://datastorage-public-service-live.ol.epicgames.com/api/v1/access/fnreplaysmetadata/public%2F${id}.json`;
const baseFolderUrl = (id) => `https://datastorage-public-service-live.ol.epicgames.com/api/v1/access/fnreplays/public%2F${id}`;

const buildReplay = () => {
  if (isFailed && config.quitOnFail) {
    throw Error('Something gone wrong while downloading');
  }

  if (!chunksDone || !headerDone || !metaDone || !eventsDone || !checkpointsDone) {
    return;
  }

  let newBuffer = new Replay(size.getBuffer());
  if (!isFailed) {
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

          if (part.size !== (newBuffer.offset - startOffset)) {
          }

          newBuffer.writeInt32(newBuffer.offset - startOffset, chunkTypeOffset);
      }
    });
  }

  delete newBuffer;
  delete parts;

  headers;
  parts = [];
  chunksDone = false;
  headerDone = false;
  checkpointsDone = false;
  metaDone = false;
  eventsDone = false;
  isFailed = false;

  size = new Size();

  callback(newBuffer.buffer);
};

const handleDownload = (link, callback, encoding) => {
  request(link, { headers }, (err, res, body) => {
    if (res.statusCode !== 200 || err) {
      callback(false, err, body);
      return;
    }

    const { readLink } = Object.values(JSON.parse(body).files)[0];

    request(readLink, {
      encoding,
    }, (err2, res2, body2) => {
      if (res2.statusCode !== 200) {
        callback(false, err, body2);
        return;
      }

      callback(body2);
    });
  });
}

const handleChunks = (chunks, id) => {
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

    handleDownload(`${baseFolderUrl(id)}%2F${chunkPath.Id}.bin`, (chunk, err, data2) => {
      if (!chunk) {
        isFailed = true;

        console.log(err || data2)

        if (++resultCount === chunks.length) {
          chunksDone = true;

          buildReplay(id);
        }
        return;
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

        buildReplay(id);
      }
    }, null);
  }, 300);
}

const handleCheckpoints = (chunks, partsOffset, id) => {
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

    handleDownload(`${baseFolderUrl(id)}%2F${chunkPath.Id}.bin`, (chunk, err, data2) => {
      if (!chunk) {
        console.log(err || data2);

        isFailed = true;

        if (++resultCount === chunks.length) {
          checkpointsDone = true;

          buildReplay(id);
        }

        return;
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
        checkpointsDone = true;

        buildReplay(id);
      }
    }, null);
  }, 300);
}

const handleEvents = (chunks, partsOffset, id) => {
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

    handleDownload(`${baseFolderUrl(id)}%2F${chunkPath.Id}.bin`, (chunk, err, data2) => {
      if (!chunk) {
        console.log(err || data2);

        isFailed = true;

        if (++resultCount === chunks.length) {
          eventsDone = true;

          buildReplay(id);
        }

        return;
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

        buildReplay(id);
      }
    }, null)
  }, 300);
}

const downloadReplay = (id, callbackIn, configIn) => {
  config = configIn;
  callback = callbackIn;

  getAccessToken((accessToken) => {
    headers = {
      Authorization: accessToken,
    };

    handleDownload(metadataPath(id), (data, err, data2) => {
      if (!data) {
        console.log(err || data2);
        callback(false);

        return;
      }

      const meta = JSON.parse(data);

      const { DataChunks, Checkpoints, Events } = meta;

      delete meta.DataChunks;
      delete meta.Checkpoints;
      delete meta.Events;

      handleChunks(DataChunks.slice(0, config.dataCount), id);
      handleEvents(Events.slice(0, config.eventCount), Math.min(DataChunks.length, config.dataCount) + 2, id);
      handleCheckpoints(Checkpoints.slice(0, config.checkpointCount), Math.min(DataChunks.length, config.dataCount) + 2 + Math.min(Events.length, config.eventCount), id);

      handleDownload(`${baseFolderUrl(id)}%2Fheader.bin`, (header, err, data2) => {
        if (!data) {
          headerDone = true;
          console.log(err || data2);

          buildReplay();
          return;
        }

        parts[1] = {
          type: 'chunk',
          chunkType: 0,
          size: header.length,
          data: header,
        }

        size.size += header.length + 8;

        headerDone = true;

        buildReplay(id);
      }, null);

      const metaBuffer = buildMeta(meta);

      parts[0] = {
        type: 'meta',
        size: metaBuffer.length,
        data: metaBuffer,
      };

      size.size += metaBuffer.length;

      metaDone = true;

      buildReplay(id);
    }, 'utf-8');
  });
};

module.exports = downloadReplay;