const buildMeta = require('./src/buildMeta');
const buildReplay = require('./src/buildReplay');
const downloadMetadata = require('./src/downloadMetadata');
const handleDownload = require('./src/handleDownload');

const downloadReplay = (matchId, callback = (result, err) => { }, config, updateCallback = () => { }) => {
  downloadMetadata(matchId, config.deviceAuth, (meta, err) => {
    if (!meta) {
      callback(false, err);

      return;
    }

    const downloadChunks = [];
    const resultChunks = [];
    let { DataChunks, Checkpoints, Events } = meta;

    delete meta.DataChunks;
    delete meta.Checkpoints;
    delete meta.Events;

    if (!DataChunks) {
      DataChunks = [];
    }

    if (!Checkpoints) {
      Checkpoints = [];
    }

    if (!Events) {
      Events = [];
    }

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

module.exports = { downloadReplay, downloadMetadata};
