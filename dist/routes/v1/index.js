"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_route_1 = __importDefault(require("./auth.route"));
/**
 * Endpoint: /api/v1
 */
const router = express_1.default.Router();
router.use("/auth", auth_route_1.default);
router.get("/", (req, res) => {
    res.status(200).json({ message: " V1 API is running" });
});
exports.default = router;
//# sourceMappingURL=index.js.map