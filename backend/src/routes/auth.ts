import { Router } from "express";
import {
  signup,
  login,
  refreshToken,
  logout,
  getMe,
  updateUsername,
  updatePassword,
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
router.put("/update-username", protect, updateUsername);
router.put("/update-password", protect, updatePassword);

export default router;
