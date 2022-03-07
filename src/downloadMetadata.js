const { metaDataUrl } = require('../constants');
const downloadFile = require('./downloadFile');

const downloadMetadata = async (matchId) => {
  const data = await downloadFile(`${metaDataUrl}${matchId}.json`);

  if (!data) {
    return null;
  }

  return JSON.parse(data.toString());
};

module.exports = downloadMetadata;
