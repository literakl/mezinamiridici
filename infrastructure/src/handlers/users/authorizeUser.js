const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const mongo = require('../../utils/mongo.js');
const http = require('../../utils/http.js');

// TODO this needs to be externalized
const SECRET = 'betweenusdrivers2019';

function findUser(dbClient, email) {
    console.log("findUser");
    return dbClient.db()
        .collection("users")
        .findOne({ email: email })
        .then(doc => {
            if(!doc)
                throw new Error('No record found for ' + email);
            console.log(doc);
            return doc;
        });
}

exports.handler = (payload, context, callback) => {
    const { email, password } = JSON.parse(payload.body);
    console.log("handler starts");

    // This freezes node event loop when callback is invoked
    context.callbackWaitsForEmptyEventLoop = false;

    mongo.connectToDatabase()
        .then(db => {
            console.log("Mongo connected");
            return findUser(db, email);
        })
        .then(user => {
            console.log("User was found");

            // if(!user.verified){
            //     return responses.FORBIDDEN_403(callback, responses.sendRresponse);
            // }

            // following part takes more than 1 second with 128 MB RAM!
            if (bcrypt.compareSync(password, user.password)) {
                console.log("Password verified"); //
                const token = jwt.sign({
                    "userId": user.email,
                    "nickname": user.nickname
                }, SECRET);
                console.log("All good");
                return http.sendRresponse(callback, {token});
            } else {
                console.log("Password mismatch for user " + user._id);
                return http.sendErrorForbidden(callback,"Forbbiden");
            }
        })
        .catch(err => {
            console.log("Request failed", err);
            return http.sendInternalError(callback, err.Item);
        });
};