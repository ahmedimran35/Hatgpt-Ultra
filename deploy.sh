#!/bin/bash

# HatGPT Ultra Deployment Script
# This script deploys both client and server to VPS

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
VPS_IP="54.37.39.3"
VPS_USER="ubuntu"
VPS_PATH="~/Hatgpt-Ultra"
CLIENT_PORT="80"
SERVER_PORT="3000"

echo -e "${BLUE}🚀 HatGPT Ultra Deployment Script${NC}"
echo -e "${BLUE}================================${NC}"

# Function to print colored output
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Function to run commands on VPS
run_on_vps() {
    ssh $VPS_USER@$VPS_IP "$1"
}

# Function to check if VPS is accessible
check_vps_connection() {
    echo -e "${BLUE}🔍 Checking VPS connection...${NC}"
    if ssh -o ConnectTimeout=10 $VPS_USER@$VPS_IP "echo 'VPS connection successful'" > /dev/null 2>&1; then
        print_status "VPS connection successful"
    else
        print_error "Cannot connect to VPS. Please check your SSH connection."
        exit 1
    fi
}

# Function to deploy server
deploy_server() {
    echo -e "${BLUE}🔧 Deploying Server...${NC}"
    
    run_on_vps "cd $VPS_PATH/server && git fetch origin main --prune"
    run_on_vps "cd $VPS_PATH/server && git reset --hard origin/main"
    run_on_vps "cd $VPS_PATH/server && npm ci"
    run_on_vps "cd $VPS_PATH/server && npm run build"
    
    print_status "Server code updated and built"
    
    # Stop existing server
    run_on_vps "pm2 delete hatgpt-api 2>/dev/null || true"
    
    # Start server
    run_on_vps "cd $VPS_PATH/server && pm2 start 'node dist/index.js' --name hatgpt-api"
    
    print_status "Server deployed and started on port $SERVER_PORT"
}

# Function to deploy client
deploy_client() {
    echo -e "${BLUE}🎨 Deploying Client...${NC}"
    
    run_on_vps "cd $VPS_PATH/client && git fetch origin main --prune"
    run_on_vps "cd $VPS_PATH/client && git reset --hard origin/main"
    run_on_vps "cd $VPS_PATH/client && npm ci"
    run_on_vps "cd $VPS_PATH/client && npm run build"
    
    print_status "Client code updated and built"
    
    # Stop existing web server
    run_on_vps "pm2 delete hatgpt-web 2>/dev/null || true"
    
    # Start web server
    run_on_vps "cd $VPS_PATH/client && pm2 start 'npx serve -s dist -l $CLIENT_PORT' --name hatgpt-web"
    
    print_status "Client deployed and started on port $CLIENT_PORT"
}

# Function to check deployment status
check_deployment() {
    echo -e "${BLUE}🔍 Checking deployment status...${NC}"
    
    # Check PM2 processes
    echo -e "${BLUE}PM2 Processes:${NC}"
    run_on_vps "pm2 status"
    
    # Check server health
    echo -e "${BLUE}Server Health Check:${NC}"
    if curl -s http://$VPS_IP:$SERVER_PORT/api/health > /dev/null; then
        print_status "Server is responding on port $SERVER_PORT"
    else
        print_warning "Server health check failed"
    fi
    
    # Check client
    echo -e "${BLUE}Client Check:${NC}"
    if curl -s http://$VPS_IP/ > /dev/null; then
        print_status "Client is responding on port $CLIENT_PORT"
    else
        print_warning "Client health check failed"
    fi
}

# Function to show deployment summary
show_summary() {
    echo -e "${BLUE}📋 Deployment Summary${NC}"
    echo -e "${BLUE}===================${NC}"
    echo -e "${GREEN}✅ Server: http://$VPS_IP:$SERVER_PORT${NC}"
    echo -e "${GREEN}✅ Client: http://$VPS_IP${NC}"
    echo -e "${GREEN}✅ API Health: http://$VPS_IP:$SERVER_PORT/api/health${NC}"
    echo ""
    echo -e "${YELLOW}📝 Useful Commands:${NC}"
    echo -e "  • Check status: ssh $VPS_USER@$VPS_IP 'pm2 status'"
    echo -e "  • View logs: ssh $VPS_USER@$VPS_IP 'pm2 logs'"
    echo -e "  • Restart all: ssh $VPS_USER@$VPS_IP 'pm2 restart all'"
    echo -e "  • Stop all: ssh $VPS_USER@$VPS_IP 'pm2 delete all'"
}

# Main deployment function
main() {
    echo -e "${BLUE}Starting deployment to $VPS_IP...${NC}"
    
    # Check VPS connection
    check_vps_connection
    
    # Deploy server
    deploy_server
    
    # Deploy client
    deploy_client
    
    # Check deployment
    check_deployment
    
    # Show summary
    show_summary
    
    print_status "Deployment completed successfully! 🎉"
}

# Handle command line arguments
case "${1:-all}" in
    "server")
        check_vps_connection
        deploy_server
        check_deployment
        ;;
    "client")
        check_vps_connection
        deploy_client
        check_deployment
        ;;
    "status")
        check_vps_connection
        check_deployment
        ;;
    "all"|"")
        main
        ;;
    *)
        echo -e "${RED}Usage: $0 [server|client|status|all]${NC}"
        echo -e "${YELLOW}  server  - Deploy only server"
        echo -e "${YELLOW}  client  - Deploy only client"
        echo -e "${YELLOW}  status  - Check deployment status"
        echo -e "${YELLOW}  all     - Deploy everything (default)${NC}"
        exit 1
        ;;
esac
