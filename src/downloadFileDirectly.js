const needle = require('needle');
const UnsuccessfulRequestException = require('./UnsuccessfulRequestException');
const getAccessToken = require('./getAccessToken');

const downloadFileDirectly = async (link) => {
  const { token } = await getAccessToken();
  const data = await needle(link, {
    headers: {
      'Content-Type': 'application/json',
      'User-Agent': 'Tournament replay downloader',
      'Authorization': token,
    },
  });

  const { statusCode, body: responseBody } = data;

  if (statusCode !== 200) {
    throw new UnsuccessfulRequestException(statusCode, responseBody);
  }

  return responseBody;
};

module.exports = downloadFileDirectly;
