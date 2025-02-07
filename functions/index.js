const functions = require('firebase-functions');
const admin = require('firebase-admin');
const cors = require('cors')({ origin: true });

admin.initializeApp();

exports.checkUsername = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    const { username } = req.body;

    if (!username) {
      return res.status(400).send('Username is required.');
    }

    try {
      const userRef = admin.firestore().collection('users');
      const snapshot = await userRef.where('username', '==', username).get();

      if (!snapshot.empty) {
        return res.status(400).send('Username is already taken.');
      }

      return res.status(200).send('Username is available.');
    } catch (error) {
      console.error('Error checking username availability:', error);
      return res.status(500).send('Internal Server Error');
    }
  });
});
