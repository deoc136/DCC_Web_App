'use client';

import { Tabs } from '@/components/shared/Tabs';
import { useAppDispatch, useAppSelector } from '@/lib/hooks/redux-hooks';
import { clinicRoutes } from '@/lib/routes';
import { usePathname, useRouter } from 'next/navigation';
import { ReactNode, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Item } from 'react-stately';
import PatientAppointmentsSidebar from './PatientAppointmentsSidebar';

interface ILayoutChildrenWrapper {
   children: ReactNode;
}

export default function LayoutChildrenWrapper({
   children,
}: ILayoutChildrenWrapper) {
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
         {patientBody &&
            (pathname.includes(
               clinicRoutes(slug).patient_appointments_actives,
            ) ||
               pathname.includes(
                  clinicRoutes(slug).patient_appointments_history,
               )) &&
            createPortal(
               <Tabs
                  className="grid grid-cols-2 gap-0 border-b border-on-background-disabled pt-5 text-center lg:hidden"
                  noTabPanel
                  aria-label="tabs container"
                  selectedKey={pathname}
                  onSelectionChange={key => router.push(key.toString())}
               >
                  <Item
                     aria-label="actives"
                     key={clinicRoutes(slug).patient_appointments_actives}
                     title="Citas agendadas"
                  >
                     {true}
                  </Item>
                  <Item
                     aria-label="history"
                     key={clinicRoutes(slug).patient_appointments_history}
                     title="Historial de citas"
                  >
                     {true}
                  </Item>
               </Tabs>,
               patientBody,
            )}
         <div className="grid h-full lg:flex lg:gap-10">
            <PatientAppointmentsSidebar />
            <div className="w-full lg:pt-4">{children}</div>
         </div>
      </>
   );
}
