const Mother = require('../models/mother')
const passport = require('passport')
const jwt = require('jsonwebtoken')


const GoogleStrategy = require('passport-google-oauth20').Strategy;

passport.use(new GoogleStrategy({
    clientID: process.env.clientId,
    clientSecret: process.env.clientSecret,
    callbackURL: "http://localhost:2245/api/mother/googleLogin",
    passReqToCallback:true
  },
async function(request,accessToken, refreshToken, profile, done) {
    console.log(" i am profile :",profile);
    
    const checkUser = await Mother.findOne({ email: profile._json.email })
    let token 
    if(checkUser) {
        token = await jwt.sign({ id: checkUser._id }, process.env.JWT_SECRET, { expiresIn: '1day'});
     }else{ 
        const createUser = await Mother.create({
            name: profile._json.name,
            email: profile._json.email,
            isVerified: profile._json.email_verified,
            role: 'mother'
        })
        token = await jwt.sign({ id: createUser._id }, process.env.JWT_SECRET, { expiresIn: '1day'});
    }
    return done(null, token)
    
  },
  passport.serializeUser((token, done) => {
    return done(null, token)
  }),
  passport.deserializeUser((token, done) => {
    return done(null, token)
  })

));


