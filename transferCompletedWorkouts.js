import WorkoutSchema from "./models/WorkoutSchema.js";
import WorkoutLogSchema from "./models/WorkoutLogSchema.js";

const transferCompletedWorkouts = async () => {
  try {
    // Find all completed workouts that need to be transferred
    const completedWorkouts = await WorkoutSchema.find({ completed: true });

    if (completedWorkouts.length === 0) {
      console.log("No completed workouts to transfer.");
      return;
    }

    // Map completed workouts to the log schema structure
    const logs = completedWorkouts.map((workout) => ({
      clientId: workout.clientId,
      workoutId: workout._id,
    }));

    // Save logs to the WorkoutLog schema
    await WorkoutLogSchema.insertMany(logs);

    console.log(`${logs.length} completed workouts transferred to WorkoutLog.`);
  } catch (error) {
    console.error("Error transferring completed workouts:", error);
  }
};

// Run the transfer function
// transferCompletedWorkouts();
