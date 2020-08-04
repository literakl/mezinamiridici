const AWS = require('aws-sdk');
const path = require('path');
const fs = require('fs');
const Handlebars = require('handlebars');
const dotenv = require('dotenv');
const logger = require('./logging');

const ses = new AWS.SES();
const COMPILED_TEMPLATES = {};

const envPath = path.join(__dirname, '../..', '.env');
dotenv.config({ path: envPath });
AWS.config.region = process.env.AWS_REGION;

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
