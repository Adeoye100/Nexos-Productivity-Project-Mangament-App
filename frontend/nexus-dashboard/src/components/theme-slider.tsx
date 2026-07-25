import React from 'react';
import styled from 'styled-components';
import { Sun, SunDim, Moon } from 'lucide-react';
import { useTheme } from 'next-themes';

const ThemeSlider = () => {
  const { theme, setTheme } = useTheme();

  // Map "system" or others to "adaptive" for the slider state if needed, 
  // but next-themes uses "light", "dark", "system".
  // The issue asks for "Light", "Adaptive Warm", "Dark".
  // I will map "adaptive" to "system".

  const currentTheme = theme === 'system' ? 'adaptive' : theme;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (val === 'adaptive') {
      setTheme('system');
    } else {
      setTheme(val);
    }
  };

  return (
    <StyledWrapper>
      <div className="radio-input">
        <div className="glass">
          <div className="glass-inner" />
        </div>
        <div className="selector">
          <div className="choice">
            <div>
              <input 
                className="choice-circle" 
                checked={theme === 'light'} 
                value="light" 
                name="theme-selector" 
                id="light" 
                type="radio" 
                onChange={handleChange}
                aria-label="Light Theme"
              />
              <div className="ball" />
            </div>
            <label htmlFor="light" className="choice-name">
              <Sun size={24} />
            </label>
          </div>
          <div className="choice">
            <div>
              <input 
                className="choice-circle" 
                checked={theme === 'system'} 
                value="adaptive" 
                name="theme-selector" 
                id="adaptive" 
                type="radio" 
                onChange={handleChange}
                aria-label="Adaptive Warm Theme"
              />
              <div className="ball" />
            </div>
            <label htmlFor="adaptive" className="choice-name">
              <SunDim size={24} />
            </label>
          </div>
          <div className="choice">
            <div>
              <input 
                className="choice-circle" 
                checked={theme === 'dark'} 
                value="dark" 
                name="theme-selector" 
                id="dark" 
                type="radio" 
                onChange={handleChange}
                aria-label="Dark Theme"
              />
              <div className="ball" />
            </div>
            <label htmlFor="dark" className="choice-name">
              <Moon size={24} />
            </label>
          </div>
        </div>
      </div>
    </StyledWrapper>
  );
}

const StyledWrapper = styled.div`
  .radio-input {
    display: flex;
    height: 120px;
    align-items: center;
    scale: 0.5; /* Scale down to fit better in UI */
  }

  .glass {
    z-index: 2;
    height: 100%;
    width: 65px;
    margin-right: 20px;
    padding: 6px;
    background-color: rgba(226, 109, 92, 0.2);
    border-radius: 35px;
    box-shadow: rgba(50, 50, 93, 0.2) 0px 25px 50px -10px,
      rgba(0, 0, 0, 0.25) 0px 10px 30px -15px,
      rgba(10, 37, 64, 0.26) 0px -2px 6px 0px inset;
    backdrop-filter: blur(8px);
  }

  .glass-inner {
    width: 100%;
    height: 100%;
    border-color: rgba(255, 255, 255, 0.3);
    border-width: 6px;
    border-style: solid;
    border-radius: 30px;
  }

  .selector {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    height: 100%;
  }

  .choice {
    display: flex;
    align-items: center;
  }

  .choice > div {
    position: relative;
    width: 41px;
    height: 41px;
    margin-right: 15px;
    z-index: 0;
  }

  .choice-circle {
    appearance: none;
    height: 100%;
    width: 100%;
    border-radius: 100%;
    border-width: 6px;
    border-style: solid;
    border-color: rgba(226, 109, 92, 0.3);
    cursor: pointer;
    box-shadow: 0px 0px 20px -13px gray, 0px 0px 20px -14px gray inset;
  }

  .ball {
    z-index: 1;
    position: absolute;
    inset: 0px;
    transform: translateX(-100px);
    box-shadow: rgba(0, 0, 0, 0.17) 0px -10px 10px 0px inset,
      rgba(0, 0, 0, 0.15) 0px -15px 15px 0px inset,
      rgba(0, 0, 0, 0.1) 0px -40px 20px 0px inset, rgba(0, 0, 0, 0.06) 0px 2px 1px,
      rgba(0, 0, 0, 0.09) 0px 4px 2px, rgba(0, 0, 0, 0.09) 0px 8px 4px,
      rgba(0, 0, 0, 0.09) 0px 16px 8px, rgba(0, 0, 0, 0.09) 0px 32px 16px,
      0px -1px 15px -8px rgba(0, 0, 0, 0.09);
    border-radius: 100%;
    transition: transform 800ms cubic-bezier(1, -0.4, 0, 1.4);
    background-color: #E26D5C;
  }

  .choice-circle:checked + .ball {
    transform: translateX(0px);
  }

  .choice-name {
    color: var(--foreground);
    opacity: 0.6;
    cursor: pointer;
    display: flex;
    align-items: center;
  }

  .choice-circle:checked ~ .choice-name,
  input:checked + .ball + .choice-name {
    opacity: 1;
    color: #E26D5C;
  }
`;

export default ThemeSlider;
