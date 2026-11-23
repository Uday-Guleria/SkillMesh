import mongoose from "mongoose";
const { Schema } = mongoose;

export const HOURS = ["Flexible", "Mornings", "Evenings", "Weekends"];

const userSchema = new Schema(
  {
    name: { type: String, required: true, trim: true, minlength: 2, maxlength: 60 },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true, select: false }, // never returned by default
    role: { type: String, default: "SkillMesh Member", trim: true, maxlength: 100 }, // headline
    bio: { type: String, default: "", maxlength: 500 },
    skills: { type: [String], default: [] },
    interests: { type: [String], default: [] },
    availability: {
      days: { type: [String], default: [] },
      hours: { type: String, enum: HOURS, default: "Flexible" },
    },
    github: { type: String, default: "" },
    portfolio: { type: String, default: "" },
    color: { type: String, default: "#ffd9d5" },
    online: { type: Boolean, default: false },
    lastSeenAt: { type: Date, default: null },
    isDemo: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Indexes: email is already unique (see above). These speed up Discover filters.
userSchema.index({ role: 1 });
userSchema.index({ interests: 1 }); // multikey index (one entry per array element)
userSchema.index({ skills: 1 });

export default mongoose.model("User", userSchema);
