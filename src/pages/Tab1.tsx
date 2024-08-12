import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar, IonButton, IonGrid, IonRow, IonCol } from '@ionic/react';
import ExploreContainer from '../components/ExploreContainer';
import './Tab1.css';
import { useHistory } from 'react-router';
interface TabProps {
  state: any;
  setState: Function;
}

const Tab1: React.FC<TabProps> = ({ state, setState }) => {
  const history = useHistory();

  const handleClick = (fn: String) => {
    
    setState(st => ({
      ...st, 
      funcao: fn
    }))
    history.push('/selecionar-operador') 
  }

  return (
    <IonPage>
      <IonHeader translucent={true}>
        <IonToolbar>
          <IonTitle>DESCOMPLICA!!!</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <IonHeader collapse="condense">
          <IonToolbar>
            <IonTitle size="large">DESCOMPLICA!!!</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonGrid fixed={true}>
          <IonRow>
            <IonCol><IonButton className='botao'>FICHA TÉCNICA</IonButton></IonCol>
            <IonCol><IonButton className='botao'>ETIQUETAS</IonButton></IonCol>
          </IonRow>
          <IonRow>
            <IonCol><IonButton className='botao' onClick={() => handleClick('producao')}>PRODUÇÃO</IonButton></IonCol>
            <IonCol><IonButton className='botao'>VALIDADES</IonButton></IonCol>
          </IonRow>
        </IonGrid>
      </IonContent>
    </IonPage>
  );
};

export default Tab1;
