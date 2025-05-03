import './splashScreen.css';

export default function SplashScreen({ show, onPlaySelected }: { 
  show: boolean, 
  onPlaySelected: () => void,
}) {
  return (
    <>
      <div className={`splashScreen background ${show ? 'show' : 'hide'}`} />
      <div className={`splashScreen overlay ${show ? 'show' : 'hide'}`}>
          <div className="logo">
            <div className="logo-icon light"></div>
            <div className="logo-text">Isle Up</div>
          </div>
          <div className="tagLine">Raise all the islands</div>
          <div className="button-light" onClick={() => onPlaySelected()}>PLAY</div>
      </div>
    </>
  )
}