module.exports = (knex) => {
  return {
    getRestaurants: () => {
      return knex
              .select("*")
              .from("restaurants");
    },
    getRestaurantById: (id) => {
      return knex
              .select("*")
              .from("restaurants")
              .where("id", id);
    }
  }
}
