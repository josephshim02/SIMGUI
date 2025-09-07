module App
using Genie, Genie.Renderer.Json, Genie.Requests
using HTTP
include("DrawflowToBondGraph.jl")
using .DrawflowToBondGraph
using JSON

Genie.Configuration.config!(
  cors_allowed_origins = ["http://localhost:5173/", "https://simgui.vercel.app/"],
  cors_headers = Dict(
    "Access-Control-Allow-Methods" => "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers" => "Content-Type, Authorization",
    "Access-Control-Allow-Credentials" => "true"
  )
)
# Health check endpoint
route("/") do
  HTML("Healthy")
end

# Echo endpoint for testing
# route("/echo", method = POST) do
#   bg, enhanced_data = convert_drawflow_to_bondgraph(JSON.parse(JSON.json(jsonpayload())), verbose=true)
#   sol, relations = simulate_bondgraph(bg, tspan=(0.0, 10.0), verbose=true)
#   solution_data = save_solution_json(sol, include_metadata=true)
#   return solution_data
# end

route("/echo", method = POST) do
  json_data = JSON.parse(JSON.json(jsonpayload()))
  bg, enhanced_data = convert_drawflow_to_bondgraph(json_data, verbose=true)
  simulation_data = json_data["drawflow"]["simulation"]
  sol = simulate_bondgraph(bg, simulation_data=simulation_data, verbose=true)
  solution_data = save_solution_json(sol, include_metadata=true)
  return solution_data
end

up(async = false)

end
