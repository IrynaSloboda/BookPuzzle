const mongoose = require("mongoose");

const User = new mongoose.Schema(
  {
    isAdmin: {
      type: Boolean,
      default: false,
    },
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    products: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
      },
    ],
    reservations: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Reservation",
      },
    ],
    secretAnswer: {
        type: String,
    }
  },
  { collection: "users" }
);

module.exports = mongoose.model("User", User);