import mongoose from "mongoose";

const listItemSchema = new mongoose.Schema({
    label: { type: String, default: null },
    data: { type: String, required: true }
}, { _id: false })

const personvernSchema = new mongoose.Schema({
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
    p1: {
        type: String,
        default: null
    },
    p2: {
        type: String,
        default: null
    },
    li: {
        type: [listItemSchema],
        default: []
    },
    address: {
        type: [String],
        default: []
    }
}, { timestamps: true })

export default mongoose.model('Personvern', personvernSchema)