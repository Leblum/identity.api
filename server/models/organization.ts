import { mongoose } from '../config/database/database';
import { Schema, Model, Document, model } from 'mongoose';
import { IUserDoc } from './user';
import { IBaseModel, IBaseModelDoc } from "./index";
import * as enums from "../enumerations";

export interface IOrganization extends IBaseModel {
    ownerships?: {
        ownerId: string,
        ownershipType: enums.OwnershipType
    }[],
    name: string,
    type: enums.OrganizationType,
    isSystem: boolean;
    users?: Array<string>;
    href?: string,
}

// This will give us an interface that's a composite of both base model, and document.
export interface IOrganizationDoc extends IOrganization, IBaseModelDoc {
    
}

const OrganizationSchema = new Schema({
    ownerships: [{
        _id: { auto: false },
        ownerId:  { type: Schema.Types.ObjectId },
        ownershipType: { type: Number, enum: [enums.EnumHelper.getValuesFromEnum(enums.OwnershipType)] },
    }],
    name: {type: String, required: true, unique: true},
    type: { type: Number, enum: [enums.EnumHelper.getValuesFromEnum(enums.OrganizationType)] },
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
export const Organization = mongoose.model<IOrganizationDoc>('organization', OrganizationSchema);