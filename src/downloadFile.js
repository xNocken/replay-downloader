const downloadFileWithLink = require('./downloadFileWithLink');
const getDownloadLink = require('./getDownloadLink');

const downloadFile = async (link, deviceAuth, token) => {
  const readLink = await getDownloadLink(link, deviceAuth, token);

  return downloadFileWithLink(Object.values(readLink)[0].readLink);
};

module.exports = downloadFile;
