const tournamentDownloader = require('.');
const fs = require('fs');

tournamentDownloader('538113122c39463ca32930dd6346a897', (replay, err) => {
    if (replay) {
        fs.writeFileSync('result.replay', replay);
    } else {
        console.log(err);
    }
}, {
    eventCount: 1000,
    dataCount: 1000,
    checkpointCount: 1000,
}, (data) => {
    console.log('');
    console.log('header', `${ data.header.current }/${ data.header.max }`);
    console.log('data', `${ data.dataChunks.current }/${ data.dataChunks.max }`);
    console.log('events', `${ data.eventChunks.current }/${ data.eventChunks.max }`);
    console.log('checkpoints', `${ data.checkpointChunks.current }/${ data.checkpointChunks.max }`);
});