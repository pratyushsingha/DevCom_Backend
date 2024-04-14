import { Router } from "express";
import {
  changePasswordValidator,
  updateUserDetailsValidator,
  userLoginValidator,
  userRegisterValidator,
} from "../validators/user.validators.js";
import { validate } from "../utils/validate.js";
import {
  changePassword,
  currentUser,
  getUserDetails,
  loginUser,
  logoutUser,
  refreshAccessToken,
  registerUser,
  updateAvatar,
  updateUserDetails,
} from "../controllers/user.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = Router();

router.route("/register").post(userRegisterValidator(), validate, registerUser);
router.route("/login").post(userLoginValidator(), validate, loginUser);
router.route("/logout").post(verifyJWT, logoutUser);
router.route("/avatar").patch(verifyJWT, upload.single("avatar"), updateAvatar);
router
  .route("/profile")
  .patch(verifyJWT, updateUserDetailsValidator(), validate, updateUserDetails);
router.route("/profile").get(verifyJWT, getUserDetails);
router
  .route("/change-password")
  .patch(verifyJWT, changePasswordValidator(), validate, changePassword);
router.route("/refresh-token").post(verifyJWT, refreshAccessToken);
router.route("/current-user").get(verifyJWT, currentUser);

export default router;
