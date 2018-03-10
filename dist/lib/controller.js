"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const mongoose_1 = require("mongoose");
const promisify_1 = require("./promisify");
class Controller {
    constructor(name, schema) {
        Controller.controllers[name] = this;
        this.model = mongoose_1.model(name, schema);
        this.router = express_1.Router();
        this.links = new Array();
    }
    setRoutes(basePath, itemPath = '') {
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
                    let that = Controller.controllers[route.modelName];
                    that.addSubRoute(route.path, name, route.resolve, route.singular);
                }
            }
            Controller.subRouteQueue[name] = null;
        }
    }
    addSubRoute(path, modelName, resolve, singular = false) {
        if (Controller.controllers[modelName]) {
            const that = Controller.controllers[modelName];
            const subPath = `${that.itemPath}/${path}`;
            that.links.push({ rel: path, path: subPath });
            const getCallback = (req, resp) => {
                promisify_1.promisify(that.model.findById.bind(that.model), req.params.id)
                    .then((doc) => {
                    let fn = singular ? this.model.findOne : this.model.find;
                    return promisify_1.promisify(fn.bind(this.model), resolve(doc));
                })
                    .then((res) => {
                    if (singular && res == null)
                        throw new Error('Not Found');
                    resp.json(this.addLinks(res, req));
                })
                    .catch(this.error(resp));
            };
            this.router.get(subPath, getCallback.bind(this));
            if (!singular) {
                const postCallback = (req, resp) => {
                    promisify_1.promisify(that.model.findById.bind(that.model), req.params.id)
                        .then((doc) => this.model.create(this.merge(req.body, resolve(doc))))
                        .then((doc) => resp.status(201).json(this.addLinks(doc, req)))
                        .catch(this.error(resp));
                };
                this.router.post(subPath, postCallback.bind(this));
            }
        }
        else {
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
    canRead(doc) { return true; }
    canEdit(doc) { return true; }
    canDelete(doc) { return true; }
    beforeCreate(doc) { return doc; }
    afterCreate(doc) { return doc; }
    beforeUpdate(doc) { return doc; }
    afterUpdate(doc) { return doc; }
    beforeDelete(doc) { return doc; }
    afterDelete(doc) { return doc; }
    getAll(req, resp) {
        if (this.canRead()) {
            promisify_1.promisify(this.model.find.bind(this.model))
                .then((res) => resp.json(this.addLinks(res, req)))
                .catch(this.error(resp));
        }
        else {
            resp.sendStatus(401);
        }
    }
    getOne(req, resp) {
        promisify_1.promisify(this.model.findById.bind(this.model), req.params.id)
            .then(this.authorize(this.canRead.bind(this)))
            .then((doc) => resp.json(this.addLinks(doc, req)))
            .catch(this.error(resp));
    }
    create(req, resp) {
        if (this.canEdit()) {
            let doc = new this.model(req.body);
            this.beforeCreate(doc).save()
                .then((doc) => this.afterCreate(doc))
                .then((doc) => this.addLinks(doc, req))
                .then((doc) => resp.status(201).json(doc))
                .catch((err) => resp.status(500).json(err));
        }
        else {
            resp.sendStatus(401);
        }
    }
    update(req, resp) {
        promisify_1.promisify(this.model.findById.bind(this.model), req.params.id)
            .then(this.authorize(this.canEdit.bind(this)))
            .then((doc) => doc.set(req.body))
            .then((doc) => this.beforeUpdate(doc))
            .then((doc) => doc.save())
            .then((doc) => this.afterUpdate(doc))
            .then((doc) => this.addLinks(doc, req))
            .then((doc) => resp.json(doc))
            .catch(this.error(resp));
    }
    delete(req, resp) {
        promisify_1.promisify(this.model.findById.bind(this.model), req.params.id)
            .then(this.authorize(this.canDelete.bind(this)))
            .then((doc) => this.beforeDelete(doc))
            .then((doc) => doc.remove())
            .then((doc) => this.afterDelete(doc))
            .then((doc) => resp.sendStatus(204))
            .catch(this.error(resp));
    }
    addLinks(src, req) {
        if (src instanceof Array) {
            let set = [];
            for (let obj of src)
                set.push(this.addLinks(obj, req));
            return set;
        }
        else {
            const baseUrl = req.protocol + '://' + req.get('host') + req.baseUrl;
            let obj = src == null ? {} : src.toObject();
            obj['_links'] = [{
                    rel: 'collection',
                    href: baseUrl + this.basePath
                }];
            if (src != null) {
                obj['_links'].push({
                    rel: 'self',
                    href: baseUrl + this.itemPath.replace(':id', src._id)
                });
                for (let link of this.links) {
                    obj['_links'].push({
                        rel: link.rel,
                        href: baseUrl + link.path.replace(':id', src._id)
                    });
                }
            }
            return obj;
        }
    }
    error(resp) {
        return (err) => {
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
    merge(doc, obj) {
        this.model.schema.eachPath((path, type) => {
            if (obj.hasOwnProperty(path))
                doc[path] = obj[path];
        });
        return doc;
    }
    authorize(auth) {
        return (doc) => {
            if (!doc)
                throw new Error('Not Found');
            if (!auth(doc))
                throw new Error('Unauthorized');
            return doc;
        };
    }
}
Controller.controllers = {};
Controller.subRouteQueue = {};
exports.Controller = Controller;
