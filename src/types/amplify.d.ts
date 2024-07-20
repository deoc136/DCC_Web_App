export interface IAmplifyError {
   name: string;
   code: string;
   message: string;
}

export interface CognitoUser {
   username: string;
   pool: Pool;
   Session: null;
   client: Client;
   signInUserSession: SignInUserSession;
   authenticationFlowType: string;
   storage: Storage;
   keyPrefix: string;
   userDataKey: string;
   attributes: Attributes;
   preferredMFA: string;
}

export interface Attributes {
   sub: string;
   email_verified: boolean;
   email: string;
}

export interface Client {
   endpoint: string;
   fetchOptions: FetchOptions;
}

export interface FetchOptions {}

export interface Pool {
   userPoolId: string;
   clientId: string;
   client: Client;
   advancedSecurityDataCollectionFlag: boolean;
   storage: Storage;
}

export interface Storage {
   domain: string;
   path: string;
   expires: number;
   secure: boolean;
   sameSite: null;
}

export interface SignInUserSession {
   idToken: IDToken;
   refreshToken: RefreshToken;
   accessToken: AccessToken;
   clockDrift: number;
}

export interface AccessToken {
   jwtToken: string;
   payload: AccessTokenPayload;
}

export interface AccessTokenPayload {
   sub: string;
   iss: string;
   client_id: string;
   origin_jti: string;
   event_id: string;
   token_use: string;
   scope: string;
   auth_time: number;
   exp: number;
   iat: number;
   jti: string;
   username: string;
}

export interface IDToken {
   jwtToken: string;
   payload: IDTokenPayload;
}

export interface IDTokenPayload {
   sub: string;
   email_verified: boolean;
   iss: string;
   'cognito:username': string;
   origin_jti: string;
   aud: string;
   event_id: string;
   token_use: string;
   auth_time: number;
   exp: number;
   iat: number;
   jti: string;
   email: string;
}

export interface RefreshToken {
   token: string;
}
