import WorkoutLogSchema from "../models/WorkoutLogSchema.js";

// Get all workout logs
export const getWorkoutLogs = async (req, res) => {
  try {
    const workoutLogs = await WorkoutLogSchema.find({})
      .populate("clientId", "first_name last_name role",) // Populate client details
      .populate("workoutId", "programName weeks"); // Populate workout details
    return res.json(workoutLogs);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ err: "Something went wrong" });
  }
};

// Get a workout log by ID
export const getWorkoutLogById = async (req, res) => {
  const id = req.params.id;
  try {
    const workoutLog = await WorkoutLogSchema.findById(id)
      .populate("clientId", "first_name last_name role") // Populate client details
      .populate("workoutId", "programName weeks"); // Populate workout details
    if (!workoutLog) {
      return res.status(404).json({ err: "Workout log not found" });
    }
    return res.json(workoutLog);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ err: "Something went wrong" });
  }
};

// Create a new workout log
export const createWorkoutLog = async (req, res) => {
  const { clientId, workoutId } = req.body;

  try {
    const workoutLog = await WorkoutLogSchema.create({
      clientId,
      workoutId,
    });
    const updatedWorkoutLogs = await WorkoutLogSchema.find({})
      .populate("clientId", "first_name last_name role") // Populate client details
      .populate("workoutId", "programName weeks"); // Populate workout details
    return res.json({ workoutLog, updatedWorkoutLogs });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ err: "Something went wrong" });
  }
};

// Update a workout log
export const updateWorkoutLog = async (req, res) => {
  const id = req.params.id;
  const { clientId, workoutId } = req.body;

  try {
    const workoutLog = await WorkoutLogSchema.findByIdAndUpdate(
      id,
      { clientId, workoutId },
      { new: true, runValidators: true }
    )
      .populate("clientId", "first_name last_name role") // Populate client details
      .populate("workoutId", "programName weeks"); // Populate workout details

    if (!workoutLog) {
      return res.status(404).json({ err: "Workout log not found" });
    }

    const updatedWorkoutLogs = await WorkoutLogSchema.find({})
      .populate("clientId", "first_name last_name role") // Populate client details
      .populate("workoutId", "programName weeks"); // Populate workout details
    return res.json({ workoutLog, updatedWorkoutLogs });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ err: "Something went wrong" });
  }
};

// Delete a workout log
export const deleteWorkoutLog = async (req, res) => {
  const id = req.params.id;
  try {
    const deletedWorkoutLog = await WorkoutLogSchema.findByIdAndDelete(id);
    if (!deletedWorkoutLog) {
      return res.status(404).json({ err: "Workout log not found" });
    }
    const updatedWorkoutLogs = await WorkoutLogSchema.find({})
      .populate("clientId", "first_name last_name role") // Populate client details
      .populate("workoutId", "programName weeks"); // Populate workout details
    return res.json({
      message: `Successfully deleted workout log ${id}!`,
      updatedWorkoutLogs,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ err: "Something went wrong" });
  }
};
