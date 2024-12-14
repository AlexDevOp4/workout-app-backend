import WorkoutSchema from "../models/WorkoutSchema.js";
import WorkoutLogSchema from "../models/WorkoutLogSchema.js";

export const getWorkoutPrograms = async (req, res) => {
  try {
    const workoutPrograms = await WorkoutSchema.find({});
    return res.json(workoutPrograms);
  } catch (err) {
    console.log(err);
    return res.status(500).json({ err: "Something went wrong" });
  }
};

export const getWorkoutProgramById = async (req, res) => {
  const id = req.params.id;
  try {
    const workoutProgram = await WorkoutSchema.findById(id);
    if (!workoutProgram) {
      return res.status(404).json({ err: "Workout program not found" });
    }
    return res.json(workoutProgram);
  } catch (err) {
    console.log(err);
    return res.status(500).json({ err: "Something went wrong" });
  }
};

export const createWorkoutProgram = async (req, res) => {
  const { clientId, programName, weeks } = req.body;

  try {
    const workoutProgram = await WorkoutSchema.create({
      clientId,
      programName,
      weeks,
    });

    const workoutLog = await WorkoutLogSchema.findOneAndUpdate(
      { clientId: clientId },
      { $push: { workoutId: workoutProgram._id } }
    );

    const updatedWorkoutPrograms = await WorkoutSchema.find({});
    return res.json({ workoutProgram, updatedWorkoutPrograms, workoutLog });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ err: "Something went wrong" });
  }
};
export const updateActualReps = async (req, res) => {
  const workoutId = req.params.id;
  const { exerciseId, newActualReps } = req.body;

  try {
    // Update the actualReps field for the specific exercise
    const result = await WorkoutSchema.updateOne(
      {
        _id: workoutId,
        "weeks.days.exercises._id": exerciseId,
      },
      {
        $set: {
          "weeks.$[week].days.$[day].exercises.$[exercise].actualReps":
            newActualReps,
        },
      },
      {
        arrayFilters: [
          { "week.days.exercises._id": exerciseId }, // Match the week containing the exercise
          { "day.exercises._id": exerciseId }, // Match the day containing the exercise
          { "exercise._id": exerciseId }, // Match the specific exercise
        ],
      }
    );

    const updatedWorkoutPrograms = await WorkoutSchema.findById(workoutId);
    return res.json([updatedWorkoutPrograms]);
  } catch (error) {
    console.error("Error updating actualReps:", error);
  }
};

export const updateWorkoutProgram = async (req, res) => {
  const id = req.params.id;
  const { clientId, programName, weeks } = req.body;

  try {
    const workoutProgram = await WorkoutSchema.findByIdAndUpdate(
      id,
      { clientId, programName, weeks },
      { new: true, runValidators: true }
    );
    if (!workoutProgram) {
      return res.status(404).json({ err: "Workout program not found" });
    }
    const updatedWorkoutPrograms = await WorkoutSchema.find({});
    return res.json({ workoutProgram, updatedWorkoutPrograms });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ err: "Something went wrong" });
  }
};

export const deleteWorkoutProgram = async (req, res) => {
  const id = req.params.id;
  try {
    const deletedWorkoutProgram = await WorkoutSchema.findByIdAndDelete(id);
    if (!deletedWorkoutProgram) {
      return res.status(404).json({ err: "Workout program not found" });
    }
    const updatedWorkoutPrograms = await WorkoutSchema.find({});
    console.log("Updated Workout Programs List", updatedWorkoutPrograms);
    return res.json({
      message: `Successfully deleted workout program ${id}!`,
      updatedWorkoutPrograms,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ err: "Something went wrong" });
  }
};
