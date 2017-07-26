import { mongoose } from '../config/database';
import { Schema, Model, Document } from 'mongoose';
import { IPermission, PermissionSchema } from './permission';
import { IBaseModel } from "./index";

export interface IRole extends IBaseModel  {
    name: string;
    description: string;
    permissions: Array<IPermission>;
    href: string;
    createdAt?: Date; //Automatically created by mongoose.
    modifiedAt?: Date; //Automatically created by mongoose.
}

const RoleSchema = new Schema({
    name: {type: String},
    description: {type: String},
    href: {type: String},
    permissions: [{type: Schema.Types.ObjectId, ref: 'permission'}]
},{timestamps:true});

//If you do any pre save methods, and you use fat arrow syntax 'this' doesn't refer to the document.
RoleSchema.pre('save',function(next){
    //If there's any validators, this field requires validation.
    next();
});

export const Role = mongoose.model<IRole>('role', RoleSchema);