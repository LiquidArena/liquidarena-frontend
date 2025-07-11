# 🔥 Liquid Arena

**Stake. Predict. Conquer.**

Liquid Arena is a revolutionary DeFi battle arena where users stake their LP (Liquidity Provider) tokens in real-time price prediction duels. Outsmart your opponents, survive the price range, and win both LP positions. No luck, just skill.

## 🎯 What is Liquid Arena?

Liquid Arena transforms traditional DeFi into an exciting skill-based gaming experience. Players stake their LP tokens in head-to-head battles, predicting price movements within specific time windows. The winner takes all LP tokens from both participants.

### Key Features

- **🎮 Skill-Based Battles**: No random chance - pure strategy and market knowledge
- **💰 LP Token Staking**: Use your existing liquidity positions as battle stakes
- **⏱️ Real-Time Duels**: Fast-paced battles with customizable time windows
- **🏆 Winner Takes All**: Victorious players claim both LP positions
- **📊 Live Leaderboards**: Track top performers and battle statistics
- **🔐 Secure Smart Contracts**: Battle-tested contracts ensure fair play

## 🚀 How It Works

1. **Connect Wallet** - Link your Web3 wallet to get started
2. **Create/Join Battle** - Select time window and LP tokens to stake
3. **Let The Fight Begin** - Confirm your stake and wait for battle to commence
4. **The Winner Takes All** - Outsmart your opponent and claim victory

## 🛠️ Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS, Radix UI components
- **Web3**: Wagmi, RainbowKit, Viem
- **Backend**: Supabase, GraphQL
- **DeFi Integration**: Uniswap V3 SDK
- **Charts**: Recharts for data visualization

## 📦 Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd liquidarena
```

2. Install dependencies:

```bash
npm install
```

3. Set up environment variables:

```bash
cp .env.example .env.local
# Add your environment variables
```

4. Run the development server:

```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## 🎮 Battle Types

### LP Battle Vault

- Stake LP tokens in time-based prediction battles
- Winner determined by price range survival
- Emergency withdrawal mechanisms for safety

### LP Fee Battle

- Compete based on fee generation from LP positions
- Rewards distributed based on performance metrics

## 📊 Battle States

- **Queued**: Battle created, waiting for opponent
- **Ongoing**: Battle in progress, monitoring price movements
- **Ready to Resolve**: Battle completed, awaiting resolution
- **Ended**: Battle resolved, rewards distributed

## 🔧 Available Scripts

- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build production application
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript type checking
- `npm run prettier` - Format code with Prettier

## 🏗️ Project Structure

```
src/
├── app/                 # Next.js app router pages
│   ├── (homepage)/     # Landing page
│   ├── arena/          # Battle arena interface
│   ├── leaderboard/    # Rankings and statistics
│   ├── profile/        # User profiles
│   └── api/            # API routes
├── components/         # Reusable UI components
├── contracts/          # Smart contract interfaces
├── hooks/              # Custom React hooks
├── lib/                # Utility libraries
├── types/              # TypeScript type definitions
└── utils/              # Helper functions
```

## 🔐 Security Features

- **Smart Contract Auditing**: Battle-tested contract architecture
- **Emergency Withdrawals**: Safety mechanisms for unexpected scenarios
- **Pausable Contracts**: Admin controls for emergency situations
- **Price Feed Validation**: Reliable oracle integration

## 🌟 Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🤝 Support

For support, questions, or feedback:

- Create an issue in this repository
- Join our community Discord
- Follow us on social media

---

**Ready to enter the arena? Connect your wallet and start battling!** 🔥
