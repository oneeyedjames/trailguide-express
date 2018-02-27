"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function promisify(fn, ...args) {
    if (args.length == 0)
        return new Promise((resolve, reject) => {
            fn((err, res) => err ? reject(err) : resolve(res));
        });
    else
        return promisify((cb) => fn.apply(null, [...args, cb]));
}
exports.promisify = promisify;
