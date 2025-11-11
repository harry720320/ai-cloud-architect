# Quick Start Guide

## 1. Install Dependencies

```bash
npm install
```

## 2. Configure Environment Variables

Create a `.env` file and add the following content:

```env
VITE_ANYTHINGLLM_BASE_URL=http://localhost:3001
VITE_ANYTHINGLLM_API_KEY=your_api_key_here
```

**Note**: Replace `VITE_ANYTHINGLLM_BASE_URL` with your AnythingLLM instance address.
If API Key is required, fill in `VITE_ANYTHINGLLM_API_KEY`.

## 3. Start Development Server

```bash
npm run dev
```

The application will start at `http://localhost:5173`.

## 4. Initial Configuration Steps

### Step 1: Configure Question Category Mappings

1. Open the application and navigate to the "Settings" page
2. Under the "Question Category Mapping" tab, add mappings, for example:
   - **Question Category**: `Cloud General`
   - **Workspace Name**: `cloud-general`
   - Click "Add Mapping"

Repeat to add all required mappings, for example:
- `Azure General` → `azure-general`
- `Azure Sizing` → `azure-sizing`
- `AWS General` → `aws-general`
- `AWS Sizing` → `aws-sizing`

### Step 2: Create Product Discovery Lists

1. Switch to the "Product Discovery Lists" tab in the Settings page
2. Click "Create Product Discovery List"
3. Enter product name, for example: `Azure Compute`
4. Add the complete list of discovery questions, for example:
   - Question: `What is your current workload?`
   - Category: `Cloud General`
5. Continue adding more questions, setting appropriate category for each
6. Click "Create Product"

## 5. Using the Application

### Knowledgebase Search

1. Select question category on the home page
2. Enter your question
3. View AI responses

### Customer Discovery

1. Navigate to the "Customer Discovery" page
2. Select product type
3. Fill in answers for all discovery questions
4. Click "Generate Answers"
5. View detailed suggestions generated based on your answers

## Troubleshooting

### Cannot Connect to AnythingLLM

- Check if the AnythingLLM instance is running
- Verify `VITE_ANYTHINGLLM_BASE_URL` in the `.env` file is correct
- Ensure network connection is normal

### Workspace Does Not Exist

- Ensure corresponding workspace is created in AnythingLLM
- Verify the workspace slug name is correct
- Check if question category mappings are configured correctly

### API Authentication Failed

- If AnythingLLM requires API Key, ensure `VITE_ANYTHINGLLM_API_KEY` is set in the `.env` file
- Verify the API Key is correct and not expired
