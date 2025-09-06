import { useState } from "react";
import image1 from "../assets/image1.png";
import "./ResultSection.css";

const ResultSection = () => {
    const [isVisible, setIsVisible] = useState(false);

    const toggleVisibility = () => setIsVisible(!isVisible);

    return (
        <>
            <button className="toggle-button" onClick={toggleVisibility}>
                {isVisible ? 'Hide Result' : 'Show Result'}
            </button>
            
            {isVisible && (
                <div className="result-section">
                    <img
                        src={image1}
                        alt="Result"
                        className="result-image"
                    />
                </div>
            )}
        </>
    );
};

export default ResultSection;
