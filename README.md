# 🏥 MediQ - Medical Records Manager

A secure, decentralized medical records management system built with React, Firebase, and blockchain technology.

## 🎯 Current Status: Stage 1 Complete ✅

**Stage 1 - Authentication & Foundation**
- ✅ Email-link (passwordless) authentication
- ✅ Responsive layout with header and sidebar
- ✅ Firebase integration (Auth, Firestore, Storage)
- ✅ Modern UI with React 18 + Vite
- ✅ Mobile-first responsive design

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- Firebase account

### Installation

1. **Clone and install dependencies:**
   ```bash
   npm install
   ```

2. **Set up Firebase:**
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Create a new project
   - Enable Authentication → Sign-in method → Email link (passwordless)
   - Add your domain to authorized domains (localhost for development)
   - Copy your Firebase config

3. **Configure environment:**
   ```bash
   cp env.example .env
   # Edit .env with your Firebase configuration
   ```

4. **Start development server:**
   ```bash
   npm run dev
   ```

5. **Test authentication:**
   - Enter your email address
   - Check your email for the magic link
   - Click the link to sign in
   - You should see your UID on the dashboard

## 🏗️ Project Structure

```
mediq/
├── src/
│   ├── components/
│   │   ├── Auth/           # Authentication components
│   │   └── Layout/         # Layout components (Header, Sidebar)
│   ├── hooks/              # Custom React hooks
│   ├── pages/              # Page components
│   ├── services/           # Firebase and API services
│   ├── styles/             # Global CSS styles
│   └── utils/              # Utility functions
├── public/                 # Static assets
└── docs/                   # Documentation
```

## 📋 Development Roadmap

### **Stage 2 - File Upload & Storage** (Next)
- Drag & drop file upload
- Firebase Storage integration
- File metadata tracking
- Security rules

### **Stage 3 - OCR & Text Extraction**
- Client-side OCR (Tesseract.js)
- PDF text extraction (PDF.js)
- Date detection algorithms
- Search functionality

### **Stage 4 - IPFS Integration**
- Web3.Storage integration
- Decentralized backup
- CID tracking

### **Stage 5 - Blockchain Anchoring**
- Ethereum Sepolia integration
- Document hash anchoring
- MetaMask integration

### **Stage 6 - Reminders & Notifications**
- Local notifications
- Medication reminders
- Appointment alerts

### **Stage 7 - Emergency SOS**
- Location sharing
- Emergency contacts
- Secure document sharing

### **Stage 8 - Polish & Testing**
- UI/UX improvements
- Performance optimization
- Cross-browser testing

## 🔧 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## 🛡️ Security Features

- **Passwordless Authentication**: Email-link based, no passwords to compromise
- **Firebase Security Rules**: Owner-only access to documents
- **HIPAA Compliance**: Built with healthcare privacy in mind
- **End-to-end Encryption**: Planned for sensitive data
- **Blockchain Verification**: Immutable document integrity

## 🎨 Tech Stack

- **Frontend**: React 18, Vite, CSS3
- **Authentication**: Firebase Auth (Email Link)
- **Database**: Cloud Firestore
- **Storage**: Firebase Storage
- **Future**: IPFS, Ethereum, Tesseract.js, PDF.js

## 📱 Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## 🤝 Contributing

This project is built in stages. Each stage has clear acceptance criteria and deliverables. See the roadmap above for current development focus.

## 📄 License

MIT License - see LICENSE file for details

## 🆘 Support

For issues and questions:
1. Check the current stage status above
2. Review Firebase configuration
3. Ensure all environment variables are set correctly

---

**Stage 1 Acceptance Criteria Met:**
- ✅ Sign in via email link
- ✅ See UID on dashboard
- ✅ Responsive layout works on mobile/desktop
- ✅ Firebase properly configured

Ready for Stage 2! 🚀
