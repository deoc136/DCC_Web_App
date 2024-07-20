'use client';

import { Service } from '@/types/service';
import { User } from '@/types/user';
import Button, { Variant } from '@/components/shared/Button';
import ReactToPrint from 'react-to-print';
import { Fragment, useRef, useState } from 'react';
import { useAppSelector } from '@/lib/hooks/redux-hooks';
import { Appointment } from '@/types/appointment';
import ClinicHistory from '@/components/shared/ClinicHistory';

interface IHistoryView {
   services: Service[];
   therapists: User[];
   clinicHistories: ClinicHistory[];
   appointment: Appointment;
}

export default function HistoryView({
   clinicHistories,
   services,
   therapists,
   appointment,
}: IHistoryView) {
   const dataRef = useRef(null);

   const [isPrinting, setIsPrinting] = useState(false);

   const { identification_types } = useAppSelector(store => store.catalogues);

   return (
      <div ref={dataRef}>
         {!isPrinting ? (
            <>
               <div className="mb-11 flex items-center justify-between">
                  <h3 className="text-xl">Historia clínica</h3>
                  <div className="flex flex-wrap justify-end gap-5 justify-self-end">
                     <ReactToPrint
                        onBeforeGetContent={async () => setIsPrinting(true)}
                        onAfterPrint={() => setIsPrinting(false)}
                        trigger={() => (
                           <Button className="h-min w-max !px-12">
                              Descargar historial medico
                           </Button>
                        )}
                        content={() => dataRef.current}
                     />
                  </div>
               </div>
               <section className="mx-24 grid gap-14">
                  {clinicHistories.map(history => (
                     <ClinicHistory
                        key={history.id}
                        history={history}
                        service={services.find(
                           ({ id }) => id === history.service_id,
                        )}
                        therapist={therapists.find(
                           ({ id }) => id === history.therapist_id,
                        )}
                     />
                  ))}
               </section>
            </>
         ) : (
            <div className="m-10 font-sans">
               <section className="grid gap-14">
                  {clinicHistories.map(history => (
                     <ClinicHistory
                        key={history.id}
                        printing
                        expanded
                        history={history}
                        service={services.find(
                           ({ id }) => id === history.service_id,
                        )}
                        therapist={therapists.find(
                           ({ id }) => id === history.therapist_id,
                        )}
                     />
                  ))}
               </section>
            </div>
         )}
      </div>
   );
}
