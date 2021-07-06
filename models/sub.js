import mongoose from "mongoose";

const subSchema = mongoose.Schema({
  title: String,
  name: String,
  createdAt: {
    type: Date,
    default: new Date(),
  },
  followers: {
    type: [String],
    default: [],
  },
  posts: {
    type: [String],
    default: [],
  },
});

const subReddit = mongoose.model("subReddit", subSchema);

export default subReddit;
