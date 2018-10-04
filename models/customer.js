var Customers = {

  getByEmail: function (client, email, callback) {
  },

  list: function (client, filter, callback) {
    const customerQuery = `
        SELECT *
        FROM customers
        ORDER BY customers.id
        LIMIT 10
        OFFSET ((${filter.page}-1)*10)  
      `;

    client.query(customerQuery, (req, data) => {
      console.log(data.rows);
      callback(data.rows);
    });
  },

  getTotal: function (client, callback) {
    const query = `
      SELECT COUNT(*)
      FROM customers
    `;
    client.query(query, (req, data) => {
      console.log(data.rows);
      callback(data.rows);
    });
  },

  create: function (client, customerData, callback) {
  }

};

module.exports = Customers;