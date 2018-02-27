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
        const app = new app_1.Application();
        app.listen(process.env.PORT).then((server) => {
            let addr = server.address();
            let bind = (typeof addr === 'string') ? `pipe ${addr}` : `port ${addr.port}`;
            console.log(`Server listening on ${bind}...`);
        }).catch((error) => {
            console.error('Server Error: ', error);
        });
    }
});
