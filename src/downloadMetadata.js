const { metaDataUrl } = require('../constants');
const downloadFile = require('./downloadFile');

const downloadMetadata = (matchId, deviceAuth, callback) => {
  downloadFile(metaDataUrl + matchId + '.json', deviceAuth, (data, err) => {
    if (!data) {
      callback(false, err);

      return;
    }

    const newData = JSON.parse(data);

    callback(newData);
  });
};

module.exports = downloadMetadata;
