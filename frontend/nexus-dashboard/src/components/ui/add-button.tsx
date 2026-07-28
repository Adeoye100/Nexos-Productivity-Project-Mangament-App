import React from 'react';
import styled from 'styled-components';
interface AddButtonProps {
    onClick?: () => void;
    text?: string;
    type?: "button" | "submit" | "reset";
    disabled?: boolean;
}
const AddButton: React.FC<AddButtonProps> = ({ onClick, text = "Add Item", type = "button", disabled = false }) => {
    return (
        <StyledWrapper>
            <button className="button" type={type} onClick={onClick} disabled={disabled}>
                <span className="button__text">{text}</span>
                <span className="button__icon"><svg className="svg" fill="none" height={24} stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} viewBox="0 0 24 24" width={24} xmlns="http://www.w3.org/2000/svg"><line x1={12} x2={12} y1={5} y2={19} /><line x1={5} x2={19} y1={12} y2={12} /></svg></span>
            </button>
        </StyledWrapper>
    );
}
const StyledWrapper = styled.div`
  .button {
    --bg-color: var(--background);
    --main-color: var(--foreground);
    --bg-color-sub: #E26D5C;
    position: relative;
    width: 150px;
    height: 40px;
    cursor: pointer;
    display: flex;
    align-items: center;
    border: 2px solid var(--main-color);
    box-shadow: 4px 4px var(--main-color);
    background-color: var(--bg-color);
    border-radius: 10px;
    overflow: hidden;
  }
  .button, .button__icon, .button__text {
    transition: all 0.3s;
  }
  .button .button__text {
    transform: translateX(22px);
    color: var(--main-color);
    font-weight: 600;
  }
  .button .button__icon {
    position: absolute;
    transform: translateX(109px);
    height: 100%;
    width: 39px;
    background-color: var(--bg-color-sub);
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .button .svg {
    width: 20px;
    stroke: white;
  }
  .button:hover {
    background: var(--bg-color);
  }
  .button:hover .button__text {
    color: transparent;
  }
  .button:hover .button__icon {
    width: 148px;
    transform: translateX(0);
  }
  .button:active {
    transform: translate(3px, 3px);
    box-shadow: 0px 0px var(--main-color);
  }
  .button:disabled {
    cursor: not-allowed;
    opacity: 0.5;
  }
  .button:disabled:hover .button__text {
    color: var(--main-color);
  }
  .button:disabled:hover .button__icon {
    width: 39px;
    transform: translateX(109px);
  }`;
export default AddButton;