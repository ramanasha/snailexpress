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
    },
    insertInventory: (inventory) => {
      return knex("inventories")
              .insert(inventory);
    },
    updateInventory: (id, inventory) => {
      return knex("inventories")
              .where("id", id)
              .update(inventory);
    },
    deleteInventory: (id) => {
      return knex("inventories")
              .returning("image")
              .where("id", id)
              .del();
    }
  }
}
