const api = require('../utils/api.js');

exports.handler = async (payload, context, callback) => {
    console.log("handler starts");
    const responde = {
        api: '1.0',
        status: 'OK'
    };
    return api.sendRresponse(callback, api.createResponse(responde));
};
