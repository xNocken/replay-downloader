const request = require("request");
const getDownloadLink = require("./getDownloadLink");

const downloadFile = (link, deviceAuth, callback, encoding = 'utf-8') => {
  getDownloadLink(link, deviceAuth, (readLink) => {
    request(readLink, {
      encoding,
      headers: {
        'User-Agent': 'Tournament replay downloader',
      }
    }, (err2, res2, body2) => {
      if (err2 || res2.statusCode !== 200) {
        callback(false, err || body2);

        return;
      }

      callback(body2);
    });
  });
};

module.exports = downloadFile;
