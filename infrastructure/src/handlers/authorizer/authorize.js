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
    const token = JSON.parse(event).authorizationToken;
    console.log(event);
    console.log(token);

    try {
        const decoded = jwt.verify(token, SECRET);
        console.log("Decoded ok");
        callback(null, generatePolicy(decoded.userId, 'Allow', event.methodArn));
    } catch(err) {
        console.log("Unauth");
        console.log(err);
        callback("Unauthorized");
    }
};
