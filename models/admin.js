import mongoose from "mongoose";

const adminSchema = new mongoose.Schema({
    firstname: {
        type: String,
        default: ''
    },
    lastname: {
        type: String,
        default: ''
    },
    email: {
        type: String,
        required: true,
        unique: true
    },    
    phone: {
        type: String 
    },
    role: {
        type: String,
        enum: ['ADMIN', 'USER'],
        default: 'ADMIN'
    },
    isActive: {
        type: Boolean,
        default: true
    },
    password: {
        type: String,
        required: true
    }
}, { timestamps: true })

export default mongoose.model('Admin', adminSchema)