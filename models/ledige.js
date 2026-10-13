import mongoose from "mongoose";

const listItemSchema = new mongoose.Schema({
    label: { type: String, default: null },
    data: { type: String, required: true }
}, { _id: false })

const ledigeSchema = new mongoose.Schema({
    order: {
        type: Number,
        required: true,
        unique: true
    },
    image: {
        type: String,
        default: null
        // required: true
    },
    head: {
        type: String,
        required: true,
        trim: true
    },
    p: {
        type: String,
        required: true
    },
    // detail page fields
    detailImage: {
        type: String,
        default: null
    },
    detailTitle: {
        type: String,
        default: null
    },
    sections: [
        {
            order: { type: Number, required: true },
            head: { type: String, default: null },
            p: { type: [String], default: [] },
            li: { type: [listItemSchema], default: [] }
        }
    ],
    contact: { type: String, default: null }
}, { timestamps: true })

export default mongoose.model('Ledige', ledigeSchema)