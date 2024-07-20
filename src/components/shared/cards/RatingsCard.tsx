'use client';

import Rating from '@/components/shared/Rating';
import Card from '@/components/shared/cards/Card';

interface IRatingsCard {
   quality: number | null;
   kindness: number | null;
   punctuality: number | null;
   knowledge: number | null;
}

export default function RatingsCard({
   kindness,
   knowledge,
   punctuality,
   quality,
}: IRatingsCard) {
   const dummyCategories = [
      {
         label: 'Servicio',
         rating: quality,
      },
      {
         label: 'Puntualidad',
         rating: punctuality,
      },
      {
         label: 'Amabilidad',
         rating: kindness,
      },
      {
         label: 'Conocimiento',
         rating: knowledge,
      },
   ];

   return (
      <Card isShadowed>
         <div className="grid sm:grid-cols-2 gap-5">
            {dummyCategories.map((category, i) => (
               <Rating key={i} {...category} />
            ))}
         </div>
      </Card>
   );
}
