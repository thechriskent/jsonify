const fs = require('fs');
const path = require('path');
let tokens = require(path.resolve(__dirname, './tokens.json'));

// Set the source and output directories
const srcDir = __dirname;
const outDir = path.resolve(__dirname, '../../themes');

// Function to replace tokens in a file
function replaceTokensInFile(file) {
  let theme = fs.readFileSync(path.join(srcDir, file), 'utf-8');

  for (const token in tokens) {
    theme = theme.replace(new RegExp(`\\$\\{${token}\\}`, 'g'), tokens[token]);
  }

  // Remove the 'template.' prefix from the file name
  const outputFileName = file.replace('template.', '');

  fs.writeFileSync(path.join(outDir, outputFileName), theme);
}

// Read all files in the source directory
const files = fs.readdirSync(srcDir);

// Filter files based on the naming format
const templateFiles = files.filter(file => file.startsWith('template.') && file.endsWith('-color-theme.json'));

// Replace tokens in all template files
for (const file of templateFiles) {
  replaceTokensInFile(file);
}

console.info(`\x1b[36mWatching for changes to theme files in ${srcDir}...\x1b[0m`);

// Watch for changes in the source directory
fs.watch(srcDir, (eventType, filename) => {
  if (eventType === 'change' && filename.startsWith('template.') && filename.endsWith('-color-theme.json')) {
    console.info(`\x1b[36m${filename} has changed. Updating theme...\x1b[0m`);
    replaceTokensInFile(filename);
  }
});

// Watch for changes to tokens.json
fs.watch(path.resolve(__dirname, './tokens.json'), (eventType, filename) => {
  if (eventType === 'change') {
    console.info(`\x1b[36m${filename} has changed. Updating themes...\x1b[0m`);

    // Reload tokens
    delete require.cache[require.resolve('./tokens.json')];
    tokens = require('./tokens.json');

    // Replace tokens in all template files
    for (const file of templateFiles) {
      replaceTokensInFile(file);
    }
  }
});