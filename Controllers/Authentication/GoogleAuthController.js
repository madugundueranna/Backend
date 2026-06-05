const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const roleModel = require("../../Models/Authentication/RoleModel");
const moment = require("moment-timezone");

console.log("[GoogleAuth] BASE_URL:", process.env.BASE_URL);
console.log("[GoogleAuth] WEB_URL:", process.env.WEB_URL);
console.log("[GoogleAuth] NODE_ENV:", process.env.NODE_ENV);
console.log("[GoogleAuth] GOOGLE_CLIENT_ID:", process.env.GOOGLE_CLIENT_ID ? "set" : "MISSING");
console.log("[GoogleAuth] callbackURL:", `${process.env.BASE_URL}/auth/google/callback`);

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: `${process.env.BASE_URL}/auth/google/callback`,
      scope: ["profile", "email"],
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        console.log("[GoogleAuth] OAuth callback hit, profile id:", profile.id);
        if (!profile.emails || !profile.emails[0] || !profile.emails[0].value) {
          console.log("[GoogleAuth] No email in profile");
          return done(new Error("No email found in Google profile"), false);
        }

        const email = profile.emails[0].value;
        console.log("[GoogleAuth] email:", email);
        let user = await roleModel.findOne({ email });

        const currentISTDateString = moment
          .tz("Asia/Kolkata")
          .format("YYYY-MM-DD HH:mm:ss");

        if (!user) {
          console.log("[GoogleAuth] Creating new user for:", email);
          user = new roleModel({
            name: profile.displayName || "Google User",
            email: email,
            password: "",
            role: "Attendee",
            authProvider: "google",
            createdDate: currentISTDateString,
            updatedDate: currentISTDateString,
          });

          await user.save();
        } else {
          console.log("[GoogleAuth] Existing user found, role:", user.role);
        }

        const token = await user.generateAuthToken();
        console.log("[GoogleAuth] Token generated, redirecting to WEB_URL:", process.env.WEB_URL);

        user = user.toObject();
        user.token = token;

        return done(null, user);
      } catch (error) {
        console.error("[GoogleAuth] Error in strategy:", error.message);
        return done(error, false);
      }
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user._id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await roleModel.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

module.exports = passport;
