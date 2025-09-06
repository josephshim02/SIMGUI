using JSON

function my_function(x)
    # Do some BondGraphs stuff
    #bg = BondGraphs.System()
    # Example result
    return Dict("result" => x^2)
end

# Get argument from Python
x = parse(Int, ARGS[1])
println(JSON.json(my_function(x)))  # Python reads this
