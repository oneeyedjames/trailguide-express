"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const app_1 = require("./app");
dotenv.config();
mongoose.connect('mongodb://localhost/trailguide', (error) => {
    if (error) {
        console.error('DB Connect Error: ', error);
    }
    else {
        new app_1.Application().listen(process.env.PORT)
            .then((addr) => console.log(`Server listening on ${addr.address}:${addr.port} ...`))
            .catch((error) => console.error('Server Error: ', error.message || error));
    }
});
