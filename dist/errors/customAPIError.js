"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createCustomError = exports.customAPIError = void 0;
/* eslint-disable @typescript-eslint/ban-types */
class customAPIError extends Error {
    constructor(message, statusCode = 500) {
        super(message);
        this.status = { code: statusCode, message: `${statusCode}`.startsWith("4") ? "fail" : "error" };
        this.isOperational = true;
        Error.captureStackTrace(this, this.constructor);
    }
}
exports.customAPIError = customAPIError;
const createCustomError = (message, statusCode = 500) => {
    return new customAPIError(message, statusCode);
};
exports.createCustomError = createCustomError;
//# sourceMappingURL=customAPIError.js.map