-- 迁移 1：建表
CREATE TABLE user_type (
    id   INT PRIMARY KEY,
    name VARCHAR(50) NOT NULL
);

CREATE TABLE users (
    user_id            INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    email              VARCHAR(256) NOT NULL,
    type               INT NOT NULL REFERENCES user_type (id),
    is_email_confirmed BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE company (
    domain_name         VARCHAR(256) NOT NULL,
    number_of_employees INT NOT NULL
);
