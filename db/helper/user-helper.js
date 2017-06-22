module.exports = (knex) => {
  return {
    getUsers: (cb) => {
      knex
        .select("*")
        .from("users")
        .then((results) => {
          cb(null, results);
      });
    }
  }
}
