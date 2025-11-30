# Voice Mart Backend

Backend server for the AI-Powered Voice Shopping Platform with TypeScript support.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.example .env
# Edit .env with your actual values
```

### Development

```bash
# Run with nodemon (hot-reload)
npm run dev

# Run with tsx (without nodemon)
npm run start:dev

# Type checking only
npm run type-check
```

### Production

```bash
# Build TypeScript to JavaScript
npm run build

# Run production build
npm start
```

## 📁 Project Structure

```
voice-mart-backend/
├── src/                    # TypeScript source files
│   ├── server.ts          # Main server entry point
│   ├── routes/            # API routes
│   ├── controllers/       # Route controllers
│   ├── middleware/        # Custom middleware
│   ├── models/            # Data models
│   ├── services/          # Business logic
│   ├── utils/             # Utility functions
│   └── types/             # TypeScript type definitions
├── dist/                  # Compiled JavaScript (generated)
├── uploads/               # File uploads directory
├── .env                   # Environment variables (not in git)
├── .env.example           # Environment template
├── tsconfig.json          # TypeScript configuration
├── nodemon.json           # Nodemon configuration
└── package.json           # Dependencies and scripts
```

## 🛠️ Tech Stack

- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js
- **AI**: Google Generative AI (Gemini)
- **Authentication**: JWT + bcrypt
- **Security**: Helmet, CORS, Rate Limiting
- **File Upload**: Multer
- **Dev Tools**: nodemon, tsx

## 📝 Available Scripts

- `npm run dev` - Start development server with hot-reload
- `npm run build` - Build TypeScript to JavaScript
- `npm start` - Run production build
- `npm run start:dev` - Run TypeScript directly with tsx
- `npm run type-check` - Check TypeScript types without building

## 🔐 Environment Variables

See `.env.example` for all available configuration options.

## 📄 License

ISC

## 👤 Author

Krishna H Pallan
