CREATE TYPE user_type AS ENUM ('student', 'faculty', 'guest');

CREATE TABLE "users" (
  "id" SERIAL PRIMARY KEY,
  "email" VARCHAR(80) NOT NULL,
  "password" VARCHAR(80) NOT NULL,
  "first_name" VARCHAR(80),
  "last_name" VARCHAR(80) NOT NULL,
  "student_number" VARCHAR(20,
  "phone" VARCHAR(80),
  "image_url" VARCHAR(200),
  "user_type" user_type default 'student' NOT NULL,
  "is_admin" boolean default 'f' NOT NULL
);

INSERT INTO users(first_name, last_name, email, password, phone, image_url, user_type, is_admin)
  VALUES (
    'Patricia',
    'Navarro',
    'patgnavarro@gmail.com',
    '123456',
    '',
    '',
    'faculty',
    't'
  );


CREATE TABLE "classes" (
  "id" SERIAL PRIMARY KEY,
  "batch" VARCHAR(4) NOT NULL,
  "section" VARCHAR(2) NOT NULL,
  "adviser" INT REFERENCES users(id)
);

CREATE TABLE "classStudents" (
  "id" SERIAL PRIMARY KEY,
  "class_id" INT REFERENCES classes(id),
  "student_id" INT REFERENCES users(id)
);

CREATE TABLE "groups" (
  "id" SERIAL PRIMARY KEY,
  "group" VARCHAR(10) NOT NULL,
  "class" INT REFERENCES classes(id)
);

CREATE TABLE "groupStudents" (
  "id" SERIAL PRIMARY KEY,
  "group_id" INT REFERENCES groups(id),
  "student_id" INT REFERENCES users(id)
);

CREATE TABLE thesis (
  "id" SERIAL PRIMARY KEY,
  "thesis_title"  VARCHAR(200),
  "group_id" INT REFERENCES groups(id),
  "stage" VARCHAR,
  "abstract" VARCHAR(1000),
  "comment" VARCHAR,
  "head_panelist" INT REFERENCES users(id),
  "date_updated" timestamptz
);