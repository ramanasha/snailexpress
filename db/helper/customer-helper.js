module.exports = (knex) => {
  return {
    getCustomers: (cb) => {
      knex
        .select("*")
        .from("customers")
        .then((results) => {
          cb(null, results);
        })
        .catch((err) => {
          cb(err);
      });
    },
    getCustomerById: (id, cb) => {
      knex
        .select("*")
        .from("customers")
        .where("id", id)
        .then((results) => {
          cb(null, results);
        })
        .catch((err) => {
          cb(err);
      });
    }
  }
}
