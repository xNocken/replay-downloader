const fs = require('fs');

const replayDownloader = require('.');
const deviceAuth = require('./deviceAuths.json');

replayDownloader.downloadReplay({
  matchId: '5f031170d1dd4d62acb1ace83e034a86',
  eventCount: 1000,
  dataCount: 1000,
  checkpointCount: 0,
  maxConcurrentDownloads: 10,
  deviceAuth,
  updateCallback: (data) => {
    console.log('');
    console.log('One');
    console.log('header', `${data.header.current}/${data.header.max}`);
    console.log('data', `${data.dataChunks.current}/${data.dataChunks.max}`);
    console.log('events', `${data.eventChunks.current}/${data.eventChunks.max}`);
    console.log('checkpoints', `${data.checkpointChunks.current}/${data.checkpointChunks.max}`);
  },
}).then((replay) => {
  fs.writeFileSync('result.replay', replay);
}).catch((err) => {
  console.log(err);
});

// replayDownloader.downloadMetadata({
//   matchId: '09525a55bf724b54b6cae5921f80dcba',
//   chunkDownloadLinks: true,
//   deviceAuth,
// }).then((metadata) => {
//   fs.writeFileSync('metadata.json', JSON.stringify(metadata, null, 2));
// }).catch((err) => {
//   console.log(err);
// })
