const path = require('path')
let APP = {}

APP.protocol = 'http'
APP.domain = 'localhost'
APP.root = global.basedir

APP.emails = {}
APP.emails.noreply = process.env.EMAIL_NOREPLY || 'liel.mims@gmail.com'
APP.emails.contact = process.env.EMAIL_CONTACT || 'liel.mims@hotmail.fr'

module.exports = APP
