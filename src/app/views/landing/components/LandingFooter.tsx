'use client';

import Image from 'next/image';

interface ILandingFooter {}

export default function LandingFooter({}: ILandingFooter) {
   return (
      <footer className="relative z-10 grid w-full gap-x-24 gap-y-9 bg-foundation p-12 xl:grid-cols-[auto_1fr]">
         <div className="relative aspect-video w-28">
            <Image
               alt="agenda ahora logo"
               src="/agenda_ahora_logo.svg"
               fill
               className="object-contain"
            />
         </div>
         <div className="grid gap-4">
            <p className="font-semibold">Contacto</p>
            <div className="flex flex-wrap items-end justify-between gap-6 text-sm">
               <div>
                  <p className="mb-1 font-semibold">Oficina Bogotá</p>
                  <p className="text-on-background-text">
                     Carrera 7 No. 27 - 52 Oficina 601
                  </p>
               </div>
               <div>
                  <p className="mb-1 font-semibold">Teléfono</p>
                  <p className="text-on-background-text">+57 302 545 5539</p>
               </div>
               <div>
                  <p className="mb-1 font-semibold">Correo de contacto</p>
                  <p className="text-on-background-text">
                     Comercial@doublevpartners.com
                  </p>
               </div>
               <p className="text-on-background-text">
                  Copyright © 2024 Agenda Ahora
               </p>
            </div>
         </div>
      </footer>
   );
}
