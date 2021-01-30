const buildMeta = require('./src/buildMeta');
const buildReplay = require('./src/buildReplay');
const downloadFile = require('./src/downloadFile');
const handleDownload = require('./src/handleDownload');

const metadataPath = 'https://datastorage-public-service-live.ol.epicgames.com/api/v1/access/fnreplaysmetadata/public%2F';

const downloadReplay = (matchId, callback = (result, err) => { }, config, updateCallback = () => { }) => {
  downloadFile(metadataPath + matchId + '.json', config.deviceAuth, (data, err) => {
    if (!data) {
      callback(false, err);

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

    handleDownload(downloadChunks, matchId, config.deviceAuth, (result, err) => {
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
