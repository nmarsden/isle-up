import './info.css';

export default function Info({ show, onClose }: { show: boolean, onClose: () => void }) {
    return (
      <div className={`overlay ${show ? 'show' : 'hide'}`}>
        <div className="logo">
          <div className="logo-icon light"></div>
          <div className="logo-text">Isle Up</div>
        </div>
        <div className="tagLine">Raise all the islands</div>
        <div className="infoLinks">
            <a href="https://github.com/nmarsden/isle-up" target="_blank">github</a>|
            <a href="https://nmarsden.com" target="_blank">projects</a>
        </div>
        <div className="infoSubHeading">credits</div>
        <div className="infoLinks">
            <a href="https://dustyroom.com/free-casual-game-sounds" target="_blank">sound</a>
        </div>
        <div className="button-light" onClick={onClose}>CLOSE</div>
      </div>
    )
}