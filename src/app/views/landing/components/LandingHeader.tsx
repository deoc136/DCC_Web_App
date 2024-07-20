'use client';

import Button from '@/components/shared/Button';
import { MenuRounded } from '@mui/icons-material';
import { useMediaQuery } from '@mui/material';
import Image from 'next/image';
import { useEffect, useState } from 'react';

interface IHeader {}

export type Sections = 'BENEFITS' | 'AFFILIATES';

export default function LandingHeader({}: IHeader) {
   const [benefitsVisible, setBenefitsVisible] = useState(false);
   const [affiliateVisible, setAffiliateVisible] = useState(false);

   const [menuOpen, setMenuOpen] = useState(false);

   const isLg = useMediaQuery('(min-width:1024px)');

   useEffect(() => {
      isLg && setMenuOpen(false);
   }, [isLg]);

   useEffect(() => {
      const benefitSection = document.getElementById('benefits');
      const affiliateSection = document.getElementById('affiliates');

      const observer = new IntersectionObserver(
         entries => {
            entries.forEach(entry => {
               if (entry.isIntersecting) {
                  if (entry.target === benefitSection) {
                     setBenefitsVisible(true);
                  }

                  if (entry.target === affiliateSection) {
                     setAffiliateVisible(true);
                  }
               } else {
                  if (entry.target === benefitSection) {
                     setBenefitsVisible(false);
                  }

                  if (entry.target === affiliateSection) {
                     setAffiliateVisible(false);
                  }
               }
            });
         },
         {
            threshold: isLg ? 0.5 : 1,
         },
      );

      benefitSection && observer.observe(benefitSection);
      affiliateSection && observer.observe(affiliateSection);

      return () => {
         benefitSection && observer.unobserve(benefitSection);
         affiliateSection && observer.unobserve(affiliateSection);
      };
   }, [isLg]);

   return (
      <header className="sticky top-0 z-20 flex w-full items-center justify-between bg-foundation p-5 shadow-sm sm:px-12">
         {menuOpen && (
            <div className="absolute left-0 right-0 top-full z-50 rounded-b-xl bg-white shadow-xl lg:hidden">
               <Button
                  href="#benefits"
                  className="bg-transparent !px-5 !py-6 text-start !text-base !text-on-background-text"
               >
                  Beneficios
               </Button>
               <Button
                  href="#affiliates"
                  className="bg-transparent !px-5 !py-6 text-start !text-base !text-on-background-text"
               >
                  Nuestros afiliados
               </Button>
            </div>
         )}
         <div className="relative aspect-video w-20">
            <Image
               alt="agenda ahora logo"
               src="/agenda_ahora_logo.svg"
               fill
               className="object-contain"
            />
         </div>
         <div className="hidden w-max gap-5 lg:flex">
            <Button
               className={`!h-full w-max rounded-none border-b-4 border-transparent bg-transparent !py-3 font-normal !text-on-background-text !shadow-none ${
                  benefitsVisible &&
                  '!border-secondary font-semibold !text-secondary'
               }`}
               href="#benefits"
            >
               Beneficios
            </Button>
            <Button
               className={`!h-full w-max rounded-none border-b-4 border-transparent bg-transparent !py-3 font-normal !text-on-background-text !shadow-none ${
                  affiliateVisible &&
                  '!border-secondary font-semibold !text-secondary'
               }`}
               href="#affiliates"
            >
               Nuestros afiliados
            </Button>
         </div>
         <Button
            onPress={() => setMenuOpen(prev => !prev)}
            className="h-max w-max !bg-transparent !p-0 lg:hidden"
         >
            <MenuRounded
               className={`!fill-on-background !text-3xl ${
                  menuOpen && '!fill-secondary'
               }`}
            />
         </Button>
      </header>
   );
}
