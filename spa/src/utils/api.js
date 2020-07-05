const axios = require('axios').default;

axios.defaults.headers.post['Content-Type'] = 'application/json; charset=utf-8';
axios.defaults.headers.patch['Content-Type'] = 'application/json; charset=utf-8';

const { VUE_APP_API_ENDPOINT, VUE_APP_BFF_ENDPOINT } = process.env;

function getAuthHeader(context, jwt = undefined) {
  const config = { headers: { } };
  if (jwt || (context && context.rootState.userToken)) {
    config.headers.Authorization = `bearer ${jwt || context.rootState.userToken}`;
  }
  return config;
}

function get(endpoint, url, context = undefined) {
  const headers = getAuthHeader(context);
  if (endpoint === 'BFF') {
    return axios.get(`${VUE_APP_BFF_ENDPOINT}${url}`, headers);
  } else {
    return axios.get(`${VUE_APP_API_ENDPOINT}${url}`, headers);
  }
}

function post(endpoint, url, body, context, jwt) {
  const headers = getAuthHeader(context, jwt);
  if (endpoint === 'BFF') {
    return axios.post(`${VUE_APP_BFF_ENDPOINT}${url}`, body, headers);
  } else {
    return axios.post(`${VUE_APP_API_ENDPOINT}${url}`, body, headers);
  }
}

function patch(endpoint, url, body, context, jwt) {
  const headers = getAuthHeader(context, jwt);
  if (endpoint === 'BFF') {
    return axios.patch(`${VUE_APP_BFF_ENDPOINT}${url}`, body, headers);
  } else {
    return axios.patch(`${VUE_APP_API_ENDPOINT}${url}`, body, headers);
  }
}

export {
  get, post, patch,
};
