import crypto from 'crypto';
import {ValidationError} from "../../../../packages/error-handler";
import {NextFunction} from "express";
import redis from "../../../../libs/redis";
// import {sendMail} from "../../../../libs/sendMail";
import jwt from "jsonwebtoken";


const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET || "access_secret_key";
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET || "refresh_secret_key";


export const validateRegistrationData = (data:any,userType: "user" | "host" ) => {
  const { email,name,firstname,lastname,phone,altphone,location, password, confirmPassword } = data;

  // Check if all fields are provided
  if (userType==="user"? !email || !name || !password || !confirmPassword : !email || !firstname || !lastname || !phone || !altphone || !location || !password || !confirmPassword) {
    throw new ValidationError('All fields are required');
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    throw new ValidationError('Invalid email format');
  }

  // Check password length
  if (password.length < 6) {
    throw new ValidationError('Password must be at least 6 characters long');
  }

  // Check if passwords match
  if (password !== confirmPassword) {
    throw new ValidationError('Passwords do not match');
  }


}

export const CheckOtpRestrictions = async (email:string,next:NextFunction) => {
  try{

    if(await redis.get(`otp_lock:${email}`)) {
      return next(new ValidationError('You have reached the maximum number of OTP requests. Please try again later.'));
    }

    if(await redis.get(`otp_spam_lock:${email}`)) {
      return next(new ValidationError('You have been temporarily blocked from requesting OTPs due to suspicious activity. Please try again later.'));
    }

    if (await redis.get(`otp_cooldown:${email}`)) {
      return next(new ValidationError('Please wait before requesting another OTP.'));
    }

    if (await redis.get(`otp:${email}`)) {
      return next(new ValidationError('An OTP has already been sent to this email. Please check your inbox.'));
    }

  }catch (error) {
    next(new ValidationError("An error occurred while checking OTP restrictions"));
  }

}

export const trackOtpRequest = async (email:string,next:NextFunction) => {
  try{
    const otpRequestCount = await redis.incr(`otp_request_count:${email}`);

    if (otpRequestCount > 5) {
      await redis.set(`otp_spam_lock:${email}`, "locked", { ex: 300 }); // Lock for 5 minutes
      return next(new ValidationError('Too many OTP requests. You have been temporarily blocked.'));
    }

    if (otpRequestCount > 10) {
      await redis.set(`otp_lock:${email}`, "true", { ex: 3600 }); // Lock for 1 hour
      return next(new ValidationError('You have reached the maximum number of OTP requests. Please try again later.'));
    }

    // Reset the count after successful OTP request


  }catch (error) {
    next(new ValidationError("An error occurred while tracking OTP requests"));
  }
}

export const SendOtp = async (name:string,email:string,template:string) => {
  const otp = crypto.randomInt(10000, 99999).toString();
  // await sendMail(email, 'Verify your otp', template, { name, otp });
  console.log(`Sending OTP to ${email}: ${otp}`); // For testing purposes, replace with actual sendMail function
  await redis.set(`otp:${email}`, otp, { ex: 300 });
  await redis.set(`otp_cooldown:${email}`, "true", { ex: 60 });


}

export const VerifyOtp = async (email:string,otp:string,next:NextFunction) => {
  try{
    const storedOtp = await redis.get(`otp:${email}`);
    if (!storedOtp) {
      throw new ValidationError('OTP has expired or does not exist');
    }

    if (storedOtp !== otp) {
      throw new ValidationError('Invalid OTP');
    }

    // Clear the OTP after successful verification
    await redis.del(`otp:${email}`);
  }catch (error) {
    next(new ValidationError("An error occurred while verifying OTP"));
  }
}

export const generateAccessToken = (userId: string) => {
  return jwt.sign({ userId }, ACCESS_TOKEN_SECRET, { expiresIn: '15m' });
}

export const generateRefreshToken = (userId: string) => {
  return jwt.sign({ userId }, REFRESH_TOKEN_SECRET, { expiresIn: '7d' });
}

export const verifyAccessToken = (token: string) => {
  try {
    return jwt.verify(token, ACCESS_TOKEN_SECRET);
  } catch (error) {
    throw new ValidationError('Invalid access token');
  }
}

export const verifyRefreshToken = (token: string) => {
  try {
    return jwt.verify(token, REFRESH_TOKEN_SECRET);
  } catch (error) {
    throw new ValidationError('Invalid refresh token');
  }
}
