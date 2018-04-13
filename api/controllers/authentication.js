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
  user.save(function(err, user_) {
    if (!err) {
      var account_ = new Account();
      account_.enseigneCommerciale = req.body.enseigneCommerciale;
      account_.raisonSociale = req.body.raisonSociale;
      account_.Logo = new mongoose.mongo.ObjectId(req.body.Logo);
      account_.adresse = req.body.adresse;
      account_.userAdmin.push(user_.id);
      account_.users.push(user_.id);

      account_.save(function(err_, accID) {
        if (!err_) {
          var resEmail = gen_services.sendMail({
            user: user_,
            account: accID
          });

          resEmail
            .then(result => {
              console.log(result.body);
              var token;
              token = user.generateJwt();
              res.status(200);
              res.json({
                status: "OK",
                message: "email sent",
                user_email: user_.email
              });
            })
            .catch(err => {
              console.log(err.statusCode);
            });
        }
      });
    } else {
      console.log(err.code);
      res.status(409);
      res.json({
        error: true,
        text: "Email deja Utilisee"
      });
    }
  });
};

module.exports.login = function(req, res) {
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

module.exports.activate_user = function(req, res) {
  // var User_ = new User();
  User.findOne({ activation_text: req.body.activation_code }, function(
    err,
    doc
  ) {
    console.log('User Active state: '+ doc);
    if (!err) {
      // var u_ = new User(doc);
      if (!doc.active) {
        doc.activate();
        doc.save(function(err) {
          res.status(200);
          res.json({
            status: 'OK',
            message: 'Activation successful'
          });
        });
      } else{
        res.status(200);
          res.json({
            status: '_OK',
            message: 'User already Active'
          });
      }
    } else {
      res.status(200);
          res.json({
            status: 'NOK',
            message: 'User Not Found'
          });
    }
  });
};
