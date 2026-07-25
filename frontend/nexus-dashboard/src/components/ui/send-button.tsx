import React from 'react';
import styled from 'styled-components';

interface SendButtonProps {
  onClick?: () => void;
  disabled?: boolean;
}

const SendButton: React.FC<SendButtonProps> = ({ onClick, disabled }) => {
  return (
    <StyledWrapper>
      <button onClick={onClick} disabled={disabled} type="button">
        <div className="svg-wrapper-1">
          <div className="svg-wrapper">
            <svg height={24} width={24} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M0 0h24v24H0z" fill="none" />
              <path d="M1.946 9.315c-.522-.174-.527-.455.01-.634l19.087-6.362c.529-.176.832.12.684.638l-5.454 19.086c-.15.529-.455.547-.679.045L12 14l6-8-8 6-8.054-2.685z" fill="currentColor" />
            </svg>
          </div>
        </div>
        <span>Send</span>
      </button>
    </StyledWrapper>
  );
}

const StyledWrapper = styled.div`
  button {
    font-family: inherit;
    font-size: 16px;
    background: linear-gradient(to bottom, #E26D5C 0%, #C15545 100%);
    color: white;
    padding: 0.6em 1em;
    display: flex;
    align-items: center;
    justify-content: center;
    border: none;
    border-radius: 25px;
    box-shadow: 0px 5px 10px rgba(0, 0, 0, 0.1);
    transition: all 0.3s;
  }

  button:hover:not(:disabled) {
    transform: translateY(-3px);
    box-shadow: 0px 8px 15px rgba(0, 0, 0, 0.2);
    padding: 0em;
    background: linear-gradient(to bottom, #F1897A 0%, #E26D5C 100%);
    cursor: pointer;
  }

  button:active:not(:disabled) {
    transform: scale(0.95);
    box-shadow: 0px 2px 5px rgba(0, 0, 0, 0.1);
  }

  button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    background: #A8A29D;
  }

  button span {
    display: block;
    margin-left: 0.4em;
    transition: all 0.3s;
  }

  button:hover:not(:disabled) span {
    scale: 0;
    font-size: 0%;
    opacity: 0;
    transition: all 0.5s;
  }

  button svg {
    width: 18px;
    height: 18px;
    fill: white;
    transition: all 0.3s;
  }

  button .svg-wrapper {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 24px;
    height: 24px;
    border-radius: 50%;
    background-color: rgba(255, 255, 255, 0.2);
    transition: all 0.3s;
  }

  button:hover:not(:disabled) .svg-wrapper {
    background-color: rgba(255, 255, 255, 0.3);
    width: 40px;
    height: 40px;
  }

  button:hover:not(:disabled) svg {
    width: 20px;
    height: 20px;
    margin-right: 5px;
    transform: rotate(45deg);
  }`;

export default SendButton;
