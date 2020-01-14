module.exports = {
    sendRresponse, sendErrorForbidden, sendInternalError
};

function sendResponse(callback, body, cacheControl = "private") {
    response(callback, 200, body, cacheControl);
}

function sendErrorForbidden(callback, body) {
    response(callback, 403, body, "private");
}

function sendInternalError(callback, body) {
    response(callback, 500, body, "private");
}

function response(callback, status, body, cacheControl) {
    callback(null,  {
        "statusCode": status,
        "headers": {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
            "Cache-Control": cacheControl
        },
        "body": JSON.stringify(body),
        "isBase64Encoded": false
    });
}
