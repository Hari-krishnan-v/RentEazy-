
import {NextFunction,Response,Request} from "express";
import {prisma} from "../../../../libs/prisma";
import {
  CheckOtpRestrictions, generateAccessToken, generateRefreshToken,
  SendOtp,
  trackOtpRequest,
  validateRegistrationData,
  VerifyOtp, verifyRefreshToken
} from "../utils/auth.helper";
import {ValidationError} from "../../../../packages/error-handler";
import {setCookie} from "../utils/cookies/setCookie";
import bcrypt from "bcrypt";

// user controls

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

export const VerifyUserOtp = async (req:Request,res:Response,next:NextFunction) => {
  try {
    validateRegistrationData(req.body,"user")
    const{email,name,password,otp} = req.body;

    if(!otp){
      return next(new ValidationError("Otp is required"))
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if(existingUser){
      return next(new ValidationError("User already exists with this email"))
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await VerifyOtp(email, otp, next);
    const user = await prisma.user.create({
      data: {
        email,
        name,
        password:hashedPassword,
      },
    });

    const accessToken = generateAccessToken(user.id);
    const refreshToken = generateRefreshToken(user.id);

    setCookie(res, "accessToken",accessToken);
    setCookie(res, "refreshToken",refreshToken);

    return res.status(201).json({
        message: "User registered successfully",
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt
        }
    });
  } catch (error) {
        next(error);
    }
}

export const Logout = async (req:Request,res:Response,next:NextFunction) => {
  res.clearCookie("accessToken");
  res.clearCookie("refreshToken");
  res.status(200).json({ message: " logged out successfully" });
}

export const LoginUser = async (req:Request,res:Response,next:NextFunction) => {
  try {
    const {email,password} = req.body;

    if(!email || !password){
      return next(new ValidationError("Email and password are required"))
    }

    const user = await prisma.user.findUnique({
      where: { email ,role: "USER" },
    });

    if(!user){
      return next(new ValidationError("User not found with this email"))
    }

    if(user.password !== password){
      return next(new ValidationError("Invalid password"))
    }

    const accessToken = generateAccessToken(user.id);
    const refreshToken = generateRefreshToken(user.id);

    setCookie(res, "accessToken", accessToken);
    setCookie(res, "refreshToken", refreshToken);

    return res.status(200).json({
        message: "User logged in successfully",
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          avatarUrl: user.avatarUrl,
          phone: user.phone,
          altphone: user.altphone,
          location: user.location,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt
        }
    });
  } catch (error) {
        next(error);
    }

}

export const RefreshAccessToken = async (req:Request,res:Response,next:NextFunction) => {
  try {
    const { refreshToken } = req.cookies;

    if (!refreshToken) {
      return next(new ValidationError("Refresh token is required"));
    }
    // Verify the refresh token
    const userId = verifyRefreshToken(refreshToken);

    // Verify the refresh token and extract user ID


    if (!userId) {
      return next(new ValidationError("Invalid refresh token"));
    }

    const accessToken = generateAccessToken(userId.toString());

    setCookie(res, "accessToken", accessToken);

    return res.status(200).json({ message: "Access token refreshed successfully" });
  } catch (error) {
    next(error);
  }
}

export const GetAllUsers = async (req:Request,res:Response,next:NextFunction) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
        updatedAt: true
      }
    });
    return res.status(200).json({ users });
  } catch (error) {
    next(error);
    return ;
  }
}


// HOST controller
export const RegisterHost = async (req:Request,res:Response,next:NextFunction) => {
  try {
    validateRegistrationData(req.body,"host")
    const {firstname,email} = req.body

    const existingHost = await prisma.user.findUnique({
      where: { email },
    });

    if(existingHost){
      return next(new ValidationError("Host already exists with this email"))
    }

    await CheckOtpRestrictions(email ,next);
    await trackOtpRequest(email, next);
    await SendOtp(firstname,email,"host-activation-email");

    res.status(200).json({
      message: "Otp send to your email. Please check your email for the verify your account."
    });

  }catch (error) {
    next(error);
  }
}

export const VerifyHostOtp = async (req:Request,res:Response,next:NextFunction) => {
  try {
    validateRegistrationData(req.body,"host")
    const{email,firstname,lastname,phone,altphone,location,password,otp} = req.body;

    if(!otp){
      return next(new ValidationError("Otp is required"))
    }

    const existingHost = await prisma.user.findUnique({
      where: { email  },
    });

    if(existingHost){
      return next(new ValidationError("Host already exists with this email"))
    }
    const hashedPassword = await bcrypt.hash(password, 10);

    await VerifyOtp(email, otp, next);

    const host = await prisma.user.create({
      data: {
        email,
        firstname,
        lastname,
        phone,
        altphone,
        location,
        role: "HOST",
        password:hashedPassword,
      },
    });

    const accessToken = generateAccessToken(host.id);
    const refreshToken = generateRefreshToken(host.id);

    setCookie(res, "accessToken",accessToken);
    setCookie(res, "refreshToken",refreshToken);

    return res.status(201).json({
        message: "Host registered successfully",
        host: {
          id: host.id,
          email: host.email,
          firstname: host.firstname,
          lastname: host.lastname,
          phone: host.phone,
          altphone: host.altphone,
          location: host.location,
          createdAt: host.createdAt,
          updatedAt: host.updatedAt
        }
    });
  } catch (error) {
        next(error);
    }
}

export const GetAllHosts = async (req:Request,res:Response,next:NextFunction) => {
  try {
    const hosts = await prisma.user.findMany({
      where: {
        role: "HOST"
      },
      select: {
        id: true,
        email: true,
        firstname: true,
        lastname: true,
        phone: true,
        altphone: true,
        location: true,
        createdAt: true,
        updatedAt: true
      }
    });
    return res.status(200).json({ hosts });
  } catch (error) {
    next(error);
    return ;
  }
}

export const LoginHost = async (req:Request,res:Response,next:NextFunction) => {
  try {
    const {email,password} = req.body;

    if(!email || !password){
      return next(new ValidationError("Email and password are required"))
    }

    const host = await prisma.user.findUnique({
      where: { email },
    });

    if(!host){
      return next(new ValidationError("Host not found with this email"))
    }

    if(host.role !== "HOST"){
      return next(new ValidationError("You are not authorized to login as host"))
    }

    if(host.password !== password){
      return next(new ValidationError("Invalid password"))
    }

    const accessToken = generateAccessToken(host.id);
    const refreshToken = generateRefreshToken(host.id);

    setCookie(res, "accessToken", accessToken);
    setCookie(res, "refreshToken", refreshToken);

    return res.status(200).json({
        message: "Host logged in successfully",
        host: {
          id: host.id,
          email: host.email,
          firstname: host.firstname,
          lastname: host.lastname,
          phone: host.phone,
          altphone: host.altphone,
          location: host.location,
          createdAt: host.createdAt,
          updatedAt: host.updatedAt
        }
    });
  } catch (error) {
        next(error);
    }
}
