import { Router } from "express";
import { receiveWebhook, verifyWebhook } from "../controllers/webhookController.js";
import { verifyMetaSignature } from "../middleware/verifyMetaSignature.js";

const router = Router();

router.get("/webhook", verifyWebhook);
router.post("/webhook", verifyMetaSignature, receiveWebhook);

export default router;
