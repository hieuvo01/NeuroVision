import mongoose, { Schema } from 'mongoose';


const Auth = new Schema({
    password: {
        type: String,
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