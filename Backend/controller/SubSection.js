const Section = require("../models/Section");
const SubSection = require("../models/SubSection");
const Course = require("../models/Course");
const { uploadVideoToCloudinary } = require("../utils/imageUploader");
exports.createSubsection = async (req, res) => {
  try {
    const { SectionId, title, timeDuration, description } = req.body;
    const { video } = req.files.videoFile;
    if (!SectionId || !title || !timeDuration || !description || !video) {
      return res.status(404).json({
        success: false,
        message: "Missing Field",
      });
    }
    const uploadDetails = await uploadVideoToCloudinary(
      video,
      process.env.FOLDER_NAME
    );
    const SubSectionDetails = await SubSection.create({
      title,
      timeDuration,
      description,
      videoUrl: uploadDetails.secure_url,
    });
    const SectionCheck = await Section.findByIdAndUpdate(
      { SectionId },
      {
        $push: {
          subSection: SubSectionDetails._id,
        },
      },
      { new: true }
    );
    if (!SectionCheck) {
      return res.status(404).json({
        success: false,
        message: "Section is Not Found",
      });
    }
    return res.status(200).json({
      success: true,
      message: "SubSection Created Successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Something went wrong",
      error: error.message,
    });
  }
};

exports.updateSubSection = async (req, res) => {
  try {
    const { SubSectionID } = req.params;
    const { new_title, new_description, new_timeDuration } = req.body;
    const new_video = req?.files?.videoFile;

    if (!SubSectionID) {
      return res.status(400).json({
        success: false,
        message: "Missing SubSectionID",
      });
    }

    const subSection = await SubSection.findById(SubSectionID);
    if (!subSection) {
      return res.status(404).json({
        success: false,
        message: "SubSection not found",
      });
    }

    if (new_title) subSection.title = new_title;
    if (new_description) subSection.description = new_description;
    if (new_timeDuration) subSection.timeDuration = new_timeDuration;

    if (new_video) {
      const new_video_url = await uploadVideoToCloudinary(
        new_video,
        process.env.FOLDER_NAME
      );
      subSection.videoUrl = new_video_url.secure_url;
    }

    await subSection.save();

    return res.status(200).json({
      success: true,
      message: "Updated the details of SubSection",
      data: subSection,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Something went wrong",
      error: error.message,
    });
  }
};
exports.DeleteSubSection = async (req, res) => {
  try {
    const { SubSectionId } = req.params;
    if (!SubSectiondId) {
      return res.status(400).json({
        success: false,
        message: "Id is not Found",
      });
    }
    const deleteDetails = await SubSection.findByIdAndDelete(SubSectionId);
    if (!deleteDetails) {
      return res.status(404).json({
        success: false,
        message: "SubSection not found",
      });
    }
    return res.status(200).json({
      success: true,
      message: "Section Deleted Successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Something Went Wrong",
      error: error.message,
    });
  }
};
