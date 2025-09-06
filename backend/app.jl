using Genie, Genie.Renderer.Json, Genie.Requests
using HTTP

# Configure CORS using Genie's built-in configuration
Genie.Configuration.config!(
  cors_allowed_origins = ["http://localhost:5173"],
  cors_headers = Dict(
    "Access-Control-Allow-Methods" => "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers" => "Content-Type, Authorization",
    "Access-Control-Allow-Credentials" => "true"
  )
)

# Health check endpoint
route("/api/health") do
  json(Dict(
    "status" => "healthy",
    "message" => "Genie backend is running"
  ))
end

# Echo endpoint for testing
route("/echo", method = POST) do
  @show jsonpayload()

  (jsonpayload()) |> json
end

# Start the server
up(async = false)
