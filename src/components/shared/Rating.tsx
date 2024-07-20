'use client';

import StarRoundedIcon from '@mui/icons-material/StarRounded';
import StarHalfRounded from '@mui/icons-material/StarHalfRounded';

interface IRating {
   label: string;
   rating: number | null;
}

export default function Rating({ label, rating }: IRating) {
   const flatRating = Math.floor(rating === null ? 5 : rating);

   return (
      <div className="grid grid-cols-2 sm:grid-cols-1">
         <p className="mb-2 sm:font-semibold">{label}</p>
         <div className="relative">
            <p className="relative z-10 text-star">
               {Array.from({ length: flatRating }).map((_, i) => (
                  <StarRoundedIcon
                     key={i}
                     className={`${rating === null && '!invisible'}`}
                  />
               ))}
               {rating !== null && rating - flatRating > 0 && (
                  <StarHalfRounded />
               )}
            </p>
            <p className="absolute top-0 z-0 !text-on-background-disabled">
               {Array.from({ length: 5 }).map((_, i) => (
                  <StarRoundedIcon key={i} />
               ))}
            </p>
         </div>
      </div>
   );
}
