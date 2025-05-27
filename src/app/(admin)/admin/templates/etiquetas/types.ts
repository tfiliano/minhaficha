// Atualizar a interface FieldPosition para incluir a propriedade fullWidth
// Adicionar em types.ts ou em actions.ts onde a interface é definida

export interface FieldPosition {
  name: string;
  x: number;
  y: number;
  fontSize: number;
  fontStyle: 'normal' | 'bold' | 'italic';
  reversed: boolean;
  alignment: 'left' | 'center' | 'right';
  fontFamily: string;
  fieldType: 'dynamic' | 'static' | 'qrcode' | 'barcode' | 'line' | 'box';
  staticValue?: string;
  lineNumber: number;
  linePosition: number;
  defaultValue?: string;
  barcodeType?: 'code39' | 'code128' | 'ean13';
  barcodeHeight?: number;
  lineWidth?: number;
  lineHeight?: number;
  boxWidth?: number;
  boxHeight?: number;
  boxBorderWidth?: number;
  enabled: boolean;
  uppercase?: boolean;
  prefix?: string;
  suffix?: string;
  dateFormat?: string;
  fullWidth?: boolean;  // Nova propriedade para indicar largura total
}

  export interface Template {
    id?: string;
    nome: string;
    zpl: string;
    campos: FieldPosition[];
    width: number;
    height: number;
    created_at?: string;
  }