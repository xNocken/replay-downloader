const needle = require("needle");

const downloadFileWithLink = async (link) => {
  const data = await needle(link, {
    headers: {
      'User-Agent': 'Tournament replay downloader',
    }
  });

  const { body, statusCode } = data;

  if (statusCode !== 200) {
    throw Error(`statuscode is not 200. Instead got ${statusCode}`);
  }

  return body;
};

module.exports = downloadFileWithLink;
