"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sendError = (err, res) => {
    res.status(err.status.code || 500).json({
        status: err.status,
        error: err,
        message: err.message,
        stack: err.stack,
    });
};
const errorHandlerMiddleware = (err, req, res, next) => {
    err.status = err.status || { code: 500, message: "error" };
    sendError(err, res);
};
exports.default = errorHandlerMiddleware;
//# sourceMappingURL=errorHandler.js.map