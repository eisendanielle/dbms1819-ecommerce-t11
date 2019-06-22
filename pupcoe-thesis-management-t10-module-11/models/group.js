/* eslint-disable new-cap */
var Group = {

  getById: (client, groupId, callback) => {
    const listQuery = `
    SELECT
    groups.id AS id,
    groups.groupname AS groupname,
    classes.id AS class,
    classes.batch AS batch,
    classes.section AS section,
    users.first_name AS adviser_first_name,
    users.last_name AS adviser_last_name
    FROM groups
    INNER JOIN classes ON groups.class=classes.id
    INNER JOIN users ON classes.adviser=users.id
    WHERE groups.id = '${groupId}'
    `;

    client.query(listQuery, (req, data) => {
      var classData = {
        id: data.rows[0].id,
        batch: data.rows[0].batch,
        section: data.rows[0].section,
        first_name: data.rows[0].adviser_first_name,
        last_name: data.rows[0].adviser_last_name
      };
      callback(classData);
      console.log(classData);
    });
  },


  list: (client, filter, callback) => {
    const listQuery = `
    SELECT
    groups.id AS id,
    groups.groupname AS groupname,
    classes.id AS class,
    classes.batch AS batch,
    classes.section AS section,
    users.first_name AS adviser_first_name,
    users.last_name AS adviser_last_name
    FROM groups
    INNER JOIN classes ON groups.class=classes.id
    INNER JOIN users ON classes.adviser=users.id
    `;
    client.query(listQuery, (req, data) => {
      console.log(data.rows);
      callback(data.rows);
    });
  },

  listGroups: (client, filter, callback) => {
    const listQuery = `
    SELECT *
    FROM
    groups
    `;
    client.query(listQuery, (req, data) => {
      console.log(data.rows);
      callback(data.rows);
    });
  },

  create: (client, groupData, callback) => {
    var groups = [
    groupData.group,
    groupData.class
    ];
    const insertQuery = `
    INSERT INTO groups (
    groupname,
    class
    )
    VALUES ($1, $2)
    RETURNING *
    `;

    client.query(insertQuery, groups)
      .then(res => new callback('success'))
      .catch(e => new callback('error'));
      console.log(groups);
  },

  getStudentsByGroupId: (client, filter, callback) => {
    const query = `
      SELECT *
      FROM "groupStudents" c
      INNER JOIN users u on c.student_id = u.id
    `;
      // WHERE c.class_id = ${classId}
        client.query(query, (req, data) => {
      console.log(data.rows);
      callback(data.rows);
    });
  },

    noGroupList: (client, filter, callback) => {
    const query = `
      SELECT *
      FROM users
      WHERE user_type = 'student' AND id NOT IN (SELECT DISTINCT student_id FROM "groupStudents")
    `;
    client.query(query, (req, data) => {
      console.log(data.rows);
      callback(data.rows);
    });
  },

  addStudent: (client, data, callback) => {
      var query = `
        INSERT INTO "groupStudents" (
        group_id,
        student_id
        )
        VALUES (
        '${data.group}',
        '${data.student}'
        )
        RETURNING *
      `;
          client.query(query)
      .then(res => new callback('success'))
      .catch(e => new callback('error'));
  }
};
module.exports = Group;