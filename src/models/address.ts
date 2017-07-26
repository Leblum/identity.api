import { mongoose } from '../config/database';
import { Schema, Model, Document, model } from 'mongoose';
import { IBaseModel } from "./index";
import { AddressType, EnumHelper } from "../enumerations";

export interface IAddress extends IBaseModel {
    address1: string,
    address2: string,
    suite: string
    city: string,
    state: string,
    zip: string,
    plus4: number,
    type: AddressType,
    href: string,
}

const AddressSchema = new Schema({
    address1: {type: String, required: true},
    address2: {type: String, required: false},
    suite: {type: String, required: false},
    city: {type: String, required: true},
    state: {type: String, required: true},
    zip: {type: Number, required: true},
    plus4: {type: Number, required: false},
    type: { type: Number, enum: [EnumHelper.getValuesFromEnum(AddressType)] },
},{timestamps:true});

//If you do any pre save methods, and you use fat arrow syntax 'this' doesn't refer to the document.
AddressSchema.pre('save',function(next){
    //If there's any validators, this field requires validation.
    next();
});

// This will compile the schema for the object, and place it in this Instance.
export const Address = mongoose.model<IAddress>('address', AddressSchema);