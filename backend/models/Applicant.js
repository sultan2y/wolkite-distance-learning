import mongoose from "mongoose"

const applicantSchema = mongoose.Schema(
  {
    regId: {
      type: String,
      required: true,
      unique: true,
    },
    firstName: {
      type: String,
      required: true,
    },
    middleName: {
      type: String,
      required: true,
    },
    lastName: {
      type: String,
      required: true,
    },
    birthDate: {
      type: Date,
      required: true,
    },
    sex: {
      type: String,
      required: true,
      enum: ["Male", "Female"],
    },
    town: {
      type: String,
      required: true,
    },
    woreda: {
      type: String,
      required: true,
    },
    address: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    department: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      required: true,
    },
    semester: {
      type: Number,
      required: true,
    },
    year: {
      type: Number,
      required: true,
    },
    photo: {
      type: String,
      required: true,
    },
    grade10File: {
      type: String,
      required: true,
    },
    grade12File: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      required: true,
      default: "Pending",
      enum: ["Pending", "Approved", "Rejected"],
    },
  },
  {
    timestamps: true,
  },
)

const Applicant = mongoose.model("Applicant", applicantSchema)

export default Applicant

