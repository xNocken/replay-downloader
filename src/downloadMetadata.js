const metaDataCache = {};
const { metaDataUrl } = require('../constants');
const downloadFile = require('./downloadFile');

const downloadMetadata = (matchId, deviceAuth, callback) => {
  if (metaDataCache[matchId]) {
    return metaDataCache[matchId];
  }

  downloadFile(metaDataUrl + matchId + '.json', deviceAuth, (data, err) => {
    if (!data) {
      callback(false, err);

      return;
    }

    const newData = JSON.parse(data);

    metaDataCache[matchId] = newData;

    callback(newData);
  });
};

module.exports = downloadMetadata;
