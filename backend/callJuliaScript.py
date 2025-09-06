from juliacall import Main as jl

jl.eval("""


using BondGraphs

sys = BondGraphs.System()

R1 = BondGraphs.R(value=5.0)  # resistor with resistance 5
C1 = BondGraphs.C(value=2.0)  # capacitor with capacitance 2

BondGraphs.connect!(R1, C1)

println("Elements in the system:")
for e in BondGraphs.elements(sys)
    println(e)
end

""")

elements = jl.elements
print("Elements in the system:", elements)