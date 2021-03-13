const metaDataCache = {};
const { metaDataUrl } = require('../constants');
const downloadFile = require('./downloadFile');

const downloadMetadata = (matchId, deviceAuth, useCache, callback) => {
  if (useCache && metaDataCache[matchId]) {
    callback(metaDataCache[matchId]);

    return;
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
