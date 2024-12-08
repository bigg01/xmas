DOCKER_IMAGE=docker.io/bigg01/santa:latest
NAMESPACE=santa
DEPLOYMENT_NAME=santa-claus-game
VERSION=latest

docker-build:
	@docker build -t $(DOCKER_IMAGE) .

docker-push:
	@docker push $(DOCKER_IMAGE)

get-digest:
	@docker inspect --format='{{index .RepoDigests 0}}' $(DOCKER_IMAGE) > image_digest.txt

update-deployment:
	@sed -i 's|image: $(DOCKER_IMAGE)@sha256:[a-f0-9]*|image: $(shell cat image_digest.txt)|' deployment/deployment.yaml

update-html:
	@digest=$$(cat image_digest.txt); \
	digest_last4=$${digest: -4}; \
	sed -i "s|<span id=\"version\">.*</span>|<span id=\"version\">Version: $${digest_last4}</span>|" index.html

apply:
	@sed -i 's|image: $(DOCKER_IMAGE)@sha256:[a-f0-9]*|image: $(shell cat image_digest.txt)|' deployment/deployment.yaml
	@kubectl delete -f deployment/
	@kubectl create -f deployment/
	@kubectl scale deployment/$(DEPLOYMENT_NAME) --replicas=2 -n $(NAMESPACE)

all: docker-build docker-push get-digest update-html update-deployment

scale:
	@kubectl scale deployment/$(DEPLOYMENT_NAME) --replicas=$(REPLICAS) -n $(NAMESPACE)

docker-run:
	@docker run -p 8081:8080 $(DOCKER_IMAGE)