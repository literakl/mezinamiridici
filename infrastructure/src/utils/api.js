module.exports.sendRresponse = sendResponse;
module.exports.sendErrorForbidden=sendErrorForbidden;
module.exports.sendInternalError=sendInternalError;
module.exports.sendBadRequest=sendBadRequest;
module.exports.sendCreated=sendCreated;
module.exports.sendNotAuthorized=sendNotAuthorized;
module.exports.sendConflict=sendConflict;
module.exports.addValidationError=addValidationError;
module.exports.createError=createError;
module.exports.createResponse=createResponse;

function sendResponse(callback, body, cacheControl = "private") {
    response(callback, 200, body, cacheControl);
}

function sendCreated(callback, body, cacheControl = "private") {
    response(callback, 201, body, cacheControl);
}

function sendBadRequest(callback, body) {
    response(callback, 400, body, "private");
}

function sendNotAuthorized(callback, body) {
    response(callback, 401, body, "private");
}

function sendErrorForbidden(callback, body) {
    response(callback, 403, body, "private");
}

function sendConflict(callback, body) {
    response(callback, 409, body, "private");
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

function createResponse(body) {
    return { "success" : true, "data" : body };
}

function createError(code, message) {
    let result = {
        "success" : false,
        "error" : { "code" : code }
    };
    if (message !== undefined) {
        result.error.message = message;
    }
    return result;
}

function addValidationError(result, code, argument, message) {
    if (result.error === undefined || result.error.validation === undefined) {
        result.error = {
        };
        result.error.validation = [];
    }
    result.error.code = code;
    let x = {
        "field" : argument,
        "message": message
    };
    result.error.validation.push(x);
}
