import { useState } from "react";
import image1 from "../assets/image1.png";
import "./PopUpResult.css";

const PopUpResult = () => {
    const [isOpen, setIsOpen] = useState(false);

    const handleClose = () => setIsOpen(false);
    const handleOpen = () => setIsOpen(true);

    return (
        <>
            <button className="show-popup-button" onClick={handleOpen}>
                Show Result
            </button>
            
            {isOpen && (
                <div className="popup-overlay">
                    <div className="popup-content">
                        <button
                            onClick={handleClose}
                            className="close-button"
                            aria-label="Close"
                        >
                            &times;
                        </button>
                        <img
                            src={image1}
                            alt="Popup"
                            className="popup-image"
                        />
                    </div>
                </div>
            )}
        </>
    );
};

export default PopUpResult;
