// Import the entire package and destructure TransactionalClient
import pkg from '@mailchimp/mailchimp_transactional';
const { TransactionalClient } = pkg;

// Import dotenv and configure it if not already done globally
import dotenv from 'dotenv';
dotenv.config();

// Create an instance of TransactionalClient using your API key
const mailchimp = new TransactionalClient(process.env.MAILCHIMP_API_KEY);

// Define the sendEmail function to send an email
export const sendEmail = async (subject, message, send_to, sent_from) => {
  const msg = {
    from_email: sent_from,
    subject: subject,
    to: [{ email: send_to }],
    html: message,
  };

  try {
    // Use mailchimp instance to send email
    const result = await mailchimp.messages.send({ message: msg });
    console.log('Email sent successfully:', result);
    return result;
  } catch (error) {
    console.error('Error sending email:', error);
    throw new Error('Failed to send email');
  }
};
