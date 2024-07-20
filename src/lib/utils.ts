import {
   AppointmentAssistance,
   AppointmentState,
   PaymentMethod,
} from '@/types/appointment';
import { Catalog } from '@/types/catalog';
import { Clinic } from '@/types/clinic';
import { Currency } from '@/types/currency';
import { Genre, Role } from '@/types/user';
import { Dispatch, SetStateAction } from 'react';
import { SafeParseError } from 'zod';
import es from '../dictionaries/es.json';

export function makeNegativeNumberZero(num: number) {
   return num < 0 ? 0 : num;
}

export const baseUrl = 'https://dev.front.agendaahora.com';
export const paypalInvoiceUrl = 'https://www.sandbox.paypal.com/invoice/p/#';

export const dayMilliseconds = 86400000;
export const hourMilliseconds = 3600000;

export function groupBy<T>(collection: T[], key: keyof T) {
   const groupedResult = collection.reduce((previous, current) => {
      if (!previous[current[key]]) {
         previous[current[key]] = [] as T[];
      }

      previous[current[key]].push(current);
      return previous;
   }, {} as any); // tried to figure this out, help!!!!!
   return groupedResult;
}

export function cutFullName(names: string, lastNames: string) {
   return `${names.split(' ').at(0)} ${lastNames.split(' ').at(0)}`;
}

export function convertErrorIntoString<T>(error: SafeParseError<T>) {
   const deactivation_date: any = {};
   error.error.errors.forEach(
      error => (deactivation_date[`${error.path}`] = error.message),
   );

   return JSON.stringify(deactivation_date);
}

export function resetDateTime(date: Date) {
   date.setHours(0);
   date.setMinutes(0);
   date.setMilliseconds(0);

   return date;
}

export const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

export function isSameDay(d1: Date, d2: Date) {
   return (
      d1.getFullYear() === d2.getFullYear() &&
      d1.getMonth() === d2.getMonth() &&
      d1.getDate() === d2.getDate()
   );
}

export function capitalizeFirstLetter(inputString: string): string {
   if (inputString.length === 0) {
      return inputString; // Return an empty string if the input is empty
   }

   const firstLetter = inputString.charAt(0).toUpperCase();
   const restOfString = inputString.slice(1);

   return firstLetter + restOfString;
}

export function generatePopoverState(
   isOpen: boolean,
   setOpen: Dispatch<SetStateAction<boolean>>,
) {
   return {
      isOpen,
      setOpen,
      toggle: () => setOpen(prev => !prev),
      close: () => setOpen(false),
      open: () => setOpen(true),
   };
}

export const password_regex =
   /^(?=.*[0-9])(?=.*[A-Z])(?=.*[a-z])(?=.*\W).{8,}$/;

export function createDateAndReturnTime(date: string, hour: number) {
   const aux = new Date(date);

   aux.setHours(hour);

   return aux.getTime();
}

export function profilePicFromLetters(
   canvas: HTMLCanvasElement,
   letters: string,
) {
   const ctx = canvas.getContext('2d');

   if (!ctx) return;

   ctx.rect(0, 0, 120, 120);
   ctx.fillStyle = '#4FD1C5';
   ctx.fill();

   ctx.font = '48px Helvetica';
   ctx.fillStyle = 'white';

   ctx.textAlign = 'center';

   ctx.fillText(letters, 60, 76);
}

export function generatePassword() {
   const chars =
      '0123456789abcdefghijklmnopqrstuvwxyz!@#$%^&*()ABCDEFGHIJKLMNOPQRSTUVWXYZ';
   const passwordLength = 40;
   let password = '';

   for (let i = 0; i <= passwordLength; i++) {
      let randomNumber = Math.floor(Math.random() * chars.length);
      password += chars.substring(randomNumber, randomNumber + 1);
   }

   return password;
}

export function secondsToTime(seconds: number) {
   const hours = Math.floor(seconds / 3600);
   const minutes = Math.floor((seconds % 3600) / 60);
   const remainingSeconds = seconds % 60;

   return `${hours > 0 ? `${hours}h` : ''} ${
      minutes > 0
         ? `${minutes}m`
         : remainingSeconds > 0
         ? `${remainingSeconds}s`
         : ''
   }`;
}

