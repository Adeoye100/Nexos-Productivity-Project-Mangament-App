import React from 'react';
import styled from 'styled-components';

interface ErrorStateProps {
  message?: string;
}

const ErrorState: React.FC<ErrorStateProps> = ({ message = "Something went wrong" }) => {
  return (
    <StyledWrapper>
      <div className="error-container">
        <main className="my-custom-face-container">
          <svg className="face" viewBox="0 0 320 380">
            <g fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={25}>
              <g className="face__eyes" transform="translate(0,112.5)">
                <g transform="translate(15,0)">
                  <polyline className="face__eye-lid" points="37,0 0,120 75,120" />
                  <polyline className="face__pupil" points="55,120 55,155" strokeDasharray="35 35" />
                </g>
                <g transform="translate(230,0)">
                  <polyline className="face__eye-lid" points="37,0 0,120 75,120" />
                  <polyline className="face__pupil" points="55,120 55,155" strokeDasharray="35 35" />
                </g>
              </g>
              <rect className="face__nose" x="132.5" y="112.5" width={55} height={155} rx={4} ry={4} />
              <g transform="translate(65,334)" strokeDasharray="102 102">
                <path className="face__mouth-left" d="M 0 30 C 0 30 40 0 95 0" />
                <path className="face__mouth-right" d="M 95 0 C 150 0 190 30 190 30" />
              </g>
            </g>
          </svg>
        </main>
        <p className="error-message">{message}</p>
      </div>
    </StyledWrapper>
  );
}

const StyledWrapper = styled.div`
  .error-container {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    min-height: 400px;
    padding: 2rem;
  }

  .my-custom-face-container {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 250px;
    background: transparent;
    color: #E26D5C;
  }

  .my-custom-face-container .face {
    width: 150px;
  }

  .error-message {
    margin-top: 2rem;
    font-size: 1.25rem;
    color: var(--secondary-foreground);
    font-weight: 500;
  }

  .my-custom-face-container .face__eyes,
  .my-custom-face-container .face__eye-lid,
  .my-custom-face-container .face__mouth-left,
  .my-custom-face-container .face__mouth-right,
  .my-custom-face-container .face__nose,
  .my-custom-face-container .face__pupil {
    animation: eyes 1s 0.3s forwards;
  }

  .my-custom-face-container .face__eye-lid,
  .my-custom-face-container .face__pupil {
    animation-duration: 4s;
    animation-delay: 1.3s;
    animation-iteration-count: infinite;
  }

  .my-custom-face-container .face__eye-lid {
    animation-name: eye-lid;
  }
  .my-custom-face-container .face__mouth-left {
    animation-name: mouth-left;
  }
  .my-custom-face-container .face__mouth-right {
    animation-name: mouth-right;
  }
  .my-custom-face-container .face__nose {
    animation-name: nose;
  }
  .my-custom-face-container .face__pupil {
    animation-name: pupil;
  }

  @keyframes eye-lid {
    0%,
    40%,
    45%,
    100% {
      transform: translateY(0);
    }
    42.5% {
      transform: translateY(17.5px);
    }
  }

  @keyframes eyes {
    from {
      transform: translateY(112.5px);
    }
    to {
      transform: translateY(15px);
    }
  }

  @keyframes pupil {
    0%,
    37.5%,
    40%,
    45%,
    87.5%,
    100% {
      stroke-dashoffset: 0;
      transform: translate(0, 0);
    }
    12.5%,
    25%,
    62.5%,
    75% {
      transform: translate(-35px, 0);
    }
    42.5% {
      stroke-dashoffset: 35;
      transform: translate(0, 17.5px);
    }
  }

  @keyframes mouth-left {
    from,
    50% {
      stroke-dashoffset: -102;
    }
    to {
      stroke-dashoffset: 0;
    }
  }

  @keyframes mouth-right {
    from,
    50% {
      stroke-dashoffset: 102;
    }
    to {
      stroke-dashoffset: 0;
    }
  }

  @keyframes nose {
    from {
      transform: translate(0, 0);
    }
    to {
      transform: translate(0, 22.5px);
    }
  }`;

export default ErrorState;
