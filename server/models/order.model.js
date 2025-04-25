import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true
    },
    userId: {
        type: String,
        required: true
    },
    courseId: {
        type: String,
        required: true
    },
    paymentId: {
        type: String,
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        required: true
    },
});

export const Order = mongoose.model("Order", orderSchema);