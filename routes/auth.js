const DeliveryModel = require("../models/Delivery.model");
const RestaurantModel = require("../models/Restaurant.model");
const UserModel = require("../models/User.model");
const {
  restaurantItemsValidation,
  cartItemValidation,
  locationValidation
} = require("./validation");
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

exports.addItems = async (req, res) => {
  const model = Model(req.user.type);
  const { error } = restaurantItemsValidation(req.body);
  if (error)
    return res
      .json({ success: false, message: error.details[0].message });

  const items = {
    uid: req.user._id,
    itemImage: req.file.filename,
    itemName: req.body.itemName,
    itemDescription: req.body.itemDescription,
    itemPrice: req.body.itemPrice,
    veg: req.body.Veg,
  };
  try {
    const savedData = await model.findByIdAndUpdate(req.user._id, {
      $push: { restaurantItems: items },
    });
    if (savedData)
      return res.status(201).json({ success: true, message: "Item Saved" });
  } catch (err) {
    return res.json({ success: false, message: err });
  }
};
exports.getItems = async (req, res) => {
  const model = Model(req.user.type);
  try {
    const user = await model
      .findById(req.user._id)
      .where("restaurantItems")
      .ne([]);

    if (user)
      return res
        .status(201)
        .json({ success: true, message: user.restaurantItems });
    else
      return res
        .json({ success: false, message: "Empty Items List" });
  } catch (err) {
    return res.json({ success: false, message: "Error: " + err });
  }
};
exports.getParticularRestaurantItems = async (req, res) => {
  try {
    const user = await RestaurantModel.findById(req.params.uid);
    
    const data = user.restaurantItems.map((item) => {
      if(item._id.equals(req.params.id)){
        return res
        .status(201)
        .json({ success: true, message: item });
    } 
    })

    if(!data){
    return res
        .json({ success: false, message: "No Item Found" });
    }
  } catch (err) {
    return res.json({ success: false, message: "Error: " + err });
  }
};

exports.deleteItems = async (req, res) => {
  const model = Model(req.user.type);

  try {
    const user = await model.findById(req.user._id);

    for (const i in user.restaurantItems) {
      if (user.restaurantItems[i]._id == req.params.id) {
        fs.unlink("./uploads/" + user.restaurantItems[i].itemImage, function (
          err
        ) {
          if (err) return res.json({ success: false, message: err });
        });
      }
    }
    const deletedData = await model.findByIdAndUpdate(req.user._id, {
      $pull: { restaurantItems: { _id: req.params.id } },
    });
    if (deletedData)
      return res.status(201).json({ success: true, message: "Item Deleted" });
    else
      return res
        .json({ success: false, message: "Empty Items List" });
  } catch (err) {
    return res.json({ success: false, message: err });
  }
};

exports.editItems = async (req, res) => {
  const model = Model(req.user.type);
  try {
    const { error } = restaurantItemsValidation(req.body);
    if (error)
      return res
        .json({ success: false, message: error.details[0].message });

        const user = RestaurantModel.findById(req.user._id);
        
if(req.file){
  
//   user.restaurantItems.map((item) => {
//     console.log(item)
//     if(item._id.equals(req.params.id) && req.file){
//       fs.unlink("./uploads/" + item.itemImage, function (err) {
//         if (err) return res.json({ success: false, message: err });
//   })
// };
//   })

// await model.findByIdAndUpdate(req.user._id)
//       .then(async (user) => {

//         if(response.restaurantItems.itemImage && req.file){
//           fs.unlink("./uploads/" + response.restaurantItems.itemImage, function (err) {
//             if (err) return res.json({ success: false, message: err });
//       })
//     };
//   });

    const savedData = await model.updateOne(
      { "restaurantItems._id": req.params.id },
      {
        $set: {

          "restaurantItems.$.itemImage": req.file.filename,

          "restaurantItems.$.itemName": req.body.itemName,
          "restaurantItems.$.itemDescription": req.body.itemDescription,
          "restaurantItems.$.itemPrice": req.body.itemPrice,
          "restaurantItems.$.veg": req.body.Veg,
        },
      }
    );
    // await response.save();
    if(savedData){ 
      return res.status(201).json({ success: true, message: "Item updated" });
    }else{
      return res.json({success: false, message: "Error updating Item"});
    }
  }
  else{
    const savedData = await model.updateOne(
      { "restaurantItems._id": req.params.id },
      {
        $set: {

          "restaurantItems.$.itemName": req.body.itemName,
          "restaurantItems.$.itemDescription": req.body.itemDescription,
          "restaurantItems.$.itemPrice": req.body.itemPrice,
          "restaurantItems.$.veg": req.body.Veg,
        },
      }
    );
    if(savedData){ 
      return res.status(201).json({ success: true, message: "Item updated" });
    }else{
      return res.json({success: false, message: "Error updating Item"});
    }
  }


 } catch (err) {
    return res.json({ success: false, message: err });
  }
};


