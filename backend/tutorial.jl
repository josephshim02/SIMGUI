#!/usr/bin/env julia
"""
BondGraphs.jl Tutorial
Based on: https://jedforrest.github.io/BondGraphs.jl/stable/gettingstarted/#Getting-Started

This tutorial demonstrates how to build and simulate bond graph models using BondGraphs.jl
"""

using BondGraphs
using Plots
using ModelingToolkit

println("=== BondGraphs.jl Tutorial ===")
println("Based on: https://jedforrest.github.io/BondGraphs.jl/stable/gettingstarted/#Getting-Started")
println()

# =============================================================================
# 1. BOND GRAPH CONSTRUCTION
# =============================================================================
println("1. BOND GRAPH CONSTRUCTION")
println("=" ^ 50)

# Create a BondGraph object
println("Creating a BondGraph object...")
model = BondGraph("RC Circuit")
println("Model created: ", model)
println()

# Create a capacitor component
println("Creating components...")
C = Component(:C)
println("Capacitor component: ", C)
println("Capacitor description:")
description(:C)
println()

# Create a resistor component and 0-junction (EqualEffort)
R = Component(:R)
kvl = EqualEffort()
println("Resistor component: ", R)
println("0-junction (EqualEffort): ", kvl)
println()

# Show available component types
println("Available component types in DEFAULT_LIBRARY:")
for (key, value) in BondGraphs.DEFAULT_LIBRARY
    println("  :$key => $value")
    
end
println()

# Add components to the model
println("Adding components to model...")
add_node!(model, [C, R, kvl])
println("Model after adding components: ", model)
println()

# Connect components
println("Connecting components...")
connect!(model, R, kvl)
connect!(model, C, kvl)
println("Model after connections: ", model)
println()

# Show incidence matrix
println("Incidence matrix of the bond graph:")
using Graphs
inc_mat = incidence_matrix(model)
println(inc_mat)
println()

# Visualize the model
println("Plotting the bond graph structure...")
plot(model, title="RC Circuit Bond Graph", size=(600, 400))
savefig("rc_circuit_bondgraph.png")
println("Bond graph saved as 'rc_circuit_bondgraph.png'")
println()

# =============================================================================
# 2. SIMULATING THE MODEL
# =============================================================================
println("2. SIMULATING THE MODEL")
println("=" ^ 50)

# Generate constitutive relations
println("Generating constitutive relations...")
relations = constitutive_relations(model)
println("Constitutive relations:")
println(relations)
println()

# Set component parameter values
println("Setting component parameter values...")
C.C = 1.0  # Capacitance
R.R = 2.0  # Resistance
println("C.C = ", C.C)
println("R.R = ", R.R)
println()

# Show constitutive relations with substituted values
println("Constitutive relations with substituted values:")
relations_sub = constitutive_relations(model; sub_defaults=true)
println(relations_sub)
println()

# Simulate the model
println("Running simulation...")
tspan = (0.0, 10.0)
u0 = [1.0]  # Initial value for C.q(t)
println("Time span: ", tspan)
println("Initial conditions: ", u0)

sol = simulate(model, tspan; u0)
println("Simulation completed!")
println("Solution type: ", typeof(sol))
println()

# Plot the simulation results
println("Plotting simulation results...")
plot(sol, title="RC Circuit Simulation", xlabel="Time", ylabel="Capacitor Charge", 
     label="C.q(t)", linewidth=2)
savefig("rc_circuit_simulation.png")
println("Simulation plot saved as 'rc_circuit_simulation.png'")
println()

# =============================================================================
# 3. ADDING CONTROL VARIABLES
# =============================================================================
println("3. ADDING CONTROL VARIABLES")
println("=" ^ 50)

# Add a current source (Source of Flow)
println("Adding current source...")
Is = Component(:Sf, "Is")
add_node!(model, Is)
connect!(model, Is, kvl)
println("Model with current source: ", model)
println()

# Plot the updated model
println("Plotting updated bond graph...")
plot(model, title="RC Circuit with Current Source", size=(600, 400))
savefig("rc_circuit_with_source.png")
println("Updated bond graph saved as 'rc_circuit_with_source.png'")
println()

