import { IonButton, IonCol, IonContent, IonGrid, IonHeader, IonPage, IonRow, IonTitle, IonToolbar } from '@ionic/react';
import { useHistory } from 'react-router';
import { useDescomplica } from '../context/desconplica-context';
import './Tab1.css';
interface TabProps {

}

const Tab1: React.FC<TabProps> = () => {

  const {state,setState} = useDescomplica()

  const history = useHistory();

  const handleClick = (fn: String) => {
    
    setState((st:any) => ({
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
            <IonCol><IonButton className='botao' onClick={() => handleClick("producao")}>PRODUÇÃO</IonButton></IonCol>
            <IonCol><IonButton className='botao'>VALIDADES</IonButton></IonCol>
          </IonRow>
        </IonGrid>
      </IonContent>
    </IonPage>
  );
};

export default Tab1;
