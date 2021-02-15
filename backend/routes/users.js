const express = require ('express');
const { model } = require('mongoose');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcryptjs = require ('bcryptjs');
const {check, validationResult} = require ('express-validator');
const config = require ('config');
const auth = require ('../middleWare/auth');

const UserSchema = require ('../models/User');

router.get('/', auth, async(req,res) => {

    try {
        const user = await UserSchema.findById(req.user.id).select('-password');
        res.json(user);
        
    } catch (error) {
        console.log(error.message);
        return res.status(500).json({msg:"Error in getting user.."});
    }
})

router.post('/register', 
[
    check('email','E-mail is required').isEmail(),
    check('password', 'Password is required').not().isEmpty()
],
async (req,res) => {
    try {
        let {email, password} = req.body;
        let user = await UserSchema.findOne({email});
        const errors = validationResult (req);
        if(!errors.isEmpty()){
            return res.status(401).json({errors : errors.array()})
        }
        if(user){
            return res.status(401).json({msg:"This username is already registered"});
        }

        const salt = await bcryptjs.genSalt(10);
        password = await bcryptjs.hash(password,salt);

        user = new UserSchema({
            email,
            password
        });

        await user.save();

        const payload = {
            user : {
                id : user.id
            }
        }
        jwt.sign(
            payload,
            config.get('jwtSecret'),
            (err,token) => {
                if(err) throw err;
                res.json({ token });
            }
        )
      
    } catch (error) {
        console.log(error.message);
        return res.status(500).json({msg:"Error in registering user.."});
    }
});

router.post('/login',
[
    check('email','E-mail is required').isEmail(),
    check('password', 'Password is required').not().isEmpty()
],
async (req,res) => {
    try {
        const {email, password} = req.body;
        const errors = validationResult (req);
        let user = await UserSchema.findOne({email});

        if(!errors.isEmpty()){
            return res.status(401).json({errors : errors.array()})
        }
        if(!user){
            return res.status(401).json({msg : "There is no account using this email"});
        }

        let isPasswordMatch = await bcryptjs.compare(password,user.password);

        if(isPasswordMatch){

            const payload = {
                user : {
                    id : user.id
                }
            }
            jwt.sign(
                payload,
                config.get('jwtSecret'),
                (err,token) => {
                    if(err) throw err;
                    res.json({ token });
                }
            )
        }else{
            return res.status(401).json({msg:"Incorrect Password"});
        }
        
    } catch (error) {
        console.log(error.message);
        return res.status(500).json({msg:"Error in login.."});
    }
})
module.exports = router;