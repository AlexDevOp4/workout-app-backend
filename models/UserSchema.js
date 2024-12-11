import mongoose from "mongoose";
const { Schema } = mongoose;
const userSchema = mongoose.Schema(
  {
    first_name: {
      type: String,
    },
    last_name: {
      type: String,
    },
    firebaseUID: {
      type: String
    },
    role: {
      type: String,
    },
    createdAt: {
      type: Date,
      default: new Date(),
    },
    updatedAt: {
      type: Date,
      default: new Date(),
    },
  },
  // {
  //   toJSON: {
  //     // include any virtual properties when data is requested
  //     virtuals: true,
  //   },
  // }
);


const UserSchema = mongoose.model("Users", userSchema);

export default UserSchema;
