import mongoose, { Schema } from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { availableUserRoles, userRolesEnum } from "../constants.js";
import { faker } from "@faker-js/faker";

const userSchema = new Schema(
  {
    firstName: {
      type: String,
      default: faker.person.firstName(),
    },
    lastName: {
      type: String,
      default: faker.person.lastName(),
    },
    countryCode: {
      type: String,
      default: faker.location.countryCode("numeric"),
    },
    phoneNumber: {
      type: String,
      default: faker.phone.number(),
    },
    username: {
      type: String,
      required: true,
      trim: true,
      index: true,
      unique: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    avatar: {
      type: String,
    },
    role: {
      type: String,
      enum: availableUserRoles,
      default: userRolesEnum.USER,
      required: true,
    },
    password: {
      type: String,
      required: [true, "password is required"],
    },
    refreshToken: {
      type: String,
    },
  },
  { timestamps: true }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.isPasswordCorrect = async function (password) {
  return await bcrypt.compare(password, this.password);
};

userSchema.methods.generateAccessToken = function () {
  return jwt.sign(
    {
      _id: this._id,
      email: this.email,
      username: this.username,
      role: this.role,
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
    }
  );
};

userSchema.methods.generateRefreshToken = function () {
  return jwt.sign(
    {
      _id: this._id,
    },
    process.env.REFRESH_TOKEN_SECRET,
    {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
    }
  );
};

export const User = mongoose.model("User", userSchema);
