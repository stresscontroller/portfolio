export interface AzureB2CUser {
    homeAccountId: string;
    environment: string;
    tenantId: string;
    username: string;
    localAccountId: string;
    name: string;
    idTokenClaims: {
        ver: string;
        iss: string;
        sub: string;
        aud: string;
        exp: number;
        iat: number;
        auth_time: number;
        idp: string;
        oid: string;
        given_name: string;
        family_name: string;
        name: string;
        newUser: boolean;
        emails: string[];
        tfp: string;
        at_hash: string;
        nbf: number;
    };
}
