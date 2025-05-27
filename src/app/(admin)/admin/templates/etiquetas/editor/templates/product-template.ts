import { FieldPosition } from "../../types";

// Template final para etiquetas de produto - alinhado com a imagem 1
export function createProductTemplate(): FieldPosition[] {
  return [
    // Nome do produto em grande e negrito no topo com estilo reverso
    { 
      name: "produto", 
      x: 10, y: 25,  // Posição Y mantida, X ajustado para margem
      fontSize: 18, fontStyle: 'bold', 
      reversed: true, alignment: 'center',
      fontFamily: 'A', fieldType: 'dynamic',
      lineNumber: 1, linePosition: 1,
      enabled: true, uppercase: true,
      defaultValue: 'AVES F FRANGO 220GR',
      fullWidth: true  // Ativar largura total
    },
    // Tipo de armazenamento - repositcionado conforme imagem 1
    { 
      name: "armazenamento", 
      x: 10, y: 55, 
      fontSize: 12, fontStyle: 'normal', 
      reversed: false, alignment: 'left',
      fontFamily: 'A', fieldType: 'dynamic',
      lineNumber: 2, linePosition: 1,
      enabled: true, uppercase: false,
      defaultValue: 'GELADEIRA/Resfriado'
    },
    // Linha horizontal (ajustada para acompanhar o layout da imagem 1)
    {
      name: "separador1",
      x: 10, y: 75,
      fontSize: 0, fontStyle: 'normal',
      reversed: false, alignment: 'left',
      fontFamily: 'A', fieldType: 'line',
      lineNumber: 3, linePosition: 1,
      lineWidth: 380, lineHeight: 1,
      enabled: true
    },
    // Data de manipulação com rótulo
    {
      name: "manipulacao_label",
      x: 10, y: 90,
      fontSize: 10, fontStyle: 'normal',
      reversed: false, alignment: 'left',
      fontFamily: 'A', fieldType: 'static',
      lineNumber: 4, linePosition: 1,
      staticValue: 'MANIPULAÇÃO:',
      enabled: true
    },
    {
      name: "manipulacao",
      x: 120, y: 90,
      fontSize: 10, fontStyle: 'normal',
      reversed: false, alignment: 'left',
      fontFamily: 'A', fieldType: 'dynamic',
      lineNumber: 4, linePosition: 2,
      enabled: true,
      dateFormat: 'DD/MM/YYYY',
      defaultValue: '23/08/2024'
    },
    // Data de validade com rótulo - ajustada conforme imagem 1
    {
      name: "validade_label",
      x: 10, y: 115,
      fontSize: 10, fontStyle: 'normal',
      reversed: false, alignment: 'left',
      fontFamily: 'A', fieldType: 'static',
      lineNumber: 5, linePosition: 1,
      staticValue: 'VALIDADE:',
      enabled: true
    },
    {
      name: "validade",
      x: 120, y: 115,  // Alinhado com valor da manipulação
      fontSize: 10, fontStyle: 'bold',
      reversed: true, alignment: 'left',
      fontFamily: 'A', fieldType: 'dynamic',
      lineNumber: 5, linePosition: 2,
      enabled: true,
      defaultValue: '25/08/2024',
      prefix: 'DOM '
    },
    // Linha horizontal
    {
      name: "separador2",
      x: 10, y: 135,
      fontSize: 0, fontStyle: 'normal',
      reversed: false, alignment: 'left',
      fontFamily: 'A', fieldType: 'line',
      lineNumber: 6, linePosition: 1,
      lineWidth: 380, lineHeight: 1,
      enabled: true
    },
    // Responsável
    {
      name: "responsavel_label",
      x: 10, y: 150,
      fontSize: 10, fontStyle: 'normal',
      reversed: false, alignment: 'left',
      fontFamily: 'A', fieldType: 'static',
      lineNumber: 7, linePosition: 1,
      staticValue: 'RESP:',
      enabled: true
    },
    {
      name: "responsavel",
      x: 60, y: 150,
      fontSize: 10, fontStyle: 'bold',
      reversed: false, alignment: 'left',
      fontFamily: 'A', fieldType: 'dynamic',
      lineNumber: 7, linePosition: 2,
      enabled: true, uppercase: true,
      defaultValue: 'ADILSON'
    },
    // Endereço
    {
      name: "endereco",
      x: 10, y: 170,
      fontSize: 8, fontStyle: 'normal',
      reversed: false, alignment: 'left',
      fontFamily: 'A', fieldType: 'dynamic',
      lineNumber: 8, linePosition: 1,
      enabled: true,
      defaultValue: 'R. GULE - VILA NOVA CONCEIÇÃO'
    },
    // CNPJ e CEP
    {
      name: "cnpj_cep",
      x: 10, y: 185,
      fontSize: 8, fontStyle: 'normal',
      reversed: false, alignment: 'left',
      fontFamily: 'A', fieldType: 'dynamic',
      lineNumber: 9, linePosition: 1,
      enabled: true,
      defaultValue: 'CNPJ:14.092.767/0001-33 CEP:04512-001'
    },
    // Cidade
    {
      name: "cidade",
      x: 10, y: 200,
      fontSize: 8, fontStyle: 'normal',
      reversed: false, alignment: 'left',
      fontFamily: 'A', fieldType: 'dynamic',
      lineNumber: 10, linePosition: 1,
      enabled: true,
      defaultValue: 'São Paulo/SP'
    },
    // QR Code - posicionado no lado direito como na imagem 1
    {
      name: "codigo",
      x: 310, y: 175,
      fontSize: 0, fontStyle: 'normal',
      reversed: false, alignment: 'center',
      fontFamily: 'A', fieldType: 'qrcode',
      lineNumber: 11, linePosition: 1,
      enabled: true,
      defaultValue: '12345ABCDE'
    }
  ];
}