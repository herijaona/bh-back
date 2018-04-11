var passport = require("passport");
var mongoose = require("mongoose");
var User = mongoose.model("User");
var Account = mongoose.model("Account");
var gen_services = require("../services/app-general");

var sendJSONresponse = function(res, status, content) {
  res.status(status);
  res.json(content);
};

module.exports.register = function(req, res) {
  var user = new User();

  user.firstname = req.body.firstname;
  user.lastname = req.body.lastname;
  user.email = req.body.email;
  user.function = req.body.function;
  user.generateActivationCode();
  user.active = false;

  // console.log(req.body);
  user.setPassword(req.body.password);
  user.save(function(err, userID) {
    if (!err) {
      var account_ = new Account();
      account_.enseigneCommerciale = req.body.enseigneCommerciale;
      account_.raisonSociale = req.body.raisonSociale;
      account_.Logo = new mongoose.mongo.ObjectId(req.body.Logo);
      account_.adresse = req.body.adresse;
      account_.userAdmin.push(userID);
      account_.users.push(userID);

      account_.save(function(err, accID) {
        gen_services.sendMail({ user: userID, account: accID });
        var token;
        token = user.generateJwt();
        res.status(200);
        res.json({
          userID: userID,
          accID: accID
        });
      });
    } else {
      console.log(err.code);
      res.status(409);
        res.json({
          error: true,
          text: 'Email deja Utilisee'
        });
    }
  });
};

module.exports.login = function(req, res) {
  // if(!req.body.email || !req.body.password) {
  //   sendJSONresponse(res, 400, {
  //     "message": "All fields required"
  //   });
  //   return;
  // }

  passport.authenticate("local", function(err, user, info) {
    var token;

    // If Passport throws/catches an error
    if (err) {
      res.status(404).json(err);
      return;
    }

    // If a user is found
    if (user) {
      token = user.generateJwt();
      res.status(200);
      res.json({
        token: token
      });
    } else {
      // If user is not found
      res.status(401).json(info);
    }
  })(req, res);
};
