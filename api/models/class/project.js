var mongoose = require("mongoose");
/*
 *
 * User model: parameter : (key): 'id', 'email', 'object'. (data): id, email, userObjet
 *
 */
class ProjectModel {
	constructor(key, data) {
		if (key == "id") {
			this.initByID(data);
		} else if (key == "email") {
			this.initByEmail(data);
		} else if (key == "object") {}
	}

	async initByID(id) {
		try {
			console.log(c)
		} catch (e) {
			// statements
			console.log(e);
		}
	}

	async initInnerAttributes(obj) {

	}
}
module.exports = UserModel;