import { Document, Schema, Types, HookNextFunction, model } from 'mongoose';

import { Role } from './role.model';

import ObjectId = Schema.Types.ObjectId;

export interface User {
	username: string;
	passwordHash: string;
	roles: Types.Array<ObjectId>;
	admin: boolean;
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
	admin: Boolean,
	createdAt: Date,
	modifiedAt: Date
}).pre('save', (next: HookNextFunction) => {
	this.modifiedAt = new Date();

	if (!this.createdAt)
		this.createdAt = this.modifiedAt;

	next();
});

export const UserModel = model<UserDocument>('User', UserSchema);