export function secondsToTimeExtended(seconds: number, dic = es) {
   const hours = Math.floor(seconds / 3600);
   const minutes = Math.floor((seconds % 3600) / 60);
   const remainingSeconds = seconds % 60;

   return `${
      hours > 0 ? `${hours} ${dic.texts.time.hour?.toLowerCase()}(s)` : ''
   } ${
      minutes > 0
         ? `${minutes} ${dic.texts.time.min?.toLowerCase()}(s)`
         : remainingSeconds > 0
         ? `${remainingSeconds} ${dic.texts.time.sec?.toLowerCase()}(s)`
         : ''
   }`;
}

export function wait(milliseconds: number): Promise<void> {
   return new Promise(resolve => {
      setTimeout(() => {
         resolve();
      }, milliseconds);
   });
}

export function getCurrency(
   currencies: Currency[],
   countries: Catalog[],
   clinic: Clinic,
) {
   return (
      currencies.find(currency => currency.id === clinic.currency_id)?.code ??
      countries
         .find(country => country.id === clinic.country)
         ?.code.split('/')
         .at(1)
   );
}

export function downloadURI(uri: string, name: string) {
   const link = document.createElement('a');
   link.download = name;
   link.href = uri;
   document.body.appendChild(link);
   link.click();
   document.body.removeChild(link);
}

export function translateRole(role: Role, dic = es) {
   switch (role) {
      case 'ADMINISTRATOR':
         return dic.texts.roles.admin;
      case 'RECEPTIONIST':
         return dic.texts.roles.receptionist;
      case 'PATIENT':
         return dic.texts.roles.patient;
      case 'THERAPIST':
         return dic.texts.roles.therapist;
   }
}

export function translateGenre(genre: Genre, dic = es) {
   switch (genre) {
      case 'FEMALE':
         return dic.texts.genres.female;
      case 'MALE':
         return dic.texts.genres.male;
      case 'OTHER':
         return dic.texts.genres.other;
   }
}

export function translatePaymentMethod(genre: PaymentMethod, dic = es) {
   switch (genre) {
      case 'CARD':
         return dic.texts.payment_methods.card;
      case 'CASH':
         return dic.texts.payment_methods.cash;
      case 'ONLINE':
         return dic.texts.payment_methods.online;
   }
}

export function translateAppointmentState(state: AppointmentState, dic = es) {
   switch (state) {
      case 'CANCELED':
         return dic.texts.appointments.canceled;
      case 'CLOSED':
         return dic.texts.appointments.closed;
      case 'PENDING':
         return dic.texts.appointments.pending;
      case 'TO_PAY':
         return dic.texts.appointments.to_pay;
   }
}

export function translateAppointmentAssistance(
   state?: AppointmentAssistance,
   dic = es,
) {
   switch (state) {
      case 'ATTENDED':
         return dic.texts.appointments.attended;
      default:
         return dic.texts.appointments.missed;
   }
}

export function convertDaysIntoString(
   work_days: string[],
   week_days: Catalog[],
) {
   if (!work_days.length) {
      return 'Selecciona al menos un día';
   } else if (work_days.length === 1) {
      return (
         week_days.find(day => day.code === work_days.at(0))?.display_name ?? ''
      );
   } else if (work_days.length === week_days.length) {
      return 'Todos los días';
   } else if (
      work_days
         .sort((a, b) => a.localeCompare(b))
         .every(
            (day, i) =>
               i === 0 || Number(work_days.at(i - 1)) === Number(day) - 1,
         )
   ) {
      return `${week_days.find(day => day.code === work_days.at(0))
         ?.display_name} a ${week_days.find(
         day => day.code === work_days.at(-1),
      )?.display_name}`;
   } else {
      return work_days
         .map(day => week_days.find($day => $day.code === day)?.display_name)
         .join(', ');
   }
}

export function arrayFromNumbers(start: number, end: number) {
   const aux: number[] = [];

   for (let index = start; index < end; index++) {
      aux.push(index);
   }

   return aux;
}

export async function getFileFromUrl(url: string) {
   const res = await fetch(url);

   const blob = await res.blob();

   return blobToFile(blob, blob.name);
}

function blobToFile(theBlob: Blob, fileName: string) {
   const b: any = theBlob;
   b.lastModifiedDate = new Date();
   b.name = fileName;

   return theBlob as File;
}

export function formatPrice(price: number, currency: string | undefined) {
   return new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency: currency,
   }).format(price);
}

function clearNumber(value = '') {
   return value.replace(/\D+/g, '');
}

export function formatExpirationDate(value: string) {
   const clearValue = clearNumber(value);

   if (clearValue.length >= 3) {
      return `${clearValue.slice(0, 2)}/${clearValue.slice(2, 4)}`;
   }

   return clearValue;
}
