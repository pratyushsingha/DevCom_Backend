const getMongoosePaginationOptions = ({
  page = 1,
  limit = 10,
  customLabels
}) => {
  return {
    page: Math.max(page, 1),
    limit: Math.max(limit, 1),
    pagination: true,
    customLabels: {
      pagingCounter: 'serialNumberStartFrom',
      ...customLabels
    }
  };
};

const defaultExpiry = () => {
  const currentDate = new Date();
  currentDate.setDate(currentDate.getDate() + 30);
  return currentDate;
};

export { getMongoosePaginationOptions, defaultExpiry };
