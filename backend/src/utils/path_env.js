const dotenv = require('dotenv');
const path = require('path');

const envPath = path.join(__dirname, '../..', '.env');
dotenv.config({ path: envPath });

exports.PATH_SEPARATOR = path.sep;
