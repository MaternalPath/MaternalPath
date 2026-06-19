const jwt = require('jsonwebtoken')
const {Admin} = require('../models')
const JWT_SECRET = process.env.JWT_SECRET?.trim() || 'your-secret-key-change-this-in-production'

const Authentication = async (req, res, next)=>{
    try {
        const token = req.headers.authorization?.split(" ")[1]
  
        if(!token){
            return res.status(401).json({
                message:'Token not Found'
            })
        }

        jwt.verify(token, JWT_SECRET, (err, data) => {
            if(err){
                console.log('JWT verify error:', err.message)
                return res.status(401).json({
                    message: 'Token validation failed',
                    error: err.message
                })
            }

            req.user = data
            next()
        })
    } catch (error) {
        console.log(error)
        res.status(500).json({
            message: error.message
        })
    }
}

const checkAdmin = async (req, res, next) => {
    try {
        const auth = req.headers.authorization
        if (!auth) {
            return res.status(400).json({
                message: "Auth required"
            })
        }
        const token = auth.split(' ')[1]
        
        const decodedToken = jwt.verify(token, JWT_SECRET);

        const user = await Admin.findOne({ where:{id: decodedToken.id }})

        console.log('USER FOUND:', user)
        if (!user) {
            return res.status(404).json({
                message: "Authentication failed: User not found"
            })
        }

        const role = user.role

        if (role !== 'admin') {
            res.status(401).json({
                message: 'Unaunthorized'
            })
        }

        req.user = decodedToken

        next()


    } catch (error) {
        res.status(500).json({
            message: error.message
        })
    }

}

module.exports = {
    Authentication,
    checkAdmin
}