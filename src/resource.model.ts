import { Document, Schema } from 'mongoose';

const ObjectId = Schema.Types.ObjectId;

export const UserRef = { type: ObjectId, ref: 'User', required: true };

export interface Resource {
	createdBy: typeof ObjectId;
	createdAt: Date;
	modifiedBy: typeof ObjectId;
	modifiedAt: Date;
}

export interface ResourceDocument extends Resource, Document {}
