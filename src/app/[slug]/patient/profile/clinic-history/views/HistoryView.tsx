'use client';

import { Service } from '@/types/service';
import { User } from '@/types/user';
import Button from '@/components/shared/Button';
import ReactToPrint from 'react-to-print';
import { useRef, useState } from 'react';
import { useAppSelector } from '@/lib/hooks/redux-hooks';
import ClinicHistory from '@/components/shared/ClinicHistory';
import useDictionary from '@/lib/hooks/useDictionary';

interface IHistoryView {
   services: Service[];
   therapists: User[];
   clinicHistories: ClinicHistory[];
   patient: User;
}

export default function HistoryView({
   clinicHistories,
   services,
   therapists,
   patient,
}: IHistoryView) {
   const dic = useDictionary();

   const dataRef = useRef(null);

   const [isPrinting, setIsPrinting] = useState(false);

   const { identification_types } = useAppSelector(store => store.catalogues);

   return (
      <div ref={dataRef}>
         {!isPrinting ? (
            <>
               <div className="mb-11 flex flex-wrap items-start justify-between gap-5 text-sm lg:text-base">
                  <h2 className="text-lg font-semibold lg:text-xl">
                     {dic.texts.flows.clinic_history}
                  </h2>
                  <div className="flex flex-wrap justify-end gap-5 justify-self-end">
                     <ReactToPrint
                        onBeforeGetContent={async () => setIsPrinting(true)}
                        onAfterPrint={() => setIsPrinting(false)}
                        trigger={() => (
                           <Button className="h-min w-max !px-12">
                              {dic.texts.flows.download_clinic_history}
                           </Button>
                        )}
                        content={() => dataRef.current}
                     />
                  </div>
               </div>
               <section className="grid gap-14 text-sm lg:text-base xl:mx-24">
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
               <div className="mb-11 flex items-center justify-between">
                  <h2 className="text-xl font-semibold">
                     {patient.names} {patient.last_names} -{' '}
                     {
                        identification_types.find(
                           ({ id }) => patient.identification_type === id,
                        )?.name
                     }
                     : {patient.identification ?? ''}
                  </h2>
               </div>
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
