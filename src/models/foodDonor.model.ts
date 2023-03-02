import mongoose from "mongoose";

const foodDonorSchema = new mongoose.Schema({
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
  password: {
    type: String,
    required: true,
  },
  businessDocument: {
    type: String,
    required: true,
  },
  donorType: {
    type: String,
    required: true,
  },
});

export default mongoose.model("FoodDonor", foodDonorSchema);
