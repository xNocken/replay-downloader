const fs = require('fs');

const replayDownloader = require('.');

replayDownloader.downloadReplay({
  matchId: '1b1e696039f04b9e8ff47a88d8260478',
  eventCount: 1000,
  dataCount: 1000,
  checkpointCount: 1000,
  maxConcurrentDownloads: 10,
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
//   matchId: '13aaa57f9afe4da7b639368bb5b6a853',
//   chunkDownloadLinks: true,
// }).then((metadata) => {
//   fs.writeFileSync('metadata.json', JSON.stringify(metadata, null, 2));
// }).catch((err) => {
//   console.log(err);
// })
