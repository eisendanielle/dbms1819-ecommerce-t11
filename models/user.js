
function getByEmail (client, email, callback) {
  const userListQuery = `
    SELECT *
    FROM users
    WHERE email = '${email}'
    `;
  client.query(userListQuery, (req, data) => {
    if (data.rowCount) {
      callback(data.rows[0]);
    } else {
      callback();
    }
  });
};

var User = {
  getByEmail: (client, email, callback) => {
    getByEmail(client, email, callback);
  },

  getById: (client, userId, callback) => {
    const userListQuery = `
      SELECT *
      FROM users
      WHERE id = '${userId}'
    `;
    client.query(userListQuery, (req, data) => {
      if (data.rowCount) {
        callback(data.rows[0]);
      } else {
        callback();
      }
    });
  },


  list: (client, filter, callback) => {
    const userListQuery = `
      SELECT *
      FROM users 
      WHERE user_type = '${filter}'
      ORDER BY id
    `;
    client.query(userListQuery, (req, data) => {
      console.log(data.rows);
      callback(data.rows);
    });
  },



  noClassList: (client, filter, callback) => {
    const query = `
      SELECT *
      FROM users
      WHERE user_type = 'student' AND id NOT IN (SELECT DISTINCT student_id FROM "classStudents")
    `;
    client.query(query, (req, data) => {
      console.log(data.rows);
      callback(data.rows);
    });
  },


  create: (client, userData, callback) => {
    getByEmail(client, userData.email, function (user) {
      if (user) {
        callback(user);
      } else {
        var users = [
        userData.first_name,
        userData.last_name,
        userData.email,
        userData.phone,
        userData.password,
        userData.user_type,
        userData.is_admin ? true : false,
        userData.student_number || ''
        ];

        const createQuery = `
            INSERT INTO users(first_name, last_name, email, phone, password, user_type, is_admin, student_number)
            VALUES (
              $1,
              $2,
              $3,
              $4,
              $5,
              $6,
              $7,
              $8
            )
            RETURNING *
          `;
        client.query(createQuery, users)
      .then(res => new callback('success'))
      .catch(e => new callback('error'));
      }
    });
  }

};

module.exports = User;