import { FieldPosition } from "../../types";

// Template para etiquetas de inventário
export function createInventoryTemplate(): FieldPosition[] {
    return [
      // Cabeçalho
      { 
        name: "cabecalho", 
        x: 200, y: 20, 
        fontSize: 16, fontStyle: 'bold', 
        reversed: false, alignment: 'center',
        fontFamily: 'A', fieldType: 'static',
        staticValue: 'CONTROLE DE ESTOQUE',
        lineNumber: 1, linePosition: 1,
        enabled: true
      },
      // Informações do item
      {
        name: "item_label",
        x: 10, y: 40,
        fontSize: 10, fontStyle: 'bold',
        reversed: false, alignment: 'left',
        fontFamily: 'A', fieldType: 'static',
        staticValue: 'ITEM:',
        lineNumber: 2, linePosition: 1,
        enabled: true
      },
      {
        name: "item_nome",
        x: 50, y: 40,
        fontSize: 12, fontStyle: 'normal',
        reversed: false, alignment: 'left',
        fontFamily: 'A', fieldType: 'dynamic',
        lineNumber: 2, linePosition: 2,
        enabled: true,
        defaultValue: 'PRODUTO XYZ'
      },
      {
        name: "codigo_label",
        x: 10, y: 60,
        fontSize: 10, fontStyle: 'bold',
        reversed: false, alignment: 'left',
        fontFamily: 'A', fieldType: 'static',
        staticValue: 'CÓDIGO:',
        lineNumber: 3, linePosition: 1,
        enabled: true
      },
      {
        name: "codigo_item",
        x: 70, y: 60,
        fontSize: 12, fontStyle: 'normal',
        reversed: false, alignment: 'left',
        fontFamily: 'A', fieldType: 'dynamic',
        lineNumber: 3, linePosition: 2,
        enabled: true,
        defaultValue: 'ABC-12345'
      },
      {
        name: "localizacao_label",
        x: 10, y: 80,
        fontSize: 10, fontStyle: 'bold',
        reversed: false, alignment: 'left',
        fontFamily: 'A', fieldType: 'static',
        staticValue: 'LOCAL:',
        lineNumber: 4, linePosition: 1,
        enabled: true
      },
      {
        name: "localizacao",
        x: 70, y: 80,
        fontSize: 12, fontStyle: 'normal',
        reversed: false, alignment: 'left',
        fontFamily: 'A', fieldType: 'dynamic',
        lineNumber: 4, linePosition: 2,
        enabled: true,
        defaultValue: 'ESTANTE B / PRATELEIRA 3'
      },
      {
        name: "data_cadastro_label",
        x: 10, y: 100,
        fontSize: 10, fontStyle: 'bold',
        reversed: false, alignment: 'left',
        fontFamily: 'A', fieldType: 'static',
        staticValue: 'CADASTRO:',
        lineNumber: 5, linePosition: 1,
        enabled: true
      },
      {
        name: "data_cadastro",
        x: 80, y: 100,
        fontSize: 10, fontStyle: 'normal',
        reversed: false, alignment: 'left',
        fontFamily: 'A', fieldType: 'dynamic',
        lineNumber: 5, linePosition: 2,
        enabled: true,
        defaultValue: '15/01/2024'
      },
      // QR Code para inventário
      {
        name: "qr_inventario",
        x: 300, y: 40,
        fontSize: 0, fontStyle: 'normal',
        reversed: false, alignment: 'center',
        fontFamily: 'A', fieldType: 'qrcode',
        lineNumber: 6, linePosition: 1,
        enabled: true,
        defaultValue: 'INV12345'
      },
    ];
  }