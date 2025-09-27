#!/bin/bash

# DIBEA Deployment Script
# Supports both Docker Compose and Kubernetes deployments

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Docker is running
check_docker() {
    if ! docker info > /dev/null 2>&1; then
        log_error "Docker is not running. Please start Docker and try again."
        exit 1
    fi
    log_success "Docker is running"
}

# Check if kubectl is available
check_kubectl() {
    if ! command -v kubectl &> /dev/null; then
        log_warning "kubectl not found. Kubernetes deployment will not be available."
        return 1
    fi
    log_success "kubectl is available"
    return 0
}

# Deploy with Docker Compose
deploy_docker() {
    log_info "Starting Docker Compose deployment..."
    
    # Stop existing containers
    log_info "Stopping existing containers..."
    docker-compose down --remove-orphans || true
    
    # Pull latest images
    log_info "Pulling latest images..."
    docker-compose pull
    
    # Start services
    log_info "Starting services..."
    docker-compose up -d
    
    # Wait for services to be healthy
    log_info "Waiting for services to be healthy..."
    sleep 30
    
    # Check service health
    check_service_health_docker
    
    log_success "Docker Compose deployment completed!"
    show_docker_info
}

# Deploy with Kubernetes
deploy_kubernetes() {
    log_info "Starting Kubernetes deployment..."
    
    # Apply namespace and configs first
    log_info "Creating namespace and configurations..."
    kubectl apply -f k8s/namespace.yaml
    
    # Apply all other manifests
    log_info "Deploying services..."
    kubectl apply -f k8s/postgres.yaml
    kubectl apply -f k8s/redis.yaml
    kubectl apply -f k8s/neo4j.yaml
    kubectl apply -f k8s/n8n.yaml
    
    # Wait for deployments
    log_info "Waiting for deployments to be ready..."
    kubectl wait --for=condition=available --timeout=300s deployment/dibea-postgres -n dibea
    kubectl wait --for=condition=available --timeout=300s deployment/dibea-redis -n dibea
    kubectl wait --for=condition=available --timeout=300s deployment/dibea-neo4j -n dibea
    kubectl wait --for=condition=available --timeout=300s deployment/dibea-n8n -n dibea
    
    log_success "Kubernetes deployment completed!"
    show_kubernetes_info
}

# Check Docker service health
check_service_health_docker() {
    services=("dibea-postgres" "dibea-redis" "dibea-neo4j" "dibea-n8n")
    
    for service in "${services[@]}"; do
        if docker ps --filter "name=$service" --filter "status=running" | grep -q "$service"; then
            log_success "$service is running"
        else
            log_error "$service is not running"
        fi
    done
}

# Show Docker deployment info
show_docker_info() {
    echo ""
    log_info "=== DIBEA Services Information ==="
    echo ""
    echo "🐘 PostgreSQL:     http://localhost:5432"
    echo "🔴 Redis:          http://localhost:6379"
    echo "🕸️  Neo4j:          http://localhost:7474"
    echo "🤖 n8n:            http://localhost:5678"
    echo "📦 MinIO:          http://localhost:9001"
    echo "🔍 Elasticsearch:  http://localhost:9200"
    echo ""
    echo "📋 Default Credentials:"
    echo "   Neo4j:    neo4j / dibea123"
    echo "   n8n:      admin / dibea123"
    echo "   MinIO:    dibea_minio / dibea_minio_password"
    echo ""
}

# Show Kubernetes deployment info
show_kubernetes_info() {
    echo ""
    log_info "=== DIBEA Kubernetes Services ==="
    echo ""
    kubectl get services -n dibea
    echo ""
    log_info "To access services, use port-forwarding:"
    echo "kubectl port-forward svc/dibea-n8n 5678:5678 -n dibea"
    echo "kubectl port-forward svc/dibea-neo4j 7474:7474 -n dibea"
    echo ""
}

# Main script
main() {
    echo ""
    log_info "🚀 DIBEA Deployment Script"
    echo ""
    
    # Check Docker
    check_docker
    
    # Check deployment type
    if [[ "$1" == "k8s" || "$1" == "kubernetes" ]]; then
        if check_kubectl; then
            deploy_kubernetes
        else
            log_error "Kubernetes deployment requested but kubectl not available"
            exit 1
        fi
    else
        deploy_docker
    fi
}

# Run main function with all arguments
main "$@"
