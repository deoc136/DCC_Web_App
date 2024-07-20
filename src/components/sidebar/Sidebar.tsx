'use client';

import Image from 'next/image';
import { ReactNode, useRef, useState, useEffect, ReactElement } from 'react';
import {
   mergeProps,
   useFocusRing,
   useListBox,
   useListBoxSection,
   useOption,
   usePress,
} from 'react-aria';
import { ListProps, ListState, Node, useListState } from 'react-stately';
import SidebarButton from './SidebarButton';
import { usePathname, useRouter } from 'next/navigation';
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded';

type RoundedIcon = (props: any) => ReactNode;

interface ISidebar extends ListProps<object> {
   icons?: (RoundedIcon | undefined | (RoundedIcon | undefined)[])[];
   signOutButton?: ReactElement;
   imageSrc?: string;
   className?: string;
   noImage?: boolean;
}

export default function Sidebar({
   icons = [],
   signOutButton,
   imageSrc,
   className,
   noImage,
   ...props
}: ISidebar) {
   const state = useListState(props);

   const ref = useRef(null);

   const { listBoxProps } = useListBox(
      { ...props, 'aria-label': 'Sidebar' },
      state,
      ref,
   );

   return (
      <div
         className={`sticky top-0 grid h-screen w-[18rem] flex-none grid-rows-[auto_1fr_auto] bg-foundation px-4 pb-10 pt-16 text-sm text-on-background-text sm:text-base ${
            noImage && 'grid-rows-[1fr_auto]'
         } ${className}`}
      >
         {!noImage && (
            <div className="relative m-auto mb-16 aspect-video max-h-28 w-[calc(100%-60px)] px-7 no-scrollbar">
               <Image
                  src={`${imageSrc ? imageSrc : '/agenda_ahora_logo.png'}`}
                  alt="logo"
                  fill
                  className="object-contain"
               />
            </div>
         )}
         <ul
            {...listBoxProps}
            ref={ref}
            className="flex w-full flex-col gap-2 overflow-auto pt-4"
         >
            {Array.from(state.collection).map((item, i) =>
               item.type === 'section' ? (
                  <>
                     <ListBoxSection
                        key={item.key}
                        icons={
                           icons.at(i)
                              ? Array.isArray(icons.at(i))
                                 ? (icons.at(i) as RoundedIcon[])
                                 : undefined
                              : undefined
                        }
                        section={item}
                        state={state}
                        index={i}
                     />
                     <hr
                        role="none"
                        className="mx-2 border-on-background-text"
                     />
                  </>
               ) : (
                  <Option
                     key={item.key}
                     item={item}
                     RoundedIcon={
                        icons.at(i)
                           ? Array.isArray(icons.at(i))
                              ? undefined
                              : (icons.at(i) as RoundedIcon)
                           : undefined
                     }
                     state={state}
                  />
               ),
            )}
         </ul>
         {signOutButton && signOutButton}
      </div>
   );
}

interface IListBoxSection {
   section: Node<object>;
   state: ListState<object>;
   icons?: (RoundedIcon | undefined)[];
   index: number;
}

function ListBoxSection({ icons, section, state, index }: IListBoxSection) {
   const { itemProps, headingProps, groupProps } = useListBoxSection({
      heading: section.rendered,
      'aria-label': section['aria-label'],
   });

   const [isClose, setIsClose] = useState(true);

   return (
      <>
         <li {...itemProps} className="mx-2">
            {section.rendered && (
               <SidebarButton
                  role="option"
                  className={`hover:bg-dark-gray justify-between gap-x-4 rounded-lg`}
                  onPress={() => setIsClose(prev => !prev)}
               >
                  <div
                     {...headingProps}
                     className="flex items-center gap-4 font-semibold"
                  >
                     <span>{section.rendered}</span>
                  </div>
                  <ChevronRightRoundedIcon
                     className={`box-content py-[.4rem] transition ${
                        !isClose && '!rotate-90 !fill-secondary'
                     }`}
                     height={16}
                  />
               </SidebarButton>
            )}
            {!isClose && (
               <ul className="grid gap-2" {...groupProps}>
                  {Array.from(section.childNodes).map((node, i) => (
                     <Option
                        key={node.key}
                        RoundedIcon={icons?.at(i)}
                        item={node}
                        state={state}
                     />
                  ))}
               </ul>
            )}
         </li>
      </>
   );
}

interface IOption {
   item: Node<object>;
   state: ListState<object>;
   RoundedIcon?: RoundedIcon;
}

function Option({ item, state, RoundedIcon }: IOption) {
   const router = useRouter();

   const pathname = usePathname();

   const ref = useRef(null);
   const { optionProps, isSelected, isDisabled } = useOption(
      { key: item.key },
      state,
      ref,
   );

   const { pressProps } = usePress({
      onPress: () => item.props.textValue && router.push(item.textValue),
   });

   const [match, setMatch] = useState(false);

   useEffect(() => {
      if (pathname.includes(item.textValue)) {
         setMatch(true);
      } else {
         setMatch(false);
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, [pathname]);

   const { focusProps } = useFocusRing();

   return (
      <li
         {...mergeProps(optionProps, focusProps, pressProps)}
         ref={ref}
         aria-labelledby={item.props.textValue ?? 'sidebar item'}
         aria-describedby={item.props.textValue ?? 'sidebar item'}
         className={`
         mx-2 rounded-lg
         ${!isSelected && 'hover:bg-primary-100'}
         ${isDisabled ? 'bg-disabled' : 'cursor-pointer '}
         ${match && 'bg-white text-black shadow-lg'}
         `}
      >
         <SidebarButton href={item.props.textValue && item.textValue}>
            <span className="flex w-full items-center justify-start gap-4 text-start font-semibold">
               {RoundedIcon && (
                  <RoundedIcon
                     className={`box-content py-[.4rem] ${
                        match && 'rounded-full bg-primary px-[.4rem] text-white'
                     }`}
                     height={16}
                  />
               )}{' '}
               {item.rendered}
            </span>
         </SidebarButton>
      </li>
   );
}
