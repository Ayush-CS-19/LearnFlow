const User = require("../models/User");
const mailSender = require("../utils/mailSender");
const bcrypt = require("bcrypt");
// ResetPasswordToken
exports.resetPasswordToken = async (req, res) => {
  try {
    // get email from req Body
    const email = req.body.email;
    // Check user for this email, email validation
    const user = await User.findOne({ email: email });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Your Email us not registered with us",
      });
    }
    // genrate token
    const token = crypto.randomUUID();
    // Update user by adding token and expiration time
    const updatedDetails = await User.findOneAndUpdate(
      { email: email },
      {
        token: token,
        resetPasswordExpires: Date.now() + 5 * 60 * 1000,
      },
      {
        //  IT WILL SHOW YOUR UPDATED DOCUMENT
        new: true,
      }
    );
    // Create URL
    const URL = `http://localhost3000/update-password/${token}`;
    // Send mail containing the url
    await mailSender(
      email,
      "Password Reset Link",
      `Password Reset Link : ${URL}`
    );
    // Return response
    return res.status(200).json({
      success: true,
      message:
        "Email Sent Successfully, Please Check Your email and change pwd",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Something went wrong",
      error: error.message,
    });
  }
};
// ResetPassword
exports.resetPassword = async (req, res) => {
  try {
    // Data Fetch
    const { password, confirmPassword, token } = req.body;
    // Validation
    if (password !== confirmPassword) {
      return res.status(401).json({
        success: false,
        message: "Password is not Matching",
      });
    }
    // get User Details from Db using token
    const userDetails = await User.findOne({ token: token });
    // if no entry - invalid token
    if (!userDetails) {
      return res.status(400).json({
        success: false,
        message: "Token is Invalid",
      });
    }
    // token time check
    if (userDetails.resetPasswordExpires < Date.now()) {
      return res.status(400).json({
        success: false,
        message: "Reset Password Time Expires,Please Regenrate Your Token",
      });
    }
    // hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    await User.findOneAndUpdate(
      { token: token },
      { password: hashedPassword },
      { new: true }
    );
    // Update the password in DB
    return res.status(200).json({
      success: true,
      message: "Password Is Changed Successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Something went wrong",
      error: error.message,
    });
  }
};
