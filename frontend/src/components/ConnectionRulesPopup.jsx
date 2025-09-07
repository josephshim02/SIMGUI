import React, { useState } from 'react';

const ConnectionRulesPopup = () => {
  const [isOpen, setIsOpen] = useState(false);

  const openPopup = () => setIsOpen(true);
  const closePopup = () => setIsOpen(false);

  return (
    <>
      {/* Question mark button */}
      <button 
        className="rules-help-btn"
        onClick={openPopup}
        title="Connection Rules Help"
        style={{
          position: 'fixed',
          top: '70px',
          right: '20px',
          width: '40px',
          height: '40px',
          borderRadius: '50%',
          backgroundColor: '#007bff',
          color: 'white',
          border: 'none',
          fontSize: '18px',
          fontWeight: 'bold',
          cursor: 'pointer',
          boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'all 0.3s ease'
        }}
        onMouseOver={(e) => {
          e.target.style.backgroundColor = '#0056b3';
          e.target.style.transform = 'scale(1.1)';
        }}
        onMouseOut={(e) => {
          e.target.style.backgroundColor = '#007bff';
          e.target.style.transform = 'scale(1)';
        }}
      >
        ?
      </button>

      {/* Modal backdrop */}
      {isOpen && (
        <div 
          className="modal-backdrop"
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 2000,
            animation: 'fadeIn 0.3s ease'
          }}
          onClick={closePopup}
        >
          {/* Modal content */}
          <div 
            className="modal-content"
            style={{
              backgroundColor: 'white',
              borderRadius: '8px',
              padding: '30px',
              maxWidth: '600px',
              maxHeight: '80vh',
              overflow: 'auto',
              boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
              position: 'relative',
              margin: '20px',
              animation: 'slideIn 0.3s ease'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              className="close-btn"
              onClick={closePopup}
              style={{
                position: 'absolute',
                top: '15px',
                right: '20px',
                background: 'none',
                border: 'none',
                fontSize: '24px',
                cursor: 'pointer',
                color: '#666',
                padding: '0',
                width: '30px',
                height: '30px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              onMouseOver={(e) => e.target.style.color = '#000'}
              onMouseOut={(e) => e.target.style.color = '#666'}
            >
              ×
            </button>

            <h2 style={{ marginTop: '0', marginBottom: '20px', color: '#333' }}>
              Connection Rules
            </h2>

            <div style={{ lineHeight: '1.6', color: '#555' }}>
              <div style={{ marginBottom: '25px' }}>
                <h3 style={{ color: '#007bff', marginBottom: '10px', fontSize: '18px' }}>
                  Forbidden Connections
                </h3>
                <p style={{ marginBottom: '15px' }}>
                  The following node combinations cannot be directly connected:
                </p>
                
                <div style={{ backgroundColor: '#f8f9fa', padding: '15px', borderRadius: '5px', marginBottom: '15px' }}>
                  <h4 style={{ margin: '0 0 10px 0', fontSize: '16px', color: '#495057' }}>Source Rules:</h4>
                  <ul style={{ margin: '0', paddingLeft: '20px' }}>
                    <li>Effort Source (Se) ↔ Capacitance (C)</li>
                    <li>Effort Source (Se) ↔ 1-Junction (1)</li>
                    <li>Flow Source (Sf) ↔ Inertia (I)</li>
                    <li>Flow Source (Sf) ↔ 0-Junction (0)</li>
                  </ul>
                </div>

                <div style={{ backgroundColor: '#f8f9fa', padding: '15px', borderRadius: '5px', marginBottom: '15px' }}>
                  <h4 style={{ margin: '0 0 10px 0', fontSize: '16px', color: '#495057' }}>Passive Element Rules:</h4>
                  <p style={{ margin: '0 0 10px 0', fontSize: '14px' }}>
                    Passive elements (C, I, R) cannot connect directly to each other - they must connect through junctions (0 or 1):
                  </p>
                  <ul style={{ margin: '0', paddingLeft: '20px' }}>
                    <li>Capacitance (C) ↔ Inertia (I)</li>
                    <li>Capacitance (C) ↔ Resistance (R)</li>
                    <li>Inertia (I) ↔ Resistance (R)</li>
                    <li>Same type connections: C↔C, I↔I, R↔R</li>
                  </ul>
                </div>

                <div style={{ backgroundColor: '#f8f9fa', padding: '15px', borderRadius: '5px' }}>
                  <h4 style={{ margin: '0 0 10px 0', fontSize: '16px', color: '#495057' }}>Junction Rules:</h4>
                  <ul style={{ margin: '0', paddingLeft: '20px' }}>
                    <li>1-Junction ↔ 1-Junction (redundant)</li>
                    <li>0-Junction ↔ 0-Junction (redundant)</li>
                  </ul>
                </div>
              </div>

              <div style={{ marginBottom: '25px' }}>
                <h3 style={{ color: '#28a745', marginBottom: '10px', fontSize: '18px' }}>
                  Source Connection Limits
                </h3>
                <p>Each node can only have <strong>one source</strong> (Se or Sf) connected to it at a time.</p>
              </div>

              <div style={{ marginBottom: '25px' }}>
                <h3 style={{ color: '#ffc107', marginBottom: '10px', fontSize: '18px' }}>
                  Junction Connection Limits
                </h3>
                <ul style={{ paddingLeft: '20px' }}>
                  <li><strong>Resistor (R):</strong> Can connect to maximum 1 junction</li>
                  <li><strong>Reaction elements:</strong> Can connect to maximum 2 junctions</li>
                </ul>
              </div>

              <div style={{ 
                backgroundColor: '#e7f3ff', 
                padding: '15px', 
                borderRadius: '5px', 
                borderLeft: '4px solid #007bff' 
              }}>
                <h4 style={{ margin: '0 0 10px 0', fontSize: '16px', color: '#004085' }}>
                  Why These Rules?
                </h4>
                <p style={{ margin: '0', fontSize: '14px' }}>
                  These connection rules ensure physically meaningful bond graph models. 
                  Junctions (0 and 1) represent energy conservation points, while direct 
                  connections between passive elements would violate energy conservation principles.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  ); 
}   

export default ConnectionRulesPopup;