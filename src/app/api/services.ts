import { apiUrl } from '@/config/axios-config';
import { EmailData, SMSData } from '@/services/messages';
import { Appointment } from '@/types/appointment';
import { Catalog, CatalogType } from '@/types/catalog';
import { ClinicPopulated } from '@/types/clinic';
import { Headquarter } from '@/types/headquarter';
import { User } from '@/types/user';
import axios from 'axios';

export async function sendEmail(data: EmailData) {
   return await axios.post(`${apiUrl}/email/send`, data);
}

export async function sendSMS(data: SMSData) {
   return await axios.post(`${apiUrl}/sms/send`, data);
}

export async function sendWhatsAppMessage(
   names: string,
   textDate: string,
   hour: string,
   locationAndTherapist: string,
   clinicName: string,
   phoneNumber: string,
) {
   return await axios.post(
      `https://graph.facebook.com/v18.0/236143679572746/messages`,
      {
         messaging_product: 'whatsapp',
         to: phoneNumber,
         type: 'template',
         template: {
            name: 'recordatorio',
            language: {
               code: 'es',
            },
            components: [
               {
                  type: 'body',
                  parameters: [
                     {
                        type: 'text',
                        text: names,
                     },
                     {
                        type: 'text',
                        text: textDate,
                     },
                     {
                        type: 'text',
                        text: hour,
                     },
                     {
                        type: 'text',
                        text: locationAndTherapist,
                     },
                     {
                        type: 'text',
                        text: clinicName,
                     },
                  ],
               },
            ],
         },
      },
      {
         headers: {
            authorization: `Bearer ${process.env.WHATSAPP_KEY}`,
            'Content-Type': 'application/json',
         },
      },
   );
}

export async function getAppointmentById(slug: string, id: number) {
   return await axios.get<Appointment>(`${apiUrl}/appointment/get/${id}`, {
      headers: {
         slug,
      },
   });
}

export async function getCatalogById(id: number) {
   return await axios.get<Catalog>(`${apiUrl}/catalog/get/${id}`);
}

export async function getHeadquarterById(slug: string, id: string) {
   return axios.get<Headquarter>(`${apiUrl}/headquarter/get/${id}`, {
      headers: {
         slug,
      },
   });
}

export async function getUserById(slug: string, id: string) {
   return await axios.get<User>(`${apiUrl}/user/get/${id}`, {
      headers: {
         slug,
      },
   });
}

export async function editUser(data: User, slug: string) {
   return axios.put(`${apiUrl}/user/edit`, data, {
      headers: {
         slug,
      },
   });
}

export async function getClinicBySlug(slug: string) {
   return await axios.get<ClinicPopulated>(
      `${apiUrl}/clinic/getBySlug/${slug}`,
   );
}

export async function getCatalogByType(id: number) {
   return await axios.get<Catalog[]>(`${apiUrl}/catalog/getByTypeId/${id}`);
}

export async function getAllCatalogType() {
   return await axios.get<CatalogType[]>(`${apiUrl}/catalogType/getAll`);
}
