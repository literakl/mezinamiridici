/* eslint-disable prefer-destructuring */
const nodemailer = require('nodemailer');
const path = require('path');
const fs = require('fs');
const Handlebars = require('handlebars');
const { logger } = require('./logging');
const { PATH_SEPARATOR } = require('./path_env');

const COMPILED_TEMPLATES = {};
const { MAILER, TEMPLATES_DIRECTORY, DEFAULT_SENDER, SENDER_NAME, AWS_REGION } = process.env;
const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASSWORD } = process.env;
// eslint-disable-next-line prefer-template
const EMAIL_TEMPLATES_DIRECTORY = TEMPLATES_DIRECTORY + PATH_SEPARATOR + 'emails';
let transporter;

async function sendEmail(config, options, context) {
  if (transporter === undefined) {
    switch (MAILER) {
      case 'SES':
        transporter = await createAWSSESTransporter();
        break;
      case 'SMTP':
        transporter = await createSMTPTransporter(false);
        break;
      case 'FAKE':
      default:
        transporter = await createSMTPTransporter(true);
    }
  }

  const filepath = path.resolve(EMAIL_TEMPLATES_DIRECTORY, config);
  const emailConfig = JSON.parse(fs.readFileSync(filepath, 'utf8'));
  const data = Object.assign({}, emailConfig, options);
  data.from = `${SENDER_NAME} <${DEFAULT_SENDER}>`;
  if (emailConfig.text_template) {
    data.text = processTemplate(config, emailConfig.text_template, context);
    delete emailConfig.text_template;
  }
  if (emailConfig.html_template) {
    data.html = processTemplate(config, emailConfig.html_template, context);
    delete emailConfig.html_template;
  }

  const info = await transporter.sendMail(data);
  logger.debug(`Message sent: ${info.messageId}`);
  const testMessageUrl = nodemailer.getTestMessageUrl(info);
  if (testMessageUrl) {
    logger.debug(`Preview URL: ${testMessageUrl}`);
  }
  return info;
}

function processTemplate(templateName, filename, context) {
  let compiled = COMPILED_TEMPLATES[`${templateName}.${filename}`];
  if (!compiled) {
    const filepath = path.resolve(EMAIL_TEMPLATES_DIRECTORY, filename);
    const template = fs.readFileSync(filepath, 'utf8');
    compiled = Handlebars.compile(template);
    COMPILED_TEMPLATES[`${templateName}.${filename}`] = compiled;
  }

  return compiled(context);
}

async function createSMTPTransporter(fake) {
  let user, pass, host, port, secure;
  if (fake) {
    host = 'smtp.ethereal.email';
    port = 587;
    const testAccount = await nodemailer.createTestAccount();
    user = testAccount.user; // generated ethereal user
    pass = testAccount.pass; // generated ethereal password
    secure = false;
  } else {
    host = SMTP_HOST;
    port = SMTP_PORT;
    secure = true;
    user = SMTP_USER;
    pass = SMTP_PASSWORD;
  }

  // create reusable transporter object using the default SMTP transport
  return nodemailer.createTransport({ host, port, secure, auth: { user, pass } }, { from: `${SENDER_NAME} <${DEFAULT_SENDER}>` });
}

async function createAWSSESTransporter() {
  // eslint-disable-next-line global-require
  const AWS = require('aws-sdk');
  AWS.config.region = AWS_REGION;
  return nodemailer.createTransport({
    SES: new AWS.SES({
      apiVersion: '2010-12-01',
    }),
  },
  {
   from: `${SENDER_NAME} <${DEFAULT_SENDER}>`,
  });
}

exports.sendEmail = sendEmail;
