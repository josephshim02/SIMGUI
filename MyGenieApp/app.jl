module App

using Genie, Genie.Router, Genie.Renderer.Html
using Genie.Renderer.Json

Genie.Configuration.config!(
    server_port = 8000,
    server_host = "0.0.0.0",
    log_to_file = false,
    server_handle_static_files = true,
    path_build = "build",
    format_julia_builds = false,
    format_html_output = false,
    cors_allowed_origins = ["http://localhost:5173"]
)

# Example function for the root page
function ui()
    # Declare an empty dictionary with String keys and Int values
    mydict = Dict{String, Int}()

    # Or with initial values
    mydict = Dict("apple" => 3, "banana" => 5)
    HTML(
        h1("My First Genie App") *
        input("Enter your message", :message, id="message-input") *
        button("Echo!", id="echo-btn", onclick="sendEcho()") *
        p("", id="echo-result") *
    script("function sendEcho() {const msg = document.getElementById('message-input').value;fetch('/echo', {method: 'POST',headers: {'Content-Type': 'application/json'},body: JSON.stringify({message: msg})}).then(r => r.json()).then(data => {document.getElementById('echo-result').innerText = data.echo;}).catch(() => {document.getElementById('echo-result').innerText = 'Error!';});}")
    )
end


# Simple greet route
greet() = "Welcome to Genie!"

# Register routes
route("/", ui)
route("/greet", greet, method = GET)

route("/echo", method = POST) do
  message = jsonpayload()
  (:echo => (message["message"] * " ") ^ message["repeat"]) |> json
end


end