'use client';

import { Service } from '@/types/service';
import { User } from '@/types/user';
import Button, { Variant } from '@/components/shared/Button';
import ReactToPrint from 'react-to-print';
import { useRef, useState } from 'react';
import { Appointment } from '@/types/appointment';
import ClinicHistory from '@/components/shared/ClinicHistory';
import DownloadRoundedIcon from '@mui/icons-material/DownloadRounded';
import TextField from '@/components/inputs/TextField';
import { createClinicHistory } from '@/services/clinic-history';
import { useAppSelector } from '@/lib/hooks/redux-hooks';
import { useRouter } from 'next/navigation';
import WarningModal from '../../components/WarningModal';
import CreationConfirmationModal from '../../components/CreationConfirmationModal';
import ClosingConfirmationModal from '../../components/ClosingConfirmationModal';
import { editAppointment } from '@/services/appointment';
import { clinicRoutes } from '@/lib/routes';
import SuccessModal from '../../components/SuccessModal';

interface IHistoryView {
   services: Service[];
   therapists: User[];
   clinicHistories: ClinicHistory[];
   appointment: Appointment;
}

export default function HistoryView({
   appointment,
   clinicHistories,
   services,
   therapists,
}: IHistoryView) {
   const dataRef = useRef(null);

   const { slug } = useAppSelector(store => store.clinic);

   const router = useRouter();

   const [isPrinting, setIsPrinting] = useState(false);

   const [newNote, setNewNote] = useState('');
   const [isCreating, setIsCreating] = useState(false);

   const [isClosing, setIsClosing] = useState(false);

   const [creatingError, setCreatingError] = useState(false);
   const [closingError, setClosingError] = useState(false);

   const [creatingModalOpen, setCreatingModalOpen] = useState(false);
   const [cancelingModalOpen, setCancelingModalOpen] = useState(false);
   const [closingModalOpen, setClosingModalOpen] = useState(false);

   const [closedSuccessfully, setClosedSuccessfully] = useState(false);

   const isClosed = ['CANCELED', 'CLOSED'].some(
      state => appointment.state === state,
   );

   async function createNote() {
      if (isCreating || !newNote.length) return;

      setIsCreating(true);
      setCreatingError(false);

      const { date, hour, patient_id, service_id, therapist_id, id } =
         appointment;

      try {
         await createClinicHistory(slug, {
            appointment_id: id,
            content: newNote,
            date,
            hour,
            patient_id,
            service_id,
            therapist_id,
         });

         router.refresh();
         setNewNote('');
      } catch (error) {
         setCreatingError(true);
      }

      setCreatingModalOpen(false);
      setIsCreating(false);
   }

   async function closeAppointment() {
      if (isClosing || !clinicHistories.length || isClosed) return;

      setIsClosing(true);
      setClosingError(false);

      try {
         await editAppointment(slug, {
            ...appointment,
            state: 'CLOSED',
         });

         router.refresh();
         setClosedSuccessfully(true);
      } catch (error) {
         setClosingError(true);
      }

      setClosingModalOpen(false);
      setIsClosing(false);
   }

   return (
      <>
         <SuccessModal
            isOpen={closedSuccessfully}
            action={() =>
               router.push(
                  clinicRoutes(slug).therapist_appointments_id(appointment.id)
                     .details,
               )
            }
         />
         <ClosingConfirmationModal
            close={closeAppointment}
            isClosing={isClosing}
            isOpen={closingModalOpen}
            setIsOpen={setClosingModalOpen}
         />
         <CreationConfirmationModal
            create={createNote}
            isCreating={isCreating}
            isOpen={creatingModalOpen}
            setIsOpen={setCreatingModalOpen}
         />
         <WarningModal
            cancel={() => {
               setNewNote('');
               setCancelingModalOpen(false);
            }}
            isOpen={cancelingModalOpen}
            setIsOpen={setCancelingModalOpen}
         />
         <div ref={dataRef}>
            {!isPrinting ? (
               <>
                  <div className="mb-11 hidden items-center justify-between md:flex">
                     <h3 className="text-base lg:text-xl">Historia clínica</h3>
                     <div className="grid grid-cols-[auto_auto] gap-5 justify-self-end">
                        <ReactToPrint
                           onBeforeGetContent={async () => setIsPrinting(true)}
                           onAfterPrint={() => setIsPrinting(false)}
                           trigger={() => (
                              <Button
                                 variant={Variant.secondary}
                                 className="flex h-min w-full items-center gap-2 !px-12"
                              >
                                 <DownloadRoundedIcon /> Descargar historial
                                 medico
                              </Button>
                           )}
                           content={() => dataRef.current}
                        />
                        <Button
                           isDisabled={
                              !clinicHistories.length ||
                              isClosed ||
                              !appointment.assistance
                           }
                           className="!px-6"
                           onPress={() => setClosingModalOpen(true)}
                        >
                           Finalizar servicio
                        </Button>
                        {closingError && (
                           <div className="col-span-2 w-full flex-none text-end text-error">
                              Ocurrió un error inesperado.
                           </div>
                        )}
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
                        {!isClosed && (
                           <>
                              <TextField
                                 value={newNote}
                                 onChange={val =>
                                    val.length <= 1000 && setNewNote(val)
                                 }
                                 className="w-full"
                                 isTextArea
                                 placeholder="Añade aquí una nueva nota..."
                              />
                              {creatingError && (
                                 <div className="w-full flex-none text-start text-error">
                                    Ocurrió un error inesperado.
                                 </div>
                              )}
                              {!!newNote.length && (
                                 <div className="grid grid-cols-2 gap-5 md:w-1/2 lg:w-2/5">
                                    <Button
                                       onPress={() =>
                                          setCancelingModalOpen(true)
                                       }
                                       variant={Variant.secondary}
                                    >
                                       Cancelar
                                    </Button>
                                    <Button
                                       onPress={() =>
                                          setCreatingModalOpen(true)
                                       }
                                    >
                                       Guardar
                                    </Button>
                                 </div>
                              )}
                           </>
                        )}
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
                  {!isClosed && (
                     <div className="mt-10 grid gap-5 md:hidden">
                        <Button
                           isDisabled={
                              !clinicHistories.length ||
                              isClosed ||
                              !appointment.assistance
                           }
                           className="!px-6"
                           onPress={() => setClosingModalOpen(true)}
                        >
                           Finalizar servicio
                        </Button>
                        {closingError && (
                           <div className="col-span-2 w-full flex-none text-end text-error">
                              Ocurrió un error inesperado.
                           </div>
                        )}
                     </div>
                  )}
               </>
            ) : (
               <div className="m-10 font-sans text-base">
                  <section className="grid gap-14">
                     <h3 className="text-base">Notas clínicas</h3>
                     {clinicHistories
                        .sort(
                           (a, b) =>
                              new Date(b.date).getDate() -
                              new Date(a.date).getDate(),
                        )
                        .map(history => (
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
      </>
   );
}
