const request = require('request');
const buildMeta = require('./buildMeta');
const getAccessToken = require("./getAccessToken");
const Size = require('./Size');
const Replay = require('./Replay');

const metadataPath = 'https://datastorage-public-service-live.ol.epicgames.com/api/v1/access/fnreplaysmetadata/public%2F';
const baseFolderUrl = 'https://datastorage-public-service-live.ol.epicgames.com/api/v1/access/fnreplays/public%2F';

const buildReplay = (parts, callback) => {
  const size = new Size();

  parts.forEach((chunk) => {
    size.size += chunk.size;
  });

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

  callback(newBuffer.buffer);
};

const downloadFile = (link, callback, encoding = 'utf-8') => {
  getAccessToken((accessToken) => {
    request(link, {
      headers: {
        Authorization: accessToken,
      }
    }, (err, res, body) => {
      if (err || res.statusCode !== 200) {
        callback(false, err || body);

        return;
      }

      const { readLink } = Object.values(JSON.parse(body).files)[0];

      request(readLink, {
        encoding,
      }, (err2, res2, body2) => {
        if (err2 || res2.statusCode !== 200) {
          console.log(readLink);
          console.log(link);
          callback(false, err || body2);

          return;
        }

        callback(body2);
      });
    });
  });
};

const handleDownload = (chunks, matchId, callback, results = [], updateCallback) => {
  const nextChunk = chunks.shift();

  if (!nextChunk) {
    callback(results);

    return;
  }

  downloadFile(`${ baseFolderUrl }${ matchId }%2F${ nextChunk.Id }.bin`, (data, err) => {
    if (!data) {
      callback(false, err);

      return;
    }

    results.push({
      ...nextChunk,
      size: nextChunk.size + data.length,
      data: data,
    });

    updateCallback(nextChunk.chunkType);

    handleDownload(chunks, matchId, callback, results, updateCallback);
  }, nextChunk.encoding)
}

const downloadReplay = (matchId, callback, config, updateCallback = () => { }) => {
  downloadFile(metadataPath + matchId + '.json', (data) => {
    if (!data) {
      callback(false, data);

      return;
    }

    const meta = JSON.parse(data);

    const downloadChunks = [];
    const resultChunks = [];
    const { DataChunks, Checkpoints, Events } = meta;

    delete meta.DataChunks;
    delete meta.Checkpoints;
    delete meta.Events;

    updateCallback({
      header: {
        current: 0,
        max: 1,
      },
      dataChunks: {
        current: 0,
        max: Math.min(DataChunks.length, config.dataCount),
      },
      eventChunks: {
        current: 0,
        max: Math.min(Events.length, config.eventCount),
      },
      checkpointChunks: {
        current: 0,
        max: Math.min(Checkpoints.length, config.checkpointCount),
      },
    });

    const metaBuffer = buildMeta(meta);

    resultChunks.push({
      type: 'meta',
      size: metaBuffer.length,
      data: metaBuffer,
    });

    downloadChunks.push({
      type: 'chunk',
      Id: 'header',
      chunkType: 0,
      size: 8,
      encoding: null,
    });

    DataChunks.forEach((data, index) => {
      if (index >= config.dataCount) {
        return;
      }

      downloadChunks.push({
        ...data,
        type: 'chunk',
        chunkType: 1,
        size: 24,
        encoding: null,
      });
    });

    Events.forEach((data, index) => {
      if (index >= config.eventCount) {
        return;
      }

      downloadChunks.push({
        ...data,
        type: 'chunk',
        chunkType: 3,
        size: 35 + data.Id.length + data.Group.length + (data.Metadata ? data.Metadata.length : 0),
        encoding: null,
      });
    });

    Checkpoints.forEach((data, index) => {
      if (index >= config.checkpointCount) {
        return;
      }

      downloadChunks.push({
        ...data,
        type: 'chunk',
        chunkType: 2,
        size: 35 + data.Id.length + data.Group.length + (data.Metadata ? data.Metadata.length : 0),
        encoding: null,
      });
    });

    let dataDone = 0;
    let eventDone = 0;
    let checkpointDone = 0;
    let headerDone = 0;

    handleDownload(downloadChunks, matchId, (result, err) => {
      if (result) {
        buildReplay(result, callback);
      } else {
        callback(false, err);
      }
    }, resultChunks, (type) => {
      if (!updateCallback) {
        return;
      }

      switch (type) {
        case 0:
          headerDone++;

          break;
        case 1:
          dataDone++;

          break;
        case 2:
          checkpointDone++;

          break;
        case 3:
          eventDone++;

          break;
      }

      updateCallback({
        header: {
          current: headerDone,
          max: 1,
        },
        dataChunks: {
          current: dataDone,
          max: Math.min(DataChunks.length, config.dataCount),
        },
        eventChunks: {
          current: eventDone,
          max: Math.min(Events.length, config.eventCount),
        },
        checkpointChunks: {
          current: checkpointDone,
          max: Math.min(Checkpoints.length, config.checkpointCount),
        },
      });
    });
  });
};

module.exports = downloadReplay;