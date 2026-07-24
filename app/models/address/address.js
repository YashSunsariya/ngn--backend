import mongoose from "mongoose";

const addressSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    fullName: {
      type: String,
      required: true,
      trim: true,
    },

    contact: {
      type: Number,
      required: true,
    },

    address: {
      type: String,
      required: true,
      trim: true,
    },
    address_type: {
      type: String,
      enum: ["Home","work","other"],
      default: "Home"
    },

    city: {
      type: String,
      required: true,
      trim: true,
    },

    state: {
      type: String,
      required: true,
      trim: true,
    },

    pincode: {
      type: String,
      required: true,
      trim: true,
    },

    country: {
      type: String,
      default: "India",
      trim: true,
    },

    isDefault: {
      type: Boolean,
      default: false,
    },

    status: {
      type: String,
      enum: ["active", "inactive", "deleted"],
      default: "active",
    },
  },
  {
    timestamps: true,
  }
);

addressSchema.pre("save", async function () {
  if (this.isDefault) {
    await mongoose.model("Address").updateMany(
      { user: this.user, _id: { $ne: this._id } },
      { isDefault: false }
    );
  }
});

const Address = mongoose.model("Address", addressSchema);

export default Address;
