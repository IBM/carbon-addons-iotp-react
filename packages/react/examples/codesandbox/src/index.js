import React from 'react';
import { createRoot } from 'react-dom/client';
import { Button } from 'carbon-addons-iot-react';

import 'carbon-addons-iot-react/css/carbon-addons-iot-react.css';

const App = () => (
  <>
    <Button>Hello world</Button>
  </>
);

const container = document.getElementById('root');
const root = createRoot(container);

root.render(<App />);
