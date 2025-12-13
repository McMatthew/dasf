### Obiettivo: costruire un interprete per i file DASF
Dasf è un estensione file inventata che contiene la documentazione per delle richieste UDP.
Il tuo obiettivo è quello di creare un parser typescript che riesca a leggere il file DASF e a convertirlo in una struttura HTML che renda semplice capire cosa documenta il file.
Considera che il formato della struttura dati DASF è molto simile a JSON tranne che la prima riga del documento deve contenere la parola DASF- e un numero che identifica la versione (ad oggi esiste sola la 01)
dalla riga successiva inizia la vera documentazione partendo con il "path" della richiesta UDP come properties. NON c'è la parentesi graffa che contiene tutto l'oggetto, la documentazione parte direttamente con i path delle varie richieste.

#### Qui di seguito la spiegazione delle properties:
- description: una stringa
- takeoffPort/landingPort: un intero
- parameters: un oggetto che definisce i parametri query del path (nullable)
    - qualunque stinga come key:
        - type: il tipo (string number boolean)
        - description: una stringa
- sentPayload/receivedPayload: il payload inviato e/o ricevuto (entrambi sono nullable)
    - type: tipo del payload (json, binary o text)
    - endianness: solo se type binary (big-endian, little-endian, middle-endian)
    - body (se type: text): non serve, nullable
    - body (se type: binary): array, gli items sono oggetti così definiti:
        - fieldName: stringa
        - dataType: uint8, int16, float32, string
        - length (se string): lunghezza della string, nullable
        - encoding (se string): stringa, nullable
    - body (se type: json):
        - qualunque stringa come key:
            - type: string, number, boolean, array o json
            - items (se type: array): oggetto per definire gli items
                - type: string, number, boolean, array o json (se json o array la struttura si ripete uguale)
            - properties (se type: json): oggetto per definire le properties (stessa struttura di body quando sentPayload.type = json)
    - example: string con l'esempio, nullable


All'interno del file doc.dasf hai un esempio di documentazione, ricorda che nell'esempio è documentato solo una endpoint ma potrebbero essercene molti

## Risultato sperato:
Crea una classe DASFParser che restituisca dei componenti React (molto semplici per ora) che renderizzino a schermo la documentazione
