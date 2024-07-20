'use client';

import { Service } from '@/types/service';
import { User } from '@/types/user';
import Button, { Variant } from '@/components/shared/Button';
import ReactToPrint from 'react-to-print';
import { Fragment, useRef, useState } from 'react';
import { useAppSelector } from '@/lib/hooks/redux-hooks';
import ClinicHistory from '@/components/shared/ClinicHistory';
import DownloadRoundedIcon from '@mui/icons-material/DownloadRounded';

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
   const dataRef = useRef(null);

   const [isPrinting, setIsPrinting] = useState(false);

   return (
      <div ref={dataRef}>
         {!isPrinting ? (
            <>
               <div className="mb-11 hidden items-center justify-between md:flex">
                  <h3 className="text-base lg:text-xl">Historia clínica</h3>
                  <div className="flex flex-wrap justify-end gap-5 justify-self-end">
                     <ReactToPrint
                        onBeforeGetContent={async () => setIsPrinting(true)}
                        onAfterPrint={() => setIsPrinting(false)}
                        trigger={() => (
                           <Button
                              variant={Variant.secondary}
                              className="flex h-min w-full items-center gap-2 !px-12"
                           >
                              <DownloadRoundedIcon /> Descargar historial medico
                           </Button>
                        )}
                        content={() => dataRef.current}
                     />
                  </div>
               </div>
               <section className="mb-5 flex items-center justify-between md:hidden">
                  <h3 className="text-base lg:text-xl">Notas clínicas</h3>
                  <ReactToPrint
                     onBeforeGetContent={async () => setIsPrinting(true)}
                     onAfterPrint={() => setIsPrinting(false)}
                     trigger={() => (
                        <Button
                           variant={Variant.secondary}
                           className="flex h-min w-max items-center gap-2"
                        >
                           <DownloadRoundedIcon /> Descargar
                        </Button>
                     )}
                     content={() => dataRef.current}
                  />
               </section>
               <section className="ld:mx-24 grid gap-5 md:gap-14">
                  <div className="grid gap-5">
                     <h3 className="hidden text-base md:block">
                        Notas clínicas
                     </h3>
                  </div>
                  {clinicHistories
                     .sort(
                        (a, b) =>
                           new Date(b.date).getDate() -
                           new Date(a.date).getDate(),
                     )
                     .map(history => (
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
            <div className="m-10 font-sans text-base">
               <div className="mb-11 flex items-center justify-between">
                  <h3 className="text-xl">
                     Historia clínica de {patient.names} {patient.last_names}
                  </h3>
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
