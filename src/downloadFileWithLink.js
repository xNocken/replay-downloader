const request = require("request");

const downloadFileWithLink = (link, encoding, callback) => {
  request(link, {
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
};

module.exports = downloadFileWithLink;
