// meta about node: io = [inputs, outputs]；body = 'param' | 'source' | 'none'
const makeMeta = (symbol, io, className, body) =>
  ({ symbol, inputs: io[0], outputs: io[1], className, body });

// preset 7 type of nodes, make those as objects where omit the fields
export const NODE_META = {
  // Parameter-type: 1 in, 1 out, with parameter
  f_store: makeMeta('I',  [1,1], 'f_store', 'param'),
  e_store: makeMeta('C',  [1,1], 'e_store', 'param'),
  ce_store: makeMeta('Ce',  [1,1], 'ce_store', 'param'),
  re:      makeMeta('R',  [1,1], 're',      'param'),
  rxn:      makeMeta('Re',  [1,1], 'rxn',      'param'),

  // Source-type: only 1 out, with source
  se: makeMeta('Se', [0, 1], 'se', 'source'),
  sf: makeMeta('Sf', [0, 1], 'sf', 'source'),

  // Junction-type: 1 in 1 out, no inner form
  f_junc: makeMeta('1', [1, 1], 'f_junc', 'none'),
  e_junc: makeMeta('0', [1, 1], 'e_junc', 'none'),
};
export const domainOptions = [
  {
    name: "Mechanical (Force)",
    f_store: "Mass",
    e_store: "Spring",
    re: "Damper",
    se: "Force",
    sf: "Velocity"
  },
  {
    name: "Mechanical (Torque)",
    f_store: "Moment of Inertia",
    e_store: "Torsional Spring",
    re: "Rotational Damper",
    se: "Torque",
    sf: "Angular Velocity"
  },
  {
    name: "Electrical (Voltage)",
    f_store: "Inductor",
    e_store: "Capacitor",
    re: "Resistor",
    se: "Voltage Source",
    sf: "Current Source"
  },
  {
    name: "Fluid (Pressure/Force)",
    f_store: "Fluid Inertia",
    e_store: "Compliance",
    re: "Fluid Resistance",
    se: "Pressure Source",
    sf: "Flow Source"
  },
  { 
    name: "Chemical (Chemical Potential)",                    
    e_store: "Molar Concentration",  
    ce_store:"Chemical Compound",
    re: "Reaction Resistance",
    rxn: "Chemical Reaction",
    se: "Chemical Potential",
    sf: "Reaction Rate Source"
  },
];

export const baseNodeTypes = [
    { type: "f_store", symbol: "I", defaultLabel: "Inertia" },
    { type: "e_store", symbol: "C", defaultLabel: "Capacitance" },
    { type: "ce_store", symbol: "Ce", defaultLabel: "Chemical Compound" },
    { type: "re", symbol: "R", defaultLabel: "Resistance" },
    { type: "rxn", symbol: "Re", defaultLabel: "Chemical Reaction" },
    { type: "se", symbol: "Se", defaultLabel: "Effort Source" },
    { type: "sf", symbol: "Sf", defaultLabel: "Flow Source" },
    { type: "f_junc", symbol: "1", defaultLabel: "1" },
    { type: "e_junc", symbol: "0", defaultLabel: "0" },
  ];

export const groupedSidebar = [
    { title: 'Elements',  keys: ['f_store', 'e_store', 're', 'rxn'] },
    { title: 'Sources',   keys: ['se', 'sf'] },
    { title: 'Junctions', keys: ['f_junc', 'e_junc'] },
  ];

// wrap of nodes, where each symbol has letter in a circle, have title and inner HTML
export const wrap = (symbol, title, innerp = '', inneri = '') => 
  `
  <div>
    <div class="title-box">
      <span class="node-symbol">${symbol}</span> ${title}
    </div>
    ${innerp ? `<div class="box">${innerp}</div>` : ''}
    ${inneri ? `<div class="box">${inneri}</div>` : ''}
  </div>
  `;

export const ParamField = (nodeCounter) =>
  `
  <p>Param:</p>
  <input type="number"
    id="param-${nodeCounter}"  // give unique id to each param input field
    step="any" df-param placeholder="0.0"
    style="width:80px;padding:2px;margin:2px;border:1px solid #ccc;border-radius:3px;"
    onchange="this.parentNode.parentNode.parentNode.setAttribute('data-param', this.value)">
  `;
export const InitialValueField = (nodeCounter) =>
  `
  <p>Initial Value:</p>
  <input type="number"
    id="initial-${nodeCounter}"  // give unique id to each initial value input field
    step="any" df-initial placeholder="0.0"
    style="width:80px;padding:2px;margin:2px;border:1px solid #ccc;border-radius:3px;"
    onchange="this.parentNode.parentNode.parentNode.setAttribute('data-initial', this.value)">
  `;


export const SourceField = (nodeCounter) =>
  `
  <p>Input Type:</p>
  <select class="styled-select" df-input-type
    id="source-${nodeCounter}" 
    style="width:150px;padding:4px;margin:2px;border:1px solid #ced4da;border-radius:3px;font-size:12px;background:white;"
    onchange="this.parentNode.parentNode.parentNode.setAttribute('data-param', this.selectedOptions[0].getAttribute('param'))">
      <option param="unit-step">Unit Step Input</option>
      <option param="sine-wave">Sine Wave Input</option>
      <option param="square-wave">Square Wave Input</option>
      <option param="sawtooth-wave">Sawtooth Wave Input</option>
  </select>
  `;
