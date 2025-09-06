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
  
  """{"drawflow":{"Home":{"data":{"1":{"id":1,"name":"f_store","data":{},"class":"f_store","typenode":false,"inputs":{"input_1":{"connections":[{"node":"2","input":"output_1"}]}},"outputs":{"output_1":{"connections":[]}},"pos_x":754,"pos_y":166},"2":{"id":2,"name":"f_junc","data":{},"class":"f_junc","typenode":false,"inputs":{"input_1":{"connections":[{"node":"4","input":"output_1"}]}},"outputs":{"output_1":{"connections":[{"node":"1","output":"input_1"},{"node":"3","output":"input_1"}]}},"pos_x":467,"pos_y":328},"3":{"id":3,"name":"e_store","data":{},"class":"e_store","typenode":false,"inputs":{"input_1":{"connections":[{"node":"2","input":"output_1"}]}},"outputs":{"output_1":{"connections":[]}},"pos_x":813,"pos_y":432},"4":{"id":4,"name":"sf","data":{},"class":"sf","typenode":false,"inputs":{},"outputs":{"output_1":{"connections":[{"node":"2","output":"input_1"}]}},"pos_x":206,"pos_y":222}}},"Other":{"data":{}}}}""" |> json
end

# Start the server
up(async = false)