exports.restaurant = async (req, res) => {
  
  const user = await RestaurantModel.findById(req.params.id);

  if (user) return res.status(201).json({ success: true, message: user.restaurantAddress });
  else
    return res
      .json({ success: false, message: "Empty restaurants List" });
};

exports.restaurants = async (req, res) => {
  const user = await RestaurantModel.find();

  if (user) return res.status(201).json({ success: true, message: user });
  else
    return res
      .json({ success: false, message: "Empty restaurants List" });
};

exports.getRestaurantItems = async (req, res) => {
  try {
    const user = await RestaurantModel.findById(req.params.id)
      .where("restaurantItems")
      .ne([]);
    if (user)
      return res
        .status(201)
        .json({ success: true, message: user.restaurantItems });
    else
      return res
        .status(401)
        .json({ success: false, message: "No Items in this Restaurant" });
  } catch (err) {
    return res.status(401).json({ success: false, message: "Error: " + err });
  }
};

exports.addToCart = async (req, res) => {
  const model = Model(req.user.type);
  
  try {
    // const { error } = cartItemValidation(req.body);
    // if (error)
    //   return res
    //     .json({ success: false, message: error.details[0].message });

    const user = await RestaurantModel.findById(req.params.uid);
    while(req.params.sign == "add"){
    for (const i in user.restaurantItems) {
          if (req.user.cart[0] == undefined) {
            if (user.restaurantItems[i]._id == req.params.id) {
              const data = {
                _id: req.params.id,
                restaurantName: user.restaurantAddress.restaurantName,
                restaurantImage: user.profileImage,
                count: 1,
                itemName: user.restaurantItems[i].itemName,
                itemPrice: user.restaurantItems[i].itemPrice,
              };
  
              const savedCart = await model.findByIdAndUpdate(req.user._id, {
                $push: { cart: data },
              });
              if (savedCart)
                return res
                  .status(201)
                  .json({ success: true, message: "Item added To Cart" });
              else
                return res
                  .json({ success: false, message: "Error Saving To Cart" });
            } 
          }
          else {
            if (req.user.cart[0].restaurantName == user.restaurantAddress.restaurantName){
                      for(const j in req.user.cart){
                    if (req.user.cart[j]._id == req.params.id) {
                      
                      const savedCart = await model.updateOne(
                              { "cart._id": req.params.id },
                              {
                                $set: {
                                  "cart.$.count": req.user.cart[j].count+1
                                },
                              }
                            );

                      if (savedCart)
                        return res
                          .status(201)
                          .json({ success: true, message: "Item updated To Cart" });
                      else
                        return res
                          .json({ success: false, message: "Error Saving To Cart" });
                    } 
                  }
                  const data = {
                    _id: req.params.id,
                    restaurantName: user.restaurantAddress.restaurantName,
                    restaurantImage: user.profileImage,
                    count: 1,
                    itemName: user.restaurantItems[i].itemName,
                    itemPrice: user.restaurantItems[i].itemPrice,
                  };
      
                  const savedCart = await model.findByIdAndUpdate(req.user._id, {
                    $push: { cart: data },
                  });
                  if (savedCart)
                    return res
                      .status(201)
                      .json({ success: true, message: "Item added To Cart" });
                  else
                    return res
                      .json({ success: false, message: "Error Saving To Cart" });
        }
        else{
                  return res
                    .json({
                      success: false,
                      dialog : false,
                      message: `Your cart contains dishes from "${req.user.cart[0].restaurantName}". Do you want to discard the selection and add dishes from "${user.restaurantAddress.restaurantName}"?`,
                      uid: req.params.uid,
                      id: req.params.id,
                    });
                }
      }
    }
  } 
  while(req.params.sign == "sub"){
    for (const i in user.restaurantItems) {
  if(user.restaurantItems[i]._id == req.params.id){
    for(const j in req.user.cart){
      if(req.user.cart[j]._id == req.params.id &&  req.user.cart[j].count == 1){
        const deletedData = await model.findByIdAndUpdate(req.user._id, {
              $pull: { cart: { _id: req.params.id } },
            });
            if (deletedData)
              return res
                .status(201)
                .json({ success: true, message: "Item Deleted From Cart" });
            else
              return res
                .json({ success: false, message: "Error Deleting From Cart" });
      }
  if (req.user.cart[j]._id == req.params.id && req.user.cart[j].count > 1) {
    
    const savedCart = await model.updateOne(
            { "cart._id": req.params.id },
            {
              $set: {
                "cart.$.count": req.user.cart[j].count-1
              },
            }
          );

    if (savedCart)
      return res
        .status(201)
        .json({ success: true, message: "Item updated in Cart" });
    else
      return res
        .json({ success: false, message: "Error Saving To Cart" });
  }
  else{
    return res
    .status(201)
    .json({ success: false, message: "No Item in Cart" });
  }
}
  }
  else{

  }
}
  }

    // for (const i in req.user.cart) {
    //   if (req.user.cart[i]._id == req.params.id) {
    //     const cartData = await model.updateOne(
    //       { "cart._id": req.params.id },
    //       {
    //         $set: {
    //           "cart.$.count": req.params.count,
    //         },
    //       }
    //     );
    //     if (cartData)
    //       return res
    //         .status(201)
    //         .json({ success: true, message: "Item updated To Cart" });
    //     else
    //       return res
    //         .json({ success: false, message: "Error Updating To Cart" });
    //   }
    // }
    // const user = await RestaurantModel.findById(req.params.uid);
    // while (req.params.count == 1) {
    //   for (const i in user.restaurantItems) {
    //     if (req.user.cart[0] == undefined) {
    //       if (user.restaurantItems[i]._id == req.params.id) {
    //         const data = {
    //           _id: req.params.id,
    //           restaurantName: user.restaurantAddress.restaurantName,
    //           restaurantImage: user.profileImage,
    //           count: req.params.count,
    //           itemName: user.restaurantItems[i].itemName,
    //           itemPrice: user.restaurantItems[i].itemPrice,
    //         };

    //         const savedCart = await model.findByIdAndUpdate(req.user._id, {
    //           $push: { cart: data },
    //         });
    //         if (savedCart)
    //           return res
    //             .status(201)
    //             .json({ success: true, message: "Item added To Cart" });
    //         else
    //           return res
    //             .json({ success: false, message: "Error Saving To Cart" });
    //       } 
    //       // else
    //       //   return res
    //       //     .json({
    //       //       success: false,
    //       //       message: "Cannot find the Item in the List",
    //       //     });
    //     } else {
    //       if (
    //         req.user.cart[0].restaurantName ==
    //         user.restaurantAddress.restaurantName
    //       ) {
    //         if (user.restaurantItems[i]._id == req.params.id) {
    //           const data = {
    //             _id: req.params.id,
    //             restaurantName: user.restaurantAddress.restaurantName,
    //             restaurantImage: user.profileImage,
    //             count: req.params.count,
    //             itemName: user.restaurantItems[i].itemName,
    //             itemPrice: user.restaurantItems[i].itemPrice,
    //           };

    //           const savedCart = await model.findByIdAndUpdate(req.user._id, {
    //             $push: { cart: data },
    //           });
    //           if (savedCart)
    //             return res
    //               .status(201)
    //               .json({ success: true, message: "Item added To Cart" });
    //           else
    //             return res
    //               .json({ success: false, message: "Error Saving To Cart" });
    //         } 
    //         // else
    //         //   return res
    //         //     .json({
    //         //       success: false,
    //         //       message: "Cannot find the Item in the List",
    //         //     });
    //       } else {
    //         return res
    //           .json({
    //             success: false,
    //             message: `Your cart contains dishes from ${req.user.cart[0].restaurantName}. Do you want to discard the selection and add dishes from ${user.restaurantAddress.restaurantName}?`,
    //           });
    //       }
    //     }
    //   }
    // }

    // while (req.params.count == 0) {
    //   const deletedData = await model.findByIdAndUpdate(req.user._id, {
    //     $pull: { cart: { _id: req.params.id } },
    //   });
    //   if (deletedData)
    //     return res
    //       .status(201)
    //       .json({ success: true, message: "Item Deleted From Cart" });
    //   else
    //     return res
    //       .json({ success: false, message: "Error Deleting From Cart" });
    // }

    // for (const i in req.user.cart) {
    //   if (req.user.cart[i]._id == req.params.id) {
    //     const cartData = await model.updateOne(
    //       { "cart._id": req.params.id },
    //       {
    //         $set: {
    //           "cart.$.count": req.params.count,
    //         },
    //       }
    //     );
    //     if (cartData)
    //       return res
    //         .status(201)
    //         .json({ success: true, message: "Item updated To Cart" });
    //     else
    //       return res
    //         .json({ success: false, message: "Error Updating To Cart" });
    //   }
    // }
  } catch (err) {
    return res.json({ success: false, message: "Error: " + err });
  }
};

