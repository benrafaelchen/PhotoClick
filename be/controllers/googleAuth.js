const { OAuth2Client } = require("google-auth-library");
const dbSingleton = require("../dbSingleton");
const { generateToken } = require("../middleware/auth");

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;

const googleSignIn = async (req, res) => {
  const { credential } = req.body;

  if (!credential) {
    return res.status(400).json({ message: "Google credential is required" });
  }

  if (!GOOGLE_CLIENT_ID) {
    return res.status(503).json({
      message: "Google Sign-In is not configured. Please use email/password login.",
    });
  }

  try {
    const client = new OAuth2Client(GOOGLE_CLIENT_ID);
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();

    if (!payload.email_verified) {
      return res.status(401).json({ message: "Google email is not verified" });
    }

    const email = payload.email;
    const firstName = payload.given_name || "";
    const lastName = payload.family_name || "";

    const existingUsers = await dbSingleton.promiseQuery(
      "SELECT * FROM users WHERE Email = ?",
      [email]
    );

    if (existingUsers.length > 0) {
      const user = existingUsers[0];
      const token = generateToken(user);

      return res.json({
        message: "Login successful",
        token,
        roleID: user.RoleID,
        roleName: user.RoleName,
        personalId: user.Personal_id,
        email: user.Email,
        firstName: user.FirstName,
        lastName: user.LastName,
        isNewUser: false,
      });
    }

    return res.status(200).json({
      message: "Account not found. Please sign up first, then you can link your Google account.",
      isNewUser: true,
      googleEmail: email,
      firstName,
      lastName,
    });
  } catch (error) {
    console.error("Google sign-in error:", error.message);
    return res.status(401).json({ message: "Invalid Google credential" });
  }
};

module.exports = { googleSignIn };
