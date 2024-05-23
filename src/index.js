import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { ThemeProvider, useTheme } from './ThemeContext';
import './index.css';

const Root = () => {
  const { theme } = useTheme();
  
  React.useEffect(() => {
    document.body.className = theme;
  }, [theme]);

  return <App />;
};

// ReactDOM.render(
//   <ThemeProvider>
//     <Root />
//   </ThemeProvider>,
//   document.getElementById('root')
// );

const root = ReactDOM.createRoot(document.getElementById("root"));
// const container = document.getElementById('root');
// const root = createRoot(container); // createRoot(container!) if you use TypeScript
root.render(<ThemeProvider>
  <Root />
</ThemeProvider>);
