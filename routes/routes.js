const express = require("express");
const router = express.Router();
const register = require("./register");
const auth = require("./auth");
const passport = require("passport");
const verify = passport.authenticate("jwt", { session: false });

router.post("/register", register.createUser);
router.post("/login", register.loginUser);

router.post("/recover", register.recover);
router.post("/reset/:type/:token", register.reset);

router.post(
  "/image",
  verify,
  register.upload.single("profileImage"),
  register.imageUpload
);
router.get("/image", verify, register.getImage);

router.get("/address", verify, register.getAddress);
router.post("/address", verify, register.addAddress);
router.delete("/address/:id", verify, register.deleteAddress);
router.put("/address/:id", verify, register.editAddress);

router.get("/restaurantAddress", verify, register.getRestaurantDetails);
router.post("/restaurantAddress", verify, register.upload.single("profileImage"), register.restaurantDetails); // post and put in same route

router.get("/restaurant/:id", verify, auth.restaurant);
router.get("/restaurants", verify, auth.restaurants);
router.get("/restaurants/:id", verify, auth.getRestaurantItems);

router.post("/items", verify, auth.upload.single("itemImage"), auth.addItems);
router.get("/items", verify, auth.getItems);
router.get("/items/:uid/:id", verify, auth.getParticularRestaurantItems);
router.delete("/items/:id", verify, auth.deleteItems);
router.post(
  "/items/:id",
  verify,
  auth.upload.single("itemImage"),
  auth.editItems
);

router.post("/location/:lat/:lon", verify, auth.locationCoords);
router.get("/location", verify, auth.getLocationCoords);

router.get("/cart/:uid/:id/:sign", verify, auth.addToCart);
router.get("/cart/:uid/:id", verify, auth.deleteCartAndupdate);
router.get("/cart/", verify, auth.getCart);

router.get("/orderedHistory", verify, auth.orderedHistory);
//----------------------------------------------------------------
router.post(
  "/profile",
  passport.authenticate("jwt", { session: false }),
  function (req, res) {
    res.send(req.user);
  }
);

module.exports = router;
