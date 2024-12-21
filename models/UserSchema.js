import mongoose from "mongoose";
const { Schema } = mongoose;
const userSchema = mongoose.Schema({
  user_id: {
    type: Number,
    unique: true, // Ensure no duplicates
  },
  first_name: {
    type: String,
  },
  email: {
    type: String,
  },
  last_name: {
    type: String,
  },
  firebaseUID: {
    type: String,
  },
  role: {
    type: String,
  },
  trainerId: {
    type: Number,
  },
  createdAt: {
    type: Date,
    default: new Date(),
  },
  updatedAt: {
    type: Date,
    default: new Date(),
  },
});

// Function to generate a random number
const generateRandomUserId = async () => {
  // Generate a number in a specific range, for example, between 100000 and 999999
  return Math.floor(100000 + Math.random() * 900000);
};

// Middleware to generate `user_id` before saving
userSchema.pre("save", async function (next) {
  if (!this.user_id) {
    let unique = false;
    while (!unique) {
      const randomId = await generateRandomUserId();
      // Check if the user_id already exists
      const existingUser = await mongoose
        .model("Users")
        .findOne({ user_id: randomId });
      if (!existingUser) {
        this.user_id = randomId;
        unique = true;
      }
    }
  }
  next();
});

const UserSchema = mongoose.model("Users", userSchema);

export default UserSchema;
