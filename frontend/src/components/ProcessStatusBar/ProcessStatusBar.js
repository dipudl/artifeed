import React from "react";
import { STATUS } from '../../utils/constants';
import './ProcessStatusBar.css';
import IconError from '../../assets/ic_error.svg';
import IconLoading from '../../assets/ic_loading.svg';
import IconSuccess from '../../assets/ic_success.svg';
import IconEmpty from '../../assets/ic_empty.svg';

export default function ProcessStatusBar({ processState, message }) {

    return (
        {
            [STATUS.SUCCESS]:
                <div className={"ProcessStatusBar-info success-color small-margin-top"}>
                    <img src={IconSuccess} alt="icon" />
                    <p className="ProcessStatusBar-message-text">{message}</p>
                </div>,
            [STATUS.LOADING]:
                <div className={"ProcessStatusBar-info loading-color small-margin-top"}>
                    <img className="rotate" src={IconLoading} alt="icon" />
                    <p className="ProcessStatusBar-message-text">{message}</p>
                </div>,
            [STATUS.ERROR]:
                <div className={"ProcessStatusBar-info error-color small-margin-top"}>
                    <img src={IconError} alt="icon" />
                    <p className="ProcessStatusBar-message-text">{message}</p>
                </div>,
            [STATUS.EMPTY]:
                <div className={"ProcessStatusBar-info empty-color info-color"}>
                    <img src={IconEmpty} alt="icon" />
                    <p className="ProcessStatusBar-message-text">{message}</p>
                </div>,
            [STATUS.INITIAL]:
                <></>
        }[processState]
    );
}