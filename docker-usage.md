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
   ### Explanation of 'docker-compose up'/'docker-compose up backend'
   # 1 This will start the backend container and replace all files in docker's /app with all files in your local /backend
   # Moreover changing files within local /backend will also change files in docker's /app without the need to rebuild the container 
   # 2 This will block the terminal, this is desired, leave it running for step 6
6. Start the backend/Genie server
   1 open a new terminal
   2 Inside the new terminal run:
   ```bash
   docker exec -it genie-backend julia --project=/julia/environments/v1.11
   ``` 
   3 Inside julia REPL run:
   ```julia> 
   include("scripts/julia_startup.jl")
   App.run_server()
   ```
   ### Explanation:
   # Step 6 opens a Julia REPL inside of the docker container running in the other terminal
   # The startup script sets up Revise to track changes to julia modules on your LOCAL machine
   # Note this only tracks changes to METHODS within julia modules

   ### Workflow with revise:
   # i. If you create a new julia module in backend, before running the docker containers in step 5, 
   # add these lines to scripts/julia_startup.jl: 
   # Revise.includet("src/<filename>.jl")
   # using .<modulename>
   # ii. Start container as in step 5. Follow step 6 (don't need to run_server())
   # iii. Call method <modulename>.<method1>
   # iv. Edit method1 on local machine
   # v. Call method <modulename>.<method1> 
   # *WOW* you should see the changed method without having to re precompile all the packages

   ### Note 1: If you make a global change you can either 1 go back to step 3 and restart the docker container, exec into it etc...
   # or 2 in the julia REPL include("file.jl") to see the change. However if you do this it will break the tracking from revise so
   # you will have to include("file.jl") every time you make a change moving forwards (I feel like there should be a way to setup revise tracking again but not sure how)
   
   ### NOTE 2: If your module uses a new package not declared in project.toml then inside the julia REPL: 
   #     - Pkg.add("new_package"); 
   #     - using new_package 
   # If instead you add the using new_package to the top of your module revise won't pick up the change (although perhaps you could add it inside a method)
   # If you share the updated module, either 1 add Pkg.add("new_package"); using new_package to the julia_startup script
   # Or 2 add the package to the local toml (Pkg.activate("path_to_toml_folder"); Pkg.add("new_package")) and add using new_package to the top of the module
   # This is the long term solution however it requires building the docker container all over again which is time consuming
   # Pkg.add("new_package") in a local julia REPL and rebuild the container (step 3)

   ### NOTE 3: Supposing your module (Module_1) contains a method (method_1) which calls another method (method_2) from another local
   # module (Module_2). Then if you want to change method_2, then in the REPL call Module_1.method_1() and see the new method_2() be called
   # THEN: You most *not* put "include('Module_2')" and using .Module_2 at the start of Module_1.
   # AND: when you call method_2 inside Module_1 call it with "Main.Module_2.method_2()"

## Issue when trying to stop, recompile and restart server
- Run `docker ps -a` to see current containers
- Run `docker rm vite-frontend` and `docker rm genie-backend` to remove current containers.
- Rebuild each one step by step using the previous `docker-compose` commands.