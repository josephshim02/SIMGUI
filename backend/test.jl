#!/usr/bin/env julia
"""
Simple test script using DrawflowToBondGraph module
"""

# Include the module
include("DrawflowToBondGraph.jl")
using .DrawflowToBondGraph
using JSON
println("=== Testing DrawflowToBondGraph Module ===")
println()

# Convert JSON to BondGraph
json_string = """{"drawflow":{"Home":{"data":{"1":{"id":1,"name":"f_store","data":{},"class":"f_store","typenode":false,"inputs":{"input_1":{"connections":[{"node":"2","input":"output_1"}]}},"outputs":{"output_1":{"connections":[]}},"pos_x":492,"pos_y":376},"2":{"id":2,"name":"f_junc","data":{},"class":"f_junc","typenode":false,"inputs":{"input_1":{"connections":[{"node":"4","input":"output_1"}]}},"outputs":{"output_1":{"connections":[{"node":"1","output":"input_1"},{"node":"3","output":"input_1"}]}},"pos_x":389,"pos_y":140},"3":{"id":3,"name":"e_store","data":{},"class":"e_store","typenode":false,"inputs":{"input_1":{"connections":[{"node":"2","input":"output_1"}]}},"outputs":{"output_1":{"connections":[]}},"pos_x":730,"pos_y":182},"4":{"id":4,"name":"sf","data":{},"class":"sf","typenode":false,"inputs":{},"outputs":{"output_1":{"connections":[{"node":"2","output":"input_1"}]}},"pos_x":93,"pos_y":134}}},"Other":{"data":{}}}}"""
cleaned_json_string = """{"drawflow":{"Home":{"data":{"1":{"id":1,"name":"se","data":{},"class":"se","typenode":false,"inputs":{},"outputs":{"output_1":{"connections":[{"node":"2","output":"input_1"}]}},"pos_x":116,"pos_y":209},"2":{"id":2,"name":"f_junc","data":{},"class":"f_junc","typenode":false,"inputs":{"input_1":{"connections":[{"node":"1","input":"output_1"}]}},"outputs":{"output_1":{"connections":[{"node":"3","output":"input_1"},{"node":"4","output":"input_1"}]}},"pos_x":367,"pos_y":248},"3":{"id":3,"name":"f_store","data":{},"class":"f_store","typenode":false,"inputs":{"input_1":{"connections":[{"node":"2","input":"output_1"}]}},"outputs":{"output_1":{"connections":[]}},"pos_x":443,"pos_y":377},"4":{"id":4,"name":"e_store","data":{},"class":"e_store","typenode":false,"inputs":{"input_1":{"connections":[{"node":"2","input":"output_1"}]}},"outputs":{"output_1":{"connections":[]}},"pos_x":463,"pos_y":57}}}}}"""
cleaned_json_string = """{"drawflow":{"Home":{"data":{"1":{"id":1,"name":"se","data":{},"class":"se","typenode":false,"inputs":{},"outputs":{"output_1":{"connections":[{"node":"2","output":"input_1"}]}},"pos_x":116,"pos_y":209},"2":{"id":2,"name":"f_junc","data":{},"class":"f_junc","typenode":false,"inputs":{"input_1":{"connections":[{"node":"1","input":"output_1"}]}},"outputs":{"output_1":{"connections":[{"node":"3","output":"input_1"},{"node":"4","output":"input_1"}]}},"pos_x":367,"pos_y":248},"3":{"id":3,"name":"f_store","data":{},"class":"f_store","typenode":false,"inputs":{"input_1":{"connections":[{"node":"2","input":"output_1"}]}},"outputs":{"output_1":{"connections":[]}},"pos_x":443,"pos_y":377},"4":{"id":4,"name":"e_store","data":{},"class":"e_store","typenode":false,"inputs":{"input_1":{"connections":[{"node":"2","input":"output_1"}]}},"outputs":{"output_1":{"connections":[]}},"pos_x":463,"pos_y":57}}}}}"""
println(typeof(cleaned_json_string))
println(typeof(JSON.parse(cleaned_json_string)))


bg, data = convert_drawflow_to_bondgraph(JSON.parse(cleaned_json_string) , verbose=true)

# Plot the BondGraph
plot_bondgraph(bg, filename="test_bondgraph.png", title="Test BondGraph")

# Simulate the BondGraph
sol, relations = simulate_bondgraph(bg, tspan=(0.0, 5.0), verbose=true)

# Print solution details
if sol !== nothing
    println("\n=== SOLUTION DETAILS ===")
    println("Solution type: $(typeof(sol))")
    println("Time points: $(length(sol.t))")
    println("Time range: $(sol.t[1]) to $(sol.t[end])")
    println("State variables: $(length(sol.u[1]))")
    println("First few time points: $(sol.t[1:min(5, length(sol.t))])")
    println("First few state values: $(sol.u[1:min(5, length(sol.u))])")
    println()
    
    # Plot simulation results
    println("Plotting simulation results...")
    plot_simulation(sol, filename="test_simulation.png", title="Test Simulation")
    println("Simulation plot saved as 'test_simulation.png'")
    
    # Save solution as JSON
    println("Saving solution as JSON...")
    save_solution_json(sol, "test_solution.json")
    println("Solution saved as 'test_solution.json'")
else
    println("No solution available for plotting or saving")
end

println("Test completed! Check the generated PNG files.")