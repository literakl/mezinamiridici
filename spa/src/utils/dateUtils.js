import i18n from '../i18n';

const dayjs = require('dayjs');
const utc = require('dayjs/plugin/utc');

dayjs.extend(utc);

const DATETIME_FORMAT_FULL = 'D.M.YYYY HH:mm';
const DATETIME_FORMAT_NO_YEAR = 'D.M. HH:mm';
const TIME_FORMAT = 'HH:mm';
const DATE_FORMAT_FULL = 'D.M.YYYY';
const DATE_FORMAT_NO_YEAR = 'D.M.';
const ISO_DATE_FORMAT_FULL = 'YYYY-MM-DD';

// Mongo returns UTC time, this helper converts it to local time

function show(timeUTC, format) {
  switch (format) {
    case 'dynamicDate':
      return showDate(timeUTC);
    case 'dynamicDateTime':
      return showDateTime(timeUTC);
    case 'ISO':
      return getISO(timeUTC);
    default:
      return timeUTC;
  }
}

function showDate(epochMS) {
  const instant = dayjs.utc(epochMS).local();
  const today = dayjs();
  if (sameDay(today, instant)) {
    return i18n.t('generic.today');
  }

  const yesterday = today.subtract(1, 'day');
  if (sameDay(yesterday, instant)) {
    return i18n.t('generic.yesterday');
  }

  return instant.format((today.year() === instant.year()) ? DATE_FORMAT_NO_YEAR : DATE_FORMAT_FULL);
}

function showDateTime(epochMS) {
  const instant = dayjs.utc(epochMS).local();
  const today = dayjs();
  if (sameDay(today, instant)) {
    return `${i18n.t('generic.today')} ${instant.format(TIME_FORMAT)}`;
  }

  const yesterday = today.subtract(1, 'day');
  if (sameDay(yesterday, instant)) {
    return `${i18n.t('generic.yesterday')} ${instant.format(TIME_FORMAT)}`;
  }

  return instant.format((today.year() === instant.year()) ? DATETIME_FORMAT_NO_YEAR : DATETIME_FORMAT_FULL);
}

function sameDay(a, b) {
  return a.year() === b.year() && a.month() === b.month() && a.date() === b.date();
}

function getISO(epochMS) {
  const instant = dayjs.utc(epochMS).local();
  return instant.format(ISO_DATE_FORMAT_FULL);
}

export {
  show, getISO,
};
