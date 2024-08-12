import { IonButton, IonCol, IonContent, IonGrid, IonHeader, IonPage, IonRow, IonTitle, IonToolbar } from '@ionic/react';
import { useEffect, useState } from 'react';
import { useHistory } from 'react-router';
import { useDescomplica } from '../context/desconplica-context';
import { supabase } from '../supabaseClient';
import './Operador.css';

interface OperadorProps {

}


const Operador: React.FC<OperadorProps> = () => {
  const {state,setState} =useDescomplica()
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
    
    setState((st:any) => ({
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
