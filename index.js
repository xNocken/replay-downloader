const { baseDataUrl } = require('./constants');
const buildMeta = require('./src/buildMeta');
const buildReplay = require('./src/buildReplay');
const downloadFileDirectly = require('./src/downloadFileDirectly');
const downloadFileWithLink = require('./src/downloadFileDirectly');
const downloadMetadata = require('./src/downloadMetadata');
const getDownloadLink = require('./src/getDownloadLink');
const handleDownload = require('./src/handleDownload');
const UnsuccessfulRequestException = require('./src/UnsuccessfulRequestException');

const defaultDownloadConfig = {
  updateCallback: () => { },
  eventCount: 1000,
  dataCount: 1000,
  checkpointCount: 1000,
  maxConcurrentDownloads: Infinity,
  matchId: '',
};

const defaultMetadataConfig = {
  matchId: '',
  chunkDownloadLinks: true,
};

const downloadMetadataWrapper = async (inConfig) => {
  const config = {
    ...defaultMetadataConfig,
    ...inConfig,
  };

  const metadata = await downloadMetadata(config.matchId);

  if (!metadata) {
    return null;
  }

  if (config.chunkDownloadLinks) {
    
    const chunkIds = ["header"];

    metadata["Checkpoints"].forEach((checkpointChunk) => {
      chunkIds.push(
        checkpointChunk["Id"]?.toString() ?? new Error("Failed to get chunk id")
      );
    });

    metadata["Events"].forEach((eventChunk) => {
      chunkIds.push(
        eventChunk["Id"]?.toString() ?? new Error("Failed to get chunk id")
      );
    });

    metadata["DataChunks"].forEach((dataChunk) => {
      chunkIds.push(
        dataChunk["Id"]?.toString() ?? new Error("Failed to get chunk id")
      );
    });
    const body = {
      files: chunkIds.map(id => id + ".bin"),
    };
  
    const httpContent = JSON.stringify(body);
    const files = await getDownloadLink(`${baseDataUrl}${config.matchId}/`, httpContent);

    const eacher = (theChunk) => {
      const chunk = theChunk;
      const index = `${chunk.Id}.bin`;

      if (!files[index]) {
        console.error(index, 'not found in files list');

        return;
      }

      chunk.DownloadLink = files[index].readLink;
      chunk.FileSize = files[index].size;
    };

    if (metadata.Events) {
      metadata.Events.forEach(eacher);
    }

    if (metadata.Checkpoints) {
      metadata.Checkpoints.forEach(eacher);
    }

    if (metadata.DataChunks) {
      metadata.DataChunks.forEach(eacher);
    }

    metadata.Id = 'header';
    eacher(metadata);
    delete metadata.Id;
  }

  return metadata;
};

const downloadReplay = async (inConfig) => {
  const config = {
    ...defaultDownloadConfig,
    ...inConfig,
  };

  const meta = await downloadMetadataWrapper(config);

  if (!meta) {
    throw new UnsuccessfulRequestException(500);
  }

  const { updateCallback } = config;

  const downloadChunks = [];
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

  downloadChunks.push({
    DownloadLink: meta.DownloadLink,
    type: 'chunk',
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

  const result = await handleDownload(downloadChunks, config.maxConcurrentDownloads, (type) => {
    if (!updateCallback) {
      return;
    }

    switch (type) {
      case 0:
        headerDone += 1;

        break;
      case 1:
        dataDone += 1;

        break;
      case 2:
        checkpointDone += 1;

        break;
      case 3:
        eventDone += 1;

        break;
      default:
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

  return buildReplay([
    {
      type: 'meta',
      size: metaBuffer.length,
      data: metaBuffer,
    },
    ...result,
  ]);
};

module.exports = { downloadReplay, downloadMetadata: downloadMetadataWrapper };
