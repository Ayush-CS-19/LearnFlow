const Profile = require("../models/Profile");
const User = require("../models/User");
exports.updateProfile = async (req, res) => {
  try {
    const { dateOfBirth, about, contactNumber, gender } = req.body;
    const user = req.user._id;
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Missing SubSectionID",
      });
    }

    const userDetails = await User.findById(user);
    const profileId = userDetails.additionalDetails;
    const profile = Profile.findById(profileId);
    if (!profile) {
      return res.status(404).json({
        success: false,
        message: "SubSection not found",
      });
    }

    if (dateOfBirth) profile.dateOfBirth = dateOfBirth;
    if (about) profile.about = about;
    if (gender) profile.gender = gender;
    if (contactNumber) profile.contactNumber = contactNumber;
    await profile.save();
    return res.status(200).json({
      success: true,
      message: "Updated the details of Profile",
      data: profile,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Something went wrong",
      error: error.message,
    });
  }
};

exports.deleteAccount = async (req, res) => {
  try {
    const userId = req.user._id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "User ID not found",
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    user.markedForDeletion = true;
    user.deletionDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days from now
    await user.save();

    return res.status(200).json({
      success: true,
      message: "Your account is scheduled for deletion after 30 days.",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Something went wrong",
      error: error.message,
    });
  }
};

exports.undoDeleteAccount = async (req, res) => {
  try {
    const userId = req.user._id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "User ID not found",
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    user.markedForDeletion = false;
    user.deletionDate = null;
    await user.save();

    return res.status(200).json({
      success: true,
      message: "Your account is scheduled for deletion is Deactivated.",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Something went wrong",
      error: error.message,
    });
  }
};

exports.getAllUserDetails = async (req, res) => {
  try {
    const userId = req.user._id;
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User Id is not found",
      });
    }
    const UserDetails = await User.findById(userId)
      .populate("additionalDetails")
      .exec();
    if (!UserDetails) {
      return res.status(400).json({
        success: false,
        message: "User Details is not Found",
      });
    }
    return res.status(200).json({
      success: true,
      message: "User Data Fetched Successfully",
      UserDetails,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Something Went Wrong",
      error: error.message,
    });
  }
};
