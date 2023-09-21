"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const v1_1 = __importDefault(require("./v1"));
const router = express_1.default.Router();
router.get("/", (req, res) => {
    res.send("API server is running!!!");
});
router.use("/api/v1", v1_1.default);
exports.default = router;
//# sourceMappingURL=index.js.map