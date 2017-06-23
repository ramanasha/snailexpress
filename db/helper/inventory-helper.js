module.exports = (knex) => {
  return {
    getInventories: () => {
      return knex
              .select("*")
              .from("inventories");
    },
    getInventoryByName: (name) => {
      return knex
              .select("*")
              .from("inventories")
              .where("name", name);
    },
    getInventoryByIds: (ids) => {
      return knex
              .select("*")
              .from("inventories")
              .whereIn("id", ids);
    },
    getPriceByIds: (ids) => {
      return knex
              .select("id", "price")
              .from("inventories")
              .whereIn('id', ids);
    }
  };
};
