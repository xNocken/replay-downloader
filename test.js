const replayDownloader = require('.');
const deviceAuth = require('./deviceAuths.json');
const fs = require('fs');

replayDownloader.downloadReplay('09525a55bf724b54b6cae5921f80dcba', (replay, err) => {
  if (replay) {
    fs.writeFileSync('result.replay', replay);
    console.log('one done')
  } else {
    console.log(err);
  }
}, {
  eventCount: 0,
  dataCount: 1,
  checkpointCount: 0,
  deviceAuth,
}, (data) => {
  console.log('');
  console.log('One');
  console.log('header', `${ data.header.current }/${ data.header.max }`);
  console.log('data', `${ data.dataChunks.current }/${ data.dataChunks.max }`);
  console.log('events', `${ data.eventChunks.current }/${ data.eventChunks.max }`);
  console.log('checkpoints', `${ data.checkpointChunks.current }/${ data.checkpointChunks.max }`);
});

replayDownloader.downloadMetadata('09525a55bf724b54b6cae5921f80dcba', deviceAuth, (a) => {
  fs.writeFileSync('metadata.json', JSON.stringify(a, null, 2));
})
