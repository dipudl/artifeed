const { unlink } = require('fs');
const path = require('path');

function createPermalink(str) {
    const re = /[^a-z0-9]+/gi; // global and case insensitive matching of non-char/non-numeric
    const re2 = /^-*|-*$/g;     // get rid of any leading/trailing dashes
    str = str.replace(re, '-');  // perform the 1st regexp
    return str.replace(re2, '').toLowerCase(); // ..aaand the second + return lowercased result
}

function removeFile(filePath) {
    unlink(path.join(__dirname, `../uploads/${filePath}`), (err) => {
        if (err) console.log(err);
    });
}

module.exports = { createPermalink, removeFile };