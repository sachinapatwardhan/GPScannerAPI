const path = require('path');
const admin = require('firebase-admin');

admin.initializeApp({
  credential: admin.credential.cert(
    path.join(
      __dirname,
      '../hc-cargo-179403-firebase-adminsdk-mrwq2-af1ccec5aa.json'
    )
  ),
});

module.exports = {
  admin,
};
