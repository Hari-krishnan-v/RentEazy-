
import {NextFunction,Response,Request} from "express";
import {prisma} from "../../../../libs/prisma";
import {CheckOtpRestrictions, SendOtp, trackOtpRequest, validateRegistrationData} from "../utils/auth.helper";
import {ValidationError} from "../../../../packages/error-handler";

export const RegisterUser = async (req:Request,res:Response, next:NextFunction) => {
  try {
    validateRegistrationData(req.body,"user")
    const {name,email} = req.body

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });


    if(existingUser){
      return next(new ValidationError("User already exists with this email"))
    }

    await CheckOtpRestrictions(email ,next);
    await trackOtpRequest(email, next);
    await SendOtp(name,email,"user-activation-email");

    res.status(200).json({
      message: "Otp send to your email. Please check your email for the verify your account."
    });


  }catch (error) {
    next(error);
  }
}

