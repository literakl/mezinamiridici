const mongo = require('../../utils/mongo.js');
const api = require('../../utils/api.js');

exports.handler = async (payload, context, callback) => {
    console.log("handler starts");
    if (payload.body === undefined || payload.body === null) {
        return api.sendBadRequest(callback, api.createError('body is null', "sign-up.something-went-wrong"));
    }
    const userId = payload.pathParameters.userId;

    console.log(context);
    //todo overit, zda funguje autorizace spravne. co se stane, kdyz chybi nebo je volana na jineho uzivatele?

    // This freezes node event loop when callback is invoked
    context.callbackWaitsForEmptyEventLoop = false;

    try {
        const dbClient = await mongo.connectToDatabase();
        console.log("Mongo connected");

        const query = prepareUpdateProfileQuery(payload);
        await dbClient.db().collection("users").updateOne({_id: userId}, query);
        return api.sendRresponse(callback, api.createResponse());
    } catch (err) {
        console.log("Request failed", err);
        return api.sendInternalError(callback, api.createError('failed update the user', "sign-up.something-went-wrong"));
    }
};

const prepareUpdateProfileQuery = (payload) => {
    const { drivingSince, vehicles, sex, born, region, education, publicProfile } = JSON.parse(payload.body);
    let query = { $set: { } };
    if (sex) {
        query.$set['bio.sex'] = sex;
    // } else {
    //     query.$unset.bio.sex = '';
    }
    if (born) {
        query.$set['bio.born'] = born;
    // } else  {
    //     query.$unset.bio.born = '';
    }
    if (region) {
        query.$set['bio.region'] = region;
    // } else {
    //     query.$unset.bio.region = '';
    }
    if (education) {
        query.$set['bio.edu'] = education;
    // } else {
    //     query.$unset.bio.edu = '';
    }
    if (drivingSince) {
        query.$set['driving.since'] = drivingSince;
    // } else {
    //     query.$unset.driving.since = '';
    }
    if (vehicles) {
        query.$set['driving.vehicles'] = vehicles;
    // } else {
    //     query.$unset.driving.vehicles = '';
    }
    if (publicProfile) {
        query.$set['prefs.public'] = !!'public';
    // } else {
    //     query.$set.prefs.public = '';
    }
    return query;
};