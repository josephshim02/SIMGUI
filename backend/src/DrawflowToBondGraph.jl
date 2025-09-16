module DrawflowToBondGraph

#!/usr/bin/env julia
"""
DrawflowToBondGraph.jl

A Julia module for converting Drawflow JSON files to BondGraph models.
This module provides functionality to parse Drawflow node data and create
corresponding BondGraph components with proper connections.
"""

module DrawflowToBondGraph
using BondGraphs

using Plots
using ModelingToolkit
using JSON

export testing_revise, convert_drawflow_to_bondgraph, simulate_bondgraph, plot_bondgraph, plot_simulation, save_solution_json, set_component_parameter, get_component_parameter

function testing_revise()
  println("hello world")
end

"""
    convert_drawflow_to_bondgraph(json_file::String; verbose::Bool=true)

Convert a Drawflow JSON file to a BondGraph model.

# Arguments
- `json_file::String`: Path to the Drawflow JSON file
- `verbose::Bool`: Whether to print detailed output (default: true)

# Returns
- `bg::BondGraph`: The converted BondGraph model
- `drawflow_data::Dict`: The original JSON data with added component references

# Example
```julia
bg, data = convert_drawflow_to_bondgraph("test.json")
```
"""
function convert_drawflow_to_bondgraph(json_data::Dict{String, Any}; verbose::Bool=true)
    if verbose
        println("=== Drawflow JSON to BondGraph Converter ===")
        println()
    end

    # =============================================================================
    # 1. READ JSON DATA
    # =============================================================================
    if verbose
        println("1. READING JSON DATA")
        println("=" ^ 50)
    end


    drawflow_data = json_data["drawflow"]["Home"]["data"]
    simulation_data = json_data["drawflow"]["simulation"]

    if verbose
        println("Found $(length(drawflow_data)) nodes in the JSON file")
        println()
    end

    # =============================================================================
    # 2. CREATE BONDGRAPH AND COMPONENTS
    # =============================================================================
    if verbose
        println("2. CREATING BONDGRAPH AND COMPONENTS")
        println("=" ^ 50)
    end

    # Create the main BondGraph
    bg = BondGraph("Converted from Drawflow")

    # Component mapping dictionary
    component_map = Dict{String, Any}()

    # Node type to BondGraph component mapping
    function create_component(node_data)
        println(node_data)
        node_id = node_data["id"]
        node_class = node_data["class"]

        if node_class == "f_store"
            component = Component(:I, "I_$node_id")
            component.L = parse(Float64, node_data["data"]["param"])
            println("Successfully set L to $(component.L)")
            return component
        elseif node_class == "e_store"
            component = Component(:C, "C_$node_id")
            component.C = parse(Float64, node_data["data"]["param"])
            println("Successfully set C to $(component.C)")
            return component
        elseif node_class == "ce_store"
            component = Component(:Ce, "Ce_$node_id")
            component.K = parse(Float64, node_data["data"]["param"])
            println("Successfully set K to $(component.K)")
            return component
        elseif node_class == "re"
            component = Component(:R, "R_$node_id")
            component.R = parse(Float64, node_data["data"]["param"])
            println("Successfully set R to $(component.R)")
            return component
        elseif node_class == "rxn"
            component = Component(:Re, "Re_$node_id")
            component.r = parse(Float64, node_data["data"]["param"])
            println("Successfully set r to $(component.r)")
            return component
        elseif node_class == "e_junc"
            return EqualEffort()
        elseif node_class == "f_junc"
            return EqualFlow()
        elseif node_class == "se"
            component = Component(:Se, "Se_$node_id")
            input_function_type = node_data["data"]["input"]["type"]
            
            if input_function_type == "Unit Step Input"
                component.es = t -> 1
            elseif input_function_type == "Sine Wave Input"
                component.es = t -> sin(t)
            elseif input_function_type == "Square Wave Input"
                component.es = t -> square(t)
            else input_function_type == "Sawtooth Wave Input"
                component.es = t -> sawtooth(t)
            end
            return component
        elseif node_class == "sf"
            component = Component(:Sf, "Sf_$node_id")
            input_function_type = node_data["data"]["input"]["type"]
            if input_function_type == "Unit Step Input"
                component.fs = t -> 1
            elseif input_function_type == "Sine Wave Input"
                component.fs = t -> sin(t)
            elseif input_function_type == "Square Wave Input"
                component.fs = t -> square(t)
            else input_function_type == "Sawtooth Wave Input"
                component.fs = t -> sawtooth(t)
            end 
            return component
        else
            if verbose
                println("Warning: Unknown node class '$node_class' for node $node_id")
            end
            return nothing
        end
    end

    # Create components for each node
    if verbose
        println("Creating components...")
    end
    for (node_id, node_data) in drawflow_data
        component = create_component(node_data)
        node_class = node_data["class"]
        if component !== nothing
            # Save component directly into node_data
            node_data["component"] = component
            component_map[node_id] = component
            if verbose
                println("  Node $node_id: $node_class -> $(typeof(component))")
            end
        else
            if verbose
                println("  Node $node_id: $node_class -> SKIPPED")
            end
        end
    end


    # Add all components to the BondGraph
    if verbose
        println("Adding components to BondGraph...")
    end
    for (node_id, component) in component_map
        add_node!(bg, component)
        if verbose
            println("  Added $(typeof(component)) for node $node_id")
        end
    end

    if verbose
        println("BondGraph after adding components: $bg")
        println()
    end

    # =============================================================================
    # 3. CREATE CONNECTIONS
    # =============================================================================
    if verbose
        println("3. CREATING CONNECTIONS")
        println("=" ^ 50)
    end

    # Process each node's connections
    for (node_id, node_data) in drawflow_data
        if !haskey(node_data, "component")
            continue
        end
        
        target_component = node_data["component"]
        
        # Process inputs (other nodes connect to this one)
        if haskey(node_data, "inputs")
            for (input_port, input_data) in node_data["inputs"]
                if haskey(input_data, "connections")
                    for connection in input_data["connections"]
                        source_node_id = connection["node"]
                        
                        # Check if source node has a component
                        if haskey(drawflow_data, source_node_id) && haskey(drawflow_data[source_node_id], "component")
                            source_component = drawflow_data[source_node_id]["component"]
                            
                            try
                                # Simple connection: source -> target
                                connect!(bg, source_component, target_component)
                                if verbose
                                    println("  Connected $source_node_id -> $node_id")
                                end
                            catch e
                                if verbose
                                    println("  Warning: Failed to connect $source_node_id -> $node_id: $e")
                                end
                            end
                        else
                            if verbose
                                println("  Warning: Source node $source_node_id does not have a component")
                            end
                        end
                    end
                end
            end
        end
    end

    if verbose
        println()
        println("BondGraph after connections: $bg")
        println()
    end

    return bg, drawflow_data
