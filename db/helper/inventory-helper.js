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
    getPriceByIds: (ids) => {
      return knex
              .select("id", "price")
              .from("inventories")
              .whereIn('id', ids);
    }
  }
}
