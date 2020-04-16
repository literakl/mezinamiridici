const got = require("got");
const api = got.extend({
    prefixUrl: "http://localhost:3000/v1/",
    throwHttpErrors: false,
    headers: {
        "content-type": "application/json; charset=utf-8'"
    },
});
const bff = got.extend({
    prefixUrl: "http://localhost:3000/bff/",
    throwHttpErrors: false,
    headers: {
        "content-type": "application/json; charset=utf-8'"
    },
});

function getAuthHeader(jwt) {
    console.log(jwt);
    const headers = { };
    if (jwt) {
        headers.Authorization = `bearer ${jwt}`;
    }
    return headers;
}

module.exports.api = api;
module.exports.bff = bff;
module.exports.getAuthHeader = getAuthHeader;
