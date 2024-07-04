import { TransactionalClient } from '@mailchimp/mailchimp_transactional';


const mailchimp = new TransactionalClient(process.env.MAILCHIMP_API_KEY);

export const sendEmail = async (subject, message, send_to, sent_from) => {
  const msg = {
    from_email: sent_from,
    subject: subject,
    to: [{ email: send_to }],
    html: message,
  };

  try {
    const result = await mailchimp.messages.send({ message: msg });
    console.log('Email sent successfully:', result);
    return result;
  } catch (error) {
    console.error('Error sending email:', error);
    throw new Error('Failed to send email');
  }
};
