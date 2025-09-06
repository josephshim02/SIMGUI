import React, { useEffect, useRef, useState } from 'react';
import Drawflow from 'drawflow';
import 'drawflow/dist/drawflow.min.css';
import './DrawflowEditor.css';
import { checkRules } from './rules';

const DrawflowEditor = () => {
  const drawflowRef = useRef(null);
  const editorRef = useRef(null);
  const [currentModule, setCurrentModule] = useState('Home');
  const [isLocked, setIsLocked] = useState(false);

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

    // editor.on("connectionCreated", (connection) => {
    //   console.log("Connection created");
    //   console.log(connection);
    // });

    editor.on('connectionCreated', function(connection) {
      console.log('Connection created');
      console.log(connection);

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
      <header>
        <h2>Drawflow</h2>
        <div className="github-link">
          <a href="https://github.com/jerosoler/Drawflow" target="_blank" rel="noopener noreferrer">
            <i className="fab fa-github fa-3x"></i>
          </a>
        </div>
        <div className="them-edit-link">
          <a href="https://jerosoler.github.io/drawflow-theme-generator/" target="_blank" rel="noopener noreferrer">
            🎨
          </a>
        </div>
      </header>
      
      <div className="wrapper">
        <div className="col">
          {nodeTypes.map((node) => (
            <div
              key={node.type}
              className="drag-drawflow"
              draggable="true"
              onDragStart={(e) => handleDragStart(e, node.type)}
            >
              <span className="node-symbol">{node.symbol}</span>
              <span> {node.label}</span>
            </div>
          ))}
        </div>
        
        <div className="col-right">
          <div className="menu">
            <ul>
              <li
                className={currentModule === 'Home' ? 'selected' : ''}
                onClick={() => handleModuleChange('Home')}
              >
                Home
              </li>
              <li
                className={currentModule === 'Other' ? 'selected' : ''}
                onClick={() => handleModuleChange('Other')}
              >
                Other Module
              </li>
            </ul>
          </div>
          
          <div
            id="drawflow"
            ref={drawflowRef}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
          >
            <div className="btn-export" onClick={handleExport}>
              Export
            </div>
            <div className="btn-clear" onClick={handleClear}>
              Clear
            </div>
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
      </div>
    </div>
  );
};

export default DrawflowEditor;
