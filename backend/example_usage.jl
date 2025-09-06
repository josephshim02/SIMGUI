#!/usr/bin/env julia
"""
Example usage of DrawflowToBondGraph module
"""

# Include the module
include("DrawflowToBondGraph.jl")
using .DrawflowToBondGraph

println("=== DrawflowToBondGraph Module Example ===")
println()

# Convert JSON to BondGraph
println("Converting test.json to BondGraph...")
bg, data = convert_drawflow_to_bondgraph("test.json", verbose=true)

# Plot the BondGraph
println("Plotting BondGraph...")
plot_bondgraph(bg, filename="example_bondgraph.png", title="Example BondGraph")

# Simulate the BondGraph
println("Simulating BondGraph...")
sol, relations = simulate_bondgraph(bg, tspan=(0.0, 10.0), verbose=true)

# Plot simulation results if successful
if sol !== nothing
    println("Plotting simulation results...")
    plot_simulation(sol, filename="example_simulation.png", title="Example Simulation")
end

println("Example completed! Check the generated PNG files.")
