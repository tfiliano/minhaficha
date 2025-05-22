![App](print.png)


print example: 

```
^XA
^CF0,30
^FO50,30^GB700,50,30^FS            ; Cria uma caixa preta (largura: 700, altura: 50)
^A 0,35,30
^FO60,40^FR^FDAVES F FRANGO 220GR^FS ; Texto invertido (branco sobre preto)

^FO50,70^GB700,1,3^FS             ; Linha horizontal separadora

^CFA,20
^FO50,90^FDGELADEIRA/Resfriado^FS
^CFA,20
^FO50,130^FDMANIPULACAO:^FS
^FO250,130^FD23/08/2024^FS

^FO50,170^GB700,50,3^FS            ; Cria uma caixa preta (largura: 700, altura: 50)
^FO50,170^FR^FDVALIDADE: 25/08/2024^FS ; Texto invertido (branco sobre preto)

^FO50,230^GB700,1,3^FS             ; Linha horizontal separadora

^CFA,18
^FO50,250^FDRESP: ADILSON^FS
^FO50,290^FDULA GULA - VILA NOVA CONCEICAO^FS
^FO50,320^FDNP: 114.692.767/0001-33 CEP: 04512-001^FS
^FO50,350^FDEndereco: Rua Joaquim Jacome^FS
^FO50,380^FDSao Paulo/SP^FS

^FO50,410^GB700,1,3^FS             ; Linha horizontal separadora

^FO50,430^B3N,N,50,Y,N
^FD123456789012^FS
^XZ
```