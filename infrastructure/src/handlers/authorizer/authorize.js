const jwt = require('jsonwebtoken');

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

    console.log(authResponse);
    return authResponse;
}

exports.handler =  function(event, context, callback) {
    try {
        console.log('authorize handler');
        console.log(event.authorizationToken);
        const token = event.authorizationToken.split(" ")[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        // todo perform user check in db, compare db password
        callback(null, generatePolicy(decoded.userId, 'Allow', event.methodArn));
    } catch(err) {
        callback("Unauthorized");
    }
};
