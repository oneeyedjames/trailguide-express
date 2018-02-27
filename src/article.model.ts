import { Document, Schema } from 'mongoose';

const ObjectId = Schema.Types.ObjectId;

export interface Article {
	chapter: typeof ObjectId;
	title: string;
	bibleReading: string;
	extraReading: string;
	content: string;
	publishedAt: Date;
	createdAt: Date;
	modifiedAt: Date;
}

export interface ArticleDocument extends Article, Document {}

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
	createdAt: Date,
	modifiedAt: Date
}).pre('save', function(next) {
	this.modifiedAt = new Date();

	if (!this.createdAt)
		this.createdAt = this.modifiedAt;

	next();
});
