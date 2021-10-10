const { metaDataUrl } = require('../constants');
const downloadFile = require('./downloadFile');

const downloadMetadata = async (matchId, deviceAuth, token) => {
  const data = await downloadFile(`${metaDataUrl}${matchId}.json`, deviceAuth, token);

  if (!data) {
    return null;
  }

  return JSON.parse(data.toString());
};

module.exports = downloadMetadata;
