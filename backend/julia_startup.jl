using Pkg
Pkg.activate("/app/")
Pkg.instantiate()

println("startup happened")


using Revise
Revise.includet("src/App.jl")
using .App

Revise.includet("src/DrawflowToBondGraph.jl")
using .DrawflowToBondGraph

Revise.includet("src/Routes.jl")
using .Routes

