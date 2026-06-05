const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const roleModel = require("../../Models/Authentication/RoleModel");
const moment = require("moment-timezone");

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      // callbackURL: "/google/callback",
      callbackURL: `${process.env.BASE_URL}/auth/google/callback`,
      scope: ["profile", "email"],
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        if (!profile.emails || !profile.emails[0] || !profile.emails[0].value) {
          return done(new Error("No email found in Google profile"), false);
        }

        const email = profile.emails[0].value;
        let user = await roleModel.findOne({ email });

        const currentISTDateString = moment
          .tz("Asia/Kolkata")
          .format("YYYY-MM-DD HH:mm:ss");

        if (!user) {
          user = new roleModel({
            name: profile.displayName || "Google User",
            email: email,
            password: "",
            role: "User",
            authProvider: "google",
            createdDate: currentISTDateString,
            updatedDate: currentISTDateString,
          });

          await user.save();
        }

        const token = await user.generateAuthToken();

        user = user.toObject();
        user.token = token;

        return done(null, user);
      } catch (error) {
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
