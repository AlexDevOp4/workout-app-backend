import UserSchema from "../models/UserSchema.js";
import mongoose from "mongoose";
// Get Routes
export const getUsers = async (req, res) => {
  try {
    const { role } = req.query; // Get query parameter
    const filter = role ? { role } : {}; // Apply filter if role is provided
    const user = await UserSchema.find(filter); // hide these fields in the get
    console.log(user);
    return res.json(user);
  } catch (err) {
    console.log(err);

    return res.status(500).json({ err: "Something went wrong" });
  }
};

export const getUserbyId = async (req, res) => {
  console.log("Received request for user:", req.params.id);
  const id = req.params.id;

  // Validate the ID format
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ error: "Invalid user ID format" });
  }

  try {
    const user = await UserSchema.findById(id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.status(201).json(user);
  } catch (err) {
    console.error("Error fetching user:", err);
    res.status(500).json({ error: "Something went wrong" });
  }
};

export const getUserbyFirebaseUID = async (req, res) => {
  const { firebaseUID } = req.query; // Access query parameter
  if (!firebaseUID) {
    return res
      .status(400)
      .json({ error: "firebaseUID query parameter is required" });
  }

  try {
    const user = await UserSchema.findOne({ firebaseUID });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    return res.status(201).json(user);
  } catch (err) {
    console.error("Error fetching user:", err);
    return res.status(500).json({ error: "Something went wrong" });
  }
};

// Create an user and assign an existing role to that user
export const createUser = async (req, res) => {
  const { role, email, first_name, last_name, trainerId, firebaseUID } =
    req.body;

  try {
    const user = await UserSchema.create({
      first_name,
      last_name,
      email,
      role,
      trainerId,
      firebaseUID,
    });
    return res.status(201).json({ user });
  } catch (err) {
    console.log(err, "Something went wrong");
    return res.status(400).json(err);
  }
};

// Update User
export const editUser = async (req, res) => {
  const userId = req.params.userId;
  const { role, email, first_name, last_name, trainerId, firebaseUID } =
    req.body;

  try {
    const user = await UserSchema.findOneAndUpdate(
      { user_id: userId },
      {
        first_name,
        last_name,
        email,
        role,
        trainerId,
        firebaseUID,
      }
    );

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    return res.status(201).json({ user });
  } catch (err) {
    console.log(err, "Something went wrong");
    return res.status(400).json(err);
  }
};

// DELETE Roles
export const deleteUser = async (req, res) => {
  const id = req.params.id;
  try {
    await UserSchema.findByIdAndDelete(id);
    const updateUser = await UserSchema.find({});
    console.log("This is an updated User List ", updateUser);
    return res.json({
      message: `Successfully deleted ${id}!`,
      updateUser,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ err: "Something went wrong" });
  }
};
