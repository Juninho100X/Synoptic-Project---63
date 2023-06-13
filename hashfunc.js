const crypto = require('crypto');

//Admin password: verystrongpassword 
//Worker password: weakpassword

var plain_password = 'weakpassword';

var hash = crypto.createHash('md5').update(plain_password).digest('hex');

console.log('plain password: ' + plain_password);
console.log('hash value: ' + hash);