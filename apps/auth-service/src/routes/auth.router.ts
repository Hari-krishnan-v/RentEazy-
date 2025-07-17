import {Router} from "express";
import {RegisterUser} from "../controller/auth.controller";

const router:Router = Router();

router.post("/register", RegisterUser);

export default router;
