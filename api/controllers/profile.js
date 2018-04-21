var mongoose = require("mongoose");
var User = mongoose.model("User");
var gen_services = require("../services/app-general");
var Account = mongoose.model("Account");
var userTosend = {
  _id: "",
  active: false,
  function: "",
  email: "",
  lastname: "",
  firstname: "",
  isAdmin: false
};

module.exports.profileRead = function(req, res) {
  if (!req.payload._id) {
    res.status(401).json({
      message: "UnauthorizedError: private profile",
      Error: "Any data for you"
    });
  } else {
    User.findById(req.payload._id).exec(function(err, user) {
      var send_data = gen_services.copydata(userTosend, user);
      Account.find({ userAdmin: send_data._id }, (err, resp) => {
        if (err) {
          res.status(200).json(send_data);
        } else {
          var ws = [];
          resp.forEach(function(adm) {
            var ino = { _id: adm._id, name: adm.enseigneCommerciale };
            ws.push(ino);
          });
          send_data.accountAdmin = ws;
          send_data.isAdmin = true;
          /*to delete before pushing*/
          send_data.active = true;
          send_data.isAdmin = true;
          res.status(200).json(send_data);
        }
      });
    });
  }
};
// Edit Password
module.exports.editpass = function(req, res) {
  var paylod = req.payload;
  var _u = new User();
  User.findOne({ email: req.payload.email }, function(err, user) {
    _u = user;
    _u.setPassword(req.body.password);

    _u.save(function(e_, u_) {
      if (!e_) {
        res.status(200).json(u_);
      } else {
        res.status(404).json({
          message: "save error",
          Error: "Any data save error"
        });
      }
    });
  });
};
//Edit Profile
module.exports.editprofile = function(req, res) {
  var paylod = req.paylod;

  if (!req.payload._id) {
    res.status(401).json({
      message: "UnauthorizedError: private profile",
      Error: "Any data for you"
    });
  }

  // User.updateUser(id, user,{}, function(err, user){
  User.findOne({ email: req.payload.email }, function(err, user) {
    user.lastname = req.body.lastname;
    user.firstname = req.body.firstname;
    user.function = req.body.function;
    if (!err) {
      user.save(function(e_, u_) {
        if (!e_) {
          var usr = gen_services.copydata(userTosend, u_);
          delete usr.isAdmin;
          /*to delete before pushing*/
          usr.active = true;
          res.status(200).json(usr);
        } else {
          res.status(404).json({
            message: "save error",
            Error: "Any data save error"
          });
        }
      });
    } else {
      res.status(404).json({
        message: "User not found",
        Error: "Any data for you"
      });
    }
  });
};
