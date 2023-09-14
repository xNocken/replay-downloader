const fs = require('fs');

const replayDownloader = require('.');

const [type, id, ...fa] = process.argv.slice(2);

let checkpoint = false;
let event = false;
let packets = true;

if (fa.includes('--checkpoint') || fa.includes('-c')) {
  checkpoint = true;
}

if (fa.includes('--event') || fa.includes('-e')) {
  event = true;
}

if (fa.includes('--no-data') || fa.includes('-nd')) {
  packets = false;
}

if (type === 'replay') {
  replayDownloader.downloadReplay({
    matchId: id,
    eventCount: event ? 1000 : 0,
    dataCount: packets ? 1000 : 0,
    checkpointCount: checkpoint ? 1000 : 0,
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
    fs.writeFileSync(`${id}.replay`, replay);
  }).catch((err) => {
    console.log(err);
  });
} else if (type === 'metadata') {
  replayDownloader.downloadMetadata({
    matchId: id,
    chunkDownloadLinks: true,
  }).then((metadata) => {
    fs.writeFileSync(`${id}.json`, JSON.stringify(metadata, null, 2));
  }).catch((err) => {
    console.log(err);
  });
} else {
  console.log('Invalid type', type);
}
