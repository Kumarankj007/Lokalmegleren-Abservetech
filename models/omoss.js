import mongoose from "mongoose";

const omossSchema = new mongoose.Schema({
    order: {
        type: Number,
        required: true,
        unique: true
    },
    title: {
        type: String,
        required: true,
        trim: true
    },
    li: {
        type: [String],
        required: true
    }
}, { timestamps: true })

export default mongoose.model('Omoss', omossSchema)