module.exports = {
    'OK_200': (data, callback, response) => callback(null, response(200, data)),
    'FORBIDDEN_403': (callback, response) => callback(null, response(403, "Forbbiden")),
    'INTERNAL_SERVER_ERROR_500': (err, callback, response) => callback(null, response(500, err)),
    sendRresponse
};

function sendRresponse(status, body) {
    return {
        "statusCode": status,
        "headers": {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
            "Cache-Control": "private"
        },
        "body": JSON.stringify(body),
        "isBase64Encoded": false
    }
}
