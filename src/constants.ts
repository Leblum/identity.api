export const CONST = {
    ep: {
        API: '/api',
        V1: '/v1',
        AUTHENTICATION: '/authenticate',
        API_DOCS: '/api-docs',
        API_SWAGGER_DEF: '/swagger-definition',
        PERMISSIONS: '/permissions',
        ROLES: '/roles',
        USERS: '/users',
        ORGANIZATIONS: '/organizations',
        REGISTER: '/register',
    },
    LEBLUM_API_Q_BACKPLANE: 'leblum-api-q-backplane',
    APPLICATION_NAME: "leblum.identity.api",
    REQUEST_TOKEN_LOCATION: 'api-decoded-token',
    SALT_ROUNDS: 10,
    ErrorCodes: {
        EMAIL_TAKEN: 'EmailAlreadyTaken',
        PASSWORD_FAILED_CHECKS: 'PasswordFailedChecks',
    }
}