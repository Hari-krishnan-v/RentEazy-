import {Router} from "express";
import {
  GetAllUsers,
  LoginUser,
  LogoutUser,
  RefreshAccessToken,
  RegisterUser,
  VerifyUserOtp
} from "../controller/auth.controller";

const router:Router = Router();

router.post("/register", RegisterUser);
router.post("/verify-otp", VerifyUserOtp);
router.post("/login", LoginUser);
router.get("/logout",LogoutUser)
router.get("/refesh",RefreshAccessToken);
router.get("/get-all-users", GetAllUsers);

export default router;
