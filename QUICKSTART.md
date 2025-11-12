# Quick Start Guide

## 1. Install Frontend Dependencies

```bash
npm install
```

## 2. Install Backend Dependencies

```bash
cd server
npm install
cd ..
```

## 3. Configure Environment Variables

Create a `.env` file in the root directory and add the following content:

```env
VITE_ANYTHINGLLM_BASE_URL=http://localhost:3001
VITE_ANYTHINGLLM_API_KEY=your_api_key_here
VITE_API_BASE_URL=http://localhost:3002
```

**Note**: Replace `VITE_ANYTHINGLLM_BASE_URL` with your AnythingLLM instance address.
If API Key is required, fill in `VITE_ANYTHINGLLM_API_KEY`.

Create a `.env` file in the `server` directory (optional):

```env
PORT=3002
JWT_SECRET=your-secret-key-change-in-production
```

## 4. Start Backend Server

```bash
cd server
npm run dev
```

The backend server will start at `http://localhost:3002`.

## 5. Start Frontend Development Server

In a new terminal:

```bash
npm run dev
```

The frontend application will start at `http://localhost:5173`.

## Default Login Credentials

- Username: `admin`
- Password: `admin`

**Important**: Change the default admin password after first login!

## 6. Initial Configuration Steps

### Step 1: Configure Question Category Mappings

1. Open the application and navigate to the "Settings" page
2. Click on the "Question Category Mappings" tab
3. Click "Fetch Workspaces" to load available workspaces from AnythingLLM
4. Add mappings, for example:
   - **Question Category**: `Cloud General`
   - **Workspace Name (Slug)**: Select from dropdown or enter `cloud-general`
   - Click "Add Mapping"

Repeat to add all required mappings, for example:
- `Cloud General` → `cloud-general`
- `Cloud Matrix` → `cloud-matrix`
- `Azure General` → `azure-general`
- `Azure Sizing` → `azure-sizing`
- `AWS General` → `aws-general`
- `AWS Sizing` → `aws-sizing`

### Step 2: Create Product Discovery Lists

1. Navigate to the "Settings" page
2. Click on the "Product Discovery Lists" tab
3. Enter product name, for example: `Azure Compute`
4. Click "Add Question" to add discovery questions
5. Enter question text, for example: `What is your current workload?`
6. Select category from the dropdown (e.g., `Cloud General`)
7. Continue adding more questions, setting appropriate category for each
8. Click "Create Product" to save

## 7. Using the Application

### Knowledgebase Search

1. Select question category on the home page
2. Enter your question
3. View AI responses

### Customer Discovery

1. Navigate to the "Customer Discovery" page
2. Enter customer name and project name
3. Select product type
4. Fill in answers for all discovery questions
5. Click "Generate Answers" to generate answers for all questions, or click individual "Generate" buttons for specific questions
6. View detailed suggestions generated based on your answers
7. Save discovery results and export answers separately

### Discovery Results

1. Navigate to the "Discovery Results" page
2. View all historical discovery results
3. Click "View" to see detailed results
4. Click "Delete" to remove results
5. Click "Answers" or "Generated" to export results as JSON files

## Troubleshooting

### Cannot Connect to AnythingLLM

- Check if the AnythingLLM instance is running
- Verify `VITE_ANYTHINGLLM_BASE_URL` in the `.env` file is correct
- Ensure network connection is normal

### Backend Connection Issues

- Ensure the backend server is running on port 3002
- Check that `VITE_API_BASE_URL` is set correctly in the `.env` file
- Verify CORS is configured correctly in the backend

### Authentication Issues

- Default credentials are `admin`/`admin`
- Change the default password after first login
- Check JWT token in browser localStorage

### Workspace Does Not Exist

- Ensure corresponding workspace is created in AnythingLLM
- Verify the workspace slug name is correct
- Use "Fetch Workspaces" button in Settings to load available workspaces
- Check if question category mappings are configured correctly

### API Authentication Failed

- If AnythingLLM requires API Key, ensure `VITE_ANYTHINGLLM_API_KEY` is set in the `.env` file
- Verify the API Key is correct and not expired

### Discovery Results Not Saving

- Ensure backend server is running
- Check browser console for errors
- Verify authentication token is valid
