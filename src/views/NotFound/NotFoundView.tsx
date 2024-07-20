import Image from 'next/image';

interface INotFoundView {}

export default function NotFoundView({}: INotFoundView) {
   return (
      <div className="absolute inset-0 flex w-full flex-col items-center justify-center gap-5 p-5 text-center text-sm lg:text-base">
         <div className="relative aspect-video w-full sm:w-2/3 xl:w-1/3">
            <Image
               alt="not found image"
               src="/not-found.png"
               fill
               className="object-contain"
            />
         </div>
         <h2 className="text-2xl font-semibold lg:text-3xl">Error 404</h2>
         <h3 className="text-base lg:text-lg">
            No pudimos encontrar tu página
         </h3>
         <p className="text-on-background-text">
            Parece que la página que estas buscando no existe o ha ocurrido un
            error con <br /> el servidor. Por favor intenta ingresar de nuevo
            más tarde
         </p>
      </div>
   );
}
