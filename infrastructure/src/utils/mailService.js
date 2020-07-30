
const AWS = require('aws-sdk');
const ses = new AWS.SES();

const path = require('path');
const fs = require('fs'); 
const Handlebars = require('handlebars'); 
const dotenv = require('dotenv');
const logger = require('./logging');
const COMPILED_TEMPLATES = {}; 

const envPath = path.join(__dirname, '../..', '.env');
dotenv.config({ path: envPath });
AWS.config.region = process.env.AWS_REGION;

function compileTemplate (templateName, type) {
  var filename = templateName + '.' + type;
  var cached = COMPILED_TEMPLATES[templateName + '.' + type];
  var compiled, template, filepath;

  if (!cached) {
    filepath = path.resolve(process.env.TEMPLATE_DIRECTORY, filename);
    template = fs.readFileSync(filepath, 'utf8');
    compiled = Handlebars.compile(template);
    COMPILED_TEMPLATES[templateName + '.' + type] = compiled;
  }

  return COMPILED_TEMPLATES[templateName + '.' + type];
}

function isTruthy (x) {
  return Boolean(x);
}

function destinationParams (options) {
  var toAddresses = options.toAddresses || [];
  var ccAddresses = options.ccAddresses || [];
  var bccAddresses = options.bccAddresses || [];

  toAddresses = toAddresses.filter(isTruthy);
  ccAddresses = ccAddresses.filter(isTruthy);
  bccAddresses = bccAddresses.filter(isTruthy);

  return { 
    BccAddresses: bccAddresses,
    CcAddresses: ccAddresses,
    ToAddresses: toAddresses
  };
}

function messageParams (options) {
  var defaultCharset = 'utf8';

  return {
    Body: {
      Html: {
        Data: compileTemplate(options.templateName, 'html')(options.context),
        Charset: options.htmlCharset || defaultCharset
      },
      Text: {
        Data: compileTemplate(options.templateName, 'txt')(options.context),
        Charset: options.textCharset || defaultCharset
      }
    },
    Subject: {
      Data: options.subject,
      Charset: options.subjectCharset || defaultCharset
    }
  };
}

async function sendMany (options, callback) {
  var params;

  params = {
    Destination: destinationParams(options),
    Message: messageParams(options),
    Source: options.senderEmailAddress || process.env.SENDER_EMAIL_ADDRESS,
    ReplyToAddresses: [
      options.replyToAddress || process.env.SENDER_EMAIL_ADDRESS
    ]
  };

  // let sendPromise = ses.sendEmail(params, callback).promise();
  
	try{
		await ses.sendEmail(params, callback).promise();
		logger.debug("mail sent");
		return true;
	}catch(error){
		logger.debug("mail send failure");
		return false;
	}
}

async function sendEmailService (templateName, person, callback) {
  var options = {
    templateName: templateName,
    context: person,
    subject: person.subject,
    toAddresses: Array.isArray(person.email) ? person.email : [person.email],
    senderEmailAddress: person.senderEmailAddress,
    replyToAddress: person.replyToAddress,
    ccAddresses: null,
    bccAddresses: null
  };
  
  logger.debug('send mail handler starts');

  try{
	  let info = await sendMany(options, callback);
	  logger.debug("mail send ==>", info);
	  return info;
  }catch(error){
	  logger.debug("mail send failure");
	  return error.message;
  }
}


exports.sendEmailService = sendEmailService;
exports.sendMany = sendMany;