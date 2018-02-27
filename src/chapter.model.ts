import { Document, Schema } from 'mongoose';

const ObjectId = Schema.Types.ObjectId;

export interface Chapter {
	issue: typeof ObjectId;
	title: string;
	description: string;
	scripture: string;
	publishedAt: Date;
	createdAt: Date;
	modifiedAt: Date;
}

export interface ChapterDocument extends Chapter, Document {}

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
	createdAt: Date,
	modifiedAt: Date
}).pre('save', function(next) {
	this.modifiedAt = new Date();

	if (!this.createdAt)
		this.createdAt = this.modifiedAt;

	next();
});
