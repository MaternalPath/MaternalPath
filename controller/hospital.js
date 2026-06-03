const { Hospital } = require('../models');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

exports.createHospital = async (req, res) => {
    try {
        const { hospitalName, email, phoneNumber, password, address } = req.body;
        const emailExists = await Hospital.findOne({ where: { email: email.toLowerCase() } });
         console.log(emailExists)
        if (emailExists) {
            return res.status(400).json({
                message: `Hospital with email: ${email} already exists`
            });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const hospital = await Hospital.create({
            hospitalName,
            email: email.toLowerCase(),
            phoneNumber: `+234${phoneNumber}`,
            password: hashedPassword,
            address
        });

        const data = {
            hospitalName: hospital.hospitalName,
            email: hospital.email,
            phoneNumber: hospital.phoneNumber,
            address: hospital.address
        }

        res.status(201).json({
            message: 'Hospital created successfully',
            data
    });
    } catch (error) {
        res.status(500).json({ 
            error: error.message 
        }); 
    }
};

exports.loginHospital = async (req, res) => {
    try {
        const { email, password } = req.body;

        const hospital = await Hospital.findOne({ where: { email: email.toLowerCase() } });

        if (!hospital) {
            return res.status(404).json({
                message: 'Hospital not found'
            });
        }

        const passwordMatch = await bcrypt.compare(password, hospital.password);

        if (!passwordMatch) {
            return res.status(400).json({
                message: 'Invalid password'
            });
        }

        const token = jwt.sign(
            { id: hospital.id, email: hospital.email },
            process.env.SECRET_KEY || 'your-secret-key-change-this-in-production',
            { expiresIn: '7d' }
        );

        res.status(200).json({
            message: 'Login successful',
            token,
            data: {
                email: hospital.email,
                phoneNumber: hospital.phoneNumber,
            }
        });
    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};

exports.changePassword = async(req, res)=>{
    try {
        const { id } = req.user;

        const { currentPassword, newPassword, confirmPassword } = req.body;
        const hospital = await Hospital.findByPk(id);
        if(!hospital) {
            return res.status(404).json({
                message: "Hospital not found"
            })
        }
        const checkPassword = await bcrypt.compare(currentPassword, hospital.password);
        if (!checkPassword) {
            return res.status(400).json({
                message: "old password is invalid"
            })
        }
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);
        hospital.password = hashedPassword;

        await hospital.save();
        res.status(200).json({
            message: "Password changed successfully"
        })

        
    } catch (error) {
        res.status(500).json({
            message: error.message
        })
    }
};

exports.updateHospitalProfile = async (req, res) => {
    try {
        const { id } = req.params;
        const { hospitalName, phoneNumber, adminFullName, deliveryFee, medicalLicenseNumber } = req.body;

        const hospital = await Hospital.findByPk(id);

        if (!hospital) {
            return res.status(404).json({
                message: 'Hospital not found'
            });
        }

        const hospitalLogo = req.files?.hospitalLogo?.[0];
        const verificationDocuments = req.files?.verificationDocuments || [];

        hospital.hospitalName = hospitalName || hospital.hospitalName;
        hospital.phoneNumber = phoneNumber || hospital.phoneNumber;
        hospital.hospitalLogo = hospitalLogo ? `/uploads/hospitals/${hospitalLogo.filename}` : hospital.hospitalLogo;
        hospital.adminFullName = adminFullName;
        hospital.deliveryFee = deliveryFee;
        hospital.medicalLicenseNumber = medicalLicenseNumber;
        hospital.verificationDocuments = JSON.stringify(
            verificationDocuments.map((file) => `/uploads/hospitals/${file.filename}`)
        );

        await hospital.save();

        res.status(200).json({
            message: 'Hospital profile updated successfully',
            data: {
                id: hospital.id,
                hospitalName: hospital.hospitalName,
                email: hospital.email,
                phoneNumber: hospital.phoneNumber,
                address: hospital.address,
                hospitalLogo: hospital.hospitalLogo,
                adminFullName: hospital.adminFullName,
                deliveryFee: hospital.deliveryFee,
                medicalLicenseNumber: hospital.medicalLicenseNumber,
                verificationDocuments: JSON.parse(hospital.verificationDocuments)
            }
        });
    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};

