var mongoose = require('mongoose');
var User = mongoose.model('User');

module.exports.profileRead = function(req, res) {

  console.log('Anything');

  if (!req.payload._id) {
    res.status(401).json({
      "message" : "UnauthorizedError: private profile",
      "Error": "Any data for you"
    });
  } else {
    User
      .findById(req.payload._id)
      .exec(function(err, user) {
        res.status(200).json(user);
      });
  }

};

module.exports.editprofile = function(req, res) {
  
  // var id = req.params._id;
  // var user = req.body;

  var paylod = req.paylod;

  if (!req.payload._id) {
    res.status(401).json({
      "message" : "UnauthorizedError: private profile",
      "Error": "Any data for you"
    });
  }
  // User.updateUser(id, user,{}, function(err, user){
   
    console.log(req.payload);
    User.findOne({ email: req.payload.email },function(
        err,d
    ){
      console.log(d);
      if(!err){
        d.lastname = req.body.lastname;
        d.save(function(e_, u_){
          if(!e_){
            res.status(200).json(u_);
          }else{
            res.status(404).json({
              "message" : "save error",
              "Error": "Any data save error"
            });
          }
        });
      } else{
        res.status(404).json({
          "message" : "User not found",
          "Error": "Any data for you"
        });
      }
    }
   
  );

  // });
  
};

function updateUser(id, user, options, callback){
  var query = {edit: id};
  var update = {
      lastname: user.lastname
  }
  User.findOneAndUpdate(query, update, options, callback);
}
