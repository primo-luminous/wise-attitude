#!/usr/bin/env node

/**
 * Master Error and Warning Checker Script
 * This script combines ESLint, TypeScript checking, and build verification
 * with automatic fixing capabilities
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Import our custom scripts
const autoFixScript = require('./auto-fix.js');
const tsCheckScript = require('./ts-check.js');

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
  bold: '\x1b[1m',
  bgRed: '\x1b[41m',
  bgGreen: '\x1b[42m',
  bgYellow: '\x1b[43m'
};

function log(message, color = 'white') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSection(title) {
  log(`\n${colors.bold}${colors.cyan}=== ${title} ===${colors.reset}`);
}

function logHeader() {
  console.log(`${colors.bold}${colors.magenta}`);
  console.log('╔══════════════════════════════════════════════════════════════╗');
  console.log('║                                                              ║');
  console.log('║    🔧 Master Error & Warning Checker & Auto-fixer          ║');
  console.log('║                                                              ║');
  console.log('║    This script will check and fix:                          ║');
  console.log('║    • ESLint errors and warnings                             ║');
  console.log('║    • TypeScript errors                                      ║');
  console.log('║    • Build issues                                           ║');
  console.log('║    • Common code issues                                     ║');
  console.log('║                                                              ║');
  console.log('╚══════════════════════════════════════════════════════════════╝');
  console.log(`${colors.reset}`);
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

function checkProjectStructure() {
  logSection('Project Structure Check');
  
  const requiredFiles = [
    'package.json',
    'tsconfig.json',
    'next.config.ts',
    'postcss.config.mjs',
    'tailwind.config.js'
  ];
  
  const missingFiles = requiredFiles.filter(file => !fs.existsSync(file));
  
  if (missingFiles.length > 0) {
    log(`❌ Missing required files: ${missingFiles.join(', ')}`, 'red');
    return false;
  } else {
    log('✅ All required project files found', 'green');
    return true;
  }
}

function checkDependencies() {
  logSection('Dependencies Check');
  
  const requiredDeps = [
    'next',
    'react',
    'react-dom',
    'typescript',
    'eslint',
    'tailwindcss',
    '@tailwindcss/postcss'
  ];
  
  try {
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    const allDeps = { ...packageJson.dependencies, ...packageJson.devDependencies };
    
    const missingDeps = requiredDeps.filter(dep => !allDeps[dep]);
    
    if (missingDeps.length > 0) {
      log(`⚠️ Missing dependencies: ${missingDeps.join(', ')}`, 'yellow');
      log('Installing missing dependencies...', 'yellow');
      
      const installCmd = `npm install --save-dev ${missingDeps.join(' ')}`;
      const installResult = runCommand(installCmd, 'Install Missing Dependencies');
      
      if (installResult.success) {
        log('✅ Missing dependencies installed', 'green');
      } else {
        log('❌ Failed to install dependencies', 'red');
        return false;
      }
    } else {
      log('✅ All required dependencies found', 'green');
    }
    
    return true;
  } catch (error) {
    log(`❌ Error checking dependencies: ${error.message}`, 'red');
    return false;
  }
}

function runComprehensiveCheck() {
  logSection('Comprehensive Code Check');
  
  const results = {
    eslint: false,
    typescript: false,
    build: false,
    overall: false
  };
  
  // Step 1: ESLint check and fix
  log('Step 1: ESLint Check and Auto-fix', 'bold');
  try {
    autoFixScript.checkAndFixESLint();
    results.eslint = true;
  } catch (error) {
    log(`ESLint check failed: ${error.message}`, 'red');
  }
  
  // Step 2: TypeScript check and fix
  log('\nStep 2: TypeScript Check and Auto-fix', 'bold');
  try {
    const tsResult = tsCheckScript.checkTypeScriptErrors();
    if (tsResult.hasErrors) {
      const errors = tsCheckScript.parseTypeScriptErrors(tsResult.output);
      if (errors.length > 0) {
        tsCheckScript.fixTypeScriptErrors(errors);
      }
    }
    results.typescript = !tsResult.hasErrors;
  } catch (error) {
    log(`TypeScript check failed: ${error.message}`, 'red');
  }
  
  // Step 3: Build check
  log('\nStep 3: Build Check', 'bold');
  try {
    results.build = autoFixScript.checkBuild();
  } catch (error) {
    log(`Build check failed: ${error.message}`, 'red');
  }
  
  // Overall result
  results.overall = results.eslint && results.typescript && results.build;
  
  return results;
}

function generateDetailedReport(results) {
  logSection('Detailed Report');
  
  const statusIcon = (status) => status ? '✅' : '❌';
  const statusColor = (status) => status ? 'green' : 'red';
  
  log('\n📊 Check Results:', 'bold');
  log(`${statusIcon(results.eslint)} ESLint: ${results.eslint ? 'PASSED' : 'FAILED'}`, statusColor(results.eslint));
  log(`${statusIcon(results.typescript)} TypeScript: ${results.typescript ? 'PASSED' : 'FAILED'}`, statusColor(results.typescript));
  log(`${statusIcon(results.build)} Build: ${results.build ? 'PASSED' : 'FAILED'}`, statusColor(results.build));
  
  log('\n🎯 Overall Status:', 'bold');
  if (results.overall) {
    log(`${colors.bgGreen}${colors.white} ALL CHECKS PASSED - READY FOR DEPLOYMENT ${colors.reset}`, 'green');
  } else {
    log(`${colors.bgRed}${colors.white} SOME CHECKS FAILED - REVIEW REQUIRED ${colors.reset}`, 'red');
  }
  
  // Recommendations
  log('\n💡 Recommendations:', 'bold');
  if (!results.eslint) {
    log('• Run "npx eslint . --fix" to fix remaining ESLint issues', 'yellow');
  }
  if (!results.typescript) {
    log('• Check TypeScript errors and fix type issues manually', 'yellow');
  }
  if (!results.build) {
    log('• Fix build errors before deploying', 'yellow');
  }
  
  if (results.overall) {
    log('• Your code is ready for production deployment! 🚀', 'green');
  }
}

function createGitCommit() {
  logSection('Git Commit');
  
  const commitMessage = 'fix: auto-fix ESLint and TypeScript issues';
  
  try {
    // Check if there are changes to commit
    const gitStatus = runCommand('git status --porcelain', 'Check Git Status');
    
    if (gitStatus.success && gitStatus.output.trim()) {
      log('Changes detected. Creating commit...', 'yellow');
      
      const addResult = runCommand('git add .', 'Add Changes');
      if (addResult.success) {
        const commitResult = runCommand(`git commit -m "${commitMessage}"`, 'Create Commit');
        if (commitResult.success) {
          log('✅ Changes committed successfully', 'green');
        } else {
          log('⚠️ Failed to create commit', 'yellow');
        }
      }
    } else {
      log('No changes to commit', 'cyan');
    }
  } catch (error) {
    log(`⚠️ Git operations failed: ${error.message}`, 'yellow');
  }
}

function saveReport(results) {
  const reportData = {
    timestamp: new Date().toISOString(),
    results: results,
    environment: {
      node: process.version,
      platform: process.platform,
      arch: process.arch
    }
  };
  
  const reportPath = 'scripts/reports/last-check.json';
  
  // Create reports directory if it doesn't exist
  const reportsDir = path.dirname(reportPath);
  if (!fs.existsSync(reportsDir)) {
    fs.mkdirSync(reportsDir, { recursive: true });
  }
  
  fs.writeFileSync(reportPath, JSON.stringify(reportData, null, 2));
  log(`📄 Report saved to ${reportPath}`, 'cyan');
}

// Main execution
function main() {
  logHeader();
  
  const startTime = Date.now();
  
  try {
    // Pre-flight checks
    const structureOk = checkProjectStructure();
    if (!structureOk) {
      log('❌ Project structure check failed', 'red');
      process.exit(1);
    }
    
    const depsOk = checkDependencies();
    if (!depsOk) {
      log('❌ Dependencies check failed', 'red');
      process.exit(1);
    }
    
    // Main comprehensive check
    const results = runComprehensiveCheck();
    
    // Generate report
    generateDetailedReport(results);
    
    // Save report
    saveReport(results);
    
    // Optional: Create git commit
    if (results.overall) {
      createGitCommit();
    }
    
    const endTime = Date.now();
    const duration = ((endTime - startTime) / 1000).toFixed(2);
    
    log(`\n⏱️ Total execution time: ${duration}s`, 'cyan');
    
    // Exit with appropriate code
    process.exit(results.overall ? 0 : 1);
    
  } catch (error) {
    log(`❌ Script failed: ${error.message}`, 'red');
    console.error(error.stack);
    process.exit(1);
  }
}

// Run the script
if (require.main === module) {
  main();
}

module.exports = {
  checkProjectStructure,
  checkDependencies,
  runComprehensiveCheck,
  generateDetailedReport,
  saveReport
};
