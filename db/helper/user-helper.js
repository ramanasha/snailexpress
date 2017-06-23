module.exports = (knex) => {
  return {
    getUsers: () => {
      return knex
              .select("*")
              .from("users");
    }
  }
}
