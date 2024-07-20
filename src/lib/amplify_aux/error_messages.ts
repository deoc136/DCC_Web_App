import { IAmplifyError } from '@/types/amplify';

const general_errors = {
   NotAuthorizedException: 'Credenciales invalidas.',
   UserNotConfirmedException: 'El usuario no ha sido activado.',
   CodeMismatchException: 'El código ingresado es invalido.',
   UsernameExistsException: 'Ya existe un usuario con el email asignado.',
   ExpiredCodeException:
      'El código ha expirado, ya fue utilizado o es inválido.',
   LimitExceededException:
      'Limite de intentos excedido, intenta de nuevo después.',
};

type error_context = 'general' | 'activate-account';

const activate_account_errors = {
   NotAuthorizedException: 'La cuenta ya está activa.',
};

const errors: { [T in error_context]: Object } = {
   'activate-account': activate_account_errors,
   general: general_errors,
};

export function translateError(
   error: IAmplifyError,
   context: error_context = 'general',
) {
   if (!error.message) {
      return 'Error inesperado';
   }

   if (error.code) {
      const translation =
         (errors[context] as any)[error.code] ??
         (errors.general as any)[error.code];
      if (translation) {
         return translation as string;
      } else {
         return error.message;
      }
   } else {
      return error.message;
   }
}
