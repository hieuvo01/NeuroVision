import mongoose, { Schema } from 'mongoose';


const Auth = new Schema({
    password: {
        type: String,
        required: true,
        minlength: 8,
        // validate: [
        //     (password) => /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(password),
        //     'Password must contain at least 8 characters, including uppercase letters, lowercase letters, numbers, and special characters'
        // ]
    },
    otp_code: {
        type: String,
    },
    user_id: {
        type: String,
    }
})

const AuthSchema = mongoose.model('Auth', Auth);

export default AuthSchema;