'use client';

import Card from '@/components/shared/cards/Card';
import { useAppSelector } from '@/lib/hooks/redux-hooks';
import {
   Body,
   Button,
   Container,
   Head,
   Hr,
   Html,
   Img,
   Link,
   Preview,
   Row,
   Section,
   Tailwind,
   Text,
} from '@react-email/components';
import * as React from 'react';

interface IEmailLayout {
   children: React.ReactNode;
   imageUrl: string;
   redirectionUrl?: string;
   linkText?: string;
}

export function EmailLayout({
   children,
   imageUrl,
   redirectionUrl,
   linkText,
}: IEmailLayout) {
   const fontFamilyRule =
      'font-[-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif]';

   return (
      <Tailwind>
         <Head />
         <Body>
            <div className="min-h-screen w-full max-w-screen-sm bg-[#f2f2fa] p-6">
               <Img className="box-content w-36 px-12 py-6" src={imageUrl} />
               <section
                  className={`rounded-lg bg-white p-11 ${fontFamilyRule}`}
               >
                  <div className="mb-6 text-base text-[#606061]">
                     {children}
                  </div>
                  {redirectionUrl && linkText && (
                     <Link
                        href={redirectionUrl}
                        className="m-auto mb-6 block w-4/5 self-center rounded-md bg-[#db3a00] px-4 py-3 text-center font-semibold text-white no-underline"
                     >
                        {linkText}
                     </Link>
                  )}
                  <p className="mt-2 text-xs">
                     © {new Date().getFullYear()} Agenda ahora
                  </p>
               </section>
            </div>
         </Body>
      </Tailwind>
   );
}

export default EmailLayout;
