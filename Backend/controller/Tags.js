const Tag = require("../models/Tags");
exports.createTag = async (req, res) => {
  try {
    const { name, description } = req.body;
    if (!name || !description) {
      res.status(401).json({
        success: false,
        message: "All Fields are required",
      });
      const tagDetails = await Tag.create({
        name: name,
        description: description,
      });
      return res.status(200).json({
        success: true,
        message: "Tag Created Successfully",
      });
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Something went wrong",
      error: error.message,
    });
  }
};

exports.showAllTag = async (req, res) => {
  try {
    const allTag = await Tag.find({}, { name: true, description: true });
    return res.status(200).json({
      success: true,
      message: "All tags returned Successfully",
      allTag,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Something went wrong",
      error: error.message,
    });
  }
};
