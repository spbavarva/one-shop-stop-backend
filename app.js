const express = require("express");
const app = express();
const errorMiddleware = require("./middleware/error");
const cookieParser = require("cookie-parser");
const dotenv = require("dotenv");
const bodyParser = require("body-parser");
const fileUpload = require("express-fileupload");
const cors = require('cors')
// const cloudinary = require("cloudinary");
const session = require("express-session");
const passport = require("passport");
const OAuth2Strategy = require("passport-google-oauth2").Strategy;
const clientid = "218106428966-5uqjiic1pep73n93l8oa5buqrejn6vnl.apps.googleusercontent.com"
const clientSecret = "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"
const User = require("./models/userModel");
require("dotenv").config();

app.use(cors({
    origin: "http://localhost:3006",
    methods:"GET, POST,PUT,DELETE",
    credentials: true
}));
app.use(express.json());
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(fileUpload({ useTempFiles: true }));

// setup session
app.use(session({
    secret:"12354646541zvgxdgv",
    resave:false,
    saveUninitialized:true
}))

// setuppassport
app.use(passport.initialize());
app.use(passport.session());

// OAuth 2.0
// passport.use(
//     new OAuth2Strategy(
//         {
//         clientID:clientid,
//         clientSecret:clientSecret,
//         callbackURL:"/auth/google/callback",
//         scope:["profile","email"]
//     },
//     async(accessToken,refreshToken,profile,done)=>{
//         try {
//             let user = await User.findOne({googleId:profile.id});
  
//             if(!user){
//                 user = new userdb({
//                     googleId:profile.id,
//                     displayName:profile.displayName,
//                     email:profile.emails[0].value,
//                     image:profile.photos[0].value
//                 });
  
//                 await user.save();
//             }
  
//             return done(null,user)
//         } catch (error) {
//             return done(error,null)
//         }
//     }
//     )
//   )

  passport.use(
    new OAuth2Strategy(
        {
            clientID: clientid,
            clientSecret: clientSecret,
            callbackURL: "/auth/google/callback",
            scope: ["profile", "email"]
        },
        async (accessToken, refreshToken, profile, done) => {
            try {
                let user = await User.findOne({ googleId: profile.id });

                if (!user) {
                    user = new User({
                        googleId: profile.id,
                        displayName: profile.displayName,
                        email: profile.emails[0].value,
                        image: profile.photos[0].value
                    });

                    await user.save();
                }

                return done(null, user);
            } catch (error) {
                return done(error, null);
            }
        }
    )
);
  
  passport.serializeUser((user,done)=>{
    done(null,user);
  })
  
  passport.deserializeUser((user,done)=>{
    done(null,user);
  });
  

// initial google ouath login
app.get("/auth/google",passport.authenticate("google",{scope:["profile","email"]}));

app.get("/auth/google/callback",passport.authenticate("google",{
    successRedirect:"http://localhost:3006/account",
    failureRedirect:"http://localhost:3006/login"
}))

//Config
dotenv.config({ path: "backend/config/config.env" });

//Route
const product = require("./routes/productRoute");
const user = require("./routes/userRoute");
const order = require("./routes/orderRoute");
const payment = require("./routes/paymentRoute");

app.use("/api/v1", product);
app.use("/api/v1", user);
app.use("/api/v1", order);
app.use("/api/v1", payment);

//middleware for error
app.use(errorMiddleware);

module.exports = app;
