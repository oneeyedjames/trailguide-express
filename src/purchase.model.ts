import { Schema, model } from 'mongoose';

import { Resource, ResourceDocument, UserRef } from './resource.model';

import ObjectId = Schema.Types.ObjectId;

export interface Purchase extends Resource {
	issue: typeof ObjectId;
}

export interface PurchaseDocument extends Purchase, ResourceDocument {}

export const PurchaseSchema = new Schema({
	issue: {
		type: ObjectId,
		ref: 'Issue',
		required: true
	},
	createdBy: UserRef,
	createdAt: Date,
	modifiedBy: UserRef,
	modifiedAt: Date
});

export const PurchaseModel = model<PurchaseDocument>('Purchase', PurchaseSchema);
