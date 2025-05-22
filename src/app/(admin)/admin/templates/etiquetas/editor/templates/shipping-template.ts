import { FieldPosition } from "../../types";

// Template para etiquetas de envio
export function createShippingTemplate(): FieldPosition[] {
    return [
      // Título
      { 
        name: "titulo", 
        x: 200, y: 20, 
        fontSize: 20, fontStyle: 'bold', 
        reversed: true, alignment: 'center',
        fontFamily: 'A', fieldType: 'static',
        staticValue: 'ETIQUETA DE ENVIO',
        lineNumber: 1, linePosition: 1,
        enabled: true
      },
      // Remetente
      {
        name: "remetente_label",
        x: 10, y: 50,
        fontSize: 10, fontStyle: 'bold',
        reversed: false, alignment: 'left',
        fontFamily: 'A', fieldType: 'static',
        staticValue: 'DE:',
        lineNumber: 2, linePosition: 1,
        enabled: true
      },
      {
        name: "remetente_nome",
        x: 50, y: 50,
        fontSize: 10, fontStyle: 'normal',
        reversed: false, alignment: 'left',
        fontFamily: 'A', fieldType: 'dynamic',
        lineNumber: 2, linePosition: 2,
        enabled: true,
        defaultValue: 'EMPRESA XYZ LTDA'
      },
      {
        name: "remetente_endereco",
        x: 50, y: 65,
        fontSize: 8, fontStyle: 'normal',
        reversed: false, alignment: 'left',
        fontFamily: 'A', fieldType: 'dynamic',
        lineNumber: 3, linePosition: 1,
        enabled: true,
        defaultValue: 'R. EXEMPLO, 123 - CENTRO'
      },
      {
        name: "remetente_cidade",
        x: 50, y: 80,
        fontSize: 8, fontStyle: 'normal',
        reversed: false, alignment: 'left',
        fontFamily: 'A', fieldType: 'dynamic',
        lineNumber: 4, linePosition: 1,
        enabled: true,
        defaultValue: 'SÃO PAULO - SP, 01234-567'
      },
      // Linha separadora
      {
        name: "separador",
        x: 10, y: 95,
        fontSize: 0, fontStyle: 'normal',
        reversed: false, alignment: 'left',
        fontFamily: 'A', fieldType: 'line',
        lineWidth: 380, lineHeight: 1,
        lineNumber: 5, linePosition: 1,
        enabled: true
      },
      // Destinatário
      {
        name: "destinatario_label",
        x: 10, y: 105,
        fontSize: 10, fontStyle: 'bold',
        reversed: false, alignment: 'left',
        fontFamily: 'A', fieldType: 'static',
        staticValue: 'PARA:',
        lineNumber: 6, linePosition: 1,
        enabled: true
      },
      {
        name: "destinatario_nome",
        x: 50, y: 105,
        fontSize: 12, fontStyle: 'bold',
        reversed: false, alignment: 'left',
        fontFamily: 'A', fieldType: 'dynamic',
        lineNumber: 6, linePosition: 2,
        enabled: true,
        defaultValue: 'JOÃO DA SILVA'
      },
      {
        name: "destinatario_endereco",
        x: 50, y: 125,
        fontSize: 10, fontStyle: 'normal',
        reversed: false, alignment: 'left',
        fontFamily: 'A', fieldType: 'dynamic',
        lineNumber: 7, linePosition: 1,
        enabled: true,
        defaultValue: 'AV. CLIENTE, 456 - BAIRRO'
      },
      {
        name: "destinatario_cidade",
        x: 50, y: 145,
        fontSize: 10, fontStyle: 'normal',
        reversed: false, alignment: 'left',
        fontFamily: 'A', fieldType: 'dynamic',
        lineNumber: 8, linePosition: 1,
        enabled: true,
        defaultValue: 'RIO DE JANEIRO - RJ, 20000-000'
      },
      // Código de rastreio
      {
        name: "rastreio_label",
        x: 10, y: 175,
        fontSize: 10, fontStyle: 'bold',
        reversed: false, alignment: 'left',
        fontFamily: 'A', fieldType: 'static',
        staticValue: 'RASTREIO:',
        lineNumber: 9, linePosition: 1,
        enabled: true
      },
      {
        name: "rastreio",
        x: 10, y: 195,
        fontSize: 0, fontStyle: 'normal',
        reversed: false, alignment: 'center',
        fontFamily: 'A', fieldType: 'barcode',
        barcodeType: 'code128',
        barcodeHeight: 50,
        lineNumber: 10, linePosition: 1,
        enabled: true,
        defaultValue: 'BR1234567890'
      }
    ];
  }