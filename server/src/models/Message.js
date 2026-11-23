import mongoose from "mongoose";
const { Schema } = mongoose;

// Same key for both directions of a chat: "<smallerId>:<largerId>"
export const conversationKey = (a, b) => [String(a), String(b)].sort().join(":");

const messageSchema = new Schema(
  {
    conversation: { type: String, required: true },
    from: { type: Schema.Types.ObjectId, ref: "User", required: true },
    to: { type: Schema.Types.ObjectId, ref: "User", required: true },
    text: { type: String, required: true, trim: true, maxlength: 500 },
    readAt: { type: Date, default: null }, // explicit null makes "unread" queries simple
  },
  { timestamps: true }
);

messageSchema.index({ conversation: 1, createdAt: -1 }); // load a thread, newest first
messageSchema.index({ to: 1, readAt: 1 }); // unread counters

export default mongoose.model("Message", messageSchema);
