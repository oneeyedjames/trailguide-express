"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const promisify_1 = require("./lib/promisify");
const app_1 = require("./app");
dotenv.config();
promisify_1.promisify(mongoose.connect.bind(mongoose), 'mongodb://localhost/trailguide')
    .then(() => new app_1.Application(mongoose.connection).listen(process.env.PORT))
    .then((addr) => console.log(`Server listening on ${addr.address}:${addr.port} ...`))
    .catch((error) => console.error('Server Error: ', error.message || error));
