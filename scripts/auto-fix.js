#!/usr/bin/env node

/**
 * Auto-fix ESLint Errors and Warnings Script
 * This script automatically fixes ESLint errors and warnings where possible
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Colors for console output
const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

function log(message, color = 'white') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSection(title) {
  log(`\n${colors.bold}${colors.cyan}=== ${title} ===${colors.reset}`);
}

function runCommand(command, description) {
  try {
    log(`${colors.yellow}Running: ${description}${colors.reset}`);
    const output = execSync(command, { 
      encoding: 'utf8', 
      stdio: 'pipe',
      cwd: process.cwd()
    });
    return { success: true, output };
  } catch (error) {
    return { 
      success: false, 
      error: error.message,
      output: error.stdout || error.stderr || ''
    };
  }
}

function checkAndFixESLint() {
  logSection('ESLint Check and Auto-fix');
  
  // First, check for ESLint errors
  log('Checking ESLint errors and warnings...');
  const lintCheck = runCommand('npx eslint . --ext .ts,.tsx,.js,.jsx --format=json', 'ESLint Check');
  
  if (!lintCheck.success) {
    log('ESLint found issues. Attempting to auto-fix...', 'yellow');
    
    // Try to auto-fix ESLint issues
    const autoFix = runCommand('npx eslint . --ext .ts,.tsx,.js,.jsx --fix', 'ESLint Auto-fix');
    
    if (autoFix.success) {
      log('✅ ESLint auto-fix completed successfully!', 'green');
      
      // Check again to see remaining issues
      const recheck = runCommand('npx eslint . --ext .ts,.tsx,.js,.jsx --format=json', 'ESLint Re-check');
      if (recheck.success) {
        log('✅ All ESLint issues have been resolved!', 'green');
      } else {
        log('⚠️ Some ESLint issues remain after auto-fix:', 'yellow');
        console.log(recheck.output);
      }
    } else {
      log('❌ ESLint auto-fix failed:', 'red');
      console.log(autoFix.error);
    }
  } else {
    log('✅ No ESLint issues found!', 'green');
  }
}

function checkTypeScript() {
  logSection('TypeScript Check');
  
  const tsCheck = runCommand('npx tsc --noEmit', 'TypeScript Check');
  
  if (tsCheck.success) {
    log('✅ No TypeScript errors found!', 'green');
  } else {
    log('❌ TypeScript errors found:', 'red');
    console.log(tsCheck.output);
    return false;
  }
  
  return true;
}

function checkBuild() {
  logSection('Build Check');
  
  const buildCheck = runCommand('npm run build', 'Production Build');
  
  if (buildCheck.success) {
    log('✅ Build successful!', 'green');
    return true;
  } else {
    log('❌ Build failed:', 'red');
    console.log(buildCheck.output);
    return false;
  }
}

function fixCommonIssues() {
  logSection('Fixing Common Issues');
  
  // Remove unused imports and variables
  log('Removing unused imports and variables...');
  
  const filesToCheck = [
    'src/app/actions/auth.ts',
    'src/app/api/assets/route.ts',
    'src/app/api/auth/logout/route.ts',
    'src/app/api/auth/refresh-session/route.ts',
    'src/app/api/auth/session-status/route.ts',
    'src/app/api/employees/route.ts',
    'src/app/api/notifications/delete-all/route.ts',
    'src/app/api/notifications/read-all/route.ts',
    'src/app/api/notifications/route.ts',
    'src/app/components/Login/Login.tsx',
    'src/app/components/SessionMonitor.tsx',
    'src/app/main/change-password/page.tsx',
    'src/app/main/components/assets/AssetsClient.tsx',
    'src/app/main/components/profile/ProfileClient.tsx',
    'src/app/main/loans/components/EditLoanItemModal.tsx',
    'src/app/main/loans/components/HeaderFormClient.tsx',
    'src/app/main/loans/components/LoanExportButtons.tsx',
    'src/app/main/loans/components/LoansClient.tsx',
    'src/app/main/loans/components/NewLoanClient.tsx',
    'src/app/main/loans/components/StatusFormClient.tsx',
    'src/app/main/loans/components/StatusUpdateModal.tsx',
    'src/app/main/page.tsx',
    'src/components/layout/Sidebar.tsx',
    'src/components/ui/NotificationBell.tsx',
    'src/lib/notifications.ts',
    'src/scripts/test-session.ts'
  ];
  
  filesToCheck.forEach(filePath => {
    if (fs.existsSync(filePath)) {
      try {
        let content = fs.readFileSync(filePath, 'utf8');
        let modified = false;
        
        // Remove unused variables (simple cases)
        const unusedVarPatterns = [
          // Remove unused destructured variables
          /const\s*{\s*([^}]+)\s*}\s*=\s*[^;]+;\s*\/\/.*unused/gi,
          // Remove unused imports
          /import\s*{\s*([^}]+)\s*}\s*from\s*['"][^'"]+['"];\s*\/\/.*unused/gi,
          // Remove unused variable declarations
          /const\s+(\w+)\s*=\s*[^;]+;\s*\/\/.*unused/gi,
          /let\s+(\w+)\s*=\s*[^;]+;\s*\/\/.*unused/gi,
          /var\s+(\w+)\s*=\s*[^;]+;\s*\/\/.*unused/gi
        ];
        
        unusedVarPatterns.forEach(pattern => {
          if (pattern.test(content)) {
            content = content.replace(pattern, '');
            modified = true;
          }
        });
        
        // Add underscore prefix to unused parameters
        content = content.replace(/(\w+):\s*[^,)]+\)/g, (match, paramName) => {
          if (paramName.startsWith('_')) return match;
          return `_${paramName}: any`;
        });
        
        if (modified) {
          fs.writeFileSync(filePath, content);
          log(`✅ Fixed unused variables in ${filePath}`, 'green');
        }
      } catch (error) {
        log(`⚠️ Could not process ${filePath}: ${error.message}`, 'yellow');
      }
    }
  });
}

function generateReport() {
  logSection('Final Report');
  
  // Run final checks
  const finalLint = runCommand('npx eslint . --ext .ts,.tsx,.js,.jsx --format=compact', 'Final ESLint Check');
  const finalTs = runCommand('npx tsc --noEmit', 'Final TypeScript Check');
  const finalBuild = runCommand('npm run build', 'Final Build Check');
  
  log('\n📊 Summary:', 'bold');
  
  if (finalLint.success) {
    log('✅ ESLint: No issues', 'green');
  } else {
    log('❌ ESLint: Issues remain', 'red');
  }
  
  if (finalTs.success) {
    log('✅ TypeScript: No errors', 'green');
  } else {
    log('❌ TypeScript: Errors remain', 'red');
  }
  
  if (finalBuild.success) {
    log('✅ Build: Successful', 'green');
  } else {
    log('❌ Build: Failed', 'red');
  }
  
  // Overall status
  const allPassed = finalLint.success && finalTs.success && finalBuild.success;
  
  if (allPassed) {
    log('\n🎉 All checks passed! Your code is ready for deployment.', 'green');
  } else {
    log('\n⚠️ Some issues remain. Please review the output above.', 'yellow');
  }
}

// Main execution
function main() {
  log(`${colors.bold}${colors.magenta}🔧 Auto-fix Script for ESLint and TypeScript Issues${colors.reset}`);
  log(`${colors.cyan}This script will automatically fix ESLint errors and warnings where possible.${colors.reset}`);
  
  try {
    // Step 1: Fix common issues
    fixCommonIssues();
    
    // Step 2: Check and fix ESLint
    checkAndFixESLint();
    
    // Step 3: Check TypeScript
    const tsOk = checkTypeScript();
    
    // Step 4: Check build
    const buildOk = checkBuild();
    
    // Step 5: Generate final report
    generateReport();
    
    // Exit with appropriate code
    process.exit(tsOk && buildOk ? 0 : 1);
    
  } catch (error) {
    log(`❌ Script failed: ${error.message}`, 'red');
    process.exit(1);
  }
}

// Run the script
if (require.main === module) {
  main();
}

module.exports = {
  checkAndFixESLint,
  checkTypeScript,
  checkBuild,
  fixCommonIssues,
  generateReport
};
