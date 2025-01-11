import mongoose from "mongoose";
import Joi from "joi";
import JoiDate from "@joi/date"; // For Joi date validation
import WorkoutLogSchema from "./WorkoutLogSchema.js";

const JoiExtended = Joi.extend(JoiDate);

// Exercise Subdocument Schema
const exerciseSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    weight: { type: Number, required: true },
    sets: { type: Number, required: true },
    targetReps: { type: Number, required: true },
    actualReps: { type: [Number] },
    rpe: { type: Number },
    rest: { type: Number },
  },
  {
    timestamps: true,
  }
);

// Day Subdocument Schema
const daySchema = new mongoose.Schema(
  {
    dayNumber: { type: Number, required: true },
    exercises: [exerciseSchema],
  },
  { _id: false }
);

// Week Subdocument Schema
const weekSchema = new mongoose.Schema({
  weekNumber: { type: Number, required: true },
  days: [daySchema],
});

// Workout Program Schema
const workoutProgramSchema = new mongoose.Schema(
  {
    clientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    programName: { type: String, required: true },
    weeks: [weekSchema],
    currentWeek: { type: Number, default: 1 },
    currentDay: { type: Number, default: 1 },
    startDate: { type: Date, required: true },
    completed: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Middleware to handle transfer to WorkoutLogSchema
workoutProgramSchema.pre("save", async function (next) {
  if (this.completed && this.isModified("completed")) {
    try {
      const workoutLogEntry = new WorkoutLogSchema({
        clientId: this.clientId,
        workoutId: this._id,
      });
      await workoutLogEntry.save();
      console.log("Workout transferred to WorkoutLog");
    } catch (error) {
      console.error("Error transferring workout to WorkoutLog:", error);
    }
  }
  next();
});

// Joi Validation Schema
const exerciseJoiSchema = JoiExtended.object({
  name: JoiExtended.string().required(),
  weight: JoiExtended.number().required(),
  sets: JoiExtended.number().required(),
  targetReps: JoiExtended.number().required(),
  actualReps: JoiExtended.array().items(JoiExtended.number()),
  rpe: JoiExtended.number(),
  rest: JoiExtended.number(),
});

const dayJoiSchema = JoiExtended.object({
  dayNumber: JoiExtended.number().required(),
  exercises: JoiExtended.array().items(exerciseJoiSchema).required(),
});

const weekJoiSchema = JoiExtended.object({
  weekNumber: JoiExtended.number().required(),
  days: JoiExtended.array().items(dayJoiSchema).required(),
});

export const workoutProgramJoiSchema = JoiExtended.object({
  clientId: JoiExtended.string().required(),
  programName: JoiExtended.string().required(),
  weeks: JoiExtended.array().items(weekJoiSchema).required(),
  currentWeek: JoiExtended.number().default(1),
  currentDay: JoiExtended.number().default(1),
  startDate: JoiExtended.date().format("YYYY-MM-DD").required(),
  completed: JoiExtended.boolean().default(false),
});

// Export the Mongoose model
const WorkoutSchema = mongoose.model("Workouts", workoutProgramSchema);

export default WorkoutSchema;
