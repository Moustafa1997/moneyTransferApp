exports.getPagination = (page, size) => {
  const limit = parseInt(size) ? +size : 5;
  const offset = parseInt(page) ? (page - 1) * limit : 0;

  return { limit, offset };
};

exports.getPagingData = (_data, page, limit) => {
  const { count: totalCount, rows: data } = _data;
  const currentPage = page ? +page : 0;
  const totalPages = Math.ceil(totalCount / limit);

  return { data, totalCount, totalPages, currentPage };
};

exports.getPagingSpecial = async (_data, page, limit) => {
  const { rows: data } = _data;

  const totalCount = await _data.count.length;
  const currentPage = page ? +page : 0;
  const totalPages = Math.ceil(totalCount / limit);

  return { data, totalCount, totalPages, currentPage };
};

exports.getPaginationDataNew = async (array, startCount, endCount) => {
  // const itemsPerPage = limit;
  // const currentPage = pageNo;

  // const totalPages = Math.ceil(array.length / itemsPerPage);
  const startIndex = startCount - 1;
  const endIndex = endCount;
  const totalItems = await array.length;
  const displayedItems = await array.slice(startIndex, endIndex);

  return { list: displayedItems, totalItems: totalItems };
};
