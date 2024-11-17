const mongoose = require("mongoose");

const Product = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
        },
        image: {
            type: String,
        },
        cloudinaryId: {
            type: String,
        },
        content: {
            type: String,
            required: true,
        },
        author: {
            type: String,
            required: true,
        },
        aboutAuthor: {
            type: String,
        },
        authorId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        createdAt: {
            type: Date,
            required: true,
        },
        type: {
            type: String,
            required: true,
        },
        category: {
            type: String,
            required: true,
        },
        amountPagesDetails: {
            type: Number,
            required: true,
        },
        yearWeight: {
            type: Number,
            required: true,
        },
        languageCountry: {
            type: String,
            required: true,
        },
        age: {
            type: String,
            required: true,
        },
        coverSize: {
            type: String,
            required: true,
        },
        publisherPicSize: {
            type: String,
            required: true,
        },
        saves: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
            },
        ],
        reservations: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
            },
        ],
        views: {
            type: Number,
            default: 0,
        },
        amountInStock: {
            type: Number,
            required: true,
        },
        rating: {
            type: Number,
            default: 0,
        },
        hasRated: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
            },
        ],
        comments: [{
            name: {
                type: String,
            },
            comment: {
                type: String,
            },
            date: {
                type: Date,
            },
        }],
        hasCommented: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
            },
        ],
    },
    { collection: "products" }
);

module.exports = mongoose.model("Product", Product);