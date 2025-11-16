# Frontend configuration
DOCKER_IMAGE=docker.io/bigg01/santa:latest
NAMESPACE=santa
DEPLOYMENT_NAME=santa-claus-game
VERSION=latest

# Backend configuration
BACKEND_IMAGE=docker.io/bigg01/santa-backend:latest
BACKEND_DEPLOYMENT_NAME=santa-backend
BACKEND_PORT=8080

# Frontend targets
docker-build:
	@docker build -t $(DOCKER_IMAGE) .

docker-push:
	@docker push $(DOCKER_IMAGE)

get-digest:
	@docker inspect --format='{{index .RepoDigests 0}}' $(DOCKER_IMAGE) > image_digest.txt

update-deployment:
	@sed -i 's|image: $(DOCKER_IMAGE)@sha256:[a-f0-9]*|image: $(shell cat image_digest.txt)|' deployment/deployment.yaml

update-html:
	@digest=$(cat image_digest.txt); \
	#digest_last4=$${digest: -4}; \
	sed -i "s|<span id=\"version\">.*</span>|<span id=\"version\">Version: ${digest}</span>|" index.html

apply:
	@sed -i 's|image: $(DOCKER_IMAGE)@sha256:[a-f0-9]*|image: $(shell cat image_digest.txt)|' deployment/deployment.yaml
	@kubectl delete -f deployment/
	@kubectl create -f deployment/
	@kubectl scale deployment/$(DEPLOYMENT_NAME) --replicas=1 -n $(NAMESPACE)

docker-run:
	@docker run -p 8081:8080 $(DOCKER_IMAGE)

# Backend targets
backend-build:
	@cd backend && docker build -t $(BACKEND_IMAGE) .

backend-push:
	@docker push $(BACKEND_IMAGE)

backend-get-digest:
	@docker inspect --format='{{index .RepoDigests 0}}' $(BACKEND_IMAGE) > backend/image_digest.txt

backend-update-deployment:
	@sed -i 's|image: $(BACKEND_IMAGE)@sha256:[a-f0-9]*|image: $(shell cat backend/image_digest.txt)|' deployment/backend-deployment.yaml

backend-apply:
	@sed -i 's|image: $(BACKEND_IMAGE)@sha256:[a-f0-9]*|image: $(shell cat backend/image_digest.txt)|' deployment/backend-deployment.yaml
	@kubectl apply -f deployment/backend-deployment.yaml
	@kubectl apply -f deployment/backend-svc.yaml

backend-run:
	@cd backend && go run main.go

backend-docker-run:
	@docker run -p $(BACKEND_PORT):8080 $(BACKEND_IMAGE)

# Combined targets
all: docker-build docker-push get-digest update-html update-deployment apply

backend-all: backend-build backend-push backend-get-digest backend-update-deployment backend-apply

full-deploy: all backend-all

scale:
	@kubectl scale deployment/$(DEPLOYMENT_NAME) --replicas=$(REPLICAS) -n $(NAMESPACE)

backend-scale:
	@kubectl scale deployment/$(BACKEND_DEPLOYMENT_NAME) --replicas=$(REPLICAS) -n $(NAMESPACE)