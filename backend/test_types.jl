#!/usr/bin/env julia

# Simple script to test types and u0 compatibility without BondGraphs

using JSON

println("Loading test.json...")
json_data = JSON.parsefile("test.json")

println("\n=== JSON Structure ===")
println("Top level keys: ", keys(json_data))
println("Drawflow keys: ", keys(json_data["drawflow"]))

println("\n=== Simulation Data ===")
simulation_data = json_data["drawflow"]["simulation"]
println("Simulation data: ", simulation_data)
println("Type of simulation_data: ", typeof(simulation_data))

println("\n=== Initial Values ===")
initial_values = simulation_data["initial_values"]
println("Initial values: ", initial_values)
println("Type of initial_values: ", typeof(initial_values))
println("Type of first element: ", typeof(initial_values[1]))

println("\n=== Converting to Float64 ===")
initial_values_float = [parse(Float64, val) for val in initial_values]
println("Converted initial values: ", initial_values_float)
println("Type of converted values: ", typeof(initial_values_float))
println("Type of first converted element: ", typeof(initial_values_float[1]))

println("\n=== Testing u0 Compatibility ===")
# Test if this would work as u0 for ODEProblem
println("Length of initial values: ", length(initial_values_float))
println("Is Vector{Float64}: ", initial_values_float isa Vector{Float64})
println("All elements are Float64: ", all(x -> x isa Float64, initial_values_float))

println("\n=== Node Data Analysis ===")
drawflow_data = json_data["drawflow"]["Home"]["data"]
for (node_id, node_data) in drawflow_data
    println("\nNode $node_id:")
    println("  Class: $(node_data["class"])")
    println("  Name: $(node_data["name"])")
    
    if haskey(node_data["data"], "param")
        param = node_data["data"]["param"]
        println("  Param: $param (type: $(typeof(param)))")
        if param != ""
            try
                param_float = parse(Float64, param)
                println("  Param as Float64: $param_float")
            catch e
                println("  Error parsing param: $e")
            end
        end
    end
    
    if haskey(node_data["data"], "initial")
        initial = node_data["data"]["initial"]
        println("  Initial: $initial (type: $(typeof(initial)))")
        try
            initial_float = parse(Float64, initial)
            println("  Initial as Float64: $initial_float")
        catch e
            println("  Error parsing initial: $e")
        end
    end
end

println("\n=== Summary ===")
println("✓ Initial values are currently strings and need to be converted to Float64")
println("✓ After conversion, they should be compatible with ODEProblem u0")
println("✓ Node parameters are also strings and need conversion to Float64")
