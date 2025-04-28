import './splashScreen.css';

export default function SplashScreen({ show, onPlaySelected }: { 
  show: boolean, 
  onPlaySelected: () => void,
}) {
  return (
    <div className={`overlay ${show ? 'show' : 'hide'}`}>
        <div className="overlayHeading">Isle Up</div>
        <div className="splashScreenTagLine">Raise all the islands</div>
        <div className="button-light" onClick={() => onPlaySelected()}>PLAY</div>
    </div>
  )
}