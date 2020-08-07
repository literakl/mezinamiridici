const dotenv = require('dotenv');
const path = require('path');

const envPath = path.join(__dirname, '../..', '.env');
dotenv.config({ path: envPath });
// console.log('parse env');
