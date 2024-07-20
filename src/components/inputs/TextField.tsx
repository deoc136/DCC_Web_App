'use client';

import VisibilityRoundedIcon from '@mui/icons-material/Visibility';
import VisibilityOffRoundedIcon from '@mui/icons-material/VisibilityOff';
import { useRef, useState } from 'react';
import { AriaTextFieldProps, useButton, useTextField } from 'react-aria';

interface ITextField extends AriaTextFieldProps {
   className?: string;
   startIcon?: React.ReactNode;
   endIcon?: React.ReactNode;
   iconAction?: () => any;
   isTextArea?: boolean;
   rows?: number;
}

export default function TextField({
   className,
   iconAction,
   startIcon,
   endIcon,
   rows,
   isTextArea = false,
   ...props
}: ITextField) {
   const { label, description, errorMessage, placeholder } = props;

   const [visible, setVisible] = useState(false);

   const ref = useRef<HTMLInputElement | HTMLTextAreaElement>(null);

   const { labelProps, inputProps, descriptionProps, errorMessageProps } =
      useTextField(
         { ...props, inputElementType: isTextArea ? 'textarea' : 'input' },
         ref,
      );

   const isPassword = props.type === 'password';

   return (
      <div>
         <div className="flex flex-col ">
            {props.label && (
               <label
                  className="mb-2 text-sm text-on-background-text label lg:text-base"
                  {...labelProps}
               >
                  {label}
               </label>
            )}
            <div className="flex items-stretch">
               {startIcon && (
                  <span
                     {...labelProps}
                     onClick={iconAction}
                     className="flex items-center rounded-l-md bg-foundation px-4"
                  >
                     {startIcon}
                  </span>
               )}
               {isTextArea ? (
                  <textarea
                     rows={rows}
                     className={`${
                        props.isDisabled && 'opacity-40'
                     } placeholder:text-placeholder w-full rounded-md bg-foundation text-sm p-basic lg:text-base ${className}`}
                     {...inputProps}
                     //@ts-ignore
                     ref={ref}
                  />
               ) : (
                  <input
                     placeholder={placeholder}
                     className={`${
                        props.isDisabled && 'opacity-40'
                     } placeholder:text-placeholder w-full rounded-md bg-foundation text-sm p-basic lg:text-base ${
                        (isPassword || endIcon) && 'rounded-r-none'
                     }
                  ${startIcon && 'rounded-l-none'}
                  ${className}`}
                     {...inputProps}
                     //@ts-ignore
                     ref={ref}
                     type={
                        isPassword
                           ? visible
                              ? 'text'
                              : 'password'
                           : props.type
                     }
                  />
               )}
               {endIcon && (
                  <span
                     {...labelProps}
                     onClick={iconAction}
                     className="flex items-center rounded-r-md bg-foundation px-4"
                  >
                     {endIcon}
                  </span>
               )}
               {isPassword && (
                  <button
                     onClick={() => setVisible(prev => !prev)}
                     className="rounded-r-md bg-foundation px-3 text-on-background-text"
                  >
                     {visible ? (
                        <VisibilityOffRoundedIcon height={24} />
                     ) : (
                        <VisibilityRoundedIcon height={24} />
                     )}
                  </button>
               )}
            </div>
         </div>
         {description && (
            <div className="mt-2" {...descriptionProps}>
               {description}
            </div>
         )}
         {errorMessage && (
            <div className="mt-4 text-error" {...errorMessageProps}>
               {errorMessage}
            </div>
         )}
      </div>
   );
}
