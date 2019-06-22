/* eslint-disable new-cap */
var Thesis = {

  listAll: (client, filter, callback) => {
    const listQuery = `
    SELECT *
    FROM
    thesis
    `;
    client.query(listQuery, (req, data) => {
      console.log(data.rows);
      callback(data.rows);
    });
  },
  listFilter: (client, filter, callback) => {
    const listQuery = `
    SELECT *
    FROM
    thesis
    WHERE group_id = '${filter}'
    `;
    client.query(listQuery, (req, data) => {
      console.log(data.rows);
      callback(data.rows);
    });
  },
  list: (client, filter, callback) => {
    const listQuery = `
    SELECT *
    FROM
    thesis
    WHERE
    stage = 'pending'
    `;
    client.query(listQuery, (req, data) => {
      console.log(data.rows);
      callback(data.rows);
    });
  },

  listCommittee: (client, filter, callback) => {
    const listQuery = `
    SELECT *
    FROM
    thesis
    WHERE
    stage = 'for committee'
    `;
    client.query(listQuery, (req, data) => {
      console.log(data.rows);
      callback(data.rows);
    });
  },
  // listForMor: (client, filter, callback) => {
  //   const listQuery = `
  //   SELECT *
  //   FROM
  //   thesis
  //   WHERE
  //   stage = 'MOR'
  //   `;
  //   client.query(listQuery, (req, data) => {
  //     console.log(data.rows);
  //     callback(data.rows);
  //   });
  // },
  listHeadPanel: (client, filter, callback) => {
    const listQuery = `
        SELECT
    thesis.id AS id,
    thesis.thesis_title AS thesis_title,
    thesis.stage AS stage,
    thesis.abstract as abstract,
    thesis.group_id as group_id,
    thesis.comment as comment,
    users.id AS adviser_id,
    users.first_name AS head_first_name,
    users.last_name AS head_last_name
    FROM thesis
    INNER JOIN users ON thesis.head_panelist=users.id
        WHERE
    stage = 'MOR'
    `;
    client.query(listQuery, (req, data) => {
      console.log(data.rows);
      callback(data.rows);
    });
  },
  checkIfCommittee: (client, facultyId, callback) => {
    const query = `
    SELECT EXISTS (SELECT id FROM "facultyCommittee" WHERE faculty_id = '${facultyId}')
    `;
  client.query(query, (req, data) => {
    if (data.rowCount) {
      callback(data.rows[0]);
    } else {
      callback();
    }
  });

  },

  updateStatus: (client, thesisData, callback) => {
    var thesis = [
    thesisData.stage,
    thesisData.thesis_id
    ]

    const query = `
    UPDATE 
    thesis 
    SET 
    stage = $1,
    date_updated = current_date
    WHERE id = $2
    `;
        client.query(query, thesis)
      .then(res => new callback('success'))
      .catch(e => new callback('error'));
        },
  updateHeadPanel: (client, thesisData, callback) => {
    var thesis = [
    thesisData.head,
    thesisData.thesis_id
    ]

    const query = `
    UPDATE 
    thesis 
    SET 
    head_panelist = $1,
    date_updated = current_date
    WHERE id = $2
    `;
        client.query(query, thesis)
      .then(res => new callback('success'))
      .catch(e => new callback('error'));
      console.log(thesis);
        }
  // updateStatusForDefense: (client, thesisData, callback) => {
  //   var thesis = [
  //   thesisData.stage,
  //   thesisData.thesis_id
  //   ]

  //   const query = `
  //   UPDATE 
  //   thesis 
  //   SET 
  //   stage = $1,
  //   date_updated = current_date
  //   WHERE id = $2
  //   `;
  //       client.query(query, thesis)
  //     .then(res => new callback('success'))
  //     .catch(e => new callback('error'));
  // },

  // updateStatusForDefenseUse: (client, thesisData, callback) => {
  //   var thesis = [
  //   thesisData.stage,
  //   thesisData.thesis_id
  //   ]

  //   const query = `
  //   UPDATE 
  //   thesis 
  //   SET 
  //   stage = $1,
  //   date_updated = current_date
  //   WHERE id = $2
  //   `;
  //       client.query(query, thesis)
  //     .then(res => new callback('success'))
  //     .catch(e => new callback('error'));
  // }
};

module.exports = Thesis;




