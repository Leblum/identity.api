import { mongoose } from '../config/database';
import { Schema, Model, Document, model } from 'mongoose';
import { IUser } from './user';
import { IBaseModel } from "./index";
import { SupplierType, EnumHelper } from "../enumerations";
import { IAddress } from "./address";

export interface IOrganization extends IBaseModel {
    name: string,
    phone: string,
    type: SupplierType,
    owner: IUser,
    primaryContact: IUser,
    businessAddress: IAddress,
    pickupAddress: IAddress,
    contacts: Array<IUser>,
    href: string,
}

const OrganizationSchema = new Schema({
    name: {type: String, required: true},
    phone: {type: String, required: true},
    type: { type: Number, enum: [EnumHelper.getValuesFromEnum(SupplierType)] },
    owner: { type : Schema.Types.ObjectId, ref: 'user' },
    primaryContact: { type : Schema.Types.ObjectId, ref: 'user' },
    businessAddress: { type : Schema.Types.ObjectId, ref: 'address' },
    pickupAddress: { type : Schema.Types.ObjectId, ref: 'address' },
    contacts: [{ type : Schema.Types.ObjectId, ref: 'user' }],
    href: {type:String},
},{timestamps:true});

//If you do any pre save methods, and you use fat arrow syntax 'this' doesn't refer to the document.
OrganizationSchema.pre('save',function(next){
    //If there's any validators, this field requires validation.
    next();
});

// This will compile the schema for the object, and place it in this Instance.
export const Organization = mongoose.model<IOrganization>('organization', OrganizationSchema);