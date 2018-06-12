var mongoose = require("mongoose");
var User = mongoose.model("User");
var Account = mongoose.model("Account");
/*
 *
 * User model: parameter : (key): 'id', 'email', 'object'. (data): id, email, userObjet
 *
 */
var UserModel = function(k, d) {
    this._pkey = k;
    this._pdata = d;
    this.adminAccount = [];
    this.isUserAdmin = null;
    this.innObj = {};
    this.initD = false;
};
UserModel.prototype.initBy = async function() {
    let obj;
    let key = this._pkey;
    let data = this._pdata;
    this.initD = true;
    let popKey = [{
        path: "imageProfile"
    }];
    try {
        if (key == "id") {
            obj = await User.findById(data).populate(popKey);
        } else if (key == "email") {
            obj = await User.findOne({
                email: data
            }).populate(popKey);
        } else if (key == "object") {
            obj = data;
        }
        if (!obj) {
            this.innObj = null;
            return null;
        }
        this.innObj = obj;
        return true;
    } catch (e) {
        console.log(e);
        this.innObj = null;
        return null;
    }
};
UserModel.prototype.isAdmin = async function() {
    try {
        let accDoc = await Account.find({
            userAdmin: this.innObj._id
        });
        let accDoc2 = await Account.find({
            usersCommetee: this.innObj._id
        });
        this.isUserAdmin = accDoc.length > 0 || accDoc2.length > 0;
        if (this.isUserAdmin) {
            let administred = [];
            for (let a of accDoc) {
                administred.push(a._id);
            }
            for (let b of accDoc2) {
                administred.push(b._id);
            }
            this.adminAccount = this.remove_duplicates(administred);
            return {
                val: true,
                account: this.adminAccount
            };
        } else {
            this.adminAccount = [];
            return; {
                val: false;
            }
        }
    } catch (e) {
        console.log(e);
        this.isUserAdmin = null;
        this.adminAccount = null;
        return {
            val: false
        };
    }
};
UserModel.prototype.remove_duplicates = function(arr) {
    let unik = [];
    for (let v of arr) {
        unik.push(v);
        while (arr.indexOf(v)) {
            arr.slice(arr.indexOf(v), 1);
        }
    }
    return unik;
};
UserModel.prototype.isUserValid = async function() {
    if (!this.initD) {
        await this.initBy();
    }
    return this.innObj != null;
};
/*UserModel.prototype.isUsrAdmin = async function() {
    if (!this.initD) {
        await this.initBy();
    }
    return this.isUserAdmin;
};*/
/*UserModel.prototype.administredList = async function() {
    let x;
    if (!this.initD) {
        x = await this.initBy();
    }
    if (x) {
        let 
    }
};*/
module.exports = UserModel;