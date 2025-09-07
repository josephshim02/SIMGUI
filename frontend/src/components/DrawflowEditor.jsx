import React, { useEffect, useRef, useState } from "react";
import Drawflow from "drawflow";
import "drawflow/dist/drawflow.min.css";
import "./DrawflowEditor.css";
import { checkRules } from "./rules";
import ResultSection from "./ResultSection";
import ConnectionRulesPopup from './ConnectionRulesPopup';


// meta about node: io = [inputs, outputs]；body = 'param' | 'source' | 'none'
const makeMeta = (symbol, io, className, body) =>
  ({ symbol, inputs: io[0], outputs: io[1], className, body });

// preset 7 type of nodes, make those as objects where omit the fields
const NODE_META = {
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


//counts number of nodes so we can give the input/select parameter fields of each node
// a unique id corresponding to the node id

function cleanDrawflowData(drawflowData) {
  const drawFlowDict = JSON.parse(JSON.stringify(drawflowData));
  const usefulData = drawFlowDict.drawflow.Home.data;
  for (const node_id in usefulData) {
    delete usefulData[node_id].html;
    const meta = NODE_META[usefulData[node_id].name];
    let param_dict = {};
    if (meta.body === 'param') {
      const element = document.getElementById(`param-${node_id}`);
      param_dict['parameters'] = element.value;
    } else if (meta.body === 'source') {
      const element = document.getElementById(`source-${node_id}`);
      param_dict['source'] = element.value;
    }
    usefulData[node_id].params = param_dict;
    console.log('param_dict:', param_dict);
    // const param = meta.body === 'param'  ? document.getElementById(`param-${node_id}`)
    //               : meta.body === 'source' ? document.getElementById(`source-${node_id}`);

    // console.log('param:', param.value);
  }
  drawFlowDict.drawflow.Home.data = usefulData;
  return drawFlowDict;
}

const DrawflowEditor = () => {
  const drawflowRef = useRef(null);
  const editorRef = useRef(null);
  const [data, setData] = useState(null);
  const [isLocked, setIsLocked] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [currDomain, setCurrDomain] = useState(null);
  const hideTimerRef = useRef(null);
  const clearConfirmUntilRef = useRef(0);
  const [banner, setBanner] = useState({
    visible: false,
    message: '',
    type: 'info',   // 'success' | 'error' | 'warning' | 'info'
  });
  //For pop submit window
  const [isModalOpen, setIsModalOpen] = useState(false);
  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);
  let [nodeCounter, setNodeCounter] = useState(1);
  
  const checkNodeParams = () => {
    const data = editorRef.current.export();
    const usefulData = data.drawflow.Home.data;
    for (const node_id in usefulData) {
      if (usefulData[node_id].name == 'e_store' || usefulData[node_id].name == 'ce_store') {
        const element = document.getElementById(`initial-${node_id}`);
        console.log(element, node_id);
        if (!element?.value) {
          notify(`Please fill in the Initial Value for ${usefulData[node_id].name}`, "error");
          return 0;
        }
      }
    }
    openModal();
    return 1;
  }

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

  const notify = (message, type = 'info', duration = 3000) => {
    if (hideTimerRef.current) {
      clearTimeout(hideTimerRef.current);
      hideTimerRef.current = null;
    }
    setBanner({ visible: true, message, type });
    hideTimerRef.current = setTimeout(() => {
      setBanner(prev => ({ ...prev, visible: false }));
      hideTimerRef.current = null;
    }, duration);
  };

  const closeBanner = () => {
    if (hideTimerRef.current) {
      clearTimeout(hideTimerRef.current);
      hideTimerRef.current = null;
    }
    setBanner(prev => ({ ...prev, visible: false }));
  };

  const drawflowAPI = {
    exportJSON: () => editorRef.current?.export(),
    clear: () => editorRef.current?.clearModuleSelected(),
    changeModule: (m) => editorRef.current?.changeModule(m),
    setLockedMode: locked =>
      editorRef.current && (editorRef.current.editor_mode = locked ? 'fixed' : 'edit'),
    zoomIn: () => editorRef.current?.zoom_in(),
    zoomOut: () => editorRef.current?.zoom_out(),
    zoomReset: () => editorRef.current?.zoom_reset(),
    addNodeAt: (t, x, y) => addNodeToDrawFlow(t, x, y),
    currentModule: () => editorRef.current?.module,
    setNodeTitle: (id, symbol, label) => {
      const editor = editorRef.current;
      if (!editor) return;
      const titleEl = editor.precanvas.querySelector(`#node-${id} .title-box`);
      if (titleEl) titleEl.innerHTML = `<span class="node-symbol">${symbol}</span> ${label}`;
    },

  }



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

  // wrap of nodes, where each symbol has letter in a circle, have title and inner HTML
  const wrap = (symbol, title, innerp = '', inneri = '') => `
      <div>
        <div class="title-box">
          <span class="node-symbol">${symbol}</span> ${title}
        </div>
        ${innerp ? `<div class="box">${innerp}</div>` : ''}
        ${inneri ? `<div class="box">${inneri}</div>` : ''}
      </div>
    `;

  const ParamField =
    `<p>Param:</p>
    <input type="number"
      id="param-${nodeCounter}"  // give unique id to each param input field
      step="any" df-param placeholder="0.0"
      style="width:80px;padding:2px;margin:2px;border:1px solid #ccc;border-radius:3px;"
      onchange="this.parentNode.parentNode.parentNode.setAttribute('data-param', this.value)">
    `;

  const InitialValueField =
    `<p>Initial Value:</p>
    <input type="number"
      id="initial-${nodeCounter}"  // give unique id to each initial value input field
      step="any" df-initial placeholder="0.0"
      style="width:80px;padding:2px;margin:2px;border:1px solid #ccc;border-radius:3px;"
      onchange="this.parentNode.parentNode.parentNode.setAttribute('data-initial', this.value)">
    `;


  const SourceField =
    `<p>Input Type:</p>
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
  setNodeCounter(prev => prev + 1);

    // render inner HTML using meta data
    const renderNodeHTML = (name, meta, getLabel) => {
      console.log(meta.className === "e_store");
      const innerp = meta.body === 'param' ? ParamField
        : meta.body === 'source' ? SourceField
          : '';
      const inneri =
        (meta.className === 'e_store' || meta.className === 'ce_store')
          ? InitialValueField
          : '';

      return wrap(meta.symbol, getLabel(name), innerp, inneri);
    };

  const m = NODE_META[name];
  const defaultData =
    m.body === "param"
      ? { param: "1.0" }
      : m.body === "source"
        ? { input: { type: "Unit Step Input" } }
        : {};
  if (m) {
    const html = renderNodeHTML(name, m, getLabel);
    // editor.addNode(name, m.inputs, m.outputs, pos_x, pos_y, m.className, {}, html);
    editor.addNode(name, m.inputs, m.outputs, pos_x, pos_y, m.className, defaultData, html);
    return;
  } else {
    console.warn('Unknown node type:', name);
    return;
  }
};

const domainOptions = [
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

  const baseNodeTypes = [
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

  const groupedSidebar = [
    { title: 'Elements',  keys: ['f_store', 'e_store', 're', 'rxn'] },
    { title: 'Sources',   keys: ['se', 'sf'] },
    { title: 'Junctions', keys: ['f_junc', 'e_junc'] },
  ];


const getLabel = (type) => {
  if (!currDomain) {
    return baseNodeTypes.find(n => n.type === type)?.defaultLabel ?? type;
  }

  return currDomain[type]
    ?? baseNodeTypes.find(n => n.type === type)?.defaultLabel
    ?? type;
};

const labels = React.useMemo(() => {
  return {
    refreshAll() {
      const exp = drawflowAPI.exportJSON?.();
      const mod = drawflowAPI.currentModule?.();
      if (!exp || !mod) return;
      const data = exp.drawflow?.[mod]?.data || {};
      for (const idStr in data) {
        const nodeName = data[idStr]?.name;
        const meta = NODE_META[nodeName];
        if (!meta) continue;
        drawflowAPI.setNodeTitle(Number(idStr), meta.symbol, getLabel(nodeName));
      }
    }
  };
}, [drawflowAPI, currDomain]);

// lables refresh logic
useEffect(() => {
  if (!editorRef.current) return;
  labels.refreshAll();
}, [currDomain, labels]);

const handleClearClick = () => {
  const now = Date.now();
  if (now <= clearConfirmUntilRef.current) {
    clearConfirmUntilRef.current = 0;
    drawflowAPI.clear();
    notify('Canvas cleared.', 'success');
  } else {
    clearConfirmUntilRef.current = now + 2500;
    notify('Press "Clear" again to confirm.', 'warning');
  }
};



// event listeners
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
    if (
      checkRules(
        editor,
        outputNode.name,
        inputNode.name,
        connection.output_id,
        connection.input_id
      ) == false
    ) {
      // Remove the invalid connection
      editor.removeSingleConnection(
        connection.output_id,
        connection.input_id,
        connection.output_class,
        connection.input_class
      );

      notify(
        `Connection from ${outputNode.name} to ${inputNode.name} is not allowed.`
        , "error"
      );
    }
  });

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

const sendToBackend = async () => {
  if (!editorRef.current) {
    console.error("Editor not initialized");
    return;
  }

  const drawflowData = editorRef.current.export();

  try {
    // Show loading state
    const exportButton = document.querySelector('.export-btn');
    if (exportButton) {
      exportButton.textContent = 'Processing...';
      exportButton.disabled = true;
    }

    var drawFlowDict = JSON.parse(JSON.stringify(drawflowData));
    const cleanedData = cleanDrawflowData(drawFlowDict);
    const durationInput = document.getElementById('duration');

    const usefulData = drawFlowDict.drawflow.Home.data;
    const initialValues = [];
    for (const node_id in usefulData) {
      if (usefulData[node_id].name == 'e_store') {
        const element = document.getElementById(`initial-${node_id}`);
        if (element && element.value) {
          initialValues.push(element.value);
        }
      }
    }
    const simulationParameters = { 'time': durationInput.value || 5, 'initial_values': initialValues };

    cleanedData['drawflow']['simulation'] = simulationParameters;


    console.log('Cleaned Data:', cleanedData);

    const response = await fetch("https://338db935306a.ngrok-free.app/echo", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(cleanedData),
    });

    const result = await response.json();

    setData(result);
    setIsVisible(1);

  } catch (error) {
    notify(`Error connecting to backend: ${error.message}`, 'error');
  } finally {
    // Reset button state
    const exportButton = document.querySelector(".export-btn");
    if (exportButton) {
      exportButton.textContent = "Export & Simulate";
      exportButton.disabled = false;
    }
  }
};


const handleClear = () => {
  if (editorRef.current) {
    editorRef.current.clearModuleSelected();
  }
};

const handleLockToggle = () => {
  if (editorRef.current) {
    if (isLocked) {
      editorRef.current.editor_mode = "edit";
    } else {
      editorRef.current.editor_mode = "fixed";
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

const nodeTypes = [
  { type: "f_store", symbol: "I", label: "Inertia" },
  { type: "e_store", symbol: "C", label: "Capacitance" },
  { type: "re", symbol: "R", label: "Resistance" },
  { type: "se", symbol: "Se", label: "SE" },
  { type: "sf", symbol: "Sf", label: "SF" },
  { type: "f_junc", symbol: "1", label: "1" },
  { type: "e_junc", symbol: "0", label: "0" },
];

  return (
    <div className="drawflow-app">
      <ConnectionRulesPopup />
      <header>
        <h2>SIMGUI</h2>
      </header>
    {banner.visible && (
      <div
        className={`banner banner--${banner.type}`}
        role={(banner.type === 'error' || banner.type === 'warning') ? 'alert' : 'status'}
        aria-live="polite"
      >
        <span className="banner__text">{banner.message}</span>
        <button className="banner__close" onClick={closeBanner} aria-label="Close notification">×</button>
      </div>
    )}

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
              <li className="run-menu-item" onClick={checkNodeParams}>Run</li>
              <li onClick={handleClearClick}>Clear</li>
              <li>
                Domain:
                <select
                  className="styled-select"
                  value={currDomain?.name ?? ""}
                  onChange={(e) => {
                    const d = domainOptions.find(x => x.name === e.target.value);
                    setCurrDomain(d ?? null);
                  }}
                >
                  <option value="">-- General (Select a Domain) --</option>
                  {domainOptions.map(d => (
                    <option key={d.name} value={d.name}>{d.name}</option>
                  ))}
                </select>
              </li>
            </ul>
          </div>

        <div
          id="drawflow"
          ref={drawflowRef}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
        >
        </div>
      </div>
      <ResultSection setIsVisible={setIsVisible} isVisible={isVisible} data={data} />

    </div>

    {/* Modal */}
    {isModalOpen && (
      <div
        className="modal-overlay"
        onClick={closeModal} // close when clicking outside
      >
        <div className="modal-content" onClick={e => e.stopPropagation()}>
          <form onSubmit={(e) => {
            e.preventDefault();
            sendToBackend();
          }}>
            <h2>Choose simulation parameters</h2>
            <label>
              Duration:
              <input id="duration" type="number" name="duration" defaultValue="5" required />
            </label>

            <button type="submit">Start Simulation</button>
          </form>
        </div>
      </div>

    )}
  </div>
);
};

export default DrawflowEditor;
