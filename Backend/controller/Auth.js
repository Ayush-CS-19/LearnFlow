// Login, SignUp and SendOTP
const otpGenrator = require("otp-generator");
const User = require("../models/User");
const OTP = require("../models/Otp");
const bcrypt = require("bcrypt");
const Profile = require("../models/Profile");
const jwt = require("jsonwebtoken");
require("dotenv").config();

// OTP GENRATOR CODE
exports.OtpGenrator = async (req, res) => {
  try {
    const { email } = req.body;

    // USER ALREADY EXIST CHECK
    const checkPresent = await User.findOne({ email });
    if (checkPresent) {
      return res.status(401).json({
        success: false,
        message: "User Already Exist",
      });
    }
    let otp = otpGenrator.generate(6, {
      upperCaseAlphabets: false,
      lowerCaseAlphabets: false,
      specialChars: false,
    });
    console.log("Otp :", otp);

    // OTP IS ALREADY THERE OR NOT
    // BRUTE FORCE WAY TO GENRATE UNIQUE OTP EVERY TIME
    const result = await OTP.findOne({ otp: otp });
    while (result) {
      otp = otpGenrator.generate(6, {
        upperCaseAlphabets: false,
        lowerCaseAlphabets: false,
        specialChars: false,
      });
      result = await OTP.findOne({ otp: otp });
    }
    const otppayload = { email, otp };
    const otpbody = await OTP.create(otppayload);
    console.log(otpbody);
    res.status(200).json({
      success: true,
      message: "OTP send successfully",
      otp,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// SIGN UP
exports.signUp = async (req, res) => {
  try {
    // data fetch from request body
    const {
      firstName,
      lastName,
      email,
      password,
      confirmPassword,
      accountType,
      contactNumber,
      otp,
    } = req.body;

    // validate
    if (
      !firstName ||
      !lastName ||
      !email ||
      !password ||
      !confirmPassword ||
      !otp
    ) {
      return res.status(403).json({
        success: false,
        message: "All fields are required",
      });
    }

    // Password Match
    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "Password and ConfirmPassword is not matching",
      });
    }

    // check user already exist or not
    const UserPresent = User.findOne({ emai });
    if (UserPresent) {
      return res.status(401).json({
        success: false,
        message: "User is already exist with this email",
      });
    }

    // find most recent OTP stored for the user
    const recentOtp = await OTP.find({ email })
      .sort({ createdAt: -1 })
      .limit(1);
    if (recentOtp.length == 0) {
      return res.status(400).json({
        success: false,
        message: "Otp Is not found",
      });
    } else if (otp != recentOtp) {
      // Validate the OTP
      return res.status(400).json({
        success: false,
        message: "Otp is not correct",
      });
    }

    // Hash Password
    const hashedPassword = await bcrypt.hash(password, 10);

    // entry create in DB
    const profileDetail = await Profile.create({
      gender: null,
      dateofBirth: null,
      about: null,
      contactNumber: null,
    });
    const user = await User.create({
      firstName,
      lastName,
      email,
      contactNumber,
      password: hashedPassword,
      accountType,
      additionalDetails: profileDetail._id,
      image: `https://api.dicebear.com/5.x/initials/svg?seed=${firstName} ${lastName}`,
    });

    // return
    return res.status(200).json({
      success: true,
      message: "User is registered Successfully",
      user,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// LOGIN
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(403).json({
        success: false,
        message: "All fields are required,please try again",
      });
    }
    const user = await User.findOne({ email }).populate("additionalDetails");
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "First Register the user",
      });
    }

    if (await bcrypt.compare(password, user.password)) {
      const payload = {
        email: user.email,
        id: user._id,
        accountType: user.accountType,
      };
      const token = jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn: "2h",
      });
      user.token = token;
      user.password = undefined;
      const options = {
        expires: new Date(Date.now() + 3 * 24 * 60 * 60 * 100),
        httpOnly: true,
      };
      res.cookie("token", token, options).status(200).json({
        success: true,
        token,
        user,
        message: "Logged In Successfully",
      });
    } else {
      return res.status(401).json({
        success: false,
        message: "Password is Incorrect",
      });
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Change Password
exports.changePassword = async (req, res) => {
  // get data from req body
  // get oldPassword, newPassword, confirmNewPassword
  // Validation
  // Update Password in DataBase
  // Send Mail - Password Updated
  // return response
};
