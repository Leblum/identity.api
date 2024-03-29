import { mongoose } from '../config/database/database';
import { Schema, Model, Document, model } from 'mongoose';
import { IRole } from './role';
import { IBaseModel, IBaseModelDoc } from "./index";
import * as enums from '../enumerations';


export interface IUser extends IBaseModel {
    ownerships?: {
        ownerId: string,
        ownershipType: enums.OwnershipType
    }[],
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
    pushTokens?: Array<string>;
}

export interface IUserDoc extends IUser, IBaseModelDoc {

}

const UserSchema = new Schema({
    ownerships: [{
        _id: { auto: false },
        ownerId:  { type: Schema.Types.ObjectId },
        ownershipType: { type: Number, enum: [enums.EnumHelper.getValuesFromEnum(enums.OwnershipType)] },
    }],
    firstName: {type: String, required: false},
    lastName: {type: String, required: false},
    email: {type:String, unique:true},
    phone: {type:String},
    password: {type: String, required: true, select: false},
    isTokenExpired: {type : Boolean, required: true, default: false},
    isEmailVerified: {type : Boolean, required: true, default: false},
    href: {type:String},
    organizationId: { type : Schema.Types.ObjectId, ref: 'organization' },
    roles: [{ type : Schema.Types.ObjectId, ref: 'role' }],
    isActive: {type: Boolean, required: true, default: true},
    pushTokens: [{type: String}]
},{timestamps:true});

//If you do any pre save methods, and you use fat arrow syntax 'this' doesn't refer to the document.
UserSchema.pre('save',function(next){
    //If there's any validators, this field requires validation.
    next();
});

// This will compile the schema for the object, and place it in this Instance.
export const User = mongoose.model<IUserDoc>('user', UserSchema);