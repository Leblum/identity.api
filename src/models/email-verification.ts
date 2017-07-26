import { mongoose } from '../config/database/database';
import { Schema, Model, Document, model } from 'mongoose';
import { IUser } from './user';
import { IBaseModel } from "./index";

export interface IEmailVerification extends IBaseModel {
    userId: string;
    validityLength: string;
    isVerified: boolean;
}

const EmailVerificationSchema = new Schema({
    userId: { type : Schema.Types.ObjectId, ref: 'user' },
    validityLength: {type: String, default: '1week'},
    isVerified: {type: Boolean, default: false}
},{timestamps:true});

//If you do any pre save methods, and you use fat arrow syntax 'this' doesn't refer to the document.
EmailVerificationSchema.pre('save',function(next){
    //If there's any validators, this field requires validation.
    next();
});

// This will compile the schema for the object, and place it in this Instance.
export const EmailVerification = mongoose.model<IEmailVerification>('email-verification', EmailVerificationSchema);