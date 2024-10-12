import mongoose, { Schema } from 'mongoose';

const Feeds = new Schema({
    user_id: {
        type: String,
    },
    title: {
        type: String,
    },
    description: {
        type: String,
    },
    price: {
        type: Number,
    },
    text: {
        type: String,
    },
    image: {
        type: String,
    },
    video: {
        type: String,
    }
})

const FeedsSchema = mongoose.model('Feeds', Feeds);

export default FeedsSchema;

