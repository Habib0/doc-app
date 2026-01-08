describe('Daily check for Link is working or not and send email to two persons', () => {
  it('check link is working or not', () => {
    let testPassed = true;
    let linkError = null;

    // First, check if link is reachable using cy.request
    cy.request({
      method: 'GET',
      url: 'https://patient.thedocapp.net/',
      failOnStatusCode: false
    }).then(
      (response) => {
        if (response.status >= 200 && response.status < 300) {
          cy.log('✓ Link is reachable with status: ' + response.status);
          // Now visit the page
          cy.visit('https://patient.thedocapp.net/', {
            failOnStatusCode: false
          });
        } else {
          testPassed = false;
          linkError = `Link returned status code: ${response.status}`;
          cy.log('✗ Link Error: ' + linkError);
        }
      },
      (err) => {
        // Capture link loading error but don't fail the test
        testPassed = false;
        linkError = err.message || 'Failed to connect to the link';
        cy.log('✗ Link Error: ' + linkError);
      }
    );

    // Only check DOM elements if link loaded successfully
    cy.then(() => {
      if (!linkError) {
        // Wait for page to fully settle
        cy.wait(3000);

        // Safe DOM checks using body.find so missing elements won't fail the test
        cy.get('body', { timeout: 10000 }).then(($body) => {
      // Email field
      const $email = $body.find('input[type="email"]');
      if ($email.length && $email.is(':visible') && $email.css('display') !== 'none') {
        cy.log('Email field: visible');
      } else if ($email.length) {
        testPassed = false;
        cy.log('Email field: present but not visible');
      } else {
        testPassed = false;
        cy.log('Email field: NOT FOUND');
      }

      // Phone field
      const $phone = $body.find('input[id="phone"]');
      if ($phone.length && $phone.is(':visible') && $phone.css('display') !== 'none') {
        cy.log('Phone field: visible');
      } else if ($phone.length) {
        testPassed = false;
        cy.log('Phone field: present but not visible');
      } else {
        testPassed = false;
        cy.log('Phone field: NOT FOUND');
      }

      // Submit/Next button - try text match and fallbacks
      let $btn = $body.find('button').filter(function () { return Cypress.$(this).text().trim().toLowerCase().startsWith('next'); });
      if (!$btn.length) $btn = $body.find('input[type="submit"], button[type="submit"]');
      if ($btn.length && $btn.is(':visible') && $btn.css('display') !== 'none') {
        cy.log('Submit button: visible');
      } else if ($btn.length) {
        testPassed = false;
        cy.log('Submit button: present but not visible');
      } else {
        testPassed = false;
        cy.log('Submit button: NOT FOUND');
      }
        });
      }
    });

    // Send email report based on test result
    cy.wrap(null).then(() => {
      const status = testPassed ? 'pass' : 'fail';
      cy.log(`Test Status: ${status.toUpperCase()}`);

      return cy.task('sendEmailReport', { status, linkError });
    }).then(
      () => {
        cy.log('✅ Email report sent successfully');
      },
      (err) => {
        cy.log('⚠️ Email could not be sent, but test has been logged');
        cy.log(String(err));
      }
    );
  });
});
