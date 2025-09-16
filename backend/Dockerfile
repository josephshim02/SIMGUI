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
COPY julia_environment/Project.toml julia_environment/Manifest.toml* /julia/environments/v1.11/


# Set Julia depot path and set number of threads for compilation
ENV JULIA_DEPOT_PATH=/julia
ENV JULIA_NUM_THREADS=1

# Precompile packages with reduced parallelism to save memory
RUN julia --project=/julia/environments/v1.11 -e 'using Pkg; Pkg.instantiate(); Pkg.precompile()'


# Copy the rest of the application
# COPY . .
COPY . /app

# Expose port (adjust as needed)
EXPOSE 8000

# start julia REPL upon running container (in practice unfortunately we actually have to exec into the container)
CMD ["julia", "--project=/julia/environments/v1.11"]