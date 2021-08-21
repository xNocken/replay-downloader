const needle = require('needle');
const fs = require('fs');
const { authClientId, authClientSecret, tokenEndpoint, verifyEndpoint, timeUntilNextCheck } = require('../constants');

const options = {
  auth: 'basic',
  username: authClientId,
  password: authClientSecret,
};

const body = {
  grant_type: 'device_auth',
  token_type: 'eg1',
};

const lastTokenCheck = {};

const checkToken = async (token) => {
  if (lastTokenCheck[token] < Date.now() + (timeUntilNextCheck * 1000)) {
    return true;
  }

  const { statusCode, body } = await needle(verifyEndpoint, {
    method: 'post',
    headers: {
      Authorization: token,
    }
  });

  const isValid = statusCode === 200;

  if (!isValid) {
    delete lastTokenCheck[token];
  } else {
    lastTokenCheck[token] = Date.now();
  }

  return isValid;
}

const getAccessToken = async (auths) => {
  let cache = {};

  if (fs.existsSync(module.path + '/../cache.json')) {
    cache = JSON.parse(fs.readFileSync(module.path + '/../cache.json'));

    const cachedData = cache[auths.account_id];

    if (cachedData && new Date(cachedData.expires_at).getTime() > Date.now()) {
      if (await checkToken(`${cachedData.token_type} ${cachedData.access_token}`)) {
        return {
          token: `${cachedData.token_type} ${cachedData.access_token}`,
          tokenInfo: cachedData,
        };
      }
    }
  }

  const { body: tokenData, statusCode } = await needle('post', tokenEndpoint, {
    ...body,
    ...auths,
  }, options);

  if (statusCode !== 200) {
    throw Error(tokenData.errorMessage);
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
