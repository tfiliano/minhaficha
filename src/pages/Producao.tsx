import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar } from '@ionic/react';
import { useState } from 'react';
import { useHistory } from 'react-router';
import ProducaoForm from '../components/ProducaoForm';
import { useDescomplica } from '../context/desconplica-context';
import './Producao.css';

interface ProducaoProps {

}

const Producao: React.FC<ProducaoProps> = () => {
  const {state, produtos, setProdutos, setState} = useDescomplica()
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<any | null>(null);

console.log("producao state", state)

  const history = useHistory();





  return (
    <IonPage>
      <IonHeader translucent={true}>
        <IonToolbar>
          <IonTitle>PRODUÇÃO</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
      <IonHeader collapse="condense">
          <IonToolbar>
            <IonTitle size="large">PRODUÇÃO</IonTitle>
          </IonToolbar>
        </IonHeader>

          <ProducaoForm    /> 
        

      </IonContent>
    </IonPage>
  );
};

export default Producao;
