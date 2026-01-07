# Online Learning Platform

Nền tảng học trực tuyến được xây dựng bằng React, Node.js, Express và MongoDB.

## Công nghệ sử dụng

### Client
- React 19 + Vite
- TypeScript
- Tailwind CSS
- React Router DOM
- Zustand (state management)
- Axios

### Server
- Express.js 5
- Node.js
- MongoDB + Mongoose
- JWT (authentication)
- Cloudinary (upload file)

## Yêu cầu hệ thống

- **Node.js** v18 trở lên
- **MongoDB** (đang chạy ở localhost:27017)

## Cài đặt

### 1. Cài đặt Dependencies

```bash
# Cài đặt server dependencies
cd server
npm install

# Cài đặt client dependencies
cd ../client
npm install
```

### 2. Cấu hình Database

Đảm bảo MongoDB đang chạy. Cấu hình trong `server/.env`:

```env
MONGO_URI=mongodb://localhost:27017/online_learning_platform
PORT=5000
JWT_SECRET=super_secret_key_change
```

## Chạy Project

### Terminal 1 - Server (port 5000)

```bash
cd server
npm run dev
```

### Terminal 2 - Client (port 5173)

```bash
cd client
npm run dev
```

## Truy cập

- **Client:** http://localhost:5173
- **API:** http://localhost:5000

## Cấu trúc thư mục

```
OnlineLearningPlatform/
├── client/                 # Frontend React
│   ├── src/
│   │   ├── api/           # API calls
│   │   ├── components/    # Reusable components
│   │   ├── hooks/         # Custom hooks
│   │   ├── pages/         # Page components
│   │   ├── store/         # Zustand store
│   │   ├── types/         # TypeScript types
│   │   └── utils/         # Utility functions
│   └── package.json
├── server/                 # Backend Express
│   ├── src/
│   │   ├── config/        # Database, Cloudinary config
│   │   ├── middlewares/   # Auth & permission middleware
│   │   ├── models/        # Mongoose models
│   │   ├── routes/        # API routes
│   │   ├── services/      # Business logic
│   │   └── utils/         # Utility functions
│   └── package.json
└── README.md
```
