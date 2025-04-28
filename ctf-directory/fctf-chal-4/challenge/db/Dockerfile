# Sử dụng hình ảnh MySQL chính thức
FROM mysql:8.0

# Đặt biến môi trường cho MySQL
# Những biến này được sử dụng để cấu hình MySQL container
ENV MYSQL_ROOT_PASSWORD=123 \
    MYSQL_DATABASE=mydatabase \
    MYSQL_USER=myuser \
    MYSQL_PASSWORD=123

# Sao chép tất cả các file SQL dump từ thư mục sql_dump vào container
COPY ./sql_dump/*.sql /docker-entrypoint-initdb.d/

# Ghi chú:
# Tất cả các file trong thư mục /docker-entrypoint-initdb.d sẽ tự động được chạy khi container MySQL khởi động lần đầu.

# Cổng mặc định của MySQL
EXPOSE 3306

# Chạy MySQL
CMD ["mysqld"]
