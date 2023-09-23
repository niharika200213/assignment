import express from "express";
import {
    registerUser,
    loginUser,
    getUserById,
    refreshToken,
    deleteUser,
    updatePassword,
    getUsers
} from "../controllers/auth.controller";
import authorization from "../middleware/authorization";

/**
 * Endpoint: /api/auth
 */
const router = express.Router();

router.route("/refresh-token").get(refreshToken);
router.route("/user").get(getUsers);
router.route("/user/:id").get(getUserById);
router.route("/register").post(registerUser);
router.route("/login").post(loginUser);
router.route("/update-password").patch(authorization, updatePassword);
router.route('/user/:id').delete(authorization, deleteUser);


export default router;
