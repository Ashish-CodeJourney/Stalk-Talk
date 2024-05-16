import React from "react";
import closeIcon from "../../assets/closeIcon.png";
import onlineIcon from "../../assets/onlineIcon.png";

export default function InfoBar({ room = "not getting any room name" }) {
  // recieving the prop from infoBar which we pass
  return (
    <div className="infoBar flex justify-between items-center p-2">
      <div className="leftInnerContainer flex items-center">
        <img className="onlineIcon mr-2" src={onlineIcon} alt="online image" />
        <h3 className="text-lg sm:text-xl">{room}</h3>
      </div>

      <div className="rightInnerContainer">
        <a href="/">
          <img src={closeIcon} alt="close image" />
        </a>
      </div>
    </div>
  );
}
