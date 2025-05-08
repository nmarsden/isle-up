import './info.css';

export default function Info({ show, onClose }: { show: boolean, onClose: () => void }) {
    return (
      <div className={`overlay ${show ? 'show' : 'hide'}`}>
        <div className="logo">
          <div className="logo-icon light"></div>
          <div className="logo-text">Isle Up</div>
        </div>
        <div className="tagLine">Raise all the islands</div>
        <div className="infoInstructions">Clicking an island toggles its own state and adjacent island states (N, S, E, W).</div>
        <div className="infoSubHeading">built by</div>
        <div className="infoBuiltBy">
          Neil Marsden |
          <a href="https://github.com/nmarsden/isle-up" target="_blank">github</a>|
          <a href="https://nmarsden.com" target="_blank">projects</a>
        </div>
        <div className="infoSubHeading">credits</div>
        <div className="infoCredits">
          <div className="infoCredit">
            <div className="infoCreditLabel">Models:</div>
            <a href="https://kenney.nl/assets/pirate-kit" target="_blank">Pirate Kit - Kenny</a>
          </div>
          <div className="infoCredit">
            <div className="infoCreditLabel">Music:</div>
            <a href="https://opengameart.org/content/hex-hop-soundtrack" target="_blank">Hex-a-hop - remaxim</a>
          </div>
          <div className="infoCredit">
            <div className="infoCreditLabel">SFX:</div>
            <a href="https://pixabay.com/users/floraphonic-38928062" target="_blank">Bloop 2 - floraphonic</a>
          </div>
          <div className="infoCredit">
            <div className="infoCreditLabel">Icon:</div>
            <a href="https://icons8.com/icon/NEQRj9jAWRbb/island-on-water" target="_blank">Island On Water - icon8</a>
          </div>
          <div className="infoCredit">
            <div className="infoCreditLabel">Font:</div>
            <a href="https://fonts.google.com/specimen/Shrikhand" target="_blank">Shrikhand - Google Fonts</a>
          </div>
        </div>
        <div className="button-light" onClick={onClose}>CLOSE</div>
      </div>
    )
}