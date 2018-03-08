import { Document, Schema, HookNextFunction } from 'mongoose';

import { Role } from './role.model';

const ObjectId = Schema.Types.ObjectId;

export interface User {
	username: string;
	passwordHash: string;
	roles: typeof ObjectId[];
	createdAt: Date;
	modifiedAt: Date;
}

export interface UserDocument extends User, Document {}

export const UserSchema = new Schema({
	username: String,
	passwordHash: String,
	roles: [{
		type: ObjectId,
		ref: 'Role'
	}],
	createdAt: Date,
	modifiedAt: Date
}).pre('save', (next: HookNextFunction) => {
	this.modifiedAt = new Date();

	if (!this.createdAt)
		this.createdAt = this.modifiedAt;

	next();
});
