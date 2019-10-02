const jwt = require('jsonwebtoken');

const SECRET = 'betweenusdrivers2019';

const generatePolicy = function(principalId, effect, resource) {
    const authResponse = {};
    authResponse.principalId = principalId;
    if (effect && resource) {
        const policyDocument = {
            "Version": "2012-10-17",
            "Statement": [{
                "Action": "execute-api:Invoke",
                "Effect": effect,
                "Resource": resource
            }]
        };

        authResponse.policyDocument = policyDocument;
    }

    return authResponse;
}

exports.handler =  function(event, context, callback) {
    try {
        const token = event.authorizationToken.split(" ")[1];
        const decoded = jwt.verify(token, SECRET);
        callback(null, generatePolicy(decoded.userId, 'Allow', event.methodArn));
    } catch(err) {
        callback("Unauthorized");
    }
};
