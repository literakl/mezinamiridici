const nodemailer = require('nodemailer');
// const AWS = require('aws-sdk');
const path = require('path');
const fs = require('fs');
const Handlebars = require('handlebars');
const logger = require('./logging');
require('./path_env');

// const ses = new AWS.SES();
// AWS.config.region = process.env.AWS_REGION;
const COMPILED_TEMPLATES = {};

async function sendEmail(config, options, context) {
  const filepath = path.resolve(process.env.TEMPLATE_DIRECTORY, config);
  const emailConfig = JSON.parse(fs.readFileSync(filepath, 'utf8'));
  const data = Object.assign({}, emailConfig, options);
  data.from = process.env.DEFAULT_SENDER;
  if (emailConfig.text_template) {
    data.text = processTemplate(config, emailConfig.text_template, context);
    delete emailConfig.text_template;
  }
  if (emailConfig.html_template) {
    data.html = processTemplate(config, emailConfig.html_template, context);
    delete emailConfig.html_template;
  }

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

  const info = await transporter.sendMail(data);
  logger.debug(`Message sent: ${info.messageId}`);
  logger.debug(`Preview URL: ${nodemailer.getTestMessageUrl(info)}`);

  return info;
}

function processTemplate(templateName, filename, context) {
  let compiled = COMPILED_TEMPLATES[`${templateName}.${filename}`];
  if (!compiled) {
    const filepath = path.resolve(process.env.TEMPLATE_DIRECTORY, filename);
    const template = fs.readFileSync(filepath, 'utf8');
    compiled = Handlebars.compile(template);
    COMPILED_TEMPLATES[`${templateName}.${filename}`] = compiled;
  }

  return compiled(context);
}

exports.sendEmail = sendEmail;
