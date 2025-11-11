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
│   │   └── Settings.tsx               # Settings page
│   ├── lib/                     # Utility Libraries
│   │   ├── api.ts              # AnythingLLM API integration
│   │   └── utils.ts            # Utility functions
│   ├── store/                   # State Management
│   │   └── configStore.ts      # Zustand configuration store
│   ├── types/                   # TypeScript Types
│   │   └── index.ts            # Type definitions
│   ├── App.tsx                  # Main app component
│   ├── main.tsx                 # Application entry point
│   ├── index.css                # Global styles
│   └── vite-env.d.ts            # Vite environment types
├── .env.example                 # Environment variables example
├── .eslintrc.cjs                # ESLint configuration
├── .eslintignore                # ESLint ignore file
├── .gitignore                   # Git ignore file
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

### 3. Settings (Settings)
**File**: `src/pages/Settings.tsx`

**Features**:
- Question category mapping management
- Product discovery list creation and management
- Edit existing configurations
- Delete configuration items

**Key Characteristics**:
- Dual-tab interface (mappings vs products)
- Product editing mode
- Dynamic question addition/deletion
- Local persistent storage

## 🔧 Technical Implementation

### State Management
- **Zustand** lightweight state management
- Configuration data stored in localStorage
- Real-time UI state synchronization

### API Integration
- **Axios** HTTP client
- AnythingLLM REST API integration
- API Key authentication support
- Error handling and retry mechanism

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
Settings → configStore → localStorage → All Pages
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
