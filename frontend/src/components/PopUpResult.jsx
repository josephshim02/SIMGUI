import { useState } from "react";
import "./PopUpResult.css";


const PopUpResult = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleClose = () => setIsOpen(false);
    const handleOpen = () => setIsOpen(true);

    return (
        <>
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

                    </div>
                </div>
            )}
        </>
    );
};

export default PopUpResult;
