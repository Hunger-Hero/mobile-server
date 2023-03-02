import mongoose from "mongoose";

const foodRecipientSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  phoneNumber: {
    type: String,
    required: true,
  },
  address: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  password: { type: String, required: true },
  businessDocument: {
    type: String,
    required: true,
  },
  about: {
    type: String,
    required: true,
  },
});

export default mongoose.model("FoodRecipient", foodRecipientSchema);
