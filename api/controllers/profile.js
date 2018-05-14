var mongoose = require("mongoose");
var User = mongoose.model("User");
var tools_service = require("../services/app-general");
var Account = mongoose.model("Account");
var userTosend = {
  _id: "",
  active: false,
  function: "",
  email: "",
  lastname: "",
  firstname: "",
  isAdmin: false,
  imageProfile: ""
};

module.exports.profileRead = function(req, res) {
  if (!req.payload._id) {
    res.status(401).json({
      message: "UnauthorizedError: private profile",
      Error: "Any data for you"
    });
  } else {
    User.findById(req.payload._id)
      .populate([{ path: "imageProfile" }])
      .exec(function(err, user) {
        var send_data = tools_service.copydata(userTosend, user);
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
            /*to delete before pushing*/
            if (
              tools_service.inArray(
                "imageProfile",
                Object.keys(JSON.parse(JSON.stringify(user)))
              )
            ) {
              send_data["imageProfile"] = tools_service.media_url(
                send_data["imageProfile"].url
              );
            }
            send_data.isAdmin = true;
            res.status(200).json(send_data);
          }
        });
      });
  }
};
// Edit Password
module.exports.editpass = function(req, res) {
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
module.exports.editprofile = async function(req, res) {
  if (!req.payload._id) {
    res.status(401).json({
      message: "UnauthorizedError: private profile",
      Error: "Any data for you"
    });
  }

  let bodyData = req.body;
  try {
    let usr = await User.findOneAndUpdate(
      { email: req.payload.email },
      bodyData,
      { new: true }
    );
    if (usr) {
      console.log("usr_after ---");
      console.log(usr);
      var m = Object.create(userTosend);
      let send_data = tools_service.copydata(m, usr);
      if ("imageProfile" in Object.keys(usr)) {
        send_data["imageProfile"] = tools_service.media_url(
          send_data["imageProfile"].url
        );
      }
      delete send_data.isAdmin;
      res.status(200).json({
        status: "OK",
        message: "mis a jour reussi",
        data: send_data
      });
    }
  } catch (e) {
    // statements
    console.log(e);
    res.status(500).json({ status: "NOK", message: "Error" });
  }
};
