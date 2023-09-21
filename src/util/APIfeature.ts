const sort = async (queryString: any, query: any) => {
  if (queryString.sort) {
    const sortBy = queryString.sort.split(',').join(' ');
    return query.sort(sortBy);
  } else {
    return query.sort('-createdAt');
  }

}
const page = async (queryString: any, query: any) => {
  const page = queryString.page * 1 || 1;
  const limit = queryString.limit * 1 || 100;
  const skip = (page - 1) * limit;
  return query.skip(skip).limit(limit);
}
export { sort, page };