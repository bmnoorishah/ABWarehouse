#!/usr/bin/env node

/**
 * Cross-platform build script for ABWarehouse
 * Works on Windows, macOS, and Linux
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('\n==========================================');
console.log('   ABWarehouse Build Script');
console.log('==========================================\n');

// Check if Node.js and npm are available
try {
    const nodeVersion = execSync('node --version', { encoding: 'utf8' }).trim();
    const npmVersion = execSync('npm --version', { encoding: 'utf8' }).trim();
    console.log(`✓ Node.js: ${nodeVersion}`);
    console.log(`✓ npm: ${npmVersion}\n`);
} catch (error) {
    console.error('ERROR: Node.js or npm is not installed or not in PATH');
    process.exit(1);
}

// Install dependencies if node_modules doesn't exist
if (!fs.existsSync('node_modules')) {
    console.log('Installing dependencies...');
    try {
        execSync('npm install', { stdio: 'inherit' });
        console.log('✓ Dependencies installed successfully\n');
    } catch (error) {
        console.error('ERROR: Failed to install dependencies');
        process.exit(1);
    }
}

// Determine platform and build accordingly
const platform = process.platform;
console.log(`Building for platform: ${platform}\n`);

let buildCommand;
switch (platform) {
    case 'win32':
        buildCommand = 'npm run build-win-all';
        break;
    case 'darwin':
        buildCommand = 'npm run build-mac';
        break;
    case 'linux':
        buildCommand = 'npm run build-linux';
        break;
    default:
        console.log('Building for all platforms...');
        buildCommand = 'npm run build';
        break;
}

console.log(`Running: ${buildCommand}`);
console.log('This may take several minutes...\n');

try {
    execSync(buildCommand, { stdio: 'inherit' });
} catch (error) {
    console.error('\nERROR: Build failed');
    process.exit(1);
}

console.log('\n==========================================');
console.log('   Build Complete Successfully!');
console.log('==========================================\n');

// Show created files
if (fs.existsSync('dist')) {
    console.log('Created files in dist folder:');
    const files = fs.readdirSync('dist');
    files.forEach(file => {
        const filePath = path.join('dist', file);
        const stats = fs.statSync(filePath);
        const sizeMB = (stats.size / (1024 * 1024)).toFixed(2);
        console.log(`  📦 ${file} - ${sizeMB} MB`);
    });
    console.log(`\nFull path: ${path.resolve('dist')}\n`);
} else {
    console.log('WARNING: dist folder not found\n');
}

console.log('Distribution files are ready!');

if (platform === 'win32') {
    console.log('\nWindows Installation Options:');
    console.log('  1. ABWarehouse Setup *.exe - Full installer');
    console.log('  2. ABWarehouse *.exe - Portable executable');
    console.log('  3. ABWarehouse-*-win.zip - Manual deployment');
}

console.log('\nBuild process completed successfully! 🎉');