# Run the server using docker

**Prerequisites:**
- Install Docker on your machine. You can download it from [Docker's official website](https://www.docker.com/get-started).
- Ensure Docker is running on your system.

**Steps to Build and Run SIMGUI using Docker:**
1. Pull from main branch
   ```bash
   git pull origin main
   ```
2. Navigate to the SIMGUI directory
   ```bash
   cd SIMGUI
   git checkout main
   ```
3. Build docker image for backend with memory limit of 2GB
   ```bash
   docker-compose build --memory=2g backend
   ```
4. Build docker image for frontend with memory limit of 3GB
   ```bash
   docker-compose build --memory=3g frontend
   ```
    ### If your computer has enough FREE RAM of about 10GB(5GB isn't enough, I tested it and know what it taste like), you can try to run this
        docker-compose up --build
        // If you run this, it will start both backend and frontend servers.
        // or you can do:
        
        docker-compose build
        
        // and then call up on servers you want to run.
5. Run the Docker containers
   ```bash
   docker-compose up
   ``` 
   or if you only want to run backend in docker (Recommended):
   ```bash
   docker-compose up backend
   ```
   or run only frontend in docker:
   ```bash
   docker-compose up frontend
   ```
   - Recommend: running julia in the docker and frontend using `npm run dev` for development
## Issue when trying to stop, recompile and restart server
- Run `docker ps -a` to see current containers
- Run `docker rm vite-frontend` and `docker rm genie-backend` to remove current containers.
- Rebuild each one step by step using the previous `docker-compose` commands.