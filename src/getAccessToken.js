const request = require('request');
const fs = require('fs');

const headers = {
  Authorization: 'basic MzQ0NmNkNzI2OTRjNGE0NDg1ZDgxYjc3YWRiYjIxNDE6OTIwOWQ0YTVlMjVhNDU3ZmI5YjA3NDg5ZDMxM2I0MWE=',
};

const body = {
  grant_type: 'device_auth',
  token_type: 'eg1',
};

const getAccessToken = (auths, callback) => {
  let cache = {};

  if (fs.existsSync(module.path + '/../cache.json')) {
    cache = JSON.parse(fs.readFileSync(module.path + '/../cache.json'));

    const cachedData = cache[auths.account_id];

    if (cachedData && new Date(cachedData.expires_at).getTime() > Date.now()) {
      callback(`${ cachedData.token_type } ${ cachedData.access_token }`, cache);
      return;
    }
  }

  request('https://account-public-service-prod.ol.epicgames.com/account/api/oauth/token', {
    method: 'post',
    headers,
    form: {
      ...body,
      ...auths,
    },
  }, (err, res, body) => {
    if (err || res.statusCode !== 200) {
      throw Error(err || body);
    }

    const tokenData = JSON.parse(body);

    if (body.error) {
      throw Error(body.error);
    }

    cache[tokenData.account_id] = tokenData;

    fs.writeFileSync(module.path + '/../cache.json', JSON.stringify(cache))

    callback(`${ tokenData.token_type } ${ tokenData.access_token }`, tokenData);
  })
};

module.exports = getAccessToken;
