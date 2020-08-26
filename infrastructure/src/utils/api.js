function sendResponse(res, body, cacheControl = 'private') {
  return response(res, 200, body, cacheControl);
}

function sendCreated(res, body, cacheControl = 'private') {
  return response(res, 201, body, cacheControl);
}

function sendBadRequest(res, body) {
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

function edjsHtmlCustomParser() {
  return {
    table: (obj) => {
      let rows = '', rendered = '';
      // eslint-disable-next-line array-callback-return
      obj.data.content.map((row) => {
        let cells = '';
        // eslint-disable-next-line array-callback-return
        row.map((cell) => {
          cells += `<td class="tc-table__cell"><div class="tc-table__area">${
            cell}</div></td>\n`;
        });
        rows += `<tr>${cells}</tr>\n`;
      });
      rendered += `${'<div class="ce-block"><div class="ce-block__content"><div class="tc-editor cdx-block">'
      + '<div class="tc-table__wrap">\n<table class="tc-table"><tbody>'}${
        rows}</tbody></table>\n</div></div></div></div>\n`;
      return rendered;
    },
    delimiter: () => '<div class="ce-block"><div class="ce-block__content"><div class="ce-delimiter cdx-block"></div></div></div>\n',
    quote: obj => `<blockquote style="text-align:${obj.data.alignment};"><p>${obj.data.caption}</p> ${obj.data.text} </blockquote>`,
  };
}

module.exports.sendResponse = sendResponse;
module.exports.sendErrorForbidden = sendErrorForbidden;
module.exports.sendInternalError = sendInternalError;
module.exports.sendBadRequest = sendBadRequest;
module.exports.sendNotFound = sendNotFound;
module.exports.sendCreated = sendCreated;
module.exports.sendNotAuthorized = sendNotAuthorized;
module.exports.sendConflict = sendConflict;
module.exports.addValidationError = addValidationError;
module.exports.createError = createError;
module.exports.createResponse = createResponse;
module.exports.parseListParams = parseListParams;
module.exports.parsePollFilterParams = parsePollFilterParams;
module.exports.sendRedirectFound = sendRedirectFound;
module.exports.edjsHtmlCustomParser = edjsHtmlCustomParser;
