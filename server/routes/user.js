import express from 'express';
import UserSchema from '../schemas/user.js';
import AuthSchema from '../schemas/auth.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import nodemailer from 'nodemailer';

const route = express.Router();


// tao ham generate ma OTP
export const OTPgeneration = () => {
    const otp = Math.floor(100000 + Math.random() * 900000);
    return otp;
}



export const sendMail = async (to, subject, text, html) => {   // chuc nang gui mail xac nhan
    try {
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.SENDMAIL,
                pass: process.env.PASSMAIL,
            }
        })

        await transporter.sendMail({
            from: process.env.SENDMAIL, // sender address
            to,
            subject, 
            text,
            html, 
        });
    } catch (error) {
       console.log(error);
    }
}

//phan dang ky user
route.post('/registration', async (req, res) => {
    const salt = 10;
    try {
        const payload = req.body;               // lay thong tin tu cac truong trong PostMan
        if (!payload.name ||!payload.username ||!payload.email ||!payload.phone_number || !payload.password) {
            return res.status(400).json({ message: 'All fields are required' });
        }
        const existingUser = await UserSchema.findOne({ email: payload.email });        //kiem tra neu email da ton tai thi thong bao
        if (existingUser) {
            return res.status(400).json({ message: 'Email already exists' });
        }
        const existingUsername = await UserSchema.findOne({ username: payload.username });
        if (existingUsername) {
            return res.status(400).json({ message: 'Username already exists' });
        }

        const user = new UserSchema({
            ...payload, 
            isVerified: false
        });
        await user.save();
        const hashedPassword = await bcrypt.hash(payload.password, salt);               //ma hoa password
        const otp = OTPgeneration();
        const auth = new AuthSchema({
            password: hashedPassword,
            otp_code: otp,
            user_id: user._id
        });
        await auth.save();
        await sendMail(
            payload.email, 
            'Verify your email', 
            'Hello, click on the link below to verify your email:',
            `<div>
                <p>Hello, please complete your registration by clicking this link below:</p>
                <a href='${process.env.LINK_API}:${process.env.HTTP_PORT}/api/users/otp-verification-by-url?user_id=${user._id}&otp_code=${otp}'>Click this link to complete</a>
            </div>`
        )
        res.status(201).json(user);
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: error.errors});
    }

})

//phan dang nhap user
route.post('/login', async (req, res) => {
    try {
        const payload = req.body;
        if (payload.email || payload.username) {
        }else{
            return res.status(400).json({ message: 'Email or username is required' });
        }
       if(!payload.password){
         return res.status(400).json({ message: 'Password is required' });
       }
        
        let user;
        if(payload.email){
            user = await UserSchema.findOne({ email: payload.email });
        }else{
            user = await UserSchema.findOne({ username: payload.username });
        }
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        const authUser = await AuthSchema.findOne({ user_id: user.id});
        if(!authUser){
          return res.status(404).json({ message: 'User not found' });
        }
        const validPassword = await bcrypt.compare(payload.password, authUser.password);
        if (!validPassword) {
            return res.status(401).json({ message: 'Invalid password' });
        }
        if(!user.isVerified){
          return res.status(401).json({ message: 'Please verify your email address' });
        }
        const hashedUser = { 
            _id: user._id,
            name: user.name,
            username: user.username,
            email: user.email,
            phone_number: user.phone_number,
            isVerified: user.isVerified
        }
        const token = jwt.sign(hashedUser, process.env.JWT_SECRET, { expiresIn: '1w' });
        res.json({ token });
      
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: error.errors});
    }})
    

    // luu thong tin user sau khi dang nhap
    route.get('/me', async (req, res) => {
        try {
            const { token } = req.query;
            const result = jwt.decode(token, process.env.JWT_SECRET);
            res.status(200).json(result);
        } catch (error) {
            console.log(error);
            res.status(500).json({ message: error.errors});
        }
    })

    //user settings
    route.put('/update-settings', async (req, res) => {
        try {
            const { token } = req.query;
            const result = jwt.decode(token, process.env.JWT_SECRET);
            const { name, phone_number, avatar } = req.body;
            if(!name ||!phone_number || !avatar){
                return res.status(400).json({ message: 'All fields are required' });
            }
            const user = await UserSchema.findByIdAndUpdate({_id: result._id}, {name, phone_number, avatar}, { new: true });
            res.status(200).json(user);
        } catch (error) {
            console.log(error);
            res.status(500).json({ message: error.errors});
        }
    })

    //doi mat khau
    route.put('/change-password', async (req, res) => {
        try {
            const { token } = req.query;
            const result = jwt.decode(token, process.env.JWT_SECRET);
            const { current_password, new_password } = req.body;
            if(!current_password ||!new_password){
                return res.status(400).json({ message: 'All fields are required' });
            }
            const user = await AuthSchema.findOne({ user_id: result._id});
            console.log(user);
            const validPassword = await bcrypt.compare(current_password, user.password);
            if (!validPassword) {
                return res.status(401).json({ message: 'Invalid current password' });
            }
            const salt = 10;
            const hashedPassword = await bcrypt.hash(new_password, salt);
            await AuthSchema.updateOne({user_id: result._id}, {password: hashedPassword});
            res.status(200).json({ message: 'Password changed successfully!'});
            } catch (error) {
                console.log(error);
                res.status(500).json({ message: error.errors});
            }
        })

    // xac nhan ma OTP bang URL
    route.get('/otp-verification-by-url', async (req, res) => {
        try {
            const { otp_code, user_id } = req.query;
            if(!user_id || !otp_code){
                return res.status(400).json({ message: 'Invalid parameters' });
            }
            const authUser = await AuthSchema.findOne({user_id});
            if(!authUser){
              return res.status(404).json({ message: 'User not found' });
            }
            if(authUser.otp_code!== otp_code){
              return res.status(400).json({ message: 'Invalid OTP code' });
            }
            authUser.otp_code = null;
            await authUser.save();
            user = await UserSchema.findByIdAndUpdate({_id: user_id}, { isVerified: true}, { new: true });
            res.status(200).json({ message: 'Verification successful!'});
        } catch (error) {
            console.log(error);
            res.status(500).json({ message: error.errors});
        }
    })

export default route;
