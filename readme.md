[![npm version](https://badge.fury.io/js/fortnite-replay-downloader.svg)](https://npmjs.com/package/fortnite-replay-downloader)

# Fortnite Replay Downloader
This module is made to download tournament replays from the Fortnite servers.

## Features
- Access token caching
- Config how many chunks to download
- Progress callback
- Get metadata
- Get download links for chunks

## Requirements
- A match id with a server replay. [Get one here](https://fortnite-replay.info/)

## Usage
```js
const replayDownloader = require('fortnite-replay-downloader');

replayDownloader.downloadReplay({
  matchId: '09525a55bf724b54b6cae5921f80dcba',
  eventCount: 1000,
  dataCount: 1000,
  checkpointCount: 1000,
  updateCallback: (data) => {
    console.log('');
    console.log('header', `${data.header.current}/${data.header.max}`);
    console.log('data', `${data.dataChunks.current}/${data.dataChunks.max}`);
    console.log('events', `${data.eventChunks.current}/${data.eventChunks.max}`);
    console.log('checkpoints', `${data.checkpointChunks.current}/${data.checkpointChunks.max}`);
  },
}).then((replay) => {
  console.log('Replay downloaded');
}).catch((err) => {
  console.log(err);
});
```

## Methods

### downloadReplay(config): promise(buffer)

Config
```js
{
  matchId: string, // the match id to download
  checkpointCount: number, // the amount of checkpoint chunks to download
  maxConcurrentDownloads: number // the amount of chunks downloaded at the same time (default: infinity)
  dataCount: number, // the amount of data chunks to download
  eventCount: number, // the amount of event chunks to download
  updateCallback: (updateData) => {} // gets called after every downloaded chunk with the current progress
}
```

Update callback structure
```js
{
  header: {
    current: number, // amount of header chunks downloaded (this can only be 0 or 1)
    max: number, // total amount of header chunks (this will always be 1)
  },
  data: {
    current: number, // amount of data chunks downloaded
    max: number, // total amount of data chunks
  },
  events: {
    current: number, // amount of events chunks downloaded
    max: number, // total amount of events chunks
  },
  checkpoints: {
    current: number, // amount of checkpoints chunks downloaded
    max: number, // total amount of checkpoints chunks
  },
}
```
### downloadMetadata(config): promise(result)

```js
{
  matchId: string, // the match id to download
  chunkDownloadLinks: boolean, // gives you download links and file sizes for every chunk
}
```

Result structure

```js
{
  ReplayName: string, // the replay id
  LengthInMS: number,
  NetworkVersion: number, // the current network version
  Changelist: number, // the current changelist version
  FriendlyName: string, // the replay name. Its just the name of the map
  Timestamp: string,
  bIsLive: boolean, // is the match currently running?
  bCompressed: boolean, // is the replay compressed. Replays are compressed using oodle
  DesiredDelayInSeconds: number,
  DownloadLink: string, // header download link // expires after 15 minutes
  FileSize: number,
  Checkpoints: [
    {
      Id: string, // chunk id
      Group: string, // checkpoint group
      Metadata: string, // checkpoint metadata
      Time1: number, // start time
      Time2: number, // end time
      DownloadLink: string, // expires after 15 minutes
      FileSize: number,
    }
  ],
  Events: [
    {
      Id: string, // chunk id
      Group: string, // event group
      Metadata: string, // event metadata
      Time1: number, // start time
      Time2: number, // end time
      DownloadLink: string, // expires after 15 minutes
      FileSize: number,
    }
  ],
  DataChunks: [
    {
      Id: string, // data id
      Time1: number, // start time
      Time2: number, // end time
      SizeInBytes: number, // uncompressed size
      DownloadLink: string, // expires after 15 minutes
      FileSize: number,
    }
  ],
}
```
