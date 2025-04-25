import './splashScreen.css';

export default function SplashScreen({ show, onPlaySelected }: { 
  show: boolean, 
  onPlaySelected: () => void,
}) {
  return (
    <div className={`splashScreenOverlay ${show ? 'show' : 'hide'}`}>
        <div className="splashScreenHeading">Isle Up</div>
        <div className="splashScreenTagLine">Raise all the islands</div>
        <div className="splashScreenButton" onClick={() => onPlaySelected()}>PLAY</div>
    </div>
  )
}