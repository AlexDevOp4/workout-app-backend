import ExerciseModel from "../models/ExerciseSchema.js";

export const getExercises = async (req, res) => {
  try {
    const exercises = await ExerciseModel.find({});
    return res.json(exercises);
  } catch (err) {
    console.log(err);
    return res.status(500).json({ err: "Something went wrong" });
  }
};

export const getExercisebyId = async (req, res) => {
  const id = req.params.id;
  try {
    const exercise = await ExerciseModel.findById(id);
    return res.json(exercise);
  } catch (err) {
    console.log(err);
    return res.status(500).json({ err: "Something went wrong" });
  }
};

export const createExercises = async (req, res) => {
  const { name, bodyPart, videoLink } = req.body;

  try {
    const exercise = await ExerciseModel.create({
      name,
      bodyPart,
      videoLink,
    });
    const updateExercise = await ExerciseModel.find({});
    return res.json({ exercise, updateExercise });
  } catch (err) {
    console.log(err, "Something went wrong");

    return res.json(err);
  }
};

export const deleteExercise = async (req, res) => {
  const id = req.params.id;
  try {
    await ExerciseModel.findByIdAndDelete(id);
    const updateExercise = await ExerciseModel.find({});
    console.log("This is an updated Exercise List ", updateExercise);
    return res.json({
      message: `Successfully deleted ${id}!`,
      updateExercise,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ err: "Something went wrong" });
  }
};
