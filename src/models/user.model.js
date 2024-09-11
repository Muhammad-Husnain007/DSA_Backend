import mongoose, { Schema } from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const userSchema = new Schema({
    firstName: {
      type: String,
      required: true
    },
    lastName: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true,
      unique: true
    },
    phoneNumber: {
      type: Number,
      required: true
    },
    dateOfBirth: {
      type: Date,
      required: true
    },
    graduationYear: {
      type: Number,
      required: true
    },
    homeAddress: {
      type: String,
      required: true
    },
    password: {
      type: String,
      required: true
    },
    aboutMe: {
      type: String,
      required: true
    },
    profile: {
      type: String,
      required: true,
    },
    refreshToken: {
      type: String,
  },
    versionKey: false  // __v field ko disable karta hai
  
}, {timestamps: true});

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10)
  next();
});

userSchema.methods.isPasswordCorrect = async function (password) {
  return await bcrypt.compare(password, this.password)
};

userSchema.methods.generateAccessToken = function () {
  return jwt.sign({
      _id: this._id,
      email: this.email,
      name: this.name,
      fullName: this.fullName,
  },
      process.env.ACCESS_TOKEN_SECRET,
      {
          expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
      });
};

userSchema.methods.generateRefreshToken = function () {
  return jwt.sign({
      _id: this._id,
  },
      process.env.REFRESH_TOKEN_SECRET,
      {
          expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
      });
};

export const User = mongoose.model('User', userSchema);
