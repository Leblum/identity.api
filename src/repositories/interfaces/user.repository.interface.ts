import { IUser } from "../../models/index";
import { BaseRepository } from "../base/base.repository";
import { Model } from "mongoose";
import { IBaseRepository } from "../index";

export interface IUserRepository extends IBaseRepository<IUser>{
    getUserForPasswordCheck(email: string): Promise<IUser>;
    updatePassword(id: string, hashedPassword: string): Promise<IUser>;
    findUserByEmail(email: string): Promise<IUser>;
}