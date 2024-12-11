import UserSchema from "../models/UserSchema.js";

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
  const id = req.params.id;
  try {
    const user = await UserSchema.findById(id);
    return res.json(user);
  } catch (err) {
    console.log(err);
    return res.status(500).json({ err: "Something went wrong" });
  }
};

// Create an user and assign an existing role to that user
export const createUser = async (req, res) => {
  const { role, first_name, last_name, trainerId, firebaseUID } = req.body;

  try {
    const user = await UserSchema.create({
      first_name,
      last_name,
      role,
      trainerId,
      firebaseUID,
    });
    const updateUser = await UserSchema.find({});
    return res.json({ user, updateUser });
  } catch (err) {
    console.log(err, "Something went wrong");

    return res.json(err);
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
