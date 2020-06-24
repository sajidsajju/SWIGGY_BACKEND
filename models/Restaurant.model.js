const mongoose = require("mongoose");
const crypto = require("crypto");

const restaurantSchema = new mongoose.Schema(
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

    restaurantAddress: {
      _id: {
        type: mongoose.Schema.Types.ObjectId,
        required: false,
      },
      profileImage: {
        type: String,
        required: false,
      },
      restaurantName: {
        type: String,
        required: false,
      },
      restaurantDescription: {
        type: String,
        required: false,
      },
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
      openFrom: {
        type: String,
        required: false,
      },
      openTill: {
        type: String,
        required: false,
      },
      openTomorrow: {
        type: Boolean,
        required: false,
      },
    },
    restaurantItems: [
      {
        uid: {
          type: mongoose.Schema.Types.ObjectId,
          required: false,
        },
        itemImage: {
          type: String,
          required: false,
        },
        itemName: {
          type: String,
          required: false,
        },
        itemDescription: {
          type: String,
          required: false,
        },
        itemPrice: {
          type: String,
          required: false,
        },
        veg: {
          type: Boolean,
          required: false,
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

restaurantSchema.methods.generatePasswordReset = function () {
  this.resetPasswordToken = crypto.randomBytes(20).toString("hex");
  this.resetPasswordExpires = Date.now() + 3600000; //expires in an hour
};

mongoose.set("useFindAndModify", false);

module.exports = mongoose.model("Restaurant", restaurantSchema);
