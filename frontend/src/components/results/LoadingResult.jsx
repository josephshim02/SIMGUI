import "@lottiefiles/dotlottie-wc";

const LoadingResult = () => {
  return (
    <div className="loading-container">
      <h1 className="loading-text">Simulation running</h1>
      <dotlottie-wc
        src="https://lottie.host/7f41cb68-5854-4d3c-b4f3-b2cfed73c0ab/Y5MttuHPtR.lottie"
        style={{ width: "250px", height: "250px" }} 
        autoplay
        loop
      />
      {/* <GridLoader /> */}
    </div>
  )
}
export default LoadingResult
