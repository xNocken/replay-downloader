const request = require("request");
const getDownloadLink = require("./getDownloadLink");

const downloadFile = (link, deviceAuth, callback, encoding = 'utf-8') => {
  getDownloadLink(link, deviceAuth, (readLink) => {
    request(readLink, {
      encoding,
      headers: {
        'User-Agent': 'Tournament replay downloader',
      }
    }, (err, res, body) => {
      if (err || res.statusCode !== 200) {
        callback(false, err || body);

        return;
      }

      callback(body);
    });
  });
};

module.exports = downloadFile;
