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

    const api = {
      exportJSON: () => editorRef.current?.export(),
      clear: () => editorRef.current?.clearModuleSelected(),
      changeModule:  (m) => editorRef.current?.changeModule(m),
      setLocked:  (b) => { if (editorRef.current) editorRef.current.editor_mode = b ? 'fixed' : 'edit'; },
      zoomIn:     () => editorRef.current?.zoom_in(),
      zoomOut:    () => editorRef.current?.zoom_out(),
      zoomReset:  () => editorRef.current?.zoom_reset(),
      addNodeAt:  (t,x,y) => addNodeToDrawFlow(t,x,y),
    }

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

    
    // format of origin addNode: editor.addNode(name, inputs, outputs, posx, posy, class, data, html);

    // meta about node: io = [inputs, outputs]；body = 'param' | 'source' | 'none'
    const makeMeta = (symbol, io, className, body) =>
      ({ symbol, inputs: io[0], outputs: io[1], className, body });

    // preset 7 type of nodes, make those as objects where omit the fields
    const NODE_META = {
      // Parameter-type: 1 in, 1 out, with parameter
      f_store: makeMeta('I',  [1,1], 'f_store', 'param'),
      e_store: makeMeta('C',  [1,1], 'e_store', 'param'),
      re:      makeMeta('R',  [1,1], 're',      'param'),

      // Source-type: only 1 out, with source
      se:      makeMeta('Se', [0,1], 'se',      'source'),
      sf:      makeMeta('Sf', [0,1], 'sf',      'source'),

      // Junction-type: 1 in 1 out, no inner form
      f_junc:  makeMeta('1',  [1,1], 'f_junc',  'none'),
      e_junc:  makeMeta('0',  [1,1], 'e_junc',  'none'),
    };

    // wrap of nodes, where each symbol has letter in a circle, have title and inner HTML
    const wrap = (symbol, title, inner = '') => `
      <div>
        <div class="title-box">
          <span class="node-symbol">${symbol}</span> ${title}
        </div>
        ${inner ? `<div class="box">${inner}</div>` : ''}
      </div>
    `;

    const ParamField = 
    `<p>Param:</p>
    <input type="number"
      step="any" df-param placeholder="0.0"
      style="width:80px;padding:2px;margin:2px;border:1px solid #ccc;border-radius:3px;"
      onchange="this.parentNode.parentNode.parentNode.setAttribute('data-param', this.value)">
    `;

    const SourceField =
    `<p>Input Type:</p>
    <select df-input-type
      style="width:150px;padding:4px;margin:2px;border:1px solid #ced4da;border-radius:3px;font-size:12px;background:white;"
      onchange="this.parentNode.parentNode.parentNode.setAttribute('data-param', this.selectedOptions[0].getAttribute('param'))">
        <option param="unit-step">Unit Step Input</option>
        <option param="sinusoidal">Sinusoidal Input</option>
        <option param="square-wave">Square Wave Input</option>
        <option param="impulse">Impulse Input</option>
    </select>
    `;

    // render inner HTML using meta data
    const renderNodeHTML = (name, meta, getLabel) => {
      const inner = meta.body === 'param'  ? ParamField
                  : meta.body === 'source' ? SourceField
                  : '';
      return wrap(meta.symbol, getLabel(name), inner);
    };

    const m = NODE_META[name];
    if (m) {
      const html = renderNodeHTML(name, m, getLabel);
      editor.addNode(name, m.inputs, m.outputs, pos_x, pos_y, m.className, {}, html);
      return;
    } else {
      console.warn('Unknown node type:', name);
      return;
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

  // event listeners for debug usage
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

    editor.on('connectionCreated', (connection) => {

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

    editor.on("mouseMove", (position) => {
      console.log("Position mouse x:" + position.x + " y:" + position.y);
    });

    editor.on("nodeMoved", (id) => {
      console.log("Node moved " + id);
    });

    editor.on("zoom", (zoom) => {
      console.log("Zoom level " + zoom);
    });

    editor.on("translate", (position) => {
      console.log("Translate x:" + position.x + " y:" + position.y);
    });

    editor.on("addReroute", (id) => {
      console.log("Reroute added " + id);
    });

    editor.on("removeReroute", (id) => {
      console.log("Reroute removed " + id);
    });
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
              <li onClick={handleExport}>Export</li>
              <li onClick={api.clear}>Clear</li>
            </ul>
          </div>
          
          <div
            id="drawflow"
            ref={drawflowRef}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
          >
            <div className="btn-lock" onClick={api.setLocked}>
              <i className={`fas ${isLocked ? 'fa-lock-open' : 'fa-lock'}`}></i>
            </div>
            <div className="bar-zoom">
              <i className="fas fa-search-minus" onClick={api.zoomOut}></i>
              <i className="fas fa-search" onClick={api.zoomReset}></i>
              <i className="fas fa-search-plus" onClick={api.zoomIn}></i>
            </div>
          </div>
        </div>
        <ResultSection setIsVisible={setIsVisible} isVisible={isVisible} />
      </div>
    </div>
  );
};

export default DrawflowEditor;
