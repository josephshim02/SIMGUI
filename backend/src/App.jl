module App

#include("DrawflowToBondGraph.jl")
#using .DrawflowToBondGraph
using Genie, Genie.Requests
using JSON
using HTTP

function setCors()
  Genie.Configuration.config!(
    cors_allowed_origins = ["http://localhost:5173/", "https://simgui.vercel.app/"],
    cors_headers = Dict(
      "Access-Control-Allow-Methods" => "GET, POST, PUT, DELETE, OPTIONS",
      "Access-Control-Allow-Headers" => "Content-Type, Authorization",
      "Access-Control-Allow-Credentials" => "true"
    )
  )
end

function setRoutes()
  route("/") do 
    Genie.Renderer.Json.json(Dict("status" => "healthy!!!"), headers = Dict(
          "Access-Control-Allow-Origin" => "*"
      ))
  end

  route("/api/simulate", method = POST) do
    println("aaa");
    json_data = JSON.parse(JSON.json(jsonpayload()))
    solution_data = simulate(json_data)
    return solution_data
  end
end


function simulate(json_data)
  bg, enhanced_data = Main.DrawflowToBondGraph.convert_drawflow_to_bondgraph(json_data, verbose=true)
  simulation_data = json_data["simulation_data"]
  sol = Main.DrawflowToBondGraph.simulate_bondgraph(bg, simulation_data=simulation_data, verbose=true)
  solution_data = Main.DrawflowToBondGraph.save_solution_json(sol, include_metadata=true)
  return solution_data
end

function run_server(indocker::Bool = true)
  setCors()
  setRoutes()
  if indocker
    up(8000, "0.0.0.0"; async=false)
  else
    up(async=false)
  end
end

end