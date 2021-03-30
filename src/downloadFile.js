const downloadFileWithLink = require("./downloadFileWithLink");
const getDownloadLink = require("./getDownloadLink");

const downloadFile = (link, deviceAuth, callback, encoding = 'utf-8') => {
  getDownloadLink(link, deviceAuth, (readLink) => {
    downloadFileWithLink(Object.values(readLink)[0].readLink, encoding, callback);
  });
};

module.exports = downloadFile;
