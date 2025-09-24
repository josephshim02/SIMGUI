import { useState, useEffect, useRef } from "react";
import "./ResultSection.css";
import Plotly from "plotly.js-dist-min";
import { GridLoader } from "react-spinners";
// index.js or App.jsx
import "@lottiefiles/dotlottie-wc";
import NotRunYet from "./NotRunYet";
import LoadingResult from "./LoadingResult";
import { preload } from 'react-dom';



const ResultSection = ({ isVisible, setIsVisible, data, isSimulating }) => {
  const plotRef = useRef(null);
  const [isLoaded, setIsLoaded] = useState(false); // <-- Add this line

  // const toggleVisibility = () => setIsVisible((v) => !v);
  const toggleVisibility = () => {
    console.log(isSimulating);
    setIsVisible((v) => !v);
  };


  useEffect(() => {
    if (!isVisible) return;

    const node = plotRef.current;
    if (!node) return;

    if (!data) return setIsLoaded(false);
    setIsLoaded(true);

    // create the plot once when the panel becomes visible
    // Use the JSON's traces/layout and enable Plotly's responsive handler
    const traces = data?.traces ?? data;
    const layout = data?.layout ?? { title: "Data Plot" };
    const config = { responsive: true, useResizeHandler: true };

    Plotly.newPlot(node, traces, layout, config);

    // resize handlers: window resize + ResizeObserver for container changes
    const handleResize = () => {
      if (node) Plotly.Plots.resize(node);
    };
    window.addEventListener("resize", handleResize);

    let ro;
    if (typeof ResizeObserver !== "undefined") {
      // observe the plot's parent (.plot-section) so changes to panel layout trigger resize
      const target = node.parentElement || node;
      ro = new ResizeObserver(() => Plotly.Plots.resize(node));
      ro.observe(target);
    }

    // cleanup when panel hidden or component unmounts
    return () => {
      window.removeEventListener("resize", handleResize);
      if (ro) ro.disconnect();
      if (node) Plotly.purge(node);
    };
  }, [isVisible, data]);

  return (
    <>
      <button className="toggle-button" onClick={toggleVisibility}>
        {isVisible ? "Hide Result" : "Show Result"}
      </button>

      {isVisible && (

        <div className="result-section">
          {
            (!isSimulating && !isLoaded) && <NotRunYet />
          }
          {
            isSimulating && <LoadingResult />
          }

          <div className="plot-section">
            {/* plot fills the container; Plotly will be initialized on this element */}
            <div
              className="result-plot"
              ref={plotRef}
              style={{ width: "100%", height: "100%", minHeight: 400, marginTop: 200 }}
            />
          </div>
        </div>
      )}
      {/* preload animation assets, possibly bad practice */}
      <div style={{ position: "absolute", left: "-9999px", top: "-9999px" }}>
        <dotlottie-wc
          src="https://lottie.host/1403b53d-8e82-42af-9aff-7e401f56debd/4zBDEIwtaT.lottie"
        />
      </div>
      <div style={{ position: "absolute", left: "-9999px", top: "-9999px" }}>
        <dotlottie-wc
          src="https://lottie.host/7f41cb68-5854-4d3c-b4f3-b2cfed73c0ab/Y5MttuHPtR.lottie"
        />
      </div>
    </>
  );
};

export default ResultSection;
