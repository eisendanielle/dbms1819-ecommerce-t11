var Categories = {
  list: (client, filter, callback) => {
    const categoryListQuery = `
    SELECT * 
    FROM products_category ORDER BY id`;
    client.query(categoryListQuery, (req, data) => {
      console.log(req);
      callback(data.rows);
    });
  },

  create: function (client, categoryData, callback) {
    var error = 0;
    const insertQuery = `
    INSERT INTO products_category(category_name) 
    VALUES('${categoryData}')`;

    client.query(insertQuery)
      .then((result) => {
        console.log('Succesful');
        callback(error);
      })
      .catch((err) => {
        console.log('Error', err);
        error = 1;
        callback(error);
      });
  }
};

module.exports = Categories;