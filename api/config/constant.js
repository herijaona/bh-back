const path = require('path')
let APP = {}

APP.name = 'COLLABORATION CAPITAL'
APP.protocol = 'http'
APP.domain = 'localhost'
APP.domain_front = 'localhost'
//APP.domain = '54.36.98.91'
// APP.domain_front = '54.36.98.91'
APP.port = process.env.PORT || 3000
APP.port_front = 4546
APP.url = APP.protocol.concat('://', APP.domain, ':', APP.port)
APP.url_front = APP.protocol.concat('://', APP.domain_front, ':', APP.port_front)
// APP.url_front = APP.protocol.concat('://', APP.domain_front, ':', '/bh_version')
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

APP.key_secret_token = '%d]^JP54B(?JB8LQ5rCMk+P2Xr=fQCC&'



module.exports = APP
