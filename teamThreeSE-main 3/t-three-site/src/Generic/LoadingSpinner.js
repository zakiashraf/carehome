import ClipLoader from "react-spinners/ClipLoader";
import './LoadingSpinner.css';

function LoadingSpinner({colorIn, textIn}) {
    return (
        <div className="loadingSpinner">
            <p>{textIn}</p>
            <ClipLoader color={colorIn} loading={true} size={150} />
        </div>
    );
}
export default LoadingSpinner;