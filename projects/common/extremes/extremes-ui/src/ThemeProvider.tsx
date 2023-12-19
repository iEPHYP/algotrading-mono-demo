import React, { FC, createContext, useContext, useState } from 'react';
import {
  createTheme,
  ThemeProvider as MuiThemeProvider,
  CssBaseline,
  Button,
} from '@material-ui/core';

const ThemeContext = createContext({ darkMode: true });

export const useThemeMode = () => useContext(ThemeContext);

export const ThemeProvider: FC = ({ children }) => {
  const [darkMode, setDarkMode] = useState(true);

  const toggleTheme = () => {
    setDarkMode(!darkMode);
  };

  const lightTheme = createTheme({
    palette: {
      type: 'light',
      primary: {
        main: '#2196f3',
      },
      background: {
        default: '#fff',
      },
    },
  });

  const darkTheme = createTheme({
    palette: {
      type: 'dark',
      primary: {
        main: '#f50057',
      },
      background: {
        default: '#333',
      },
    },
  });

  const theme = darkMode ? darkTheme : lightTheme;

  return (
    <ThemeContext.Provider value={{ darkMode }}>
      <MuiThemeProvider theme={theme}>
        <style>
          {`
          body {
            background-color: ${darkMode ? '#303030' : '#f5f5f5'};
          }
        `}
        </style>
        <CssBaseline />
        <Button variant="contained" color="primary" onClick={toggleTheme}>
          Switch Theme
        </Button>
        {children}
      </MuiThemeProvider>
    </ThemeContext.Provider>
  );
};
