const mongo = require('../../utils/mongo.js');
const api = require('../../utils/api.js');

exports.handler = async (payload, context, callback) => {
    console.log("handler starts");
    const { token } = payload.pathParameters;

    // This freezes node event loop when callback is invoked
    context.callbackWaitsForEmptyEventLoop = false;

    // todo user not found case

    try {
        const dbClient = await mongo.connectToDatabase();
        console.log("Mongo connected");
        const user = await findUser(dbClient, token);
        if (!user) {
            return api.sendErrorForbidden(callback, api.createError('user has already been verified', "sign-up.already-verified"));
        }
        await verifyUser(dbClient, user);
        return api.sendRresponse(callback, api.createResponse("OK"));
    } catch (err) {
        console.log("error", err);
        if (err.success === false) {
            return api.sendErrorForbidden(callback, err);
        } else {
            return api.sendInternalError(callback, api.createError('failed to verify new user', "sign-up.something-went-wrong"));
        }
    }
};

function verifyUser(dbClient, user) {
    if (!!user.auth.verified) {
        throw api.createError('user has already been verified', "sign-up.already-verified");
    }

    let query = { $set: { }, $unset: { } };
    query.$set['auth.verified'] = true;
    query.$unset['auth.verifyToken'] = '';
    return dbClient.db().collection("users").updateOne({_id: user._id}, query);
}

function findUser(dbClient, token) {
    console.log("findUser");
    return dbClient.db()
        .collection("users")
        .findOne({ 'auth.verifyToken': token })
        .then(doc => {
            console.log("findUser mongo responded: " + doc);
            return doc;
        });
}
