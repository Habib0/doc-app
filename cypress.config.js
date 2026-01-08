require('dotenv').config();
const { defineConfig } = require("cypress");
const { exec } = require('child_process');

module.exports = defineConfig({
    e2e: {
    env: {
      
    },
    specPattern: [
      'cypress/e2e/linkCheck.cy.js',
    ],
    defaultCommandTimeout: 60000, 
    setupNodeEvents(on, config) {
      // Task to send email report based on test result
      on('task', {
        sendEmailReport(testData) {
          return new Promise((resolve, reject) => {
            const { status, linkError } = testData;
            const linkErrorArg = linkError ? JSON.stringify(linkError).replace(/"/g, '\\"') : '';
            exec(`node sendReport.js ${status} "${linkErrorArg}"`, (error, stdout, stderr) => {
              if (error) {
                console.error(`Error sending report: ${error}`);
                reject(error);
              } else {
                console.log(stdout);
                resolve(stdout);
              }
            });
          });
        }
      });
    },
    watchForFileChanges: false,
  },
});
