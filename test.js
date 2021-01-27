const tournamentDownloader = require('.');
const fs = require('fs');

tournamentDownloader('538113122c39463ca32930dd6346a897', (replay) => {
    if (replay) {
        fs.writeFileSync('result.replay', replay);
    }
}, {
    eventCount: 1000,
    dataCount: 1000,
    checkpointCount: 1000,
    exitOnFail: false,
});