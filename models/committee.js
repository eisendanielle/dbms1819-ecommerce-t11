/* eslint-disable new-cap */
var Committee = {

  getFacultyByCommittee: (client, filter, callback) => {
    const query = `
      SELECT *
      FROM "facultyCommittee" c
      INNER JOIN users u on c.faculty_id = u.id
    `;
      // WHERE c.class_id = ${classId}
        client.query(query, (req, data) => {
      console.log(data.rows);
      callback(data.rows);
    });
  },

    notCommitteeList: (client, filter, callback) => {
    const query = `
      SELECT *
      FROM users
      WHERE user_type = 'faculty' AND id NOT IN (SELECT DISTINCT faculty_id FROM "facultyCommittee")
    `;
    client.query(query, (req, data) => {
      console.log(data.rows);
      callback(data.rows);
    });
  },

  addFaculty: (client, data, callback) => {
      var query = `
        INSERT INTO "facultyCommittee" (
        faculty_id
        )
        VALUES (
        '${data.faculty}'
        )
        RETURNING *
      `;
          client.query(query)
      .then(res => new callback('success'))
      .catch(e => new callback('error'));
  }
};
module.exports = Committee;