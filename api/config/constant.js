const path = require('path')
let APP = {}

APP.name = 'BUSINESS HAVEN'
APP.protocol = 'http'
APP.domain = 'localhost'
APP.domain_front = 'localhost'
APP.port = process.env.PORT || 3000
APP.port_front = 4200
APP.url = APP.protocol.concat('://', APP.domain, ':', APP.port)
APP.url_front = APP.protocol.concat('://', APP.domain_front, ':', APP.port_front)
APP.burl = APP.protocol.concat('://',  process.env.APP_DOMAIN || APP.domain)
APP.root = global.basedir
APP.templatesPath = path.join(APP.root, '/api/templates')

APP.emails = {}
APP.emails.noreply = process.env.EMAIL_NOREPLY || ''
APP.emails.contact = process.env.EMAIL_CONTACT || 'team@safidison.com'
APP.emails.order = process.env.EMAIL_ORDER || ''

APP.mailjet = {}
APP.mailjet.api_pub = '90953041cf7cebfada8d7921450a743f'
APP.mailjet.api_priv = '86d6a97a804f962be68102a06f601d70'



module.exports = APP
