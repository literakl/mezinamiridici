require('../utils/path_env');
const dayjs = require('dayjs');
const rateLimit = require('express-rate-limit');

const authAPILimits = rateLimit({
  windowMs: 5 * 60 * 1000,
  max: process.env.API_LIMIT_AUTH || 2,
});
const diskAPILimits = rateLimit({
  windowMs: 5 * 60 * 1000,
  max: process.env.API_LIMIT_DISK || 2,
});

function sendResponse(res, body, cacheControl = 'private') {
  return response(res, 200, body, cacheControl);
}

function sendCreated(res, body, cacheControl = 'private') {
  return response(res, 201, body, cacheControl);
}

function sendBadRequest(res, body) {
  return response(res, 400, body, 'private');
}

function sendInvalidParam(res, param, value) {
  const body = createError(`Parameter ${param} has invalid value '${value}'`, 'generic.internal-error');
  return response(res, 400, body, 'private');
}

function sendMissingParam(res, param) {
  const body = createError(`Missing parameter '${param}'`, 'generic.internal-error');
  return response(res, 400, body, 'private');
}

function sendNotAuthorized(res, body) {
  return response(res, 401, body, 'private');
}

function sendErrorForbidden(res, body) {
  return response(res, 403, body, 'private');
}

function sendNotFound(res, body) {
  return response(res, 404, body, 'private');
}

function sendConflict(res, body) {
  return response(res, 409, body, 'private');
}

function sendInternalError(res, body) {
  return response(res, 500, body, 'private');
}

function sendRedirectFound(res, body) {
  return response(res, 302, body, 'private');
}

function response(res, status, body, cacheControl) {
  res.status(status);
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', cacheControl);
  res.send(body);
  return res;
}

function createResponse(body) {
  return { success: true, data: body };
}

function createError(message, messageKey, parameter) {
  const result = {
    success: false,
  };

  if (message !== undefined) {
    const x = { message };
    if (messageKey) {
      x.messageKey = messageKey;
    }
    if (parameter) {
      x.parameter = parameter;
    }
    result.errors = [];
    result.errors.push(x);
  }
  return result;
}

function addValidationError(result, argument, message, messageKey) {
  if (result.errors === undefined) {
    // eslint-disable-next-line no-param-reassign
    result.errors = [];
  }
  const x = {
    field: argument,
    message,
    messageKey,
  };
  result.errors.push(x);
}

// todo either provide a schema or check values
function parseListParams(req, defaultSortField, defaultSortOrder, defaultPageSize, maxPageSize) {
  const {
    oba, obd, ps, lr,
  } = req.query || {};
  const result = {};
  let order;
  if (oba) {
    result.order = { [convertField(oba)]: 1 };
    order = 1;
  } else if (obd) {
    result.order = { [convertField(obd)]: -1 };
    order = -1;
  } else {
    result.order = { [convertField(defaultSortField)]: defaultSortOrder };
    order = defaultSortOrder;
  }

  if (!ps) {
    result.pageSize = defaultPageSize;
  } else if (ps > maxPageSize) {
    result.pageSize = maxPageSize;
  } else {
    result.pageSize = Number(ps);
  }

  if (lr) {
    const parts = lr.split(':');
    result.lastResult = {};
    result.lastResult.key = [convertField(parts[0])];
    if (order === 1) {
      result.lastResult.value = { $gt: parts[1] };
    } else {
      result.lastResult.value = { $lt: parts[1] };
    }
  }
  return result;
}

function parseStreamParams(req, defaultPageSize, maxPageSize) {
  const { start, ps } = req.query;
  const result = {};

  if (!start) {
    result.start = 0;
  } else {
    result.start = Number(start);
  }

  if (!ps) {
    result.pageSize = defaultPageSize;
  } else if (ps > maxPageSize) {
    result.pageSize = maxPageSize;
  } else {
    result.pageSize = Number(ps);
  }

  return result;
}

function parsePollFilterParams(req) {
  const result = {};
  // eslint-disable-next-line no-restricted-syntax
  for (const key in req.query) {
    // eslint-disable-next-line no-prototype-builtins
    if (req.query.hasOwnProperty(key)) {
      const field = convertField(key);
      const value = req.query[key]; // todo injection check
      if (Array.isArray(value)) {
        result[field] = { $in: value };
      } else {
        result[field] = value;
      }
    }
  }
  return result;
}

const fieldMapping = new Map([
  ['id', '_id'],
  ['type', 'type'],
  ['date', 'info.date'],
  ['sex', 'sex'],
  ['age', 'age'],
  ['region', 'region'],
  ['edu', 'edu'],
  ['driving', 'driving'],
  ['vehicles', 'vehicles'],
]);

function convertField(key) {
  const field = fieldMapping.get(key);
  if (field) {
    return field;
  }
  throw new Error(`Unsupported field ${key}`);
}

function parseDate(date, format) {
  if (date) {
    const dday = dayjs(date, format);
    if (!dday.isValid()) {
      return undefined;
    }
    return dday.toDate();
  }
  return new Date();
}

function sanitizeConfigure() {
  return {
    allowedTags: ['h3', 'h4', 'h5', 'h6', 'blockquote', 'p', 'a', 'ul', 'ol',
      'nl', 'li', 'b', 'i', 'strong', 'em', 'strike', 'abbr', 'code', 'hr', 'br', 'div',
      'table', 'thead', 'caption', 'tbody', 'tr', 'th', 'td', 'pre', 'iframe',
      'h1', 'h2', 'img'],
    allowedAttributes: {
      a: ['href', 'name', 'target'],
      img: ['src'],
    },
  };
}

module.exports.sendResponse = sendResponse;
module.exports.sendErrorForbidden = sendErrorForbidden;
module.exports.sendInternalError = sendInternalError;
module.exports.sendBadRequest = sendBadRequest;
module.exports.sendInvalidParam = sendInvalidParam;
module.exports.sendMissingParam = sendMissingParam;
module.exports.sendNotFound = sendNotFound;
module.exports.sendCreated = sendCreated;
module.exports.sendNotAuthorized = sendNotAuthorized;
module.exports.sendConflict = sendConflict;
module.exports.addValidationError = addValidationError;
module.exports.createError = createError;
module.exports.createResponse = createResponse;
module.exports.parseListParams = parseListParams;
module.exports.parseStreamParams = parseStreamParams;
module.exports.parsePollFilterParams = parsePollFilterParams;
module.exports.sendRedirectFound = sendRedirectFound;
module.exports.parseDate = parseDate;
module.exports.sanitizeConfigure = sanitizeConfigure;
module.exports.authAPILimits = authAPILimits;
module.exports.diskAPILimits = diskAPILimits;
