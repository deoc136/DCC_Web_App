'use client';

import Button from '@/components/shared/Button';
import { useAppSelector } from '@/lib/hooks/redux-hooks';
import { clinicRoutes } from '@/lib/routes';
import Image from 'next/image';
import Link from 'next/link';

interface IMessageView {}

export default function MessageView({}: IMessageView) {
   const clinic = useAppSelector(store => store.clinic);

   return (
      <div className="grid h-full grid-rows-[auto_1fr_auto] text-sm">
         <div className="relative aspect-video w-36">
            <Image
               alt="clinic logo"
               src={clinic.profile_picture_url}
               className="object-contain object-center"
               fill
            />
         </div>
         <div className="flex flex-col items-center justify-center gap-5 text-on-background-text">
            <div className="relative aspect-square h-max w-full max-w-[12rem]">
               <Image
                  alt="send image icon"
                  src="/email_sent_image.png"
                  className="object-contain object-center"
                  fill
               />
            </div>

            <h1 className="text-xl font-semibold text-black">
               Verifica tu correo
            </h1>
            <p>
               Ingresa a tu correo y sigue las indicaciones para activar tu
               cuenta.
            </p>
            <p>
               Si tu correo no se encuentra en la bandeja de inbox, no olvides
               chequear también tu bandeja de spam.
            </p>
         </div>
         <div className="grid gap-3">
            <Button>Reenviar correo</Button>
            <p className="text-center font-semibold text-on-background-text">
               Volver a{' '}
               <Link
                  className="inline text-secondary"
                  href={clinicRoutes(clinic.slug).login}
               >
                  Inicio de sesión
               </Link>
            </p>
         </div>
      </div>
   );
}
