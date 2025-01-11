import WorkoutSchema from "../models/WorkoutSchema.js";
import WorkoutLogSchema from "../models/WorkoutLogSchema.js";
import { workoutProgramJoiSchema } from "../models/WorkoutSchema.js";
import cron from "node-cron";

export const transferCompletedWorkouts = async () => {
  try {
    // Fetch all completed workouts
    const completedWorkouts = await WorkoutSchema.find({ completed: true });

    if (completedWorkouts.length === 0) {
      console.log("No completed workouts to transfer.");
      return;
    }

    // Group completed workouts by clientId
    const groupedWorkouts = completedWorkouts.reduce((acc, workout) => {
      if (!acc[workout.clientId]) {
        acc[workout.clientId] = [];
      }
      acc[workout.clientId].push(workout._id);
      return acc;
    }, {});

    // Iterate through each clientId and update/create workout logs
    for (const clientId in groupedWorkouts) {
      const workoutIds = groupedWorkouts[clientId];

      // Check if a log already exists for this client
      const workoutLog = await WorkoutLogSchema.findOne({ clientId });

      if (workoutLog) {
        // Append new workout IDs to the existing log
        workoutLog.workoutId.push(...workoutIds);
        // Remove duplicates
        workoutLog.workoutId = [...new Set(workoutLog.workoutId)];
        await workoutLog.save();
        console.log(`Updated WorkoutLog for clientId: ${clientId}`);
      } else {
        // Create a new log if none exists
        const newLog = new WorkoutLogSchema({
          clientId,
          workoutId: workoutIds,
        });
        await newLog.save();
        console.log(`Created new WorkoutLog for clientId: ${clientId}`);
      }
    }

    console.log("Completed workouts successfully transferred to WorkoutLogs.");
  } catch (error) {
    console.error("Error transferring completed workouts:", error);
  }
};

cron.schedule("0 0 * * *", () => {
  console.log("Running scheduled transfer of completed workouts...");
  transferCompletedWorkouts();
});

const calculateCurrentWeek = (startDate) => {
  const today = new Date();
  const diffInTime = today - new Date(startDate); // Difference in milliseconds
  const diffInDays = Math.floor(diffInTime / (1000 * 60 * 60 * 24)); // Convert to days
  return Math.floor(diffInDays / 7) + 1; // Convert to weeks (start from Week 1)
};

cron.schedule("0 0 * * 0", async () => {
  // Runs every Sunday at midnight
  console.log("Updating currentWeek for all active workout programs...");

  const workouts = await WorkoutSchema.find({ completed: false });

  for (const workout of workouts) {
    const newWeek = calculateCurrentWeek(workout.startDate);
    if (newWeek !== workout.currentWeek) {
      await WorkoutSchema.findByIdAndUpdate(workout._id, {
        currentWeek: newWeek,
      });
    }
  }
});

export const getWorkoutPrograms = async (req, res) => {
  try {
    const workoutPrograms = await WorkoutSchema.find({});
    return res.json(workoutPrograms);
  } catch (err) {
    console.log(err);
    return res.status(500).json({ err: "Something went wrong" });
  }
};

export const updateCurrentWeekStatus = async (req, res) => {
  const { id } = req.params;
  const { currentWeek, currentDay } = req.body;

  try {
    const workout = await WorkoutSchema.findByIdAndUpdate(
      id,
      { currentWeek: currentWeek, currentDay: currentDay },
      { new: true }
    );

    if (!workout) {
      return res.status(404).json({ error: "Workout program not found" });
    }

    res.status(200).json(workout);
  } catch (err) {
    console.error("Error updating workout program:", err);
    res.status(500).json({ error: "Something went wrong" });
  }
};

export const updateCompleteStatus = async (req, res) => {
  const { id } = req.params;

  try {
    const workout = await WorkoutSchema.findByIdAndUpdate(
      id,
      { completed: true },
      { new: true }
    );

    if (!workout) {
      return res.status(404).json({ error: "Workout program not found" });
    }

    res.status(200).json(workout);
  } catch (err) {
    console.error("Error updating workout program:", err);
    res.status(500).json({ error: "Something went wrong" });
  }
};

