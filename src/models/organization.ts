import { mongoose } from '../config/database/database';
import { Schema, Model, Document, model } from 'mongoose';
import { IUser } from './user';
import { IBaseModel } from "./index";
import { EnumHelper, OrganizationType } from "../enumerations";

export interface IOrganization extends IBaseModel {
    name: string,
    type: OrganizationType,
    isSystem: boolean;
    users?: Array<IUser>;
    href: string,
}

const OrganizationSchema = new Schema({
    name: {type: String, required: true},
    type: { type: Number, enum: [EnumHelper.getValuesFromEnum(OrganizationType)] },
    isSystem: {type: Boolean, required: true},
    users: [{ type : Schema.Types.ObjectId, ref: 'user' }],
    href: {type:String},
},{timestamps:true});

//If you do any pre save methods, and you use fat arrow syntax 'this' doesn't refer to the document.
OrganizationSchema.pre('save',function(next){
    //If there's any validators, this field requires validation.
    next();
});

// This will compile the schema for the object, and place it in this Instance.
export const Organization = mongoose.model<IOrganization>('organization', OrganizationSchema);