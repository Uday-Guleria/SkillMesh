import mongoose from "mongoose";
const { Schema } = mongoose;

const connectionSchema = new Schema(
  {
    from: { type: Schema.Types.ObjectId, ref: "User", required: true },
    to: { type: Schema.Types.ObjectId, ref: "User", required: true },
    status: { type: String, enum: ["pending", "accepted", "declined"], default: "pending" },
  },
  { timestamps: true }
);

// One document per (from, to) pair. Also serves queries that filter by `from`.
connectionSchema.index({ from: 1, to: 1 }, { unique: true });
connectionSchema.index({ to: 1, status: 1 });

export default mongoose.model("Connection", connectionSchema);
