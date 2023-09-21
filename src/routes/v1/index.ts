import express from "express";

import authRoute from "./auth.route";

/**
 * Endpoint: /api/v1
 */
const router = express.Router();

router.use("/auth", authRoute);

router.get("/", (req, res) => {
    res.status(200).json({ message:" V1 API is running" });
});

export default router;
