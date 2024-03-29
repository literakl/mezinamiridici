import i18n from '../i18n';

const dayjs = require('dayjs');
require('dayjs/locale/cs');
dayjs.locale('cs');
const utc = require('dayjs/plugin/utc');

dayjs.extend(utc);

const DATETIME_FORMAT_FULL = 'D.M.YYYY HH:mm';
const DATETIME_FORMAT_NO_YEAR = 'D.M. HH:mm';
const TIME_FORMAT = 'HH:mm';
const DATE_FORMAT_FULL = 'D.M.YYYY';
const DATE_FORMAT_NO_YEAR = 'D.M.';
const ISO_DATE_FORMAT_FULL = 'YYYY-MM-DD';
const HUMAN_DATE_FORMAT_FULL = 'D. MMMM YYYY';

// Mongo returns UTC time, this helper converts it to local time

function show(timeUTC, format) {
  const instant = dayjs.utc(timeUTC).local();
  switch (format) {
    case 'dynamicDate':
      return showDate(instant);
    case 'dynamicDateTime':
      return showDateTime(instant);
    case 'humanDate':
      return instant.format(HUMAN_DATE_FORMAT_FULL);
    case 'fullDate':
      return instant.format(DATE_FORMAT_FULL);
    case 'ISO':
      return instant.format(ISO_DATE_FORMAT_FULL);
    default:
      return timeUTC;
  }
}

function showDate(instant) {
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

function showDateTime(instant) {
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

function isInFuture(epochMS) {
  const instant = dayjs.utc(epochMS).local();
  return dayjs().isBefore(instant);
}

function getDateWithOffset(offsetDays) {
  return dayjs().add(offsetDays, 'day').toDate();
}

export {
  show, getISO,isInFuture, getDateWithOffset,
};
