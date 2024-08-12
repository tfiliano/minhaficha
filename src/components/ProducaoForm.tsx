import { IonCol, IonGrid, IonInput, IonRow } from '@ionic/react';
import React, { useCallback, useEffect, useState } from 'react';

import { useDescomplica } from '../context/desconplica-context';
import { supabase } from '../supabaseClient';
import './ProducaoForm.css';


interface ContainerProps {
  name?: string;



}

interface IProducao {
  pesoBruto: number | null;
  pesoLiquido: number | null;
  pesoPerda: number | null;
  fatorCorrecao: number | null;
  insumo: any;
  items: any[];
}


const DECIMAL_SEPARATOR=".";
const GROUP_SEPARATOR=",";
const budget=0;

const ProducaoForm: React.FC<ContainerProps> = ({  }) => {

  const {state,produtos,setProdutos,setState} = useDescomplica()

  const [data, setData] = useState<any[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<any | null>(null);
  const [producao, setProducao] = useState<IProducao|null>(null);
  const [decimalSeparator, setDecimalSeparator] = useState('.');


  const fetchData = useCallback(async () => {
    if (state) {
      try {
        setLoading(true);
        // Suponha que estamos buscando dados de uma API
        console.log("codigo produto" , state?.produto?.codigo)
        const { data } = await supabase.from("produtos").select().eq("originado", state?.produto?.codigo);
        console.log("subprodutos...:" ,data)
        setProdutos(data || [])
      } catch (error) {
        console.log(error)
        setError(error);
      } finally {
        setLoading(false);
      }
    }
  },[]);


  useEffect(() => {
    console.log("dentro do useEffect ", state)
    fetchData();
  }, []);  


  useEffect( () => {
    console.log(producao)
    const pesoLiquido = producao?.items.reduce( (prev, curr) => prev.pesoLiquido += curr.pesoLiquido )
    const pesoPerda = producao?.pesoBruto || 0 - pesoLiquido;
    console.log(pesoLiquido, pesoPerda)
    setState( (st:any) => {
      return {
        ...st,
        produto: { 
          ...st.produto,
          pesoLiquido,
          pesoPerda
        }
      }
    });
  
  }, [producao])

const handleItemProducao = (produto: any, propriedade: string, valor: string) => {
  let newProducao: IProducao | null = null;

  if (producao) {
    newProducao = { ...producao };

    const item = newProducao.items.find(i => i.codigo === produto.codigo);
    if (item) {
      item[propriedade] = valor;
      item.test = "opa";
    } else {
      newProducao.items.push({
        codigo: produto.codigo,
        nome: produto.nome,
        [propriedade]: valor,
      });
    }
  } else {
    newProducao = {
      pesoBruto: 0,
      pesoLiquido: 0,
      pesoPerda: 0,
      fatorCorrecao: 0,
      insumo: state?.produto,
      items: [
        {
          codigo: produto.codigo,
          nome: produto.nome,
          [propriedade]: valor,
        },
      ],
    };
  }

  console.log("producaoOld => ", newProducao);
  setProducao(newProducao);
};


  const onValidarQuantidade = (ev: Event, produto: any) => {
    let value = (ev.target as HTMLIonInputElement).value as string;

    if (decimalSeparator === ',') {
      value = value.replace(',', '.');
    }

    value = value.replace(/[^\d.]/g, '');
    value = value.replace('.', decimalSeparator);

    const prod = produtos.find(prod => prod.codigo === produto.codigo)
    if(prod) prod.quantidade = value;
    setProdutos([...produtos])
    handleItemProducao(produto, 'quantidade', value)

  };

  const onValidarPeso = (ev: Event, produto: any, prop: string) => {
    console.log("opa....")
    let value = (ev.target as HTMLIonInputElement).value as string;

    if (decimalSeparator === ',') {
      value = value.replace(',', '.');
    }

    value = value.replace(/[^\d.]/g, '');
    console.log("oooi" , ev, producao, value, produto)
    console.log("valor formatado ", format(value))

    // Se o ponto não está no começo e há mais de um ponto
    if (value.indexOf('.') !== 0 && value.split('.').length - 1 <= 1) {
      const [kg, g] = value.split('.');
      const formattedWeight = `${kg ? parseInt(kg, 10) : 0}.${g ? g.padEnd(3, '0') : '000'}`;

      const prod = produtos.find(prod => prod.codigo === produto.codigo)
      if(prod) prod[prop] =  formattedWeight.replace('.', decimalSeparator);
      setProdutos([...produtos])
      handleItemProducao(produto, 'peso', value)

   
    }
  };


  function format(valString: any) {
    if (!valString) {
        return '';
    }
    let val = valString.toString();
    const parts = unFormat(val).split(DECIMAL_SEPARATOR);
    return parts[0].replace(/\B(?=(?:\d{3})+(?!\d))/g, GROUP_SEPARATOR) + (!parts[1] ? '' : DECIMAL_SEPARATOR + parts[1]);
};

function unFormat(val: any) {
    if (!val) {
        return '';
    }
    val = val.replace(/^0+/, '');

    if (GROUP_SEPARATOR === ',') {
        return val.replace(/,/g, '');
    } else {
        return val.replace(/\./g, '');
    }
};


  return (
    <div className="container">
      <IonGrid>
        <IonRow>
          <IonCol size="4"><div className='mockButton'>CARNE FILE MIGNON</div> </IonCol>
          <IonCol size="2"><div className='mockButton'>KG</div> </IonCol>
          <IonCol size="6" >
            <IonInput className='mockButton white' inputmode="decimal" value={null} ></IonInput>
          </IonCol>
        </IonRow>
        <IonRow>
          <IonCol size="4"><IonInput type='text' className='mockButton' value={'LÍQUIDO'} disabled={false}></IonInput></IonCol>
          <IonCol size="2"><IonInput type='text' className='mockButton' value={'KG'} disabled={false}></IonInput></IonCol>
          <IonCol size="6"><IonInput className='mockButton white' inputmode="decimal" value={null} disabled={true}></IonInput></IonCol>
        </IonRow>
        
        <IonRow>
          <IonCol size="4"><div>PRODUTO</div></IonCol>
          <IonCol size="2"><div>UN</div></IonCol>
          <IonCol size="3"><div>PORÇÃO</div></IonCol>
          <IonCol size="3"><div>KILO</div></IonCol>
        </IonRow>
        
        {
          produtos.length > 0 && produtos.map( (produto) => (                
            <IonRow key={produto.id}>
              <IonCol size="4"><div className='mockButton'>{produto.nome}</div> </IonCol>
              <IonCol size="2"><div className='mockButton'>{produto.unidade}</div> </IonCol>
              <IonCol size="3">
                <IonInput 
                  className='mockButton white' 
                  inputmode="decimal" 
                  value={produto.quantidade}
                  pattern="^[$\-\s]*[\d\,]*?([\.]\d{0,10})?\s*$"
                  onIonChange={(ev: Event) => { return onValidarQuantidade(ev, produto) }}
                  >
                </IonInput>
              </IonCol>
              <IonCol size="3">
                <IonInput 
                  className='mockButton white' 
                  inputmode="decimal" 
                  value={produto.peso}
                  pattern="^[$\-\s]*[\d\,]*?([\.]\d{0,10})?\s*$"
                  onIonChange={(ev: Event) => { return onValidarPeso(ev, produto, 'peso') }}
                > 
                </IonInput>
              </IonCol>
            </IonRow>
          )) 
        }
        
        
        
      </IonGrid>
      {/* <strong>{name}</strong>
      <p>Explore <a target="_blank" rel="noopener noreferrer" href="https://ionicframework.com/docs/components">UI Components</a></p> */}
    </div>
  );
};

export default ProducaoForm;
