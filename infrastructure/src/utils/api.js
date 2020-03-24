function sendResponse(res, body, cacheControl = "private") {
    return response(res, 200, body, cacheControl);
}

function sendCreated(res, body, cacheControl = "private") {
    return response(res, 201, body, cacheControl);
}

function sendBadRequest(res, body) {
    return response(res, 400, body, "private");
}

function sendNotAuthorized(res, body) {
    return response(res, 401, body, "private");
}

function sendErrorForbidden(res, body) {
    return response(res, 403, body, "private");
}

function sendConflict(res, body) {
    return response(res, 409, body, "private");
}

function sendInternalError(res, body) {
    return response(res, 500, body, "private");
}

function response(res, status, body, cacheControl) {
    res.status(status);
    res.setHeader("Content-Type", "application/json");
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Cache-Control", cacheControl);
    res.send(body);
    return res;
}

function createResponse(body) {
    return { "success" : true, "data" : body };
}

function createError(message, messageKey) {
    let result = {
        "success" : false
    };

    if (message !== undefined) {
        let x = {
            "message": message,
            "messageKey": messageKey,
        };
        result.errors = [];
        result.errors.push(x);
    }
    return result;
}

function addValidationError(result, argument, message, messageKey) {
    if (result.errors === undefined) {
        result.errors = [];
    }
    let x = {
        "field" : argument,
        "message": message,
        "messageKey": messageKey,
    };
    result.errors.push(x);
}

// todo either provide a schema or check values
function parseListParams(req, defaultSortField, defaultSortOrder, defaultPageSize, maxPageSize) {
    const { oba, obd, ps, of,lr } = req.query || {};
    let result = {};
    if (oba) {
        result.order = { [oba] : 1 };
    } else if (obd) {
        result.order = { [obd] : -1 };
    } else {
        result.order = { [defaultSortField] : defaultSortOrder };
    }
    if (ps) {
        result.pageSize = defaultPageSize;
    } else if (ps > maxPageSize) {
        result.pageSize = maxPageSize;
    } else {
        result.pageSize = ps;
    }
    result.offset = of;
    result.lastResult = lr;
    return result;
}

module.exports.sendRresponse = sendResponse; // todo fix typo
module.exports.sendErrorForbidden=sendErrorForbidden;
module.exports.sendInternalError=sendInternalError;
module.exports.sendBadRequest=sendBadRequest;
module.exports.sendCreated=sendCreated;
module.exports.sendNotAuthorized=sendNotAuthorized;
module.exports.sendConflict=sendConflict;
module.exports.addValidationError=addValidationError;
module.exports.createError=createError;
module.exports.createResponse=createResponse;
module.exports.parseListParams=parseListParams;