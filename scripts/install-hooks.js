#!/usr/bin/env node

/**
 * Git Hooks Installer Script
 * This script installs pre-commit and pre-push hooks for the project
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

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

function installGitHooks() {
  logSection('Installing Git Hooks');
  
  const gitHooksDir = '.git/hooks';
  const scriptsHooksDir = 'scripts/git-hooks';
  
  // Check if .git directory exists
  if (!fs.existsSync('.git')) {
    log('❌ Not a Git repository. Please run "git init" first.', 'red');
    return false;
  }
  
  // Check if scripts/git-hooks directory exists
  if (!fs.existsSync(scriptsHooksDir)) {
    log('❌ Git hooks directory not found in scripts/', 'red');
    return false;
  }
  
  const hooks = ['pre-commit', 'pre-push'];
  let installedCount = 0;
  
  hooks.forEach(hookName => {
    const sourcePath = path.join(scriptsHooksDir, hookName);
    const targetPath = path.join(gitHooksDir, hookName);
    
    try {
      // Copy hook file
      fs.copyFileSync(sourcePath, targetPath);
      
      // Make it executable
      fs.chmodSync(targetPath, '755');
      
      log(`✅ Installed ${hookName} hook`, 'green');
      installedCount++;
    } catch (error) {
      log(`❌ Failed to install ${hookName} hook: ${error.message}`, 'red');
    }
  });
  
  if (installedCount === hooks.length) {
    log(`\n🎉 Successfully installed ${installedCount} Git hooks!`, 'green');
    log('Git hooks will now run automatically before commits and pushes.', 'cyan');
    return true;
  } else {
    log(`\n⚠️ Installed ${installedCount}/${hooks.length} hooks`, 'yellow');
    return false;
  }
}

function uninstallGitHooks() {
  logSection('Uninstalling Git Hooks');
  
  const gitHooksDir = '.git/hooks';
  const hooks = ['pre-commit', 'pre-push'];
  let removedCount = 0;
  
  hooks.forEach(hookName => {
    const targetPath = path.join(gitHooksDir, hookName);
    
    try {
      if (fs.existsSync(targetPath)) {
        fs.unlinkSync(targetPath);
        log(`✅ Removed ${hookName} hook`, 'green');
        removedCount++;
      } else {
        log(`⚠️ ${hookName} hook not found`, 'yellow');
      }
    } catch (error) {
      log(`❌ Failed to remove ${hookName} hook: ${error.message}`, 'red');
    }
  });
  
  log(`\n🎉 Successfully removed ${removedCount} Git hooks!`, 'green');
  return removedCount > 0;
}

function testGitHooks() {
  logSection('Testing Git Hooks');
  
  try {
    // Test pre-commit hook
    log('Testing pre-commit hook...', 'yellow');
    const preCommitPath = '.git/hooks/pre-commit';
    
    if (fs.existsSync(preCommitPath)) {
      execSync('chmod +x .git/hooks/pre-commit', { stdio: 'pipe' });
      log('✅ Pre-commit hook is executable', 'green');
    } else {
      log('❌ Pre-commit hook not found', 'red');
    }
    
    // Test pre-push hook
    log('Testing pre-push hook...', 'yellow');
    const prePushPath = '.git/hooks/pre-push';
    
    if (fs.existsSync(prePushPath)) {
      execSync('chmod +x .git/hooks/pre-push', { stdio: 'pipe' });
      log('✅ Pre-push hook is executable', 'green');
    } else {
      log('❌ Pre-push hook not found', 'red');
    }
    
    return true;
  } catch (error) {
    log(`❌ Error testing hooks: ${error.message}`, 'red');
    return false;
  }
}

function showHelp() {
  log(`${colors.bold}${colors.magenta}Git Hooks Installer${colors.reset}`);
  log(`${colors.cyan}This script manages Git hooks for the Wise Attitude project.${colors.reset}`);
  
  log('\nUsage:', 'bold');
  log('  node scripts/install-hooks.js [command]');
  
  log('\nCommands:', 'bold');
  log('  install    Install Git hooks (default)');
  log('  uninstall  Remove Git hooks');
  log('  test       Test installed hooks');
  log('  help       Show this help message');
  
  log('\nExamples:', 'bold');
  log('  node scripts/install-hooks.js install');
  log('  node scripts/install-hooks.js uninstall');
  log('  node scripts/install-hooks.js test');
}

// Main execution
function main() {
  const command = process.argv[2] || 'install';
  
  switch (command) {
    case 'install':
      installGitHooks();
      break;
    case 'uninstall':
      uninstallGitHooks();
      break;
    case 'test':
      testGitHooks();
      break;
    case 'help':
      showHelp();
      break;
    default:
      log(`❌ Unknown command: ${command}`, 'red');
      showHelp();
      process.exit(1);
  }
}

// Run the script
if (require.main === module) {
  main();
}

module.exports = {
  installGitHooks,
  uninstallGitHooks,
  testGitHooks
};
