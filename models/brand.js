var Brands = {

  list: function (client, filter, callback) {
    const brandQuery = `
      SELECT * 
      FROM brands ORDER BY id`;
    client.query(brandQuery, (req, data) => {
      console.log(data.rows);
      callback(data.rows);
    });
  },

  create: function (client, brandData, callback) {
    var error = 0;
    const insertQuery = `
    INSERT INTO brands(brand_name, brand_description) 
    VALUES('${brandData.brand_name}', '${brandData.brand_description}') `;

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


module.exports = Brands;