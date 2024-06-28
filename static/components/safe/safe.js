export function mustBeNonEmptyString(text) {
  if (typeof(text) != 'string') throw new Error('text must be a string');
  if (text == '') throw new Error('text must be not empty');
}

export function emptyToNull(text) {
  if (text == '') return null;
  return text;
}

export function mustBeFunction(func) {
  if (typeof(func) != 'function') throw new Error('must be function');
}

export function isEmpty(text) {
  return (text == '') || (text == null) || (text.length == 0)
}

export default {
  isEmpty,
  emptyToNull,
  mustBeNonEmptyString,
  mustBeFunction
}
