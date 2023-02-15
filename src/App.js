import React from 'react';
import { ConfigProvider } from 'antd';
import AccumulatedFinance from './components/AccumulatedFinance';
import 'antd/dist/reset.css';
import './App.css';

const App = () => (
  <div className="App">
    <ConfigProvider theme={{
      token: {
        colorPrimary: '#781ee1',
        fontFamily: 'Noto Sans',
      },
    }}>
      
      <AccumulatedFinance />
      
    </ConfigProvider>
  </div>
);

export default App;