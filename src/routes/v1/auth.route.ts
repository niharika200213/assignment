import express from "express";
import {
    registerUser,
    loginUser,
    getUserById,
    refreshToken,
    deleteUser,
    updatePassword,
    getUsers
} from "../../controllers/auth.controller";
import authorization from "../../middleware/authorization";

/**
 * Endpoint: /api/v1/auth
 */
const router = express.Router();

router.route("/refresh-token").get(refreshToken);
router.route("/register").post(registerUser);
router.route("/login").post(loginUser);
router.route("/update-password").patch(authorization, updatePassword);
router.route("/user/:id").get(getUserById);
router.route('/user/:id').delete(authorization, deleteUser);
router.route("/user").get(getUsers);

export default router;
