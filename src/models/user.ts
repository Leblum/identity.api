import { mongoose } from '../config/database';
import { Schema, Model, Document, model } from 'mongoose';
import { IRole } from './role';
import { IBaseModel } from "./index";

export interface IUser extends IBaseModel {
    firstName: string,
    lastName: string,
    phone: string,
    username: string;
    passwordHash: string;
    email: string;
    roles?: Array<IRole>;
    href?: string;
    // This will be set to true whenever a user changes their password / or we require them to login again
    // This is used by the authentication controller to revoke the renewal of a token.  
    isTokenExpired: boolean; 
    createdAt?: Date; //Automatically created by mongoose.
    modifiedAt?: Date; //Automatically created by mongoose.
}

const UserSchema = new Schema({
    firstName: {type: String, required: true},
    lastName: {type: String, required: true},
    phone: {type: String, required: false},
    username: {
        type: String, 
        unique:true,
        trim:true,
        required:true
    },
    email: {type:String, unique:true},
    passwordHash: {type: String, required: true, select: false},
    isTokenExpired: {type : Boolean, required: true, default: true},
    href: {type:String},
    roles: [{ type : Schema.Types.ObjectId, ref: 'role' }]
},{timestamps:true});

//If you do any pre save methods, and you use fat arrow syntax 'this' doesn't refer to the document.
UserSchema.pre('save',function(next){
    //If there's any validators, this field requires validation.
    next();
});

// This will compile the schema for the object, and place it in this Instance.
export const User = mongoose.model<IUser>('user', UserSchema);