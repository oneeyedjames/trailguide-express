import { Schema, Model, model } from 'mongoose';

import { Resource, ResourceDocument, UserRef } from './resource.model';

export interface Issue extends Resource {
	title: string;
	description: string;
	volumeNumber: number;
	issueNumber: number;
	publishedAt: Date;
	isFree: boolean;
}

export interface IssueDocument extends Issue, ResourceDocument {}

export const IssueSchema = new Schema({
	title: String,
	description: String,
	volumeNumber: Number,
	issueNumber: Number,
	publishedAt: Date,
	createdBy: UserRef,
	createdAt: Date,
	modifiedBy: UserRef,
	modifiedAt: Date
});

export const IssueModel = model<IssueDocument>('Issue', IssueSchema);
