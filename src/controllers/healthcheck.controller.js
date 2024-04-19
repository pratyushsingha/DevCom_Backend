import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/AsyncHandler.js';

const healthCheck = asyncHandler(async (req, res) => {
  return res.status(201).json(new ApiResponse(200, {}, 'server is healthy'));
});

export { healthCheck };
