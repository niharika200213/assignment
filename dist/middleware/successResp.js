"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.successApiResponse = exports.sendSuccessApiResponse = void 0;
class successApiResponse {
    constructor(statusCode = 200) {
        this.status = { code: statusCode, message: "success" };
        this.data = {};
        this.error = {};
    }
}
exports.successApiResponse = successApiResponse;
const sendSuccessApiResponse = (data, statusCode = 200) => {
    const newApiResponse = new successApiResponse(statusCode);
    newApiResponse.data = data;
    return newApiResponse;
};
exports.sendSuccessApiResponse = sendSuccessApiResponse;
//# sourceMappingURL=successResp.js.map