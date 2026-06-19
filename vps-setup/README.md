# VPS Setup — Node.js + PostgreSQL backend

Bộ script tự động dựng VPS Ubuntu để chạy backend Node.js + PostgreSQL,
có Nginx reverse proxy và HTTPS.

## Thứ tự làm

### 0. Đưa thư mục này lên VPS
Trên MÁY CỦA BẠN (không phải VPS), copy cả thư mục lên VPS:
```bash
scp -r vps-setup root@IP_VPS:/root/
```
Rồi SSH vào VPS:
```bash
ssh root@IP_VPS
cd /root/vps-setup
```

### 1. Sửa thông tin của bạn trong script
Mở file `01-server-setup.sh`, sửa phần "BIẾN CẦN SỬA" ở đầu file
(domain, mật khẩu DB, tên DB...).
```bash
nano 01-server-setup.sh
```

### 2. Chạy script dựng server (chạy bằng root)
```bash
bash 01-server-setup.sh
```
Script này tự cài: update hệ thống, user `deploy`, firewall, swap,
Node.js, PostgreSQL (tạo sẵn DB + user), Nginx, PM2, fail2ban.

### 3. Trỏ DNS
Vào trang quản lý DNS của domain, tạo bản ghi A:
| Type | Name | Value  |
|------|------|--------|
| A    | api  | IP_VPS |
(Nếu dùng Cloudflare: để "DNS only" / mây xám khi cài SSL.)

### 4. Đưa code backend lên & chạy (xem 02-app-deploy.sh)
```bash
su - deploy
cd /root/vps-setup   # hoặc nơi bạn để file
bash 02-app-deploy.sh
```

### 5. Bật HTTPS
```bash
sudo certbot --nginx -d api.YOURDOMAIN.com
```

Xong! Test: `curl https://api.YOURDOMAIN.com`

## Các file
- `01-server-setup.sh` — dựng toàn bộ server (chạy 1 lần, bằng root)
- `02-app-deploy.sh`   — clone code + cài deps + chạy PM2 (bằng user deploy)
- `nginx-api.conf`     — mẫu cấu hình Nginx (script tự copy)
- `ecosystem.config.js`— cấu hình PM2 cho app
- `.env.example`       — mẫu biến môi trường
