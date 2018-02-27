import { Document, Schema } from 'mongoose';

export interface Issue {
	title: string;
	description: string;
	volumeNumber: number;
	issueNumber: number;
	publishedAt: Date;
	createdAt: Date;
	modifiedAt: Date;
}

export interface IssueDocument extends Issue, Document {}

export let IssueSchema = new Schema({
	title: String,
	description: String,
	volumeNumber: Number,
	issueNumber: Number,
	publishedAt: Date,
	createdAt: Date,
	modifiedAt: Date
}).pre('save', function(next) {
	this.modifiedAt = new Date();

	if (!this.createdAt)
		this.createdAt = this.modifiedAt;

	next();
});
