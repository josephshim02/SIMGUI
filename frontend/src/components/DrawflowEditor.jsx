import React, { useEffect, useRef, useState } from "react";
import Drawflow from "drawflow";
import "drawflow/dist/drawflow.min.css";
import "./DrawflowEditor.css";
import { checkRules } from "./rules";
import ResultSection from "./results/ResultSection.jsx";
import ConnectionRulesPopup from './ConnectionRulesPopup';
import { NODE_META, domainOptions, baseNodeTypes, groupedSidebar, wrap, ParamField, InitialValueField, SourceField } from "../utils/drawflowConstants.js";
import { sendToBackend, checkInvalidGraph } from "../utils/drawflowUtils";
import Modal from "./Modal.jsx";


const DrawflowEditor = () => {
  const [isSimulating, setIsSimulating] = useState(false);
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

  const openRunPopup = () => {
    const graphIsInvalid = checkInvalidGraph(editorRef);
    if (!graphIsInvalid) {
      openModal();
      return 1;
    } else {
      notify(graphIsInvalid, "error");
      return 0
    }    
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
    setNodeCounter(prev => prev + 1);

    // render inner HTML using meta data
    const renderNodeHTML = (name, meta, getLabel) => {
      console.log(meta.className === "e_store");
      const innerp = meta.body === 'param' ? ParamField(nodeCounter)
        : meta.body === 'source' ? SourceField(nodeCounter)
          : '';
      const inneri =
        (meta.className === 'e_store' || meta.className === 'ce_store') || meta.className === 'f_store'
          ? InitialValueField(nodeCounter)
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


  const simulate = async () => {
    if (isSimulating) {
      notify("Cannot submit another simulation while simulations is running");
      return;
    }
    // QUESTION: Was this just here for debugging or is it necesary?
    if (!editorRef.current) {
      console.error("Editor not initialized");
      return;
    }
    const durationInput = document.getElementById('duration').value;
    try {
      setIsSimulating(true);
      const result = await sendToBackend(editorRef, durationInput);
      console.log(result);
      setData(result);
      setIsVisible(1);

    } catch (error) {
      console.log(error);
      notify(`Error connecting to backend: ${error.message}`, 'error');
    } finally {
      setIsSimulating(false);
    }
  };



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
              <li className="run-menu-item" onClick={openRunPopup}>Run</li>
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
        <ResultSection setIsVisible={setIsVisible} isVisible={isVisible} data={data} isSimulating={isSimulating} />
      </div>

      {/* Modal */}
      {
        isModalOpen && <Modal 
          onClose={() => closeModal()} 
          onSimulate={() => simulate()}
          onNotify = {() => notify('Simulation started!', 'info', 5000)}
        />
      }
    </div>
  );
};

export default DrawflowEditor;
