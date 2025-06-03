(async() => {
    const { PrintManager, Printer } = require("@plantae-tech/inkpresser");
const printerManager = new PrintManager();
const prints = await printerManager.getPrinters();
const printer = prints.find((p) => p.name === "ELGIN L42PRO FULL");
const printerr = new Printer(printer);
return await printerr.printRaw(Buffer.from(`^XA

^CF0,30

^FO0,10^GB480,50,30^FS                       ; Cria uma caixa preta (largura: 480, altura: 50)
^A 0,35,30
^FO20,20
^FR                                          ; Inverte o texto (branco sobre preto)
^FDFile  de  Frango  110gr^FS                ; Nome do produto

^FO0,90^GB480,1,3^FS                       ; Linha horizontal separadora

^CFA,20
^FO20,70^FDCAMARA  /  REFRIGERADOR^FS           ; Categoria

^CFA,20
^FO20,100^FDMANIPULACAO:^FS                 ; Label manipulação
^FO350,100^FD27/05/2025^FS               ; Valor manipulação (à direita)

^FO0,120^GB480,40,40^FS                    ; Caixa preta para validade
^FR
^FO20,130^A0N,25,25^FDVALIDADE:^FS                           ; Label validade

^FR
^FO290,130^A0N,25,25^FDSEX  30/05/2025^FS                         ; Data de validade (à direita)

^FO0,170^GB480,1,3^FS                      ; Linha horizontal separadora

                                      
^FO20,190^A0N,25,25^FDSIF: ^FS          ; Código SIF

^CFA,18
^FO20,220
^A0N,35,35
^FD
RESP: Super  Usuario^FS ; OPERADOR

^FO20,260^A0N,20,20^FDCENTRE - JARDIM  DAS  ROSAS  ZONA  LESTE^FS
^FO20,290^A0N,20,20^FDCNPJ: 18885949000181 CEP: 03909140^FS
^FO20,320^A0N,20,20^FDEndereco: RUA  COURACA^FS
^FO20,350^A0N,20,20^FDSao  Paulo/SP^FS

^FO20,410^A0N,40,40^FD#13103^FS  ; Código do produto em destaque



^XZ

`), "teste");

})()