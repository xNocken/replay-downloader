const needle = require('needle');
const fs = require('fs');
const { authClientId, authClientSecret, tokenEndpoint } = require('../constants');

const options = {
  auth: 'basic',
  username: authClientId,
  password: authClientSecret,
};

const body = {
  grant_type: 'device_auth',
  token_type: 'eg1',
};

const getAccessToken = async (auths) => {
  let cache = {};

  if (fs.existsSync(module.path + '/../cache.json')) {
    cache = JSON.parse(fs.readFileSync(module.path + '/../cache.json'));

    const cachedData = cache[auths.account_id];

    if (cachedData && new Date(cachedData.expires_at).getTime() > Date.now()) {
      return {
        token: `${cachedData.token_type} ${cachedData.access_token}`,
        tokenInfo: cachedData,
      };
    }
  }

  const { body: tokenData, statusCode } = await needle('post', tokenEndpoint, {
    ...body,
    ...auths,
  }, options);

  if (statusCode !== 200) {
    throw Error(body);
  }

  if (tokenData.error) {
    throw Error(tokenData.error);
  }

  cache[tokenData.account_id] = tokenData;

  fs.writeFileSync(module.path + '/../cache.json', JSON.stringify(cache))

  return {
    token: `${tokenData.token_type} ${tokenData.access_token}`,
    tokenInfo: tokenData,
  };
};

module.exports = getAccessToken;
