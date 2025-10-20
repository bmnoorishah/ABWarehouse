#!/bin/bash

# Build script for Hello World Electron application
# Usage: ./build.sh [platform]

set -e

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ELECTRON_DIR="$PROJECT_ROOT/HelloWorldElectron"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

check_dependencies() {
    log_info "Checking dependencies..."
    
    # Check Node.js for Electron
    if ! command -v node &> /dev/null; then
        log_error "Node.js not found. Please install Node.js to build Electron app."
        exit 1
    else
        log_info "Node.js found: $(node --version)"
    fi
    
    # Check npm for Electron
    if ! command -v npm &> /dev/null; then
        log_error "npm not found. Please install npm to build Electron app."
        exit 1
    else
        log_info "npm found: $(npm --version)"
    fi
}

build_electron() {
    local platform=${1:-""}
    
    log_info "Building Electron application..."
    
    cd "$ELECTRON_DIR"
    
    if [ ! -d "node_modules" ]; then
        log_info "Installing npm dependencies..."
        npm install
    fi
    
    case $platform in
        "win"|"windows")
            log_info "Building for Windows..."
            npm run build-win
            ;;
        "mac"|"macos")
            log_info "Building for macOS..."
            npm run build-mac
            ;;
        "linux")
            log_info "Building for Linux..."
            npm run build-linux
            ;;
        *)
            log_info "Building for current platform..."
            npm run build
            ;;
    esac
    
    log_info "Electron build completed!"
    cd "$PROJECT_ROOT"
}



show_help() {
    echo "Hello World Electron Build Script"
    echo ""
    echo "Usage: $0 [PLATFORM] [OPTIONS]"
    echo ""
    echo "PLATFORM:"
    echo "  win         Windows"
    echo "  mac         macOS"
    echo "  linux       Linux"
    echo "  all         All platforms"
    echo "  (default)   Current platform"
    echo ""
    echo "OPTIONS:"
    echo "  --check     Check dependencies only"
    echo "  --help      Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0              # Build for current platform"
    echo "  $0 win          # Build for Windows"
    echo "  $0 all          # Build for all platforms"
    echo "  $0 --check      # Check dependencies only"
}

# Parse arguments
PLATFORM=""
CHECK_ONLY=false

while [[ $# -gt 0 ]]; do
    case $1 in
        win|windows|mac|macos|linux|all)
            PLATFORM="$1"
            shift
            ;;
        --check)
            CHECK_ONLY=true
            shift
            ;;
        --help|-h)
            show_help
            exit 0
            ;;
        *)
            log_error "Unknown option: $1"
            show_help
            exit 1
            ;;
    esac
done

# Main execution
log_info "Hello World Electron Build Script"
log_info "=================================="

check_dependencies

if [ "$CHECK_ONLY" = true ]; then
    log_info "Dependency check completed."
    exit 0
fi

# Handle special case for "all" platforms
if [ "$PLATFORM" = "all" ]; then
    log_info "Building for all platforms..."
    build_electron "win"
    build_electron "mac"
    build_electron "linux"
else
    build_electron "$PLATFORM"
fi

log_info "Build process completed successfully!"