import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar } from '@ionic/react';
import './Producao.css';
import ProducaoForm from '../components/ProducaoForm';
import { useEffect, useState } from 'react';
import { useHistory } from 'react-router';
import { supabase } from '../supabaseClient';

interface ProducaoProps {
  state: any;
  setState: Function;
}

const Producao: React.FC<ProducaoProps> = ({state, setState}) => {
  const [produtos, setProdutos] = useState<any[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<any | null>(null);

console.log("producao state", state)

  const history = useHistory();

  useEffect(() => {
    console.log("dentro do useEffect ", state)
    const fetchData = async () => {
      if (state) {
        try {
          setLoading(true);
          // Suponha que estamos buscando dados de uma API
          console.log("codigo produto" , state?.produto?.codigo)
          const { data } = await supabase.from("produtos").select().eq("originado", state?.produto?.codigo);
          console.log("subprodutos...:" ,data)
          setProdutos(data);
        } catch (error) {
          console.log(error)
          setError(error);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchData();
  }, [state]);  



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

        { produtos && produtos.length && 
          <ProducaoForm produtos={produtos} onSetProduto={setProdutos}  state={state} setState={setState}/> 
        }

      </IonContent>
    </IonPage>
  );
};

export default Producao;
