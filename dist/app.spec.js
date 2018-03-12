"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const supertest = require("supertest");
const mocha_1 = require("mocha");
const dotenv = require("dotenv");
dotenv.config();
const app_1 = require("./app");
mocha_1.describe('loading server', () => {
    let app;
    mocha_1.beforeEach(() => {
        app = new app_1.Application();
        app.listen(3000);
    });
    mocha_1.afterEach((done) => {
        app.close().then(() => done());
    });
    mocha_1.it('should respond', (done) => {
        supertest(app.application)
            .get('/api/issues')
            .expect(200, done);
        done();
    });
});
