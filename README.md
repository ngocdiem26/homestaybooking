# Homestay Booking Platform

Hệ thống thương mại điện tử hỗ trợ tìm kiếm và đặt homestay trực tuyến, được phát triển với kiến trúc Frontend – Backend và tích hợp các dịch vụ AI nhằm hỗ trợ tìm kiếm, tư vấn và lập lịch trình du lịch.

Dự án được xây dựng nhằm áp dụng các kiến thức về phát triển ứng dụng Web, thiết kế cơ sở dữ liệu, xây dựng RESTful API, xác thực và phân quyền, tích hợp thanh toán trực tuyến và ứng dụng AI vào hệ thống thực tế.

## 1. Chức năng chính

### Khách hàng

* Đăng ký, đăng nhập và quản lý tài khoản.
* Đăng nhập bằng Google.
* Tìm kiếm và lọc homestay theo địa điểm, giá, tiện nghi và số lượng khách.
* Xem thông tin chi tiết homestay.
* Kiểm tra tình trạng phòng theo ngày.
* Đặt homestay và theo dõi lịch sử đặt phòng.
* Thanh toán trực tuyến qua VNPay.
* Sử dụng mã khuyến mãi.
* Quản lý danh sách homestay yêu thích.
* Đánh giá và nhận xét sau khi sử dụng dịch vụ.
* Nhận hỗ trợ thông qua AI Chatbot.
* Tạo lịch trình du lịch cá nhân hóa bằng AI.

### Chủ homestay

* Đăng ký và quản lý homestay.
* Quản lý thông tin, hình ảnh, phòng và tiện nghi.
* Quản lý giá và trạng thái homestay.
* Quản lý các đơn đặt phòng.
* Xử lý yêu cầu đặt phòng.
* Theo dõi đánh giá từ khách hàng.
* Quản lý chương trình khuyến mãi cho homestay.

### Quản trị viên

* Quản lý người dùng và chủ homestay.
* Duyệt và quản lý homestay.
* Quản lý đơn đặt phòng.
* Quản lý chương trình khuyến mãi.
* Quản lý đánh giá và kiểm duyệt nội dung.
* Quản lý hệ thống phân loại khách hàng.
* Theo dõi và quản lý dữ liệu hệ thống.

## 2. AI Chatbot

Hệ thống tích hợp AI Chatbot nhằm hỗ trợ người dùng tương tác với nền tảng bằng ngôn ngữ tự nhiên.

Các chức năng chính:

* Tìm kiếm homestay theo nhu cầu của người dùng.
* Tư vấn homestay dựa trên địa điểm, giá, số khách và tiện nghi.
* Tra cứu thông tin khuyến mãi.
* Hỗ trợ các vấn đề liên quan đến đặt phòng và thanh toán.
* Gợi ý địa điểm và hoạt động du lịch.
* Hỗ trợ lập lịch trình du lịch cá nhân hóa.

Chatbot kết hợp mô hình AI với dữ liệu và nghiệp vụ của hệ thống. Các truy vấn dữ liệu được xử lý thông qua Backend thay vì cho phép mô hình AI thực thi trực tiếp các câu lệnh SQL.

## 3. Tạo lịch trình du lịch bằng AI

Người dùng có thể cung cấp:

* Điểm đến.
* Ngày bắt đầu và số ngày.
* Số lượng người.
* Phong cách du lịch.
* Nhịp độ chuyến đi.
* Sở thích.
* Hoạt động muốn tham gia.
* Địa điểm hoặc hoạt động riêng muốn thêm.

Hệ thống sử dụng dữ liệu hoạt động có sẵn để xây dựng lịch trình phù hợp với thời gian, địa điểm và nhu cầu của người dùng.

Lịch trình có thể bao gồm các hoạt động, ăn uống, nghỉ ngơi, di chuyển và thời gian tự do.

## 4. Đánh giá và kiểm duyệt

Hệ thống hỗ trợ kiểm duyệt nội dung đánh giá bằng cách kết hợp:

* Luật phát hiện nội dung tiếng Việt.
* OpenAI Moderation API.
* Phân tích mức độ vi phạm.
* Quy trình kiểm duyệt của quản trị viên.

Các đánh giá thông thường được hiển thị ngay sau khi gửi. Những nội dung có dấu hiệu vi phạm hoặc cần xem xét sẽ được đánh dấu để quản trị viên xử lý. Các nội dung vi phạm nghiêm trọng có thể được ẩn tự động.

## 5. Khuyến mãi và phân loại khách hàng

Hệ thống hỗ trợ nhiều phạm vi áp dụng khuyến mãi:

* Khuyến mãi toàn hệ thống.
* Khuyến mãi theo homestay.
* Khuyến mãi theo người dùng.
* Khuyến mãi theo hạng khách hàng.
* Khuyến mãi kết hợp homestay và người dùng.
* Khuyến mãi kết hợp homestay và hạng khách hàng.

Khách hàng được phân loại theo các cấp độ dựa trên lịch sử đặt phòng và có thể nhận được các chương trình ưu đãi phù hợp.

## 6. Thanh toán

Hệ thống tích hợp VNPay để hỗ trợ thanh toán trực tuyến.

Quy trình thanh toán:

