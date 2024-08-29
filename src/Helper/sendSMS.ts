import dotenv from 'dotenv';
import twilio from 'twilio';

dotenv.config();

const accountSid = process.env.TWILIO_SID; // Your Account SID from www.twilio.com/console
const authToken = process.env.TWILIO_AUTH;   // Your Auth Token from www.twilio.com/console
const phone = process.env.TWILIO_PHONE

const client = twilio(accountSid, authToken);

export const sendSms = async (to: string, message: string): Promise<void> => {
  try {
    const response = await client.messages.create({
        body: message,
        from: phone, // Your Twilio phone number as a string
        to: to, // The recipient's phone number as a string
      });
    console.log('SMS sent successfully:', response.sid);
  } catch (error) {
    console.error('Error sending SMS:', error);
  }
};