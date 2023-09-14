const needle = require('needle');
const UnsuccessfulRequestException = require('./UnsuccessfulRequestException');
const getAccessToken = require('./getAccessToken');

const downloadFileDirectly = async (link) => {
  const { token } = await getAccessToken();

  const { body, statusCode } = await needle(link, {
    headers: {
      Authorization: token,
      'User-Agent': 'fortnite-replay-downloader',
    },
  });

  if (statusCode !== 200) {
    throw new UnsuccessfulRequestException(statusCode, body);
  }

  return body;
};

module.exports = downloadFileDirectly;
