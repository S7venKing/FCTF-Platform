

#### **1. Thiết lập `umask`**

`umask` được sử dụng để đặt quyền truy cập mặc định cho các file/directory.

**Thực hiện lệnh sau:**

```bash
umask a+rx
```

----------

#### **2. Cài đặt các công cụ cần thiết**

**Cài đặt  xxd, wget, curl, netcat**
	
	```bash
	sudo apt install xxd wget curl netcat -y
	```

----------

#### **3. Cài đặt Docker**

1.  **Tải script cài đặt Docker:**
    
    ```bash
    curl -fsSL https://get.docker.com -o get-docker.sh
    ```
    
2.  **Chạy script để cài đặt Docker:**
    
    ```bash
    sudo sh get-docker.sh
    ```
    
3.  **Thiết lập để Docker hoạt động không cần quyền `root`:**
    
    ```bash
    sudo usermod -aG docker $USER && newgrp docker
    ```
   
    
4.  **Kiểm tra cài đặt Docker:**
    
    ```bash
    echo 'Install docker done, start install kctf'
    
    ```
    

----------

#### **4. Cài đặt kCTF**

1.  **Kích hoạt `kernel.unprivileged_userns_clone`:**
    
    ```bash
    echo 'kernel.unprivileged_userns_clone=1' | sudo tee -a /etc/sysctl.d/00-local-userns.conf
    sudo service procps restart
    ```
    
2.  **Chỉnh sửa quyền cho thư mục `kctf`:**
    
    ```bash
    sudo chmod -R 755 ctf-directory/kctf
    ```
    
3.  **Kích hoạt môi trường kCTF:**
    
    ```bash
    source ctf-directory/kctf/activate
    ```
    
4.  **Tạo cluster kCTF:**
    
    ```bash
    kctf cluster create local-cluster --start --type kind
    ```
    
5.  **Deactive môi trường kCTF**
    
    ```bash
    deactivate
    
    ```
    

----------

#### **5. Install hệ thống quản lý cuộc thi (Management Platform)**

Hệ thống quản lý thách thức và nền tảng kCTF.

1.  **Cấp quyền thư mục và cd vào `ManagementPlatform`:**
    
    ```bash
    sudo chmod -R 777 ./ManagementPlatform
    cd ManagementPlatform
    ```
    
2.  **Khởi chạy hệ thống bằng Docker Compose:**
    
    ```bash
    docker compose --env-file ./ManagementPlatform/.env up --force-recreate -d
    ```
    

----------

#### **7. Cài đặt net 8.0 sdk**

**Dành cho cấu hình bổ sung hoặc sử dụng trực tiếp trên máy vật lý:**

1.  **Cài đặt các gói phụ trợ:**
    
    ``` bash
    sudo snap install dotnet-sdk --classic
    ```
  2. **Kiểm tra dotnet đã cài thành công hay chưa** 
	  ``` bash
	  donet --version
	 ```
	  Nếu lệnh trên trả về version của dotnet đã được cài đặt là 8.x.x thì đã cài đặt dotnet SDK thành công

#### 8. Build Challenge Hosting Platform:
    
   ```bash
    dotnet publish ./ControlCenterAndChallengeHosting/ChallengeManagementServer -c Release --framework net8.0 --runtime linux-x64 --self-contained true
   ```
   
#### 9. Build Control Center Platform:
    
   ```bash
    dotnet publish ./ControlCenterAndChallengeHosting/ControlCenterServer -c Release --framework net8.0 --runtime linux-x64 --self-contained true
   ```
  
  #### 10. Setup Control Center Platform
  
  Chạy lệnh:
  ``` bash
  nano ./ControlCenterAndChallengeHosting/ControlCenterServer/bin/Release/net8.0/linux-x64/publish/appsettings.json
  ```
  
  File appsettings.json có nội dung như bên dưới đây: 
  
``` json
{
  "Logging": {
    "LogLevel": {
      "Default": "Information",
      "Microsoft.AspNetCore": "Warning"
    }
  },
  "AllowedHosts": "*",
  "ConnectionStrings": {
    "RedisConnection": "127.0.0.1:6379"
  },
  "ServiceConfigs": {
    "PrivateKey": "emdungdepzai",
    "ServerHost": "http://0.0.0.0",
    "ServerPort": "5000",
    "DomainName": "control.fctf.site",
    "MaxInstanceAtTime": "3"
  },

  "EnvironmentConfigs": {
    "ENVIRONMENT_NAME": "PRODUCTION"
  },

  "ChallengeServer": [
    {
      "ServerId": "may-vip-1",
      "ServerHost": "http://fctf.site",
      "ServerPort": 5001,
      "ServerName": "may-vip-1"
    }
  ]
}
```

Các giá trị trong file trên được mô tả như sau:


| Tên thuộc tính                      | kiểu dữ liệu | Mô tả                                                                                                                                                                                                              | Recommend Value                                                                                |
| ----------------------------------- | ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------- |
| ConnectionStrings.RedisConnection   | String       | Connection String của Redis                                                                                                                                                                                        | Nên để host:port thay vì redis://host:port                                                     |
| ServiceConfigs.PrivateKey           | String       | Private Key sử dụng để giao tiếp giữa các server                                                                                                                                                                   | Bắt buộc Private Key giữa các platform phải giống nhau                                         |
| ServiceConfigs.ServerHost           | String       | Sử dụng để Platform khởi động. Phải bao gồm cả schema                                                                                                                                                              | http://0.0.0.0 nếu không sử dụng reverse proxy hoặc http://127.0.0.1 nếu sử dụng reverse proxy |
| ServiceConfigs.ServerPort           | Integer      | Port để khởi động Platform - Platform sẽ lắng nghe các connect từ port này                                                                                                                                         | > 1024                                                                                         |
| ServiceConfigs.DomainName           | String       | Sử dụng để thêm vào NGINX, map subdomain cho các challenge                                                                                                                                                         | Domain đã đăng ký                                                                              |
| ServiceConfigs.MaxInstanceAtTime    | Integer      | Sử dụng để config số instance tối đa mà 1 TEAM có thể được sử dụng                                                                                                                                                 | Dựa vào thông số máy và các biểu đồ performance test để quyết định                             |
| EnvironmentConfigs.ENVIRONMENT_NAME | String       | Có 2 giá trị khả dụng: DEV và PRODUCTION. DEV sử dụng cho môi trường test, localhost. Khi thiết lập giá trị này, nếu start challenge sẽ trả về Connection Info là localhost:port thay vì sub domain như PRODUCTION | PRODUCTION                                                                                     |
| ChallengeServer[]                   | Array        | Thuộc tính này sử dụng để define thuộc tính của các Challenge Hosting Platform như Host, Port,....                                                                                                                 |
| ChallengeServer.ServerId            | Integer      | Server ID - Sử dụng để định danh máy chủ của Challenge Hosting Platform. Có thể đặt tùy ý, nhưng các Server ID của các máy buộc phải khác nhau                                                                     |
| ChallengeServer.ServerHost          | String       | Sử dụng để định nghĩa Host/IP server. Phải bao gồm cả schema như file sample                                                                                                                                       |
| ChallengeServer.ServerPort          | Integer      | Sử dụng để định nghĩa Listen Port của server                                                                                                                                                                       |
| ChallengeServer.ServerName          | String       | Tên gợi nhớ, đặt như thế nào cũng được                                                                                                                                                                             |
