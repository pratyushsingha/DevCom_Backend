import { body } from "express-validator";
import { availableUserRoles } from "../../constants.js";

const userRegisterValidator = () => {
  return [
    body("email")
      .trim()
      .notEmpty()
      .withMessage("Email is required")
      .isEmail()
      .withMessage("Email is invalid"),
    body("username")
      .trim()
      .notEmpty()
      .withMessage("Username is required")
      .withMessage("Username must be lowercase")
      .isLength({ min: 3 })
      .withMessage("Username must be at least 3 characters"),
    body("password")
      .trim()
      .notEmpty()
      .withMessage("Password is required")
      .isLength({ min: 8 })
      .withMessage("Password must be at least 8 characters"),
    body("role")
      .notEmpty()
      .withMessage("Role is required")
      .isIn(availableUserRoles)
      .withMessage("Role is invalid")
      .withMessage("Role is required"),
  ];
};

const userLoginValidator = () => {
  return [
    body("email")
      .trim()
      .notEmpty()
      .withMessage("email can't be empty")
      .isEmail()
      .withMessage("email isn't valid"),
    body("password")
      .trim()
      .notEmpty()
      .withMessage("password can't be empty")
      .isLength({ min: 8 })
      .withMessage("Password must be at least 8 characters"),
  ];
};

const updateUserDetailsValidator = () => {
  return [
    body("firstName")
      .trim()
      .optional()
      .notEmpty()
      .withMessage("First name is required")
      .isLength({ min: 3 })
      .withMessage("fistname must have 3 characters"),
    body("lastname")
      .trim()
      .optional()
      .notEmpty()
      .withMessage("Last name is required"),
    body("countryCode")
      .optional()
      .trim()
      .notEmpty()
      .withMessage("Country code is required")
      .isNumeric()
      .withMessage("Country code is invalid."),
    body("phoneNumber")
      .optional()
      .trim()
      .notEmpty()
      .withMessage("Phone number is required")
      .isNumeric()
      .withMessage("Phone number is invalid.")
      .isLength({ min: 10, max: 10 })
      .withMessage("Phone number is invalid. It must be 10 digits long."),
  ];
};

const changePasswordValidator = () => {
  return [
    body("oldPassword")
      .trim()
      .notEmpty()
      .withMessage("Old Password is required"),
    body("newPassword")
      .trim()
      .notEmpty()
      .withMessage("New Password is required")
      .isLength({ min: 8 })
      .withMessage("New Password must be at least 8 characters"),
  ];
};

export {
  userRegisterValidator,
  userLoginValidator,
  updateUserDetailsValidator,
  changePasswordValidator,
};
