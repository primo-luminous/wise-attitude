# Error and Warning Checker Scripts

This directory contains automated scripts for checking and fixing ESLint errors, TypeScript errors, and build issues in the project.

## Scripts Overview

### 1. `master-check.js` - Master Checker Script
The main script that runs all checks and fixes automatically.

**Usage:**
```bash
npm run check:all
# or
node scripts/master-check.js
```

**Features:**
- ✅ Project structure validation
- ✅ Dependencies check and auto-install
- ✅ ESLint error/warning detection and auto-fix
- ✅ TypeScript error detection and auto-fix
- ✅ Build verification
- ✅ Comprehensive reporting
- ✅ Git commit creation (optional)
- ✅ Report saving

### 2. `auto-fix.js` - ESLint Auto-fixer
Specialized script for ESLint issues.

**Usage:**
```bash
npm run check:eslint
# or
node scripts/auto-fix.js
```

**Features:**
- 🔍 ESLint error/warning detection
- 🔧 Automatic fixing of fixable issues
- 📊 Detailed reporting
- 🎯 Common issue patterns fixing

### 3. `ts-check.js` - TypeScript Checker
Specialized script for TypeScript issues.

**Usage:**
```bash
npm run check:typescript
# or
node scripts/ts-check.js
```

**Features:**
- 🔍 TypeScript error detection
- 🔧 Automatic fixing of common TypeScript issues
- 📊 Error parsing and categorization
- 🎯 Type assertion and parameter fixing

## Available NPM Scripts

| Script | Command | Description |
|--------|---------|-------------|
| `check:all` | `npm run check:all` | Run all checks and fixes |
| `check:eslint` | `npm run check:eslint` | ESLint check and fix only |
| `check:typescript` | `npm run check:typescript` | TypeScript check and fix only |
| `lint:fix` | `npm run lint:fix` | Standard ESLint auto-fix |
| `lint:check` | `npm run lint:check` | ESLint check without fixing |
| `ts:check` | `npm run ts:check` | TypeScript check without fixing |
| `ts:fix` | `npm run ts:fix` | TypeScript auto-fix |
| `pre-commit` | `npm run pre-commit` | Pre-commit hook (runs all checks) |
| `pre-deploy` | `npm run pre-deploy` | Pre-deployment check (all checks + build) |

## Common Issues Fixed Automatically

### ESLint Issues
- ✅ Unused variables and imports
- ✅ Missing dependencies in useEffect
- ✅ Unused parameters (adds underscore prefix)
- ✅ Missing return types
- ✅ Console.log statements

### TypeScript Issues
- ✅ Unused variables (adds underscore prefix)
- ✅ Missing type annotations
- ✅ Property access errors (adds optional chaining)
- ✅ Type assertion errors
- ✅ Parameter type errors

### Build Issues
- ✅ Missing dependencies
- ✅ Configuration errors
- ✅ Import/export issues

## Usage Examples

### Before Committing Code
```bash
npm run pre-commit
```

### Before Deploying
```bash
npm run pre-deploy
```

### Quick ESLint Fix
```bash
npm run lint:fix
```

### Check Everything
```bash
npm run check:all
```

## Reports

The scripts generate detailed reports saved in `scripts/reports/last-check.json` containing:
- Timestamp of the check
- Results of each check (ESLint, TypeScript, Build)
- Environment information
- Fixes applied

## Integration with Git Hooks

You can integrate these scripts with Git hooks:

### Pre-commit Hook
Create `.git/hooks/pre-commit`:
```bash
#!/bin/sh
npm run pre-commit
```

### Pre-push Hook
Create `.git/hooks/pre-push`:
```bash
#!/bin/sh
npm run pre-deploy
```

## Troubleshooting

### Common Issues

1. **Permission Denied**
   ```bash
   chmod +x scripts/*.js
   ```

2. **Node Modules Not Found**
   ```bash
   npm install
   ```

3. **ESLint Configuration Issues**
   ```bash
   npx eslint --init
   ```

4. **TypeScript Configuration Issues**
   ```bash
   npx tsc --init
   ```

### Manual Fixes

If automatic fixes don't work, you can run manual commands:

```bash
# ESLint manual fix
npx eslint . --ext .ts,.tsx,.js,.jsx --fix

# TypeScript check
npx tsc --noEmit

# Build check
npm run build
```

## Contributing

When adding new scripts or modifying existing ones:

1. Follow the existing code structure
2. Add proper error handling
3. Include colored console output
4. Update this README
5. Test thoroughly before committing

## Support

If you encounter issues with these scripts:

1. Check the console output for specific error messages
2. Verify all dependencies are installed
3. Ensure file permissions are correct
4. Check the generated reports for detailed information
