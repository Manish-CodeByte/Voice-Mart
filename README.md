# 🛒 Voice Mart - AI-Powered Voice Commerce Platform

A next-generation e-commerce platform with advanced voice control, multilingual support, and AI-powered visual search capabilities.

![Voice Mart](https://img.shields.io/badge/Voice-Enabled-blue) ![AI Powered](https://img.shields.io/badge/AI-Powered-green) ![Multilingual](https://img.shields.io/badge/Multilingual-6%20Languages-orange)

## ✨ Key Features

### 🎤 Voice Assistant

- **Natural Language Processing** with Ollama AI
- **Speech-to-Text** using Google Cloud STT (6 languages)
- **Text-to-Speech** with Google TTS
- **Voice Commands** for navigation, search, cart management, and more
- **Context-Aware** - understands "this item", "latest order", etc.

### 📸 Visual Search

- **Image-Based Product Search** using Google Vision API
- **Smart Navigation** - goes directly to exact matches
- **Label & Text Detection** for accurate product matching
- **Relevance Scoring** algorithm

### 🌍 Multilingual Support

- English, Hindi, Kannada, Tamil, Telugu, Malayalam
- **Real-time Translation** for UI and content
- **Voice Commands** in all supported languages
- **Phonetic Correction** for STT mishearings

### 🛍️ E-Commerce Features

- Product catalog with categories and filters
- Shopping cart with voice control
- Wishlist management
- Order tracking and cancellation
- Multiple payment methods (COD, Card, UPI, Net Banking)
- Address management
- Product reviews and ratings

### 🎨 Modern UI/UX

- Dark/Light theme support
- Responsive design (mobile, tablet, desktop)
- Smooth animations with Framer Motion
- Glassmorphism effects
- Premium design aesthetics

## 🏗️ Tech Stack

### Frontend

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Authentication:** Clerk
- **State Management:** React Context API
- **Animations:** Framer Motion
- **UI Components:** Custom components with Lucide icons
- **Notifications:** Sonner

### Backend

- **Runtime:** Node.js with Express
- **Language:** TypeScript
- **Database:** Firebase Firestore
- **Authentication:** Clerk
- **AI/ML:**
  - Ollama (Mistral) for NLP
  - Google Cloud Speech-to-Text
  - Google Cloud Text-to-Speech
  - Google Cloud Vision API
- **Payment:** Razorpay
- **Logging:** Winston

## 📋 Prerequisites

- **Node.js** 18+ and npm
- **Ollama** installed locally ([Download](https://ollama.ai))
- **Google Cloud Account** with billing enabled
- **Firebase Project** with Firestore
- **Clerk Account** for authentication
- **Razorpay Account** (optional, for payments)

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd "Voice Mart"
```

### 2. Install Ollama and Pull Model

```bash
# Install Ollama from https://ollama.ai
# Then pull the Mistral model
ollama pull mistral
```

### 3. Set Up Google Cloud APIs

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project or select existing
3. Enable the following APIs:
   - Cloud Speech-to-Text API
   - Cloud Text-to-Speech API
   - Cloud Vision API
4. Enable billing for the project
5. Create an API key (or service account)
6. Copy the API key for later use

### 4. Set Up Firebase

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Create a new project
3. Enable Firestore Database
4. Get your Firebase config credentials
5. Download service account key JSON

### 5. Set Up Clerk

1. Go to [Clerk Dashboard](https://dashboard.clerk.com)
2. Create a new application
3. Get your publishable and secret keys

### 6. Configure Backend

```bash
cd voice-mart-backend
npm install
```

Create `.env` file:

```env
# Server
PORT=5001
NODE_ENV=development

# Firebase
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=your-service-account@project.iam.gserviceaccount.com

# Clerk
CLERK_SECRET_KEY=sk_test_...

# Google Cloud APIs (use same key for all)
GOOGLE_STT_KEY=your-google-api-key
GOOGLE_TTS_KEY=your-google-api-key
GOOGLE_VISION_KEY=your-google-api-key

# Ollama
OLLAMA_BASE_URL=http://localhost:11434

# Razorpay (optional)
RAZORPAY_KEY_ID=your-razorpay-key
RAZORPAY_KEY_SECRET=your-razorpay-secret

# CORS
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173
```

### 7. Configure Frontend

```bash
cd ../voice-mart-frontend
npm install
```

Create `.env.local` file:

```env
# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...

# API
NEXT_PUBLIC_API_URL=http://localhost:5001

# Razorpay (optional)
NEXT_PUBLIC_RAZORPAY_KEY_ID=your-razorpay-key
```

### 8. Start the Application

**Option 1: Run from Root (Recommended)**

```bash
# From project root
npm run dev
```

This will start both frontend and backend concurrently.

**Option 2: Run Separately**

Terminal 1 (Backend):

```bash
cd voice-mart-backend
npm run dev
```

Terminal 2 (Frontend):

```bash
cd voice-mart-frontend
npm run dev
```

### 9. Access the Application

- **Frontend:** http://localhost:3000
- **Backend:** http://localhost:5001
- **Backend API Docs:** http://localhost:5001

## 🎯 Usage Guide

### Voice Commands

**Navigation:**

- "Go to home"
- "Show cart"
- "Go to checkout"
- "Show my orders"

**Search:**

- "Search for laptops"
- "Show phones under 20000"
- "Find gaming laptops"

**Cart Management:**

- "Add this to cart" (on product page)
- "Add iPhone to cart"
- "Remove MacBook from cart"

**Orders:**

- "Cancel latest order"
- "Cancel order 1"
- "Cancel Acer Predator" (by product name)

**Settings:**

- "Switch to dark mode"
- "Change language to Hindi"
- "Switch to Kannada"

**Payment:**

- "Pay with cash on delivery"
- "Use card payment"
- "Pay with UPI"

### Image Search

1. Click the camera icon in the search bar
2. Upload a product image
3. System will:
   - Navigate to exact product if found
   - Show similar products if multiple matches

## 📁 Project Structure

```
Voice Mart/
├── voice-mart-frontend/          # Next.js frontend
│   ├── app/                      # App router pages
│   ├── components/               # React components
│   ├── contexts/                 # Context providers
│   ├── lib/                      # Utilities and API client
│   └── public/                   # Static assets
│
├── voice-mart-backend/           # Express backend
│   ├── src/
│   │   ├── controllers/          # Route controllers
│   │   ├── services/             # Business logic
│   │   │   ├── sttService.ts    # Speech-to-Text
│   │   │   ├── ttsService.ts    # Text-to-Speech
│   │   │   ├── ollamaService.ts # NLP processing
│   │   │   └── visionService.ts # Image analysis
│   │   ├── routes/               # API routes
│   │   ├── middleware/           # Express middleware
│   │   ├── models/               # Data models
│   │   └── utils/                # Utilities
│   └── logs/                     # Application logs
│
└── README.md                     # This file
```

## 🔧 Configuration

### Ollama Model

The default model is `mistral`. To use a different model:

1. Pull the model: `ollama pull <model-name>`
2. Update `OLLAMA_MODEL` in backend `.env`

### Supported Languages

| Language  | Code | STT Code | Voice Commands |
| --------- | ---- | -------- | -------------- |
| English   | en   | en-IN    | ✅             |
| Hindi     | hi   | hi-IN    | ✅             |
| Kannada   | kn   | kn-IN    | ✅             |
| Tamil     | ta   | ta-IN    | ✅             |
| Telugu    | te   | te-IN    | ✅             |
| Malayalam | ml   | ml-IN    | ✅             |

## 🐛 Troubleshooting

### Google Cloud Billing Error

**Error:** "Billing must be enabled"

**Solution:**

1. Go to Google Cloud Console
2. Enable billing for your project
3. Wait 2-3 minutes for changes to propagate

### Ollama Connection Error

**Error:** "Failed to connect to Ollama"

**Solution:**

1. Ensure Ollama is running: `ollama serve`
2. Check if model is pulled: `ollama list`
3. Pull model if needed: `ollama pull mistral`

### Vision API Not Enabled

**Error:** "Cloud Vision API has not been used"

**Solution:**

1. Go to the link in the error message
2. Click "Enable API"
3. Wait 2-3 minutes

### Port Already in Use

**Error:** "Port 3000/5001 already in use"

**Solution:**

```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Linux/Mac
lsof -ti:3000 | xargs kill -9
```

## 📊 API Endpoints

### Voice

- `POST /api/voice/voice-command` - Process voice command
- `POST /api/voice/text-command` - Process text command

### Products

- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get product by ID
- `POST /api/search/image` - Search by image

### Cart

- `GET /api/cart` - Get user cart
- `POST /api/cart` - Add to cart
- `DELETE /api/cart/:productId` - Remove from cart

### Orders

- `GET /api/orders` - Get user orders
- `POST /api/orders` - Create order
- `PUT /api/orders/:id/cancel` - Cancel order

## 🔐 Security

- **Authentication:** Clerk with JWT tokens
- **API Keys:** Stored in environment variables
- **CORS:** Configured for allowed origins
- **Rate Limiting:** Implemented on API endpoints
- **Input Validation:** All user inputs sanitized

## 🚀 Deployment

### Frontend (Vercel)

```bash
cd voice-mart-frontend
vercel deploy
```

### Backend (Render/Railway)

1. Push code to GitHub
2. Connect repository to Render/Railway
3. Add environment variables
4. Deploy

## 📝 License

This project is licensed under the MIT License.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📧 Support

For issues and questions, please open an issue on GitHub.

---

**Built with ❤️ using Next.js, Express, and AI By Manish S , K.Thejaswi Nayak , Bhoomika Upadhyaya , Arpitha Poojary 