export const getUnCompletedWorkouts = async (req, res) => {
  const { clientId } = req.params;

  try {
    // Find completed workouts for the given clientId
    const completedWorkouts = await WorkoutSchema.find({
      clientId,
      completed: false,
    }).sort({ startDate: 1 }); // Sort by startDate (oldest to newest)

    // Check if there are completed workouts
    if (!completedWorkouts.length) {
      return res
        .status(404)
        .json({ message: "No completed workouts found for this user." });
    }

    res.status(200).json([completedWorkouts[0]]);
  } catch (error) {
    console.error("Error fetching uncompleted workouts:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getClientWorkoutPrograms = async (req, res) => {
  const { clientId } = req.query; // Extract clientId from query parameters
  console.log(clientId, "clientId");

  if (!clientId) {
    return res
      .status(400)
      .json({ error: "clientId query parameter is required" });
  }

  try {
    // Query the database for workouts with the specified clientId
    const workouts = await WorkoutSchema.find({ clientId });
    console.log(workouts, "workouts");

    // If no workouts are found
    if (!workouts.length) {
      return res
        .status(404)
        .json({ error: "No workouts found for this clientId" });
    }

    // const currentWeek = calculateCurrentWeek(workouts.startDate);

    res.status(200).json(workouts);
  } catch (err) {
    console.error("Error fetching workouts:", err);
    return res.status(500).json({ error: "Something went wrong" });
  }
};

export const getWorkoutProgramById = async (req, res) => {
  const { id } = req.params;

  try {
    const workout = await WorkoutSchema.findById(id);
    if (!workout) {
      return res.status(404).json({ error: "Workout program not found" });
    }

    const currentWeek = calculateCurrentWeek(workout.startDate);

    res.status(200).json({ ...workout.toObject(), currentWeek });
  } catch (err) {
    console.error("Error fetching workout program:", err);
    res.status(500).json({ error: "Something went wrong" });
  }
};

export const createWorkoutProgram = async (req, res) => {
  try {
    // Validate request body
    const { error } = workoutProgramJoiSchema.validate(req.body, {
      abortEarly: false,
    });
    if (error) {
      return res
        .status(400)
        .json({ error: error.details.map((e) => e.message) });
    }

    // Save to the database
    const newWorkoutProgram = await WorkoutSchema.create(req.body);
    return res.status(201).json(newWorkoutProgram);
  } catch (err) {
    console.error("Error creating workout program:", err.message);
    return res.status(500).json({ error: "Something went wrong" });
  }
};

const filterProgramData = (data, day, week) => {
  return data
    .flatMap((program) =>
      program.weeks
        .filter((w) => w.weekNumber === week)
        .flatMap((w) => w.days.filter((d) => d.dayNumber === day))
    )
    .flatMap((day) => day.exercises);
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

    console.log(updatedWorkoutPrograms);

    let weight = 10;

    const filteredProgram = filterProgramData([updatedWorkoutPrograms], 1, 1);

    for (let i = 0; i < filteredProgram.length; i++) {
      console.log(filteredProgram[i].targetReps);
      let targetReps = filteredProgram[i].targetReps;
      for (let j = 0; j < filteredProgram[i].actualReps.length; j++) {
        console.log(filteredProgram[i].actualReps[j]);
        let reps = filteredProgram[i].actualReps[j];
        console.log(reps, "reps", targetReps, "targetReps");

        if (reps >= targetReps) {
          console.log("Reps are greater than or equal to target reps");
          weight += 5;
          console.log("Weight is now: ", weight);
        } else {
          console.log("Reps are less than target reps");
          weight -= 5;
          console.log("Weight is now: ", weight);
        }
      }
    }
    console.log(weight);
    return res.json([updatedWorkoutPrograms]);
  } catch (error) {
    console.error("Error updating actualReps:", error);
  }
};

export const addWeekToWorkout = async (req, res) => {
  const { workoutId } = req.params; // Extract the workoutId from the request parameters

  try {
    // Validate required parameter
    if (!workoutId) {
      return res
        .status(400)
        .json({ message: "Missing required parameter: workoutId" });
    }

    // Find the workout to get the current number of weeks
    const workout = await WorkoutSchema.findById(workoutId);
    if (!workout) {
      return res.status(404).json({ message: "Workout not found" });
    }

    // Calculate the next week number
    const nextWeekNumber = workout.weeks.length + 1;

    // Define the new week structure
    const newWeek = {
      weekNumber: nextWeekNumber,
      days: [
        {
          dayNumber: 1,
          exercises: [
            {
              name: "",
              weight: 0,
              sets: 0,
              targetReps: 0,
              actualReps: [],
              rpe: 0,
              rest: 0,
            },
          ],
        },
      ],
    };

    // Add the new week to the workout's weeks array
    const result = await WorkoutSchema.updateOne(
      { _id: workoutId },
      { $push: { weeks: newWeek } } // Append the new week to the weeks array
    );

    // Check if the update was successful
    if (result.modifiedCount === 0) {
      return res.status(404).json({ message: "Failed to add new week" });
    }

    // Return success response
    res.status(200).json({ message: "Week added successfully", newWeek });
  } catch (error) {
    console.error("Error adding week to workout:", error);
    res.status(500).json({ message: "Internal Server Error", error });
  }
};

export const deleteWeekFromWorkout = async (req, res) => {
  const { workoutId, weekNumber } = req.params; // Extract workoutId and weekNumber from request parameters

  try {
    // Validate required parameters
    if (!workoutId || !weekNumber) {
      return res.status(400).json({
        message: "Missing required parameters: workoutId or weekNumber",
      });
    }

    // Perform update to remove the specific week
    const result = await WorkoutSchema.updateOne(
      { _id: workoutId },
      { $pull: { weeks: { weekNumber: parseInt(weekNumber) } } }
    );

    // Check if any document was modified
    if (result.modifiedCount === 0) {
      return res
        .status(404)
        .json({ message: "Week not found or could not be deleted" });
    }

    // Return success response
    res
      .status(200)
      .json({ message: `Week ${weekNumber} deleted successfully` });
  } catch (error) {
    console.error("Error deleting week from workout:", error);
    res.status(500).json({ message: "Internal Server Error", error });
  }
};

export const addDayToWeek = async (req, res) => {
  const { workoutId, weekNumber } = req.params; // Extract workoutId and weekNumber from request parameters

  try {
    // Validate required parameters
    if (!workoutId || !weekNumber) {
      return res.status(400).json({
        message: "Missing required parameters: workoutId or weekNumber",
      });
    }

    // Find the workout to get the current number of days in the specified week
    const workout = await WorkoutSchema.findOne({ _id: workoutId });
    if (!workout) {
      return res.status(404).json({ message: "Workout not found" });
    }

    // Find the target week
    const targetWeek = workout.weeks.find(
      (week) => week.weekNumber === parseInt(weekNumber)
    );

    if (!targetWeek) {
      return res.status(404).json({ message: "Week not found" });
    }

    // Calculate the next day number
    const nextDayNumber = targetWeek.days.length + 1;

    // Create the new day
    const newDay = {
      dayNumber: nextDayNumber,
      exercises: [
        {
          name: "",
          weight: 0,
          sets: 0,
          targetReps: 0,
          actualReps: [],
          rpe: 0,
          rest: 0,
        },
      ],
    };

    // Add the new day to the specified week
    const result = await WorkoutSchema.updateOne(
      { _id: workoutId, "weeks.weekNumber": parseInt(weekNumber) },
      { $push: { "weeks.$.days": newDay } }
    );

    // Check if the update was successful
    if (result.modifiedCount === 0) {
      return res
        .status(404)
        .json({ message: "Failed to add new day to the specified week" });
    }

    res.status(200).json({
      message: `Day ${nextDayNumber} added successfully to Week ${weekNumber}`,
      newDay,
    });
  } catch (error) {
    console.error("Error adding day to week:", error);
    res.status(500).json({ message: "Internal Server Error", error });
  }
};

export const getWorkoutByDayAndWeek = async (req, res) => {
  const { workoutId, weekNumber, dayNumber } = req.params;

  try {
    // Validate required parameters
    if (!workoutId || !weekNumber || !dayNumber) {
      return res.status(400).json({
        message:
          "Missing required parameters: workoutId, weekNumber, or dayNumber",
      });
    }

    // Find the workout program by ID
    const workout = await WorkoutSchema.findById(workoutId);

    if (!workout) {
      return res.status(404).json({ message: "Workout program not found" });
    }

    // Find the target week
    const targetWeek = workout.weeks.find(
      (week) => week.weekNumber === parseInt(weekNumber)
    );

    if (!targetWeek) {
      return res.status(404).json({ message: "Week not found" });
    }

    // Find the target day
    const targetDay = targetWeek.days.find(
      (day) => day.dayNumber === parseInt(dayNumber)
    );

    if (!targetDay) {
      return res.status(404).json({ message: "Day not found" });
    }

    res.status(200).json(targetDay);
  } catch (error) {
    console.error("Error fetching workout by day and week:", error);
    res.status(500).json({ message: "Internal Server Error", error });
  }
};

export const deleteDayFromWeek = async (req, res) => {
  const { workoutId, weekNumber, dayNumber } = req.params; // Extract parameters

  try {
    // Validate required parameters
    if (!workoutId || !weekNumber || !dayNumber) {
      return res.status(400).json({
        message:
          "Missing required parameters: workoutId, weekNumber, or dayNumber",
      });
    }

    // Perform update to remove the specific day
    const result = await WorkoutSchema.updateOne(
      { _id: workoutId },
      {
        $pull: {
          "weeks.$[week].days": { dayNumber: parseInt(dayNumber) },
        },
      },
      {
        arrayFilters: [{ "week.weekNumber": parseInt(weekNumber) }],
      }
    );

    // Check if any document was modified
    if (result.modifiedCount === 0) {
      return res
        .status(404)
        .json({ message: "Day not found or could not be deleted" });
    }

    res.status(200).json({
      message: `Day ${dayNumber} deleted successfully from Week ${weekNumber}`,
    });
  } catch (error) {
    console.error("Error deleting day from week:", error);
    res.status(500).json({ message: "Internal Server Error", error });
  }
};

export const updateWorkoutProgram = async (req, res) => {
  const { workoutId, weekNumber, dayNumber, exerciseId } = req.params;
  const { actualReps, weight, name, rpe, sets, targetReps } = req.body;

  try {
    // Validate required fields
    if (!workoutId || !weekNumber || !dayNumber || !exerciseId) {
      return res.status(400).json({ message: "Missing required parameters" });
    }
    // if (actualReps === undefined && weight === undefined) {
    //   return res.status(400).json({
    //     message: "At least one field (actualReps or weight) is required",
    //   });
    // }

    // Build update object
    const updateFields = {};
    if (actualReps !== undefined) {
      updateFields[
        "weeks.$[week].days.$[day].exercises.$[exercise].actualReps"
      ] = actualReps;
    }

    if (weight !== undefined) {
      updateFields["weeks.$[week].days.$[day].exercises.$[exercise].weight"] =
        weight;
    }

    if (name !== undefined) {
      updateFields["weeks.$[week].days.$[day].exercises.$[exercise].name"] =
        name;
    }

    if (rpe !== undefined) {
      updateFields["weeks.$[week].days.$[day].exercises.$[exercise].rpe"] = rpe;
    }

    if (sets !== undefined) {
      updateFields["weeks.$[week].days.$[day].exercises.$[exercise].sets"] =
        sets;
    }

    if (targetReps !== undefined) {
      updateFields[
        "weeks.$[week].days.$[day].exercises.$[exercise].targetReps"
      ] = targetReps;
    }

    // Perform update
    const result = await WorkoutSchema.updateOne(
      { _id: workoutId },
      { $set: updateFields },
      {
        arrayFilters: [
          { "week.weekNumber": parseInt(weekNumber) },
          { "day.dayNumber": parseInt(dayNumber) },
          { "exercise._id": exerciseId },
        ],
        new: true, // Ensure the result includes the updated document
      }
    );

    // Check if any document was modified
    if (result.modifiedCount === 0) {
      return res
        .status(404)
        .json({ message: "Exercise not found or no changes were made" });
    }

    // Return success response
    res.status(200).json({ message: "Exercise updated successfully", result });
  } catch (error) {
    console.error("Error updating workout program:", error);
    res.status(500).json({ message: "Internal Server Error", error });
  }
};

// PUT /workouts/:id/progress
export const updateProgress = async (req, res) => {
  const { id } = req.params;
  const { newWeek } = req.body;

  try {
    const updatedWorkout = await WorkoutSchema.findByIdAndUpdate(
      id,
      { currentWeek: newWeek },
      { new: true }
    );

    if (!updatedWorkout) {
      return res.status(404).json({ error: "Workout program not found" });
    }

    res.status(200).json(updatedWorkout);
  } catch (err) {
    console.error("Error updating progress:", err);
    res.status(500).json({ error: "Something went wrong" });
  }
};

export const deleteWorkoutProgram = async (req, res) => {
  const { id } = req.params;

  try {
    // Attempt to delete the workout program by ID
    const deletedWorkoutProgram = await WorkoutSchema.findByIdAndDelete(id);

    // If no document was deleted, return a 404 error
    if (!deletedWorkoutProgram) {
      return res.status(404).json({ error: "Workout program not found" });
    }

    // Return a success response
    return res.status(200).json({
      message: `Successfully deleted workout program with ID: ${id}`,
      deletedWorkoutProgram,
    });
  } catch (err) {
    console.error("Error deleting workout program:", err.message);

    // Handle specific Mongoose CastError (invalid ObjectId)
    if (err.name === "CastError") {
      return res
        .status(400)
        .json({ error: "Invalid workout program ID format" });
    }

    // Handle general errors
    return res.status(500).json({ error: "Something went wrong" });
  }
};
