import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';
import { User } from '../../models/user.model.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/AsyncHandler.js';
import { cloudinaryUpload } from '../utils/Cloudinary.js';

const generateAccessAndRefreshToken = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });
    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(500, 'Error generating tokens');
  }
};

const registerUser = asyncHandler(async (req, res) => {
  const { email, username, password, role } = req.body;
  if ([username, email, password, role].some((field) => field?.trim === '')) {
    throw new ApiError(400, 'All fields are required');
  }
  const user = await User.findOne({
    $or: [{ email }, { username }]
  });

  if (user) {
    throw new ApiError(400, 'User already exists');
  }

  let avatarLocalPath;

  if (
    req.files &&
    Array.isArray(req.files.avatar) &&
    req.files.avatar.length > 0
  ) {
    avatarLocalPath = req.files.avatar[0].path;
  }

  const avatar = await cloudinaryUpload(avatarLocalPath);

  const createUser = await User.create({
    email,
    username,
    password,
    role,
    avatar:
      avatar?.url ||
      `https://ui-avatars.com/api/?name=${username}&background=random&color=fff`
  });

  const createdUser = await User.findById(createUser._id).select(
    '-password -refreshToken'
  );

  if (!createdUser) {
    throw new ApiError(500, 'User registration failed');
  }

  return res
    .status(201)
    .json(new ApiResponse(201, createdUser, 'user resgistered successfully'));
});

const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    throw new ApiError(400, 'Email and password are required');
  }

  const user = await User.findOne({ email });
  if (!user) throw new ApiError(400, 'Invalid email or password');

  console.log(user);
  const isPasswordValid = await user.isPasswordCorrect(password);

  console.log(isPasswordValid);
  if (!isPasswordValid) throw new ApiError(400, 'Invalid email or password');

  const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
    user._id
  );

  const loggedInUser = await User.findById(user._id).select('-password');

  const options = {
    httpOnly: true,
    secure: true,
    sameSite: 'none'
  };

  return res
    .status(200)
    .cookie('accessToken', accessToken, options)
    .cookie('refreshToken', refreshToken, options)
    .json(new ApiResponse(200, loggedInUser, 'User logged in successfully'));
});

const logoutUser = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        refreshToken: undefined
      }
    },
    { new: true }
  );

  const options = {
    httpOnly: true,
    secure: true
  };

  return res
    .status(201)
    .clearCookie('accessToken', options)
    .clearCookie('refreshToken', options)
    .json(new ApiResponse(200, {}, 'user logged out successfully'));
});

const updateAvatar = asyncHandler(async (req, res) => {
  const avatarLocalPath = req.file?.path;

  if (!avatarLocalPath) {
    throw new ApiError(400, 'Avatar file is missing');
  }

  const avatar = await cloudinaryUpload(avatarLocalPath);

  if (!avatar.url) {
    throw new ApiError(400, 'Error while uploading on avatar');
  }

  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        avatar: avatar.url
      }
    },
    { new: true }
  ).select('-password');

  return res
    .status(200)
    .json(new ApiResponse(200, user, 'Avatar image updated successfully'));
});

const updateUserDetails = asyncHandler(async (req, res) => {
  const { firstName, lastName, countryCode, phoneNumber } = req.body;

  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        firstName,
        lastName,
        countryCode,
        phoneNumber
      }
    },
    { new: true }
  ).select('-password');

  if (!user) {
    throw new ApiError(500, 'something went wrong while updating user Details');
  }

  return res
    .status(201)
    .json(new ApiResponse(200, user, 'user details updated successfully'));
});

const changePassword = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword } = req.body;

  const user = await User.findById(req.user._id);
  const verifyPassword = await user.isPasswordCorrect(oldPassword);

  if (!verifyPassword) {
    throw new ApiError(409, 'invalid user credentials');
  }

  user.password = newPassword;
  await user.save({ validateBeforeSave: false });

  return res
    .status(200)
    .json(new ApiResponse(201, {}, 'password changed successfully'));
});

const refreshAccessToken = asyncHandler(async (req, res) => {
  const refreshToken = req.cookies.refreshToken || req.body.refreshToken;

  if (!refreshToken) {
    throw new ApiError(401, 'unauthorized request');
  }

  try {
    const decodedToken = jwt.verify(
      refreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );

    const user = await User.findById(decodedToken._id);
    if (!user) {
      throw new ApiError(401, 'invalid refresh token');
    }

    if (refreshToken !== user?.refreshToken) {
      throw new ApiError(401, 'refresh token is expired or used');
    }

    const options = {
      httpOnly: true,
      secure: true
    };

    const { accessToken, refreshToken: newRefreshToken } =
      await generateAccessAndRefreshToken(user._id);

    return res
      .status(200)
      .cookie('accessToken', accessToken, options)
      .cookie('refreshToken', newRefreshToken, options)
      .json(
        new ApiResponse(
          200,
          { accessToken, refreshToken: newRefreshToken },
          'Access token refreshed'
        )
      );
  } catch (error) {
    throw new ApiError(401, error?.message || 'Invalid refresh token');
  }
});

const currentUser = asyncHandler(async (req, res) => {
  return res
    .status(200)
    .json(new ApiResponse(200, req.user, 'Current user fetched successfully'));
});

const getUserDetails = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select(
    '-password -refreshToken -username -avatar -role -createdAt -updatedAt -email'
  );

  if (!user) {
    throw new ApiError(409, "user doesn't exists");
  }

  return res
    .status(201)
    .json(new ApiResponse(200, user, 'user details fetched successfully'));
});

export {
  registerUser,
  loginUser,
  logoutUser,
  updateAvatar,
  updateUserDetails,
  changePassword,
  refreshAccessToken,
  currentUser,
  getUserDetails
};
