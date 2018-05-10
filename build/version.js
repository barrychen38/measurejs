const fs = require('fs');
const pkg = require('../package');

const HEAD_INFO = `/*! ${pkg.name} v${pkg.version} | (c) ${pkg.author} */\n`;

addHeadInfo('./dist/measure.js', './dist/measure.min.js');

function addHeadInfo(...files) {
  files.forEach((file) => {
    fs.readFile(file, 'utf8', (error, data) => {
      if (error) {
        console.error(error);
        return;
      }
      writeHeadInfo(file, data);
    });
  });
}

function writeHeadInfo(file, fileData) {
  if (fileData.indexOf(HEAD_INFO) !== -1) {
    return;
  }
  var withHeadInfoFileData = HEAD_INFO + fileData;
  fs.writeFileSync(file, withHeadInfoFileData, 'utf8');
}
