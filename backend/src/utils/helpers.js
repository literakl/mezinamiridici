/**
 * Returns the index of the last element in the array where predicate is true, and -1
 * otherwise.
 * @param array The source array to search in
 * @param predicate find calls predicate once for each element of the array, in descending
 * order, until it finds one where predicate returns true. If such an element is found,
 * findLastIndex immediately returns that element index. Otherwise, findLastIndex returns -1.
 * @author https://stackoverflow.com/a/53187807/1639556
 */
function findLastIndex(array, predicate) {
  let l = array.length;
  // eslint-disable-next-line no-plusplus
  while (l--) {
    if (predicate(array[l], l, array)) return l;
  }
  return -1;
}

function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
}

/**
 * Convert object to string - single level only.
 * @param obj
 * @returns {string}
 */
function toJSON(obj) {
  let output = '{\n';
  Object.keys(obj).forEach((e) => {
    output = output.concat(`  ${e} = ${obj[e]}\n`);
  });
  output = output.concat('}\n');
  return output;
}

exports.findLastIndex = findLastIndex;
exports.escapeRegExp = escapeRegExp;
exports.toJSON = toJSON;
