import React from 'react';
import { Player } from './tsx/Player/Player';
import { Main } from './tsx/Main/Main';
import { Sidebar } from './tsx/Sidebar/Sidebar';

import './styling/root.css';
import './styling/main.css';
import './styling/sidebar.css';
import './styling/player.css';
import './styling/cards.css';

const App: React.FC = () => {
  return (
    <div id="frame">
      <Sidebar />
      <Main />
      <Player />
    </div>
  );
};

export default App;
