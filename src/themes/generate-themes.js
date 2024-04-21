const fs = require('fs');
const path = require('path');
const tokens = require(path.resolve(__dirname, './tokens.json'));

// Set the source and output directories
const srcDir = __dirname;
const outDir = path.resolve(__dirname, '../../themes');

// Read all files in the source directory
const files = fs.readdirSync(srcDir);

// Filter files based on the naming format
const templateFiles = files.filter(file => file.startsWith('template.') && file.endsWith('-color-theme.json'));

for (const file of templateFiles) {
  let theme = fs.readFileSync(path.join(srcDir, file), 'utf-8');

  for (const token in tokens) {
    theme = theme.replace(new RegExp(`\\$\\{${token}\\}`, 'g'), tokens[token]);
  }

  // Remove the 'template.' prefix from the file name
  const outputFileName = file.replace('template.', '');

  fs.writeFileSync(path.join(outDir, outputFileName), theme);
}