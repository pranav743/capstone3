## Running with Docker Compose

This project uses Docker Compose to orchestrate all required services for local development and testing.

### Prerequisites

- [Docker](https://docs.docker.com/get-docker/)
- [Docker Compose](https://docs.docker.com/compose/install/)

### Usage

1. **Clone the repository and navigate to the project root:**
	```sh
	git clone <your-repo-url>
	cd capstone3
	```

2. **Start all services:**
	```sh
	docker-compose up --build
	```
	This will build and start all containers defined in `docker-compose.yml`.

3. **Access the services:**
	- **API:** http://localhost:8082
	- **UI:** http://localhost:3000
	- **Kafka UI:** http://localhost:8085
	- **Mongo Express:** http://localhost:8081
	- **Keycloak:** http://localhost:8080

4. **Stop all services:**
	Press `Ctrl+C` in the terminal, then run:
	```sh
	docker-compose down
	```

### Notes
- Data for MongoDB is persisted in a Docker volume (`mongo_data`).
- Ensure ports required by the services are not in use by other applications.
