import { Schema, model } from 'mongoose';

import { Resource, ResourceDocument, UserRef } from './resource.model';

const ObjectId = Schema.Types.ObjectId;

interface Question {
	heading: string;
	keyword: string;
	message: string;
}

interface QuestionSet {
	observation: Question;
	interpretation: Question;
	application: Question;
	implementation: Question;
}

export interface Article extends Resource {
	chapter: typeof ObjectId;
	title: string;
	bibleReading: string;
	extraReading: string;
	content: string;
	questions?: QuestionSet;
	publishedAt: Date;
}

export interface ArticleDocument extends Article, ResourceDocument {}

export const ArticleSchema = new Schema({
	chapter: {
		type: ObjectId,
		ref: 'Chapter',
		required: true
	},
	title: String,
	bibleReading: String,
	extraReading: String,
	content: String,
	questions: Object,
	publishedAt: Date,
	createdBy: UserRef,
	createdAt: Date,
	modifiedBy: UserRef,
	modifiedAt: Date
});

export const ArticleModel = model<ArticleDocument>('Article', ArticleSchema);
