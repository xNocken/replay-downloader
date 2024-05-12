const needle = require('needle');

const getAccessToken = require('./getAccessToken');
const UnsuccessfulRequestException = require('./UnsuccessfulRequestException');

/**
 * @param {string} link
 * @param {string[]} files
 */
const getDownloadLink = async (link, files) => {
  const { token } = await getAccessToken();

  const { body, statusCode } = await needle(
    'post',
    link,
    { files },
    {
      json: true,
      headers: {
        Authorization: token,
        'User-Agent': 'fortnite-replay-downloader',
      },
    },
  );

  if (statusCode !== 200) {
    throw new UnsuccessfulRequestException(statusCode, body);
  }

  return body.files;
};

module.exports = getDownloadLink;
