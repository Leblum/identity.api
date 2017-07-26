import { Schema, Model, Document } from 'mongoose';

export interface IBaseModel extends Document {
    createdBy?: string;
    modifiedBy?: string;
    createdAt?: Date,
    modifiedAt?: Date,
}