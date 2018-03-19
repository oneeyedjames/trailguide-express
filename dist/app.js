"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express = require("express");
const session = require("express-session");
const connectMongo = require("connect-mongo");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const user_controller_1 = require("./user.controller");
const role_controller_1 = require("./role.controller");
const issue_controller_1 = require("./issue.controller");
const chapter_controller_1 = require("./chapter.controller");
const article_controller_1 = require("./article.controller");
const reply_controller_1 = require("./reply.controller");
class Application {
    constructor(connection) {
        const MongoStore = connectMongo(session);
        const sessionOptions = {
            secret: process.env.COOKIE_SECRET,
            resave: false,
            saveUninitialized: false,
            store: new MongoStore({
                mongooseConnection: connection,
                autoRemove: 'native'
            })
        };
        this.application = express()
            .use(bodyParser.json())
            .use(bodyParser.urlencoded({ extended: false }))
            .use(cookieParser())
            .use(session(sessionOptions))
            .use(this.enableCors);
        let controllers = [
            user_controller_1.default,
            role_controller_1.default,
            issue_controller_1.default,
            chapter_controller_1.default,
            article_controller_1.default,
            reply_controller_1.default
        ];
        for (let controller of controllers) {
            this.application
                .use('/api/v1', controller.router)
                .use('/api', controller.router);
        }
    }
    listen(port) {
        port = this.normalizePort(port) || 3000;
        this.application.set('port', port);
        return new Promise((resolve, reject) => {
            this.server = this.application
                .listen(port, () => resolve(this.server.address()))
                .on('error', (error) => reject(error));
        });
    }
    close() {
        if (this.server) {
            return new Promise((resolve, reject) => {
                this.server.close(() => {
                    this.server = null;
                    resolve();
                });
            });
        }
        else {
            return Promise.reject(new Error('Server is already closed.'));
        }
    }
    normalizePort(val) {
        let port = (typeof val === 'string') ? parseInt(val, 10) : val;
        if (isNaN(port))
            return val;
        return port;
    }
    enableCors(req, res, next) {
        res.header('Access-Control-Allow-Origin', 'http://localhost:4200');
        res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
        res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
        res.header('Access-Control-Allow-Credentials', 'true');
        res.header('Access-Control-Expose-Headers', 'Set-Cookie');
        next();
    }
}
exports.Application = Application;
