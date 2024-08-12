import { IonButton, IonCol, IonContent, IonGrid, IonHeader, IonPage, IonRow, IonTitle, IonToolbar } from '@ionic/react';
import { useEffect, useState } from 'react';
import { useHistory } from 'react-router';
import { useDescomplica } from '../context/desconplica-context';
import { supabase } from '../supabaseClient';
import './Produto.css';

interface ProdutoProps {

}


const Produto: React.FC<ProdutoProps> = () => {
  const {state, setState} = useDescomplica()
  const [produtos, setProdutos] = useState<any[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<any | null>(null);

console.log(state)

  const history = useHistory();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Suponha que estamos buscando dados de uma API
        const { data } = await supabase.from("produtos").select().is("originado", null).eq("setor", state.setor)

        console.log("produtos ", data)
        setProdutos(data);
      } catch (error) {
        console.log(error)
        setError(error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);  

  const handleClick = (produto: any) => {
    
    setState((st:any) => ({
      ...st, 
      produto: produto
    }))
    history.push('/producao') 
  }


  return (
    <IonPage>
      <IonHeader translucent={true}>
        <IonToolbar>
          <IonTitle>Produto</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
      <IonHeader collapse="condense">
          <IonToolbar>
            <IonTitle size="large">Produto</IonTitle>
          </IonToolbar>
        </IonHeader>

        <IonGrid fixed={true}>
          <IonRow>
            {
              produtos && produtos.map( (produto) => (                
                <IonCol key={produto.id}>
                  <IonButton 
                    className='botao' 
                    onClick={() => handleClick(produto)}>{produto.nome}</IonButton>
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

export default Produto;
