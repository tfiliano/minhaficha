import { IonButton, IonCol, IonGrid, IonInput, IonRow } from '@ionic/react';
import React, { useEffect, useState } from 'react';

import './ProducaoForm.css';
import { supabase } from '../supabaseClient';


interface ContainerProps {
  name?: string;
  produtos: any[];
  onSetProduto: Function;
  state: any;
  setState: Function;
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

const ProducaoForm: React.FC<ContainerProps> = ({ name, produtos, onSetProduto, state, setState }) => {
  const [data, setData] = useState<any[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<any | null>(null);
  const [producao, setProducao] = useState<IProducao|null>(null);
  const [decimalSeparator, setDecimalSeparator] = useState('.');

  useEffect(() => {
    const testNumber = 1.1;
    const formattedNumber = testNumber.toLocaleString();
    if (formattedNumber.indexOf(',') !== -1) {
      setDecimalSeparator(',');
    } else {
      setDecimalSeparator('.');
    }

    const fetchData = async () => {
      try {
        setLoading(true);
        // Suponha que estamos buscando dados de uma API
        const { data } = await supabase.from("produtos").select();
        console.log(data)
        setData(data);
      } catch (error) {
        setError(error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);  
  
  useEffect( () => {
    console.log(producao)
    const pesoLiquido = producao?.items.reduce( (prev, curr) => prev.pesoLiquido += curr.pesoLiquido )
    const pesoPerda = producao?.pesoBruto || 0 - pesoLiquido;
    console.log(pesoLiquido, pesoPerda)
    setState( st => {
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
    setProducao( oldState => {
      if (!oldState) {
        oldState = {
          pesoBruto: 0,
          pesoLiquido: 0,
          pesoPerda: 0,
          fatorCorrecao: 0,
          insumo: state?.produto,
          items: []
        }
      }

      const item = oldState?.items.find( i => i.codigo === produto.codigo)
      if (item) {
        item[propriedade] = valor
        item.test = "opa"
      } else {
        oldState.items.push({
          codigo: produto.codigo,
          nome: produto.nome,
          [propriedade]: valor,
        })
      }

      console.log("oldState => ", oldState)
      
      return oldState
    })
  }


  const onValidarQuantidade = (ev: Event, produto: any) => {
    let value = (ev.target as HTMLIonInputElement).value as string;

    if (decimalSeparator === ',') {
      value = value.replace(',', '.');
    }

    value = value.replace(/[^\d.]/g, '');
    value = value.replace('.', decimalSeparator);

    onSetProduto( (list: any[]) => {
      return list.map( (prod: any) => {
        if (prod.codigo === produto.codigo) {
          prod.quantidade = value
        }

        handleItemProducao(produto, 'quantidade', value)

        return prod
      })

    })

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

      onSetProduto( (list: any[]) => {
        return list.map( (prod: any) => {
          if (prod.codigo === produto.codigo) {
            prod[prop] = formattedWeight.replace('.', decimalSeparator);
          }
  
          handleItemProducao(produto, 'peso', value)

          return prod
        })
  
      })
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
          produtos && produtos.map( (produto) => (                
            <IonRow key={produto.id}>
              <IonCol size="4"><div className='mockButton'>{produto.nome}</div> </IonCol>
              <IonCol size="2"><div className='mockButton'>{produto.unidade}</div> </IonCol>
              <IonCol size="3">
                <IonInput 
                  className='mockButton white' 
                  inputmode="decimal" 
                  value={produto.quantidade}
                  pattern="^[$\-\s]*[\d\,]*?([\.]\d{0,10})?\s*$"
                  onIonChange={(ev: Event) => { return onValidarQuantidade(ev, produto, 'quantidade') }}
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
