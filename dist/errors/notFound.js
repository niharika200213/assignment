"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const customAPIError_1 = require("./customAPIError");
const notFound = (req, res, next) => {
    const notFoundError = (0, customAPIError_1.createCustomError)(`Cannot find ${req.originalUrl} at this server`, 404);
    return next(notFoundError);
};
exports.default = notFound;
//# sourceMappingURL=notFound.js.map