export const Constants = {
    API_ENDPOINT: '/api',
    API_VERSION_1: '/v1',
    AUTHENTICATION_ENDPOINT: '/authenticate',
    API_DOCS_ENDPOINT: '/api-docs',
    API_SWAGGER_DEF_ENDPOINT: '/swagger-definition',
    PERMISSION_ENDPOINT: '/permissions',
    ROLES_ENDPOINT: '/roles',
    USERs_ENDPOINT: '/users',
    ORGANIZATION_ENDPOINT: '/organizations',
    LEBLUM_API_Q_BACKPLANE: 'leblum-api-q-backplane',
    APPLICATION_NAME: "leblum.identity.api",
    REQUEST_TOKEN_LOCATION: 'api-decoded-token',
    SALT_ROUNDS: 10,
    ErrorCodes:{
        EMAIL_TAKEN: 'EmailAlreadyTaken',
        PASSWORD_FAILED_CHECKS: 'PasswordFailedChecks',
    }
}