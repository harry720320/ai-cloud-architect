# Cloud Architect on AnythingLLM

An AI Cloud Architect application based on AnythingLLM backend knowledge base, providing knowledge base search and customer discovery functionalities.

## Features

### 1. Knowledgebase Search
- Select question category to route to corresponding AnythingLLM workspace
- Search and chat with specific knowledge bases
- Support multiple question types: Cloud General, Product General, Product Sizing, etc.

### 2. Customer Discovery
- Display predefined question lists after selecting product type
- Users fill in answers for questions
- Automatically search corresponding workspace based on each question's category
- Generate detailed answers and recommendations for each question

### 3. Settings Page
- **Question Category Mapping**: Define the mapping between question categories and AnythingLLM workspaces
- **Product Discovery Lists**: Create and manage Discovery question lists for different products
- Each question has a pre-configured category (Cloud General, Product General, Product Sizing, etc.)

## Tech Stack

- **React 18** - UI Framework
- **TypeScript** - Type Safety
- **Vite** - Build Tool
- **Tailwind CSS** - Styling Framework
- **Zustand** - State Management
- **React Router** - Routing
- **Axios** - HTTP Client
- **Lucide React** - Icon Library

## Quick Start

### Install Dependencies

```bash
npm install
```

### Configure Environment Variables

Create a `.env` file:

```env
VITE_ANYTHINGLLM_BASE_URL=http://localhost:3001
VITE_ANYTHINGLLM_API_KEY=your_api_key_here
```

### Run Development Server

```bash
npm run dev
```

The application will start at `http://localhost:5173`

### Build for Production

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

## Usage

### Configure AnythingLLM

1. Ensure your AnythingLLM instance is running
2. Create multiple workspaces in AnythingLLM, for example:
   - `cloud-general` - For general cloud knowledge
   - `product-general` - For general product knowledge
   - `product-sizing` - For product sizing recommendations

### Set Question Category Mappings

1. Navigate to the "Settings" page
2. Under the "Question Category Mapping" tab:
   - Enter question category (e.g., Cloud General)
   - Enter corresponding workspace name (e.g., cloud-general)
   - Click "Add Mapping"

### Create Product Discovery Lists

1. Switch to the "Product Discovery Lists" tab in the Settings page
2. Click "Create Product Discovery List"
3. Enter product name (e.g., Azure Compute)
4. Add the complete list of discovery questions
5. Set question category for each question

### Use Knowledgebase Search

1. Navigate to the home page "Knowledgebase Search"
2. Select question category
3. Enter your question and send
4. Get AI responses from the corresponding workspace

### Use Customer Discovery

1. Navigate to the "Customer Discovery" page
2. Select product type
3. Fill in answers for all discovery questions
4. Click "Generate Answers"
5. The system will generate detailed suggestions for each question based on your answers

## Project Structure

```
src/
├── components/          # Components
│   └── Layout.tsx      # Main layout component
├── pages/              # Pages
│   ├── KnowledgebaseSearch.tsx  # Knowledge base search page
│   ├── CustomerDiscovery.tsx    # Customer discovery page
│   └── Settings.tsx            # Settings page
├── lib/                # Utility libraries
│   ├── api.ts         # AnythingLLM API client
│   └── utils.ts       # Utility functions
├── store/              # State management
│   └── configStore.ts  # Configuration store
├── types/              # TypeScript type definitions
│   └── index.ts
└── App.tsx            # Main app component
```

## Configuration Guide

### Question Category Format

Recommended question category naming convention:
- `Cloud General` - General cloud knowledge
- `{Product} General` - General knowledge for a specific product (e.g., Azure General)
- `{Product} Sizing` - Sizing recommendations for a specific product (e.g., Azure Sizing)

### Discovery Question Configuration

Each product's Discovery question list should include:
1. **Question Description** - Clear and specific question
2. **Question Category** - Corresponding question category, used to determine which workspace to search

## Development

### Code Standards

- Use ESLint for code checking
- Follow React best practices
- Use TypeScript strict mode

### Contributing

Issues and Pull Requests are welcome!

## License

MIT License