```text
Khách hàng
    |
    v
Tạo đơn đặt phòng
    |
    v
Backend tạo yêu cầu thanh toán
    |
    v
VNPay
    |
    v
Khách hàng thực hiện thanh toán
    |
    v
VNPay gửi kết quả
    |
    v
Backend xác thực và cập nhật trạng thái
```

Hệ thống sử dụng Return URL và IPN để xử lý kết quả thanh toán.

## 7. Công nghệ sử dụng

### Frontend

* React.js
* Vite
* JavaScript
* Tailwind CSS
* Ant Design
* Axios

### Backend

* Java
* Spring Boot
* Spring Data JPA
* Spring Security
* JWT
* RESTful APIs
* Maven

### Database

* MySQL

### AI và tìm kiếm

* Google Gemini API
* RAG (Retrieval-Augmented Generation)
* Qdrant
* Embedding và Vector Search
* OpenAI Moderation API

### Dịch vụ tích hợp

* VNPay
* Google Authentication
* Gmail SMTP

### Công cụ phát triển

* Git
* GitHub
* Postman
* MySQL Workbench
* StarUML
* PowerDesigner
* IntelliJ IDEA
* Visual Studio Code

## 8. Kiến trúc hệ thống

Hệ thống được xây dựng theo mô hình Frontend – Backend với các thành phần chính:

```text
                    React Frontend
                          |
                          | REST API
                          v
                  Spring Boot Backend
                          |
             +------------+------------+
             |            |            |
             v            v            v
           MySQL       AI Services   External APIs
                         |              |
                         |              +-- VNPay
                         |              +-- Google
                         |              +-- Gmail
                         |
                    Gemini / RAG
                         |
                       Qdrant
```

Backend được tổ chức theo các tầng Controller, Service, Repository và sử dụng Spring Security để xử lý xác thực và phân quyền.

## 9. Cấu trúc dự án

```text
HomestayBooking/
│
├── be_sprb/
│   ├── src/
│   │   └── main/
│   │       ├── java/
│   │       │   └── com/homestaybooking/
│   │       │       ├── config/
│   │       │       ├── controller/
│   │       │       ├── dto/
│   │       │       ├── entity/
│   │       │       ├── exception/
│   │       │       ├── repository/
│   │       │       ├── security/
│   │       │       └── service/
│   │       └── resources/
│   │
│   └── pom.xml
│
├── fe_react/
│   └── fe/
│       ├── src/
│       │   ├── api/
│       │   ├── components/
│       │   ├── hooks/
│       │   ├── pages/
│       │   ├── services/
│       │   └── ...
│       ├── package.json
│       └── vite.config.js
│
└── README.md
```

## 10. Yêu cầu môi trường

* Java 17+
* Node.js
* MySQL 8+
* Maven
* Git

Ngoài ra, cần cấu hình các dịch vụ bên thứ ba như Gemini, VNPay, Google Authentication và Gmail SMTP.

## 11. Cài đặt

### Clone repository

```bash
git clone https://github.com/ngocdiem26/homestaybooking.git
cd homestaybooking
```

### Cấu hình Database

Tạo database MySQL:

```sql
CREATE DATABASE lvtn
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;
```

Sau đó cấu hình thông tin kết nối cơ sở dữ liệu trong file môi trường của Backend.

### Chạy Backend

```bash
cd be_sprb
.\mvnw spring-boot:run
```

Backend mặc định:

```text
http://localhost:8080
```

### Chạy Frontend

Mở terminal mới:

```bash
cd fe_react/fe
npm install
npm run dev
```

Frontend mặc định:

```text
http://localhost:5173
```

## 12. Cấu hình biến môi trường

Các thông tin nhạy cảm được cấu hình thông qua file `.env`, ví dụ:

```env
DB_URL=...
DB_USERNAME=...
DB_PASSWORD=...

JWT_SECRET=...

GEMINI_API_KEY=...

VNPAY_TMN_CODE=...
VNPAY_HASH_SECRET=...

MAIL_USERNAME=...
MAIL_PASSWORD=...
```

Không đưa file `.env`, API key, mật khẩu database hoặc thông tin xác thực dịch vụ bên thứ ba lên GitHub.

## 13. Bảo mật

Hệ thống áp dụng:

* JWT Authentication.
* Role-Based Access Control (RBAC).
* Phân quyền theo vai trò người dùng.
* Mã hóa mật khẩu.
* Kiểm tra quyền truy cập tại Backend.
* Kiểm tra dữ liệu đầu vào.
* Bảo vệ các API yêu cầu xác thực.
* Quản lý thông tin nhạy cảm thông qua biến môi trường.

## 14. Mục tiêu dự án

Dự án được thực hiện nhằm xây dựng một hệ thống đặt homestay trực tuyến có khả năng đáp ứng các nghiệp vụ cơ bản của nền tảng thương mại điện tử, đồng thời nghiên cứu khả năng ứng dụng AI vào:

* Tìm kiếm và tư vấn homestay.
* Gợi ý nội dung phù hợp với nhu cầu người dùng.
* Hỗ trợ lập lịch trình du lịch.
* Kiểm duyệt nội dung đánh giá.

## 15. Tác giả

**Thạch Thị Ngọc Diễm**

Information Technology Student

GitHub: https://github.com/ngocdiem26

## 16. License

Dự án được thực hiện với mục đích học tập và nghiên cứu.
