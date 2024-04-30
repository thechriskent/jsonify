const fs = require('fs');
const path = require('path');

// Set the source and output directories
const srcDir = __dirname;
const outDir = path.resolve(__dirname, '../../themes');

// Function to replace tokens in a file
function replaceTokensInFile(file, tokens, prefix) {
  let theme = fs.readFileSync(path.join(srcDir, file), 'utf-8');
  let replaced;

  do {
    replaced = false;

    for (const token in tokens) {
      const newTheme = theme.replace(new RegExp(`\\$\\{${token}\\}`, 'g'), tokens[token]);

      if (newTheme !== theme) {
        replaced = true;
      }

      theme = newTheme;
    }
  } while (replaced);

  // Remove the 'template.' prefix from the file name and add the prefix
  const outputFileName = file.replace('template.', '').replace('color-theme.json', `${prefix}color-theme.json`);

  fs.writeFileSync(path.join(outDir, outputFileName), theme);
}

// Read all files in the source directory
const files = fs.readdirSync(srcDir);

// Filter files to get token files and template files
const tokenFiles = files.filter(file => file.endsWith('.tokens.json'));
const templateFiles = files.filter(file => file.startsWith('template.') && file.endsWith('-color-theme.json'));

// For each token file, use each template file to make a theme
tokenFiles.forEach(tokenFile => {
  const tokens = JSON.parse(fs.readFileSync(path.resolve(srcDir, tokenFile), 'utf-8'));
  const prefix = tokenFile.replace('.tokens.json', '-');

  templateFiles.forEach(templateFile => {
    replaceTokensInFile(templateFile, tokens, prefix);
  });
});

console.info(`\x1b[36mWatching for changes to theme files in ${srcDir}...\x1b[0m`);

// Watch for changes in the source directory
fs.watch(srcDir, (eventType, filename) => {
  if (eventType === 'change' && filename.startsWith('template.') && filename.endsWith('-color-theme.json')) {
    console.info(`\x1b[36m${filename} has changed. Updating theme...\x1b[0m`);

    tokenFiles.forEach(tokenFile => {
      const tokens = JSON.parse(fs.readFileSync(path.resolve(srcDir, tokenFile), 'utf-8'));
      const prefix = tokenFile.replace('.tokens.json', '-');

      replaceTokensInFile(filename, tokens, prefix);
    });
  }
});

// Watch for changes to token files
tokenFiles.forEach(tokenFile => {
  fs.watch(path.resolve(__dirname, tokenFile), (eventType, filename) => {
    if (eventType === 'change') {
      console.info(`\x1b[36m${filename} has changed. Updating themes...\x1b[0m`);

      const tokens = JSON.parse(fs.readFileSync(path.resolve(srcDir, tokenFile), 'utf-8'));
      const prefix = tokenFile.replace('.tokens.json', '-');

      templateFiles.forEach(templateFile => {
        replaceTokensInFile(templateFile, tokens, prefix);
      });
    }
  });
});