exports.getCart = async (req, res) => {
  // const model = Model(req.user.type);
  
   try{
    const data = req.user.cart;

  if(data){
      return res
      .status(201)
      .json({ success: true, message: data });
  }
  if(!data || data === undefined){
  return res
      .json({ success: false, message: "No Item Found" });
  }
} catch (err) {
  return res.json({ success: false, message: "Error: " + err });
}
};

exports.deleteCartAndupdate = async (req, res) => {
  const model = Model(req.user.type);
  // const { error } = cartItemValidation(req.body);
  // if (error)
  //   return res
  //     .json({ success: false, message: error.details[0].message });

  const user = await RestaurantModel.findById(req.params.uid);
  try {
    await model.findByIdAndUpdate(req.user._id, {
      $set: { cart: [] },
    });

    for (const i in user.restaurantItems) {
      if (user.restaurantItems[i]._id == req.params.id) {
        const data = {
          _id: req.params.id,
          restaurantName: user.restaurantAddress.restaurantName,
          restaurantImage: user.profileImage,
          count: 1,
          itemName: user.restaurantItems[i].itemName,
          itemPrice: user.restaurantItems[i].itemPrice,
        };

        const savedCart = await model.findByIdAndUpdate(req.user._id, {
          $push: { cart: data },
        });
        if (savedCart)
          return res
            .status(201)
            .json({ success: true, message: "Item added To Cart" });
        else
          return res
            .json({ success: false, message: "Error Saving To Cart" });
      } else
        return res
          .json({
            success: false,
            message: "Cannot find the Item in the List",
          });
    }
  } catch (err) {
    return res.json({ success: false, message: "Error: " + err });
  }
};

