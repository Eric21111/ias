const { admin } = require("../config/firebase");

async function verifyToken(req, res) {
  try {
    const { idToken } = req.body;

    if (!idToken || typeof idToken !== "string") {
      return res.status(400).json({ error: "idToken is required" });
    }

    const decoded = await admin.auth().verifyIdToken(idToken);

    return res.status(200).json({
      data: {
        uid: decoded.uid,
        email: decoded.email || null,
        name: decoded.name || null,
        picture: decoded.picture || null,
      },
    });
  } catch (error) {
    return res.status(401).json({ error: "Invalid or expired idToken" });
  }
}

function me(req, res) {
  return res.status(200).json({
    data: {
      uid: req.user.uid,
      email: req.user.email || null,
      name: req.user.name || null,
      picture: req.user.picture || null,
    },
  });
}

module.exports = {
  verifyToken,
  googleSignIn: verifyToken,
  me,
};
