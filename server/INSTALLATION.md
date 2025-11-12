# Installation Guide

## Troubleshooting npm install Errors

If you encountered errors during `npm install`, follow these steps:

### Windows Users - Visual Studio Build Tools Error

If you see errors related to `better-sqlite3` and Visual Studio Build Tools, the project has been updated to use JSON file storage instead, which doesn't require compilation.

### Clean Installation Steps

1. **Delete old node_modules and package-lock.json**:
```bash
cd server
rmdir /s /q node_modules
del package-lock.json
```

Or on PowerShell:
```powershell
cd server
Remove-Item -Recurse -Force node_modules
Remove-Item -Force package-lock.json
```

2. **Clear npm cache** (optional):
```bash
npm cache clean --force
```

3. **Install dependencies**:
```bash
npm install
```

### Verification

After installation, verify that all dependencies are installed:

```bash
npm list --depth=0
```

You should see:
- express
- bcrypt
- jsonwebtoken
- cors
- body-parser

**Note**: `better-sqlite3` should NOT be in the dependencies list anymore.

### Start the Server

```bash
npm run dev
```

The server should start without any compilation errors.

### Data Files

The server will create JSON files in the `server/data/` directory automatically:
- `users.json`
- `category-mappings.json`
- `products.json`
- `discovery-questions.json`
- `prompts.json`
- `discovery-results.json`

These files are created when the server starts for the first time.

## Still Having Issues?

If you're still experiencing issues:

1. Make sure you're using Node.js v18 or higher
2. Try deleting the `node_modules` folder and `package-lock.json` again
3. Run `npm install` again
4. Check that all files in `server/` are correct (especially `package.json` and `database.js`)

If problems persist, please check the error messages and ensure:
- Node.js is properly installed
- npm is up to date (`npm install -g npm@latest`)
- You have write permissions in the project directory

