import { Schema } from 'mongoose';

import { Resource, ResourceDocument, UserRef } from './resource.model';

const ObjectId = Schema.Types.ObjectId;

export interface Article extends Resource {
	chapter: typeof ObjectId;
	title: string;
	bibleReading: string;
	extraReading: string;
	content: string;
	publishedAt: Date;
}

export interface ArticleDocument extends Article, ResourceDocument {}

export let ArticleSchema = new Schema({
	chapter: {
		type: ObjectId,
		ref: 'Chapter',
		required: true
	},
	title: String,
	bibleReading: String,
	extraReading: String,
	content: String,
	publishedAt: Date,
	createdBy: UserRef,
	createdAt: Date,
	modifiedBy: UserRef,
	modifiedAt: Date
});
