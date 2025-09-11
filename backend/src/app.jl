include("DrawflowToBondGraph.jl")
using Genie, Genie.Requests
using .DrawflowToBondGraph
using HTTP
using JSON

Genie.Configuration.config!(
  cors_allowed_origins = ["http://localhost:5173/", "https://simgui.vercel.app/"],
  cors_headers = Dict(
    "Access-Control-Allow-Methods" => "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers" => "Content-Type, Authorization",
    "Access-Control-Allow-Credentials" => "true"
  )
)


route("/api/health") do
    Genie.Renderer.Json.json(Dict("status" => "healthy"), headers = Dict(
        "Access-Control-Allow-Origin" => "*"
    ))
end

route("/api/simulate", method = POST) do
  json_data = JSON.parse(JSON.json(jsonpayload()))
  bg, enhanced_data = convert_drawflow_to_bondgraph(json_data, verbose=true)
  simulation_data = json_data["drawflow"]["simulation"]
  sol = simulate_bondgraph(bg, simulation_data=simulation_data, verbose=true)
  solution_data = save_solution_json(sol, include_metadata=true)
  return solution_data
end

up(8000, "0.0.0.0", async = false)