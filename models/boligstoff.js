import mongoose from "mongoose";


const boligstoffSchema = new mongoose.Schema({
    order: {
        type: Number,
        required: true,
        unique: true
    },
    images: {
        type: [String],
        required: true
    },
    title: {
        type: String,
        required: true,
        trim: true
    },
    paragraph: {
        type: [String],
        required: true
    }
}, { timestamps: true })

export default mongoose.model('Boligstoff', boligstoffSchema)