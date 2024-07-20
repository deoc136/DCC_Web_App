import axios from 'axios';

export interface EmailData {
   fromEmail: string;
   destinationEmails: string[];
   content: string;
   subject: string;
}

export interface SMSData {
   PhoneNumber: string;
   Message: string;
}

export async function sendEmail(data: EmailData) {
   return await axios.post('/email/send', data);
}
