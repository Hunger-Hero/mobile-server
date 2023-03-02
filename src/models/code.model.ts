import mongoose from "mongoose";

//create code schema and link to user
const codeSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  code: Number,
  phoneNumber: String,
});

//export code model
export default mongoose.model("Code", codeSchema);