exports.orderedHistory = async (req, res) => {
  const model = Model(req.user.type);
  const cart = req.user.cart;

  const { error } = cartItemValidation(req.body);
  if (error)
    return res
      .status(401)
      .json({ success: false, message: error.details[0].message });
  try {
    await model.findByIdAndUpdate(req.user._id, {
      $set: { orders: cart },
    });
    const deletedCart = await model.findByIdAndUpdate(req.user._id, {
      $set: { cart: [] },
    });

    if (deletedCart)
      return res
        .status(201)
        .json({ success: true, message: "Item added To Orders List" });
    else
      return res
        .status(401)
        .json({ success: false, message: "Error Saving To Orders List" });
  } catch (err) {
    return res.status(401).json({ success: false, message: "Error: " + err });
  }
};
exports.locationCoords = async (req, res) => {
  const model = Model(req.user.type);
 
  const { error } = locationValidation(req.params);
  if (error)
    return res
      .json({ success: false, message: error.details[0].message });

      const locationCoords = {
          latitude : req.params.lat,
          longitude : req.params.lon
      }
  try{
    const savedData = await model.findByIdAndUpdate(req.user._id, {
      $push: { location: locationCoords },
    });
    if (savedData)
      return res.status(201).json({ success: true, message: "Location Saved" });

  }catch(err){
    return res.json({ success: false, message: "Error: " + err });
  }

}
exports.getLocationCoords = async (req, res) => {
  const model = Model(req.user.type);

  try{
  
      const user = await model
      .findById(req.user._id)
      .where("location")
      .ne([]);
    
    if (user.location[user.location.length-1])
      return res.status(201).json({ success: true, message: user.location[user.location.length-1] });
      else 
      return res.json({ success: false, message: "No Data Found" });

  }catch(err){
    return res.json({ success: false, message: "Error: " + err });
  }

}