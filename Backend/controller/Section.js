const Section = require("../models/Section");
const Course = require("../models/Course");
exports.createSection = async (req, res) => {
  try {
    const { sectionName, courseId } = req.body;
    if (!sectionName || !courseId) {
      return res.status(400).json({
        success: false,
        message: "missing properties",
      });
    }
    const newSection = await Section.create({
      sectionName,
    });
    //   Populate Section and Sub-Section Both in the updatedCourseDetails
    const updateCourse = await Course.findByIdAndUpdate(
      courseId,
      {
        $push: {
          courseContent: newSection._id,
        },
      },
      { new: true }
    );
    if (!updateCourse) {
      return res.status(400).json({
        success: false,
        message: "Updateing Course is Failed",
      });
    }
    return res.status(200).json({
      success: true,
      message: "Section Created Successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Something went wrong",
      error: error.message,
    });
  }
};

exports.updateSection = async (req, res) => {
  try {
    const { SectionId, sectionName } = req.body;
    if (!SectionId || !sectionName) {
      return res.status(401).json({
        success: false,
        message: "Missing Properties",
      });
    }
    const UpdateSection = Section.findByIdAndUpdate(
      { SectionId },
      { sectionName: sectionName },
      { new: true }
    );
    if (!UpdateSection) {
      return res.status(400).json({
        success: false,
        message: "Updating Section Failed",
      });
    }
    return res.status(200).json({
      success: true,
      message: "Updated Section is Sucessfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Something went wrong",
      error: error.message,
    });
  }
};
exports.deleteSection = async (req, res) => {
  try {
    const { SectionId } = req.params;
    if (!SectionId) {
      return res.status(404).json({
        success: false,
        message: "Required Feild is missing",
      });
    }
    const deleteDetails = await Section.findByIdAndDelete(SectionId);
    if (!deleteDetails) {
      return res.status(400).json({
        success: false,
        message: "Section Deletion Failed",
      });
    }
    return res.status(200).json({
      success: true,
      message: "Section Deleted SuccessFully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Something went wrong",
      error: error.message,
    });
  }
};
