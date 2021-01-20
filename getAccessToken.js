const request = require('request');
const auths = require('./deviceAuths.json');

const headers = {
  Authorization: 'basic MzQ0NmNkNzI2OTRjNGE0NDg1ZDgxYjc3YWRiYjIxNDE6OTIwOWQ0YTVlMjVhNDU3ZmI5YjA3NDg5ZDMxM2I0MWE=',
};

const body = {
  ...auths,
  grant_type: 'device_auth',
  token_type: 'eg1',
};

// TODO: cache key
const getAccessToken = (callback) => request('https://account-public-service-prod.ol.epicgames.com/account/api/oauth/token', {
  method: 'post',
  headers,
  form: body,
}, (_, __, body) => {
  const { access_token: accessToken } = JSON.parse(body);

  callback(`bearer ${ accessToken }`);
});

module.exports = getAccessToken;