-- 迁移 2：参考数据。应用不能修改这些行，测试的清理脚本也不能删它们（第 10 章）。
INSERT INTO user_type (id, name) VALUES
    (1, 'Customer'),
    (2, 'Employee');
