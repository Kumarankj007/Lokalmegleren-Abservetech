import mongoose from "mongoose";

const hjemSchema = new mongoose.Schema({
    banner: {
        title: { type: String, required: true },
        image: { type: String, required: true },
        disc: { type: [String], default: [] }
    },
    contactUs: {
        title: { type: String, required: true },
        data: [
            {
                head: { type: String, required: true },
                desc: { type: String, required: true }
            }
        ]
    },
    aboutUs: { type: [String], default: [] }
}, { timestamps: true })

export default mongoose.model('Hjem', hjemSchema)