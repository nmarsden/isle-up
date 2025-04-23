import Info from './info/info';
import './ui.css';
import {useCallback, useState} from "react";

export default function Ui() {
    const [showInfo, setShowInfo] = useState(false)
    const onInfoButtonClicked = useCallback(() => setShowInfo(true), []);
    const onInfoClose = useCallback(() => setShowInfo(false), []);

    return (
        <>
            {showInfo ? '' : (
              <>
                <div className="header">
                  <div className="heading">Isle Up</div>
                  <div className="actions">
                    <div className="level">LEVEL&nbsp;1</div>
                    <div className="about" onClick={onInfoButtonClicked}>ABOUT</div>
                  </div>
                </div>
                <div className="footer">
                  <div className="moves">MOVES: 0</div>
                </div>
              </>
            )}
            <Info show={showInfo} onClose={onInfoClose} />
        </>
    )
}