# Add a forcing function
println("Adding forcing function...")
Is.fs = t -> sin(2t)
println("Current source function: Is.fs = t -> sin(2t)")
println()

# Show updated constitutive relations
println("Updated constitutive relations with forcing function:")
relations_forced = constitutive_relations(model; sub_defaults=true)
println(relations_forced)
println()

# Simulate with forcing function
println("Running simulation with forcing function...")
sol_forced = simulate(model, tspan; u0)
println("Forced simulation completed!")
println()

# Plot forced simulation
println("Plotting forced simulation results...")
plot(sol_forced, title="RC Circuit with Sinusoidal Input", 
     xlabel="Time", ylabel="Capacitor Charge", 
     label="C.q(t) with sin(2t) input", linewidth=2)
savefig("rc_circuit_forced_simulation.png")
println("Forced simulation plot saved as 'rc_circuit_forced_simulation.png'")
println()

# =============================================================================
# 4. CUSTOM FORCING FUNCTIONS
# =============================================================================
println("4. CUSTOM FORCING FUNCTIONS")
println("=" ^ 50)

# Register a custom symbolic function
println("Registering custom symbolic function...")
@register_symbolic f(t)
Is.fs = t -> f(t)

# Define a custom function (repeating square wave)
f(t) = t % 2 <= 1 ? 0.0 : 1.0
println("Custom function: f(t) = t % 2 <= 1 ? 0 : 1 (repeating square wave)")
println()

# Show constitutive relations with custom function
println("Constitutive relations with custom function:")
relations_custom = constitutive_relations(model; sub_defaults=true)
println(relations_custom)
println()

# Simulate with custom function
println("Running simulation with custom square wave input...")
sol_custom = simulate(model, tspan; u0)
println("Custom simulation completed!")
println()

# Plot custom simulation
println("Plotting custom simulation results...")
plot(sol_custom, title="RC Circuit with Square Wave Input", 
     xlabel="Time", ylabel="Capacitor Charge", 
     label="C.q(t) with square wave input", linewidth=2)
savefig("rc_circuit_custom_simulation.png")
println("Custom simulation plot saved as 'rc_circuit_custom_simulation.png'")
println()

# =============================================================================
# 5. COMPARISON PLOT
# =============================================================================
println("5. COMPARISON PLOT")
println("=" ^ 50)

# Create a comparison plot
println("Creating comparison plot of all simulations...")
p1 = plot(sol, title="No Input", xlabel="Time", ylabel="Charge", label="C.q(t)")
p2 = plot(sol_forced, title="Sinusoidal Input", xlabel="Time", ylabel="Charge", label="C.q(t)")
p3 = plot(sol_custom, title="Square Wave Input", xlabel="Time", ylabel="Charge", label="C.q(t)")

comparison_plot = plot(p1, p2, p3, layout=(1,3), size=(1200, 400))
savefig("rc_circuit_comparison.png")
println("Comparison plot saved as 'rc_circuit_comparison.png'")
println()

# =============================================================================
# 6. SUMMARY
# =============================================================================
println("6. TUTORIAL SUMMARY")
println("=" ^ 50)
println("This tutorial demonstrated:")
println("  ✓ Creating bond graph models")
println("  ✓ Adding components (C, R, 0-junction)")
println("  ✓ Connecting components")
println("  ✓ Visualizing bond graph structure")
println("  ✓ Generating constitutive relations")
println("  ✓ Setting component parameters")
println("  ✓ Running simulations")
println("  ✓ Adding forcing functions")
println("  ✓ Using custom input functions")
println()
println("Generated files:")
println("  - rc_circuit_bondgraph.png")
println("  - rc_circuit_simulation.png")
println("  - rc_circuit_with_source.png")
println("  - rc_circuit_forced_simulation.png")
println("  - rc_circuit_custom_simulation.png")
println("  - rc_circuit_comparison.png")
println()
println("Tutorial completed successfully! 🎉")
