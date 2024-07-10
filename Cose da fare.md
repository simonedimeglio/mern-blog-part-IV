# Cose da fare

- Aggiungi la Token Based Authentication al tuo progetto 
- Tutti gli endpoint (tranne /login) devono essere accessibili solo tramite token 
- Collega il tuo API al frontend:
    - Crea le pagine di *registrazione* e *login*
    - Dopo un login effettuato con successo, memorizza il token di accesso nel localStorage e redireziona l'utente alla homepage
    - Usa il token ovunque sia necessario

## Implementare le seguenti rotte

- **POST /login** => restituisce token di accesso 
- **GET /me** => restituisce l'utente collegato al token di accesso
- *(MODIFICA)* **POST /authors** => deve creare un nuovo utente con password criptata


