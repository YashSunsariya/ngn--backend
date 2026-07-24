import mongoose from "mongoose";

const brandSchema = new mongoose.Schema(
    {
        brandName: {
            type: String,
            required: true,
        },
        brandImage: {
            type: String,
            default: null,
        },
        category: {
            type: String,
            default: null,
        },
        status: {
            type: String,
            required: true,
            enum:["active","inactive","deleted"],
            default:"active"
        }
    },
    {
    timestamps: true,
    }
);

const Brand = mongoose.model("Brand", brandSchema);

export default Brand;