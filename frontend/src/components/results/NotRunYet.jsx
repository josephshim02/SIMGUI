import "./ResultSection.css";
import "@lottiefiles/dotlottie-wc";

const NotRunYet = () => {
  return (
    <>
    <div className="loading-container">
      <h1 className="loading-text">
        Haven't run simulation yet
      </h1>
      <dotlottie-wc src="https://lottie.host/1403b53d-8e82-42af-9aff-7e401f56debd/4zBDEIwtaT.lottie" 
      style={{ width: "300px", height: "300px" }} 
      autoplay 
      loop></dotlottie-wc>
    </div>
    </>
  )
}

export default NotRunYet;
