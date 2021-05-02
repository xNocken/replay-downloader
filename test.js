const replayDownloader = require('.');
const deviceAuth = require('./deviceAuths.json');
const fs = require('fs');

replayDownloader.downloadReplay({
  matchId: '09525a55bf724b54b6cae5921f80dcba',
  eventCount: 1000,
  dataCount: 1000,
  checkpointCount: 0,
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
})

// replayDownloader.downloadMetadata({
//   matchId: '09525a55bf724b54b6cae5921f80dcba',
//   chunkDownloadLinks: true,
//   deviceAuth,
// }).then((metadata) => {
//   fs.writeFileSync('metadata.json', JSON.stringify(metadata, null, 2));
// }).catch((err) => {
//   console.log(err);
// })
