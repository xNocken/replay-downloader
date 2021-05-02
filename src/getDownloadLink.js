const needle = require("needle");
const getAccessToken = require("./getAccessToken");

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
    throw Error(`statuscode is not 200. Instead got ${statusCode}`);
  }

  return body.files;
};

module.exports = getDownloadLink;
