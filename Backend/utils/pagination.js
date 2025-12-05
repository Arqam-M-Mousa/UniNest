const DEFAULT_PAGE_SIZE = 10;
const MAX_PAGE_SIZE = 100;
const MIN_PAGE_SIZE = 1;

/**
 * Extract and validate pagination parameters from query
 */
const getPaginationParams = (query) => {
  let page = parseInt(query?.page, 10) || 1;
  let limit = parseInt(query?.limit, 10) || DEFAULT_PAGE_SIZE;

  if (page < 1) page = 1;

  if (limit < MIN_PAGE_SIZE) {
    limit = MIN_PAGE_SIZE;
  } else if (limit > MAX_PAGE_SIZE) {
    limit = MAX_PAGE_SIZE;
  }

  const offset = (page - 1) * limit;
  return { page, limit, offset };
};

/**
 * Format paginated response with metadata
 */
const formatPaginatedResponse = (data, page, limit) => {
  const totalItems = data.count || 0;
  const totalPages = Math.ceil(totalItems / limit) || 1;

  return {
    items: data.rows || [],
    pagination: {
      currentPage: page,
      pageSize: limit,
      totalItems,
      totalPages,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1,
    },
  };
};

/**
 * Get pagination metadata without items
 */
const getPaginationMetadata = (totalItems, page, limit) => {
  const totalPages = Math.ceil(totalItems / limit) || 1;

  return {
    currentPage: page,
    pageSize: limit,
    totalItems,
    totalPages,
    hasNextPage: page < totalPages,
    hasPreviousPage: page > 1,
  };
};

module.exports = {
  DEFAULT_PAGE_SIZE,
  MAX_PAGE_SIZE,
  MIN_PAGE_SIZE,
  getPaginationParams,
  formatPaginatedResponse,
  getPaginationMetadata,
};
