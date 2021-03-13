const replayDownloader = require('.');
const deviceAuth = require('./deviceAuths.json');
const fs = require('fs');

replayDownloader.downloadReplay({
  matchId: '09525a55bf724b54b6cae5921f80dcba', callback: (replay, err) => {
    if (replay) {
      fs.writeFileSync('result.replay', replay);
      console.log('one done')
    } else {
      console.log(err);
    }
  },
  eventCount: 0,
  dataCount: 1,
  checkpointCount: 0,
  deviceAuth,
  updateCallback: (data) => {
    console.log('');
    console.log('One');
    console.log('header', `${data.header.current}/${data.header.max}`);
    console.log('data', `${data.dataChunks.current}/${data.dataChunks.max}`);
    console.log('events', `${data.eventChunks.current}/${data.eventChunks.max}`);
    console.log('checkpoints', `${data.checkpointChunks.current}/${data.checkpointChunks.max}`);
  }
});

replayDownloader.downloadMetadata({
  matchId: '09525a55bf724b54b6cae5921f80dcba',
  enableCache: true,
  chunkDownloadLinks: {
    header: true,
    events: false,
    data: true,
    checkpoints: false,
  },
  deviceAuth,
  callback: (metadata, err) => {
    if (metadata) {
      fs.writeFileSync('metadata.json', JSON.stringify(metadata, null, 2));
    } else {
      console.log(err);
    }
  }
})
