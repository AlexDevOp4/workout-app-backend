import mongoose from "mongoose";

const { Schema } = mongoose;

// Define the schema
const videoSchema = new Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Users",
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    videoUrl: {
      type: String,
      required: true,
      validate: {
        validator: function (v) {
          return /^(https?|ftp):\/\/[^\s/$.?#].[^\s]*$/.test(v);
        },
        message: (props) => `${props.value} is not a valid URL!`,
      },
    },

    thumbnailUrl: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);
const Video = mongoose.model("Videos", videoSchema);
export default Video;
