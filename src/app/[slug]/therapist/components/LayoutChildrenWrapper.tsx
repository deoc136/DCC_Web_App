'use client';

import { clinicRoutes } from '@/lib/routes';
import { usePathname } from 'next/navigation';
import { ReactNode, useEffect, useState } from 'react';

interface ILayoutChildrenWrapper {
   children: ReactNode;
   slug: string;
}

export default function LayoutChildrenWrapper({
   children,
   slug,
}: ILayoutChildrenWrapper) {
   const [showCorner, setShowCorner] = useState(true);

   const pathname = usePathname();

   useEffect(() => {
      setShowCorner(
         !(
            pathname.includes(clinicRoutes(slug).therapist_appointments) &&
            !pathname.includes('details') &&
            !pathname.includes('clinic-history')
         ),
      );
   }, [pathname, slug]);

   return (
      <div
         className={`h-full max-w-[1920px] overflow-hidden ${
            showCorner ? 'bg-primary' : 'bg-white'
         }`}
      >
         <div className="relative h-full w-full overflow-auto rounded-tl-3xl bg-white p-5 lg:px-14 lg:pb-6 lg:pt-10">
            {children}
         </div>
      </div>
   );
}
