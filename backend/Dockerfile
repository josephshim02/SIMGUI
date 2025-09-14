# Use Julia 1.11.6 base image
FROM julia:1.11.6

# Set working directory
WORKDIR /app

# Install system dependencies for Plots.jl and other packages
RUN apt-get update && apt-get install -y \
    build-essential \
    libxml2-dev \
    && rm -rf /var/lib/apt/lists/*

# Copy Project.toml and Manifest.toml first (for better caching)
COPY Project.toml Manifest.toml* ./

#Move julia startup script into appropriate directory in container
COPY julia_startup.jl /julia/config/startup.jl

# Set Julia depot path so julia knows where to find startup.jl
# and set number of threads for compilation
ENV JULIA_DEPOT_PATH=/julia
ENV JULIA_NUM_THREADS=1

# Precompile packages with reduced parallelism to save memory
RUN julia --project=. -e 'using Pkg; \
    Pkg.instantiate(); \
    Pkg.precompile();'

# Copy the rest of the application
# COPY . .
COPY . /app

# Expose port (adjust as needed)
EXPOSE 8000

# start julia REPL, this will automatically call "~/.julia/config/startup.jl"
CMD ["julia"]