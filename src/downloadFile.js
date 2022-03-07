const downloadFileWithLink = require('./downloadFileWithLink');
const getDownloadLink = require('./getDownloadLink');

const downloadFile = async (link) => {
  const readLink = await getDownloadLink(link);

  return downloadFileWithLink(Object.values(readLink)[0].readLink);
};

module.exports = downloadFile;
