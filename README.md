# NFT Minting Platform

A modern, beautiful NFT minting platform built with Next.js, Thirdweb, and Tailwind CSS. Features a stunning gradient-based landing page design inspired by modern web applications.

## ✨ Features

### 🎨 Modern Landing Page
- **Gradient Background**: Beautiful animated gradient background with floating blob animations
- **Hero Section**: Eye-catching hero with gradient text and compelling call-to-action buttons
- **Features Section**: Highlighting platform benefits with animated icons
- **Featured Collection**: Showcase your NFT collection with modern card design
- **Responsive Design**: Fully responsive across all devices
- **Smooth Animations**: Custom CSS animations for enhanced user experience

### 🔧 NFT Minting Functionality
- **Multi-Token Support**: ERC-20, ERC-721, and ERC-1155 token standards
- **Dynamic Pricing**: Real-time price display with currency symbol override
- **Quantity Selection**: Mint multiple NFTs with quantity controls
- **Custom Address Minting**: Option to mint to custom wallet addresses
- **Wallet Integration**: Seamless wallet connection with Thirdweb
- **Transaction Feedback**: Real-time transaction status and notifications

### 🎯 User Experience
- **Modern Navigation**: Fixed navigation bar with backdrop blur effect
- **Loading States**: Skeleton loaders for smooth content loading
- **Error Handling**: Comprehensive error handling and user feedback
- **Dark Mode Ready**: Built with dark mode support
- **Accessibility**: WCAG compliant design patterns

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Thirdweb account and API keys

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd NFT-Mint
```

2. Install dependencies:
```bash
npm install
```

3. Set up your environment variables:
```bash
cp .env.example .env.local
```

4. Configure your Thirdweb settings in `src/lib/constants.ts`

5. Run the development server:
```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser

## 🎨 Design System

### Color Palette
- **Primary Gradient**: Purple to Pink (`from-purple-600 to-pink-600`)
- **Background**: Dark gradient (`from-slate-900 via-purple-900 to-slate-900`)
- **Text**: White with opacity variations for hierarchy
- **Accents**: Yellow, Blue, and Green for feature highlights

### Typography
- **Headings**: Large, bold with gradient text effects
- **Body**: Clean, readable with proper contrast
- **Buttons**: Gradient backgrounds with hover effects

### Animations
- **Blob Animation**: Floating background elements with staggered delays
- **Hover Effects**: Scale and shadow transitions on interactive elements
- **Loading States**: Smooth skeleton animations

## 📁 Project Structure

```
src/
├── app/                    # Next.js app directory
│   ├── globals.css        # Global styles and animations
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Landing page
│   └── mint/              # Minting functionality
├── components/            # React components
│   ├── landing-page.tsx   # Main landing page component
│   ├── nft-mint.tsx       # NFT minting component
│   └── ui/                # Reusable UI components
├── lib/                   # Utility functions and configurations
└── hooks/                 # Custom React hooks
```

## 🔧 Configuration

### Thirdweb Setup
Configure your contract details in `src/lib/constants.ts`:

```typescript
export const contract = getContract({
  client,
  address: "your-contract-address",
  chain: "your-chain",
});
```

### Styling Customization
- Modify colors in `tailwind.config.ts`
- Update animations in `src/app/globals.css`
- Customize components in the `src/components/` directory

## 🚀 Deployment

### Vercel (Recommended)
1. Push your code to GitHub
2. Connect your repository to Vercel
3. Configure environment variables
4. Deploy automatically

### Other Platforms
The app can be deployed to any platform that supports Next.js:
- Netlify
- Railway
- DigitalOcean App Platform
- AWS Amplify

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- Design inspiration from modern web applications
- Built with [Next.js](https://nextjs.org/)
- Powered by [Thirdweb](https://thirdweb.com/)
- Styled with [Tailwind CSS](https://tailwindcss.com/)
- Icons from [Lucide React](https://lucide.dev/)
