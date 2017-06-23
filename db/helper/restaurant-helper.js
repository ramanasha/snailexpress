module.exports = (knex) => {
  return {
    getRestaurants: (cb) => {
      knex
        .select("*")
        .from("restaurants")
        .then((results) => {
          cb(null, results);
        })
        .catch((err) => {
          cb(err);
      });
    },
    getRestaurantById: (id, cb) => {
      knex
        .select("*")
        .from("restaurants")
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
