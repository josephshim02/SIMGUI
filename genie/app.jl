module App

using GenieFramework
@genietools

@app begin
  @in name = "Genie"
end

function ui()
  [
    
    h1("My First Genie App")
    input("Enter your name", :name)
    p("Hello {{message}}!")
  ]
end

@page("/", ui)
end
