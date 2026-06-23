# OrangeEconomy.ng

Welcome to the **OrangeEconomy.ng** platform repository! OrangeEconomy is a dedicated professional networking, collaboration, and marketplace platform designed explicitly for the Nigerian creative and cultural sectors (the "Orange Economy"). It bridges the gap between creatives, government agencies, and businesses.

## 🚀 Technical Architecture

This project is built using modern web development practices to ensure scalability, speed, and real-time capabilities.

- **Framework**: [Next.js 14](https://nextjs.org/) (using the App Router for server-side rendering, layout management, and fast navigation).
- **Backend & Database**: [Supabase](https://supabase.com/) (PostgreSQL database, Authentication, Real-time subscriptions, and Storage).
- **Styling**: Vanilla CSS coupled with [Tailwind CSS](https://tailwindcss.com/) utility classes to achieve dynamic, responsive, and premium visual aesthetics.
- **Language**: JavaScript (ES6+) & React 18.

### Directory Structure

- `src/app/`: Contains the Next.js App Router endpoints. Key feature-based directories include:
  - `auth/`, `login/`, `signup/`: Authentication flows and session management.
  - `feed/`, `discover/`: Content discovery and the main social feed.
  - `marketplace/`: For buying and selling creative services or products.
  - `messages/`: Real-time chat functionality.
  - `contracts/`, `offers/`: For managing professional engagements and business proposals.
  - `profile/`, `user/`: User profile management and customization.
  - `admin/`, `official/`: Dashboards for platform administrators and state/government agencies.
  - `initiatives/`: Showcasing government or corporate support programs for creatives.
- `src/components/`: Reusable, modular UI components.
  - `chat/`: Real-time chat interfaces and messaging bubbles.
  - `feed/`: Post cards, creation forms, and trending sidebar widgets.
  - `layout/`: Navbars, sidebars, and global layout wrappers.
- `src/utils/`: Helper functions, including secure `supabase` client initialization for both server-side and client-side operations.

## ⚙️ Core Workflows & Features

1. **User Authentication & Onboarding**
   - Secure login and registration powered by Supabase Auth.
   - Differentiated account types: Creatives, Businesses, and Government Agencies, each with tailored UI experiences.
2. **Dynamic Feed & Networking**
   - Real-time activity feed featuring posts, images, and text content.
   - Social interactions including like, comment, and share functionalities.
   - Trending hashtags dynamically generated based on recent platform activity.
3. **Real-Time Messaging**
   - Direct user-to-user messaging facilitating immediate professional communication and collaboration.
4. **Marketplace & Contracts**
   - Dedicated spaces for creatives to list services and for clients to extend offers, negotiate terms, and manage active contracts.
5. **Wallet Integration**
   - Native wallet system tracking balances (🪙) for platform transactions, tipping, or marketplace purchases.

## 🛠️ Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm, yarn, pnpm, or bun
- A Supabase Project configured with corresponding tables (`profiles`, `posts`, `likes`, `comments`, etc.)

### Installation

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd orangelinkedin
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Environment Setup:**
   Create a `.env.local` file in the root directory and add your Supabase credentials:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Run the Development Server:**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## 🔮 Future Areas of Improvement

As the OrangeEconomy platform scales, the following areas have been identified for future roadmap development:

1. **Blockchain & Smart Contract Integration**: Fully decentralize the `contracts` and `wallet_balance` features using Web3 technologies to ensure trustless escrow and transparent creative intellectual property rights tracking.
2. **AI-Powered Matchmaking**: Implement an AI recommendation engine to connect creatives with specific government initiatives, businesses, and collaboration opportunities that match their skill sets.
3. **Native Mobile App**: Develop a companion cross-platform mobile application (e.g., using React Native) to increase accessibility for creatives heavily reliant on mobile devices.
4. **Rich Media Streaming**: Add native audio and video hosting capabilities, allowing musicians, filmmakers, and podcasters to stream their content directly on the platform without relying on external embeds.
5. **Advanced Analytics Dashboard**: Provide creatives and agencies with deep, actionable insights into post engagement, profile views, audience demographics, and marketplace performance.
6. **Enhanced Governance Portal**: Expand the `official` and `initiatives` routes into a full suite for government bodies to review applications, disburse grants, and manage creative sector funding transparently.

## 📄 License

This project is licensed under the MIT License.
