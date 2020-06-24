const DeliveryModel = require("../models/Delivery.model");
const RestaurantModel = require("../models/Restaurant.model");
const UserModel = require("../models/User.model");
const {
  registerValidation,
  loginValidation,
  recoverValidation,
  resetValidation,
  addressValidation,
  restaurantDetailsValidation,
} = require("./validation");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const Password = require("../routes/password");
const multer = require("multer");
const fs = require("fs");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + file.originalname);
  },
});

const fileFilter = (req, file, cb) => {
  {
    file.mimetype === "image/jpeg" || file.mimetype === "image/png"
      ? cb(null, true)
      : cb(null, false);
  }
};

module.exports.upload = multer({
  storage: storage,
  limits: {
    fileSize: 1024 * 1024 * 5,
  },
  fileFilter: fileFilter,
});

const Model = (req) => {
  return req === "user"
    ? UserModel
    : req === "restaurant"
    ? RestaurantModel
    : DeliveryModel;
};

exports.createUser = async (req, res, next) => {
  const model = Model(req.body.type);
  try {
    const { error } = registerValidation(req.body);
    if (error) return res.json(error.details[0].message);

    const EmailExist = await model.findOne({ email: req.body.email });
    if (EmailExist)
      return res.json({ success: false, message: "Email Already Exist!" });

    const NameExist = await model.findOne({ name: req.body.name });
    if (NameExist)
      return res.json({ success: false, message: "Name Already Exist!" });

    if (req.body.password !== req.body.confirm_password)
      return res.json({ success: false, message: "Password Doesnot match!" });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(req.body.password, salt);
    req.body.password = hashedPassword;

    const createdModel = await model.create(req.body);

    return res
      .status(201)
      .json({ success: true, message: "User registered successfully ! " });
  } catch (err) {
    return res.json({ success: false, message: err });
  }
};

exports.loginUser = async (req, res, next) => {
  const model = Model(req.body.type);
  try {
    const { error } = loginValidation(req.body);
    if (error) return res.json(error.details[0].message);

    const user = await model.findOne({ email: req.body.email });
    if (!user)
      return res.json({ success: false, message: "*Email doesnot exist" });

    const validPass = await bcrypt.compare(req.body.password, user.password);
    if (!validPass)
      return res.json({ success: false, message: "*Incorrect Email/Password" });

    const token = jwt.sign(
      { _id: user._id, email: user.email, name: user.name, type: user.type },
      process.env.TOKEN_SECRET,
      { expiresIn: 3600 }
    );
    // const expiry = Date.now()+60;
    return res.status(201).json({ success: true, token: token /*, expiresIn: expiry */});
  } catch (err) {
    return res.json({ success: false, message: err });
  }
};

exports.recover = (req, res) => {
  const { error } = recoverValidation(req.body);
  if (error)
    return res.json({ success: false, message: error.details[0].message });

  Password.recover(req, res);
};

exports.getReset = (req, res) => {
  Password.reset(req, res);
};

exports.reset = (req, res) => {
  const { error } = resetValidation(req.body);
  if (error)
    return res.json({ success: false, message: error.details[0].message });

  if (req.body.password !== req.body.confirm_password)
    return res.json({ success: false, message: "Password doesnot match!" });

  Password.resetPassword(req, res);
};

exports.imageUpload = async (req, res) => {
  const model = Model(req.user.type);
  try {
    const userDate = await model.findById(req.user._id);

    if(userDate.profileImage){ 
    await model.findById(req.user._id).then(async(user) => {
      fs.unlink("./uploads/" + user.profileImage, function (err) {
        if (err) return res.json({ success: false, message: err });
      });
    
      user.profileImage = req.file.filename;
      await user.save();
    });
  }
  else{
    model.findById(req.user._id).then(async (user) => {
      user.profileImage = req.file.filename;
      await user.save();
    });
  }
    return res
      .status(201)
      .json({ success: true, message: "Profile Pic Updated!" });
  } catch (err) {
    return res.json({ success: false, message: "Error: " + err });
  }
};

