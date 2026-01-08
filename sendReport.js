require('dotenv').config();
const sgMail = require('@sendgrid/mail');

// Set SendGrid API key
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// Get test status and link error from command line arguments
const testStatus = process.argv[2]; // 'pass' or 'fail'
const linkErrorArg = process.argv[3] || ''; // link error message if any
let linkError = null;
try {
  linkError = linkErrorArg ? JSON.parse(linkErrorArg) : null;
} catch (e) {
  linkError = linkErrorArg;
}
const timestamp = new Date().toLocaleString();

// Email recipients
const recipients = [
  process.env.REPORT_RECEIVER_EMAIL,
  process.env.REPORT_RECEIVER_EMAIL_2
];

// Build email content based on test status - PLAIN TEXT ONLY
let subject, textContent;

if (testStatus === 'pass') {
  subject = `Link Check Report - Patient DocApp is Working Perfectly`;
  textContent = `Link Check Report

Status: All Systems Operating Normally

Checked: ${timestamp}


Verified Fields:
- Email input field: Present
- Phone input field: Present
- Submit button: Present

All required form fields are functioning correctly and accessible to users.

---
This is an automated status report from TheDocApp Monitoring System.
Please do not reply to this message.`;
} else {
  subject = `Link Check Report - Patient DocApp Down`;
  let issueDetails = '';
  
  if (linkError) {
    issueDetails = `Issue: Link is DOWN or BROKEN

Error Details: ${linkError}

The application is currently unreachable. Please verify your internet connection and check if the server is running.`;
  } else {
    issueDetails = `Issue: Form Elements Missing or Not Visible

Fields that could not be detected:
- Email input field
- Phone input field
- Submit button

Action Required: Please review the application and verify that all form fields are functioning properly.`;
  }
  
  textContent = `Link Check Report

Status: Service Issue Detected

Checked: ${timestamp}


${issueDetails}

Please check your system logs and contact your development team if needed.

---
This is an automated status report from TheDocApp Monitoring System.
Please do not reply to this message.`;
}

// Create simple email messages for both recipients
// Append professional signature / footnote
const signature = `Xeven Solutions`;
textContent = textContent + signature;

// Create simple email messages for both recipients with neutral sender name
const messages = recipients.map(to => ({
  to,
  from: {
    email: process.env.SENDER_EMAIL,
    name: 'Xeven Solutions'
  },
  replyTo: process.env.SENDER_EMAIL,
  subject,
  text: textContent,
  headers: {
    'List-Unsubscribe': `<mailto:${process.env.SENDER_EMAIL}>`
  }
}));

// Send emails to both recipients
Promise.all(messages.map(msg => sgMail.send(msg)))
  .then(() => {
    console.log('Status reports sent successfully.');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Error sending reports:', error.message);
    process.exit(0);
  });
