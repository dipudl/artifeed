function createPermalink(str) {
    const re = /[^a-z0-9]+/gi; // global and case insensitive matching of non-char/non-numeric
    const re2 = /^-*|-*$/g;     // get rid of any leading/trailing dashes
    str = str.replace(re, '-');  // perform the 1st regexp
    return str.replace(re2, '').toLowerCase(); // ..aaand the second + return lowercased result
}

module.exports = { createPermalink };