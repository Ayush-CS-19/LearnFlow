const { default: mongoose } = require("mongoose");
const { instance } = require("../config/RazorPay");
const Course = require("../models/Course");
const User = require("../models/User");
const mailSender = require("../utils/mailSender");
const CourseEnrollmentMail = require("../Mail Template/CourseEnrollmentEmail");

// Capture The Payment and Intiate the razorpay order
exports.capturePayment = async (req, res) => {
  // Get CourseId and UserId
  const { course_id } = req.body;
  const user_id = req.user.id;
  // Validation
  if (!course_id) {
    return res.json({
      success: false,
      message: "Please Provide Valid Course Id",
    });
  }
  // Valid CourseId
  let course;
  try {
    course = await Course.findById(course_id);
    // Valid CourseDetails
    if (!course) {
      return res.json({
        success: false,
        message: "Could Not Find The Course",
      });
    }

    // User Already Pay For the Same Course
    const uid = new mongoose.Types.ObjectId(user_id);
    if (course.studentsEnrolled.includes(uid)) {
      return res.json({
        success: false,
        message: "You are Enrolled In The Course Already",
      });
    }
  } catch (err) {
    return res.json({
      success: false,
      message: "Please Provide Valid Course Id",
      error: err.message,
    });
  }
  const amount = course.price;
  const currency = "INR";
  const options = {
    amount: amount * 100,
    currency: currency,
    receipt: Math.random(Date.now()).toString(),
    notes: {
      courseId: course_id,
      userId: user_id,
    },
  };
  try {
    const paymentResponse = await instance.orders.create(options);
    console.log(paymentResponse);
    return res.status.json({
      success: true,
      courseName: course.courseName,
      courseDescriptions: course.courseDescription,
      thumbnail: course.thumbnail,
      orderId: paymentResponse.id,
      currency: paymentResponse.currency,
      amount: paymentResponse.amount,
    });
  } catch (err) {
    res.json({
      success: false,
      message: "Could not intiate order",
      error: err.message,
    });
  }
};

// Verify Signature of RazorPay and Server
exports.verifySignature = async (req, res) => {
  const webhookSecret = "12345678";
  const signature = req.header["x-razorpay-signature"];
  const shaSum = crypto.createHmac("sha256", webhookSecret);
  shaSum.update(JSON.stringify(req.body));
  const digest = shaSum.digest("hex");
  if (signature === digest) {
    console.log("Payment is Authorized");
    const { courseId, userId } = req.body.payload.payment.entity.notes;
    try {
      // Fullfill the actions
      // Find the course
      const enrolledCourse = await Course.findOneAndUpdate(
        { _id: courseId },
        { $push: { studentsEnrolled: userId } },
        { new: true }
      );
      if (!enrolledCourse) {
        return res.status(500).json({
          success: false,
          message: "Course Not Found",
        });
      }
      console.log(enrolledCourse);
      // Find the student and add the course to their list of enrolled courses
      const enrolledStudent = await User.findOneAndUpdate(
        { _id: userId },
        { $push: { courses: courseId } },
        { new: true }
      );
      if (!enrolledStudent) {
        return res.status(500).json({
          success: false,
          message: "Student Not Found",
        });
      }
      console.log(enrolledStudent);
      const emailResponse = await mailSender(
        enrolledStudent.email,
        "Congratulation from LearnFlow",
        "Congratulations, you are onboarded into new LearnFlow Course"
      );
      return res.status(200).json({
        success: true,
        message: "Payment Successfully done",
      });
    } catch (err) {
      return res.json({
        success: false,
        message: "Payment Failed",
      });
    }
  }
};
