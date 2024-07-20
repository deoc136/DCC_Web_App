import { useEffect, useRef } from 'react';

export default function useTimeout(callback: () => any, delay: number) {
   const timeoutRef = useRef<NodeJS.Timeout>();

   useEffect(() => {
      timeoutRef.current = setTimeout(callback, delay);

      return () => {
         clearTimeout(timeoutRef.current);
      };
   }, [callback, delay]);

   const resetTimeout = () => {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(callback, delay);
   };

   return resetTimeout;
}
