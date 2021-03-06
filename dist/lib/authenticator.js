"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const bcrypt = require("bcrypt");
const promisify_1 = require("./promisify");
class Authenticator {
    constructor() {
        this.router = express_1.Router()
            .post('/login', this.logIn.bind(this))
            .post('/logout', this.logOut.bind(this))
            .post('/register', this.register.bind(this));
    }
    authenticate(username, password) {
        let userData;
        return this.findUser(username)
            .then((user) => {
            if (user == null)
                throw new Error('Invalid Username');
            userData = user;
            return bcrypt.compare(password, user.passwordHash);
        })
            .then((isMatch) => {
            if (!isMatch)
                throw new Error('Invalid Password');
            return userData;
        });
    }
    logIn(req, res) {
        this.authenticate(req.body.username, req.body.password)
            .then((user) => {
            req.session.userId = user.id;
            res.sendStatus(204);
        })
            .catch((err) => {
            req.session.userId = null;
            res.status(500).json(err);
        });
    }
    logOut(req, res) {
        promisify_1.promisify(req.session.destroy.bind(req.session))
            .then(() => res.sendStatus(204))
            .catch((err) => res.status(500).json(err));
    }
    register(req, res) {
        this.findUser(req.body.username)
            .then((user) => {
            if (user != null)
                throw new Error('Username already exists');
            return bcrypt.genSalt(10);
        })
            .then((salt) => bcrypt.hash(req.body.password, salt))
            .then((hash) => this.createUser(req.body.username, hash))
            .then((user) => {
            req.session.userId = user.id;
            user.passwordHash = null;
            res.json(user);
        })
            .catch((err) => res.status(500).json(err));
    }
}
exports.Authenticator = Authenticator;
