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
    let setters = {}, unsetters = {};
    if (sex) {
        setters['bio.sex'] = sex;
    } else {
        unsetters['bio.sex'] = '';
    }
    if (born) {
        setters['bio.born'] = born;
    } else  {
        unsetters['bio.born'] = '';
    }
    if (region) {
        setters['bio.region'] = region;
    } else {
        unsetters['bio.region'] = '';
    }
    if (education) {
        setters['bio.edu'] = education;
    } else {
        unsetters['bio.edu'] = '';
    }
    if (drivingSince) {
        setters['driving.since'] = drivingSince;
    } else {
        unsetters['driving.since'] = '';
    }
    if (vehicles) {
        unsetters['driving.vehicles'] = vehicles;
    } else {
        unsetters['driving.vehicles'] = '';
    }
    if (publicProfile) {
        setters['prefs.public'] = !'public';
    }
    let query = { };
    if (Object.keys(setters).length !== 0) {
        query.$set = setters;
    }
    if (Object.keys(unsetters).length !== 0) {
        query.$unset = unsetters;
    }
    return query;
};