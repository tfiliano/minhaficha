import { IonButton, IonCol, IonContent, IonGrid, IonHeader, IonPage, IonRow, IonTitle, IonToolbar } from '@ionic/react';
import { useEffect, useState } from 'react';
import { useHistory } from 'react-router';
import { useDescomplica } from '../context/desconplica-context';
import { supabase } from '../supabaseClient';
import './Setor.css';

interface SetorProps {

}


const Setor: React.FC<SetorProps> = () => {
  const {state,setState} = useDescomplica()
  const [setores, setSetores] = useState<any[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<any | null>(null);

console.log(state)

  const history = useHistory();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Suponha que estamos buscando dados de uma API
        const { data } = await supabase.rpc("listar_setores");
        console.log(data)
        setSetores(data);
      } catch (error) {
        console.log(error)
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
      setor: nome
    }))
    history.push('/selecionar-produto') 
  }


  return (
    <IonPage>
      <IonHeader translucent={true}>
        <IonToolbar>
          <IonTitle>Setor</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
      <IonHeader collapse="condense">
          <IonToolbar>
            <IonTitle size="large">Setor</IonTitle>
          </IonToolbar>
        </IonHeader>

        <IonGrid fixed={true}>
          <IonRow>
            {
              setores && setores.map( (setor) => (                
                <IonCol key={setor.nome}>
                  <IonButton 
                    className='botao' 
                    onClick={() => handleClick(setor.nome)}>{setor.nome}</IonButton>
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

export default Setor;
