'use client';

import Button, { Variant } from '@/components/shared/Button';
import { changeTitle } from '@/lib/features/title/title_slice';
import { useAppDispatch, useAppSelector } from '@/lib/hooks/redux-hooks';
import { clinicRoutes } from '@/lib/routes';
import { ChangeEvent, DragEvent, useEffect, useRef, useState } from 'react';
import DownloadRoundedIcon from '@mui/icons-material/DownloadRounded';
import InputPDF from '@/components/inputs/InputPDF';
import { downloadURI } from '@/lib/utils';
import { uploadFile } from '@/services/files';
import { deleteSubmittedFormById, submitForm } from '@/services/forms';
import { useRouter } from 'next/navigation';
import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded';
import ModalTrigger from '@/components/modal/ModalTrigger';
import Dialog from '@/components/modal/Dialog';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import CancelConfirmationModal from '@/components/shared/modals/CancelConfirmationModal';
import useDictionary from '@/lib/hooks/useDictionary';

interface ISubmitView {
   form: IFile;
   submittedForms?: SubmittedFile[];
}

export default function SubmitView({ form, submittedForms }: ISubmitView) {
   const dic = useDictionary();

   const dispatch = useAppDispatch();

   const { slug } = useAppSelector(store => store.clinic);
   const patient = useAppSelector(store => store.user);

   const [saving, setSaving] = useState(false);

   const [openWarning, setOpenWarning] = useState(false);
   const [saved, setSaved] = useState(false);

   const [savingError, setSavingError] = useState<string>();

   async function save() {
      if (saving || !(file instanceof File)) return;

      setSavingError(undefined);
      setSaving(true);

      try {
         const { data: file_url } = await uploadFile(file);

         await submitForm(slug, {
            file_name: file.name,
            form_id: form.id,
            patient_id: patient?.id ?? 0,
            url: file_url,
         });

         submittedForms &&
            (await Promise.all([
               submittedForms.map(({ id }) =>
                  deleteSubmittedFormById(id, slug),
               ),
            ]));

         setSaved(true);
      } catch (error) {
         setSavingError(dic.texts.errors.unexpected_error);
         setSaving(false);
      }
   }

   const [file, setFile] = useState<File | string>();
   const inputRef = useRef<HTMLInputElement>(null);

   async function dropHandler(e: DragEvent<HTMLDivElement>) {
      e.currentTarget.classList.remove('border-primary', '!border-solid');

      let file: File | undefined | null = undefined;

      e.preventDefault();

      if (e.dataTransfer.items) {
         file = [...e.dataTransfer.items].at(0)?.getAsFile();
      } else {
         file = [...e.dataTransfer.items].at(0);
      }

      setFile(
         (() => {
            if (file) {
               if (file.size > 10000000) {
                  return dic.texts.errors.size_larger;
               } else if (file.type === 'application/pdf') {
                  return file;
               } else {
                  return dic.texts.errors.type_invalid;
               }
            }
         })(),
      );
   }

   function imageInputHandler(e: ChangeEvent<HTMLInputElement>) {
      const file = e.target.files?.item(0);

      setFile(
         (() => {
            if (file) {
               if (file.size > 10000000) {
                  return dic.texts.errors.size_larger;
               } else if (file.type === 'application/pdf') {
                  return file;
               } else {
                  return dic.texts.errors.type_invalid;
               }
            }
         })(),
      );
   }

   useEffect(() => {
      dispatch(
         changeTitle({
            goBackRoute: clinicRoutes(slug).patient_profile_forms,
            value: `${dic.texts.flows.forms} / ${form.public_name}`,
         }),
      );
      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, [dic]);

   return (
      <>
         <SuccessModal isOpen={saved} />
         <CancelConfirmationModal
            route={clinicRoutes(slug).patient_profile_forms}
            isOpen={openWarning}
            setIsOpen={setOpenWarning}
         />
         <div className="grid gap-7 text-sm lg:text-base">
            <div className="flex w-full grid-cols-2 justify-between gap-10">
               <h2 className="min-w-max text-base font-semibold lg:text-2xl">
                  {dic.texts.flows.upload_file}
               </h2>
               <Button
                  className="flex !w-max items-center justify-center gap-2 !border-none !p-0 text-center"
                  variant={Variant.outlined}
                  onPress={() => downloadURI(form.url, form.file_name)}
               >
                  <DownloadRoundedIcon /> {dic.texts.flows.download_form}
               </Button>
            </div>
            <div>
               <InputPDF
                  dropHandler={dropHandler}
                  imageInputHandler={imageInputHandler}
                  inputFileRef={inputRef}
                  file={file}
                  clearFile={() => setFile(undefined)}
               >
                  <div className="grid gap-3 px-6 text-center">
                     <p className="text-base font-semibold text-black lg:text-lg">
                        {dic.components.upload_file_input.title}
                     </p>
                     <p>PDF, {dic.components.upload_file_input.disclaimer}</p>
                  </div>
               </InputPDF>
            </div>
            <div className="grid gap-x-5 gap-y-3 justify-self-end md:w-2/3 md:grid-cols-2">
               {savingError && (
                  <div className="col-span-2 w-full text-center text-error md:text-end">
                     {savingError}
                  </div>
               )}
               <Button
                  variant={Variant.secondary}
                  isDisabled={saving}
                  onPress={() => setOpenWarning(true)}
               >
                  {dic.texts.flows.cancel}
               </Button>
               <Button
                  onPress={save}
                  isDisabled={saving || !(file instanceof File)}
               >
                  {saving ? (
                     <>
                        {dic.texts.flows.loading}...
                        <RefreshRoundedIcon className="animate-spin" />
                     </>
                  ) : (
                     <>{dic.texts.flows.upload_file}</>
                  )}
               </Button>
            </div>
         </div>
      </>
   );
}

function SuccessModal({ isOpen }: { isOpen: boolean }) {
   const dic = useDictionary();

   const { slug } = useAppSelector(store => store.clinic);

   return (
      <ModalTrigger
         className="m-2 animate-appear text-sm sm:m-8 lg:text-base"
         isOpen={isOpen}
      >
         {() => (
            <Dialog className="flex  flex-col items-center gap-9 rounded-xl p-8 sm:p-14">
               <CheckCircleRoundedIcon className="!text-7xl text-primary lg:!text-8xl" />
               <div>
                  <h3 className="mb-3 text-center text-base lg:text-xl">
                     {
                        dic.pages.patient.profile.forms.uploaded_successfully
                           .title
                     }
                  </h3>
                  <p className="text-center  !font-normal text-on-background-text">
                     {
                        dic.pages.patient.profile.forms.uploaded_successfully
                           .description
                     }
                  </p>
               </div>
               <Button href={clinicRoutes(slug).patient_profile_forms}>
                  {dic.texts.flows.continue}
               </Button>
            </Dialog>
         )}
      </ModalTrigger>
   );
}
