import mongoose from "mongoose";
const { Schema } = mongoose;

const teamSchema = new Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 70 },
    goal: { type: String, required: true, trim: true, maxlength: 400 },
    status: { type: String, default: "In progress" },
    owner: { type: Schema.Types.ObjectId, ref: "User", required: true },
    // Referenced (not embedded) members: users change their profile independently.
    members: [{ type: Schema.Types.ObjectId, ref: "User" }],
  },
  { timestamps: true }
);

teamSchema.index({ members: 1, createdAt: -1 }); // "my teams, newest first"

export default mongoose.model("Team", teamSchema);
