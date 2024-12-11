import WorkoutSchema from "../models/WorkoutSchema.js";

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
    const updatedWorkoutPrograms = await WorkoutSchema.find({});
    return res.json({ workoutProgram, updatedWorkoutPrograms });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ err: "Something went wrong" });
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
    const updatedWorkoutPrograms = await WorkoutProgram.find({});
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
