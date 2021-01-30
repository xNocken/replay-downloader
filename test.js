const replayDownloader = require('.');
const deviceAuth = require('./deviceAuths.json');
const deviceAuth2 = require('./deviceAuth2.json');

replayDownloader('538113122c39463ca32930dd6346a896', (replay, err) => {
  if (replay) {
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

replayDownloader('538113122c39463ca32930dd6346a897', (replay, err) => {
  if (replay) {
    console.log('two done')
  } else {
    console.log(err);
  }
}, {
  eventCount: 0,
  dataCount: 1,
  checkpointCount: 0,
  deviceAuth: deviceAuth2,
}, (data) => {
  console.log('');
  console.log('Two');
  console.log('header', `${ data.header.current }/${ data.header.max }`);
  console.log('data', `${ data.dataChunks.current }/${ data.dataChunks.max }`);
  console.log('events', `${ data.eventChunks.current }/${ data.eventChunks.max }`);
  console.log('checkpoints', `${ data.checkpointChunks.current }/${ data.checkpointChunks.max }`);
});
