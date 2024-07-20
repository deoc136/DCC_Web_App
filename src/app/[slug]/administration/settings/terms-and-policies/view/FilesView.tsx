'use client';

import Button, { Variant } from '@/components/shared/Button';
import { clinicRoutes } from '@/lib/routes';
import { downloadURI } from '@/lib/utils';
import { Clinic } from '@/types/clinic';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import { useRouter } from 'next/navigation';
import { Fragment, useEffect, useState } from 'react';
import DownloadRoundedIcon from '@mui/icons-material/DownloadRounded';
import DeleteRoundedIcon from '@mui/icons-material/DeleteRounded';
import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded';
import { editClinic } from '@/services/clinic';
import { deleteFileById } from '@/services/files';

interface IFilesView {
   slug: string;
   termsAndConditions: IFile | null;
   clinicPolicies: IFile | null;
   servicePolicies: IFile | null;
   clinic: Clinic;
}

export default function FilesView({
   slug,
   clinicPolicies,
   servicePolicies,
   termsAndConditions,
   clinic,
}: IFilesView) {
   const router = useRouter();
   const [deletingId, setDeletingId] = useState<number>();

   useEffect(() => {
      setDeletingId(undefined);
   }, [clinicPolicies, servicePolicies, termsAndConditions]);

   return (
      <>
         <section className="grid grid-cols-2 gap-10">
            <h3 className="text-xl">Políticas y condiciones de la clínica</h3>
            <Button
               href={clinicRoutes(slug).admin_settings_terms_and_policies_edit}
               className="flex h-max !w-max items-center gap-2 justify-self-end !px-14"
            >
               <EditRoundedIcon className="!fill-white" />
               Editar
            </Button>
         </section>
         <section className="mt-10 grid gap-5 overflow-auto px-24">
            {(
               [
                  {
                     file: clinicPolicies,
                     title: 'Políticas de la clínica',
                     property: 'clinic_policies',
                  },
                  {
                     file: servicePolicies,
                     title: 'Términos y condiciones del servicio',
                     property: 'service_policies',
                  },
                  {
                     file: termsAndConditions,
                     title: 'Políticas de cancelación del servicio',
                     property: 'terms_and_conditions',
                  },
               ] as const
            ).map(({ file, title, property }, i) => (
               <Fragment key={i}>
                  <p className="font-semibold">{title}</p>
                  {file ? (
                     <div className="grid w-full grid-cols-[2fr_1fr_auto] items-center gap-5">
                        <div className="max-w-[80%] truncate">
                           {file.file_name}
                        </div>
                        <Button
                           onPress={() => downloadURI(file.url, file.file_name)}
                           variant={Variant.outlined}
                           className="flex items-center justify-center gap-2"
                           isDisabled={deletingId === file.id}
                        >
                           <DownloadRoundedIcon />
                           Descargar
                        </Button>
                        <Button
                           isDisabled={deletingId === file.id}
                           onPress={async () => {
                              setDeletingId(file.id);
                              await editClinic({
                                 ...clinic,
                                 [property]: null,
                              });
                              await deleteFileById(file.id);
                              router.refresh();
                           }}
                           variant={Variant.outlined}
                           className="!w-max"
                        >
                           {deletingId === file.id ? (
                              <RefreshRoundedIcon className="animate-spin !fill-secondary" />
                           ) : (
                              <DeleteRoundedIcon className="!fill-secondary" />
                           )}
                        </Button>
                     </div>
                  ) : (
                     <>
                        <p className="text-on-background-text">
                           No se ha agregado ningún archivo.
                        </p>
                     </>
                  )}
               </Fragment>
            ))}
            <p className="mt-2">
               El paciente podrá cancelar la cita hasta{' '}
               {clinic.cancelation_hours}:00 horas antes de la cita programada.
            </p>
         </section>
      </>
   );
}
