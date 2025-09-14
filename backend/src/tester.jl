module tester


using Genie, Genie.Requests

route("/") do 
  Genie.Renderer.Json.json(Dict("status" => "healt3434hy"), headers = Dict(
        "Access-Control-Allow-Origin" => "*"
    ))
end

route("/api/health") do
    Genie.Renderer.Json.json(Dict("status" => "healt3434hy"), headers = Dict(
        "Access-Control-Allow-Origin" => "*"
    ))
end


function run_server()
  println("his")
  Main.helper.testfunction()
  up(8000, "0.0.0.0"; async=false)
end

end