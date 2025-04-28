DROP TABLE IF EXISTS userinfo;

CREATE TABLE userinfo (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(255) NOT NULL,
    `password` VARCHAR(255) NOT NULL UNIQUE
);

-- Xóa bản ghi nếu đã tồn tại giá trị '123' trong cột `password`
DELETE FROM userinfo WHERE `password` = '123';

-- Thêm bản ghi mới vào bảng userinfo
INSERT INTO userinfo (username, `password`) VALUES
('admin', '123');