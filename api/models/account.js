var mongoose = require("mongoose");
var crypto = require("crypto");

var accountSchema = new mongoose.Schema({
  enseigneCommerciale: String,
  raisonSociale: String,
  Logo: String,
  idCompteCCA: String,
  typeOrganisation: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "OrganisationType"
  },
  adresse: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Address"
  },
  presentation: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Presentation"
  },
  members: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Member"
  },
  users: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    }
  ],
  projets: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project"
    }
  ],
  successStories: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SuccessStorie"
    }
  ],
  meetings: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Meeting"
    }
  ]
});

mongoose.model("Account", accountSchema);

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
