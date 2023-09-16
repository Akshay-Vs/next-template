#!/usr/bin/env node

const { program } = require('commander');
const fs = require('fs');
const path = require('path');

const loadTemplate = (file, component, callback) => {
  const filePath = `./templates/${file}`;
  const encoding = 'utf8';

  fs.readFile(filePath, encoding, (err, data) => {
    if (err) {
      console.error(`Error reading templates: ${err.message}`);
      callback(err, null);
      return;
    }

    // Perform the replacements
    const modifiedData = data.replace(/{name}/g, `${component}`);
    console.log(`Loading ${file}...`);

    callback(null, modifiedData); // Pass the modified data to the callback
  });
};

const getDirLen = (path) => {
  return new Promise((resolve, reject) => {
    fs.readdir(path, (err, files) => {
      if (err) {
        console.error(`Error reading directory: ${err.message}`);
        reject(err);
        return;
      }
      resolve(files.length);
    });
  });
};

program
  .arguments('<name>')
  .description('Create a component with the specified name')
  .action(async (name) => {
    // Create a folder with the component name
    const projectRoot = path.join(__dirname, '../..');
    const componentDir = path.join(projectRoot, 'components', name);
    fs.mkdirSync(componentDir);

    console.log(`Component '${name}' created in '${componentDir}'.`);

    const templates = {
      'BaseTemplate.component.template': `${name}.tsx`,
      'BaseTemplate.styles.template': `${name}.styles.scss`,
      'BaseTemplate.mock.template': `${name}.mock.tsx`,
      'BaseTemplate.stories.template': `${name}.stories.tsx`,
      'BaseTemplate.index.template': `index.ts`,
    };

    const dirLen = await getDirLen('./templates');
    for (let i = 0; i < dirLen; i++) {
      const templateFile = Object.keys(templates)[i];
      const newFileName = templates[templateFile];

      loadTemplate(templateFile, name, (err, data) => {
        if (err) {
          console.error(`Error loading template: ${err.message}`);
          return;
        }

        fs.writeFile(`${componentDir}/${newFileName}`, data, (err) => {
          if (err) {
            console.error(`Error writing file: ${err.message}`);
            return;
          }
          console.log(`File ${newFileName} written successfully.`);
        });
      });
    }
  });

program.parse(process.argv);
