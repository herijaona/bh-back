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
// Edit Password
module.exports.editpass = function(req, res){
  var paylod = req.payload;
  var _u = new User();
  User.findOne({email: req.payload.email},function(
    err, user
  ){
    _u = user;
    _u.setPassword(req.body.password);
    
    _u.save(function(e_, u_){
      console.log(e_);
      if(!e_){
        res.status(200).json(u_);
      }else{
        res.status(404).json({
          "message" : "save error",
          "Error": "Any data save error"
        });
      }
    });
  
  
  });
};
//Edit Profile
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
        err,user
    ){

      user.lastname = req.body.lastname;
      user.firstname = req.body.firstname;
      user.function = req.body.function;
      console.log('--------');
      console.log(user);
      console.log('--------');
      if(!err){
        
        user.save(function(e_, u_){
          console.log(e_);
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

};

