const nodemailer = require('nodemailer');
const AWS = require('aws-sdk');
const path = require('path');
const fs = require('fs');
const Handlebars = require('handlebars');
const logger = require('./logging');
require('./path_env');

const ses = new AWS.SES();
const COMPILED_TEMPLATES = {};

AWS.config.region = process.env.AWS_REGION;

async function sendEmail() {
  const testAccount = await nodemailer.createTestAccount();

  // create reusable transporter object using the default SMTP transport
  const transporter = nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: testAccount.user, // generated ethereal user
      pass: testAccount.pass, // generated ethereal password
    },
  });

  const info = await transporter.sendMail({
    from: '"Fred Foo 👻" <foo@example.com>', // sender address
    to: 'bar@example.com, baz@example.com', // list of receivers
    subject: 'Hello ✔', // Subject line
    text: 'Hello world?', // plain text body
    html: '<b>Hello world?</b>', // html body
  });

  console.log('Message sent: %s', info.messageId);
  console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
}

function compileTemplate(templateName, type) {
  const filename = `${templateName}.${type}`;
  const cached = COMPILED_TEMPLATES[`${templateName}.${type}`];
  if (!cached) {
    const filepath = path.resolve(process.env.TEMPLATE_DIRECTORY, filename);
    const template = fs.readFileSync(filepath, 'utf8');
    COMPILED_TEMPLATES[`${templateName}.${type}`] = Handlebars.compile(template);
  }

  return COMPILED_TEMPLATES[`${templateName}.${type}`];
}

function isTruthy(x) {
  return Boolean(x);
}

function destinationParams(options) {
  let toAddresses = options.toAddresses || [];
  let ccAddresses = options.ccAddresses || [];
  let bccAddresses = options.bccAddresses || [];

  toAddresses = toAddresses.filter(isTruthy);
  ccAddresses = ccAddresses.filter(isTruthy);
  bccAddresses = bccAddresses.filter(isTruthy);

  return {
    ToAddresses: toAddresses,
    CcAddresses: ccAddresses,
    BccAddresses: bccAddresses,
  };
}

function messageParams(options) {
  return {
    Body: {
      Html: {
        Data: compileTemplate(options.templateName, 'html')(options.context),
        Charset: 'utf8',
      },
      Text: {
        Data: compileTemplate(options.templateName, 'txt')(options.context),
        Charset: 'utf8',
      },
    },
    Subject: {
      Data: options.subject,
      Charset: 'utf8',
    },
  };
}

async function sendMany(options, callback) {
  const params = {
    Destination: destinationParams(options),
    Message: messageParams(options),
    Source: options.senderEmailAddress || process.env.SENDER_EMAIL_ADDRESS,
    ReplyToAddresses: [
      options.replyToAddress || process.env.SENDER_EMAIL_ADDRESS,
    ],
  };

  try {
    await ses.sendEmail(params, callback).promise();
    logger.debug('mail sent');
    return true;
  } catch (error) {
    logger.debug('send mail failure');
    return false;
  }
}

async function sendEmailService(templateName, params, callback) {
  const options = {
    templateName,
    context: params,
    subject: params.subject,
    toAddresses: Array.isArray(params.email) ? params.email : [params.email],
    senderEmailAddress: params.senderEmailAddress,
    replyToAddress: params.replyToAddress,
    ccAddresses: null,
    bccAddresses: null,
  };

  logger.debug('send mail handler starts');

  try {
    const info = await sendMany(options, callback);
    logger.debug('send mail ==>', info);
    return info;
  } catch (error) {
    logger.debug('send mail failure');
    return error.message;
  }
}


exports.sendEmailService = sendEmailService;
exports.sendMany = sendMany;
exports.sendEmail = sendEmail;
