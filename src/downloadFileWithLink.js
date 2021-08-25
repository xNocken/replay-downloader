const needle = require("needle");
const UnsuccessfulRequestException = require('./UnsuccessfulRequestException');

const downloadFileWithLink = async (link) => {
  const data = await needle(link, {
    headers: {
      'User-Agent': 'Tournament replay downloader',
    }
  });

  const { body, statusCode } = data;

  if (statusCode !== 200) {
    throw new UnsuccessfulRequestException(statusCode, body);
  }

  return body;
};

module.exports = downloadFileWithLink;
