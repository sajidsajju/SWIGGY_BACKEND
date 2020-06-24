var JwtStrategy = require("passport-jwt").Strategy,
  ExtractJwt = require("passport-jwt").ExtractJwt;
const UserModel = require("../models/User.model");
const DeliveryModel = require("../models/Delivery.model");
const RestaurantModel = require("../models/Restaurant.model");

module.exports = function (passport) {
  var opts = {};
  // optUsers = opts.jwtFromRequest = ExtractJwt.fromAuthHeaderWithScheme(
  //   "Bearer"
  // );
  
  optUsers = opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
  opts.secretOrKey = process.env.TOKEN_SECRET;
  // opts.issuer = 'accounts.examplesoft.com';
  // opts.audience = 'yoursite.net';
  passport.use(
    new JwtStrategy(opts, function (jwt_payload, done) {
      // console.log(jwt_payload)
      const model =
        jwt_payload.type === "user"
          ? UserModel
          : jwt_payload.type === "restaurant"
          ? RestaurantModel
          : DeliveryModel;

      model.findOne({ _id: jwt_payload._id }, function (err, user) {
        // console.log(user)
        if (err) {
          return done(err, false);
        }
        if (user) {
          return done(null, user);
        } else {
          return done(null, false);
          // or you could create a new account
        }
      });
    })
  );
};
