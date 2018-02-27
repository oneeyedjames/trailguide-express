import { Document, Schema } from 'mongoose';

export interface User {
	username: string;
	passwordHash: string;
	createdAt: Date;
	modifiedAt: Date;
}

export interface UserDocument extends User, Document {}

export let UserSchema = new Schema({
	username: String,
	passwordHash: String,
	createdAt: Date,
	modifiedAt: Date
}).pre('save', function(next) {
	this.modifiedAt = new Date();

	if (!this.createdAt)
		this.createdAt = this.modifiedAt;

	next();
});
