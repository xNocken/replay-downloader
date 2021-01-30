# Fortnite Replay Downloader
This module is made to download tournament replays from the Fortnite servers.

## Features
- Access token caching
- Config how many chunks to download
- Progress callback

## Requirements
- [Device Auth](https://github.com/MixV2/EpicResearch/blob/master/docs/auth/grant_types/device_auth.md)

## Usage
```js
const replayDownloader = require('fortnite-replay-downloader');
const deviceAuth = {
  device_id: "DeviceId",
  account_id: "AccountId",
  secret: "Secret"
};

replayDownloader('538113122c39463ca32930dd6346a897', (replay, err) => {
  if (replay) {
    console.log('Replay downloaded');
  } else {
    console.log(err);
  }
}, {
  eventCount: 1000,
  dataCount: 1000,
  checkpointCount: 1000,
  deviceAuth,
}, (data) => {
  console.log('');
  console.log('header', `${ data.header.current }/${ data.header.max }`);
  console.log('data', `${ data.dataChunks.current }/${ data.dataChunks.max }`);
  console.log('events', `${ data.eventChunks.current }/${ data.eventChunks.max }`);
  console.log('checkpoints', `${ data.checkpointChunks.current }/${ data.checkpointChunks.max }`);
});
```
