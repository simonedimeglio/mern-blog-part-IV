# Embedding vs Referencing

**Embedding** e **Referencing** sono due modi di modellare i dati in DB NoSQL proprio come MongoDB.

## Embedding

Significa mettere tutti i dati insieme in un unico documento.

In un caso come il nostro, ovvero di un blog, un post potrebbe avere più commenti.

**Con l’embedding, il documento del post includerà tutti i commenti**.

```json
{
  "title": "Banana Blog",
  "content": "Contenuto del primo post",
  "comments": [
    {
      "name": "Utente 1",
      "content": "Wooooo, bel post!"
    },
    {
      "name": "Utente2",
      "content": "Naaah"
    }
  ]
}
```

### PRO EMBEDDING
1.	Puoi ottenere tutti i dati con una singola query.
2.	Niente join: Non devi fare operazioni complicate per collegare i dati.
3.	Tutti i dati sono in un unico posto, quindi è facile aggiornare tutto insieme.

### CONTRO EMBEDDING
1.  Se hai molti commenti, il documento del post può diventare molto grande.
2.  I documenti in MongoDB non possono essere più grandi di 16 MB.

## Referencing
Significa separare i dati correlati in documenti diversi e collegarli tramite ID.

Vediamo un esempio che fa sempre riferimento al nostro blog, ma questa volta i commenti sono in una raccolta separata e vengono collegati al post tramite un ID.

Documento del post:
```json
{
  "title": "Il mio primo post",
  "content": "Questo è il contenuto del mio primo post",
  "commentIds": [1, 2]
}
```

Documento del commento con id 1:
```json
{
  "id": 1,
  "name": "Utente 1",
  "content": "Wooooo, bel post!"
}
```

Documento del commento con id 2:
```json
{
  "id": 1,
  "name": "Utente2",
  "content": "Naaah"
}
```

### PRO REFERENCING
1.	Ogni documento è più piccolo e gestibile.
2.	Puoi avere quanti commenti vuoi senza preoccuparti del limite di dimensione di 16MB.

### CONTRO REFERENCING
1.	Per ottenere tutti i dati correlati, devi fare più query o unire i dati, il che può essere lento.
2.	Devi gestire le relazioni tra i documenti, il che può essere più complicato.





## Quando usare embedding

Usa l’embedding quando hai dati che vengono sempre letti insieme e che non crescono molto.

## Quando usare referencing

Usa il referencing quando i dati crescono molto o sono usati indipendentemente.

## Riassumiamo tutto in pochissime parole

**Embedding**: Metti tutto insieme. Ottimo per dati che non crescono molto.

**Referencing**: Separi i dati. Ottimo per dati che crescono molto o sono usati anche in "solitaria"
