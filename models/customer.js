var Customers = {

  getByEmail: function (client, email, callback) {
  },

  list: function (client, callback) {
    const customerQuery = `
        SELECT *
        FROM customers
        ORDER BY id
      `;

    client.query(customerQuery, (req, data) => {
      console.log(data.rows);
      callback(data.rows);
    });
  },

  create: function (client, customerData, callback) {
  }

};

module.exports = Customers;