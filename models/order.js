var Orders = {

  list: function (client, filter, callback) {
    const listQuery = `
    SELECT orders.id,
    first_name, last_name,
    product_name,
    quantity,
    purchase_date
    FROM orders
    INNER JOIN products
    ON orders.product_id = products.id
    INNER JOIN customers
    ON orders.customer_id = customers.id
    `;

    client.query(listQuery, (req, data) => {
      console.log(data.rows);
      callback(data.rows);
    });

  },

  customerList: function (client, customerID, callback) {
    const listQuery = `
    SELECT orders.id,
    first_name, last_name,
    product_name,
    quantity,
    purchase_date,
    orders.product_id,
    orders.customer_id,
    customers.email,
    customers.first_name, customers.last_name,
    customers.street, customers.municipality, 
    customers.province, customers.zipcode
    FROM orders    
    INNER JOIN customers
    ON orders.customer_id = customers.id
    INNER JOIN products
    ON orders.product_id = products.id
    WHERE 
        orders.customer_id = ${customerID}
    `;
    client.query(listQuery, (req, data) => {
      console.log(data.rows);
      callback(data.rows);
    });

  },

  create: function (client, orderData, callback) {
  }

};

module.exports = Orders;