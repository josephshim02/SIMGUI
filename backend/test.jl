#!/usr/bin/env julia
"""
Simple test script using DrawflowToBondGraph module
"""

# Include the module
include("DrawflowToBondGraph.jl")
using .DrawflowToBondGraph

println("=== Testing DrawflowToBondGraph Module ===")
println()

using JSON

json_data = JSON.parsefile("test.json")

println(json_data)

# Convert JSON to BondGraph
bg, data = convert_drawflow_to_bondgraph(json_data, verbose=true)

simulation_data = json_data["drawflow"]["simulation"]

# remove test_bondgraph.png if exists
if isfile("test_bondgraph.png")
    rm("test_bondgraph.png")
end
if isfile("test_simulation.png")
    rm("test_simulation.png")
end
if isfile("test_solution.json")
    rm("test_solution.json")
end


# Plot the BondGraph
plot_bondgraph(bg, filename="test_bondgraph.png", title="Test BondGraph")

# Simulate the BondGraph
sol = simulate_bondgraph(bg, simulation_data=simulation_data, verbose=true) 


# Print solution details
if sol !== nothing
    println("\n=== SOLUTION DETAILS ===")
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