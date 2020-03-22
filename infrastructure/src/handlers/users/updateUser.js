const mongo = require('../../utils/mongo.js');
const api = require('../../utils/api.js');
const auth = require('../../utils/authenticate');

module.exports = (app) => {
    app.options('/v1/users/:userId', auth.cors, () => {});

    app.patch('/v1/users/:userId', auth.required, auth.cors, async (req, res) => {
        console.log("updateUser handler starts");
        const { userId } = req.params;
        if (req.identity.userId !== userId) {
            console.log(`JWT token = ${req.identity.userId} but URL userId = ${userId}!`);
            return api.sendErrorForbidden(res, api.createError("JWT mismatch", "sign-in.auth-error"));
        }

        try {
            const dbClient = await mongo.connectToDatabase();
            console.log("Mongo connected");

            const query = prepareUpdateProfileQuery(req);
            await dbClient.db().collection("users").updateOne({_id: userId}, query);
            return api.sendRresponse(res, api.createResponse());
        } catch (err) {
            console.log("Request failed", err);
            return api.sendInternalError(res, api.createError('failed update the user', "sign-up.something-went-wrong"));
        }
    })
};

const prepareUpdateProfileQuery = (req) => {
    const { drivingSince, vehicles, sex, born, region, education, publicProfile } = req.body;
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