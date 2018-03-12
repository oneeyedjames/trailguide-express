import { Document, Schema, HookNextFunction, model } from 'mongoose';

import { Resource, ResourceDocument, UserRef } from './resource.model';

export interface Role extends Resource {
	title: string;
	description: string;
	permissions: [{
		action: string;
		resource: string;
		override: boolean;
	}];
}

export interface RoleDocument extends Role, ResourceDocument {}

export const RoleSchema = new Schema({
	title: String,
	description: String,
	permissions: Array,
	createdBy: UserRef,
	createdAt: Date,
	modifiedBy: UserRef,
	modifiedAt: Date
});

export const RoleModel = model<RoleDocument>('Role', RoleSchema);
