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
               <div className="mb-11 flex items-center justify-between">
                  <h3 className="text-xl">Historia clínica</h3>
                  <div className="flex flex-wrap justify-end gap-5 justify-self-end">
                     <ReactToPrint
                        onBeforeGetContent={async () => setIsPrinting(true)}
                        onAfterPrint={() => setIsPrinting(false)}
                        trigger={() => (
                           <Button
                              variant={Variant.secondary}
                              className="h-min w-max !px-12"
                           >
                              <DownloadRoundedIcon /> Descargar historial medico
                           </Button>
                        )}
                        content={() => dataRef.current}
                     />
                  </div>
               </div>
               <section className="mx-24 mb-8 grid gap-14">
                  <h3 className="text-base">Notas clínicas</h3>
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
