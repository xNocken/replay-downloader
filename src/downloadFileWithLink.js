const needle = require('needle');

const UnsuccessfulRequestException = require('./UnsuccessfulRequestException');
const getAccessToken = require('./getAccessToken');

const downloadFileWithLink = async (link) => {
  const { token } = await getAccessToken();
  const data = await needle(link, {
    headers: {
      'User-Agent': 'Tournament replay downloader',
      Authorization: token,
    },
  });

  const { body, statusCode } = data;

  if (statusCode !== 200) {
    throw new UnsuccessfulRequestException(statusCode, body);
  }

  return body;
};

module.exports = downloadFileWithLink;