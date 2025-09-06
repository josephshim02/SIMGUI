module App

using GenieFramework
using BondGraphs
using Plots
using Catalyst

@genietools

@app begin
  @in name = "Genie"
end

function ui()
  newfilename = bondfunction()
  [

    h1("My First Genie App")
    input("Enter your name", :name)
    p("BondGraph elements: $(newfilename)")
    HTML("<img src='image/$newfilename' />")
  ]
end

function bondfunction()

  
  abc = @reaction_network ABC begin
    1, A + B --> C
  end

  bg_abc = BondGraph(abc)
  plt = Plots.plot(bg_abc)
  Plots.savefig(plt, "public/image/bondgraph.png")  # saves in current working directory

  return "bondgraph.png"
end

@page("/", ui)
end 
