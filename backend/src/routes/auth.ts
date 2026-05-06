import { Router } from "express";
import {
  signup,
  login,
  refreshToken,
  logout,
  getMe,
} from "../controllers/authController";
import { protect } from "../middleware/auth";

const router = Router();

// Public
router.post("/signup", signup);
router.post("/login", login);
router.post("/refresh", refreshToken);

// Protected
router.post("/logout", protect, logout);
router.get("/me", protect, getMe);

export default router;
