"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mocha_1 = require("mocha");
const supertest = require("supertest");
const dotenv = require("dotenv");
dotenv.config();
const app_1 = require("./app");
mocha_1.describe('loading server', () => {
    let app, request;
    mocha_1.beforeEach(() => {
        app = new app_1.Application();
        app.listen(3000);
        request = supertest(app.application);
    });
    mocha_1.afterEach((done) => {
        app.close().then(done);
    });
    mocha_1.it('should respond', (done) => {
        request.get('/api/v1')
            .expect(200, done);
    });
});
