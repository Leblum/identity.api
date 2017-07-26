import { IRole } from './role';

export interface ITokenPayload {
    userId: any,
    roles: string[],
    expiration: string
}