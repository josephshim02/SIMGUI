using BondGraphs

# Create a simple bond graph system
sys = BondGraphs.System()

# Add a resistor and a capacitor
R1 = BondGraphs.R(value=5.0)  # resistor with resistance 5
C1 = BondGraphs.C(value=2.0)  # capacitor with capacitance 2

# Connect the resistor and capacitor
BondGraphs.connect!(R1, C1)

# Print some basic info
println("Elements in the system:")
for e in BondGraphs.elements(sys)
    println(e)
end