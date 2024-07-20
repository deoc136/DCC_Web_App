'use client';

import Button, { Variant } from '@/components/shared/Button';
import PasswordFormModal from '@/components/shared/modals/PasswordFormModal';
import { User } from '@/types/user';
import Image from 'next/image';
import { useState } from 'react';
import CreateIcon from '@mui/icons-material/CreateRounded';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import { clinicRoutes } from '@/lib/routes';
import { useRouter } from 'next/navigation';
import CircleRoundedIcon from '@mui/icons-material/Circle';
import CircleOutlinedRoundedIcon from '@mui/icons-material/CircleOutlined';

interface IProfileSettingsOverview {
   user: User;
   slug: string;
}

export default function ProfileSettingsOverview({
   user,
   slug,
}: IProfileSettingsOverview) {
   const router = useRouter();

   const [openChangePassword, setOpenChangePassword] = useState(false);

   return (
      <>
         <PasswordFormModal
            isOpen={openChangePassword}
            setIsOpen={setOpenChangePassword}
         />
         <div className="my-12 grid grid-cols-[1fr_3fr] gap-14">
            <div className="mx-10 flex flex-col items-center">
               <div className="relative mb-10 aspect-square w-full">
                  <Image
                     src={
                        user.profile_picture.length
                           ? user.profile_picture
                           : '/default_profile_picture.svg'
                     }
                     className="rounded-full object-cover object-center"
                     alt="user image"
                     fill
                  />
               </div>
               <h2 className="text-center text-lg font-semibold">
                  {user.names} {user.last_names}
               </h2>
               <h3 className="my-3 text-base text-on-background-text">
                  Administrador
               </h3>
               <div className="flex items-center gap-2">
                  {user.enabled ? (
                     <>
                        <CircleRoundedIcon className="!fill-success" />
                        Activo
                     </>
                  ) : (
                     <>
                        <CircleOutlinedRoundedIcon />
                        Inactivo
                     </>
                  )}
               </div>
            </div>
            <div className="grid h-max gap-10">
               <div className="flex items-center justify-between">
                  <h3 className="text-xl">Información general</h3>
                  <Button
                     href={clinicRoutes(slug).admin_settings_profile_edit}
                     className="flex h-max !w-max items-center gap-2 justify-self-end !px-14"
                  >
                     <EditRoundedIcon className="!fill-white" /> Editar
                  </Button>
               </div>
               <section className="grid grid-cols-2 gap-10">
                  <div>
                     <p className="mb-2 font-semibold">Correo electrónico</p>
                     <p className="text-on-background-text">{user.email}</p>
                  </div>
                  <div>
                     <p className="mb-2 font-semibold">Número de Teléfono</p>
                     <p className="text-on-background-text">{user.phone}</p>
                  </div>
                  <div className="col-span-2">
                     <p className="mb-2 font-semibold">
                        Dirección de residencia
                     </p>
                     <p className="break-words text-on-background-text">
                        {user.address.length
                           ? user.address
                           : 'No hay una establecida todavía'}
                     </p>
                  </div>
               </section>
               <h3 className="text-xl">Ingreso y seguridad</h3>
               <section className="grid grid-cols-[2fr_1fr] items-center">
                  <h3 className="text-lg font-semibold">
                     Contraseña de ingreso
                  </h3>
                  <Button
                     variant={Variant.secondary}
                     onPress={() => setOpenChangePassword(true)}
                     className="ml-auto flex items-center justify-center gap-2"
                  >
                     <CreateIcon />
                     Cambiar contraseña
                  </Button>
               </section>
            </div>
         </div>
      </>
   );
}
