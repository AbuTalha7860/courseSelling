import mongoose from 'mongoose';

const courseSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    creatorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    image: {
        public_id: { type: String },
        url: { type: String },
    },
});

export const Course = mongoose.model('Course', courseSchema);