exports.getImage = async (req, res) => {
  const model = Model(req.user.type);
  try {
    const user = await model.findById(req.user._id);

    if(user.profileImage){
      return res
        .status(201)
        .json({ success: true, message: user.profileImage });
    }
    
  } catch (err) {
    return res.json({ success: false, message: err });
  }
};
exports.addAddress = async (req, res) => {
  const model = Model(req.user.type);
  try {
    const { error } = addressValidation(req.body);
    if (error)
      return res
        .json({ success: false, message: error.details[0].message });

    const address = {
      phone: req.body.phone,
      address: req.body.address,
      landmark: req.body.landmark,
    };

    const savedData = await model.findByIdAndUpdate(req.user._id, {
      $push: { addresses: address },
    });
    if (savedData)
      return res
        .status(201)
        .json({ success: true, message: "Address updated" });
  } catch (err) {
    return res.json({ success: false, message: err });
  }
};
exports.editAddress = async (req, res) => {
  const model = Model(req.user.type);
  try {
    const { error } = addressValidation(req.body);
    if (error)
      return res
        .json({ success: false, message: error.details[0].message });

    const savedData = await model.updateOne(
      { "addresses._id": req.params.id },
      {
        $set: {
          "addresses.$.phone": req.body.phone,
          "addresses.$.address": req.body.address,
          "addresses.$.landmark": req.body.landmark,
        },
      }
    );
    if (savedData)
      return res.status(201).json({ success: true, message: "Adress Updated" });
    else
      return res
        .json({ success: false, message: "Empty Address List" });
  } catch (err) {
    return res.json({ success: false, message: err });
  }
};

exports.deleteAddress = async (req, res) => {
  const model = Model(req.user.type);

  try {
    const deletedData = await model.findByIdAndUpdate(req.user._id, {
      $pull: { addresses: { _id: req.params.id } },
    });
    if (deletedData)
      return res.status(201).json({ success: true, message: "Deleted" });
    else
      return res
        .json({ success: false, message: "Empty Address List" });
  } catch (err) {
    return res.json({ success: false, message: err });
  }
};

exports.getAddress = async (req, res) => {
  const model = Model(req.user.type);

  try {
    const user = await model.findById(req.user._id).where("addresses").ne([]);

    if (user.addresses[user.addresses.length-1])
      return res.status(201).json({ success: true, message: user.addresses[user.addresses.length-1] });
    else
      return res
        .json({ success: false, message: "Empty Address List" });
  } catch (err) {
    return res.json({ success: false, message: "Error: " + err });
  }
};

exports.restaurantDetails = async (req, res) => {
  try {
    const { error } = restaurantDetailsValidation(req.body);
    if (error)
      return res.json({ success: false, message: error.details[0].message });

    await RestaurantModel.findByIdAndUpdate(req.user._id)
      .then(async (response) => {
        
        if(response.restaurantAddress.profileImage && req.file){
        fs.unlink("./uploads/" + response.restaurantAddress.profileImage, function (err) {
          if (err) return res.json({ success: false, message: err });
        });
      }
      if(req.file){
           (response.restaurantAddress.profileImage = req.file.filename)
      }

        (response.restaurantAddress._id = req.user._id),
          
          (response.restaurantAddress.restaurantName = req.body.restaurantName),
          (response.restaurantAddress.restaurantDescription =
            req.body.restaurantDescription),
          (response.restaurantAddress.phone = req.body.phone),
          (response.restaurantAddress.address = req.body.address),
          (response.restaurantAddress.landmark = req.body.landmark),
          (response.restaurantAddress.openFrom = req.body.openFrom),
          (response.restaurantAddress.openTill = req.body.openTill),
          (response.restaurantAddress.openTomorrow = req.body.openTomorrow);
        await response.save();
        return res
          .status(201)
          .json({ success: true, message: "Restaurant address updated!" });
      })
      .catch((err) => res.json({ success: false, message: "Error: " + err }));
  } catch (err) {
    return res.json(err);
  }
};
exports.getRestaurantDetails = async (req, res) => {
  try {
    const data = await RestaurantModel.findById(req.user._id)
      .where("restaurantAddress")
      .exists(true);
    if (data)
      return res
        .status(201)
        .json({ success: true, message: data.restaurantAddress });
    else
      return res
        .json({ success: false, message: "No Details Found" });
  } catch (err) {
    return res.json({ success: false, message: err });
  }
};
