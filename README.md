# AI CFO Assistant

A comprehensive financial analysis and management platform built with Next.js, designed to help CFOs and financial professionals analyze financial data, generate insights, and make informed decisions.

## 🚀 Features

### Core Functionality

- **Simple File Upload**: Just upload your Excel (.xlsx), CSV, or PDF financial documents
- **Automatic Analysis**: Backend automatically processes and analyzes your financial data
- **Comprehensive Insights**: Get detailed P&L, balance sheet, cash flow, and ratio analysis
- **AI-Powered Recommendations**: Strategic recommendations and predictive insights
- **Dashboard Analytics**: Interactive visualizations and comprehensive financial metrics

### Financial Analysis

- **Account Classification**: Automatic categorization of accounts (Assets, Liabilities, Equity, Revenue, Expenses)
- **Balance Sheet Analysis**: Assets, Liabilities, and Equity reconciliation
- **Income Statement**: Revenue, expenses, and profitability analysis
- **Cash Flow Insights**: Operating, investing, and financing flow analysis
- **KPI Calculations**: Key performance indicators and financial ratios

### Comprehensive Financial Analysis Features

- **Profit & Loss Analysis**: Detailed revenue breakdown, cost structure, and profitability metrics
- **Balance Sheet Reconciliation**: Complete asset, liability, and equity analysis
- **Cash Flow Statement**: Operating, investing, and financing activities tracking
- **Financial Ratios**: Profitability, liquidity, efficiency, and leverage ratios
- **Working Capital Management**: AR/AP aging analysis and cash conversion cycle
- **What-If Scenarios**: Revenue impact analysis and cost optimization scenarios
- **Executive Dashboard**: Business health scoring and KPI monitoring

### AI Insights

- **Anomaly Detection**: Identifies unusual financial patterns and red flags
- **Trend Analysis**: Tracks financial performance over time
- **Recommendations**: AI-generated suggestions for financial improvement
- **Risk Assessment**: Evaluates financial health and stability

### Advanced AI-Powered Insights

- **Trend Analysis**: Statistical confidence-based forecasting with key drivers identification
- **Anomaly Detection**: Critical, high, medium, and low severity alerts with root cause analysis
- **Pattern Recognition**: Seasonal patterns and business impact analysis
- **Predictive Analytics**: Cash flow forecasting and performance predictions
- **Strategic Recommendations**: Immediate actions, short-term improvements, and long-term initiatives
- **Risk Mitigation**: Proactive alerts and preventive action recommendations

## 🏗️ Architecture

### Tech Stack

- **Frontend**: Next.js 15, React 18, TypeScript
- **Styling**: Tailwind CSS, shadcn/ui components
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: Clerk (OAuth, SSO)
- **AI Integration**: OpenAI GPT-4 API
- **File Processing**: xlsx, pdf-parse, csv-parser

### Project Structure

```
AI-CFO-Assistant/
├── app/                    # Next.js app router
│   ├── api/               # API endpoints
│   ├── dashboard/         # Main dashboard page
│   ├── upload/            # File upload interface
│   ├── reports/           # Financial reports view
│   ├── analytics/         # Financial analytics
│   ├── forecasting/       # Financial forecasting
│   └── profile/           # User profile management
├── components/            # Reusable UI components
│   ├── ui/               # shadcn/ui components
│   ├── layout/           # Layout components
│   ├── dashboard/        # Dashboard-specific components
│   └── upload/           # Upload-related components
├── lib/                  # Core business logic
│   ├── ai-service.ts     # OpenAI integration
│   ├── parsers.ts        # File parsing logic
│   ├── db.ts            # Database operations
│   └── utils.ts         # Utility functions
└── prisma/               # Database schema and migrations
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database
- OpenAI API key
- Clerk account for authentication

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd AI-CFO-Assistant
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Environment Setup**
   Create a `.env.local` file:

   ```env
   # Backend API Configuration
   NEXT_PUBLIC_BASE_URL=http://localhost:8000

   # Database
   DATABASE_URL="postgresql://username:password@localhost:5432/ai_cfo_db"

   # OpenAI
   OPENAI_API_KEY="your_openai_api_key"

   # Clerk Authentication
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="your-clerk-publishable-key"
   CLERK_SECRET_KEY="your-clerk-secret-key"
   NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
   NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
   NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
   NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard

   # Stripe Configuration (if using payments)
   STRIPE_SECRET_KEY=your_stripe_secret_key
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
   STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret
   ```

4. **Database Setup**

   ```bash
   npx prisma generate
   npx prisma db push
   ```

5. **Run the development server**

   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📊 Supported File Formats

### Excel Files (.xlsx, .xls)

- **Smart Sheet Selection**: Automatically detects the most relevant sheet
- **Trial Balance**: Debit/Credit column detection
- **Balance Sheet**: Asset/Liability/Equity classification
- **P&L Statements**: Revenue/Expense categorization

### CSV Files

- **Header Detection**: Automatic column identification
- **Data Validation**: Format and content verification
- **Flexible Parsing**: Handles various CSV formats

### PDF Files

- **Text Extraction**: OCR and text parsing
- **Table Recognition**: Financial table detection
- **Data Cleaning**: Structured data extraction

## 🔧 Configuration

### AI Analysis Settings

- **Model Selection**: GPT-4 or GPT-3.5-turbo
- **Analysis Depth**: Configurable insight generation
- **Custom Prompts**: Tailored financial analysis instructions

### Database Configuration

- **Connection Pooling**: Optimized database connections
- **Migration Management**: Prisma-based schema evolution
- **Data Backup**: Automated backup strategies

## 🧪 Testing

### Development Testing

```bash
# Run linting
npm run lint

# Type checking
npm run type-check

# Build verification
npm run build
```

### API Testing

- **Upload Endpoint**: `/api/upload` - File processing and analysis
- **Dashboard Endpoint**: `/api/dashboard` - Financial data retrieval
- **Authentication**: Clerk-based user management

## 📈 Performance Features

- **Smart Caching**: Redis-based response caching
- **File Processing**: Optimized parsing algorithms
- **Database Queries**: Efficient Prisma query optimization
- **Image Optimization**: Next.js automatic image optimization

## 🔒 Security

- **Authentication**: Clerk-based secure authentication
- **File Validation**: Secure file upload and processing
- **API Protection**: Rate limiting and request validation
- **Data Encryption**: Secure data transmission and storage

## 🚀 Deployment

### Production Build

```bash
npm run build
npm start
```

### Environment Variables

Ensure all production environment variables are set:

- Database connection strings
- API keys and secrets
- Authentication credentials
- External service URLs

### Database Migration

```bash
npx prisma migrate deploy
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:

- Create an issue in the repository
- Check the documentation
- Review the code examples

## 🔮 Roadmap

- **Advanced Analytics**: Machine learning-based financial predictions
- **Multi-Currency Support**: International financial reporting
- **Real-time Updates**: Live financial data integration
- **Mobile App**: React Native mobile application
- **API Expansion**: Public API for third-party integrations

---

**Built with ❤️ for financial professionals**
