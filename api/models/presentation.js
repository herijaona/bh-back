var mongoose = require("mongoose");

var presentationSchema = new mongoose.Schema({
  account: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Account"
  },
  description: String,
  autreDescription: String,
  zones: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Zone"
    }
  ]
});

mongoose.model("Presentation", presentationSchema);

/* email: {
   type: String,
   unique: true,
   required: true
 },
 lastname: {
   type: String,
   required: true
 },
  firstname: {
   type: String,
   required: true
 },
 account: { type: mongoose.Schema.Types.ObjectId, ref: "Account" },
 idCca:{
   type: String,
 },
 function: String,
 hash: String,
 salt: String*/
/*userSchema.methods.setPassword = function(password){
  this.salt = crypto.randomBytes(16).toString('hex');
  this.hash = crypto.pbkdf2Sync(password, this.salt, 1000, 64, 'sha512').toString('hex');
};

userSchema.methods.validPassword = function(password) {
  var hash = crypto.pbkdf2Sync(password, this.salt, 1000, 64, 'sha512').toString('hex');
  return this.hash === hash;
};

userSchema.methods.generateJwt = function() {
  var expiry = new Date();
  expiry.setDate(expiry.getDate() + 7);

  return jwt.sign({
    _id: this._id,
    email: this.email,
    name: this.name,
    exp: parseInt(expiry.getTime() / 1000),
  }, "MY_SECRET"); // DO NOT KEEP YOUR SECRET IN THE CODE!
};*/
