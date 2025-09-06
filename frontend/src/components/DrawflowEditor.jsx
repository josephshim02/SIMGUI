import React, { useEffect, useRef, useState } from 'react';
import Drawflow from 'drawflow';
import 'drawflow/dist/drawflow.min.css';
import './DrawflowEditor.css';
import { checkRules } from './rules';
import ResultSection from './ResultSection';

const DrawflowEditor = () => {
  const drawflowRef = useRef(null);
  const editorRef = useRef(null);
  const [currentModule, setCurrentModule] = useState('Home');
  const [isLocked, setIsLocked] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [currDomain, setCurrDomain] = useState(null);

  useEffect(() => {
    if (drawflowRef.current && !editorRef.current) {
      // Initialize Drawflow
      const editor = new Drawflow(drawflowRef.current);
      editor.reroute = true;
      editorRef.current = editor;

      // Start the editor
      editor.start();

      // Load initial data - clean canvas
      const dataToImport = {
        drawflow: {
          Home: {
            data: {},
          },
          Other: {
            data: {},
          },
        },
      };
      editor.import(dataToImport);

      // Set up event listeners
      setupEventListeners(editor);
    }

    return () => {
      if (editorRef.current) {
        editorRef.current.clear();
      }
    };
  }, []);

  const setupEventListeners = (editor) => {
    editor.on("nodeCreated", (id) => {
      console.log("Node created " + id);
    });

    editor.on("nodeRemoved", (id) => {
      console.log("Node removed " + id);
    });

    editor.on("nodeSelected", (id) => {
      console.log("Node selected " + id);
    });

    editor.on("moduleCreated", (name) => {
      console.log("Module Created " + name);
    });

    editor.on("moduleChanged", (name) => {
      console.log("Module Changed " + name);
    });
    editor.on('connectionCreated', function(connection) {

      // Get the nodes involved in the connection
      const outputNode = editor.getNodeFromId(connection.output_id);
      const inputNode = editor.getNodeFromId(connection.input_id);
      
      console.log(`Attempting to connect ${outputNode.name} to ${inputNode.name}`);

      // Check if connection is allowed using rules.js
      if (checkRules(
                editor,
                outputNode.name, 
                inputNode.name,
                connection.output_id,
                connection.input_id
            ) == false) {

        console.log("Connection not allowed by rules");
        // Remove the invalid connection
        editor.removeSingleConnection(
                connection.output_id,
                connection.input_id, 
                connection.output_class,
                connection.input_class
            );
        
        alert(`Connection from ${outputNode.name} to ${inputNode.name} is not allowed.`);
        // Show feedback to user
        console.log(`Connection blocked: ${outputNode.name} cannot connect to ${inputNode.name}`);
      }
    });

    editor.on("connectionRemoved", (connection) => {
      console.log("Connection removed");
      console.log(connection);
    });

    // editor.on("mouseMove", (position) => {
    //   console.log("Position mouse x:" + position.x + " y:" + position.y);
    // });

    // editor.on("nodeMoved", (id) => {
    //   console.log("Node moved " + id);
    // });

    // editor.on("zoom", (zoom) => {
    //   console.log("Zoom level " + zoom);
    // });

    // editor.on("translate", (position) => {
    //   console.log("Translate x:" + position.x + " y:" + position.y);
    // });

    // editor.on("addReroute", (id) => {
    //   console.log("Reroute added " + id);
    // });

    // editor.on("removeReroute", (id) => {
    //   console.log("Reroute removed " + id);
    // });
  };

  const handleDragStart = (e, nodeType) => {
    e.dataTransfer.setData("node", nodeType);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const nodeType = e.dataTransfer.getData("node");
    const rect = drawflowRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    addNodeToDrawFlow(nodeType, x, y);
  };

  const addNodeToDrawFlow = (name, pos_x, pos_y) => {
    if (!editorRef.current || editorRef.current.editor_mode === "fixed") {
      return false;
    }

    const editor = editorRef.current;
    
    // Calculate position relative to canvas
    pos_x = pos_x * (editor.precanvas.clientWidth / (editor.precanvas.clientWidth * editor.zoom)) -
            editor.precanvas.getBoundingClientRect().x * (editor.precanvas.clientWidth / (editor.precanvas.clientWidth * editor.zoom));
    pos_y = pos_y * (editor.precanvas.clientHeight / (editor.precanvas.clientHeight * editor.zoom)) -
            editor.precanvas.getBoundingClientRect().y * (editor.precanvas.clientHeight / (editor.precanvas.clientHeight * editor.zoom));

    switch (name) {
      case "f_store": {
        const fStore = `
          <div>
            <div class="title-box">
              <span class="node-symbol">I</span> Inertia 
            </div>
            <div class="box">
            <p>Param:</p>
            <input type="number" 
                   step="any" 
                   df-param 
                   placeholder="0.0"
                   style="width: 80px; padding: 2px; margin: 2px; border: 1px solid #ccc; border-radius: 3px;"
                   onchange="this.parentNode.parentNode.parentNode.setAttribute('data-param', this.param)">
            </div>
          </div>
        `;
        editor.addNode("f_store", 1, 1, pos_x, pos_y, "f_store", {}, fStore);
        break;
      }

      case "e_store": {
        const eStore = `
          <div>
            <div class="title-box">
              <span class="node-symbol">C</span> Capacitance
            </div>
            <div class="box">
            <p>Param:</p>
            <input type="number" 
                   step="any" 
                   df-param 
                   placeholder="0.0"
                   style="width: 80px; padding: 2px; margin: 2px; border: 1px solid #ccc; border-radius: 3px;"
                   onchange="this.parentNode.parentNode.parentNode.setAttribute('data-param', this.param)">
            </div>
          </div>
        `;
        editor.addNode("e_store", 1, 1, pos_x, pos_y, "e_store", {}, eStore);
        break;
      }

      case "re": {
        const re = `
          <div>
            <div class="title-box">
              <span class="node-symbol">R</span> Resistance
            </div>
            <div class="box">
            <p>Param:</p>
            <input type="number" 
                   step="any" 
                   df-param 
                   placeholder="0.0"
                   style="width: 80px; padding: 2px; margin: 2px; border: 1px solid #ccc; border-radius: 3px;"
                   onchange="this.parentNode.parentNode.parentNode.setAttribute('data-param', this.param)">
            </div>
          </div>
        `;
        editor.addNode("re", 1, 1, pos_x, pos_y, "re", {}, re);
        break;
      }

      case "se": {
        const se = `
          <div>
            <div class="title-box">
              <span class="node-symbol">Se</span> SE
            </div>
            <div class="box">
            <p>Input Type:</p>
            <select df-input-type 
                    style="width: 150px; padding: 4px; margin: 2px; border: 1px solid #ced4da; border-radius: 3px; font-size: 12px; background: white;"
                    onchange="this.parentNode.parentNode.parentNode.setAttribute('data-param', this.param)">
              <option param="unit-step">Unit Step Input</option>
              <option param="sinusoidal">Sinusoidal Input</option>
              <option param="square-wave">Square Wave Input</option>
              <option param="impulse">Impulse Input</option>
            </select>
          </div>
          </div>
        `;
        editor.addNode("se", 0, 1, pos_x, pos_y, "se", {}, se);
        break;
      }

      case "sf": {
        const sf = `
          <div>
            <div class="title-box">
              <span class="node-symbol">Sf</span> SF
            </div>
            <div class="box">
            <p>Input Type:</p>
            <select df-input-type 
                    style="width: 150px; padding: 4px; margin: 2px; border: 1px solid #ced4da; border-radius: 3px; font-size: 12px; background: white;"
                    onchange="this.parentNode.parentNode.parentNode.setAttribute('data-param', this.param)">
              <option param="unit-step">Unit Step Input</option>
              <option param="sinusoidal">Sinusoidal Input</option>
              <option param="square-wave">Square Wave Input</option>
              <option param="impulse">Impulse Input</option>
            </select>
          </div>
          </div>
        `;
        editor.addNode("sf", 0, 1, pos_x, pos_y, "sf", {}, sf);
        break;
      }

      case "f_junc": {
        const fJunc = `
          <div>
            <div class="title-box">
              <span class="node-symbol">1</span>1
            </div>
          </div>
        `;
        editor.addNode("f_junc", 1, 1, pos_x, pos_y, "f_junc", {}, fJunc);
        break;
      }

      case "e_junc": {
        const eJunc = `
          <div>
            <div class="title-box">
              <span class="node-symbol">0</span>0 
            </div>
          </div>
        `;
        editor.addNode("e_junc", 1, 1, pos_x, pos_y, "e_junc", {}, eJunc);
        break;
      }

      default:
        break;
    }
  };

  const handleExport = () => {
    if (editorRef.current) {
      const data = editorRef.current.export();
      console.log('Export data:', data);
      
      // Create a blob with the JSON data
      const jsonString = JSON.stringify(data, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json' });
      
      // Create a download link
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `drawflow-export-${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.json`;
      
      // Trigger the download
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Clean up the URL object
      URL.revokeObjectURL(url);
      
      alert('Drawflow data exported and downloaded as JSON file!');
    }
  };

  const handleClear = () => {
    if (editorRef.current) {
      editorRef.current.clearModuleSelected();
    }
  };

  const handleModuleChange = (moduleName) => {
    if (editorRef.current) {
      editorRef.current.changeModule(moduleName);
      setCurrentModule(moduleName);
    }
  };

  const handleLockToggle = () => {
    if (editorRef.current) {
      if (isLocked) {
        editorRef.current.editor_mode = 'edit';
      } else {
        editorRef.current.editor_mode = 'fixed';
      }
      setIsLocked(!isLocked);
    }
  };

  const handleZoomIn = () => {
    if (editorRef.current) {
      editorRef.current.zoom_in();
    }
  };

  const handleZoomOut = () => {
    if (editorRef.current) {
      editorRef.current.zoom_out();
    }
  };

  const handleZoomReset = () => {
    if (editorRef.current) {
      editorRef.current.zoom_reset();
    }
  };


const domainOptions = [
  { 
    name: "Mechanical (Translational)", 
    f_store: "Mass",                 
    e_store: "Spring",                 
    re: "Damper",
    se: "Force",               
    sf: "Velocity" 
  },
  { 
    name: "Mechanical (Rotational)",    
    f_store: "Moment of Inertia",    
    e_store: "Torsional Spring",       
    re: "Rotational Damper",
    se: "Torque",              
    sf: "Angular Velocity" 
  },
  { 
    name: "Electrical",                  
    f_store: "Inductor",             
    e_store: "Capacitor",              
    re: "Resistor",
    se: "Voltage Source",      
    sf: "Current Source" 
  },
  { 
    name: "Fluid",                       
    f_store: "Fluid Inertia",        
    e_store: "Compliance",             
    re: "Fluid Resistance",
    se: "Pressure Source",     
    sf: "Flow Source" 
  },
  { 
    name: "Chemical",                    
    e_store: "Species Concentration",  
    re: "Reaction Resistance",
    se: "Chemical Potential Source", 
    sf: "Reaction Rate Source" 
  },
];

  const baseNodeTypes = [
    { type: "f_store", symbol: "I", defaultLabel: "Inertia" },
    { type: "e_store", symbol: "C", defaultLabel: "Capacitance" },
    { type: "re", symbol: "R", defaultLabel: "Resistance" },
    { type: "se", symbol: "Se", defaultLabel: "SE" },
    { type: "sf", symbol: "Sf", defaultLabel: "SF" },
    { type: "f_junc", symbol: "1", defaultLabel: "1" },
    { type: "e_junc", symbol: "0", defaultLabel: "0" },
  ];

  const getLabel = (type) => {
    if (!currDomain) {
      return baseNodeTypes.find(n => n.type === type)?.defaultLabel ?? type;
    }
    
    return currDomain[type]
      ?? baseNodeTypes.find(n => n.type === type)?.defaultLabel
      ?? type;
  };


  return (
    <div className="drawflow-app">
      <header>
        <h2>Drawflow</h2>

        <select
        value={currDomain?.name ?? ""}
        onChange={(e) => {
          const d = domainOptions.find(x => x.name === e.target.value);
          setCurrDomain(d ?? null);
        }}
        style={{ marginLeft: 12 }}
        >
          <option value="">-- Select Domain --</option>
          {domainOptions.map(d => (
            <option key={d.name} value={d.name}>{d.name}</option>
          ))}
        </select>
      </header>
      
      <div className="wrapper">
        <div className="col">
          {baseNodeTypes.map((node) => (
            <div
              key={node.type}
              className="drag-drawflow"
              draggable="true"
              onDragStart={(e) => handleDragStart(e, node.type)}
            >
              <span className="node-symbol">{node.symbol}</span>
              <span> {getLabel(node.type)}</span>
            </div>
          ))}
        </div>
        
        <div className={`col-right ${isVisible ? 'with-result' : ''}`}>
          <div className="menu">
            <ul>
              <li onClick={handleExport}>
                Export
              </li>
              <li onClick={handleClear}>
                Clear
              </li>
            </ul>
          </div>
          
          <div
            id="drawflow"
            ref={drawflowRef}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
          >
            <div className="btn-lock" onClick={handleLockToggle}>
              <i className={`fas ${isLocked ? 'fa-lock-open' : 'fa-lock'}`}></i>
            </div>
            <div className="bar-zoom">
              <i className="fas fa-search-minus" onClick={handleZoomOut}></i>
              <i className="fas fa-search" onClick={handleZoomReset}></i>
              <i className="fas fa-search-plus" onClick={handleZoomIn}></i>
            </div>
          </div>
        </div>
        <ResultSection setIsVisible={setIsVisible} isVisible={isVisible} />
      </div>
    </div>
  );
};

export default DrawflowEditor;
