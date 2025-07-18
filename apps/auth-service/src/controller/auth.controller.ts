
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

    await VerifyOtp(email, otp, next);
    const user = await prisma.user.create({
      data: {
        email,
        name,
        password,
      },
    });
    const accessToken = generateAccessToken(user.id);
    const refreshToken = generateRefreshToken(user.id);

    res.cookie("accessToken", accessToken, {
      httpOnly: true,       // JS can't access (helps prevent XSS)
      secure: process.env.NODE_ENV === "production",  // Only over HTTPS in prod
  // Prevent CSRF
      maxAge: 15 * 60 * 1000 // 15 minutes
    });

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

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

export const LogoutUser = async (req:Request,res:Response,next:NextFunction) => {
  res.clearCookie("accessToken");
  res.clearCookie("refreshToken");
  res.status(200).json({ message: "User logged out successfully" });
}

export const LoginUser = async (req:Request,res:Response,next:NextFunction) => {
  try {
    const {email,password} = req.body;

    if(!email || !password){
      return next(new ValidationError("Email and password are required"))
    }

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if(!user){
      return next(new ValidationError("User not found with this email"))
    }

    if(user.password !== password){
      return next(new ValidationError("Invalid password"))
    }

    const accessToken = generateAccessToken(user.id);
    const refreshToken = generateRefreshToken(user.id);

    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 15 * 60 * 1000 // 15 minutes
    });

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    return res.status(200).json({
        message: "User logged in successfully",
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

// export const getUserProfile = async (req:Request,res:Response,next:NextFunction) => {
//   try {
//     const userId = req.user as string; // Assuming user ID is set in req.user by authentication middleware
//
//     if (!userId) {
//       return next(new ValidationError("User not authenticated"));
//     }
//
//     const user = await prisma.user.findUnique({
//       where: { id: userId },
//       select: {
//         id: true,
//         email: true,
//         name: true,
//         profile: true,
//         bookings:true,
//         payments:true,
//       }
//     });
//
//     if (!user) {
//       return next(new ValidationError("User not found"));
//     }
//
//     return res.status(200).json({ user });
//   } catch (error) {
//     next(error);
//   }
// }

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

    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 15 * 60 * 1000 // 15 minutes
    });

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
