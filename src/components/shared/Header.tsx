interface IHeader {
   children: React.ReactNode;
}

export default function Header({ children }: IHeader) {
   return (
      <header className="relative hidden w-full bg-primary bg-waves bg-right bg-no-repeat px-14 py-5 xl:block">
         {children}
      </header>
   );
}
