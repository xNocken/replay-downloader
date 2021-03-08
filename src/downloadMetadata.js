const metaDataCache = {};
const downloadFile = require('./downloadFile');
const metadataPath = 'https://datastorage-public-service-live.ol.epicgames.com/api/v1/access/fnreplaysmetadata/public%2F';

const downloadMetadata = (matchId, deviceAuth, callback) => {
  if (metaDataCache[matchId]) {
    return metaDataCache[matchId];
  }

  downloadFile(metadataPath + matchId + '.json', deviceAuth, (data, err) => {
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
