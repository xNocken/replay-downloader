const needle = require('needle');

const getAccessToken = require('./getAccessToken');
const UnsuccessfulRequestException = require('./UnsuccessfulRequestException');

const getDownloadLink = async (link, bd) => {
  const { token } = await getAccessToken();

  const { body, statusCode } = await needle("post", link, bd,{
    headers: {
      Authorization: token,
      'User-Agent': 'fortnite-replay-downloader',
      'Content-type' : "application/json"
    },
  });

  if (statusCode !== 200) {
    throw new UnsuccessfulRequestException(statusCode, body);
  }

  return body.files;
};

module.exports = getDownloadLink;
