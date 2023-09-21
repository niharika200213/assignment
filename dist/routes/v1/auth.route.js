"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_controller_1 = require("../../controllers/auth.controller");
const authorization_1 = __importDefault(require("../../middleware/authorization"));
/**
 * Endpoint: /api/v1/auth
 */
const router = express_1.default.Router();
router.route("/refresh-token").get(auth_controller_1.refreshToken);
router.route("/register").post(auth_controller_1.registerUser);
router.route("/login").post(auth_controller_1.loginUser);
router.route("/update-password").patch(authorization_1.default, auth_controller_1.updatePassword);
router.route("/user/:id").get(auth_controller_1.getUserById);
router.route('/user/:id').delete(authorization_1.default, auth_controller_1.deleteUser);
router.route("/user").get(auth_controller_1.getUsers);
exports.default = router;
//# sourceMappingURL=auth.route.js.map