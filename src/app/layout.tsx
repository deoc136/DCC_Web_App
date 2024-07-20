import './globals.css';
import type { Metadata } from 'next';
import { Lato, Poppins } from 'next/font/google';
import { Providers } from '@/app/provider';
import { setUp_amplify } from '@/lib/actions/setUp-amplify';
import { Side, applyAxiosConfig } from '@/config/axios-config';
import { getAllCatalogType, getCatalogByType } from '@/services/catalog';
import GeneralDataSetter from '@/components/shared/setters/GeneralDataSetter';
import { getAllCurrencies } from '@/services/currency';
import UserListener from '@/components/shared/setters/UserListener';
import { meta_descriptions } from '@/lib/seo/meta_descriptions';

const lato = Lato({
   subsets: ['latin'],
   weight: ['400', '300', '700'],
   display: 'swap',
   variable: '--font-lato',
});
const poppins = Poppins({
   subsets: ['latin'],
   display: 'swap',
   weight: ['300', '400', '500', '600', '700', '800'],
   variable: '--font-poppins',
});

export const metadata: Metadata = {
   title: 'Agenda ahora',
   description: meta_descriptions.agenda_ahora_description,
};

setUp_amplify();

applyAxiosConfig(Side.server);

export default async function RootLayout({
   children,
}: {
   children: React.ReactNode;
}) {
   const catalog_type = (await getAllCatalogType()).data;

   const country_type_id = catalog_type.find(type => type.code === 'COUNTRY')
      ?.id;
   const city_type_id = catalog_type.find(type => type.code === 'CITY')?.id;
   const identification_type_id = catalog_type.find(
      type => type.code === 'DOCUMENT_TYPE',
   )?.id;
   const phone_code_id = catalog_type.find(type => type.code === 'PHONE_CODE')
      ?.id;
   const week_day_id = catalog_type.find(type => type.code === 'WEEK_DAY')?.id;
   const hour_id = catalog_type.find(type => type.code === 'HOUR')?.id;
   const nationalities_id = catalog_type.find(
      type => type.code === 'NATIONALITY',
   )?.id;

   const [
      { data: countries },
      { data: identification_types },
      { data: phone_codes },
      { data: week_days },
      { data: hours },
      { data: nationalities },
      { data: currencies },
   ] = await Promise.all([
      getCatalogByType(country_type_id!),
      getCatalogByType(identification_type_id!),
      getCatalogByType(phone_code_id!),
      getCatalogByType(week_day_id!),
      getCatalogByType(hour_id!),
      getCatalogByType(nationalities_id!),
      getAllCurrencies(),
   ]);

   return (
      <html
         className={`${poppins.variable} ${lato.variable} scroll-smooth`}
         lang="es"
      >
         <body className="relative min-h-screen">
            <Providers>
               <UserListener />
               <GeneralDataSetter
                  catalogue_types={catalog_type}
                  countries={countries}
                  phone_codes={phone_codes}
                  identification_types={identification_types}
                  currencies={currencies}
                  week_days={week_days}
                  hours={hours}
                  nationalities={nationalities}
                  city_type_id={city_type_id!}
               />
               {children}
            </Providers>
         </body>
      </html>
   );
}
