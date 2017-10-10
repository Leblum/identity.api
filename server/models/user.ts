import { mongoose } from '../config/database/database';
import { Schema, Model, Document, model } from 'mongoose';
import { IRole } from './role';
import { IBaseModel, IBaseModelDoc } from "./index";


export interface IUser extends IBaseModel {
    firstName?: string,
    lastName?: string,
    password: string;
    email: string;
    phone?:string;
    roles?: Array<IRole>;
    organizationId: string;
    href?: string;
    // This will be set to true whenever a user changes their password / or we require them to login again
    // This is used by the authentication controller to revoke the renewal of a token.  
    isTokenExpired: boolean; 
    isEmailVerified: boolean;
    isActive: boolean;
    createdAt?: Date; //Automatically created by mongoose.
    modifiedAt?: Date; //Automatically created by mongoose.
}

export interface IUserDoc extends IUser, IBaseModelDoc {

}

const UserSchema = new Schema({
    firstName: {type: String, required: false},
    lastName: {type: String, required: false},
    email: {type:String, unique:true},
    phone: {type:String, unique:true},
    password: {type: String, required: true, select: false},
    isTokenExpired: {type : Boolean, required: true, default: false},
    isEmailVerified: {type : Boolean, required: true, default: false},
    href: {type:String},
    organizationId: { type : Schema.Types.ObjectId, ref: 'organization' },
    roles: [{ type : Schema.Types.ObjectId, ref: 'role' }],
    isActive: {type: Boolean, required: true, default: true}
},{timestamps:true});

//If you do any pre save methods, and you use fat arrow syntax 'this' doesn't refer to the document.
UserSchema.pre('save',function(next){
    //If there's any validators, this field requires validation.
    next();
});

// This will compile the schema for the object, and place it in this Instance.
export const User = mongoose.model<IUserDoc>('user', UserSchema);