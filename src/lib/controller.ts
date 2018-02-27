import { Router, Request, Response, NextFunction }	from 'express';
import { Document, Schema, SchemaType, Model, model } from 'mongoose';

import { promisify } from './promisify';

interface Link {
	rel?: string,
	path: string
}

export class Controller<T extends Document> {
	private static controllers = {};
	private static subRouteQueue = {};

	public model: Model<T>;
	public router: Router;

	private basePath: string;
	private itemPath: string;

	private links: Link[];

	constructor(name: string, schema: Schema) {
		Controller.controllers[name] = this;

		this.model = model<T>(name, schema);
		this.router = Router();

		this.links = new Array<Link>();
	}

	protected setRoutes(basePath: string, itemPath: string = '') {
		this.basePath = basePath;
		this.itemPath = `${itemPath || basePath}/:id`;

		this.router
			.get(this.basePath, this.getAll.bind(this))
			.post(this.basePath, this.create.bind(this))
			.get(this.itemPath, this.getOne.bind(this))
			.put(this.itemPath, this.update.bind(this))
			.delete(this.itemPath, this.delete.bind(this));

		const name = this.model.modelName;

		if (Controller.subRouteQueue[name]) {
			for (let route of Controller.subRouteQueue[name]) {
				if (Controller.controllers[route.modelName]) {
					let that = Controller.controllers[route.modelName] as Controller<Document>;
					that.addSubRoute(route.path, name, route.resolve, route.singular);
				}
			}

			Controller.subRouteQueue[name] = null;
		}
	}

	protected addSubRoute<TParent extends Document>(
		path: string,
		modelName: string,
		resolve: (doc: TParent) => object,
		singular: boolean = false
	) {
		if (Controller.controllers[modelName]) {
			const that = Controller.controllers[modelName] as Controller<Document>;

			const subPath = `${that.itemPath}/${path}`;

			that.links.push({ rel: path, path: subPath });

			const getCallback = (req: Request, resp: Response) => {
				promisify<TParent>(that.model.findById.bind(that.model), req.params.id)
				.then((doc: TParent) => {
					let fn = singular ? this.model.findOne : this.model.find;
					return promisify<T|T[]>(fn.bind(this.model), resolve(doc));
				})
				.then((res: T|T[]) => resp.json(this.addLinks(res, req)))
				.catch(this.error(resp));
			};

			this.router.get(subPath, getCallback.bind(this));

			if (!singular) {
				const postCallback = (req: Request, resp: Response) => {
					promisify<TParent>(that.model.findById.bind(that.model), req.params.id)
					.then((doc: TParent) => this.model.create(this.merge(req.body, resolve(doc))))
					.then((doc: T) => resp.status(201).json(this.addLinks(doc, req)))
					.catch(this.error(resp));
				};

				this.router.post(subPath, postCallback.bind(this));
			}
		} else {
			if (!Controller.subRouteQueue[modelName])
				Controller.subRouteQueue[modelName] = [];

			Controller.subRouteQueue[modelName].push({
				path: path,
				modelName: this.model.modelName,
				resolve: resolve,
				singular: singular
			});
		}
	}

	protected canRead(doc?: T): boolean {
		return true;
	}

	protected canEdit(doc?: T): boolean {
		return true;
	}

	protected canDelete(doc: T): boolean {
		return true;
	}

	private getAll(req: Request, resp: Response) {
		if (this.canRead()) {
			promisify<T[]>(this.model.find.bind(this.model))
			.then((res: T[]) => resp.json(this.addLinks(res, req)))
			.catch(this.error(resp));
		} else {
			resp.sendStatus(401);
		}
	}

	private getOne(req: Request, resp: Response) {
		promisify<T>(this.model.findById.bind(this.model), req.params.id)
		.then(this.authorize(this.canRead.bind(this)))
		.then((doc: T) => resp.json(this.addLinks(doc, req)))
		.catch(this.error(resp));
	}

	private create(req: Request, resp: Response) {
		if (this.canEdit()) {
			promisify<T[]>(this.model.create.bind(this.model), req.body)
			.then((res: T[]) => resp.status(201).json(this.addLinks(res, req)))
			.catch((err: any) => resp.status(500).json(err));
		} else {
			resp.sendStatus(401);
		}
	}

	private update(req: Request, resp: Response) {
		promisify<T>(this.model.findById.bind(this.model), req.params.id)
		.then(this.authorize(this.canEdit.bind(this)))
		.then((doc: T) => doc.set(req.body).save())
		.then((doc: T) => resp.json(this.addLinks(doc, req)))
		.catch(this.error(resp));
	}

	private delete(req: Request, resp: Response) {
		promisify<T>(this.model.findById.bind(this.model), req.params.id)
		.then(this.authorize(this.canDelete.bind(this)))
		.then((doc: T) => doc.remove())
		.then((doc: T) => resp.sendStatus(204))
		.catch(this.error(resp));
	}

	private addLinks(src: T|T[], req: Request): object|object[] {
		if (src instanceof Array) {
			let set: object[] = [];

			for (let obj of src)
				set.push(this.addLinks(obj, req));

			return set;
		} else {
			const baseUrl = req.protocol + '://' + req.get('host') + req.baseUrl;

			let obj = src.toObject();

			obj['_links'] = [{
				rel: 'collection',
				href: baseUrl + this.basePath
			}, {
				rel: 'self',
				href: baseUrl + this.itemPath.replace(':id', src._id)
			}];

			for (let link of this.links) {
				obj['_links'].push({
					rel: link.rel,
					href: baseUrl + link.path.replace(':id', src._id)
				})
			}

			return obj;
		}
	}

	private error(resp: Response): (err: any) => void {
		return (err: any) => {
			switch (err.message) {
				case 'Unauthorized':
					resp.sendStatus(401);
					break;
				case 'Not Found':
					resp.sendStatus(404);
					break;
				default:
					resp.status(500).json(err);
					break;
			}
		};
	}

	private merge(doc: T, obj: object): T {
		this.model.schema.eachPath((path: string, type: SchemaType) => {
			if (obj.hasOwnProperty(path))
				doc[path] = obj[path];
		});

		return doc;
	}

	private authorize(auth: (doc?: T) => boolean) {
		return (doc: T): T => {
			if (!doc)
				throw new Error('Not Found');

			if (!auth(doc))
				throw new Error('Unauthorized');

			return doc;
		};
	}
}
