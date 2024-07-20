'use client';

import { Tabs } from '@/components/shared/Tabs';
import { useAppDispatch, useAppSelector } from '@/lib/hooks/redux-hooks';
import { clinicRoutes } from '@/lib/routes';
import { usePathname, useRouter } from 'next/navigation';
import { ReactNode, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Item } from 'react-stately';
import PatientProfileSidebar from './PatientProfileSidebar';
import HeaderTitleSetter from './HeaderTitleSetter';
import useDictionary from '@/lib/hooks/useDictionary';

interface ILayoutChildrenWrapper {
   children: ReactNode;
}

export default function LayoutChildrenWrapper({
   children,
}: ILayoutChildrenWrapper) {
   const dic = useDictionary();

   const pathname = usePathname();

   const { slug } = useAppSelector(store => store.clinic);

   const router = useRouter();

   const dispatch = useAppDispatch();

   const [patientBody, setPatientBody] = useState<Element | null>(null);

   useEffect(() => {
      setPatientBody(
         document.querySelector('#patient-body #aux-container') ?? null,
      );
   }, [dispatch]);

   return (
      <>
         <HeaderTitleSetter />
         <div className="grid h-full lg:flex lg:gap-10">
            <PatientProfileSidebar />
            <div className="w-full lg:pt-4">{children}</div>
         </div>
         {patientBody &&
            !pathname.includes(
               clinicRoutes(slug).patient_profile_personal_data_edit,
            ) &&
            !pathname.includes('replace') &&
            !pathname.includes('submit') &&
            createPortal(
               <Tabs
                  className="grid grid-cols-3 gap-0 break-normal border-b border-on-background-disabled pt-5 text-center lg:hidden"
                  noTabPanel
                  aria-label="tabs container"
                  selectedKey={pathname}
                  onSelectionChange={key => router.push(key.toString())}
               >
                  <Item
                     aria-label="personal data"
                     title={dic.texts.flows.personal_data}
                     key={clinicRoutes(slug).patient_profile_personal_data}
                  >
                     {true}
                  </Item>
                  <Item
                     aria-label="forms"
                     title={dic.texts.flows.forms}
                     key={clinicRoutes(slug).patient_profile_forms}
                  >
                     {true}
                  </Item>
                  <Item
                     aria-label="clinic history"
                     title={dic.texts.flows.clinic_history}
                     key={clinicRoutes(slug).patient_profile_clinic_history}
                  >
                     {true}
                  </Item>
               </Tabs>,
               patientBody,
            )}
      </>
   );
}
