const mongoose = require("mongoose");
const crypto = require("crypto");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      min: 4,
      max: 255,
    },
    email: {
      type: String,
      required: true,
      min: 10,
      max: 255,
    },
    password: {
      type: String,
      required: true,
      min: 6,
      max: 255,
    },
    type: {
      type: String,
      required: true,
    },
    profileImage: {
      type: String,
      required: false,
    },
    addresses: [
      {
        phone: {
          type: String,
          required: false,
        },
        address: {
          type: String,
          required: false,
        },
        landmark: {
          type: String,
          required: false,
        },
      },
    ],
    cart: [
      {
        _id: {
          type: mongoose.Schema.Types.ObjectId,
          required: false,
        },
        restaurantName: {
          type: String,
          required: false,
        },
        restaurantImage: {
          type: String,
          required: false,
        },
        itemName: {
          type: String,
          required: false,
        },
        count: {
          type: Number,
          required: false,
        },
        itemPrice: {
          type: String,
          required: false,
        },
      },
    ],
    location : [
      {
        latitude : {
          type: String,
          required: false,
        },
        longitude : {
          type: String,
          required: false,
        },
        date: {
          type: Date,
          default: Date.now
      }
      }
    ],
    orders: [
      {
        _id: {
          type: mongoose.Schema.Types.ObjectId,
          required: false,
        },
        restaurantName: {
          type: String,
          required: false,
        },
        restaurantImage: {
          type: String,
          required: false,
        },
        itemName: {
          type: String,
          required: false,
        },
        count: {
          type: Number,
          required: false,
        },
        itemPrice: {
          type: String,
          required: false,
        },
        date: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    resetPasswordToken: {
      type: String,
      required: false,
    },

    resetPasswordExpires: {
      type: Date,
      required: false,
    },
  },
  { timestamps: true }
);

userSchema.methods.generatePasswordReset = function () {
  this.resetPasswordToken = crypto.randomBytes(20).toString("hex");
  this.resetPasswordExpires = Date.now() + 3600000; //expires in an hour
};

mongoose.set("useFindAndModify", false);

module.exports = mongoose.model("User", userSchema);
