const request = require('request');
const auths = require('./deviceAuths.json');
const fs = require('fs');

const headers = {
  Authorization: 'basic MzQ0NmNkNzI2OTRjNGE0NDg1ZDgxYjc3YWRiYjIxNDE6OTIwOWQ0YTVlMjVhNDU3ZmI5YjA3NDg5ZDMxM2I0MWE=',
};

const body = {
  ...auths,
  grant_type: 'device_auth',
  token_type: 'eg1',
};

// TODO: cache key
const getAccessToken = (callback) => {
  if (fs.existsSync('cache.json')) {
    const cache = JSON.parse(fs.readFileSync('cache.json'));

    if (new Date(cache.expiresAt).getTime() > Date.now()) {
      callback(`bearer ${ cache.accessToken }`);
      return;
    }
  }

  request('https://account-public-service-prod.ol.epicgames.com/account/api/oauth/token', {
    method: 'post',
    headers,
    form: body,
  }, (_, __, body) => {
    const { access_token: accessToken, expires_at: expiresAt } = JSON.parse(body);

    fs.writeFileSync('cache.json', JSON.stringify({
      accessToken,
      expiresAt,
    }))

    callback(`bearer ${ accessToken }`);
  })
};

module.exports = getAccessToken;