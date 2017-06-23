module.exports = (knex) => {
  return {
    getCustomers: () => {
      return knex
              .select("*")
              .from("customers");
    },
    getCustomerById: (id) => {
      return knex
              .select("*")
              .from("customers")
              .where("id", id);
    }
  }
}
