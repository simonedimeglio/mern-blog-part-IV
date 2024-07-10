# Cosa faremo

- Hashing delle password
- Autenticazione e autorizzazione basate su token con JWT

## Perchè

- Una delle cose più basilari che ogni applicazione dovrebbe fare è archiviare in modo sicuro le password degli utenti
- L'autenticazione basata su token è uno dei modelli di autenticazione più adottati per tutte le applicazioni

# BCrypt - Hash

```javascript
// Esegue 10 round di hashing sulla password
const user = new User({
  ...req.body,
  password: await bcrypt.hash(req.body.password, 10),
});

await user.save();
```

```javascript
let foundUser = await User.findOne({
  email: req.body.email,
});

// Controlla che la password inviata dal frontend sia la stessa di quella a database
if (foundUser) {
  const matching = await bcrypt.compare(req.body.password, foundUser.password);
}
```

# Autenticazione basata su token

Il token JWT (Json Web Token) è una lunga stringa contenente dei dati codificati (attenzione, NON criptati).

Sono quindi facilmente "ricostruibili" se si conosce la chiave di codifica, per esempio tramite jwt.io.

```
HEADER: ALGORITHM & TOKEN TYPE
{
    "alg": "HS256",
    "typ": "JWT"
}

PAYLOAD: DATA
{
    "sub": "1234567890",
    "name": "John Doe",
    "iat": 1516239022
}

VERIFY SIGNATURE
HMACSHA256(
    base64UrlEncode(header) + "." + base64UrlEncode(payload),
    your-256-bit-secret
) secret base64 encoded
```

```
JWT = HEADER + "." + PAYLOAD + "." + VERIFY SIGNATURE
```

## FLOW di autenticazione

1. FRONTEND: richiesta HTTP/login (Axios, fetch, etc..)
2. BACKEND: verifica delle credenziali (bcrypt.compare())
3. BACKEND: rilascio del token JWT
4. FRONTEND: memorizza il token JWT nello storage locale (localStorage)
5. FRONTEND: richiesta HTTP (Axios, fetch, etc..) con il token JWT nell'header Authorization
6. BACKEND: verifica il token JWT (scedenza e validità)
7. BACKEND: decodifica del token (inserisco nell'oggetto "req" il mio utente)
8. BACKEND: esecuzione della richiesta

### Esempio di middleware per la verifica del token

```javascript
export const authMidd = async (req, res, next) => {
  try {
    const decoded = await verifyJWT(
      req.headers["authorization"].replace("Bearer ", "")
    );
    if (decoded.exp) {
      delete decoded.iat;
      delete decoded.exp;
      const me = await User.findOne({
        ...decoded,
      });
      if (me) {
        req.user = me;
        next();
      } else res.status(401).send("User not found");
    } else res.status(401).send("Please login again");
  } catch (error) {
    next(error);
  }
};
```
```javascript
export const verifyJWT = (token) => {
    return new Promise((res, rej) => 
        jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
            if (err) res(err)
            else res(decoded)
        })
    )
}
```

## Generare un token JWT 

```javascript
export const generateJWT = (payload) => {
    return new Promise((rec, rej) => 
        jwt.sign(
            payload,
            process.env.JWT_SECRET,
            { expiresIn: "1 day"},
            (err, token) => {
                if (err) rej(err)
                else res(token)
            }
        )
    )
}
```