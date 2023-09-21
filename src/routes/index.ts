import express from "express";
import authRoute from "./auth.route";

const router = express.Router();

router.get("/", (req, res) => {
    res.send("API server is running!!!");
});
router.use("/auth", authRoute);

export default router;