module App

using Genie, Genie.Renderer.Json, Genie.Requests
using HTTP
include("DrawflowToBondGraph.jl")
using .DrawflowToBondGraph
using JSON

# Configure CORS using Genie's built-in configuration
Genie.Configuration.config!(
  cors_allowed_origins = ["*"],
  cors_headers = Dict(
        "Access-Control-Allow-Origin" => "*",        # <--- add this
        "Access-Control-Allow-Methods" => "GET, POST, PUT, DELETE, OPTIONS",
        "Access-Control-Allow-Headers" => "Content-Type, Authorization",
        "Access-Control-Allow-Credentials" => "true"
    )
)

# Health check endpoint
route("/") do
  HTML("Healt436356hy")
end

# Echo endpoint for testing
route("/echo", method = POST) do
  test = jsonpayload()
  println(test)
  # println(rawpayload() == JSON.json(jsonpayload()))
  bg, enhanced_data = convert_drawflow_to_bondgraph(test,verbose=false)
  sol, relations = simulate_bondgraph(bg, tspan=(0.0, 10.0), verbose=false)
  solution_data = solution_to_json(sol, include_metadata=true)
  solution_data |> json
end

end