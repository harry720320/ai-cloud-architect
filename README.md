# Cloud Architect on AnythingLLM

An AI Cloud Architect application based on AnythingLLM backend knowledge base, providing knowledge base search and customer discovery functionalities.

## Features

### 1. Knowledgebase Search
- Select question category to route to corresponding AnythingLLM workspace
- Search and chat with specific knowledge bases
- Support multiple question types: Cloud General, Product General, Product Sizing, etc.
- **Formatted display**: AI responses are rendered with Markdown formatting, including headings, lists, code blocks, tables, and links

### 2. Customer Discovery
- Display predefined question lists after selecting product type
- Users fill in answers for questions
- Automatically search corresponding workspace based on each question's category
- Generate detailed answers and recommendations for each question
- **Formatted display**: Generated answers are rendered with Markdown formatting, including headings, lists, code blocks, tables, and links
- Save discovery results with customer name and project name
- Export answers and generated answers separately

### 3. Discovery Results
- View all historical discovery results
- View detailed results including questions and answers
- Delete discovery results
- Export discovery results as JSON files
- Filter by customer name, project name, or product name

### 4. Settings Page
The Settings page has four tabs:
- **User Settings**: Change password and manage users (admin only)
- **Question Category Mappings**: Define the mapping between question categories and AnythingLLM workspaces
- **Product Discovery Lists**: Create and manage Discovery question lists for different products
- **Prompt Settings**: Configure different prompts for General, Sizing, and Matrix question categories
- Each question has a pre-configured category (Cloud General, Product General, Product Sizing, Cloud Matrix, etc.)

## Tech Stack

### Frontend
- **React 18** - UI Framework
- **TypeScript** - Type Safety
- **Vite** - Build Tool
- **Tailwind CSS** - Styling Framework
- **Zustand** - State Management
- **React Router** - Routing
- **Axios** - HTTP Client
- **Lucide React** - Icon Library
- **react-markdown** - Markdown rendering for formatted AI responses
- **remark-gfm** - GitHub Flavored Markdown support
- **rehype-highlight** - Code syntax highlighting
- **highlight.js** - Code highlighting styles

### Backend
- **Node.js** - Runtime Environment
- **Express.js** - Web Framework
- **JSON File Storage** - Database (no compilation required, Windows-friendly)
- **bcrypt** - Password Hashing
- **JWT** - Authentication
- **CORS** - Cross-Origin Resource Sharing

## Quick Start

### 1. Install Frontend Dependencies

```bash
npm install
```

### 2. Install Backend Dependencies

```bash
cd server
npm install
cd ..
```

### 3. Configure Environment Variables

Create a `.env` file in the root directory:

```env
# AnythingLLM Configuration
VITE_ANYTHINGLLM_BASE_URL=http://localhost:3001
VITE_ANYTHINGLLM_API_KEY=your_api_key_here

# Backend API Configuration
VITE_API_BASE_URL=http://localhost:3002
```

Create a `.env` file in the `server` directory (optional):

```env
PORT=3002
JWT_SECRET=your-secret-key-change-in-production
```

### 4. Start Backend Server

```bash
cd server
npm run dev
```

The backend server will start at `http://localhost:3002`

### 5. Start Frontend Development Server

In a new terminal:

```bash
npm run dev
```

The frontend application will start at `http://localhost:5173`

### Default Login Credentials

- Username: `admin`
- Password: `admin`

**Important**: Change the default admin password after first login!

For detailed backend setup instructions, see [BACKEND_SETUP.md](./BACKEND_SETUP.md)

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
2. Click on the "Question Category Mappings" tab
3. Click "Fetch Workspaces" to load available workspaces from AnythingLLM
4. Enter question category (e.g., Cloud General, Cloud Matrix)
5. Select or enter corresponding workspace slug (e.g., cloud-general)
6. Click "Add Mapping"

### Create Product Discovery Lists

1. Navigate to the "Settings" page
2. Click on the "Product Discovery Lists" tab
3. Enter product name (e.g., Azure Compute)
4. Click "Add Question" to add discovery questions
5. Enter question text and select category from the dropdown
6. Click "Create Product" to save
7. To edit an existing product, click the edit icon and make changes

### Use Knowledgebase Search

