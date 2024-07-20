'use client';

import useDictionary from '@/lib/hooks/useDictionary';
import { ArrowForward, ArrowBack } from '@mui/icons-material';
import { Pagination as Pag } from 'react-headless-pagination';

interface IPagination {
   page: number;
   setPage: React.Dispatch<React.SetStateAction<number>>;
   totalPages: number;
}

export default function Pagination({ page, setPage, totalPages }: IPagination) {
   const dic = useDictionary();

   return (
      <Pag
         edgePageCount={1}
         middlePagesSiblingCount={1}
         totalPages={totalPages}
         currentPage={page}
         setCurrentPage={setPage}
         className="flex justify-between font-semibold "
         truncableText="..."
         truncableClassName=""
      >
         <Pag.PrevButton className="flex items-center gap-1 disabled:text-on-background-disabled">
            <ArrowBack className="text-lg" />
            <span className="hidden sm:block">
               {dic.texts.flows.previous}
            </span>
         </Pag.PrevButton>

         <nav className="flex flex-grow justify-center font-normal">
            <ul className="flex items-center gap-2">
               <Pag.PageButton
                  as={<button />}
                  aria-label="page button"
                  activeClassName="bg-primary"
                  className="flex aspect-square h-10 flex-none cursor-pointer items-center justify-center rounded px-2"
               />
            </ul>
         </nav>

         <Pag.NextButton className="flex items-center gap-1 disabled:text-on-background-disabled">
            <span className="hidden sm:block">
               {dic.texts.flows.next}
            </span>
            <ArrowForward className="text-lg" />
         </Pag.NextButton>
      </Pag>
   );
}
