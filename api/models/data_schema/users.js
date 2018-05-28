var mongoose = require("mongoose");
var crypto = require("crypto");
var jwt = require("jsonwebtoken");
var userSchema = new mongoose.Schema({
    email: {
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
    idCca: {
        type: String
    },
    function: String,
    hash: String,
    salt: String
});
userSchema.add({
    activation_text: String,
    active: Boolean,
    admin_defaults: Boolean,
    isInTeam: Boolean,
    isInComm: Boolean
});
userSchema.add({
    imageProfile: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Image"
    }
});
userSchema.methods.setPassword = function(password) {
    this.salt = crypto.randomBytes(16).toString("hex");
    this.hash = crypto
        .pbkdf2Sync(password, this.salt, 1000, 64, "sha512")
        .toString("hex");
};
userSchema.methods.generateActivationCode = function() {
    var _salt = crypto.randomBytes(24).toString("hex");
    this.activation_text = crypto
        .pbkdf2Sync(this.email, _salt, 1000, 64, "sha512")
        .toString("hex");
};
userSchema.methods.activate = function() {
    this.active = true;
};
userSchema.methods.validPassword = function(password) {
    var hash = crypto
        .pbkdf2Sync(password, this.salt, 1000, 64, "sha512")
        .toString("hex");
    return this.hash === hash;
};
userSchema.methods.generateJwt = function() {
    var expiry = new Date();
    expiry.setDate(expiry.getDate() + 7);
    return jwt.sign(
        {
            _id: this._id,
            email: this.email,
            name: this.name,
            exp: parseInt(expiry.getTime() / 1000)
        },
        "MY_SECRET"
    ); // DO NOT KEEP YOUR SECRET IN THE CODE!
};
mongoose.model("User", userSchema);
