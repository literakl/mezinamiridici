const AWS = require('aws-sdk');
const ses = new AWS.SES();
const mongo = require('../../utils/mongo.js');
const api = require('../../utils/api.js');
const auth = require('../../utils/authenticate');

module.exports = (app) => {
    app.options('/v1/forgotPassword', auth.cors, () => {});

    app.post('/v1/forgotPassword', auth.cors, async (req, res) => {
        console.log("forgotPassword handler starts");
        const { email } = req.body;

        try {
            const dbClient = await mongo.connectToDatabase();
            console.log("Mongo connected");

            const user = await mongo.findUser(dbClient, {email: email}, {projection: { auth: 1 }});
            console.log("User checks");
            if (!user) {
                console.log("User not found " + email);
                return api.sendErrorForbidden(res, api.createError("User not found", "sign-in.auth-error"));
            }

            const resetToken = mongo.generateId(16);
            const expiration = new Date(Date.now() + 6*60*60*1000); // six hours
            const query = prepareSetTokenQuery(resetToken, expiration);
            dbClient.db().collection("users").updateOne({_id: user._id}, query);
            console.log("Token updated in User");

            sendVerificationEmail(email, resetToken);
            console.log("Email sent");
            return api.sendRresponse(res, api.createResponse({}));
        } catch (err) {
            console.log("Request failed", err);
            return api.sendInternalError(res, api.createError('Failed to reset the password', "sign-in.something-went-wrong"));
        }
    })
};

const prepareSetTokenQuery = (token, date) => {
    let query = { $set: { } };
    query.$set['auth.reset.token'] = token;
    query.$set['auth.reset.expires'] = date;
    return query;
};

const sendVerificationEmail = (email, token, fn) => {
    const resetLink = "https://www.mezinamiridici.cz/reset-password/" + token;
    const subject = 'Obnova hesla';
    return ses.sendEmail({
        Source: "robot@mezinamiridici.cz",
        Destination: {ToAddresses: [email]},
        Message: {
            Subject: {Data: subject},
            Body: {
                Html: {
                    Data: '<html><head>'
                        + '<meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />'
                        + `<title>${subject}</title>`
                        + '</head>'
                        + '<p>Pokud chcete změnit heslo, otevřete odkaz níže. Má platnost 6 hodin. '
                        + 'Pokud jste o změnu hesla nežádali, někdo si hraje, ale má smůlu. S klidem email ignorujte.</p>'
                        + `<p><a href="${resetLink}">Zadat nové heslo</a>.</p>`
                        + '<p>Pokud odkaz nejde otevřít, zkopírujte následující text a vložte jej do prohlížeče: ' + resetLink + '</p>'
                        + '</body></html>'
                }
            }
        }
    }, fn);
};
