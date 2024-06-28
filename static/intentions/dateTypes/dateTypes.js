import { addEntities } from "/intentions/entities/entities.js";

const commonPartFilterRequest = {
    type: 'type',
    name: {
      general: 'FilterRequest',
    },
};

const commonPartDateRequest = {
    type: 'type',
    name: {
      general: 'DatePeriod',
    },
};

const dateFilters = [
  {
    value: 'from',
    words: [
      { en: 'from', ru: 'от', ko: 'from' },
    ]
  }, {
    value: 'to',
    words: [
      { en: 'to', ru: 'по', ko: 'to' },
    ]
  }, {
    value: 'last',
    words: [
      { en: 'last', ru: 'последний', ko: 'last' },
      { en: 'plus' },
      { en: 'left' },
      { en: '+' },
    ]
  }, {
    value: 'this',
    words: [
      { en: 'this', ru: 'этот', ko: 'this' },
      { en: 'current', ru: 'текущий', ko: 'current' },
    ]
  }, {
    value: 'today',
    words: [
      { en: 'today', ru: 'сегодня', ko: 'today' },
    ]
  }, {
    value: 'yesterday',
    words: [
      { en: 'yesterday', ru: 'вчера', ko: 'yesterday' },
    ]
  }, 
];

const datePeriods = [
  {
    value: 'month',
    words: [
      { en: 'month', ru: 'месяц', ko: 'month' },
      { en: 'months' },
    ]
  }, {
    value: 'week',
    words: [
      { en: 'week', ru: 'неделя', ko: 'week' },
      { en: 'weeks' },
    ]
  }, {
    value: 'day',
    words: [
      { en: 'day', ru: 'день', ko: 'day' },
      { en: 'days' },
    ]
  }, {
    value: 'hour',
    words: [
      { en: 'hour', ru: 'час', ko: 'hour' },
      { en: 'hours' },
    ]
  }, {
    value: 'minute',
    words: [
      { en: 'minute', ru: 'минута', ko: 'minute' },
      { en: 'minutes' },
    ]
  }, 
];
const fTypes = dateFilters.map( f => ({...f, ...commonPartFilterRequest}));
addEntities(fTypes);
const dpTypes = datePeriods.map( dp => ({...dp, ...commonPartDateRequest}));
addEntities(dpTypes);

const getMomentValues = () => {
  const date = new Date();
  return ({
    year: date.getFullYear(),
    month: date.getMonth(),
    date: date.getDate(),
    hours: date.getHours(),
    minutes: date.getMinutes(),
    seconds: date.getSeconds(),
    timestamp: date.valueOf(),
    day: date.getDay(),
  });
}

const fMapper = {
  last: {
    hour: (thisMoment, amount = 1) => ({
      from: thisMoment.timestamp - (+amount)* 1000 * 60 * 60,
      to: thisMoment.timestamp,
    }),
    day: (thisMoment, amount = 1) => ({
      from: new Date(thisMoment.year, thisMoment.month, thisMoment.date - amount),
      to: new Date(thisMoment.year, thisMoment.month, thisMoment.date),
    }),
    week: (thisMoment, amount = 1) => ({
      from: new Date(thisMoment.year, thisMoment.month, thisMoment.date - thisMoment.day - amount * 7),
      to: new Date(thisMoment.year, thisMoment.month, thisMoment.date - thisMoment.day),
    }),
    month: (thisMoment, amount = 1) => ({
      from: new Date(thisMoment.year, thisMoment.month - amount),
      to: new Date(thisMoment.year, thisMoment.month),
    }),
    default: () => {},
  },
  'this': {
    hour: (thisMoment) => ({
      from: new Date(thisMoment.year, thisMoment.month, thisMoment.date, thisMoment.hours),
      to: thisMoment.timestamp,
    }),
    day: (thisMoment) => ({
      from: new Date(thisMoment.year, thisMoment.month, thisMoment.date),
      to: thisMoment.timestamp,
    }),
    week: (thisMoment) => ({
      from: new Date(thisMoment.year, thisMoment.month, thisMoment.date - thisMoment.day),
      to: thisMoment.timestamp,
    }),
    month: (thisMoment) => ({
      from: new Date(thisMoment.year, thisMoment.month),
      to: thisMoment.timestamp,
    }),
    default: () => {},
  },
  today: {
    default: (thisMoment) => fMapper['this'].day(thisMoment),
  },
  yesterday: {
    default: (thisMoment) => fMapper.last.day(thisMoment),
  },
  to: {
    default: () => {},
  },
  from: {
    default: () => {},
  }
}

export function getDates({ filter, datePeriod, amount }) {
  const now = getMomentValues();
  return fMapper[filter][datePeriod ?? 'default'](now, amount ?? 1);
}

export default {
  getDates,
}