end

"""
    simulate_bondgraph(bg::BondGraph; tspan::Tuple=(0.0, 5.0), u0::Vector=Float64[], verbose::Bool=true)

Simulate a BondGraph model.

# Arguments
- `bg::BondGraph`: The BondGraph model to simulate
- `tspan::Tuple`: Time span for simulation (default: (0.0, 5.0))
- `u0::Vector`: Initial conditions (default: ones for all state variables)
- `verbose::Bool`: Whether to print detailed output (default: true)

# Returns
- `sol`: The simulation solution
- `relations`: The constitutive relations

# Example
```julia
sol = simulate_bondgraph(bg)
```
"""
function simulate_bondgraph(bg::BondGraph; simulation_data::Dict=Dict(), verbose::Bool=true)
    if verbose
        println("4. SIMULATING THE BONDGRAPH - oh wait, it's working!!")
        println("=" ^ 50)
    end

    tspan = (0.0, parse(Float64, simulation_data["time"]))
    # u0 = [parse(Float64, val) for val in simulation_data["initial_values"]]

    
    println("Generating constitutive relations...")
    relations = constitutive_relations(bg; sub_defaults=true)
    u0 = ones(length(relations))
    println("Initial conditions: $u0")
    if verbose
        println("Constitutive relations:")
        println(relations)
        println()
    end
    
    try
        if verbose
            println("Running simulation...")
            println("Time span: $tspan")
            println("Initial conditions: $u0")
        end
        
        sol = simulate(bg, tspan; u0)
        
        if verbose
            println("Simulation completed successfully!")
        end
        return sol
    catch e
        if verbose
            println("Could not simulate: $e")
            println("This might be due to the specific bond graph structure or the constitutive relations.")
        end
        return nothing
    end
end

"""
    plot_bondgraph(bg::BondGraph; filename::String="bondgraph.png", title::String="BondGraph", size::Tuple=(800, 600))

Plot a BondGraph model.

# Arguments
- `bg::BondGraph`: The BondGraph model to plot
- `filename::String`: Output filename (default: "bondgraph.png")
- `title::String`: Plot title (default: "BondGraph")
- `size::Tuple`: Plot size (default: (800, 600))

# Returns
- `p`: The plot object

# Example
```julia
plot_bondgraph(bg, filename="my_bondgraph.png", title="My Model")
```
"""
function plot_bondgraph(bg::BondGraph; filename::String="bondgraph.png", title::String="BondGraph", size::Tuple=(800, 600))
    p = plot(bg, title=title, size=size)
    savefig(filename)
    return p
end

"""
    plot_simulation(sol; filename::String="simulation.png", title::String="Simulation", xlabel::String="Time", ylabel::String="State Variables")

Plot simulation results.

# Arguments
- `sol`: The simulation solution
- `filename::String`: Output filename (default: "simulation.png")
- `title::String`: Plot title (default: "Simulation")
- `xlabel::String`: X-axis label (default: "Time")
- `ylabel::String`: Y-axis label (default: "State Variables")

# Returns
- `p`: The plot object

# Example
```julia
plot_simulation(sol, filename="my_simulation.png")
```
"""
function plot_simulation(sol; filename::String="simulation.png", title::String="Simulation", xlabel::String="Time", ylabel::String="State Variables")
    p = plot(sol, title=title, xlabel=xlabel, ylabel=ylabel, linewidth=2)
    savefig(filename)
    return p
