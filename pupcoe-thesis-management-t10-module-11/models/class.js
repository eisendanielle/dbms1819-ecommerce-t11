/* eslint-disable new-cap */
var Class = {

  getById: (client, classId, callback) => {
    const listQuery = `
    SELECT
    classes.id AS id,
    classes.batch AS batch,
    classes.section AS section,
    users.id AS adviser_id,
    users.first_name AS adviser_first_name,
    users.last_name AS adviser_last_name
    FROM classes
    INNER JOIN users ON classes.adviser=users.id
    WHERE classes.id = '${classId}'
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

  listByFacultyId: (client, facultyId, callback) => {
    const query = `
      SELECT
        id,
        batch,
        section
      FROM classes 
      WHERE adviser=${facultyId}
    `;
        client.query(query, (req, data) => {
      console.log(data.rows);
      callback(data.rows);
    });
  },

  getStudentsByClassId: (client, classId, callback) => {
    const query = `
      SELECT *
      FROM "classStudents" c
      INNER JOIN users u on c.student_id = u.id
      WHERE c.class_id = ${classId}
    `;
        client.query(query, (req, data) => {
      console.log(data.rows);
      callback(data.rows);
    });
  },

  list: (client, filter, callback) => {
    const listQuery = `
    SELECT
    classes.id AS id,
    classes.batch AS batch,
    classes.section AS section,
    users.id AS adviser_id,
    users.first_name AS adviser_first_name,
    users.last_name AS adviser_last_name
    FROM classes
    INNER JOIN users ON classes.adviser=users.id
    `;
    client.query(listQuery, (req, data) => {
      console.log(data.rows);
      callback(data.rows);
    });
  },

  create: (client, classData, callback) => {
    var classes = [
    classData.batch,
    classData.section,
    classData.adviser
    ];
    const insertQuery = `
    INSERT INTO classes (
    batch,
    section,
    adviser
    )
    VALUES ($1, $2, $3)
    RETURNING *
    `;
    client.query(insertQuery, classes)
      .then(res => new callback('success'))
      .catch(e => new callback('error'));
  },

  getByStudentId: (client, studentId, callback) => {
    const query = `
      SELECT 
        cl.batch,
        cl.section,
        u.first_name ,
        u.last_name,
        u.email,
        us.first_name as adviser_fname,
        us.last_name as adviser_lname,
        us.email as adviser_email
      FROM "classStudents" c
      INNER JOIN classes cl on c.class_id = cl.id
      INNER JOIN users u on c.student_id = u.id
      INNER JOIN users us on cl.adviser = us.id
      WHERE c.student_id = ${studentId}
    `;
    client.query(query, (req, data) => {
      console.log(data.rows);
      callback(data.rows);
    });
  },

  getByStudentIdGroup: (client, studentId, callback) => {
    const query = `
      SELECT 
        gr.groupname,
        gr.class,
        u.first_name,
        u.last_name,
        u.email
      FROM "groupStudents" g
      INNER JOIN groups gr on g.group_id = gr.id
      INNER JOIN users u on g.student_id = u.id
      WHERE g.student_id = ${studentId}
    `;
    client.query(query, (req, data) => {
      console.log(data.rows);
      callback(data.rows);
    });
  },

  addStudents: (client, data, callback) => {
      var query = `
        INSERT INTO "classStudents" (
        class_id,
        student_id
        )
        VALUES (
        '${data.class}',
        '${data.student}'
        )
        RETURNING *
      `;
          client.query(query)
      .then(res => new callback('success'))
      .catch(e => new callback('error'));
      console.log(query);
  }
};

module.exports = Class;




