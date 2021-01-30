const request = require("request");
const getAccessToken = require("./getAccessToken");

const downloadFile = (link, deviceAuth, callback, encoding = 'utf-8') => {
  getAccessToken(deviceAuth, (accessToken) => {
    request(link, {
      headers: {
        Authorization: accessToken,
      }
    }, (err, res, body) => {
      if (err || res.statusCode !== 200) {
        callback(false, err || body);

        return;
      }

      const { readLink } = Object.values(JSON.parse(body).files)[0];

      request(readLink, {
        encoding,
      }, (err2, res2, body2) => {
        if (err2 || res2.statusCode !== 200) {
          callback(false, err || body2);

          return;
        }

        callback(body2);
      });
    });
  });
};

module.exports = downloadFile;