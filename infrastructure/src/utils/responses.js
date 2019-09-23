module.exports = {
    'OK_200': (data, callback) => callback(null, response(200, data)),
    'FORBIDDEN_403': callback => callback(null, response(403, "Forbbiden")),
    'INTERNAL_SERVER_ERROR_500': (err, callback) => callback(null, response(500, err))
}