const needle = require("needle");
const getAccessToken = require("./getAccessToken");
const UnsuccessfulRequestException = require('./UnsuccessfulRequestException');

const getDownloadLink = async (link, deviceAuth, inToken) => {
  let token;

  if (inToken) {
    token = `bearer ${inToken}`;
  } else {
    ({ token } = await getAccessToken(deviceAuth));
  }

  const { body, statusCode } = await needle(link, {
    headers: {
      Authorization: token,
      'User-Agent': 'Tournament replay downloader',
    },
  });

  if (statusCode !== 200) {
    throw new UnsuccessfulRequestException(statusCode, body);
  }

  return body.files;
};

module.exports = getDownloadLink;
