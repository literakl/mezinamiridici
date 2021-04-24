const axios = require('axios').default;

axios.defaults.headers.post['Content-Type'] = 'application/json; charset=utf-8';
axios.defaults.headers.patch['Content-Type'] = 'application/json; charset=utf-8';

/*
axios.interceptors.request.use((x) => {
  const headers = {
    ...x.headers.common,
    ...x.headers[x.method],
    ...x.headers,
  };

  ['common', 'get', 'post', 'head', 'put', 'patch', 'delete'].forEach((header) => {
    delete headers[header];
  });

  const printable = `${new Date()} | Request: ${x.method.toUpperCase()} | ${x.url} | ${JSON.stringify(x.data)} | ${JSON.stringify(headers)}`;
  console.log(printable);
  return x;
});


axios.interceptors.response.use((x) => {
  const printable = `${new Date()} | Response: ${x.status} | ${JSON.stringify(x.data)}`;
  console.log(printable);
  return x;
});
*/

const { VUE_APP_API_ENDPOINT, VUE_APP_BFF_ENDPOINT } = process.env;

function getAuthHeader(context, jwt = undefined, onUploadProgress) {
  const config = (onUploadProgress) ? { headers: { }, onUploadProgress } : { headers: { } };
  if (jwt || (context && context.rootState.users.userToken)) {
    config.headers.Authorization = `bearer ${jwt || context.rootState.users.userToken}`;
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

function post(endpoint, url, body, context, jwt, progress) {
  const headers = getAuthHeader(context, jwt, progress);
  if (endpoint === 'BFF') {
    return axios.post(`${VUE_APP_BFF_ENDPOINT}${url}`, body, headers);
  } else {
    return axios.post(`${VUE_APP_API_ENDPOINT}${url}`, body, headers);
  }
}

function put(endpoint, url, body, context, jwt) {
  const headers = getAuthHeader(context, jwt);
  if (endpoint === 'BFF') {
    return axios.put(`${VUE_APP_BFF_ENDPOINT}${url}`, body, headers);
  } else {
    return axios.put(`${VUE_APP_API_ENDPOINT}${url}`, body, headers);
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

async function deleteApi(endpoint, url, body, context, jwt) {
  const headers = getAuthHeader(context, jwt);
  if (endpoint === 'BFF') {
    return axios.delete(`${VUE_APP_BFF_ENDPOINT}${url}`, headers);
  } else {
    return fetch(`${VUE_APP_API_ENDPOINT}${url}`, Object.assign({ method: 'DELETE' }, headers))
      .then(response => response.json())
      .catch(err => err.json());
  }
}

function deepCopy(obj) {
  if (typeof obj !== 'object' || obj === null) {
    return obj;
  }

  if (obj instanceof Date) {
    return new Date(obj.getTime());
  }

  if (obj instanceof Array) {
    return obj.reduce((arr, item, i) => {
      arr[i] = deepCopy(item);
      return arr;
    }, []);
  }

  if (obj instanceof Object) {
    return Object.keys(obj).reduce((newObj, key) => {
      newObj[key] = deepCopy(obj[key]);
      return newObj;
    }, {});
  }

  return obj;
}

export {
  get, post, patch, deleteApi, put, deepCopy,
};
