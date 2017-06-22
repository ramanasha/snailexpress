module.exports = (knex) => {
  return {
    getInventories: (cb) => {
      knex
        .select("*")
        .from("inventories")
        .then((results) => {
          cb(null, results);
        })
        .catch((err) => {
          cb(err);
      });;
    },
    getInventoryByName: (name, cb) => {
      knex
        .select("*")
        .from("inventories")
        .where("name", name)
        .then((results) => {
          cb(null, results);
        })
        .catch((err) => {
          cb(err);
      });
    },
    getPriceByIds: (ids, cb) => {
      knex
        .select("id", "price")
        .from("inventories")
        .whereIn('id', ids)
        .then((results) => {
          cb(null, results);
        })
        .catch((err) => {
          cb(err);
      });
    }
  }
}
