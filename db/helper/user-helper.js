module.exports = (knex) => {
  return {
    getUsers: () => {
      return knex
              .select("*")
              .from("users");
    },
    getUserByEmail: (email) => {
      return knex
              .select("*")
              .from("users")
              .where("email", email);
    },
    insertUser: (user) => {
      return knex("users")
              .insert(user);
    }
  }
}
