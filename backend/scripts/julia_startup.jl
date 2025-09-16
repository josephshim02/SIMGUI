#Fore some reason if I add Revise to the toml file then my docker is unable to build, but it might work for you
using Pkg
Pkg.add("Revise")
using Revise

Revise.includet("../src/App.jl")
using .App

Revise.includet("../src/DrawflowToBondGraph.jl")
using .DrawflowToBondGraph


