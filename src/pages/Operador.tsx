import { IonButton, IonCol, IonContent, IonGrid, IonHeader, IonPage, IonRow, IonTitle, IonToolbar } from '@ionic/react';
import ExploreContainer from '../components/ExploreContainer';
import './Operador.css';
import { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { useHistory } from 'react-router';

interface OperadorProps {
  state: any;
  setState: Function;
}


const Operador: React.FC<OperadorProps> = ({state, setState}) => {
  const [operadores, setOperadores] = useState<any[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<any | null>(null);

  const history = useHistory();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Suponha que estamos buscando dados de uma API
        const { data } = await supabase.from("operadores").select();
        console.log(data)
        setOperadores(data);
      } catch (error) {
        setError(error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);  

  const handleClick = (nome: String) => {
    
    setState(st => ({
      ...st, 
      operador: nome
    }))
    history.push('/selecionar-setor') 
  }


  return (
    <IonPage>
      <IonHeader translucent={true}>
        <IonToolbar>
          <IonTitle>OPERADOR</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
      <IonHeader collapse="condense">
          <IonToolbar>
            <IonTitle size="large">OPERADOR</IonTitle>
          </IonToolbar>
        </IonHeader>

        <IonGrid fixed={true}>
          <IonRow>
            {
              operadores && operadores.map( (operador) => (                
                <IonCol key={operador.id}>
                  <IonButton 
                    className='botao' 
                    onClick={() => handleClick(operador.nome)}>{operador.nome}</IonButton>
                </IonCol>
              )) 
            }
          </IonRow>
        </IonGrid>

        {/* <ExploreContainer name="Tab 2 page" /> */}
      </IonContent>
    </IonPage>
  );
};

export default Operador;
