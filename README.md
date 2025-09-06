# SIMGUI

### **Modeling and Simulation GUI: Core Components**

This document outlines the fundamental components and concepts for building a system dynamics model within our GUI, which is rooted in the principles of physics (Hamiltonian mechanics) and the bond graphs formalism. Get ready for a bit of abstraction since we model systems for arbitrary domains. The key point is that energy unifies these domains and can be converted from one form to another. 

#### **The Foundation: Power Bonds, Effort, and Flow**

*NB: Read this section if you want some background context to the framework. Skip to get straight to the component definitions.* 

In our system, there are two physical variables called **effort** and **flow** whose integrals define the concepts of **generalised position** and **generalised momenta** as defined in Hamiltonian mechanics. For the moment being, just treat the system as a particle with mass $m$ moving with a position $q$ and a momentum $p = mv$ where the velocity of the particle is $v$. The position can be thought of as the "state" of the object that we track through the dynamics governed by: $\frac{dq}{dt} = f(q,t)$. The exact details of $f(q,t)$ don't matter too much here, but the key point is that if we formulate the system dynamics through the Hamiltonian mechanics: 
$$ \frac{dq}{dt}= \frac{\partial H}{\partial p}$$
$$ \frac{dp}{dt} = - \frac{\partial H}{\partial q}$$

Then we just need to define the Hamiltonian function $H(q,p)$ and the evolution of the system is completely defined. The most trivial Hamiltonian we can define is: 
$$ H(q,p) = \frac{p^2}{2m}$$

The key to the network diagram that we draw is to ensure that a well-defined Hamiltonian respects the laws of energy conservation and can only be dissipated (port-Hamiltonain). Hence our tooling provides simulation of physical systems (applicable to engineering, chemistry and biology). 

* **Effort ($e$):** This is the variable that represents potential energy. It is a relative difference. Examples include:
    * Mechanical Systems: Force (Gravitational Potential Energy)
    * Electrical Systems: Voltage (Electrical Potential Energy)
    * Fluid Systems: Pressure 
    * Chemical Systems: Gibbs Free Energy (Chemical Potential Energy)
* **Flow ($f$):** This is the variable that represents the change in the "position" and corresponds to a generalised velocity. Examples include:
    * Mechanical Systems: Velocity (change in position)
    * Electrical Systems: Current (change in charge)
    * Fluid Systems: Volumetric Flow Rate (change in volume)
    * Chemical Systems: Molar Flow Rate (change in concentration)

A **power bond** is the graphical link between components. It signifies the transfer of power ($P = e \cdot f$) between them. 

### **Fundamental GUI Components**

The drag-and-drop elements in the GUI are based on the standard bond graph elements. These components are categorised by their function in energy storage, dissipation, and distribution.

#### **1. Energy Storage Elements**

These components model the storage of energy within the system. You can think of storage as integration ("as you store things you just accumulate and add it up"). 

The **generalised position** ($q$) is defined by the integral of flow $(f)$.
$$ q(t) = \int f(t)dt $$

The **generalised momentum** ($p$) is defined by the integral of the effort $(e)$. 
$$ p(t) = \int e(t)dt$$ 


| Domain | Generalised Position | Generalised Momentum | 
|:------:|:-------------------:|:-------------------:| 
| **Mechanical (Translational)** | Displacement ($x$) | Linear Momentum ($p$) | 
| **Mechanical (Rotational)** | Angle ($\theta$) | Angular Momentum ($L$) |
| **Electrical** | Charge ($q$) | Magnetic Flux Linkage ($\lambda$) |
| **Fluid** | Volume ($V$) | Fluid momentum ($\rho$) | 
| **Chemical** | Concentration ($c$) | not applicable |

Hence there are only two kinds of energy storage components: the **capacitance element** (representing generalised position) and the **inertia element** (representing generalised momentum). 

I think users should be able to select the energy storage element and then choose a domain, so then it is a lot clearer to the user (who is specialised to a domain) on what system they are modelling. 

| Icon | Name | Description | Example Analogy |
| :--: | :--- | :---------- | :------------- |
| **I** | **Inertia** | Stores **kinetic energy** | Mass (mechanical), Inductor (electrical) |
| **C** | **Capacitance** | Stores **potential energy** | Spring (mechanical), Capacitor (electrical), Species Concentration (chemical)|

Rules:
- **C** (capacitance) can be connected to everything except **Se** (effort source)
- **I** (inertia) can be connected to everything except **Sf** (flow source)

#### **2. Energy Dissipative Elements**

These components model the irreversible loss of energy from the system. 

| Icon | Name | Description | Example Analogy |
| :--: | :--- | :---------- | :------------- |
| **R** | **Resistance** | **Dissipates energy** as heat or friction or the generation of entropy | Damper (mechanical), Resistor (electrical), Reaction (chemical) |


The constitutive relationship for a Resistance element is a functional relationship between the effort and the flow. For the simplest and most common case, this relationship is a linear one, representing a viscous damping force. 

