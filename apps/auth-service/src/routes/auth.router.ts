import {Router} from "express";
import {
  CreateUserProfile,
  GetAllHosts,
  GetAllUsers, GetUserProfile, LoginHost,
  LoginUser, Logout,
  RefreshAccessToken, RegisterHost,
  RegisterUser, UpdateUserProfile, VerifyHostOtp,
  VerifyUserOtp
} from "../controller/auth.controller";
import {initKafka} from "../../../../libs/kafka/src";
import {Authenticate} from "../../../../packages/middleware/authenticate.middleware";

const router:Router = Router();

// working :
//    user will register with email , password ,confirmPassword, name then otp will be sent to email
//    then user will verify otp and enter otp and also attach email, password and confirmPassword and name
//    after otp verification user will be registered and access token and refresh token will be generated
//    this will manage unwanted user registration

// user auth routes

router.post("/register-user", RegisterUser);
router.post("/verify-user-otp", VerifyUserOtp);
router.post("/login-user", LoginUser);
router.get("/logout",Logout)
router.get("/refesh",RefreshAccessToken);
router.get("/get-all-users", GetAllUsers);
router.patch("/update-user-profile",Authenticate,  UpdateUserProfile);
router.post("/create-profile", Authenticate, CreateUserProfile);
router.get("/get-user-profiles", Authenticate, GetUserProfile);

// host auth routes

router.post("/register-host", RegisterHost);
router.post("/verify-host-otp", VerifyHostOtp);
router.post("/login-host", LoginHost);
router.get("get-all-hosts", GetAllHosts);

(async () => {
  await initKafka();
})();

export default router;
