const { metaDataUrl } = require('../constants');
const downloadFileDirectly = require('./downloadFileDirectly');

const downloadMetadata = async (matchId) => {
  const data = await downloadFileDirectly(`${metaDataUrl}${matchId}.json`);

  if (!data) {
    return null;
  }

  return JSON.parse(data.toString());
};

module.exports = downloadMetadata;