For a linear resistance (aka. Ohm's Law) we have: 

$$ e = R\cdot f$$

For a nonlinear resistance we have: 

$$ e = \phi(f)$$

- We can either provide some options for nonlinear resistive components or allow user to define their own function. 

Some common nonlinear resistances include: 
- **Diode** which is parametrised by: ($I_s, V_T, n$) would be given by the equation $I = I_s\cdot (e^{\frac{V}{nV_T}}-1)$

An enzyme catalysed reaction using a single enzyme-substrate complex is:
- **Michaelis-Menten Reaction** which is parametrised by ($V_{max}, K_M$) would be given by the equation $v=\frac{V_{max}\cdot e^{\frac{\mu_s - \mu_s^{\circ}}{RT}}}{K_M + e^{\frac{\mu_s - \mu_s^{\circ}}{RT}}}$ and $\mu_s^{\circ}, R, T$ are physical constants. 


The key part for modelling chemical reaction kinetics is this component library. Every single reaction catalysed by a slightly different mechanism would be it's own reaction component. This is the main part that is extensible. 



#### **3. Energy Source Elements**

These components act as external sources that inject power into the system.

| Icon | Name | Description | Example Analogy |
| :--: | :--- | :---------- | :------------- |
| **Se** | **Effort Source** | Imposes an **effort** that is independent of the flow. | Constant Force (mechanical), Battery (electrical) |
| **Sf** | **Flow Source** | Imposes a **flow** that is independent of the effort. | Constant Velocity (mechanical), Current Source (electrical) |

These components are not crucial since it is possible to just initialise the system with this source. 

Rules: 
- **Se** (effort source) can be connected to everything except **1** (1-junction) and **I** (inertia)
- **Sf** (flow source) can be connected to everything except **0** (0-junction) and **C** (capacitance)


#### **4. Power Junctions**

These are the most crucial elements for connecting components and modeling the network structure. They do not store or dissipate energy but rather distribute it according to conservation laws. In other words, the power junctions enforce the laws of physics. 

| Icon | Name | Description | Example Analogy |
| :--: | :--- | :---------- | :------------- |
| **0** | **0-Junction** | A common effort junction. All connected bonds have the **same effort**, and the sum of all flows is zero. | Parallel Electrical Circuit, Common Pressure Node (fluid), Conservation of Mass (chemical) |
| **1** | **1-Junction** | A common flow junction. All connected bonds have the **same flow**, and the sum of all efforts is zero. | Series Electrical Circuit, Common Velocity (mechanical) |

Rules:
- A **0** (0-junction) can be connected to every component except a **Sf** (flow source). 
- A **1** (1-junction) can be connected to every component except a **Se** (effort source). 

#### **5. Transducer Elements**

These elements are used to model the transformation of power between different physical domains while conserving power. This is an essential component for modelling systems from multiple domains i.e. electrochemical systems (fuel cell). 

| Icon | Name | Description | Example Analogy |
| :--: | :--- | :---------- | :------------- |
| **TF** | **Transformer** | Transforms effort and flow, relating them by a fixed modulus. Power is conserved. Used for modeling non-reciprocal relationships. | Lever, Gear, Ideal Transformer |
| **GY** | **Gyrator** | Transforms effort to flow and flow to effort. Used for modeling reciprocal relationships. | Electric Motor, Gyroscope |

A **transformer** element models a physical component that converts power from one domain to another while maintaining a proportional relationship between efforts and flows. 

$$ e_1 = n\cdot e_2$$
$$ f_1 = \frac{1}{n}\cdot f_2$$

A gearbox connects a high-speed, low-torque input shaft to a low-speed, high-torque output shaft. The gear ratio is the modulus $n$. The effort torque ($\tau$) is being converted. 

A **gyrator** element models a physical component that converts power from one domain to another by cross-coupling efforts and flows. 
$$ e_1 = r \cdot f_2$$
$$ e_2 = r\cdot f_1$$

An electric motor converts electrical power into mechanical rotational power. The effort torque ($\tau$) produced by the motor is proportional to the current ($I$) flowing through the motor i.e. $\tau = K_t\cdot I$ where $K_t$ is called the motor's gyrator ratio (torque constant). Bigger $K_t$ = more powerful motor. 

<!-- 
#### **6. Modulated Sources**




#### **7. Signal Lines**

Signal lines are not power bonds; they are unidirectional connections that represent the flow of information without the transfer of power. They are the graphical representation of a system's sensors.

A signal line extracts the instantaneous value of an effort or a flow from a power bond and transmits that value to another component.

**Flow Signal**: A signal line can be drawn from a power bond to extract the flow variable. This models a sensor like a tachometer measuring velocity.

**Effort Signal**: A signal line can be drawn from a power bond to extract the effort variable. This models a sensor like a pressure transducer measuring pressure.

Example: A Position Sensor on a Pendulum (Mechanical Rotational System)

Interpretation: To stabilize a pendulum, you need to know its current angular position (θ). A position sensor (like a potentiometer) measures this angle. -->





### **Modeling Workflow**

1.  **Drag and Drop:** User can select and place the appropriate components from the palette onto the canvas.
2.  **Connect:** User clicks and drags to create power bonds between components and junctions.
3.  **Configure:** Click on a component to open its properties panel, where you can set parameters such as Inertia values, Capacitance constants, and Resistance values.
4.  **Simulate:** Use the simulation control panel to run the model and observe the behavior of your system.


### Some Examples


#### Undamped Pendulum Model 

A simple pendulum can be modeled as a rotational mechanical system: 

- Inertia (I): The mass of the pendulum bob. This element stores kinetic energy related to the pendulum's angular velocity ($\omega$).

- Capacitance (C): The gravitational potential energy of the bob. This acts like a spring, storing potential energy that depends on the pendulum's angular position (θ).

- 1-Junction: These two components are in a "series" mechanical connection, as they share the same angular velocity. The 1-Junction is used to connect them.


The (undamped) pendulum model would be a 1-junction with an I element and C element connected to it. 

#### Damped Pendulum Model 

For a damped pendulum model, the resistance element models the friction that dissipates energy. In this case, the damping force is typically proportional to the velocity. Since this damping force is an effort that opposes the motion, the resistance element is connected to the same 1-Junction as the Inertia and Capacitance elements. The presence of the Resistance (R) element in this model indicates that the system is dissipative, meaning the total energy of the system will decrease over time. This is a key distinction from an ideal, conservative system.

#### Controlled Pendulum Model 

TODO