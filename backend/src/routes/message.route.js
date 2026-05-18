import express from "express";

import { protectRoute } from "../middleware/auth.middleware.js";

import {
  getMessages,
  getUsersForSidebar,
  sendMessage,
  clearChat,
} from "../controllers/message.controller.js";

const router = express.Router();

// GET USERS
router.get(
  "/users",
  protectRoute,
  getUsersForSidebar
);

// GET MESSAGES
router.get(
  "/:id",
  protectRoute,
  getMessages
);

// SEND MESSAGE
router.post(
  "/send/:id",
  protectRoute,
  sendMessage
);

// CLEAR CHAT
router.delete(
  "/clear/:id",
  protectRoute,
  clearChat
);

export default router;