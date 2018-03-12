import { Schema, model } from 'mongoose';

import { Resource, ResourceDocument, UserRef } from './resource.model';

const ObjectId = Schema.Types.ObjectId;

export interface Reply extends Resource {
	article: typeof ObjectId;
	observation: string;
	interpretation: string;
	application: string;
	implementation: string;
}

export interface ReplyDocument extends Reply, ResourceDocument {}

export const ReplySchema = new Schema({
	article: {
		type: ObjectId,
		ref: 'Article',
		required: true
	},
	observation: String,
	interpretation: String,
	application: String,
	implementation: String,
	createdBy: UserRef,
	createdAt: Date,
	modifiedBy: UserRef,
	modifiedAt: Date
});

export const ReplyModel = model<ReplyDocument>('Reply', ReplySchema);
