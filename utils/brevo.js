const { BrevoClient } = require('@getbrevo/brevo');
const { Mother } = require('../models')

const brevo = new BrevoClient({
    apiKey: process.env.BREVO_API_KEY
});

exports.sendBrevoEmail = async (options) => {
    try {
        const result = await brevo.transactionalEmails.sendTransacEmail({
            subject: options.subject,
            htmlContent: options.html,
            sender: {
                name: 'MaternalPath',
                email: process.env.USER_EMAIL
            },
            to: [{ email: options.email }]
        })

        console.log(`Email sent successfully to ${options.email}`, result.messageId);
        
    } catch (error) {
       console.log(`Error while sending email to ${options.email}:`, error.message);
    }
}

