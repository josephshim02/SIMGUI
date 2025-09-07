import { useState, useEffect, useRef } from "react";
import "./ResultSection.css";
import Plotly from "plotly.js-dist-min";


const ResultSection = ({isVisible, setIsVisible, data}) => {
    const plotRef = useRef(null);
    const [isLoaded, setIsLoaded] = useState(false); // <-- Add this line

    const toggleVisibility = () => setIsVisible((v) => !v);

    useEffect(() => {
        if (!isVisible) return;

        const node = plotRef.current;
        if (!node) return;

        if(!data) return setIsLoaded(false);
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
    }, [isVisible]);

    return (
        <>
            <button className="toggle-button" onClick={toggleVisibility}>
                {isVisible ? "Hide Result" : "Show Result"}
            </button>


            {isVisible && (
                
                <div className="result-section">
                    {
                    !isLoaded && (
                        
                        <h1 className="loading-text">
                            Haven't run simulation yet
                        </h1>
                    )
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
        </>
    );
};

export default ResultSection;
