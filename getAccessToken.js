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

const getAccessToken = (callback) => {
  if (fs.existsSync('cache.json')) {
    const cache = JSON.parse(fs.readFileSync('cache.json'));

    if (new Date(cache.expires_at).getTime() > Date.now()) {
      callback(`${ cache.token_type } ${ cache.access_token }`, cache);
      return;
    }
  }

  request('https://account-public-service-prod.ol.epicgames.com/account/api/oauth/token', {
    method: 'post',
    headers,
    form: body,
  }, (_, __, body) => {
    const tokenData = JSON.parse(body);

    if (body.error) {
      throw Error(body.error);
    }

    fs.writeFileSync('cache.json', JSON.stringify(tokenData))

    callback(`${ tokenData.token_type } ${ tokenData.access_token }`, tokenData);
  })
};

module.exports = getAccessToken;