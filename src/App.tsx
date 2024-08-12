import { Redirect, Route } from 'react-router-dom';
import {
  IonApp,
  IonIcon,
  IonLabel,
  IonRouterOutlet,
  IonTabBar,
  IonTabButton,
  IonTabs,
  setupIonicReact
} from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import { ellipse, square, triangle } from 'ionicons/icons';
import Tab1 from './pages/Tab1';
import Operador from './pages/Operador';
import Producao from './pages/Producao';

/* Core CSS required for Ionic components to work properly */
import '@ionic/react/css/core.css';

/* Basic CSS for apps built with Ionic */
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';

/* Optional CSS utils that can be commented out */
import '@ionic/react/css/padding.css';
import '@ionic/react/css/float-elements.css';
import '@ionic/react/css/text-alignment.css';
import '@ionic/react/css/text-transformation.css';
import '@ionic/react/css/flex-utils.css';
import '@ionic/react/css/display.css';

/*

 * Ionic Dark Mode
 * -----------------------------------------------------
 * For more info, please see:
 * https://ionicframework.com/docs/theming/dark-mode
 */

/* import '@ionic/react/css/palettes/dark.always.css'; */
/* import '@ionic/react/css/palettes/dark.class.css'; */
import '@ionic/react/css/palettes/dark.system.css';

/* Theme variables */
import './theme/variables.css';
import { useState } from 'react';
import Setor from './pages/Setor';
import Produto from './pages/Produto';

setupIonicReact();

const App: React.FC = () => {
  const [state, setState] = useState<any | null>(null);

  
  return (
    <IonApp>
      <IonReactRouter>
        <IonTabs>
          <IonRouterOutlet>
            <Route exact path="/tab1">
              <Tab1 state={state} setState={setState}/>
            </Route>
            <Route exact path="/selecionar-operador">
              <Operador state={state} setState={setState}/>
            </Route>
            <Route exact path="/selecionar-setor">
              <Setor state={state} setState={setState}/>
            </Route>
            <Route exact path="/selecionar-produto">
              <Produto state={state} setState={setState}/>
            </Route>
            <Route path="/producao">
              <Producao state={state} setState={setState}/>
            </Route>
            <Route exact path="/">
              <Redirect to="/tab1" />
            </Route>
          </IonRouterOutlet>
          <IonTabBar slot="bottom">
            <IonTabButton tab="tab1" href="/tab1">
              <IonIcon aria-hidden="true" icon={triangle} />
              <IonLabel>INICIAL</IonLabel>
            </IonTabButton>
            <IonTabButton tab="operador" href="/operador">
              <IonIcon aria-hidden="true" icon={ellipse} />
              <IonLabel>OPERADOR</IonLabel>
            </IonTabButton>
            <IonTabButton tab="producao" href="/producao">
              <IonIcon aria-hidden="true" icon={square} />
              <IonLabel>PRODUÇÃO</IonLabel>
            </IonTabButton>
          </IonTabBar>
        </IonTabs>
      </IonReactRouter>
    </IonApp>
  )
};

export default App;
