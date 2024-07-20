'use client';

import ComboBox from '@/components/inputs/ComboBox';
import InputFile from '@/components/inputs/InputFile';
import Button, { Variant } from '@/components/shared/Button';
import { useRouter } from 'next/navigation';
import {
   ChangeEvent,
   Dispatch,
   DragEvent,
   Fragment,
   SetStateAction,
   useRef,
   useState,
} from 'react';
import { Item } from 'react-stately';
import WarningModal from '../components/WarningModal';
import { clinicRoutes } from '@/lib/routes';
import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded';
import { Clinic } from '@/types/clinic';
import { createFile, uploadFile } from '@/services/files';
import { editClinic } from '@/services/clinic';
import ModalTrigger from '@/components/modal/ModalTrigger';
import Dialog from '@/components/modal/Dialog';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';

interface IFilesEdit {
   slug: string;
   termsAndConditions: string | null;
   clinicPolicies: string | null;
   servicePolicies: string | null;
   clinic: Clinic;
}

export default function FilesEdit({
   slug,
   clinicPolicies,
   servicePolicies,
   termsAndConditions,
   clinic,
}: IFilesEdit) {
   const [saving, setSaving] = useState(false);

   const [openWarning, setOpenWarning] = useState(false);
   const [saved, setSaved] = useState(false);

   const [savingError, setSavingError] = useState<string>();

   const [newClinicPolicies, setNewClinicPolicies] = useState<File | string>();
   const [newServicePolicies, setNewServicePolicies] = useState<
      File | string
   >();
   const [newTermsAndConditions, setNewTermsAndConditions] = useState<
      File | string
   >();

   const [selectedHour, setSelectedHour] = useState(
      clinic.cancelation_hours.toString(),
   );

   const clinicPoliciesInput = useRef<HTMLInputElement>(null);
   const servicePoliciesInput = useRef<HTMLInputElement>(null);
   const termsAndConditionsInput = useRef<HTMLInputElement>(null);

   async function dropHandler(
      e: DragEvent<HTMLDivElement>,
      setNewFile: Dispatch<SetStateAction<File | undefined | string>>,
   ) {
      e.currentTarget.classList.remove('border-primary', '!border-solid');

      let file: File | undefined | null = undefined;

      e.preventDefault();

      if (e.dataTransfer.items) {
         file = [...e.dataTransfer.items].at(0)?.getAsFile();
      } else {
         file = [...e.dataTransfer.items].at(0);
      }

      setNewFile(
         (() => {
            if (file) {
               if (file.size > 10000000) {
                  return 'El tamaño es mayor al indicado';
               } else if (file.type === 'application/pdf') {
                  return file;
               } else {
                  return 'Ingresar un tipo de archivo valido';
               }
            }
         })(),
      );
   }

   function imageInputHandler(
      e: ChangeEvent<HTMLInputElement>,
      setNewFile: Dispatch<SetStateAction<File | undefined | string>>,
   ) {
      const file = e.target.files?.item(0);

      setNewFile(
         (() => {
            if (file) {
               if (file.size > 10000000) {
                  return 'El tamaño es mayor al indicado';
               } else if (file.type === 'application/pdf') {
                  return file;
               } else {
                  return 'Ingresar un tipo de archivo valido';
               }
            }
         })(),
      );
   }

   const conditions = [
      {
         file: clinicPolicies,
         title: 'Políticas de la clínica',
         newFile: newClinicPolicies,
         setNewFile: setNewClinicPolicies,
         inputRef: clinicPoliciesInput,
         property: 'clinic_policies',
      },
      {
         file: servicePolicies,
         title: 'Términos y condiciones del servicio',
         newFile: newServicePolicies,
         setNewFile: setNewServicePolicies,
         inputRef: servicePoliciesInput,
         property: 'service_policies',
      },
      {
         file: termsAndConditions,
         title: 'Políticas de cancelación del servicio',
         newFile: newTermsAndConditions,
         setNewFile: setNewTermsAndConditions,
         inputRef: termsAndConditionsInput,
         property: 'terms_and_conditions',
      },
   ] as const;

   async function save() {
      if (saving) return;

      setSavingError(undefined);
      setSaving(true);

      try {
         const aux = { ...clinic };

         const promises = conditions.map(async ({ newFile, property }) => {
            if (newFile && typeof newFile !== 'string') {
               const file_url = (await uploadFile(newFile)).data;

               const { id } = (
                  await createFile({
                     file_name: newFile.name,
                     public_name: property,
                     url: file_url,
                  })
               ).data;

               aux[property] = id;
            }
         });

         await Promise.all(promises);

         await editClinic({ ...aux, cancelation_hours: Number(selectedHour) });

         setSaved(true);
      } catch (error) {
         setSavingError('Ocurrió un error inesperado.');
      }

      setSaving(false);
   }

   return (
      <>
         <SuccessModal isOpen={saved} slug={slug} />
         <WarningModal
            route={clinicRoutes(slug).admin_settings_terms_and_policies}
            isOpen={openWarning}
            setIsOpen={setOpenWarning}
         />
         <h3 className="text-xl">Políticas y condiciones de la clínica</h3>
         <section className="mt-10 grid grid-cols-2 gap-5 overflow-auto px-24">
            {conditions.map(
               ({ file, title, newFile, setNewFile, inputRef }, i) => (
                  <Fragment key={i}>
                     <p className="col-span-2 mt-2 font-semibold">{title}</p>
                     <InputFile
                        dropHandler={e => dropHandler(e, setNewFile)}
                        imageInputHandler={e =>
                           imageInputHandler(e, setNewFile)
                        }
                        inputFileRef={inputRef}
                        file={newFile}
                        accept="application/pdf"
                        clearFile={() => setNewFile(undefined)}
                     >
                        <p className="font-normal text-on-background-text">
                           PDF, tamaño de archivo no superior a 10 MB
                        </p>
                     </InputFile>
                  </Fragment>
               ),
            )}
            <p className="col-span-2 mt-2 font-semibold">
               Cancelación de citas
            </p>
            <div className="col-span-2 grid grid-cols-2 gap-32">
               <p className="text-on-background-text">
                  El paciente podrá cancelar la cita hasta _______ antes de la
                  hora programada.
               </p>
               <ComboBox
                  id="country-switcher"
                  placeholder="Ingresar país"
                  selectedKey={selectedHour}
                  onSelectionChange={val => {
                     val && setSelectedHour(val.toString());
                  }}
               >
                  {Array.from({ length: 11 }).map((number, i) => (
                     <Item key={i} textValue={`${i.toString()}:00`}>
                        <div className="px-4 py-3 hover:bg-primary-100">
                           {`${i.toString()}:00`}
                        </div>
                     </Item>
                  ))}
               </ComboBox>
            </div>
            {savingError && (
               <div className="col-span-2 mt-4 w-full text-center text-error">
                  {savingError}
               </div>
            )}
            <div className="col-span-2 my-4 flex w-2/3 gap-5 justify-self-center">
               <Button
                  variant={Variant.secondary}
                  isDisabled={saving}
                  onPress={() => setOpenWarning(true)}
               >
                  Cancelar
               </Button>
               <Button onPress={save} isDisabled={saving}>
                  {saving ? (
                     <>
                        Cargando...
                        <RefreshRoundedIcon className="animate-spin" />
                     </>
                  ) : (
                     <>Guardar</>
                  )}
               </Button>
            </div>
         </section>
      </>
   );
}

function SuccessModal({ slug, isOpen }: { slug: string; isOpen: boolean }) {
   const router = useRouter();

   return (
      <ModalTrigger className="m-2 animate-appear sm:m-8" isOpen={isOpen}>
         {() => (
            <Dialog className="flex flex-col items-center gap-9 rounded-xl p-8 sm:p-14">
               <CheckCircleRoundedIcon className="!text-8xl text-primary" />
               <div>
                  <h3 className="mb-3 text-center text-xl">
                     Tus cambios se han guardado
                  </h3>
                  <p className="px-14 text-center !text-base !font-normal text-on-background-text body-1">
                     Podrás ver tus cambios actualizados en las configuraciones
                     de la clínica
                  </p>
               </div>
               <Button
                  className="max-w-[60%]"
                  onPress={() => {
                     router.refresh();
                     router.push(
                        clinicRoutes(slug).admin_settings_terms_and_policies,
                     );
                  }}
               >
                  Continuar
               </Button>
            </Dialog>
         )}
      </ModalTrigger>
   );
}
