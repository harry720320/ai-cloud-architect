# Project Structure

## Cloud Architect on AnythingLLM

An AI Cloud Architect application based on AnythingLLM - providing intelligent knowledge base search and customer discovery functionalities.

## 📁 Project File Structure

```
cloud-architect-on-anythingllm/
├── src/
│   ├── components/              # React Components
│   │   └── Layout.tsx           # Main layout component (navigation bar)
│   ├── pages/                   # Page Components
│   │   ├── KnowledgebaseSearch.tsx    # Knowledge base search page
│   │   ├── CustomerDiscovery.tsx      # Customer discovery page
│   │   ├── DiscoveryResults.tsx       # Discovery results page
│   │   ├── Settings.tsx               # Settings page
│   │   └── Login.tsx                  # Login page
│   ├── lib/                     # Utility Libraries
│   │   ├── api.ts              # AnythingLLM API integration
│   │   ├── backendApi.ts       # Backend API client
│   │   ├── security.ts         # Security utilities (password hashing)
│   │   └── utils.ts            # Utility functions
│   ├── store/                   # State Management
│   │   ├── authStore.ts        # Authentication store
│   │   └── configStore.ts      # Zustand configuration store
│   ├── types/                   # TypeScript Types
│   │   └── index.ts            # Type definitions
│   ├── App.tsx                  # Main app component
│   ├── main.tsx                 # Application entry point
│   ├── index.css                # Global styles
│   └── vite-env.d.ts            # Vite environment types
├── server/                      # Backend server
│   ├── routes/                  # API routes
│   │   ├── auth.js             # Authentication routes
│   │   ├── config.js           # Configuration routes
│   │   └── discovery.js        # Discovery results routes
│   ├── middleware/             # Express middleware
│   │   └── auth.js             # Authentication middleware
│   ├── database.js             # Database helpers (JSON file storage)
│   ├── index.js                # Server entry point
│   ├── package.json            # Backend dependencies
│   ├── README.md               # Backend documentation
│   └── data/                   # JSON data files (created at runtime)
│       ├── users.json
│       ├── category-mappings.json
│       ├── products.json
│       ├── discovery-questions.json
│       ├── prompts.json
│       └── discovery-results.json
├── .env.example                 # Environment variables example
├── .eslintrc.cjs                # ESLint configuration
├── .eslintignore                # ESLint ignore file
├── .gitignore                   # Git ignore file
├── BACKEND_SETUP.md             # Backend setup guide
├── index.html                   # HTML entry
├── package.json                 # Project dependencies
├── postcss.config.js            # PostCSS configuration
├── QUICKSTART.md                # Quick start guide
├── PROJECT_STRUCTURE.md         # This file
├── README.md                    # Project documentation
├── tailwind.config.js           # Tailwind CSS configuration
├── tsconfig.json                # TypeScript configuration
├── tsconfig.node.json           # TypeScript node configuration
└── vite.config.ts             # Vite configuration

```

## 🎯 Core Feature Modules

### 1. KnowledgebaseSearch (Knowledge Base Search)
**File**: `src/pages/KnowledgebaseSearch.tsx`

**Features**:
- Select question category (Cloud General, Product General, Product Sizing)
- Automatically route to corresponding AnythingLLM workspace
- Chat and search with specific knowledge bases
- Real-time AI response display

**Key Characteristics**:
- Dynamic workspace selection
- Streamlined chat interface
- Message history
- Loading state indicators

### 2. CustomerDiscovery (Customer Discovery)
**File**: `src/pages/CustomerDiscovery.tsx`

**Features**:
- Select product type
- Display predefined Discovery question lists
- Collect customer answers
- Automatically search corresponding workspace based on each question's category
- Generate detailed recommendations for each question

**Key Characteristics**:
- Dynamic question lists
- Automatic validation of all questions answered
- Batch AI response generation
- Results display interface

### 3. Discovery Results (Discovery Results)
**File**: `src/pages/DiscoveryResults.tsx`

**Features**:
- View all historical discovery results
- View detailed results including questions and answers
- Delete discovery results
- Export discovery results as JSON files

**Key Characteristics**:
- List view with customer name, project name, and product name
- Detail modal with full question and answer display
- Export functionality for answers and generated answers
- Delete confirmation dialog

### 4. Settings (Settings)
**File**: `src/pages/Settings.tsx`

**Features**:
- **User Settings**: Change password and manage users (admin only)
- **Question Category Mappings**: Define mappings between categories and workspaces
- **Product Discovery Lists**: Create and manage discovery question lists
- **Prompt Settings**: Configure prompts for General, Sizing, and Matrix categories
- Edit existing configurations
- Delete configuration items

**Key Characteristics**:
- Four-tab interface (User Settings, Question Category Mappings, Product Discovery Lists, Prompt Settings)
- Workspace fetching from AnythingLLM
- Product editing mode
- Dynamic question addition/deletion
- Backend persistent storage
- User management (admin only)

## 🔧 Technical Implementation

### State Management
- **Zustand** lightweight state management
- **authStore**: Authentication state and user management
- **configStore**: Configuration data (category mappings, products, prompts)
- Backend API integration for data persistence
- Real-time UI state synchronization

### API Integration
- **Axios** HTTP client
- **AnythingLLM REST API**: Integration for knowledge base search
- **Backend API**: Custom backend for user management, configuration, and discovery results
- JWT authentication for backend API
- API Key authentication support for AnythingLLM
- Error handling and retry mechanism
- CORS support for cross-origin requests

### Styling System
- **Tailwind CSS** atomic styling
- Responsive design
- Custom color scheme (primary blue palette)
- Lucide React icon library

### Type Safety
- Complete TypeScript type definitions
- Strict type checking
- Clear interface definitions

## 📊 Data Flow

### Configuration Storage Flow
```
Settings → configStore → Backend API → JSON Files → All Pages
```

### Authentication Flow
```
Login → Backend API → JWT Token → localStorage → Protected Routes
```

### Discovery Results Flow
```
Customer Discovery → Save Results → Backend API → JSON Files → Discovery Results Page
```

### Knowledge Base Search Flow
```
User Input → Select Category → Find Mapping → API Call → Display Results
```

### Customer Discovery Flow
```
Select Product → Fill Questions → Validate Complete → Batch API Calls → Results Display
```

## 🎨 User Interface

### Layout Components
- Top navigation bar
- Active state indicators
- Icon + text navigation

### Color Scheme
- Primary: Blue palette (#0ea5e9)
- Background: Gray (#f9fafb)
- Card: White + border
- Text: Hierarchical gray

### Interactive Elements
- Smooth transition animations
- Loading state indicators
- Hover effects
- Disabled state handling

## 🚀 Future Development Suggestions

1. **Enhanced Search Features**
   - Add search history
   - Support favorites/bookmarks
   - Export conversation logs

2. **UX Optimization**
   - Add theme switching
   - Improve mobile responsiveness
   - Add keyboard shortcuts support

3. **Extended Integration**
   - Support multiple AnythingLLM instances
   - Add export/import configuration
   - Statistical analysis features

4. **Performance Optimization**
   - Add request caching
   - Implement virtual scrolling
   - Optimize batch requests