end

"""
    save_solution_json(sol, filename::String="solution.json"; include_metadata::Bool=true)

Save simulation solution to a JSON file.

# Arguments
- `sol`: The simulation solution
- `filename::String`: Output filename (default: "solution.json")
- `include_metadata::Bool`: Whether to include solution metadata (default: true)

# Returns
- `filename::String`: The saved filename

# Example
```julia
save_solution_json(sol, "my_solution.json")
```
"""
function save_solution_json(sol, filename::String="solution.json"; include_metadata::Bool=true)
    if sol === nothing
        error("Cannot save null solution")
    end
    
    # Extract solution data in Plotly.js format
    solution_data = Dict()
    
    # Time points
    solution_data["time"] = collect(sol.t)
    
    # Create traces for each state variable (Plotly.js format)
    solution_data["traces"] = []
    
    # Get state variable names
    state_names = string.(sol.u[1])
    
    for i in 1:length(sol.u[1])
        trace = Dict(
            "x" => collect(sol.t),
            "y" => [sol.u[j][i] for j in 1:length(sol.u)],
            "name" => state_names[i],
            "type" => "scatter",
            "mode" => "lines",
            "line" => Dict(
                "width" => 2
            )
        )
        push!(solution_data["traces"], trace)
    end
    
    # Plotly.js layout configuration
    solution_data["layout"] = Dict(
        "title" => Dict(
            "text" => "Bond Graph Simulation Results",
            "x" => 0.5
        ),
        "xaxis" => Dict(
            "title" => "Time",
            "showgrid" => true
        ),
        "yaxis" => Dict(
            "title" => "State Variables",
            "showgrid" => true
        ),
        "hovermode" => "x unified",
        "showlegend" => true
    )
    
    # Metadata
    if include_metadata
        solution_data["metadata"] = Dict( 
            "num_timepoints" => length(sol.t),
            "num_states" => length(sol.u[1]),
            "time_range" => [sol.t[1], sol.t[end]],
            "state_names" => state_names
        )
    end
    
    # Save to JSON
    open(filename, "w") do f
        JSON.print(f, solution_data, 2)  # Pretty print with 2-space indentation
    end

    return JSON.json(solution_data)
end

"""
    set_component_parameter(component_map::Dict, component_name::String, parameter_name::Symbol, new_value::Real)

Set a parameter value for a specific component in the component map.

# Arguments
- `component_map`: Dictionary mapping node IDs to components
- `component_name`: Name of the component (e.g., "I_1", "C_2")
- `parameter_name`: Symbol name of the parameter (e.g., :L, :C)
- `new_value`: New value to set for the parameter

# Returns
- `true` if parameter was found and set, `false` otherwise

# Example
```julia
# Set the inductance L of component I_1 to 5.0
set_component_parameter(component_map, "I_1", :L, 5.0)

# Set the capacitance C of component C_2 to 0.1
set_component_parameter(component_map, "C_2", :C, 0.1)
```
"""
function set_component_parameter(component_map::Dict, component_name::String, parameter_name::Symbol, new_value::Real)
    # Find the component by name
    for (node_id, component) in component_map
        if component.name == component_name
            # Check if the parameter exists
            if haskey(component.variables[:parameters], parameter_name)
                # Set the new value
                component.variables[:parameters][parameter_name] = new_value
                println("Set $parameter_name = $new_value for component $component_name")
                return true
            else
                println("Parameter $parameter_name not found in component $component_name")
                println("Available parameters: ", keys(component.variables[:parameters]))
                return false
            end
        end
    end
    
    println("Component $component_name not found")
    println("Available components: ", [comp.name for comp in values(component_map)])
    return false
end

"""
    get_component_parameter(component_map::Dict, component_name::String, parameter_name::Symbol)

Get a parameter value for a specific component in the component map.

# Arguments
- `component_map`: Dictionary mapping node IDs to components
- `component_name`: Name of the component (e.g., "I_1", "C_2")
- `parameter_name`: Symbol name of the parameter (e.g., :L, :C)

# Returns
- Parameter value if found, `nothing` otherwise
"""
function get_component_parameter(component_map::Dict, component_name::String, parameter_name::Symbol)
    # Find the component by name
    for (node_id, component) in component_map
        if component.name == component_name
            # Check if the parameter exists
            if haskey(component.variables[:parameters], parameter_name)
                return component.variables[:parameters][parameter_name]
            else
                println("Parameter $parameter_name not found in component $component_name")
                return nothing
            end
        end
    end
    
    println("Component $component_name not found")
    return nothing
end

end # module
end