1. Navigate to the home page "Knowledgebase Search"
2. Select question category
3. Enter your question and send
4. Get AI responses from the corresponding workspace
5. **Formatted display**: AI responses are automatically rendered with Markdown formatting, including:
   - Headings (H1-H4)
   - Lists (ordered and unordered)
   - Code blocks with syntax highlighting
   - Inline code
   - Tables
   - Links
   - Bold and italic text
   - Blockquotes

### Use Customer Discovery

1. Navigate to the "Customer Discovery" page
2. Enter customer name and project name
3. Select product type
4. Fill in answers for all discovery questions
5. Click "Generate Answers" to generate answers for all questions, or click individual "Generate" buttons for specific questions
6. The system will generate detailed suggestions for each question based on your answers
7. **Formatted display**: Generated answers are automatically rendered with Markdown formatting, including:
   - Headings (H1-H4)
   - Lists (ordered and unordered)
   - Code blocks with syntax highlighting
   - Inline code
   - Tables
   - Links
   - Bold and italic text
   - Blockquotes
8. Save discovery results and export answers separately

### View Discovery Results

1. Navigate to the "Discovery Results" page
2. View all historical discovery results
3. Click "View" to see detailed results
4. Click "Delete" to remove results
5. Click "Answers" or "Generated" to export results as JSON files

## Project Structure

```
.
├── src/                    # Frontend source code
│   ├── components/         # Components
│   │   ├── Layout.tsx     # Main layout component
│   │   └── MarkdownRenderer.tsx  # Markdown renderer for formatted display
│   ├── pages/             # Pages
│   │   ├── KnowledgebaseSearch.tsx  # Knowledge base search page
│   │   ├── CustomerDiscovery.tsx    # Customer discovery page
│   │   ├── DiscoveryResults.tsx     # Discovery results page
│   │   ├── Settings.tsx            # Settings page
│   │   └── Login.tsx               # Login page
│   ├── lib/               # Utility libraries
│   │   ├── api.ts         # AnythingLLM API client
│   │   ├── backendApi.ts  # Backend API client
│   │   └── utils.ts       # Utility functions
│   ├── store/             # State management
│   │   ├── authStore.ts   # Authentication store
│   │   └── configStore.ts # Configuration store
│   ├── types/             # TypeScript type definitions
│   │   └── index.ts
│   └── App.tsx           # Main app component
├── server/                 # Backend source code
│   ├── routes/            # API routes
│   │   ├── auth.js        # Authentication routes
│   │   ├── config.js      # Configuration routes
│   │   └── discovery.js   # Discovery results routes
│   ├── middleware/        # Express middleware
│   │   └── auth.js        # Authentication middleware
│   ├── database.js        # Database setup and helpers (JSON file storage)
│   ├── index.js           # Server entry point
│   └── data/              # JSON data files (created at runtime)
│       ├── users.json
│       ├── category-mappings.json
│       ├── products.json
│       ├── discovery-questions.json
│       ├── prompts.json
│       └── discovery-results.json
└── README.md
```

## Configuration Guide

### Question Category Format

Recommended question category naming convention:
- `Cloud General` - General cloud knowledge
- `{Product} General` - General knowledge for a specific product (e.g., Azure General)
- `{Product} Sizing` - Sizing recommendations for a specific product (e.g., Azure Sizing)
- `Cloud Matrix` - Cloud Matrix analysis and product recommendations
- `{Product} Matrix` - Product Matrix analysis (e.g., Azure Matrix)

**Note**: The system automatically selects the appropriate prompt based on the category:
- Categories containing "Matrix" → Matrix Prompt
- Categories containing "Sizing" → Sizing Prompt
- All other categories → General Prompt

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

## Troubleshooting

### Backend Connection Issues
- Ensure the backend server is running on port 3002
- Check that `VITE_API_BASE_URL` is set correctly in `.env`
- Verify CORS is configured correctly in the backend

### Authentication Issues
- Default credentials are `admin`/`admin`
- Change the default password after first login
- Check JWT token in browser localStorage

### Discovery Results Not Saving
- Ensure backend server is running
- Check browser console for errors
- Verify authentication token is valid

### Workspace Not Found
- Ensure the workspace exists in AnythingLLM
- Verify the workspace slug is correct
- Use "Fetch Workspaces" button in Settings to load available workspaces

## License

MIT License
