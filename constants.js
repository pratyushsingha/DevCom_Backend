export const DB_NAME = 'devCom';

export const userRolesEnum = {
  USER: 'User',
  ADMIN: 'Admin'
};

export const availableUserRoles = Object.values(userRolesEnum);

export const MAXIMUM_SUB_IMAGE_COUNT = 4;

export const CouponTypeEnum = {
  FLAT: 'FLAT'
};

export const availableCouponType = Object.values(CouponTypeEnum);

export const orderStatusEnum = {
  PENDING: 'PENDING',
  DELIVERED: 'DELIVERED',
  CANCELLED: 'CANCELLED'
};

export const orderStatuses = Object.values(orderStatusEnum);
