import Admin from "../models/admin.js";
import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'


const registerAdmin = async (req, res) => {
    try {
        const { firstname, lastname, email, password, phone, role } = req.body
        if (!firstname || !email || !password || !role) return res.status(400).json({ status: false, statusCode: 400, message: 'Missing Fields' })

        const adminExists = await Admin.findOne({ email })
        if (adminExists) return res.status(400).json({ status: false, statusCode: 400, message: 'Admin with this email already exists' })

        const hashedPassword = await bcrypt.hash(password, 10)

        const newAdmin = new Admin({
            firstname,
            lastname,
            email,
            phone,
            password: hashedPassword,
            role
        })
        const savedAdmin = await newAdmin.save()

        return res.status(201).json({ status: true, statusCode: 201, message: 'Admin registered successfully', data: savedAdmin })
    } catch (error) {
        console.log("ERROR", error);
        return res.status(500).json({
            status: false,
            statusCode: 500,            
            message: 'Failed to fetch Boligstoff',
            error: error?.response?.data?.error || error?.response?.statusText,
        })
    }
}

const loginAdmin = async (req, res) => {
    try {
        const { email, password } = req.body
        if (!email || !password) return res.status(400).json({ status: false, statusCode: 400, message: 'Missing Fields' })

        const admin = await Admin.findOne({ email })
        if (!admin) return res.status(400).json({ status: false, statusCode: 400, message: 'Admin not found' })

        const isMatch = await bcrypt.compare(password, admin.password)
        if (!isMatch) return res.status(400).json({ status: false, statusCode: 400, message: 'Invalid credentials' })

        const token = jwt.sign({ userId: admin._id, name: admin.name, email: admin.email, role: 'ADMIN' }, 'abs-auth-key', { expiresIn: '7d' })

        return res.status(200).json({ status: true, statusCode: 200, message: 'Login successfully', data: admin, token })
    } catch (error) {
        console.log("ERROR", error);
        return res.status(500).json({
            status: false,
            statusCode: 500,            
            message: 'Failed to fetch Boligstoff',
            error: error?.response?.data?.error || error?.response?.statusText,
        })
    }
}

const getAdminProfile = async (req, res) => {
    try {
        const adminId = req.auth.userId

        const admin = await Admin.findById(adminId).select('-password')
        if (!admin) return res.status(400).json({ status: false, statusCode: 400, message: 'Admin not found' })

        return res.status(200).json({ status: true, statusCode: 200, message: 'Admin profile fetched successfully', data: admin })
    } catch (error) {
        console.log("ERROR", error);
        return res.status(500).json({
            status: false,
            statusCode: 500,            
            message: 'Failed to fetch Boligstoff',
            error: error?.response?.data?.error || error?.response?.statusText,
        })
    }
}

const getAllAdmins = async (req, res) => {
    try {
        const admins = await Admin.find().select('-password')
        if (!admins || !admins.length) return res.status(400).json({ status: false, statusCode: 400, message: 'No admins found' })

        return res.status(200).json({ status: true, statusCode: 200, message: 'Admins fetched successfully', data: admins })

    } catch (error) {
        console.log("ERROR", error);
        return res.status(500).json({
            status: false,
            statusCode: 500,
            message: 'Failed to fetch Boligstoff',
            error: error?.response?.data?.error || error?.response?.statusText,
        })
    }
}

const getAdminById = async (req, res) => {
    try {
        const adminId = req.params.adminId

        const admin = await Admin.findById(adminId).select('-password')
        if (!admin) return res.status(400).json({ status: false, statusCode: 400, message: 'Admin not found' })

        return res.status(200).json({ status: true, statusCode: 200, message: 'Admin profile fetched successfully', data: admin })
    } catch (error) {
        console.log("ERROR", error);
        return res.status(500).json({
            status: false,
            statusCode: 500,            
            message: 'Failed to fetch Boligstoff',
            error: error?.response?.data?.error || error?.response?.statusText,
        })
    }
}

const updateAdminProfile = async (req, res) => {
    try {
        const { firstname, lastname, phone, isActive } = req.body

        const admin = await Admin.findByIdAndUpdate(req.params.adminId, {
            firstname,
            lastname,
            phone,
            isActive
        }, { new: true }).select('-password')
        if (!admin) return res.status(400).json({ status: false, statusCode: 400, message: 'Admin not found' })

        return res.status(200).json({ status: true, statusCode: 200, message: 'Admin profile updated successfully', data: admin })
    } catch (error) {
        console.log("ERROR", error);
        return res.status(500).json({
            status: false,
            statusCode: 500,            
            message: 'Failed to fetch Boligstoff',
            error: error?.response?.data?.error || error?.response?.statusText,
        })

    }
}

const deleteAdminProfile = async (req, res) => {
    try {
        const admin = await Admin.findByIdAndDelete(req.params.adminId)
        if (!admin) return res.status(400).json({ status: false, statusCode: 400, message: 'Admin not found' })

        return res.status(200).json({ status: true, statusCode: 200, message: 'Admin profile deleted successfully' })
    } catch (error) {
        console.log("ERROR", error);
        return res.status(500).json({
            status: false,
            statusCode: 500,            
            message: 'Failed to fetch Boligstoff',
            error: error?.response?.data?.error || error?.response?.statusText,
        })

    }
}

export { registerAdmin, loginAdmin, getAdminProfile, getAdminById, getAllAdmins, updateAdminProfile, deleteAdminProfile }