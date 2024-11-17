const mongoose = require("mongoose");

const Reservation = new mongoose.Schema(
    {
        product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Product",
        },
        productType: {
            type: String,
            required: true,
        },
        fullName: {
            type: String,
        },
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },
        startDate: {
            type: Date,
            required: true,
        },
        endDate: {
            type: Date,
            required: true,
        },
        address: {
            type: String,
        },
        phone: {
            type: String,
            required: true,
        },
        sent: {
            type: Boolean,
            default: false,
        },
        returned: {
            type: Boolean,
            default: false,
        },
        extended: {
            type: Boolean,
            default: false,
        },
        
    },
    { collection: "reservations" }
);

module.exports = mongoose.model("Reservation", Reservation);