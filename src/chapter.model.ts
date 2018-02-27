import { Schema } from 'mongoose';

import { Resource, ResourceDocument, UserRef } from './resource.model';

const ObjectId = Schema.Types.ObjectId;

export interface Chapter extends Resource {
	issue: typeof ObjectId;
	title: string;
	description: string;
	scripture: string;
	publishedAt: Date;
}

export interface ChapterDocument extends Chapter, ResourceDocument {}

export let ChapterSchema = new Schema({
	issue: {
		type: ObjectId,
		ref: 'Issue',
		required: true
	},
	title: String,
	description: String,
	scripture: String,
	publishedAt: Date,
	createdBy: UserRef,
	createdAt: Date,
	modifiedBy: UserRef,
	modifiedAt: Date
});
